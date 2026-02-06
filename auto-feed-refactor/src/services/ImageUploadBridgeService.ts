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

    static async prepareAndOpen(meta: TorrentMeta, host: 'hdbits' | 'imgbox' | 'pixhost' | 'hdbimg') {
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
        else window.open('https://img.hdbits.org/', '_blank');
    }

    static async tryInject() {
        if (document.body.dataset.autofeedImageHost === '1') return;

        const url = window.location.href;
        if (!url.match(/https?:\/\/(www\.)?(imgbox\.com|imagebam\.co|pixhost\.to|img\.hdbits\.org|hdbimg\.com)/i)) {
            return;
        }
        const host = window.location.host.toLowerCase();

        const queue = await this.loadQueue();
        if (!queue || !queue.urls.length) return;

        const $fileInput = await this.waitForFileInput();
        if (!$fileInput.length) return;

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

        const insertTarget = $fileInput.closest('form').length ? $fileInput.closest('form') : $fileInput.parent();
        insertTarget.prepend(button);

        button.addEventListener('click', async () => {
            button.textContent = '拉取中...';
            button.setAttribute('disabled', 'true');
            try {
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

    private static async fetchAsBlob(url: string, fallbackFilename: string): Promise<Blob> {
        const resp = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            // Legacy-compatible binary download (works better than responseType:'blob' on some environments)
            overrideMimeType: 'text/plain; charset=x-user-defined'
        });

        // Tampermonkey/Safari variants: sometimes response is Blob/ArrayBuffer; sometimes responseText is binary string.
        const guessed = this.guessMime(fallbackFilename);

        if (resp?.response instanceof Blob) {
            const b: Blob = resp.response;
            return b.type ? b : new Blob([b], { type: guessed });
        }
        if (resp?.response && (resp.response as any).byteLength !== undefined) {
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
            const type = (blob && (blob as any).type) ? (blob as any).type : this.guessMime(filename);
            return new File([blob], filename || `image-${index}.jpg`, { type });
        });
        return Promise.all(tasks);
    }

    private static async waitForFileInput(): Promise<JQuery<HTMLInputElement>> {
        for (let i = 0; i < 20; i++) {
            const $fileInput =
                $('input[name="files[]"]').first()
                    .add($('input[type="file"]').first())
                    .add($('input.dz-hidden-input').first())
                    .filter((_, el) => el instanceof HTMLInputElement)
                    .first();
            if ($fileInput.length) return $fileInput as JQuery<HTMLInputElement>;
            // eslint-disable-next-line no-await-in-loop
            await new Promise((resolve) => setTimeout(resolve, 500));
        }
        return $('input[name="files[]"]').first() as JQuery<HTMLInputElement>;
    }
}
