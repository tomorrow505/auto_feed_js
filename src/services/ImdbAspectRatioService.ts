import { extractImdbId } from '../common/rules/links';
import { GMAdapter } from './GMAdapter';

type ImdbAspectRatioCache = {
    aspectRatio: string;
    updatedAt: number;
    sourceUrl?: string;
};

export class ImdbAspectRatioService {
    private static readonly CACHE_PREFIX = 'autofeed_imdb_aspect_';
    private static readonly HELPER_PARAM = 'autofeed_cache_imdb';
    private static readonly CACHE_TTL_MS = 30 * 24 * 60 * 60 * 1000;

    private static cacheKey(imdbId: string): string {
        return `${this.CACHE_PREFIX}${extractImdbId(imdbId)}`;
    }

    static normalizeAspectRatio(value: string): string {
        const raw = String(value || '').replace(/\s+/g, ' ').trim();
        if (!raw) return '';
        const ratio = raw.match(/(\d+(?:\.\d+)?\s*:\s*\d+(?:\.\d+)?)/)?.[1] || '';
        if (ratio) return ratio.replace(/\s+/g, '');
        const dec = raw.match(/\b(\d(?:\.\d{1,3})?)\b/)?.[1] || '';
        if (dec) {
            const n = parseFloat(dec);
            if (Number.isFinite(n) && n > 1) return `${Number(n.toFixed(2))}:1`;
        }
        return raw;
    }

    static extractFromText(text: string): string {
        const source = String(text || '');
        if (!source.trim()) return '';
        const ratio =
            source.match(/Aspect ratio[\s\S]{0,120}?([0-9.]+\s*:\s*[0-9.]+)/i)?.[1] ||
            source.match(/Aspect ratio\s*[:：]?\s*([0-9.]+\s*:\s*[0-9.]+)/i)?.[1] ||
            source.match(/AspectRatio[\s\S]{0,120}?([0-9.]+\s*:\s*[0-9.]+)/i)?.[1] ||
            source.match(/"aspectRatio"\s*:\s*"([^"]+)"/i)?.[1] ||
            source.match(/aspectRatio&quot;:\s*&quot;([^&]+)&quot;/i)?.[1] ||
            source.match(/aspectRatio\\?":\\?"([^"\\]+)\\?"/i)?.[1] ||
            '';
        return this.normalizeAspectRatio(ratio);
    }

    private static pickAspectRatioFromJson(obj: any): string {
        if (!obj) return '';
        if (typeof obj === 'string') return this.extractFromText(obj);
        if (Array.isArray(obj)) {
            for (const item of obj) {
                const hit = this.pickAspectRatioFromJson(item);
                if (hit) return hit;
            }
            return '';
        }
        if (typeof obj !== 'object') return '';
        const direct = this.normalizeAspectRatio(String(obj.aspectRatio || obj.aspect_ratio || '').trim());
        if (direct) return direct;
        for (const v of Object.values(obj)) {
            const hit = this.pickAspectRatioFromJson(v);
            if (hit) return hit;
        }
        return '';
    }

    static extractFromDocument(doc: Document = document): string {
        try {
            const selectors = [
                'li.ipc-metadata-list__item',
                '[data-testid="hero__pageTitle"] ~ ul li',
                '[data-testid="Details"] li',
                '[data-testid="title-techspec_aspectratio"]',
                'section[data-testid="TechSpecs"] li',
                'tr',
                'div'
            ];
            for (const selector of selectors) {
                const nodes = Array.from(doc.querySelectorAll(selector));
                for (const node of nodes) {
                    const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
                    if (!/Aspect ratio/i.test(text)) continue;
                    const hit = this.extractFromText(text);
                    if (hit) return hit;
                }
            }
        } catch {}

        try {
            const ld = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
            for (const script of ld) {
                const text = script.textContent || '';
                let hit = this.extractFromText(text);
                if (!hit) {
                    try {
                        hit = this.pickAspectRatioFromJson(JSON.parse(text));
                    } catch {}
                }
                if (hit) return hit;
            }
        } catch {}

        try {
            const html = doc.documentElement?.outerHTML || '';
            return this.extractFromText(html);
        } catch {
            return '';
        }
    }

    static async fetchAspectRatio(imdbIdOrUrl: string): Promise<string> {
        const id = extractImdbId(imdbIdOrUrl);
        if (!id) return '';
        const urls = [
            `https://www.imdb.com/title/${id}/technical/?ref_=tt_spec_sm`,
            `https://www.imdb.com/title/${id}/`
        ];
        for (const url of urls) {
            try {
                const resp = await GMAdapter.xmlHttpRequest({
                    method: 'GET',
                    url,
                    headers: {
                        accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                        'accept-language': 'en-US,en;q=0.9'
                    }
                });
                const html = resp?.responseText || '';
                if (!html) continue;
                const doc = new DOMParser().parseFromString(html, 'text/html');
                const fromDoc = this.extractFromDocument(doc);
                if (fromDoc) {
                    await this.saveCachedAspectRatio(id, fromDoc, url);
                    return fromDoc;
                }
                const fromText = this.extractFromText(html);
                if (fromText) {
                    await this.saveCachedAspectRatio(id, fromText, url);
                    return fromText;
                }
            } catch {}
        }
        return '';
    }

    static async saveCachedAspectRatio(imdbId: string, aspectRatio: string, sourceUrl?: string): Promise<void> {
        const id = extractImdbId(imdbId);
        const normalized = this.normalizeAspectRatio(aspectRatio);
        if (!id || !normalized) return;
        const payload: ImdbAspectRatioCache = {
            aspectRatio: normalized,
            updatedAt: Date.now(),
            sourceUrl
        };
        await GMAdapter.setValue(this.cacheKey(id), JSON.stringify(payload));
    }

    static async getCachedAspectRatio(imdbId: string): Promise<string> {
        const id = extractImdbId(imdbId);
        if (!id) return '';
        const raw = await GMAdapter.getValue<string | null>(this.cacheKey(id), null);
        if (!raw) return '';
        try {
            const payload = JSON.parse(raw) as ImdbAspectRatioCache;
            if (!payload?.aspectRatio) return '';
            if (!payload.updatedAt || Date.now() - payload.updatedAt > this.CACHE_TTL_MS) return '';
            return this.normalizeAspectRatio(payload.aspectRatio);
        } catch {
            return '';
        }
    }

    static async waitForCachedAspectRatio(imdbId: string, timeoutMs = 8000): Promise<string> {
        const id = extractImdbId(imdbId);
        if (!id) return '';
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const hit = await this.getCachedAspectRatio(id);
            if (hit) return hit;
            await new Promise((resolve) => setTimeout(resolve, 250));
        }
        return '';
    }

