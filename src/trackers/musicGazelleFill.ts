import { TorrentMeta } from '../types/TorrentMeta';
import { TorrentService } from '../services/TorrentService';

type MusicDomInfo = {
    musicName?: string;
    musicAuthor?: string;
    musicType?: string[] | string;
};

function parseOriginalDom(meta: TorrentMeta): MusicDomInfo {
    try {
        const obj = JSON.parse(meta.originalDom || '{}') as MusicDomInfo;
        return obj || {};
    } catch {
        return {};
    }
}

function norm(s: string): string {
    return (s || '').replace(/\*/g, '').replace(/–/g, '-').replace(/\s+/g, ' ').trim();
}

function pickReleaseTypeKeyword(meta: TorrentMeta): string {
    const text = `${meta.title || ''} ${meta.smallDescr || ''} ${meta.subtitle || ''} ${meta.editionInfo || ''}`.toLowerCase();
    if (/\bsingle\b/.test(text)) return 'single';
    if (/\bep\b/.test(text)) return 'ep';
    if (/compilation/.test(text)) return 'compilation';
    if (/soundtrack|ost|原声/.test(text)) return 'soundtrack';
    if (/live/.test(text)) return 'live';
    if (/remix/.test(text)) return 'remix';
    if (/bootleg/.test(text)) return 'bootleg';
    if (/demo/.test(text)) return 'demo';
    if (/mixtape/.test(text)) return 'mixtape';
    if (/dj mix/.test(text)) return 'dj mix';
    if (/interview/.test(text)) return 'interview';
    return 'album';
}

function deriveFormatBitrateMedia(meta: TorrentMeta): { format: string; bitrate: string; media: string } {
    const blob = `${meta.smallDescr || ''} ${meta.subtitle || ''} ${meta.editionInfo || ''} ${meta.tracklist || ''} ${meta.description || ''}`.toLowerCase();

    let format = '';
    if (/\bflac\b/.test(blob)) format = 'FLAC';
    else if (/\bmp3\b/.test(blob)) format = 'MP3';
    else if (/\baac\b/.test(blob)) format = 'AAC';
    else if (/\bopus\b/.test(blob)) format = 'Opus';
    else if (/\bvorbis\b/.test(blob)) format = 'Vorbis';
    else if (/\bac3\b/.test(blob)) format = 'AC3';
    else if (/\bdts\b/.test(blob)) format = 'DTS';
    else if (/\bwav\b/.test(blob)) format = 'WAV';

    let bitrate = '';
    if (/24bit\s*lossless/.test(blob)) bitrate = '24bit Lossless';
    else if (/lossless/.test(blob)) bitrate = 'Lossless';
    else if (/\b320\b/.test(blob)) bitrate = '320';
    else if (/\b256\b/.test(blob)) bitrate = '256';
    else if (/\b192\b/.test(blob)) bitrate = '192';
    else if (/\b160\b/.test(blob)) bitrate = '160';
    else if (/\b128\b/.test(blob)) bitrate = '128';
    else if (/\b96\b/.test(blob)) bitrate = '96';
    else if (/\b64\b/.test(blob)) bitrate = '64';
    else if (/\bvbr\b/.test(blob)) bitrate = 'V0 (VBR)';

    let media = '';
    if (/\bcd\b|hdcd|lpcd|sacd|srcd|hqcd|xrcd|shm-cd/.test(blob)) media = 'CD';
    else if (/\bweb\b|web[- ]?rip|web[- ]?dl/.test(blob)) media = 'WEB';
    else if (/dvd/.test(blob)) media = 'DVD';
    else if (/vinyl/.test(blob)) media = 'Vinyl';
    else if (/blu[- ]?ray|bd\b/.test(blob)) media = 'Blu-Ray';

    return { format, bitrate, media };
}

