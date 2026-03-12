import $ from 'jquery';
import { TorrentMeta } from '../../types/TorrentMeta';
import { getSmallDescrFromDescr } from '../../common/rules/helpers';

export function buildHDSkySmallDescr(meta: TorrentMeta): string {
    const title = meta.title || '';
    const descr = meta.description || '';

    // Prefer existing small_descr, otherwise derive one from description (legacy helper).
    let small = (meta.subtitle || meta.smallDescr || '').trim();
    if (!small && descr) small = getSmallDescrFromDescr(descr, title);
    if (!small) return '';

    // Legacy: strip " | 类别：" and keep bracketed extra info if present.
    const parts = small.split('| 类别：');
    if (parts.length > 1) {
        const plus = (parts[1] || '').replace(/【/g, '[').replace(/】/g, ']');
        const tag = plus.match(/\[[^\]]+\]/)?.[0] || '';
        small = (parts[0] || '').trim() + (tag ? ` ${tag}` : '');
    } else {
        small = parts[0].trim();
    }

    // Normalize slashes spacing.
    small = small.replace(/(\s\/)/gi, '/').replace(/(\/\s)/gi, '/').trim();

    // Legacy: add category prefix for documentary/anime.
    if (meta.type === '纪录' && !small.startsWith('[纪录]')) {
        small = `[纪录] ${small}`;
    } else if (meta.type === '动漫' && !small.startsWith('[动画]') && !small.startsWith('[動漫]')) {
        small = `[动画] ${small}`;
    }

    // Legacy: for TV series, append season/episode info in brackets based on title and (sometimes) descr.
    if (meta.type === '剧集') {
        const hasSeason = /\[第\d+(-\d+)?季\]/.test(small);
        const hasEpisode = /\[第\d+(-\d+)?集\]/.test(small);

        if (!hasSeason) {
            const range = title.match(/S(\d{1,3})\s*[-~]\s*S?(\d{1,3})/i);
            if (range) {
                const s1 = parseInt(range[1], 10);
                const s2 = parseInt(range[2], 10);
                if (Number.isFinite(s1) && Number.isFinite(s2)) small += ` [第${s1}-${s2}季]`;
            } else {
                const s = title.match(/S(\d{1,3})/i);
                if (s) {
                    const season = parseInt(s[1], 10);
                    if (Number.isFinite(season)) {
                        small += ` [第${season}季]`;
                        if (!title.match(/E(P)?\d{1,4}/i)) {
                            const total = descr.match(/◎集.*?数.*?(\d+)/);
                            if (total) {
                                const n = parseInt(total[1], 10);
                                if (Number.isFinite(n) && n > 0) small += `[${n}集全]`;
                            }
                        }
                    }
                }
            }
        }

        if (!hasEpisode) {
            const er1 = title.match(/E(P)?(\d{1,4})\s*[-~]\s*E(P)?(\d{1,4})/i);
            const er2 = title.match(/EP(\d{1,4})\s*[-~]\s*EP(\d{1,4})/i);
            if (er1) {
                const e1 = parseInt(er1[2], 10);
                const e2 = parseInt(er1[4], 10);
                if (Number.isFinite(e1) && Number.isFinite(e2)) small += ` [第${e1}-${e2}集]`;
            } else if (er2) {
                const e1 = parseInt(er2[1], 10);
                const e2 = parseInt(er2[2], 10);
                if (Number.isFinite(e1) && Number.isFinite(e2)) small += ` [第${e1}-${e2}集]`;
            } else {
                const e = title.match(/E(P)?(\d{1,4})/i);
                if (e) {
                    const ep = parseInt(e[2], 10);
                    if (Number.isFinite(ep)) small += ` [第${ep}集]`;
                }
            }
        }
    }

    return small.trim();
}

export function applyHDSkyOptions(labels: Record<string, boolean>, smallDescr: string, description: string) {
    const setOpt = (value: number | string, on: boolean) => {
        if (!on) return;
        const v = String(value);
        const el = document.querySelector(`input[name="option_sel[]"][value="${v}"]`) as HTMLInputElement | null;
        if (!el) return;
        el.checked = true;
        try {
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
        } catch { }
    };

    // DIY / 原盘
    if (labels.diy) setOpt(13, true);
    else if (labels.yp) setOpt(28, true);

    // Languages / subtitles
    setOpt(5, !!labels.gy);  // 国语
    setOpt(11, !!labels.yy); // 粤语
    setOpt(6, !!labels.zz);  // 中文字幕
    if ((smallDescr || '').match(/特效字幕/)) setOpt(20, true);

    // DV / HDR
    if (labels.db && (labels.hdr10plus || labels.hdr10)) setOpt(24, true);
    else if (labels.db) setOpt(15, true);
    else if (labels.hdr10plus) setOpt(17, true);
    else if (labels.hdr10) setOpt(9, true);

    // Atmos
    if ((description || '').match(/atmos/i)) setOpt(21, true);
}

/**
 * HDSky uses index-based select options instead of value/text matching.
 * Ported from legacy_extract/sites/HDSky.js (Snippet 6: 19_forward_site_filling3.js)
 */
