export function getMediumSel(text: string, title?: string): string {
    let result = text;
    // Legacy parity: match WEB-DL variants but avoid broad `WEB ` / `WEB.` that can false-positive on "WEB:"
    // metadata blocks (e.g. HDB details tables) and other unrelated text.
    const t = title || '';
    const webTokenInTitle = /(^|[ ._\\-])WEB([ ._\\-]|$)/i.test(t);
    if ((result.match(/(WEBDL|WEB[-_. ]?DL|Web[-_. ]?DL)/i) || webTokenInTitle) && !t.match(/webrip/i)) {
        result = 'WEB-DL';
    } else if (result.match(/(UHDTV)/i)) {
        result = 'UHDTV';
    } else if (result.match(/(HDTV)/i)) {
        result = 'HDTV';
    } else if (result.match(/(Remux)/i) && !result.match(/Encode/)) {
        result = 'Remux';
    } else if (result.match(/(Blu-ray|.MPLS|Bluray原盘)/i) && !result.match(/Encode/i)) {
        result = 'Blu-ray';
    } else if (result.match(/(UHD|UltraHD)/i) && !result.match(/Encode/i)) {
        result = 'UHD';
    } else if (result.match(/(Encode|BDRIP|webrip|BluRay)/i) || result.match(/(x|H).?(264|265)/i)) {
        result = 'Encode';
    } else if (result.match(/(DVDRip|DVD)/i)) {
        result = 'DVD';
    } else if (result.match(/TV/)) {
        result = 'TV';
    } else if (result.match(/VHS/)) {
        result = 'VHS';
    } else if (result.match(/格式: CD|媒介: CD/)) {
        result = 'CD';
    } else {
        result = '';
    }
    return result;
}

export function getCodecSel(text: string): string {
    let result = text;
    if (result.match(/(H264|H\.264|AVC)/i)) {
        result = 'H264';
    } else if (result.match(/(HEVC|H265|H\.265)/i)) {
        result = 'H265';
    } else if (result.match(/(VVC|H266|H\.266)/i)) {
        result = 'H266';
    } else if (result.match(/(X265)/i)) {
        result = 'X265';
    } else if (result.match(/(X264)/i)) {
        result = 'X264';
    } else if (result.match(/(VC-1)/i)) {
        result = 'VC-1';
    } else if (result.match(/(MPEG-2)/i)) {
        result = 'MPEG-2';
    } else if (result.match(/(MPEG-4)/i)) {
        result = 'MPEG-4';
    } else if (result.match(/(XVID)/i)) {
        result = 'XVID';
    } else if (result.match(/(VP9)/i)) {
        result = 'VP9';
    } else if (result.match(/DIVX/i)) {
        result = 'DIVX';
    } else {
        result = '';
    }
    return result;
}

export function getAudioCodecSel(text: string): string {
    let result = text;
    if (result.match(/(DTS-HDMA:X 7\.1|DTS.?X.?7\.1)/i)) {
        result = 'DTS-HDMA:X 7.1';
    } else if (result.match(/(DTS-HD.?MA)/i)) {
        result = 'DTS-HDMA';
    } else if (result.match(/(DTS-HD.?HR)/i)) {
        result = 'DTS-HDHR';
    } else if (result.match(/(DTS-HD)/i)) {
        result = 'DTS-HD';
    } else if (result.match(/(DTS.?X[^2])/i)) {
        result = 'DTS-X';
    } else if (result.match(/(LPCM)/i)) {
        result = 'LPCM';
    } else if (result.match(/(OPUS)/i)) {
        result = 'OPUS';
    } else if (result.match(/([ \.]DD|AC3|AC-3|Dolby Digital)/i)) {
        result = 'AC3';
    } else if (result.match(/(Atmos)/i) && result.match(/True.?HD/)) {
        result = 'Atmos';
    } else if (result.match(/(AAC)/i)) {
        result = 'AAC';
    } else if (result.match(/(TrueHD)/i)) {
        result = 'TrueHD';
    } else if (result.match(/(DTS)/i)) {
        result = 'DTS';
    } else if (result.match(/(Flac)/i)) {
        result = 'Flac';
    } else if (result.match(/(APE)/i)) {
        result = 'APE';
    } else if (result.match(/(MP3)/i)) {
        result = 'MP3';
    } else if (result.match(/(WAV)/i)) {
        result = 'WAV';
    } else if (result.match(/(OGG)/i)) {
        result = 'OGG';
    } else {
        result = '';
    }
    if (text.match(/AUDiO CODEC/i) && text.match(/-WiKi/)) {
        const match = text.match(/AUDiO CODEC.*/i);
        if (match) {
            return getAudioCodecSel(match[0]);
        }
    }
    return result;
}

export function getStandardSel(text: string): string {
    let result = text;
    if (result.match(/(4320p|8k)/i)) {
        result = '8K';
    } else if (result.match(/(1080p|2K)/i)) {
        result = '1080p';
    } else if (result.match(/(720p)/i)) {
        result = '720p';
    } else if (result.match(/(1080i)/i)) {
        result = '1080i';
    } else if (result.match(/(576[pi]|480[pi])/i)) {
        result = 'SD';
    } else if (result.match(/(1440p)/i)) {
        result = '144Op';
    } else if (result.match(/(2160p|4k)/i)) {
        result = '4K';
    } else {
        result = '';
    }
    return result;
}