    static primeFromImdbUrl(imdbUrl: string): void {
        const id = extractImdbId(imdbUrl);
        if (!id) return;
        const helperUrl = new URL(`https://www.imdb.com/title/${id}/technical/`);
        helperUrl.searchParams.set(this.HELPER_PARAM, '1');
        const helper = window.open(helperUrl.toString(), 'autofeed-imdb-aspect-helper');
        try { helper?.blur(); } catch {}
        try { window.focus(); } catch {}
    }

    static async tryHandleCurrentPage(): Promise<void> {
        const imdbId = extractImdbId(window.location.href);
        if (!imdbId || !/imdb\.com$/i.test(window.location.hostname)) return;

        let finished = false;
        const persist = async () => {
            if (finished) return;
            const aspectRatio = this.extractFromDocument(document);
            if (!aspectRatio) return;
            finished = true;
            await this.saveCachedAspectRatio(imdbId, aspectRatio, window.location.href);
            const parsed = new URL(window.location.href);
            if (parsed.searchParams.get(this.HELPER_PARAM) === '1') {
                setTimeout(() => {
                    try { window.close(); } catch {}
                }, 250);
            }
        };

        await persist();
        if (finished) return;

        const observer = new MutationObserver(() => {
            persist().catch(() => {});
            if (finished) observer.disconnect();
        });
        observer.observe(document.documentElement, { childList: true, subtree: true });

        const started = Date.now();
        const timer = window.setInterval(() => {
            persist().catch(() => {});
            if (finished || Date.now() - started > 15000) {
                observer.disconnect();
                window.clearInterval(timer);
            }
        }, 500);
    }
}
