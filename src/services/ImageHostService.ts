
/**
 * Service to handle image hosting operations.
 * Ported from `get_full_size_picture_urls`, `ptp_send_images` etc.
 */
import $ from 'jquery';
import { GMAdapter } from './GMAdapter';
import { StorageService } from './StorageService';
import { TorrentMeta } from '../types/TorrentMeta';
export class ImageHostService {
    private static IMAGE_QUEUE_KEY = 'HDB_images';

    private static decodeWsrvUrl(url: string): string {
        try {
            const u = new URL(url);
            if (u.hostname === 'wsrv.nl') {
                const raw = u.searchParams.get('url') || '';
                if (raw) return decodeURIComponent(raw);
            }
        } catch {}
        return url;
    }

    private static getPageCoverCandidates(): string[] {
        const out: string[] = [];
        try {
            const og = (document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content || '';
            if (og) out.push(og);
        } catch {}
        const selectors = [
            '.sidebar-cover-image',
            '.torrent__poster img',
            '.movie__poster img',
            '.poster img',
            '#poster img',
            '#cover_div_0 img',
            '#covers img',
            '.thumbnail-container img'
        ];
        selectors.forEach((sel) => {
            document.querySelectorAll(sel).forEach((node) => {
                const img = node as HTMLImageElement;
                const src = img.getAttribute('data-src') || img.getAttribute('src') || img.src || '';
                if (src) out.push(src);
                const onclick = img.getAttribute('onclick') || '';
                const m = onclick.match(/https?:\/\/[^\s'"]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s'"]*)?/i);
                if (m?.[0]) out.push(m[0]);
            });
        });
        return out;
    }

    private static hasImageExtension(url: string): boolean {
        return /\.(png|jpe?g|gif|webp)(\?|$)/i.test(url);
    }

    private static normalizeCoverUrl(url: string): string {
        return this.getFullSizeUrl(this.decodeWsrvUrl(String(url || '').trim()));
    }

    private static isHostikStableCoverUrl(url: string): boolean {
        try {
            const host = new URL(url).hostname.toLowerCase();
            return /(?:pixhost\.to|ptpimg\.me|imgbox\.com|hdbits\.org|hdbimg\.com)$/.test(host);
        } catch {
            return false;
        }
    }

    private static async rehostCoverToPixhost(url: string): Promise<string> {
        const normalized = this.normalizeCoverUrl(url);
        if (!normalized) return '';
        if (this.isHostikStableCoverUrl(normalized)) return normalized;
        try {
            const tags = await this.uploadToPixhost([normalized]);
            const pixUrl = this.extractImageUrlsFromBBCode(tags?.[0] || '')[0] || '';
            const full = this.normalizeCoverUrl(pixUrl);
            return full || normalized;
        } catch {
            return normalized;
        }
    }

    private static pickImageFromJson(obj: any): string {
        if (!obj) return '';
        if (typeof obj === 'string') return obj;
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const hit = this.pickImageFromJson(item);
                if (hit) return hit;
            }
            return '';
        }
        if (typeof obj === 'object') {
            const imageField = (obj as any).image;
            if (typeof imageField === 'string' && imageField) return imageField;
            if (imageField) {
                const nested = this.pickImageFromJson(imageField);
                if (nested) return nested;
            }
            if ((obj as any).url && typeof (obj as any).url === 'string' && /(jpg|jpeg|png|webp)/i.test((obj as any).url)) {
                return (obj as any).url;
            }
            const graph = (obj as any)['@graph'];
            if (graph) {
                const nested = this.pickImageFromJson(graph);
                if (nested) return nested;
            }
        }
        return '';
    }

    private static async fetchImdbPosterUrl(imdbUrl: string): Promise<string> {
        const u = String(imdbUrl || '').trim();
        if (!u) return '';
        try {
            const res = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url: u,
                headers: { 'accept-language': 'en-US,en;q=0.9' }
            });
            const html = res?.responseText || '';
            if (!html) return '';
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
            for (const s of scripts) {
                const text = (s.textContent || '').trim();
                if (!text) continue;
                try {
                    const parsed = JSON.parse(text);
                    const img = this.pickImageFromJson(parsed);
                    if (img) return this.normalizeCoverUrl(img);
                } catch {}
            }
            const og = (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content || '';
            if (og) return this.normalizeCoverUrl(og);
            const quick = html.match(/"image"\s*:\s*"([^"]+)"/i)?.[1] || '';
            return quick ? this.normalizeCoverUrl(quick.replace(/\\\//g, '/')) : '';
        } catch {
            return '';
        }
    }

    private static async fetchDoubanPosterUrl(doubanUrl: string): Promise<string> {
        const u = String(doubanUrl || '').trim();
        if (!u) return '';
        try {
            const res = await GMAdapter.xmlHttpRequest({ method: 'GET', url: u });
            const html = res?.responseText || '';
            if (!html) return '';
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const img = (doc.querySelector('#mainpic img') as HTMLImageElement | null)?.src || '';
            if (img) return this.normalizeCoverUrl(img);
            const og = (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content || '';
            return og ? this.normalizeCoverUrl(og) : '';
        } catch {
            return '';
        }
    }

    private static async resolveHostikCoverUrl(meta?: Partial<TorrentMeta>, existing: string[] = []): Promise<string> {
        const current = Array.from(new Set((existing || []).map((u) => this.getFullSizeUrl(this.decodeWsrvUrl(String(u || '').trim()))).filter(Boolean)));
        const currentSet = new Set(current);
        const pageCandidates = Array.from(
            new Set(
                this.getPageCoverCandidates()
                    .map((u) => this.getFullSizeUrl(this.decodeWsrvUrl(String(u || '').trim())))
                .filter(Boolean)
            )
        );
        const metaCandidates = Array.from(
            new Set(
                [
                    ...(meta?.description ? this.extractImageUrlsFromBBCode(meta.description) : []),
                    ...(Array.isArray(meta?.images) ? meta!.images : [])
                ]
                    .map((u) => this.getFullSizeUrl(this.decodeWsrvUrl(String(u || '').trim())))
                    .filter(Boolean)
            )
        );
        const candidates = [...pageCandidates, ...metaCandidates];

        for (const candidate of candidates) {
            if (!candidate || currentSet.has(candidate)) continue;
            if (this.hasImageExtension(candidate)) {
                return await this.rehostCoverToPixhost(candidate);
            }
        }

        // Fallback to IMDb/Douban poster from meta links when page candidates are missing.
        const imdbUrl = String(meta?.imdbUrl || '').trim() || (meta?.imdbId ? `https://www.imdb.com/title/${meta.imdbId}/` : '');
        const imdbPoster = await this.fetchImdbPosterUrl(imdbUrl);
        if (imdbPoster && !currentSet.has(imdbPoster)) {
            return await this.rehostCoverToPixhost(imdbPoster);
        }
        const doubanPoster = await this.fetchDoubanPosterUrl(String(meta?.doubanUrl || ''));
        if (doubanPoster && !currentSet.has(doubanPoster)) {
            return await this.rehostCoverToPixhost(doubanPoster);
        }

        // Some pages expose poster URLs that are not direct image links.
        // Rehost one candidate to Pixhost to guarantee Hostik pull can fetch it.
        for (const candidate of candidates) {
            if (!candidate || currentSet.has(candidate)) continue;
            try {
                const full = await this.rehostCoverToPixhost(candidate);
                if (full) return full;
            } catch {}
        }
        return '';
    }

    static async prependCoverForHostik(urls: string[], meta?: Partial<TorrentMeta>): Promise<string[]> {
        const current = Array.from(new Set((urls || []).map((u) => this.getFullSizeUrl(this.decodeWsrvUrl(String(u || '').trim()))).filter(Boolean)));
        const cover = await this.resolveHostikCoverUrl(meta, current);
        if (!cover) return current;
        if (current.includes(cover)) return current;
        return [cover, ...current];
    }

    /**
     * Converts thumbnail URLs to full size URLs for known hosts.
     * Matches logic from `get_full_size_picture_urls`
     */
    static getFullSizeUrl(url: string): string {
        let newUrl = url;

        if (url.match(/imgbox/)) {
            // Legacy: thumbs2 -> images2, *_t.ext -> *_o.ext (jpg/png/gif)
            newUrl = url.replace('thumbs2', 'images2');
            newUrl = newUrl.replace(/_t\.(png|jpg|jpeg|gif)(\?|$)/i, (_m, ext, tail) => `_o.${ext}${tail || ''}`);
            newUrl = newUrl.replace('t.png', 'o.png'); // extra fallback for older patterns
        } else if (url.match(/pixhost/)) {
            newUrl = url.replace('//t', '//img').replace('thumbs', 'images');
        } else if (url.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
            newUrl = url.replace(/th.png/, 'png').replace(/md.png/, 'png');
        } else if (url.match(/beyondhd.co\/(images|cache)/)) {
            newUrl = url.replace(/th.png/, 'png').replace(/md.png/, 'png').replace('/t/', '/i/');
        } else if (url.match(/tu.totheglory.im/)) {
            newUrl = url.replace(/_thumb.png/, '.png');
        }

        return newUrl;
    }

    static extractImageUrlsFromBBCode(description: string): string[] {
        const urls: string[] = [];
        const matches = description.match(/\[img\](.*?)\[\/img\]/gi);
        if (!matches) return urls;
        matches.forEach((item) => {
            const m = item.match(/\[img\](.*?)\[\/img\]/i);
            if (m && m[1]) urls.push(m[1].trim());
        });
        return urls;
    }

    static extractImageTagsFromBBCode(description: string): string[] {
        const matches = description.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/gi);
        return matches ? matches.map((m) => m.trim()).filter(Boolean) : [];
    }

    static replaceImageUrlsInBBCode(description: string, newTags: string[]): string {
        let idx = 0;
        return description.replace(/\[img\](.*?)\[\/img\]/gi, () => {
            const tag = newTags[idx];
            idx += 1;
            return tag || '';
        });
    }

    static convertDescriptionToFullSize(description: string): string {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = urls.map((u) => `[img]${this.getFullSizeUrl(u)}[/img]`);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    /**
     * Uploads images to PTPImg (Stub)
     * Requires API Key and GM_xmlhttpRequest
     */
    static async uploadToPtpImg(imageUrls: string[], apiKey: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const boundary = '--NN-GGn-PTPIMG';
            let data = '';
            data += boundary + '\n';
            data += 'Content-Disposition: form-data; name="link-upload"\n\n';
            data += imageUrls.join('\n') + '\n';
            data += boundary + '\n';
            data += 'Content-Disposition: form-data; name="api_key"\n\n';
            data += apiKey + '\n';
            data += boundary + '--';
            GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: 'https://ptpimg.me/upload.php',
                responseType: 'json',
                headers: {
                    'Content-type': 'multipart/form-data; boundary=NN-GGn-PTPIMG'
                },
                data,
                onload: (response: any) => {
                    if (response.status !== 200) {
                        reject(`Response error ${response.status}`);
                        return;
                    }
                    const list = response.response?.map((item: any) => {
                        return `[img]https://ptpimg.me/${item.code}.${item.ext}[/img]`;
                    });
                    resolve(list || []);
                }
            });
        });
    }

    static async uploadToPixhost(imageUrls: string[]): Promise<string[]> {
        return new Promise((resolve, reject) => {
            GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: 'https://pixhost.to/remote/',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                },
                data: encodeURI(`imgs=${imageUrls.join('\r\n')}&content_type=0&max_th_size=350`),
                onload: (response: any) => {
                    if (response.status !== 200) {
                        reject(response.status);
                        return;
                    }
                    const data = response.responseText.match(/(upload_results = )({.*})(;)/);
                    if (data && data.length) {
                        const imgResultList = JSON.parse(data[2]).images;
                        resolve(
                            imgResultList.map((item: any) => {
                                return `[url=${item.show_url}][img]${item.th_url}[/img][/url]`;
                            })
                        );
                    } else {
                        reject('Upload failed');
                    }
                }
            });
        });
    }

    static async uploadToFreeimage(imageUrls: string[], apiKey: string): Promise<string[]> {
        const results: string[] = [];
        for (const url of imageUrls) {
            // eslint-disable-next-line no-await-in-loop
            const tag = await new Promise<string>((resolve, reject) => {
                const data = encodeURI(`source=${url}&key=${apiKey}`);
                GMAdapter.xmlHttpRequest({
                    method: 'POST',
                    url: 'https://freeimage.host/api/1/upload',
                    responseType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                    },
                    data,
                    onload: (response: any) => {
                        if (response.status !== 200) {
                            reject(`Response error ${response.status}`);
                            return;
                        }
                        const data = response.response?.image;
                        if (data?.url) {
                            resolve(`[img]${data.url}[/img]`);
                        } else {
                            reject('Upload failed');
                        }
                    }
                });
            });
            results.push(tag);
        }
        return results;
    }

    static async uploadToGifyu(imageUrls: string[], apiKey: string): Promise<string[]> {
        const results: string[] = [];
        for (const url of imageUrls) {
            // eslint-disable-next-line no-await-in-loop
            const tag = await new Promise<string>((resolve, reject) => {
                const data = encodeURI(`source=${url}&key=${apiKey}`);
                GMAdapter.xmlHttpRequest({
                    method: 'POST',
                    url: 'https://gifyu.com/api/1/upload',
                    responseType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                    },
                    data,
                    onload: (response: any) => {
                        if (response.status !== 200) {
                            reject(`Response error ${response.status}`);
                            return;
                        }
                        const data = response.response?.image;
                        if (data?.url) {
                            resolve(`[img]${data.url}[/img]`);
                        } else {
                            reject('Upload failed');
                        }
                    }
                });
            });
            results.push(tag);
        }
        return results;
    }

    static async uploadToHdbImg(imageUrls: string[], apiKey?: string, endpoint?: string): Promise<string[]> {
        const results: string[] = [];
        const apiUrl = endpoint || 'https://hdbimg.com/api/1/upload';
        for (const url of imageUrls) {
            // eslint-disable-next-line no-await-in-loop
            const tag = await new Promise<string>((resolve, reject) => {
                const data = encodeURI(`source=${url}${apiKey ? `&key=${apiKey}` : ''}`);
                GMAdapter.xmlHttpRequest({
                    method: 'POST',
                    url: apiUrl,
                    responseType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                    },
                    data,
                    onload: (response: any) => {
                        if (response.status !== 200) {
                            reject(`Response error ${response.status}`);
                            return;
                        }
                        const body = response.response || {};
                        const candidates = [
                            body?.image?.url,
                            body?.image?.url_viewer,
                            body?.data?.url,
                            body?.data?.image?.url,
                            body?.data?.display_url,
                            body?.url
                        ].filter(Boolean);
                        if (candidates.length) {
                            resolve(`[img]${candidates[0]}[/img]`);
                            return;
                        }
                        const text = response.responseText || '';
                        const match = text.match(/https?:\/\/[^\s"'<>]+/);
                        if (match) {
                            resolve(`[img]${match[0]}[/img]`);
                        } else {
                            reject('Upload failed');
                        }
                    }
                });
            });
            results.push(tag);
        }
        return results;
    }

    static async rehostDescriptionToPtpImg(description: string, apiKey: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToPtpImg(urls, apiKey);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToPixhost(description: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToPixhost(urls);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToFreeimage(description: string, apiKey: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToFreeimage(urls, apiKey);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToGifyu(description: string, apiKey: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToGifyu(urls, apiKey);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToHdbImg(description: string, apiKey?: string, endpoint?: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToHdbImg(urls, apiKey, endpoint);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    // ---- Image queue bridge (merged from ImageUploadBridgeService) ----
    static async queueImages(urls: string[], gallery?: string) {
        const list = [...urls];
        if (gallery) list.push(gallery);
        await GMAdapter.setValue(this.IMAGE_QUEUE_KEY, list.join(', '));
    }

    static async loadImageQueue(): Promise<{ urls: string[]; gallery?: string } | null> {
        const raw = await GMAdapter.getValue<string | null>(this.IMAGE_QUEUE_KEY, null);
        if (!raw) return null;
        const parts = raw.split(', ').map((p) => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        let gallery = '';
        const last = parts[parts.length - 1];
        if (last && !last.match(/^https?:\/\//i)) {
            gallery = parts.pop() || '';
        }
        return { urls: parts, gallery: gallery || undefined };
    }

    static async prepareAndOpen(meta: TorrentMeta, host: 'hdbits' | 'imgbox' | 'pixhost' | 'hdbimg' | 'hostik') {
        let picked: string[] = Array.isArray(meta.images) ? meta.images.slice() : [];
        if (!picked.length) {
            try {
                const stored = await StorageService.load();
                const ok =
                    !!stored &&
                    ((stored.sourceUrl && meta.sourceUrl && stored.sourceUrl === meta.sourceUrl) ||
                        (stored.title && meta.title && stored.title === meta.title));
                if (ok && Array.isArray(stored?.images) && stored.images.length) {
                    picked = stored.images.slice();
                }
            } catch { }
        }

        const rawUrls = picked.length ? picked : this.extractImageUrlsFromBBCode(meta.description || '');
        let normalized = Array.from(
            new Set(
                rawUrls
                    .map((u) => u.trim())
                    .filter(Boolean)
                    .map((u) => this.getFullSizeUrl(u))
            )
        );
        if (host === 'hostik') {
            normalized = await this.prependCoverForHostik(normalized, meta);
        }
        if (!normalized.length) {
            alert('未检测到可转存的图片链接');
            return;
        }

        const gallery = (meta.title || '').trim().replace(/\s+/g, '.');
        await this.queueImages(normalized, gallery || undefined);

        if (host === 'imgbox') window.open('https://imgbox.com/', '_blank');
        else if (host === 'pixhost') window.open('https://pixhost.to/', '_blank');
        else if (host === 'hdbimg') window.open('https://hdbimg.com/', '_blank');
        else if (host === 'hostik') window.open('https://hostik.cinematik.net/index.php?/add_photos', '_blank');
        else window.open('https://img.hdbits.org/', '_blank');
    }

    static async tryInjectImageQueueBridge() {
        if (document.body.dataset.autofeedImageHost === '1') return;

        const url = window.location.href;
        if (!url.match(/https?:\/\/(www\.)?(imgbox\.com|imagebam\.co|pixhost\.to|img\.hdbits\.org|hdbimg\.com|hostik\.cinematik\.net)/i)) {
            return;
        }
        const host = window.location.host.toLowerCase();

        const queue = await this.loadImageQueue();
        if (!queue || !queue.urls.length) return;

        const button = document.createElement('button');
        button.textContent = `一键拉取 (${queue.urls.length})`;
        button.style.cssText = [
            'margin: 8px 0',
            'padding: 6px 10px',
            'border: 1px solid #ccc',
            'border-radius: 4px',
            'background: #f7f7f7',
            'cursor: pointer',
            'font-size: 12px'
        ].join(';');

        const mount = document.createElement('div');
        mount.style.cssText = [
            'display: inline-flex',
            'align-items: center',
            'gap: 8px',
            'margin: 6px 0',
            'padding: 6px 8px',
            'background: rgba(255,255,255,0.92)',
            'border: 1px solid #ddd',
            'border-radius: 6px'
        ].join(';');
        mount.appendChild(button);

        const tryInlineMount = () => {
            const fieldset = document.querySelector('fieldset.selectFiles') as HTMLElement | null;
            if (fieldset) {
                const addBtn = fieldset.querySelector('#addFiles') as HTMLElement | null;
                if (addBtn && addBtn.parentElement) {
                    addBtn.parentElement.insertBefore(mount, addBtn.nextSibling);
                    return true;
                }
                const legend = fieldset.querySelector('legend') as HTMLElement | null;
                if (legend && legend.parentElement) {
                    legend.parentElement.insertBefore(mount, legend.nextSibling);
                    return true;
                }
                fieldset.insertBefore(mount, fieldset.firstChild);
                return true;
            }
            const uploader = document.getElementById('uploader') as HTMLElement | null;
            if (uploader && uploader.parentElement) {
                uploader.parentElement.insertBefore(mount, uploader);
                return true;
            }
            return false;
        };

        const isHostik = host.includes('hostik.cinematik.net');
        if (isHostik) {
            if (!tryInlineMount()) {
                mount.style.position = 'fixed';
                mount.style.top = '12px';
                mount.style.right = '12px';
                mount.style.zIndex = '2147483646';
                mount.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
                document.body.appendChild(mount);
            }
        } else {
            mount.style.position = 'fixed';
            mount.style.top = '12px';
            mount.style.right = '12px';
            mount.style.zIndex = '2147483646';
            mount.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
            document.body.appendChild(mount);
        }

        button.addEventListener('click', async () => {
            button.textContent = '拉取中...';
            button.setAttribute('disabled', 'true');
            try {
                const $fileInput = await this.waitForImageFileInput();
                if (!$fileInput.length) {
                    alert('未找到上传文件选择框（可能页面还未加载完成）。');
                    return;
                }
                const files = await this.buildImageFiles(queue.urls);
                const dt = new DataTransfer();
                files.forEach((file) => dt.items.add(file));
                const input = $fileInput.get(0) as HTMLInputElement;
                input.files = dt.files;
                input.dispatchEvent(new Event('change', { bubbles: true }));

                if (queue.gallery) {
                    $('#gallery-title').val(queue.gallery);
                    $('input[name="gallery_name"]').val(queue.gallery);
                    $('#galleryname').val(queue.gallery);
                }

                if (host.includes('pixhost.to')) {
                    $('input.max_th_size').val('350');
                    $('#gallery_box').prop('checked', true);
                }
                if (host.includes('img.hdbits.org')) {
                    $('#thumbsize').val('w350');
                }

                await GMAdapter.setValue(this.IMAGE_QUEUE_KEY, '');
                button.textContent = '拉取成功';
            } catch (err) {
                console.error(err);
                button.textContent = '拉取失败';
            } finally {
                setTimeout(() => {
                    button.removeAttribute('disabled');
                    button.textContent = `一键拉取 (${queue.urls.length})`;
                }, 1200);
            }
        });

        document.body.dataset.autofeedImageHost = '1';
    }

    // Keep backward compatibility for old callsites.
    static async tryInject() {
        return this.tryInjectImageQueueBridge();
    }

    private static normalizeImageFetchUrl(url: string): string {
        let target = this.getFullSizeUrl(url);
        if (target.match(/t\.hdbits\.org/i)) {
            target = target.replace('t.hdbits.org', 'i.hdbits.org').replace(/\.jpg(\?|$)/i, '.png$1');
        }
        return target;
    }

    private static guessImageMime(name: string) {
        const ext = name.split('.').pop()?.toLowerCase();
        if (ext === 'png') return 'image/png';
        if (ext === 'webp') return 'image/webp';
        if (ext === 'gif') return 'image/gif';
        return 'image/jpeg';
    }

    private static binaryStringToBytes(bin: string): Uint8Array {
        const out = new Uint8Array(bin.length);
        for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i) & 0xff;
        return out;
    }

    private static looksLikeImageBytes(bytes: Uint8Array): boolean {
        if (!bytes || bytes.byteLength < 12) return false;
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
            bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;
        return false;
    }

    private static async fetchImageAsBlob(url: string, fallbackFilename: string): Promise<Blob> {
        const guessed = this.guessImageMime(fallbackFilename);

        try {
            const headers: Record<string, string> = {};
            if (url.includes('images2.imgbox.com')) headers.Referer = 'https://imgbox.com/';
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                headers,
                anonymous: true,
                withCredentials: false
            });
            if (abResp?.status && abResp.status >= 400) {
                throw new Error(`HTTP ${abResp.status}`);
            }
            if (abResp?.response) {
                const u8 = new Uint8Array(abResp.response as ArrayBuffer);
                if (u8.byteLength > 64 && this.looksLikeImageBytes(u8)) {
                    return new Blob([abResp.response], { type: guessed });
                }
            }
        } catch {}

        try {
            const headers: Record<string, string> = {};
            if (url.includes('images2.imgbox.com')) headers.Referer = 'https://imgbox.com/';
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                headers,
                anonymous: false,
                withCredentials: true
            });
            if (abResp?.status && abResp.status >= 400) {
                throw new Error(`HTTP ${abResp.status}`);
            }
            if (abResp?.response) {
                const u8 = new Uint8Array(abResp.response as ArrayBuffer);
                if (u8.byteLength > 64 && this.looksLikeImageBytes(u8)) {
                    return new Blob([abResp.response], { type: guessed });
                }
            }
        } catch {}

        const resp = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        });

        if (resp?.response instanceof Blob) {
            const b: Blob = resp.response;
            return b.type ? b : new Blob([b], { type: guessed });
        }
        if (resp?.response && (resp.response as any).byteLength !== undefined) {
            const u8 = new Uint8Array(resp.response as ArrayBuffer);
            if (!this.looksLikeImageBytes(u8)) {
                const abResp = await GMAdapter.xmlHttpRequest({
                    method: 'GET',
                    url,
                    responseType: 'arraybuffer'
                });
                if (abResp?.response) return new Blob([abResp.response], { type: guessed });
            }
            return new Blob([resp.response], { type: guessed });
        }
        const text: string = resp?.responseText || '';
        if (!text) {
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer'
            });
            if (abResp?.response) return new Blob([abResp.response], { type: guessed });
            return new Blob([], { type: guessed });
        }
        const bytes = this.binaryStringToBytes(text);
        if (!this.looksLikeImageBytes(bytes)) {
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer'
            });
            if (abResp?.response) return new Blob([abResp.response], { type: guessed });
        }
        const ab = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(ab).set(bytes);
        return new Blob([ab], { type: guessed });
    }

    private static async buildImageFiles(urls: string[]): Promise<File[]> {
        const tasks = urls.map(async (raw, index) => {
            const url = this.normalizeImageFetchUrl(raw);
            const parsedFilename = decodeURIComponent(url.split('/').pop() || `image-${index}.jpg`).split('?')[0];
            const hasExt = parsedFilename.match(/\.(png|jpe?g|gif|webp)$/i);
            const filename = hasExt ? parsedFilename : `image-${index}.jpg`;
            if (!hasExt) {
                const blob = await this.fetchImageAsBlob(url, filename);
                if (!blob || (blob as any).size === 0) {
                    throw new Error(`Image download returned empty blob: ${url}`);
                }
                const type = (blob && (blob as any).type) ? (blob as any).type : this.guessImageMime(filename);
                return new File([blob], filename, { type });
            }
            const blob = await this.fetchImageAsBlob(url, filename || `image-${index}.jpg`);
            if (!blob || (blob as any).size === 0) {
                throw new Error(`Image download returned empty blob: ${url}`);
            }
            const type = (blob && (blob as any).type) ? (blob as any).type : this.guessImageMime(filename);
            return new File([blob], filename || `image-${index}.jpg`, { type });
        });
        return Promise.all(tasks);
    }

    private static async waitForImageFileInput(): Promise<JQuery<HTMLInputElement>> {
        for (let i = 0; i < 20; i++) {
            const $fileInput =
                $('input[name="files[]"]').first()
                    .add($('input[type="file"][name*="file"]').first())
                    .add($('input[type="file"][multiple]').first())
                    .add($('input[type="file"]').first())
                    .add($('input.dz-hidden-input[type="file"]').first())
                    .add($('#uploader input[type="file"]').first())
                    .add($('.plupload input[type="file"]').first())
                    .add($('div.moxie-shim input[type="file"]').first())
                    .filter((_, el) => el instanceof HTMLInputElement)
                    .first();
            if ($fileInput.length) return $fileInput as JQuery<HTMLInputElement>;
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return $('input[name="files[]"]').first() as JQuery<HTMLInputElement>;
    }
}
