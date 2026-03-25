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
        const menu = $(`<li class="menu-item"></li>`);
        menu.attr('data-server', serverName);
        menu.attr('data-type', type);

        const prefix = type.toUpperCase()[0];
        const link = $(`<a target="_blank"></a>`);
        link.attr('href', serverUrl || '#');
        link.text(`${prefix}-${serverName}`);

        const safeId = `${type}-${serverName}`.replace(/[^a-zA-Z0-9_-]/g, '_');
        const submenu = $(`<ul class="submenu" id="autofeed-ul-${safeId}"></ul>`);

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
        const a = $(`<a href="#" class="${cls}"></a>`);
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
        return (
            /details?\.php\?id=\d+/i.test(url) ||
            /torrents\.php\?[^#]*\btorrentid=\d+/i.test(url) ||
            /\/torrents\/\d+/i.test(url) ||
            /\/detail\/\d+/i.test(url) ||
            /\/t\/\d+/i.test(url)
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
            return /\/t\/\d+/i.test(path) || (/details\.php/i.test(path) && /id=\d+/i.test(qs));
        }
        if (siteName === 'PTP' || ['GPW', 'RED', 'OPS', 'DIC'].includes(siteName)) {
            if (siteName === 'PTP') {
                return path.includes('torrents.php') && (/torrentid=\d+/i.test(qs) || /id=\d+/i.test(qs));
            }
            return path.includes('torrents.php') && /torrentid=\d+/i.test(qs);
        }
        if (siteName === 'HDB' || siteName === 'CHDBits' || siteName === 'OpenCD') {
            return /details\.php/i.test(path) && /id=\d+/i.test(qs);
        }
        if (siteName === 'BHD') {
            return /\/torrents\/.+/i.test(path) || /\/library\/title\/.+/i.test(path);
        }
        return this.isDetailPage(url);
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
                <div class="sidebar-header">
                    <span>远程推送</span>
                    <div class="download-icon">
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
        }
        this.enableDrag();

        $('body').append(`
            <div class="autofeed-remote-dialog hide">
                <div class="dialog0">
                    <div class="dialog-header0">
                        <span class="dialog-title0">是否跳过检验？</span>
                        <button class="close-btn"></button>
                    </div>
                    <div class="dialog-body0">
                        <span class="dialog-message">请谨慎选择，如果因为跳检造成做假种或者下载量增加后果自负！！</span>
                    </div>
                    <div class="dialog-footer0">
                        <input type="button" class="qb-btn" id="autofeed-confirm" value="跳过检验" />
                        <input type="button" class="qb-btn ml50" id="autofeed-cancel" value="直接下载" />
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
            $('.autofeed-remote-dialog').removeClass('hide').addClass('show');
            $('#autofeed-confirm').off('click').on('click', () => {
                $('.autofeed-remote-dialog').addClass('hide');
                yesCallback();
            });
            $('#autofeed-cancel').off('click').on('click', () => {
                $('.autofeed-remote-dialog').addClass('hide');
                noCallback();
            });
            $('.close-btn').off('click').on('click', () => {
                $('.autofeed-remote-dialog').addClass('hide');
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

        $('.qb_download').on('click', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.menu-item').data('server');
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

        $('.tr_download').on('click', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.menu-item').data('server');
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

        $('.de_download').on('click', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.menu-item').data('server');
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

        const menuItems = document.querySelectorAll<HTMLLIElement>('.menu-item');

        menuItems.forEach((item: HTMLLIElement) => {
            // Select the submenu within the current menu item
            const submenu = item.querySelector<HTMLElement>('.submenu');
            if (!submenu) return;
            item.addEventListener('mouseenter', (e: MouseEvent) => {
                // Get the bounding rectangle of the parent menu item
                const rect: DOMRect = item.getBoundingClientRect();
                submenu.style.display = 'block';
                submenu.style.position = 'fixed';
                const sidebar = document.getElementById('autofeed-remote-sidebar') as HTMLElement;
                if (sidebar) {
                    const sidebarHeight: number = sidebar.offsetHeight;
                    const calculatedTop: number = rect.top - (window.innerHeight / 2) + (sidebarHeight / 2);
                    submenu.style.top = `${calculatedTop}px`;
                }
                const gap: number = -20;
                submenu.style.right = `${window.innerWidth - rect.left + gap}px`;
                submenu.style.left = 'auto';
            });
            item.addEventListener('mouseleave', () => {
                submenu.style.display = 'none';
            });
        });
    }

    private static DRAG_KEY = 'autofeed_remote_sidebar_pos';
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
        const header = sidebar.querySelector('.sidebar-header') as HTMLElement | null;
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

    private static delugeMsgId = 0;
    private static normalizeDelugeEndpoint(url: string): string {
        const host = this.normalizeHost(url);
        if (!host) return '';
        if (host.match(/\/json\/?$/i)) return host.replace(/\/$/, '');
        return host.replace(/\/$/, '') + '/json';
    }

    private static async delugeRequest(endpoint: string, method: string, params: any[] = []) {
        const id = this.delugeMsgId++;
        const res = await GMAdapter.xmlHttpRequest({
            method: 'POST',
            url: endpoint,
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
            anonymous: false,
            data: JSON.stringify({ id, method, params })
        });
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
        let data: any = null;
        if (path === '/auth/login') {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
            data = new URLSearchParams(parameters).toString();
        } else {
            data = parameters;
        }

        return GMAdapter.xmlHttpRequest({
            method: 'POST',
            url: `${host}${endpoint}${path}`,
            data,
            headers
        });
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

        const request = async (id: number, method: string, params: any[] = []) => {
            const res = await GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: host,
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true,
                anonymous: false,
                data: JSON.stringify({ id, method, params })
            });
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
        .autofeed-remote-dialog {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .autofeed-remote-dialog.show {
            opacity: 1;
            visibility: visible;
        }
        #autofeed-remote-toast {
            position: fixed;
            top: 5%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #4CAF50;
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
        }
        #autofeed-remote-sidebar {
            position: fixed;
            top: 50%;
            right: 8px;
            transform: translateY(-50%);
            width: 80px;
            max-width: calc(100vw - 16px);
            box-sizing: border-box;
            background-color: #243447;
            border: 1px solid rgba(255,255,255,0.10);
            border-radius: 10px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.28);
            z-index: 9999;
        }
        #autofeed-remote-sidebar .sidebar-header {
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 11px;
            font-weight: 600;
            text-align: center;
            padding: 8px 4px 6px;
            margin-bottom: 4px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        #autofeed-remote-sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
            border-radius: 8px 8px 8px 8px;
        }
        #autofeed-remote-list li {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            border-radius: 8px 8px 8px 8px;
        }
        #autofeed-remote-list > li:first-child > a {
            border-top-left-radius: 8px;
            border-top-right-radius: 8px;
        }
        #autofeed-remote-list > li:last-child > a {
            border-bottom-left-radius: 8px;
            border-bottom-right-radius: 8px;
        }
        #autofeed-remote-list li a {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 11px 6px;
            text-decoration: none;
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 13px;
            font-weight: 600;
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }
        #autofeed-remote-list li a:hover {
            background-color: #2d4258;
        }

        #autofeed-remote-status {
            padding: 8px 8px;
            border-top: 1px solid rgba(255, 255, 255, 0.12);
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 12px;
            line-height: 1.15;
            background: rgba(0, 0, 0, 0.08);
            word-break: break-word;
        }
        #autofeed-remote-status[data-kind="ok"] { color: #b6f7c1; }
        #autofeed-remote-status[data-kind="err"] { color: #ffd0d0; }
        
        #autofeed-remote-sidebar .submenu {
            display: none;
            position: absolute;
            left: -100%;
            width: 80px;
            background-color: #1f2d3d;
            border-radius: 8px;
            box-shadow: -4px 0 10px rgba(0, 0, 0, 0.15);
            z-index: 10;
            overflow: hidden;
        }
        #autofeed-remote-sidebar .submenu li a {
            display: flex;
            justify-content: center;
            align-items: center;
            color: #bdc3c7;
            padding: 12px 10px;
            font-size: 13px;
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }
        #autofeed-remote-sidebar .submenu li a:hover,
        #autofeed-remote-sidebar .submenu li a:focus {
            background-color: #2d4258;
            color: #ecf0f1;
        }
        .dialog0 {
            width: 90%;
            max-width: 300px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        .dialog-header0 {
            padding: 6px 8px;
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }
        .dialog-title0 {
            color: white;
            font-size: 16px;
            font-weight: 600;
        }
        .close-btn {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            cursor: pointer;
        }
        .close-btn::after {
            content: "×";
            color: white;
            font-size: 20px;
            line-height: 1;
        }
        .dialog-body0 {
            padding: 18px;
            line-height: 1.2;
            color: #333;
            font-size: 15px;
            min-height: 40px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #f0f0f0;
        }
        .dialog-footer0 {
            padding: 12px 25px;
            display: flex;
            justify-content: center;
            background: white;
        }
        .qb-btn {
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            min-width: 80px;
            padding: 6px 10px;
            min-height: 30px;
            line-height: 1.0;
        }
        #autofeed-confirm {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            box-shadow: 0 4px 6px rgba(103, 119, 239, 0.2);
        }
        #autofeed-cancel {
            background: #e6f0ff;
            color: #4a90e2;
            border: 1px solid #c1d7f5;
            margin-left: 15px;
        }
        .hide {
            display: none !important;
        }
        .ml50 {
            margin-left: 50px;
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
