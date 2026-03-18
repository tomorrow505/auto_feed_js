import $ from 'jquery';
import { TorrentMeta } from '../../types/TorrentMeta';
import { SiteConfig } from '../../types/SiteConfig';
import { getAudioCodecSel, getCodecSel, getLabel, getMediumSel, getStandardSel } from '../../common/rules/text';
import { extractDoubanId, extractImdbId } from '../../common/rules/links';
import { getSourceSelFromDescr } from '../../common/rules/helpers';
import { getMediainfoPictureFromDescr } from '../../common/rules/media';
import { dispatchFormEvents } from '../../common/dom/form';
import { buildHDSkySmallDescr, applyHDSkyOptions, fillHDSkySelects, buildPTerDescr } from './helpers';

export async function fillNexus(meta: TorrentMeta, config: SiteConfig): Promise<void> {
    const formSelectors = {
        name: 'input[name="name"]',
        smallDescr: 'input[name="small_descr"]',
        descr: 'textarea[name="descr"]',
        imdb: 'input[name="imdb_id"], input[name="url"][type="text"]',
        douban: 'input[name="douban"], input[name="douban_id"], input[name="douban_url"], input[name="dburl"]',
        torrent: 'input[type="file"]#file, input[name="file"], input[name="torrent"]'
    };

    const overrides = config.selectors || {};

    // Site-specific parity adjustments (legacy behavior).
    const buildCmctTitle = (raw: string) => {
        let t = (raw || '').trim();
        if (!t) return '';
        t = t
            .replace(/DDP/gi, 'DD+')
            .replace(/DTS[- .]?HD[\s-]?(?:Master\s*Audio|MA)/gi, 'DTS-HD MA')
            .replace(/DTS[- .]?HD[\s-]?(?:High\s*Resolution|HRA?|HR)/gi, 'DTS-HD HR')
            .replace(/([A-Za-z0-9])[ ]+-(?=[A-Za-z0-9])/g, '$1-')
            .replace(/-(?=[A-Za-z0-9])/g, '-');
        // Audio + channels token spacing (later converted to dot-separated CMCT style).
        t = t.replace(
            /(DD\+|DD|AAC|TrueHD|DTS-HD MA|DTS-HD HR|DTS|LPCM|FLAC)\s*[. ]\s*(7\.1|5\.1|2\.0|1\.0)/gi,
            '$1 $2'
        );
        t = t.replace(/\s*-\s*/g, '-').replace(/\s+/g, '.').replace(/\.{2,}/g, '.');
        t = t.replace(/\.-/g, '-').replace(/-\./g, '-');
        return t.trim();
    };
    const titleVal = config.name === 'CMCT' ? buildCmctTitle(meta.title || '') : (meta.title || '');
    const smallDescrVal = config.name === 'HDSky' ? buildHDSkySmallDescr(meta) : (meta.subtitle || meta.smallDescr || '');
    const descrVal = config.name === 'PTer' ? buildPTerDescr(meta) : (meta.description || '');
    const nameInputSelector = overrides.nameInput || formSelectors.name;

    const forceSetNameField = (value: string) => {
        if (!value) return;
        $(nameInputSelector).each((_, el) => {
            const input = el as HTMLInputElement | HTMLTextAreaElement;
            if ((input.value || '').trim() === value.trim()) return;
            input.value = value;
            dispatchFormEvents(input);
        });
    };
    const lockNameAfterFileInject = () => {
        if (!titleVal) return;
        [0, 120, 380, 900, 1800, 3000].forEach((ms) => {
            window.setTimeout(() => forceSetNameField(titleVal), ms);
        });
    };

    forceSetNameField(titleVal);
    lockNameAfterFileInject();
    $(overrides.smallDescrInput || formSelectors.smallDescr).val(smallDescrVal);
    $(overrides.descrInput || formSelectors.descr).val(descrVal);

    // Fill IMDb / Douban fields:
    // - `imdb_id` should receive `ttxxxx`
    // - `url` (or similar) should receive full IMDb URL when present
    // - Douban may have id or url fields depending on site variant
    try {
        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const imdbUrl = meta.imdbUrl || (imdbId ? `https://www.imdb.com/title/${imdbId}/` : '');
        const imdbSel = overrides.imdbInput || formSelectors.imdb;
        $(imdbSel).each((_, el) => {
            const input = el as HTMLInputElement;
            const name = (input.getAttribute('name') || '').toLowerCase();
            if (name === 'imdb_id') input.value = imdbId || imdbUrl;
            else if (name === 'url') input.value = imdbUrl || imdbId;
            else input.value = imdbUrl || imdbId;
            dispatchFormEvents(input);
        });
    } catch { }

    try {
        const doubanId = meta.doubanId || extractDoubanId(meta.doubanUrl || '') || '';
        const doubanUrl = meta.doubanUrl || (doubanId ? `https://movie.douban.com/subject/${doubanId}/` : '');
        const doubanSel = overrides.doubanInput || formSelectors.douban;
        $(doubanSel).each((_, el) => {
            const input = el as HTMLInputElement;
            const name = (input.getAttribute('name') || '').toLowerCase();
            if (name.includes('douban') && name.includes('id')) input.value = doubanId || doubanUrl;
            else input.value = doubanUrl || doubanId;
            dispatchFormEvents(input);
        });
    } catch { }

    if (meta.torrentBase64 || meta.torrentUrl) {
        const fileInputSelector = overrides.torrentInput || formSelectors.torrent;
        const fileInput = $(fileInputSelector)[0] as HTMLInputElement | undefined;
        if (fileInput) {
            try {
                const { TorrentService } = await import('../../services/TorrentService');
                const result = await TorrentService.buildForwardTorrentFile(meta, config.name, null);
                if (result) {
                    TorrentService.injectFileIntoInput(fileInput, result.file);
                } else if (meta.torrentBase64 && meta.torrentFilename) {
                    const file = TorrentService.base64ToFile(meta.torrentBase64, meta.torrentFilename);
                    TorrentService.injectFileIntoInput(fileInput, file);
                }
                lockNameAfterFileInject();
            } catch (e) {
                console.error('[Auto-Feed] File Injection Failed:', e);
            }
        }
    }

    // CMCT upload form uses multiple textareas (legacy parity):
    // [0]=简介/剧情, [1]=MediaInfo/NFO, [2]=完整简介+截图
    if (config.name === 'CMCT') {
        try {
            const tas = Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];
            if (tas.length >= 3) {
                const info = getMediainfoPictureFromDescr(meta.description || '', { mediumSel: meta.mediumSel });
                const intro = (meta.description || '').split('[quote]')[0].replace(/\[img\][\s\S]*?\[\/img\]\s*/gi, '').trim();
                if (intro) {
                    tas[0].value = intro;
                    tas[0].dispatchEvent(new Event('input', { bubbles: true }));
                    tas[0].dispatchEvent(new Event('change', { bubbles: true }));
                }

                const pickMi = () => {
                    if (meta.fullMediaInfo) return meta.fullMediaInfo;
                    return (info.mediainfo || '').trim();
                };
                let mi = pickMi();
                mi = mi.replace(/ReportBy[\s\S]*$/i, '').replace(/Report created by[\s\S]*$/i, '').trim();
                if (mi) {
                    tas[1].value = mi;
                    tas[1].dispatchEvent(new Event('input', { bubbles: true }));
                    tas[1].dispatchEvent(new Event('change', { bubbles: true }));
                }

                // Remove duplicate media-info quote blocks from "附加信息" to keep only extra text/screens.
                let extra = meta.description || '';
                if (mi) {
                    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    extra = extra.replace(new RegExp(`\\[quote\\]\\s*${esc(mi)}\\s*\\[/quote\\]\\s*`, 'ig'), '').trim();
                }
                tas[2].value = extra || meta.description || '';
                tas[2].dispatchEvent(new Event('input', { bubbles: true }));
                tas[2].dispatchEvent(new Event('change', { bubbles: true }));

                // Also fill screenshot URL textarea if present.
                const cover = (info.coverImg || '').replace(/\[img\]|\[\/img\]/gi, '').trim();
                const imgUrls = Array.from(new Set(
                    (info.picInfo || '')
                        .match(/\[img\]([^\[]+?)\[\/img\]/gi)
                        ?.map((s) => s.replace(/\[img\]|\[\/img\]/gi, '').trim())
                        .filter(Boolean)
                        .filter((u) => !cover || u !== cover) || []
                ));
                const urlBox = document.querySelector('#url_vimages') as HTMLTextAreaElement | HTMLInputElement | null;
                if (urlBox && imgUrls.length) {
                    urlBox.value = imgUrls.join('\n');
                    urlBox.dispatchEvent(new Event('input', { bubbles: true }));
                    urlBox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        } catch { }
    }

    // After we possibly replaced `meta.title` from torrent internal name, (re)derive key selectors.
    // This helps on targets where `type/medium/codec/resolution/audio` are mandatory.
    try {
        const text = `${meta.title || ''} ${meta.subtitle || meta.smallDescr || ''} ${meta.description || ''} ${meta.fullMediaInfo || ''}`;
        meta.mediumSel = meta.mediumSel || getMediumSel(text, meta.title);
        meta.codecSel = meta.codecSel || getCodecSel(text);
        meta.audioCodecSel = meta.audioCodecSel || getAudioCodecSel(text);
        meta.standardSel = meta.standardSel || getStandardSel(text);
    } catch { }

    // ---- generic selects (best-effort) ----
    const findSelect = (selectName: string): HTMLSelectElement | null => {
        const names = [selectName, `${selectName}[4]`, `${selectName}[1]`];
        for (const n of names) {
            const el = document.querySelector(`select[name="${n}"]`) as HTMLSelectElement | null;
            if (el) return el;
        }
        const byId = document.querySelector(`select#${selectName}`) as HTMLSelectElement | null;
        return byId || null;
    };
    const selectLooksLikeRegion = (select: HTMLSelectElement): boolean => {
        const texts = Array.from(select.options).map((o) => (o.textContent || '').trim()).join(' | ');
        const regionHits = (texts.match(/欧美|大陆|香港|台湾|日本|韩国|印度|地区|國家|country|region/gi) || []).length;
        const mediumHits = (texts.match(/Blu|UHD|WEB|HDTV|DVD|Remux|Encode|媒介|介质|source/gi) || []).length;
        return regionHits > 0 && regionHits >= mediumHits;
    };
    const selectLooksLikeMedium = (select: HTMLSelectElement): boolean => {
        const texts = Array.from(select.options).map((o) => (o.textContent || '').trim()).join(' | ');
        const regionHits = (texts.match(/欧美|大陆|香港|台湾|日本|韩国|印度|地区|國家|country|region/gi) || []).length;
        const mediumHits = (texts.match(/Blu|UHD|WEB|HDTV|DVD|Remux|Encode|媒介|介质|source/gi) || []).length;
        return mediumHits > 0 && mediumHits >= regionHits;
    };
    const pickOption = (selectName: string, keywords: (string | RegExp)[]) => {
        const select = findSelect(selectName);
        if (!select) return;
        const opts = Array.from(select.options);
        const scoreOpt = (opt: HTMLOptionElement) => {
            const text = opt.textContent?.trim() || '';
            if (!text) return -1;
            let score = -1;
            for (const k of keywords) {
                if (typeof k === 'string') {
                    const kw = k.trim().toLowerCase();
                    const t = text.toLowerCase();
                    if (!kw) continue;
                    if (t === kw) score = Math.max(score, 120);
                    else if (t.includes(kw)) score = Math.max(score, 80);
                } else {
                    k.lastIndex = 0;
                    const m = text.match(k);
                    if (m) {
                        score = Math.max(score, m[0].length === text.length ? 110 : 70);
                    }
                }
            }
            return score;
        };
        const found = opts
            .map((o) => ({ o, s: scoreOpt(o) }))
            .filter((x) => x.s >= 0)
            .sort((a, b) => b.s - a.s)[0]?.o;
        if (found) {
            found.selected = true;
            // Some sites rely on `change` to reveal dependent fields.
            try {
                select.value = found.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                select.dispatchEvent(new Event('input', { bubbles: true }));
            } catch { }
        }
    };

    const typeMap: Record<string, (string | RegExp)[]> = {
        电影: [/Movie/i, /电影/],
        剧集: [/TV/i, /Series/i, /剧集/],
        纪录: [/Doc/i, /纪录/],
        综艺: [/Variety/i, /综艺/],
        动漫: [/Anime/i, /动画|動漫/],
        音乐: [/Music/i, /音乐/],
        体育: [/Sport/i, /体育/],
        MV: [/MV/i, /Music Video/i],
        书籍: [/Book/i, /书籍/],
        游戏: [/Game/i, /游戏/],
        软件: [/Software/i, /软件/],
        学习: [/Study/i, /学习/]
    };

    if (meta.type && typeMap[meta.type]) {
        pickOption('type', typeMap[meta.type]);
        pickOption('category', typeMap[meta.type]);
        pickOption('cat', typeMap[meta.type]);
        pickOption('category_id', typeMap[meta.type]);
    }

    const mediumMap: Record<string, (string | RegExp)[]> = {
        UHD: [/UHD/i, /4K/i, /2160p/i, /超清|超高清|4K/],
        'Blu-ray': [/Blu[- ]?ray/i, /\bBD\b/i, /蓝光|原盘/],
        Remux: [/Remux/i],
        Encode: [/Encode/i, /BDRip/i, /WEBRip/i, /压制/],
        'WEB-DL': [/WEB[- ]?DL/i, /WEB/i, /网络/],
        HDTV: [/HDTV/i],
        DVD: [/DVD/i, /DVDRip/i],
        CD: [/CD/i]
    };
    if (meta.mediumSel && mediumMap[meta.mediumSel]) {
        pickOption('medium_sel', mediumMap[meta.mediumSel]);
        pickOption('medium', mediumMap[meta.mediumSel]);
        // Some Nexus variants use `source_sel` for medium/source, others use it for region.
        const sourceSel = findSelect('source_sel');
        if (sourceSel && selectLooksLikeMedium(sourceSel)) {
            pickOption('source_sel', mediumMap[meta.mediumSel]);
        }
        pickOption('source', mediumMap[meta.mediumSel]);
    }

    const standardMap: Record<string, (string | RegExp)[]> = {
        '8K': [/8K/i, /4320p/i],
        '4K': [/4K/i, /2160p/i],
        '1080p': [/1080p/i],
        '1080i': [/1080i/i],
        '720p': [/720p/i],
        SD: [/SD/i, /480/i, /576/i]
    };
    if (meta.standardSel && standardMap[meta.standardSel]) {
        pickOption('standard_sel', standardMap[meta.standardSel]);
        pickOption('standard', standardMap[meta.standardSel]);
    }

    const codecMap: Record<string, (string | RegExp)[]> = {
        H264: [/H\.?264/i, /AVC/i, /x264/i],
        X264: [/x264/i],
        H265: [/H\.?265/i, /HEVC/i, /x265/i],
        X265: [/x265/i],
        'VC-1': [/VC-?1/i],
        'MPEG-2': [/MPEG-?2/i],
        XVID: [/XVID/i]
    };
    if (meta.codecSel && codecMap[meta.codecSel]) {
        pickOption('codec_sel', codecMap[meta.codecSel]);
        pickOption('codec', codecMap[meta.codecSel]);
    }

    const audioMap: Record<string, (string | RegExp)[]> = {
        'DTS-HDMA:X 7.1': [/DTS[- ]?X/i],
        'DTS-HDMA': [/DTS[- .]?HD[\s\S]{0,10}(MA|Master)/i, /DTS[- ]?MA/i],
        'DTS-HDHR': [/DTS[- ]?HR/i],
        Atmos: [/Atmos/i],
        TrueHD: [/TrueHD/i],
        DTS: [/\bDTS\b(?![- .]?(HD|X))/i],
        AC3: [/AC-?3/i, /Dolby Digital/i, /\bDD(P|\+)?\b/i],
        AAC: [/AAC/i],
        LPCM: [/LPCM/i, /PCM/i],
        Flac: [/FLAC/i],
        APE: [/APE/i],
        WAV: [/WAV/i],
        MP3: [/MP3/i]
    };
    if (meta.audioCodecSel && audioMap[meta.audioCodecSel]) {
        pickOption('audiocodec_sel', audioMap[meta.audioCodecSel]);
        pickOption('audio', audioMap[meta.audioCodecSel]);
    }

    // HDR / Dolby Vision / Atmos etc: best-effort checkboxes (only if the page exposes them).
    // Many Nexus variants use ids like `hdr10`, `hdr10plus`, `dovi`, etc (PTer and others).
    try {
        const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
        const labels = meta.labelInfo || getLabel(labelText);
        const byId: Record<string, boolean> = {
            hdr10: !!labels.hdr10,
            hdr10plus: !!labels.hdr10plus,
            dovi: !!labels.db,
            atmos: (meta.description || '').match(/Atmos/i) ? true : false
        };
        Object.entries(byId).forEach(([id, on]) => {
            if (!on) return;
            const el = document.getElementById(id) as HTMLInputElement | null;
            if (el && el.type === 'checkbox') {
                el.checked = true;
                el.dispatchEvent(new Event('change', { bubbles: true }));
            }
        });
    } catch { }

    // Source region / release group: additional dropdowns on some Nexus sites.
    try {
        if (meta.sourceSel) {
            const regionKw = (() => {
                const src = String(meta.sourceSel || '');
                if (/大陆|内地|中国大陆|中国(?!香港|台湾|澳门)|华语/i.test(src)) return [/大陆|内地|中国(?!香港|台湾|澳门)|CN|华语/i];
                if (/港台|港澳|香港|台湾/i.test(src)) return [/港台|港澳|香港|台湾|Hong.?Kong|Taiwan/i];
                if (/香港/i.test(src)) return [/香港|Hong.?Kong/i];
                if (/台湾|臺灣/i.test(src)) return [/台湾|臺灣|Taiwan/i];
                if (/日本|日/i.test(src)) return [/日本|日剧|Japan/i];
                if (/韩国|韓国|韩/i.test(src)) return [/韩国|韓国|韩剧|Korea/i];
                if (/日韩|日韓/i.test(src)) return [/日本|韩国|Japan|Korea/i];
                if (/欧美|歐美|美国|英國|英国|欧洲|歐洲|US|USA|UK|Europe/i.test(src)) return [/欧美|歐美|美国|英国|欧洲|US|USA|UK|Europe/i];
                return [src, new RegExp(src, 'i')];
            })();
            pickOption('team_sel', regionKw);
            pickOption('team', regionKw);
            pickOption('region', regionKw);
            pickOption('area', regionKw);
            const sourceSel = findSelect('source_sel');
            if (sourceSel && selectLooksLikeRegion(sourceSel)) {
                pickOption('source_sel', regionKw);
            }
        }
    } catch { }

    // CMCT has stable numeric select codes. Prefer explicit legacy mapping over fuzzy text matching.
    if (config.name === 'CMCT') {
        const retry = (fn: () => void, times = 8, delayMs = 220) => {
            let i = 0;
            const tick = () => {
                i++;
                try { fn(); } catch { }
                if (i < times) setTimeout(tick, delayMs);
            };
            tick();
        };
        const setSelectValue = (selector: string, value: number) => {
            const el = document.querySelector(selector) as HTMLSelectElement | null;
            if (!el) return;
            el.value = String(value);
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
        };
        const checkInput = (selector: string, checked: boolean) => {
            if (!checked) return;
            const el = document.querySelector(selector) as HTMLInputElement | null;
            if (!el) return;
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
        };

        retry(() => {
            const nameBlob = `${meta.title || ''} ${meta.subtitle || ''} ${meta.smallDescr || ''}`;
            const descrBlob = `${meta.description || ''}\n${meta.fullMediaInfo || ''}`;

            const typeDict: Record<string, number> = {
                电影: 501,
                剧集: 502,
                综艺: 505,
                音乐: 508,
                纪录: 503,
                有声小说: 510,
                体育: 506,
                软件: 509,
                学习: 509,
                MV: 507,
                书籍: 509
            };
            let browsecat = typeDict[meta.type || ''] ?? 509;
            if (meta.type === '动漫') {
                checkInput('#animation, input[name="animation"]', true);
                browsecat = /S\d+[^E]/i.test(nameBlob) ? 502 : 501;
            }
            setSelectValue('select[name="browsecat"], #browsecat', browsecat);

            if ((meta.type === '剧集' || meta.type === '动漫') && /S\d+[^E]/i.test(nameBlob)) {
                checkInput('input[name="pack"], #pack', true);
            }

            let medium = 99;
            switch (meta.mediumSel) {
                case 'UHD':
                case 'Blu-ray':
                    medium = 1;
                    break;
                case 'Remux':
                    medium = 4;
                    break;
                case 'HDTV':
                    medium = 5;
                    break;
                case 'WEB-DL':
                    medium = /webrip/i.test(nameBlob) ? 8 : 7;
                    break;
                case 'Encode':
                    medium = 6;
                    break;
                case 'DVD':
                    medium = /dvdrip/i.test(nameBlob) ? 10 : 3;
                    break;
                case 'CD':
                    medium = 11;
                    break;
            }
            setSelectValue('select[name="medium_sel"]', medium);

            let codec = 99;
            switch (meta.codecSel) {
                case 'H265':
                case 'X265':
                    codec = 1;
                    break;
                case 'H264':
                case 'X264':
                    codec = 2;
                    break;
                case 'VC-1':
                    codec = 3;
                    break;
                case 'MPEG-2':
                    codec = 4;
                    break;
                case 'AV1':
                    codec = 5;
                    break;
            }
            setSelectValue('select[name="codec_sel"]', codec);

            let audio = 99;
            switch (meta.audioCodecSel) {
                case 'DTS-HD':
                case 'DTS-HDMA:X 7.1':
                case 'DTS-HDMA':
                case 'DTS-HDHR':
                    audio = 1;
                    break;
                case 'TrueHD':
                case 'Atmos':
                    audio = 2;
                    break;
                case 'LPCM':
                    audio = 6;
                    break;
                case 'DTS':
                    audio = 3;
                    break;
                case 'AC3':
                    audio = /DD[\+p]/i.test(nameBlob) ? 11 : 4;
                    break;
                case 'AAC':
                    audio = 5;
                    break;
                case 'Flac':
                    audio = 7;
                    break;
                case 'APE':
                    audio = 8;
                    break;
                case 'WAV':
                    audio = 9;
                    break;
            }
            setSelectValue('select[name="audiocodec_sel"]', audio);

            const standardDict: Record<string, number> = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, SD: 5, '': 0 };
            setSelectValue('select[name="standard_sel"]', standardDict[meta.standardSel || ''] ?? 0);

            let region = (meta.sourceSel || '').trim();
            if (!region) {
                region = getSourceSelFromDescr(meta.description || '') || getSourceSelFromDescr(meta.fullMediaInfo || '');
            }
            if (region === '港台') {
                const parsed = getSourceSelFromDescr(meta.description || '');
                region = parsed === '台湾' ? '台湾' : '香港';
            } else if (region === '日韩') {
                const parsed = getSourceSelFromDescr(meta.description || '');
                region = parsed === '日本' ? '日本' : '韩国';
            }

            const sourceDict: Record<string, number> = {
                欧美: 4,
                大陆: 1,
                香港: 2,
                台湾: 3,
                日本: 5,
                韩国: 6,
                印度: 7,
                泰国: 9
            };
            let source = sourceDict[region] ?? 99;
            if (/◎(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地).*(俄罗斯|苏联)/i.test(descrBlob)) {
                source = 8;
            }
            setSelectValue('select[name="source_sel"], #source_sel', source);
        });
    }

    // Audiences has numeric-coded selects and tag checkboxes; port legacy behavior for reliability.
    if (config.name === 'Audiences') {
        const retry = (fn: () => void, times = 6, delayMs = 250) => {
            let i = 0;
            const tick = () => {
                i++;
                try { fn(); } catch { }
                if (i < times) setTimeout(tick, delayMs);
            };
            tick();
        };

        retry(() => {
            const title = meta.title || '';
            const descr = meta.description || '';

            // Book + audio special case (legacy): treat as audio book.
            if (meta.type === '书籍') {
                const m = descr.match(/m4a|mp3/i)?.[0];
                if (m) meta.audioCodecSel = m.toUpperCase();
            }

            // Category (`browsecat`)
            const browsecat = document.querySelector('#browsecat, select[name="browsecat"]') as HTMLSelectElement | null;
            if (browsecat) {
                const typeDict: Record<string, number> = {
                    电影: 401,
                    剧集: 402,
                    动漫: 409,
                    综艺: 403,
                    音乐: 408,
                    纪录: 406,
                    体育: 407,
                    软件: 411,
                    学习: 412,
                    游戏: 410,
                    书籍: 405,
                    MV: 108
                };

                let v = typeDict[meta.type || ''] ?? 409;
                if (meta.type === '动漫') {
                    // Legacy quirk: anime uses movie/series cat and also checks the `dh` tag.
                    v = 401;
                    if (/S\d+|E\d+/i.test(title) || /◎集.*?数.*?\d+/.test(descr)) v = 402;
                    const dh = document.querySelector('input[name="tags[]"][value="dh"]') as HTMLInputElement | null;
                    if (dh) dh.checked = true;
                }
                if (meta.type === '书籍' && (descr.match(/m4a|mp3/i))) {
                    v = 404;
                }

                browsecat.value = String(v);
                browsecat.dispatchEvent(new Event('change', { bubbles: true }));
                browsecat.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Medium (`medium_sel`)
            const mediumSel = document.querySelector('select[name="medium_sel"]') as HTMLSelectElement | null;
            if (mediumSel) {
                let mv = 11;
                switch (meta.mediumSel) {
                    case 'UHD':
                        mv = /DIY|@/i.test(title) ? 13 : 12;
                        break;
                    case 'Blu-ray':
                        mv = /DIY|@/i.test(title) ? 14 : 1;
                        break;
                    case 'DVD':
                        mv = 2;
                        break;
                    case 'Remux':
                        mv = 3;
                        break;
                    case 'HDTV':
                        mv = 5;
                        break;
                    case 'Encode':
                        mv = 15;
                        break;
                    case 'WEB-DL':
                        mv = 10;
                        break;
                    // Music / misc
                    case 'CD':
                        mv = 8;
                        break;
                }
                mediumSel.value = String(mv);
                mediumSel.dispatchEvent(new Event('change', { bubbles: true }));
                mediumSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Codec (`codec_sel`)
            const codecSel = document.querySelector('select[name="codec_sel"]') as HTMLSelectElement | null;
            if (codecSel) {
                let cv = 5;
                switch (meta.codecSel) {
                    case 'H265':
                    case 'X265':
                        cv = 6;
                        break;
                    case 'H264':
                    case 'X264':
                        cv = 1;
                        break;
                    case 'VC-1':
                        cv = 2;
                        break;
                    case 'MPEG-2':
                    case 'MPEG-4':
                        cv = 4;
                        break;
                }
                codecSel.value = String(cv);
                codecSel.dispatchEvent(new Event('change', { bubbles: true }));
                codecSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Audio (`audiocodec_sel`) - Audiences mapping differs from PThome.
            const audioSel = document.querySelector('select[name="audiocodec_sel"]') as HTMLSelectElement | null;
            if (audioSel) {
                let av = 7;
                switch (meta.audioCodecSel) {
                    case 'DTS-HDMA:X 7.1':
                    case 'DTS-X':
                        av = 25;
                        break;
                    case 'DTS-HD':
                    case 'DTS-HDMA':
                        av = 19;
                        break;
                    case 'TrueHD':
                        av = 20;
                        break;
                    case 'Atmos':
                        av = 26;
                        break;
                    case 'LPCM':
                        av = 21;
                        break;
                    case 'DTS':
                    case 'DTS-HDHR':
                        av = 3;
                        break;
                    case 'AC3':
                        av = 18;
                        break;
                    case 'AAC':
                        av = 6;
                        break;
                    case 'Flac':
                        av = 1;
                        break;
                    case 'APE':
                        av = 2;
                        break;
                    case 'WAV':
                        av = 22;
                        break;
                    case 'MP3':
                        av = 23;
                        break;
                    case 'M4A':
                        av = 24;
                        break;
                }
                audioSel.value = String(av);
                audioSel.dispatchEvent(new Event('change', { bubbles: true }));
                audioSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Resolution (`standard_sel`) by legacy option-index mapping.
            const standardSel = document.querySelector('select[name="standard_sel"]') as HTMLSelectElement | null;
            if (standardSel) {
                const dict: Record<string, number> = { '8K': 1, '4K': 2, '1080p': 3, '1080i': 4, '720p': 5, 'SD': 6, '': 7 };
                const idx = dict[meta.standardSel || ''] ?? 7;
                if (standardSel.options[idx]) standardSel.options[idx].selected = true;
                standardSel.dispatchEvent(new Event('change', { bubbles: true }));
                standardSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            // Tags (`tags[]`) mapping (gy/yy/zz/diy/hdr10/hdrm/db/wj).
            try {
                const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
                const labels = meta.labelInfo || getLabel(labelText);
                const check = (value: string, on: boolean) => {
                    if (!on) return;
                    const el = document.querySelector(`input[name="tags[]"][value="${value}"]`) as HTMLInputElement | null;
                    if (el) el.checked = true;
                };
                check('gy', !!labels.gy);
                check('yy', !!labels.yy);
                check('zz', !!labels.zz);
                check('diy', !!labels.diy);
                check('hdr10', !!labels.hdr10);
                check('hdrm', !!labels.hdr10plus);
                check('db', !!labels.db);
                check('wj', !!labels.complete);
            } catch { }
        }, 10, 200);
    }

    // HDSky uses numeric-valued checkbox tags (option_sel[]) instead of id-based checkboxes.
    if (config.name === 'HDSky') {
        try {
            const labelText = `${smallDescrVal || ''}${meta.title || ''}#separator#${descrVal || ''}${meta.fullMediaInfo || ''}`;
            const labels = meta.labelInfo || getLabel(labelText);
            applyHDSkyOptions(labels, smallDescrVal, descrVal);
            // HDSky uses index-based select options - port from legacy
            fillHDSkySelects(meta);
        } catch { }
    }

    // PTer has site-specific required selects and tags that are numeric/id-based.
    // Port minimal legacy parity so "quality/region/tags" won't stay empty.
    if (config.name === 'PTer') {
        const retry = (fn: () => void, times = 6, delayMs = 350) => {
            let i = 0;
            const tick = () => {
                i++;
                try { fn(); } catch { }
                if (i < times) setTimeout(tick, delayMs);
            };
            tick();
        };

        // PTer hides quality/tag rows under `tr.mode_4`; reveal them so controls exist in DOM.
        try {
            retry(() => {
                document.querySelectorAll('tr.mode_4').forEach((tr) => {
                    (tr as HTMLElement).style.display = '';
                });
                try { $('tr.mode_4').show(); } catch { }
            }, 10, 150);
        } catch { }

        try {
            const typeDict: Record<string, number> = {
                电影: 401,
                剧集: 404,
                动漫: 403,
                综艺: 405,
                音乐: 406,
                纪录: 402,
                体育: 407,
                软件: 410,
                学习: 411,
                书籍: 408,
                MV: 413
            };
            const typeSel = document.querySelector('select[name="type"]') as HTMLSelectElement | null;
            if (typeSel && meta.type && typeDict[meta.type]) {
                const v = String(typeDict[meta.type]);
                retry(() => {
                    typeSel.value = v;
                    typeSel.dispatchEvent(new Event('change', { bubbles: true }));
                    typeSel.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        } catch { }

        try {
            // PTer `source_sel` is essentially "medium" (with extra audio modes for FLAC/WAV).
            const sourceSel = document.querySelector('select[name="source_sel"]') as HTMLSelectElement | null;
            if (sourceSel) {
                let v: number | null = null;
                if (meta.audioCodecSel === 'Flac') v = 8;
                else if (meta.audioCodecSel === 'WAV') v = 9;
                else {
                    const dict: Record<string, number> = {
                        UHD: 1,
                        'Blu-ray': 2,
                        Remux: 3,
                        HDTV: 4,
                        'WEB-DL': 5,
                        Encode: 6,
                        DVD: 7
                    };
                    if (meta.mediumSel && dict[meta.mediumSel]) v = dict[meta.mediumSel];
                }
                if (v !== null) {
                    const vv = String(v);
                    retry(() => {
                        sourceSel.value = vv;
                        sourceSel.dispatchEvent(new Event('change', { bubbles: true }));
                        sourceSel.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                }
            }
        } catch { }

        try {
            // PTer `team_sel` is region/country tag select (legacy calls it "source_sel" in meta).
            const teamSel =
                (document.querySelector('select[name="team_sel"]') as HTMLSelectElement | null) ||
                (document.querySelector('select[name="team"]') as HTMLSelectElement | null);
            if (teamSel) {
                const teamDict: Record<string, number> = { 欧美: 4, 大陆: 1, 香港: 2, 台湾: 3, 日本: 6, 韩国: 5, 印度: 7 };
                // Legacy default is 8 (unknown/other).
                let v = 8;
                if (meta.sourceSel && teamDict[meta.sourceSel]) v = teamDict[meta.sourceSel];
                const vv = String(v);
                retry(() => {
                    // Try numeric mapping first.
                    teamSel.value = vv;
                    // If the option doesn't exist anymore, pick "Other/Unknown" by text.
                    if (teamSel.value !== vv) {
                        const opts = Array.from(teamSel.options);
                        const other = opts.find((o) => (o.textContent || '').match(/(其他|其它|Other|Unknown)/i));
                        if (other) teamSel.value = other.value;
                        else if (opts.length) teamSel.value = opts[opts.length - 1].value;
                    }
                    teamSel.dispatchEvent(new Event('change', { bubbles: true }));
                    teamSel.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        } catch { }

        try {
            // PTer tag checkboxes are id-based.
            const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
            const labels = meta.labelInfo || getLabel(labelText);
            const apply = () => {
                const setById = (id: string, on: boolean) => {
                    if (!on) return;
                    const el = document.getElementById(id) as HTMLInputElement | null;
                    if (!el || el.type !== 'checkbox') return;
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                };
                setById('guoyu', !!labels.gy);
                setById('yueyu', !!labels.yy);
                setById('zhongzi', !!labels.zz);
                setById('diy', !!labels.diy);
                setById('ensub', !!labels.yz);
            };
            retry(apply, 10, 200);
        } catch { }
    }

    // Common tag checkboxes for Nexus variants (legacy parity):
    // - HDHome/PThome/HDDolby/Audiences: `input[name="tags[]"][value="gy|yy|zz|diy|hdr10|hdrm|db|wj|ybyp"]`
    // - OurBits: id-based tags (`tag_gy`, `tag_zz`, ...)
    // - CMCT: id-based tags (`subtitlezh`, `untouched`, `hdr10`, ...)
    try {
        const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
        const labels = meta.labelInfo || getLabel(labelText);
        meta.labelInfo = labels;

        const retry = (fn: () => void, times = 8, delayMs = 220) => {
            let i = 0;
            const tick = () => {
                i++;
                try { fn(); } catch { }
                if (i < times) setTimeout(tick, delayMs);
            };
            tick();
        };

        // Value/text based tag checkboxes (HDHome/PThome/HDDolby/Audiences + many NP variants).
        retry(() => {
            const inputs = Array.from(
                document.querySelectorAll('input[type="checkbox"][name="tags[]"], input[type="checkbox"][name="tags[4][]"]')
            ) as HTMLInputElement[];
            if (!inputs.length) return;

            const getInputText = (el: HTMLInputElement): string => {
                let t = '';
                if (el.id) {
                    const labels = Array.from(document.querySelectorAll('label')) as HTMLLabelElement[];
                    const byFor = labels.find((lb) => (lb.getAttribute('for') || '') === el.id);
                    if (byFor) t = byFor.textContent || '';
                }
                if (!t) t = (el.closest('label') as HTMLLabelElement | null)?.textContent || '';
                if (!t) t = el.parentElement?.textContent || '';
                return t.replace(/\s+/g, ' ').trim();
            };

            const setTag = (on: boolean, valueAliases: string[], labelPattern: RegExp) => {
                if (!on) return;
                const aliasSet = new Set(valueAliases.map((v) => String(v).toLowerCase()));
                for (const el of inputs) {
                    const val = (el.value || '').toLowerCase();
                    const txt = getInputText(el);
                    if (!aliasSet.has(val) && !labelPattern.test(txt)) continue;
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            };

            setTag(!!labels.gy, ['gy', '5'], /(国.?语|mandarin|国语配音|中文配音)/i);
            setTag(!!labels.yy, ['yy', '11'], /(粤语|cantonese)/i);
            setTag(!!labels.zz, ['zz', '6'], /(中字|字幕|中文字幕|chinese.?sub)/i);
            setTag(!!labels.diy, ['diy', '4', '13'], /(DIY|自制|原盘DIY)/i);
            // HDHome: when it's an untouched disc (yp) but not DIY, use the dedicated tag `ybyp`.
            if (!labels.diy && config.name === 'HDHome') {
                setTag(!!labels.yp, ['ybyp', '17', '28'], /(原盘|untouch|untouched|ybyp)/i);
            }
            setTag(!!labels.hdr10, ['hdr10', '7', '9'], /HDR10/i);
            setTag(!!labels.hdr10plus, ['hdrm', '10', '17', '20'], /(HDR10\+|HDR\+)/i);
            setTag(!!labels.db, ['db', '8', '9', '11', '12', '15'], /(杜比视界|Dolby.?Vision|DoVi|DV)/i);
            setTag(!!labels.complete, ['wj', '13', '17', '20'], /(完结|全集|pack|complete)/i);
        });

        // OurBits id-based tags (legacy).
        if (config.name === 'OurBits') {
            retry(() => {
                const setById = (id: string, on: boolean) => {
                    if (!on) return;
                    const el = document.getElementById(id) as HTMLInputElement | null;
                    if (!el || el.type !== 'checkbox') return;
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                };
                setById('tag_gy', !!labels.gy);
                setById('tag_zz', !!labels.zz);
                setById('tag_diy', !!labels.diy);
                setById('tag_hdr', !!labels.hdr10);
                setById('tag_hdrp', !!labels.hdr10plus);
                setById('tag_db', !!labels.db);
                setById('tag_hlg', /HLG/i.test(meta.title || ''));
            });
        }

        // CMCT id-based tags (legacy: subtitlezh/untouched/hdr10/hdr10plus/hdrvivid/subtitlesp/dovi/3d/hlg/pack).
        if (config.name === 'CMCT') {
            retry(() => {
                const setById = (id: string, on: boolean) => {
                    if (!on) return;
                    const el = document.getElementById(id) as HTMLInputElement | null;
                    if (!el || el.type !== 'checkbox') return;
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                };
                setById('subtitlezh', !!labels.zz);
                // Untouched disc (mpls) but not DIY.
                if (!labels.diy && /mpls/i.test(`${meta.description || ''}${meta.fullMediaInfo || ''}`)) {
                    setById('untouched', true);
                }
                setById('hdr10', !!labels.hdr10);
                setById('hdr10plus', !!labels.hdr10plus);
                setById('dovi', !!labels.db);
                setById('3d', /(\.| )3D(\.| )/i.test(meta.title || ''));
                setById('hlg', /HLG/i.test(meta.title || ''));
                setById('pack', !!labels.complete);
                // Heuristics based on subtitle text used by legacy.
                setById('subtitlesp', /(特效字幕)/.test(meta.smallDescr || meta.subtitle || ''));
                // HDR Vivid keyword appears only in description/mi blocks.
                setById('hdrvivid', /HDR Vivid/i.test(`${meta.description || ''}${meta.fullMediaInfo || ''}`));
            });
        }
    } catch { }
}
