
const N = "\n";

export function simplifyMI(mediainfo_text: string, site?: string): string {
    let simplifiedMI = '';
    if (mediainfo_text.match(/QUICK SUMMARY/i)) {
        return mediainfo_text;
    }
    if (mediainfo_text.match(/Disc INFO/i)) {
        if (site == 'HDT') {
            return mediainfo_text;
        }
        simplifiedMI = full_bdinfo2summary(mediainfo_text);
        return simplifiedMI;
    }

    if (!mediainfo_text.match(/Video[\S\s]{0,5}ID/)) {
        return mediainfo_text;
    }

    const general_match = mediainfo_text.match(/(general[\s\S]*?)?video/i);
    let general_info = general_match ? general_match[0].trim() : '';
    general_info = get_general_info(general_info);

    const release_date_match = mediainfo_text.match(/encode.{0,10}date.*?:(.*)/i);
    if (release_date_match) {
        const release_date = release_date_match[1].trim();
        general_info += `Release date.......: ${release_date}`;
    }
    general_info += `${N}${N}`;
    simplifiedMI += general_info;

    let video_info = '';
    try {
        const match = mediainfo_text.match(/(video[\s\S]*?)audio/i);
        video_info = match ? match[0].trim() : '';
    } catch (err) {
        const match = mediainfo_text.match(/(video[\s\S]*?)Forced/i);
        video_info = match ? match[0].trim() : '';
    }
    video_info = get_video_info(video_info);
    simplifiedMI += video_info;

    let audio_info_full = '';
    try {
        const match = mediainfo_text.match(/(audio[\s\S]*?)(text)/i);
        audio_info_full = match ? match[0].trim() : '';
    } catch (err) {
        const match = mediainfo_text.match(/(audio[\s\S]*?)(Forced|Alternate group)/i);
        audio_info_full = match ? match[0].trim() : '';
    }

    const audio_infos = audio_info_full.split(/audio.*?\nid.*/i).filter(audio => audio.length > 30);
    for (let i = 0; i < audio_infos.length; i++) {
        const info = get_audio_info(audio_infos[i]);
        simplifiedMI += info;
    }

    try {
        const text_match = mediainfo_text.match(/(text[\s\S]*)$/i);
        if (text_match) {
            const text_info = text_match[0].trim();
            const text_infos = text_info.split(/text.*?\nid.*/i).filter(text => text.length > 30);
            for (let i = 0; i < text_infos.length; i++) {
                const subtitle_info = get_text_info(text_infos[i]);
                simplifiedMI += subtitle_info;
            }
        } else {
            throw new Error("No text info");
        }
    } catch (err) {
        const subtitle_text = `Subtitles..........: no`;
        simplifiedMI += subtitle_text;
    }

    return simplifiedMI;
}

function get_general_info(general_info: string): string {
    let general_text = "General\n";
    try {
        const match = general_info.match(/Complete name.*?:(.*)/i);
        if (match) {
            const filename = match[1].split('/').pop()?.trim();
            general_text += `Release Name.......: ${filename}${N}`;
        }
    } catch (err) { }
    try {
        const match = general_info.match(/format.*:(.*)/i);
        if (match) {
            const format = match[1].trim();
            general_text += `Container..........: ${format}${N}`;
        }
    } catch (err) { }
    try {
        const match = general_info.match(/duration.*:(.*)/i);
        if (match) {
            const duration = match[1].trim();
            general_text += `Duration...........: ${duration}${N}`;
        }
    } catch (err) { }
    try {
        const match = general_info.match(/file.{0,5}size.*:(.*)/i);
        if (match) {
            const file_size = match[1].trim();
            general_text += `Size...............: ${file_size}${N}`;
        }
    } catch (err) { }

    general_text += `Source(s)..........: ${N}`;

    return general_text;
}

function get_video_info(video_info: string): string {
    let video_text = `Video${N}`;
    try {
        const codec = video_info.match(/format.*:(.*)/i)?.[1].trim();
        if (codec) video_text += `Codec..............: ${codec}${N}`;
    } catch (err) { }
    try {
        const type = video_info.match(/scan.{0,5}type.*:(.*)/i)?.[1].trim();
        if (type) video_text += `Type...............: ${type}${N}`;
    } catch (err) { }
    try {
        const width = video_info.match(/width.*:(.*)/i)?.[1].trim();
        const height = video_info.match(/height.*:(.*)/i)?.[1].trim();
        if (width && height) {
            const resolution = width.replace(/ /g, '').match(/\d+/)?.[0] + 'x' + height.replace(/ /g, '').match(/\d+/)?.[0];
            video_text += `Resolution.........: ${resolution}${N}`;
        }
    } catch (err) { }
    try {
        const aspect_ratio = video_info.match(/display.{0,5}aspect.{0,5}ratio.*?:(.*)/i)?.[1].trim();
        if (aspect_ratio) video_text += `Aspect ratio.......: ${aspect_ratio}${N}`;
    } catch (err) { }
    try {
        const bit_rate = video_info.match(/bit.{0,5}rate(?!.*mode).*:(.*)/i)?.[1].trim();
        if (bit_rate) video_text += `Bit rate...........: ${bit_rate}${N}`;
    } catch (err) { }
    try {
        const hdr_format = video_info.match(/HDR FORMAT.*:(.*)/i)?.[1].trim();
        if (hdr_format) video_text += `HDR format.........: ${hdr_format}${N}`;
    } catch (err) { }
    try {
        const frame_rate = video_info.match(/frame.{0,5}rate.*:(.*fps)/i)?.[1].trim();
        if (frame_rate) video_text += `Frame rate.........: ${frame_rate}${N}`;
    } catch (err) { }

    video_text += `${N}`;

    return video_text;
}

