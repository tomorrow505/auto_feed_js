import $ from 'jquery';
import { GazelleEngine } from './Gazelle';
import { TorrentMeta } from '../types/TorrentMeta';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import { extractImdbId } from '../common/rules/links';
import { getMediainfoPictureFromDescr } from '../common/rules/media';
import { setAllFormValues, setFirstFormValue } from '../common/dom/form';
import { GMAdapter } from '../services/GMAdapter';

function getScTorrentId(currentUrl: string): string {
    try {
        const u = new URL(currentUrl);
        const fromUrl = u.searchParams.get('torrentid') || '';
        if (fromUrl) return fromUrl;
    } catch {}
    const download = $('a[href*="action=download"][href*="id="], a[href*="download.php"][href*="id="], a[href*="download&id="]').first().attr('href') || '';
    const fromDownload = download.match(/[?&]id=(\d+)/i)?.[1] || '';
    if (fromDownload) return fromDownload;

    const row = $('#torrent_details tr[id*="torrent"], tr[id^="torrent_"], tr[id^="torrent"]').toArray().find((el) => {
        const id = (el as HTMLElement).id || '';
        return /torrent[_-]?\d+/i.test(id) && $(el).find('a[href*="download"]').length > 0;
    }) as HTMLElement | undefined;
    return row?.id?.match(/torrent[_-]?(\d+)/i)?.[1] || '';
}

function getScTorrentBox(torrentId: string): JQuery<HTMLElement> {
    if (torrentId) {
        const exact = $(`#torrent${torrentId}, #torrent_${torrentId}, #torrent_detail_${torrentId}`).first();
        if (exact.length) return exact as JQuery<HTMLElement>;
        const byLink = $(`a[href*="torrentid=${torrentId}"], a[href*="download&id=${torrentId}"], a[href*="download.php?id=${torrentId}"]`).first().closest('tr');
        if (byLink.length) return byLink as JQuery<HTMLElement>;
    }
    const withDownload = $('#torrent_details tr, table.torrent_table tr').filter((_, el) => {
        return $(el).find('a[href*="download"], a[href*="torrentid="]').length > 0;
    }).first();
    return withDownload as JQuery<HTMLElement>;
}

function normalizeMediaValue(meta: TorrentMeta): string {
    const medium = meta.mediumSel || meta.medium || '';
    const standard = meta.standardSel || meta.resolution || '';
    if (/Blu.?ray|UHD/i.test(medium)) return 'BDMV';
    if (/DVD/i.test(medium)) return /DVDRip/i.test(meta.title || '') ? 'SD' : 'DVD-R';
    if (/2160|4K/i.test(standard)) return '2160p';
    if (/1080/i.test(standard)) return '1080p';
    if (/720/i.test(standard)) return '720p';
    return 'SD';
}

async function populateScFromImdb(imdbId: string, meta: TorrentMeta) {
    if (!imdbId) return;
    try {
        const res = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url: new URL(`/imdb.php?code=${encodeURIComponent(imdbId)}`, window.location.origin).href
        });
        const data = JSON.parse(String(res?.responseText || '{}'));
        if (!data || data.err) return;
        setFirstFormValue('input#title, input[name="title"]', data.title, { force: false });
        setFirstFormValue('input#alternate_title, input[name="alternate_title"]', data.alt_title, { force: false });
        setFirstFormValue('input#year, input[name="year"]', String(data.year || ''), { force: false });
        setFirstFormValue('input#country, input[name="country"]', data.country, { force: false });
        setFirstFormValue('input#language, input[name="language"]', data.language, { force: false });
        setFirstFormValue('input#runtime, input[name="runtime"]', String(data.runtime || ''), { force: false });
        setFirstFormValue('input#tags, input[name="tags"]', data.taglist, { force: false });
        setFirstFormValue('textarea#album_desc, textarea[name="album_desc"]', data.group_desc || meta.synopsis || meta.description || '', { force: false });
        const image = meta.images?.[0] || meta.description?.match(/\[img\](.*?)\[\/img\]/i)?.[1] || '';
        setFirstFormValue('input[name="image"], input#image', image, { force: false });
    } catch (e) {
        console.warn('[Auto-Feed][SC] IMDb populate failed:', e);
    }
}

