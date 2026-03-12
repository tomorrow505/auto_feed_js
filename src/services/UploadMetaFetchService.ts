import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { SettingsService } from './SettingsService';
import { PtgenService, PtgenApplyFlags } from './PtgenService';
import { GMAdapter } from './GMAdapter';
import { StorageService } from './StorageService';
import { TorrentService } from './TorrentService';
import { TorrentMeta } from '../types/TorrentMeta';
import { isChineseNexusSite } from './SiteCatalogService';
import { extractDoubanId, extractImdbId, matchLink } from '../common/rules/links';

export class UploadMetaFetchService {
    static async tryInject(adapter: BaseEngine) {
        if (document.body.dataset.autofeedUploadFetch === '1') return;
        if (!isChineseNexusSite(adapter.siteName)) return;

        const $descr = $('textarea[name="descr"], textarea[name="description"], #descr, #description').first();
        if (!$descr.length) return;

        const bar = $(`
            <div id="autofeed-upload-fetch" style="margin: 6px 0; display: inline-flex; gap: 8px; align-items: center;">
                <button style="background: #2c3e50; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">点击获取</button>
                <span style="font-size: 12px; color: #666;">(外站豆瓣/ptgen)</span>
            </div>
        `);

        // Apply options (legacy parity: users often want "只填空/不要插入简介/只要地区" etc.)
        const optWrap = $(`
            <span style="display:inline-flex; gap:8px; align-items:center; margin-left: 6px; font-size: 12px; color: #444;">
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="mergeDescription" checked />简介
                </label>
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="updateSubtitle" checked />副标题
                </label>
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="updateRegion" checked />地区
                </label>
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="updateIds" checked />ID
                </label>
            </span>
        `);
        bar.append(optWrap);

        const btn = bar.find('button');
        btn.on('click', async () => {
            btn.text('获取中...');
            btn.prop('disabled', true);
            try {
                const settings = await SettingsService.load();
                const base = ({
                    title: '',
                    description: '',
                    sourceSite: adapter.siteName,
                    sourceUrl: window.location.href,
                    images: []
                } as TorrentMeta);

                const merged = this.applyInputs(base);
                const flags: PtgenApplyFlags = {};
                try {
                    optWrap.find('input[type="checkbox"]').each((_i, el) => {
                        const key = (el as HTMLInputElement).dataset.k as keyof PtgenApplyFlags | undefined;
                        if (!key) return;
                        (flags as any)[key] = (el as HTMLInputElement).checked;
                    });
                } catch {}

                const updated = await PtgenService.applyPtgen(merged, {
                    imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                    ptgenApi: settings.ptgenApi ?? 3,
                    doubanCookie: settings.doubanCookie || undefined
                }, flags);
                const changed =
                    (updated.description || '') !== (merged.description || '') ||
                    (updated.subtitle || '') !== (merged.subtitle || '') ||
                    (updated.sourceSel || '') !== (merged.sourceSel || '') ||
                    (updated.doubanId || '') !== (merged.doubanId || '') ||
                    (updated.imdbId || '') !== (merged.imdbId || '');
                if (!changed) {
                    throw new Error('No external meta fetched (missing IDs/blocked provider)');
                }
                await StorageService.save(updated);
                const { normalizeMeta } = await import('../common/rules/normalize');
                const normalized = normalizeMeta(updated, adapter.siteName);
                await adapter.fill(normalized);
                btn.text('已更新');
            } catch (err) {
                console.error('[Auto-Feed] Upload fetch error:', err);
                btn.text('未获取到');
            } finally {
                setTimeout(() => {
                    btn.prop('disabled', false);
                    btn.text('点击获取');
                }, 1500);
            }
        });

        $descr.before(bar);
        document.body.dataset.autofeedUploadFetch = '1';
    }

    private static applyInputs(meta: TorrentMeta): TorrentMeta {
        const next = { ...meta };
        const rawInputs = Array.from(document.querySelectorAll('input')) as HTMLInputElement[];
        const rawTextareas = Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];
        const currentDescr =
            (document.querySelector('textarea[name="descr"]') as HTMLTextAreaElement | null)?.value ||
            (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null)?.value ||
            (document.getElementById('descr') as HTMLTextAreaElement | null)?.value ||
            (document.getElementById('description') as HTMLTextAreaElement | null)?.value ||
            '';
        const values = [
            ...rawInputs.map((input) => input.value || ''),
            // Legacy parity: users often paste IMDb/Douban links into the description textarea.
            ...rawTextareas.map((ta) => ta.value || '')
        ].filter(Boolean);

