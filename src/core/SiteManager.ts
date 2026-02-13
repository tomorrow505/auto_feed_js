import { SiteRegistry } from './SiteRegistry';
import { BaseEngine } from './BaseEngine';
import $ from 'jquery';
import { StorageService } from '../services/StorageService';
import { QuickLinkService } from '../services/QuickLinkService';
import { ForwardLinkService } from '../services/ForwardLinkService';
import { PageEnhancerService, QuickSearchService } from '../services/PageEnhancerService';
import { RemoteDownloadService } from '../services/RemoteDownloadService';
import { ImageHostService } from '../services/ImageHostService';
import { UploadMetaFetchService, AutoDownloadAfterUploadService } from '../services/UploadMetaFetchService';
import { EmbedService } from '../services/EmbedService';

export class SiteManager {
    private activeEngine: BaseEngine | null = null;

    constructor() {
        this.detectSite();
    }

    private detectSite() {
        const url = window.location.href;
        console.log(`[Auto-Feed] Detecting site for URL: ${url}`);

        this.activeEngine = SiteRegistry.getEngine(url);

        if (this.activeEngine) {
            console.log(`[Auto-Feed] Active Engine: ${this.activeEngine.siteName}`);
        } else {
            console.log('[Auto-Feed] No matching engine found for this site.');
        }
    }

    async run() {
        // Page-level enhancers (PTP/HDB ratings etc.)
        try {
            await PageEnhancerService.tryEnhance();
        } catch (e) {
            console.error('[Auto-Feed] PageEnhancer Error:', e);
        }

        // Douban/IMDb quick search tools
        try {
            await QuickSearchService.tryInject();
        } catch (e) {
            console.error('[Auto-Feed] QuickSearch Error:', e);
        }

        // Image host upload bridge (imgbox/hdbimg/etc.)
        try {
            await ImageHostService.tryInjectImageQueueBridge();
        } catch (e) {
            console.error('[Auto-Feed] ImageHost Error:', e);
        }

        // Remote download sidebar
        try {
            await RemoteDownloadService.tryInject();
        } catch (e) {
            console.error('[Auto-Feed] RemoteDownload Error:', e);
        }

        // List-page quick search injection (independent of engine)
        try {
            await QuickSearchService.tryInjectList();
        } catch (e) {
            console.error('[Auto-Feed] ListSearch Error:', e);
        }

        if (!this.activeEngine) return;

        const adapter = this.activeEngine; // Alias for legacy code mindset
        // If we just uploaded via Auto-Feed, auto-download the newly created torrent on detail pages.
        try {
            AutoDownloadAfterUploadService.tryAutoDownload(adapter, this.isUploadLikePage(window.location.href)).catch(() => {});
        } catch {}

        const uploadLikePage = this.isUploadLikePage(window.location.href);
        if (uploadLikePage) {
            try {
                await UploadMetaFetchService.tryInject(adapter);
            } catch (e) {
                console.error('[Auto-Feed] UploadMetaFetch Error:', e);
            }
        }

        // 1. INJECT UI IMMEDIATELY (Non-blocking)
        // Source Mode: Only show on "real" detail pages (legacy parity: don't show on list/home/etc.)
        if (this.isForwardSourcePage(adapter, window.location.href)) {
            // Embedded transfer/search UI injection on source detail pages.
            this.injectEmbeddedUI(adapter).catch(err => console.error('[Auto-Feed] Injection Error:', err));
        }

        // 2. CHECK FOR FORWARD HANDOFF (Target Mode)
        try {
            if (uploadLikePage) {
                const hasToken = !!StorageService.getHandoffTokenFromUrl();
                const handoffMeta = await StorageService.consumeHandoffFromCurrentUrl();
                if (handoffMeta) {
                    this.injectFillButton(adapter, handoffMeta);
                } else if (hasToken) {
                    this.showStatusToast('转发缓存已过期，请返回源站重新点击转发链接。');
                }
            }
        } catch (e) {
            console.error('[Auto-Feed] Handoff Load Error:', e);
        }
    }

    private async injectEmbeddedUI(adapter: BaseEngine) {
        console.log('[Auto-Feed] Starting injectEmbeddedUI for:', adapter.siteName);
        try {
            const { SettingsService } = await import('../services/SettingsService');
            const settings = await SettingsService.load();

            // Parse immediately, store, then inject DOM using legacy-ish layout.
            let meta = await adapter.parse();
            const { normalizeMeta } = await import('../common/rules/normalize');
            meta = this.cleanMeta(meta);
            meta = normalizeMeta(meta, adapter.siteName);
            await StorageService.save(meta);

            await EmbedService.inject(adapter, meta, settings);
        } catch (e) {
            console.error('[Auto-Feed] Embed injection failed:', e);
        }
    }

