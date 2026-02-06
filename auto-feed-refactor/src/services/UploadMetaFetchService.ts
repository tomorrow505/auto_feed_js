import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { SettingsService } from './SettingsService';
import { PtgenService } from './PtgenService';
import { StorageService } from './StorageService';
import { TorrentMeta } from '../types/TorrentMeta';

export class UploadMetaFetchService {
    static async tryInject(adapter: BaseEngine) {
        if (document.body.dataset.autofeedUploadFetch === '1') return;

        const $descr = $('textarea[name="descr"], textarea[name="description"], #descr, #description').first();
        if (!$descr.length) return;

        const bar = $(`
            <div id="autofeed-upload-fetch" style="margin: 6px 0; display: inline-flex; gap: 8px; align-items: center;">
                <button style="background: #2c3e50; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">点击获取</button>
                <span style="font-size: 12px; color: #666;">(外站豆瓣/ptgen)</span>
            </div>
        `);

        const btn = bar.find('button');
        btn.on('click', async () => {
            btn.text('获取中...');
            btn.prop('disabled', true);
            try {
                const settings = await SettingsService.load();
                const base = (await StorageService.load()) || ({
                    title: '',
                    description: '',
                    sourceSite: adapter.siteName,
                    sourceUrl: window.location.href,
                    images: []
                } as TorrentMeta);

                const merged = this.applyInputs(base);
                const updated = await PtgenService.applyPtgen(merged, {
                    imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                    ptgenApi: settings.ptgenApi ?? 3
                });
                await StorageService.save(updated);
                const { normalizeMeta } = await import('../common/legacy/normalize');
                const normalized = normalizeMeta(updated, adapter.siteName);
                await adapter.fill(normalized);
                btn.text('已更新');
            } catch (err) {
                console.error('[Auto-Feed] Upload fetch error:', err);
                btn.text('获取失败');
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
        const values = rawInputs
            .map((input) => input.value || '')
            .filter(Boolean);

        const pick = (pattern: RegExp) => values.find((v) => pattern.test(v)) || '';
        const imdbLink = pick(/imdb\.com\/title\/tt\d+/i);
        const imdbId = pick(/tt\d{6,}/i);
        const doubanLink = pick(/douban\.com\/subject\/\d+/i);
        const doubanId = pick(/subject\/(\d{5,})/i).match(/subject\/(\d{5,})/i)?.[1] || '';

        if (imdbLink) {
            next.imdbUrl = imdbLink;
            next.imdbId = imdbLink.match(/tt\d+/)?.[0] || next.imdbId;
        } else if (imdbId) {
            next.imdbId = next.imdbId || imdbId.match(/tt\d+/)?.[0];
            if (next.imdbId) next.imdbUrl = next.imdbUrl || `https://www.imdb.com/title/${next.imdbId}/`;
        }

        if (doubanLink) {
            next.doubanUrl = doubanLink;
            next.doubanId = doubanLink.match(/subject\/(\d+)/)?.[1] || next.doubanId;
        } else if (doubanId) {
            next.doubanId = next.doubanId || doubanId;
            if (next.doubanId) next.doubanUrl = next.doubanUrl || `https://movie.douban.com/subject/${next.doubanId}/`;
        }

        return next;
    }
}
