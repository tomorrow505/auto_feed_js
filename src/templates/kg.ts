import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { extractImdbId } from '../common/rules/links';
import { getMediumSel } from '../common/rules/text';

function ensureTrailingSlash(url: string): string {
    if (!url) return url;
    return url.endsWith('/') ? url : `${url}/`;
}

export async function parseKG(_config: SiteConfig, currentUrl: string): Promise<TorrentMeta> {
    // Karagarga is not Nexus/Gazelle/Unit3D; keep this parser intentionally simple and robust.
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

    // Find the "main" details table (legacy heuristic: first table in `.main` with enough columns).
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
                    // Fallback: use page title tail and whatever text we can see.
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

    // Torrent download link.
    try {
        const href = $('a[href*="/down.php/"]').first().attr('href') || '';
        if (href) meta.torrentUrl = new URL(href, 'https://karagarga.in/').href;
    } catch { }

    if (!meta.description) meta.description = imgsStr;
    if (!meta.title) meta.title = title;

    return meta;
}

export async function fillKG(meta: TorrentMeta, config: SiteConfig): Promise<void> {
    // Best-effort: KG upload form fields have varied over time; we fill common names only.
    const setVal = (el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null | undefined, val: string) => {
        if (!el) return;
        (el as any).value = val;
        try {
            el.dispatchEvent(new Event('input', { bubbles: true }));
            el.dispatchEvent(new Event('change', { bubbles: true }));
        } catch { }
    };

    const title = meta.title || '';
    const descr = meta.description || '';
    const imdbUrl = meta.imdbUrl || (meta.imdbId ? `https://www.imdb.com/title/${meta.imdbId}/` : '');

    const titleInput =
        (document.querySelector('input[name="name"]') as HTMLInputElement | null) ||
        (document.querySelector('input[name="title"]') as HTMLInputElement | null) ||
        (document.querySelector('input#name') as HTMLInputElement | null) ||
        (document.querySelector('input#title') as HTMLInputElement | null);
    setVal(titleInput, title);

    const textareas = Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];
    const descrBox =
        (document.querySelector('textarea[name="descr"]') as HTMLTextAreaElement | null) ||
        (document.querySelector('textarea[name="description"]') as HTMLTextAreaElement | null) ||
        (document.querySelector('textarea[name="rip_specs"]') as HTMLTextAreaElement | null) ||
        (textareas.length ? textareas[0] : null);
    setVal(descrBox, descr);

    // IMDb / Internet link fields
    if (imdbUrl) {
        const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="url"]')) as HTMLInputElement[];
        inputs.forEach((i) => {
            const n = (i.name || '').toLowerCase();
            if (!n) return;
            if (n.includes('imdb') || n.includes('internet') || (n.includes('link') && !n.includes('rss'))) {
                if (!i.value) setVal(i, imdbUrl);
            }
        });
    }

    // Torrent file injection (if we have content)
    if (meta.torrentBase64 && meta.torrentFilename) {
        const fileInput =
            (document.querySelector('input[type="file"]#torrent') as HTMLInputElement | null) ||
            (document.querySelector('input[type="file"][name="torrent"]') as HTMLInputElement | null) ||
            (document.querySelector('input[type="file"]') as HTMLInputElement | null);
        if (fileInput) {
            try {
                const { TorrentService } = await import('../services/TorrentService');
                const file = TorrentService.base64ToFile(meta.torrentBase64, meta.torrentFilename);
                TorrentService.injectFileIntoInput(fileInput, file);
            } catch (e) {
                console.error('[Auto-Feed][KG] File Injection Failed:', e);
            }
        }
    }

    // Silence unused warning for now: keep signature consistent with other fill templates.
    void config;
}
