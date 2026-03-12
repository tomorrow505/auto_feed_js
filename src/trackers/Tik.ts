import { Unit3DClassicEngine } from '../templates/unit3d_classic';
import { TorrentMeta } from '../types/TorrentMeta';
import { getSizeFromDescr } from '../common/rules/helpers';
import { getSearchName } from '../common/rules/search';
import { getMediainfoPictureFromDescr } from '../common/rules/media';
import { extractImdbId } from '../common/rules/links';
import { SettingsService, getEffectiveTmdbApiKey } from '../services/SettingsService';
import { GMAdapter } from '../services/GMAdapter';
import { ImageHostService } from '../services/ImageHostService';

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
        t.match(/Aspect ratio\s*:\s*(.*)/i) ||
        t.match(/Aspect\s*Ratio\s*:\s*(.*)/i) ||
        t.match(/画面比例\s*[:：]\s*(.*)/i) ||
        t.match(/DAR\s*[:：]\s*(\d+(?:\.\d+)?:\d+(?:\.\d+)?)/i);
    return normalizeAspectRatioText((m?.[1] || '')
        .split(/\r?\n/)[0]
        .replace(/^\s*\/+\s*/, '')
        .replace(/\s{2,}/g, ' ')
        .trim());
}

function parseBitrateFallback(text: string): string {
    const t = text || '';
    const m =
        t.match(/Total.*?Bitrate\s*:\s*(.*)/i) ||
        t.match(/Overall.*?bit.*?rate\s*:\s*(.*)/i);
    return (m?.[1] || '').split(/\r?\n/)[0].trim();
}

function parseCountryFallback(text: string): string {
    const t = text || '';
    const m =
        t.match(/◎\s*(?:产|產)\s*地\s*[:：]?\s*(.*)/i) ||
        t.match(/◎\s*(?:国|國)\s*家\s*[:：]?\s*(.*)/i) ||
        t.match(/Country\.{0,10}:\s*(.*)/i) ||
        t.match(/Country\s*:\s*(.*)/i) ||
        t.match(/Countries?\s*of\s*Origin\s*[:：]?\s*(.*)/i) ||
        t.match(/制片国家\/地区\s*[:：]\s*(.*)/i) ||
        t.match(/国家\/地区\s*[:：]\s*(.*)/i);
    const raw = (m?.[1] || '')
        .split(/\r?\n/)[0]
        .split(/[|｜]/)[0]
        .replace(/\s{2,}/g, ' ')
        .replace(/[，、]/g, ', ')
        .trim();
    if (!raw) return '';
    return uniqKeepOrder(
        raw.split(/[,/]/).map((x) => mapCountryName(x.trim())).filter(Boolean)
    ).join(', ');
}

function mapCountryName(name: string): string {
    const n = (name || '').trim();
    if (!n) return '';
    if (n === 'United States') return 'USA';
    if (n === 'United States of America') return 'USA';
    if (n === 'United Kingdom') return 'UK';
    return n;
}

function mapCountryCode(code: string): string {
    const c = (code || '').trim().toUpperCase();
    if (!c) return '';
    if (c === 'US') return 'USA';
    if (c === 'GB') return 'UK';
    return c;
}

function normalizeAspectRatioValue(v: unknown): string {
    const n = typeof v === 'number' ? v : parseFloat(String(v || ''));
    if (!Number.isFinite(n) || n <= 0) return '';
    const r = Number(n.toFixed(2));
    return `${r}:1`;
}

