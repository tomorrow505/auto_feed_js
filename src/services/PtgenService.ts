import { DoubanService, DoubanInfo } from './DoubanService';
import { HtmlFetchService } from './HtmlFetchService';
import { TorrentMeta } from '../types/TorrentMeta';
import { getSmallDescrFromDescr, getSourceSelFromDescr } from '../common/rules/helpers';
import { extractDoubanId, extractImdbId } from '../common/rules/links';

export interface PtgenOptions {
    imdbToDoubanMethod: number; // 0: Douban API, 1: Douban scrape
    ptgenApi: number; // 0: api.iyuu.cn, 1: ptgen, 3: douban page scrape
    doubanCookie?: string;
}

export interface PtgenApplyFlags {
    mergeDescription?: boolean; // prepend ptgen block into description (default true)
    updateSubtitle?: boolean;   // fill subtitle/smallDescr (default true)
    updateRegion?: boolean;     // fill sourceSel (default true)
    updateIds?: boolean;        // fill imdb/douban ids+urls (default true)
    updateSynopsis?: boolean;   // fill synopsis (default true)
    overwrite?: boolean;        // overwrite existing fields (default false)
}

const IYUU_API = 'https://api.iyuu.cn/App.Movie.Ptgen';
const TJU_API = 'https://ptgen.tju.pt/infogen';

const buildDoubanFormat = (info: DoubanInfo, imdbId?: string): string => {
    const lines: string[] = [];
    if (info.image) lines.push(`[img]${info.image}[/img]`, '');
    const title = info.title || '';
    if (info.aka) lines.push(`◎译　　名　${title} / ${info.aka}`);
    else if (title) lines.push(`◎译　　名　${title}`);
    if (title) lines.push(`◎片　　名　${title}`);
    if (info.year) lines.push(`◎年　　代　${info.year}`);
    if (info.region) lines.push(`◎产　　地　${info.region}`);
    if (info.genre) lines.push(`◎类　　别　${info.genre}`);
    if (info.language) lines.push(`◎语　　言　${info.language}`);
    if (info.releaseDate) lines.push(`◎上映日期　${info.releaseDate}`);
    if (imdbId) lines.push(`◎IMDb链接  https://www.imdb.com/title/${imdbId}/`);
    if (info.average) {
        const votes = info.votes ? ` from ${info.votes} users` : '';
        lines.push(`◎豆瓣评分　${info.average}/10${votes}`);
    }
    if (info.id) lines.push(`◎豆瓣链接　https://movie.douban.com/subject/${info.id}/`);
    if (info.runtime) lines.push(`◎片　　长　${info.runtime}`);
    if (info.director) lines.push(`◎导　　演　${info.director}`);
    if (info.cast) lines.push(`◎主　　演　${info.cast}`);
    lines.push('');
    lines.push('◎简　　介');
    if (info.summary) {
        lines.push(info.summary.replace(/^|\n/g, '\n　　').trim());
    } else {
        lines.push('　　暂无相关剧情介绍');
    }
    return lines.join('\n').replace(/\n{3,}/g, '\n\n').trim();
};

export class PtgenService {
    private static extractSubtitleFromFormat(format: string): string {
        const lines = format.split('\n').map((line) => line.trim()).filter(Boolean);
        const getLineValue = (pattern: RegExp) => {
            const line = lines.find((l) => pattern.test(l));
            if (!line) return '';
            const parts = line.split(/[:：]/);
            const value = parts.length > 1 ? parts.slice(1).join(':').trim() : line.replace(pattern, '').trim();
            return value;
        };

        const pickChinese = (value: string) => {
            if (!value) return '';
            const first = value.split('/')[0].trim();
            return /[\u4e00-\u9fa5]/.test(first) ? first : '';
        };

        const translated = pickChinese(getLineValue(/译.*名/));
        if (translated) return translated;

        const mainTitle = pickChinese(getLineValue(/片.*名/));
        if (mainTitle) return mainTitle;

        return '';
    }

    static async resolveDoubanId(meta: TorrentMeta, method: number, doubanCookie?: string): Promise<string | null> {
        if (meta.doubanId) return meta.doubanId;
        const doubanIdFromUrl = extractDoubanId(meta.doubanUrl || '');
        if (doubanIdFromUrl) return doubanIdFromUrl;

        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '');
        if (!imdbId) return null;

        if (method === 0) {
            const url = `https://movie.douban.com/j/subject_suggest?q=${imdbId}`;
            try {
                const text = await HtmlFetchService.getText(url, {
                    headers: doubanCookie ? { cookie: doubanCookie } : undefined,
                    withCredentials: true
                });
                const json = JSON.parse(text);
                if (Array.isArray(json) && json.length) {
                    const id = json[0]?.id?.toString();
                    if (id && id !== '35580200') return id;
                }
            } catch {}
            return null;
        }

