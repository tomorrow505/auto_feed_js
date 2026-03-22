import { getSearchName } from './rules/search';
import { extractDoubanId, extractImdbId } from './rules/links';
import { TorrentMeta } from '../types/TorrentMeta';

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
    fontSize?: string;
    linkColor?: string;
    separator?: string;
}

const LEGACY_DEFAULT_SEARCH_TEMPLATES: string[] = [
    '<a href="https://passthepopcorn.me/torrents.php?searchstr={imdbid}" target="_blank">PTP</a>',
    '<a href="https://broadcasthe.net/torrents.php?action=advanced&imdb={imdbid}" target="_blank">BTN</a>',
    '<a href="https://hdbits.org/browse.php?search={imdbid}" target="_blank">HDB</a>',
    '<a href="https://karagarga.in/browse.php?search={imdbid}&search_type=imdb" target="_blank">KG</a>',
    '<a href="http://cinemageddon.net/browse.php?search={imdbid}&proj=0&descr=1" target="_blank">CG</a>',
    '<a href="https://filelist.io/browse.php?search={imdbid}" target="_blank">FileList</a>',
    '<a href="https://beyond-hd.me/torrents?imdb={imdbid}" target="_blank">BHD</a>',
    '<a href="https://blutopia.cc/torrents?imdbid={imdbno}&perPage=25&imdbId={imdbno}" target="_blank">BLU</a>',
    '<a href="https://secret-cinema.pw/torrents.php?action=advanced&searchsubmit=1&filter_cat=1&cataloguenumber={imdbid}" target="_blank">SC</a>',
    '<a href="https://darkland.top/torrents?imdbId={imdbid}#page/1" target="_blank">DarkLand</a>',
    '<a href="https://totheglory.im/browse.php?search_field=imdb{imdbno}&c=M" target="_blank">TTG</a>',
    '<a href="https://hd-torrents.org/torrents.php?&search={imdbid}&active=0" target="_blank">HDT</a>',
    '<a href="https://hd-space.org/index.php?page=torrents&search={imdbno}&active=1&options=2" target="_blank">HDSpace</a>',
    '<a href="http://hdroute.org/browse.php?action=s&imdb={imdbno}" target="_blank">HDR</a>',
    '<a href="https://hdf.world/torrents.php?searchstr={search_name}" target="_blank">HDF</a>',
    '<a href="https://privatehd.to/torrents?in=1&search={search_name}" target="_blank">PHD</a>',
    '<a href="https://avistaz.to/torrents?in=1&search={search_name}" target="_blank">AVZ</a>',
    '<a href="https://cinemaz.to/torrents?in=1&search={search_name}" target="_blank">CNZ</a>',
    '<a href="https://xthor.tk/browse.php?sch={search_name}" target="_blank">xTHOR</a>',
    '<a href="https://cinematik.net/torrents?imdbId={imdbid}#page/1" target="_blank">Tik</a>',
    '<a href="https://nzbs.in/search?query=imdb:{imdbid}" target="_blank">IN</a>',
    '<a href="https://search.douban.com/movie/subject_search?search_text={imdbid}" target="_blank">Douban</a>',
    '<a href="https://uhdbits.org/torrents.php?searchstr={imdbid}" target="_blank">UHD</a>',
    '<a href="http://zmk.pw/search?q={search_name}" target="_blank">ZMK</a>',
    '<a href="https://mediaarea.net/MediaInfoOnline" target="_blank">MediaiInfo</a>',
    '<a href="https://assrt.net/sub/?searchword={search_name}" target="_blank">SSW</a>',
    '<a href="https://eiga.moi/torrents?imdb={imdbno}#page/1" target="_blank">ACM</a>'
];

