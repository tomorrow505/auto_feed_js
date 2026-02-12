const imdbPrefix = 'https://www.imdb.com/title/';
const doubanPrefix = 'https://movie.douban.com/subject/';
const tmdbPrefix = 'https://www.themoviedb.org/';

export function extractImdbId(input?: string): string {
    const text = String(input || '').trim();
    if (!text) return '';
    if (/^\d{5,13}$/.test(text)) return `tt${text}`;
    const token = text.match(/tt\d{5,13}/i)?.[0];
    return token ? `tt${token.slice(2)}` : '';
}

export function extractDoubanId(input?: string): string {
    const text = String(input || '').trim();
    if (!text) return '';
    if (/^\d{5,}$/.test(text)) return text;
    return text.match(/(?:douban\.com\/subject\/|subject\/)(\d{5,})/i)?.[1] || '';
}

export function extractTmdbId(input?: string): string {
    const text = String(input || '');
    return text.match(/themoviedb\.org\/(?:tv|movie)\/(\d+)/i)?.[1] || '';
}

export function matchLink(site: 'imdb' | 'douban' | 'anidb' | 'tmdb' | 'tvdb' | 'bangumi', data: string): string {
    let link = '';
    if (site === 'imdb') {
        const imdbId = extractImdbId(data);
        link = imdbId ? `${imdbPrefix}${imdbId}/` : '';
    } else if (site === 'douban') {
        const doubanId = extractDoubanId(data);
        link = doubanId ? `${doubanPrefix}${doubanId}/` : '';
    } else if (site === 'anidb' && data.match(/https:\/\/anidb\.net\/a\d+/i)) {
        link = data.match(/https:\/\/anidb\.net\/a\d+/i)?.[0] || '';
        if (link && !link.endsWith('/')) link += '/';
    } else if (site === 'tmdb' && data.match(/http(s*):\/\/www.themoviedb.org\//i)) {
        const path = data.match(/(tv|movie)\/\d+/i)?.[0] || '';
        link = path ? `${tmdbPrefix}${path}` : '';
        if (link && !link.endsWith('/')) link += '/';
    } else if (site === 'tvdb' && data.match(/http(s*):\/\/www.thetvdb.com\//i)) {
        const id = data.match(/https?:\/\/www.thetvdb.com\/.*?id=(\d+)/i)?.[1];
        if (id) link = `https://www.thetvdb.com/?tab=series&id=${id}`;
    } else if (site === 'bangumi' && data.match(/https:\/\/bangumi.tv\/subject/i)) {
        const id = data.match(/https:\/\/bangumi.tv\/subject\/(\d+)/)?.[1];
        if (id) link = `https://bangumi.tv/subject/${id}`;
    }
    return link;
}
