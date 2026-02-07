export function dealWithTitle(title: string): string {
    if (!title) return '';
    let t = title.replace(/\./g, ' ').replace(/torrent$/gi, '').trim() + ' ';
    if (t.match(/[^\d](2 0|5 1|7 1|1 0|6 1|2 1|4 0|5 0)[^\d]/)) {
        t = t.replace(/[^\d](2 0|5 1|7 1|1 0|6 1|2 1|4 0|5 0)[^\d]/g, (data) => {
            return data.slice(0, 2) + '.' + data.slice(3);
        }).trim();
    }
    t = t.replace(/H ?(26[45])/i, 'H.$1').replace(/x265[.-]10bit/i, 'x265 10bit');
    t = t
        .replace(/\s+\[2?x?(免费|free)\].*$|\(限时.*\)|\(限時.*\)|\(已审|通过|待定\)/gi, '')
        .replace(/\[.*?\]/g, '')
        .replace(/剩余时间.*/i, '');
    t = t.replace(/\(|\)/g, '').replace(/ - /g, (data, index) => {
        try {
            const yIndex = t.match(/(19|20)\d+/)?.index ?? -1;
            if (yIndex > -1 && index > yIndex) return '-';
            return data;
        } catch {
            return data;
        }
    });
    t = t.replace('_10_', '(_10_)');
    t = t.replace('V2.1080p', 'V2 1080p').replace(/mkv$|mp4$/i, '').trim();
    return t;
}

export function dealWithSubtitle(subtitle: string): string {
    if (!subtitle) return '';
    return subtitle.replace(/\[checked by.*?\]/i, '').replace(/autoup/i, '').replace(/ +/g, ' ').trim();
}
