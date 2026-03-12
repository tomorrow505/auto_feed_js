import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { extractImdbId } from '../common/rules/links';
import { getMediumSel } from '../common/rules/text';
import { getSizeFromDescr } from '../common/rules/helpers';
import { getMediainfoPictureFromDescr } from '../common/rules/media';
import { full_bdinfo2summary } from '../utils/mediaInfo';
import { HtmlFetchService } from '../services/HtmlFetchService';
import { ImageHostService } from '../services/ImageHostService';
import { GMAdapter } from '../services/GMAdapter';
import { SettingsService, getEffectiveTmdbApiKey } from '../services/SettingsService';
import { dispatchFormEvents, selectFirstNonEmptyOption, selectOptionByContains, setChecked, setFormValue } from '../common/dom/form';

const KG_INTRO_BASE_CONTENT = `[img]{poster}[/img]

Title: {title}
Year: {year}
Genres: {genres}
Date Published: {date}
IMDB Rating: {score}
IMDB Link: {imdb_url}
Country: {country}
Languages: {language}
Directors: {director}
Creators: {creator}
Actors: {cast}

Introduction
  {en_descr}

Screenshots here:
{screenshots}

-------------------------------------------------------------------------------------------------------------

Not my rip. Many thanks to the original uploader.

-------------------------------------------------------------------------------------------------------------
`;

const KG_DVD_BASE_CONTENT = `DVD label: {label}
DVD5 / DVD9: {size}
DVD Format: {source}
DVD Audio: Codec {audio}, Channels {channels}
Program(s): Not my rip.
Menus: Untouched
Video: Untouched
Audio: Untouched
DVD extras: Untouched
Extras contain: {extras}
DVD runtime(s): {runtime}
`;

const KG_BLURAY_BASE_CONTENT = `Blu-Ray label: {label}
BD25 / BD50: {size}
Blu-Ray Audio: Codec {audio}, Channels {channels}
Program(s): Not my rip.
Menus: Untouched
Video: Untouched
Audio: Untouched
DVD extras: Untouched
Extras contain: {extras}
Blu-Ray runtime(s): {runtime}
`;

const KG_REAPPLY_DELAYS = [0, 140, 420, 900, 1800] as const;
const KG_RIPSPECS_RETRY_DELAYS = [180, 520, 1100, 2200, 4200] as const;
const KG_STEP3_RETRY_DELAYS = [220, 680, 1300, 2200, 4200, 7000] as const;

function formatTpl(tpl: string, kv: Record<string, string>): string {
    let out = tpl;
    for (const [key, value] of Object.entries(kv)) {
        out = out.replace(new RegExp(`\\{${key}\\}`, 'g'), value ?? '');
    }
    return out;
}

function ensureTrailingSlash(url: string): string {
    if (!url) return url;
    return url.endsWith('/') ? url : `${url}/`;
}

function uniq<T>(arr: T[]): T[] {
    return Array.from(new Set(arr));
}

function mapCountryName(v: string): string {
    const t = (v || '').trim();
    if (!t) return '';
    if (/^United States$/i.test(t)) return 'USA';
    if (/^United Kingdom$/i.test(t)) return 'UK';
    return t;
}

function extractCountryFallback(text: string): string[] {
    const t = String(text || '');
    const m =
        t.match(/◎\s*(?:产|產)\s*地\s*[:：]?\s*(.*)/i) ||
        t.match(/◎\s*(?:国|國)\s*家\s*[:：]?\s*(.*)/i) ||
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
    if (!raw) return [];
    return uniq(raw.split(/[,/]/).map((x) => mapCountryName(x.trim())).filter(Boolean));
}

function extractLanguageFallback(text: string): string {
    const t = String(text || '');
    const out: string[] = [];
    try {
        const fromLine = t.match(/Language\s*:\s*(.*)/ig) || [];
        fromLine.forEach((line) => {
            const v = line.replace(/Language\s*:\s*/i, '').split('/')[0].trim();
            if (v) out.push(v);
        });
    } catch {}
    try {
        const fromCn = t.match(/◎语.{0,5}言\s*[:：]?\s*(.*)/i)?.[1] || '';
        if (fromCn) out.push(...fromCn.split(/[\/,]/).map((x) => x.trim()).filter(Boolean));
    } catch {}
    return uniq(out).join(', ');
}

function parseLangListFromMedia(text: string, kind: 'audio' | 'sub'): string[] {
    const t = String(text || '');

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
            return uniq(langs);
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
    return uniq(found);
}

function parseStepFromTitle(): number {
    const title = String(document.title || '').trim();
    const stepOf = title.match(/Step\s*(\d+)\s*of\s*\d+/i)?.[1] || '';
    if (stepOf) {
        const n = parseInt(stepOf, 10);
        return Number.isFinite(n) ? n : 0;
    }
    if (/step/i.test(title)) {
        const m = title.match(/(\d+)\s*$/);
        if (!m?.[1]) return 0;
        const n = parseInt(m[1], 10);
        return Number.isFinite(n) ? n : 0;
    }
    return 0;
}

