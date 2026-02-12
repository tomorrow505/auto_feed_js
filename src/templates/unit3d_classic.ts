import $ from 'jquery';
import { Unit3DEngine } from './unit3d';
import { TorrentMeta } from '../types/TorrentMeta';
import { getType } from '../common/rules/text';
import { extractImdbId, extractTmdbId, matchLink } from '../common/rules/links';
import { getSizeFromDescr } from '../common/rules/helpers';
import { getSearchName } from '../common/rules/search';
import { getMediainfoPictureFromDescr } from '../common/rules/media';
import { SettingsService, getEffectiveTmdbApiKey } from '../services/SettingsService';
import { GMAdapter } from '../services/GMAdapter';

const TIK_BASE_CONTENT = `
[center][img]{poster}[/img]
{screenshots}
[/center]

[b][color=blue]SYNOPSIS:[/color][/b]
{en_descr}

[code]
IMDb...............: [url]http://www.imdb.com/title/{imdbid}/[/url]

Year...............: {year}
Country............: {country}
Runtime............: {runtime} Minutes
Audio..............: {audio}
Subtitles..........: {subtitles}
Video Format.......: {format}
Film Aspect Ratio..: {aspect_ratio}{dvdformat}
Source.............: {source}
Film Distributor...: [url=addlink]To be specified.[/url]
Ripping Program....: Not my rip
Total  Bitrate.....: {bitrate}

Menus......: [x] Untouched
Video......: [x] Untouched
Extras.....: [x] Untouched
Audio......: [x] Untouched
[/code]

[b][color=blue]Extras:[/color][/b]
[*]
[*]
[*]

[b][color=blue]Uploader Comments:[/color][/b]
- All credit goes to the original uploader.
`.trim();

function tikTemplateFormat(tpl: string, kv: Record<string, string>): string {
    let out = tpl;
    for (const [k, v] of Object.entries(kv)) {
        out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), v ?? '');
    }
    return out;
}

function uniqKeepOrder(items: string[]): string[] {
    const out: string[] = [];
    for (const it of items.map((x) => (x || '').trim()).filter(Boolean)) {
        if (!out.includes(it)) out.push(it);
    }
    return out;
}

function parseRuntimeMinutesFromIso8601Duration(dur: string): number | null {
    // e.g. "PT1H48M", "PT108M"
    const m = (dur || '').match(/^PT(?:(\d+)H)?(?:(\d+)M)?/i);
    if (!m) return null;
    const h = m[1] ? parseInt(m[1], 10) : 0;
    const min = m[2] ? parseInt(m[2], 10) : 0;
    const total = h * 60 + min;
    return Number.isFinite(total) && total > 0 ? total : null;
}

function parseRuntimeMinutesFallback(text: string): number | null {
    const t = text || '';
    try {
        const hms = t.match(/Length:.*?(\d+):(\d+):(\d+)/i);
        if (hms) return parseInt(hms[1], 10) * 60 + parseInt(hms[2], 10);
    } catch {}
    try {
        const m = t.match(/Duration\s*:\s*(\d+)\s*min/i);
        if (m?.[1]) return parseInt(m[1], 10);
    } catch {}
    return null;
}

function parseAspectRatioFallback(text: string): string {
    const t = text || '';
    const m =
        t.match(/Display.*?aspect.*?ratio.*?:\s*(.*)/i) ||
        t.match(/Aspect ratio\s*:\s*(.*)/i);
    return (m?.[1] || '').split(/\r?\n/)[0].trim();
}

function parseBitrateFallback(text: string): string {
    const t = text || '';
    const m =
        t.match(/Total.*?Bitrate\s*:\s*(.*)/i) ||
        t.match(/Overall.*?bit.*?rate\s*:\s*(.*)/i);
    return (m?.[1] || '').split(/\r?\n/)[0].trim();
}