        try {
            const info = await DoubanService.getByImdb(imdbId, { cookie: doubanCookie, withCredentials: true });
            return info?.id || null;
        } catch {
            return null;
        }
    }

    private static async fetchPtgenOnce(meta: TorrentMeta, options: PtgenOptions): Promise<{ format: string; doubanId?: string; synopsis?: string } | null> {
        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const doubanId = await this.resolveDoubanId(meta, options.imdbToDoubanMethod, options.doubanCookie);

        if (options.ptgenApi === 3) {
            const info =
                (doubanId ? await DoubanService.getById(doubanId, { cookie: options.doubanCookie, withCredentials: true }) : null) ||
                (imdbId ? await DoubanService.getByImdb(imdbId, { cookie: options.doubanCookie, withCredentials: true }) : null);
            if (!info) return null;
            return {
                format: buildDoubanFormat(info, imdbId || undefined),
                doubanId: info.id,
                synopsis: info.summary || ''
            };
        }

        const base = options.ptgenApi === 0 ? IYUU_API : TJU_API;
        let query = '';
        if (doubanId) {
            query = `?url=${encodeURIComponent(`https://movie.douban.com/subject/${doubanId}/`)}`;
        } else if (meta.doubanUrl) {
            query = `?url=${encodeURIComponent(meta.doubanUrl)}`;
        } else if (meta.imdbUrl) {
            if (options.ptgenApi === 1) {
                query = `?site=douban&sid=${imdbId}`;
            } else {
                query = `?url=${encodeURIComponent(meta.imdbUrl)}`;
            }
        } else if (imdbId) {
            if (options.ptgenApi === 1) {
                query = `?site=douban&sid=${imdbId}`;
            } else {
                query = `?url=${encodeURIComponent(`https://www.imdb.com/title/${imdbId}/`)}`;
            }
        } else {
            return null;
        }

        try {
            const text = await HtmlFetchService.getText(`${base}${query}`, { withCredentials: true });
            let format = '';
            try {
                const json = JSON.parse(text);
                format = json?.data?.format || json?.format || json?.data || '';
            } catch {
                // Some providers may return plain text on errors/limits; best-effort fallback.
                format = text || '';
            }
            if (!format || typeof format !== 'string') return null;
            // Heuristic: if it doesn't look like a ptgen/douban block, treat it as a failed response.
            if (!format.match(/◎简\s*介|◎译\s*名|douban\.com\/subject\/\d+|imdb\.com\/title\/tt\d+/i)) return null;
            format = format.replace('hongleyou.cn', 'doubanio.com').replace(/\[\/img\]\[\/center\]/g, '[/img]');
            return { format };
        } catch {
            return null;
        }
    }

    static async fetchPtgen(meta: TorrentMeta, options: PtgenOptions): Promise<{ format: string; doubanId?: string; synopsis?: string } | null> {
        // Provider fallback:
        // - 3 (douban scrape) can fail due to captcha/rate-limits.
        // - 0/1 can fail due to outages.
        const order = options.ptgenApi === 3 ? [3, 1, 0] : options.ptgenApi === 1 ? [1, 0] : options.ptgenApi === 0 ? [0, 1] : [options.ptgenApi];
        const uniq = Array.from(new Set(order));
        for (const api of uniq) {
            try {
                const r = await this.fetchPtgenOnce(meta, { ...options, ptgenApi: api });
                if (r?.format) return r;
            } catch {
                // continue
            }
        }
        return null;
    }

    static async applyPtgen(meta: TorrentMeta, options: PtgenOptions, flags?: PtgenApplyFlags): Promise<TorrentMeta> {
        const result = await this.fetchPtgen(meta, options);
        if (!result || !result.format) return meta;
        const updated: TorrentMeta = { ...meta };

        const overwrite = !!flags?.overwrite;
        const mergeDescription = flags?.mergeDescription ?? true;
        const updateSubtitle = flags?.updateSubtitle ?? true;
        const updateRegion = flags?.updateRegion ?? true;
        const updateIds = flags?.updateIds ?? true;
        const updateSynopsis = flags?.updateSynopsis ?? true;

        // Keep the raw ptgen/douban block available via `description` merge by default.
        if (mergeDescription) {
            updated.description = `${result.format}\n\n${updated.description || ''}`.trim();
        }

        if (updateSubtitle) {
            // Legacy parity:
            // Prefer deriving small_descr from the fetched ptgen/douban block,
            // so it includes translated titles + type/genre line when available.
            const legacySmall = getSmallDescrFromDescr(result.format, updated.title || meta.title || '');
            const fallback = this.extractSubtitleFromFormat(result.format);
            const subtitle = legacySmall || fallback;
            if (subtitle) {
                if (overwrite || !updated.subtitle) updated.subtitle = subtitle;
                if (overwrite || !updated.smallDescr) updated.smallDescr = subtitle;
            }
        }

        // Region/area (used by PTer team_sel and some Nexus variants). Extract directly from ptgen block
        // so targets can fill "地区/产地" even if they don't want to rely on description parsing.
        if (updateRegion) {
            try {
                const region = getSourceSelFromDescr(result.format);
                if (region && (overwrite || !updated.sourceSel)) updated.sourceSel = region;
            } catch {}
        }

        if (updateIds) {
            const imdbMatch = extractImdbId(result.format);
            if (imdbMatch) {
                if (overwrite || !updated.imdbId) updated.imdbId = imdbMatch;
                if (overwrite || !updated.imdbUrl) updated.imdbUrl = `https://www.imdb.com/title/${imdbMatch}/`;
            }
            const doubanMatch = extractDoubanId(result.format);
            if (doubanMatch) {
                if (overwrite || !updated.doubanId) updated.doubanId = doubanMatch;
                if (overwrite || !updated.doubanUrl) updated.doubanUrl = `https://movie.douban.com/subject/${doubanMatch}/`;
            }
            if (result.doubanId) {
                if (overwrite || !updated.doubanId) updated.doubanId = result.doubanId;
                if (overwrite || !updated.doubanUrl) updated.doubanUrl = `https://movie.douban.com/subject/${result.doubanId}/`;
            }
        }

        if (updateSynopsis) {
            if (result.synopsis && (overwrite || !updated.synopsis)) {
                updated.synopsis = result.synopsis;
            }
        }

        return updated;
    }
}
