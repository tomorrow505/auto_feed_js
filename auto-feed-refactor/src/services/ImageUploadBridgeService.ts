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

    static async prepareAndOpen(meta: TorrentMeta, host: 'hdbimg' | 'imgbox') {
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

        if (host === 'imgbox') {
            window.open('https://imgbox.com/', '_blank');
        } else {
            window.open('https://hdbimg.com/', '_blank');
        }
    }

    static async tryInject() {
        if (document.body.dataset.autofeedImageHost === '1') return;

        const url = window.location.href;
        if (!url.match(/https?:\/\/(www\.)?(imgbox\.com|imagebam\.co|pixhost\.to|img\.hdbits\.org|hdbimg\.com)/i)) {
            return;
        }

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

    private static async buildFiles(urls: string[]): Promise<File[]> {
        const tasks = urls.map(async (raw, index) => {
            const url = this.normalizeFetchUrl(raw);
            const filename = decodeURIComponent(url.split('/').pop() || `image-${index}.jpg`).split('?')[0];
            const resp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'blob'
            });
            const blob: Blob = resp.response;
            const type = blob?.type || this.guessMime(filename);
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
