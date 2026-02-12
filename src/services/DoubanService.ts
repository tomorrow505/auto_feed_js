import { HtmlFetchService } from './HtmlFetchService';
import { extractDoubanId } from '../common/rules/links';

export interface DoubanInfo {
    id: string;
    title: string;
    year?: number | string;
    aka?: string;
    average?: number | string;
    votes?: number | string;
    genre?: string;
    region?: string;
    director?: string;
    language?: string;
    releaseDate?: string;
    runtime?: string;
    cast?: string;
    summary?: string;
    image?: string;
}

export interface LetterboxdRating {
    url: string;
    rating: string;
    votes: string;
}

type DoubanFetchOptions = {
    cookie?: string;
    withCredentials?: boolean;
};

export class DoubanService {
    static async getByImdb(imdbId: string, options?: DoubanFetchOptions): Promise<DoubanInfo | null> {
        const searchUrl = `https://m.douban.com/search/?query=${encodeURIComponent(imdbId)}&type=movie`;
        const doc = await HtmlFetchService.getDocument(searchUrl, this.buildFetchOptions(options));
        const link = doc.querySelector('ul.search_results_subjects a');
        if (!link) return null;
        const href = link.getAttribute('href') || '';
        const id = extractDoubanId(href);
        if (!id || id === '35580200') return null;
        return this.getById(id, options);
    }

    static async getById(id: string, options?: DoubanFetchOptions): Promise<DoubanInfo | null> {
        const url = `https://movie.douban.com/subject/${id}/`;
        const doc = await HtmlFetchService.getDocument(url, this.buildFetchOptions(options));
        return this.parseDoubanDoc(doc, id);
    }

    private static parseDoubanDoc(doc: Document, id: string): DoubanInfo {
        const title = (doc.querySelector('title')?.textContent || '').replace('(豆瓣)', '').trim();

        let image = '';
        const img = doc.querySelector('#mainpic img') as HTMLImageElement | null;
        if (img?.src) {
            const match = img.src.match(/(p\d+).+$/);
            if (match?.[1]) {
                image = `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${match[1]}.jpg`;
            } else {
                image = img.src;
            }
        }

        const yearText = doc.querySelector('#content > h1 > span.year')?.textContent || '';
        const year = yearText ? parseInt(yearText.replace(/[()]/g, ''), 10) : '';

        const average = doc.querySelector('#interest_sectl [property="v:average"]')?.textContent || '';
        const votes = doc.querySelector('#interest_sectl [property="v:votes"]')?.textContent || '';

        const genre = Array.from(doc.querySelectorAll('#info span[property="v:genre"]'))
            .map((e) => e.textContent?.trim())
            .filter(Boolean)
            .join('/');

        const releaseDate = Array.from(doc.querySelectorAll('#info span[property="v:initialReleaseDate"]'))
            .map((e) => e.textContent?.trim())
            .filter(Boolean)
            .sort((a, b) => new Date(a || '').getTime() - new Date(b || '').getTime())
            .join('/');

        const runtime = doc.querySelector('#info span[property="v:runtime"]')?.textContent?.trim() || '';

        const aka = this.getInfoByLabel(doc, '又名');
        const region = this.getInfoByLabel(doc, '制片国家/地区');
        const director = this.getInfoByLabel(doc, '导演');
        const language = this.getInfoByLabel(doc, '语言');
        const cast = this.getInfoByLabel(doc, '主演');

        const summaryEl =
            (doc.querySelector('#link-report-intra [property="v:summary"]') as HTMLElement | null) ||
            (doc.querySelector('#link-report-intra span.all.hidden') as HTMLElement | null);
        const summary = summaryEl?.textContent?.trim() || '';

        return {
            id,
            title,
            year,
            aka,
            average,
            votes,
            genre,
            region,
            director,
            language,
            releaseDate,
            runtime,
            cast,
            summary,
            image
        };
    }

    private static getInfoByLabel(doc: Document, label: string): string {
        const spans = Array.from(doc.querySelectorAll('#info span.pl')) as HTMLSpanElement[];
        const span = spans.find((s) => (s.textContent || '').includes(label));
        if (!span || !span.parentElement) return '';
        const text = span.parentElement.textContent || '';
        return text.replace(span.textContent || '', '').replace(':', '').trim();
    }

    private static buildFetchOptions(options?: DoubanFetchOptions) {
        const headers: Record<string, string> = {};
        if (options?.cookie) headers['cookie'] = options.cookie;
        // Keep it simple: most of the time withCredentials is enough if the user is logged in to Douban.
        return { headers: Object.keys(headers).length ? headers : undefined, withCredentials: options?.withCredentials ?? true };
    }

    static async getLetterboxdRatingByImdb(imdbId: string): Promise<LetterboxdRating | null> {
        const imdbKey = imdbId.replace(/^tt/, '');
        const imdbUrl = `https://letterboxd.com/imdb/tt${imdbKey}/`;
        const headers = {
            'accept-language': 'en-US,en;q=0.9',
            referer: 'https://letterboxd.com/'
        };

        const toTenScale = (raw: string): string => {
            const n = parseFloat(raw);
            if (!Number.isFinite(n) || n <= 0) return '';
            const v = n <= 5 ? n * 2 : n;
            return v.toFixed(1);
        };

        const pickFromText = (text: string): { rating: string; votes: string } | null => {
            if (!text) return null;

            const weighted = text.match(/Weighted average of\s*([0-9.]+)\s*based on\s*([0-9,]+).*?ratings/i);
            if (weighted) {
                const rating = toTenScale(weighted[1]);
                const votes = weighted[2].replace(/,/g, '');
                if (rating && votes) return { rating, votes };
            }

            const aggregate = text.match(/"aggregateRating"\s*:\s*\{[\s\S]{0,280}?"ratingValue"\s*:\s*"?([0-9.]+)"?[\s\S]{0,180}?"ratingCount"\s*:\s*"?([0-9,]+)"?/i);
            if (aggregate) {
                const rating = toTenScale(aggregate[1]);
                const votes = aggregate[2].replace(/,/g, '');
                if (rating && votes) return { rating, votes };
            }

            const avg = text.match(/class=["']average-rating["'][^>]*>\s*([0-9.]+)\s*</i);
            const cnt =
                text.match(/data-rating-count=["']([0-9,]+)["']/i) ||
                text.match(/([0-9,]+)\s+ratings?/i);
            if (avg?.[1] && cnt?.[1]) {
                const rating = toTenScale(avg[1]);
                const votes = cnt[1].replace(/,/g, '');
                if (rating && votes) return { rating, votes };
            }
            return null;
        };

        const doc = await HtmlFetchService.getDocument(imdbUrl, { headers });
        const html = doc.documentElement?.outerHTML || '';
        let baseUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
        if (!baseUrl) {
            const relCanonical = doc.querySelector('link[rel="canonical"]')?.getAttribute('href') || '';
            baseUrl = relCanonical || '';
        }
        if (!baseUrl) return null;

        const ratingUrl = baseUrl.replace('.com/', '.com/csi/') + 'ratings-summary/';
        const ratingDoc = await HtmlFetchService.getDocument(ratingUrl, { headers });
        const ratingHtml = ratingDoc.documentElement?.outerHTML || '';
        const ratingInfo = ratingDoc.body?.textContent || '';
        const picked = pickFromText(`${ratingHtml}\n${ratingInfo}`) || pickFromText(html);
        if (!picked) return null;

        return { url: baseUrl, rating: picked.rating, votes: picked.votes };
    }
}