function normalizeAspectRatioText(v: string): string {
    const raw = String(v || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    const ratio = raw.match(/(\d+(?:\.\d+)?\s*:\s*\d+(?:\.\d+)?)/)?.[1] || '';
    if (ratio) return ratio.replace(/\s+/g, '');
    const dec = raw.match(/\b(\d(?:\.\d{1,3})?)\b/)?.[1] || '';
    if (dec) {
        const n = parseFloat(dec);
        if (Number.isFinite(n) && n > 1) return `${Number(n.toFixed(2))}:1`;
    }
    return raw;
}

function extractPixhostImageUrlFromTag(tag: string): string {
    const img = tag.match(/\[img\](.*?)\[\/img\]/i)?.[1] || '';
    if (!img) return '';
    return ImageHostService.getFullSizeUrl(img);
}

function parseLangListFromMedia(text: string, kind: 'audio' | 'sub'): string[] {
    const t = text || '';

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
                    const parts = line.split(/\s{2,}/).filter(Boolean);
                    if (parts.length >= 2) return parts[1].replace(/\[\/quote\]/g, '').trim();
                    return '';
                })
                .filter(Boolean);
            return uniqKeepOrder(langs);
        } catch {}
    }

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

        const pickMovieNode = (obj: any): any => {
            if (!obj) return null;
            if (Array.isArray(obj)) {
                for (const item of obj) {
                    const hit = pickMovieNode(item);
                    if (hit) return hit;
                }
                return null;
            }
            if (typeof obj !== 'object') return null;

            const t = String((obj as any)['@type'] || '').toLowerCase();
            if (t === 'movie' || t === 'tvseries' || t === 'tvminiseries') return obj;
            if ((obj as any).image && ((obj as any).description || (obj as any).name || (obj as any).countryOfOrigin)) return obj;

            const graph = (obj as any)['@graph'];
            if (graph) {
                const hit = pickMovieNode(graph);
                if (hit) return hit;
            }
            for (const v of Object.values(obj)) {
                const hit = pickMovieNode(v);
                if (hit) return hit;
            }
            return null;
        };

        let json: any = null;
        for (const s of scripts) {
            const t = (s.textContent || '').trim();
            if (!t) continue;
            try {
                const obj = JSON.parse(t);
                const node = pickMovieNode(obj);
                if (node) {
                    json = node;
                    break;
                }
            } catch {}
        }

        const poster = (() => {
            const image = json?.image;
            if (typeof image === 'string') return image.trim();
            if (Array.isArray(image)) {
                const first = image.find((x: any) => typeof x === 'string' || x?.url || x?.contentUrl);
                if (typeof first === 'string') return first.trim();
                if (first?.url) return String(first.url).trim();
                if (first?.contentUrl) return String(first.contentUrl).trim();
            }
            if (image?.url) return String(image.url).trim();
            if (image?.contentUrl) return String(image.contentUrl).trim();
            return '';
        })();
        const en_descr = (json?.description || '').toString().trim();

        let runtime: number | undefined;
        const iso = (json?.duration || '').toString().trim();
        const isoMin = iso ? parseRuntimeMinutesFromIso8601Duration(iso) : null;
        if (isoMin) runtime = isoMin;

        let country = '';
        try {
            const coo = json?.countryOfOrigin || json?.countryOfOriginList || json?.productionCountry;
            if (Array.isArray(coo)) {
                country = coo.map((x: any) => mapCountryName(x?.name || x)).filter(Boolean).join(', ');
            } else if (coo?.name) {
                country = mapCountryName(coo.name);
            } else if (typeof coo === 'string') {
                country = mapCountryName(coo);
            }
        } catch {}

        let aspect_ratio = '';
        try {
            if (json?.aspectRatio) {
                aspect_ratio = normalizeAspectRatioText(String(json.aspectRatio).trim());
            }
        } catch {}
        try {
            const li = Array.from(doc.querySelectorAll('li.ipc-metadata-list__item')).find((e) =>
                (e.textContent || '').includes('Aspect ratio')
            );
            if (li) {
                aspect_ratio = normalizeAspectRatioText((li.textContent || '').replace('Aspect ratio', '').trim());
            }
        } catch {}

        try {
            const rows = Array.from(doc.querySelectorAll('li.ipc-metadata-list__item'));
            if (!country) {
                const li = rows.find((e) => /Countr/i.test(e.textContent || ''));
                if (li) {
                    const anchors = Array.from(li.querySelectorAll('a'))
                        .map((a) => mapCountryName((a.textContent || '').trim()))
                        .filter(Boolean);
                    if (anchors.length) {
                        country = uniqKeepOrder(anchors).join(', ');
                    } else {
                        const text = (li.textContent || '')
                            .replace(/Countries? of origin/i, '')
                            .replace(/^Country/i, '')
                            .trim();
                        if (text) country = mapCountryName(text.split(/\s{2,}|\n/)[0].trim());
                    }
                }
            }
            if (!aspect_ratio) {
                const li = rows.find((e) => /Aspect ratio/i.test(e.textContent || ''));
                if (li) {
                    aspect_ratio = normalizeAspectRatioText((li.textContent || '')
                        .replace(/Aspect ratio/i, '')
                        .replace(/\s+/g, ' ')
                        .trim());
                }
            }
        } catch {}

        if (!country) {
            try {
                const names: string[] = [];
                const cooBlock = html.match(/"countryOfOrigin"\s*:\s*(\[[\s\S]{0,600}?\]|\{[\s\S]{0,220}?\})/i)?.[1] || '';
                if (cooBlock) {
                    const re = /"name"\s*:\s*"([^"]+)"/g;
                    let m: RegExpExecArray | null;
                    while ((m = re.exec(cooBlock)) !== null) {
                        const v = mapCountryName(m[1] || '');
                        if (v) names.push(v);
                    }
                }
                if (!names.length) {
                    const inline = html.match(/"countryOfOrigin"\s*:\s*"([^"]+)"/i)?.[1] || '';
                    if (inline) names.push(mapCountryName(inline));
                }
                if (names.length) country = uniqKeepOrder(names).join(', ');
            } catch {}
        }
        if (!aspect_ratio) {
            try {
                aspect_ratio = normalizeAspectRatioText(html.match(/"aspectRatio"\s*:\s*"([^"]+)"/i)?.[1]?.trim() || '');
            } catch {}
        }

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

