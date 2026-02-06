import { TorrentMeta } from '../../types/TorrentMeta';
import { getAudioCodecSel, getCodecSel, getMediumSel, getStandardSel, getType } from './text';
import { getMediainfoPictureFromDescr } from './media';
import { getSmallDescrFromDescr, getSourceSelFromDescr } from './helpers';
import { addThanks } from './teams';
import { dealWithTitle, dealWithSubtitle } from './title';

export function normalizeMeta(meta: TorrentMeta, forwardSite?: string): TorrentMeta {
    const out: TorrentMeta = { ...meta };
    let descr = out.description || '';

    descr = descr.replace(/%3A/g, ':').replace(/%2F/g, '/');
    descr = descr.replace('[quote][/quote]', '').replace('[b][/b]', '').replace(/\n\n+/, '\n\n');
    descr = descr.replace(
        'https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png',
        'https://img93.pixhost.to/images/86/435614074_c5134549f13c2c087d67c9fa4089c49e-removebg-preview.png'
    );
    descr = descr.replace(/引用.{0,5}\n/g, '');
    descr = descr.replace(/.*ARDTU.*/g, '');

    if (out.title) {
        out.title = dealWithTitle(out.title);
    }
    if (out.subtitle) {
        out.subtitle = dealWithSubtitle(out.subtitle);
    }
    if (out.smallDescr) {
        out.smallDescr = dealWithSubtitle(out.smallDescr);
    }

    if (!out.smallDescr) {
        out.smallDescr = getSmallDescrFromDescr(descr, out.title || '');
        if (!out.subtitle) out.subtitle = out.smallDescr;
    }

    if (out.type === '电影') {
        if (descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}纪录片/i)) out.type = '纪录';
        if (descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}动画/i)) out.type = '动漫';
    }

    if (!out.imdbUrl && descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)) {
        out.imdbUrl = descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)?.[0] + '/';
        out.imdbId = out.imdbUrl?.match(/tt\d+/)?.[0];
    }
    if (!out.doubanUrl && descr.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)) {
        out.doubanUrl = descr.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)?.[0] + '/';
        out.doubanId = out.doubanUrl?.match(/subject\/(\d+)/)?.[1];
    }

    if (out.tracklist) {
        out.tracklist = out.tracklist.replace(/\t/g, '');
    }

    if (out.imdbUrl) {
        out.imdbUrl = out.imdbUrl.split('?').pop();
    }

    if (!out.sourceSel || out.sourceSel.match(/(港台|日韩)/)) {
        const region = getSourceSelFromDescr(descr);
        if (out.sourceSel?.match(/(港台|日韩)/)) {
            if (out.sourceSel === '港台') {
                out.sourceSel = region === '台湾' ? '台湾' : '香港';
            } else if (out.sourceSel === '日韩') {
                out.sourceSel = region === '日本' ? '日本' : '韩国';
            }
        }
        if (region && !out.sourceSel) out.sourceSel = region;
    }

    if (!out.mediumSel) {
        out.mediumSel = getMediumSel(out.title || '', out.title);
        if (!out.mediumSel && descr.match(/mpls/i)) out.mediumSel = 'Blu-ray';
        if (out.type === '音乐' && out.musicMedia) out.mediumSel = out.musicMedia;
    }
    if (out.mediumSel === 'Blu-ray' && ((out.title || '').match(/UHD|2160P/i) || descr.match(/2160p/))) {
        out.mediumSel = 'UHD';
    }

    if (!out.codecSel) {
        out.codecSel = getCodecSel(out.title || '');
    }
    if (!out.audioCodecSel) {
        out.audioCodecSel = getAudioCodecSel(out.title || '');
        if (!out.audioCodecSel) out.audioCodecSel = getAudioCodecSel(descr);
    }
    if (!out.standardSel) {
        out.standardSel = getStandardSel(out.title || '');
    }

    if (!out.standardSel) {
        try {
            const height = descr.match(/Height.*?:(.*?)pixels/i)?.[1].trim();
            if (height === '480' || height === '576') out.standardSel = 'SD';
            else if (height === '720') out.standardSel = '720p';
            else if (height === '1 080') {
                out.standardSel = '1080p';
                if (descr.match(/Scan.*?type.*?(Interleaved|Interlaced)/i)) out.standardSel = '1080i';
            } else if (height === '2 160') {
                out.standardSel = '4K';
            }
        } catch {
            if (descr.match(/(1080|2160)p/)) {
                out.standardSel = descr.match(/(1080|2160)p/)?.[0].replace('2160p', '4K');
            }
        }
    }

    if (out.standardSel === '1080p') {
        if (getStandardSel(out.title || '') === '1080i') {
            out.standardSel = '1080i';
        } else {
            try {
                const mi = getMediainfoPictureFromDescr(descr, { mediumSel: out.mediumSel }).mediainfo;
                if (mi.match(/1080i|Scan.*?type.*?(Interleaved|Interlaced)/)) {
                    out.standardSel = '1080i';
                }
            } catch {}
        }
    }

    if ((out.title || '').match(/Remux/i)) out.mediumSel = 'Remux';
    if ((out.title || '').match(/webrip/i)) out.mediumSel = 'WEB-DL';

    if (out.editionInfo) {
        const editionMedium = getMediumSel(out.editionInfo, out.title);
        if (editionMedium) {
            if (editionMedium !== 'Blu-ray' || descr.match(/mpls/i)) out.mediumSel = editionMedium;
            else if (editionMedium === 'Blu-ray' && out.editionInfo.match(/mkv/i)) out.mediumSel = 'Encode';
        }
    }

    if (out.codecSel === 'H265' && (out.title || '').match(/x265/i)) {
        out.codecSel = 'X265';
    }

    if (out.audioCodecSel === 'TrueHD' && descr.match(/Atmos/)) {
        out.audioCodecSel = 'Atmos';
    }

    descr = descr
        .replace(/\n\n+/g, '\n\n')
        .replace('https://dbimg.audiences.me/?', '')
        .replace('https://imgproxy.pterclub.net/douban/?t=', '')
        .replace('https://imgproxy.tju.pt/?url=', '');

    if (out.editionInfo) {
        const editionCodec = getCodecSel(out.editionInfo);
        if (editionCodec) out.codecSel = editionCodec;
    }

    if (!out.codecSel || forwardSite === 'PTer') {
        if (descr.match(/Writing library.*(x264|x265)/)) {
            out.codecSel = descr.match(/Writing library.*(x264|x265)/)?.[1].toUpperCase();
            if ((out.title || '').match(/H.?26[45]/)) {
                out.title = out.title.replace(/H.?26[45]/i, out.codecSel?.toLowerCase() || '');
            }
        } else if (descr.match(/Video[\s\S]*?Format.*?HEVC/i)) {
            out.codecSel = 'H265';
        } else if (descr.match(/Video[\s\S]*?Format.*?AVC/i)) {
            out.codecSel = 'H264';
        } else if (descr.match(/XviD/i)) {
            out.codecSel = 'XVID';
        } else if (descr.match(/DivX/i)) {
            out.codecSel = 'DIVX';
        } else if (descr.match(/Video[\s\S]*?Format.*?MPEG Video[\s\S]{1,10}Format Version.*?Version 4/i)) {
            out.codecSel = 'MPEG-4';
        } else if (descr.match(/Video[\s\S]*?Format.*?MPEG Video[\s\S]{1,10}Format Version.*?Version 2/i)) {
            out.codecSel = 'MPEG-2';
        }
    }

    if (descr.match(/Writing library.*(x264|x265)/)) {
        out.codecSel = descr.match(/Writing library.*(x264|x265)/)?.[1].toUpperCase();
    }

    if ((out.title || '').match(/dvdrip/i)) out.mediumSel = 'DVD';

    if (out.originSite === 'OurBits') {
        descr = descr.replace(/\[quote\]\n/g, '[quote]');
    }

    try {
        if (descr.match(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g)?.length && (descr.match(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g)?.length || 0) >= 2) {
            descr = descr.split(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g).pop() || descr;
            descr = addThanks(descr, out.title || '');
        }
    } catch {}

    descr = descr.trim();

    out.description = descr;
    if (!out.type && out.title) out.type = getType(out.title);
    return out;
}
