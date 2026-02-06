import $ from 'jquery';
import { SettingsService } from './SettingsService';
import { ForwardLinkOptions } from './ForwardLinkService';
import { getSearchName } from '../common/legacy/search';
import { TorrentMeta } from '../types/TorrentMeta';
import { buildQuickSearchItems, DEFAULT_QUICK_SEARCH_TEMPLATES } from './QuickSearchTemplateService';

export class ListSearchService {
    static async tryInject() {
        const url = window.location.href;
        const settings = await SettingsService.load();
        const enabledSites = settings.enabledSites || [];
        const quickSearchList = Array.isArray(settings.quickSearchList) ? settings.quickSearchList : undefined;
        const linkOptions: ForwardLinkOptions = {
            chdBaseUrl: settings.chdBaseUrl
        };

        if (url.match(/^https:\/\/hdbits\.org\/browse/i) && settings.showSearchOnList?.HDB) {
            $('#torrent-list').find('tr').each((_, row) => {
                const html = $(row).html() || '';
                const imdbId = html.match(/https:\/\/www\.imdb\.com\/title\/(tt\d+)/i)?.[1];
                if (!imdbId) return;
                const name = $(row).find('td:eq(2)').find('a').first().text().trim();
                const $container = $(row).find('td:eq(2)');
                this.injectSearchLinks($container, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
        }

        if (url.match(/^https:\/\/passthepopcorn\.me\/torrents\.php/i) && settings.showSearchOnList?.PTP) {
            $('tbody tr.basic-movie-list__details-row').each((_, row) => {
                const html = $(row).html() || '';
                const imdbId = html.match(/https?:\/\/www\.imdb\.com\/title\/(tt\d+)/i)?.[1];
                if (!imdbId) return;
                const $container = $(row).find('td:eq(1)');
                const name = $container.find('span.basic-movie-list__movie__title-row:eq(0)').find('a').first().text().trim();
                this.injectSearchLinks($container, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
        }

        if (url.match(/^https:\/\/uhdbits\.org\/torrents\.php/i) && settings.showSearchOnList?.UHD) {
            $('#torrent_table td.big_info').each((_, cell) => {
                const html = $(cell).html() || '';
                const imdbId = html.match(/http:\/\/www\.imdb\.com\/title\/(tt\d+)/i)?.[1];
                if (!imdbId) return;
                const $container = $(cell).find('div:eq(0)');
                const name = $container.find('a').first().text().trim();
                this.injectSearchLinks($container, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
        }

        if (url.match(/^https:\/\/hd-torrents\.org\/torrents/i) && settings.showSearchOnList?.HDT) {
            $('.mainblockcontenttt tr').each((_, row) => {
                const $td = $(row).find('td:eq(2)');
                const name = $td.find('a').first().text().trim();
                if (!name) return;
                const imdbId = ($td.html() || '').match(/imdb\.com\/title\/(tt\d+)/i)?.[1];
                if (!imdbId) return;
                this.injectSearchLinks($td, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });

            $('.hdblock:eq(1) tr').each((_, row) => {
                const $td = $(row).find('td:eq(1)');
                const name = $td.find('a').first().text().trim();
                if (!name) return;
                const imdbId = ($td.html() || '').match(/imdb\.com\/title\/(tt\d+)/i)?.[1];
                if (!imdbId) return;
                this.injectSearchLinks($td, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
        }
    }

    private static injectSearchLinks(
        container: JQuery,
        meta: Partial<TorrentMeta>,
        enabledSites: string[],
        linkOptions?: ForwardLinkOptions,
        quickSearchList?: string[]
    ) {
        if (!container.length) return;
        if (container.find('.autofeed-search-links').length) return;

        const imdbId = meta.imdbId || '';
        const searchNameRaw = getSearchName(meta.title || '', meta.type);
        let searchName = searchNameRaw || meta.title || '';
        if ((meta.title || '').match(/S\d+/i)) {
            const number = (meta.title || '').match(/S(\d+)/i)?.[1];
            if (number) searchName = `${searchName} Season ${parseInt(number, 10)}`;
        }

        const list = Array.isArray(quickSearchList) ? quickSearchList : DEFAULT_QUICK_SEARCH_TEMPLATES;
        const items = buildQuickSearchItems(list, {
            title: searchName,
            imdbId
        });
        if (!items.length) return;

        const row = $('<div class="autofeed-search-links" style="margin-top: 4px; font-size: 12px;"></div>');
        row.append('<span style="color:#666; font-weight:bold; margin-right:4px;">快速搜索:</span>');
        items.forEach((item) => {
            const link = $(
                `<a href="${item.url}" target="_blank" style="display:inline-block; margin-right:6px; margin-bottom:4px; padding:2px 6px; background:#2c3e50; color:#fff; border:1px solid #1a252f; border-radius:4px; text-decoration:none;">${item.name}</a>`
            );
            row.append(link);
        });

        container.append(row);
    }
}