export function getType(text: string): string {
    let result = text.split('來源')[0];
    if (result.match(/(Movie|电影|UHD原盘|films|電影|剧场)/i)) {
        result = '电影';
    } else if (result.match(/(Animation|动漫|動畫|动画|Anime|Cartoons?)/i)) {
        result = '动漫';
    } else if (result.match(/(TV.*Show|综艺)/i)) {
        result = '综艺';
    } else if (result.match(/(Docu|纪录|Documentary)/i)) {
        result = '纪录';
    } else if (result.match(/(短剧)/i)) {
        result = '短剧';
    } else if (result.match(/(TV.*Series|影劇|剧|TV-PACK|TV-Episode|TV)/i)) {
        result = '剧集';
    } else if (result.match(/(Music Videos|音乐短片|MV\(演唱\)|MV.演唱会|MV\(音乐视频\)|Music Video|Musics MV|Music-Video|音乐视频|演唱会\/MV|MV\/演唱会|MV)/i)) {
        result = 'MV';
    } else if (result.match(/(有声小说|Audio\(有声\)|有声书|有聲書)/i)) {
        result = '有声小说';
    } else if (result.match(/(Music|音乐)/i)) {
        result = '音乐';
    } else if (result.match(/(Sport|体育|運動)/i)) {
        result = '体育';
    } else if (result.match(/(学习|资料|Study)/i)) {
        result = '学习';
    } else if (result.match(/(Software|软件|軟體)/i)) {
        result = '软件';
    } else if (result.match(/(Game|游戏|PC遊戲)/i)) {
        result = '游戏';
    } else if (result.match(/(eBook|電子書|电子书|书籍|book)/i)) {
        result = '书籍';
    } else {
        result = '';
    }
    return result;
}

export function getLabel(text: string): Record<string, boolean> {
    const myString = text.toString();
    const name = myString.split('#separator#')[0];
    const labels = {
        gy: false,
        yy: false,
        zz: false,
        diy: false,
        hdr10: false,
        db: false,
        hdr10plus: false,
        yz: false,
        en: false,
        yp: false,
        hdr: false
    };

    // Chinese subtitle detection - more precise to avoid false positives from site metadata
    // Must match actual subtitle track patterns, not general "Chinese" mentions
    if (myString.match(/([简繁].{0,12}字幕|[简繁中].{0,3}字|简中|DIY.{1,5}字|内封.{0,3}[繁中字])|(Text[\s#]+\d+[\s\S]{0,100}?Language[\s:]+Chinese|Text[\s#]+\d+[\s\S]{0,100}?Language[\s:]+Mandarin|subtitles.*chs|Presentation Graphics[\s\S]{0,50}?Chinese)/i)) {
        labels.zz = true;
    }
    if (myString.match(/(英.{0,12}字幕|英.{0,3}字|内封.{0,3}英.{0,3}字)|(Text.*?[\s\S]*?English|subtitles.*eng|subtitle.*english|Graphics.*?English)/i)) {
        labels.yz = true;
    }

    if (myString.match(/([^多]国.{0,3}语|国.{0,3}配|台.{0,3}语|台.{0,3}配)|(Audio.*Chinese|Audio.*mandarin)/i)) {
        const subStr = myString.match(/([^多]国.{0,3}语|国.{0,3}配|台.{0,3}语|台.{0,3}配)|(Audio.*Chinese|Audio.*mandarin)/i)?.[0] || '';
        if (!subStr.match(/国家|Subtitles/)) {
            labels.gy = true;
        }
    }
    if (myString.match(/(Audio.*English|◎语.*?言.*?英语)/i)) {
        labels.en = true;
    }
    try {
        const audio = myString.match(/Audio[\s\S]*?English/)?.[0].split('Text')[0];
        if (audio && audio.match(/Language.*?English/)) {
            labels.en = true;
        }
    } catch (err) { }
    if (name.match(/(粤.{0,3}语|粤.{0,3}配|Audio.*cantonese)/i)) {
        labels.yy = true;
    }
    if (name.match(/DIY|-.*?@(MTeam|CHDBits|HDHome|OurBits|HDChina|Language|TTG|Pter|HDSky|Audies|CMCT|Dream|Audies)/i) && myString.match(/mpls/i)) {
        labels.diy = true;
    } else if (myString.match(/DISC INFO/) || myString.match(/mpls/i)) {
        labels.yp = true;
    }
    if (myString.match(/HDR10\+/)) {
        labels.hdr10plus = true;
    } else if (myString.match(/HDR10/)) {
        labels.hdr10 = true;
    } else if (myString.match(/HDR/)) {
        labels.hdr = true;
    }
    if (myString.match(/Dolby Vision|杜比视界/i)) {
        labels.db = true;
    }
    return labels;
}
