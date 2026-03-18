import { TorrentMeta } from '../../types/TorrentMeta';
import { AppSettings } from '../SettingsService';
import { SiteCatalogService } from '../SiteCatalogService';

export type InsertPoint =
    | { kind: 'after-tr'; afterTr: HTMLTableRowElement; colSpan: number; layout?: 'full-width' | 'two-col' }
    | { kind: 'table-body'; tableBody: HTMLTableSectionElement; leftClass?: string; rowClass?: string; layout?: 'full-width' | 'two-col'; colSpan?: number }
    | { kind: 'mteam-descriptions'; tableBody: HTMLTableSectionElement }
    | { kind: 'append'; container: HTMLElement };

export function getColSpanForRow(tr: HTMLTableRowElement): number {
    try {
        const tds = Array.from(tr.querySelectorAll('td,th')) as Array<HTMLTableCellElement>;
        if (!tds.length) return 1;
        // Prefer first cell's colspan if it spans full width.
        const first = tds[0];
        const cs = Number(first.getAttribute('colspan') || '0');
        if (cs > 0) return cs;
        return tds.length;
    } catch {
        return 1;
    }
}

export function makeTr(colSpan: number, id?: string) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = Math.max(1, colSpan || 1);
    if (id) td.id = id;
    tr.appendChild(td);
    return { tr, td };
}

export function makeTwoColTr(leftText: string, leftClass: string, rightId: string) {
    const tr = document.createElement('tr');
    const l = document.createElement('td');
    const r = document.createElement('td');
    l.textContent = leftText;
    if (leftClass) l.className = leftClass;
    l.style.fontWeight = 'bold';
    l.style.verticalAlign = 'top';
    r.id = rightId;
    tr.append(l, r);
    return { tr, l, r };
}

export function detectNexusLeftCellClass(table: HTMLTableElement): string {
    // Reuse existing "rowhead/colhead/detailsleft" class to match the site's table style.
    const td = table.querySelector('td.rowhead, td.colhead, td.detailsleft, td.header, td.label') as HTMLTableCellElement | null;
    return td?.className || 'rowhead';
}

export function findNexusAnchorRow(table: HTMLTableElement): HTMLTableRowElement | null {
    const rows = Array.from(table.querySelectorAll('tr')) as HTMLTableRowElement[];
    const pick = (re: RegExp) =>
        rows.find((tr) => {
            const first = tr.querySelector('td,th') as HTMLElement | null;
            const t = (first?.textContent || tr.textContent || '').trim();
            return re.test(t);
        }) || null;
    // Prefer injecting under "行为/Action" (user expectation + common Nexus layout).
    // Some Nexus skins use "操作" instead of "行为".
    return pick(/^(行为|操作|Action|Actions)\b/i) || pick(/行为|操作|Action|Actions/i) || null;
}

export function scoreNexusDetailsTable(t: HTMLTableElement): number {
    try {
        const text = (t.textContent || '').toLowerCase();
        const rows = t.querySelectorAll('tr').length;
        let s = Math.min(rows, 40);
        if (t.id === 'torrent_details') s += 50;
        if (t.querySelector('a[href*="download.php"], a[href*="download"]')) s += 20;
        if (text.includes('行为') || text.includes('操作') || text.includes('action')) s += 30;
        if (text.includes('基本信息') || text.includes('description') || text.includes('简介')) s += 10;
        if (text.includes('下载链接') || text.includes('download link')) s += 20;
        if (text.includes('副标题') || text.includes('subtitle')) s += 10;
        if (text.includes('字幕') || text.includes('subtitles')) s += 5;
        // Penalize tiny header boxes / sidebars.
        if (rows <= 3) s -= 40;
        // Prefer wider/center details tables over small right-top boxes.
        try {
            const rect = t.getBoundingClientRect();
            if (rect.width >= 700) s += 20;
            else if (rect.width >= 500) s += 10;
        } catch {}
        // Penalize common header/menu containers if present.
        if (t.closest('#header, #menu, .header, .menu, #top')) s -= 30;
        return s;
    } catch {
        return -999;
    }
}

export function isActionLabelRow(tr: HTMLTableRowElement): boolean {
    const first = tr.querySelector('td,th') as HTMLElement | null;
    const t = (first?.textContent || '').trim();
    return /^(行为|操作|Action|Actions)\b/i.test(t);
}

