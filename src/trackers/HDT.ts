import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import { extractImdbId } from '../common/rules/links';
import { getAudioCodecSel, getCodecSel, getLabel, getMediumSel, getStandardSel, getType } from '../common/rules/text';
import { getMediainfoPictureFromDescr } from '../common/rules/media';
import { dispatchFormEvents, setAllFormValues, setFirstFormValue } from '../common/dom/form';

const HDT_ANNOUNCE = 'https://hdts-announce.ru/announce.php';

function setField(selector: string, value?: string) {
    setAllFormValues(selector, value);
}

function detailsValue(label: string): string {
    const wanted = label.toLowerCase();
    const labels = $('.detailsleft, .rowhead, .label, td, th').toArray();
    for (const el of labels) {
        const key = (el.textContent || '').replace(/:/g, '').trim();
        if (key.toLowerCase() !== wanted) continue;
        const next = $(el).next('td, th');
        if (next.length) return (next.text() || '').replace(/\s+/g, ' ').trim();
        const parent = $(el).parent();
        const cells = parent.children('td, th');
        const idx = cells.index(el);
        if (idx >= 0 && idx + 1 < cells.length) {
            return ($(cells[idx + 1]).text() || '').replace(/\s+/g, ' ').trim();
        }
    }
    return '';
}

function hdtType(category: string, genre: string, title: string): string {
    const text = `${category} ${genre} ${title}`;
    if (/Animation|Anime|Cartoon/i.test(text)) return '动漫';
    if (/Documentary/i.test(text)) return '纪录';
    if (/TV|Episode|Season|S\d{1,3}E\d{1,3}|S\d{1,3}/i.test(text)) return '剧集';
    return getType(text) || '电影';
}

function hdtCategory(meta: TorrentMeta): string {
    let type = meta.type || '电影';
    const title = meta.title || '';
    if ((type === '纪录' || type === '综艺' || type === '动漫') && !title.match(/[^T]S\d+|E\d+|Complete/i)) type = '电影';
    const medium = meta.mediumSel || '';
    const standard = meta.standardSel || '';
    const isUhd = /UHD|4K/i.test(medium) || /UHD/i.test(title);
    const isSeries = ['剧集', '纪录', '综艺', '动漫'].includes(type) && title.match(/[^T]S\d+|E\d+|Complete/i);

    if (!isSeries) {
        if (medium === 'UHD') return '70';
        if (medium === 'Blu-ray') return '1';
        if (medium === 'Remux') return isUhd ? '71' : '2';
        if (['HDTV', 'Encode', 'WEB-DL', 'DVD'].includes(medium)) {
            if (standard === '4K') return '64';
            if (standard === '1080p' || standard === '1080i') return '5';
            if (standard === '720p') return '3';
        }
        return '5';
    }

    if (medium === 'UHD') return '72';
    if (medium === 'Blu-ray') return '59';
    if (medium === 'Remux') return isUhd ? '73' : '60';
    if (['HDTV', 'Encode', 'WEB-DL', 'DVD'].includes(medium)) {
        if (standard === '4K') return '65';
        if (standard === '1080p' || standard === '1080i') return '30';
        if (standard === '720p') return '38';
    }
    return '30';
}

function cleanHdtDescription(raw: string): string {
    let out = raw || '';
    out = out.replace(/\[center\]([\s\S]+?)\[\/center\]/gi, (match, body) => (
        /keep seeding|spank your ass/i.test(body) ? '' : match
    ));
    out = out.replace(/Torrent:|Quote:/gi, '');
    out = out.replace(/\[\/?font.*?\]/gi, '');
    out = out.replace(/^\[quote\][\s\S]*?(DISC Info|Disc Title)/i, '[quote]$1');
    out = out.replace(/\[img\]https:\/\/hd-torrents\.org\/images\/.*?\/.*?\.gif\[\/img\]|-\(SCREENSHOTS\)-/gi, '');
    out = out.replace('[img]https://hdts.ru/avatars/kralimarko.png[/img]', '');
    out = out.replace(/[\n ]*\[\/quote\]/gi, '[/quote]');
    return out.trim();
}

