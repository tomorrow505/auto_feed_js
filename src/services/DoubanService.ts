import { HtmlFetchService } from './HtmlFetchService';

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

export class DoubanService {
    static async getByImdb(imdbId: string): Promise<DoubanInfo | null> {
        const searchUrl = `https://m.douban.com/search/?query=${encodeURIComponent(imdbId)}&type=movie`;
        const doc = await HtmlFetchService.getDocument(searchUrl);
        const link = doc.querySelector('ul.search_results_subjects a');
        if (!link) return null;
        const href = link.getAttribute('href') || '';
        const id = href.match(/subject\/(\d+)/)?.[1];
        if (!id || id === '35580200') return null;
        return this.getById(id);
    }

    static async getById(id: string): Promise<DoubanInfo | null> {
        const url = `https://movie.douban.com/subject/${id}/`;
        const doc = await HtmlFetchService.getDocument(url);
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
}
