import { HtmlFetchService } from './HtmlFetchService';

export interface LetterboxdRating {
    url: string;
    rating: string;
    votes: string;
}

export class LetterboxdService {
    static async getRatingByImdb(imdbId: string): Promise<LetterboxdRating | null> {
        const imdbKey = imdbId.replace(/^tt/, '');
        const imdbUrl = `https://letterboxd.com/imdb/tt${imdbKey}/`;
        const doc = await HtmlFetchService.getDocument(imdbUrl);
        const baseUrl = doc.querySelector('meta[property="og:url"]')?.getAttribute('content') || '';
        if (!baseUrl) return null;

        const ratingUrl = baseUrl.replace('.com/', '.com/csi/') + 'ratings-summary/';
        const ratingDoc = await HtmlFetchService.getDocument(ratingUrl);
        const ratingInfo = ratingDoc.body?.textContent || '';
        const match = ratingInfo.match(/Weighted average of (.*?) based on (\d+).*?ratings/);
        if (!match) return null;

        const rate = (parseFloat(match[1]) * 2).toFixed(1);
        const votes = match[2];
        return { url: baseUrl, rating: rate, votes };
    }
}
