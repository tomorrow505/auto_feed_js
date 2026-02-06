import { DoubanService, DoubanInfo } from './DoubanService';
import { HtmlFetchService } from './HtmlFetchService';
import { TorrentMeta } from '../types/TorrentMeta';

export interface PtgenOptions {
    imdbToDoubanMethod: number; // 0: Douban API, 1: Douban scrape
    ptgenApi: number; // 0: api.iyuu.cn, 1: ptgen, 3: douban page scrape
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

    static async resolveDoubanId(meta: TorrentMeta, method: number): Promise<string | null> {
        if (meta.doubanId) return meta.doubanId;
        const doubanIdFromUrl = meta.doubanUrl?.match(/subject\/(\d+)/)?.[1];
        if (doubanIdFromUrl) return doubanIdFromUrl;

        const imdbId = meta.imdbId || meta.imdbUrl?.match(/tt\d+/)?.[0];
        if (!imdbId) return null;

        if (method === 0) {
            const url = `https://movie.douban.com/j/subject_suggest?q=${imdbId}`;
            try {
                const text = await HtmlFetchService.getText(url);
                const json = JSON.parse(text);
                if (Array.isArray(json) && json.length) {
                    const id = json[0]?.id?.toString();
                    if (id && id !== '35580200') return id;
                }
            } catch {}
            return null;
        }

        try {
            const info = await DoubanService.getByImdb(imdbId);
            return info?.id || null;
        } catch {
            return null;
        }
    }

    static async fetchPtgen(meta: TorrentMeta, options: PtgenOptions): Promise<{ format: string; doubanId?: string; synopsis?: string } | null> {
        const imdbId = meta.imdbId || meta.imdbUrl?.match(/tt\d+/)?.[0] || '';
        const doubanId = await this.resolveDoubanId(meta, options.imdbToDoubanMethod);

        if (options.ptgenApi === 3) {
            const info =
                (doubanId ? await DoubanService.getById(doubanId) : null) ||
                (imdbId ? await DoubanService.getByImdb(imdbId) : null);
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
            const text = await HtmlFetchService.getText(`${base}${query}`);
            const json = JSON.parse(text);
            let format = json?.data?.format || json?.format || json?.data || '';
            if (!format || typeof format !== 'string') return null;
            format = format.replace('hongleyou.cn', 'doubanio.com').replace(/\[\/img\]\[\/center\]/g, '[/img]');
            return { format };
        } catch {
            return null;
        }
    }

    static async applyPtgen(meta: TorrentMeta, options: PtgenOptions): Promise<TorrentMeta> {
        const result = await this.fetchPtgen(meta, options);
        if (!result || !result.format) return meta;
        const updated: TorrentMeta = { ...meta };

        updated.description = `${result.format}\n\n${updated.description || ''}`.trim();
        const subtitle = this.extractSubtitleFromFormat(result.format);
        if (subtitle) {
            updated.subtitle = updated.subtitle || subtitle;
            updated.smallDescr = updated.smallDescr || subtitle;
        }

        const imdbMatch = result.format.match(/imdb\.com\/title\/(tt\d+)/i)?.[1];
        if (imdbMatch) {
            updated.imdbId = updated.imdbId || imdbMatch;
            updated.imdbUrl = updated.imdbUrl || `https://www.imdb.com/title/${imdbMatch}/`;
        }
        const doubanMatch = result.format.match(/douban\.com\/subject\/(\d+)/i)?.[1];
        if (doubanMatch) {
            updated.doubanId = updated.doubanId || doubanMatch;
            updated.doubanUrl = updated.doubanUrl || `https://movie.douban.com/subject/${doubanMatch}/`;
        }
        if (result.doubanId) {
            updated.doubanId = updated.doubanId || result.doubanId;
            updated.doubanUrl = updated.doubanUrl || `https://movie.douban.com/subject/${result.doubanId}/`;
        }
        if (result.synopsis && !updated.synopsis) {
            updated.synopsis = result.synopsis;
        }

        return updated;
    }
}
