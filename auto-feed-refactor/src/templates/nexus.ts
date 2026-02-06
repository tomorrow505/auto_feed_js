import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';

export async function parseNexus(config: SiteConfig, currentUrl: string): Promise<TorrentMeta> {
    // Default selectors for NexusPHP
    const selectors = {
        title: '#top',
        titleFallback: 'td.rowhead:contains("Title") + td, td.rowhead:contains("标题") + td',
        description: '#kdescr, #description',
        descriptionFallback: 'td.rowhead:contains("Description") + td, td.rowhead:contains("简介") + td',
        category: 'td.rowhead:contains("Type") + td, td.rowhead:contains("类型") + td'
    };

    const configSelectors = config.selectors || {};

    const getText = (selector: string | string[] | undefined): string => {
        if (!selector) return '';
        if (Array.isArray(selector)) {
            for (const s of selector) {
                const el = $(s);
                const val = el.text().trim();
                if (el.length && val) return val;
            }
            return '';
        }
        return $(selector).text().trim();
    };

    const getElement = (selector: string | string[] | undefined): Element | null => {
        if (!selector) return null;
        if (Array.isArray(selector)) {
            for (const s of selector) {
                const el = $(s);
                if (el.length) return el[0];
            }
            return null;
        }
        const el = $(selector);
        return el.length ? el[0] : null;
    };

    let title = getText(configSelectors.title) || $(selectors.title).text().trim();
    if (!title) {
        title = $(selectors.titleFallback).text().trim();
    }
    title = title.replace(/\[.*?\]/g, '').trim();

    const descrEl =
        getElement(configSelectors.description) ||
        getElement(selectors.description) ||
        getElement(selectors.descriptionFallback);
    const description = descrEl ? htmlToBBCode(descrEl) : '';

    const meta: TorrentMeta = {
        title,
        subtitle: getText(configSelectors.subtitle) || '',
        description,
        sourceSite: config.name,
        sourceUrl: currentUrl,
        images: []
    };

    if (meta.subtitle === '') delete meta.subtitle;

    const imdbMatch = description.match(/tt\d{7,8}/);
    if (imdbMatch) meta.imdbId = imdbMatch[0];

    const doubanMatch = description.match(/douban.com\/subject\/(\d+)/);
    if (doubanMatch) meta.doubanId = doubanMatch[1];

    // Extract Torrent URL
    const downloadLink = $('a[href*="download.php"], a[href*="download/torrent"]');
    if (downloadLink.length) {
        const relativeUrl = downloadLink.attr('href') || '';
        if (relativeUrl && !relativeUrl.startsWith('http')) {
            const urlObj = new URL(relativeUrl, currentUrl);
            meta.torrentUrl = urlObj.href;
        } else {
            meta.torrentUrl = relativeUrl;
        }
    }

    // Basic category as type if present
    const typeText = getText(configSelectors.subtitle) || $(selectors.category).text().trim();
    if (typeText && !meta.type) {
        meta.type = typeText;
    }

    return meta;
}