function detectKgUploadStep(): number {
    const fromTitle = parseStepFromTitle();
    if (fromTitle >= 1 && fromTitle <= 3) return fromTitle;

    const hasTitle = !!document.querySelector('input[name="title"], input#title');
    const hasLink = !!document.querySelector('input[name="link"], input[name="internet"]');
    const hasDescr = !!document.querySelector('textarea[name="descr"], textarea[name="description"]');
    const hasRip = !!document.querySelector('#ripspecs, textarea[name="ripspecs"]');
    const hasFile = !!document.querySelector('input[type="file"]');

    // Prefer form-shape detection over title text: KG title often ends with "... of 3".
    if (hasDescr || hasRip || hasLink) return 2;
    if (hasFile && !hasDescr && !hasRip && !hasLink) return 3;
    if (hasTitle && !hasLink && !hasDescr && !hasRip) return 1;
    return 0;
}

function getKgStep(): number {
    const pageFromTitle = parseInt(String(document.title || '').split(' ').pop() || '', 10);
    return Number.isFinite(pageFromTitle) && pageFromTitle >= 1 && pageFromTitle <= 3 ? pageFromTitle : detectKgUploadStep();
}

function parseImdbJsonLd(doc: Document): any {
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    const pickNode = (obj: any): any => {
        if (!obj) return null;
        if (Array.isArray(obj)) {
            for (const it of obj) {
                const hit = pickNode(it);
                if (hit) return hit;
            }
            return null;
        }
        if (typeof obj !== 'object') return null;

        const type = String((obj as any)['@type'] || '').toLowerCase();
        if (type.includes('movie') || type.includes('tvseries') || type.includes('tvminiseries')) return obj;
        if ((obj as any).image && ((obj as any).description || (obj as any).genre)) return obj;

        const graph = (obj as any)['@graph'];
        if (graph) {
            const hit = pickNode(graph);
            if (hit) return hit;
        }
        for (const value of Object.values(obj)) {
            const hit = pickNode(value);
            if (hit) return hit;
        }
        return null;
    };

    for (const script of scripts) {
        const text = (script.textContent || '').trim();
        if (!text) continue;
        try {
            const parsed = JSON.parse(text);
            const node = pickNode(parsed);
            if (node) return node;
        } catch {}
    }
    return null;
}

async function fetchImdbFullCreditsWriters(imdbId: string): Promise<string> {
    if (!imdbId) return '';
    try {
        const url = `https://www.imdb.com/title/${imdbId}/fullcredits?ref_=tt_ov_wr`;
        const doc = await HtmlFetchService.getDocument(url, { headers: { 'accept-language': 'en-US,en;q=0.9' } });
        const writers = Array.from(doc.querySelectorAll('#writer + table td.name a'))
            .map((a) => (a.textContent || '').trim())
            .filter(Boolean);
        return uniq(writers).join(', ');
    } catch {
        return '';
    }
}

async function fetchAkaTitleFromPtp(imdbUrl: string): Promise<string> {
    const url = (imdbUrl || '').trim();
    if (!url) return '';
    try {
        const api = `https://passthepopcorn.me/ajax.php?action=torrent_info&imdb=${encodeURIComponent(url)}&fast=1`;
        const text = await HtmlFetchService.getText(api);
        const data = JSON.parse(text || '[]');
        if (Array.isArray(data) && data.length && data[0]?.title) {
            return String(data[0].title).trim();
        }
    } catch {}
    return '';
}

