export function getGroupName(name: string, torrentInfo = ''): string {
    if (typeof name !== 'string') return 'Null';
    try {
        name = name.replace(/\[.*?\]|web-dl|dts-hd|Blu-ray|MPEG-2|MPEG-4/ig, '');
        name = name.split(/\.mkv|\.mp4|\.iso|\.avi/)[0];
        const special = name.match(/(KJNU|tomorrow505|KG|BMDru|BobDobbs|Dusictv|AFKI)$/i);
        if (special) return special[1];
        let tmpName = name.match(/-(.*)/)?.[1].split(/-/).pop() || '';
        if (tmpName.match(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i)) {
            if (torrentInfo.match(/Scene/)) {
                name = name.split('-')[0];
            } else {
                const parts = tmpName.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i);
                if (parts.length > 1) {
                    name = parts.pop() || 'Null';
                } else {
                    name = 'Null';
                }
            }
        } else {
            name = tmpName;
        }
    } catch {
        const parts = name.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVDRip|DVD9|DVD5/i);
        name = parts.length > 1 ? (parts.pop() || 'Null') : 'Null';
    }
    name = name.trim();
    if (!name || name.match(/\)|^\d\d/)) name = 'Null';
    if (name === 'Z0N3') name = 'D-Z0N3';
    if (name === 'AVC.ZONE') name = 'ZONE';
    if (name.match(/CultFilms/)) name = 'CultFilms™';
    if (name.match(/™/) && !name.match(/CultFilms/)) name = 'Null';
    if (name.includes('.nfo')) name = name.replace('.nfo', '');
    if (name.match(/[_\.! ]/) || name.match(/Extras/i)) name = 'Null';
    if (name.length === 1 || name.match(/^\d+$/)) name = 'Null';
    return name;
}