const LEGACY_EXTENDED_SEARCH_TEMPLATES: string[] = [
    '<a href="https://greatposterwall.com/torrents.php?searchstr={imdbid}" target="_blank">GPW</a>',
    '<a href="https://anthelion.me/torrents.php?order_by=time&order_way=desc&searchstr={search_name}&search_type=0&taglist=&tags_type=0" target="_blank">ANT</a>',
    '<a href="https://nebulance.io/torrents.php?order_by=time&order_way=desc&searchtext={search_name}&search_type=0&taglist=&tags_type=0" target="_blank">NBL</a>',
    '<a href="https://www.morethantv.me/torrents/browse?searchtext={search_name}" target="_blank">MTV</a>',
    '<a href="http://tv-vault.me/torrents.php?action=advanced&searchstr=&searchtags=&tags_type=1&groupdesc=&imdbid={imdbid}" target="_blank">TVV</a>',
    '<a href="https://open.cd/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={search_name}&search_area=0&search_mode=0" target="_blank">OpenCD</a>',
    '<a href="https://orpheus.network/torrents.php?searchstr={search_name}&tags_type=0&order=time&sort=desc&group_results=1&cleardefault=Clear+default&action=basic&searchsubmit=1" target="_blank">OPS</a>',
    '<a href="https://redacted.sh/torrents.php?searchstr={search_name}" target="_blank">RED</a>',
    '<a href="https://kp.m-team.cc/browse?keyword={search_name}" target="_blank">MTeam</a>',
    '<a href="https://aither.cc/torrents?imdbId={imdbid}#page/1" target="_blank">Aither</a>',
    '<a href="https://fearnopeer.com/torrents?imdbId={imdbid}#page/1" target="_blank">FNP</a>',
    '<a href="https://onlyencodes.cc/torrents?imdbId={imdbid}#page/1" target="_blank">OnlyEncodes</a>',
    '<a href="https://reelflix.xyz/torrents?imdbId={imdbid}#page/1" target="_blank">ReelFliX</a>',
    '<a href="https://monikadesign.uk/torrents?name={search_name}&imdbId={imdbno}&sortField=size" target="_blank">Monika</a>',
    '<a href="https://zhuque.in/torrent/search/{zhuque_payload}" target="_blank">ZHUQUE</a>',
    '<a href="https://www.agsvpt.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">AGSV</a>',
    '<a href="https://1ptba.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">1PTBA</a>',
    '<a href="https://52pt.site/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">52PT</a>',
    '<a href="https://audiences.me/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">Audiences</a>',
    '<a href="https://pt.btschool.club/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">BTSchool</a>',
    '<a href="https://byr.pt/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">BYR</a>',
    '<a href="https://carpt.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">CarPt</a>',
    '<a href="https://ptchdbits.co/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">CHDBits</a>',
    '<a href="https://springsunday.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">CMCT</a>',
    '<a href="https://discfan.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">DiscFan</a>',
    '<a href="https://www.dragonhd.xyz/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">Dragon</a>',
    '<a href="https://hdarea.club/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">HDArea</a>',
    '<a href="https://www.hddolby.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">HDDolby</a>',
    '<a href="https://hdsky.me/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">HDSky</a>',
    '<a href="https://pt.upxin.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">HDU</a>',
    '<a href="https://www.hitpt.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">HITPT</a>',
    '<a href="https://hudbt.hust.edu.cn/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">HUDBT</a>',
    '<a href="https://www.joyhd.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">JoyHD</a>',
    '<a href="https://nanyangpt.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">NanYang</a>',
    '<a href="https://www.nexushd.org/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">NexusHD</a>',
    '<a href="https://npupt.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">NPUPT</a>',
    '<a href="https://ourbits.club/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">OurBits</a>',
    '<a href="https://ptcafe.club/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">PTCafe</a>',
    '<a href="https://ptchina.org/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">PTChina</a>',
    '<a href="https://pterclub.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">PTer</a>',
    '<a href="https://www.pthome.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">PThome</a>',
    '<a href="https://ptsbao.club/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">PTsbao</a>',
    '<a href="https://www.pttime.org/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">PTT</a>',
    '<a href="https://pt.sjtu.edu.cn/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">PuTao</a>',
    '<a href="https://pt.soulvoice.club/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">SoulVoice</a>',
    '<a href="https://et8.org/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">TCCF</a>',
    '<a href="https://www.tjupt.org/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">TJUPT</a>',
    '<a href="http://pt.eastgame.org/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">TLFbits</a>',
    '<a href="https://pt.hdbd.us/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">YDY</a>',
    '<a href="https://pt.itzmx.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">ITZMX</a>',
    '<a href="https://zmpt.cc/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">ZMPT</a>',
    '<a href="https://www.icc2022.com/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">ICC</a>',
    '<a href="https://cyanbug.net/torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0" target="_blank">CyanBug</a>',
    '<a href="https://www.yemapt.org/browse?keyword={search_name}" target="_blank">YemaPT</a>'
];

export const DEFAULT_QUICK_SEARCH_TEMPLATES: string[] = Array.from(
    new Set([...LEGACY_DEFAULT_SEARCH_TEMPLATES, ...LEGACY_EXTENDED_SEARCH_TEMPLATES])
);

const resolveSearchName = (meta: Partial<TorrentMeta>): string => {
    const searchNameRaw = getSearchName(meta.title || '', meta.type) || meta.title || '';
    if (!(meta.title || '').match(/S\d+/i)) return searchNameRaw;
    const number = (meta.title || '').match(/S(\d+)/i)?.[1];
    if (!number) return searchNameRaw;
    return `${searchNameRaw} Season ${parseInt(number, 10)}`;
};

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

const replaceToken = (text: string, key: string, value: string): string => {
    return text.replace(new RegExp(`\\{${key}\\}`, 'gi'), value || '');
};