async function fetchImdbDetails(imdbUrl: string): Promise<{
    title: string;
    year: string;
    poster: string;
    genres: string[];
    date: string;
    score: string;
    director: string;
    creator: string;
    cast: string;
    enDescr: string;
    countries: string[];
    language: string;
}> {
    const empty = {
        title: '',
        year: '',
        poster: '',
        genres: [] as string[],
        date: '',
        score: '',
        director: '',
        creator: '',
        cast: '',
        enDescr: '',
        countries: [] as string[],
        language: ''
    };

    const imdbId = extractImdbId(imdbUrl || '');
    if (!imdbUrl) return empty;

    try {
        const doc = await HtmlFetchService.getDocument(imdbUrl, { headers: { 'accept-language': 'en-US,en;q=0.9' } });
        const json = parseImdbJsonLd(doc) || {};

        const title = (doc.querySelector('h1')?.textContent || json?.name || '').trim();
        const year =
            (doc.querySelector('title')?.textContent || '').match(/\b(19|20)\d{2}\b/)?.[0] ||
            title.match(/\b(19|20)\d{2}\b/)?.[0] ||
            '';

        const poster = (() => {
            const img = json?.image;
            if (typeof img === 'string') return img.trim();
            if (Array.isArray(img)) {
                const first = img.find((x: any) => typeof x === 'string' || x?.url || x?.contentUrl);
                if (typeof first === 'string') return first.trim();
                if (first?.url) return String(first.url).trim();
                if (first?.contentUrl) return String(first.contentUrl).trim();
            }
            if (img?.url) return String(img.url).trim();
            if (img?.contentUrl) return String(img.contentUrl).trim();
            const og = (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content || '';
            return og.trim();
        })();

        const genres = (() => {
            if (Array.isArray(json?.genre)) return json.genre.map((x: any) => String(x || '').trim()).filter(Boolean);
            if (typeof json?.genre === 'string') return [json.genre.trim()].filter(Boolean);
            return Array.from(doc.querySelectorAll('li[data-testid="storyline-genres"] a, a[href*="/search/title/?genres="]'))
                .map((a) => (a.textContent || '').trim())
                .filter(Boolean);
        })();

        const date =
            Array.from(doc.querySelectorAll('li.ipc-metadata-list__item'))
                .find((li) => /Release date/i.test(li.textContent || ''))
                ?.querySelector('li, a, div')
                ?.textContent
                ?.trim() || '';

        const score =
            (doc.querySelector('div[data-testid*="aggregate-rating__score"]')?.textContent || '')
                .replace(/\s+/g, ' ')
                .trim() || '';

        const getPeople = (pattern: RegExp) => {
            const rows = Array.from(doc.querySelectorAll('li.ipc-metadata-list__item'));
            const li = rows.find((x) => pattern.test(x.textContent || ''));
            if (!li) return '';
            const names = Array.from(li.querySelectorAll('a'))
                .map((a) => (a.textContent || '').trim())
                .filter(Boolean);
            return uniq(names).join(', ');
        };

        const director = (() => {
            const fromRow = getPeople(/Director/i);
            if (fromRow) return fromRow;
            try {
                const dir = (json as any)?.director;
                if (Array.isArray(dir)) {
                    const names = dir.map((x: any) => String(x?.name || x || '').trim()).filter(Boolean);
                    if (names.length) return uniq(names).join(', ');
                }
                if (dir?.name) return String(dir.name).trim();
            } catch {}
            return '';
        })();
        const creatorMain = getPeople(/Writer|Creator/i);
        const creator = creatorMain || (imdbId ? await fetchImdbFullCreditsWriters(imdbId) : '');

        const cast = (() => {
            const primary = Array.from(doc.querySelectorAll('a[data-testid="title-cast-item__actor"]'))
                .map((a) => (a.textContent || '').trim())
                .filter(Boolean)
                .slice(0, 8);
            if (primary.length) return primary.join(', ');
            const fallback = Array.from(doc.querySelectorAll('section[data-testid="title-cast"] a[href*="/name/"]'))
                .map((a) => (a.textContent || '').trim())
                .filter(Boolean)
                .slice(0, 8);
            return uniq(fallback).join(', ');
        })();

        const enDescr = String(json?.description || '').trim();

        const countries = (() => {
            const li = Array.from(doc.querySelectorAll('li.ipc-metadata-list__item')).find((x) => /Countr/i.test(x.textContent || ''));
            if (!li) return [] as string[];
            const byAnchor = Array.from(li.querySelectorAll('a'))
                .map((a) => mapCountryName((a.textContent || '').trim()))
                .filter(Boolean);
            if (byAnchor.length) return uniq(byAnchor);
            const raw = (li.textContent || '')
                .replace(/Countries? of origin/i, '')
                .replace(/Country of origin/i, '')
                .trim();
            return uniq(raw.split(/[\/,]/).map((x) => mapCountryName(x.trim())).filter(Boolean));
        })();

        const language =
            uniq(
                Array.from(doc.querySelectorAll('li[data-testid="title-details-languages"] a'))
                    .map((a) => (a.textContent || '').trim())
                    .filter(Boolean)
            ).join(', ');

        return {
            title,
            year,
            poster,
            genres: uniq(genres),
            date,
            score,
            director,
            creator,
            cast,
            enDescr,
            countries,
            language
        };
    } catch {
        return empty;
    }
}

async function fetchTmdbFallbackByImdb(imdbUrlOrId: string): Promise<{ country: string; language: string; year: string }> {
    const imdbId = extractImdbId(imdbUrlOrId);
    if (!imdbId) return { country: '', language: '', year: '' };
    try {
        const settings = await SettingsService.load();
        const key = getEffectiveTmdbApiKey(settings);
        if (!key) return { country: '', language: '', year: '' };

        const fetchJson = async (url: string): Promise<any> => {
            const text = await HtmlFetchService.getText(url, { headers: { accept: 'application/json' } });
            return JSON.parse(text || '{}');
        };

        const find = await fetchJson(
            `https://api.themoviedb.org/3/find/${encodeURIComponent(imdbId)}?api_key=${encodeURIComponent(key)}&external_source=imdb_id&language=en-US`
        );
        const movie = Array.isArray(find?.movie_results) ? find.movie_results[0] : null;
        const tv = Array.isArray(find?.tv_results) ? find.tv_results[0] : null;

        if (movie?.id) {
            const d = await fetchJson(
                `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${encodeURIComponent(key)}&language=en-US`
            );
            const country = uniq(
                (Array.isArray(d?.production_countries) ? d.production_countries : [])
                    .map((x: any) => mapCountryName(String(x?.name || '').trim()))
                    .filter(Boolean)
            ).join(', ');
            const language = uniq(
                (Array.isArray(d?.spoken_languages) ? d.spoken_languages : [])
                    .map((x: any) => String(x?.english_name || x?.name || '').trim())
                    .filter(Boolean)
            ).join(', ');
            const year = String(d?.release_date || movie?.release_date || '').match(/\b(19|20)\d{2}\b/)?.[0] || '';
            return { country, language, year };
        }

        if (tv?.id) {
            const d = await fetchJson(
                `https://api.themoviedb.org/3/tv/${tv.id}?api_key=${encodeURIComponent(key)}&language=en-US`
            );
            const country = uniq(
                (Array.isArray(d?.origin_country) ? d.origin_country : [])
                    .map((x: any) => mapCountryName(String(x || '').trim()))
                    .filter(Boolean)
            ).join(', ');
            const language = uniq(
                (Array.isArray(d?.spoken_languages) ? d.spoken_languages : [])
                    .map((x: any) => String(x?.english_name || x?.name || '').trim())
                    .filter(Boolean)
            ).join(', ');
            const year = String(d?.first_air_date || tv?.first_air_date || '').match(/\b(19|20)\d{2}\b/)?.[0] || '';
            return { country, language, year };
        }
    } catch {}
    return { country: '', language: '', year: '' };
}

function getScreenshotsFullSizeFromDescr(descr: string, mediumSel?: string): string {
    try {
        const info = getMediainfoPictureFromDescr(descr || '', { mediumSel });
        return (info.picInfo || '').replace(/\[img\](.*?)\[\/img\]/gi, (_m, p1) => {
            const full = ImageHostService.getFullSizeUrl(String(p1 || '').trim());
            return `[img]${full}[/img]`;
        });
    } catch {
        return '';
    }
}

function extractSubtitleListFromSummary(summary: string): string[] {
    const out: string[] = [];
    const text = String(summary || '');
    const hits = text.match(/subtitles?:.*?(Chinese|Danish|German|English|Spanish|French|Italian|Dutch|Norwegian|Finnish|Swedish|Japanese|Korean).*/ig) || [];
    hits.forEach((line) => {
        try {
            const v = line.split(':')[1].trim().split('/')[0].trim();
            if (v) out.push(v);
        } catch {}
    });
    return uniq(out);
}

function extractSubtitleListFromMediainfo(descr: string): string[] {
    const out: string[] = [];
    const text = String(descr || '');
    const block = text.match(/Text(.*#\d+)?\nid[\s\S]*/i)?.[0] || '';
    block.split(/text/i).forEach((seg) => {
        const lang = seg.match(/Language.*?:(.*)/i)?.[1]?.trim() || '';
        if (lang) out.push(lang);
    });
    return uniq(out);
}

function buildKgGenericRipSpecs(meta: TorrentMeta): string {
    const blob = `${meta.fullMediaInfo || ''}\n${meta.description || ''}`;
    const runtime =
        blob.match(/Duration\s*:\s*(.*)/i)?.[1]?.split(/\r?\n/)[0]?.trim() ||
        blob.match(/Length:\s*(.*)/i)?.[1]?.split(/\r?\n/)[0]?.trim() ||
        '';
    const source = meta.mediumSel || '';
    const resolution = meta.standardSel || '';
    const audio = meta.audioCodecSel || '';
    const subs = extractSubtitleListFromMediainfo(blob).join(', ');

    const lines = [
        `Source: ${source || '?'}`,
        `Resolution: ${resolution || '?'}`,
        `Audio: ${audio || '?'}`,
        `Subtitles: ${subs || 'None'}`,
        `Runtime: ${runtime || '?'}`
    ];
    return lines.join('\n').trim();
}

function resolveKgMedium(meta: TorrentMeta): string {
    const explicit = (meta.mediumSel || '').trim();
    if (explicit) return explicit;
    const fromTitle = getMediumSel(meta.title || '', meta.title);
    if (fromTitle) return fromTitle;
    const fromSource = getMediumSel(`${meta.fullMediaInfo || ''}\n${meta.description || ''}`, meta.title);
    return fromSource || '';
}

function sanitizeKgRipSpecs(value: string): string {
    const lines = String(value || '')
        .split(/\r?\n/)
        .map((line) => line.trimEnd());

    const out: string[] = [];
    let last = '';
    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) {
            if (last) out.push('');
            last = '';
            continue;
        }
        if (/^(Disc Title|Disc Label|Disc Size|Protection|Playlist|Size|Length|Total Bitrate)\s*:/i.test(trimmed)) continue;
        if (/^(Video|Audio|Subtitle)\s*:/i.test(trimmed) && /\/\s*\d+(?:\.\d+)?\s*(?:kbps|fps)|High Profile|Master Audio/i.test(trimmed)) continue;
        if (/\?\s*$/.test(trimmed)) continue;
        if (trimmed === last) continue;
        out.push(line);
        last = trimmed;
    }
    return out.join('\n').replace(/\n{3,}/g, '\n\n').trim();
}

function buildKgRipspecs(meta: TorrentMeta): { ripspecs: string; subs: string; forceDvdr: boolean; forceHdrip3: boolean } {
    const descr = `${meta.fullMediaInfo || ''}\n${meta.description || ''}`.trim();
    const medium = resolveKgMedium(meta);
    const audio = meta.audioCodecSel || '';
    const looksBluray = medium === 'Blu-ray' || medium === 'UHD';
    const looksDvd = medium === 'DVD';

    if (looksBluray) {
        const summary = full_bdinfo2summary(descr);
        const size = getSizeFromDescr(`${descr}\n${summary}`);
        const sizeTag = size > 0 && size <= 23.28 ? 'BD25' : 'BD50';

        const channels = (meta.title || '').match(/(7\.1|5\.1|2\.0|1\.0)/i)?.[1] || '';
        const runtime =
            descr.match(/DISC INFO[\s\S]*PLAYLIST[\s\S]{3,90}?Length:(.*)/i)?.[1]?.trim() ||
            summary.match(/Length:.*(\d+:\d+:\d+)/i)?.[1] ||
            '';

        const bluray = formatTpl(KG_BLURAY_BASE_CONTENT, {
            label: '',
            size: sizeTag,
            audio,
            channels,
            extras: '',
            runtime
        }).trim();

        return {
            ripspecs: bluray,
            subs: extractSubtitleListFromSummary(summary).join(', '),
            forceDvdr: false,
            forceHdrip3: true
        };
    }

    if (looksDvd) {
        const size = /dvd5/i.test(`${descr} ${meta.title || ''}`) ? 'DVD5' : /dvd9/i.test(`${descr} ${meta.title || ''}`) ? 'DVD9' : '';
        const source = /PAL/i.test(`${descr} ${meta.title || ''}`) ? 'PAL' : /NTSC/i.test(`${descr} ${meta.title || ''}`) ? 'NTSC' : '';

        let channels = '';
        const c = descr.match(/Channel[\s\S]*?(2|6|8).*?channels/i)?.[1] || '';
        if (c === '2') channels = '2.0';
        if (c === '6') channels = '5.1';
        if (c === '8') channels = '7.1';

        const runtime = descr.match(/.IFO[\s\S]*?Duration.*?:(.*)/i)?.[1]?.trim() || '';

        const dvd = formatTpl(KG_DVD_BASE_CONTENT, {
            label: '',
            size,
            source,
            audio,
            channels,
            extras: '',
            runtime
        }).trim();

        return {
            ripspecs: dvd,
            subs: extractSubtitleListFromMediainfo(descr).join(', '),
            forceDvdr: true,
            forceHdrip3: false
        };
    }

    try {
        const info = getMediainfoPictureFromDescr(descr, { mediumSel: medium });
        const mi = String(info.mediainfo || '').trim();
        return {
            ripspecs: mi || (meta.fullMediaInfo || '').trim() || buildKgGenericRipSpecs(meta),
            subs: extractSubtitleListFromMediainfo(descr).join(', '),
            forceDvdr: false,
            forceHdrip3: false
        };
    } catch {
        return {
            ripspecs: buildKgGenericRipSpecs(meta),
            subs: '',
            forceDvdr: false,
            forceHdrip3: false
        };
    }
}

function pickSourceAndHdrip(meta: TorrentMeta) {
    const sourceSelect = document.querySelector('select[name="source"]') as HTMLSelectElement | null;
    const hdripSelect = document.querySelector('select[name="hdrip"]') as HTMLSelectElement | null;

    const medium = meta.mediumSel || '';
    const standard = meta.standardSel || '';
    const titleOnly = `${meta.title || ''}`;

    if (sourceSelect) {
        if (/UHD|Blu-ray|Encode|Remux/i.test(medium)) sourceSelect.value = 'Blu-ray';
        else if (/HDTV/i.test(medium)) sourceSelect.value = 'HDTV';
        else if (/WEB-DL/i.test(medium)) sourceSelect.value = 'WEB';
        else if (/DVD/i.test(medium)) sourceSelect.value = 'DVD';
        else if (/TV/i.test(medium)) sourceSelect.value = 'TV';
        if (/hd-dvd/i.test(titleOnly)) sourceSelect.value = 'HD-DVD';
        dispatchFormEvents(sourceSelect);
    }

    if (hdripSelect) {
        const standardMap: Record<string, string> = {
            SD: '0',
            '720p': '1',
            '1080i': '2',
            '1080p': '2',
            '4K': '2160p'
        };
        if (standardMap[standard]) {
            hdripSelect.value = standardMap[standard];
            dispatchFormEvents(hdripSelect);
        }
    }
}

async function buildKgTorrentFile(meta: Partial<TorrentMeta>, announce: string): Promise<{ file: File; filename: string } | null> {
    const { TorrentService } = await import('../services/TorrentService');

    const buildBlobFromTorrent = (r: string, forwardAnnounce: string, forwardSite: string): { blob: Blob; name: string } | null => {
        let name = '';
        let payload = r;

        if (forwardSite && forwardSite !== 'hdb-task') {
            if (payload.match(/value="firsttime"/)) throw new Error('加载种子失败，请先在源站进行一次种子下载操作。');
            if (payload.match(/Request frequency limit/)) throw new Error('种子下载频率过快，请稍后再试。');

            if (payload.match(/8:announce\d+:.*(please\.passthepopcorn\.me|blutopia\.cc|beyond-hd\.me|eiga\.moi|hd-olimpo\.club|secret-cinema\.pw|monikadesign\.uk)/)) {
                const extracted = TorrentService.extractTorrentName(payload) || '';
                if (extracted) name = extracted;
            }

            let newTorrent = 'd';
            const announceUrl = (forwardAnnounce || 'https://hudbt.hust.edu.cn/announce.php').trim();
            if (!payload.match(/8:announce\d+:/)) throw new Error('种子文件加载失败。');

            newTorrent += `8:announce${announceUrl.length}:${announceUrl}`;

            if (payload.match(/13:creation date/)) {
                try {
                    const date = payload.match(/13:creation datei(\d+)e/)?.[1] || '';
                    if (date) {
                        const next = parseInt(date, 10) + 600 + Math.floor(Math.random() * 600);
                        newTorrent += `13:creation datei${next.toString()}e`;
                    }
                } catch {}
            }

            newTorrent += '8:encoding5:UTF-8';
            const info = payload.match(/4:info[\s\S]*?privatei\de/)?.[0]?.replace('privatei0e', 'privatei1e') || '';
            if (!info) throw new Error('种子文件加载失败。');
            newTorrent += info;
            newTorrent += `6:source${forwardSite.length}:${forwardSite.toUpperCase()}`;
            newTorrent += 'ee';
            payload = newTorrent;
        }

        const data = new Uint8Array(payload.length);
        for (let i = 0; i < payload.length; i++) data[i] = payload.charCodeAt(i);
        return { blob: new Blob([data], { type: 'application/x-bittorrent' }), name };
    };

    const getBlob = async (url: string, forwardAnnounce: string, forwardSite: string): Promise<{ blob: Blob; name: string } | null> => {
        const response = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        });
        const text = String(response?.responseText || '');
        if (!text) return null;
        return buildBlobFromTorrent(text, forwardAnnounce, forwardSite);
    };

    const rawName = String(meta.torrentFilename || meta.torrentName || meta.title || 'autofeed')
        .replace(/^\[.*?\](\.| )?/, '')
        .replace(/ /g, '.')
        .replace(/\.-\./g, '-')
        .trim();
    let filename = rawName || 'autofeed';

    let built: { blob: Blob; name: string } | null = null;
    if (meta.torrentUrl && meta.torrentUrl.match(/^d8:announce/)) {
        built = buildBlobFromTorrent(meta.torrentUrl, announce, 'KG');
    } else if (meta.torrentUrl) {
        built = await getBlob(meta.torrentUrl, announce, 'KG');
    } else if (meta.torrentBase64) {
        const binary = TorrentService.base64ToBinaryString(meta.torrentBase64);
        built = buildBlobFromTorrent(binary, announce, 'KG');
    }
    if (!built) return null;

    if (built.name) {
        filename = built.name.replace(/|™/g, '').trim().replace(/ /g, '.');
    }
    if (!filename.endsWith('.torrent')) filename += '.torrent';
    return { file: new window.File([built.blob], filename, { type: built.blob.type }), filename };
}

