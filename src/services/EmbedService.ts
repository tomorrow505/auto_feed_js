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
import { addSearchUrls, initButtonsForTransfer, renderForwardRow } from './embed/controls';
import {
    type InsertPoint,
    buildKgLegacyInfo,
    detectNexusLeftCellClass,
    findBestNexusActionRow,
    findNexusAnchorRow,
    findNexusDetailsTableByDownloadLink,
    findPTPDetailsContainer,
    findPTPDetailsTable,
    getColSpanForRow,
    getForwardWarnings,
    isLikelyNexusDetailsTable,
    makeTr,
    makeTwoColTr,
    openSettingsPanel,
    resolveFaviconUrl,
    scoreNexusDetailsTable
} from './embed/shared';

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

            initButtonsForTransfer($(controls.td), adapter.siteName, 1, meta, settings);
            await renderForwardRow($(links.td), meta, settings);

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
            await renderForwardRow($(r1.tdContent), meta, settings);
            initButtonsForTransfer($(r2.tdContent), adapter.siteName, 0, meta, settings);
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

                initButtonsForTransfer($(controls.td), adapter.siteName, 1, meta, settings);
                await renderForwardRow($(links.td), meta, settings);
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
            await renderForwardRow($(rowForward.r), meta, settings);
            initButtonsForTransfer($(rowTools.r), adapter.siteName, 0, meta, settings);
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
                await renderForwardRow($(block), meta, settings);
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

        await renderForwardRow($(rowForward.r), meta, settings);
        initButtonsForTransfer($(rowTools.r), adapter.siteName, 0, meta, settings);
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

        // BHD hard fallback: inject under title block to avoid missing dynamic detail tables.
        if (adapter.siteName === 'BHD') {
            const existing = document.getElementById('autofeed-bhd-host') as HTMLElement | null;
            if (existing) {
                const tb = existing.querySelector('tbody') as HTMLTableSectionElement | null;
                if (tb) return { kind: 'table-body', tableBody: tb, leftClass: '', rowClass: 'dotborder' };
            }
            const selectors = [
                '.table-details tbody',
                '#torrent-details table tbody',
                '.table-responsive .table tbody',
                'table.table-details tbody'
            ];
            for (const sel of selectors) {
                const nodes = Array.from(document.querySelectorAll(sel)) as HTMLTableSectionElement[];
                const picked = nodes.find((tb) => {
                    const text = (tb.textContent || '').toLowerCase();
                    return tb.querySelectorAll('tr').length >= 3 && (text.includes('category') || text.includes('type') || text.includes('imdb'));
                });
                if (picked) return { kind: 'table-body', tableBody: picked, leftClass: '', rowClass: 'dotborder' };
            }
            const h1 = document.querySelector('h1.bhd-title-h1, h1') as HTMLElement | null;
            if (h1 && h1.parentElement) {
                const host = document.createElement('div');
                host.id = 'autofeed-bhd-host';
                host.dataset.autofeedEmbed = scopeKey;
                host.style.margin = '12px 0';
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                const tbody = document.createElement('tbody');
                table.appendChild(tbody);
                host.appendChild(table);
                h1.insertAdjacentElement('afterend', host);
                return { kind: 'table-body', tableBody: tbody, leftClass: '', rowClass: 'dotborder' };
            }
            const mount = (document.querySelector('main, #main-content, .container, .content, body') as HTMLElement | null) || document.body;
            if (mount) {
                const host = document.createElement('div');
                host.id = 'autofeed-bhd-host';
                host.dataset.autofeedEmbed = scopeKey;
                host.style.margin = '12px 0';
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                const tbody = document.createElement('tbody');
                table.appendChild(tbody);
                host.appendChild(table);
                mount.insertBefore(host, mount.firstChild);
                return { kind: 'table-body', tableBody: tbody, leftClass: '', rowClass: 'dotborder' };
            }
        }

        // TTG: legacy inserts around "行为/操作/Action" one row ABOVE action row.
        if (adapter.siteName === 'TTG') {
            try {
                const isActionRow = (tr: HTMLTableRowElement) => {
                    const first = tr.querySelector('td,th') as HTMLElement | null;
                    const text = (first?.textContent || '').trim();
                    return /^(行为|行為|操作|Action|Actions|Tools:|小货车)\b/i.test(text);
                };

                const root =
                    (document.querySelector('#kt_d') as HTMLElement | null) ||
                    (document.querySelector('#torrent_details') as HTMLElement | null) ||
                    document.body;

                const scopedRows = Array.from(root.querySelectorAll('tr')) as HTMLTableRowElement[];
                let actionRow = scopedRows.find((tr) => isActionRow(tr)) || null;
                if (!actionRow) {
                    const allRows = Array.from(document.querySelectorAll('tr')) as HTMLTableRowElement[];
                    actionRow = allRows.find((tr) => isActionRow(tr)) || null;
                }
                if (actionRow) {
                    const prev = actionRow.previousElementSibling as HTMLTableRowElement | null;
                    if (prev) {
                        return { kind: 'after-tr', afterTr: prev, colSpan: getColSpanForRow(prev) };
                    }
                    const table = actionRow.closest('table') as HTMLTableElement | null;
                    const tbody = table?.tBodies?.[0] as HTMLTableSectionElement | null;
                    if (tbody) return { kind: 'table-body', tableBody: tbody, leftClass: table ? detectNexusLeftCellClass(table) : '' };
                }
            } catch {}

            // Hard fallback only if legacy action row cannot be found.
            const existing = document.getElementById('autofeed-ttg-host') as HTMLElement | null;
            if (existing) {
                const tb = existing.querySelector('tbody') as HTMLTableSectionElement | null;
                if (tb) return { kind: 'table-body', tableBody: tb, leftClass: '' };
            }
            const kt = document.getElementById('kt_d') as HTMLElement | null;
            if (kt && kt.parentElement) {
                const host = document.createElement('div');
                host.id = 'autofeed-ttg-host';
                host.dataset.autofeedEmbed = scopeKey;
                host.style.margin = '8px 0 12px 0';
                const table = document.createElement('table');
                table.style.width = '100%';
                table.style.borderCollapse = 'collapse';
                const tbody = document.createElement('tbody');
                table.appendChild(tbody);
                host.appendChild(table);
                kt.parentElement.insertBefore(host, kt);
                return { kind: 'table-body', tableBody: tbody, leftClass: '' };
            }
        }

        // KG: legacy inserts into `.main table` row index 1 (inside details table, above comment area).
        if (adapter.siteName === 'KG') {
            try {
                const tables = Array.from(document.querySelectorAll('.main table')) as HTMLTableElement[];
                let target = tables.find((t) => t.getElementsByTagName('td').length > 8) || null;
                if (!target) {
                    target =
                        (document.querySelector('a[href*="/down.php/"]')?.closest('table') as HTMLTableElement | null) ||
                        null;
                }
                if (target) {
                    const first = target.querySelector('tr') as HTMLTableRowElement | null;
                    if (first) return { kind: 'after-tr', afterTr: first, colSpan: getColSpanForRow(first) };
                    const tbody = target.tBodies?.[0] as HTMLTableSectionElement | null;
                    if (tbody) return { kind: 'table-body', tableBody: tbody, leftClass: detectNexusLeftCellClass(target) };
                }
            } catch {}
        }

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
        return renderForwardRow(container, meta, settings);
    }

    private static addSearchUrls(container: JQuery, meta: TorrentMeta, settings: AppSettings) {
        return addSearchUrls(container, meta, settings);
    }

    private static initButtonsForTransfer(container: JQuery, site: string, mode: 0 | 1, meta: TorrentMeta, settings: AppSettings) {
        return initButtonsForTransfer(container, site, mode, meta, settings);
    }
}
