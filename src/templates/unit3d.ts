
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import $ from 'jquery';
import { GMAdapter } from '../services/GMAdapter';
import { SettingsService, getEffectiveTmdbApiKey } from '../services/SettingsService';
import { getMediainfoPictureFromDescr } from '../common/rules/media';
import { getSizeFromDescr } from '../common/rules/helpers';
import { extractImdbId, extractTmdbId } from '../common/rules/links';

export class Unit3DEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing Unit3D page...');

        // Standard Unit3D Selectors
        const selectors = {
            title: 'h1.text-center, h1',
            description: '.panel-body.markdown-body, .panel-body',
            category: '.list-group-item:contains("Category") span',
            size: '.list-group-item:contains("Size") span',
            imdb: '.list-group-item:contains("IMDB") a', // Link usually
            tmdb: '.list-group-item:contains("TMDB") a',
        };

        // Allow config overrides
        const configSelectors = this.config.selectors || {};

        // Helper to try multiple selectors
        const getText = (selector: string | string[] | undefined): string => {
            if (!selector) return '';
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    const el = $(s);
                    if (el.length && el.text().trim()) return el.text().trim();
                }
                return '';
            }
            return $(selector).text().trim();
        };

        const getElement = (selector: string | string[] | undefined): Element | null => {
            if (!selector) return null;
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    const el = $(s);
                    if (el.length) return el[0];
                }
                return null;
            }
            const el = $(selector);
            return el.length ? el[0] : null;
        };

        let title = getText(configSelectors.title) || getText(selectors.title);

        // Cleanup title (remove badges sometimes inside h1)
        title = title.replace(/\[.*?\]/g, '').trim();

        const descrEl = getElement(configSelectors.description) || getElement(selectors.description);
        const description = descrEl ? htmlToBBCode(descrEl) : '';

        const meta: TorrentMeta = {
            title: title,
            description: description, // TODO: Convert HTML to BBCode
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images: [],
        };

        // Attempt to find IDs
        const imdbLink = $(selectors.imdb).attr('href');
        if (imdbLink) {
            const id = extractImdbId(imdbLink);
            if (id) meta.imdbId = id;
        }

        const tmdbLink = $(selectors.tmdb).attr('href');
        if (tmdbLink) {
            meta.tmdbUrl = tmdbLink;
            const id = extractTmdbId(tmdbLink);
            if (id) meta.tmdbId = id;
        }

        const image = $('.movie-poster img, .sidebar img').attr('src');
        if (image) {
            meta.images.push(image);
        }

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling Unit3D form...');

        const fire = (el: HTMLElement) => {
            try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
            try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
        };

        const setText = (selector: string, value: string) => {
            if (!value) return false;
            const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
            if (!el) return false;
            if ((el.value || '').trim() === value.trim()) return true;
            el.value = value;
            fire(el);
            return true;
        };

        const setAnyText = (selectors: string[], value: string) => {
            for (const sel of selectors) {
                if (setText(sel, value)) return true;
            }
            return false;
        };

        const pickOption = (selectors: string | string[], keywords: (string | RegExp)[]) => {
            const list = Array.isArray(selectors) ? selectors : [selectors];
            const candidates: Element[] = [];
            for (const sel of list) {
                try {
                    candidates.push(...Array.from(document.querySelectorAll(sel)));
                } catch {}
            }
            for (const el of candidates) {
                if (!(el instanceof HTMLSelectElement)) continue;
                const opts = Array.from(el.options);
                const found = opts.find((opt) => {
                    const text = (opt.textContent || '').trim();
                    return keywords.some((k) => (typeof k === 'string' ? text.includes(k) : k.test(text)));
                });
                if (!found) continue;
                el.value = found.value;
                fire(el);
                return true;
            }
            return false;
        };

        const pickSelect = (selectors: string | string[]): HTMLSelectElement | null => {
            const list = Array.isArray(selectors) ? selectors : [selectors];
            for (const sel of list) {
                try {
                    const els = Array.from(document.querySelectorAll(sel));
                    for (const el of els) {
                        if (el instanceof HTMLSelectElement) return el;
                    }
                } catch {}
            }
            return null;
        };

        // --- Title ---
        const title = meta.title || '';
        const titleInputs = [
            'input[name="name"]',
            'input#name',
            'input[name="title"]',
            'input#title',
            'input#titleauto',
            'input#upload-form-name',
            'input#upload-form-title'
        ];
        const lockTitleAfterFileInject = () => {
            if (!title) return;
            [0, 120, 380, 900, 1800, 3000].forEach((ms) => {
                window.setTimeout(() => {
                    setAnyText(titleInputs, title);
                }, ms);
            });
        };
        setAnyText(titleInputs, title);
        lockTitleAfterFileInject();

        // --- Category (Movie/TV/etc.) ---
        // Some Unit3D sites provide a classic "autocat" select that controls the upload form.
        try {
            const autocat = document.querySelector('#autocat') as HTMLSelectElement | null;
            if (autocat) {
                const v = meta.type === '剧集' || meta.type === '综艺' ? '2' : '1';
                autocat.value = v;
                fire(autocat);
            }
        } catch {}

        // --- IDs (Unit3D variants use different ids/names) ---
        // Legacy parity:
        // - Some Unit3DClassic sites (e.g. BLU/Tik) re-render parts of the form after `#autocat` change,
        //   which can wipe imdb/tmdb inputs. So we apply IDs now and again a bit later.
        // NOTE: Regex literals should use `\d` not `\\d` (the latter matches a literal "\d").
        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const imdbNo = imdbId.match(/tt(\d+)/i)?.[1] || '';

        const applyIds = () => {
            try {
                if (imdbId) {
                    // Classic auto fields (digits only)
                    setAnyText(['input#autoimdb'], imdbNo);
                    // Generic fields
                    setAnyText(['input[name="imdb_id"]', 'input#imdb_id', 'input[name="imdb"]', 'input#imdb'], imdbId);
                    // Some Unit3D forms use a generic url field for IMDb.
                    const imdbUrl = meta.imdbUrl || `https://www.imdb.com/title/${imdbId}/`;
                    setAnyText(['input[name="url"]', 'input#url', 'input[name="imdb_url"]', 'input#imdb_url'], imdbUrl);
                }

                const tmdbId =
                    meta.tmdbId ||
                    extractTmdbId(meta.tmdbUrl || '') ||
                    extractTmdbId(meta.description || '') ||
                    '';
                const tmdbUrl =
                    meta.tmdbUrl ||
                    (tmdbId ? `https://www.themoviedb.org/movie/${tmdbId}` : '');
                if (tmdbId) {
                    // Numeric-id fields
                    setAnyText(
                        [
                            'input[name="tmdb_id"]',
                            'input#tmdb_id',
                            'input#autotmdb',
                            'input#auto_tmdb_movie',
                            'input[name="tmdb"]',
                            'input#tmdb'
                        ],
                        tmdbId
                    );
                }
                if (tmdbUrl) {
                    // URL fields (some Unit3D forks use tmdb_url).
                    setAnyText(['input[name="tmdb_url"]', 'input#tmdb_url'], tmdbUrl);
                }
            } catch {}
        };

        // First pass
        applyIds();

        // TMDB id: if missing but imdb exists, resolve via TMDB find API (legacy parity: has a built-in default key).
        if (!meta.tmdbId && imdbId) {
            try {
                const settings = await SettingsService.load();
                const apiKey = getEffectiveTmdbApiKey(settings);
                const api = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id&include_adult=false&language=zh-CN`;
                await new Promise<void>((resolve) => {
                    GMAdapter.xmlHttpRequest({
                        method: 'GET',
                        url: api,
                        onload: (resp: any) => {
                            try {
                                const data = JSON.parse(resp.responseText || '{}');
                                const movieId = data?.movie_results?.[0]?.id;
                                const tvId = data?.tv_results?.[0]?.id;
                                const showId = data?.tv_episode_results?.[0]?.show_id;
                                const picked = movieId || tvId || showId;
                                if (picked) {
                                    meta.tmdbId = String(picked);
                                    // Keep a best-effort url too (some forks accept tmdb_url).
                                    if (!meta.tmdbUrl) meta.tmdbUrl = `https://www.themoviedb.org/movie/${meta.tmdbId}`;
                                }
                            } catch {}
                            resolve();
                        },
                        onerror: () => resolve()
                    }).catch(() => resolve());
                });
            } catch {}
        }

        // Second pass (after potential tmdb resolve)
        applyIds();
        // Third pass (after autocat-driven re-render)
        setTimeout(applyIds, 1200);

        const typeMap: Record<string, (string | RegExp)[]> = {
            电影: [/Movie/i, /电影/],
            剧集: [/TV/i, /Series/i, /剧集/],
            纪录: [/Doc/i, /纪录/],
            综艺: [/Variety/i, /综艺/],
            动漫: [/Anime/i, /动画|動漫/]
        };
        if (meta.type && typeMap[meta.type]) {
            pickOption('select[name="category_id"], #category_id', typeMap[meta.type]);
        }

        // --- Unit3DClassic legacy "auto" controls (autocat/autotype/autores/autoreg) ---
        // Match `archive/auto_feed.legacy.user.js` logic for BLU/Tik/Aither/FNP/OnlyEncodes/ReelFliX/ACM/Monika.
        try {
            const autocat = document.querySelector('#autocat') as HTMLSelectElement | null;
            const autores = document.querySelector('#autores') as HTMLSelectElement | null;
            const autoreg = document.querySelector('#autoreg') as HTMLSelectElement | null;
            const autotype = document.querySelector('#autotype') as HTMLSelectElement | HTMLInputElement | null;
            const typeId = document.querySelector('select[name="type_id"], #type_id') as HTMLSelectElement | null;

            const titleBlob = `${meta.title || ''} ${meta.smallDescr || ''} ${meta.subtitle || ''} ${meta.description || ''} ${meta.fullMediaInfo || ''}`;
            const descrBlob = `${meta.description || ''} ${meta.fullMediaInfo || ''}`;
            const medium = meta.mediumSel || '';
            const standard = meta.standardSel || '';

            const setSelectIndex = (sel: HTMLSelectElement | null, idx: number) => {
                if (!sel) return false;
                const opt = sel.options[idx];
                if (!opt) return false;
                sel.value = opt.value;
                fire(sel);
                return true;
            };

            const setAutoTypeValue = (v: string) => {
                if (!autotype || !v) return false;
                (autotype as any).value = v;
                fire(autotype as any);
                return true;
            };

            const isSeriesLike = meta.type === '剧集' || meta.type === '综艺' || meta.type === '纪录';
            if (autocat) {
                // Legacy: treat doc as TV-like for Unit3DClassic.
                const v = isSeriesLike ? '2' : '1';
                if (autocat.value !== v) {
                    autocat.value = v;
                    fire(autocat);
                }
                // Reapply IDs after autocat-driven re-render (legacy does setTimeout on change).
                if (document.body.dataset.autofeedU3dAutocatHook !== '1') {
                    document.body.dataset.autofeedU3dAutocatHook = '1';
                    autocat.addEventListener('change', () => {
                        setTimeout(() => {
                            applyIds();
                            // Season/Episode often gets wiped too.
                            try {
                                if (isSeriesLike) {
                                    const s = title.match(/\bS(\d{1,2})\b/i)?.[1] || '';
                                    const e = title.match(/\bE(\d{1,3})\b/i)?.[1] || '';
                                    if (s) setAnyText(['input#season_number', 'input[name="season_number"]'], String(parseInt(s, 10)));
                                    if (e) setAnyText(['input#episode_number', 'input[name="episode_number"]'], String(parseInt(e, 10)));
                                }
                            } catch {}
                        }, 1000);
                    });
                }
            }

            // --- type_id / autotype ---
            // Legacy drives `type_id` by option index for most sites, except ACM/Tik which use `#autotype` values.
            const discSize = (medium === 'Blu-ray' || medium === 'UHD') ? getSizeFromDescr(descrBlob) : 0;
            if (this.siteName === 'ACM') {
                if (medium === 'UHD') {
                    if (/remux/i.test(titleBlob)) {
                        setAutoTypeValue('12');
                    } else if (0 <= discSize && discSize < 46.57) {
                        setAutoTypeValue('3');
                    } else if (discSize < 61.47) {
                        setAutoTypeValue('2');
                    } else {
                        setAutoTypeValue('1');
                    }
                } else if (medium === 'Blu-ray') {
                    if (0 <= discSize && discSize < 23.28) setAutoTypeValue('5');
                    else if (discSize < 46.57) setAutoTypeValue('4');
                } else if (medium === 'Remux') setAutoTypeValue('7');
                else if (medium === 'HDTV') setAutoTypeValue('17');
                else if (medium === 'Encode') {
                    if (standard === '4K') setAutoTypeValue('8');
                    else if (standard === '1080p' || standard === '1080i') setAutoTypeValue('10');
                    else if (standard === '720p') setAutoTypeValue('11');
                    else if (standard === 'SD') setAutoTypeValue('13');
                } else if (medium === 'DVD') {
                    setAutoTypeValue(/dvd5/i.test(titleBlob) ? '14' : '16');
                } else if (medium === 'WEB-DL') setAutoTypeValue('9');
                if (/webrip/i.test(titleBlob)) setAutoTypeValue('9');
            } else if (this.siteName === 'Tik') {
                if (/dvd5/i.test(titleBlob)) {
                    setAutoTypeValue(/Standard.*?PAL/i.test(descrBlob) ? '10' : '8');
                } else if (/dvd9/i.test(titleBlob)) {
                    setAutoTypeValue(/Standard.*?PAL/i.test(descrBlob) ? '9' : '7');
                } else if (/mpls/i.test(descrBlob) && (medium === 'Blu-ray' || medium === 'UHD')) {
                    if (0 <= discSize && discSize < 23.28) setAutoTypeValue('6');
                    else if (discSize < 46.57) setAutoTypeValue('5');
                    else if (discSize < 61.47) setAutoTypeValue('4');
                    else setAutoTypeValue('3');
                }
            } else if (this.siteName === 'OnlyEncodes') {
                // OnlyEncodes uses different ordering (legacy index mapping).
                if (medium === 'UHD' || medium === 'Blu-ray') setSelectIndex(typeId, 4);
                else if (medium === 'Remux') setSelectIndex(typeId, 5);
                else if (medium === 'HDTV') setSelectIndex(typeId, 6);
                else if (medium === 'Encode') {
                    if (meta.codecSel === 'X264' || meta.codecSel === 'H264') setSelectIndex(typeId, 2);
                    else setSelectIndex(typeId, 1);
                } else if (medium === 'WEB-DL') setSelectIndex(typeId, 6);
            } else {
                // Default Unit3DClassic mapping (legacy index mapping).
                if (medium === 'UHD' || medium === 'Blu-ray') setSelectIndex(typeId, 1);
                else if (medium === 'Remux') setSelectIndex(typeId, 2);
                else if (medium === 'Encode') setSelectIndex(typeId, 3);
                else if (medium === 'WEB-DL') setSelectIndex(typeId, 4);
                else if (medium === 'HDTV') setSelectIndex(typeId, 6);
                if (/webrip/i.test(titleBlob)) setSelectIndex(typeId, 5);
            }

            // --- resolution_id / autores ---
            if (autores && meta.standardSel) {
                let dict: Record<string, number> = { '4K': 2, '1080p': 3, '1080i': 4, '720p': 5, SD: 10, '': 10 as any, '8K': 1 };
                if (this.siteName === 'ACM') dict = { '4K': 1, '1080p': 2, '1080i': 2, '720p': 3, SD: 4, '': 0 as any, '8K': 0 as any };
                else if (this.siteName === 'BLU') dict = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 5, SD: 0, '': 0 as any, '8K': 11 };
                const idx = dict[meta.standardSel];
                if (idx !== undefined) {
                    autores.value = String(idx);
                    fire(autores);
                    // Some forks also keep a hidden `#resolution_id` in sync.
                    setAnyText(['#resolution_id'], String(idx));
                }
                // SD flag
                if (meta.standardSel === 'SD' || medium === 'DVD') {
                    try { (document.querySelector('#sd') as HTMLInputElement | null)?.click(); } catch {}
                }
                // Legacy overrides for 576/480 labels (common on Unit3DClassic forks).
                const override =
                    title.match(/576p/i) ? 6 :
                        title.match(/576i/i) ? 7 :
                            title.match(/480p/i) ? 8 :
                                title.match(/480i/i) ? 9 :
                                    null;
                if (override) {
                    autores.value = String(override);
                    fire(autores);
                    setAnyText(['#resolution_id'], String(override));
                }
            }

            // --- region / autoreg ---
            if (autoreg) {
                const ver = ['AUS', 'CAN', 'CEE', 'CZE', 'ESP', 'EUR', 'FRA', 'GBR', 'GER', 'HKG', 'ITA', 'JPN', 'KOR', 'NOR', 'NLD', 'RUS', 'TWN', 'USA'];
                for (const code of ver) {
                    const reg = new RegExp('(\\.| )' + code + '(\\.| )', 'i');
                    if (!reg.test(titleBlob)) continue;
                    const opts = Array.from(autoreg.options);
                    const found = opts.find((o) => (o.textContent || '').trim() === code);
                    if (found) {
                        autoreg.value = found.value;
                        fire(autoreg);
                    }
                    break;
                }
            }
        } catch {}

        // --- Source/type select (Unit3D usually calls this type_id) ---
        // Prefer keyword match rather than hard-coded indices (site option order differs).
        try {
            const medium = meta.mediumSel || '';
            const titleBlob = `${meta.title || ''} ${meta.smallDescr || ''} ${meta.subtitle || ''} ${meta.description || ''} ${meta.fullMediaInfo || ''}`;
            const typeSelectors = ['select[name="type_id"]', '#type_id', '#autotype'];
            let picked = false;
            if (/webrip/i.test(titleBlob)) {
                picked = pickOption(typeSelectors, [/WEB[- ]?RIP/i, /WEB/i, /WEBrip/i]);
            } else if (medium === 'UHD') {
                picked = pickOption(typeSelectors, [/UHD/i, /Ultra/i, /Blu[- ]?ray/i, /BluRay/i]);
            } else if (medium === 'Blu-ray') {
                picked = pickOption(typeSelectors, [/Blu[- ]?ray/i, /BluRay/i, /\bBD\b/i]);
            } else if (medium === 'Remux') {
                picked = pickOption(typeSelectors, [/Remux/i]);
            } else if (medium === 'Encode') {
                picked = pickOption(typeSelectors, [/Encode/i, /x264/i, /x265/i, /H\.?26/i, /AVC/i, /HEVC/i]);
            } else if (medium === 'WEB-DL') {
                picked = pickOption(typeSelectors, [/WEB[- ]?DL/i, /WEB/i]);
            } else if (medium === 'HDTV') {
                picked = pickOption(typeSelectors, [/HDTV/i]);
            } else if (medium === 'DVD') {
                picked = pickOption(typeSelectors, [/DVD/i]);
            }

            // Last resort: index fallback even when the select already has a default value.
            if (!picked && medium) {
                const sel = pickSelect(typeSelectors);
                if (sel) {
                    const opts = Array.from(sel.options);
                    const byIndex = (i: number) => {
                        const opt = opts[i];
                        if (!opt) return false;
                        sel.value = opt.value;
                        fire(sel);
                        return true;
                    };
                    if (/webrip/i.test(titleBlob)) byIndex(5);
                    else if (medium === 'UHD' || medium === 'Blu-ray') byIndex(1);
                    else if (medium === 'Remux') byIndex(2);
                    else if (medium === 'Encode') byIndex(3);
                    else if (medium === 'WEB-DL') byIndex(4);
                    else if (medium === 'HDTV') byIndex(6);
                }
            }
        } catch {}

        const resMap: Record<string, (string | RegExp)[]> = {
            '8K': [/8K/i, /4320p/i],
            '4K': [/4K/i, /2160p/i],
            '1080p': [/1080p/i],
            '1080i': [/1080i/i],
            '720p': [/720p/i],
            SD: [/SD/i, /480/i, /576/i]
        };
        if (meta.standardSel && resMap[meta.standardSel]) {
            pickOption('select[name="resolution_id"], #resolution_id, #autores', resMap[meta.standardSel]);
        }

        // Legacy parity fallback for Unit3D resolution selects: many sites encode resolutions as numeric values.
        try {
            const sel =
                (document.querySelector('#autores') as HTMLSelectElement | null) ||
                (document.querySelector('#resolution_id') as HTMLSelectElement | null) ||
                (document.querySelector('select[name="resolution_id"]') as HTMLSelectElement | null);
            if (sel && meta.standardSel) {
                let dict: Record<string, number> = { '4K': 2, '1080p': 3, '1080i': 4, '720p': 5, SD: 10, '8K': 1 };
                if (this.siteName === 'BLU') dict = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 5, SD: 0, '8K': 11 };
                const idx = dict[meta.standardSel];
                if (idx !== undefined) {
                    const want = String(idx);
                    const has = Array.from(sel.options).some((o) => (o.value || '').trim() === want);
                    if (has) {
                        sel.value = want;
                        fire(sel);
                    }
                }
            }
        } catch {}

        // Legacy parity fallback for Unit3D source/type selects: if keyword matching fails, use common index mapping.
        try {
            const sel =
                (document.querySelector('select[name="type_id"]') as HTMLSelectElement | null) ||
                (document.querySelector('#type_id') as HTMLSelectElement | null);
            if (sel && !sel.value) {
                const opts = Array.from(sel.options);
                const byIndex = (i: number) => {
                    const opt = opts[i];
                    if (!opt) return false;
                    sel.value = opt.value;
                    fire(sel);
                    return true;
                };
                const blob = `${meta.title || ''} ${meta.smallDescr || ''} ${meta.subtitle || ''} ${meta.description || ''} ${meta.fullMediaInfo || ''}`;
                const medium = meta.mediumSel || '';
                if (/webrip/i.test(blob)) byIndex(5);
                else if (medium === 'UHD' || medium === 'Blu-ray') byIndex(1);
                else if (medium === 'Remux') byIndex(2);
                else if (medium === 'Encode') byIndex(3);
                else if (medium === 'WEB-DL') byIndex(4);
                else if (medium === 'HDTV') byIndex(6);
            }
        } catch {}

        // --- MediaInfo + Screenshots ---
        // Unit3D typically separates mediainfo/bdinfo from screenshots/description.
        try {
            const infos = getMediainfoPictureFromDescr(meta.description || '', { mediumSel: meta.mediumSel });
            const miText = (meta.fullMediaInfo || infos.mediainfo || '').trim();
            const picText = (infos.picInfo || '').trim();
            const preferBdinfo = !!(meta.mediumSel && /^(UHD|Blu-ray)$/i.test(meta.mediumSel) && /MPLS/i.test(miText || meta.description || ''));

            if (miText) {
                if (preferBdinfo) {
                    setAnyText(['textarea[name="bdinfo"]', 'textarea#bdinfo'], miText);
                } else {
                    setAnyText(['textarea[name="mediainfo"]', 'textarea#mediainfo', 'textarea#upload-form-mediainfo'], miText);
                }
            }

            // Screenshots / bbcode description (best-effort)
            const body = (picText || meta.description || '').trim();
            if (body) {
                setAnyText(['textarea#upload-form-description', 'textarea#bbcode-description', 'textarea[name="description"]', 'textarea#description'], body);
            }
        } catch {}

        // Season/Episode (if present on form)
        try {
            if (meta.type === '剧集' || meta.type === '综艺') {
                const s = title.match(/\\bS(\\d{1,2})\\b/i)?.[1] || '';
                const e = title.match(/\\bE(\\d{1,3})\\b/i)?.[1] || '';
                if (s) setAnyText(['input#season_number', 'input[name="season_number"]'], String(parseInt(s, 10)));
                if (e) setAnyText(['input#episode_number', 'input[name="episode_number"]'], String(parseInt(e, 10)));
            }
        } catch {}

        // --- TORRENT FILE INJECTION (New) ---
        if (meta.torrentBase64 || meta.torrentUrl) {
            this.log('Injecting torrent file...');
            const fileInput =
                ($(
                    'input[type="file"]#torrent, input[type="file"][name="torrent"], input[type="file"][accept*="torrent"], input.upload-form-file[type="file"]'
                )[0] as HTMLInputElement) ||
                null;
            if (fileInput) {
                try {
                    const { TorrentService } = await import('../services/TorrentService');
                    let announce: string | null = null;
                    try {
                        // Legacy parity: many Unit3D sites expose announce url as a link on the upload page.
                        const a = document.querySelector('a[href*="/announce/"], a[href*="announce.php"], a[href*="announce"]') as HTMLAnchorElement | null;
                        const href = (a?.href || '').trim();
                        if (href && href.startsWith('http')) announce = href;
                    } catch {}
                    try {
                        const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announce);
                        if (result) {
                            TorrentService.injectFileIntoInput(fileInput, result.file);
                            lockTitleAfterFileInject();
                            this.log(`Injected file: ${result.filename}`);
                            return;
                        }
                    } catch {}
                    // Fallback: inject original torrent (may be unclean, but better than empty).
                    if (meta.torrentBase64 && meta.torrentFilename) {
                        const file = TorrentService.base64ToFile(meta.torrentBase64, meta.torrentFilename);
                        TorrentService.injectFileIntoInput(fileInput, file);
                        lockTitleAfterFileInject();
                        this.log(`Injected file: ${meta.torrentFilename}`);
                    }
                } catch (e) {
                    console.error('[Auto-Feed] File Injection Failed:', e);
                }
            } else {
                console.warn('[Auto-Feed] File input not found.');
            }
        }
        // ------------------------------------
    }
}
