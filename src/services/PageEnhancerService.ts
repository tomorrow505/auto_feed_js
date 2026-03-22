import $ from 'jquery';
import { SettingsService } from './SettingsService';
import { DoubanService } from './DoubanService';
import { TorrentMeta } from '../types/TorrentMeta';
import { ImageHostService } from './ImageHostService';
import { GMAdapter } from './GMAdapter';
import { renderQuickSearchHtml, resolveQuickSearchSetting, QuickSearchRenderOptions } from '../common/quickSearch';
import { getGroupName } from '../common/rules/groupName';
import { extractImdbId } from '../common/rules/links';
import { getSearchName } from '../common/rules/search';

export class PageEnhancerService {
    static async tryEnhance() {
        const url = window.location.href;
        const settings = await SettingsService.load();

        if (url.match(/^https?:\/\/passthepopcorn\.me\/torrents\.php/i)) {
            if (settings.ptpShowGroupName) {
                try {
                    this.injectPTPGroupNames(settings.ptpNameLocation || 1);
                } catch (err) {
                    console.error('[Auto-Feed][PTP] GroupName inject error:', err);
                }
            }
            if (url.match(/torrents\.php\?id=\d+/i) && settings.ptpShowDouban) {
                try {
                    await this.injectPTPDouban();
                } catch (err) {
                    console.error('[Auto-Feed][PTP] Douban inject error:', err);
                }
            }
        }

        if (url.match(/^https?:\/\/hdbits\.org\/details\.php\?id=/i) && settings.hdbShowDouban) {
            try {
                await this.injectHDBDouban(settings.hdbHideDouban);
            } catch (err) {
                console.error('[Auto-Feed][HDB] Douban inject error:', err);
            }
        }
    }

    private static injectPTPGroupNames(locationFlag: number) {
        if (document.body.dataset.autofeedPtpGroup === '1') return;

        const delimiter = ' / ';
        const groupColor = '#20B2AA';

        const formatText = (str: string, color: boolean) => {
            const style = [
                'font-weight:bold',
                color ? `color:${groupColor}` : ''
            ].filter(Boolean).join(';');
            return `<span style="${style}">${str}</span>`;
        };

        const setGroupName = (groupname: string, target: Element) => {
            if (!groupname || groupname === 'Null') return;
            let color = true;
            const $target = $(target);
            if ($target.find('.autofeed-group-name').length || $target.closest('a').find('.autofeed-group-name').length) return;
            const parent = $target.parent();
            if (parent.find('.golden-popcorn-character').length) color = false;
            if (parent.find('.torrent-info__download-modifier--free').length) color = false;
            if (parent.find('.torrent-info-link--user-leeching').length) color = false;
            if (parent.find('.torrent-info-link--user-seeding').length) color = false;
            if (parent.find('.torrent-info-link--user-downloaded').length) color = false;

            if (locationFlag === 1) {
                $target.append(`<span class="autofeed-group-split">${delimiter}</span>`).append(`<span class="autofeed-group-name">${formatText(groupname, color)}</span>`);
            } else {
                $target.prepend(`<span class="autofeed-group-name">${formatText(groupname, color)}</span>`).prepend(`<span class="autofeed-group-split">${delimiter}</span>`);
            }
        };

        const applyForBrowse = () => {
            const pageData = (window as any).PageData;
            if (!pageData || !pageData.Movies) return false;
            const releases: Record<number, string> = {};
            pageData.Movies.forEach((movie: any) => {
                movie.GroupingQualities?.forEach((group: any) => {
                    group.Torrents?.forEach((torrent: any) => {
                        if (torrent.ReleaseGroup) {
                            releases[torrent.TorrentId] = torrent.ReleaseGroup;
                        } else if (torrent.ReleaseName) {
                            releases[torrent.TorrentId] = getGroupName(torrent.ReleaseName, '');
                        }
                    });
                });
            });
            const applyTo = (scope?: JQuery) => {
                const root = scope || $('body');
                root.find('tbody a.torrent-info-link[href*="torrentid="]').each(function () {
                    const href = (this as HTMLAnchorElement).href || '';
                    const id = href.match(/\btorrentid=(\d+)\b/)?.[1];
                    if (!id) return;
                    const groupname = releases[parseInt(id, 10)] || '';
                    if (groupname) setGroupName(groupname, this);
                });
            };
            applyTo();

            // Legacy parity: some PTP browse variants append/replace rows later.
            try {
                if (pageData.ClosedGroups == 1) {
                    const targetNodes = $('tbody');
                    const MutationObserverCtor = window.MutationObserver || (window as any).WebKitMutationObserver;
                    const observer = new MutationObserverCtor((mutationRecords: any[]) => {
                        mutationRecords.forEach((mutation) => {
                            if (!mutation?.addedNodes?.length) return;
                            applyTo($(mutation.addedNodes));
                        });
                    });
                    targetNodes.each((_i, node) => {
                        observer.observe(node, { childList: true, subtree: false });
                    });
                }
            } catch {}

            return true;
        };

        const applyForUploadList = () => {
            let hit = false;
            $('.torrent-info-link').each(function () {
                const $link = $(this);
                if ($link.find('.autofeed-group-name').length) return;
                const title = ($link.attr('title') || '').trim();
                if (!title) return;
                const groupname = getGroupName(title, '');
                if (!groupname || groupname === 'Null') return;
                setGroupName(groupname, this);
                hit = true;
            });
            return hit;
        };

        const applyForDetailsTable = () => {
            let hit = false;
            $('table#torrent-table a.torrent-info-link').each(function () {
                const $link = $(this);
                if ($link.find('.autofeed-group-name').length) return;
                const $row = $link.closest('tr');
                let groupname = ($row.data('releasegroup') as string) || '';
                if (!groupname) {
                    const releaseName = ($row.data('releasename') as string) || '';
                    groupname = getGroupName(releaseName, $row.text());
                }
                if (groupname) setGroupName(groupname, this);
                hit = true;
            });
            return hit;
        };

        const applyGenericListFallback = () => {
            let hit = false;
            $('tbody a.torrent-info-link[href*="torrentid="]').each(function () {
                const $link = $(this);
                if ($link.find('.autofeed-group-name').length) return;
                const text = ($link.attr('title') || $link.text() || '').trim();
                const groupname = getGroupName(text, $link.closest('tr').text());
                if (!groupname || groupname === 'Null') return;
                setGroupName(groupname, this);
                hit = true;
            });
            return hit;
        };

        const appliedBrowse = applyForBrowse();
        if (!appliedBrowse) {
            const byUpload = applyForUploadList();
            const byDetails = applyForDetailsTable();
            if (!byUpload && !byDetails) applyGenericListFallback();
        }

        document.body.dataset.autofeedPtpGroup = '1';
    }

