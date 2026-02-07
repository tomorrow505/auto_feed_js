import $ from 'jquery';
import { Unit3DEngine } from './unit3d';
import { TorrentMeta } from '../types/TorrentMeta';
import { getType } from '../common/legacy/text';
import { matchLink } from '../common/legacy/links';
import { SettingsService } from '../services/SettingsService';
import { GMAdapter } from '../services/GMAdapter';

export class Unit3DClassicEngine extends Unit3DEngine {
    async parse(): Promise<TorrentMeta> {
        this.log('Parsing Unit3D Classic page...');

        const meta = await super.parse();

        const title = $('h1.torrent__name, h1').first().text().trim();
        if (title) meta.title = title;

        const isHone = $('#meta-info').length > 0;
        // HONE special layout
        if (isHone) {
            try {
                const imdbUrl = matchLink('imdb', $('#meta-info').html() || document.body.innerHTML);
                if (imdbUrl) {
                    meta.imdbUrl = imdbUrl;
                    meta.imdbId = imdbUrl.match(/tt\d+/)?.[0];
                }
            } catch {}
            const typeText = $('.torrent-category').text().trim();
            if (typeText) meta.type = getType(typeText);
            const honeName = $('span.torrent-category.badge-extra:first').text().trim();
            if (honeName) meta.title = honeName.replace(/\(|\)/g, '').replace(/English-/, '-');

            const mi = $('.torrent-mediainfo-dump pre').text().trim();
            let imgUrls = '';
            $('.torrent-description').find('a').has('img').each((_, a) => {
                const link = (a as HTMLAnchorElement).href;
                const img = (a as HTMLAnchorElement).querySelector('img') as HTMLImageElement | null;
                const src = img?.getAttribute('src') || img?.getAttribute('data-src') || img?.src || '';
                if (!src) return;
                imgUrls += `[url=${link}][img]${src}[/img][/url]`;
                meta.images.push(src);
            });
            if (mi || imgUrls) {
                meta.description = `${mi ? `[quote]${mi}\n[/quote]\n\n` : ''}${imgUrls}`.trim();
            }
            const honeTorrent = $('.button-block').find('a[href*="torrents/download"]').attr('href') || '';
            if (honeTorrent) {
                try {
                    meta.torrentUrl = new URL(honeTorrent, this.currentUrl).href;
                } catch {
                    meta.torrentUrl = honeTorrent;
                }
            }
        }

        if (!isHone) {
            const typeText = $('li.torrent__category').text().trim();
            if (typeText) meta.type = getType(typeText);

            const tagText = $('.torrent__tags').text().trim();
            if (tagText && !meta.type) {
                meta.type = getType(tagText);
            }
        }

        let mediainfo = '';
        try {
            mediainfo = $('code[x-ref="mediainfo"]').text().trim();
            if (!mediainfo) {
                mediainfo = $('code[x-ref="bdinfo"]').text().trim();
            }
        } catch {}

        let imgUrls = '';
        try {
            const descPanel = $('h2.panel__heading:contains("Description"), h2.panel__heading:contains("描述")')
                .parent()
                .next();
            descPanel.find('img').each((_, img) => {
                const el = img as HTMLImageElement;
                const parent = el.parentElement as HTMLAnchorElement | null;
                const href = parent?.href;
                const src = el.getAttribute('data-src') || el.getAttribute('src') || el.src || '';
                if (!src) return;
                if (href) {
                    imgUrls += `[url=${href}][img]${src}[/img][/url] `;
                } else {
                    imgUrls += `[img]${src}[/img] `;
                }
                meta.images.push(src);
            });
        } catch {}

        if (!meta.description && (mediainfo || imgUrls)) {
            meta.description = `${mediainfo ? `[quote]\n${mediainfo}\n[/quote]\n\n` : ''}${imgUrls}`.trim();
            meta.description = meta.description.replace(/https:\/\/wsrv\.nl\/\?n=-1&url=/g, '');
        }

        // ACM / Monika / DTR / HDOli tables
        const detailTables = $('.table-responsive table, .shoutbox table');
        if (!isHone && detailTables.length) {
            const table = detailTables.first();
            const tds = table.find('td').toArray();
            for (let i = 0; i < tds.length; i++) {
                const key = (tds[i].textContent || '').trim();
                const nextText = (tds[i + 1]?.textContent || '').replace(/ *\n.*/gm, '').trim();
                if (!key) continue;
                if (['副标题', 'Subtitle', 'Sub Title', 'Sub-title'].includes(key) && nextText) {
                    meta.smallDescr = nextText;
                    if (!meta.subtitle) meta.subtitle = nextText;
                }
                if (['Name', 'Nombre', '名称', '标题'].includes(key) && nextText) {
                    meta.title = nextText;
                }
                if (['Category', '类别', 'Categoría'].includes(key) && nextText) {
                    if (nextText.match(/Movie|电影|Películas/i)) meta.type = '电影';
                    if (nextText.match(/(TV-Show|TV|剧集|Series)/i)) meta.type = '剧集';
                    if (nextText.match(/Anime (TV|Movie)/i)) meta.type = '动漫';
                    if (nextText.match(/(Docu|纪录|Documentary)/i)) meta.type = '纪录';
                }
                if (['Type', 'Tipo', '规格'].includes(key) && nextText) {
                    if (nextText.match(/BD 50/i)) meta.mediumSel = 'Blu-ray';
                    else if (nextText.match(/Remux/i)) meta.mediumSel = 'Remux';
                    else if (nextText.match(/encode/i)) meta.mediumSel = 'Encode';
                    else if (nextText.match(/web-?dl/i)) meta.mediumSel = 'WEB-DL';
                }
            }
        }

        // IMDB from movie-details blocks
        try {
            const imdbBox = $('.movie-details, .movie__details').first();
            if (imdbBox.length) {
                const imdbUrl = matchLink('imdb', imdbBox.parent().html() || imdbBox.html() || '');
                if (imdbUrl) {
                    meta.imdbUrl = imdbUrl;
                    meta.imdbId = imdbUrl.match(/tt\d+/)?.[0];
                } else {
                    const tmdbUrl = matchLink('tmdb', imdbBox.parent().html() || imdbBox.html() || '');
                    if (tmdbUrl) {
                        meta.tmdbUrl = tmdbUrl;
                        const settings = await SettingsService.load();
                        if (settings.tmdbApiKey) {
                            const api = `https://api.themoviedb.org/3/${tmdbUrl.match(/(tv|movie)\/\d+/)?.[0]}/external_ids?api_key=${settings.tmdbApiKey}`;
                            await new Promise<void>((resolve) => {
                                GMAdapter.xmlHttpRequest({
                                    method: 'GET',
                                    url: api,
                                    onload: (resp: any) => {
                                        try {
                                            const data = JSON.parse(resp.responseText || '{}');
                                            if (data.imdb_id) {
                                                meta.imdbUrl = `https://www.imdb.com/title/${data.imdb_id}/`;
                                                meta.imdbId = data.imdb_id;
                                            }
                                        } catch {}
                                        resolve();
                                    },
                                    onerror: () => resolve()
                                }).catch(() => resolve());
                            });
                        }
                    }
                }
            }
        } catch {}

        const torrentUrl =
            $('a[href*="torrents/download"]').attr('href') ||
            $('a[href*="download/"]').attr('href') ||
            '';
        if (torrentUrl) {
            try {
                meta.torrentUrl = new URL(torrentUrl, this.currentUrl).href;
            } catch {
                meta.torrentUrl = torrentUrl;
            }
        }

        if (!meta.torrentFilename && meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, '.').replace(/\*/g, '') + '.torrent';
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, '.');
            meta.torrentName = meta.torrentFilename;
        }

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }
}