export class HDTEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        const rawTitle = (document.querySelector('h1, .torrentname, .title')?.textContent || document.title)
            .replace(/HD-Torrents\.org\s*-/gi, '')
            .replace(/\s*-\s*HD-Torrents\.org\s*/gi, '')
            .trim();
        const category = detailsValue('Category');
        const genre = detailsValue('Genre');
        const sizeText = detailsValue('Size');
        const detailsText = `${rawTitle} ${category} ${genre}`;

        const imdbBox = $('#IMDBDetailsInfoHideShowTR .imdbnew2').first();
        const imdbUrl = imdbBox.find('>a[href*="imdb.com/title/tt"], a[href*="imdb.com/title/tt"]').first().attr('href') || '';
        const imdbId = extractImdbId(imdbUrl);

        const descrEl = document.querySelector('#technicalInfoHideShowTR, #technicalInfo, #torrent_info, #detailsInfoHideShowTR, .technicalInfo') as HTMLElement | null;
        let description = descrEl ? htmlToBBCode(descrEl) : '';
        description = cleanHdtDescription(description);

        const info = getMediainfoPictureFromDescr(description);
        const images = (description.match(/\[img\](.*?)\[\/img\]/gi) || [])
            .map((item) => item.match(/\[img\](.*?)\[\/img\]/i)?.[1] || '')
            .filter(Boolean);

        const download = $('a[href*="download.php"]').first().attr('href') || '';
        const meta: TorrentMeta = {
            title: rawTitle,
            description,
            fullMediaInfo: info.mediainfo || undefined,
            type: hdtType(category, genre, rawTitle),
            mediumSel: getMediumSel(detailsText, rawTitle),
            standardSel: getStandardSel(detailsText),
            codecSel: getCodecSel(`${detailsText} ${description}`),
            audioCodecSel: getAudioCodecSel(`${detailsText} ${description}`),
            sourceSite: this.siteName,
            sourceUrl: this.currentUrl,
            imdbUrl: imdbUrl || undefined,
            imdbId: imdbId || undefined,
            images,
            torrentUrl: download ? new URL(download, this.currentUrl).href : undefined
        };
        if (/UHD\/Blu-Ray/i.test(category)) meta.mediumSel = 'UHD';
        if (!meta.mediumSel && /Blu-Ray/i.test(category)) meta.mediumSel = 'Blu-ray';
        if (!meta.standardSel) meta.standardSel = getStandardSel(rawTitle);
        if (sizeText) {
            const m = sizeText.match(/([\d.]+)\s*(GB|GiB|MB|MiB|TB|TiB)/i);
            if (m) {
                const n = parseFloat(m[1]);
                const unit = m[2].toUpperCase();
                const mult = unit.startsWith('T') ? 1024 ** 4 : unit.startsWith('G') ? 1024 ** 3 : 1024 ** 2;
                meta.size = Math.round(n * mult);
            }
        }
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '');
        const imdbUrl = meta.imdbUrl || (imdbId ? `https://www.imdb.com/title/${imdbId}/` : '');
        const filename = (meta.targetTitle || meta.title || '').replace(/DDP/i, 'DD+').replace(/Remux/i, 'Remux');
        const infoSite = imdbUrl ? imdbUrl.replace('http:', 'https:').replace(/(tt\d+[^/]$)/, '$1/') : '';
        const category = hdtCategory(meta);

        const applyHeaderFields = () => {
            setField('input[name="filename"]', filename);
            setField('input[name="infosite"]', infoSite);
            setField('select[name="category"]', category);
        };
        applyHeaderFields();
        [300, 900, 1800].forEach((ms) => window.setTimeout(applyHeaderFields, ms));

        if ((meta.title || '').match(/[^T]S\d+[^E]|complete/i)) {
            setField('select[name="season"]', 'true');
        }
        try {
            if ((meta.title || '').toLowerCase().includes(' 3d ')) {
                const threeD = document.getElementsByName('3d')[0] as HTMLSelectElement | undefined;
                if (threeD?.options[1]) threeD.value = threeD.options[1].value;
            }
        } catch {}

        const rawDescr = `${meta.fullMediaInfo || ''}\n${meta.description || ''}`.trim();
        const info = getMediainfoPictureFromDescr(rawDescr, { mediumSel: meta.mediumSel });
        const mediainfo = (meta.fullMediaInfo || info.mediainfo || '').trim();
        const picInfo = (info.picInfo || '').replace(/\n/g, '').replace(/(\[\/img\])(\[img\])/g, '$1 $2').replace(/(\[\/url\])(\[url)/g, '$1 $2');
        const formatted = `[font=consolas]${mediainfo}[/font]\n\n${picInfo}`.trim();
        const applyInfo = () => setFirstFormValue('textarea[name="info"], textarea#info, textarea[name="description"]', formatted || meta.description, { force: true });
        applyInfo();
        [300, 900, 1800].forEach((ms) => window.setTimeout(applyInfo, ms));

        const labels = meta.labelInfo || getLabel(rawDescr);
        const checks: Record<string, boolean> = {
            HDR10Plus: !!labels.hdr10plus || /HDR10\+/i.test(mediainfo),
            HDR10: !!labels.hdr10 || (!/HDR10\+/i.test(mediainfo) && /HDR10/i.test(mediainfo)),
            DolbyVision: !!labels.db || /Dolby Vision|DoVi/i.test(mediainfo),
            DolbyAtmos: /Dolby Atmos|Atmos/i.test(mediainfo)
        };
        Object.entries(checks).forEach(([name, on]) => {
            if (!on) return;
            const el = document.querySelector(`input[name="${name}"]`) as HTMLInputElement | null;
            if (el) {
                el.checked = true;
                dispatchFormEvents(el);
            }
        });

        try {
            const { TorrentService } = await import('../services/TorrentService');
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, HDT_ANNOUNCE);
            if (result) TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
        } catch (e) {
            console.error('[Auto-Feed][HDT] File Injection Failed:', e);
        }
    }
}
