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
                const title = $('h1#top').first().add($('h1').first()).first();
                if (title.length) return title;
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

            let cachedMeta: any = null;

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

            const fetchBtn = $(`
                <button style="
                    background: #2c3e50;
                    color: white;
                    border: 1px solid #1a252f;
                    padding: 4px 10px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                    font-size: 12px;
                ">点击获取</button>
            `);

            // 2. Quick Links Container (Hidden by default, shown after parse/hover)
            const quickLinksRow = $('<div style="display: none; position: absolute; background: white; border: 1px solid #ddd; padding: 10px; border-radius: 4px; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 400px; margin-top: 5px;"></div>');

            fetchBtn.on('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                fetchBtn.text('获取中...');
                fetchBtn.prop('disabled', true);

                try {
                    let meta = await adapter.parse();
                    const { MetaCleaner } = await import('../services/MetaCleaner');
                    const { normalizeMeta } = await import('../common/legacy/normalize');
                    meta = MetaCleaner.clean(meta);
                    meta = normalizeMeta(meta);

                    const settings = await import('../services/SettingsService').then(m => m.SettingsService.load());
                    const { PtgenService } = await import('../services/PtgenService');
                    const updated = await PtgenService.applyPtgen(meta, {
                        imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                        ptgenApi: settings.ptgenApi ?? 3
                    });
                    cachedMeta = updated;
                    await StorageService.save(updated);

                    fetchBtn.text('已获取');
                } catch (err) {
                    console.error('[Auto-Feed] Ptgen Fetch Error:', err);
                    fetchBtn.text('获取失败');
                } finally {
                    setTimeout(() => {
                        fetchBtn.prop('disabled', false);
                        fetchBtn.text('点击获取');
                    }, 1500);
                }
            });

            forwardBtn.on('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                forwardBtn.find('span').text('⏳');
                forwardBtn.css('opacity', '0.8');

                try {
                    console.log('[Auto-Feed] Parsing metadata...');
                    let meta = cachedMeta ? { ...cachedMeta } : await adapter.parse();

                    // Clean metadata
                    const { MetaCleaner } = await import('../services/MetaCleaner');
                    const { normalizeMeta } = await import('../common/legacy/normalize');
                    meta = MetaCleaner.clean(meta);
                    meta = normalizeMeta(meta);

                    // --- TORRENT DOWNLOAD STEP (New) ---
                    if (meta.torrentUrl) {
                        try {
                            forwardBtn.find('span').text('⬇️'); // Feedback
                            console.log(`[Auto-Feed] Downloading torrent from: ${meta.torrentUrl}`);
                            const { TorrentService } = await import('../services/TorrentService');

                            // M-Team specific: ensure URL is absolute
                            // (Handled in NexusPHP, but valid check here)

                            const base64 = await TorrentService.download(meta.torrentUrl);
                            meta.torrentBase64 = base64;

                            // Generate filename if missing
                            if (!meta.torrentFilename) {
                                // Sanitized name + .torrent
                                const safeName = meta.title.replace(/[^a-zA-Z0-9.-]/g, '_').substring(0, 100);
                                meta.torrentFilename = `${safeName}.torrent`;
                            }

                            console.log(`[Auto-Feed] Torrent Downloaded (${base64.length} chars)`);
                        } catch (err) {
                            console.error('[Auto-Feed] Torrent Download Failed:', err);
                            // We do NOT stop the flow, we just warn. User might still want metadata.
                            alert('Torrent file download failed. Proceeding with metadata only.');
                        }
                    } else {
                        console.warn('[Auto-Feed] No torrent URL found for this item.');
                    }
                    // -----------------------------------

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
                    ForwardLinkService.injectForwardLinks(
                        quickLinksRow,
                        meta,
                        settings.enabledSites,
                        settings.favoriteSites,
                        { chdBaseUrl: settings.chdBaseUrl }
                    );
                    // Put quick search shortcuts in the forward popup, above image tools.
                    try {
                        const html = QuickSearchService.buildQuickSearchHtml(meta, settings.quickSearchList, settings.quickSearchPresets);
                        if (html) {
                            const block = $(`<div style="margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid #eee;"></div>`);
                            block.append($(html));
                            quickLinksRow.append(block);
                        }
                    } catch (e) {
                        console.warn('[Auto-Feed] QuickSearch build failed:', e);
                    }
                    QuickLinkService.injectImageTools(quickLinksRow, meta);
                    QuickLinkService.injectMetaFetchTools(quickLinksRow, meta);
                    quickLinksRow.show();

                    // Reposition logic for popup
                    const offset = forwardBtn.offset();
                    if (offset) {
                        quickLinksRow.css({
                            top: offset.top + (forwardBtn.outerHeight() || 30) + 5,
                            left: offset.left
                        });
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
            uiContainer.append(fetchBtn);

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
                    { chdBaseUrl: settings.chdBaseUrl }
                );
                QuickLinkService.injectImageTools($(linksPanel), meta);

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

        const notify = $(`<div id="autofeed-founddata-toast" style="position:fixed; bottom:10px; right:10px; z-index:99997; padding: 12px 14px; background: #4CAF50; color: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; max-width: 520px; pointer-events: auto;">
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
}