    private static async injectPTPDouban() {
        if ($('#autofeed-ptp-douban').length) return;

        const imdbLink =
            ($('#imdb-title-link').attr('href') || $('a:contains("IMDB")').attr('href') || '').toString();
        const imdbId = extractImdbId(imdbLink);
        if (!imdbId) return;

        const data = await DoubanService.getByImdb(imdbId);
        if (!data) return;

        const isChinese = /[\u4e00-\u9fa5]+/.test(data.title || '');
        if (isChinese) {
            $('.page__title').prepend(
                `<a target="_blank" href="https://movie.douban.com/subject/${data.id}">[${data.title.split(' ')[0]}] </a>`
            );
        }

        if (data.summary) {
            const lines = data.summary.split('   ').map((s) => s.trim()).filter(Boolean).map((s) => `\t${s}`);
            const summary = lines.join('\n');
            $('#movieinfo').before(`
                <div class="panel" id="autofeed-ptp-douban">
                    <div class="panel__heading"><span class="panel__heading__title">简介</span></div>
                    <div class="panel__body" id="intro">&nbsp&nbsp&nbsp&nbsp${summary}</div>
                </div>
            `);
        } else {
            $('#movieinfo').before(`<div class="panel" id="autofeed-ptp-douban"></div>`);
        }

        $('#torrent-table').parent().prepend($('#movie-ratings-table').parent());

        try {
            $('#movieinfo').before(`
                <div class="panel">
                    <div class="panel__heading"><span class="panel__heading__title">电影信息</span></div>
                    <div class="panel__body">
                        <div><strong>导演:</strong> ${data.director || ''}</div>
                        <div><strong>演员:</strong> ${data.cast || ''}</div>
                        <div><strong>类型:</strong> ${data.genre || ''}</div>
                        <div><strong>制片国家/地区:</strong> ${data.region || ''}</div>
                        <div><strong>语言:</strong> ${data.language || ''}</div>
                        <div><strong>时长:</strong> ${data.runtime || ''}</div>
                        <div><strong>又名:</strong> ${data.aka || ''}</div>
                    </div>
                </div>
            `);
        } catch {}

        const total = data.average ? 10 : '';
        const split = data.average ? '/' : '';
        const votes = data.votes || 0;
        const average = data.average || '暂无评分';

        $('#movie-ratings-table tr').prepend(`
            <td colspan="1" style="width: 110px;">
                <center>
                <a target="_blank" class="rating" href="https://movie.douban.com/subject/${data.id}" rel="noreferrer">
                    <div style="font-size: 0;min-width: 105px;">
                        <span class="icon-pt1" style="font-size: 14px;
                        display: inline-block;
                        text-align: center;
                        border: 1px solid #41be57;
                        background-color: #41be57;
                        color: white;
                        border-top-left-radius: 4px;
                        border-bottom-left-radius: 4px;
                        width: 24px;
                        height: 24px;
                        line-height: 24px;">豆</span>
                        <span class="icon-pt2" style="font-size: 14px;
                        display: inline-block;
                        text-align: center;
                        border: 1px solid #41be57;
                        color: #3ba94d;
                        background: #ffffff;
                        border-top-right-radius: 4px;
                        border-bottom-right-radius: 4px;
                        width: 69px;
                        height: 24px;
                        line-height: 24px;">豆瓣评分</span>
                    </div>
                </a>
                </center>
            </td>
            <td style="width: 150px;">
                <span class="rating">${average}</span>
                <span class="mid">${split}</span>
                <span class="outof"> ${total} </span>
                <br>(${votes} votes)
            </td>
        `);

        try {
            const lb = await DoubanService.getLetterboxdRatingByImdb(imdbId);
            if (lb) {
                const $row = $('#movie-ratings-table tr').first();
                if (!$row.length || $row.find('#letterboxd_rating_td').length) return;
                $row.append(`
                    <td colspan="1" style="width: 128px;" id="letterboxd_rating_td">
                        <center>
                            <a target="_blank" class="rating" id="letterboxd-title-link" href="${lb.url}" rel="noreferrer">
                                <img src="https://letterboxd.com/favicon.ico"
                                    style="height:44px;width:44px;object-fit:contain;"
                                    title="Letterboxd"
                                    onerror="this.onerror=null;this.src='https://s.ltrbxd.com/static/img/icons/favicon.ico';" />
                            </a>
                        </center>
                    </td>
                    <td style="width: 150px;">
                        <span class="rating">${lb.rating}</span>
                        <span class="mid">/</span>
                        <span class="outof">10</span>
                        <br>(${lb.votes} votes)
                    </td>
                `);
            }
        } catch {}
    }

