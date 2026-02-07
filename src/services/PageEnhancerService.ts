import $ from 'jquery';
import { SettingsService } from './SettingsService';
import { DoubanService } from './DoubanService';
import { LetterboxdService } from './LetterboxdService';

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
            const parent = $target.parent();
            if (parent.find('.golden-popcorn-character').length) color = false;
            if (parent.find('.torrent-info__download-modifier--free').length) color = false;
            if (parent.find('.torrent-info-link--user-leeching').length) color = false;
            if (parent.find('.torrent-info-link--user-seeding').length) color = false;
            if (parent.find('.torrent-info-link--user-downloaded').length) color = false;

            if (locationFlag === 1) {
                $target.append(delimiter).append(formatText(groupname, color));
            } else {
                $target.prepend(formatText(groupname, color)).prepend(delimiter);
            }
        };

        const getGroupName = (name: string, torrentInfo = ''): string => {
            if (typeof name !== 'string') return 'Null';
            try {
                name = name.replace(/\[.*?\]|web-dl|dts-hd|Blu-ray|MPEG-2|MPEG-4/ig, '');
                name = name.split(/\.mkv|\.mp4|\.iso|\.avi/)[0];
                const special = name.match(/(KJNU|tomorrow505|KG|BMDru|BobDobbs|Dusictv|AFKI)$/i);
                if (special) return special[1];
                let tmpName = name.match(/-(.*)/)?.[1].split(/-/).pop() || '';
                if (tmpName.match(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i)) {
                    if (torrentInfo.match(/Scene/)) {
                        name = name.split('-')[0];
                    } else {
                        const parts = tmpName.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i);
                        if (parts.length > 1) {
                            name = parts.pop() || 'Null';
                        } else {
                            name = 'Null';
                        }
                    }
                } else {
                    name = tmpName;
                }
            } catch {
                const parts = name.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVDRip|DVD9|DVD5/i);
                name = parts.length > 1 ? (parts.pop() || 'Null') : 'Null';
            }
            name = name.trim();
            if (!name || name.match(/\)|^\d\d/)) name = 'Null';
            if (name === 'Z0N3') name = 'D-Z0N3';
            if (name === 'AVC.ZONE') name = 'ZONE';
            if (name.match(/CultFilms/)) name = 'CultFilms™';
            if (name.match(/™/) && !name.match(/CultFilms/)) name = 'Null';
            if (name.includes('.nfo')) name = name.replace('.nfo', '');
            if (name.match(/[_\.! ]/) || name.match(/Extras/i)) name = 'Null';
            if (name.length === 1 || name.match(/^\d+$/)) name = 'Null';
            return name;
        };

        const applyForTable = () => {
            $('table#torrent-table a.torrent-info-link').each(function () {
                const $link = $(this);
                if ($link.data('autofeed-group') === 1) return;
                const $row = $link.closest('tr');
                let groupname = ($row.data('releasegroup') as string) || '';
                if (!groupname) {
                    const releaseName = ($row.data('releasename') as string) || '';
                    groupname = getGroupName(releaseName, $row.text());
                }
                setGroupName(groupname, this);
                $link.data('autofeed-group', 1);
            });
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
            $('tbody a.torrent-info-link').each(function () {
                const href = (this as HTMLAnchorElement).href;
                const id = href.match(/\btorrentid=(\d+)\b/)?.[1];
                if (!id) return;
                const groupname = releases[parseInt(id, 10)] || '';
                if (groupname) setGroupName(groupname, this);
            });
            return true;
        };

        const appliedBrowse = applyForBrowse();
        if (!appliedBrowse) applyForTable();

        document.body.dataset.autofeedPtpGroup = '1';
    }

    private static async injectPTPDouban() {
        if ($('#autofeed-ptp-douban').length) return;

        const imdbLink =
            ($('#imdb-title-link').attr('href') || $('a:contains("IMDB")').attr('href') || '').toString();
        const imdbId = imdbLink.match(/tt\d+/)?.[0];
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
            const lb = await LetterboxdService.getRatingByImdb(imdbId);
            if (lb) {
                $('#ptp_rating_td').prev().before(`
                    <td colspan="1" style="width: 128px;" id="letterboxd_rating_td">
                        <center>
                            <a target="_blank" class="rating" id="letterboxd-title-link" href="${lb.url}" rel="noreferrer">
                            <img src="data:image/png;base64,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" style="height:64px;width:64px;" title="LetterBoxd"></a>
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
        const imdbId = imdbHref.match(/tt\d+/)?.[0];
        if (!imdbId) return;

        const data = await DoubanService.getByImdb(imdbId);
        if (!data) return;

        if (data.cast && data.cast.split('/').length > 8) {
            data.cast = data.cast.split('/').slice(0, 8).join('/');
        }
        if (data.director && data.director.split('/').length > 8) {
            data.director = data.director.split('/').slice(0, 8).join('/');
        }

        const label = hideByDefault ? '+ ' : '- ';
        const status = hideByDefault ? 'none' : 'block';

        $('#details > tbody > tr').eq(1).after(`
            <tr id="autofeed-hdb-douban"><td>
            <div id="l20201117" class="label collapsable" onclick="showHideEl(20201117)"><span class="plusminus">${label}</span>关于本片 (豆瓣信息)</div>
            <div id="c20201117" class="hideablecontent" style="display: ${status};">
                <table class="contentlayout" cellspacing="0" style="width:100%; table-layout: fixed;"><tbody>
                    <tr>
                        <td rowspan="3" width="2"><img src="${data.image || ''}" style="max-width:250px;border:0px;" alt></td>
                        <td colspan="2"><h1><a href="https://movie.douban.com/subject/${data.id}" target="_blank">${data.title}</a> (${data.year || ''})</h1><h3>${data.aka || ''}</h3></td>
                    </tr>
                    <tr>
                        <td style="width: 320px; vertical-align: top;">
                        <table class="content" cellspacing="0" id="imdbinfo" style="white-space: normal; word-break: break-word; overflow-wrap: anywhere;"><tbody>
                            <tr><th>评分</th><td>${data.average || '暂无评分'} (${data.votes || 0}人评价)</td></tr>
                            <tr><th>类型</th><td>${data.genre || ''}</td></tr>
                            <tr><th>国家/地区</th><td>${data.region || ''}</td></tr>
                            <tr><th>导演</th><td>${(data.director || '').replace(/\//g, '<br>    ')}</td></tr>
                            <tr><th>语言</th><td>${data.language || ''}</td></tr>
                            <tr><th>上映日期</th><td>${(data.releaseDate || '').replace(/\//g, '<br>    ')}</td></tr>
                            <tr><th>片长</th><td>${data.runtime || ''}</td></tr>
                            <tr><th>演员</th><td>${(data.cast || '').replace(/\//g, '<br>    ')}</td></tr>
                        </tbody></table></td>
                        <td id="plotcell" style="vertical-align: top; overflow-wrap:anywhere;">
                        <table class="content" cellspacing="0" style="width:100%; table-layout: fixed;"><tbody>
                            <tr><th>简介</th></tr><tr><td>${data.summary ? '　　' + data.summary.replace(/ 　　/g, '<br>　　') : '本片暂无简介'}</td></tr>
                        </tbody></table></td>
                    </tr>
                    <tr>
                        <td colspan="2" id="actors"></td>
                    </tr>
                </tbody></table>
            </div>
            </td></tr>
        `);

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
