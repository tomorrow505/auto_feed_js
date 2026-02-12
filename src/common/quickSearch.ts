import { getSearchName } from './rules/search';
import { extractDoubanId, extractImdbId } from './rules/links';
import { TorrentMeta } from '../types/TorrentMeta';

export const DEFAULT_QUICK_SEARCH_TEMPLATES: string[] = [
    '<a href="https://passthepopcorn.me/torrents.php?searchstr={imdbid}" target="_blank">PTP</a>',
    '<a href="https://hdbits.org/browse.php?search={imdbid}" target="_blank">HDB</a>',
    '<a href="https://karagarga.in/browse.php?search={imdbid}&search_type=imdb" target="_blank">KG</a>',
    '<a href="https://beyond-hd.me/torrents?imdb={imdbid}" target="_blank">BHD</a>',
    '<a href="https://blutopia.xyz/torrents?imdbid={imdbno}&perPage=25&imdbId={imdbno}" target="_blank">BLU</a>',
    '<a href="https://totheglory.im/browse.php?search_field=imdb{imdbno}&c=M" target="_blank">TTG</a>',
    '<a href="https://chdbits.co/torrents.php?search={imdbid}&search_area=4&search_mode=0" target="_blank">CHD</a>',
    '<a href="https://springsunday.net/torrents.php?search={imdbid}&search_area=4&search_mode=0" target="_blank">CMCT</a>',
    '<a href="https://hdsky.me/torrents.php?search={imdbid}&search_area=4&search_mode=0" target="_blank">HDSky</a>',
    '<a href="https://search.douban.com/movie/subject_search?search_text={imdbid}&cat=1002" target="_blank">Douban</a>',
    '<a href="https://www.imdb.com/title/{imdbid}/" target="_blank">IMDb</a>'
];

export interface QuickSearchItem {
    name: string;
    url: string;
}

export interface QuickSearchRenderOptions {
    lang?: 'zh' | 'en';
    className?: string;
    alignCenter?: boolean;
    bordered?: boolean;
    fontColor?: string;
    labelText?: string;
}

const extractFromAnchor = (line: string): { name: string; url: string } | null => {
    const href = line.match(/href=["']([^"']+)["']/i)?.[1];
    const text = line.match(/>([^<]+)<\/a>/i)?.[1];
    if (!href) return null;
    return { name: (text || href).trim(), url: href.trim() };
};

const extractFromPipe = (line: string): { name: string; url: string } | null => {
    const parts = line.split('|');
    if (parts.length < 2) return null;
    const name = parts[0].trim();
    const url = parts.slice(1).join('|').trim();
    if (!url) return null;
    return { name: name || url, url };
};

const extractFromUrl = (line: string): { name: string; url: string } | null => {
    if (!line.match(/^https?:\/\//i)) return null;
    try {
        const u = new URL(line);
        return { name: u.hostname.replace(/^www\./, ''), url: line };
    } catch {
        return null;
    }
};

const fillTemplate = (url: string, meta: Partial<TorrentMeta>): string => {
    const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
    const imdbNo = imdbId.replace(/^tt/i, '');
    const doubanId = meta.doubanId || extractDoubanId(meta.doubanUrl || '') || '';
    const searchNameRaw = getSearchName(meta.title || '', meta.type) || meta.title || '';
    let searchName = searchNameRaw;
    if ((meta.title || '').match(/S\d+/i)) {
        const number = (meta.title || '').match(/S(\d+)/i)?.[1];
        if (number) searchName = `${searchName} Season ${parseInt(number, 10)}`;
    }
    const replacements: Record<string, string> = {
        '{imdbid}': imdbId,
        '{imdbno}': imdbNo,
        '{doubanid}': doubanId,
        '{dbid}': doubanId,
        '{search_name}': encodeURIComponent(searchName),
        '{searchstr}': encodeURIComponent(searchName),
        '{title}': encodeURIComponent(meta.title || '')
    };

    let out = url;
    Object.entries(replacements).forEach(([key, value]) => {
        out = out.split(key).join(value || '');
    });
    return out;
};

export const buildQuickSearchItems = (lines: string[], meta: Partial<TorrentMeta>): QuickSearchItem[] => {
    const items: QuickSearchItem[] = [];
    const cleaned = (lines || []).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));
    cleaned.forEach((line) => {
        const parsed =
            extractFromAnchor(line) ||
            extractFromPipe(line) ||
            extractFromUrl(line);
        if (!parsed) return;
        const filled = fillTemplate(parsed.url, meta);
        if (filled.match(/\{(imdbid|imdbno|search_name|searchstr|title|doubanid|dbid)\}/)) return;
        items.push({ name: parsed.name, url: filled });
    });
    return items;
};

export const resolveQuickSearchList = (quickSearchList?: string[], quickSearchPresets?: string[]): string[] => {
    if (Array.isArray(quickSearchList) && quickSearchList.length) return quickSearchList;
    if (Array.isArray(quickSearchPresets) && quickSearchPresets.length) return quickSearchPresets;
    return DEFAULT_QUICK_SEARCH_TEMPLATES;
};

export const resolveQuickSearchSetting = (
    settings?: { quickSearchList?: string[]; quickSearchPresets?: string[]; uiLanguage?: string } | null
) => {
    const lang: 'zh' | 'en' = settings?.uiLanguage === 'en' ? 'en' : 'zh';
    return {
        quickSearchList: Array.isArray(settings?.quickSearchList) ? settings?.quickSearchList : undefined,
        quickSearchPresets: Array.isArray(settings?.quickSearchPresets) ? settings?.quickSearchPresets : undefined,
        lang
    };
};

export const renderQuickSearchHtml = (
    meta: Partial<TorrentMeta>,
    quickSearchList?: string[],
    quickSearchPresets?: string[],
    options?: QuickSearchRenderOptions
): string => {
    const list = resolveQuickSearchList(quickSearchList, quickSearchPresets);
    const items = buildQuickSearchItems(list, meta);
    if (!items.length) return '';

    const lang = options?.lang || 'zh';
    const label = options?.labelText || (lang === 'zh' ? '快速搜索：' : 'Quick Search:');
    const fontColor = options?.fontColor || 'red';
    const className = options?.className || 'search_urls autofeed-search-links';
    const align = options?.alignCenter === false ? '' : ' align="center"';
    const borderCss = options?.bordered === false ? '' : 'border: 1px solid blue;';
    const style = `${borderCss}`.trim();
    const links = items.map((it) => `<a href="${it.url}" target="_blank">${it.name}</a>`).join(' | ');
    return `<div${align} style="${style}" class="${className}"><font color="${fontColor}">${label}${links}</font></div>`;
};