function fillKgTorrentLegacy(file: File): boolean {
    const input =
        (document.querySelector('input[name="file"]') as HTMLInputElement | null) ||
        (document.querySelector('input[type="file"][name="file"]') as HTMLInputElement | null);
    if (!input) return false;

    try {
        const container = new DataTransfer();
        container.items.add(file);
        input.files = container.files;
        return !!input.files?.length;
    } catch {
        return false;
    }
}

async function fillKgStep2(workingMeta: TorrentMeta, title: string, baseImdbUrl: string) {
    const titleInput =
        (document.querySelector('input[name="title"]') as HTMLInputElement | null) ||
        (document.querySelector('input[name="name"]') as HTMLInputElement | null) ||
        (document.querySelector('input#title') as HTMLInputElement | null) ||
        (document.querySelector('input#name') as HTMLInputElement | null);
    const linkInput =
        (document.querySelector('input[name="link"]') as HTMLInputElement | null) ||
        (document.querySelector('input[name="internet"]') as HTMLInputElement | null);
    const countrySelect =
        (document.querySelector('select[name="country_id"]') as HTMLSelectElement | null) ||
        (document.querySelector('select[name*="country"], select[id*="country"]') as HTMLSelectElement | null);
    const directorInputs = Array.from(document.querySelectorAll(
        'input[name="director"], input[name="artist"], input[name*="director"], input[name*="artist"], input[id*="director"], input[id*="artist"]'
    )) as HTMLInputElement[];
    const langInput = document.querySelector('input[name="lang"]') as HTMLInputElement | null;
    const descrBox =
        (document.querySelector('textarea[name="descr"]') as HTMLTextAreaElement | null) ||
        (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null);
    const subsInput = document.querySelector('input[name="subs"]') as HTMLInputElement | null;
    const mainGenre = document.querySelector('select[name="genre_main_id"]') as HTMLSelectElement | null;
    const subGenre = document.querySelector('select[name="subgenre"]') as HTMLSelectElement | null;
    const anyGenre = document.querySelector('select[name*="genre"], select[id*="genre"]') as HTMLSelectElement | null;
    const ripBox =
        (document.querySelector('#ripspecs') as HTMLTextAreaElement | null) ||
        (document.querySelector('textarea[name="ripspecs"]') as HTMLTextAreaElement | null);
    const dvdrInput = document.querySelector('input[name="dvdr"]') as HTMLInputElement | null;
    const hdripSelect = document.querySelector('select[name="hdrip"]') as HTMLSelectElement | null;

    if (linkInput && baseImdbUrl) setFormValue(linkInput, baseImdbUrl, { force: false });
    const imdbUrl = (linkInput?.value || '').trim() || baseImdbUrl;

    if (titleInput && !titleInput.value.trim()) setFormValue(titleInput, title);
    const aka = await fetchAkaTitleFromPtp(imdbUrl);
    if (aka && titleInput) setFormValue(titleInput, aka);

    const mergedSource = `${workingMeta.fullMediaInfo || ''}\n${workingMeta.description || ''}`;
    const mergedDescr = mergedSource.trim();
    if (/Audio[\s\S]*commentary/i.test(mergedDescr) && titleInput) {
        const cur = titleInput.value || '';
        if (!/\[\+commentary\]/i.test(cur)) setFormValue(titleInput, `${cur} [+commentary]`.trim());
    }

    const imdb = await fetchImdbDetails(imdbUrl);
    const tmdb = await fetchTmdbFallbackByImdb(imdbUrl);
    const mediaLang = uniq([
        ...parseLangListFromMedia(mergedSource, 'audio'),
        ...parseLangListFromMedia(mergedSource, 'sub')
    ]).join(', ');
    const languageText = imdb.language || tmdb.language || mediaLang || extractLanguageFallback(mergedSource);
    const countryFallback = extractCountryFallback(mergedSource);

    let selectedCountryText = '';
    if (countrySelect) {
        const countryCandidates = [
            ...imdb.countries,
            ...tmdb.country.split(',').map((x) => x.trim()).filter(Boolean),
            ...countryFallback,
            mapCountryName(workingMeta.sourceSel || '')
        ].filter(Boolean);
        if (!selectOptionByContains(countrySelect, countryCandidates)) selectFirstNonEmptyOption(countrySelect);
        selectedCountryText = (countrySelect.options[countrySelect.selectedIndex]?.textContent || '').trim();
    }

    const directorValue = imdb.director || (titleInput?.value?.trim() || title || 'Unknown');
    directorInputs.forEach((input) => setFormValue(input, directorValue, { force: false }));
    if (langInput) setFormValue(langInput, languageText);

    if (descrBox) {
        const shots = getScreenshotsFullSizeFromDescr(mergedDescr, workingMeta.mediumSel);
        const poster = imdb.poster || workingMeta.images?.[0] || '';
        setFormValue(descrBox, formatTpl(KG_INTRO_BASE_CONTENT, {
            poster,
            title: imdb.title || title,
            year: imdb.year || tmdb.year || ((workingMeta.title || '').match(/\b(19|20)\d{2}\b/)?.[0] || ''),
            genres: imdb.genres.join(', '),
            date: imdb.date,
            score: imdb.score,
            imdb_url: imdbUrl,
            country: imdb.countries.join(', ') || tmdb.country || countryFallback.join(', ') || selectedCountryText,
            language: languageText,
            director: imdb.director,
            creator: imdb.creator,
            cast: imdb.cast,
            en_descr: imdb.enDescr,
            screenshots: shots
        }).trim());
    }
    if (subsInput && !subsInput.value.trim()) setFormValue(subsInput, 'None');

    if (mainGenre || subGenre) {
        let used = -1;
        const genreCandidates = imdb.genres.length ? imdb.genres : ['Drama', 'Documentary', 'Crime', 'Comedy', 'Action'];
        genreCandidates.forEach((genre, idx) => {
            if (used !== -1) return;
            if (selectOptionByContains(mainGenre, [genre])) used = idx;
        });
        genreCandidates.forEach((genre, idx) => {
            if (idx === used) return;
            if (subGenre && !subGenre.value) selectOptionByContains(subGenre, [genre]);
        });
        if (mainGenre && !mainGenre.value) selectFirstNonEmptyOption(mainGenre);
    } else if (anyGenre && !anyGenre.value) {
        selectFirstNonEmptyOption(anyGenre);
    }

    pickSourceAndHdrip(workingMeta);

    const rip = buildKgRipspecs(workingMeta);
    const finalRipSpecs = sanitizeKgRipSpecs(rip.ripspecs);
    if (ripBox) setFormValue(ripBox, finalRipSpecs);
    KG_RIPSPECS_RETRY_DELAYS.forEach((ms) => window.setTimeout(() => {
        if (ripBox) setFormValue(ripBox, finalRipSpecs);
    }, ms));
    if (rip.subs && subsInput) setFormValue(subsInput, rip.subs);
    if (rip.forceDvdr) setChecked(dvdrInput, true);
    if (rip.forceHdrip3 && hdripSelect) {
        hdripSelect.value = '3';
        dispatchFormEvents(hdripSelect);
    }

    KG_REAPPLY_DELAYS.forEach((ms) => window.setTimeout(() => {
        if (countrySelect && !countrySelect.value) selectFirstNonEmptyOption(countrySelect);
        if (mainGenre && !mainGenre.value) selectFirstNonEmptyOption(mainGenre);
        if (anyGenre && !anyGenre.value) selectFirstNonEmptyOption(anyGenre);
        directorInputs.forEach((input) => {
            if (!input.value.trim()) setFormValue(input, directorValue);
        });
    }, ms));
}

