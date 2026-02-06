import $ from 'jquery';
import { GMAdapter } from './GMAdapter';
import { TorrentMeta } from '../types/TorrentMeta';
import { ImageHostService } from './ImageHostService';

type ImageQueue = {
    urls: string[];
    gallery?: string;
};

const IMAGE_QUEUE_KEY = 'HDB_images';

export class ImageUploadBridgeService {
    static async queueImages(urls: string[], gallery?: string) {
        const list = [...urls];
        if (gallery) list.push(gallery);
        await GMAdapter.setValue(IMAGE_QUEUE_KEY, list.join(', '));
    }

    static async loadQueue(): Promise<ImageQueue | null> {
        const raw = await GMAdapter.getValue<string | null>(IMAGE_QUEUE_KEY, null);
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
        const rawUrls = meta.images?.length ? meta.images : ImageHostService.extractImageUrlsFromBBCode(meta.description || '');
        const normalized = Array.from(
            new Set(
                rawUrls
                    .map((u) => u.trim())
                    .filter(Boolean)
                    .map((u) => ImageHostService.getFullSizeUrl(u))
            )
        );
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

    static async tryInject() {
        if (document.body.dataset.autofeedImageHost === '1') return;

        const url = window.location.href;
        if (!url.match(/https?:\/\/(www\.)?(imgbox\.com|imagebam\.co|pixhost\.to|img\.hdbits\.org|hdbimg\.com|hostik\.cinematik\.net)/i)) {
            return;
        }
        const host = window.location.host.toLowerCase();

        const queue = await this.loadQueue();
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

        // Some hosts render the file input dynamically (or hide it behind a dropzone).
        // Legacy behavior: always show the pull button; locate the input on click.
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
            // Hostik: embed into the "Select files" section to avoid blocking UI.
            const fieldset = document.querySelector('fieldset.selectFiles') as HTMLElement | null;
            if (fieldset) {
                // Prefer right after legend or after the Add Photos button.
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

            // Generic: try to locate around uploader blocks
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
                // Fallback fixed mount if the expected form isn't ready yet.
                mount.style.position = 'fixed';
                mount.style.top = '12px';
                mount.style.right = '12px';
                mount.style.zIndex = '2147483646';
                mount.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
                document.body.appendChild(mount);
            }
        } else {
            // For imgbox/img.hdbits/hdbimg/pixhost: keep fixed mount to avoid being inserted into hidden containers.
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
                const $fileInput = await this.waitForFileInput();
                if (!$fileInput.length) {
                    alert('未找到上传文件选择框（可能页面还未加载完成）。');
                    return;
                }
                const files = await this.buildFiles(queue.urls);
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

                // Legacy parity: set host-specific gallery/thumb options.
                if (host.includes('pixhost.to')) {
                    $('input.max_th_size').val('350');
                    $('#gallery_box').prop('checked', true);
                }
                if (host.includes('img.hdbits.org')) {
                    $('#thumbsize').val('w350');
                }
                if (host.includes('hostik.cinematik.net')) {
                    // Hostik uses plupload; change event should be enough for its queueing.
                }

                await GMAdapter.setValue(IMAGE_QUEUE_KEY, '');
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

    private static normalizeFetchUrl(url: string): string {
        let target = ImageHostService.getFullSizeUrl(url);
        if (target.match(/t\.hdbits\.org/i)) {
            target = target.replace('t.hdbits.org', 'i.hdbits.org').replace(/\.jpg(\?|$)/i, '.png$1');
        }
        return target;
    }

    private static guessMime(name: string) {
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
        // png
        if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return true;
        // jpg
        if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return true;
        // gif
        if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return true;
        // webp: RIFF....WEBP
        if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
            bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return true;
        return false;
    }

    private static async fetchAsBlob(url: string, fallbackFilename: string): Promise<Blob> {
        const guessed = this.guessMime(fallbackFilename);

        // Prefer arraybuffer first (prevents corruption on some managers/browsers).
        try {
            const headers: Record<string, string> = {};
            if (url.includes('images2.imgbox.com')) headers.Referer = 'https://imgbox.com/';
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer',
                headers,
                // Some managers require explicit flags for cross-site binary requests.
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

        // Retry with credentials in case the host requires cookies (rare, but some managers behave differently).
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

        // Fallback: legacy binary-string download
        const resp = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        });

        // Tampermonkey/Safari variants: sometimes response is Blob/ArrayBuffer; sometimes responseText is binary string.

        if (resp?.response instanceof Blob) {
            const b: Blob = resp.response;
            return b.type ? b : new Blob([b], { type: guessed });
        }
        if (resp?.response && (resp.response as any).byteLength !== undefined) {
            const u8 = new Uint8Array(resp.response as ArrayBuffer);
            if (!this.looksLikeImageBytes(u8)) {
                // One last try with arraybuffer (some managers ignore overrideMimeType and return html)
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
            // Fallback: try arraybuffer when responseText is empty (some environments ignore overrideMimeType)
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
            // Likely got HTML or an error page
            const abResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer'
            });
            if (abResp?.response) return new Blob([abResp.response], { type: guessed });
        }
        // TS lib types sometimes treat Uint8Array.buffer as ArrayBufferLike; materialize a real ArrayBuffer.
        const ab = new ArrayBuffer(bytes.byteLength);
        new Uint8Array(ab).set(bytes);
        return new Blob([ab], { type: guessed });
    }

    private static async buildFiles(urls: string[]): Promise<File[]> {
        const tasks = urls.map(async (raw, index) => {
            const url = this.normalizeFetchUrl(raw);
            const filename = decodeURIComponent(url.split('/').pop() || `image-${index}.jpg`).split('?')[0];
            // Legacy: only pull obvious image formats; skip unknown urls.
            if (!filename.match(/\.(png|jpe?g|gif|webp)$/i)) {
                return new File([new Blob([], { type: this.guessMime(filename) })], filename || `image-${index}.jpg`, { type: this.guessMime(filename) });
            }
            const blob = await this.fetchAsBlob(url, filename || `image-${index}.jpg`);
            if (!blob || (blob as any).size === 0) {
                throw new Error(`Image download returned empty blob: ${url}`);
            }
            const type = (blob && (blob as any).type) ? (blob as any).type : this.guessMime(filename);
            return new File([blob], filename || `image-${index}.jpg`, { type });
        });
        return Promise.all(tasks);
    }

    private static async waitForFileInput(): Promise<JQuery<HTMLInputElement>> {
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
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return $('input[name="files[]"]').first() as JQuery<HTMLInputElement>;
    }
}
