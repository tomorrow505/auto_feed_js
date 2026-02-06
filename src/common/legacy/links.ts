const imdbPrefix = 'https://www.imdb.com/title/';
const doubanPrefix = 'https://movie.douban.com/subject/';

export function matchLink(site: 'imdb' | 'douban' | 'anidb' | 'tmdb' | 'tvdb' | 'bangumi', data: string): string {
    let link = '';
    if (site === 'imdb' && data.match(/http(s*):\/\/.*?imdb.com\/title\/tt\d+/i)) {
        const id = data.match(/tt\d{5,13}/i)?.[0];
        if (id) link = `${imdbPrefix}${id}/`;
    } else if (site === 'douban' && data.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)) {
        const id = data.match(/subject\/(\d+)/i)?.[1];
        if (id) link = `${doubanPrefix}${id}/`;
    } else if (site === 'anidb' && data.match(/https:\/\/anidb\.net\/a\d+/i)) {
        link = data.match(/https:\/\/anidb\.net\/a\d+/i)?.[0] || '';
        if (link && !link.endsWith('/')) link += '/';
    } else if (site === 'tmdb' && data.match(/http(s*):\/\/www.themoviedb.org\//i)) {
        link = data.match(/http(s*):\/\/www.themoviedb.org\/(tv|movie)\/\d+/i)?.[0] || '';
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
