import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteCatalogService } from './SiteCatalogService';
import { SiteConfig, SiteType } from '../types/SiteConfig';
import { getSearchName } from '../common/legacy/search';

export interface ForwardLinkOptions {
    chdBaseUrl?: string;
}

const getMTeamBase = (site?: SiteConfig) => {
    if (window.location.host.includes('m-team')) {
        return `${window.location.protocol}//${window.location.host}/`;
    }
    return site?.baseUrl || 'https://kp.m-team.cc/';
};

const normalizeBaseUrl = (base?: string) => {
    if (!base) return '';
    return base.endsWith('/') ? base : `${base}/`;
};

const resolveBaseUrl = (site: SiteConfig, options?: ForwardLinkOptions) => {
    if (site.name === 'MTeam') return getMTeamBase(site);
    if (site.type === SiteType.CHDBits && options?.chdBaseUrl) {
        return normalizeBaseUrl(options.chdBaseUrl);
    }
    return normalizeBaseUrl(site.baseUrl);
};

const joinUrl = (base: string, path: string) => {
    if (!base.endsWith('/')) base += '/';
    if (path.startsWith('/')) path = path.slice(1);
    return `${base}${path}`;
};

const buildUploadUrl = (site: SiteConfig, options?: ForwardLinkOptions): string => {
    const base = resolveBaseUrl(site, options);
    if (!base) return '#';
    if (site.name === 'BHD') return joinUrl(base, 'upload');
    if (site.name === 'MTeam') return joinUrl(base, 'upload');
    if (site.type === SiteType.Unit3D || site.type === SiteType.Unit3DClassic) return joinUrl(base, 'torrents/create');
    if (site.type === SiteType.Gazelle) return joinUrl(base, 'upload.php');
    if (site.type === SiteType.NexusPHP || site.type === SiteType.CHDBits) return joinUrl(base, 'upload.php');
    return joinUrl(base, 'upload.php');
};

const buildSearchUrl = (site: SiteConfig, meta: TorrentMeta, options?: ForwardLinkOptions): string => {
    const base = resolveBaseUrl(site, options);
    if (!base) return '#';
    const imdbId = meta.imdbId || meta.imdbUrl?.match(/tt\d+/)?.[0] || '';
    const imdbNo = imdbId.replace(/^tt/i, '');
    const searchName = encodeURIComponent(getSearchName(meta.title || '', meta.type) || meta.title || '');

    const specialMap: Record<string, () => string> = {
        BHD: () => imdbId ? joinUrl(base, `torrents?imdb=${imdbId}`) : joinUrl(base, `torrents?search=${searchName}`),
        BLU: () => imdbNo ? joinUrl(base, `torrents?imdbid=${imdbNo}&perPage=25&imdbId=${imdbNo}`) : joinUrl(base, `torrents?search=${searchName}`),
        Tik: () => imdbId ? joinUrl(base, `torrents?imdbId=${imdbId}#page/1`) : joinUrl(base, `torrents?search=${searchName}`),
        DarkLand: () => imdbId ? joinUrl(base, `torrents?imdbId=${imdbId}#page/1`) : joinUrl(base, `torrents?search=${searchName}`),
        ACM: () => imdbNo ? joinUrl(base, `torrents?imdb=${imdbNo}#page/1`) : joinUrl(base, `torrents?search=${searchName}`),
        TTG: () => imdbNo ? joinUrl(base, `browse.php?search_field=imdb${imdbNo}&c=M`) : joinUrl(base, `browse.php?search_field=${searchName}`),
        MTeam: () => joinUrl(base, `browse?keyword=${encodeURIComponent(imdbId || meta.title || '')}`),
        PTP: () => imdbId ? joinUrl(base, `torrents.php?searchstr=${imdbId}`) : joinUrl(base, `torrents.php?searchstr=${searchName}`),
        HDB: () => joinUrl(base, `browse.php?search=${imdbId || searchName}`),
        KG: () => imdbId ? joinUrl(base, `browse.php?search=${imdbId}&search_type=imdb`) : joinUrl(base, `browse.php?search=${searchName}`)
    };
    if (specialMap[site.name]) return specialMap[site.name]();

    if (site.type === SiteType.Unit3D || site.type === SiteType.Unit3DClassic) {
        if (imdbId) return joinUrl(base, `torrents?imdbId=${imdbId}#page/1`);
        return joinUrl(base, `torrents?search=${searchName}`);
    }
    if (site.type === SiteType.Gazelle) {
        return joinUrl(base, `torrents.php?searchstr=${imdbId || searchName}`);
    }
    if (site.type === SiteType.NexusPHP || site.type === SiteType.CHDBits) {
        return joinUrl(base, `torrents.php?search=${imdbId || searchName}`);
    }
    return joinUrl(base, `torrents.php?search=${imdbId || searchName}`);
};