export function isLikelyNexusDetailsTable(t: HTMLTableElement): boolean {
    try {
        // Must have classic "label" cells and enough rows to be a details table.
        if (!t.querySelector('td.rowhead, td.colhead, td.detailsleft')) return false;
        if (t.querySelectorAll('tr').length < 6) return false;
        // Avoid matching our injected tables.
        if (t.closest('[data-autofeed-embed]')) return false;
        // Avoid obvious header/menu tables.
        if (t.closest('#header, #menu, .header, .menu, #top')) return false;
        return true;
    } catch {
        return false;
    }
}

export function getNexusFirstCellText(tr: HTMLTableRowElement | null): string {
    try {
        const first = tr?.querySelector('td,th') as HTMLElement | null;
        return (first?.textContent || '').trim();
    } catch {
        return '';
    }
}

export function findNexusDetailsTableByDownloadLink(): HTMLTableElement | null {
    try {
        const links = Array.from(document.querySelectorAll('a[href*="download.php"]')) as HTMLAnchorElement[];
        let best: { t: HTMLTableElement; s: number } | null = null;

        for (const a of links) {
            if (!a) continue;
            if (a.closest('[data-autofeed-embed]')) continue;

            // Prefer a containing table that looks like Nexus details table.
            let table = a.closest('table') as HTMLTableElement | null;
            if (!table) continue;

            // If it's a nested table without label cells, bubble up to a parent table that has them.
            if (!table.querySelector('td.rowhead, td.colhead, td.detailsleft')) {
                const parent = table.parentElement?.closest('table') as HTMLTableElement | null;
                if (parent) table = parent;
            }
            if (!table) continue;
            if (!isLikelyNexusDetailsTable(table)) continue;

            let s = scoreNexusDetailsTable(table);

            // Strong hint: the download link row usually has label "下载/Download".
            const tr = a.closest('tr') as HTMLTableRowElement | null;
            const label = getNexusFirstCellText(tr);
            if (/^(下载|Download)\b/i.test(label)) s += 50;

            // Bonus for common torrent detail labels.
            const text = (table.textContent || '').toLowerCase();
            if (text.includes('基本信息') || text.includes('description') || text.includes('简介')) s += 10;
            if (text.includes('副标题') || text.includes('tagline') || text.includes('small description')) s += 5;
            if (text.includes('字幕') || text.includes('subtitles')) s += 5;
            if (text.includes('豆瓣') || text.includes('imdb')) s += 5;

            if (!best || s > best.s) best = { t: table, s };
        }

        return best?.t || null;
    } catch {
        return null;
    }
}

export function findBestNexusActionRow(): HTMLTableRowElement | null {
    try {
        const trs = Array.from(document.querySelectorAll('tr')) as HTMLTableRowElement[];
        const hits = trs
            .filter((tr) => isActionLabelRow(tr))
            .map((tr) => {
                const table = tr.closest('table') as HTMLTableElement | null;
                if (!table) return null;
                if (!isLikelyNexusDetailsTable(table)) return null;
                const s = scoreNexusDetailsTable(table);
                return { tr, s };
            })
            .filter(Boolean) as Array<{ tr: HTMLTableRowElement; s: number }>;
        hits.sort((a, b) => b.s - a.s);
        return hits[0]?.tr || null;
    } catch {
        return null;
    }
}

export function resolveFaviconUrl(siteName: string, settings: AppSettings): string {
    const site = SiteCatalogService.getSupportedSites().find((s) => s.name === siteName);
    if (!site) return '';
    // CHDBits/TL base URL is user-configurable.
    const base =
        site.name === 'CHDBits'
            ? (settings.chdBaseUrl || site.baseUrl)
            : site.name === 'TorrentLeech' || site.name === 'TL'
                ? (settings.tlBaseUrl || site.baseUrl)
                : site.baseUrl;
    if (!base) return '';
    const normalized = base.endsWith('/') ? base : `${base}/`;
    return `${normalized}favicon.ico`;
}

export function getForwardWarnings(siteName: string, meta: TorrentMeta): string[] {
    const warnings: string[] = [];
    const blob = `${meta.title || ''}\n${meta.smallDescr || ''}\n${meta.description || ''}`;

    if (siteName === 'KG') {
        if (meta.standardSel === '4K' || /\b(?:4K|2160p)\b/i.test(blob)) {
            warnings.push('KG 不允许 4K / 2160p 资源。');
        }
        if (meta.mediumSel === 'Remux' || /\bREMUX\b/i.test(blob)) {
            warnings.push('KG 不允许 Remux 资源。');
        }
    }

    return warnings;
}

