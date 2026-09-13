import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import preact from '@preact/preset-vite';
import { webcrypto as nodeWebcrypto } from 'node:crypto';
import pkg from './package.json' assert { type: 'json' };
import { NexusSites } from './src/config/sites_nexus';
import { GazelleSites } from './src/config/sites_gazelle';
import { Unit3DSites } from './src/config/sites_unit3d';
import { SpecialSites } from './src/config/sites_special';

const localUserscriptUrl = (process.env.AUTOFEED_USERSCRIPT_URL || '').trim();
const localUserscriptVersion = (process.env.AUTOFEED_USERSCRIPT_VERSION || '').trim();
const userscriptSelfUrl =
    localUserscriptUrl ||
    'https://github.com/Gawain12/auto_feed_js/releases/download/dev/auto_feed.user.js';

const toHost = (value?: string): string => {
    const raw = String(value || '').trim();
    if (!raw) return '';
    try {
        return new URL(raw.includes('://') ? raw : `https://${raw}`).hostname.toLowerCase();
    } catch {
        return raw.replace(/^https?:\/\//i, '').replace(/\/.*$/, '').toLowerCase();
    }
};

const isConcreteDomain = (host: string): boolean =>
    /^[a-z0-9][a-z0-9.-]*\.[a-z]{2,}$/i.test(host) &&
    !host.endsWith('.') &&
    !host.includes('*');

const siteMatches = Array.from(new Set(
    [...NexusSites, ...GazelleSites, ...Unit3DSites, ...SpecialSites]
        .flatMap((site) => [site.baseUrl, site.mirrorUrl, ...(site.keywords || [])])
        .map(toHost)
        .filter(isConcreteDomain)
        .flatMap((host) => [`*://${host}/*`, `*://*.${host}/*`])
));

const externalFeatureMatches = [
    '*://www.douban.com/subject/*',
    '*://movie.douban.com/subject/*',
    '*://www.imdb.com/title/tt*',
    '*://www.imdb.com/*/title/tt*',
    '*://imdb.com/title/tt*',
    '*://imdb.com/*/title/tt*',
    '*://imgbox.com/*',
    '*://imagebam.co/*',
    '*://pixhost.to/*',
    '*://img.hdbits.org/*',
    '*://hdbimg.com/*',
    '*://hostik.cinematik.net/*'
];

const userscriptMatches = Array.from(new Set([...siteMatches, ...externalFeatureMatches]));

// Node 16 doesn't expose Web Crypto on globalThis by default, but Vite uses `crypto.getRandomValues`.
// This keeps `npm run dev` working without requiring users to upgrade Node.
try {
    const g = globalThis as any;
    if (!g.crypto || typeof g.crypto.getRandomValues !== 'function') {
        g.crypto = nodeWebcrypto as any;
    }
} catch { }

export default defineConfig({
    plugins: [
        preact(),
        // Dev-only: keep a stable local install URL for Tampermonkey.
        // `vite-plugin-monkey` serves the userscript at `/auto_feed.user.js` (see build.fileName).
        {
            name: 'autofeed-userscript-alias',
            configureServer(server) {
                server.middlewares.use((req, _res, next) => {
                    const u = req.url || '';
                    const [path, qs] = u.split('?', 2);
                    if (path === '/auto-feed-refactor.user.js') {
                        req.url = '/__vite-plugin-monkey.install.user.js' + (qs ? `?${qs}` : '');
                    }
                    next();
                });
            }
        },
        monkey({
            entry: 'src/main.ts',
            userscript: {
                name: {
                    '': 'Auto-Feed｜PT一键转种助手（重构版）',
                    en: 'Auto-Feed Refactored｜PT Cross-Site Torrent Assistant'
                },
                // Use a new namespace so this refactored build is published as a separate
                // Greasy Fork script and never replaces the original script.
                namespace: 'https://github.com/tomorrow505/auto_feed_js',
                version: localUserscriptVersion || pkg.version,
                description: {
                    '': '原版 Auto-Feed（tomorrow505）的重构版。支持跨站一键转种、自动填写标题与简介、媒体信息和图片处理，并支持快速搜索与远程推送。',
                    en: 'A refactored version of the original Auto-Feed by tomorrow505. Supports cross-site torrent forwarding, automatic form filling, media information and image handling, quick search, and remote pushing.'
                },
                author: 'tomorrow505, Gawain',
                license: 'GPL-3.0 License',
                homepageURL: 'https://github.com/tomorrow505/auto_feed_js/tree/dev',
                supportURL: 'https://greasyfork.org/zh-CN/scripts/424132-auto-feed/feedback',
                // For local development you can override with:
                // AUTOFEED_USERSCRIPT_URL=http://127.0.0.1:5174/auto-feed.user.js
                downloadURL: userscriptSelfUrl,
                updateURL: userscriptSelfUrl,
                icon: 'https://kp.m-team.cc/favicon.ico',
                'run-at': 'document-end',
                'inject-into': 'page',
                match: userscriptMatches,
                exclude: ['*://*bitpt.cn*'],
                grant: [
                    'GM.xmlHttpRequest',
                    'GM.setValue',
                    'GM.getValue',
                    'GM.deleteValue',
                    'GM.setClipboard',
                    'GM_xmlhttpRequest',
                    'GM_setValue',
                    'GM_getValue',
                    'GM_deleteValue',
                    'GM_setClipboard',
                    'GM_download',
                    'GM_addStyle',
                    'GM_getResourceText'
                ],
                connect: ['*']
            },
            build: {
                fileName: 'auto_feed.user.js',
            },
        }),
    ],
    build: {
        rollupOptions: {
            inlineDynamicImports: true,
            output: {
                format: 'iife',
            },
        },
    },
});
