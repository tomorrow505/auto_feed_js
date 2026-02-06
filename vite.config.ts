import { defineConfig } from 'vite';
import monkey, { cdn } from 'vite-plugin-monkey';
import preact from '@preact/preset-vite';
import pkg from './package.json' assert { type: 'json' };

export default defineConfig({
    plugins: [
        preact(),
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
                // Refactor branch publishes a rolling dev build as a pre-release tag `dev`.
                // Stable releases should use tag `v*` which are handled by release.yml.
                downloadURL: 'https://github.com/Gawain12/auto_feed_js/releases/download/dev/auto_feed.user.js',
                updateURL: 'https://github.com/Gawain12/auto_feed_js/releases/download/dev/auto_feed.user.js',
                icon: 'https://kp.m-team.cc/favicon.ico',
                'run-at': 'document-end',
                'inject-into': 'content',
                thanks: '感谢宝大、86大佬、贝壳等大佬提供邀请码;感谢宝大、86大佬提供友情赞助;感谢86大佬、手大、kmeng、黑白、甘蔗等大佬赠予PTP积分.',
                contributor: 'daoshuailx/hollips/kmeng/wyyqyl/shmt86/sauterne',
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
                    'https://GreatPosterWall.com/torrents.php*',
                    'https://broadcasthe.net/*.php*',
                    'https://backup.landof.tv/*.php*',
                    'https://uhdbits.org/torrents.php*',
                    'https://filelist.io/*',
                    'https://iptorrents.com/torrent.php?id=*',
                    'https://redacted.ch/*',
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
                // Keep a stable userscript filename so Safari/production installs can always target the same path.
                fileName: 'auto_feed.user.js',
                externalGlobals: {
                    jquery: cdn.jsdelivr('jQuery', 'dist/jquery.min.js'),
                },
            },
        }),
    ],
});