export function buildKgLegacyInfo(meta: TorrentMeta) {
    const imdbUrl = meta.imdbUrl || (meta.imdbId ? `https://www.imdb.com/title/${meta.imdbId}/` : '');
    return {
        name: meta.title || '',
        url: imdbUrl,
        descr: String(meta.description || '').replace(/\u00a0/g, ' '),
        full_mediainfo: String(meta.fullMediaInfo || '').replace(/\u00a0/g, ' '),
        torrent_url: meta.torrentUrl || '',
        torrent_name: meta.torrentFilename || meta.torrentName || meta.title || 'autofeed',
        medium_sel: meta.mediumSel || '',
        standard_sel: meta.standardSel || '',
        audiocodec_sel: meta.audioCodecSel || '',
        source_sel: meta.sourceSel || ''
    };
}

export function openSettingsPanel() {
    try {
        window.dispatchEvent(new CustomEvent('autofeed:open-settings'));
    } catch {
        // Fallback: user can still use Alt+S.
        alert('打开设置失败，请使用 Alt+S 打开设置面板。');
    }
}

export function findPTPDetailsContainer(torrentId: string): HTMLElement | null {
    try {
        const tid = (torrentId || '').trim();
        if (!tid) return null;

        // Legacy hint: PTP commonly uses `torrent_detail_<id>` for the expanded detail row/container.
        const direct =
            (document.getElementById(`torrent_detail_${tid}`) as HTMLElement | null) ||
            (document.getElementById(`torrentdetail_${tid}`) as HTMLElement | null);
        if (direct) return direct;

        const anchor =
            (document.getElementById(`torrent_${tid}`) as HTMLElement | null) ||
            (document.getElementById(`group_torrent_header_${tid}`) as HTMLElement | null);
        if (!anchor) return null;

        // Sometimes the expanded detail container itself is `#torrent_<id>` (legacy behavior in some views).
        if (anchor.querySelector('.bbcode-table-guard, blockquote, .torrent_description, .screenshots, table')) {
            return anchor;
        }

        // If `anchor` is the list row, the actual details are usually in the following sibling row.
        const tr =
            (anchor.tagName || '').toLowerCase() === 'tr'
                ? (anchor as any as HTMLTableRowElement)
                : ((anchor.closest('tr') as HTMLTableRowElement | null) || null);
        const next = (tr?.nextElementSibling as HTMLElement | null) || null;
        if (next) {
            if (next.id === `torrent_detail_${tid}`) return next;
            const inner = next.querySelector(`#torrent_detail_${CSS.escape(tid)}`) as HTMLElement | null;
            if (inner) return inner;
            // Heuristic: PTP detail rows typically contain mediainfo/screenshot blocks.
            if (next.querySelector('.bbcode-table-guard, blockquote, .torrent_description, .screenshots')) return next;
        }

        return null;
    } catch {
        return null;
    }
}

export function findPTPDetailsTable(torrentId: string): HTMLTableElement | null {
    try {
        const tid = (torrentId || '').trim();
        if (!tid) return null;

        // IMPORTANT: do not scan the whole document on PTP, otherwise we can accidentally
        // match the main torrent list table (it contains "Uploader/Added/Views" too).
        const container = findPTPDetailsContainer(tid);
        if (!container) return null;

        const candidates = Array.from(container.querySelectorAll('table')) as HTMLTableElement[];
        const scored = candidates
            .filter((t) => {
                if (t.closest('[data-autofeed-embed]')) return false;
                // Avoid the main list table id on PTP.
                if ((t.id || '').toLowerCase() === 'torrent-table') return false;
                const text = (t.textContent || '').toLowerCase();
                // PTP torrent details tables typically include these headings.
                if (!text.includes('uploader')) return false;
                if (!(text.includes('added') || text.includes('views') || text.includes('last seeded'))) return false;
                return true;
            })
            .map((t) => {
                const text = (t.textContent || '').toLowerCase();
                let s = 0;
                if (text.includes('uploader')) s += 80;
                if (text.includes('added')) s += 20;
                if (text.includes('views')) s += 15;
                if (text.includes('last seeded')) s += 20;
                if (text.includes('downloaded')) s += 10;
                if (text.includes('total speed')) s += 10;
                if (text.includes('tags')) s += 5;

                // Prefer wider tables (main content) over side boxes.
                try {
                    const r = t.getBoundingClientRect();
                    if (r.width >= 650) s += 15;
                    else if (r.width >= 500) s += 8;
                } catch {}

                return { t, s };
            })
            .sort((a, b) => b.s - a.s);

        return scored[0]?.t || null;
    } catch {
        return null;
    }
}
