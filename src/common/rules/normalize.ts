import { TorrentMeta } from '../../types/TorrentMeta';
import { getAudioCodecSel, getCodecSel, getMediumSel, getStandardSel, getType } from './text';
import { getMediainfoPictureFromDescr } from './media';
import { getSmallDescrFromDescr, getSourceSelFromDescr } from './helpers';
import { addThanks } from './teams';
import { dealWithTitle, dealWithSubtitle } from './title';
import { extractDoubanId, extractImdbId, extractTmdbId, matchLink } from './links';
import { rebuildReleaseTitleFromMedia } from './titleRebuild';

const MEDIAINFO_TITLE_REWRITE_TARGETS = new Set([
    'HDB',
    'HDHome',
    'HDSky',
    'OurBits',
    'CMCT',
    'Audiences',
    'FRDS',
    'CHDBits',
    'PTer',
    'TTG',
    'NPUPT',
    'PTP',
    'GPW',
    'MTeam',
    'OpenCD',
    'Dragon',
    'QingWa',
    'NanYang',
    'iTS',
    'xthor'
]);

function getBlurayNameFromDescr(descr: string, name: string, currentName?: string): string {
    let tempTitle = '';
    if (descr.match(/(2160)(P|I)/i)) {
        tempTitle += '2160p.Blu-ray ';
    } else if (descr.match(/(1080)(P)/i)) {
        tempTitle += '1080p.Blu-ray.';
    } else if (descr.match(/(1080)(i)/i)) {
        tempTitle += '1080i.Blu-ray.';
    }

    if (descr.match(/Ultra HD|UHD/i)) {
        tempTitle = 'UHD ';
    }

    if (descr.match(/(AVC Video)/i)) {
        tempTitle += 'AVC.';
    } else if (descr.match(/(HEVC)/i)) {
        tempTitle += 'HEVC.';
    } else if (descr.match(/MPEG-2 Video/i)) {
        tempTitle += 'MPEG-2.';
    }

    if (descr.match(/DTS:X[\s\S]{0,200}?7.1/i)) {
        tempTitle += 'DTS-HD.MA.7.1';
    } else if (descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `TrueHD.${descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    } else if (descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `DTS-HD.MA.${descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    } else if (descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `LPCM.${descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    } else if (descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `DD.${descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    }

    if (currentName && currentName.match(/Blu-ray|DTS-HD|TrueHD|LPCM|HEVC|Bluray/i)) {
        return currentName;
    }
    if (name.match(/BLURAY|UHD\.BLURAY/i)) {
        let fixed = name.replace(/MULTi.|DUAL.|SWEDiSH|DOCU/i, '');
        fixed = fixed.replace(/GERMAN/i, 'GER');
        fixed = fixed.replace(/REMASTERED/i, 'Remastered');
        fixed = fixed.replace(/UNCUT/i, 'Uncut');
        fixed = fixed.replace(/COMPLETE[\s\S]{0,20}BLURAY/i, tempTitle);
        return fixed;
    }
    return `${name}.${tempTitle}-NoGroup`;
}

function extractPrimaryAudioBlob(blob: string): string {
    if (!blob) return '';
    const cleaned = blob.replace(/\r/g, '');
    try {
        // BDInfo summary style:
        // Audio:
        // ----------- ...
        // <line1>
        // <line2>
        const section = cleaned.match(/Audio:[\s\S]{0,400}?-----------([\s\S]*?)(?:\n\s*(?:Subtitle|Subtitles|Text|Files|Disc Title|Disc Size)\b|$)/i)?.[1] || '';
        if (section) {
            const firstLine = section
                .split('\n')
                .map((x) => x.trim())
                .find((x) => !!x && !/^[-=]+$/.test(x));
            if (firstLine) return firstLine;
        }
    } catch {}
    try {
        const audio1 = cleaned.match(/Audio\s*#?\s*1[\s\S]{0,900}?(?=\n(?:Audio|Text|Menu|Chapter|Video)\b|$)/i)?.[0];
        if (audio1) return audio1;
    } catch {}
    try {
        const audioSection = cleaned.match(/Audio[\s\S]{0,700}?(?=\n(?:Audio|Text|Menu|Chapter|Video)\b|$)/i)?.[0];
        if (audioSection) return audioSection;
    } catch {}
    try {
        const bdAudio = cleaned.match(/Audio:\s*[^\n]+/i)?.[0];
        if (bdAudio) return bdAudio;
    } catch {}
    return '';
}

function getPrimaryAudioCodecSel(blob: string): string {
    const section = extractPrimaryAudioBlob(blob);
    if (!section) return '';
    if (/True.?HD[\s\S]{0,60}Atmos|Atmos|E-?AC-?3[\s\S]{0,20}JOC/i.test(section)) return 'Atmos';
    if (/E-?AC-?3|DDP/i.test(section)) return 'AC3';
    if (/True.?HD/i.test(section)) return 'TrueHD';
    if (/DTS[- .]?X/i.test(section)) return 'DTS-HDMA:X 7.1';
    if (/DTS[- .]?HD[\s\S]{0,30}(MA|Master)/i.test(section)) return 'DTS-HDMA';
    if (/DTS[- .]?HD[\s\S]{0,30}(HR|HRA)/i.test(section)) return 'DTS-HDHR';
    if (/DTS[- .]?HD/i.test(section)) return 'DTS-HD';
    if (/LPCM|PCM/i.test(section)) return 'LPCM';
    if (/FLAC/i.test(section)) return 'Flac';
    if (/AAC/i.test(section)) return 'AAC';
    if (/AC-?3|Dolby Digital|(^|[^A-Z])DD([^A-Z]|$)/i.test(section)) return 'AC3';
    if (/\bDTS\b/i.test(section)) return 'DTS';
    return getAudioCodecSel(section);
}

function applyMediaInfoDrivenTitleRewrite(out: TorrentMeta, forwardSite?: string): void {
    if (!forwardSite || !MEDIAINFO_TITLE_REWRITE_TARGETS.has(forwardSite)) return;
    if (!out.title) return;
    if (out.type && /音乐|书籍|软件|游戏/i.test(out.type)) return;

    const blob = `${out.description || ''}\n${out.fullMediaInfo || ''}`;
    if (!blob.trim()) return;

    const originalTitle = out.title;
    const originalLooksRaw =
        /\.(mkv|mp4|m2ts|avi|ts)$/i.test(originalTitle) ||
        /[\\/]/.test(originalTitle) ||
        (!/\s/.test(originalTitle) && (originalTitle.match(/\./g)?.length || 0) >= 5);

    let name = originalTitle;
    if (originalLooksRaw) {
        // Treat "file/folder-like" names as raw tokens and normalize separators first.
        name = name
            .split(/[\\/]/)
            .filter(Boolean)
            .pop() || name;
        name = name.replace(/\.(mkv|mp4|m2ts|avi|ts)$/i, '');
        name = name.replace(/\.(?!\d)/g, ' ').replace(/[_]+/g, ' ').replace(/ +/g, ' ').trim();
    }
    name = name.replace(/DDPA?/gi, 'DD+').replace(/\bAC-?3\b/gi, 'DD').replace(/DTS(\d+(?:\.\d+)?)/gi, 'DTS $1');
    name = name.replace(/[\\/]+/g, ' ').replace(/\.(mkv|mp4|m2ts|avi|ts)$/i, '').trim();

    // Generic rebuild path: if title is raw/incomplete but media blocks are present,
    // reconstruct a canonical release title from media info (reused by PTP/Tik/other sources).
    try {
        const missingMediaCore =
            !name.match(/(2160p|1080p|1080i|720p|4K)/i) ||
            !name.match(/(Blu-?ray|UHD|WEB[- .]?DL|Remux|HDTV|DVD|Encode)/i) ||
            !name.match(/(TrueHD|DTS|AAC|DDP|DD\+|FLAC|LPCM)/i);
        if (originalLooksRaw || missingMediaCore) {
            const rebuilt = rebuildReleaseTitleFromMedia(
                { title: name, description: out.description || '', fullMediaInfo: out.fullMediaInfo || '' },
                { defaultGroup: '' }
            );
            if (rebuilt) name = rebuilt;
        }
    } catch {}

    // Legacy parity: keep channel rewrite behavior close to `auto_feed.legacy.user.js`.
    const rebuildByChannels = (channelsDigit: string, inName: string) => {
        let label: RegExp = /$^/;
        let labelStr = '';
        if (channelsDigit === '1') {
            label = /1\.0/;
            labelStr = '1.0';
        } else if (channelsDigit === '2') {
            label = /2\.0/;
            labelStr = '2.0';
        } else if (channelsDigit === '6') {
            label = /5\.1/;
            labelStr = '5.1';
        } else if (channelsDigit === '8') {
            label = /7\.1/;
            labelStr = '7.1';
        }
        if (!labelStr) return inName;

        let next = inName;
        if (!next.match(label)) {
            next = next.replace(
                /(DDP|DD\+|AAC|FLAC|LPCM|TrueHD|DTS-HD[ .]?MA|DTS:X|DTS-HD.?HR|DTS|AC3)/i,
                `$1 ${labelStr}`
            );
        }
        return next;
    };

    try {
        const channels = blob.match(/Channel.*?(\d)\s*channel/i)?.[1] || '';
        if (channels) name = rebuildByChannels(channels, name);
    } catch {}

    if (!name.match(/(1\.0|2\.0|5\.1|7\.1)/)) {
        try {
            const channels = blob.match(/(AUDIO.*CODEC.*?|音频.*?)(2\.0|1\.0|5\.1|7\.1)/i)?.[2] || '';
            if (channels && !name.includes(channels)) {
                name = name.replace(
                    /(DDP|AAC|FLAC|LPCM|TrueHD|DTS-HD[ .]?MA|DTS:X|DTS-HD.?HR|DTS|AC3|DD)/i,
                    `$1 ${channels}`
                );
            }
        } catch {}
    }

    if (!name.match(/(1\.0|2\.0|5\.1|7\.1)/)) {
        try {
            const channels = blob.match(/(\d)\s*channels/i)?.[1] || '';
            if (channels) name = rebuildByChannels(channels, name);
        } catch {}
    }
    if (name.match(/WEB-DL/i)) {
        name = name.replace(/HEVC/i, 'H.265').replace(/AVC/i, 'H.264');
    }

    // If source title is basically a folder/file name for disc content, rebuild release tail from BDInfo/MI.
    try {
        if ((originalLooksRaw || !name.match(/(Blu-?ray|UHD|WEB[- .]?DL|Remux|HDTV|DVD)/i)) && blob.match(/DISC INFO|\.MPLS|Disc Label/i)) {
            name = getBlurayNameFromDescr(blob, name, originalLooksRaw ? '' : name).replace(/bluray/i, 'Blu-ray');
        }
    } catch {}

    name = name.replace(/(WEB-DL|Blu-?ray|Bluray|HDTV)[ .](1080p|4K|2160p|720p|480p)/i, '$2 $1');
    // Fix malformed patterns produced by noisy source names, e.g. "DTS5.1-HD MA5 1".
    name = name
        .replace(/DTS\s*(2\.0|1\.0|5\.1|7\.1)\s*-\s*HD\s*MA\s*(2\.0|1\.0|5\.1|7\.1)?/i, (_m, ch1) => `DTS-HD MA ${ch1}`)
        .replace(/DTS\s*(2\.0|1\.0|5\.1|7\.1)\s*-\s*HD\s*(HR|HRA)\s*(2\.0|1\.0|5\.1|7\.1)?/i, (_m, ch1) => `DTS-HD HR ${ch1}`)
        .replace(/(DTS-HD\s*MA)\s*(2\.0|1\.0|5\.1|7\.1)/i, '$1 $2')
        .replace(/(DTS-HD\s*HR)\s*(2\.0|1\.0|5\.1|7\.1)/i, '$1 $2')
        .replace(/\b(2|5|7|1|6|4)\s(0|1)\b/g, '$1.$2')
        .replace(/\b(7\.1|6\.1|5\.1|2\.0|1\.0)\s+\1\b/g, '$1');
    name = name
        .replace(/\b(DTS[- .]?HD\s*MA)\s+(?:MA|Master(?:\s*Audio)?)(?=\b|-)/i, '$1')
        .replace(/\b(DTS[- .]?HD\s*HR)\s+(?:HR|HRA|High(?:\s*Resolution)?)(?=\b|-)/i, '$1');

    if (out.type === '剧集' || out.type === '综艺' || out.type === '纪录') {
        const years = name.match(/(19|20)\d{2}[^pP]/g);
        if (years?.[0]) {
            name = name.replace(years[0], ' ');
            name = name.replace(/ +/g, ' ');
        }
    }

    out.title = name.replace(/ +-|- +/g, '-').replace(/ +/g, ' ').trim();
}

function applyAtmosTokenIntoTitle(out: TorrentMeta): void {
    // Legacy: if descr has Atmos but title doesn't, append "Atmos" after the channel token.
    // Used by forward targets: BLU/Audiences/Tik/Aither.
    const name = out.title || '';
    const descr = `${out.description || ''}\n${out.fullMediaInfo || ''}`;
    if (!name || !descr) return;
    if (!/Atmos/i.test(descr) || /atmos/i.test(name)) return;
    out.title = name
        .replace(/(DDP|DD\+|DD|AAC|HDMA|TrueHD|DTS\.?HD|DTS|PCM|FLAC)[ \.](.*?)(\d\.\d)/i, '$1 $2 $3 Atmos')
        .replace(/ +/g, ' ')
        .trim();
}

function applyBluTitleNormalize(out: TorrentMeta): void {
    // Ported from legacy_extract/sites/BLU.js (Snippet 16).
    let name = out.title || '';
    if (!name) return;
    name = name.replace(/Remux/i, 'REMUX');
    name = name.replace(/(Atmos)(.*?)(TrueHD)(.*?)(7\.1)/i, '$2$3 $5 $1').replace(/ +/g, ' ').trim();
    if (name.match(/DV HDR/i)) {
        name = name.replace(/(1080|2160)[pi]/i, (m) => `Hybrid ${m}`);
    }
    name = name.replace(/DDP/gi, 'DD+');
    name = name.replace(/(DD\+|DD|AAC|TrueHD|DTS\.HD.?MA|DTS\.HD.?HR|DTS\.HD|DTS|L?PCM|FLAC)(.*?)(5\.1|2\.0|7\.1|1\.0)/i, '$1 $3');
    name = name.replace(/(WEB-DL)(.*?)(AVC|x264|H264)/i, '$1$2H.264');
    name = name.replace(/(WEB-DL)(.*?)(HEVC|x265|H265)/i, '$1$2H.265');
    out.title = name.replace(/ +/g, ' ').trim();
}

export function normalizeMeta(meta: TorrentMeta, forwardSite?: string): TorrentMeta {
    const out: TorrentMeta = { ...meta };
    let descr = out.description || '';

    descr = descr.replace(/%3A/g, ':').replace(/%2F/g, '/');
    // PTer uses a signed redirect wrapper for outbound links; keep the target URL clean for downstream parsing.
    descr = descr.replace(/https?:\/\/pterclub\.net\/link\.php\?sign=.*?&target=/gi, '');
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

    if (!out.imdbUrl) {
        const imdbUrl = matchLink('imdb', descr);
        if (imdbUrl) {
            out.imdbUrl = imdbUrl;
            out.imdbId = extractImdbId(imdbUrl) || out.imdbId;
        }
    }
    if (!out.doubanUrl) {
        const doubanUrl = matchLink('douban', descr);
        if (doubanUrl) {
            out.doubanUrl = doubanUrl;
            out.doubanId = extractDoubanId(doubanUrl) || out.doubanId;
        }
    }
    // Legacy parity: TMDB link may exist in description blocks; keep both url + id for downstream templates (Unit3D etc).
    if (!out.tmdbUrl) {
        const tmdbUrl = matchLink('tmdb', descr) || matchLink('tmdb', `${out.fullMediaInfo || ''}`) || '';
        if (tmdbUrl) {
            out.tmdbUrl = tmdbUrl;
            out.tmdbId = extractTmdbId(out.tmdbUrl) || out.tmdbId;
        }
    }

    if (out.tracklist) {
        out.tracklist = out.tracklist.replace(/\t/g, '');
    }

    if (out.imdbUrl) {
        // Strip query params without destroying the base URL.
        out.imdbUrl = out.imdbUrl.split('?')[0];
    }
    if (!out.imdbId && out.imdbUrl) {
        out.imdbId = extractImdbId(out.imdbUrl);
    }
    if (!out.tmdbId && out.tmdbUrl) {
        out.tmdbId = extractTmdbId(out.tmdbUrl);
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
        // Prefer parsing from title first (release names usually encode medium),
        // then fall back to description/media-info blobs for sites like PTP.
        out.mediumSel = getMediumSel(out.title || '', out.title);
        if (!out.mediumSel) out.mediumSel = getMediumSel(descr, out.title);
        if (!out.mediumSel && descr.match(/mpls/i)) out.mediumSel = 'Blu-ray';
        if (out.type === '音乐' && out.musicMedia) out.mediumSel = out.musicMedia;
    }
    if (out.mediumSel === 'Blu-ray' && ((out.title || '').match(/UHD|2160P/i) || descr.match(/2160p/))) {
        out.mediumSel = 'UHD';
    }

    if (!out.codecSel) {
        out.codecSel = getCodecSel(out.title || '');
        if (!out.codecSel) out.codecSel = getCodecSel(descr);
    }
    if (!out.audioCodecSel) {
        out.audioCodecSel = getAudioCodecSel(out.title || '');
        if (!out.audioCodecSel) out.audioCodecSel = getAudioCodecSel(descr);
    }
    try {
        const primaryAudio = getPrimaryAudioCodecSel(`${out.fullMediaInfo || ''}\n${descr}`);
        if (primaryAudio) out.audioCodecSel = primaryAudio;
    } catch {}
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

    // Extract mediainfo blob for targets that require dedicated fields (PTer/CMCT/etc).
    if (!out.fullMediaInfo) {
        try {
            const info = getMediainfoPictureFromDescr(descr, { mediumSel: out.mediumSel });
            if (info.mediainfo) out.fullMediaInfo = info.mediainfo.trim();
        } catch {}
    }

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
    try {
        applyMediaInfoDrivenTitleRewrite(out, forwardSite);
    } catch {}
    if (forwardSite === 'BLU') {
        try {
            applyBluTitleNormalize(out);
        } catch {}
    }
    if (forwardSite === 'BLU' || forwardSite === 'Audiences' || forwardSite === 'Tik' || forwardSite === 'Aither') {
        try {
            applyAtmosTokenIntoTitle(out);
        } catch {}
    }
    if (!out.type && out.title) out.type = getType(out.title);
    return out;
}