        if (currentDescr.trim()) {
            next.description = currentDescr;
        }

        const imdbLink = values.map((v) => matchLink('imdb', v)).find(Boolean) || '';
        const doubanLink = values.map((v) => matchLink('douban', v)).find(Boolean) || '';
        const imdbId = values.map((v) => extractImdbId(v)).find(Boolean) || '';
        const doubanId = values.map((v) => extractDoubanId(v)).find(Boolean) || '';

        if (imdbLink) {
            next.imdbUrl = imdbLink;
            next.imdbId = extractImdbId(imdbLink) || next.imdbId;
        } else if (imdbId) {
            next.imdbId = next.imdbId || imdbId;
            if (next.imdbId) next.imdbUrl = next.imdbUrl || `https://www.imdb.com/title/${next.imdbId}/`;
        }

        if (doubanLink) {
            next.doubanUrl = doubanLink;
            next.doubanId = extractDoubanId(doubanLink) || next.doubanId;
        } else if (doubanId) {
            next.doubanId = next.doubanId || doubanId;
            if (next.doubanId) next.doubanUrl = next.doubanUrl || `https://movie.douban.com/subject/${next.doubanId}/`;
        }

        return next;
    }
}

type PendingAutoDownload = {
    siteName: string;
    host: string;
    createdAt: number;
    title?: string;
    tries?: number;
    lastTriedAt?: number;
};

export class AutoDownloadAfterUploadService {
    private static KEY = 'autofeed_pending_auto_download';
    private static TTL_MS = 30 * 60 * 1000;
    private static MAX_TRIES = 5;

    static async hookUploadForm(adapter: BaseEngine, meta?: Partial<TorrentMeta>) {
        const settings = await SettingsService.load();
        if (!settings.autoDownloadAfterUpload) return;

        const form = this.findLikelyUploadForm();
        if (!form) return;

        const anyForm = form as any;
        if (anyForm.__autofeedAutoDownloadHooked) return;
        anyForm.__autofeedAutoDownloadHooked = true;

        form.addEventListener(
            'submit',
            () => {
                const pending: PendingAutoDownload = {
                    siteName: adapter.siteName,
                    host: window.location.host,
                    createdAt: Date.now(),
                    title: meta?.title || ''
                };
                GMAdapter.setValue(this.KEY, JSON.stringify(pending)).catch(() => {});
            },
            true
        );
    }

    static async tryAutoDownload(adapter: BaseEngine, isUploadLikePage: boolean) {
        const settings = await SettingsService.load();
        if (!settings.autoDownloadAfterUpload) return;
        if (isUploadLikePage) return;

        const raw = await GMAdapter.getValue<string | null>(this.KEY, null);
        if (!raw) return;

        let pending: PendingAutoDownload | null = null;
        try {
            pending = JSON.parse(raw) as PendingAutoDownload;
        } catch {
            await GMAdapter.deleteValue(this.KEY);
            return;
        }

        if (!pending || pending.siteName !== adapter.siteName) return;

        const now = Date.now();
        if (!pending.createdAt || now - pending.createdAt > this.TTL_MS) {
            await GMAdapter.deleteValue(this.KEY);
            return;
        }

        if (pending.host && pending.host !== window.location.host) {
            // Same "siteName" but different host; ignore without deleting.
            return;
        }

        const tries = Number(pending.tries || 0);
        if (tries >= this.MAX_TRIES) {
            await GMAdapter.deleteValue(this.KEY);
            return;
        }

        // Avoid tight retry loops on SPA navigations.
        const last = Number(pending.lastTriedAt || 0);
        if (last && now - last < 5_000) return;

        const downloadUrl = this.findTorrentDownloadUrl();
        if (!downloadUrl) {
            pending.tries = tries + 1;
            pending.lastTriedAt = now;
            await GMAdapter.setValue(this.KEY, JSON.stringify(pending));
            return;
        }

        pending.lastTriedAt = now;
        await GMAdapter.setValue(this.KEY, JSON.stringify(pending));

        const safe = TorrentService.normalizeTorrentName(pending.title || document.title || adapter.siteName) || 'autofeed';
        const filename = safe.endsWith('.torrent') ? safe : `${safe}.torrent`;

        try {
            await this.downloadTorrent(downloadUrl, filename);
            await GMAdapter.deleteValue(this.KEY);
            this.toast('已自动下载种子', 'ok');
        } catch (e) {
            pending.tries = tries + 1;
            pending.lastTriedAt = now;
            await GMAdapter.setValue(this.KEY, JSON.stringify(pending));
            this.toast('自动下载失败（稍后可刷新重试）', 'err');
        }
    }