    private static async injectHDBDouban(hideByDefault: boolean) {
        if ($('#autofeed-hdb-douban').length) return;

        let links = $('table.contentlayout').find('a[href^="https://www.imdb.com/title/"]');
        if (links.length === 0) {
            links = $('.showlinks').find('a[href^="https://www.imdb.com/title/"]');
            if (links.length === 0) return;
        }

        const imdbHref = (links[0] as HTMLAnchorElement).href || '';
        const imdbId = extractImdbId(imdbHref);
        if (!imdbId) return;

        const data = await DoubanService.getByImdb(imdbId);
        if (!data) return;

        if (data.cast && data.cast.split('/').length > 8) {
            data.cast = data.cast.split('/').slice(0, 8).join('/');
        }
        if (data.director && data.director.split('/').length > 8) {
            data.director = data.director.split('/').slice(0, 8).join('/');
        }

        const poster = (data.image || '').replace(
            /^.+(p\d+).+$/i,
            (_m, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
        );

        const label = hideByDefault ? '+ ' : '- ';
        const status = hideByDefault ? 'none' : 'block';

        const html = `
            <tr id="autofeed-hdb-douban"><td>
                <div id="l20201117" class="label collapsable" onclick="showHideEl(20201117)"><span class="plusminus">${label}</span>关于本片 (豆瓣信息)</div>
                <div id="c20201117" class="hideablecontent" style="display: ${status};">
                    <div style="display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap;">
                        <div style="flex: 0 0 250px; max-width: 250px;">
                            <img src="${poster}" referrerpolicy="no-referrer" style="width: 250px; max-width: 250px; height: auto; border: 0;" alt="">
                        </div>
                        <div style="flex: 1 1 520px; min-width: 280px;">
                            <h1 style="margin: 0; font-size: 20px; line-height: 1.2;">
                                <a href="https://movie.douban.com/subject/${data.id}" target="_blank" rel="noreferrer">${data.title}</a>
                                <span style="opacity: .85;">(${data.year || ''})</span>
                            </h1>
                            <div style="margin: 6px 0 10px 0; font-weight: normal; opacity: .9; white-space: normal; overflow-wrap: anywhere; word-break: break-word;">
                                ${data.aka || ''}
                            </div>

                            <div style="display: flex; gap: 14px; align-items: flex-start; flex-wrap: wrap;">
                                <div style="flex: 0 0 360px; min-width: 280px;">
                                    <table class="content" cellspacing="0" id="imdbinfo" style="width: 100%; table-layout: fixed;">
                                        <tbody style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">
                                            <tr><th style="width: 80px;">评分</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${data.average || '暂无评分'} (${data.votes || 0}人评价)</td></tr>
                                            <tr><th>类型</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${data.genre || ''}</td></tr>
                                            <tr><th>国家/地区</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${data.region || ''}</td></tr>
                                            <tr><th>导演</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${(data.director || '').replace(/\//g, '<br>')}</td></tr>
                                            <tr><th>语言</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${data.language || ''}</td></tr>
                                            <tr><th>上映日期</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${(data.releaseDate || '').replace(/\//g, '<br>')}</td></tr>
                                            <tr><th>片长</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${data.runtime || ''}</td></tr>
                                            <tr><th>演员</th><td style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">${(data.cast || '').replace(/\//g, '<br>')}</td></tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style="flex: 1 1 380px; min-width: 280px;">
                                    <div style="font-weight: bold; margin: 2px 0 6px 0;">简介</div>
                                    <div style="white-space: normal; overflow-wrap: anywhere; word-break: break-word;">
                                        ${data.summary ? '　　' + data.summary.replace(/ 　　/g, '<br>　　') : '本片暂无简介'}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </td></tr>
        `;

        // More robust anchor than `#details tr:eq(1)` because our legacy embed may insert rows into #details.
        const aboutImdb = $('div.collapsable:contains("About this film (from IMDB)")').first();
        const anchorTr = aboutImdb.closest('tr');
        if (anchorTr.length) {
            anchorTr.after(html);
        } else {
            $('#details > tbody > tr').eq(1).after(html);
        }

        $('div.collapsable:contains("About this film (from IMDB)")')
            .parent()
            .find('img')
            .first()
            .css({ width: '250px', 'max-height': '660px' });

        if (!hideByDefault) {
            $('div.collapsable:contains("About this film (from IMDB)")').click();
        }
    }
}

type QuickSearchSetting = ReturnType<typeof resolveQuickSearchSetting>;

export class QuickSearchService {
    private static normalizeListSearchName(name: string): string {
        const raw = String(name || '').trim();
        if (!raw) return '';
        let searchName = getSearchName(raw) || raw;
        if (raw.match(/S\d+/i)) {
            const number = raw.match(/S(\d+)/i)?.[1];
            if (number) searchName = `${searchName} Season ${parseInt(number, 10)}`;
        }
        return searchName.trim();
    }

