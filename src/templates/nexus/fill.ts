import $ from 'jquery';
import { TorrentMeta } from '../../types/TorrentMeta';
import { SiteConfig } from '../../types/SiteConfig';
import { getAudioCodecSel, getCodecSel, getLabel, getMediumSel, getStandardSel } from '../../common/rules/text';
import { extractDoubanId, extractImdbId } from '../../common/rules/links';
import { dispatchFormEvents } from '../../common/dom/form';

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

    const titleVal = meta.title || '';
    const smallDescrVal = meta.subtitle || meta.smallDescr || '';
    const descrVal = meta.description || '';
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

    // Common tag checkboxes for Nexus variants.
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
            setTag(!!labels.hdr10, ['hdr10', '7', '9'], /HDR10/i);
            setTag(!!labels.hdr10plus, ['hdrm', '10', '17', '20'], /(HDR10\+|HDR\+)/i);
            setTag(!!labels.db, ['db', '8', '9', '11', '12', '15'], /(杜比视界|Dolby.?Vision|DoVi|DV)/i);
            setTag(!!labels.complete, ['wj', '13', '17', '20'], /(完结|全集|pack|complete)/i);
        });
    } catch { }
}
