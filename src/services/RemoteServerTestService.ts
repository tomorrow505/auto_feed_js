import { GMAdapter } from './GMAdapter';
import { RemoteServerConfig } from './SettingsService';

const normalizeHost = (url: string): string => {
    if (!url) return '';
    return url.endsWith('/') ? url : `${url}/`;
};

export type RemoteTestResult = { ok: boolean; message: string };

export class RemoteServerTestService {
    static async testQbittorrent(server: { url: string; username: string; password: string }): Promise<RemoteTestResult> {
        const host = normalizeHost(server.url);
        if (!host) return { ok: false, message: 'URL 为空' };

        try {
            const login = await GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: `${host}api/v2/auth/login`,
                headers: { 'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8' },
                data: new URLSearchParams({ username: server.username, password: server.password }).toString()
            });
            if (login.status !== 200) {
                return { ok: false, message: `登录失败: HTTP ${login.status}` };
            }
        } catch (err: any) {
            return { ok: false, message: `登录失败: ${err?.message || String(err)}` };
        }

        try {
            const versionResp = await GMAdapter.xmlHttpRequest({
                method: 'GET',
                url: `${host}api/v2/app/version`
            });
            if (versionResp.status !== 200) return { ok: false, message: `Version 请求失败: HTTP ${versionResp.status}` };
            const ver = (versionResp.responseText || '').trim();
            return { ok: true, message: ver ? `OK: qBittorrent ${ver}` : 'OK' };
        } catch (err: any) {
            return { ok: false, message: `Version 请求失败: ${err?.message || String(err)}` };
        }
    }

    static async testTransmission(server: { url: string; username: string; password: string }): Promise<RemoteTestResult> {
        const host = normalizeHost(server.url);
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
                data: payload
            });

        try {
            const first = await requestOnce();
            if (first.status === 200) return { ok: true, message: 'OK: Transmission RPC' };
            if (first.status !== 409) return { ok: false, message: `RPC 失败: HTTP ${first.status}` };

            const match = (first.responseHeaders || '').match(/X-Transmission-Session-Id:\s*(.+)/i);
            const sid = match?.[1]?.trim();
            if (!sid) return { ok: false, message: 'RPC 失败: 缺少 Session-Id' };

            const second = await requestOnce(sid);
            if (second.status === 200) return { ok: true, message: 'OK: Transmission RPC' };
            return { ok: false, message: `RPC 失败: HTTP ${second.status}` };
        } catch (err: any) {
            return { ok: false, message: `RPC 失败: ${err?.message || String(err)}` };
        }
    }

    static async testDeluge(server: { url: string; password: string }): Promise<RemoteTestResult> {
        let host = normalizeHost(server.url);
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
            return { res, json, text };
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

        // Login success is the main signal. Some Deluge deployments block daemon.info but still allow add_torrent_file.
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

    static countServers(config: RemoteServerConfig | null): { qb: number; tr: number; de: number } {
        const qb = config?.qbittorrent ? Object.keys(config.qbittorrent).length : 0;
        const tr = config?.transmission ? Object.keys(config.transmission).length : 0;
        const de = config?.deluge ? Object.keys(config.deluge).length : 0;
        return { qb, tr, de };
    }
}