    private static async injectQuickSearch(
        container: JQuery,
        meta: Partial<TorrentMeta>,
        marginTopPx = 4,
        opts?: QuickSearchSetting,
        renderOpts?: QuickSearchRenderOptions
    ) {
        if (!container.length) return;
        if (container.find('.autofeed-search-links').length) return;
        const resolved = opts || resolveQuickSearchSetting(await SettingsService.load());
        const html = renderQuickSearchHtml(
            meta,
            resolved.quickSearchList,
            resolved.quickSearchPresets,
            {
                lang: resolved.lang,
                className: 'autofeed-search-links',
                alignCenter: true,
                bordered: true,
                fontColor: 'red',
                ...renderOpts
            }
        );
        if (!html) return;
        const row = $(html);
        row.css('margin-top', `${marginTopPx}px`);
        container.append(row);
    }

    static async tryInject() {
        const url = window.location.href;
        const settings = await SettingsService.load();

        if (url.match(/^https?:\/\/movie\.douban\.com\/subject\/\d+/i) && settings.showQuickSearchOnDouban) {
            this.injectDoubanTools(settings);
        }

        if (url.match(/^https?:\/\/www\.imdb\.com\/title\/tt\d+/i) && settings.showQuickSearchOnImdb) {
            this.injectImdbTools(settings);
        }
    }