const buildZhuquePayload = (searchName: string): string => {
    const payload = {
        page: 1,
        size: 20,
        type: 'title',
        sorter: 'id',
        order: 'desc',
        keyword: searchName.trim() || 'PTer',
        tags: [],
        category: [],
        medium: [],
        videoCoding: [],
        audioCoding: [],
        resolution: [],
        group: [],
        more: false
    };
    try {
        return window.btoa(encodeURIComponent(JSON.stringify(payload)));
    } catch {
        return '';
    }
};

const maybeRewriteAvistazFamilySearch = (url: string, meta: Partial<TorrentMeta>, imdbId: string): string => {
    if (!imdbId) return url;
    if (!url.match(/avistaz|privatehd|cinemaz/i)) return url;
    if (!url.match(/torrents\?in=1/i)) return url;

    const isSeries =
        meta.type === '剧集' ||
        meta.type === '综艺' ||
        !!(meta.title || '').match(/S\d+|E\d+/i);

    if (isSeries) {
        return url.replace(/torrents\?in=1&.*/i, 'tv-shows?search=&imdb={imdbid}');
    }
    return url.replace(/torrents\?in=1&.*/i, 'movies?search=&imdb={imdbid}');
};

export const getQuickSearchPresetLabel = (line: string): string => {
    const anchorText = line.match(/>([^<]+)<\/a>/i)?.[1];
    if (anchorText) return anchorText.trim();
    const pipe = line.split('|');
    if (pipe.length > 1) return pipe[0].trim();
    try {
        return new URL(line).hostname.replace(/^www\./, '');
    } catch {
        return line;
    }
};

const fillTemplate = (url: string, name: string, meta: Partial<TorrentMeta>): string => {
    const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
    const imdbNo = imdbId.replace(/^tt/i, '');
    const doubanId = meta.doubanId || extractDoubanId(meta.doubanUrl || '') || '';
    const searchName = resolveSearchName(meta);
    const encodedSearchName = encodeURIComponent(searchName);

    let out = maybeRewriteAvistazFamilySearch(url, meta, imdbId);

    if ((name || '').toUpperCase() === 'ZHUQUE' || out.match(/\{zhuque_payload\}/i)) {
        const b64 = buildZhuquePayload(searchName);
        if (b64) {
            out = 'https://zhuque.in/torrent/search/{zhuque_payload}';
            out = replaceToken(out, 'zhuque_payload', b64);
        }
    }

    out = replaceToken(out, 'imdbid', imdbId);
    out = replaceToken(out, 'imdbno', imdbNo);
    out = replaceToken(out, 'search_name', encodedSearchName);
    out = replaceToken(out, 'searchstr', encodedSearchName);
    out = replaceToken(out, 'name', encodedSearchName);
    out = replaceToken(out, 'title', encodeURIComponent(meta.title || ''));
    out = replaceToken(out, 'doubanid', doubanId);
    out = replaceToken(out, 'dbid', doubanId);

    if (!out.match(/^https?:\/\//i)) return '';
    if (out.match(/\{(imdbid|imdbno)\}/i)) return '';
    if (out.match(/\{(search_name|searchstr|name|title|doubanid|dbid|zhuque_payload)\}/i)) return '';
    return out;
};

export const buildQuickSearchItems = (lines: string[], meta: Partial<TorrentMeta>): QuickSearchItem[] => {
    const items: QuickSearchItem[] = [];
    const cleaned = (lines || []).map((l) => l.trim()).filter((l) => l && !l.startsWith('#'));

    cleaned.forEach((line) => {
        const parsed = extractFromAnchor(line) || extractFromPipe(line) || extractFromUrl(line);
        if (!parsed) return;
        const filled = fillTemplate(parsed.url, parsed.name, meta);
        if (!filled) return;
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
    const label = options?.labelText ?? (lang === 'zh' ? '快速搜索：' : 'Quick Search:');
    const fontColor = options?.fontColor || 'red';
    const className = options?.className || 'autofeed-search-links';
    const align = options?.alignCenter === false ? '' : ' align="center"';
    const borderCss = options?.bordered === false ? '' : 'border: 1px solid blue;';
    const fontSizeCss = options?.fontSize ? `font-size: ${options.fontSize};` : '';
    const style = `${borderCss} ${fontSizeCss}`.trim();
    const separator = options?.separator ?? ' | ';
    const linkStyle = options?.linkColor ? ` style="color:${options.linkColor}"` : '';
    const links = items.map((it) => `<a href="${it.url}" target="_blank"${linkStyle}>${it.name}</a>`).join(separator);
    return `<div${align} style="${style}" class="${className}"><font color="${fontColor}">${label}${links}</font></div>`;
};