function parseLangListFromMedia(text: string, kind: 'audio' | 'sub'): string[] {
    const t = text || '';

    // BDInfo style blocks:
    // SUBTITLES: ----------- ... until FILES:/CHAPTERS:
    if (/DISC INFO:/i.test(t)) {
        try {
            const blockRe =
                kind === 'sub'
                    ? /SUBTITLES:[\s\S]{0,300}?-----------([\s\S]*?)(?:FILES:|CHAPTERS:|\[\/quote\]|$)/i
                    : /Audio:[\s\S]{0,300}?-----------([\s\S]*?)(?:SUBTITLES:|FILES:|CHAPTERS:|\[\/quote\]|$)/i;
            const block = t.match(blockRe)?.[1] || '';
            const lines = block
                .split(/\r?\n/)
                .map((x) => x.trim())
                .filter(Boolean);
            const langs = lines
                .map((line) => {
                    // Common formatting: "  1. English ..." or "  1.  English  ..."
                    const parts = line.split(/\s{2,}/).filter(Boolean);
                    if (parts.length >= 2) return parts[1].replace(/\[\/quote\]/g, '').trim();
                    return '';
                })
                .filter(Boolean);
            return uniqKeepOrder(langs);
        } catch {}
    }

    // MediaInfo style: "Audio: English / DTS-HD MA" or "Subtitle: English"
    const re = kind === 'sub' ? /Subtitle\s*:\s*(.*)/gi : /Audio\s*:\s*(.*)/gi;
    const found: string[] = [];
    try {
        const matches = t.match(re) || [];
        for (const m of matches) {
            const s = m.replace(/^(Audio|Subtitle)\s*:\s*/i, '').split('/')[0].trim();
            if (s) found.push(s);
        }
    } catch {}
    return uniqKeepOrder(found);
}

async function fetchImdbBasics(imdbUrl: string): Promise<{
    poster?: string;
    en_descr?: string;
    country?: string;
    runtime?: number;
    aspect_ratio?: string;
}> {
    const url = (imdbUrl || '').trim();
    if (!url) return {};

    try {
        const resp = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            headers: {
                'accept-language': 'en-US,en;q=0.9'
            }
        });
        const html = resp?.responseText || '';
        if (!html) return {};

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));

        let json: any = null;
        for (const s of scripts) {
            const t = (s.textContent || '').trim();
            if (!t) continue;
            try {
                const obj = JSON.parse(t);
                if (obj && (obj['@type'] === 'Movie' || obj['@type'] === 'TVSeries' || obj.description || obj.image)) {
                    json = obj;
                    break;
                }
            } catch {}
        }

        const poster = (json?.image || '').toString().trim();
        const en_descr = (json?.description || '').toString().trim();

        let runtime: number | undefined;
        const iso = (json?.duration || '').toString().trim();
        const isoMin = iso ? parseRuntimeMinutesFromIso8601Duration(iso) : null;
        if (isoMin) runtime = isoMin;

        let country = '';
        try {
            const coo = json?.countryOfOrigin;
            if (Array.isArray(coo)) {
                country = coo.map((x: any) => x?.name || x).filter(Boolean).join(', ');
            } else if (coo?.name) {
                country = coo.name;
            }
        } catch {}

        let aspect_ratio = '';
        try {
            const li = Array.from(doc.querySelectorAll('li.ipc-metadata-list__item')).find((e) =>
                (e.textContent || '').includes('Aspect ratio')
            );
            if (li) {
                aspect_ratio = (li.textContent || '').replace('Aspect ratio', '').trim();
            }
        } catch {}

        return {
            poster: poster || undefined,
            en_descr: en_descr || undefined,
            country: country || undefined,
            runtime,
            aspect_ratio: aspect_ratio || undefined
        };
    } catch {
        return {};
    }
}