async function fetchTmdbBasicsByImdb(imdbId: string): Promise<{
    poster?: string;
    en_descr?: string;
    country?: string;
    runtime?: number;
    aspect_ratio?: string;
}> {
    const id = extractImdbId(imdbId);
    if (!id) return {};
    try {
        const settings = await SettingsService.load();
        const apiKey = getEffectiveTmdbApiKey(settings);
        if (!apiKey) return {};

        const fetchJson = async (url: string): Promise<any> => {
            const resp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                headers: { accept: 'application/json' }
            });
            const text = resp?.responseText || '{}';
            return JSON.parse(text);
        };

        const find = await fetchJson(
            `https://api.themoviedb.org/3/find/${encodeURIComponent(id)}?api_key=${encodeURIComponent(apiKey)}&external_source=imdb_id&language=en-US`
        );

        const movie = Array.isArray(find?.movie_results) ? find.movie_results[0] : null;
        const tv = Array.isArray(find?.tv_results) ? find.tv_results[0] : null;

        if (movie?.id) {
            const d = await fetchJson(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${encodeURIComponent(apiKey)}&language=en-US`
            );
            const country = Array.isArray(d?.production_countries)
                ? uniqKeepOrder(
                    d.production_countries
                        .map((x: any) => mapCountryName(String(x?.name || '').trim()) || mapCountryCode(String(x?.iso_3166_1 || '').trim()))
                        .filter(Boolean)
                ).join(', ')
                : '';
            const runtime = Number(d?.runtime || 0);
            const aspect_ratio = normalizeAspectRatioValue(d?.aspect_ratio);
            const posterPath = String(d?.poster_path || movie?.poster_path || '').trim();
            const poster = posterPath ? `https://image.tmdb.org/t/p/original${posterPath}` : '';
            const en_descr = String(d?.overview || movie?.overview || '').trim();
            return {
                poster: poster || undefined,
                en_descr: en_descr || undefined,
                country: country || undefined,
                runtime: Number.isFinite(runtime) && runtime > 0 ? runtime : undefined,
                aspect_ratio: aspect_ratio || undefined
            };
        }

        if (tv?.id) {
            const d = await fetchJson(
                `https://api.themoviedb.org/3/tv/${tv.id}?api_key=${encodeURIComponent(apiKey)}&language=en-US`
            );
            const country = Array.isArray(d?.origin_country)
                ? uniqKeepOrder(d.origin_country.map((x: any) => mapCountryCode(String(x || '').trim())).filter(Boolean)).join(', ')
                : '';
            const episodeRuntime = Array.isArray(d?.episode_run_time) ? Number(d.episode_run_time[0] || 0) : 0;
            const posterPath = String(d?.poster_path || tv?.poster_path || '').trim();
            const poster = posterPath ? `https://image.tmdb.org/t/p/original${posterPath}` : '';
            const en_descr = String(d?.overview || tv?.overview || '').trim();
            return {
                poster: poster || undefined,
                en_descr: en_descr || undefined,
                country: country || undefined,
                runtime: Number.isFinite(episodeRuntime) && episodeRuntime > 0 ? episodeRuntime : undefined,
                aspect_ratio: undefined
            };
        }
    } catch {}
    return {};
}

async function fetchImdbTechnicalAspectRatio(imdbId: string, imdbUrl?: string): Promise<string> {
    const id = extractImdbId(String(imdbId || '')) || extractImdbId(String(imdbUrl || '')) || '';
    if (!id) return '';
    const techUrl = `https://www.imdb.com/title/${id}/technical/?ref_=tt_spec_sm`;
    try {
        const resp = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url: techUrl,
            headers: { 'accept-language': 'en-US,en;q=0.9' }
        });
        const html = resp?.responseText || '';
        if (!html) return '';

        const doc = new DOMParser().parseFromString(html, 'text/html');
        const rows = Array.from(doc.querySelectorAll('tr, li, div'));
        for (const row of rows) {
            const text = (row.textContent || '').replace(/\s+/g, ' ').trim();
            if (!/Aspect ratio/i.test(text)) continue;
            const m = text.match(/Aspect ratio\s*[:：]?\s*([0-9.]+\s*:\s*[0-9.]+)/i);
            if (m?.[1]) return normalizeAspectRatioText(m[1]);
        }

        const m2 =
            html.match(/Aspect ratio[\s\S]{0,220}?([0-9.]+\s*:\s*[0-9.]+)/i) ||
            html.match(/"aspectRatio"\s*:\s*"([^"]+)"/i);
        return normalizeAspectRatioText(m2?.[1] || '');
    } catch {
        return '';
    }
}