function pickOptionByText(select: HTMLSelectElement | null, preferredValue: string, hint: string) {
    if (!select) return;
    const cur = (select.value || '').trim();
    if (cur && cur !== '---') return;

    if (preferredValue) {
        const byValue = Array.from(select.options).find((o) => (o.value || '').toLowerCase() === preferredValue.toLowerCase());
        if (byValue) {
            select.value = byValue.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
        const byText = Array.from(select.options).find((o) => (o.textContent || '').toLowerCase() === preferredValue.toLowerCase());
        if (byText) {
            select.value = byText.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
            return;
        }
    }

    const h = (hint || '').toLowerCase();
    if (!h) return;
    for (const o of Array.from(select.options)) {
        const t = (o.textContent || '').toLowerCase();
        if (!t || t === '---') continue;
        if (h.includes(t)) {
            select.value = o.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            select.dispatchEvent(new Event('input', { bubbles: true }));
            break;
        }
    }
}

function setInput(selector: string, value: string, opts?: { force?: boolean; native?: boolean }) {
    if (!value) return;
    const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
    if (!el) return;
    const cur = (el.value || '').trim();
    if (!opts?.force && cur) return;

    if (opts?.native && el instanceof HTMLInputElement) {
        try {
            const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
            if (setter) setter.call(el, value);
            else el.value = value;
        } catch {
            el.value = value;
        }
    } else {
        el.value = value;
    }

    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
}

function buildDescription(meta: TorrentMeta): { albumDesc: string; releaseDesc: string } {
    const raw = meta.description || '';
    const albumDesc = raw
        .replace(/^\s*\[img\][\s\S]*?\[\/img\]\s*/i, '')
        .replace(/\[quote=Tracklist\]/ig, '[quote]')
        .trim();
    return { albumDesc, releaseDesc: raw.trim() };
}

async function fillTorrentFile(meta: TorrentMeta, forwardSite: string) {
    if (!meta.torrentBase64 && !meta.torrentUrl) return;
    try {
        const announce = (document.querySelector('input[value*="announce"]') as HTMLInputElement | null)?.value || null;
        const result = await TorrentService.buildForwardTorrentFile(meta, forwardSite, announce);
        if (!result) return;

        // Prefer site-specific injector first.
        if (TorrentService.injectTorrentForSite(forwardSite, result.file, result.filename)) return;

        const fileInput =
            (document.querySelector('input[name="file_input"]') as HTMLInputElement | null) ||
            (document.querySelector('input[name="file"]') as HTMLInputElement | null) ||
            (document.querySelector('input[type="file"]') as HTMLInputElement | null);
        if (fileInput) TorrentService.injectFileIntoInput(fileInput, result.file);

        // Some Gazelle pages need a follow-up change event on #file.
        const trigger = document.getElementById('file') as HTMLInputElement | null;
        if (trigger) {
            trigger.dispatchEvent(new Event('change', { bubbles: true }));
            trigger.dispatchEvent(new Event('input', { bubbles: true }));
        }
    } catch (e) {
        console.error('[Auto-Feed] Music gazelle torrent injection failed:', e);
    }
}

export async function fillMusicGazelleUpload(meta: TorrentMeta, forwardSite: 'RED' | 'OPS' | 'DIC') {
    const domInfo = parseOriginalDom(meta);
    const title = norm(meta.title || '');
    const musicName = norm(String(domInfo.musicName || ''));
    const musicAuthor = norm(String(domInfo.musicAuthor || ''));
    const year =
        (meta.editionInfo || '').match(/(19|20)\d{2}/)?.[0] ||
        (meta.smallDescr || meta.subtitle || '').match(/(19|20)\d{2}/)?.[0] ||
        title.match(/(19|20)\d{2}/)?.[0] ||
        '';
    const { format, bitrate, media } = deriveFormatBitrateMedia(meta);
    const { albumDesc, releaseDesc } = buildDescription(meta);

    const tagsFromDom = Array.isArray(domInfo.musicType)
        ? domInfo.musicType
        : (typeof domInfo.musicType === 'string' ? domInfo.musicType.split(',') : []);
    const tagsText = tagsFromDom.map((x) => norm(String(x))).filter(Boolean).join(', ');

    const fallbackName = (() => {
        const t = title.replace(/\[(.*?)\]/g, '').trim();
        if (musicName) return musicName;
        const p = t.split('-').map((x) => x.trim()).filter(Boolean);
        return p.length > 1 ? p.slice(1).join(' - ') : t;
    })();
    const fallbackArtist = (() => {
        if (musicAuthor) return musicAuthor;
        const p = title.split('-').map((x) => x.trim()).filter(Boolean);
        return p.length > 1 ? p[0] : '';
    })();

    const retry = (fn: () => void, times = 16, delayMs = 280) => {
        let i = 0;
        const tick = () => {
            i += 1;
            try { fn(); } catch { }
            if (i < times) setTimeout(tick, delayMs);
        };
        tick();
    };

    retry(() => {
        // Artist/title/year core
        setInput('#artist, input[name="artist"], input[name="artists[]"], #artist_0', fallbackArtist, { native: true });
        setInput('#title, input[name="title"]', fallbackName, { native: true, force: true });
        setInput('#year, input[name="year"]', year, { native: true });

        // Optional artist roles on RED/OPS forms.
        const importance = document.querySelector('td#artistfields #importance, select[name="importance[]"], #importance') as HTMLSelectElement | null;
        if (importance && (!importance.value || importance.value === '---')) {
            importance.selectedIndex = 0;
            importance.dispatchEvent(new Event('change', { bubbles: true }));
            importance.dispatchEvent(new Event('input', { bubbles: true }));
        }

        // Releasetype + format/bitrate/media
        const rt = document.querySelector('#releasetype, select[name="releasetype"]') as HTMLSelectElement | null;
        pickOptionByText(rt, '', pickReleaseTypeKeyword(meta));
        pickOptionByText(document.querySelector('#format, select[name="format"]') as HTMLSelectElement | null, format, `${format} ${meta.smallDescr || ''}`);
        pickOptionByText(document.querySelector('#bitrate, select[name="bitrate"]') as HTMLSelectElement | null, bitrate, `${bitrate} ${meta.smallDescr || ''}`);
        pickOptionByText(document.querySelector('#media, select[name="media"]') as HTMLSelectElement | null, media, `${media} ${meta.editionInfo || ''}`);

        // Tags / image / descriptions
        setInput('#tags, input[name="tags"]', tagsText, { native: true });
        setInput('#image, input[name="image"]', (meta.images && meta.images[0]) || '', { native: true });
        setInput('#album_desc, textarea[name="album_desc"]', albumDesc);
        setInput('#release_desc, textarea[name="release_desc"]', releaseDesc);

        // Tracklist helper: if release desc is empty, put tracklist as fallback.
        if (!releaseDesc && meta.tracklist) {
            setInput('#release_desc, textarea[name="release_desc"]', `[quote=Tracklist]\n${meta.tracklist}\n[/quote]`);
        }
    });

    await fillTorrentFile(meta, forwardSite);
}
