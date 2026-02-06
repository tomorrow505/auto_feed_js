import $ from 'jquery';
import { SettingsService, RemoteServerConfig } from './SettingsService';
import { SiteRegistry } from '../core/SiteRegistry';
import { TorrentMeta } from '../types/TorrentMeta';
import { GMAdapter } from './GMAdapter';

export class RemoteDownloadService {
    static async tryInject() {
        const settings = await SettingsService.load();
        if (!settings.enableRemoteSidebar || !settings.remoteServer) return;
        if (document.getElementById('autofeed-remote-sidebar')) return;

        const engine = SiteRegistry.getEngine(window.location.href);
        if (!engine) return;

        // Only show on detail-like pages
        if (!this.isDetailPage(window.location.href)) return;

        this.injectSidebar(settings.remoteServer, engine, {
            skipDefault: !!settings.remoteSkipCheckingDefault,
            askConfirm: !!settings.remoteAskSkipConfirm
        });
    }

    private static isDetailPage(url: string): boolean {
        return !!url.match(/details?(\.php)?|threads|topics|torrents|detail\//i);
    }

    private static injectSidebar(
        config: RemoteServerConfig,
        engine: any,
        opts: { skipDefault: boolean; askConfirm: boolean }
    ) {
        GMAdapter.xmlHttpRequest; // ensure GM granted
        this.injectStyles();

        $('body').append(`
            <div id="autofeed-remote-sidebar">
                <div class="sidebar-header">
                    <span>远程推送</span>
                    <div class="download-icon">⬇</div>
                </div>
                <ul id="autofeed-remote-list"></ul>
                <div id="autofeed-remote-status" style="display:none;"></div>
            </div>
        `);

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
            $list.append(`<li class="menu-item" data-server="${server}" data-type="qb"><a href="${qb[server].url}" target="_blank">Q-${server}</a><ul class="submenu" id="autofeed-ul-${server}"></ul></li>`);
            const $submenu = $(`#autofeed-ul-${server}`);
            Object.keys(qb[server].path || {}).forEach((label) => {
                $submenu.append(`<li><a href="#" class="qb_download" data-path="${qb[server].path[label]}">${label}</a></li>`);
            });
        });

        Object.keys(tr).forEach((server) => {
            $list.append(`<li class="menu-item" data-server="${server}" data-type="tr"><a href="${tr[server].url}" target="_blank">T-${server}</a><ul class="submenu" id="autofeed-ul-${server}"></ul></li>`);
            const $submenu = $(`#autofeed-ul-${server}`);
            Object.keys(tr[server].path || {}).forEach((label) => {
                $submenu.append(`<li><a href="#" class="tr_download" data-path="${tr[server].path[label]}">${label}</a></li>`);
            });
        });

        Object.keys(de).forEach((server) => {
            $list.append(`<li class="menu-item" data-server="${server}" data-type="de"><a href="${de[server].url}" target="_blank">D-${server}</a><ul class="submenu" id="autofeed-ul-${server}"></ul></li>`);
            const $submenu = $(`#autofeed-ul-${server}`);
            Object.keys(de[server].path || {}).forEach((label) => {
                $submenu.append(`<li><a href="#" class="de_download" data-path="${de[server].path[label]}">${label}</a></li>`);
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
            const path = $target.data('path');
            const label = $target.text();
            const server = qb[serverName];
            if (!server) return;
            const run = (skip: boolean) => {
                setStatus(`正在推送(QB): ${serverName} / ${label}...`, 'info');
                this.pushToQb(engine, server, path, label, skip, setStatus);
            };
            if (opts.askConfirm) dialogBox(() => run(true), () => run(false));
            else run(opts.skipDefault);
        });

        $('.tr_download').on('click', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.menu-item').data('server');
            const path = $target.data('path');
            const label = $target.text();
            const server = tr[serverName];
            if (!server) return;
            const run = (skip: boolean) => {
                setStatus(`正在推送(TR): ${serverName} / ${label}...`, 'info');
                this.pushToTransmission(engine, server, path, label, skip, setStatus);
            };
            if (opts.askConfirm) dialogBox(() => run(true), () => run(false));
            else run(opts.skipDefault);
        });

        $('.de_download').on('click', async (e) => {
            e.preventDefault();
            const $target = $(e.currentTarget);
            const serverName = $target.closest('.menu-item').data('server');
            const path = $target.data('path');
            const label = $target.text();
            const server = de[serverName];
            if (!server) return;
            const run = (skip: boolean) => {
                setStatus(`正在推送(DE): ${serverName} / ${label}...`, 'info');
                this.pushToDeluge(engine, server, path, label, skip, setStatus);
            };
            if (opts.askConfirm) dialogBox(() => run(true), () => run(false));
            else run(opts.skipDefault);
        });

        const menuItems = document.querySelectorAll('#autofeed-remote-sidebar .menu-item');
        menuItems.forEach((item) => {
            const submenu = item.querySelector('.submenu') as HTMLElement | null;
            if (!submenu) return;
            item.addEventListener('mouseenter', function () {
                const rect = item.getBoundingClientRect();
                submenu.style.display = 'block';
                submenu.style.position = 'fixed';
                const element = document.getElementById('autofeed-remote-sidebar') as HTMLElement | null;
                const height = element ? element.offsetHeight : 0;
                submenu.style.top = `${rect.top - window.innerHeight / 2 + height / 2}px`;
            });
            item.addEventListener('mouseleave', function () {
                submenu.style.display = 'none';
            });
        });
    }

    private static async getMeta(engine: any): Promise<TorrentMeta | null> {
        try {
            const meta = await engine.parse();
            return meta;
        } catch (err) {
            console.error('[Auto-Feed] Parse for remote push failed:', err);
            return null;
        }
    }

    private static async pushToQb(
        engine: any,
        server: any,
        path: string,
        tag: string,
        skipChecking: boolean,
        onStatus?: (text: string, kind?: 'info' | 'ok' | 'err', hideAfterMs?: number) => void
    ) {
        const meta = await this.getMeta(engine);
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
        const meta = await this.getMeta(engine);
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
        const meta = await this.getMeta(engine);
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
            right: 5px;
            transform: translateY(-50%);
            width: 70px;
            background-color: #2c3e50;
            border: none;
            border-radius: 8px;
            z-index: 9999;
        }
        #autofeed-remote-sidebar .sidebar-header {
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            padding: 8px 0;
            margin-bottom: 5px;
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
        #autofeed-remote-sidebar li a {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px 10px;
            text-decoration: none;
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }
        #autofeed-remote-sidebar li a:hover {
            background-color: #34495e;
        }
        #autofeed-remote-sidebar .submenu {
            display: none;
            position: absolute;
            left: -100%;
            width: 70px;
            background-color: #34495e;
            border-radius: 8px;
            box-shadow: -4px 0 10px rgba(0, 0, 0, 0.15);
            z-index: 10;
        }
        #autofeed-remote-sidebar .submenu li a {
            color: #bdc3c7;
            padding: 12px 10px;
            font-size: 13px;
        }
        #autofeed-remote-sidebar .submenu li a:hover {
            background-color: #4a6781;
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
