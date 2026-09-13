import $ from 'jquery';
import { SettingsService, RemoteServerConfig } from './SettingsService';
import { SiteRegistry } from '../core/SiteRegistry';
import { TorrentMeta } from '../types/TorrentMeta';
import { GMAdapter } from './GMAdapter';
import { StorageService } from './StorageService';

export type RemoteTestResult = { ok: boolean; message: string };

export class RemoteDownloadService {
    private static normalizePathEntries(path: unknown): Array<{ label: string; path: string }> {
        // Backward compatibility:
        // - legacy string: "D:\\Downloads"
        // - modern map: { "movies": "/data/movies" }
        // - list form: [{label, path}]
        if (!path) return [{ label: 'default', path: '' }];

        if (typeof path === 'string') {
            return [{ label: 'default', path }];
        }

        if (Array.isArray(path)) {
            const out = path
                .map((it: any) => ({
                    label: String(it?.label || '').trim(),
                    path: String(it?.path || '').trim()
                }))
                .filter((it) => it.label || it.path)
                .map((it, idx) => ({
                    label: it.label || `path${idx + 1}`,
                    path: it.path
                }));
            return out.length ? out : [{ label: 'default', path: '' }];
        }

        if (typeof path === 'object') {
            const entries = Object.entries(path as Record<string, unknown>)
                .map(([label, value]) => ({ label: String(label || '').trim(), path: String(value ?? '').trim() }))
                .filter((it) => it.label || it.path)
                .map((it, idx) => ({
                    label: it.label || `path${idx + 1}`,
                    path: it.path
                }));
            return entries.length ? entries : [{ label: 'default', path: '' }];
        }

        return [{ label: 'default', path: '' }];
    }

