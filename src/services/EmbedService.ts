import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { AppSettings } from './SettingsService';
import { SiteCatalogService, isChineseNexusSite } from './SiteCatalogService';
import { ForwardLinkService } from './ForwardLinkService';
import { QuickLinkService } from './QuickLinkService';
import { StorageService } from './StorageService';
import { extractDoubanId, extractImdbId } from '../common/rules/links';
import { renderQuickSearchHtml, resolveQuickSearchSetting } from '../common/quickSearch';

type InsertPoint =
    | { kind: 'after-tr'; afterTr: HTMLTableRowElement; colSpan: number; layout?: 'full-width' | 'two-col' }
    | { kind: 'table-body'; tableBody: HTMLTableSectionElement; leftClass?: string; rowClass?: string; layout?: 'full-width' | 'two-col'; colSpan?: number }
    | { kind: 'mteam-descriptions'; tableBody: HTMLTableSectionElement }
    | { kind: 'append'; container: HTMLElement };

function getColSpanForRow(tr: HTMLTableRowElement): number {
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

function makeTr(colSpan: number, id?: string) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = Math.max(1, colSpan || 1);
    if (id) td.id = id;
    tr.appendChild(td);
    return { tr, td };
}

function makeTwoColTr(leftText: string, leftClass: string, rightId: string) {
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

function detectNexusLeftCellClass(table: HTMLTableElement): string {
    // Reuse existing "rowhead/colhead/detailsleft" class to match the site's table style.
    const td = table.querySelector('td.rowhead, td.colhead, td.detailsleft, td.header, td.label') as HTMLTableCellElement | null;
    return td?.className || 'rowhead';
}

function findNexusAnchorRow(table: HTMLTableElement): HTMLTableRowElement | null {
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

function scoreNexusDetailsTable(t: HTMLTableElement): number {
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

function isActionLabelRow(tr: HTMLTableRowElement): boolean {
    const first = tr.querySelector('td,th') as HTMLElement | null;
    const t = (first?.textContent || '').trim();
    return /^(行为|操作|Action|Actions)\b/i.test(t);
}

function isLikelyNexusDetailsTable(t: HTMLTableElement): boolean {
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

function getNexusFirstCellText(tr: HTMLTableRowElement | null): string {
    try {
        const first = tr?.querySelector('td,th') as HTMLElement | null;
        return (first?.textContent || '').trim();
    } catch {
        return '';
    }
}

function findNexusDetailsTableByDownloadLink(): HTMLTableElement | null {
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

function findBestNexusActionRow(): HTMLTableRowElement | null {
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

function resolveFaviconUrl(siteName: string, settings: AppSettings): string {
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

function openSettingsPanel() {
    try {
        window.dispatchEvent(new CustomEvent('autofeed:open-settings'));
    } catch {
        // Fallback: user can still use Alt+S.
        alert('打开设置失败，请使用 Alt+S 打开设置面板。');
    }
}

function findPTPDetailsContainer(torrentId: string): HTMLElement | null {
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

function findPTPDetailsTable(torrentId: string): HTMLTableElement | null {
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

export class EmbedService {
    private static ensureInjectedStyle() {
        const styleId = 'autofeed-embed-style';
        if (document.getElementById(styleId)) return;
        const style = document.createElement('style');
        style.id = styleId;
        style.type = 'text/css';
        style.appendChild(document.createTextNode(`
            .round_icon{ width: 12px; height: 12px; border-radius: 90%; margin-right: 2px; vertical-align: -2px; }
            #douban_button { outline: none; }
            .autofeed-search-links a.disabled { pointer-events: none; opacity: 0.55; }
            [data-autofeed-embed-root="1"] a { text-decoration: none; }
        `));
        (document.head || document.documentElement).appendChild(style);
    }

    static removeExisting(scopeKey: string) {
        // Remove only blocks created by this service.
        document.querySelectorAll(`[data-autofeed-embed="${scopeKey}"]`).forEach((n) => n.remove());
    }

    static async inject(adapter: BaseEngine, meta: TorrentMeta, settings: AppSettings) {
        this.ensureInjectedStyle();

        const scopeKey = this.getScopeKey(adapter);
        this.removeExisting(scopeKey);

        // PTP is highly dynamic; install a reinjector early so we can recover if the expanded detail
        // container (or its contents) is rendered after our initial pass.
        if (adapter.siteName === 'PTP') {
            this.installPTPReinjector(adapter, meta, settings);
        }

        const insertPoint = this.findInsertPoint(adapter, scopeKey);
        if (!insertPoint) return;

        // Wrapper root marker (helps scoping and cleanup).
        const rootMark = (el: HTMLElement) => {
            el.dataset.autofeedEmbedRoot = '1';
            el.dataset.autofeedEmbed = scopeKey;
        };

        // PTP + Gazelle-like group/list pages: legacy uses full-width rows (colSpan) under the matched torrent row.
        if (insertPoint.kind === 'after-tr' && (insertPoint.layout || 'two-col') === 'full-width') {
            const { afterTr, colSpan } = insertPoint;
            const controls = makeTr(colSpan, 'autofeed_forward_l');
            const links = makeTr(colSpan, 'forward_r');
            // Mark rows for reliable cleanup (removing <td> would leave empty <tr> behind).
            rootMark(controls.tr);
            rootMark(links.tr);

            // Keep spacing similar to legacy.
            controls.td.style.padding = '10px 12px';
            links.td.style.paddingLeft = '12px';
            links.td.style.paddingTop = '10px';
            links.td.style.paddingBottom = '10px';

            afterTr.insertAdjacentElement('afterend', links.tr);
            afterTr.insertAdjacentElement('afterend', controls.tr);

            this.initButtonsForTransfer($(controls.td), adapter.siteName, 1, meta, settings);
            await this.renderForwardRow($(links.td), meta, settings);

            return;
        }

        if (insertPoint.kind === 'mteam-descriptions') {
            // MTeam: inject rows into Ant Design descriptions table (legacy parity).
            const tbody = insertPoint.tableBody;
            const mkRow = (label: string, rightId: string) => {
                const tr = document.createElement('tr');
                tr.className = 'ant-descriptions-row';
                tr.dataset.autofeedEmbed = scopeKey;
                const tdLabel = document.createElement('td');
                tdLabel.className = 'ant-descriptions-item-label';
                tdLabel.textContent = label;
                tdLabel.style.width = '135px';
                tdLabel.style.textAlign = 'right';
                const tdContent = document.createElement('td');
                tdContent.className = 'ant-descriptions-item-content';
                tdContent.id = rightId;
                tr.append(tdLabel, tdContent);
                return { tr, tdContent };
            };
            const r1 = mkRow('转发种子', 'forward_r');
            const r2 = mkRow('豆瓣信息', 'box_right');
            rootMark(r1.tr);
            rootMark(r2.tr);
            // Insert near the top of the details.
            tbody.insertBefore(r2.tr, tbody.firstChild);
            tbody.insertBefore(r1.tr, tbody.firstChild);
            await this.renderForwardRow($(r1.tdContent), meta, settings);
            this.initButtonsForTransfer($(r2.tdContent), adapter.siteName, 0, meta, settings);
            return;
        }

        if (insertPoint.kind === 'table-body') {
            const tbody = insertPoint.tableBody;
            const leftClass = insertPoint.leftClass || '';
            const rowClass = insertPoint.rowClass || '';

            if ((insertPoint.layout || 'two-col') === 'full-width') {
                // Full-width layout (PTP-like): insert 2 rows at the top of tbody.
                const firstTr = tbody.querySelector('tr') as HTMLTableRowElement | null;
                const colSpan = insertPoint.colSpan || (firstTr ? getColSpanForRow(firstTr) : 1);

                const controls = makeTr(colSpan, 'autofeed_forward_l');
                const links = makeTr(colSpan, 'forward_r');
                rootMark(controls.tr);
                rootMark(links.tr);

                controls.td.style.padding = '10px 12px';
                links.td.style.paddingLeft = '12px';
                links.td.style.paddingTop = '10px';
                links.td.style.paddingBottom = '10px';

                // Insert at top: tools first, then links below it (legacy-ish ordering depends on site).
                tbody.insertBefore(links.tr, tbody.firstChild);
                tbody.insertBefore(controls.tr, tbody.firstChild);

                this.initButtonsForTransfer($(controls.td), adapter.siteName, 1, meta, settings);
                await this.renderForwardRow($(links.td), meta, settings);
                return;
            }

            const rowForward = makeTwoColTr('转发种子', leftClass, 'forward_r');
            const rowTools = makeTwoColTr('豆瓣信息', leftClass, 'box_right');
            rootMark(rowForward.tr);
            rootMark(rowTools.tr);
            if (rowClass) {
                rowForward.tr.className = rowClass;
                rowTools.tr.className = rowClass;
            }

            // Allow wrapping in the right cells; some sites default to nowrap.
            try {
                (rowForward.r as HTMLTableCellElement).style.whiteSpace = 'normal';
                (rowForward.r as any).style.overflowWrap = 'anywhere';
                (rowForward.r as any).style.wordBreak = 'break-word';
                (rowTools.r as HTMLTableCellElement).style.whiteSpace = 'normal';
                (rowTools.r as any).style.overflowWrap = 'anywhere';
                (rowTools.r as any).style.wordBreak = 'break-word';

                (rowForward.r as HTMLTableCellElement).style.paddingTop = '10px';
                (rowForward.r as HTMLTableCellElement).style.paddingBottom = '10px';
                (rowForward.r as HTMLTableCellElement).style.paddingLeft = '12px';
                (rowTools.r as HTMLTableCellElement).style.paddingTop = '10px';
                (rowTools.r as HTMLTableCellElement).style.paddingBottom = '10px';
                (rowTools.r as HTMLTableCellElement).style.paddingLeft = '12px';
            } catch {}

            // HDB (hdbits.org): match legacy style by removing borders/padding on the nested #HDB table cells.
            if (adapter.siteName === 'HDB') {
                try {
                    rowForward.l.style.width = '80px';
                    rowTools.l.style.width = '80px';

                    rowForward.l.style.paddingRight = '12px';
                    rowTools.l.style.paddingRight = '12px';
                    rowTools.l.style.paddingTop = '12px';
                    rowTools.l.style.paddingBottom = '12px';

                    rowForward.r.style.paddingTop = '10px';
                    rowForward.r.style.paddingBottom = '12px';
                    rowForward.r.style.paddingLeft = '12px';
                    rowTools.r.style.paddingLeft = '12px';

                    // Strip borders to blend into HDB's details table (legacy behavior).
                    rowForward.l.style.border = 'none';
                    rowForward.r.style.borderTop = 'none';
                    rowForward.r.style.borderBottom = 'none';
                    rowForward.r.style.borderRight = 'none';
                    rowTools.l.style.border = 'none';
                    rowTools.r.style.borderTop = 'none';
                    rowTools.r.style.borderBottom = 'none';
                    rowTools.r.style.borderRight = 'none';
                } catch {}
            }

            // Insert at top (legacy usually uses insertRow(0))
            tbody.insertBefore(rowTools.tr, tbody.firstChild);
            tbody.insertBefore(rowForward.tr, tbody.firstChild);
            await this.renderForwardRow($(rowForward.r), meta, settings);
            this.initButtonsForTransfer($(rowTools.r), adapter.siteName, 0, meta, settings);
            return;
        }

        // Domestic layout parity: "转发种子" row + "豆瓣信息" row (tools/control).
        let hostTable: HTMLTableElement | null = null;
        let insertAfter: HTMLTableRowElement | null = null;
        if (insertPoint.kind === 'after-tr') {
            insertAfter = insertPoint.afterTr;
            hostTable = insertAfter.closest('table');
        }

        // If we can't identify a table style, fall back to appending a block.
        if (!hostTable || !insertAfter) {
            if (insertPoint.kind === 'append') {
                const block = document.createElement('div');
                rootMark(block);
                block.style.margin = '10px 0';
                insertPoint.container.appendChild(block);
                await this.renderForwardRow($(block), meta, settings);
            }
            return;
        }

        const leftClass = detectNexusLeftCellClass(hostTable);

        const rowForward = makeTwoColTr('转发种子', leftClass, 'forward_r');
        const rowTools = makeTwoColTr('豆瓣信息', leftClass, 'box_right');

        rootMark(rowForward.tr);
        rootMark(rowTools.tr);

        // Some sites look nicer with right padding like legacy.
        try {
            // Allow wrapping inside the right cell; some skins default to nowrap.
            (rowForward.r as HTMLTableCellElement).style.whiteSpace = 'normal';
            (rowTools.r as HTMLTableCellElement).style.whiteSpace = 'normal';

            (rowForward.r as HTMLTableCellElement).style.paddingTop = '10px';
            (rowForward.r as HTMLTableCellElement).style.paddingBottom = '10px';
            (rowForward.r as HTMLTableCellElement).style.paddingLeft = '12px';

            (rowTools.r as HTMLTableCellElement).style.paddingTop = '10px';
            (rowTools.r as HTMLTableCellElement).style.paddingBottom = '10px';
            (rowTools.r as HTMLTableCellElement).style.paddingLeft = '12px';
        } catch {}

        // Insert rows after the anchor row.
        insertAfter.insertAdjacentElement('afterend', rowTools.tr);
        insertAfter.insertAdjacentElement('afterend', rowForward.tr);

        await this.renderForwardRow($(rowForward.r), meta, settings);
        this.initButtonsForTransfer($(rowTools.r), adapter.siteName, 0, meta, settings);
    }

    private static installPTPReinjector(adapter: BaseEngine, meta: TorrentMeta, settings: AppSettings) {
        try {
            const u = new URL(window.location.href);
            const tid = (u.searchParams.get('torrentid') || '').trim();
            if (!tid) return;

            const k = `__autofeed_ptp_reinject_${tid}`;
            const w = window as any;
            if (w[k]) return;
            w[k] = true;

            const startedAt = Date.now();
            const maxMs = 5 * 60_000;
            let lastCheck = 0;
            let lastInject = 0;
            const scopeKey = this.getScopeKey(adapter);
            const obs = new MutationObserver(() => {
                const now = Date.now();
                if (now - lastCheck < 250) return;
                lastCheck = now;
                if (Date.now() - startedAt > maxMs) {
                    try { obs.disconnect(); } catch {}
                    return;
                }
                const container = findPTPDetailsContainer(tid);
                if (!container) return;

                // If our UI was removed due to PTP re-rendering the detail container, put it back.
                const hasRoot = !!document.querySelector(`[data-autofeed-embed="${scopeKey}"]`);
                if (hasRoot) return;
                if (now - lastInject < 1500) return;
                lastInject = now;

                // Re-inject on next tick to avoid doing heavy work inside the observer callback.
                setTimeout(() => {
                    EmbedService.inject(adapter, meta, settings).catch(() => {});
                }, 0);
            });
            obs.observe(document.body, { childList: true, subtree: true });
        } catch {
            // ignore
        }
    }

    private static getScopeKey(adapter: BaseEngine) {
        try {
            const u = new URL(window.location.href);
            const tid = u.searchParams.get('torrentid') || '';
            if (tid) return `${adapter.siteName}:${tid}`;
        } catch {}
        return `${adapter.siteName}:page`;
    }

    private static findInsertPoint(adapter: BaseEngine, scopeKey: string): InsertPoint | null {
        // MTeam: Ant Design descriptions table (legacy uses ant-descriptions-row/label/content).
        if (adapter.siteName === 'MTeam') {
            const tbody = document.querySelector('.ant-descriptions-view table tbody') as HTMLTableSectionElement | null;
            if (tbody) return { kind: 'mteam-descriptions', tableBody: tbody };
        }

        // HDB: create nested table like legacy and insert into it.
        if (adapter.siteName === 'HDB') {
            const details = document.getElementById('details') as HTMLElement | null;
            if (!details) return null;
            const existing = document.getElementById('HDB') as HTMLTableElement | null;
            if (existing?.tBodies?.[0]) {
                // Try to match left label cell class from the host details table.
                let leftClass = '';
                try {
                    const hostTable = details as HTMLTableElement;
                    leftClass = detectNexusLeftCellClass(hostTable);
                } catch {}
                return { kind: 'table-body', tableBody: existing.tBodies[0], leftClass };
            }
            const firstTr = details.querySelector('tr') as HTMLTableRowElement | null;
            if (!firstTr) return null;
            const row = document.createElement('tr');
            row.dataset.autofeedEmbed = scopeKey;
            const td = document.createElement('td');
            td.colSpan = Math.max(1, getColSpanForRow(firstTr));
            const table = document.createElement('table');
            table.id = 'HDB';
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            table.style.border = 'none';
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            td.appendChild(table);
            row.appendChild(td);
            firstTr.insertAdjacentElement('afterend', row);
            let leftClass = '';
            try {
                const hostTable = details as HTMLTableElement;
                leftClass = detectNexusLeftCellClass(hostTable);
            } catch {}
            return { kind: 'table-body', tableBody: tbody, leftClass };
        }

        // PTP: insert after the specific torrent row.
        if (adapter.siteName === 'PTP') {
            const u = new URL(window.location.href);
            const tid = u.searchParams.get('torrentid') || '';
            if (tid) {
                // Prefer injecting at the very top of the expanded detail container.
                // PTP can insert/re-render the details row after initial DOM load, which otherwise
                // pushes our rows to the bottom of the mediainfo/screenshot section.
                const container = findPTPDetailsContainer(tid);
                if (container) {
                    const hostId = `autofeed-ptp-host-${tid}`;
                    let host = document.getElementById(hostId) as HTMLElement | null;

                    // If PTP re-rendered the container, our host may be gone; recreate it.
                    if (!host) {
                        const mount =
                            (container.tagName || '').toLowerCase() === 'tr'
                                ? ((container.querySelector('td') as HTMLElement | null) || null)
                                : container;
                        if (mount) {
                            host = document.createElement('div');
                            host.id = hostId;
                            host.dataset.autofeedEmbed = scopeKey;
                            host.style.margin = '10px 0';

                            const table = document.createElement('table');
                            table.style.width = '100%';
                            table.style.borderCollapse = 'collapse';
                            const tbody = document.createElement('tbody');
                            table.appendChild(tbody);
                            host.appendChild(table);

                            mount.insertBefore(host, mount.firstChild);
                        }
                    }

                    const tbody = host?.querySelector('tbody') as HTMLTableSectionElement | null;
                    if (tbody) return { kind: 'table-body', tableBody: tbody, layout: 'full-width', colSpan: 1 };
                }

                // Fallback: if the torrent details table is present, inject inside it.
                const t = findPTPDetailsTable(tid);
                const tbody = t?.tBodies?.[0] as HTMLTableSectionElement | null;
                if (tbody) {
                    const firstTr = tbody.querySelector('tr') as HTMLTableRowElement | null;
                    if (firstTr) return { kind: 'table-body', tableBody: tbody, layout: 'full-width', colSpan: getColSpanForRow(firstTr) };
                }
            }

            // Fallback: inject after the torrent row (may be pushed down when details are inserted after this row).
            const tr =
                (document.getElementById(`torrent_${tid}`) as any) ||
                (document.getElementById(`group_torrent_header_${tid}`) as any);
            const asTr = tr && (tr as Element).tagName?.toLowerCase() === 'tr' ? (tr as HTMLTableRowElement) : null;
            if (!asTr) {
                const q = document.querySelector(`tr#torrent_${CSS.escape(tid)}`) as HTMLTableRowElement | null;
                if (!q) return null;
                return { kind: 'after-tr', afterTr: q, colSpan: getColSpanForRow(q), layout: 'full-width' };
            }
            return { kind: 'after-tr', afterTr: asTr, colSpan: getColSpanForRow(asTr), layout: 'full-width' };
        }

        // Any site with torrentid=...: try to locate the matching torrent row and inject BELOW it.
        // Legacy parity for gazelle/group layouts (RED/OPS/BTN/MTV/TVV/etc).
        try {
            const u = new URL(window.location.href);
            const tid = u.searchParams.get('torrentid') || '';
            if (tid) {
                const tryIds = [
                    `torrent_${tid}`,
                    `torrent${tid}`,
                    `torrent_detail_${tid}`,
                    `torrent-detail-${tid}`
                ];
                for (const id of tryIds) {
                    const el = document.getElementById(id);
                    const tr = el ? (el.closest('tr') as HTMLTableRowElement | null) : null;
                    if (tr) return { kind: 'after-tr', afterTr: tr, colSpan: getColSpanForRow(tr), layout: 'full-width' };
                }
                // Fallback: a[href*="torrentid=tid"]
                const a = document.querySelector(`a[href*="torrentid=${CSS.escape(tid)}"]`) as HTMLAnchorElement | null;
                const tr = a ? (a.closest('tr') as HTMLTableRowElement | null) : null;
                if (tr) return { kind: 'after-tr', afterTr: tr, colSpan: getColSpanForRow(tr), layout: 'full-width' };
            }
        } catch {}

        // Unit3D / Unit3DClassic: legacy uses a standalone table block under torrent buttons.
        // We create a host table and inject as 2-row table.
        const unit3dMenu = document.querySelector('menu.torrent__buttons, .torrent__buttons, menu.form__group--short-horizontal') as HTMLElement | null;
        if (unit3dMenu) {
            const existing = document.getElementById('autofeed-unit3d-host') as HTMLElement | null;
            if (existing) {
                const tb = existing.querySelector('tbody') as HTMLTableSectionElement | null;
                if (tb) return { kind: 'table-body', tableBody: tb, leftClass: '' };
            }
            const host = document.createElement('div');
            host.id = 'autofeed-unit3d-host';
            host.dataset.autofeedEmbed = scopeKey;
            host.style.paddingLeft = '55px';
            host.style.paddingRight = '55px';
            host.style.paddingTop = '10px';
            host.style.paddingBottom = '10px';
            const table = document.createElement('table');
            table.style.width = '100%';
            table.style.borderCollapse = 'collapse';
            const tbody = document.createElement('tbody');
            table.appendChild(tbody);
            host.appendChild(table);
            unit3dMenu.insertAdjacentElement('afterend', host);
            return { kind: 'table-body', tableBody: tbody, leftClass: '' };
        }

        // BHD: legacy inserts around `.table-details tbody`
        if (adapter.siteName === 'BHD') {
            const tbody = document.querySelector('.table-details tbody') as HTMLTableSectionElement | null;
            if (tbody) return { kind: 'table-body', tableBody: tbody, leftClass: '', rowClass: 'dotborder' };
        }

        // Nexus-like sites: inject inside the main details table, under the "行为/Action" row.
        // First, anchor by the "download.php" link's containing details table. This matches legacy behavior best.
        const dlTable = findNexusDetailsTableByDownloadLink();
        if (dlTable) {
            const anchor = findNexusAnchorRow(dlTable);
            if (anchor) return { kind: 'after-tr', afterTr: anchor, colSpan: getColSpanForRow(anchor) };
        }

        const torrentDetails =
            (document.getElementById('torrent_details') as HTMLTableElement | null) ||
            (document.querySelector('table#torrent_details') as HTMLTableElement | null);
        if (torrentDetails) {
            const anchor = findNexusAnchorRow(torrentDetails);
            if (anchor) return { kind: 'after-tr', afterTr: anchor, colSpan: getColSpanForRow(anchor) };
        }

        // Fallback: pick the best action row across all likely detail tables.
        const actionTr = findBestNexusActionRow();
        if (actionTr) return { kind: 'after-tr', afterTr: actionTr, colSpan: getColSpanForRow(actionTr) };

        // Generic Nexus-like fallback: pick the best-scoring details table (avoid header/userbox tables).
        try {
            const candidates = Array.from(document.querySelectorAll('table')) as HTMLTableElement[];
            const filtered = candidates.filter((t) => {
                return isLikelyNexusDetailsTable(t);
            });
            const best = filtered
                .map((t) => ({ t, s: scoreNexusDetailsTable(t) }))
                .sort((a, b) => b.s - a.s)[0];
            if (best && best.s > 10) {
                const anchor = findNexusAnchorRow(best.t);
                // If we can't find an "行为/操作/Action" row, do not inject into a random table.
                if (anchor) return { kind: 'after-tr', afterTr: anchor, colSpan: getColSpanForRow(anchor) };
            }
        } catch {}

        // Fallback: append near the top/title.
        const title = document.getElementById('top') || document.querySelector('h1#top, h1, h2') as HTMLElement | null;
        if (title) return { kind: 'append', container: title.parentElement || document.body };
        return null;
    }

    private static async renderForwardRow(container: JQuery, meta: TorrentMeta, settings: AppSettings) {
        container.empty();

        const enabledSet = new Set(settings.enabledSites || []);
        const supported = SiteCatalogService.getSupportedSites().filter((s) => enabledSet.has(s.name));

        // --- Forward targets (one-line list with favicon, legacy-like) ---
        const forwardLine = document.createElement('div');
        forwardLine.style.whiteSpace = 'normal';
        forwardLine.style.lineHeight = '20px';

        const modeState = { searchMode: 1 }; // 1=upload (default), 0=search (查重)

        const refreshLinksHref = () => {
            const wantUpload = modeState.searchMode === 1;
            container.find('a.forward_a').each((_i, a) => {
                const el = a as HTMLAnchorElement;
                const upload = el.dataset.uploadHref || '#';
                const search = el.dataset.searchHref || '#';
                el.href = wantUpload ? upload : search;
            });
        };

        supported.forEach((site, idx) => {
            if (idx > 0) forwardLine.appendChild(document.createTextNode(' | '));

            const a = document.createElement('a');
            a.className = 'forward_a';
            a.id = site.name;
            a.target = '_blank';

            const iconUrl = resolveFaviconUrl(site.name, settings);
            const icon = document.createElement('img');
            icon.className = 'round_icon';
            icon.src = iconUrl;
            icon.onerror = () => {
                // keep silent; some sites block favicon without cookies.
            };

            const wrap = document.createElement('div');
            wrap.style.display = 'inline-block';
            wrap.style.marginBottom = '2px';
            wrap.append(icon, document.createTextNode(site.name));

            const uploadUrl = ForwardLinkService.getUploadUrl(site, {
                chdBaseUrl: settings.chdBaseUrl,
                tlBaseUrl: settings.tlBaseUrl,
                lang: settings.uiLanguage
            });
            const searchUrl = ForwardLinkService.getSearchUrl(site, meta, {
                chdBaseUrl: settings.chdBaseUrl,
                tlBaseUrl: settings.tlBaseUrl,
                lang: settings.uiLanguage
            });
            a.dataset.uploadHref = uploadUrl;
            a.dataset.searchHref = searchUrl;
            a.href = uploadUrl;
            a.appendChild(wrap);

            // Upload mode: pre-download torrent base64 and save to storage before navigation (legacy-ish reliability).
            a.addEventListener('click', (e) => {
                const isUploadMode = modeState.searchMode === 1;
                if (!isUploadMode) return; // let browser open search link normally

                e.preventDefault();
                e.stopPropagation();

                const baseUploadUrl = a.dataset.uploadHref || a.href;
                let targetUrl = baseUploadUrl;
                const win = window.open('about:blank', '_blank');
                const go = () => {
                    try {
                        if (win) win.location.href = targetUrl;
                        else window.open(targetUrl, '_blank');
                    } catch {
                        window.open(targetUrl, '_blank');
                    }
                };

                (async () => {
                    try {
                        const metaToSave: any = { ...meta };
                        if (metaToSave.torrentUrl && !metaToSave.torrentBase64) {
                            const { TorrentService } = await import('./TorrentService');
                            const base64 = await TorrentService.download(metaToSave.torrentUrl);
                            metaToSave.torrentBase64 = base64;
                        }
                        const token = StorageService.generateHandoffToken();
                        targetUrl = StorageService.attachHandoffToken(baseUploadUrl, token);
                        await StorageService.saveHandoff(metaToSave, token);
                        await StorageService.save(metaToSave);
                    } catch {
                        // best-effort
                    } finally {
                        go();
                    }
                })();
            });

            forwardLine.appendChild(a);
        });

        const modeWrap = document.createElement('span');
        modeWrap.style.marginLeft = '10px';

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.id = 'search_type';
        const label = document.createTextNode('查重');
        check.addEventListener('change', () => {
            modeState.searchMode = check.checked ? 0 : 1;
            refreshLinksHref();
        });
        modeWrap.append(check, label);
        forwardLine.appendChild(modeWrap);

        rootWrap(container).append(forwardLine);

        // --- Tools row (legacy-ish text) ---
        const tools = document.createElement('div');
        tools.style.marginTop = '10px';
        tools.innerHTML = `<font color="green">Tools →</font> `;

        const mkTool = (text: string, title: string, onClick?: () => void, color?: string) => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = text;
            a.title = title;
            if (color) (a.style as any).color = color;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick?.();
            });
            return a;
        };

        const appendTool = (node: HTMLElement) => {
            tools.appendChild(node);
            tools.appendChild(document.createTextNode(' | '));
        };

        // 教程: keep legacy link for now.
        const wiki = document.createElement('a');
        wiki.textContent = '教程';
        wiki.title = 'Github/Gitee 教程';
        wiki.href = 'https://gitee.com/tomorrow505/auto_feed_js/wikis/pages';
        wiki.target = '_blank';
        wiki.style.color = 'red';
        appendTool(wiki);

        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const ptgenLink = document.createElement('a');
        ptgenLink.textContent = 'PTgen';
        ptgenLink.title = '打开 ptgen（IYUU）';
        ptgenLink.href = imdbId ? `https://api.iyuu.cn/ptgen/?imdb=${encodeURIComponent(imdbId)}` : 'https://api.iyuu.cn/ptgen/';
        ptgenLink.target = '_blank';
        appendTool(ptgenLink);

        appendTool(mkTool('提取图片', '打开图片处理弹窗', () => {
            QuickLinkService.openImageToolboxModal(meta, settings.uiLanguage || 'zh').catch((e) => {
                alert(`打开图片处理失败: ${String(e?.message || e)}`);
            });
        }));

        appendTool(mkTool('脚本设置', '打开设置弹窗 (Alt+S)', () => openSettingsPanel()));

        // Trim last separator
        try {
            if (tools.lastChild && tools.lastChild.nodeType === Node.TEXT_NODE) {
                const t = tools.lastChild.textContent || '';
                if (t.trim() === '|') tools.removeChild(tools.lastChild);
            }
        } catch {}
        rootWrap(container).append(tools);

        // --- Quick Search URLs (legacy-like look) ---
        this.addSearchUrls(container, meta, settings);
    }

    private static addSearchUrls(container: JQuery, meta: TorrentMeta, settings: AppSettings) {
        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const quickSearchSetting = resolveQuickSearchSetting(settings);
        const html = renderQuickSearchHtml(
            meta,
            quickSearchSetting.quickSearchList,
            quickSearchSetting.quickSearchPresets,
            {
                lang: quickSearchSetting.lang,
                className: 'autofeed-search-links',
                alignCenter: true,
                bordered: true,
                fontColor: 'red'
            }
        );
        if (!html) return;
        container.append('<br><br>');
        container.append(html);
        // Keep the legacy "no imdb" alert behavior: if none of the generated links has usable params, warn.
        if (!imdbId) {
            container.find('.autofeed-search-links a').on('click', (e) => {
                const href = (e.currentTarget as HTMLAnchorElement).href || '';
                // Best-effort heuristic: block obvious imdb-id searches when imdb is missing.
                if (href.match(/imdb/i) || extractImdbId(href)) {
                    e.preventDefault();
                    alert('当前影视没有IMDB信息！！');
                }
            });
        }
    }

    private static initButtonsForTransfer(container: JQuery, site: string, mode: 0 | 1, meta: TorrentMeta, settings: AppSettings) {
        container.empty();

        // Root marker for cleanup/scoping.
        container.attr('data-autofeed-embed-root', '1');
        try {
            const host = container.get(0) as HTMLElement | undefined;
            if (host) {
                // Some sites style td as nowrap; allow our controls to wrap.
                host.style.whiteSpace = 'normal';
                (host.style as any).overflowWrap = 'anywhere';
                (host.style as any).wordBreak = 'break-word';
            }
        } catch {}

        // imdb/douban input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input';
        input.id = 'input_box';
        input.value = meta.imdbUrl || meta.doubanUrl || '';

        // width rules (legacy)
        if (site === 'PTP') (input.style as any).width = '320px';
        else (input.style as any).width = '280px';
        // Prevent overflow on narrow containers (HDB/NP wrong insert point etc.).
        (input.style as any).maxWidth = '100%';
        (input.style as any).boxSizing = 'border-box';
        container.append(input);

        const searchBtn = document.createElement('input');
        searchBtn.type = 'button';
        searchBtn.id = 'search_button';
        searchBtn.value = '检索名称';
        (searchBtn.style as any).marginLeft = '12px';
        (searchBtn.style as any).marginRight = '4px';
        container.append(searchBtn);

        const enableFetchButton = isChineseNexusSite(site);
        let apiCb: HTMLInputElement | null = null;
        if (enableFetchButton) {
            apiCb = document.createElement('input');
            apiCb.type = 'checkbox';
            apiCb.id = 'douban_api';
            container.append(apiCb);
            container.append(document.createTextNode('API'));
        }

        const ptgenBtn = document.createElement('input');
        ptgenBtn.type = 'button';
        ptgenBtn.id = 'ptgen_button';
        ptgenBtn.value = 'ptgen跳转';
        (ptgenBtn.style as any).marginLeft = '12px';
        container.append(ptgenBtn);

        let fetchBtn: HTMLInputElement | null = null;
        if (enableFetchButton) {
            fetchBtn = document.createElement('input');
            fetchBtn.type = 'button';
            fetchBtn.id = 'douban_button';
            fetchBtn.value = '点击获取';
            (fetchBtn.style as any).marginLeft = '12px';
            container.append(fetchBtn);
        }

        // Optional textarea (legacy toggled by API checkbox)
        const textarea = document.createElement('textarea');
        textarea.id = 'textarea';
        (textarea.style as any).marginTop = '12px';
        (textarea.style as any).height = '120px';
        (textarea.style as any).width = site === 'PTP' ? '675px' : '580px';
        (textarea.style as any).maxWidth = '100%';
        (textarea.style as any).boxSizing = 'border-box';
        (textarea.style as any).display = 'none';
        container.append(textarea);

        if (apiCb) {
            apiCb.addEventListener('click', () => {
                if (apiCb?.checked) $(textarea).slideDown();
                else $(textarea).slideUp();
            });
        }

        const imgBtn = document.createElement('input');
        imgBtn.type = 'button';
        imgBtn.id = 'download_pngs';
        imgBtn.value = '转存截图';
        (imgBtn.style as any).marginLeft = '0px';
        (imgBtn.style as any).paddingLeft = '2px';
        container.append(imgBtn);

        imgBtn.onclick = () => {
            QuickLinkService.openImageToolboxModal(meta, settings.uiLanguage || 'zh').catch((e) => {
                alert(`打开图片处理失败: ${String(e?.message || e)}`);
            });
        };

        // ptgen跳转: open IYUU ptgen with current imdb id if possible
        ptgenBtn.onclick = () => {
            const v = (input.value || '').trim();
            const imdb = extractImdbId(v) || (meta.imdbId || '');
            const url = imdb ? `https://api.iyuu.cn/ptgen/?imdb=${encodeURIComponent(imdb)}` : 'https://api.iyuu.cn/ptgen/';
            window.open(url, '_blank');
        };

        // 点击获取: apply ptgen/douban fetch to meta (best-effort) and persist
        if (fetchBtn) {
            fetchBtn.onclick = async () => {
                try {
                    fetchBtn!.value = '获取中...';
                    const { PtgenService } = await import('./PtgenService');
                    const { SettingsService } = await import('./SettingsService');

                    const cur = { ...meta };
                    const v = (input.value || '').trim();
                    const imdbId = extractImdbId(v);
                    const doubanId = extractDoubanId(v);
                    if (imdbId) {
                        cur.imdbId = imdbId;
                        cur.imdbUrl = `https://www.imdb.com/title/${imdbId}/`;
                    }
                    if (doubanId) {
                        cur.doubanId = doubanId;
                        cur.doubanUrl = `https://movie.douban.com/subject/${doubanId}/`;
                    }

                    // API checkbox only overrides method for this click (legacy-ish feel).
                    const s = await SettingsService.load();
                    const imdbToDoubanMethod = apiCb?.checked ? 0 : (s.imdbToDoubanMethod || 0);
                    const updated = await PtgenService.applyPtgen(cur as any, {
                        imdbToDoubanMethod,
                        ptgenApi: s.ptgenApi ?? 3,
                        doubanCookie: s.doubanCookie || undefined
                    }, { mergeDescription: true, updateSubtitle: true, updateRegion: true, updateIds: true });

                    Object.assign(meta, updated);
                    await StorageService.save(meta);
                    fetchBtn!.value = '获取成功';
                    setTimeout(() => {
                        if (fetchBtn) fetchBtn.value = '点击获取';
                    }, 1200);
                } catch (e: any) {
                    fetchBtn!.value = '获取失败';
                    setTimeout(() => {
                        if (fetchBtn) fetchBtn.value = '点击获取';
                    }, 1200);
                }
            };
        }

        // Styling parity (legacy)
        if (mode === 1) {
            // center align for the PTP-style header row
            (container.get(0) as any).align = 'center';
            $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ border: '1px solid #2F3546', color: '#FFFFFF', backgroundColor: '#2F3546' });
        } else {
            // Unit3D/Nexus dark theme friendly
            $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ border: '1px solid #0D8ED9', color: '#FFFFFF', backgroundColor: '#292929' });
        }

        // Dark input/textarea for these sites (legacy list subset)
        if (['PTP', 'BLU', 'Tik', 'Audiences', 'HDSky', 'PTer', 'CMCT', 'CHDBits', 'KG'].includes(site)) {
            textarea.style.backgroundColor = '#4d5656';
            textarea.style.color = 'white';
            input.style.backgroundColor = '#4d5656';
            input.style.color = 'white';
        }
    }
}

function rootWrap(container: JQuery) {
    // Ensure a stable wrapper node for appends and styling markers.
    const el = container.get(0) as HTMLElement | undefined;
    if (!el) return container;
    el.dataset.autofeedEmbedRoot = '1';
    return container;
}