    private static findLikelyUploadForm(): HTMLFormElement | null {
        // Prefer forms containing a file input; this is robust across Nexus/Unit3D/Gazelle.
        const forms = Array.from(document.querySelectorAll('form')) as HTMLFormElement[];
        const hasFile = (f: HTMLFormElement) => !!f.querySelector('input[type="file"]');
        const uploadish = (f: HTMLFormElement) => {
            const action = (f.getAttribute('action') || '').toLowerCase();
            return action.includes('upload') || action.includes('takeupload') || action.includes('torrents');
        };
        return forms.find((f) => hasFile(f) && uploadish(f)) || forms.find((f) => hasFile(f)) || null;
    }

    private static findTorrentDownloadUrl(): string | null {
        const anchors = Array.from(document.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        const candidates = anchors
            .map((a) => {
                const href = a.getAttribute('href') || '';
                if (!href) return null;
                const text = (a.textContent || '').trim();
                const cls = (a.getAttribute('class') || '').toLowerCase();
                let score = 0;
                if (/download\.php/i.test(href)) score += 4;
                if (/download\.php\?.*id=\d+/i.test(href)) score += 5;
                if (/torrents\/download/i.test(href)) score += 6;
                if (/\/download\/\d+/i.test(href)) score += 3;
                if (/\.torrent(\?|$)/i.test(href)) score += 4;
                if (/download|下载|种子/i.test(text)) score += 2;
                if (cls.includes('download')) score += 1;
                if ((a as any).download) score += 1;
                return { a, href, score };
            })
            .filter(Boolean) as { a: HTMLAnchorElement; href: string; score: number }[];

        if (!candidates.length) return null;
        candidates.sort((x, y) => y.score - x.score);
        const best = candidates[0];

        try {
            return new URL(best.href, window.location.href).href;
        } catch {
            return best.href;
        }
    }

    private static async downloadTorrent(url: string, filename: string): Promise<void> {
        // Prefer GM_download when available (better download UX).
        if (typeof (globalThis as any).GM_download === 'function') {
            await new Promise<void>((resolve, reject) => {
                try {
                    (globalThis as any).GM_download({
                        url,
                        name: filename,
                        onload: () => resolve(),
                        onerror: (e: any) => reject(e || new Error('GM_download failed')),
                        ontimeout: () => reject(new Error('GM_download timeout'))
                    });
                } catch (e) {
                    reject(e);
                }
            });
            return;
        }

        // Fallback: fetch as blob and trigger a download.
        const res = await GMAdapter.xmlHttpRequest({ method: 'GET', url, responseType: 'blob' });
        const blob = res.response as Blob;
        if (!blob) throw new Error('Empty torrent blob');

        const objUrl = URL.createObjectURL(blob);
        try {
            const a = document.createElement('a');
            a.href = objUrl;
            a.download = filename;
            a.style.display = 'none';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } finally {
            URL.revokeObjectURL(objUrl);
        }
    }

    private static toast(text: string, kind: 'ok' | 'err' | 'info' = 'info') {
        const colors: Record<string, string> = {
            ok: '#2ecc71',
            err: '#e74c3c',
            info: '#3498db'
        };
        const div = document.createElement('div');
        div.textContent = text;
        div.style.cssText = [
            'position:fixed',
            'bottom:16px',
            'left:50%',
            'transform:translateX(-50%)',
            'z-index:99999',
            'padding:8px 10px',
            `background:${colors[kind] || colors.info}`,
            'color:#fff',
            'border-radius:8px',
            'font-size:12px',
            'box-shadow:0 8px 22px rgba(0,0,0,0.22)',
            'max-width:calc(100vw - 20px)'
        ].join(';');
        document.body.appendChild(div);
        setTimeout(() => div.remove(), 2200);
    }
}