    static async tryInjectList() {
        const url = window.location.href;
        const settings = await SettingsService.load();
        const quickSearchOpts = resolveQuickSearchSetting(settings);

        // Legacy parity: some list pages render rows asynchronously after document-end.
        // Run one delayed retry so PTP/HDB list quick-search can be injected reliably.
        if (document.body.dataset.autofeedListQuickSearchRetry !== '1') {
            document.body.dataset.autofeedListQuickSearchRetry = '1';
            setTimeout(() => {
                this.tryInjectList().catch(() => {});
            }, 650);
        }
        const listQuickSearchRenderOpts: QuickSearchRenderOptions = {
            className: 'autofeed-search-links autofeed-search-links--list',
            alignCenter: false,
            bordered: false,
            fontColor: 'green',
            labelText: '',
            fontSize: '12px'
        };

        const addGroupName = (container: JQuery, groupname: string, locationFlag = 1) => {
            const g = String(groupname || '').trim();
            if (!container.length || !g || g === 'Null') return;
            if (container.find('.autofeed-group-name').length) return;
            const node = $(`<span class="autofeed-group-name" style="font-weight:bold; color:#20B2AA;">${g}</span>`);
            const delimiter = $('<span class="autofeed-group-split"> / </span>');
            if (locationFlag === 0) {
                container.prepend(node).prepend(delimiter);
            } else {
                container.append(delimiter).append(node);
            }
        };

        const injectSearch = async (container: JQuery, meta: Partial<TorrentMeta>) => {
            await this.injectQuickSearch(container, meta, 4, quickSearchOpts, listQuickSearchRenderOpts);
        };

        const buildPtpMaps = () => {
            const groupMap: Record<string, string> = {};
            const imdbMap: Record<string, string> = {};
            const titleMap: Record<string, string> = {};
            try {
                const pageData = (window as any).PageData;
                if (!pageData?.Movies) return { groupMap, imdbMap, titleMap };
                pageData.Movies.forEach((movie: any) => {
                    const imdbId = extractImdbId(String(movie?.ImdbId || ''));
                    const movieTitle = String(movie?.Title || movie?.Name || movie?.GroupName || '').trim();
                    movie.GroupingQualities?.forEach((group: any) => {
                        group.Torrents?.forEach((torrent: any) => {
                            const tid = String(torrent?.TorrentId || '');
                            if (!tid) return;
                            const groupname = torrent.ReleaseGroup || getGroupName(torrent.ReleaseName || '', '');
                            if (groupname && groupname !== 'Null') groupMap[tid] = groupname;
                            if (imdbId) imdbMap[tid] = imdbId;
                            if (movieTitle) titleMap[tid] = movieTitle;
                        });
                    });
                });
            } catch { }
            return { groupMap, imdbMap, titleMap };
        };

        if (url.match(/^https:\/\/hdbits\.org\/browse/i) && settings.showSearchOnList?.HDB) {
            $('#torrent-list').find('tr').each((_, row) => {
                const html = $(row).html() || '';
                const imdbId = extractImdbId(html);
                if (!imdbId) return;
                const $cell = $(row).find('td:eq(2)');
                const name = $cell.find('a').first().text().trim();
                if (!name) return;
                injectSearch($cell, { title: this.normalizeListSearchName(name), imdbId }).catch(() => {});
                addGroupName($cell, getGroupName(name, $(row).text()));
            });
        }

        if (url.match(/^https:\/\/passthepopcorn\.me\/torrents\.php/i) && settings.showSearchOnList?.PTP) {
            const { groupMap, imdbMap, titleMap } = buildPtpMaps();
            $('tbody tr.basic-movie-list__details-row').each((_, row) => {
                const html = $(row).html() || '';
                const $row = $(row);
                const tid =
                    $row.find('a[href*="torrentid="]').first().attr('href')?.match(/torrentid=(\d+)/i)?.[1] || '';
                const imdbId =
                    extractImdbId(html) ||
                    (tid ? imdbMap[tid] : '');
                if (!imdbId) return;
                const $titleRow = $row.find('span.basic-movie-list__movie__title-row').first();
                const name = $titleRow.find('a').first().text().trim() || (tid ? titleMap[tid] : '');
                const $container = $titleRow.length ? $titleRow : $row.find('td:eq(1)');
                injectSearch($container, { title: this.normalizeListSearchName(name), imdbId }).catch(() => {});

                if (settings.ptpShowGroupName) {
                    const groupFromMap = tid ? groupMap[tid] : '';
                    const groupname = groupFromMap || getGroupName(name, $row.text());
                    addGroupName($container, groupname, settings.ptpNameLocation || 1);
                }
            });

            // Legacy-like fallback: target each torrent link by strict `torrentid`, works on uploaded/search variants.
            $('tbody a.torrent-info-link[href*="torrentid="]').each((_, link) => {
                const $link = $(link);
                const href = ($link.attr('href') || '') as string;
                const tid = href.match(/torrentid=(\d+)/i)?.[1] || '';
                if (!tid) return;
                if (settings.ptpShowGroupName) {
                    const groupname = groupMap[tid] || getGroupName($link.attr('title') || '', $link.closest('tr').text());
                    addGroupName($link, groupname, settings.ptpNameLocation || 1);
                }
                const imdbId = imdbMap[tid];
                if (!imdbId) return;
                const title = titleMap[tid] || $link.closest('tr').find('span.basic-movie-list__movie__title-row a').first().text().trim();
                const $cell = $link.closest('td').length ? $link.closest('td') : $link.parent();
                injectSearch($cell, { title: this.normalizeListSearchName(title), imdbId }).catch(() => {});
            });
        }

    }

