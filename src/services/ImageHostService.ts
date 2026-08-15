
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
    private static HOSTIK_PENDING_KEY = 'auto_feed_hostik_pending';
    private static HOSTIK_RESULT_BTN_ID = 'autofeed-hostik-copy-btn';
    private static HOSTIK_RESULT_MODAL_ID = 'autofeed-hostik-result-modal';
    private static HOSTIK_RESULT_SIG_KEY = 'autofeed_hostik_result_sig';

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

    private static normalizeAmazonPosterUrl(url: string): string {
        const value = String(url || '').trim();
        if (!value) return '';
        if (!/m\.media-amazon\.com\/images/i.test(value)) return value;
        return value.replace(/\._V1_[^.?]*(?=\.(?:jpg|jpeg|png|webp)(?:\?|$))/i, '._V1_');
    }

    private static getPageCoverCandidates(): string[] {
        const out: string[] = [];
        const htmlHosted: string[] = [];
        try {
            const html = document.documentElement?.innerHTML || '';
            const matches =
                html.match(
                    /https?:\/\/(?:img\d+\.pixhost\.to\/images\/[^\s"'<>]+|t\d+\.pixhost\.to\/thumbs\/[^\s"'<>]+|(?:images\d?|thumbs\d?)\.imgbox\.com\/[^\s"'<>]+|ptpimg\.me\/[^\s"'<>]+\.(?:png|jpe?g|webp|gif)|img\.hdbits\.org\/[^\s"'<>]+|hdbimg\.com\/[^\s"'<>]+)(?:\?[^\s"'<>]*)?/gi
                ) || [];
            matches.forEach((item) => htmlHosted.push(item));
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
                const anchorHref = (img.closest('a') as HTMLAnchorElement | null)?.href || '';
                if (anchorHref) out.push(anchorHref);
                const onclick = img.getAttribute('onclick') || '';
                const matches = onclick.match(/https?:\/\/[^\s'"]+\.(?:png|jpe?g|webp|gif)(?:\?[^\s'"]*)?/gi) || [];
                matches.forEach((item) => out.push(item));
                const src = img.getAttribute('data-src') || img.getAttribute('src') || img.currentSrc || img.src || '';
                if (src) out.push(src);
            });
        });
        try {
            const og = (document.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content || '';
            if (og) out.push(og);
        } catch {}
        const normalizeList = (items: string[]) =>
            Array.from(
                new Set(
                    items
                        .map((item) => this.getFullSizeUrl(this.decodeWsrvUrl(String(item || '').trim())))
                        .filter(Boolean)
                )
            );
        const hostedNormalized = normalizeList(htmlHosted).sort((a, b) => {
            const aJpg = /\.(jpe?g)(\?|$)/i.test(a) ? 1 : 0;
            const bJpg = /\.(jpe?g)(\?|$)/i.test(b) ? 1 : 0;
            return bJpg - aJpg;
        });
        const pageNormalized = normalizeList(out);
        const result = Array.from(new Set([...hostedNormalized, ...pageNormalized]));
        return result;
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
                    if (img) return this.normalizeCoverUrl(this.normalizeAmazonPosterUrl(img));
                } catch {}
            }
            const og = (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content || '';
            if (og) return this.normalizeCoverUrl(this.normalizeAmazonPosterUrl(og));
            const quick = html.match(/"image"\s*:\s*"([^"]+)"/i)?.[1] || '';
            return quick ? this.normalizeCoverUrl(this.normalizeAmazonPosterUrl(quick.replace(/\\\//g, '/'))) : '';
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

    private static async fetchOmdbPosterUrl(imdbUrlOrId: string): Promise<string> {
        const imdbId = String(imdbUrlOrId || '').match(/tt\d+/i)?.[0] || '';
        if (!imdbId) return '';
        try {
            const api = `https://www.omdbapi.com/?apikey=2edf5c13&i=${encodeURIComponent(imdbId)}&plot=full`;
            const res = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url: api,
                headers: { accept: 'application/json' }
            });
            const data = JSON.parse(res?.responseText || '{}');
            const poster = String(data?.Poster || '').trim();
            if (!poster || poster === 'N/A') return '';
            return this.normalizeCoverUrl(this.normalizeAmazonPosterUrl(poster));
        } catch {
            return '';
        }
    }

    private static async resolveHostikCoverUrl(meta?: Partial<TorrentMeta>, existing: string[] = []): Promise<string> {
        const current = Array.from(new Set((existing || []).map((u) => this.getFullSizeUrl(this.decodeWsrvUrl(String(u || '').trim()))).filter(Boolean)));
        const currentSet = new Set(current);
        const leadDescriptionImage = this.getFullSizeUrl(
            this.decodeWsrvUrl(this.extractLeadImageUrlFromBBCode(String(meta?.description || '')))
        );
        const isStableHostedCandidate = (url: string) => {
            try {
                const host = new URL(url).hostname.toLowerCase();
                return /(?:^|\.)(pixhost\.to|ptpimg\.me|imgbox\.com|hdbits\.org|hdbimg\.com)$/.test(host);
            } catch {
                return false;
            }
        };
        const pageCandidates = Array.from(
            new Set(
                this.getPageCoverCandidates()
                    .map((u) => this.getFullSizeUrl(this.decodeWsrvUrl(String(u || '').trim())))
                .filter(Boolean)
            )
        );
        const stablePageCandidates = pageCandidates.filter((item) => isStableHostedCandidate(item));
        const fallbackPageCandidates = pageCandidates.filter((item) => !isStableHostedCandidate(item));
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
        const earlyCandidates = [
            ...(leadDescriptionImage ? [leadDescriptionImage] : []),
            ...metaCandidates.filter((item) => item !== leadDescriptionImage),
            ...stablePageCandidates
        ];

        for (const candidate of earlyCandidates) {
            if (!candidate || currentSet.has(candidate)) continue;
            if (this.hasImageExtension(candidate)) {
                return await this.rehostCoverToPixhost(candidate);
            }
        }

        // Prefer IMDb/Douban poster over site-proxied or low-res local cover fallbacks.
        const imdbUrl = String(meta?.imdbUrl || '').trim() || (meta?.imdbId ? `https://www.imdb.com/title/${meta.imdbId}/` : '');
        const imdbPoster = await this.fetchImdbPosterUrl(imdbUrl);
        if (imdbPoster && !currentSet.has(imdbPoster)) {
            return await this.rehostCoverToPixhost(imdbPoster);
        }
        const omdbPoster = await this.fetchOmdbPosterUrl(imdbUrl || String(meta?.imdbId || ''));
        if (omdbPoster && !currentSet.has(omdbPoster)) {
            return await this.rehostCoverToPixhost(omdbPoster);
        }
        const doubanPoster = await this.fetchDoubanPosterUrl(String(meta?.doubanUrl || ''));
        if (doubanPoster && !currentSet.has(doubanPoster)) {
            return await this.rehostCoverToPixhost(doubanPoster);
        }

        const lateCandidates = [...fallbackPageCandidates];
        for (const candidate of lateCandidates) {
            if (!candidate || currentSet.has(candidate)) continue;
            if (this.hasImageExtension(candidate)) {
                return await this.rehostCoverToPixhost(candidate);
            }
        }

        // Some pages expose poster URLs that are not direct image links.
        // Rehost one candidate to Pixhost to guarantee Hostik pull can fetch it.
        for (const candidate of [...earlyCandidates, ...lateCandidates]) {
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

        if (url.match(/(?:^|https?:\/\/)[ti]\.hdbits\.org\//i)) {
            // HDB blocks hotlinking from the public thumbnail host. Match the
            // legacy flow by pointing the local downloader at the original CDN.
            newUrl = newUrl
                .replace(/https?:\/\/t\.hdbits\.org\//i, 'https://i.hdbits.org/')
                .replace(/\.jpg(\?[^\s\]]*)?$/i, '.png$1');
        } else if (url.match(/imgbox/)) {
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

    static isHdbImageUrl(url: string): boolean {
        return /(?:^|https?:\/\/)[ti]\.hdbits\.org\//i.test(String(url || '').trim());
    }

    static hasHdbImageSource(urls: string[] | string): boolean {
        const values = Array.isArray(urls) ? urls : [urls];
        return values.some((url) => this.isHdbImageUrl(url));
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

    private static extractLeadImageUrlFromBBCode(description: string): string {
        const urls = this.extractImageUrlsFromBBCode(description || '');
        return urls.length ? String(urls[0] || '').trim() : '';
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

    static async uploadToImgbb(imageUrls: string[], apiKey: string): Promise<string[]> {
        const results: string[] = [];
        for (const url of imageUrls) {
            // eslint-disable-next-line no-await-in-loop
            const tag = await new Promise<string>((resolve, reject) => {
                const data = encodeURI(`image=${url}&key=${apiKey}`);
                GMAdapter.xmlHttpRequest({
                    method: 'POST',
                    url: 'https://api.imgbb.com/1/upload',
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
                        let body = response.response || {};
                        if (!body?.data && response.responseText) {
                            try { body = JSON.parse(response.responseText); } catch {}
                        }
                        const data = body?.data;
                        const uploadedUrl =
                            data?.image?.url ||
                            data?.url ||
                            data?.display_url ||
                            data?.medium?.url ||
                            data?.thumb?.url ||
                            '';
                        if (uploadedUrl) {
                            resolve(`[img]${uploadedUrl}[/img]`);
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

    static async rehostDescriptionToImgbb(description: string, apiKey: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToImgbb(urls, apiKey);
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
        const payload = JSON.stringify({
            urls: [...urls],
            gallery: gallery || '',
            createdAt: Date.now()
        });
        await GMAdapter.setValue(this.IMAGE_QUEUE_KEY, payload);
    }

    static async loadImageQueue(): Promise<{ urls: string[]; gallery?: string } | null> {
        const raw = await GMAdapter.getValue<string | null>(this.IMAGE_QUEUE_KEY, null);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            if (parsed && Array.isArray(parsed.urls)) {
                return {
                    urls: parsed.urls.map((item: any) => String(item || '').trim()).filter(Boolean),
                    gallery: String(parsed.gallery || '').trim() || undefined
                };
            }
        } catch {}
        const parts = raw.split(', ').map((p) => p.trim()).filter(Boolean);
        if (!parts.length) return null;
        let gallery = '';
        const last = parts[parts.length - 1];
        if (last && !last.match(/^https?:\/\//i)) {
            gallery = parts.pop() || '';
        }
        return { urls: parts, gallery: gallery || undefined };
    }

    private static async saveHostikPending(urls: string[], gallery?: string) {
        await GMAdapter.setValue(this.HOSTIK_PENDING_KEY, JSON.stringify({
            urls: [...urls],
            gallery: gallery || '',
            createdAt: Date.now()
        }));
    }

    /**
     * Resolve the source release title used by Hostik albums.
     * Prefer the title parsed from the source tracker, then fall back to a
     * release name embedded in media information or the torrent filename. Hostik albums historically use
     * dots between words, so keep that convention here.
     */
    static getHostikAlbumName(meta: Partial<TorrentMeta>): string {
        const sourceText = [meta.fullMediaInfo, meta.description]
            .map((value) => String(value || ''))
            .filter(Boolean)
            .join('\n');
        const releasePatterns = [
            /Disc Title\s*[:：]\s*([^\r\n\]]+)/i,
            /Complete name\s*[:：]\s*([^\r\n\]]+)/i,
            /RELEASE\.NAME\s*[:：]\s*([^\r\n\]]+)/i,
            /Release name\s*[:：]\s*([^\r\n\]]+)/i
        ];
        let raw = String(meta.title || '').trim();
        if (!raw) {
            for (const pattern of releasePatterns) {
                const match = sourceText.match(pattern);
                if (match?.[1]?.trim()) {
                    raw = match[1].trim();
                    break;
                }
            }
        }
        if (!raw) raw = String(meta.torrentFilename || meta.torrentName || '').trim();

        return raw
            .replace(/\[\/?[^\]]+\]/g, '')
            .replace(/\.torrent$/i, '')
            .replace(/\s+/g, '.')
            .replace(/\.{2,}/g, '.')
            .replace(/^[.\s]+|[.\s]+$/g, '')
            .slice(0, 255);
    }

    private static async loadHostikPending(): Promise<{ urls: string[]; gallery?: string; createdAt?: number } | null> {
        const raw = await GMAdapter.getValue<string | null>(this.HOSTIK_PENDING_KEY, null);
        if (!raw) return null;
        try {
            const parsed = JSON.parse(raw);
            if (!parsed || !Array.isArray(parsed.urls)) return null;
            return {
                urls: parsed.urls.map((item: any) => String(item || '').trim()).filter(Boolean),
                gallery: String(parsed.gallery || '').trim() || undefined,
                createdAt: Number(parsed.createdAt || 0) || undefined
            };
        } catch {
            return null;
        }
    }

    private static async createHostikAlbum(parentId: string, albumName: string): Promise<string> {
        const response = await GMAdapter.xmlHttpRequest({
            method: 'POST',
            url: new URL('/ws.php?format=json', window.location.origin).toString(),
            headers: {
                'Accept': 'application/json, text/javascript, */*; q=0.01',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
            },
            data: new URLSearchParams({
                method: 'pwg.categories.add',
                parent: parentId,
                name: albumName
            }).toString(),
            responseType: 'text',
            anonymous: false,
            withCredentials: true,
            timeout: 15000
        });

        if (response?.status && response.status >= 400) {
            throw new Error(`Hostik album request failed: HTTP ${response.status}`);
        }

        let payload: any = response?.response;
        if (typeof payload === 'string') {
            try { payload = JSON.parse(payload); } catch {}
        }
        if (!payload && response?.responseText) {
            try { payload = JSON.parse(response.responseText); } catch {}
        }
        if (payload?.error) {
            const message = payload.error.message || payload.error.code || 'unknown error';
            throw new Error(`Hostik album creation failed: ${message}`);
        }

        const id = payload?.result?.id;
        if (id === undefined || id === null || id === '') {
            throw new Error('Hostik album creation returned no album id');
        }
        return String(id);
    }

    private static async ensureHostikAlbum(albumName?: string) {
        const target = String(albumName || '').trim();
        if (!target) return;

        const canonical = (value: string) => String(value || '')
            .trim()
            .replace(/\s*\/\s*/g, '/')
            .replace(/\s+/g, '.')
            .toLowerCase();
        const targetCanonical = canonical(target);
        for (let attempt = 0; attempt < 40; attempt++) {
            const albumSelect = document.querySelector('#albumSelect') as HTMLSelectElement | null;
            if (!albumSelect || !albumSelect.options.length) {
                await new Promise((resolve) => window.setTimeout(resolve, 250));
                continue;
            }

            const existing = Array.from(albumSelect.options).find((option) => {
                const label = String(option.textContent || '').trim();
                return canonical(label) === targetCanonical || canonical(label).endsWith(`/${targetCanonical}`);
            });
            if (existing) {
                if (albumSelect.value !== existing.value) {
                    albumSelect.value = existing.value;
                    albumSelect.dispatchEvent(new Event('change', { bubbles: true }));
                }
                return;
            }

            const parent = Array.from(albumSelect.options).find((option) => {
                const label = String(option.textContent || '').trim();
                return label === 'Hostik / gawain' || !label.includes(' / ');
            }) || albumSelect.options[0];
            if (!parent?.value) return;

            // Hostik uses Piwigo's native dialog, whose Create button sends a
            // same-origin POST to ws.php. Calling that API directly avoids the
            // modal and, importantly, avoids turning the upload route into a
            // plain query-string URL that redirects to the home page.
            const albumId = await this.createHostikAlbum(parent.value, target);
            const parentLabel = String(parent.textContent || '').trim();
            const fullLabel = parentLabel ? `${parentLabel} / ${target}` : target;
            const selectize = (albumSelect as HTMLSelectElement & {
                selectize?: {
                    addOption?: (option: Record<string, any>) => void;
                    setValue?: (value: string) => void;
                };
            }).selectize;

            if (selectize?.addOption && selectize.setValue) {
                selectize.addOption({
                    id: albumId,
                    value: albumId,
                    name: target,
                    fullname: fullLabel,
                    text: fullLabel
                });
                selectize.setValue(albumId);
            } else {
                const option = new Option(fullLabel, albumId, true, true);
                albumSelect.add(option);
                albumSelect.value = albumId;
                albumSelect.dispatchEvent(new Event('input', { bubbles: true }));
                albumSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
            return;
        }
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

        const gallery = host === 'hostik'
            ? this.getHostikAlbumName(meta)
            : (meta.title || '').trim().replace(/\s+/g, '.');
        await this.queueImages(normalized, gallery || undefined);
        if (host === 'hostik') {
            await this.saveHostikPending(normalized, gallery || undefined);
        }

        if (host === 'imgbox') window.open('https://imgbox.com/', '_blank');
        else if (host === 'pixhost') window.open('https://pixhost.to/', '_blank');
        else if (host === 'hdbimg') window.open('https://hdbimg.com/', '_blank');
        else if (host === 'hostik') window.open('https://hostik.cinematik.net/index.php?/add_photos', '_blank');
        else window.open('https://img.hdbits.org/', '_blank');
    }

    static async tryInjectImageQueueBridge() {
        const url = window.location.href;
        if (!url.match(/https?:\/\/(www\.)?(imgbox\.com|imagebam\.co|pixhost\.to|img\.hdbits\.org|hdbimg\.com|hostik\.cinematik\.net)/i)) {
            return;
        }
        const host = window.location.host.toLowerCase();
        const isHostik = host.includes('hostik.cinematik.net');

        let hostikPending: { urls: string[]; gallery?: string; createdAt?: number } | null = null;
        if (isHostik) {
            const hostikPageSig = `${window.location.pathname}${window.location.search}`;
            if (document.body.dataset.autofeedHostikComposerSig !== hostikPageSig) {
                document.body.dataset.autofeedHostikComposerSig = hostikPageSig;
                hostikPending = await this.loadHostikPending();
                this.installHostikComposer(hostikPending || null).catch((err) => console.error('[Auto-Feed] Hostik composer error:', err));
            }
        }

        if (document.body.dataset.autofeedImageHost === '1') {
            return;
        }

        const queue = await this.loadImageQueue();
        if (!queue || !queue.urls.length) return;

        if (isHostik) {
            const albumName = queue.gallery || hostikPending?.gallery;
            this.ensureHostikAlbum(albumName).catch((err) => console.error('[Auto-Feed] Hostik album error:', err));
        }

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

    private static getHostikOriginalUrl(url: string, withDotSegment = false): string {
        const raw = String(url || '').trim();
        if (!raw) return '';
        try {
            const parsed = new URL(raw, window.location.href);
            const full = `${parsed.pathname}${parsed.search}`;
            if (this.isHostikUploadUrl(parsed.toString())) {
                let normalized = full
                    .replace('/i.php?', '')
                    .replace('/_data/i/upload/', '/upload/')
                    .replace(/-(?:sq|th|me|la|xl|sm)\.(png|jpe?g|gif|webp)(\?.*)?$/i, '.$1');
                if (withDotSegment) {
                    normalized = normalized.replace('/upload/', '/./upload/');
                }
                return `${parsed.origin}${normalized}`;
            }
            return parsed.toString();
        } catch {
            return raw;
        }
    }

    private static isHostikUploadUrl(url: string): boolean {
        return /hostik\.cinematik\.net\/(?:i\.php\?\/upload\/|_data\/i\/upload\/|upload\/)/i.test(String(url || ''));
    }

    private static buildHostikImageTags(thumbUrls: string[]): string[] {
        return thumbUrls.map((thumb, index) => {
            const full = this.getHostikOriginalUrl(thumb, index !== 0);
            return index === 0 ? `[img]${full}[/img]` : `[url=${full}][img]${thumb}[/img][/url]`;
        });
    }

    private static parseHostikLinkedImageTags(raw: string): Array<{ full: string; thumb: string }> {
        const out: Array<{ full: string; thumb: string }> = [];
        const text = String(raw || '').trim();
        if (!text) return out;
        const regex = /\[url=([^\]]+)\]\[img(?:=[^\]]+)?\]([^\[]+)\[\/img\]\[\/url\]/gi;
        let match: RegExpExecArray | null;
        while ((match = regex.exec(text))) {
            const full = String(match[1] || '').trim();
            const thumb = String(match[2] || '').trim();
            if (!full || !thumb) continue;
            out.push({
                full,
                thumb
            });
        }
        return out;
    }

    private static buildHostikTikSectionFromPairs(pairs: Array<{ full: string; thumb: string }>): string {
        if (!pairs.length) return '';
        const cover = `[img]${pairs[0].full}[/img]`;
        const shots = pairs.slice(1).map((pair) => `[url=${pair.full}][img]${pair.thumb}[/img][/url]`);
        const shotLines: string[] = [];
        for (let i = 0; i < shots.length; i += 2) {
            shotLines.push(shots.slice(i, i + 2).join(' '));
        }
        return ['[center]', cover, '', ...shotLines, '[/center]'].join('\n').trim();
    }

    private static buildHostikTikSection(thumbUrls: string[]): string {
        const tags = this.buildHostikImageTags(thumbUrls);
        if (!tags.length) return '';
        const cover = tags[0];
        const shots = tags.slice(1);
        const shotLines: string[] = [];
        for (let i = 0; i < shots.length; i += 2) {
            shotLines.push(shots.slice(i, i + 2).join(' '));
        }
        return [
            '[center]',
            cover,
            '',
            ...shotLines,
            '[/center]'
        ].join('\n').trim();
    }

    private static async copyText(text: string) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch {}
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        textarea.style.pointerEvents = 'none';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        let ok = false;
        try {
            ok = document.execCommand('copy');
        } catch {
            ok = false;
        }
        textarea.remove();
        return ok;
    }

    private static renderHostikResultModal(imageBlock: string) {
        const existing = document.getElementById(this.HOSTIK_RESULT_MODAL_ID);
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = this.HOSTIK_RESULT_MODAL_ID;
        overlay.style.cssText = [
            'position:fixed',
            'inset:0',
            'background:rgba(0,0,0,0.62)',
            'z-index:2147483647',
            'display:flex',
            'align-items:center',
            'justify-content:center',
            'padding:24px'
        ].join(';');

        const panel = document.createElement('div');
        panel.style.cssText = [
            'width:min(1100px, 92vw)',
            'max-height:84vh',
            'background:#ffffff',
            'border-radius:10px',
            'box-shadow:0 18px 48px rgba(0,0,0,0.35)',
            'display:flex',
            'flex-direction:column',
            'overflow:hidden'
        ].join(';');

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:14px 16px;border-bottom:1px solid #e5e7eb;';
        header.innerHTML = '<div><div style="font-weight:700;color:#1f2937;">Hostik 标准格式</div><div style="margin-top:4px;font-size:12px;color:#6b7280;">封面全尺寸，后续截图为缩略图加原图链接，可直接贴回 Tik 开头图片区块。</div></div>';

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = 'border:none;background:transparent;font-size:22px;cursor:pointer;color:#6b7280;';
        closeBtn.onclick = () => overlay.remove();
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.style.cssText = 'padding:16px;overflow:auto;';

        const wrap = document.createElement('div');
        wrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;min-height:0;';
        const bar = document.createElement('div');
        bar.style.cssText = 'display:flex;align-items:center;justify-content:space-between;gap:8px;';
        const label = document.createElement('div');
        label.textContent = 'Tik 图床段';
        label.style.cssText = 'font-weight:700;color:#374151;';
        const copyBtn = document.createElement('button');
        copyBtn.textContent = '复制';
        copyBtn.style.cssText = 'border:1px solid #d1d5db;background:#111827;color:#fff;border-radius:6px;padding:6px 10px;cursor:pointer;font-size:12px;';
        copyBtn.onclick = async () => {
            const ok = await this.copyText(imageBlock);
            copyBtn.textContent = ok ? '已复制' : '复制失败';
            setTimeout(() => { copyBtn.textContent = '复制'; }, 1200);
        };
        const textarea = document.createElement('textarea');
        textarea.value = imageBlock;
        textarea.style.cssText = 'width:100%;min-height:340px;resize:vertical;padding:10px 12px;border:1px solid #d1d5db;border-radius:8px;font-family:ui-monospace, SFMono-Regular, Menlo, monospace;font-size:12px;line-height:1.5;color:#111827;background:#f9fafb;';
        bar.appendChild(label);
        bar.appendChild(copyBtn);
        wrap.appendChild(bar);
        wrap.appendChild(textarea);
        body.appendChild(wrap);

        panel.appendChild(header);
        panel.appendChild(body);
        overlay.appendChild(panel);
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);
    }

    private static async installHostikComposer(pending: { urls: string[]; gallery?: string; createdAt?: number } | null) {
        const expected = pending?.urls?.length || 0;
        const readUploadProgress = () => {
            const text = document.body?.innerText || '';
            const match = text.match(/Uploaded\s*:?\s*(\d+)\s*(?:\/|of)\s*(\d+)\s+files/i);
            if (!match) return null;
            return {
                uploaded: Number(match[1] || 0),
                total: Number(match[2] || 0)
            };
        };
        const isUploadStillRunning = () => {
            const progress = readUploadProgress();
            if (!progress) return false;
            if (progress.total <= 0) return false;
            return progress.uploaded < progress.total;
        };
        const collectFromCodeTextareas = () => {
            const textareas = Array.from(document.querySelectorAll('textarea'))
                .map((node) => node as HTMLTextAreaElement)
                .map((node) => String(node.value || '').trim())
                .filter((value) => value.includes('hostik.cinematik.net') && value.includes('[img'));
            let best: Array<{ full: string; thumb: string }> = [];
            textareas.forEach((value) => {
                const pairs = this.parseHostikLinkedImageTags(value)
                    .filter((pair) => this.isHostikUploadUrl(pair.thumb));
                const standalone: Array<{ full: string; thumb: string }> = [];
                const standaloneRe = /\[img(?:=[^\]]+)?\](https?:\/\/hostik\.cinematik\.net\/[^\[\s]+)\[\/img\]/gi;
                let match: RegExpExecArray | null;
                while ((match = standaloneRe.exec(value))) {
                    const prefix = value.slice(0, match.index);
                    // Do not treat the inner [img] of a [url=...][img]...
                    // [/img][/url] pair as a second standalone image.
                    if (/\[url=[^\]]+\]\s*$/i.test(prefix)) continue;
                    const url = String(match[1] || '').trim();
                    if (url && this.isHostikUploadUrl(url)) standalone.push({ full: url, thumb: url });
                }
                const merged = [...standalone, ...pairs].filter((item, index, items) =>
                    items.findIndex((candidate) => candidate.full === item.full && candidate.thumb === item.thumb) === index
                );
                if (merged.length > best.length) {
                    best = merged;
                }
            });
            return best;
        };
        const collectImages = () => Array.from(document.querySelectorAll('#uploadedPhotos img, img'))
            .map((node) => node as HTMLImageElement)
            .filter((img) => {
                const src = String(img.currentSrc || img.src || '').trim();
                return this.isHostikUploadUrl(src);
            });
        const attemptBuild = async () => {
            if (isUploadStillRunning()) return null;

            const linkedTags = collectFromCodeTextareas();
            if (linkedTags.length) {
                const pickedPairs = expected > 0 ? linkedTags.slice(0, Math.min(expected, linkedTags.length)) : linkedTags.slice();
                if (pickedPairs.length) {
                    const normalizedPairs = pickedPairs.map((pair, index) => ({
                        full: this.getHostikOriginalUrl(pair.full, index !== 0),
                        thumb: String(pair.thumb || '').trim()
                    })).filter((pair) => pair.full && pair.thumb);
                    if (expected > 0 && normalizedPairs.length < expected) {
                        return null;
                    }
                    if (normalizedPairs.length) {
                        return {
                            imageBlock: this.buildHostikTikSectionFromPairs(normalizedPairs),
                            signature: normalizedPairs.map((pair) => `${pair.full}|${pair.thumb}`).join('||')
                        };
                    }
                }
            }

            const images = collectImages();
            const available = images.length;
            if (!available) return null;
            const progress = readUploadProgress();
            if (progress && progress.total > 0 && available < progress.total) return null;
            const picked = expected > 0 ? images.slice(-Math.min(expected, available)) : images.slice();
            if (!picked.length) return null;
            const coverIndex = (() => {
                let winner = 0;
                let minRatio = Number.POSITIVE_INFINITY;
                picked.forEach((img, index) => {
                    const width = img.naturalWidth || img.clientWidth || 0;
                    const height = img.naturalHeight || img.clientHeight || 1;
                    const ratio = width > 0 && height > 0 ? width / height : Number.POSITIVE_INFINITY;
                    if (ratio < minRatio) {
                        minRatio = ratio;
                        winner = index;
                    }
                });
                return minRatio < 0.9 ? winner : 0;
            })();
            const orderedThumbs = picked
                .map((img) => String(img.currentSrc || img.src || '').trim())
                .filter(Boolean);
            const coverThumb = orderedThumbs[coverIndex];
            const shots = orderedThumbs.filter((_, index) => index !== coverIndex);
            const normalized = [coverThumb, ...shots].filter(Boolean);
            if (expected > 0 && normalized.length < expected) return null;
            if (!normalized.length) return null;
            return {
                imageBlock: this.buildHostikTikSection(normalized),
                signature: normalized.join('|')
            };
        };

        const mountButton = (payload: { imageBlock: string; signature: string }) => {
            const existing = document.getElementById(this.HOSTIK_RESULT_BTN_ID);
            if (existing) existing.remove();
            const btn = document.createElement('button');
            btn.id = this.HOSTIK_RESULT_BTN_ID;
            btn.textContent = '复制 Tik 图床段';
            btn.style.cssText = [
                'position:fixed',
                'top:14px',
                'right:14px',
                'z-index:2147483646',
                'border:1px solid rgba(0,0,0,0.15)',
                'background:#111827',
                'color:#ffffff',
                'padding:8px 12px',
                'border-radius:8px',
                'box-shadow:0 8px 24px rgba(0,0,0,0.22)',
                'cursor:pointer',
                'font-size:12px',
                'font-weight:700'
            ].join(';');
            btn.onclick = () => this.renderHostikResultModal(payload.imageBlock);
            document.body.appendChild(btn);

            // A new upload may legitimately produce the same URLs as an earlier
            // upload in this tab. Do not let a stale sessionStorage signature
            // suppress the result popup.
            try { sessionStorage.setItem(this.HOSTIK_RESULT_SIG_KEY, payload.signature); } catch {}
            this.renderHostikResultModal(payload.imageBlock);
        };

        // Hostik may finish large batches after a minute. Keep the lightweight
        // watcher alive long enough to catch the final code block.
        for (let i = 0; i < 300; i++) {
            const payload = await attemptBuild();
            if (payload) {
                mountButton(payload);
                return;
            }
            await new Promise((resolve) => window.setTimeout(resolve, 1000));
        }
    }

    private static normalizeImageFetchUrl(url: string): string {
        let target = this.getFullSizeUrl(url);
        if (target.match(/t\.hdbits\.org/i)) {
            target = target.replace(/t\.hdbits\.org/ig, 'i.hdbits.org').replace(/\.jpg(\?|$)/i, '.png$1');
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
        const isHdb = this.isHdbImageUrl(url);
        const baseHeaders: Record<string, string> = {};
        if (url.includes('images2.imgbox.com')) baseHeaders.Referer = 'https://imgbox.com/';
        if (isHdb) {
            baseHeaders.Referer = 'https://hdbits.org/';
            baseHeaders.Accept = 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8';
        }

        // Legacy getImage() downloads protected HDB images into a File first;
        // the destination host never receives the original hotlink URL.
        if (isHdb) {
            try {
                const blobResp = await GMAdapter.xmlHttpRequest({
                    method: 'GET',
                    url,
                    responseType: 'blob',
                    headers: baseHeaders,
                    anonymous: false,
                    withCredentials: true
                });
                if (blobResp?.status && blobResp.status >= 400) throw new Error(`HTTP ${blobResp.status}`);
                if (blobResp?.response instanceof Blob && blobResp.response.size > 0) {
                    return blobResp.response.type ? blobResp.response : new Blob([blobResp.response], { type: guessed });
                }
            } catch {}
        }

        try {
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                headers: baseHeaders,
                anonymous: !isHdb,
                withCredentials: isHdb
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
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                headers: baseHeaders,
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