async function fillKgStep3(workingMeta: TorrentMeta) {
    const { StorageService } = await import('../services/StorageService');
    const announce =
        (document.querySelector('input[value*="announce"]') as HTMLInputElement | null)?.value ||
        '';
    const cached = (await StorageService.load()) as Partial<TorrentMeta> | null;
    const built = await buildKgTorrentFile({
        ...cached,
        ...workingMeta,
        title: workingMeta.title || cached?.title || '',
        torrentUrl: workingMeta.torrentUrl || cached?.torrentUrl || '',
        torrentBase64: workingMeta.torrentBase64 || cached?.torrentBase64 || '',
        torrentFilename: workingMeta.torrentFilename || workingMeta.torrentName || cached?.torrentFilename || cached?.torrentName || '',
        torrentName: workingMeta.torrentName || workingMeta.torrentFilename || cached?.torrentName || cached?.torrentFilename || ''
    }, announce);

    if (built?.file) {
        const inject = () => {
            if (!fillKgTorrentLegacy(built.file)) {
                console.warn('[Auto-Feed][KG] Legacy input[name=file] inject failed:', built?.filename || '');
            }
        };
        inject();
        KG_STEP3_RETRY_DELAYS.forEach((ms) => window.setTimeout(inject, ms));
    } else {
        console.warn('[Auto-Feed][KG] No torrent data available for step3 injection.');
    }

    try {
        await GMAdapter.deleteValue('kg_info');
    } catch {}
}

