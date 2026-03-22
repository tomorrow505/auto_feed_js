import $ from 'jquery';
import { TorrentMeta } from '../../types/TorrentMeta';
import { AppSettings } from '../SettingsService';
import { SiteCatalogService, isChineseNexusSite } from '../SiteCatalogService';
import { ForwardLinkService } from '../ForwardLinkService';
import { QuickLinkService } from '../QuickLinkService';
import { StorageService } from '../StorageService';
import { extractDoubanId, extractImdbId } from '../../common/rules/links';
import { renderQuickSearchHtml, resolveQuickSearchSetting } from '../../common/quickSearch';
import {
    buildKgLegacyInfo,
    getExclusiveSourceWarnings,
    getForwardTargetBlockReason,
    getForwardWarnings,
    openSettingsPanel,
    resolveFaviconUrl
} from './shared';

    export async function renderForwardRow(container: JQuery, meta: TorrentMeta, settings: AppSettings) {
        container.empty();

        const enabledSet = new Set(settings.enabledSites || []);
        const supported = SiteCatalogService.getSupportedSites().filter((s) => enabledSet.has(s.name));
        const exclusiveWarnings = getExclusiveSourceWarnings(meta);

        // --- Forward targets (one-line list with favicon, legacy-like) ---
        const forwardLine = document.createElement('div');
        forwardLine.style.whiteSpace = 'normal';
        forwardLine.style.lineHeight = '20px';

        const modeState = { searchMode: 1 }; // 1=upload (default), 0=search (查重)

        const refreshLinksHref = () => {
            const wantUpload = modeState.searchMode === 1;
            container.find('a.forward_a').each((_i, a) => {
                const el = a as HTMLAnchorElement;
                const upload = el.dataset.uploadHref || '#';
                const search = el.dataset.searchHref || '#';
                el.href = wantUpload ? upload : search;
            });
        };

        supported.forEach((site, idx) => {
            if (idx > 0) forwardLine.appendChild(document.createTextNode(' | '));

            const a = document.createElement('a');
            a.className = 'forward_a';
            a.id = site.name;
            a.target = '_blank';

            const iconUrl = resolveFaviconUrl(site.name, settings);
            const icon = document.createElement('img');
            icon.className = 'round_icon';
            icon.src = iconUrl;
            icon.onerror = () => {
                // keep silent; some sites block favicon without cookies.
            };

            const wrap = document.createElement('div');
            wrap.style.display = 'inline-block';
            wrap.style.marginBottom = '2px';
            wrap.append(icon, document.createTextNode(site.name));

            const uploadUrl = ForwardLinkService.getUploadUrl(site, {
                chdBaseUrl: settings.chdBaseUrl,
                tlBaseUrl: settings.tlBaseUrl,
                lang: settings.uiLanguage
            });
            const searchUrl = ForwardLinkService.getSearchUrl(site, meta, {
                chdBaseUrl: settings.chdBaseUrl,
                tlBaseUrl: settings.tlBaseUrl,
                lang: settings.uiLanguage
            });
            a.dataset.uploadHref = uploadUrl;
            a.dataset.searchHref = searchUrl;
            a.href = uploadUrl;
            a.appendChild(wrap);

            // Upload mode: pre-download torrent base64 and save to storage before navigation (legacy-ish reliability).
            a.addEventListener('click', (e) => {
                const isUploadMode = modeState.searchMode === 1;
                if (!isUploadMode) return; // let browser open search link normally

                e.preventDefault();
                e.stopPropagation();

                const blockReason = getForwardTargetBlockReason(site.name, meta);
                if (blockReason) {
                    alert(blockReason);
                    return;
                }

                const warnings = Array.from(new Set([...exclusiveWarnings, ...getForwardWarnings(site.name, meta)]));
                if (warnings.length) {
                    const ok = window.confirm(`转发到 ${site.name} 可能违反以下规则:\n${warnings.join('\n')}\n是否仍继续发布？`);
                    if (!ok) return;
                }

                const baseUploadUrl = a.dataset.uploadHref || a.href;
                let targetUrl = baseUploadUrl;
                const win = window.open('about:blank', '_blank');
                const go = () => {
                    try {
                        if (win) win.location.href = targetUrl;
                        else window.open(targetUrl, '_blank');
                    } catch {
                        window.open(targetUrl, '_blank');
                    }
                };

                (async () => {
                    try {
                        const metaToSave: any = { ...meta };
                        if (metaToSave.torrentUrl && !metaToSave.torrentBase64) {
                            const { TorrentService } = await import('../TorrentService');
                            const base64 = await TorrentService.download(metaToSave.torrentUrl);
                            metaToSave.torrentBase64 = base64;
                        }
                        const token = StorageService.generateHandoffToken();
                        targetUrl = StorageService.attachHandoffToken(baseUploadUrl, token);
                        await StorageService.saveHandoff(metaToSave, token);
                        await StorageService.save(metaToSave);
                        if (site.name === 'KG') {
                            const { GMAdapter } = await import('../GMAdapter');
                            await GMAdapter.setValue('kg_info', JSON.stringify(buildKgLegacyInfo(metaToSave)));
                        }
                    } catch {
                        // best-effort
                    } finally {
                        go();
                    }
                })();
            });

            forwardLine.appendChild(a);
        });

        const modeWrap = document.createElement('span');
        modeWrap.style.marginLeft = '10px';

        const check = document.createElement('input');
        check.type = 'checkbox';
        check.id = 'search_type';
        const label = document.createTextNode('查重');
        check.addEventListener('change', () => {
            modeState.searchMode = check.checked ? 0 : 1;
            refreshLinksHref();
        });
        modeWrap.append(check, label);
        forwardLine.appendChild(modeWrap);

        if (exclusiveWarnings.length) {
            const tip = document.createElement('div');
            tip.style.color = '#c0392b';
            tip.style.fontWeight = 'bold';
            tip.style.marginBottom = '6px';
            tip.textContent = '[疑似禁转/禁止转载]';
            tip.title = exclusiveWarnings.join('\n');
            rootWrap(container).append(tip);
        }
        rootWrap(container).append(forwardLine);

        // --- Tools row (legacy-ish text) ---
        const tools = document.createElement('div');
        tools.style.marginTop = '10px';
        tools.innerHTML = `<font color="green">Tools →</font> `;

        const mkTool = (text: string, title: string, onClick?: () => void, color?: string) => {
            const a = document.createElement('a');
            a.href = '#';
            a.textContent = text;
            a.title = title;
            if (color) (a.style as any).color = color;
            a.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                onClick?.();
            });
            return a;
        };

        const appendTool = (node: HTMLElement) => {
            tools.appendChild(node);
            tools.appendChild(document.createTextNode(' | '));
        };

        // 教程: keep legacy link for now.
        const wiki = document.createElement('a');
        wiki.textContent = '教程';
        wiki.title = 'Github/Gitee 教程';
        wiki.href = 'https://gitee.com/tomorrow505/auto_feed_js/wikis/pages';
        wiki.target = '_blank';
        wiki.style.color = 'red';
        appendTool(wiki);

        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const ptgenLink = document.createElement('a');
        ptgenLink.textContent = 'PTgen';
        ptgenLink.title = '打开 ptgen（IYUU）';
        ptgenLink.href = imdbId ? `https://api.iyuu.cn/ptgen/?imdb=${encodeURIComponent(imdbId)}` : 'https://api.iyuu.cn/ptgen/';
        ptgenLink.target = '_blank';
        appendTool(ptgenLink);

        appendTool(mkTool('提取图片', '打开图片处理弹窗', () => {
            QuickLinkService.openImageToolboxModal(meta, settings.uiLanguage || 'zh').catch((e) => {
                alert(`打开图片处理失败: ${String(e?.message || e)}`);
            });
        }));

        appendTool(mkTool('脚本设置', '打开设置弹窗 (Alt+S)', () => openSettingsPanel()));

        // Trim last separator
        try {
            if (tools.lastChild && tools.lastChild.nodeType === Node.TEXT_NODE) {
                const t = tools.lastChild.textContent || '';
                if (t.trim() === '|') tools.removeChild(tools.lastChild);
            }
        } catch {}
        rootWrap(container).append(tools);

        // --- Quick Search URLs (legacy-like look) ---
        addSearchUrls(container, meta, settings);
    }

    export function addSearchUrls(container: JQuery, meta: TorrentMeta, settings: AppSettings) {
        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const quickSearchSetting = resolveQuickSearchSetting(settings);
        const html = renderQuickSearchHtml(
            meta,
            quickSearchSetting.quickSearchList,
            quickSearchSetting.quickSearchPresets,
            {
                lang: quickSearchSetting.lang,
                className: 'autofeed-search-links',
                alignCenter: true,
                bordered: true,
                fontColor: 'red'
            }
        );
        if (!html) return;
        container.append('<br><br>');
        container.append(html);
        // Keep the legacy "no imdb" alert behavior: if none of the generated links has usable params, warn.
        if (!imdbId) {
            container.find('.autofeed-search-links a').on('click', (e) => {
                const href = (e.currentTarget as HTMLAnchorElement).href || '';
                // Best-effort heuristic: block obvious imdb-id searches when imdb is missing.
                if (href.match(/imdb/i) || extractImdbId(href)) {
                    e.preventDefault();
                    alert('当前影视没有IMDB信息！！');
                }
            });
        }
    }

    export function initButtonsForTransfer(container: JQuery, site: string, mode: 0 | 1, meta: TorrentMeta, settings: AppSettings) {
        container.empty();

        // Root marker for cleanup/scoping.
        container.attr('data-autofeed-embed-root', '1');
        try {
            const host = container.get(0) as HTMLElement | undefined;
            if (host) {
                // Some sites style td as nowrap; allow our controls to wrap.
                host.style.whiteSpace = 'normal';
                (host.style as any).overflowWrap = 'anywhere';
                (host.style as any).wordBreak = 'break-word';
            }
        } catch {}

        // imdb/douban input
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'input';
        input.id = 'input_box';
        input.value = meta.imdbUrl || meta.doubanUrl || '';

        // width rules (legacy)
        if (site === 'PTP') (input.style as any).width = '320px';
        else (input.style as any).width = '280px';
        // Prevent overflow on narrow containers (HDB/NP wrong insert point etc.).
        (input.style as any).maxWidth = '100%';
        (input.style as any).boxSizing = 'border-box';
        container.append(input);

        const searchBtn = document.createElement('input');
        searchBtn.type = 'button';
        searchBtn.id = 'search_button';
        searchBtn.value = '检索名称';
        (searchBtn.style as any).marginLeft = '12px';
        (searchBtn.style as any).marginRight = '4px';
        container.append(searchBtn);

        const enableFetchButton = isChineseNexusSite(site);
        let apiCb: HTMLInputElement | null = null;
        if (enableFetchButton) {
            apiCb = document.createElement('input');
            apiCb.type = 'checkbox';
            apiCb.id = 'douban_api';
            container.append(apiCb);
            container.append(document.createTextNode('API'));
        }

        const ptgenBtn = document.createElement('input');
        ptgenBtn.type = 'button';
        ptgenBtn.id = 'ptgen_button';
        ptgenBtn.value = 'ptgen跳转';
        (ptgenBtn.style as any).marginLeft = '12px';
        container.append(ptgenBtn);

        let fetchBtn: HTMLInputElement | null = null;
        if (enableFetchButton) {
            fetchBtn = document.createElement('input');
            fetchBtn.type = 'button';
            fetchBtn.id = 'douban_button';
            fetchBtn.value = '点击获取';
            (fetchBtn.style as any).marginLeft = '12px';
            container.append(fetchBtn);
        }

        // Optional textarea (legacy toggled by API checkbox)
        const textarea = document.createElement('textarea');
        textarea.id = 'textarea';
        (textarea.style as any).marginTop = '12px';
        (textarea.style as any).height = '120px';
        (textarea.style as any).width = site === 'PTP' ? '675px' : '580px';
        (textarea.style as any).maxWidth = '100%';
        (textarea.style as any).boxSizing = 'border-box';
        (textarea.style as any).display = 'none';
        container.append(textarea);

        if (apiCb) {
            apiCb.addEventListener('click', () => {
                if (apiCb?.checked) $(textarea).slideDown();
                else $(textarea).slideUp();
            });
        }

        const imgBtn = document.createElement('input');
        imgBtn.type = 'button';
        imgBtn.id = 'download_pngs';
        imgBtn.value = '转存截图';
        (imgBtn.style as any).marginLeft = '0px';
        (imgBtn.style as any).paddingLeft = '2px';
        container.append(imgBtn);

        imgBtn.onclick = () => {
            QuickLinkService.openImageToolboxModal(meta, settings.uiLanguage || 'zh').catch((e) => {
                alert(`打开图片处理失败: ${String(e?.message || e)}`);
            });
        };

        // ptgen跳转: open IYUU ptgen with current imdb id if possible
        ptgenBtn.onclick = () => {
            const v = (input.value || '').trim();
            const imdb = extractImdbId(v) || (meta.imdbId || '');
            const url = imdb ? `https://api.iyuu.cn/ptgen/?imdb=${encodeURIComponent(imdb)}` : 'https://api.iyuu.cn/ptgen/';
            window.open(url, '_blank');
        };

        // 点击获取: apply ptgen/douban fetch to meta (best-effort) and persist
        if (fetchBtn) {
            fetchBtn.onclick = async () => {
                try {
                    fetchBtn!.value = '获取中...';
                    const { PtgenService } = await import('../PtgenService');
                    const { SettingsService } = await import('../SettingsService');

                    const cur = { ...meta };
                    const v = (input.value || '').trim();
                    const imdbId = extractImdbId(v);
                    const doubanId = extractDoubanId(v);
                    if (imdbId) {
                        cur.imdbId = imdbId;
                        cur.imdbUrl = `https://www.imdb.com/title/${imdbId}/`;
                    }
                    if (doubanId) {
                        cur.doubanId = doubanId;
                        cur.doubanUrl = `https://movie.douban.com/subject/${doubanId}/`;
                    }

                    // API checkbox only overrides method for this click (legacy-ish feel).
                    const s = await SettingsService.load();
                    const imdbToDoubanMethod = apiCb?.checked ? 0 : (s.imdbToDoubanMethod || 0);
                    const updated = await PtgenService.applyPtgen(cur as any, {
                        imdbToDoubanMethod,
                        ptgenApi: s.ptgenApi ?? 3,
                        doubanCookie: s.doubanCookie || undefined
                    }, { mergeDescription: true, updateSubtitle: true, updateRegion: true, updateIds: true });

                    Object.assign(meta, updated);
                    await StorageService.save(meta);
                    fetchBtn!.value = '获取成功';
                    setTimeout(() => {
                        if (fetchBtn) fetchBtn.value = '点击获取';
                    }, 1200);
                } catch (e: any) {
                    fetchBtn!.value = '获取失败';
                    setTimeout(() => {
                        if (fetchBtn) fetchBtn.value = '点击获取';
                    }, 1200);
                }
            };
        }

        // Styling parity (legacy)
        if (mode === 1) {
            // center align for the PTP-style header row
            (container.get(0) as any).align = 'center';
            $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ border: '1px solid #2F3546', color: '#FFFFFF', backgroundColor: '#2F3546' });
        } else {
            // Unit3D/Nexus dark theme friendly
            $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ border: '1px solid #0D8ED9', color: '#FFFFFF', backgroundColor: '#292929' });
        }

        // Dark input/textarea for these sites (legacy list subset)
        if (['PTP', 'BLU', 'Tik', 'Audiences', 'HDSky', 'PTer', 'CMCT', 'CHDBits', 'KG'].includes(site)) {
            textarea.style.backgroundColor = '#4d5656';
            textarea.style.color = 'white';
            input.style.backgroundColor = '#4d5656';
            input.style.color = 'white';
        }
    }
function rootWrap(container: JQuery) {
    const el = container.get(0) as HTMLElement | undefined;
    if (!el) return container;
    el.dataset.autofeedEmbedRoot = '1';
    return container;
}