export class SCEngine extends GazelleEngine {
    async parse(): Promise<TorrentMeta> {
        const meta = await super.parse();
        const torrentId = getScTorrentId(this.currentUrl);

        meta.type = '电影';
        if (torrentId) {
            const row = getScTorrentBox(torrentId);
            const imdbHref = row.find('a[href*="imdb.com/title/tt"], a:contains("IMDB")').first().attr('href') || '';
            if (imdbHref) {
                meta.imdbUrl = imdbHref;
                meta.imdbId = extractImdbId(imdbHref);
            }

            const torrentBox = row;
            const quote = torrentBox.find('blockquote').has('blockquote').last();
            if (quote.length) {
                const innerQuote = quote.find('blockquote').first();
                let description = '';
                const quoteText = (innerQuote.text() || '').trim();
                if (quoteText) description += `[quote]${quoteText}[/quote]\n\n`;
                quote.find('img').each((_, img) => {
                    const src = (img as HTMLImageElement).getAttribute('src') || (img as HTMLImageElement).src || '';
                    if (src) {
                        description += `[img]${src}[/img]\n`;
                        meta.images.push(src);
                    }
                });
                if (description.trim()) meta.description = description.trim();
            } else if (torrentBox.length) {
                const converted = htmlToBBCode(torrentBox[0]);
                if (converted) meta.description = converted;
            }

            const name = meta.description.match(/complete.*?name.*?:\s*(.*)/i)?.[1]?.trim();
            if (name) meta.title = name;

            const download =
                row.find(`a[href*="download&id=${torrentId}"], a[href*="download.php?id=${torrentId}"], a[href*="download.php"][href*="${torrentId}"], a[href*="action=download"][href*="${torrentId}"]`).first().attr('href') ||
                $(`a[href*="download&id=${torrentId}"], a[href*="download.php?id=${torrentId}"], a[href*="download.php"][href*="${torrentId}"], a[href*="action=download"][href*="${torrentId}"]`).first().attr('href') ||
                '';
            if (download) {
                meta.torrentUrl = new URL(download, this.currentUrl).href;
            }
        }

        const poster = $('#covers img, #cover_div img, .box_image img').first().attr('src') || '';
        if (poster) {
            meta.images = [poster, ...meta.images.filter((x) => x !== poster)];
        }
        if (!meta.imdbId && meta.imdbUrl) meta.imdbId = extractImdbId(meta.imdbUrl);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        await super.fill(meta);

        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '');
        setAllFormValues('#catalogue_number, #cataloguenumber, input[name="catalogue_number"], input[name="cataloguenumber"]', imdbId);
        const imdbAuto = document.querySelector('#imdb_autofill') as HTMLButtonElement | HTMLInputElement | null;
        try { imdbAuto?.click(); } catch {}
        await populateScFromImdb(imdbId, meta);

        setAllFormValues('#media, select[name="media"]', normalizeMediaValue(meta));
        const info = getMediainfoPictureFromDescr(`${meta.fullMediaInfo || ''}\n${meta.description || ''}`, { mediumSel: meta.mediumSel });
        const screenshotTags = (info.picInfo || '')
            .match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/gi)
            ?.slice(0, 3) || [];
        const screenshots = screenshotTags.join('\n');
        const mediainfo = meta.fullMediaInfo || info.mediainfo || '';
        const poster = meta.images?.[0] || '';
        const fallbackImage = poster || meta.description.match(/\[img\](.*?)\[\/img\]/i)?.[1] || '';
        const posterTag = poster && !screenshots.includes(poster) ? `[img]${poster}[/img]` : '';
        const releaseDesc = [posterTag, screenshots, mediainfo ? `[hide=MediaInfo]${mediainfo}[/hide]` : '']
            .filter(Boolean)
            .join('\n\n');
        const applyScFields = (forceDescription = true) => {
            setFirstFormValue('#release_desc, textarea[name="release_desc"], textarea[name="description"]', releaseDesc || meta.description, { force: forceDescription });
            setFirstFormValue('#album_desc, textarea[name="album_desc"]', meta.synopsis || meta.description || '', { force: false });
            setFirstFormValue('input[name="image"], input#image', fallbackImage, { force: false });
        };
        applyScFields(true);
        [300, 900, 1800, 3500].forEach((ms) => window.setTimeout(() => applyScFields(false), ms));


        try {
            const { TorrentService } = await import('../services/TorrentService');
            const announce = ($('input[value*="announce"]').val() as string) || null;
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announce);
            if (result) TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
        } catch (e) {
            console.error('[Auto-Feed][SC] File Injection Failed:', e);
        }
    }
}