export function fillHDSkySelects(meta: TorrentMeta): void {
    try {
        // Type category - use explicit index mapping
        const typeSelect = document.getElementsByName('type')[0] as HTMLSelectElement | undefined;
        if (typeSelect) {
            const typeIndex: Record<string, number> = {
                '电影': 1,
                '纪录': 2,
                '动漫': 4,
                '剧集': 6,
                '综艺': 7,
                'MV': 8,
                '体育': 9,
                '音乐': 10
            };
            const idx = typeIndex[meta.type || ''] ?? 11; // 11 = Other
            if (typeSelect.options[idx]) {
                typeSelect.options[idx].selected = true;
                typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
            // iPad special case
            if (meta.title?.match(/(pad$|ipad)/i) && typeSelect.options[3]) {
                typeSelect.options[3].selected = true;
                typeSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Audio codec - value to index mapping
        const audiocodecDict: Record<string, number> = {
            'Flac': 1, 'APE': 2, 'DTS': 3, 'MP3': 4, 'AAC': 6,
            'DTS-HDMA': 10, 'TrueHD': 11, 'AC3': 12, 'LPCM': 13, 'DTS-HDHR': 14, 'Atmos': 17, 'WAV': 15
        };
        if (meta.audioCodecSel && audiocodecDict[meta.audioCodecSel] !== undefined) {
            const idx = audiocodecDict[meta.audioCodecSel];
            $('select[name="audiocodec_sel"]').val(idx);
        }

        // Standard/Resolution - index mapping
        const standardSelect = document.getElementsByName('standard_sel')[0] as HTMLSelectElement | undefined;
        if (standardSelect && meta.standardSel) {
            const standardDict: Record<string, number> = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5 };
            const idx = standardDict[meta.standardSel] ?? 0;
            if (standardSelect.options[idx]) {
                standardSelect.options[idx].selected = true;
                standardSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Video codec - index mapping
        const codecSelect = document.getElementsByName('codec_sel')[0] as HTMLSelectElement | undefined;
        if (codecSelect && meta.codecSel) {
            const codecDict: Record<string, number> = {
                'H264': 1, 'X265': 2, 'X264': 3, 'H265': 4, 'VC-1': 5, 'MPEG-2': 6, 'Xvid': 7
            };
            let idx = codecDict[meta.codecSel] ?? 8;
            // Special handling: prefer X264/X265 when detected in title
            if (meta.codecSel === 'H264' && meta.title?.match(/X264/i)) idx = 3;
            if (meta.codecSel === 'H265' && meta.title?.match(/X265/i)) idx = 2;
            if (codecSelect.options[idx]) {
                codecSelect.options[idx].selected = true;
                codecSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Medium - index mapping
        const mediumSelect = document.getElementsByName('medium_sel')[0] as HTMLSelectElement | undefined;
        if (mediumSelect && meta.mediumSel) {
            const mediumDict: Record<string, number> = {
                'UHD': 1, 'Blu-ray': 3, 'Remux': 5, 'Encode': 6, 'HDTV': 7, 'CD': 9, 'WEB-DL': 12
            };
            let idx = mediumDict[meta.mediumSel];
            if (idx !== undefined && mediumSelect.options[idx]) {
                mediumSelect.options[idx].selected = true;
                // DIY detection: use DIY variant for UHD/Blu-ray if title contains diy/@
                if (meta.mediumSel === 'UHD' && meta.title?.match(/(diy|@)/i) && mediumSelect.options[2]) {
                    mediumSelect.options[2].selected = true;
                } else if (meta.mediumSel === 'Blu-ray' && meta.title?.match(/(diy|@)/i) && mediumSelect.options[4]) {
                    mediumSelect.options[4].selected = true;
                }
                mediumSelect.dispatchEvent(new Event('change', { bubbles: true }));
            }
        }

        // Team - default to index 10 (Other/Unknown)
        const teamSelect = document.getElementsByName('team_sel')[0] as HTMLSelectElement | undefined;
        if (teamSelect && teamSelect.options[10]) {
            teamSelect.options[10].selected = true;
            teamSelect.dispatchEvent(new Event('change', { bubbles: true }));
        }
    } catch (err) {
        console.error('[Auto-Feed][HDSky] fillHDSkySelects error:', err);
    }
}

export function buildPTerDescr(meta: TorrentMeta): string {
    let desc = meta.description || '';

    // Replace embedded mediainfo quote with externally provided `fullMediaInfo` when present.
    let full = (meta.fullMediaInfo || '').trim();
    if (full) {
        full = full.replace(/\[\/?quote.*?\]/gi, '').trim();
        if (full.match(/mpls/i) && full.match(/QUICK SUMMARY:/i)) {
            full = full.split(/QUICK SUMMARY:/i).slice(1).join('QUICK SUMMARY:').trim();
        }
        if (full) {
            desc = desc.replace(/\[quote\]([\s\S]*?)\[\/quote\]/i, (m, inner) => {
                if (String(inner || '').match(/General.{0,20}(Unique|Complete name)/i)) {
                    return `[quote]\n${full}\n[/quote]`;
                }
                return m;
            });
        }
    }

    // Convert [quote] blocks into PTer-style [hide=...] blocks.
    // Legacy heuristic: General/Unique/Complete name => mediainfo; Disc Title/Disc Info/MPLS => bdinfo.
    desc = desc.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (m, inner) => {
        const body = String(inner || '').trim();
        if (!body) return m;
        if (body.match(/General.{0,40}\n?(Unique|Complete name)/i)) return `[hide=mediainfo]\n${body}\n[/hide]`;
        if (body.match(/(Disc Title|DISC INFO|Disc Info|Disc Label|\\.MPLS|Playlist|Video Codec)/i)) return `[hide=bdinfo]\n${body}\n[/hide]`;
        return m;
    });

    return desc;
}
