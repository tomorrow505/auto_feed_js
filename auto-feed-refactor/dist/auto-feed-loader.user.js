// ==UserScript==
// @name         Auto-Feed (DEV LOADER)
// @namespace    https://greasyfork.org/zh-CN/scripts/424132-auto-feed
// @version      3.1.5
// @description  DEVELOPMENT LOADER - Loads from a local dev server (no file:// paths).
// @author       tomorrow505
// @match        https://kp.m-team.cc/detail/*
// @match        https://kp.m-team.cc/upload*
// @match        http*://*/*detail*.php*
// @match        http*://*/detail*.php*
// @match        http*://*/upload*php*
// @match        http*://*/offer*php*
// @match        https://blutopia.cc/torrents?imdb=tt*
// @match        https://blutopia.cc/torrents/create*
// @match        https://passthepopcorn.me/*
// @match        https://beyond-hd.me/*
// @match        https://hdbits.org/*
// @match        https://totheglory.im/*
// @match        https://pterclub.net/*
// @match        https://chdbits.co/*
// @match        https://ptchdbits.co/*
// @match        https://ptchdbits.org/*
// @match        https://*.chddiy.xyz/*
// @match        https://audiences.me/*
// @match        https://hdsky.me/*
// @match        https://ourbits.club/*
// @match        https://hdcmct.org/*
// @match        https://www.douban.com/subject/*
// @match        https://movie.douban.com/subject/*
// @match        https://www.imdb.com/title/tt*
// @match        http*://*/*index.php?page=torrent-details*
// @match        https://GreatPosterWall.com/torrents.php*
// @match        https://broadcasthe.net/*.php*
// @match        https://backup.landof.tv/*.php*
// @match        https://uhdbits.org/torrents.php*
// @match        https://filelist.io/*
// @match        https://iptorrents.com/torrent.php?id=*
// @match        https://redacted.ch/*
// @match        https://dicmusic.com/*
// @match        http*://*/*
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.setClipboard
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @grant        GM_download
// @grant        GM_addStyle
// @grant        GM_getResourceText
// @connect      *
// @inject-into  content
// @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/system.min.js
// @require      https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/extras/named-register.min.js
// @require      data:application/javascript,%3B(typeof%20System!%3D'undefined')%26%26(System%3Dnew%20System.constructor())%3B
// @require      http://127.0.0.1:5174/auto-feed-refactor.user.js
// ==/UserScript==

console.log('[Auto-Feed] DEV LOADER: Loading local build from http://127.0.0.1:5174/auto-feed-refactor.user.js');
