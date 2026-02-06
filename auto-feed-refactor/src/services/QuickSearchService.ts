import $ from 'jquery';
import { SettingsService } from './SettingsService';
import { SiteCatalogService } from './SiteCatalogService';
import { ForwardLinkService } from './ForwardLinkService';
import { TorrentMeta } from '../types/TorrentMeta';
import { ImageHostService } from './ImageHostService';
import { GMAdapter } from './GMAdapter';
import { buildQuickSearchItems, DEFAULT_QUICK_SEARCH_TEMPLATES } from './QuickSearchTemplateService';

export class QuickSearchService {
    static async tryInject() {
        const url = window.location.href;
        const settings = await SettingsService.load();

        if (url.match(/^https?:\/\/movie\.douban\.com\/subject\/\d+/i) && settings.showQuickSearchOnDouban) {
            this.injectDoubanTools();
        }

        if (url.match(/^https?:\/\/www\.imdb\.com\/title\/tt\d+/i) && settings.showQuickSearchOnImdb) {
            this.injectImdbTools();
        }
    }

    private static buildSearchLinks(container: JQuery, meta: Partial<TorrentMeta>) {
        if (container.find('.autofeed-search-links').length) return;

        const settings = SettingsService.load();
        settings.then((s) => {
            const row = $('<div class="autofeed-search-links" style="margin-top: 6px; font-size: 12px;"></div>');
            row.append('<span style="color:#666; font-weight:bold; margin-right:4px;">快速搜索:</span>');
            const makeLink = (name: string, url: string) =>
                $(
                    `<a href="${url}" target="_blank" style="display:inline-block; margin-right:6px; margin-bottom:4px; padding:2px 6px; background:#2c3e50; color:#fff; border:1px solid #1a252f; border-radius:4px; text-decoration:none;">${name}</a>`
                );

            if (Array.isArray(s.quickSearchList)) {
                const items = buildQuickSearchItems(s.quickSearchList, meta);
                if (!items.length) return;
                items.forEach((item) => {
                    row.append(makeLink(item.name, item.url));
                });
            } else {
                const items = buildQuickSearchItems(DEFAULT_QUICK_SEARCH_TEMPLATES, meta);
                if (items.length) {
                    items.forEach((item) => {
                        row.append(makeLink(item.name, item.url));
                    });
                } else {
                    const allSites = SiteCatalogService.getAllSites().filter((site) => site.baseUrl);
                    const enabled = s.enabledSites && s.enabledSites.length ? new Set(s.enabledSites) : null;
                    const sites = enabled ? allSites.filter((site) => enabled.has(site.name)) : allSites;
                    if (!sites.length) return;
                    sites.forEach((site) => {
                        const url = ForwardLinkService.getSearchUrl(
                            site,
                            {
                                title: meta.title || '',
                                imdbId: meta.imdbId || ''
                            } as TorrentMeta,
                            { chdBaseUrl: s.chdBaseUrl }
                        );
                        row.append(makeLink(site.name, url));
                    });
                }
            }

            container.append(row);
        });
    }

    private static injectDoubanTools() {
        if (document.body.dataset.autofeedDouban === '1') return;
        const $info = $('#info');
        const $title = $('h1').first();
        if (!$info.length) return;

        const imdbId = ($info.html() || '').match(/tt\d+/i)?.[0] || '';
        const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : '';

        if (imdbId && !$info.find('a[href*="imdb.com/title"]').length) {
            const imdbSpan = $info.find("span.pl:contains('IMDb')");
            if (imdbSpan.length) {
                try {
                    const el = imdbSpan.get(0) as HTMLElement | undefined;
                    if (el && el.nextSibling) {
                        (el.nextSibling as Text).textContent = '';
                    }
                    imdbSpan.after(`<a href="${imdbUrl}" target="_blank"> ${imdbId}</a>`);
                } catch {}
            }
        }

        const posterImg = $('#mainpic img').first().attr('src') || '';
        const poster = posterImg.replace(/^.+(p\d+).+$/, (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`);

        $('#mainpic').append(`<br><a href="#" id="autofeed-rehost-poster">海报转存</a>`);
        $('#autofeed-rehost-poster').on('click', async (e) => {
            e.preventDefault();
            if (!poster) return;
            const settings = await SettingsService.load();
            try {
                let result: string[] = [];
                if (settings.ptpImgApiKey) {
                    result = await ImageHostService.uploadToPtpImg([poster], settings.ptpImgApiKey);
                } else if (settings.pixhostApiKey || !settings.freeimageApiKey) {
                    result = await ImageHostService.uploadToPixhost([poster]);
                } else if (settings.freeimageApiKey) {
                    result = await ImageHostService.uploadToFreeimage([poster], settings.freeimageApiKey);
                } else if (settings.gifyuApiKey) {
                    result = await ImageHostService.uploadToGifyu([poster], settings.gifyuApiKey);
                }
                if (result.length) {
                    await GMAdapter.setClipboard(result[0]);
                    alert('海报已转存并复制到剪贴板');
                }
            } catch (err) {
                console.error(err);
                alert('海报转存失败');
            }
        });

        const searchName =
            ($title.text().trim().match(/[a-z ]{2,200}/i)?.[0] || $title.text().trim()).replace(/season/i, '');

        this.buildSearchLinks($title, { title: searchName, imdbId });
        document.body.dataset.autofeedDouban = '1';
    }

    private static injectImdbTools() {
        if (document.body.dataset.autofeedImdb === '1') return;
        const imdbId = window.location.href.match(/tt\d+/i)?.[0] || '';
        const searchName = $('title')
            .text()
            .trim()
            .split(/ \(\d+\) - /)[0]
            .replace(/season/i, '');

        const $container = $('h1[data-testid*=pageTitle]').first();
        if ($container.length) {
            this.buildSearchLinks($container, { title: searchName, imdbId });
        }
        document.body.dataset.autofeedImdb = '1';
    }
}
