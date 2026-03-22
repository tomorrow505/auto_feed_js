import $ from 'jquery';
import { TorrentMeta } from '../../types/TorrentMeta';
import { SiteConfig } from '../../types/SiteConfig';
import { htmlToBBCode } from '../../utils/htmlToBBCode';
import { dealWithTitle } from '../../common/rules/title';
import { extractDoubanId, extractImdbId, extractTmdbId, matchLink } from '../../common/rules/links';
import { getType } from '../../common/rules/text';

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

    // Basic category as type if present.
    // Prefer first matched category cell instead of concatenating all matched rows.
    const typeCandidates = [
        $('td.rowhead:contains("类型") + td').first().text().trim(),
        $('td.rowhead:contains("類別") + td').first().text().trim(),
        $('td.rowhead:contains("Category") + td').first().text().trim(),
        $('td.rowhead:contains("Type") + td').first().text().trim(),
        $(selectors.category).first().text().trim()
    ].filter(Boolean);
    const typeText = typeCandidates[0] || '';
    if (typeText && !meta.type) {
        meta.type = getType(typeText) || typeText;
    }

    if (!meta.type) {
        const infoRowLabels = ['基本信息', '详细信息', '类型', '基本資訊', '標籤列表：', '媒介：', 'Basic Info', '分类 / 制作组', '种子信息'];
        const tds = $('td').toArray();
        for (let i = 0; i < tds.length - 1 && !meta.type; i++) {
            const key = (tds[i].textContent || '').trim();
            if (!key || infoRowLabels.indexOf(key) < 0) continue;
            const infoText = (tds[i + 1].textContent || '').trim();
            if (!infoText) continue;
            const guessed = getType(infoText);
            if (guessed) meta.type = guessed;
        }
    }

    if (!meta.type) {
        const blob = `${title}\n${meta.subtitle || ''}\n${description}`;
        const lineType =
            blob.match(/(?:^|\n)\s*(?:类型|類別|Category|Type)\s*[:：]\s*([^\n]+)/i)?.[1] ||
            blob.match(/(?:^|\n)\s*◎\s*类\s*别\s*[:：]?\s*([^\n]+)/i)?.[1] ||
            '';
        if (lineType) meta.type = getType(lineType) || lineType.trim();
    }

    if (!meta.type) {
        const guessed = getType(`${title}\n${meta.subtitle || ''}`);
        if (guessed) meta.type = guessed;
    }

    return meta;
}