    private static buildMenuItem(type: 'qb' | 'tr' | 'de', serverName: string, serverUrl: string) {
        const menu = $(`<li class="af-remote-menu-item"></li>`);
        menu.attr('data-server', serverName);
        menu.attr('data-type', type);

        const prefix = type.toUpperCase()[0];
        const link = $(`<a class="af-remote-server-link" target="_blank"></a>`);
        link.attr('href', serverUrl || '#');
        link.text(`${prefix}-${serverName}`);

        const safeId = `${type}-${serverName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const submenu = $(`<ul class="af-remote-submenu" id="autofeed-ul-${safeId}"></ul>`);

        menu.append(link);
        menu.append(submenu);
        return { menu, submenu };
    }

    private static appendPathEntry(
        submenu: JQuery,
        cls: string,
        entry: { label: string; path: string }
    ) {
        const li = $('<li></li>');
        const a = $(`<a href="#" class="af-remote-path-link ${cls}"></a>`);
        a.attr('data-path', entry.path || '');
        a.attr('data-label', entry.label || 'default');
        a.attr('title', entry.path || '(client default)');
        a.html(`${entry.label || 'default'}`);
        li.append(a);
        submenu.append(li);
    }

    static async tryInject() {
        const settings = await SettingsService.load();
        if (!settings.enableRemoteSidebar || !settings.remoteServer) return;
        if (document.getElementById('autofeed-remote-sidebar')) return;

        const engine = SiteRegistry.getEngine(window.location.href);
        if (!engine) return;

        // Keep parity with embedded forward area: only show on strict source-detail pages.
        if (!this.isForwardSourcePage(engine?.siteName || '', window.location.href)) return;
        // For torrentid-based sites, ensure current page and parsed torrent point to the same torrent id.
        const canBind = await this.canBindCurrentTorrent(engine, window.location.href);
        if (!canBind) return;

        this.injectSidebar(settings.remoteServer, engine, {
            skipDefault: !!settings.remoteSkipCheckingDefault,
            askConfirm: !!settings.remoteAskSkipConfirm,
            opacity: Math.min(1, Math.max(0.3, Number(settings.remoteSidebarOpacity ?? 0.92)))
        });
    }

    private static isDetailPage(url: string): boolean {
        let parsed: URL;
        try {
            parsed = new URL(url, window.location.origin);
        } catch {
            return false;
        }
        const path = parsed.pathname || '';
        const qs = parsed.search || '';

        return (
            ((this.isExactPage(path, 'details.php') || this.isExactPage(path, 'detail.php')) && /id=\d+/i.test(qs)) ||
            (this.isExactPage(path, 'torrents.php') && /\btorrentid=\d+/i.test(qs)) ||
            /\/torrents\/\d+(?:\/|$)/i.test(path) ||
            /\/detail\/\d+(?:\/|$)/i.test(path) ||
            /\/t\/\d+(?:\/|$)/i.test(path)
        );
    }

    private static isForwardSourcePage(siteName: string, url: string): boolean {
        let parsed: URL;
        try {
            parsed = new URL(url, window.location.origin);
        } catch {
            return false;
        }
        const path = parsed.pathname || '';
        const qs = parsed.search || '';

        if (siteName === 'TTG') {
            return /\/t\/\d+(?:\/|$)/i.test(path) || (this.isExactPage(path, 'details.php') && /id=\d+/i.test(qs));
        }
        if (siteName === 'PTP' || ['GPW', 'RED', 'OPS', 'DIC'].includes(siteName)) {
            if (siteName === 'PTP') {
                return this.isExactPage(path, 'torrents.php') && (/torrentid=\d+/i.test(qs) || /id=\d+/i.test(qs));
            }
            return this.isExactPage(path, 'torrents.php') && /torrentid=\d+/i.test(qs);
        }
        if (siteName === 'HDB' || siteName === 'CHDBits' || siteName === 'OpenCD') {
            return this.isExactPage(path, 'details.php') && /id=\d+/i.test(qs);
        }
        if (siteName === 'KG') {
            return (this.isExactPage(path, 'details.php') || this.isExactPage(path, 'reqdetails.php')) && /id=\d+/i.test(qs);
        }
        if (siteName === 'BHD') {
            return /\/torrents\/.+/i.test(path) || /\/library\/title\/.+/i.test(path);
        }
        return this.isDetailPage(url);
    }

    private static isExactPage(path: string, pageName: string): boolean {
        return (path || '').split('/').pop()?.toLowerCase() === pageName.toLowerCase();
    }

    private static extractTorrentId(url: string): string {
        return url.match(/[?&]torrentid=(\d+)/i)?.[1] || '';
    }

    private static async canBindCurrentTorrent(engine: any, currentUrl: string): Promise<boolean> {
        const siteName = String(engine?.siteName || '');
        // Only strict-check sites whose detail pages are identified by `torrentid`.
        if (!['PTP', 'GPW', 'RED', 'OPS', 'DIC'].includes(siteName)) return true;
        const currentTid = this.extractTorrentId(currentUrl);
        if (!currentTid) {
            // PTP group page can be `torrents.php?id=...` without explicit `torrentid`.
            if (siteName === 'PTP' && /[?&]id=\d+/i.test(currentUrl)) return true;
            return false;
        }
        try {
            const meta = await engine.parse();
            const torrentUrl = String(meta?.torrentUrl || '');
            if (!torrentUrl) {
                // PTP details can fail parse intermittently; keep sidebar visible when URL itself is a strict detail URL.
                return siteName === 'PTP';
            }
            const parsedTid = this.extractTorrentId(torrentUrl);
            if (!parsedTid) return siteName === 'PTP';
            return parsedTid === currentTid;
        } catch {
            return siteName === 'PTP';
        }
    }

    private static injectSidebar(
        config: RemoteServerConfig,
        engine: any,
        opts: { skipDefault: boolean; askConfirm: boolean; opacity: number }
    ) {
        GMAdapter.xmlHttpRequest; // ensure GM granted
        this.injectStyles();

        $('body').append(`
            <div id="autofeed-remote-sidebar">
                <div class="af-remote-sidebar-header">
                    <span>远程推送</span>
                    <div class="af-remote-download-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="20" viewBox="0,0,256,256">
                            <g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="none" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path transform="scale(5.12,5.12)" d="M50,32c0,4.96484 -4.03516,9 -9,9h-30c-6.06641,0 -11,-4.93359 -11,-11c0,-4.97266 3.32422,-9.30469 8.01563,-10.59375c0.30859,-6.34375 5.56641,-11.40625 11.98438,-11.40625c4.01953,0 7.79688,2.05469 10.03516,5.40625c0.96875,-0.27344 1.94531,-0.40625 2.96484,-0.40625c5.91016,0 10.75,4.6875 10.98828,10.54297c3.52734,1.19141 6.01172,4.625 6.01172,8.45703z" id="strokeMainSVG" fill="#2c3e50" stroke="#2c3e50" stroke-width="2" stroke-linejoin="round"></path><g transform="scale(5.12,5.12)" fill="#ffffff" stroke="none" stroke-width="1" stroke-linejoin="miter"><path d="M43.98828,23.54297c-0.23828,-5.85547 -5.07812,-10.54297 -10.98828,-10.54297c-1.01953,0 -1.99609,0.13281 -2.96484,0.40625c-2.23828,-3.35156 -6.01562,-5.40625 -10.03516,-5.40625c-6.41797,0 -11.67578,5.0625 -11.98437,11.40625c-4.69141,1.28906 -8.01562,5.62109 -8.01562,10.59375c0,6.06641 4.93359,11 11,11h30c4.96484,0 9,-4.03516 9,-9c0,-3.83203 -2.48437,-7.26562 -6.01172,-8.45703zM25,35.41406l-6.70703,-6.70703l1.41406,-1.41406l4.29297,4.29297v-11.58594h2v11.58594l4.29297,-4.29297l1.41406,1.41406z"></path></g></g></g>
                        </svg>
                    </div>
                </div>
                <ul id="autofeed-remote-list"></ul>
                <div id="autofeed-remote-status" style="display:none;"></div>
            </div>
        `);

        // Apply opacity + load draggable position
        const sidebar = document.getElementById('autofeed-remote-sidebar') as HTMLElement | null;
        if (sidebar) {
            sidebar.style.opacity = String(opts.opacity);
            this.positionSidebarByDefault(sidebar);
        }
        this.enableDrag();

        $('body').append(`
            <div id="autofeed-remote-dialog" class="af-remote-dialog">
                <div class="af-remote-dialog-box">
                    <div class="af-remote-dialog-header">
                        <span class="af-remote-dialog-title">是否跳过检验？</span>
                        <button class="af-remote-close-btn" type="button" aria-label="关闭"></button>
                    </div>
                    <div class="af-remote-dialog-body">
                        <span class="af-remote-dialog-message">请谨慎选择，如果因为跳检造成做假种或者下载量增加后果自负！！</span>
                    </div>
                    <div class="af-remote-dialog-footer">
                        <input type="button" class="af-remote-dialog-btn" id="autofeed-confirm" value="跳过检验" />
                        <input type="button" class="af-remote-dialog-btn af-remote-dialog-cancel" id="autofeed-cancel" value="直接下载" />
                    </div>
                </div>
            </div>
        `);

        $('body').append(`
            <div id="autofeed-remote-toast" style="display:none;">
                <p style="margin:8px 12px">种子添加成功~~</p>
            </div>
        `);

        const qb = config.qbittorrent || {};
        const tr = config.transmission || {};
        const de = config.deluge || {};

        const $list = $('#autofeed-remote-list');
        Object.keys(qb).forEach((server) => {
            const { menu, submenu } = this.buildMenuItem('qb', server, qb[server].url);
            $list.append(menu);
            this.normalizePathEntries((qb[server] as any).path).forEach((entry) => {
                this.appendPathEntry(submenu, 'qb_download', entry);
            });
        });

        Object.keys(tr).forEach((server) => {
            const { menu, submenu } = this.buildMenuItem('tr', server, tr[server].url);
            $list.append(menu);
            this.normalizePathEntries((tr[server] as any).path).forEach((entry) => {
                this.appendPathEntry(submenu, 'tr_download', entry);
            });
        });

        Object.keys(de).forEach((server) => {
            const { menu, submenu } = this.buildMenuItem('de', server, de[server].url);
            $list.append(menu);
            this.normalizePathEntries((de[server] as any).path).forEach((entry) => {
                this.appendPathEntry(submenu, 'de_download', entry);
            });
        });

        const dialogBox = (yesCallback: () => void, noCallback: () => void) => {
            $('#autofeed-remote-dialog').addClass('show');
            $('#autofeed-confirm').off('click').on('click', () => {
                $('#autofeed-remote-dialog').removeClass('show');
                yesCallback();
            });
            $('#autofeed-cancel').off('click').on('click', () => {
                $('#autofeed-remote-dialog').removeClass('show');
                noCallback();
            });
            $('#autofeed-remote-dialog .af-remote-close-btn').off('click').on('click', () => {
                $('#autofeed-remote-dialog').removeClass('show');
            });
        };

        const setStatus = (text: string, kind: 'info' | 'ok' | 'err' = 'info', hideAfterMs?: number) => {
            const el = document.getElementById('autofeed-remote-status') as HTMLDivElement | null;
            if (!el) return;
            el.style.display = 'block';
            el.setAttribute('data-kind', kind);
            el.textContent = text;
            if (hideAfterMs && hideAfterMs > 0) {
                window.setTimeout(() => {
                    const el2 = document.getElementById('autofeed-remote-status') as HTMLDivElement | null;
                    if (!el2) return;
                    el2.style.display = 'none';
                }, hideAfterMs);
            }
        };

        $list.on('click', '.qb_download', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.af-remote-menu-item').data('server');
            const path = String($target.attr('data-path') || '');
            const label = String($target.attr('data-label') || $target.find('.af-remote-path-label').text() || 'default');
            const server = qb[serverName];
            if (!server) return;
            const run = (skip: boolean) => {
                setStatus(`正在推送(QB): ${serverName} / ${label}${path ? ` → ${path}` : ''}...`, 'info');
                this.pushToQb(engine, server, path, label, skip, setStatus);
            };
            if (opts.askConfirm) dialogBox(() => run(true), () => run(false));
            else run(opts.skipDefault);
        });

        $list.on('click', '.tr_download', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.af-remote-menu-item').data('server');
            const path = String($target.attr('data-path') || '');
            const label = String($target.attr('data-label') || $target.find('.af-remote-path-label').text() || 'default');
            const server = tr[serverName];
            if (!server) return;
            const run = (skip: boolean) => {
                setStatus(`正在推送(TR): ${serverName} / ${label}${path ? ` → ${path}` : ''}...`, 'info');
                this.pushToTransmission(engine, server, path, label, skip, setStatus);
            };
            if (opts.askConfirm) dialogBox(() => run(true), () => run(false));
            else run(opts.skipDefault);
        });

        $list.on('click', '.de_download', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.af-remote-menu-item').data('server');
            const path = String($target.attr('data-path') || '');
            const label = String($target.attr('data-label') || $target.find('.af-remote-path-label').text() || 'default');
            const server = de[serverName];
            if (!server) return;
            const run = (skip: boolean) => {
                setStatus(`正在推送(DE): ${serverName} / ${label}${path ? ` → ${path}` : ''}...`, 'info');
                this.pushToDeluge(engine, server, path, label, skip, setStatus);
            };
            if (opts.askConfirm) dialogBox(() => run(true), () => run(false));
            else run(opts.skipDefault);
        });

        const sidebarEl = document.getElementById('autofeed-remote-sidebar');
        if (!sidebarEl) return;

        const menuItems = sidebarEl.querySelectorAll<HTMLLIElement>('.af-remote-menu-item');

        menuItems.forEach((item: HTMLLIElement) => {
            const submenu = item.querySelector<HTMLElement>('.af-remote-submenu');
            if (!submenu) return;

            let hideTimer: number | null = null;
            const hide = () => {
                if (hideTimer !== null) window.clearTimeout(hideTimer);
                hideTimer = null;
                submenu.style.display = 'none';
            };
            const scheduleHide = () => {
                if (hideTimer !== null) window.clearTimeout(hideTimer);
                hideTimer = window.setTimeout(() => {
                    if (!item.matches(':hover') && !submenu.matches(':hover')) hide();
                }, 180);
            };
            const show = () => {
                if (hideTimer !== null) window.clearTimeout(hideTimer);
                hideTimer = null;

                // Measure after display, then place the submenu beside the sidebar.
                const rect: DOMRect = item.getBoundingClientRect();
                sidebarEl.querySelectorAll<HTMLElement>('.af-remote-submenu').forEach((other) => {
                    if (other !== submenu) other.style.display = 'none';
                });
                submenu.style.display = 'block';
                submenu.style.position = 'fixed';
                const sidebarRect = sidebarEl.getBoundingClientRect();
                const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 1280;
                const viewportHeight = window.innerHeight || document.documentElement.clientHeight || 800;
                const margin = 6;
                const gap = 8;
                const submenuWidth = submenu.getBoundingClientRect().width || 180;
                const submenuHeight = submenu.offsetHeight || 160;

                let left = sidebarRect.left - submenuWidth - gap;
                // If there isn't room on the left (common on narrow/mobile viewports),
                // open on the right and clamp to the viewport.
                if (left < margin) left = sidebarRect.right + gap;
                if (left + submenuWidth > viewportWidth - margin) {
                    left = Math.max(margin, viewportWidth - submenuWidth - margin);
                }
                let top = rect.top;
                if (top + submenuHeight > viewportHeight - margin) {
                    top = Math.max(margin, viewportHeight - submenuHeight - margin);
                }
                if (top < margin) top = margin;

                submenu.style.left = `${left}px`;
                submenu.style.top = `${top}px`;
                submenu.style.right = 'auto';
            };

            item.addEventListener('mouseenter', show);
            item.addEventListener('mouseleave', scheduleHide);
            submenu.addEventListener('mouseenter', show);
            submenu.addEventListener('mouseleave', scheduleHide);
            item.addEventListener('click', (e) => {
                const target = e.target as HTMLElement | null;
                if (target?.closest('.af-remote-submenu')) return;
                e.preventDefault();
                if (submenu.style.display === 'block') hide(); else show();
            });
        });
    }

    // v2 intentionally starts from a clean viewport-relative position. The
    // previous key could contain coordinates captured while the old transform
    // based layout was active, which put the sidebar off-screen after resize.
    private static DRAG_KEY = 'autofeed_remote_sidebar_pos_v2';

    private static positionSidebarByDefault(sidebar: HTMLElement) {
        const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
        const vh = window.innerHeight || document.documentElement.clientHeight || 800;
        const margin = 8;
        const clamped = this.clampSidebarPos(
            sidebar,
            vw - sidebar.offsetWidth - margin,
            (vh - sidebar.offsetHeight) / 2
        );
        sidebar.style.left = `${clamped.x}px`;
        sidebar.style.top = `${clamped.y}px`;
        sidebar.style.right = 'auto';
        sidebar.style.transform = 'none';
    }

    private static clampSidebarPos(sidebar: HTMLElement, x: number, y: number): { x: number; y: number } {
        const vw = window.innerWidth || document.documentElement.clientWidth || 1280;
        const vh = window.innerHeight || document.documentElement.clientHeight || 800;
        const w = sidebar.offsetWidth || 82;
        const h = sidebar.offsetHeight || 220;
        const margin = 4;
        const maxX = Math.max(margin, vw - w - margin);
        const maxY = Math.max(margin, vh - h - margin);
        return {
            x: Math.min(Math.max(margin, Number.isFinite(x) ? x : margin), maxX),
            y: Math.min(Math.max(margin, Number.isFinite(y) ? y : margin), maxY)
        };
    }

    private static enableDrag() {
        const sidebar = document.getElementById('autofeed-remote-sidebar') as HTMLElement | null;
        if (!sidebar) return;
        const header = sidebar.querySelector('.af-remote-sidebar-header') as HTMLElement | null;
        if (!header) return;

        // Restore position
        GMAdapter.getValue<string | null>(this.DRAG_KEY, null).then((raw) => {
            if (!raw) return;
            try {
                const p = JSON.parse(raw);
                if (typeof p?.x === 'number' && typeof p?.y === 'number') {
                    const clamped = this.clampSidebarPos(sidebar, p.x, p.y);
                    sidebar.style.left = `${clamped.x}px`;
                    sidebar.style.top = `${clamped.y}px`;
                    sidebar.style.right = 'auto';
                    sidebar.style.transform = 'none';
                }
            } catch {}
        });

        header.style.cursor = 'move';
        let dragging = false;
        let startX = 0;
        let startY = 0;
        let baseX = 0;
        let baseY = 0;

        const onMove = (e: MouseEvent) => {
            if (!dragging) return;
            e.preventDefault();
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const clamped = this.clampSidebarPos(sidebar, baseX + dx, baseY + dy);
            sidebar.style.left = `${clamped.x}px`;
            sidebar.style.top = `${clamped.y}px`;
            sidebar.style.right = 'auto';
            sidebar.style.transform = 'none';
        };
        const onUp = () => {
            if (!dragging) return;
            dragging = false;
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('mouseup', onUp, true);
            const x = parseInt(sidebar.style.left || '0', 10);
            const y = parseInt(sidebar.style.top || '0', 10);
            GMAdapter.setValue(this.DRAG_KEY, JSON.stringify({ x, y })).catch(() => {});
        };

        const onResize = () => {
            if (!sidebar.style.left || !sidebar.style.top || sidebar.style.right !== 'auto') return;
            const x = parseInt(sidebar.style.left || '0', 10);
            const y = parseInt(sidebar.style.top || '0', 10);
            const clamped = this.clampSidebarPos(sidebar, x, y);
            sidebar.style.left = `${clamped.x}px`;
            sidebar.style.top = `${clamped.y}px`;
        };
        window.addEventListener('resize', onResize, { passive: true });
        window.visualViewport?.addEventListener('resize', onResize, { passive: true });

        header.addEventListener('mousedown', (e) => {
            // Only left click
            if ((e as any).button !== 0) return;
            dragging = true;
            const rect = sidebar.getBoundingClientRect();
            startX = e.clientX;
            startY = e.clientY;
            baseX = rect.left;
            baseY = rect.top;
            document.addEventListener('mousemove', onMove, true);
            document.addEventListener('mouseup', onUp, true);
        });
    }

    private static extractTorrentDownloadUrlFromPage(currentUrl: string): string {
        const currentTid = this.extractTorrentId(currentUrl);
        const candidates = currentTid
            ? [
                `a[href*="action=download"][href*="torrentid=${currentTid}"]`,
                `a[href*="download.php"][href*="torrentid=${currentTid}"]`,
                `a[href*="download"][href*="torrentid=${currentTid}"]`
            ]
            : [];
        candidates.push('a[href*="action=download"]', 'a[href*="download.php"]', 'a[href*="torrents/download"]');

        for (const sel of candidates) {
            const a = document.querySelector(sel) as HTMLAnchorElement | null;
            const href = (a?.getAttribute('href') || '').trim();
            if (!href) continue;
            try {
                return new URL(href, window.location.href).href;
            } catch {
                return href;
            }
        }
        return '';
    }

    private static async getMeta(engine: any, currentUrl: string = window.location.href): Promise<TorrentMeta | null> {
        try {
            const meta = await engine.parse();
            if (meta?.torrentUrl) return meta;
        } catch (err) {
            console.error('[Auto-Feed] Parse for remote push failed:', err);
        }
        try {
            const cached = await StorageService.load();
            if (cached?.torrentUrl) return cached;
        } catch (err) {
            console.error('[Auto-Feed] Load cached meta for remote push failed:', err);
        }
        const fallbackTorrentUrl = this.extractTorrentDownloadUrlFromPage(currentUrl);
        if (fallbackTorrentUrl) {
            return {
                title: document.title || 'autofeed',
                description: '',
                sourceSite: String(engine?.siteName || ''),
                sourceUrl: currentUrl,
                images: [],
                torrentUrl: fallbackTorrentUrl
            };
        }
        return null;
    }

    private static async pushToQb(
        engine: any,
        server: any,
        path: string,
        tag: string,
        skipChecking: boolean,
        onStatus?: (text: string, kind?: 'info' | 'ok' | 'err', hideAfterMs?: number) => void
    ) {
        const meta = await this.getMeta(engine, window.location.href);
        if (!meta?.torrentUrl) {
            alert('未找到种子下载链接');
            onStatus?.('推送失败: 未找到种子链接', 'err', 3000);
            return;
        }

        onStatus?.('下载种子中...', 'info');
        const blob = await this.downloadTorrentBlob(meta.torrentUrl);
        if (!blob) {
            onStatus?.('推送失败: 种子下载失败', 'err', 3000);
            return;
        }

        const torrentFile = new File([blob], meta.torrentFilename || 'autofeed.torrent', { type: 'application/x-bittorrent' });
        const formData = new FormData();
        const siteUpLimits: Record<string, number> = {
            CMCT: 134217728,
            Audiences: 131072000
        };
        if (meta.sourceSite && siteUpLimits[meta.sourceSite]) {
            formData.append('upLimit', String(siteUpLimits[meta.sourceSite]));
        }
        formData.append('torrents', torrentFile);
        formData.append('savepath', path);
        formData.append('category', tag);
        formData.append('skip_checking', String(skipChecking));

        const host = this.normalizeHost(server.url);
        try {
            onStatus?.('登录 qBittorrent...', 'info');
            await this.qbRequest(host, '/auth/login', {
                username: server.username,
                password: server.password
            });
            onStatus?.('推送中...', 'info');
            await this.qbRequest(host, '/torrents/add', formData);
            this.showToast();
            onStatus?.('推送完成', 'ok', 3000);
        } catch (err) {
            console.error(err);
            alert('远程推送失败，请检查 QB 状态和配置');
            onStatus?.('推送失败', 'err', 5000);
        }
    }

    private static async pushToTransmission(
        engine: any,
        server: any,
        path: string,
        tag: string,
        skipChecking: boolean,
        onStatus?: (text: string, kind?: 'info' | 'ok' | 'err', hideAfterMs?: number) => void
    ) {
        const meta = await this.getMeta(engine, window.location.href);
        if (!meta?.torrentUrl) {
            alert('未找到种子下载链接');
            onStatus?.('推送失败: 未找到种子链接', 'err', 3000);
            return;
        }

        onStatus?.('下载种子中...', 'info');
        const base64 = await this.downloadTorrentBase64(meta.torrentUrl);
        if (!base64) {
            onStatus?.('推送失败: 种子下载失败', 'err', 3000);
            return;
        }

        const host = this.normalizeHost(server.url);
        try {
            onStatus?.('推送中...', 'info');
            await this.transmissionRequest(
                `${host}transmission/rpc`,
                server.username,
                server.password,
                base64,
                path,
                [tag],
                skipChecking
            );
            this.showToast();
            onStatus?.('推送完成', 'ok', 3000);
        } catch (err) {
            console.error(err);
            alert('远程推送失败，请检查 Transmission 状态和配置');
            onStatus?.('推送失败', 'err', 5000);
        }
    }

    private static delugeSessionId = '';
    private static qbSessionId = '';
    private static delugeMsgId = 0;
    private static normalizeDelugeEndpoint(url: string): string {
        const host = this.normalizeHost(url);
        if (!host) return '';
        if (host.match(/\/json\/?$/i)) return host.replace(/\/$/, '');
        return host.replace(/\/$/, '') + '/json';
    }

    private static async delugeRequest(endpoint: string, method: string, params: any[] = []) {
        const id = this.delugeMsgId++;
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (this.delugeSessionId) {
            headers['Cookie'] = `_session_id=${this.delugeSessionId}`;
        }
        const res = await GMAdapter.xmlHttpRequest({
            method: 'POST',
            url: endpoint,
            headers,
            withCredentials: true,
            anonymous: false,
            data: JSON.stringify({ id, method, params }),
            ...(this.delugeSessionId ? { cookie: `_session_id=${this.delugeSessionId}` } : {})
        });

        const match = (res.responseHeaders || '').match(/set-cookie:\s*_session_id=([^;]+)/i);
        if (match?.[1]) {
            this.delugeSessionId = match[1].trim();
        }

        const text = res.responseText || '';
        const json = text ? JSON.parse(text) : null;
        if (!json) throw new Error('Deluge: empty response');
        if (json.error) throw new Error(`Deluge: ${json.error}`);
        return json.result;
    }

    private static async pushToDeluge(
        engine: any,
        server: any,
        path: string,
        tag: string,
        skipChecking: boolean,
        onStatus?: (text: string, kind?: 'info' | 'ok' | 'err', hideAfterMs?: number) => void
    ) {
        const meta = await this.getMeta(engine, window.location.href);
        if (!meta?.torrentUrl) {
            alert('未找到种子下载链接');
            onStatus?.('推送失败: 未找到种子链接', 'err', 3000);
            return;
        }

        onStatus?.('下载种子中...', 'info');
        const base64 = await this.downloadTorrentBase64(meta.torrentUrl);
        if (!base64) {
            onStatus?.('推送失败: 种子下载失败', 'err', 3000);
            return;
        }

        const endpoint = this.normalizeDelugeEndpoint(server.url);
        if (!endpoint) {
            alert('Deluge 地址为空');
            return;
        }

        const options: any = {
            add_paused: false
        };
        if (path) options.download_location = path;
        if (skipChecking) {
            // Similar to "skip verify": assume files exist and enter seed mode.
            options.seed_mode = true;
        }

        try {
            onStatus?.('登录 Deluge...', 'info');
            await this.delugeRequest(endpoint, 'auth.login', [server.password || '']);
            onStatus?.('推送中...', 'info');
            const result = await this.delugeRequest(endpoint, 'core.add_torrent_file', ['', base64, options]);

            // Optional label plugin
            try {
                const hash = Array.isArray(result) && Array.isArray(result[0]) ? result[0][1] : '';
                if (hash) await this.delugeRequest(endpoint, 'label.set_torrent', [hash, tag]);
            } catch {}

            if (result === null) {
                alert('远程推送失败: Deluge 返回空结果');
                onStatus?.('推送失败: Deluge 返回空结果', 'err', 5000);
                return;
            }
            this.showToast();
            onStatus?.('推送完成', 'ok', 3000);
        } catch (err) {
            console.error(err);
            alert('远程推送失败，请检查 Deluge Web 状态和配置');
            onStatus?.('推送失败', 'err', 5000);
        }
    }

    private static async downloadTorrentBlob(url: string): Promise<Blob | null> {
        try {
            const res = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'blob'
            });
            return res.response as Blob;
        } catch (err) {
            console.error('Torrent download failed:', err);
            return null;
        }
    }

    private static async downloadTorrentBase64(url: string): Promise<string | null> {
        try {
            const res = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url,
                responseType: 'arraybuffer'
            });
            const bytes = new Uint8Array(res.response);
            let binary = '';
            for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
            return btoa(binary);
        } catch (err) {
            console.error('Torrent download failed:', err);
            return null;
        }
    }

    private static async qbRequest(host: string, path: string, parameters: any) {
        const endpoint = 'api/v2';
        const headers: Record<string, string> = {};
        if (this.qbSessionId) {
            headers['Cookie'] = `SID=${this.qbSessionId}`;
        }
        let data: any = null;
        if (path === '/auth/login') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            data = new URLSearchParams(parameters).toString();
        } else {
            data = parameters;
        }

        const res = await GMAdapter.xmlHttpRequest({
            method: 'POST',
            url: `${host}${endpoint}${path}`,
            data,
            headers,
            withCredentials: true,
            anonymous: false,
            ...(this.qbSessionId ? { cookie: `SID=${this.qbSessionId}` } : {})
        });

        const match = (res.responseHeaders || '').match(/set-cookie:\s*SID=([^;]+)/i);
        if (match?.[1]) {
            this.qbSessionId = match[1].trim();
        }

        return res;
    }

    static async testQbittorrent(server: { url: string; username: string; password: string }): Promise<RemoteTestResult> {
        const host = this.normalizeHost(server.url);
        if (!host) return { ok: false, message: 'URL 为空' };

        try {
            const login = await GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: `${host}api/v2/auth/login`,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                data: new URLSearchParams({ username: server.username, password: server.password }).toString(),
                anonymous: true,
                withCredentials: false
            });
            if (login.status !== 200) {
                return { ok: false, message: `登录失败: HTTP ${login.status}` };
            }
            const text = String(login.responseText || '').trim();
            if (!/^ok\.?$/i.test(text)) {
                return { ok: false, message: text ? `登录失败: ${text}` : '登录失败: 凭据无效' };
            }
            return { ok: true, message: 'OK: qBittorrent 登录成功' };
        } catch (err: any) {
            return { ok: false, message: `登录失败: ${err?.message || String(err)}` };
        }
    }

    static async testTransmission(server: { url: string; username: string; password: string }): Promise<RemoteTestResult> {
        const host = this.normalizeHost(server.url);
        if (!host) return { ok: false, message: 'URL 为空' };
        const rpcUrl = `${host}transmission/rpc`;

        const auth = 'Basic ' + btoa(`${server.username}:${server.password}`);
        const payload = JSON.stringify({ method: 'session-get' });

        const requestOnce = async (sessionId?: string) =>
            GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: rpcUrl,
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: auth,
                    ...(sessionId ? { 'X-Transmission-Session-Id': sessionId } : {})
                },
                data: payload,
                anonymous: true,
                withCredentials: false
            });

        const parseResult = (responseText: string): string => {
            if (!responseText) return '';
            try {
                const json = JSON.parse(responseText);
                return String(json?.result || '');
            } catch {
                return '';
            }
        };

        try {
            const first = await requestOnce();
            if (first.status === 401) return { ok: false, message: '认证失败: 用户名或密码错误' };
            if (first.status === 200) {
                const result = parseResult(first.responseText || '');
                if (result && result !== 'success') return { ok: false, message: `RPC 失败: ${result}` };
                return { ok: true, message: 'OK: Transmission RPC' };
            }
            if (first.status !== 409) return { ok: false, message: `RPC 失败: HTTP ${first.status}` };

            const match = (first.responseHeaders || '').match(/X-Transmission-Session-Id:\s*(.+)/i);
            const sid = match?.[1]?.trim();
            if (!sid) return { ok: false, message: 'RPC 失败: 缺少 Session-Id' };

            const second = await requestOnce(sid);
            if (second.status === 401) return { ok: false, message: '认证失败: 用户名或密码错误' };
            if (second.status === 200) {
                const result = parseResult(second.responseText || '');
                if (result && result !== 'success') return { ok: false, message: `RPC 失败: ${result}` };
                return { ok: true, message: 'OK: Transmission RPC' };
            }
            return { ok: false, message: `RPC 失败: HTTP ${second.status}` };
        } catch (err: any) {
            return { ok: false, message: `RPC 失败: ${err?.message || String(err)}` };
        }
    }

    static async testDeluge(server: { url: string; password: string }): Promise<RemoteTestResult> {
        let host = this.normalizeHost(server.url);
        if (!host) return { ok: false, message: 'URL 为空' };
        if (!host.match(/\/json\/?$/i)) host = host.replace(/\/$/, '') + '/json';

        let testSessionId = '';
        const request = async (id: number, method: string, params: any[] = []) => {
            const headers: Record<string, string> = { 'Content-Type': 'application/json' };
            if (testSessionId) {
                headers['Cookie'] = `_session_id=${testSessionId}`;
            }
            const res = await GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: host,
                headers,
                withCredentials: true,
                anonymous: false,
                data: JSON.stringify({ id, method, params }),
                ...(testSessionId ? { cookie: `_session_id=${testSessionId}` } : {})
            });

            const match = (res.responseHeaders || '').match(/set-cookie:\s*_session_id=([^;]+)/i);
            if (match?.[1]) {
                testSessionId = match[1].trim();
            }

            const text = res.responseText || '';
            let json: any = null;
            try {
                json = text ? JSON.parse(text) : null;
            } catch {
                json = null;
            }
            return { res, json };
        };

        let loginOk = false;
        try {
            const login = await request(0, 'auth.login', [server.password || '']);
            if (login.res.status !== 200) return { ok: false, message: `登录失败: HTTP ${login.res.status}` };
            if (!login.json) return { ok: false, message: `登录失败: 非JSON响应 (HTTP ${login.res.status})` };
            if (login.json.error) return { ok: false, message: `登录失败: ${login.json.error}` };
            loginOk = !!login.json.result;
        } catch (err: any) {
            return { ok: false, message: `登录失败: ${err?.message || String(err)}` };
        }

        try {
            const info = await request(1, 'daemon.info', []);
            if (info.res.status === 200 && info.json && !info.json.error) {
                const ver = String(info.json.result || '').trim();
                return { ok: true, message: ver ? `OK: Deluge ${ver}` : 'OK: Deluge' };
            }
        } catch {}

        return {
            ok: true,
            message: loginOk
                ? 'OK: Deluge 登录成功（info 获取失败/被限制，但推送通常仍可用）'
                : 'OK: Deluge 会话存在（login=false，但推送通常仍可用）'
        };
    }

    private static normalizeHost(url: string): string {
        if (!url) return '';
        return url.endsWith('/') ? url : `${url}/`;
    }

    private static async transmissionRequest(
        rpcUrl: string,
        username: string,
        password: string,
        base64: string,
        path: string,
        tag: string[],
        skipChecking: boolean
    ) {
        let sessionId = '';
        const data = {
            method: 'torrent-add',
            arguments: {
                metainfo: base64,
                'download-dir': path,
                labels: tag,
                'skip-verify': skipChecking
            }
        };

        const headers = {
            'Content-Type': 'application/json',
            'X-Transmission-Session-Id': sessionId,
            Authorization: 'Basic ' + btoa(username + ':' + password)
        };

        const res = await GMAdapter.xmlHttpRequest({
            method: 'POST',
            url: rpcUrl,
            headers,
            data: JSON.stringify(data)
        });

        if (res.status === 409) {
            const newSessionId = res.responseHeaders.match(/X-Transmission-Session-Id:\s*(.+)/i);
            if (newSessionId) sessionId = newSessionId[1].trim();
            return GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: rpcUrl,
                headers: {
                    ...headers,
                    'X-Transmission-Session-Id': sessionId
                },
                data: JSON.stringify(data)
            });
        }
        return res;
    }

    private static showToast() {
        const $toast = $('#autofeed-remote-toast');
        if (!$toast.length) return;
        $toast.fadeIn(400);
        setTimeout(() => {
            $toast.fadeOut(600);
        }, 2000);
    }

    private static injectStyles() {
        GMAdapter.setValue; // noop to keep bundler aware
        const style = `
        #autofeed-remote-sidebar,
        #autofeed-remote-sidebar * {
            box-sizing: border-box;
        }
        #autofeed-remote-sidebar {
            all: initial;
            position: fixed !important;
            top: 8px;
            right: 8px;
            left: auto;
            bottom: auto;
            transform: none;
            width: 86px !important;
            max-width: calc(100vw - 12px) !important;
            max-height: calc(100vh - 12px) !important;
            overflow: visible !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #243447 !important;
            border: 1px solid rgba(255,255,255,0.10) !important;
            border-radius: 10px !important;
            box-shadow: 0 8px 24px rgba(0,0,0,0.28) !important;
            color: #ecf0f1 !important;
            font: 13px/1.2 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            z-index: 2147483640 !important;
        }
        #autofeed-remote-sidebar ul,
        #autofeed-remote-sidebar li {
            list-style: none !important;
            padding: 0 !important;
            margin: 0 !important;
        }
        #autofeed-remote-sidebar .af-remote-sidebar-header {
            display: flex !important;
            flex-direction: column !important;
            align-items: center !important;
            gap: 4px !important;
            width: 100% !important;
            padding: 8px 4px 6px !important;
            margin: 0 0 4px !important;
            color: #ecf0f1 !important;
            font: 600 11px/1.2 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            text-align: center !important;
            border-bottom: 1px solid rgba(255,255,255,0.1) !important;
            user-select: none !important;
        }
        #autofeed-remote-sidebar .af-remote-download-icon,
        #autofeed-remote-sidebar .af-remote-download-icon svg {
            display: block !important;
            width: 24px !important;
            height: 20px !important;
            margin: 0 !important;
        }
        #autofeed-remote-sidebar #autofeed-remote-list {
            width: 100% !important;
            overflow: visible !important;
        }
        #autofeed-remote-sidebar .af-remote-menu-item {
            position: static !important;
            display: block !important;
            width: 100% !important;
        }
        #autofeed-remote-sidebar .af-remote-server-link,
        #autofeed-remote-sidebar .af-remote-path-link {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            width: 100% !important;
            min-height: 40px !important;
            padding: 11px 6px !important;
            color: #ecf0f1 !important;
            font: 600 13px/1.2 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            text-align: center !important;
            text-decoration: none !important;
            white-space: nowrap !important;
            overflow: hidden !important;
            text-overflow: ellipsis !important;
            cursor: pointer !important;
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out !important;
        }
        #autofeed-remote-sidebar .af-remote-server-link:hover,
        #autofeed-remote-sidebar .af-remote-server-link:focus,
        #autofeed-remote-sidebar .af-remote-path-link:hover,
        #autofeed-remote-sidebar .af-remote-path-link:focus {
            background: #2d4258 !important;
            color: #fff !important;
        }
        #autofeed-remote-sidebar .af-remote-menu-item:first-child .af-remote-server-link {
            border-radius: 8px 8px 0 0 !important;
        }
        #autofeed-remote-sidebar .af-remote-menu-item:last-child .af-remote-server-link {
            border-radius: 0 0 8px 8px !important;
        }
        #autofeed-remote-sidebar .af-remote-submenu {
            display: none;
            position: fixed !important;
            width: 80px !important;
            min-width: 80px !important;
            max-width: 80px !important;
            max-height: calc(100vh - 12px) !important;
            overflow: auto !important;
            padding: 0 !important;
            margin: 0 !important;
            background: #1f2d3d !important;
            border-radius: 8px !important;
            box-shadow: -4px 0 10px rgba(0,0,0,0.15) !important;
            z-index: 2147483641 !important;
        }
        #autofeed-remote-sidebar .af-remote-submenu .af-remote-path-link {
            justify-content: center !important;
            min-height: 36px !important;
            padding: 12px 10px !important;
            color: #bdc3c7 !important;
            font-size: 13px !important;
            text-align: center !important;
            border-radius: 0 !important;
        }
        #autofeed-remote-status {
            display: none;
            width: 100% !important;
            padding: 8px !important;
            border-top: 1px solid rgba(255,255,255,0.12) !important;
            color: #ecf0f1 !important;
            font: 12px/1.15 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            background: rgba(0,0,0,0.08) !important;
            word-break: break-word !important;
        }
        #autofeed-remote-status[data-kind="ok"] { color: #b6f7c1 !important; }
        #autofeed-remote-status[data-kind="err"] { color: #ffd0d0 !important; }

        #autofeed-remote-dialog {
            position: fixed !important;
            inset: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            padding: 12px !important;
            background: rgba(0,0,0,0.3) !important;
            backdrop-filter: blur(4px) !important;
            opacity: 0 !important;
            visibility: hidden !important;
            pointer-events: none !important;
            z-index: 2147483642 !important;
            transition: opacity 0.2s ease, visibility 0.2s ease !important;
        }
        #autofeed-remote-dialog.show {
            opacity: 1 !important;
            visibility: visible !important;
            pointer-events: auto !important;
        }
        #autofeed-remote-dialog .af-remote-dialog-box {
            width: min(90vw, 300px) !important;
            max-height: calc(100vh - 24px) !important;
            overflow: hidden !important;
            background: #fff !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
        #autofeed-remote-dialog .af-remote-dialog-header {
            position: relative !important;
            display: flex !important;
            align-items: center !important;
            min-height: 42px !important;
            padding: 6px 42px 6px 12px !important;
            background: linear-gradient(135deg,#6e8efb,#a777e3) !important;
        }
        #autofeed-remote-dialog .af-remote-dialog-title {
            color: #fff !important;
            font: 600 16px/1.2 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
        #autofeed-remote-dialog .af-remote-close-btn {
            position: absolute !important;
            top: 50% !important;
            right: 12px !important;
            width: 24px !important;
            height: 24px !important;
            padding: 0 !important;
            transform: translateY(-50%) !important;
            background: rgba(255,255,255,0.2) !important;
            border: 0 !important;
            border-radius: 50% !important;
            cursor: pointer !important;
        }
        #autofeed-remote-dialog .af-remote-close-btn::after {
            content: "×";
            color: #fff !important;
            font-size: 20px !important;
            line-height: 1 !important;
        }
        #autofeed-remote-dialog .af-remote-dialog-body {
            display: flex !important;
            align-items: center !important;
            min-height: 40px !important;
            padding: 18px !important;
            color: #333 !important;
            font: 15px/1.2 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
            border-bottom: 1px solid #f0f0f0 !important;
        }
        #autofeed-remote-dialog .af-remote-dialog-footer {
            display: flex !important;
            justify-content: center !important;
            gap: 12px !important;
            padding: 12px !important;
            background: #fff !important;
        }
        #autofeed-remote-dialog .af-remote-dialog-btn {
            min-width: 80px !important;
            min-height: 30px !important;
            padding: 6px 10px !important;
            border: 0 !important;
            border-radius: 8px !important;
            cursor: pointer !important;
            font: 500 14px/1 'Segoe UI', Roboto, Helvetica, Arial, sans-serif !important;
        }
        #autofeed-confirm {
            background: linear-gradient(135deg,#6e8efb,#a777e3) !important;
            color: #fff !important;
            box-shadow: 0 4px 6px rgba(103,119,239,0.2) !important;
        }
        #autofeed-cancel {
            margin: 0 !important;
            background: #e6f0ff !important;
            color: #4a90e2 !important;
            border: 1px solid #c1d7f5 !important;
        }
        #autofeed-remote-toast {
            position: fixed !important;
            top: 5% !important;
            left: 50% !important;
            transform: translate(-50%,-50%) !important;
            padding: 1px !important;
            background: #4caf50 !important;
            color: #fff !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            z-index: 2147483643 !important;
            font: 14px/1.2 Arial, sans-serif !important;
            text-align: center !important;
        }
        `;

        if (!document.getElementById('autofeed-remote-style')) {
            const styleEl = document.createElement('style');
            styleEl.id = 'autofeed-remote-style';
            styleEl.textContent = style;
            document.head.appendChild(styleEl);
        }
    }
}
