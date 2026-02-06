type GMRequest = {
    method?: string;
    url: string;
    headers?: Record<string, string>;
    data?: any;
    responseType?: string;
    overrideMimeType?: string;
    // Tampermonkey/Greasemonkey options (best-effort, depends on manager)
    anonymous?: boolean;
    withCredentials?: boolean;
    onload?: (response: any) => void;
    onerror?: (error: any) => void;
    ontimeout?: () => void;
    onprogress?: (event: any) => void;
};

const hasGMObject = typeof GM !== 'undefined';

export class GMAdapter {
    static async getValue<T = any>(key: string, defaultValue?: T): Promise<T | undefined> {
        try {
            if (typeof GM_getValue !== 'undefined') {
                return GM_getValue(key, defaultValue);
            }
            if (hasGMObject && typeof GM.getValue === 'function') {
                return await GM.getValue(key, defaultValue);
            }
        } catch {}

        try {
            const raw = localStorage.getItem(key);
            if (raw === null || raw === undefined) return defaultValue;
            return raw as unknown as T;
        } catch {
            return defaultValue;
        }
    }

    static async setValue(key: string, value: any): Promise<void> {
        try {
            if (typeof GM_setValue !== 'undefined') {
                GM_setValue(key, value);
                return;
            }
            if (hasGMObject && typeof GM.setValue === 'function') {
                await GM.setValue(key, value);
                return;
            }
        } catch {}

        try {
            localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
        } catch {}
    }

    static async setClipboard(text: string): Promise<void> {
        try {
            if (typeof GM_setClipboard !== 'undefined') {
                GM_setClipboard(text);
                return;
            }
            if (hasGMObject && typeof GM.setClipboard === 'function') {
                await GM.setClipboard(text);
                return;
            }
        } catch {}

        try {
            await navigator.clipboard.writeText(text);
        } catch {}
    }

    static async deleteValue(key: string): Promise<void> {
        try {
            if (typeof GM_deleteValue !== 'undefined') {
                GM_deleteValue(key);
                return;
            }
            if (hasGMObject && typeof GM.deleteValue === 'function') {
                await GM.deleteValue(key);
                return;
            }
        } catch {}

        try {
            localStorage.removeItem(key);
        } catch {}
    }

    static xmlHttpRequest(details: GMRequest): Promise<any> {
        return new Promise((resolve, reject) => {
            const withCallbacks = {
                ...details,
                onload: (resp: any) => {
                    details.onload?.(resp);
                    resolve(resp);
                },
                onerror: (err: any) => {
                    details.onerror?.(err);
                    reject(err);
                },
                ontimeout: () => {
                    details.ontimeout?.();
                    reject(new Error('timeout'));
                }
            };

            if (typeof GM_xmlhttpRequest === 'function') {
                GM_xmlhttpRequest(withCallbacks);
                return;
            }

            if (hasGMObject && typeof GM.xmlHttpRequest === 'function') {
                const result = GM.xmlHttpRequest(withCallbacks as any);
                if (result && typeof (result as any).then === 'function') {
                    (result as any).then(resolve).catch(reject);
                }
                return;
            }

            reject(new Error('GM_xmlhttpRequest not available'));
        });
    }
}