export class TikEngine extends Unit3DClassicEngine {
    async parse(): Promise<TorrentMeta> {
        const meta = await super.parse();

        try {
            const mediainfo =
                (document.querySelector('code[x-ref="mediainfo"]') as HTMLElement | null)?.textContent?.trim() ||
                (document.querySelector('code[x-ref="bdinfo"]') as HTMLElement | null)?.textContent?.trim() ||
                '';
            if (mediainfo) {
                meta.fullMediaInfo = mediainfo;
                if (!meta.description) {
                    meta.description = `[quote]\n${mediainfo}\n[/quote]`;
                }
            }
        } catch {}

        const normalizedImdbId =
            extractImdbId(meta.imdbId || '') ||
            extractImdbId(meta.imdbUrl || '') ||
            extractImdbId(meta.description || '');
        if (normalizedImdbId) {
            meta.imdbId = normalizedImdbId;
            if (!meta.imdbUrl) meta.imdbUrl = `https://www.imdb.com/title/${normalizedImdbId}/`;
        }

        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        await super.fill(meta);

        try {
            const title = meta.title || '';
            const descr = `${meta.fullMediaInfo || ''}\n${meta.description || ''}`.trim();
            const autotype = document.querySelector('#autotype') as HTMLSelectElement | HTMLInputElement | null;
            if (autotype) {
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
            }
        } catch {}

        try {
            const fire = (el: HTMLElement) => {
                try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
                try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
            };

            const titleInput = document.querySelector('input#title, input[name="title"], input#titleauto') as HTMLInputElement | null;
            const bbcode = document.querySelector('textarea#bbcode-description, textarea[name="description"], textarea#upload-form-description, textarea#description') as HTMLTextAreaElement | null;

            const rawDescr = `${meta.fullMediaInfo || ''}\n${meta.description || ''}`.trim();
            const infos = getMediainfoPictureFromDescr(rawDescr, { mediumSel: meta.mediumSel });
            const screenshots = (infos.picInfo || '').trim();

            const year = (meta.title || '').match(/(19|20)\d{2}/g)?.pop() || '';
            const imdbId = extractImdbId(meta.imdbId || '') || extractImdbId(meta.imdbUrl || '') || '';
            const imdbUrl = meta.imdbUrl || (imdbId ? `https://www.imdb.com/title/${imdbId}/` : '');

            const imdbBasics = imdbUrl ? await fetchImdbBasics(imdbUrl) : {};
            const tmdbBasics = imdbId ? await fetchTmdbBasicsByImdb(imdbId) : {};
            let poster = imdbBasics.poster || tmdbBasics.poster || meta.images?.[0] || '';
            if (poster && !poster.match(/pixhost\.to\/images\//i)) {
                try {
                    const tags = await ImageHostService.uploadToPixhost([poster]);
                    const pixhostImage = extractPixhostImageUrlFromTag(tags?.[0] || '');
                    if (pixhostImage) poster = pixhostImage;
                } catch {}
            }
            const en_descr = imdbBasics.en_descr || tmdbBasics.en_descr || meta.synopsis || '';
            const country = imdbBasics.country || tmdbBasics.country || parseCountryFallback(rawDescr) || mapCountryName(meta.sourceSel || '') || '';

            const runtime =
                imdbBasics.runtime ||
                tmdbBasics.runtime ||
                parseRuntimeMinutesFallback(rawDescr) ||
                0;

            const audio = parseLangListFromMedia(rawDescr, 'audio').join(' / ');
            const subtitles = parseLangListFromMedia(rawDescr, 'sub').join(' / ');

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
            torrentName = torrentName.replace(/\s+/g, ' ').trim();

            if (titleInput && torrentName) {
                titleInput.value = torrentName;
                fire(titleInput);
            }

            const imdbTechAspect = (!imdbBasics.aspect_ratio && !tmdbBasics.aspect_ratio)
                ? await fetchImdbTechnicalAspectRatio(imdbId, imdbUrl)
                : '';
            const aspect_ratio = normalizeAspectRatioText(
                imdbBasics.aspect_ratio ||
                tmdbBasics.aspect_ratio ||
                imdbTechAspect ||
                parseAspectRatioFallback(rawDescr) ||
                ''
            );
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
