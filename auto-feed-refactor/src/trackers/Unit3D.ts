
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import $ from 'jquery';
import { GMAdapter } from '../services/GMAdapter';
import { SettingsService } from '../services/SettingsService';

export class Unit3DEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing Unit3D page...');

        // Standard Unit3D Selectors
        const selectors = {
            title: 'h1.text-center, h1',
            description: '.panel-body.markdown-body, .panel-body',
            category: '.list-group-item:contains("Category") span',
            size: '.list-group-item:contains("Size") span',
            imdb: '.list-group-item:contains("IMDB") a', // Link usually
            tmdb: '.list-group-item:contains("TMDB") a',
        };

        // Allow config overrides
        const configSelectors = this.config.selectors || {};

        // Helper to try multiple selectors
        const getText = (selector: string | string[] | undefined): string => {
            if (!selector) return '';
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    const el = $(s);
                    if (el.length && el.text().trim()) return el.text().trim();
                }
                return '';
            }
            return $(selector).text().trim();
        };

        const getElement = (selector: string | string[] | undefined): Element | null => {
            if (!selector) return null;
            if (Array.isArray(selector)) {
                for (const s of selector) {
                    const el = $(s);
                    if (el.length) return el[0];
                }
                return null;
            }
            const el = $(selector);
            return el.length ? el[0] : null;
        };

        let title = getText(configSelectors.title) || getText(selectors.title);

        // Cleanup title (remove badges sometimes inside h1)
        title = title.replace(/\[.*?\]/g, '').trim();

        const descrEl = getElement(configSelectors.description) || getElement(selectors.description);
        const description = descrEl ? htmlToBBCode(descrEl) : '';

        const meta: TorrentMeta = {
            title: title,
            description: description, // TODO: Convert HTML to BBCode
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images: [],
        };

        // Attempt to find IDs
        const imdbLink = $(selectors.imdb).attr('href');
        if (imdbLink) {
            const match = imdbLink.match(/tt\d+/);
            if (match) meta.imdbId = match[0];
        }

        const tmdbLink = $(selectors.tmdb).attr('href');
        if (tmdbLink) {
            meta.tmdbUrl = tmdbLink;
            const id = tmdbLink.match(/themoviedb\.org\/(tv|movie)\/(\d+)/i)?.[2];
            if (id) meta.tmdbId = id;
        }

        const image = $('.movie-poster img, .sidebar img').attr('src');
        if (image) {
            meta.images.push(image);
        }

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling Unit3D form...');

        const formSelectors = {
            name: 'input[name="name"]',
            description: 'textarea[name="description"]',
            imdb: 'input[name="imdb_id"]',
            tmdb: 'input[name="tmdb_id"]',
            category: 'select[name="category_id"]',
            type: 'select[name="type_id"]',
        };

        $(formSelectors.name).val(meta.title);
        $(formSelectors.description).val(meta.description);

        if (meta.imdbId) {
            $(formSelectors.imdb).val(meta.imdbId);
        }

        // TMDB id: if missing but imdb exists and api key is configured, try to resolve via TMDB find API.
        if (!meta.tmdbId && meta.imdbId) {
            try {
                const settings = await SettingsService.load();
                if (settings.tmdbApiKey) {
                    const api = `https://api.themoviedb.org/3/find/${meta.imdbId}?api_key=${settings.tmdbApiKey}&external_source=imdb_id`;
                    await new Promise<void>((resolve) => {
                        GMAdapter.xmlHttpRequest({
                            method: 'GET',
                            url: api,
                            onload: (resp: any) => {
                                try {
                                    const data = JSON.parse(resp.responseText || '{}');
                                    const movieId = data?.movie_results?.[0]?.id;
                                    const tvId = data?.tv_results?.[0]?.id;
                                    if (movieId) meta.tmdbId = String(movieId);
                                    if (tvId) meta.tmdbId = String(tvId);
                                } catch {}
                                resolve();
                            },
                            onerror: () => resolve()
                        }).catch(() => resolve());
                    });
                }
            } catch {}
        }

        if (meta.tmdbId) {
            $(formSelectors.tmdb).val(meta.tmdbId);
        } else if (meta.tmdbUrl) {
            const id = meta.tmdbUrl.match(/themoviedb\.org\/(tv|movie)\/(\d+)/i)?.[2];
            if (id) $(formSelectors.tmdb).val(id);
        }

        // Best-effort selects by matching option text
        const pickOption = (selector: string, keywords: (string | RegExp)[]) => {
            const select = document.querySelector(selector) as HTMLSelectElement | null;
            if (!select) return;
            const opts = Array.from(select.options);
            const found = opts.find((opt) => {
                const text = opt.textContent?.trim() || '';
                return keywords.some((k) => (typeof k === 'string' ? text.includes(k) : k.test(text)));
            });
            if (found) found.selected = true;
        };

        const typeMap: Record<string, (string | RegExp)[]> = {
            电影: [/Movie/i, /电影/],
            剧集: [/TV/i, /Series/i, /剧集/],
            纪录: [/Doc/i, /纪录/],
            综艺: [/Variety/i, /综艺/],
            动漫: [/Anime/i, /动画|動漫/]
        };
        if (meta.type && typeMap[meta.type]) {
            pickOption(formSelectors.category, typeMap[meta.type]);
        }

        const resMap: Record<string, (string | RegExp)[]> = {
            '8K': [/8K/i, /4320p/i],
            '4K': [/4K/i, /2160p/i],
            '1080p': [/1080p/i],
            '1080i': [/1080i/i],
            '720p': [/720p/i],
            SD: [/SD/i, /480/i, /576/i]
        };
        if (meta.standardSel && resMap[meta.standardSel]) {
            pickOption(formSelectors.type, resMap[meta.standardSel]);
        }

        // Unit3D often builds description from MediaInfo + screenshots.
        // Further refinement needed here for file upload handling.

        // --- TORRENT FILE INJECTION (New) ---
        if (meta.torrentBase64 && meta.torrentFilename) {
            this.log('Injecting torrent file...');
            const fileInput = $('input[type="file"]#torrent, input[name="torrent"], input[type="file"]')[0] as HTMLInputElement;
            if (fileInput) {
                try {
                    const { TorrentService } = await import('../services/TorrentService');
                    const file = TorrentService.base64ToFile(meta.torrentBase64, meta.torrentFilename);
                    TorrentService.injectFileIntoInput(fileInput, file);
                    this.log(`Injected file: ${meta.torrentFilename}`);
                } catch (e) {
                    console.error('[Auto-Feed] File Injection Failed:', e);
                }
            } else {
                console.warn('[Auto-Feed] File input not found.');
            }
        }
        // ------------------------------------
    }
}
