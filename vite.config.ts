import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import preact from '@preact/preset-vite';
import { webcrypto as nodeWebcrypto } from 'node:crypto';
import pkg from './package.json' assert { type: 'json' };

const localUserscriptUrl = (process.env.AUTOFEED_USERSCRIPT_URL || '').trim();
const userscriptSelfUrl =
    localUserscriptUrl ||
    'https://github.com/Gawain12/auto_feed_js/releases/download/dev/auto_feed.user.js';

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
                name: 'Auto-Feed Refactored',
                namespace: 'https://greasyfork.org/zh-CN/scripts/424132-auto-feed',
                version: pkg.version,
                description: 'PT一键转种脚本 - Refactored Version',
                author: 'tomorrow505, gawain',
                license: 'GPL-3.0 License',
                homepageURL: 'https://github.com/Gawain12/auto_feed_js',
                supportURL: 'https://github.com/Gawain12/auto_feed_js/issues',
                // For local development you can override with:
                // AUTOFEED_USERSCRIPT_URL=http://127.0.0.1:5174/auto-feed.user.js
                downloadURL: userscriptSelfUrl,
                updateURL: userscriptSelfUrl,
                icon: 'https://kp.m-team.cc/favicon.ico',
                'run-at': 'document-end',
                'inject-into': 'content',
                match: [
                    'https://kp.m-team.cc/detail/*',
                    'https://kp.m-team.cc/upload*',
                    'http*://*/*detail*.php*',
                    'http*://*/detail*.php*',
                    'http*://*/upload*php*',
                    'http*://*/offer*php*',
                    'https://blutopia.cc/torrents?imdb=tt*',
                    'https://blutopia.cc/torrents/create*',
                    'https://passthepopcorn.me/*',
                    'https://beyond-hd.me/*',
                    'https://hdbits.org/*',
                    'https://totheglory.im/*',
                    'https://open.cd/*',
                    'https://pterclub.net/*',
                    'https://chdbits.co/*',
                    'https://ptchdbits.co/*',
                    'https://ptchdbits.org/*',
                    'https://*.chddiy.xyz/*',
                    'https://audiences.me/*',
                    'https://hdsky.me/*',
                    'https://ourbits.club/*',
                    'https://hdcmct.org/*',
                    'https://springsunday.net/*',
                    'https://www.douban.com/subject/*',
                    'https://movie.douban.com/subject/*',
                    'https://www.imdb.com/title/tt*',
                    'http*://*/*index.php?page=torrent-details*',
                    'https://GreatPosterWall.com/*',
                    'https://greatposterwall.com/*',
                    'https://broadcasthe.net/*.php*',
                    'https://backup.landof.tv/*.php*',
                    'https://uhdbits.org/torrents.php*',
                    'https://filelist.io/*',
                    'https://iptorrents.com/torrent.php?id=*',
                    'https://redacted.ch/*',
                    'https://redacted.sh/*',
                    'https://orpheus.network/*',
                    'https://dicmusic.com/*',
                    'http*://*/*' // Catch-all for other PT sites
                ],
                exclude: ['http*bitpt.cn*'],
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