export async function parseKG(_config: SiteConfig, currentUrl: string): Promise<TorrentMeta> {
    let title = $('h1').first().text().trim();
    if (/reqdetails/i.test(currentUrl)) {
        title = title.replace(/\(.*\)|Request for/gi, '').trim();
    }

    const meta: TorrentMeta = {
        title: title || '',
        description: '',
        sourceSite: 'KG',
        sourceUrl: currentUrl,
        images: []
    };

    const tables = $('.main table').toArray() as HTMLTableElement[];
    let table: HTMLTableElement | null = null;
    for (const t of tables) {
        if (t.getElementsByTagName('td').length > 8) {
            table = t;
            break;
        }
    }
    if (!table && tables.length) table = tables[0];

    let imgsStr = '';
    if (table) {
        const tds = Array.from(table.getElementsByTagName('td'));
        for (let i = 0; i < tds.length; i++) {
            const key = (tds[i].textContent || '').trim();
            const next = tds[i + 1] as HTMLElement | undefined;
            if (!key || !next) continue;

            if (key === 'Internet Link' || key === 'IMDB') {
                const u = (next.textContent || '').trim();
                if (u) {
                    meta.imdbUrl = ensureTrailingSlash(u);
                    meta.imdbId = extractImdbId(meta.imdbUrl);
                }
            } else if (key === 'Type') {
                const v = (next.textContent || '').trim();
                if (/movie/i.test(v)) meta.type = '电影';
                else if (/music/i.test(v)) meta.type = '音乐';
            } else if (key === 'Description') {
                const imgs = Array.from(next.getElementsByTagName('img'));
                imgs.forEach((img) => {
                    const src = img.getAttribute('src') || '';
                    if (!src) return;
                    meta.images.push(src);
                    imgsStr += `[img]${src}[/img]`;
                });
            } else if (key === 'Rip Specs') {
                try {
                    const a = next.getElementsByTagName('a')[0];
                    const t = (a?.textContent || '').trim();
                    if (t) meta.title = t;
                    const mi = next.getElementsByClassName('mediainfo')[0] as HTMLElement | undefined;
                    const text = (mi?.textContent || next.textContent || '').trim();
                    if (text) meta.description = `[quote]${text}[/quote]\n\n${imgsStr}`;
                } catch {
                    const h = $('h1').first().text().trim();
                    if (h.includes('-')) meta.title = h.split('-').pop()?.trim() || meta.title;
                    const text = (next.textContent || '').trim();
                    if (text) meta.description = `[quote]${text}[/quote]\n\n${imgsStr}`;
                }
            } else if (key === 'Source') {
                const v = (next.textContent || '').trim();
                let m = getMediumSel(v, meta.title);
                if (v === 'WEB') m = 'WEB-DL';
                if (m) meta.mediumSel = m;
            }
        }
    }

    try {
        const href = $('a[href*="/down.php/"]').first().attr('href') || '';
        if (href) meta.torrentUrl = new URL(href, 'https://karagarga.in/').href;
    } catch {}

    if (!meta.description) meta.description = imgsStr;
    if (!meta.title) meta.title = title;

    return meta;
}

export async function fillKG(meta: TorrentMeta, config: SiteConfig): Promise<void> {
    const step = getKgStep();
    const workingMeta = meta;
    const baseImdbUrl = workingMeta.imdbUrl || (workingMeta.imdbId ? `https://www.imdb.com/title/${workingMeta.imdbId}/` : '');
    const title = workingMeta.title || '';

    if (step === 1) {
        const input =
            (document.querySelector('input[name="title"]') as HTMLInputElement | null) ||
            (document.querySelector('input#title') as HTMLInputElement | null);
        if (input) setFormValue(input, String(baseImdbUrl || title || ''));
        void config;
        return;
    }

    if (step === 2 || step === 0) {
        await fillKgStep2(workingMeta, title, baseImdbUrl);
        void config;
        return;
    }

    if (step === 3) {
        await fillKgStep3(workingMeta);
        void config;
    }
}
