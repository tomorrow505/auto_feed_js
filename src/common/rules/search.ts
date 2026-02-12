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
    searchName = searchName.replace(/repack|Extended|cut/gi, '');
    searchName = searchName.split(/aka/i)[0];
    return searchName.trim();
}
