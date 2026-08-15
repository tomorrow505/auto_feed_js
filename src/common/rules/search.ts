export function getSearchName(name: string, type?: string): string {
    let searchName = name || '';
    if (type === '音乐') {
        searchName = searchName.split('-').pop() || searchName;
        searchName = searchName.replace(/\d{4}.*|\*/g, '').trim();
        return searchName;
    }
    if (searchName.match(/S\d{1,3}/i)) {
        searchName = searchName.split(/S\d{1,3}/i)[0];
        searchName = searchName.replace(/(19|20)\d{2}/gi, '').trim();
    } else if (searchName.match(/(19|20)\d{2}/)) {
        const year = searchName.match(/(19|20)\d{2}/g)?.pop();
        if (year) searchName = searchName.split(year)[0];
    }
    searchName = searchName.replace(/\b(repack|extended|cut)\b/gi, '');
    searchName = searchName.replace(/(.+?)\s+(?:a\.?\s*k\.?\s*a\.?|aka)\s*[:：-]?\s+.*$/i, '$1');
    return searchName.trim();
}