function get_audio_info(audio_info: string): string {
    let audio_text = `Audio${N}`;
    try {
        const format = audio_info.match(/format.*:(.*)/i)?.[1].trim();
        if (format) audio_text += `Format.............: ${format}${N}`;
    } catch (err) { }
    try {
        const channels = audio_info.match(/channel\(s\).*:(.*)/i)?.[1].trim();
        if (channels) audio_text += `Channels...........: ${channels}${N}`;
    } catch (err) { }
    try {
        const bit_rate = audio_info.match(/bit.{0,5}rate(?!.*mode).*:(.*)/i)?.[1].trim();
        if (bit_rate) audio_text += `Bit rate...........: ${bit_rate}${N}`;
    } catch (err) { }
    try {
        const language = audio_info.match(/language.*:(.*)/i)?.[1].trim();
        if (language) audio_text += `Language...........: ${language}`;
    } catch (err) { }
    let title = '';
    try { title = audio_info.match(/title.*:(.*)/i)?.[1].trim() || ''; } catch (err) { title = ''; }
    audio_text += ` ${title}${N}${N}`;

    return audio_text;
}

function get_text_info(text_info: string): string {
    const format = text_info.match(/format.*:(.*)/i)?.[1].trim() || '';
    const language = text_info.match(/language.*:(.*)/i)?.[1].trim() || '';
    let title = '';
    try { title = text_info.match(/title.*:(.*)/i)?.[1].trim() || ''; } catch (err) { title = ''; }
    const subtitle_text = `Subtitles..........: ${language} ${format} ${title}${N}`;
    return subtitle_text;
}

export function full_bdinfo2summary(descr: string): string {
    if (!descr.match(/DISC INFO/)) {
        return descr.split(/\[\/quote\]/)[0].replace('[quote]', '');
    }
    const summary: Record<string, string> = {
        'Disc Title': '',
        'Disc Size': '',
        'Protection': '',
        'BD-Java': '',
        'Playlist': '',
        'Size': '',
        'Length': '',
        'Total Bitrate': '',
        'Video': '',
        'Audio': '',
        'Subtitle': '',
    };

    if (descr.match(/Disc.*?Title:(.*)/i)) {
        summary['Disc Title'] = descr.match(/Disc.*?Title:(.*)/i)![1].trim();
    }
    if (descr.match(/Disc.*?Size:(.*)/i)) {
        summary['Disc Size'] = descr.match(/Disc.*?Size:(.*)/i)![1].trim();
    }
    if (descr.match(/Protection:(.*)/i)) {
        summary['Protection'] = descr.match(/Protection:(.*)/i)![1].trim();
    }
    if (descr.match(/Extras:.*?BD-Java/i)) {
        summary['BD-Java'] = 'Yes';
    } else {
        summary['BD-Java'] = 'No';
    }
    if (descr.match(/PLAYLIST[\s\S]{3,30}?Name:(.*)/i)) {
        summary['Playlist'] = descr.match(/PLAYLIST[\s\S]{3,30}?Name:(.*)/i)![1].trim();
    }
    if (descr.match(/PLAYLIST[\s\S]{3,90}?Length:(.*)/i)) {
        summary['Length'] = descr.match(/PLAYLIST[\s\S]{3,90}?Length:(.*)/i)![1].trim();
    }
    if (descr.match(/PLAYLIST[\s\S]{3,190}?Size:(.*)/i)) {
        summary['Size'] = descr.match(/PLAYLIST[\s\S]{3,190}?Size:(.*)/i)![1].trim();
    }
    if (descr.match(/PLAYLIST[\s\S]{3,290}?Total.*?Bitrate:(.*)/i)) {
        summary['Total Bitrate'] = descr.match(/PLAYLIST[\s\S]{3,290}?Total.*?Bitrate:(.*)/i)![1].trim();
    }

    if (descr.match(/Video:[\s\S]{0,20}Codec/i)) {
        const video_info = descr.match(/Video:[\s\S]{0,300}-----------([\s\S]*)/i)![1].split(/audio/i)[0].trim();
        summary['Video'] = video_info.split('\n').map(e => {
            const info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') { return ee.trim(); } });
            return info.join(' / ').trim();
        }).join('\nVideo: ').replace(/(\nVideo: )+$/, '');
    }

    if (descr.match(/SUBTITLES:[\s\S]{0,20}Codec/i)) {
        const subtitle_info = descr.match(/SUBTITLES:[\s\S]{0,300}-----------([\s\S]*)/i)![1].split(/FILES/i)[0].trim();
        summary['Subtitle'] = subtitle_info.split('\n').map(e => {
            const info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') return ee.trim(); });
            return info.join(' / ').trim();
        }).join('\nSubtitle: ').split('[/quote]')[0].replace(/(\nSubtitle: )+$/, '');
    }
    if (descr.match(/Audio:[\s\S]{0,20}Codec/i)) {
        const audio_info = descr.match(/Audio:[\s\S]{0,300}-----------([\s\S]*)/i)![1].split(/subtitles|\[.*?quote\]/i)[0].trim();
        summary['Audio'] = audio_info.split('\n').map(e => {
            const info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') return ee.trim(); });
            return info.join(' / ').trim();
        }).join('\nAudio: ');
    }

    let quick_summary = '';
    for (const key in summary) {
        if (summary[key]) {
            quick_summary += key + ': ' + summary[key] + '\n';
        }
    }
    return quick_summary;
}
