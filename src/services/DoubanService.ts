import { HtmlFetchService } from './HtmlFetchService';
import { GMAdapter } from './GMAdapter';
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
    private static posterDataUrlCache = new Map<string, Promise<string>>();

    static async getByImdb(imdbId: string, options?: DoubanFetchOptions): Promise<DoubanInfo | null> {
        const query = encodeURIComponent(String(imdbId || '').trim());
        if (!query) return null;

        // Douban occasionally returns an empty search shell from the mobile
        // endpoint. Keep it as the first choice, then fall back to the small
        // subject-suggest endpoint when the shell has no usable link.
        let id = '';
        try {
            const searchUrl = `https://m.douban.com/search/?query=${query}&type=movie`;
            const doc = await HtmlFetchService.getDocument(searchUrl, this.buildFetchOptions(options));
            id = this.findDoubanId(doc);
        } catch {}

        if (!id) {
            try {
                const suggestUrl = `https://movie.douban.com/j/subject_suggest?q=${query}`;
                const text = await HtmlFetchService.getText(suggestUrl, this.buildFetchOptions(options));
                id = extractDoubanId(text) || text.match(/(?:subject\/|"id"\s*:\s*")([0-9]{5,})/i)?.[1] || '';
            } catch {}
        }

        if (!id || id === '35580200') return null;
        return this.getById(id, options);
    }

    static async getById(id: string, options?: DoubanFetchOptions): Promise<DoubanInfo | null> {
        const url = `https://movie.douban.com/subject/${id}/`;
        const doc = await HtmlFetchService.getDocument(url, this.buildFetchOptions(options));
        return this.parseDoubanDoc(doc, id);
    }

    private static findDoubanId(doc: Document): string {
        const links = Array.from(doc.querySelectorAll('a[href]')) as HTMLAnchorElement[];
        for (const link of links) {
            const id = extractDoubanId(link.getAttribute('href') || '');
            if (id) return id;
        }
        const html = doc.documentElement?.outerHTML || '';
        return html.match(/(?:douban\.com\/subject\/|subject\/)(\d{5,})/i)?.[1] || '';
    }

    static async resolvePosterDisplayUrl(url: string, mode: 'raw' | 'inline' = 'raw'): Promise<string> {
        const normalized = String(url || '').trim();
        if (!normalized) return '';
        if (mode !== 'inline') return normalized;
        if (!/doubanio\.com/i.test(normalized)) return normalized;

        if (!this.posterDataUrlCache.has(normalized)) {
            this.posterDataUrlCache.set(
                normalized,
                this.fetchPosterDataUrl(normalized).catch(() => normalized)
            );
        }
        return await this.posterDataUrlCache.get(normalized)!;
    }

    private static parseDoubanDoc(doc: Document, id: string): DoubanInfo {
        const title = (doc.querySelector('title')?.textContent || '').replace('(豆瓣)', '').trim();

        let image = '';
        const img = doc.querySelector('#mainpic img') as HTMLImageElement | null;
        if (img?.src) {
            const match = img.src.match(/(p\d+).+$/);
            if (match?.[1]) {
                image = `https://img2.doubanio.com/view/photo/l_ratio_poster/public/${match[1]}.jpg`;
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
        const summary = this.getSummary(summaryEl);

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

    private static getSummary(summaryEl: HTMLElement | null): string {
        if (!summaryEl) return '';
        const directText = Array.from(summaryEl.childNodes)
            .filter((node) => node.nodeType === Node.TEXT_NODE)
            .map((node) => node.textContent?.trim() || '')
            .filter(Boolean)
            .join('\n')
            .trim();
        return directText || summaryEl.textContent?.trim() || '';
    }

    private static getInfoByLabel(doc: Document, label: string): string {
        const spans = Array.from(doc.querySelectorAll('#info span.pl')) as HTMLSpanElement[];
        const span = spans.find((s) => (s.textContent || '').includes(label));
        if (!span) return '';

        const chunks: string[] = [];
        let node = span.nextSibling;
        while (node) {
            if (node.nodeName === 'BR') break;
            const text = node.textContent || '';
            if (text.trim()) chunks.push(text.trim());
            node = node.nextSibling;
        }

        return chunks
            .join(' ')
            .replace(/^[：:\s]+/, '')
            .replace(/\s*\/\s*/g, '/')
            .replace(/\s{2,}/g, ' ')
            .trim();
    }

    private static buildFetchOptions(options?: DoubanFetchOptions) {
        const headers: Record<string, string> = {};
        if (options?.cookie) headers['cookie'] = options.cookie;
        // Keep it simple: most of the time withCredentials is enough if the user is logged in to Douban.
        return { headers: Object.keys(headers).length ? headers : undefined, withCredentials: options?.withCredentials ?? true };
    }

    private static async fetchPosterDataUrl(url: string): Promise<string> {
        const response = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            responseType: 'arraybuffer',
            anonymous: true,
            headers: {
                Referer: 'https://movie.douban.com/',
                Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'User-Agent':
                    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36'
            }
        });

        const body = response?.response;
        if (!(body instanceof ArrayBuffer) || !body.byteLength) {
            throw new Error('Empty Douban poster response');
        }

        const mime =
            String(response?.responseHeaders || '')
                .match(/content-type:\s*([^\s;]+)/i)?.[1]
                ?.trim() || 'image/jpeg';

        return `data:${mime};base64,${this.arrayBufferToBase64(body)}`;
    }

    private static arrayBufferToBase64(buffer: ArrayBuffer): string {
        const bytes = new Uint8Array(buffer);
        const chunkSize = 0x8000;
        let binary = '';
        for (let index = 0; index < bytes.length; index += chunkSize) {
            const chunk = bytes.subarray(index, index + chunkSize);
            binary += String.fromCharCode(...chunk);
        }
        return btoa(binary);
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