export async function fillNexus(meta: TorrentMeta, config: SiteConfig): Promise<void> {
    const formSelectors = {
        name: 'input[name="name"]',
        smallDescr: 'input[name="small_descr"]',
        descr: 'textarea[name="descr"]',
        imdb: 'input[name="imdb_id"], input[name="url"][type="text"]',
        douban: 'input[name="douban_id"]',
        torrent: 'input[type="file"]#file, input[name="file"], input[name="torrent"]'
    };

    const overrides = config.selectors || {};

    $(overrides.nameInput || formSelectors.name).val(meta.title);
    $(overrides.smallDescrInput || formSelectors.smallDescr).val(meta.subtitle || meta.smallDescr || '');
    $(overrides.descrInput || formSelectors.descr).val(meta.description);

    if (meta.imdbId || meta.imdbUrl) {
        $(overrides.imdbInput || formSelectors.imdb).val(meta.imdbId || meta.imdbUrl || '');
    }
    if (meta.doubanId || meta.doubanUrl) {
        $(overrides.doubanInput || formSelectors.douban).val(meta.doubanId || meta.doubanUrl || '');
    }

    if (meta.torrentBase64 || meta.torrentUrl) {
        const fileInputSelector = overrides.torrentInput || formSelectors.torrent;
        const fileInput = $(fileInputSelector)[0] as HTMLInputElement | undefined;
        if (fileInput) {
            try {
                const { TorrentService } = await import('../services/TorrentService');
                const result = await TorrentService.buildForwardTorrentFile(meta, config.name, null);
                if (result) {
                    TorrentService.injectFileIntoInput(fileInput, result.file);
                } else if (meta.torrentBase64 && meta.torrentFilename) {
                    const file = TorrentService.base64ToFile(meta.torrentBase64, meta.torrentFilename);
                    TorrentService.injectFileIntoInput(fileInput, file);
                }
            } catch (e) {
                console.error('[Auto-Feed] File Injection Failed:', e);
            }
        }
    }

    // ---- generic selects (best-effort) ----
    const pickOption = (selectName: string, keywords: (string | RegExp)[]) => {
        const select = document.querySelector(`select[name="${selectName}"]`) as HTMLSelectElement | null;
        if (!select) return;
        const opts = Array.from(select.options);
        const matchOpt = (opt: HTMLOptionElement) => {
            const text = opt.textContent?.trim() || '';
            return keywords.some((k) => (typeof k === 'string' ? text.includes(k) : k.test(text)));
        };
        const found = opts.find(matchOpt);
        if (found) found.selected = true;
    };

    const typeMap: Record<string, (string | RegExp)[]> = {
        电影: [/Movie/i, /电影/],
        剧集: [/TV/i, /Series/i, /剧集/],
        纪录: [/Doc/i, /纪录/],
        综艺: [/Variety/i, /综艺/],
        动漫: [/Anime/i, /动画|動漫/],
        音乐: [/Music/i, /音乐/],
        体育: [/Sport/i, /体育/],
        MV: [/MV/i, /Music Video/i],
        书籍: [/Book/i, /书籍/],
        游戏: [/Game/i, /游戏/],
        软件: [/Software/i, /软件/],
        学习: [/Study/i, /学习/]
    };

    if (meta.type && typeMap[meta.type]) {
        pickOption('type', typeMap[meta.type]);
        pickOption('category', typeMap[meta.type]);
        pickOption('cat', typeMap[meta.type]);
        pickOption('category_id', typeMap[meta.type]);
    }

    const mediumMap: Record<string, (string | RegExp)[]> = {
        UHD: [/UHD/i, /4K/i],
        'Blu-ray': [/Blu[- ]?ray/i, /BD/i],
        Remux: [/Remux/i],
        Encode: [/Encode/i, /BDRip/i, /WEBRip/i],
        'WEB-DL': [/WEB[- ]?DL/i],
        HDTV: [/HDTV/i],
        DVD: [/DVD/i],
        CD: [/CD/i]
    };
    if (meta.mediumSel && mediumMap[meta.mediumSel]) {
        pickOption('medium_sel', mediumMap[meta.mediumSel]);
        pickOption('medium', mediumMap[meta.mediumSel]);
    }

    const standardMap: Record<string, (string | RegExp)[]> = {
        '8K': [/8K/i, /4320p/i],
        '4K': [/4K/i, /2160p/i],
        '1080p': [/1080p/i],
        '1080i': [/1080i/i],
        '720p': [/720p/i],
        SD: [/SD/i, /480/i, /576/i]
    };
    if (meta.standardSel && standardMap[meta.standardSel]) {
        pickOption('standard_sel', standardMap[meta.standardSel]);
        pickOption('standard', standardMap[meta.standardSel]);
    }

    const codecMap: Record<string, (string | RegExp)[]> = {
        H264: [/H\.?264/i, /AVC/i, /x264/i],
        X264: [/x264/i],
        H265: [/H\.?265/i, /HEVC/i, /x265/i],
        X265: [/x265/i],
        'VC-1': [/VC-?1/i],
        'MPEG-2': [/MPEG-?2/i],
        XVID: [/XVID/i]
    };
    if (meta.codecSel && codecMap[meta.codecSel]) {
        pickOption('codec_sel', codecMap[meta.codecSel]);
        pickOption('codec', codecMap[meta.codecSel]);
    }

    const audioMap: Record<string, (string | RegExp)[]> = {
        'DTS-HDMA:X 7.1': [/DTS[- ]?X/i],
        'DTS-HDMA': [/DTS[- ]?HD/i, /DTS[- ]?MA/i],
        'DTS-HDHR': [/DTS[- ]?HR/i],
        Atmos: [/Atmos/i],
        TrueHD: [/TrueHD/i],
        DTS: [/DTS/i],
        AC3: [/AC-?3/i, /Dolby Digital/i, /DD/i],
        AAC: [/AAC/i],
        LPCM: [/LPCM/i, /PCM/i],
        Flac: [/FLAC/i],
        APE: [/APE/i],
        WAV: [/WAV/i],
        MP3: [/MP3/i]
    };
    if (meta.audioCodecSel && audioMap[meta.audioCodecSel]) {
        pickOption('audiocodec_sel', audioMap[meta.audioCodecSel]);
        pickOption('audio', audioMap[meta.audioCodecSel]);
    }
}
