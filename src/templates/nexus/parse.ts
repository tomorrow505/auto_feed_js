import $ from 'jquery';
import { TorrentMeta } from '../../types/TorrentMeta';
import { SiteConfig } from '../../types/SiteConfig';
import { htmlToBBCode } from '../../utils/htmlToBBCode';
import { dealWithTitle } from '../../common/rules/title';
import { extractDoubanId, extractImdbId, extractTmdbId, matchLink } from '../../common/rules/links';
import { getMediainfoPictureFromDescr } from '../../common/rules/media';
import { getMediumSel } from '../../common/rules/text';

function ensureTrailingSlash(url: string): string {
    if (!url) return url;
    return url.endsWith('/') ? url : `${url}/`;
}

export async function parseNexus(config: SiteConfig, currentUrl: string): Promise<TorrentMeta> {
    // Default selectors for NexusPHP
    const selectors = {
        title: '#top',
        titleFallback: 'td.rowhead:contains("Title") + td, td.rowhead:contains("标题") + td',
        description: '#kdescr, #description',
        descriptionFallback: 'td.rowhead:contains("Description") + td, td.rowhead:contains("简介") + td',
        category: 'td.rowhead:contains("Type") + td, td.rowhead:contains("类型") + td',
        subtitleFallback: 'td.rowhead:contains("Subtitle") + td, td.rowhead:contains("副标题") + td, td.rowhead:contains("SubTitle") + td'
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
    // Legacy parity: normalize and drop trailing rating fragments some Nexus sites append (CMCT/CHD/etc).
    try {
        title = dealWithTitle(title);
        title = title.replace(/\d\.\d\/10.*$/g, '').trim();
    } catch { }

    const descrEl =
        getElement(configSelectors.description) ||
        getElement(selectors.description) ||
        getElement(selectors.descriptionFallback);

    let description = descrEl ? htmlToBBCode(descrEl) : '';
    let fullMediaInfo = '';

    // CMCT/SpringSunday special layout: rebuild description to avoid duplicated poster/screens/mediainfo blocks.
    if (config.name === 'CMCT') {
        try {
            const blocks: string[] = [];
            const screenSet = new Set<string>();

            const extraText = ($('.extra-text').first().text() || '').trim();
            if (extraText) {
                const wrapped = extraText.includes('[quote]') ? extraText : `[quote]\n${extraText}\n[/quote]`;
                blocks.push(wrapped.trim());
            }

            const poster = ($('#kposter img').first().attr('src') || '').trim();
            if (poster) blocks.push(`[img]${poster}[/img]`);

            // Intro text is usually inside `.info.douban-info` on CMCT.
            const introEl =
                ($('.info.douban-info artical').first()[0] as Element | undefined) ||
                ($('.info.douban-info article').first()[0] as Element | undefined) ||
                ($('.info.douban-info').first()[0] as Element | undefined);
            if (introEl) {
                let intro = htmlToBBCode(introEl).trim();
                if (extraText && intro.includes(extraText)) intro = intro.replace(extraText, '').trim();
                // Avoid carrying screenshots from intro block.
                intro = intro.replace(/\[img\][\s\S]*?\[\/img\]\s*/gi, '').trim();
                if (intro) blocks.push(intro);
            }

            const miEl = $('.codemain').eq(1)[0] as HTMLElement | undefined;
            if (miEl) fullMediaInfo = (miEl.innerText || $(miEl).text() || '').trim();
            if (fullMediaInfo) blocks.push(`[quote]${fullMediaInfo}[/quote]`);

            $('.screenshots-container img, #kscreenshots img').each((_, img) => {
                const src = ((img as HTMLImageElement).src || (img as HTMLImageElement).getAttribute('src') || '').trim();
                if (!src) return;
                if (src.includes('detail')) return;
                if (poster && src === poster) return;
                screenSet.add(src);
            });
            if (screenSet.size) {
                blocks.push(Array.from(screenSet).map((u) => `[img]${u}[/img]`).join('\n'));
            }

            const rebuilt = blocks.join('\n\n').trim();
            if (rebuilt) {
                description = rebuilt;
            } else if (description.trim()) {
                // Fallback: split from existing description and de-duplicate screenshots.
                const info = getMediainfoPictureFromDescr(description);
                if (!fullMediaInfo && info.mediainfo) fullMediaInfo = info.mediainfo;
                const intro = description.split('[quote]')[0].replace(/\[img\][\s\S]*?\[\/img\]\s*/gi, '').trim();
                const shots = Array.from(new Set(
                    (info.picInfo.match(/\[img\]([^\[]+?)\[\/img\]/gi) || [])
                        .map((s) => s.replace(/\[img\]|\[\/img\]/gi, '').trim())
                        .filter(Boolean)
                        .filter((u) => !poster || u !== poster)
                ));
                description = [intro, fullMediaInfo ? `[quote]${fullMediaInfo}[/quote]` : '', shots.map((u) => `[img]${u}[/img]`).join('\n')]
                    .filter(Boolean)
                    .join('\n\n')
                    .trim();
            }
        } catch { }
    }

    const meta: TorrentMeta = {
        title,
        subtitle: getText(configSelectors.subtitle) || $(selectors.subtitleFallback).text().trim() || '',
        description,
        sourceSite: config.name,
        sourceUrl: currentUrl,
        images: []
    };
    if (fullMediaInfo) meta.fullMediaInfo = fullMediaInfo;

    if (meta.subtitle === '') delete meta.subtitle;

    const imdbMatch = extractImdbId(description);
    if (imdbMatch) meta.imdbId = imdbMatch;
    if (!meta.imdbId) {
        const href = $('a[href*="imdb.com/title/tt"]').first().attr('href') || '';
        const id = extractImdbId(href);
        if (id) {
            meta.imdbId = id;
            meta.imdbUrl = href;
        }
    }
    if (meta.imdbId && !meta.imdbUrl) {
        meta.imdbUrl = `https://www.imdb.com/title/${meta.imdbId}/`;
    }

    const doubanMatch = extractDoubanId(description);
    if (doubanMatch) meta.doubanId = doubanMatch;
    if (!meta.doubanId) {
        const href = $('a[href*="douban.com/subject/"]').first().attr('href') || '';
        const id = extractDoubanId(href);
        if (id) {
            meta.doubanId = id;
            meta.doubanUrl = href;
        }
    }
    if (meta.doubanId && !meta.doubanUrl) {
        meta.doubanUrl = `https://movie.douban.com/subject/${meta.doubanId}/`;
    }

    // TMDB
    try {
        const tmdbUrl = matchLink('tmdb', description) || matchLink('tmdb', descrEl?.innerHTML || '') || '';
        if (tmdbUrl) {
            meta.tmdbUrl = tmdbUrl;
            meta.tmdbId = extractTmdbId(tmdbUrl);
        }
    } catch { }

    // Extract Torrent URL (best-effort: pick the most "torrent-like" link)
    const links = $('a[href*="download.php"], a[href*="download/torrent"]').toArray() as HTMLAnchorElement[];
    if (links.length) {
        const pick = (a: HTMLAnchorElement) => {
            const href = a.getAttribute('href') || '';
            const text = (a.textContent || '').trim();
            let score = 0;
            if (/download\.php\?.*id=\d+/i.test(href)) score += 6;
            if (/download\.php/i.test(href)) score += 3;
            if (/torrent/i.test(href)) score += 2;
            if (/download|下载|种子/i.test(text)) score += 1;
            return { href, score };
        };
        const sorted = links
            .map((a) => ({ a, ...pick(a) }))
            .filter((x) => !!x.href)
            .sort((x, y) => y.score - x.score);
        const relativeUrl = sorted[0]?.href || '';
        if (relativeUrl) {
            try {
                meta.torrentUrl = new URL(relativeUrl, currentUrl).href;
            } catch {
                meta.torrentUrl = relativeUrl;
            }
            // CMCT/SpringSunday sometimes appends `&https=1` which can break GM_xhr redirects.
            meta.torrentUrl = meta.torrentUrl.replace(/&https=1\b/i, '');
        }
    }

    // Extract Torrent Filename (HDSky-style hidden input)
    try {
        const v = ($('input[value*=".torrent"]').last().val() || '') as string;
        if (v && typeof v === 'string' && v.includes('.torrent')) {
            meta.torrentFilename = v.trim();
            meta.torrentName = v.trim();
        }
    } catch { }

    // Basic category as type if present
    const typeText = getText(configSelectors.subtitle) || $(selectors.category).text().trim();
    if (typeText && !meta.type) {
        meta.type = typeText;
    }

    return meta;
}
