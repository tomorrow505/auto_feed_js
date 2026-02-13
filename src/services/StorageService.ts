import { TorrentMeta } from '../types/TorrentMeta';
import { GMAdapter } from './GMAdapter';

const STORAGE_KEY = 'auto_feed_current_meta';
const HANDOFF_PREFIX = 'auto_feed_handoff_';
const HANDOFF_TOKEN_PARAM = 'autofeed_token';
const HANDOFF_TTL_MS = 2 * 60 * 60 * 1000;

type HandoffPayload = {
    meta: TorrentMeta;
    createdAt: number;
};

const randomToken = (): string => {
    try {
        if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
            return crypto.randomUUID().replace(/-/g, '');
        }
    } catch {}
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
};

const handoffKey = (token: string) => `${HANDOFF_PREFIX}${token}`;

const parseUrl = (url: string): URL | null => {
    try {
        return new URL(url, window.location.href);
    } catch {
        return null;
    }
};

const parseHandoff = (raw: string | null | undefined): HandoffPayload | null => {
    if (!raw) return null;
    try {
        return JSON.parse(raw) as HandoffPayload;
    } catch {
        return null;
    }
};

export const StorageService = {
    async save(meta: TorrentMeta): Promise<void> {
        await GMAdapter.setValue(STORAGE_KEY, JSON.stringify(meta));
    },

    async load(): Promise<TorrentMeta | null> {
        const data = await GMAdapter.getValue<string>(STORAGE_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data as string);
        } catch (e) {
            console.error('Failed to parse stored meta', e);
            return null;
        }
    },

    async clear(): Promise<void> {
        await GMAdapter.setValue(STORAGE_KEY, '');
    },

    generateHandoffToken(): string {
        return randomToken();
    },

    getHandoffTokenFromUrl(url = window.location.href): string | null {
        const parsed = parseUrl(url);
        if (!parsed) return null;
        const token = (parsed.searchParams.get(HANDOFF_TOKEN_PARAM) || '').trim();
        return token || null;
    },

    attachHandoffToken(url: string, token: string): string {
        const parsed = parseUrl(url);
        if (!parsed) return url;
        parsed.searchParams.set(HANDOFF_TOKEN_PARAM, token);
        return parsed.toString();
    },

    stripHandoffTokenFromCurrentUrl() {
        const parsed = parseUrl(window.location.href);
        if (!parsed) return;
        if (!parsed.searchParams.has(HANDOFF_TOKEN_PARAM)) return;
        parsed.searchParams.delete(HANDOFF_TOKEN_PARAM);
        history.replaceState(history.state, '', parsed.toString());
    },

    async saveHandoff(meta: TorrentMeta, token?: string): Promise<string> {
        const nextToken = token || this.generateHandoffToken();
        const payload: HandoffPayload = {
            meta,
            createdAt: Date.now()
        };
        await GMAdapter.setValue(handoffKey(nextToken), JSON.stringify(payload));
        return nextToken;
    },

    async loadHandoff(token: string): Promise<TorrentMeta | null> {
        if (!token) return null;
        const raw = await GMAdapter.getValue<string | null>(handoffKey(token), null);
        const payload = parseHandoff(raw);
        if (!payload?.meta) return null;
        if (!payload.createdAt || Date.now() - payload.createdAt > HANDOFF_TTL_MS) {
            await GMAdapter.deleteValue(handoffKey(token));
            return null;
        }
        return payload.meta;
    },

    async consumeHandoff(token: string): Promise<TorrentMeta | null> {
        const meta = await this.loadHandoff(token);
        await GMAdapter.deleteValue(handoffKey(token));
        return meta;
    },

    async consumeHandoffFromCurrentUrl(): Promise<TorrentMeta | null> {
        const token = this.getHandoffTokenFromUrl();
        if (!token) return null;
        const meta = await this.consumeHandoff(token);
        this.stripHandoffTokenFromCurrentUrl();
        return meta;
    }
};