export class Unit3DClassicEngine extends Unit3DEngine {
    async parse(): Promise<TorrentMeta> {
        this.log('Parsing Unit3D Classic page...');

        const meta = await super.parse();

        const title = $('h1.torrent__name, h1').first().text().trim();
        if (title) meta.title = title;

        const isHone = $('#meta-info').length > 0;
        // HONE special layout
        if (isHone) {
            try {
                const imdbUrl = matchLink('imdb', $('#meta-info').html() || document.body.innerHTML);
                if (imdbUrl) {
                    meta.imdbUrl = imdbUrl;
                    meta.imdbId = extractImdbId(imdbUrl);
                }
            } catch {}
            const typeText = $('.torrent-category').text().trim();
            if (typeText) meta.type = getType(typeText);
            const honeName = $('span.torrent-category.badge-extra:first').text().trim();
            if (honeName) meta.title = honeName.replace(/\(|\)/g, '').replace(/English-/, '-');

            const mi = $('.torrent-mediainfo-dump pre').text().trim();
            let imgUrls = '';
            $('.torrent-description').find('a').has('img').each((_, a) => {
                const link = (a as HTMLAnchorElement).href;
                const img = (a as HTMLAnchorElement).querySelector('img') as HTMLImageElement | null;
                const src = img?.getAttribute('src') || img?.getAttribute('data-src') || img?.src || '';
                if (!src) return;
                imgUrls += `[url=${link}][img]${src}[/img][/url]`;
                meta.images.push(src);
            });
            if (mi || imgUrls) {
                meta.description = `${mi ? `[quote]${mi}\n[/quote]\n\n` : ''}${imgUrls}`.trim();
            }
            const honeTorrent = $('.button-block').find('a[href*="torrents/download"]').attr('href') || '';
            if (honeTorrent) {
                try {
                    meta.torrentUrl = new URL(honeTorrent, this.currentUrl).href;
                } catch {
                    meta.torrentUrl = honeTorrent;
                }
            }
        }

        // Unit3DClassic (Tik/Aither/etc.): meta id list can contain imdb/tmdb/tvdb links.
        try {
            const idsHtml = $('ul.meta__ids').html() || '';
            if (idsHtml) {
                const imdbUrl = matchLink('imdb', idsHtml);
                if (imdbUrl) {
                    meta.imdbUrl = imdbUrl;
                    meta.imdbId = extractImdbId(imdbUrl) || meta.imdbId;
                }
                const tmdbUrl = matchLink('tmdb', idsHtml);
                if (tmdbUrl) {
                    meta.tmdbUrl = tmdbUrl;
                    meta.tmdbId = extractTmdbId(tmdbUrl) || meta.tmdbId;
                }
            }
        } catch {}

        if (!isHone) {
            const typeText = $('li.torrent__category').text().trim();
            if (typeText) meta.type = getType(typeText);

            const tagText = $('.torrent__tags').text().trim();
            if (tagText && !meta.type) {
                meta.type = getType(tagText);
            }
        }

        let mediainfo = '';
        try {
            mediainfo = $('code[x-ref="mediainfo"]').text().trim();
            if (!mediainfo) {
                mediainfo = $('code[x-ref="bdinfo"]').text().trim();
            }
        } catch {}

        let imgUrls = '';
        try {
            const descPanel = $('h2.panel__heading:contains("Description"), h2.panel__heading:contains("描述")')
                .parent()
                .next();
            descPanel.find('img').each((_, img) => {
                const el = img as HTMLImageElement;
                const parent = el.parentElement as HTMLAnchorElement | null;
                const href = parent?.href;
                const src = el.getAttribute('data-src') || el.getAttribute('src') || el.src || '';
                if (!src) return;
                if (href) {
                    imgUrls += `[url=${href}][img]${src}[/img][/url] `;
                } else {
                    imgUrls += `[img]${src}[/img] `;
                }
                meta.images.push(src);
            });
        } catch {}

        if (!meta.description && (mediainfo || imgUrls)) {
            meta.description = `${mediainfo ? `[quote]\n${mediainfo}\n[/quote]\n\n` : ''}${imgUrls}`.trim();
            meta.description = meta.description.replace(/https:\/\/wsrv\.nl\/\?n=-1&url=/g, '');
        }

        // ACM / Monika / DTR / HDOli tables
        const detailTables = $('.table-responsive table, .shoutbox table');
        if (!isHone && detailTables.length) {
            const table = detailTables.first();
            const tds = table.find('td').toArray();
            for (let i = 0; i < tds.length; i++) {
                const key = (tds[i].textContent || '').trim();
                const nextText = (tds[i + 1]?.textContent || '').replace(/ *\n.*/gm, '').trim();
                if (!key) continue;
                if (['副标题', 'Subtitle', 'Sub Title', 'Sub-title'].includes(key) && nextText) {
                    meta.smallDescr = nextText;
                    if (!meta.subtitle) meta.subtitle = nextText;
                }
                if (['Name', 'Nombre', '名称', '标题'].includes(key) && nextText) {
                    meta.title = nextText;
                }
                if (['Category', '类别', 'Categoría'].includes(key) && nextText) {
                    if (nextText.match(/Movie|电影|Películas/i)) meta.type = '电影';
                    if (nextText.match(/(TV-Show|TV|剧集|Series)/i)) meta.type = '剧集';
                    if (nextText.match(/Anime (TV|Movie)/i)) meta.type = '动漫';
                    if (nextText.match(/(Docu|纪录|Documentary)/i)) meta.type = '纪录';
                }
                if (['Type', 'Tipo', '规格'].includes(key) && nextText) {
                    if (nextText.match(/BD 50/i)) meta.mediumSel = 'Blu-ray';
                    else if (nextText.match(/Remux/i)) meta.mediumSel = 'Remux';
                    else if (nextText.match(/encode/i)) meta.mediumSel = 'Encode';
                    else if (nextText.match(/web-?dl/i)) meta.mediumSel = 'WEB-DL';
                }
            }
        }

        // IMDB from movie-details blocks
        try {
            const imdbBox = $('.movie-details, .movie__details').first();
            if (imdbBox.length) {
                const imdbUrl = matchLink('imdb', imdbBox.parent().html() || imdbBox.html() || '');
                if (imdbUrl) {
                    meta.imdbUrl = imdbUrl;
                    meta.imdbId = extractImdbId(imdbUrl);
                } else {
                    const tmdbUrl = matchLink('tmdb', imdbBox.parent().html() || imdbBox.html() || '');
                    if (tmdbUrl) {
                        meta.tmdbUrl = tmdbUrl;
                        const settings = await SettingsService.load();
                        const apiKey = getEffectiveTmdbApiKey(settings);
                        if (apiKey) {
                            const api = `https://api.themoviedb.org/3/${tmdbUrl.match(/(tv|movie)\/\d+/)?.[0]}/external_ids?api_key=${apiKey}`;
                            await new Promise<void>((resolve) => {
                                GMAdapter.xmlHttpRequest({
                                    method: 'GET',
                                    url: api,
                                    onload: (resp: any) => {
                                        try {
                                            const data = JSON.parse(resp.responseText || '{}');
                                            if (data.imdb_id) {
                                                meta.imdbUrl = `https://www.imdb.com/title/${data.imdb_id}/`;
                                                meta.imdbId = data.imdb_id;
                                            }
                                        } catch {}
                                        resolve();
                                    },
                                    onerror: () => resolve()
                                }).catch(() => resolve());
                            });
                        }
                    }
                }
            }
        } catch {}

        const torrentUrl =
            $('a[href*="torrents/download"]').attr('href') ||
            $('a[href*="download/"]').attr('href') ||
            '';
        if (torrentUrl) {
            try {
                meta.torrentUrl = new URL(torrentUrl, this.currentUrl).href;
            } catch {
                meta.torrentUrl = torrentUrl;
            }
        }

        if (!meta.torrentFilename && meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, '.').replace(/\*/g, '') + '.torrent';
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, '.');
            meta.torrentName = meta.torrentFilename;
        }

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        await super.fill(meta);

        // Cinematik (Tik) has an extra "autotype" selector that depends on disc size and medium.
        if (this.config.name === 'Tik') {
            try {
                const title = meta.title || '';
                const descr = meta.description || '';
                const autotype = document.querySelector('#autotype') as HTMLSelectElement | HTMLInputElement | null;
                if (!autotype) return;

                let v = '';
                if (/dvd5/i.test(title)) {
                    v = /Standard.*?PAL/i.test(descr) ? '10' : '8';
                } else if (/dvd9/i.test(title)) {
                    v = /Standard.*?PAL/i.test(descr) ? '9' : '7';
                } else if (/mpls/i.test(descr) && (meta.mediumSel === 'Blu-ray' || meta.mediumSel === 'UHD')) {
                    const size = getSizeFromDescr(descr);
                    if (0 <= size && size < 23.28) v = '6';
                    else if (size < 46.57) v = '5';
                    else if (size < 61.47) v = '4';
                    else v = '3';
                }

                if (v) {
                    (autotype as any).value = v;
                    autotype.dispatchEvent(new Event('change', { bubbles: true }));
                    autotype.dispatchEvent(new Event('input', { bubbles: true }));
                }
            } catch { }

            // Tik has a dedicated upload template (legacy parity).
            try {
                const fire = (el: HTMLElement) => {
                    try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
                    try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
                };

                const titleInput = document.querySelector('input#title, input[name=\"title\"], input#titleauto') as HTMLInputElement | null;
                const bbcode = document.querySelector('textarea#bbcode-description, textarea[name=\"description\"], textarea#upload-form-description, textarea#description') as HTMLTextAreaElement | null;

                const rawDescr = meta.fullMediaInfo || meta.description || '';
                const infos = getMediainfoPictureFromDescr(rawDescr, { mediumSel: meta.mediumSel });
                const screenshots = (infos.picInfo || '').trim();

                const year = (meta.title || '').match(/(19|20)\d{2}/g)?.pop() || '';
                const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
                const imdbUrl = meta.imdbUrl || (imdbId ? `https://www.imdb.com/title/${imdbId}/` : '');

                const imdbBasics = imdbUrl ? await fetchImdbBasics(imdbUrl) : {};
                const poster = imdbBasics.poster || meta.images?.[0] || '';
                const en_descr = imdbBasics.en_descr || meta.synopsis || '';
                const country = imdbBasics.country || '';

                const runtime =
                    imdbBasics.runtime ||
                    parseRuntimeMinutesFallback(rawDescr) ||
                    0;

                // Fill audio/subtitle from mediainfo/bdinfo blocks (best-effort)
                const audio = parseLangListFromMedia(rawDescr, 'audio').join(' / ');
                const subtitles = parseLangListFromMedia(rawDescr, 'sub').join(' / ');

                // Video format / source
                const medium = meta.mediumSel || '';
                const standard = meta.standardSel || '';
                const codec = meta.codecSel || '';
                const size = getSizeFromDescr(rawDescr);

                let format = '';
                let source = '';
                let dvdformat = '';

                if (/DVD/i.test(medium)) {
                    format = /NTSC/i.test(meta.title || '') || /NTSC/i.test(rawDescr) ? 'NTSC' : 'PAL';
                    source = /dvd9/i.test(meta.title || '') ? 'DVD9' : 'DVD5';
                    const ar = parseAspectRatioFallback(rawDescr);
                    if (ar) {
                        dvdformat = `\nDVD Format.........: ${ar.trim() === '4:3' ? 'Non-Anamorphic' : 'Anamorphic'}`;
                    } else {
                        dvdformat = `\nDVD Format.........: Anamorphic / Non-Anamorphic`;
                    }
                } else {
                    if (size > 0 && size <= 23.28) source = 'BD25';
                    else if (size > 23.28 && size < 46.57) source = 'BD50';
                    else if (size > 46.57 && size < 61.47) source = 'BD66';
                    else if (size >= 61.47) source = 'BD100';
                    else source = '';

                    if (standard === '4K') format = '2160p';
                    else if (standard) format = standard;
                }

                let codecTag = 'AVC';
                if (codec === 'MPEG-2') codecTag = 'MPEG-2';
                else if (codec === 'VC-1') codecTag = 'VC-1';
                else if (codec === 'H265') codecTag = 'HEVC';

                const searchName = getSearchName(meta.title || '').trim();
                let torrentName = searchName;
                if (year) torrentName += ` (${year})`;
                if (format) torrentName += ` ${format}`;
                if (source) torrentName += ` ${source}`;
                if (!/DVD/i.test(medium)) torrentName += ` ${codecTag}`;
                torrentName = torrentName.replace(/\\s+/g, ' ').trim();

                if (titleInput && torrentName) {
                    titleInput.value = torrentName;
                    fire(titleInput);
                }

                // Aspect ratio: prefer IMDb extracted, then mediainfo fallback
                const aspect_ratio = imdbBasics.aspect_ratio || parseAspectRatioFallback(rawDescr) || '';
                const bitrate = parseBitrateFallback(rawDescr) || '';

                const tpl = tikTemplateFormat(TIK_BASE_CONTENT, {
                    poster: poster || '{poster}',
                    screenshots: screenshots || '',
                    en_descr: en_descr || '',
                    imdbid: imdbId || '',
                    year: year || '',
                    country: country || '',
                    runtime: runtime ? String(runtime) : '',
                    audio: audio || '',
                    subtitles: subtitles || '',
                    format: format || '',
                    aspect_ratio: aspect_ratio || '',
                    dvdformat: dvdformat || '',
                    source: source || '',
                    bitrate: bitrate || ''
                }).trim();

                if (bbcode && tpl) {
                    bbcode.value = tpl;
                    fire(bbcode);
                }
            } catch (e) {
                console.warn('[Auto-Feed][Tik] Template fill skipped:', e);
            }
        }
    }
}
