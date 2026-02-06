import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteCatalogService } from './SiteCatalogService';
import { SiteConfig, SiteType } from '../types/SiteConfig';
import { getSearchName } from '../common/legacy/search';

export interface ForwardLinkOptions {
    chdBaseUrl?: string;
    lang?: 'zh' | 'en';
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
        const lang = options?.lang || 'zh';
        const t = lang === 'zh' ? {
            title: '转发站点：',
            mode: '模式:',
            upload: '发布',
            search: '检索',
            fav: '常用',
            other: '其他',
            sites: '站点',
            exclusive: '[疑似禁转/禁止转载]',
            exclusiveTo: (name: string) => `禁转至${name}`,
            confirmExclusive: '该资源疑似禁转/禁止转载，确认仍要打开发布页面？'
        } : {
            title: 'Targets:',
            mode: 'Mode:',
            upload: 'Upload',
            search: 'Search',
            fav: 'Favorites',
            other: 'Others',
            sites: 'Sites',
            exclusive: '[Possibly Exclusive/No-Reupload]',
            exclusiveTo: (name: string) => `No-reupload to ${name}`,
            confirmExclusive: 'This torrent looks exclusive/no-reupload. Still open the upload page?'
        };

        const detectExclusive = (m: TorrentMeta) => {
            const text = `${m.title || ''} ${m.smallDescr || ''} ${m.subtitle || ''} ${m.description || ''}`
                .replace(/\[.*?\]/g, '');
            return !!text.match(/(拒绝转发|不允许转发|严禁转发|谢绝.*?转载|禁转|禁止转载|謝絕.*?轉載|exclusive|严禁转载)/i);
        };
        const isExclusive = detectExclusive(meta);

        const allSites = SiteCatalogService.getAllSites().filter((s) => s.baseUrl);
        // If settings provides an array (even empty), treat it as the source of truth.
        // Empty means "show nothing" rather than "show all".
        const enabledSet = Array.isArray(enabledSites) ? new Set(enabledSites) : null;
        const sites = enabledSet ? allSites.filter((s) => enabledSet.has(s.name)) : allSites;

        if (!sites.length) return;

        const row = $('<div class="autofeed-forward-links" style="margin: 10px 0; padding: 10px; border-top: 1px solid #eee; font-size: 13px;"></div>');
        const header = $('<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;"></div>');
        header.append(`<div style="color:#2c3e50; font-weight:bold;">${t.title}</div>`);
        if (isExclusive) {
            header.append(`<div style="color:#c0392b; font-weight:bold;">${t.exclusive}</div>`);
        }

        const tabWrap = $(`
            <div style="margin-left:auto; display:flex; align-items:center; gap:8px;">
                <span style="color:#666; font-weight:bold;">${t.mode}</span>
            </div>
        `);
        const seg = $('<div role="tablist" style="display:inline-flex; border:1px solid #cfd6dc; border-radius:999px; overflow:hidden; background:#f0f2f4;"></div>');
        const tabUpload = $(`<button role="tab" aria-pressed="true" style="padding:3px 10px; border:none; background:#2c3e50; color:#fff; cursor:pointer; font-weight:bold;">${t.upload}</button>`);
        const tabSearch = $(`<button role="tab" aria-pressed="false" style="padding:3px 10px; border:none; background:transparent; color:#2c3e50; cursor:pointer; font-weight:bold;">${t.search}</button>`);
        seg.append(tabUpload, tabSearch);
        tabWrap.append(seg);
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
                if (isExclusive && mode === 'upload') {
                    link.css({ color: '#999' });
                    link.find('span').text(t.exclusiveTo(name));
                    link.on('click', (e) => {
                        const ok = window.confirm(t.confirmExclusive);
                        if (!ok) e.preventDefault();
                    });
                }

                // Lazy torrent download: only when user actually clicks a target upload link.
                // "Forward" click should only open the popup and never download.
                if (mode === 'upload') {
                    link.on('click', (e) => {
                        // Keep exclusive confirm behavior: if canceled, stop here.
                        if (isExclusive) {
                            const ok = window.confirm(t.confirmExclusive);
                            if (!ok) {
                                e.preventDefault();
                                return;
                            }
                        }

                        // Always handle ourselves so we can persist latest meta before navigation.
                        e.preventDefault();
                        e.stopPropagation();

                        const win = window.open('about:blank', '_blank');
                        const go = () => {
                            try {
                                if (win) win.location.href = url;
                                else window.open(url, '_blank');
                            } catch {
                                window.open(url, '_blank');
                            }
                        };

                        const span = link.find('span');
                        const originalText = span.text();
                        span.text(lang === 'zh' ? '准备中...' : 'Preparing...');

                        (async () => {
                            try {
                                const metaToSave: any = { ...meta };
                                // Download torrent only if we have a URL and no cached base64 yet.
                                if (metaToSave.torrentUrl && !metaToSave.torrentBase64) {
                                    span.text(lang === 'zh' ? '下载种子...' : 'Downloading...');
                                    const { TorrentService } = await import('./TorrentService');
                                    const base64 = await TorrentService.download(metaToSave.torrentUrl);
                                    metaToSave.torrentBase64 = base64;
                                    if (!metaToSave.torrentFilename) {
                                        const safeName = String(metaToSave.title || 'autofeed').replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);
                                        metaToSave.torrentFilename = `${safeName}.torrent`;
                                    }
                                }
                                const { StorageService } = await import('./StorageService');
                                await StorageService.save(metaToSave);
                            } catch {
                                // best-effort; still navigate
                            } finally {
                                span.text(originalText);
                                go();
                            }
                        })();
                    });
                }
                rowWrap.append(link);
            });
            return rowWrap;
        };

        if (favSites.length) {
            const uploadFavRow = buildRow(t.fav, favSites, 'upload');
            const uploadOtherRow = buildRow(t.other, otherSites, 'upload');
            if (uploadFavRow) uploadDiv.append(uploadFavRow);
            if (uploadOtherRow) uploadDiv.append(uploadOtherRow);

            const searchFavRow = buildRow(t.fav, favSites, 'search');
            const searchOtherRow = buildRow(t.other, otherSites, 'search');
            if (searchFavRow) searchDiv.append(searchFavRow);
            if (searchOtherRow) searchDiv.append(searchOtherRow);
        } else {
            const uploadAllRow = buildRow(t.sites, sites, 'upload');
            const searchAllRow = buildRow(t.sites, sites, 'search');
            if (uploadAllRow) uploadDiv.append(uploadAllRow);
            if (searchAllRow) searchDiv.append(searchAllRow);
        }

        tabUpload.on('click', () => {
            tabUpload.attr('aria-pressed', 'true');
            tabSearch.attr('aria-pressed', 'false');
            tabUpload.css({ background: '#2c3e50', color: '#fff' });
            tabSearch.css({ background: 'transparent', color: '#2c3e50' });
            uploadDiv.show();
            searchDiv.hide();
        });
        tabSearch.on('click', () => {
            tabUpload.attr('aria-pressed', 'false');
            tabSearch.attr('aria-pressed', 'true');
            tabSearch.css({ background: '#2c3e50', color: '#fff' });
            tabUpload.css({ background: 'transparent', color: '#2c3e50' });
            uploadDiv.hide();
            searchDiv.show();
        });

        row.append(uploadDiv);
        row.append(searchDiv);

        container.append(row);
    }
}