    private async injectFillButton(adapter: BaseEngine, meta: any) {
        // Single instance (SPA-safe)
        $('#autofeed-founddata-toast').remove();

        let toastOpacity = 0.95;
        try {
            const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());
            toastOpacity = Math.min(1, Math.max(0.3, Number(settings.toastOpacity ?? 0.95)));
        } catch { }

        const notify = $(`<div id="autofeed-founddata-toast" style="position:fixed; bottom:10px; right:10px; z-index:99997; padding: 12px 14px; background: #4CAF50; color: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; max-width: 520px; pointer-events: auto; opacity:${toastOpacity};">
        <span style="font-size: 12px;">Found Data: <strong>${meta.title}</strong></span>
        <button id="autofeed-fill-btn" style="background: white; color: #4CAF50; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;">重新填充</button>
        <button id="autofeed-close-btn" style="background: transparent; color: white; border: 1px solid white; padding: 4px 8px; border-radius: 3px; cursor: pointer;">Close</button>
      </div>`);

        $('body').append(notify);

        // Auto-fill once on upload-like pages
        try {
            const { normalizeMeta } = await import('../common/rules/normalize');
            const normalized = normalizeMeta(meta, adapter.siteName);
            const ready = await this.waitForForm();
            if (ready) {
                await adapter.fill(normalized);
                // Apply default anonymous after form is present and filled.
                try {
                    const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());
                    this.applyDefaultAnonymousWithRetry(!!settings.defaultAnonymous);
                } catch {}
                try {
                    AutoDownloadAfterUploadService.hookUploadForm(adapter, normalized).catch(() => {});
                } catch {}
                notify.find('#autofeed-fill-btn').text('已自动填充');
            }
        } catch (e) {
            console.error('[Auto-Feed] Auto Fill Error:', e);
        }

        notify.find('#autofeed-fill-btn').on('click', async () => {
            notify.find('#autofeed-fill-btn').text('Filling...');
            const { normalizeMeta } = await import('../common/rules/normalize');
            const normalized = normalizeMeta(meta, adapter.siteName);
            await adapter.fill(normalized);
            try {
                const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());
                this.applyDefaultAnonymousWithRetry(!!settings.defaultAnonymous);
            } catch {}
            try {
                AutoDownloadAfterUploadService.hookUploadForm(adapter, normalized).catch(() => {});
            } catch {}
            notify.find('#autofeed-fill-btn').text('Done!');
            setTimeout(() => notify.fadeOut(), 2000);
        });

        // 点击获取仅在源站转发处提供，上传页面不提供

        notify.find('#autofeed-close-btn').on('click', () => {
            notify.stop(true, true).fadeOut(150, () => notify.remove());
        });
    }

    private showStatusToast(message: string) {
        const toast = $(`<div style="position:fixed; bottom:60px; right:10px; z-index:9999; padding: 10px 12px; background: #e67e22; color: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); font-size: 12px;">
            ${message}
        </div>`);
        // Best-effort: apply toast opacity without blocking.
        try {
            import('../services/SettingsService')
                .then(m => m.SettingsService.load())
                .then((settings) => {
                    const o = Math.min(1, Math.max(0.3, Number(settings.toastOpacity ?? 0.95)));
                    toast.css('opacity', String(o));
                })
                .catch(() => { });
        } catch { }
        $('body').append(toast);
        setTimeout(() => toast.fadeOut(600, () => toast.remove()), 3000);
    }

    private cleanMeta(meta: any): any {
        let desc = meta?.description || '';

        desc = desc.replace(/\[url=[^\]]+\](\[img\].*?\[\/img\])\[\/url\]/gi, '$1');
        desc = desc.replace(/\[url\](\[img\].*?\[\/img\])\[\/url\]/gi, '$1');

        const footprints = [
            /Transferred by.*?/gi,
            /Uploaded by.*?/gi,
            /Reposted from.*?/gi,
            /\[quote\].*?Internal.*?\[\/quote\]/gis,
            /This torrent was uploaded by.*/gi,
            /Originally uploaded by.*/gi
        ];
        footprints.forEach((regex) => {
            desc = desc.replace(regex, '');
        });

        desc = desc.replace(/\[quote\]Thanks to.*?\[\/quote\]/gis, '');
        desc = desc.replace(/\[quote\]\s*\[\/quote\]/g, '');
        desc = desc.replace(/\n\s*\n\s*\n/g, '\n\n');

        return {
            ...meta,
            description: String(desc || '').trim()
        };
    }

    private isUploadLikePage(url: string): boolean {
        return !!url.match(/upload|offer|torrents\/create|torrents\/upload|torrent\/upload|torrents\/add|upload\.php|p_torrent\/video_upload|#\/torrent\/add|\/torrent\/add/i);
    }

    private isForwardSourcePage(adapter: BaseEngine, url: string): boolean {
        const u = new URL(url, window.location.origin);
        const path = u.pathname || '';
        const qs = u.search || '';

        // TTG legacy detail path: /t/{id}
        if (adapter.siteName === 'TTG') {
            return /\/t\/\d+/i.test(path) || (/details\.php/i.test(path) && /id=\d+/i.test(qs));
        }
        // PTP: only when a specific torrent is targeted (torrentid present).
        if (adapter.siteName === 'PTP') {
            return path.includes('torrents.php') && /torrentid=\d+/i.test(qs);
        }
        // Gazelle movie/music details (GPW/RED/OPS/DIC/SC/etc): torrents.php?id=...&torrentid=...
        if (['GPW', 'RED', 'OPS', 'DIC'].includes(adapter.siteName)) {
            return path.includes('torrents.php') && /torrentid=\d+/i.test(qs);
        }
        // HDB / CHDBits: details.php?id=...
        if (adapter.siteName === 'HDB' || adapter.siteName === 'CHDBits') {
            return /details\.php/i.test(path) && /id=\d+/i.test(qs);
        }
        // OpenCD source detail pages (new + old layouts)
        if (adapter.siteName === 'OpenCD') {
            return /details\.php/i.test(path) && /id=\d+/i.test(qs);
        }
        // Default fallback
        return !!url.match(/details?(\.php)?|threads|topics|torrents\/\d+|detail\/\d+|detail\//i);
    }

    private async waitForForm(): Promise<boolean> {
        const selectors = [
            'input[name="name"]',
            'input#name',
            'input#titleauto',
            'input[name="title"]',
            'textarea[name="descr"]',
            'textarea[name="description"]',
            'input[name="torrentfile"]',
            'input[type="file"]#torrent',
            'input[name="torrent"]',
            '#torrent-input'
        ];

        for (let i = 0; i < 20; i++) {
            if (selectors.some((sel) => document.querySelector(sel))) return true;
            await new Promise((r) => setTimeout(r, 500));
        }
        return false;
    }

    private applyDefaultAnonymousOnce(enable: boolean): { applied: boolean; verified: boolean } {
        const attempt = (): { applied: boolean; verified: boolean } => {
            // Some sites use select-based anonymity.
            try {
                const sel = document.querySelector('select[name="anonymity"]') as HTMLSelectElement | null;
                if (sel) {
                    const want = enable ? 'yes' : 'no';
                    const opt = Array.from(sel.options).find((o) => (o.value || '').toLowerCase() === want);
                    if (opt) {
                        sel.value = opt.value;
                        sel.dispatchEvent(new Event('change', { bubbles: true }));
                        sel.dispatchEvent(new Event('input', { bubbles: true }));
                        return { applied: true, verified: (sel.value || '') === opt.value };
                    }
                }
            } catch {}

            // Some Nexus variants use `uplver` as radio group or checkbox.
            try {
                const uplver = Array.from(document.querySelectorAll('input[name="uplver"]')) as HTMLInputElement[];
                if (uplver.length) {
                    const anyRadio = uplver.some((e) => (e.type || '').toLowerCase() === 'radio');
                    if (anyRadio) {
                        const yes = uplver.find((e) => (e.value || '').match(/^(yes|1|true|on)$/i)) || uplver[0];
                        const no =
                            uplver.find((e) => (e.value || '').match(/^(no|0|false|off)$/i)) ||
                            uplver[1] ||
                            uplver[0];
                        const target = enable ? yes : no;
                        if (!target.disabled) {
                            try {
                                target.click();
                            } catch {
                                target.checked = true;
                            }
                        }
                        target.dispatchEvent(new Event('change', { bubbles: true }));
                        target.dispatchEvent(new Event('input', { bubbles: true }));
                        return { applied: true, verified: !!target.checked };
                    }
                    // Checkbox-like: set all matches (some pages duplicate it).
                    let verifiedAny = false;
                    uplver.forEach((el) => {
                        if (!el.disabled) {
                            try {
                                if (el.checked !== enable) el.click();
                            } catch {
                                el.checked = enable;
                            }
                        }
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        if (el.checked === enable) verifiedAny = true;
                    });
                    return { applied: true, verified: verifiedAny };
                }
            } catch {}

            // Generic radio-group anonymity (some sites use `anonymous` as radio with [No, Yes]).
            try {
                const names = ['anonymous', 'anon', 'anony', 'is_anonymous'];
                for (const n of names) {
                    const els = Array.from(document.querySelectorAll(`input[name="${n}"]`)) as HTMLInputElement[];
                    if (!els.length) continue;
                    const anyRadio = els.some((e) => (e.type || '').toLowerCase() === 'radio');
                    if (!anyRadio) continue;
                    const yes = els.find((e) => (e.value || '').match(/^(yes|1|true|on)$/i)) || els[1] || els[0];
                    const no = els.find((e) => (e.value || '').match(/^(no|0|false|off)$/i)) || els[0];
                    const target = enable ? yes : no;
                    if (!target.disabled) {
                        try {
                            target.click();
                        } catch {
                            target.checked = true;
                        }
                    }
                    target.dispatchEvent(new Event('change', { bubbles: true }));
                    target.dispatchEvent(new Event('input', { bubbles: true }));
                    return { applied: true, verified: !!target.checked };
                }
            } catch {}

            // Best-effort across common PT upload forms (legacy parity: `uplver`).
            const selectors = [
                'input[type="checkbox"][name="uplver"]',
                'input[type="checkbox"]#uplver',
                'input[type="checkbox"][name="anonymous"]',
                'input[type="checkbox"][name="anon"]',
                'input[type="checkbox"]#anonymous',
                'input[type="checkbox"]#anon',
                'input[type="checkbox"][name="anony"]',
                'input[type="checkbox"][name="is_anonymous"]',
                // Unit3D-like variants
                'input[type="checkbox"][name="anonymous_upload"]',
                'input[type="checkbox"][name="upload_anonymous"]',
                'input[type="checkbox"][name="upload_anonymously"]',
                'input[type="checkbox"]#anonymous_upload'
            ];
            let applied = false;
            let verified = false;
            for (const sel of selectors) {
                const el = document.querySelector(sel) as HTMLInputElement | null;
                if (!el) continue;
                applied = true;
                if (!el.disabled) {
                    try {
                        if (el.checked !== enable) el.click();
                    } catch {
                        el.checked = enable;
                    }
                }
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('input', { bubbles: true }));
                verified = el.checked === enable;
                if (verified) return { applied, verified };
            }

            // Label-driven anonymity toggles (Unit3D and some modern forms).
            // Legacy parity: match by visible label text and click it if needed.
            try {
                const patterns = [/匿名上传/i, /Anonymous\\s*Upload/i, /^Anonymous$/i];
                const labels = Array.from(document.querySelectorAll('label')) as HTMLLabelElement[];
                for (const lab of labels) {
                    const text = (lab.textContent || '').replace(/\\s+/g, ' ').trim();
                    if (!text) continue;
                    if (!patterns.some((re) => re.test(text))) continue;

                    const forId = (lab.getAttribute('for') || '').trim();
                    const byFor = forId ? (document.getElementById(forId) as HTMLInputElement | null) : null;
                    const byChild = (lab.querySelector('input') as HTMLInputElement | null) || null;
                    const input = byFor || byChild;

                    // Avoid blind-clicking labels without an actual input: it can toggle twice under retries.
                    if (!input) continue;

                    const t = (input.type || '').toLowerCase();
                    if (t === 'checkbox') {
                        if (input.checked === enable) return { applied: true, verified: true };
                        applied = true;
                        if (!input.disabled) {
                            try {
                                lab.click();
                            } catch {
                                input.checked = enable;
                            }
                        } else {
                            input.checked = enable;
                        }
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        return { applied: true, verified: input.checked === enable };
                    }
                    if (t === 'radio') {
                        if (!enable) continue; // For radio groups, we only attempt to enable.
                        if (input.checked) return { applied: true, verified: true };
                        applied = true;
                        if (!input.disabled) {
                            try {
                                lab.click();
                            } catch {
                                input.checked = true;
                            }
                        } else {
                            input.checked = true;
                        }
                        input.dispatchEvent(new Event('change', { bubbles: true }));
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                        return { applied: true, verified: !!input.checked };
                    }
                }
            } catch {}
            return { applied, verified };
        };
        return attempt();
    }

    private applyDefaultAnonymousWithRetry(enable: boolean, timeoutMs = 12_000, intervalMs = 450) {
        try {
            const startedAt = Date.now();
            let lastAppliedAt = 0;
            let verifiedStreak = 0;

            const tick = () => {
                const now = Date.now();
                if (now - lastAppliedAt < Math.max(200, Math.floor(intervalMs / 2))) return;
                lastAppliedAt = now;

                const r = this.applyDefaultAnonymousOnce(enable);
                if (r.verified) verifiedStreak++;
                if (verifiedStreak >= 2) return true;
                if (now - startedAt > timeoutMs) return true;
                return false;
            };

            // Immediate attempt + interval retries (for SPA/delayed forms).
            if (tick()) return;
            const timer = window.setInterval(() => {
                if (tick()) window.clearInterval(timer);
            }, intervalMs);
        } catch {}
    }
}