export class ForwardLinkService {
    static getSearchUrl(site: SiteConfig, meta: TorrentMeta, options?: ForwardLinkOptions): string {
        return buildSearchUrl(site, meta, options);
    }

    static injectForwardLinks(
        container: JQuery,
        meta: TorrentMeta,
        enabledSites?: string[],
        favoriteSites?: string[],
        options?: ForwardLinkOptions
    ) {
        const allSites = SiteCatalogService.getAllSites().filter((s) => s.baseUrl);
        const enabled = enabledSites && enabledSites.length ? new Set(enabledSites) : null;
        const sites = enabled ? allSites.filter((s) => enabled.has(s.name)) : allSites;

        if (!sites.length) return;

        const row = $('<div class="autofeed-forward-links" style="margin: 10px 0; padding: 10px; border-top: 1px solid #eee; font-size: 13px;"></div>');
        const header = $('<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;"></div>');
        header.append('<div style="color:#2c3e50; font-weight:bold;">转发站点：</div>');

        const tabWrap = $('<div style="margin-left:auto; display:flex; gap:6px;"></div>');
        const tabUpload = $('<button style="padding:2px 8px; border:1px solid #ddd; background:#2c3e50; color:#fff; border-radius:4px; cursor:pointer;">发布</button>');
        const tabSearch = $('<button style="padding:2px 8px; border:1px solid #ddd; background:#f5f5f5; color:#333; border-radius:4px; cursor:pointer;">检索</button>');
        tabWrap.append(tabUpload, tabSearch);
        header.append(tabWrap);
        row.append(header);

        const uploadDiv = $('<div style="display:flex; flex-direction:column; gap:6px;"></div>');
        const searchDiv = $('<div style="display:none; flex-direction:column; gap:6px;"></div>');

        const favoritesSet = new Set(favoriteSites || []);
        const favSites = sites.filter((s) => favoritesSet.has(s.name));
        const otherSites = sites.filter((s) => !favoritesSet.has(s.name));

        const buildRow = (label: string, siteList: SiteConfig[], mode: 'upload' | 'search') => {
            if (!siteList.length) return null;
            const rowWrap = $('<div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;"></div>');
            rowWrap.append(`<span style="color:#666; font-weight:bold;">${label}:</span>`);
            siteList.forEach((site) => {
                const base = resolveBaseUrl(site, options);
                const icon = base ? `${base}favicon.ico` : '';
                const url = mode === 'upload' ? buildUploadUrl(site, options) : buildSearchUrl(site, meta, options);
                const name = site.name;
                const link = $(`
                    <a href="${url}" target="_blank" title="${name}" style="text-decoration:none; color:#333; display:flex; align-items:center; gap:4px;">
                        ${icon ? `<img src="${icon}" style="width:16px; height:16px; border-radius:2px;">` : ''}
                        <span>${name}</span>
                    </a>
                `);
                rowWrap.append(link);
            });
            return rowWrap;
        };

        const uploadFavRow = buildRow('常用', favSites, 'upload');
        const uploadAllRow = buildRow('全部', otherSites.length ? otherSites : sites, 'upload');
        if (uploadFavRow) uploadDiv.append(uploadFavRow);
        if (uploadAllRow) uploadDiv.append(uploadAllRow);

        const searchFavRow = buildRow('常用', favSites, 'search');
        const searchAllRow = buildRow('全部', otherSites.length ? otherSites : sites, 'search');
        if (searchFavRow) searchDiv.append(searchFavRow);
        if (searchAllRow) searchDiv.append(searchAllRow);

        tabUpload.on('click', () => {
            tabUpload.css({ background: '#2c3e50', color: '#fff' });
            tabSearch.css({ background: '#f5f5f5', color: '#333' });
            uploadDiv.show();
            searchDiv.hide();
        });
        tabSearch.on('click', () => {
            tabSearch.css({ background: '#2c3e50', color: '#fff' });
            tabUpload.css({ background: '#f5f5f5', color: '#333' });
            uploadDiv.hide();
            searchDiv.show();
        });

        row.append(uploadDiv);
        row.append(searchDiv);

        container.append(row);
    }
}