    private static injectDoubanTools(settings?: Awaited<ReturnType<typeof SettingsService.load>>) {
        if (document.body.dataset.autofeedDouban === '1') return;
        const $info = $('#info');
        const $title = $('h1').first();
        if (!$info.length) return;

        const imdbId = extractImdbId($info.html() || '');
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
                } else if (settings.freeimageApiKey) {
                    result = await ImageHostService.uploadToFreeimage([poster], settings.freeimageApiKey);
                } else if (settings.gifyuApiKey) {
                    result = await ImageHostService.uploadToGifyu([poster], settings.gifyuApiKey);
                } else {
                    // No API key mode fallback: Pixhost remote upload does not require user API key.
                    result = await ImageHostService.uploadToPixhost([poster]);
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

        const quickSearchOpts = settings ? resolveQuickSearchSetting(settings) : undefined;
        this.injectQuickSearch(
            $title,
            { title: searchName, imdbId },
            6,
            quickSearchOpts,
            {
                className: 'autofeed-search-links autofeed-search-links--douban',
                alignCenter: false,
                bordered: false,
                fontColor: 'red',
                labelText: '',
                fontSize: '12px'
            }
        ).catch(() => {});
        document.body.dataset.autofeedDouban = '1';
    }

    private static injectImdbTools(settings?: Awaited<ReturnType<typeof SettingsService.load>>) {
        if (document.body.dataset.autofeedImdb === '1') return;
        const imdbId = extractImdbId(window.location.href);
        const searchName = $('title')
            .text()
            .trim()
            .split(/ \(\d+\) - /)[0]
            .replace(/season/i, '');

        const $container = $('h1[data-testid*=pageTitle]').first();
        if ($container.length) {
            const quickSearchOpts = settings ? resolveQuickSearchSetting(settings) : undefined;
            this.injectQuickSearch(
                $container,
                { title: searchName, imdbId },
                6,
                quickSearchOpts,
                {
                    className: 'autofeed-search-links autofeed-search-links--imdb',
                    alignCenter: false,
                    bordered: false,
                    fontColor: 'green',
                    labelText: '',
                    fontSize: '12px',
                    linkColor: 'yellow'
                }
            ).catch(() => {});
        }
        document.body.dataset.autofeedImdb = '1';
    }
}
