import { SiteRegistry } from './SiteRegistry';
import { BaseEngine } from './BaseEngine';
import $ from 'jquery';
import { StorageService } from '../services/StorageService';
import { QuickLinkService } from '../services/QuickLinkService';
import { ForwardLinkService } from '../services/ForwardLinkService';
import { ListSearchService } from '../services/ListSearchService';
import { PageEnhancerService } from '../services/PageEnhancerService';
import { QuickSearchService } from '../services/QuickSearchService';
import { RemoteDownloadService } from '../services/RemoteDownloadService';
import { ImageUploadBridgeService } from '../services/ImageUploadBridgeService';
import { UploadMetaFetchService } from '../services/UploadMetaFetchService';

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
            await ImageUploadBridgeService.tryInject();
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
            await ListSearchService.tryInject();
        } catch (e) {
            console.error('[Auto-Feed] ListSearch Error:', e);
        }

        if (!this.activeEngine) return;

        const adapter = this.activeEngine; // Alias for legacy code mindset

        // Make sure floating forward UI doesn't leak across SPA navigations / non-source pages.
        // (Previously the floating FAB could persist and block Settings/Fill toast clicks.)
        if (!this.isForwardSourcePage(adapter, window.location.href)) {
            this.removeFloatingButton();
        }

        if (this.isUploadLikePage(window.location.href)) {
            try {
                await UploadMetaFetchService.tryInject(adapter);
            } catch (e) {
                console.error('[Auto-Feed] UploadMetaFetch Error:', e);
            }
        }

        // 1. INJECT UI IMMEDIATELY (Non-blocking)
        // Source Mode: Only show on "real" detail pages (legacy parity: don't show on list/home/etc.)
        if (this.isForwardSourcePage(adapter, window.location.href)) {
            // We don't await this, ensuring UI renders ASAP.
            // Any storage needs inside it should be handled internally or via the button click.
            this.injectForwardButton(adapter).catch(err => console.error('[Auto-Feed] Injection Error:', err));
        }

        // 2. CHECK STORAGE (Target Mode)
        // This can run in background
        try {
            const storedMeta = await StorageService.load();
            if (storedMeta) {
                if (this.isUploadLikePage(window.location.href)) {
                    this.injectFillButton(adapter, storedMeta);
                }
                if (!storedMeta.title && !storedMeta.description) {
                    this.showStatusToast('缓存存在但内容为空，可能解析失败。');
                }
            } else {
                if (this.isUploadLikePage(window.location.href)) {
                    this.showStatusToast('未检测到转发缓存，无法预填。');
                }
            }
        } catch (e) {
            console.error('[Auto-Feed] Storage Load Error:', e);
        }
    }

    private async injectForwardButton(adapter: BaseEngine) {
        console.log('[Auto-Feed] Starting injectForwardButton for:', adapter.siteName);

        const config = adapter.getConfig ? adapter.getConfig() : null;
        const selectorList: string[] = [];
        const titleSelectors = config?.selectors?.title;
        if (titleSelectors) {
            if (Array.isArray(titleSelectors)) selectorList.push(...titleSelectors);
            else selectorList.push(titleSelectors);
        }
        selectorList.push(
            'menu.torrent__buttons',
            '.torrent__buttons',
            'h1.bhd-title-h1',
            'h1.torrent__name',
            '.torrent-title',
            'h1#top',
            '#top',
            'h1',
            'h2',
            '.movie__details',
            '.movie-details',
            'td.rowhead:contains("标题")',
            'td.rowhead:contains("Title")'
        );

        // ... existing inline logic (attempt best effort)
            const findAnchor = () => {
            if (adapter.siteName === 'MTeam') {
                // Try to find the "Download" button or its container
                const btn = $('button.ant-btn-primary').first();
                if (btn.length) return btn.parent();
                return $('h2.pr-\\[2em\\]').parent();
            }
            // Prefer placing the inline buttons directly under the title for these sites.
            // Legacy script inserts near the main title/details area (not at the bottom of info tables).
            if (adapter.siteName === 'PTP') {
                const title = $('.page__title').first();
                if (title.length) return title;
            }
            if (adapter.siteName === 'HDB') {
                // Prefer the details-area title; avoid picking site header titles.
                const t1 = $('#details h1#top').first();
                if (t1.length) return t1;
                const t2 = $('#details h1').first();
                if (t2.length) return t2;
                const t3 = $('h1#top').first();
                if (t3.length) return t3;
                const t4 = $('h1.torrentname').first();
                if (t4.length) return t4;
                const t5 = $('h1').filter((_, el) => $(el).closest('#details').length > 0).first();
                if (t5.length) return t5;
            }
            if (adapter.siteName === 'CHDBits') {
                const title = $('h1#top').first().add($('#top').first()).add($('h1').first()).first();
                if (title.length) return title;
            }
            for (const sel of selectorList) {
                const el = $(sel).first();
                if (el.length && el.is(':visible')) {
                    const tag = (el.get(0)?.tagName || '').toLowerCase();
                    // If we found a heading/title element, return itself so we can insert AFTER it.
                    if (['h1', 'h2', 'h3'].includes(tag) || el.hasClass('page__title') || el.attr('id') === 'top') {
                        return el;
                    }
                    return el.parent().length ? el.parent() : el;
                }
            }
            return $();
        };

        const waitForAnchor = async () => {
            return new Promise<JQuery>((resolve) => {
                let attempts = 0;
                const interval = setInterval(() => {
                    attempts++;
                    const el = findAnchor();
                    if (el.length && el.is(':visible')) {
                        clearInterval(interval);
                        resolve(el);
                    } else if (attempts > 10) { // Reduced wait time
                        clearInterval(interval);
                        resolve($());
                    }
                }, 500);
            });
        };

        const anchor = await waitForAnchor();

        if (anchor.length) {
            console.log('[Auto-Feed] Anchor found:', anchor);
            // Inline UI is available, so ensure the floating fallback is not present.
            this.removeFloatingButton();

            // UI Container (placed under title on major sites)
            const uiContainer = $('<div class="autofeed-ui" style="display:flex; flex-wrap:wrap; align-items:center; gap:8px; margin-top:6px;"></div>');

            // 1. Forward Button
            const { SettingsService } = await import('../services/SettingsService');
            const uiLang = (await SettingsService.load()).uiLanguage || 'zh';
            const forwardLabel = uiLang === 'zh' ? '转发' : 'Reupload';

            const forwardBtn = $(`
                <button style="
                    background: linear-gradient(to bottom, #20B2AA, #008B8B); 
                    color: white; 
                    border: 1px solid #006666; 
                    padding: 4px 12px; 
                    border-radius: 4px; 
                    cursor: pointer; 
                    font-weight: bold; 
                    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                    display: flex; align-items: center; gap: 5px;
                    font-size: 13px;
                ">
                    <span>🚀</span> ${forwardLabel}
                </button>
            `);

            // 2. Quick Links Container (Hidden by default, shown after parse/hover)
            const quickLinksRow = $('<div style="display: none; position: absolute; background: white; border: 1px solid #ddd; padding: 10px; border-radius: 4px; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 400px; max-width: calc(100vw - 20px); margin-top: 5px;"></div>');

            forwardBtn.on('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                forwardBtn.find('span').text('⏳');
                forwardBtn.css('opacity', '0.8');

                try {
                    console.log('[Auto-Feed] Parsing metadata...');
                    let meta = await adapter.parse();

                    // Clean metadata
                    const { MetaCleaner } = await import('../services/MetaCleaner');
                    const { normalizeMeta } = await import('../common/legacy/normalize');
                    meta = MetaCleaner.clean(meta);
                    meta = normalizeMeta(meta);

                    console.log('[Auto-Feed] Parsed & Cleaned:', meta);
                    await StorageService.save(meta);
                    try {
                        const saved = await StorageService.load();
                        if (!saved || (!saved.title && !saved.description)) {
                            this.showStatusToast('转发缓存写入失败，请检查脚本权限/存储。');
                        }
                    } catch (err) {
                        console.error('[Auto-Feed] Storage Verify Error:', err);
                        this.showStatusToast('转发缓存校验失败，请检查脚本权限/存储。');
                    }

                    forwardBtn.find('span').text('✅');
                    // Show Forward/Search + Quick Links
                    const { ForwardLinkService } = await import('../services/ForwardLinkService');
                    const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());
                    // Global popup opacity (forward popup / dialogs / toolbox)
                    const popupOpacity = Math.min(1, Math.max(0.3, Number(settings.popupOpacity ?? 0.96)));
                    quickLinksRow.css('opacity', String(popupOpacity));
                    ForwardLinkService.injectForwardLinks(
                        quickLinksRow,
                        meta,
                        settings.enabledSites,
                        settings.favoriteSites,
                        { chdBaseUrl: settings.chdBaseUrl, lang: settings.uiLanguage }
                    );
                    // Put quick search shortcuts in the forward popup, above image tools.
                    try {
                        const html = QuickSearchService.buildQuickSearchHtml(meta, settings.quickSearchList, settings.quickSearchPresets, settings.uiLanguage);
                        if (html) {
                            const block = $(`<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #eee;"></div>`);
                            block.append($(html));
                            quickLinksRow.append(block);
                        }
                    } catch (e) {
                        console.warn('[Auto-Feed] QuickSearch build failed:', e);
                    }
                    QuickLinkService.injectImageTools(quickLinksRow, meta, settings.uiLanguage);
                    QuickLinkService.injectMetaFetchTools(quickLinksRow, meta, settings.uiLanguage);
                    quickLinksRow.show();

                    // Reposition logic for popup
                    const offset = forwardBtn.offset();
                    if (offset) {
                        const margin = 10;
                        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft || 0;
                        const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
                        const vw = window.innerWidth || document.documentElement.clientWidth || 1200;
                        const vh = window.innerHeight || document.documentElement.clientHeight || 800;

                        // Ensure the element is in DOM before measuring.
                        $('body').append(quickLinksRow);
                        const panelW = quickLinksRow.outerWidth() || 400;
                        const panelH = quickLinksRow.outerHeight() || 240;

                        let left = offset.left;
                        let top = offset.top + (forwardBtn.outerHeight() || 30) + 5;

                        // Clamp horizontally within viewport.
                        const maxLeft = scrollLeft + vw - panelW - margin;
                        if (left > maxLeft) left = maxLeft;
                        if (left < scrollLeft + margin) left = scrollLeft + margin;

                        // If bottom overflows, place above the button.
                        if (top + panelH + margin > scrollTop + vh) {
                            top = offset.top - panelH - margin;
                        }
                        if (top < scrollTop + margin) top = scrollTop + margin;

                        quickLinksRow.css({ top, left });
                        $('body').append(quickLinksRow); // Move to body to avoid overflow hidden
                    }

                } catch (e) {
                    console.error('[Auto-Feed] Parse Error:', e);
                    forwardBtn.find('span').text('❌');
                    alert('Parsing failed. Check console.');
                }
            });

            const placeInlineContainer = (target: JQuery) => {
                const tag = (target.get(0)?.tagName || '').toLowerCase();
                if (['h1', 'h2', 'h3'].includes(tag) || target.hasClass('page__title') || target.attr('id') === 'top') {
                    target.after(uiContainer);
                    return;
                }
                if (tag === 'tr') {
                    const colCount =
                        target.children('td,th').length ||
                        target.closest('table').find('tr').first().children('td,th').length ||
                        1;
                    const row = $(`<tr class="autofeed-row"><td colspan="${colCount}"></td></tr>`);
                    row.find('td').append(uiContainer);
                    target.after(row);
                    return;
                }
                if (['tbody', 'thead', 'tfoot', 'table'].includes(tag)) {
                    const table = tag === 'table' ? target : target.closest('table');
                    const colCount =
                        table.find('tr').first().children('td,th').length || 1;
                    const row = $(`<tr class="autofeed-row"><td colspan="${colCount}"></td></tr>`);
                    row.find('td').append(uiContainer);
                    const tbody = table.find('tbody').first();
                    if (tbody.length) tbody.prepend(row);
                    else table.prepend(row);
                    return;
                }
                target.append(uiContainer);
            };

            // Assemble
            if (adapter.siteName === 'MTeam') {
                anchor.after(uiContainer);
            } else {
                placeInlineContainer(anchor);
            }
            uiContainer.append(forwardBtn);

            // Auto-parse on load check
            adapter.parse().then(meta => {
                // Optional: Pre-fill status
            }).catch(() => { });

        } else {
            console.log('[Auto-Feed] No anchor found for inline button; using floating fallback');
            this.injectFloatingButton(adapter);
        }
    }

    private injectFloatingButton(adapter: BaseEngine) {
        const fabId = 'autofeed-fab-forced';
        console.log('[Auto-Feed] Attempting to inject floating button:', fabId);

        if (document.getElementById(fabId)) {
            console.log('[Auto-Feed] Floating button already exists');
            return;
        }

        const fab = document.createElement('div');
        fab.id = fabId;
        fab.style.cssText = `
            position: fixed !important;
            bottom: 100px !important;
            right: 30px !important;
            /* Keep this under our settings overlay to avoid blocking close clicks */
            z-index: 99998 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            align-items: flex-end !important;
            pointer-events: none !important;
        `;

        const mainBtn = document.createElement('button');
        // Label follows UI language
        const getMainLabel = async () => {
            try {
                const { SettingsService } = await import('../services/SettingsService');
                const lang = (await SettingsService.load()).uiLanguage || 'zh';
                return lang === 'zh' ? '🚀 转发种子' : '🚀 Reupload Torrent';
            } catch {
                return '🚀 转发种子';
            }
        };
        // Don't block injection on async settings load.
        mainBtn.innerText = '🚀 转发种子';
        getMainLabel().then((label) => { mainBtn.innerText = label; }).catch(() => { });
        mainBtn.style.cssText = `
            pointer-events: auto !important;
            background: linear-gradient(135deg, #20B2AA, #008B8B) !important;
            color: white !important;
            border: 2px solid white !important;
            border-radius: 50px !important;
            padding: 12px 24px !important;
            font-weight: bold !important;
            font-size: 14px !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5) !important;
            cursor: pointer !important;
            transition: transform 0.2s !important;
        `;

        const linksPanel = document.createElement('div');
        linksPanel.style.cssText = `
            display: none;
            pointer-events: auto !important;
            background: white !important;
            padding: 10px !important;
            border-radius: 8px !important;
            box-shadow: 0 4px 15px rgba(0,0,0,0.3) !important;
            min-width: 200px !important;
        `;

        mainBtn.onclick = async () => {
            mainBtn.innerText = '⏳ Parsing...';
            try {
                let meta = await adapter.parse();

                // Clean metadata
                const { MetaCleaner } = await import('../services/MetaCleaner');
                meta = MetaCleaner.clean(meta);

                await StorageService.save(meta);
                mainBtn.innerText = '✅ Parsed';

                // Load User Settings for Custom Sites
                const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());

                // Use JQuery for the panel content injection if needed, or vanilla
                // For now, simple text to prove it works
                $(linksPanel).empty();
                ForwardLinkService.injectForwardLinks(
                    $(linksPanel),
                    meta,
                    settings.enabledSites,
                    settings.favoriteSites,
                    { chdBaseUrl: settings.chdBaseUrl, lang: settings.uiLanguage }
                );
                QuickLinkService.injectImageTools($(linksPanel), meta, settings.uiLanguage);

                linksPanel.style.display = 'block';

                setTimeout(async () => { mainBtn.innerHTML = await getMainLabel(); }, 3000);
            } catch (e) {
                console.error(e);
                mainBtn.innerText = '❌ Error';
            }
        };

        fab.appendChild(linksPanel);
        fab.appendChild(mainBtn);

        // Robust Append
        (document.body || document.documentElement).appendChild(fab);
        console.log('[Auto-Feed] Floating button matched and appended to body');
    }

    private removeFloatingButton() {
        const fab = document.getElementById('autofeed-fab-forced');
        if (fab) fab.remove();
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
            const { normalizeMeta } = await import('../common/legacy/normalize');
            const normalized = normalizeMeta(meta, adapter.siteName);
            const ready = await this.waitForForm();
            if (ready) {
                await adapter.fill(normalized);
                // Apply default anonymous after form is present and filled.
                try {
                    const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());
                    this.applyDefaultAnonymous(!!settings.defaultAnonymous);
                } catch {}
                notify.find('#autofeed-fill-btn').text('已自动填充');
            }
        } catch (e) {
            console.error('[Auto-Feed] Auto Fill Error:', e);
        }

        notify.find('#autofeed-fill-btn').on('click', async () => {
            notify.find('#autofeed-fill-btn').text('Filling...');
            const { normalizeMeta } = await import('../common/legacy/normalize');
            const normalized = normalizeMeta(meta, adapter.siteName);
            await adapter.fill(normalized);
            try {
                const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());
                this.applyDefaultAnonymous(!!settings.defaultAnonymous);
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

    private isUploadLikePage(url: string): boolean {
        return !!url.match(/upload|offer|torrents\/create|torrents\/upload|torrent\/upload|torrents\/add|upload\.php|p_torrent\/video_upload|#\/torrent\/add|\/torrent\/add/i);
    }

    private isForwardSourcePage(adapter: BaseEngine, url: string): boolean {
        const u = new URL(url, window.location.origin);
        const path = u.pathname || '';
        const qs = u.search || '';

        // PTP: only when a specific torrent is targeted (torrentid present).
        if (adapter.siteName === 'PTP') {
            return path.includes('torrents.php') && /torrentid=\d+/i.test(qs);
        }
        // HDB / CHDBits: details.php?id=...
        if (adapter.siteName === 'HDB' || adapter.siteName === 'CHDBits') {
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

    private applyDefaultAnonymous(enable: boolean) {
        // Best-effort across common PT upload forms.
        const selectors = [
            'input[type="checkbox"][name="anonymous"]',
            'input[type="checkbox"][name="anon"]',
            'input[type="checkbox"]#anonymous',
            'input[type="checkbox"]#anon',
            'input[type="checkbox"][name="anony"]'
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel) as HTMLInputElement | null;
            if (!el) continue;
            el.checked = enable;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('click', { bubbles: true }));
            break;
        }
    }
}
