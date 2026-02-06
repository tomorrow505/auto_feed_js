// ==UserScript==
// @name         Auto-Feed Refactored
// @namespace    https://greasyfork.org/zh-CN/scripts/424132-auto-feed
// @version      3.1.5
// @author       tomorrow505, gawain
// @description  PT一键转种脚本 - Refactored Version
// @license      GPL-3.0 License
// @icon         https://kp.m-team.cc/favicon.ico
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
// @exclude      http*bitpt.cn*
// @require      https://cdn.jsdelivr.net/npm/jquery@3.7.1/dist/jquery.min.js
// @require      https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/system.min.js
// @require      https://cdn.jsdelivr.net/npm/systemjs@6.15.1/dist/extras/named-register.min.js
// @require      data:application/javascript,%3B(typeof%20System!%3D'undefined')%26%26(System%3Dnew%20System.constructor())%3B
// @connect      *
// @grant        GM.deleteValue
// @grant        GM.getValue
// @grant        GM.setClipboard
// @grant        GM.setValue
// @grant        GM.xmlHttpRequest
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_download
// @grant        GM_getResourceText
// @grant        GM_getValue
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_xmlhttpRequest
// @inject-into  content
// @run-at       document-end
// ==/UserScript==

System.addImportMap({ imports: {"jquery":"user:jquery"} });
System.set("user:jquery", (()=>{const _=jQuery;('default' in _)||(_.default=_);return _})());

System.register("./__entry.js", ['./__monkey.entry-pxiUrdlY.js'], (function (exports, module) {
	'use strict';
	return {
		setters: [null],
		execute: (function () {



		})
	};
}));

System.register("./__monkey.entry-pxiUrdlY.js", ['jquery'], (function (exports, module) {
  'use strict';
  var $$1;
  return {
    setters: [module => {
      $$1 = module.default;
    }],
    execute: (function () {

      exports({
        a: dealWithSubtitle,
        b: getSourceSelFromDescr,
        c: getMediumSel,
        d: dealWithTitle,
        e: getCodecSel,
        f: getAudioCodecSel,
        g: getSmallDescrFromDescr,
        h: getStandardSel,
        i: getMediainfoPictureFromDescr,
        j: addThanks,
        k: getType
      });

      var __defProp = Object.defineProperty;
      var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
      var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
      const scriptRel = function detectScriptRel() {
        const relList = typeof document !== "undefined" && document.createElement("link").relList;
        return relList && relList.supports && relList.supports("modulepreload") ? "modulepreload" : "preload";
      }();
      const assetsURL = function(dep) {
        return "/" + dep;
      };
      const seen = {};
      const __vitePreload = function preload(baseModule, deps, importerUrl) {
        let promise = Promise.resolve();
        if (deps && deps.length > 0) {
          document.getElementsByTagName("link");
          const cspNonceMeta = document.querySelector(
            "meta[property=csp-nonce]"
          );
          const cspNonce = (cspNonceMeta == null ? void 0 : cspNonceMeta.nonce) || (cspNonceMeta == null ? void 0 : cspNonceMeta.getAttribute("nonce"));
          promise = Promise.allSettled(
            deps.map((dep) => {
              dep = assetsURL(dep);
              if (dep in seen) return;
              seen[dep] = true;
              const isCss = dep.endsWith(".css");
              const cssSelector = isCss ? '[rel="stylesheet"]' : "";
              if (document.querySelector(`link[href="${dep}"]${cssSelector}`)) {
                return;
              }
              const link = document.createElement("link");
              link.rel = isCss ? "stylesheet" : scriptRel;
              if (!isCss) {
                link.as = "script";
              }
              link.crossOrigin = "";
              link.href = dep;
              if (cspNonce) {
                link.setAttribute("nonce", cspNonce);
              }
              document.head.appendChild(link);
              if (isCss) {
                return new Promise((res, rej) => {
                  link.addEventListener("load", res);
                  link.addEventListener(
                    "error",
                    () => rej(new Error(`Unable to preload CSS for ${dep}`))
                  );
                });
              }
            })
          );
        }
        function handlePreloadError(err) {
          const e2 = new Event("vite:preloadError", {
            cancelable: true
          });
          e2.payload = err;
          window.dispatchEvent(e2);
          if (!e2.defaultPrevented) {
            throw err;
          }
        }
        return promise.then((res) => {
          for (const item of res || []) {
            if (item.status !== "rejected") continue;
            handlePreloadError(item.reason);
          }
          return baseModule().catch(handlePreloadError);
        });
      };
      var SiteType = /* @__PURE__ */ ((SiteType2) => {
        SiteType2["NexusPHP"] = "NexusPHP";
        SiteType2["Gazelle"] = "Gazelle";
        SiteType2["Unit3D"] = "Unit3D";
        SiteType2["Unit3DClassic"] = "Unit3DClassic";
        SiteType2["MTeam"] = "MTeam";
        SiteType2["CHDBits"] = "CHDBits";
        SiteType2["BHD"] = "BHD";
        SiteType2["PTP"] = "PTP";
        SiteType2["HDB"] = "HDB";
        SiteType2["KG"] = "KG";
        SiteType2["Avistaz"] = "Avistaz";
        SiteType2["General"] = "General";
        return SiteType2;
      })(SiteType || {});
      class MediaInfoParser {
        /**
         * Parses description to extract MediaInfo and Screenshots.
         * Matches legacy logic from `get_mediainfo_picture_from_descr`
         */
        static parse(description) {
          let mediainfo = "";
          const screenshots = [];
          let cleanDescription = description;
          const imgMatches = description.match(this.IMG_REGEX);
          if (imgMatches) {
            imgMatches.forEach((img) => {
              cleanDescription = cleanDescription.replace(img, "");
              const urlMatch = img.match(/\[img\](.*?)\[\/img\]/);
              if (urlMatch) {
                screenshots.push(urlMatch[1]);
              }
            });
          }
          try {
            if (description.match(this.BD_KEYWORDS)) {
              const match = description.match(/\[quote.*?\][\s\S]*?(DISC INFO|\.MPLS|Video Codec|Disc Label)[\s\S]*?\[\/quote\]/i);
              if (match) mediainfo = match[0];
            } else if (description.match(this.MEDIAINFO_KEYWORDS)) {
              const matches = description.match(/\[quote.*?\][\s\S]*?(General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率)[\s\S]*?\[\/quote\]/ig);
              if (matches) {
                mediainfo = matches.join("\n\n");
              }
            }
          } catch (e2) {
            console.error("Error extracting MediaInfo:", e2);
          }
          if (!mediainfo && description.match(/\n.*DISC INFO:[\s\S]*kbps.*/)) {
            const match = description.match(/\n.*DISC INFO:[\s\S]*kbps.*/);
            if (match) mediainfo = match[0].trim();
          }
          if (mediainfo) {
            cleanDescription = cleanDescription.replace(mediainfo, "");
            mediainfo = mediainfo.replace(/\[quote.*?\]/ig, "");
            mediainfo = mediainfo.replace(/\[\/quote\]/ig, "");
            mediainfo = mediainfo.replace(/\[\/?(font|size|quote|color).{0,80}?\]/ig, "");
            mediainfo = mediainfo.trim();
          }
          return {
            mediainfo,
            screenshots,
            description: cleanDescription.trim()
          };
        }
      }
      // Regex to match BBCode images
      __publicField(MediaInfoParser, "IMG_REGEX", /(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
      __publicField(MediaInfoParser, "MEDIAINFO_KEYWORDS", /General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率|DISC INFO:|\.MPLS|Video Codec|Disc Label/i);
      __publicField(MediaInfoParser, "BD_KEYWORDS", /DISC INFO:|\.MPLS|Video Codec|Disc Label/i);
      class BaseEngine {
        constructor(config, currentUrl) {
          this.config = config;
          this.currentUrl = currentUrl;
        }
        get siteName() {
          return this.config.name;
        }
        getConfig() {
          return this.config;
        }
        log(message) {
          console.log(`[Auto-Feed][${this.siteName}] ${message}`);
        }
        error(message) {
          console.error(`[Auto-Feed][${this.siteName}] ${message}`);
        }
        selectOption(selectName, value) {
          const $2 = window.$;
          const select = $2(`select[name="${selectName}"]`);
          if (select.length === 0) return;
          select.val(value);
          if (select.val() !== value) {
            select.find("option").each((_2, el) => {
              if ($2(el).text().includes(value)) {
                $2(el).prop("selected", true);
              }
            });
          }
        }
        parseMediaInfo(description) {
          return MediaInfoParser.parse(description);
        }
      }
      function htmlToBBCode(element) {
        if (!element) return "";
        return walkDOM(element);
      }
      function walkDOM(node) {
        if (node.nodeType === Node.TEXT_NODE) {
          return node.textContent || "";
        }
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return "";
        }
        const el = node;
        let content = "";
        Array.from(el.childNodes).forEach((child) => {
          content += walkDOM(child);
        });
        const tagName = el.tagName.toLowerCase();
        switch (tagName) {
          case "b":
          case "strong":
            return `[b]${content}[/b]`;
          case "i":
          case "em":
            return `[i]${content}[/i]`;
          case "u":
            return `[u]${content}[/u]`;
          case "s":
          case "strike":
            return `[s]${content}[/s]`;
          case "img":
            const src = el.getAttribute("src");
            return src ? `[img]${src}[/img]` : content;
          case "a":
            const href = el.getAttribute("href");
            return href ? `[url=${href}]${content}[/url]` : content;
          case "blockquote":
            return `[quote]${content}[/quote]`;
          case "code":
          case "pre":
            return `[code]${content}[/code]`;
          case "br":
            return "\n";
          case "p":
          case "div":
            return `
${content}
`;
          case "li":
            return `[*]${content}
`;
          case "ul":
          case "ol":
            return `
${content}
`;
          default:
            if (el.style.fontWeight === "bold" || Number(el.style.fontWeight) >= 700) {
              content = `[b]${content}[/b]`;
            }
            if (el.style.fontStyle === "italic") {
              content = `[i]${content}[/i]`;
            }
            if (el.style.textDecoration === "underline") {
              content = `[u]${content}[/u]`;
            }
            if (el.style.color) {
              content = `[color=${el.style.color}]${content}[/color]`;
            }
            return content;
        }
      }
      async function parseNexus(config, currentUrl) {
        const selectors = {
          title: "#top",
          titleFallback: 'td.rowhead:contains("Title") + td, td.rowhead:contains("标题") + td',
          description: "#kdescr, #description",
          descriptionFallback: 'td.rowhead:contains("Description") + td, td.rowhead:contains("简介") + td',
          category: 'td.rowhead:contains("Type") + td, td.rowhead:contains("类型") + td'
        };
        const configSelectors = config.selectors || {};
        const getText = (selector) => {
          if (!selector) return "";
          if (Array.isArray(selector)) {
            for (const s2 of selector) {
              const el = $$1(s2);
              const val = el.text().trim();
              if (el.length && val) return val;
            }
            return "";
          }
          return $$1(selector).text().trim();
        };
        const getElement = (selector) => {
          if (!selector) return null;
          if (Array.isArray(selector)) {
            for (const s2 of selector) {
              const el2 = $$1(s2);
              if (el2.length) return el2[0];
            }
            return null;
          }
          const el = $$1(selector);
          return el.length ? el[0] : null;
        };
        let title = getText(configSelectors.title) || $$1(selectors.title).text().trim();
        if (!title) {
          title = $$1(selectors.titleFallback).text().trim();
        }
        title = title.replace(/\[.*?\]/g, "").trim();
        const descrEl = getElement(configSelectors.description) || getElement(selectors.description) || getElement(selectors.descriptionFallback);
        const description = descrEl ? htmlToBBCode(descrEl) : "";
        const meta = {
          title,
          subtitle: getText(configSelectors.subtitle) || "",
          description,
          sourceSite: config.name,
          sourceUrl: currentUrl,
          images: []
        };
        if (meta.subtitle === "") delete meta.subtitle;
        const imdbMatch = description.match(/tt\d{7,8}/);
        if (imdbMatch) meta.imdbId = imdbMatch[0];
        const doubanMatch = description.match(/douban.com\/subject\/(\d+)/);
        if (doubanMatch) meta.doubanId = doubanMatch[1];
        const downloadLink = $$1('a[href*="download.php"], a[href*="download/torrent"]');
        if (downloadLink.length) {
          const relativeUrl = downloadLink.attr("href") || "";
          if (relativeUrl && !relativeUrl.startsWith("http")) {
            const urlObj = new URL(relativeUrl, currentUrl);
            meta.torrentUrl = urlObj.href;
          } else {
            meta.torrentUrl = relativeUrl;
          }
        }
        const typeText = getText(configSelectors.subtitle) || $$1(selectors.category).text().trim();
        if (typeText && !meta.type) {
          meta.type = typeText;
        }
        return meta;
      }
      async function fillNexus(meta, config) {
        const formSelectors = {
          name: 'input[name="name"]',
          smallDescr: 'input[name="small_descr"]',
          descr: 'textarea[name="descr"]',
          imdb: 'input[name="imdb_id"], input[name="url"][type="text"]',
          douban: 'input[name="douban_id"]',
          torrent: 'input[type="file"]#file, input[name="file"], input[name="torrent"]'
        };
        const overrides = config.selectors || {};
        $$1(overrides.nameInput || formSelectors.name).val(meta.title);
        $$1(overrides.smallDescrInput || formSelectors.smallDescr).val(meta.subtitle || meta.smallDescr || "");
        $$1(overrides.descrInput || formSelectors.descr).val(meta.description);
        if (meta.imdbId || meta.imdbUrl) {
          $$1(overrides.imdbInput || formSelectors.imdb).val(meta.imdbId || meta.imdbUrl || "");
        }
        if (meta.doubanId || meta.doubanUrl) {
          $$1(overrides.doubanInput || formSelectors.douban).val(meta.doubanId || meta.doubanUrl || "");
        }
        if (meta.torrentBase64 || meta.torrentUrl) {
          const fileInputSelector = overrides.torrentInput || formSelectors.torrent;
          const fileInput = $$1(fileInputSelector)[0];
          if (fileInput) {
            try {
              const { TorrentService } = await __vitePreload(async () => {
                const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
                return { TorrentService: TorrentService2 };
              }, true ? void 0 : void 0);
              const result = await TorrentService.buildForwardTorrentFile(meta, config.name, null);
              if (result) {
                TorrentService.injectFileIntoInput(fileInput, result.file);
              } else if (meta.torrentBase64 && meta.torrentFilename) {
                const file = TorrentService.base64ToFile(meta.torrentBase64, meta.torrentFilename);
                TorrentService.injectFileIntoInput(fileInput, file);
              }
            } catch (e2) {
              console.error("[Auto-Feed] File Injection Failed:", e2);
            }
          }
        }
        const pickOption = (selectName, keywords) => {
          const select = document.querySelector(`select[name="${selectName}"]`);
          if (!select) return;
          const opts = Array.from(select.options);
          const matchOpt = (opt) => {
            var _a;
            const text = ((_a = opt.textContent) == null ? void 0 : _a.trim()) || "";
            return keywords.some((k2) => typeof k2 === "string" ? text.includes(k2) : k2.test(text));
          };
          const found = opts.find(matchOpt);
          if (found) found.selected = true;
        };
        const typeMap = {
          电影: [/Movie/i, /电影/],
          剧集: [/TV/i, /Series/i, /剧集/],
          纪录: [/Doc/i, /纪录/],
          综艺: [/Variety/i, /综艺/],
          动漫: [/Anime/i, /动画|動漫/],
          音乐: [/Music/i, /音乐/],
          体育: [/Sport/i, /体育/],
          MV: [/MV/i, /Music Video/i],
          书籍: [/Book/i, /书籍/],
          游戏: [/Game/i, /游戏/],
          软件: [/Software/i, /软件/],
          学习: [/Study/i, /学习/]
        };
        if (meta.type && typeMap[meta.type]) {
          pickOption("type", typeMap[meta.type]);
          pickOption("category", typeMap[meta.type]);
          pickOption("cat", typeMap[meta.type]);
          pickOption("category_id", typeMap[meta.type]);
        }
        const mediumMap = {
          UHD: [/UHD/i, /4K/i],
          "Blu-ray": [/Blu[- ]?ray/i, /BD/i],
          Remux: [/Remux/i],
          Encode: [/Encode/i, /BDRip/i, /WEBRip/i],
          "WEB-DL": [/WEB[- ]?DL/i],
          HDTV: [/HDTV/i],
          DVD: [/DVD/i],
          CD: [/CD/i]
        };
        if (meta.mediumSel && mediumMap[meta.mediumSel]) {
          pickOption("medium_sel", mediumMap[meta.mediumSel]);
          pickOption("medium", mediumMap[meta.mediumSel]);
        }
        const standardMap = {
          "8K": [/8K/i, /4320p/i],
          "4K": [/4K/i, /2160p/i],
          "1080p": [/1080p/i],
          "1080i": [/1080i/i],
          "720p": [/720p/i],
          SD: [/SD/i, /480/i, /576/i]
        };
        if (meta.standardSel && standardMap[meta.standardSel]) {
          pickOption("standard_sel", standardMap[meta.standardSel]);
          pickOption("standard", standardMap[meta.standardSel]);
        }
        const codecMap = {
          H264: [/H\.?264/i, /AVC/i, /x264/i],
          X264: [/x264/i],
          H265: [/H\.?265/i, /HEVC/i, /x265/i],
          X265: [/x265/i],
          "VC-1": [/VC-?1/i],
          "MPEG-2": [/MPEG-?2/i],
          XVID: [/XVID/i]
        };
        if (meta.codecSel && codecMap[meta.codecSel]) {
          pickOption("codec_sel", codecMap[meta.codecSel]);
          pickOption("codec", codecMap[meta.codecSel]);
        }
        const audioMap = {
          "DTS-HDMA:X 7.1": [/DTS[- ]?X/i],
          "DTS-HDMA": [/DTS[- ]?HD/i, /DTS[- ]?MA/i],
          "DTS-HDHR": [/DTS[- ]?HR/i],
          Atmos: [/Atmos/i],
          TrueHD: [/TrueHD/i],
          DTS: [/DTS/i],
          AC3: [/AC-?3/i, /Dolby Digital/i, /DD/i],
          AAC: [/AAC/i],
          LPCM: [/LPCM/i, /PCM/i],
          Flac: [/FLAC/i],
          APE: [/APE/i],
          WAV: [/WAV/i],
          MP3: [/MP3/i]
        };
        if (meta.audioCodecSel && audioMap[meta.audioCodecSel]) {
          pickOption("audiocodec_sel", audioMap[meta.audioCodecSel]);
          pickOption("audio", audioMap[meta.audioCodecSel]);
        }
      }
      class NexusPHPEngine extends BaseEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          this.log("Parsing NexusPHP page...");
          const meta = await parseNexus(this.config, this.currentUrl);
          this.log(`Parsed: ${meta.title}`);
          return meta;
        }
        async fill(meta) {
          this.log("Filling NexusPHP form...");
          await fillNexus(meta, this.config);
        }
      }
      async function parseGazelle(config, currentUrl) {
        const selectors = {
          groupTitle: "#content .header h2",
          year: ".header h2 .year",
          releaseType: ".header h2 .release_type",
          description: ".box_album_description .pad, .box_album_description, .box .pad",
          tags: ".tags a",
          cover: "#cover_div img, .box_image img"
        };
        const titleRaw = $$1(selectors.groupTitle).text().trim();
        const year = $$1(selectors.year).text().replace(/[()]/g, "").trim();
        const releaseType = $$1(selectors.releaseType).text().trim();
        const title = titleRaw.replace(/\(\d{4}\)/, "").replace(/\[.*?\]/g, "").trim();
        const descrEl = $$1(selectors.description).first();
        const description = descrEl.length ? htmlToBBCode(descrEl[0]) : "";
        const cover = $$1(selectors.cover).attr("src");
        const tags = $$1(selectors.tags).map((_2, el) => $$1(el).text().trim()).get().filter(Boolean);
        const meta = {
          title,
          subtitle: [year, releaseType].filter(Boolean).join(" ") || void 0,
          description,
          sourceSite: config.name,
          sourceUrl: currentUrl,
          images: cover ? [cover] : []
        };
        meta.type = "音乐";
        const torrentIdMatch = currentUrl.match(/torrentid=(\d+)/);
        if (torrentIdMatch) {
          const torrentId = torrentIdMatch[1];
          const row = document.getElementById(`torrent_${torrentId}`) || document.getElementById(`torrent${torrentId}`);
          if (row) {
            const rowText = row.innerText;
            if (rowText) {
              meta.smallDescr = rowText.split("\n").slice(0, 2).join(" ").trim();
            }
          }
        }
        if (tags.length) {
          meta.subtitle = meta.subtitle ? `${meta.subtitle} | ${tags.join(", ")}` : tags.join(", ");
        }
        return meta;
      }
      async function fillGazelle(meta, config) {
        var _a;
        const nameInput = $$1('input[name="title"], input[name="name"]').first();
        const yearInput = $$1('input[name="year"]').first();
        const tagsInput = $$1('input[name="tags"]').first();
        const imageInput = $$1('input[name="image"]').first();
        const descrInput = $$1('textarea[name="description"], textarea[name="body"]').first();
        if (nameInput.length) nameInput.val(meta.title || "");
        if (yearInput.length) {
          const yearMatch = (meta.subtitle || "").match(/(19|20)\d{2}/);
          if (yearMatch) yearInput.val(yearMatch[0]);
        }
        if (tagsInput.length && meta.subtitle) {
          const tagsPart = (_a = meta.subtitle.split("|").pop()) == null ? void 0 : _a.trim();
          if (tagsPart) tagsInput.val(tagsPart.replace(/,\s*/g, ","));
        }
        if (imageInput.length && meta.images && meta.images[0]) imageInput.val(meta.images[0]);
        if (descrInput.length) descrInput.val(meta.description || "");
      }
      class GazelleEngine extends BaseEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          this.log("Parsing Gazelle page...");
          return parseGazelle(this.config, this.currentUrl);
        }
        async fill(meta) {
          this.log("Filling Gazelle form...");
          await fillGazelle(meta, this.config);
        }
      }
      class Unit3DEngine extends BaseEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          this.log("Parsing Unit3D page...");
          const selectors = {
            title: "h1.text-center, h1",
            description: ".panel-body.markdown-body, .panel-body",
            imdb: '.list-group-item:contains("IMDB") a'
          };
          const configSelectors = this.config.selectors || {};
          const getText = (selector) => {
            if (!selector) return "";
            if (Array.isArray(selector)) {
              for (const s2 of selector) {
                const el = $$1(s2);
                if (el.length && el.text().trim()) return el.text().trim();
              }
              return "";
            }
            return $$1(selector).text().trim();
          };
          const getElement = (selector) => {
            if (!selector) return null;
            if (Array.isArray(selector)) {
              for (const s2 of selector) {
                const el2 = $$1(s2);
                if (el2.length) return el2[0];
              }
              return null;
            }
            const el = $$1(selector);
            return el.length ? el[0] : null;
          };
          let title = getText(configSelectors.title) || getText(selectors.title);
          title = title.replace(/\[.*?\]/g, "").trim();
          const descrEl = getElement(configSelectors.description) || getElement(selectors.description);
          const description = descrEl ? htmlToBBCode(descrEl) : "";
          const meta = {
            title,
            description,
            // TODO: Convert HTML to BBCode
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images: []
          };
          const imdbLink = $$1(selectors.imdb).attr("href");
          if (imdbLink) {
            const match = imdbLink.match(/tt\d+/);
            if (match) meta.imdbId = match[0];
          }
          const image = $$1(".movie-poster img, .sidebar img").attr("src");
          if (image) {
            meta.images.push(image);
          }
          this.log(`Parsed: ${meta.title}`);
          return meta;
        }
        async fill(meta) {
          this.log("Filling Unit3D form...");
          const formSelectors = {
            name: 'input[name="name"]',
            description: 'textarea[name="description"]',
            imdb: 'input[name="imdb_id"]',
            category: 'select[name="category_id"]',
            type: 'select[name="type_id"]'
          };
          $$1(formSelectors.name).val(meta.title);
          $$1(formSelectors.description).val(meta.description);
          if (meta.imdbId) {
            $$1(formSelectors.imdb).val(meta.imdbId);
          }
          const pickOption = (selector, keywords) => {
            const select = document.querySelector(selector);
            if (!select) return;
            const opts = Array.from(select.options);
            const found = opts.find((opt) => {
              var _a;
              const text = ((_a = opt.textContent) == null ? void 0 : _a.trim()) || "";
              return keywords.some((k2) => typeof k2 === "string" ? text.includes(k2) : k2.test(text));
            });
            if (found) found.selected = true;
          };
          const typeMap = {
            电影: [/Movie/i, /电影/],
            剧集: [/TV/i, /Series/i, /剧集/],
            纪录: [/Doc/i, /纪录/],
            综艺: [/Variety/i, /综艺/],
            动漫: [/Anime/i, /动画|動漫/]
          };
          if (meta.type && typeMap[meta.type]) {
            pickOption(formSelectors.category, typeMap[meta.type]);
          }
          const resMap = {
            "8K": [/8K/i, /4320p/i],
            "4K": [/4K/i, /2160p/i],
            "1080p": [/1080p/i],
            "1080i": [/1080i/i],
            "720p": [/720p/i],
            SD: [/SD/i, /480/i, /576/i]
          };
          if (meta.standardSel && resMap[meta.standardSel]) {
            pickOption(formSelectors.type, resMap[meta.standardSel]);
          }
          if (meta.torrentBase64 && meta.torrentFilename) {
            this.log("Injecting torrent file...");
            const fileInput = $$1('input[type="file"]#torrent, input[name="torrent"], input[type="file"]')[0];
            if (fileInput) {
              try {
                const { TorrentService } = await __vitePreload(async () => {
                  const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
                  return { TorrentService: TorrentService2 };
                }, true ? void 0 : void 0);
                const file = TorrentService.base64ToFile(meta.torrentBase64, meta.torrentFilename);
                TorrentService.injectFileIntoInput(fileInput, file);
                this.log(`Injected file: ${meta.torrentFilename}`);
              } catch (e2) {
                console.error("[Auto-Feed] File Injection Failed:", e2);
              }
            } else {
              console.warn("[Auto-Feed] File input not found.");
            }
          }
        }
      }
      function getMediumSel(text, title) {
        let result = text;
        if (result.match(/(Webdl|Web-dl|WEB[\. ])/i) && !(title || "").match(/webrip/i)) {
          result = "WEB-DL";
        } else if (result.match(/(UHDTV)/i)) {
          result = "UHDTV";
        } else if (result.match(/(HDTV)/i)) {
          result = "HDTV";
        } else if (result.match(/(Remux)/i) && !result.match(/Encode/)) {
          result = "Remux";
        } else if (result.match(/(Blu-ray|.MPLS|Bluray原盘)/i) && !result.match(/Encode/i)) {
          result = "Blu-ray";
        } else if (result.match(/(UHD|UltraHD)/i) && !result.match(/Encode/i)) {
          result = "UHD";
        } else if (result.match(/(Encode|BDRIP|webrip|BluRay)/i) || result.match(/(x|H).?(264|265)/i)) {
          result = "Encode";
        } else if (result.match(/(DVDRip|DVD)/i)) {
          result = "DVD";
        } else if (result.match(/TV/)) {
          result = "TV";
        } else if (result.match(/VHS/)) {
          result = "VHS";
        } else if (result.match(/格式: CD|媒介: CD/)) {
          result = "CD";
        } else {
          result = "";
        }
        return result;
      }
      function getCodecSel(text) {
        let result = text;
        if (result.match(/(H264|H\.264|AVC)/i)) {
          result = "H264";
        } else if (result.match(/(HEVC|H265|H\.265)/i)) {
          result = "H265";
        } else if (result.match(/(VVC|H266|H\.266)/i)) {
          result = "H266";
        } else if (result.match(/(X265)/i)) {
          result = "X265";
        } else if (result.match(/(X264)/i)) {
          result = "X264";
        } else if (result.match(/(VC-1)/i)) {
          result = "VC-1";
        } else if (result.match(/(MPEG-2)/i)) {
          result = "MPEG-2";
        } else if (result.match(/(MPEG-4)/i)) {
          result = "MPEG-4";
        } else if (result.match(/(XVID)/i)) {
          result = "XVID";
        } else if (result.match(/(VP9)/i)) {
          result = "VP9";
        } else if (result.match(/DIVX/i)) {
          result = "DIVX";
        } else {
          result = "";
        }
        return result;
      }
      function getAudioCodecSel(text) {
        let result = text;
        if (result.match(/(DTS-HDMA:X 7\.1|DTS.?X.?7\.1)/i)) {
          result = "DTS-HDMA:X 7.1";
        } else if (result.match(/(DTS-HD.?MA)/i)) {
          result = "DTS-HDMA";
        } else if (result.match(/(DTS-HD.?HR)/i)) {
          result = "DTS-HDHR";
        } else if (result.match(/(DTS-HD)/i)) {
          result = "DTS-HD";
        } else if (result.match(/(DTS.?X[^2])/i)) {
          result = "DTS-X";
        } else if (result.match(/(LPCM)/i)) {
          result = "LPCM";
        } else if (result.match(/(OPUS)/i)) {
          result = "OPUS";
        } else if (result.match(/([ \.]DD|AC3|AC-3|Dolby Digital)/i)) {
          result = "AC3";
        } else if (result.match(/(Atmos)/i) && result.match(/True.?HD/)) {
          result = "Atmos";
        } else if (result.match(/(AAC)/i)) {
          result = "AAC";
        } else if (result.match(/(TrueHD)/i)) {
          result = "TrueHD";
        } else if (result.match(/(DTS)/i)) {
          result = "DTS";
        } else if (result.match(/(Flac)/i)) {
          result = "Flac";
        } else if (result.match(/(APE)/i)) {
          result = "APE";
        } else if (result.match(/(MP3)/i)) {
          result = "MP3";
        } else if (result.match(/(WAV)/i)) {
          result = "WAV";
        } else if (result.match(/(OGG)/i)) {
          result = "OGG";
        } else {
          result = "";
        }
        if (text.match(/AUDiO CODEC/i) && text.match(/-WiKi/)) {
          const match = text.match(/AUDiO CODEC.*/i);
          if (match) {
            return getAudioCodecSel(match[0]);
          }
        }
        return result;
      }
      function getStandardSel(text) {
        let result = text;
        if (result.match(/(4320p|8k)/i)) {
          result = "8K";
        } else if (result.match(/(1080p|2K)/i)) {
          result = "1080p";
        } else if (result.match(/(720p)/i)) {
          result = "720p";
        } else if (result.match(/(1080i)/i)) {
          result = "1080i";
        } else if (result.match(/(576[pi]|480[pi])/i)) {
          result = "SD";
        } else if (result.match(/(1440p)/i)) {
          result = "144Op";
        } else if (result.match(/(2160p|4k)/i)) {
          result = "4K";
        } else {
          result = "";
        }
        return result;
      }
      function getType(text) {
        let result = text.split("來源")[0];
        if (result.match(/(Movie|电影|UHD原盘|films|電影|剧场)/i)) {
          result = "电影";
        } else if (result.match(/(Animation|动漫|動畫|动画|Anime|Cartoons?)/i)) {
          result = "动漫";
        } else if (result.match(/(TV.*Show|综艺)/i)) {
          result = "综艺";
        } else if (result.match(/(Docu|纪录|Documentary)/i)) {
          result = "纪录";
        } else if (result.match(/(短剧)/i)) {
          result = "短剧";
        } else if (result.match(/(TV.*Series|影劇|剧|TV-PACK|TV-Episode|TV)/i)) {
          result = "剧集";
        } else if (result.match(/(Music Videos|音乐短片|MV\(演唱\)|MV.演唱会|MV\(音乐视频\)|Music Video|Musics MV|Music-Video|音乐视频|演唱会\/MV|MV\/演唱会|MV)/i)) {
          result = "MV";
        } else if (result.match(/(有声小说|Audio\(有声\)|有声书|有聲書)/i)) {
          result = "有声小说";
        } else if (result.match(/(Music|音乐)/i)) {
          result = "音乐";
        } else if (result.match(/(Sport|体育|運動)/i)) {
          result = "体育";
        } else if (result.match(/(学习|资料|Study)/i)) {
          result = "学习";
        } else if (result.match(/(Software|软件|軟體)/i)) {
          result = "软件";
        } else if (result.match(/(Game|游戏|PC遊戲)/i)) {
          result = "游戏";
        } else if (result.match(/(eBook|電子書|电子书|书籍|book)/i)) {
          result = "书籍";
        } else {
          result = "";
        }
        return result;
      }
      function getLabel(text) {
        var _a, _b;
        const myString = text.toString();
        const name = myString.split("#separator#")[0];
        const labels = {
          gy: false,
          yy: false,
          zz: false,
          diy: false,
          hdr10: false,
          db: false,
          hdr10plus: false,
          yz: false,
          en: false,
          yp: false,
          hdr: false
        };
        if (myString.match(/([简繁].{0,12}字幕|[简繁中].{0,3}字|简中|DIY.{1,5}字|内封.{0,3}[繁中字])|(Text.*?[\s\S]*?Chinese|Text.*?[\s\S]*?Mandarin|subtitles.*chs|subtitles.*mandarin|subtitle.*chinese|Presentation Graphics.*?Chinese)/i)) {
          labels.zz = true;
        }
        if (myString.match(/(英.{0,12}字幕|英.{0,3}字|内封.{0,3}英.{0,3}字)|(Text.*?[\s\S]*?English|subtitles.*eng|subtitle.*english|Graphics.*?English)/i)) {
          labels.yz = true;
        }
        if (myString.match(/([^多]国.{0,3}语|国.{0,3}配|台.{0,3}语|台.{0,3}配)|(Audio.*Chinese|Audio.*mandarin)/i)) {
          const subStr = ((_a = myString.match(/([^多]国.{0,3}语|国.{0,3}配|台.{0,3}语|台.{0,3}配)|(Audio.*Chinese|Audio.*mandarin)/i)) == null ? void 0 : _a[0]) || "";
          if (!subStr.match(/国家|Subtitles/)) {
            labels.gy = true;
          }
        }
        if (myString.match(/(Audio.*English|◎语.*?言.*?英语)/i)) {
          labels.en = true;
        }
        try {
          const audio = (_b = myString.match(/Audio[\s\S]*?English/)) == null ? void 0 : _b[0].split("Text")[0];
          if (audio && audio.match(/Language.*?English/)) {
            labels.en = true;
          }
        } catch (err) {
        }
        if (name.match(/(粤.{0,3}语|粤.{0,3}配|Audio.*cantonese)/i)) {
          labels.yy = true;
        }
        if (name.match(/DIY|-.*?@(MTeam|CHDBits|HDHome|OurBits|HDChina|Language|TTG|Pter|HDSky|Audies|CMCT|Dream|Audies)/i) && myString.match(/mpls/i)) {
          labels.diy = true;
        } else if (myString.match(/DISC INFO/) || myString.match(/mpls/i)) {
          labels.yp = true;
        }
        if (myString.match(/HDR10\+/)) {
          labels.hdr10plus = true;
        } else if (myString.match(/HDR10/)) {
          labels.hdr10 = true;
        } else if (myString.match(/HDR/)) {
          labels.hdr = true;
        }
        if (myString.match(/Dolby Vision|杜比视界/i)) {
          labels.db = true;
        }
        return labels;
      }
      const imdbPrefix = "https://www.imdb.com/title/";
      const doubanPrefix = "https://movie.douban.com/subject/";
      function matchLink(site, data) {
        var _a, _b, _c, _d, _e, _f;
        let link = "";
        if (site === "imdb" && data.match(/http(s*):\/\/.*?imdb.com\/title\/tt\d+/i)) {
          const id = (_a = data.match(/tt\d{5,13}/i)) == null ? void 0 : _a[0];
          if (id) link = `${imdbPrefix}${id}/`;
        } else if (site === "douban" && data.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)) {
          const id = (_b = data.match(/subject\/(\d+)/i)) == null ? void 0 : _b[1];
          if (id) link = `${doubanPrefix}${id}/`;
        } else if (site === "anidb" && data.match(/https:\/\/anidb\.net\/a\d+/i)) {
          link = ((_c = data.match(/https:\/\/anidb\.net\/a\d+/i)) == null ? void 0 : _c[0]) || "";
          if (link && !link.endsWith("/")) link += "/";
        } else if (site === "tmdb" && data.match(/http(s*):\/\/www.themoviedb.org\//i)) {
          link = ((_d = data.match(/http(s*):\/\/www.themoviedb.org\/(tv|movie)\/\d+/i)) == null ? void 0 : _d[0]) || "";
          if (link && !link.endsWith("/")) link += "/";
        } else if (site === "tvdb" && data.match(/http(s*):\/\/www.thetvdb.com\//i)) {
          const id = (_e = data.match(/https?:\/\/www.thetvdb.com\/.*?id=(\d+)/i)) == null ? void 0 : _e[1];
          if (id) link = `https://www.thetvdb.com/?tab=series&id=${id}`;
        } else if (site === "bangumi" && data.match(/https:\/\/bangumi.tv\/subject/i)) {
          const id = (_f = data.match(/https:\/\/bangumi.tv\/subject\/(\d+)/)) == null ? void 0 : _f[1];
          if (id) link = `https://bangumi.tv/subject/${id}`;
        }
        return link;
      }
      const NexusSites = [
        {
          name: "MTeam",
          type: SiteType.MTeam,
          keywords: ["m-team.cc", "m-team.io"],
          baseUrl: "https://kp.m-team.cc/",
          description: "M-Team TP (New AntD Layout)",
          features: {
            imdbSearch: true,
            doubanSearch: true
          },
          selectors: {
            title: [
              "h2.ant-typography",
              // New Antd
              "#top",
              // Legacy Nexus
              "h1#top",
              ".torrent-title",
              ".ant-descriptions-item-content:first"
            ],
            description: [
              'div[id="kdescr"]',
              // Classic
              ".braft-output-content",
              // New Editor
              ".ant-card-body .markdown",
              "#description"
            ],
            // Hardcode these for now to be safe
            nameInput: "input#name",
            descrInput: "textarea#description",
            imdbInput: "input#imdb_id"
          }
        },
        {
          name: "HDSky",
          type: SiteType.NexusPHP,
          keywords: ["hdsky.me"],
          baseUrl: "https://hdsky.me/",
          description: "HDSky"
        },
        {
          name: "OurBits",
          type: SiteType.NexusPHP,
          keywords: ["ourbits.club"],
          baseUrl: "https://ourbits.club/",
          description: "OurBits"
        },
        {
          name: "CMCT",
          type: SiteType.NexusPHP,
          keywords: ["hdcmct.org"],
          baseUrl: "https://hdcmct.org/",
          description: "SpringSunday"
        },
        {
          name: "TTG",
          type: SiteType.NexusPHP,
          keywords: ["totheglory.im"],
          baseUrl: "https://totheglory.im/",
          description: "TTG (Nexus-like parsing)"
        },
        {
          name: "pterclub",
          type: SiteType.NexusPHP,
          keywords: ["pterclub.net"],
          baseUrl: "https://pterclub.net/",
          description: "Pter"
        },
        {
          name: "HDArea",
          type: SiteType.NexusPHP,
          keywords: ["hdarea.co"],
          baseUrl: "https://hdarea.co/",
          description: "HDArea"
        },
        {
          name: "Audiences",
          type: SiteType.NexusPHP,
          keywords: ["audiences.me"],
          baseUrl: "https://audiences.me/",
          description: "Audiences"
        },
        {
          name: "FRDS",
          type: SiteType.NexusPHP,
          keywords: ["keepfrds.com"],
          baseUrl: "https://keepfrds.com/",
          description: "FRDS"
        },
        {
          name: "CHDBits",
          type: SiteType.CHDBits,
          keywords: ["chdbits.co", "ptchdbits.co", "ptchdbits.org", "chddiy.xyz", "chdbits"],
          baseUrl: "https://chdbits.co/",
          description: "CHDBits",
          features: {
            imdbSearch: true
          }
        },
        {
          name: "PTP",
          type: SiteType.PTP,
          keywords: ["passthepopcorn.me"],
          baseUrl: "https://passthepopcorn.me/",
          description: "PassThePopcorn"
        },
        {
          name: "HDB",
          type: SiteType.HDB,
          keywords: ["hdbits.org"],
          baseUrl: "https://hdbits.org/",
          description: "HDBits"
        },
        {
          name: "KG",
          type: SiteType.KG,
          keywords: ["karagarga.in"],
          baseUrl: "https://karagarga.in/",
          description: "Karagarga"
        }
      ];
      const GazelleSites = [
        {
          name: "RED",
          type: SiteType.Gazelle,
          keywords: ["redacted.sh"],
          baseUrl: "https://redacted.sh/",
          description: "Redacted",
          features: {
            imdbSearch: false,
            doubanSearch: false
          }
        },
        {
          name: "OPS",
          type: SiteType.Gazelle,
          keywords: ["orpheus.network"],
          baseUrl: "https://orpheus.network/",
          description: "Orpheus"
        },
        {
          name: "DIC",
          type: SiteType.Gazelle,
          keywords: ["dicmusic.com"],
          baseUrl: "https://dicmusic.com/",
          description: "DICMusic"
        }
      ];
      const Unit3DSites = [
        {
          name: "BLU",
          type: SiteType.Unit3DClassic,
          keywords: ["blutopia.cc"],
          baseUrl: "https://blutopia.cc/",
          description: "Blutopia"
        },
        {
          name: "Tik",
          type: SiteType.Unit3DClassic,
          keywords: ["cinematik.net"],
          baseUrl: "https://cinematik.net/",
          description: "Cinematik (Tik)"
        },
        {
          name: "Aither",
          type: SiteType.Unit3DClassic,
          keywords: ["aither.cc"],
          baseUrl: "https://aither.cc/",
          description: "Aither"
        },
        {
          name: "FNP",
          type: SiteType.Unit3DClassic,
          keywords: ["fearnopeer.com"],
          baseUrl: "https://fearnopeer.com/",
          description: "FearNoPeer"
        },
        {
          name: "OnlyEncodes",
          type: SiteType.Unit3DClassic,
          keywords: ["onlyencodes.cc"],
          baseUrl: "https://onlyencodes.cc/",
          description: "OnlyEncodes"
        },
        {
          name: "DarkLand",
          type: SiteType.Unit3DClassic,
          keywords: ["darkland.top"],
          baseUrl: "https://darkland.top/",
          description: "DarkLand"
        },
        {
          name: "ReelFliX",
          type: SiteType.Unit3DClassic,
          keywords: ["reelflix.xyz"],
          baseUrl: "https://reelflix.xyz/",
          description: "ReelFliX"
        },
        {
          name: "ACM",
          type: SiteType.Unit3DClassic,
          keywords: ["eiga.moi"],
          baseUrl: "https://eiga.moi/",
          description: "ACM"
        },
        {
          name: "Monika",
          type: SiteType.Unit3DClassic,
          keywords: ["monikadesign.uk"],
          baseUrl: "https://monikadesign.uk/",
          description: "Monika"
        },
        {
          name: "DTR",
          type: SiteType.Unit3DClassic,
          keywords: ["torrent.desi"],
          baseUrl: "https://torrent.desi/",
          description: "DTR"
        },
        {
          name: "HDOli",
          type: SiteType.Unit3DClassic,
          keywords: ["hd-olimpo.club"],
          baseUrl: "https://hd-olimpo.club/",
          description: "HDOli"
        },
        {
          name: "HONE",
          type: SiteType.Unit3DClassic,
          keywords: ["hawke.uno"],
          baseUrl: "https://hawke.uno/",
          description: "HONE"
        },
        {
          name: "BHD",
          type: SiteType.BHD,
          keywords: ["beyond-hd.me"],
          baseUrl: "https://beyond-hd.me/",
          description: "Beyond-HD",
          features: {
            imdbSearch: true,
            doubanSearch: false
          }
        },
        {
          name: "HDF",
          type: SiteType.Unit3D,
          keywords: ["hdf.world"],
          baseUrl: "https://hdf.world/",
          description: "HDFans"
        },
        {
          name: "PrivateHD",
          type: SiteType.Unit3D,
          keywords: ["privatehd.to"],
          baseUrl: "https://privatehd.to/",
          description: "PrivateHD"
        }
      ];
      class SiteCatalogService {
        static getAllSites() {
          return [...NexusSites, ...GazelleSites, ...Unit3DSites];
        }
        static getAllSiteNames() {
          return this.getAllSites().map((s2) => s2.name);
        }
        static getDefaultEnabledSiteNames() {
          return this.getAllSiteNames();
        }
      }
      const hasGMObject = typeof GM !== "undefined";
      class GMAdapter {
        static async getValue(key, defaultValue) {
          try {
            if (typeof GM_getValue !== "undefined") {
              return GM_getValue(key, defaultValue);
            }
            if (hasGMObject && typeof GM.getValue === "function") {
              return await GM.getValue(key, defaultValue);
            }
          } catch {
          }
          try {
            const raw = localStorage.getItem(key);
            if (raw === null || raw === void 0) return defaultValue;
            return raw;
          } catch {
            return defaultValue;
          }
        }
        static async setValue(key, value) {
          try {
            if (typeof GM_setValue !== "undefined") {
              GM_setValue(key, value);
              return;
            }
            if (hasGMObject && typeof GM.setValue === "function") {
              await GM.setValue(key, value);
              return;
            }
          } catch {
          }
          try {
            localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
          } catch {
          }
        }
        static async setClipboard(text) {
          try {
            if (typeof GM_setClipboard !== "undefined") {
              GM_setClipboard(text);
              return;
            }
            if (hasGMObject && typeof GM.setClipboard === "function") {
              await GM.setClipboard(text);
              return;
            }
          } catch {
          }
          try {
            await navigator.clipboard.writeText(text);
          } catch {
          }
        }
        static async deleteValue(key) {
          try {
            if (typeof GM_deleteValue !== "undefined") {
              GM_deleteValue(key);
              return;
            }
            if (hasGMObject && typeof GM.deleteValue === "function") {
              await GM.deleteValue(key);
              return;
            }
          } catch {
          }
          try {
            localStorage.removeItem(key);
          } catch {
          }
        }
        static xmlHttpRequest(details) {
          return new Promise((resolve, reject) => {
            const withCallbacks = {
              ...details,
              onload: (resp) => {
                var _a;
                (_a = details.onload) == null ? void 0 : _a.call(details, resp);
                resolve(resp);
              },
              onerror: (err) => {
                var _a;
                (_a = details.onerror) == null ? void 0 : _a.call(details, err);
                reject(err);
              },
              ontimeout: () => {
                var _a;
                (_a = details.ontimeout) == null ? void 0 : _a.call(details);
                reject(new Error("timeout"));
              }
            };
            if (typeof GM_xmlhttpRequest === "function") {
              GM_xmlhttpRequest(withCallbacks);
              return;
            }
            if (hasGMObject && typeof GM.xmlHttpRequest === "function") {
              const result = GM.xmlHttpRequest(withCallbacks);
              if (result && typeof result.then === "function") {
                result.then(resolve).catch(reject);
              }
              return;
            }
            reject(new Error("GM_xmlhttpRequest not available"));
          });
        }
      } exports("G", GMAdapter);
      function getSearchName(name, type) {
        var _a;
        let searchName = name || "";
        if (type === "音乐") {
          searchName = searchName.split("-").pop() || searchName;
          searchName = searchName.replace(/\d{4}.*|\*/g, "").trim();
          return searchName;
        }
        if (searchName.match(/S\d{1,3}/i)) {
          searchName = searchName.split(/S\d{1,3}/i)[0];
          searchName = searchName.replace(/(19|20)\d{2}/gi, "").trim();
        } else if (searchName.match(/(19|20)\d{2}/)) {
          const year = (_a = searchName.match(/(19|20)\d{2}/g)) == null ? void 0 : _a.pop();
          if (year) searchName = searchName.split(year)[0];
        }
        searchName = searchName.replace(/repack|Extended|cut/gi, "");
        searchName = searchName.split(/aka/i)[0];
        return searchName.trim();
      }
      const DEFAULT_QUICK_SEARCH_TEMPLATES = [
        '<a href="https://passthepopcorn.me/torrents.php?searchstr={imdbid}" target="_blank">PTP</a>',
        '<a href="https://hdbits.org/browse.php?search={imdbid}" target="_blank">HDB</a>',
        '<a href="https://karagarga.in/browse.php?search={imdbid}&search_type=imdb" target="_blank">KG</a>',
        '<a href="https://beyond-hd.me/torrents?imdb={imdbid}" target="_blank">BHD</a>',
        '<a href="https://blutopia.xyz/torrents?imdbid={imdbno}&perPage=25&imdbId={imdbno}" target="_blank">BLU</a>',
        '<a href="https://totheglory.im/browse.php?search_field=imdb{imdbno}&c=M" target="_blank">TTG</a>',
        '<a href="https://chdbits.co/torrents.php?search={imdbid}&search_area=4&search_mode=0" target="_blank">CHD</a>',
        '<a href="https://springsunday.net/torrents.php?search={imdbid}&search_area=4&search_mode=0" target="_blank">CMCT</a>',
        '<a href="https://hdsky.me/torrents.php?search={imdbid}&search_area=4&search_mode=0" target="_blank">HDSky</a>',
        '<a href="https://search.douban.com/movie/subject_search?search_text={imdbid}&cat=1002" target="_blank">Douban</a>',
        '<a href="https://www.imdb.com/title/{imdbid}/" target="_blank">IMDb</a>'
      ];
      const extractFromAnchor = (line) => {
        var _a, _b;
        const href = (_a = line.match(/href=["']([^"']+)["']/i)) == null ? void 0 : _a[1];
        const text = (_b = line.match(/>([^<]+)<\/a>/i)) == null ? void 0 : _b[1];
        if (!href) return null;
        return { name: (text || href).trim(), url: href.trim() };
      };
      const extractFromPipe = (line) => {
        const parts = line.split("|");
        if (parts.length < 2) return null;
        const name = parts[0].trim();
        const url = parts.slice(1).join("|").trim();
        if (!url) return null;
        return { name: name || url, url };
      };
      const extractFromUrl = (line) => {
        if (!line.match(/^https?:\/\//i)) return null;
        try {
          const u2 = new URL(line);
          return { name: u2.hostname.replace(/^www\./, ""), url: line };
        } catch {
          return null;
        }
      };
      const fillTemplate = (url, meta) => {
        var _a, _b, _c, _d, _e;
        const imdbId = meta.imdbId || ((_b = (_a = meta.imdbUrl) == null ? void 0 : _a.match(/tt\d+/)) == null ? void 0 : _b[0]) || "";
        const imdbNo = imdbId.replace(/^tt/i, "");
        const doubanId = meta.doubanId || ((_d = (_c = meta.doubanUrl) == null ? void 0 : _c.match(/subject\/(\d+)/)) == null ? void 0 : _d[1]) || "";
        const searchNameRaw = getSearchName(meta.title || "", meta.type) || meta.title || "";
        let searchName = searchNameRaw;
        if ((meta.title || "").match(/S\d+/i)) {
          const number = (_e = (meta.title || "").match(/S(\d+)/i)) == null ? void 0 : _e[1];
          if (number) searchName = `${searchName} Season ${parseInt(number, 10)}`;
        }
        const replacements = {
          "{imdbid}": imdbId,
          "{imdbno}": imdbNo,
          "{doubanid}": doubanId,
          "{dbid}": doubanId,
          "{search_name}": encodeURIComponent(searchName),
          "{searchstr}": encodeURIComponent(searchName),
          "{title}": encodeURIComponent(meta.title || "")
        };
        let out = url;
        Object.entries(replacements).forEach(([key, value]) => {
          out = out.split(key).join(value || "");
        });
        return out;
      };
      const buildQuickSearchItems = (lines, meta) => {
        const items = [];
        const cleaned = (lines || []).map((l2) => l2.trim()).filter((l2) => l2 && !l2.startsWith("#"));
        cleaned.forEach((line) => {
          let parsed = extractFromAnchor(line) || extractFromPipe(line) || extractFromUrl(line);
          if (!parsed) return;
          const filled = fillTemplate(parsed.url, meta);
          if (filled.match(/\{(imdbid|imdbno|search_name|searchstr|title|doubanid|dbid)\}/)) return;
          items.push({ name: parsed.name, url: filled });
        });
        return items;
      };
      const DEFAULT_SETTINGS = {
        ptpImgApiKey: "",
        pixhostApiKey: "",
        freeimageApiKey: "",
        gifyuApiKey: "",
        hdbImgApiKey: "",
        hdbImgEndpoint: "https://hdbimg.com/api/1/upload",
        doubanCookie: "",
        tmdbApiKey: "",
        chdBaseUrl: "https://chdbits.co/",
        ptpShowDouban: true,
        ptpShowGroupName: true,
        ptpNameLocation: 1,
        hdbShowDouban: true,
        hdbHideDouban: false,
        showQuickSearchOnDouban: true,
        showQuickSearchOnImdb: true,
        enableRemoteSidebar: false,
        remoteServer: null,
        imdbToDoubanMethod: 0,
        ptgenApi: 3,
        quickSearchList: DEFAULT_QUICK_SEARCH_TEMPLATES.slice(),
        quickSearchPresets: [],
        quickSearchTextareaHeight: 220,
        enabledSites: SiteCatalogService.getDefaultEnabledSiteNames(),
        favoriteSites: ["TTG", "CMCT", "pterclub", "CHDBits", "BHD", "MTeam"].filter(
          (name) => SiteCatalogService.getAllSiteNames().includes(name)
        ),
        showSearchOnList: {
          PTP: true,
          HDB: false,
          HDT: false,
          UHD: false
        }
      };
      class SettingsService {
        static async load() {
          return new Promise((resolve) => {
            try {
              GMAdapter.getValue(this.KEY, null).then((stored) => {
                if (stored) {
                  resolve({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
                  return;
                }
                resolve({ ...DEFAULT_SETTINGS });
              });
              return;
            } catch (e2) {
              console.error("Error loading settings", e2);
            }
            resolve({ ...DEFAULT_SETTINGS });
          });
        }
        static async save(settings) {
          return new Promise((resolve) => {
            const data = JSON.stringify(settings);
            GMAdapter.setValue(this.KEY, data).then(() => resolve());
          });
        }
      }
      __publicField(SettingsService, "KEY", "auto_feed_settings");
      const SettingsService$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
        __proto__: null,
        SettingsService
      }, Symbol.toStringTag, { value: "Module" }));
      class Unit3DClassicEngine extends Unit3DEngine {
        async parse() {
          var _a, _b, _c, _d;
          this.log("Parsing Unit3D Classic page...");
          const meta = await super.parse();
          const title = $$1("h1.torrent__name, h1").first().text().trim();
          if (title) meta.title = title;
          const isHone = $$1("#meta-info").length > 0;
          if (isHone) {
            try {
              const imdbUrl = matchLink("imdb", $$1("#meta-info").html() || document.body.innerHTML);
              if (imdbUrl) {
                meta.imdbUrl = imdbUrl;
                meta.imdbId = (_a = imdbUrl.match(/tt\d+/)) == null ? void 0 : _a[0];
              }
            } catch {
            }
            const typeText = $$1(".torrent-category").text().trim();
            if (typeText) meta.type = getType(typeText);
            const honeName = $$1("span.torrent-category.badge-extra:first").text().trim();
            if (honeName) meta.title = honeName.replace(/\(|\)/g, "").replace(/English-/, "-");
            const mi = $$1(".torrent-mediainfo-dump pre").text().trim();
            let imgUrls2 = "";
            $$1(".torrent-description").find("a").has("img").each((_2, a2) => {
              const link = a2.href;
              const img = a2.querySelector("img");
              const src = (img == null ? void 0 : img.getAttribute("src")) || (img == null ? void 0 : img.getAttribute("data-src")) || (img == null ? void 0 : img.src) || "";
              if (!src) return;
              imgUrls2 += `[url=${link}][img]${src}[/img][/url]`;
              meta.images.push(src);
            });
            if (mi || imgUrls2) {
              meta.description = `${mi ? `[quote]${mi}
[/quote]

` : ""}${imgUrls2}`.trim();
            }
            const honeTorrent = $$1(".button-block").find('a[href*="torrents/download"]').attr("href") || "";
            if (honeTorrent) {
              try {
                meta.torrentUrl = new URL(honeTorrent, this.currentUrl).href;
              } catch {
                meta.torrentUrl = honeTorrent;
              }
            }
          }
          if (!isHone) {
            const typeText = $$1("li.torrent__category").text().trim();
            if (typeText) meta.type = getType(typeText);
            const tagText = $$1(".torrent__tags").text().trim();
            if (tagText && !meta.type) {
              meta.type = getType(tagText);
            }
          }
          let mediainfo = "";
          try {
            mediainfo = $$1('code[x-ref="mediainfo"]').text().trim();
            if (!mediainfo) {
              mediainfo = $$1('code[x-ref="bdinfo"]').text().trim();
            }
          } catch {
          }
          let imgUrls = "";
          try {
            const descPanel = $$1('h2.panel__heading:contains("Description"), h2.panel__heading:contains("描述")').parent().next();
            descPanel.find("img").each((_2, img) => {
              const el = img;
              const parent = el.parentElement;
              const href = parent == null ? void 0 : parent.href;
              const src = el.getAttribute("data-src") || el.getAttribute("src") || el.src || "";
              if (!src) return;
              if (href) {
                imgUrls += `[url=${href}][img]${src}[/img][/url] `;
              } else {
                imgUrls += `[img]${src}[/img] `;
              }
              meta.images.push(src);
            });
          } catch {
          }
          if (!meta.description && (mediainfo || imgUrls)) {
            meta.description = `${mediainfo ? `[quote]
${mediainfo}
[/quote]

` : ""}${imgUrls}`.trim();
            meta.description = meta.description.replace(/https:\/\/wsrv\.nl\/\?n=-1&url=/g, "");
          }
          const detailTables = $$1(".table-responsive table, .shoutbox table");
          if (!isHone && detailTables.length) {
            const table = detailTables.first();
            const tds = table.find("td").toArray();
            for (let i2 = 0; i2 < tds.length; i2++) {
              const key = (tds[i2].textContent || "").trim();
              const nextText = (((_b = tds[i2 + 1]) == null ? void 0 : _b.textContent) || "").replace(/ *\n.*/gm, "").trim();
              if (!key) continue;
              if (["副标题", "Subtitle", "Sub Title", "Sub-title"].includes(key) && nextText) {
                meta.smallDescr = nextText;
                if (!meta.subtitle) meta.subtitle = nextText;
              }
              if (["Name", "Nombre", "名称", "标题"].includes(key) && nextText) {
                meta.title = nextText;
              }
              if (["Category", "类别", "Categoría"].includes(key) && nextText) {
                if (nextText.match(/Movie|电影|Películas/i)) meta.type = "电影";
                if (nextText.match(/(TV-Show|TV|剧集|Series)/i)) meta.type = "剧集";
                if (nextText.match(/Anime (TV|Movie)/i)) meta.type = "动漫";
                if (nextText.match(/(Docu|纪录|Documentary)/i)) meta.type = "纪录";
              }
              if (["Type", "Tipo", "规格"].includes(key) && nextText) {
                if (nextText.match(/BD 50/i)) meta.mediumSel = "Blu-ray";
                else if (nextText.match(/Remux/i)) meta.mediumSel = "Remux";
                else if (nextText.match(/encode/i)) meta.mediumSel = "Encode";
                else if (nextText.match(/web-?dl/i)) meta.mediumSel = "WEB-DL";
              }
            }
          }
          try {
            const imdbBox = $$1(".movie-details, .movie__details").first();
            if (imdbBox.length) {
              const imdbUrl = matchLink("imdb", imdbBox.parent().html() || imdbBox.html() || "");
              if (imdbUrl) {
                meta.imdbUrl = imdbUrl;
                meta.imdbId = (_c = imdbUrl.match(/tt\d+/)) == null ? void 0 : _c[0];
              } else {
                const tmdbUrl = matchLink("tmdb", imdbBox.parent().html() || imdbBox.html() || "");
                if (tmdbUrl) {
                  meta.tmdbUrl = tmdbUrl;
                  const settings = await SettingsService.load();
                  if (settings.tmdbApiKey) {
                    const api = `https://api.themoviedb.org/3/${(_d = tmdbUrl.match(/(tv|movie)\/\d+/)) == null ? void 0 : _d[0]}/external_ids?api_key=${settings.tmdbApiKey}`;
                    await new Promise((resolve) => {
                      GMAdapter.xmlHttpRequest({
                        method: "GET",
                        url: api,
                        onload: (resp) => {
                          try {
                            const data = JSON.parse(resp.responseText || "{}");
                            if (data.imdb_id) {
                              meta.imdbUrl = `https://www.imdb.com/title/${data.imdb_id}/`;
                              meta.imdbId = data.imdb_id;
                            }
                          } catch {
                          }
                          resolve();
                        },
                        onerror: () => resolve()
                      }).catch(() => resolve());
                    });
                  }
                }
              }
            }
          } catch {
          }
          const torrentUrl = $$1('a[href*="torrents/download"]').attr("href") || $$1('a[href*="download/"]').attr("href") || "";
          if (torrentUrl) {
            try {
              meta.torrentUrl = new URL(torrentUrl, this.currentUrl).href;
            } catch {
              meta.torrentUrl = torrentUrl;
            }
          }
          if (!meta.torrentFilename && meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, ".").replace(/\*/g, "") + ".torrent";
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, ".");
            meta.torrentName = meta.torrentFilename;
          }
          this.log(`Parsed: ${meta.title}`);
          return meta;
        }
      }
      const regTeamName = {
        MTeam: /-(.*mteam|mpad|tnp|BMDru|MWEB)/i,
        CMCT: /-(CMCT|cmctv)/i,
        HDSky: /-(hds|.*@HDSky)/i,
        CHDBits: /-(CHD|.*@CHDBits)|@CHDWEB/i,
        OurBits: /(-Ao|-.*OurBits|-FLTTH|-IloveTV|OurTV|-IloveHD|OurPad|-MGs)$/i,
        TTG: /-(WiKi|DoA|.*TTG|NGB|ARiN)/i,
        HDChina: /-(HDC)/i,
        PTer: /-(Pter|.*Pter)/i,
        HDHome: /(-hdh|.*@HDHome)/i,
        PThome: /(-pthome|-pth|.*@pth)/i,
        Audiences: /(-Audies|.*@Audies|-ADE|-ADWeb|.*@ADWeb)/i,
        PTLGS: /(-PTLGS|.*@PTLGS)/i,
        PuTao: /-putao/i,
        NanYang: /-nytv/i,
        TLFbits: /-tlf/i,
        HDDolby: /-DBTV|-QHstudIo|Dream$|.*@dream/i,
        FRDS: /-FRDS|@FRDS/i,
        PigGo: /PigoHD|PigoWeb|PiGoNF/i,
        CarPt: /CarPT/i,
        HDVideo: /(-HDVWEB|-HDVMV)/i,
        HDfans: /HDFans/i,
        "WT-Sakura": /SakuraWEB|SakuraSUB|WScode/i,
        HHClub: /HHWEB/i,
        HaresClub: /Hares?WEB|HaresTV|DIY@Hares|-hares/i,
        HDPt: /hdptweb/i,
        Panda: /AilMWeb|-PANDA|@Panda/i,
        UBits: /@UBits|-UBits|-UBWEB/i,
        PTCafe: /CafeWEB|CafeTV|DIY@PTCafe/i,
        影: /Ying(WEB|DIY|TV|MV|MUSIC)?$/i,
        DaJiao: /DJWEB|DJTV/i,
        OKPT: /OK(WEB|Web)?$/i,
        AGSV: /AGSV(PT|E|WEB|REMUX|Rip|TV|DIY|MUS)?$/i,
        TJUPT: /TJUPT$/i,
        FileList: /Play(HD|SD|WEB|TV)$/i,
        CrabPt: /XHBWeb$/i,
        红叶: /(RLWEB|RLeaves|RLTV|-R²)$/i,
        QingWa: /(FROG|FROGE|FROGWeb)$/i,
        ZMPT: /ZmWeb|ZmPT/i,
        LemonHD: /(-LHD|League(WEB|CD|NF|HD|TV|MV))$/i,
        ptsbao: /-(FFans|sBao|FHDMV|OPS)/i,
        麒麟: /-HDK(WEB|TV|MV|Game|DIY|ylin)/i,
        "13City": /-(13City|.*13City)/i
      };
      function addThanks(descr, title) {
        const thanksStr = "[quote][b][color=blue]{site}官组作品，感谢原制作者发布。[/color][/b][/quote]\n\n{descr}";
        for (const key in regTeamName) {
          if (title.match(regTeamName[key]) && !title.match(/PandaMoon|HDSpace|HDClub|LCHD/i)) {
            descr = thanksStr.replace("{site}", key).replace("{descr}", descr);
          }
        }
        return descr;
      }
      const skipImg = [
        "[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png[/img]",
        "[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c7782a.png[/img]",
        "[img]https://images2.imgbox.com/04/6b/Ggp5ReQb_o.png[/img]",
        "[img]https://www.z4a.net/images/2019/09/13/info.png[/img]",
        "[img]https://www.z4a.net/images/2019/09/13/screens.png[/img]",
        "[img]https://i.loli.net/2019/03/28/5c9cb8f8216d7.png[/img]",
        "[img]https://hdsky.me/attachments/201410/20141003100205b81803ac0903724ad88de90649c5a36e.jpg[/img]",
        "[img]https://hdsky.me/adv/hds_logo.png[/img]",
        "[img]https://iili.io/XF9HEQ.png[/img]",
        "[img]https://img.pterclub.net/images/2022/03/24/58ef34eb1c04aa6f87442e439d103b29.png[/img]",
        "[img]https://img.pterclub.net/images/2021/07/14/78c58ee6b3e092d0c5a7fa02f3a1905e.png[/img]",
        "[img]https://pterclub.net/pic/CS.png[/img]",
        "[img]https://pterclub.net/pic/GDJT.png[/img]",
        "[img]http://img.pterclub.net/images/CS.png[/img]",
        "[img]https://img.pterclub.net/images/GDJT.png[/img]",
        "[img]https://kp.m-team.cc/logo.png[/img]",
        "[img]http://tpimg.ccache.org/images/2015/03/08/c736743e65f95c4b68a8acd3f3e2d599.png[/img]",
        "[img]https://ourbits.club/pic/Ourbits_info.png[/img]",
        "[img]https://ourbits.club/pic/Ourbits_MoreScreens.png[/img]",
        "[img]https://images2.imgbox.com/ce/e7/KCmGFMOB_o.png[/img]",
        "[img]https://img.m-team.cc/images/2016/12/05/d3be0d6f0cf8738edfa3b8074744c8e8.png[/img]",
        "[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png[/img]",
        "[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c7782a.png[/img]"
      ];
      function getMediainfoPictureFromDescr(descr, options) {
        var _a, _b, _c, _d;
        const info = {
          mediainfo: "",
          picInfo: ""
        };
        let imgInfo = "";
        let mediainfo = "";
        const imgUrls = descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/gi);
        let indexOfInfo = 0;
        if (descr.match(/◎译.{2,10}名|◎片.{2,10}名|片.{2,10}名/)) {
          indexOfInfo = ((_a = descr.match(/◎译.{2,10}名|◎片.{2,10}名|片.{2,10}名/)) == null ? void 0 : _a.index) || 0;
        }
        try {
          if (imgUrls) {
            for (let i2 = 0; i2 < imgUrls.length; i2++) {
              if (descr.indexOf(imgUrls[i2]) < 10 || descr.indexOf(imgUrls[i2]) < indexOfInfo) {
                info.coverImg = imgUrls[i2];
              } else {
                descr = descr.replace(imgUrls[i2], "");
                imgInfo += ((_b = imgUrls[i2].match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/)) == null ? void 0 : _b[0]) || "";
              }
            }
          }
        } catch (err) {
          imgInfo = "";
        }
        descr = `${descr}

${imgInfo}`;
        try {
          if (descr.match(/DISC INFO:|.MPLS|Video Codec|Disc Label/i) && ((options == null ? void 0 : options.mediumSel) === "UHD" || (options == null ? void 0 : options.mediumSel) === "BluRay" || (options == null ? void 0 : options.mediumSel) === "Blu-ray")) {
            mediainfo = ((_c = descr.match(/\[quote.*?\][\s\S]*?(DISC INFO|.MPLS|Video Codec|Disc Label)[\s\S]*?\[\/quote\]/i)) == null ? void 0 : _c[0]) || "";
          } else if (descr.match(/General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率/i)) {
            const matches = descr.match(/\[quote.*?\][\s\S]*?(General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率)[\s\S]*?\[\/quote\]/gi);
            mediainfo = matches ? matches.join("\n\n") : "";
            if (mediainfo.match(/\.VOB|\.IFO/i)) {
              info.multiMediainfos = mediainfo.replace(/\[\/?quote\]/g, "");
            }
          }
        } catch (err) {
          if (descr.match(/\n.*DISC INFO:[\s\S]*kbps.*/)) {
            mediainfo = ((_d = descr.match(/\n.*DISC INFO:[\s\S]*kbps.*/)) == null ? void 0 : _d[0].trim()) || "";
          }
        }
        mediainfo = mediainfo.replace(/\[quote.*?\]/gi, "[quote]");
        while (mediainfo.match(/\[quote\]/i)) {
          mediainfo = mediainfo.slice(mediainfo.search(/\[quote\]/) + 7);
        }
        mediainfo = mediainfo.replace(/\[\/quote\]/i, "");
        mediainfo = mediainfo.replace(/\[\/?(font|size|quote|color).{0,80}?\]/gi, "");
        let imgs = descr.split(/\[\/quote\]/).pop() || "";
        const imgMatches = imgs.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/g);
        try {
          if (imgMatches) {
            const skipList = (options == null ? void 0 : options.skipImgList) || skipImg;
            imgs = imgMatches.filter((item) => skipList.indexOf(item) < 0 && !item.match(/m.media-amazon.com\/images/)).join(" ");
          } else {
            imgs = "";
          }
        } catch (err) {
          imgs = "";
        }
        info.mediainfo = mediainfo.trim();
        info.picInfo = imgs.trim();
        return info;
      }
      function dealWithTitle(title) {
        if (!title) return "";
        let t2 = title.replace(/\./g, " ").replace(/torrent$/gi, "").trim() + " ";
        if (t2.match(/[^\d](2 0|5 1|7 1|1 0|6 1|2 1|4 0|5 0)[^\d]/)) {
          t2 = t2.replace(/[^\d](2 0|5 1|7 1|1 0|6 1|2 1|4 0|5 0)[^\d]/g, (data) => {
            return data.slice(0, 2) + "." + data.slice(3);
          }).trim();
        }
        t2 = t2.replace(/H ?(26[45])/i, "H.$1").replace(/x265[.-]10bit/i, "x265 10bit");
        t2 = t2.replace(/\s+\[2?x?(免费|free)\].*$|\(限时.*\)|\(限時.*\)|\(已审|通过|待定\)/gi, "").replace(/\[.*?\]/g, "").replace(/剩余时间.*/i, "");
        t2 = t2.replace(/\(|\)/g, "").replace(/ - /g, (data, index) => {
          var _a;
          try {
            const yIndex = ((_a = t2.match(/(19|20)\d+/)) == null ? void 0 : _a.index) ?? -1;
            if (yIndex > -1 && index > yIndex) return "-";
            return data;
          } catch {
            return data;
          }
        });
        t2 = t2.replace("_10_", "(_10_)");
        t2 = t2.replace("V2.1080p", "V2 1080p").replace(/mkv$|mp4$/i, "").trim();
        return t2;
      }
      function dealWithSubtitle(subtitle) {
        if (!subtitle) return "";
        return subtitle.replace(/\[checked by.*?\]/i, "").replace(/autoup/i, "").replace(/ +/g, " ").trim();
      }
      class MTeamEngine extends BaseEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          var _a, _b, _c;
          this.log("Parsing MTeam page...");
          const meta = {
            title: "",
            description: "",
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images: []
          };
          const descrEl = $$1("div.markdown-body").first();
          if (descrEl.length) {
            meta.description = htmlToBBCode(descrEl[0]);
          }
          const torrentId = (_a = this.currentUrl.match(/detail\/(\d+)/)) == null ? void 0 : _a[1];
          if (!torrentId) {
            this.error("Cannot find MTeam torrent id in URL.");
            return meta;
          }
          const buildFetch = (api) => {
            return fetch(`https://api.m-team.io/${api}`, {
              method: "POST",
              headers: {
                "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
                ts: Math.floor(Date.now() / 1e3).toString(),
                authorization: localStorage.getItem("auth") || ""
              },
              body: new URLSearchParams({ id: torrentId }).toString()
            });
          };
          const apis = ["api/torrent/detail", "api/torrent/genDlToken"];
          const results = await Promise.all(
            apis.map(async (api) => {
              try {
                const response = await buildFetch(api);
                const responseJson = await response.json();
                if (!response.ok) throw new Error(`${response.statusText}`);
                return responseJson.data;
              } catch (err) {
                return null;
              }
            })
          );
          const detail = results[0];
          const downloadToken = results[1];
          if (downloadToken) {
            meta.torrentUrl = downloadToken;
          } else {
            meta.torrentUrl = this.currentUrl;
          }
          if (detail) {
            meta.title = detail.name || meta.title;
            meta.torrentFilename = meta.title ? meta.title.replace(/ /g, ".").replace(/\*/g, "") + ".torrent" : meta.torrentFilename;
            if (meta.torrentFilename) {
              meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, ".");
              meta.torrentName = meta.torrentFilename;
            }
            meta.smallDescr = meta.smallDescr || detail.smallDescr;
            if (!meta.subtitle) meta.subtitle = meta.smallDescr;
            const imdbUrl = detail.descr && detail.descr.match(/title\/tt\d+/) ? matchLink("imdb", detail.descr) : detail.imdb;
            if (imdbUrl) {
              meta.imdbUrl = imdbUrl;
              meta.imdbId = (_b = imdbUrl.match(/tt\d+/)) == null ? void 0 : _b[0];
            }
            if (detail.douban) {
              meta.doubanUrl = detail.douban;
              meta.doubanId = (_c = detail.douban.match(/subject\/(\d+)/)) == null ? void 0 : _c[1];
            }
            if (!meta.description) {
              meta.description = detail.descr || "";
              try {
                meta.description = meta.description.replace(/\*\*(.*?)\*\*/g, "$1");
              } catch {
              }
              try {
                meta.description = meta.description.replace(/!\[\]\((.*?)\)/g, "[img]$1[/img]\n");
              } catch {
              }
            }
            meta.type = getType($$1('span[class*="ant-typography"]:contains(類別)').text());
            if (detail.mediainfo) {
              let mediainfo = detail.mediainfo;
              meta.fullMediaInfo = mediainfo;
              try {
                mediainfo = decodeURIComponent(detail.mediainfo);
              } catch {
              }
              let pictureInfo = "";
              try {
                const intro = meta.description.indexOf("◎简　　介");
                const pictures = meta.description.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?\n?/g);
                if (pictures) {
                  pictures.forEach((item) => {
                    if (meta.description.indexOf(item) > 300 || intro > -1 && meta.description.indexOf(item) > intro) {
                      if (!item.match(/doubanio.com/)) {
                        meta.description = meta.description.replace(item, "");
                        pictureInfo += `${item}
`;
                      }
                    }
                  });
                }
                meta.description = meta.description.trim() + `
  
[quote]
${mediainfo.trim()}
[/quote]
  
` + pictureInfo;
              } catch {
              }
            }
            meta.description = meta.description.replace(/https:\/\/kp\.m-team\.cc.*?url=/gi, "");
            meta.description = meta.description.replace(/\n+/g, "\n");
            meta.description = meta.description.replace(
              /^\[quote\]\[b\]\[color=blue\]转自.*?，感谢原制作者发布。\[\/color\]\[\/b\]\[\/quote\]/i,
              ""
            );
            meta.description = addThanks(meta.description, meta.title || "");
          }
          this.log(`Parsed: ${meta.title}`);
          return meta;
        }
        async fill(meta) {
          this.log("Filling MTeam form...");
          const infoText = `${meta.title} ${meta.subtitle || meta.smallDescr || ""} ${meta.description} ${meta.fullMediaInfo || ""}`;
          meta.mediumSel = meta.mediumSel || getMediumSel(infoText, meta.title);
          meta.codecSel = meta.codecSel || getCodecSel(infoText);
          meta.audioCodecSel = meta.audioCodecSel || getAudioCodecSel(infoText);
          meta.standardSel = meta.standardSel || getStandardSel(infoText);
          try {
            const { TorrentService } = await __vitePreload(async () => {
              const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
              return { TorrentService: TorrentService2 };
            }, true ? void 0 : void 0);
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, null);
            if (result) {
              TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
              const nameInput = document.getElementById("name");
              if (result.nameFromTorrent && nameInput && !nameInput.value) {
                nameInput.value = dealWithTitle(result.nameFromTorrent);
              }
            }
          } catch (err) {
            console.error("[Auto-Feed][MTeam] Torrent inject failed:", err);
          }
          let typeCode = "電影/HD";
          switch (meta.type) {
            case "电影":
              if (meta.mediumSel === "Blu-ray" || meta.mediumSel === "UHD") {
                typeCode = "電影/Blu-Ray";
              } else if (meta.mediumSel === "Remux") {
                typeCode = "電影/Remux";
              } else if (meta.mediumSel === "DVD" || meta.mediumSel === "DVDRip") {
                typeCode = "電影/DVDiSo";
              } else {
                typeCode = meta.standardSel !== "SD" ? "電影/HD" : "電影/SD";
              }
              break;
            case "剧集":
            case "综艺":
              if (meta.mediumSel === "Blu-ray" || meta.mediumSel === "UHD") {
                typeCode = "影劇/綜藝/BD";
              } else if (meta.mediumSel === "DVD" || meta.mediumSel === "DVDRip") {
                typeCode = "影劇/綜藝/DVDiSo";
              } else {
                typeCode = meta.standardSel !== "SD" ? "影劇/綜藝/HD" : "影劇/綜藝/SD";
              }
              break;
            case "纪录":
              typeCode = "紀錄";
              break;
            case "学习":
              typeCode = "教育(書面)";
              break;
            case "动漫":
              typeCode = "動畫";
              break;
            case "音乐":
              typeCode = meta.title.match(/(flac|ape)/i) ? "Music(無損)" : "Music(AAC/ALAC)";
              break;
            case "MV":
              typeCode = "演唱";
              break;
            case "体育":
              typeCode = "運動";
              break;
            case "软件":
              typeCode = "軟體";
              break;
            case "游戏":
              typeCode = "PC遊戲";
              break;
            case "书籍":
              typeCode = "Misc(其他)";
              break;
          }
          let videoCodec = "H.264";
          switch (meta.codecSel) {
            case "H264":
            case "X264":
              videoCodec = "H.264(x264/AVC)";
              break;
            case "VC-1":
              videoCodec = "VC-1";
              break;
            case "XVID":
              videoCodec = "Xvid";
              break;
            case "MPEG-2":
              videoCodec = "MPEG-2";
              break;
            case "H265":
            case "X265":
              videoCodec = "H.265(x265/HEVC)";
              break;
            case "AV1":
              videoCodec = "AV1";
              break;
          }
          let audioCodec = "Other";
          switch (meta.audioCodecSel) {
            case "DTS-HD":
            case "DTS-HDMA:X 7.1":
            case "DTS-HDMA":
            case "DTS-HDHR":
              audioCodec = "DTS-HD MA";
              break;
            case "TrueHD":
              audioCodec = "TrueHD";
              break;
            case "Atmos":
              audioCodec = "TrueHD Atmos";
              break;
            case "AC3":
              audioCodec = "AC3(DD)";
              if (meta.title.match(/DDP|DD\+/)) {
                audioCodec = "E-AC3(DDP)";
                if (meta.title.match(/Atoms/)) {
                  audioCodec = "E-AC3 Atoms(DDP Atoms)";
                }
              }
              break;
            case "LPCM":
              audioCodec = "LPCM/PCM";
              break;
            case "DTS":
            case "AAC":
            case "Flac":
            case "APE":
            case "WAV":
              audioCodec = meta.audioCodecSel.toUpperCase();
              break;
          }
          const setValue = (input, value) => {
            const lastValue = input.value;
            input.value = value;
            const tracker = input._valueTracker;
            if (tracker) tracker.setValue(lastValue);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          };
          const selectDropdownOption = async (tid, index, targetTitle) => {
            var _a;
            const clickEvent = document.createEvent("MouseEvents");
            clickEvent.initEvent("mousedown", true, true);
            (_a = document.getElementById(tid)) == null ? void 0 : _a.dispatchEvent(clickEvent);
            await new Promise((resolve) => setTimeout(resolve, 100));
            const listHolder = document.querySelectorAll(".rc-virtual-list-holder")[index];
            if (!listHolder) {
              console.error("未找到下拉列表，请确保下拉框已经打开！");
              return;
            }
            const findAndClick = (title) => {
              const option = listHolder.querySelector(`.ant-select-item-option[title="${title}"]`);
              if (option) {
                option.click();
                return true;
              }
              return false;
            };
            if (typeof targetTitle === "string") {
              if (findAndClick(targetTitle)) return;
              const scrollStep = 100;
              const delay = 100;
              let totalHeight = listHolder.scrollHeight;
              let currentScroll = 0;
              listHolder.scrollTop = 0;
              while (currentScroll < totalHeight) {
                listHolder.scrollTop += scrollStep;
                currentScroll += scrollStep;
                await new Promise((resolve) => setTimeout(resolve, delay));
                if (findAndClick(targetTitle)) return;
                totalHeight = listHolder.scrollHeight;
              }
            } else if (Array.isArray(targetTitle)) {
              targetTitle.forEach((x2, idx) => {
                setTimeout(() => {
                  const option = document.querySelector(`.ant-select-item-option[title="${x2}"]`);
                  if (option) option.click();
                }, 200 * idx);
              });
            }
          };
          const labels = getLabel(`${meta.smallDescr || meta.subtitle || ""}${meta.title}#separator#${meta.description}`);
          meta.labelInfo = labels;
          $$1("#category").wait(async () => {
            const nameInput = document.getElementById("name");
            const smallInput = document.getElementById("smallDescr");
            const imdbInput = document.getElementById("imdb");
            const doubanInput = document.getElementById("douban");
            if (nameInput) setValue(nameInput, meta.title);
            if (smallInput) setValue(smallInput, meta.smallDescr || meta.subtitle || "");
            if (imdbInput && meta.imdbUrl) setValue(imdbInput, meta.imdbUrl);
            if (doubanInput && meta.doubanUrl) setValue(doubanInput, meta.doubanUrl);
            setTimeout(() => {
              if (nameInput) setValue(nameInput, meta.title);
              if (labels.gy || labels.yy) {
                const el = document.getElementsByClassName("ant-checkbox-input")[1];
                if (el) el.click();
              }
              if (labels.zz) {
                const checkbox = document.getElementsByClassName("ant-checkbox-input")[0];
                if (checkbox) {
                  const parent = checkbox.parentNode;
                  const nodeClass = parent == null ? void 0 : parent.classList;
                  let clicked = false;
                  nodeClass == null ? void 0 : nodeClass.forEach((className) => {
                    if (className === "ant-checkbox-checked") clicked = true;
                  });
                  if (!clicked) checkbox.click();
                }
              }
            }, 3e3);
            const regRegion = meta.description.match(/(地.{0,5}?区|国.{0,5}?家|产.{0,5}?地|產.{0,5}?地)([^\r\n]+)/);
            if (regRegion) {
              const region = regRegion[2].trim();
              if (!$$1("#region_tips").length) {
                $$1('span:contains("請選擇國家/地區")').first().parent().parent().parent().parent().after(`<p id="region_tips">当前资源的来源国家/地区为：${region}</p>`);
              }
            }
            const mediainfoContainer = document.getElementById("mediainfo");
            let mediainfo = "";
            if (meta.fullMediaInfo) {
              mediainfo = meta.fullMediaInfo;
            } else {
              mediainfo = getMediainfoPictureFromDescr(meta.description, { mediumSel: meta.mediumSel }).mediainfo;
            }
            if (mediainfoContainer) setValue(mediainfoContainer, mediainfo.trim());
            await selectDropdownOption("standard", 0, meta.standardSel || "1080p");
            await selectDropdownOption("videoCodec", 1, videoCodec);
            await selectDropdownOption("audioCodec", 2, audioCodec);
            await selectDropdownOption("category", 3, typeCode);
            await new Promise((resolve) => setTimeout(resolve, 2e3));
            const editor = document.querySelector('.editor-input[contenteditable="true"]');
            if (!editor) {
              console.log("未找到编辑器");
              return;
            }
            editor.focus();
            const dataTransfer = new DataTransfer();
            dataTransfer.setData("text/plain", meta.description);
            const pasteEvent = new ClipboardEvent("paste", {
              clipboardData: dataTransfer,
              bubbles: true,
              cancelable: true
            });
            editor.dispatchEvent(pasteEvent);
            editor.dispatchEvent(new InputEvent("input", { bubbles: true }));
          }, 1e4, 20);
        }
      }
      class CHDBitsEngine extends NexusPHPEngine {
        constructor(config, url) {
          super(config, url);
        }
        async fill(meta) {
          this.log("Filling CHDBits form...");
          await super.fill(meta);
          const labels = meta.labelInfo || getLabel(`${meta.smallDescr || meta.subtitle || ""}${meta.title}#separator#${meta.description}`);
          meta.labelInfo = labels;
          try {
            if (labels.gy) document.getElementsByName("cnlang")[0].checked = true;
            if (labels.zz) document.getElementsByName("cnsub")[0].checked = true;
            if (labels.diy) document.getElementsByName("diy")[0].checked = true;
          } catch {
          }
          try {
            const browsecat = document.getElementsByName("type")[0];
            const typeDict = {
              电影: 1,
              剧集: 4,
              动漫: 3,
              综艺: 5,
              音乐: 6,
              MV: 6,
              纪录: 2,
              体育: 7
            };
            if (typeDict.hasOwnProperty(meta.type || "")) {
              const index = typeDict[meta.type || ""];
              browsecat.options[index].selected = true;
            }
            if (meta.type === "书籍" && meta.description.match(/m4a|mp3/i)) {
              browsecat.options[9].selected = true;
            }
            const audiocodecBox = document.getElementsByName("audiocodec_sel")[0];
            const audiocodecDict = {
              Flac: 6,
              APE: 7,
              AC3: 2,
              WAV: 8,
              Atmos: 4,
              AAC: 9,
              "DTS-HDMA": 3,
              "DTS-HDHR": 3,
              "TrueHD Atmos": 4,
              TrueHD: 4,
              DTS: 1,
              LPCM: 5,
              "DTS-HDMA:X 7.1": 3
            };
            if (audiocodecDict.hasOwnProperty(meta.audioCodecSel || "")) {
              const index = audiocodecDict[meta.audioCodecSel || ""];
              audiocodecBox.options[index].selected = true;
            }
            const standardBox = document.getElementsByName("standard_sel")[0];
            const standardDict = {
              "8K": 5,
              "4K": 6,
              "1080p": 1,
              "1080i": 2,
              "720p": 3,
              SD: 4,
              "": 4
            };
            if (standardDict.hasOwnProperty(meta.standardSel || "")) {
              const index = standardDict[meta.standardSel || ""];
              standardBox.options[index].selected = true;
            }
            const codecBox = document.getElementsByName("codec_sel")[0];
            const codecDict = { H264: 1, X265: 2, X264: 1, H265: 2, "VC-1": 5, "MPEG-2": 4 };
            if (codecDict.hasOwnProperty(meta.codecSel || "")) {
              const index = codecDict[meta.codecSel || ""];
              codecBox.options[index].selected = true;
            }
            const mediumBox = document.getElementsByName("medium_sel")[0];
            const mediumDict = { UHD: 2, "Blu-ray": 1, Encode: 4, HDTV: 5, "WEB-DL": 6, Remux: 3, CD: 7 };
            if (mediumDict.hasOwnProperty(meta.mediumSel || "")) {
              const index = mediumDict[meta.mediumSel || ""];
              mediumBox.options[index].selected = true;
            }
            switch (meta.mediumSel) {
              case "UHD":
                if (meta.title.match(/(diy|@)/i)) {
                  mediumBox.options[2].selected = true;
                }
                break;
              case "Blu-ray":
                if (meta.title.match(/(diy|@)/i)) {
                  mediumBox.options[1].selected = true;
                }
                break;
            }
          } catch (err) {
            console.error(err);
          }
          try {
            $$1('select[name="source_sel"]').val(7);
            this.checkTeam(meta, "team_sel");
          } catch {
          }
          try {
            const { TorrentService } = await __vitePreload(async () => {
              const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
              return { TorrentService: TorrentService2 };
            }, true ? void 0 : void 0);
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, null);
            if (result) {
              TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
            }
          } catch (err) {
            console.error("[Auto-Feed][CHDBits] Torrent inject failed:", err);
          }
        }
        checkTeam(meta, selectName) {
          if (!meta.title) return;
          const nameTail = meta.title.split(/(19|20)\d{2}/).pop() || "";
          $$1(`select[name="${selectName}"]>option`).each((index, el) => {
            const text = el.innerText || "";
            if (nameTail.toLowerCase().match(text.toLowerCase())) {
              if (nameTail.match(/PSY|LCHD/) && text === "CHD" || nameTail.match(/PandaMoon/) && text === "Panda" || text === "DIY" || text === "REMUX") {
                return;
              } else if (nameTail.match(/HDSpace/i) && text.match(/HDS/i)) {
                return;
              } else if (nameTail.match(/HDClub/i) && text.match(/HDC/i)) {
                return;
              } else if (nameTail.match(/REPACK/i) && text.match(/PACK/i)) {
                return;
              } else {
                $$1(`select[name^="${selectName}"]>option:eq(${index})`).prop("selected", true);
              }
            }
          });
        }
      }
      const us_ue = [
        "阿尔巴尼亚|安道尔|奥地利|俄罗斯|比利时|波黑|保加利亚|克罗地亚|塞浦路斯|捷克|丹麦|爱沙尼亚|法罗群岛[丹]|冰岛|芬兰|法国|德国|希腊|匈牙利|爱尔兰|意大利|拉脱维亚|列支敦士登|立陶宛|卢森堡|马其顿|马耳他|摩尔多瓦|摩纳哥|荷兰|挪威|波兰|葡萄牙|罗马尼亚|俄罗斯|圣马力诺|塞黑|斯洛伐克|斯洛文尼亚|西班牙|瑞典|瑞士|乌克兰|英国|梵蒂冈|美国|加拿大|澳大利亚|新西兰|西德|苏联|秘鲁|阿根廷|墨西哥"
      ];
      const us_ue_english = [
        "Albania|Andorra|Austria|Russia|Belgium|Bosnia and Herzegovina|Bulgaria|Croatia|Cyprus|Czechia|Denmark|Estonia|Faroe Islands (Denmark)|Iceland|Finland|France|Germany|Greece|Hungary|Ireland|Italy|Latvia|Liechtenstein|Lithuania|Luxembourg|North Macedonia|Malta|Moldova|Monaco|Netherlands|Norway|Poland|Portugal|Romania|Russia|San Marino|Serbia|Slovakia|Slovenia|Spain|Sweden|Switzerland|Ukraine|United Kingdom|Vatican City|United States|Canada|Australia|New Zealand|West Germany|Soviet Union|Peru|Argentina|Mexico"
      ];
      function numToChinese(num) {
        const chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
        const chnUnitChar = ["", "十", "百", "千"];
        let chnstr = "";
        if (num > 0 && num < 100) {
          const v2 = num % 10;
          const q2 = Math.floor(num / 10);
          if (num < 10) {
            chnstr = chnNumChar[v2] + chnstr;
          } else if (num === 10) {
            chnstr = chnUnitChar[1];
          } else if (num > 10 && num < 20) {
            chnstr = "十" + chnNumChar[v2];
          } else {
            if (v2 === 0) chnstr = chnNumChar[q2] + "十";
            else chnstr = chnNumChar[q2] + "十" + chnNumChar[v2];
          }
        }
        return chnstr;
      }
      function getSmallDescrFromDescr(descr, name) {
        var _a, _b, _c, _d;
        let smallDescr = "";
        let videoname = "";
        let subStr = "";
        let typeStr = "";
        if (descr.match(/译.{0,5}名[^\r\n]+/)) {
          videoname = ((_a = descr.match(/译.*?名([^\r\n]+)/)) == null ? void 0 : _a[1]) || "";
          if (!/.*[\u4e00-\u9fa5]+.*/.test(videoname) || videoname.trim() === "") {
            try {
              videoname = ((_b = descr.match(/片.*?名([^\r\n]+)/)) == null ? void 0 : _b[1]) || "";
            } catch {
            }
          }
          videoname = videoname.trim();
          if (name.match(/S\d{2}E\d{2}/i)) {
            const match = name.match(/S(\d{2})E(\d{2})/i);
            if (match) {
              subStr = ` *第${numToChinese(parseInt(match[1], 10))}季 第${parseInt(match[2], 10)}集*`;
            }
          } else if (name.match(/S\d{2}/)) {
            const match = name.match(/S(\d{2})/i);
            if (match) {
              subStr = ` *第${numToChinese(parseInt(match[1], 10))}季`;
              if (descr.match(/◎集.{1,10}数.*?(\d+)/)) {
                subStr += ` 全${parseInt(((_c = descr.match(/◎集.{1,10}数.*?(\d+)/)) == null ? void 0 : _c[1]) || "0", 10)}集*`;
              } else {
                subStr += "*";
              }
            }
          }
          smallDescr = videoname + subStr;
        }
        if (descr.match(/类.{0,5}别[^\r\n]+/)) {
          typeStr = ((_d = descr.match(/类.*别([^\r\n]+)/)) == null ? void 0 : _d[1]) || "";
          typeStr = typeStr.trim();
          typeStr = typeStr.replace(/\//g, "");
          smallDescr = smallDescr + " | 类别：" + typeStr;
        }
        return smallDescr.trim();
      }
      function getSourceSelFromDescr(descr) {
        let region = "";
        let regRegion = descr.match(/◎(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地)([^\r\n]+)/);
        if (!regRegion) {
          regRegion = descr.match(/(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地)([^\r\n]+)/);
        }
        if (regRegion) {
          region = regRegion[2].split("/")[0].trim();
          const reg = new RegExp(us_ue.join("|"), "i");
          if (region.match(/香港/)) {
            region = "香港";
          } else if (region.match(/台湾|臺灣/)) {
            region = "台湾";
          } else if (region.match(/日本/)) {
            region = "日本";
          } else if (region.match(/韩国/)) {
            region = "韩国";
          } else if (region.match(/印度/) && !region.match(/印度尼西亚/)) {
            region = "印度";
          } else if (region.match(/中国|大陆/)) {
            region = "大陆";
          } else if (region.match(reg)) {
            region = "欧美";
          }
        } else {
          regRegion = descr.match(/Country: (.*)/);
          if (regRegion) {
            region = regRegion[1].trim();
            const reg = new RegExp(us_ue_english.join("|"), "i");
            if (region.match(reg)) {
              region = "欧美";
            }
          }
        }
        return region;
      }
      function getSizeFromDescr(descr) {
        var _a, _b;
        let size = 0;
        try {
          if (descr.match(/disc.{1,10}size.*?([\d, ]+).*?bytes/i)) {
            let val = ((_a = descr.match(/disc.{1,10}size.*?([\d,\. ]+).*?bytes/i)) == null ? void 0 : _a[1]) || "";
            val = val.replace(/,|\.| /g, "");
            size = parseInt(val, 10) / 1024 / 1024 / 1024;
          } else if (descr.match(/size[^\d]{0,20}(\d+\.\d+).+GiB/i)) {
            size = parseInt(((_b = descr.match(/size[^\d]{0,20}(\d+\.\d+).+GiB/i)) == null ? void 0 : _b[1]) || "0", 10);
          }
        } catch {
        }
        return size;
      }
      function dealImg350(picInfo) {
        const imgs = picInfo.match(/\[img\].*?(jpg|png).*?\[\/img\]/g);
        if (imgs) {
          imgs.forEach((item) => {
            var _a;
            const imgUrl = ((_a = item.match(/http.*?(png|jpg)/)) == null ? void 0 : _a[0]) || "";
            if (imgUrl.match(/ptpimg/)) {
              const newImgs = `[url=${imgUrl}]${item.replace("[img]", "[img=350x350]")}[/url]`;
              picInfo = picInfo.replace(item, newImgs);
            }
          });
        }
        return picInfo;
      }
      class BHDEngine extends Unit3DEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          var _a, _b;
          this.log("Parsing BHD page...");
          const base = await super.parse();
          const meta = {
            ...base,
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl
          };
          const titleText = $$1("h1.bhd-title-h1, h1").first().text().trim();
          if (titleText) {
            meta.title = titleText.replace(/\[.*?\]/g, "").trim();
          }
          const tbody = $$1(".table-details tbody").first();
          if (tbody.length) {
            const tds = tbody.find("td").toArray();
            for (let i2 = 0; i2 < tds.length; i2++) {
              const key = (tds[i2].textContent || "").trim();
              const nextText = (((_a = tds[i2 + 1]) == null ? void 0 : _a.textContent) || "").replace(/ *\n.*/gm, "").trim();
              if (!key) continue;
              if (["副标题", "Subtitle", "Sub Title", "Sub-title"].includes(key) && nextText) {
                meta.smallDescr = nextText;
                if (!meta.subtitle) meta.subtitle = nextText;
              }
              if (["Name", "Nombre", "名称", "标题"].includes(key) && nextText) {
                meta.title = nextText;
              }
              if (["Category", "类别", "Categoría"].includes(key) && nextText) {
                if (nextText.match(/Movie|电影|Películas/i)) meta.type = "电影";
                if (nextText.match(/(TV-Show|TV|剧集|Series)/i)) meta.type = "剧集";
                if (nextText.match(/Anime (TV|Movie)/i)) meta.type = "动漫";
                if (nextText.match(/(Docu|纪录|Documentary)/i)) meta.type = "纪录";
              }
              if (["Type", "Tipo", "规格"].includes(key) && nextText) {
                if (nextText.match(/BD 50/i)) meta.mediumSel = "Blu-ray";
                else if (nextText.match(/Remux/i)) meta.mediumSel = "Remux";
                else if (nextText.match(/encode/i)) meta.mediumSel = "Encode";
                else if (nextText.match(/web-?dl/i)) meta.mediumSel = "WEB-DL";
              }
            }
          }
          try {
            const imdbUrl = matchLink("imdb", document.body.innerHTML);
            if (imdbUrl) {
              meta.imdbUrl = imdbUrl;
              meta.imdbId = (_b = imdbUrl.match(/tt\d+/)) == null ? void 0 : _b[0];
            }
          } catch {
          }
          const mediainfo = $$1('div[id*="stats-full"] .decoda-code').first().text().trim();
          if (mediainfo) {
            meta.fullMediaInfo = mediainfo;
          }
          const pictureNodes = Array.from(document.getElementsByClassName("decoda-image"));
          let imgUrls = "";
          if (pictureNodes.length) {
            pictureNodes.forEach((img) => {
              const parent = img.parentElement;
              const href = parent == null ? void 0 : parent.href;
              const src = img.getAttribute("data-src") || img.getAttribute("src") || img.src || "";
              if (!src) return;
              const fullSrc = src.replace(/\.md(?=\\.|$)/, "");
              meta.images.push(fullSrc || src);
              if (href) {
                imgUrls += `[url=${href}][img]${src}[/img][/url] `;
              } else {
                imgUrls += `[img]${src}[/img] `;
              }
            });
          }
          if (mediainfo || imgUrls) {
            meta.description = `${mediainfo ? `[quote]${mediainfo}[/quote]

` : ""}${imgUrls}`.trim();
            meta.description = meta.description.replace(
              "[url=undefined][img]https://beyondhd.co/images/2017/11/30/c5802892418ee2046efba17166f0cad9.png[/img][/url]",
              ""
            );
          }
          if (!meta.type && meta.title) {
            meta.type = getType(meta.title);
          }
          const downloadLink = $$1('a[href*="me/download"][role=button]').attr("href") || "";
          if (downloadLink) {
            try {
              meta.torrentUrl = new URL(downloadLink, this.currentUrl).href;
            } catch {
              meta.torrentUrl = downloadLink;
            }
          }
          if (!meta.torrentFilename && meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, ".").replace(/\*/g, "") + ".torrent";
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, ".");
            meta.torrentName = meta.torrentFilename;
          }
          this.log(`Parsed: ${meta.title}`);
          return meta;
        }
        async fill(meta) {
          var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k;
          this.log("Filling BHD form...");
          const titleInput = document.getElementById("titleauto");
          if (titleInput) titleInput.value = meta.title || "";
          await super.fill(meta);
          try {
            const announceText = $$1("h2").find("div").text().trim();
            const announceUrl = ((_a = announceText.match(/https?:\/\/[^\s"'<>]+/)) == null ? void 0 : _a[0]) || announceText || null;
            const { TorrentService } = await __vitePreload(async () => {
              const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
              return { TorrentService: TorrentService2 };
            }, true ? void 0 : void 0);
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announceUrl);
            if (result) {
              TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
              if (result.nameFromTorrent && titleInput && !titleInput.value) {
                titleInput.value = dealWithTitle(result.nameFromTorrent);
              }
            }
          } catch (err) {
            console.error("[Auto-Feed][BHD] Torrent inject failed:", err);
          }
          const categoryId = document.getElementById("category_id");
          if (categoryId) {
            const typeDict = { 电影: 1, 剧集: 2, 纪录: 2, 综艺: 2 };
            if (typeDict.hasOwnProperty(meta.type || "")) {
              const index = typeDict[meta.type || ""];
              categoryId.options[index].selected = true;
            }
          }
          const autosource = document.getElementById("autosource");
          if (autosource) {
            switch (meta.mediumSel) {
              case "Remux":
              case "UHD":
              case "Blu-ray":
              case "Encode":
                autosource.options[1].selected = true;
                break;
              case "DVD":
                autosource.options[5].selected = true;
                break;
              case "HDTV":
                autosource.options[4].selected = true;
                break;
              case "WEB-DL":
                autosource.options[3].selected = true;
                break;
              default:
                autosource.options[0].selected = true;
            }
          }
          const autotype = document.getElementById("autotype");
          if (autotype) {
            let size = 0;
            if (meta.mediumSel === "Blu-ray" || meta.mediumSel === "UHD") {
              size = getSizeFromDescr(meta.description || "");
            }
            switch (meta.standardSel) {
              case "4K":
                if (meta.mediumSel === "UHD") {
                  if (0 <= size && size < 50) autotype.options[3].selected = true;
                  else if (size < 66) autotype.options[2].selected = true;
                  else autotype.options[1].selected = true;
                } else if (meta.mediumSel === "Remux") {
                  autotype.options[4].selected = true;
                } else {
                  autotype.options[8].selected = true;
                }
                break;
              case "1080p":
                if (meta.mediumSel !== "Blu-ray" && meta.mediumSel !== "Remux") {
                  autotype.options[9].selected = true;
                  break;
                }
              case "1080i":
                if (meta.mediumSel === "Blu-ray") {
                  if (0 <= size && size < 25) autotype.options[6].selected = true;
                  else autotype.options[5].selected = true;
                } else if (meta.mediumSel === "Remux") {
                  autotype.options[7].selected = true;
                } else {
                  autotype.options[10].selected = true;
                }
                break;
              case "720p":
                autotype.options[11].selected = true;
                break;
              default:
                autotype.options[0].selected = true;
            }
          }
          const region = document.getElementsByName("region")[0];
          if (region) {
            const options = region.options;
            for (let i2 = 0; i2 < options.length; i2++) {
              if (options[i2].value) {
                const reg = new RegExp(" " + options[i2].value + " ", "i");
                if ((meta.title || "").match(reg)) {
                  options[i2].selected = true;
                  break;
                }
              }
            }
          }
          const edition = document.getElementsByName("edition")[0];
          if (edition) {
            if ((meta.title || "").match(/Collector/)) edition.options[1].selected = true;
            else if ((meta.title || "").match(/Director/)) edition.options[2].selected = true;
            else if ((meta.title || "").match(/Extended/)) edition.options[3].selected = true;
            else if ((meta.title || "").match(/Limited/)) edition.options[4].selected = true;
            else if ((meta.title || "").match(/Special/)) edition.options[5].selected = true;
            else if ((meta.title || "").match(/Theatrical/)) edition.options[6].selected = true;
            else if ((meta.title || "").match(/Uncut/)) edition.options[7].selected = true;
            else if ((meta.title || "").match(/Unrated/)) edition.options[8].selected = true;
          }
          const labels = meta.labelInfo || getLabel(`${meta.smallDescr || meta.subtitle || ""}${meta.title}#separator#${meta.description}`);
          meta.labelInfo = labels;
          if (labels.hdr10) (_b = document.getElementById("HDR10")) == null ? void 0 : _b.click();
          if (labels.hdr10plus) (_c = document.getElementById("HDR10P")) == null ? void 0 : _c.click();
          if (labels.db) (_d = document.getElementById("DV")) == null ? void 0 : _d.click();
          if ((meta.title || "").match(/WEB-DL/i)) (_e = document.getElementById("WEBDL")) == null ? void 0 : _e.click();
          if ((meta.title || "").match(/WEBRIP/i)) (_f = document.getElementById("WEBRip")) == null ? void 0 : _f.click();
          if ((meta.title || "").match(/4K remaster/i) || (meta.smallDescr || "").match(/4K.?修复/i)) (_g = document.getElementById("4kRemaster")) == null ? void 0 : _g.click();
          if ((meta.title || "").match(/2-Disc/) || (meta.smallDescr || "").match(/双碟版/)) (_h = document.getElementById("2in1")) == null ? void 0 : _h.click();
          if ((meta.title || "").match(/commentary/i) || (meta.smallDescr || "").match(/评论音轨/)) (_i = document.getElementById("Commentary")) == null ? void 0 : _i.click();
          if ((meta.title || "").match(/[\. ]3D[\. ]/) || (meta.smallDescr || "").match(/3D/)) (_j = document.getElementById("3D")) == null ? void 0 : _j.click();
          try {
            const infos = getMediainfoPictureFromDescr(meta.description || "", { mediumSel: meta.mediumSel });
            const container = $$1("#mediainfo");
            if (meta.fullMediaInfo) container.val(meta.fullMediaInfo);
            else container.val(infos.mediainfo);
            $$1("#mediainfo").css({ height: "600px" });
            const picInfo = dealImg350(infos.picInfo);
            $$1("#upload-form-description").val(picInfo);
            $$1("#upload-form-description").parent().after(
              `<div style="margin-bottom:5px"><a id="img350" style="margin-left:5px" href="#">IMG350</a>
                    <font style="margin-left:5px" color="red">选中要转换的bbcode图片部分点击即可。</font></div>`
            );
            $$1("#img350").off("click").on("click", (e2) => {
              e2.preventDefault();
              const text = $$1("#upload-form-description").val();
              const textarea = document.getElementById("upload-form-description");
              if (textarea && textarea.selectionStart !== void 0 && textarea.selectionEnd !== void 0) {
                const chosen = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
                if (chosen) {
                  $$1("#upload-form-description").val(text.replace(chosen, chosen.replace(/\[img\]/g, "[img=350]")));
                } else {
                  $$1("#upload-form-description").val(text.replace(/\[img\]/g, "[img=350x350]"));
                }
              }
            });
          } catch {
            if (meta.fullMediaInfo) $$1("#mediainfo").val(meta.fullMediaInfo);
            else $$1("#mediainfo").val(meta.description);
            $$1("#mediainfo").css({ height: "600px" });
          }
          if (meta.imdbId) {
            const uploadImdb = document.getElementById("imdbauto");
            if (uploadImdb) uploadImdb.value = ((_k = meta.imdbId.match(/tt(\d+)/i)) == null ? void 0 : _k[1]) || "";
          }
        }
      }
      const cleanTitle = (name) => name.replace(/\[|\]|\(|\)|mkv$|mp4$/gi, "").trim();
      const getBlurayNameFromDescr = (descr, name, currentName) => {
        var _a, _b, _c, _d;
        let tempTitle = "";
        if (descr.match(/(2160)(P|I)/i)) {
          tempTitle += "2160p.Blu-ray ";
        } else if (descr.match(/(1080)(P)/i)) {
          tempTitle += "1080p.Blu-ray.";
        } else if (descr.match(/(1080)(i)/i)) {
          tempTitle += "1080i.Blu-ray.";
        }
        if (descr.match(/Ultra HD|UHD/i)) {
          tempTitle = "UHD ";
        }
        if (descr.match(/(AVC Video)/i)) {
          tempTitle += "AVC.";
        } else if (descr.match(/(HEVC)/i)) {
          tempTitle += "HEVC.";
        } else if (descr.match(/MPEG-2 Video/i)) {
          tempTitle += "MPEG-2.";
        }
        if (descr.match(/DTS:X[\s\S]{0,200}?7.1/i)) {
          tempTitle += "DTS-HD.MA.7.1";
        } else if (descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
          tempTitle += `TrueHD.${(_a = descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) == null ? void 0 : _a[1]}`;
        } else if (descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
          tempTitle += `DTS-HD.MA.${(_b = descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) == null ? void 0 : _b[1]}`;
        } else if (descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
          tempTitle += `LPCM.${(_c = descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) == null ? void 0 : _c[1]}`;
        } else if (descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
          tempTitle += `DD.${(_d = descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) == null ? void 0 : _d[1]}`;
        }
        if (currentName && currentName.match(/Blu-ray|DTS-HD|TrueHD|LPCM|HEVC|Bluray/i)) {
          return currentName;
        }
        if (name.match(/BLURAY|UHD\.BLURAY/i)) {
          let fixed = name.replace(/MULTi.|DUAL.|SWEDiSH|DOCU/i, "");
          fixed = fixed.replace(/GERMAN/i, "GER");
          fixed = fixed.replace(/REMASTERED/i, "Remastered");
          fixed = fixed.replace(/UNCUT/i, "Uncut");
          fixed = fixed.replace(/COMPLETE[\s\S]{0,20}BLURAY/i, tempTitle);
          return fixed;
        }
        return `${name}.${tempTitle}-NoGroup`;
      };
      class PTPEngine extends BaseEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          var _a, _b, _c, _d, _e, _f;
          this.log("Parsing PTP page...");
          const url = new URL(this.currentUrl);
          let torrentId = url.searchParams.get("torrentid") || "";
          let torrentBox = null;
          if (torrentId) {
            torrentBox = document.getElementById(`torrent_${torrentId}`);
          }
          if (!torrentBox) {
            const first = document.querySelector('[id^="torrent_"]');
            if (first) {
              torrentBox = first;
              if (!torrentId) {
                const idMatch = first.id.match(/torrent_(\d+)/);
                if (idMatch) torrentId = idMatch[1];
              }
            }
          }
          const $torrentBox = torrentBox ? $$1(torrentBox) : $$1();
          const groupHeader = torrentId ? document.getElementById(`group_torrent_header_${torrentId}`) : null;
          const editionInfo = groupHeader ? $$1(groupHeader).find("a#PermaLinkedTorrentToggler").text().trim() : "";
          const titleCandidates = [];
          if ($torrentBox.length) {
            $torrentBox.find('a[onclick*="MediaInfoToggleShow"]').each((_2, el) => {
              const text = $$1(el).text().trim();
              if (text && text.length > 4) titleCandidates.push(text);
            });
            if (torrentId) {
              $torrentBox.find(`a[data-torrentid="${torrentId}"]`).each((_2, el) => {
                const text = $$1(el).text().trim();
                if (text && text.length > 4) titleCandidates.push(text);
              });
              $torrentBox.find(`a[href*="torrentid=${torrentId}"]`).each((_2, el) => {
                const text = $$1(el).text().trim();
                if (text && text.length > 4) titleCandidates.push(text);
              });
            }
            const fileTd = torrentId ? document.querySelector(`#files_${torrentId} td`) : null;
            if (fileTd == null ? void 0 : fileTd.textContent) titleCandidates.push(fileTd.textContent.trim());
          }
          const pickBestTitle = () => {
            if (!titleCandidates.length) return "";
            return titleCandidates.reduce((best, cur) => cur.length > best.length ? cur : best, titleCandidates[0]);
          };
          let title = cleanTitle(pickBestTitle());
          if (!title) {
            title = $$1(".page__title").first().text().trim() || $$1("h1").first().text().trim();
            title = title.replace(/\[.*?\]/g, "").trim();
          }
          let description = "";
          let fullMediaInfo = "";
          if (torrentBox) {
            const blockquotes = torrentBox.getElementsByTagName("blockquote");
            for (let i2 = 0; i2 < blockquotes.length; i2++) {
              const tmp = (blockquotes[i2].textContent || "").trim();
              if (tmp.match(/Unique ID|DISC INFO:|.MPLS|General/i)) {
                fullMediaInfo = tmp;
                if (tmp.match(/Complete.*?name.*?(VOB|IFO)/i)) {
                  const next = (((_a = blockquotes[i2 + 1]) == null ? void 0 : _a.textContent) || "").trim();
                  if (tmp.match(/VOB/i)) {
                    fullMediaInfo = `${tmp}[/quote]

[quote]${next}`;
                  } else {
                    fullMediaInfo = `${next}[/quote]

[quote]${tmp}`;
                  }
                }
                break;
              }
            }
          }
          if (fullMediaInfo) {
            description = `[quote]${fullMediaInfo}[/quote]

`;
          }
          const images = [];
          if (torrentBox) {
            const guards = torrentBox.getElementsByClassName("bbcode-table-guard");
            const lastGuard = guards.length ? guards[guards.length - 1] : null;
            if (lastGuard) {
              lastGuard.querySelectorAll("img").forEach((img) => {
                const src = img.getAttribute("data-src") || img.getAttribute("src");
                if (src) {
                  images.push(src);
                  description += `[img]${src}[/img]
`;
                }
              });
              let comparePicture = "";
              lastGuard.querySelectorAll('a[onclick*="ScreenshotComparisonToggleShow"]').forEach((link) => {
                const onclick = link.getAttribute("onclick") || "";
                const info = onclick.match(/\[[^\]]+\]/g);
                if (!info || info.length < 2) return;
                const label = info[0].replace(/[\[\]\"]/g, "").replace(/,/g, " | ").trim();
                const rawPics = info[1].replace(/[\[\]\"]/g, "").split(",").map((p2) => p2.replace(/\\/g, "").trim()).filter(Boolean);
                if (!rawPics.length) return;
                const teamCount = label ? label.split("|").length : rawPics.length;
                comparePicture += `
${label}
`;
                rawPics.forEach((pic, idx) => {
                  comparePicture += `[img]${pic}[/img]`;
                  if ((idx + 1) % teamCount === 0) comparePicture += "\n";
                });
              });
              if (comparePicture) {
                description += `

[b]对比图[/b]
${comparePicture}`;
              }
            }
          }
          if (!description) {
            const descrEl = $$1(".torrent_description .body").first()[0] || $$1(".box .pad").first()[0] || $$1(".panel__body").first()[0] || void 0;
            description = descrEl ? htmlToBBCode(descrEl) : "";
          }
          const imdbLink = $$1("#imdb-title-link").attr("href") || $$1('a[href*="imdb.com/title/"]').first().attr("href") || "";
          const imdbId = (_b = imdbLink.match(/tt\d+/)) == null ? void 0 : _b[0];
          let downloadLink = "";
          if (torrentId) {
            downloadLink = $torrentBox.find(`a[href*="download&id=${torrentId}"]`).first().attr("href") || $torrentBox.find(`a[href*="download.php?id=${torrentId}"]`).first().attr("href") || "";
          }
          if (!downloadLink) {
            downloadLink = $$1('a[href*="action=download"]').first().attr("href") || $$1('a[href*="download"]').first().attr("href") || "";
          }
          let torrentUrl = "";
          if (downloadLink) {
            try {
              torrentUrl = new URL(downloadLink, this.currentUrl).href;
            } catch {
              torrentUrl = downloadLink;
            }
          }
          const meta = {
            title,
            description,
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images
          };
          if (imdbLink) {
            meta.imdbUrl = imdbLink;
            meta.imdbId = imdbId;
          }
          if (editionInfo) {
            meta.editionInfo = editionInfo;
          }
          if (fullMediaInfo) {
            meta.fullMediaInfo = fullMediaInfo;
          }
          if (torrentUrl) meta.torrentUrl = torrentUrl;
          if (!meta.type && meta.title) meta.type = getType(meta.title);
          if (editionInfo.match(/DVD\d/i)) {
            meta.mediumSel = "DVD";
            const h2 = $$1("h2").first().text();
            const baseName = h2.split(/\[.*?\]/)[0].trim();
            const year = ((_c = h2.match(/\[(\d+)\]/)) == null ? void 0 : _c[1]) || "";
            const ntscPal = ((_d = editionInfo.match(/NTSC|PAL/i)) == null ? void 0 : _d[0]) || "";
            const dvdTag = ((_e = editionInfo.match(/DVD\d+/i)) == null ? void 0 : _e[0]) || "";
            const parts = [baseName, year, ntscPal, dvdTag].filter(Boolean);
            if (parts.length) meta.title = parts.join(" ").trim();
          }
          if (meta.description.match(/.MPLS/i)) {
            const h2 = $$1("h2").first().text();
            const baseName = h2.split(/\[.*?\]/)[0].trim();
            const year = ((_f = h2.match(/\[(\d+)\]/)) == null ? void 0 : _f[1]) || "";
            const base = [baseName, year].filter(Boolean).join(" ").trim();
            let blurayName = getBlurayNameFromDescr(meta.description, base, meta.title);
            const releaseGroup = groupHeader == null ? void 0 : groupHeader.getAttribute("data-releasegroup");
            if (releaseGroup) {
              blurayName = blurayName.replace("NoGroup", releaseGroup);
            }
            meta.mediumSel = "Blu-ray";
            meta.title = blurayName.replace(/bluray/i, "Blu-ray");
          }
          if (meta.title) {
            meta.title = meta.title.replace(/\s+-\s+/i, "-").trim();
          }
          if (meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, ".").replace(/\*/g, "") + ".torrent";
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, ".");
            meta.torrentName = meta.torrentFilename;
          }
          this.log(`Parsed: ${meta.title}`);
          return meta;
        }
        async fill(meta) {
          var _a, _b, _c, _d, _e, _f;
          this.log("Filling PTP form...");
          const announce = ((_a = $$1('input[value*="announce"]').val()) == null ? void 0 : _a.toString()) || null;
          try {
            const { TorrentService } = await __vitePreload(async () => {
              const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
              return { TorrentService: TorrentService2 };
            }, true ? void 0 : void 0);
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announce);
            if (result) {
              TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
            }
          } catch (err) {
            console.error("[Auto-Feed][PTP] Torrent inject failed:", err);
          }
          if ($$1("#imdb").is(":visible")) {
            const imdb = meta.imdbUrl || meta.imdbId || "";
            if (imdb) {
              $$1("#imdb").val(imdb);
              $$1("#autofill").trigger("click");
            }
          }
          if (meta.synopsis) {
            const synopsis = meta.synopsis.trim();
            const synopsisSelectors = [
              "#body",
              'textarea[name="body"]',
              "#synopsis",
              'textarea[name="synopsis"]',
              "#plot",
              'textarea[name="plot"]',
              "#summary",
              'textarea[name="summary"]',
              "#description",
              'textarea[name="description"]'
            ];
            for (const sel of synopsisSelectors) {
              const el = document.querySelector(sel);
              if (el && (el.id === "release_desc" || el.name === "release_desc")) {
                continue;
              }
              if (el && el.value.trim() === "") {
                el.value = synopsis;
                el.dispatchEvent(new Event("input", { bubbles: true }));
                el.dispatchEvent(new Event("change", { bubbles: true }));
                break;
              }
            }
          }
          try {
            $$1("#remaster").prop("checked", true);
            $$1("#remaster_true").removeClass("hidden");
          } catch {
          }
          switch (meta.mediumSel) {
            case "UHD":
            case "Blu-ray":
            case "Encode":
            case "Remux":
              $$1("#source").val("Blu-ray");
              break;
            case "HDTV":
              $$1("#source").val("HDTV");
              break;
            case "WEB-DL":
              $$1("#source").val("WEB");
              break;
            case "DVD":
              $$1("#source").val("DVD");
              break;
            case "TV":
              $$1("#source").val("TV");
              break;
          }
          if ((meta.title || "").match(/hd-dvd/i)) {
            $$1("#source").val("HD-DVD");
          }
          switch (meta.codecSel) {
            case "H265":
              $$1("#codec").val("H.265");
              break;
            case "H264":
              $$1("#codec").val("H.264");
              break;
            case "X264":
              $$1("#codec").val("x264");
              break;
            case "X265":
              $$1("#codec").val("x265");
              break;
            case "VC-1":
              $$1("#codec").val("VC-1");
              break;
            case "XVID":
              $$1("#codec").val("XviD");
              break;
            case "DIVX":
              $$1("#codec").val("DivX");
              break;
            case "MPEG-2":
            case "MPEG-4":
              $$1("#codec").val("Other");
              (_b = $$1("#codec")[0]) == null ? void 0 : _b.dispatchEvent(new Event("change", { bubbles: true }));
              $$1("#other_codec").val(meta.codecSel || "");
              break;
          }
          if ((meta.title || "").match(/dvd5/i)) {
            $$1("#codec").val("DVD5");
          } else if ((meta.title || "").match(/dvd9/i)) {
            $$1("#codec").val("DVD9");
          }
          let standard = meta.standardSel || "";
          if (standard === "SD") {
            const height = (_d = (_c = (meta.description || "").match(/Height.*?:(.*?)pixels/i)) == null ? void 0 : _c[1]) == null ? void 0 : _d.trim();
            if (height === "480") standard = "480p";
            else if (height === "576") standard = "576p";
            if ((meta.title || "").match(/576p/i)) standard = "576p";
          }
          const standardMap = {
            SD: "480p",
            "720p": "720p",
            "1080i": "1080i",
            "1080p": "1080p",
            "4K": "2160p",
            "480p": "480p",
            "576p": "576p",
            "": "Other"
          };
          if (standard in standardMap) {
            $$1("#resolution").val(standardMap[standard]);
          }
          if ((meta.title || "").match(/pal/i)) {
            $$1("#resolution").val("PAL");
          } else if ((meta.title || "").match(/ntsc/i)) {
            $$1("#resolution").val("NTSC");
          }
          if ($$1("#resolution").val() === "Other") {
            (_e = $$1("#resolution")[0]) == null ? void 0 : _e.dispatchEvent(new Event("change", { bubbles: true }));
          }
          try {
            const info = getMediainfoPictureFromDescr(meta.description || "", { mediumSel: meta.mediumSel });
            const releaseDesc = meta.fullMediaInfo ? `${meta.fullMediaInfo}

${info.picInfo || ""}`.trim() : `${info.mediainfo || ""}

${info.picInfo || ""}`.trim();
            $$1("#release_desc").val(releaseDesc);
          } catch {
            $$1("#release_desc").val((meta.description || "").replace(/\[\/?.{1,20}\]\n?/g, ""));
          }
          const releaseText = ($$1("#release_desc").val() || "").toString();
          if (releaseText.match(/Audio Video Interleave|AVI/i)) {
            $$1("#container").val("AVI");
          } else if (releaseText.match(/mp4|\.mp4/i)) {
            $$1("#container").val("MP4");
          } else if (releaseText.match(/Matroska|\.mkv/i)) {
            $$1("#container").val("MKV");
          } else if (releaseText.match(/\.mpg/i)) {
            $$1("#container").val("MPG");
          } else if ((meta.description || "").match(/MPLS/i)) {
            $$1("#container").val("m2ts");
          }
          (_f = $$1("#container")[0]) == null ? void 0 : _f.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }
      class HtmlFetchService {
        static async getText(url) {
          const response = await GMAdapter.xmlHttpRequest({
            method: "GET",
            url
          });
          return response && (response.responseText || response.response) || "";
        }
        static async getDocument(url) {
          const html = await this.getText(url);
          const parser = new DOMParser();
          return parser.parseFromString(html, "text/html");
        }
      }
      class HDBEngine extends BaseEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          var _a, _b;
          this.log("Parsing HDB page...");
          let title = $$1("h1#top, h1").first().text().trim();
          title = title.replace(/\[.*?\]/g, "").trim();
          const details = document.getElementById("details");
          let descrEl;
          let synopsis = "";
          const findDescrByTags = () => {
            var _a2, _b2;
            const divs = Array.from(document.querySelectorAll("div"));
            for (const div of divs) {
              const text = (div.textContent || "").trim();
              if (text === "Tags") {
                let descr = (_b2 = (_a2 = div.parentElement) == null ? void 0 : _a2.parentElement) == null ? void 0 : _b2.nextElementSibling;
                if (descr && descr.innerHTML.match(/Edit torrent/i)) {
                  descr = descr.previousElementSibling;
                }
                if (descr) return descr;
              }
            }
            return null;
          };
          const tagDescr = findDescrByTags();
          if (tagDescr) {
            descrEl = tagDescr;
          }
          if (details) {
            const cells = Array.from(details.querySelectorAll("td, th"));
            for (const cell of cells) {
              const text = (cell.textContent || "").trim().toLowerCase();
              if (text === "description" || text === "descr") {
                const next = cell.nextElementSibling;
                if (next) {
                  descrEl = next;
                  break;
                }
              }
            }
            if (!synopsis) {
              for (const cell of cells) {
                const text = (cell.textContent || "").trim().toLowerCase();
                if (text.match(/plot|synopsis|summary|简介|剧情|故事/i)) {
                  const next = cell.nextElementSibling;
                  if (next) {
                    synopsis = (next.textContent || "").trim();
                    if (synopsis) break;
                  }
                }
              }
            }
            if (!descrEl) {
              descrEl = details.querySelector("#descr") || details.querySelector(".torrent_description .body") || details.querySelector(".body") || void 0;
            }
          }
          if (!descrEl) {
            descrEl = $$1("#details .body").first()[0] || document.querySelector("#descr") || void 0;
          }
          let description = descrEl ? htmlToBBCode(descrEl) : "";
          if (description) {
            let wrapped = `[quote]${description}[/quote]`;
            const insertPoint = wrapped.search(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/i);
            if (insertPoint > -1) {
              wrapped = `${wrapped.slice(0, insertPoint)}
[/quote]

${wrapped.slice(insertPoint)}`;
              wrapped = wrapped.replace(/\[\/quote\](\s\n)*$/, "");
            }
            wrapped = wrapped.replace(/[\n ]*\[\/quote\]/gi, "[/quote]");
            wrapped = wrapped.replace("Quote", "");
            description = wrapped.trim();
            description = description.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (_m, inner) => {
              const compact = inner.replace(/\n{2,}/g, "\n").trim();
              return `[quote]${compact}
[/quote]`;
            });
          }
          let imdbUrl = (details ? matchLink("imdb", details.innerHTML) : "") || matchLink("imdb", document.body.innerHTML) || $$1('a[href*="imdb.com/title/"]').first().attr("href") || "";
          if (!imdbUrl) {
            const text = details ? details.textContent || "" : document.body.textContent || "";
            const imdbId = (_a = text.match(/tt\d+/)) == null ? void 0 : _a[0];
            if (imdbId) imdbUrl = `https://www.imdb.com/title/${imdbId}/`;
          }
          const downloadLink = $$1('a[href*="download.php"]').first().attr("href") || $$1('a[href*="download"]').first().attr("href") || "";
          let torrentUrl = "";
          if (downloadLink) {
            try {
              torrentUrl = new URL(downloadLink, this.currentUrl).href;
            } catch {
              torrentUrl = downloadLink;
            }
          }
          const meta = {
            title,
            description,
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images: []
          };
          if (imdbUrl) {
            meta.imdbUrl = imdbUrl;
            meta.imdbId = (_b = imdbUrl.match(/tt\d+/)) == null ? void 0 : _b[0];
          }
          if (synopsis) {
            meta.synopsis = synopsis.replace(/\s+/g, " ").trim();
          }
          if (torrentUrl) meta.torrentUrl = torrentUrl;
          const infoParts = [];
          if (details) {
            const cells = Array.from(details.querySelectorAll("td, th"));
            for (const cell of cells) {
              const text = (cell.textContent || "").trim();
              if (!text) continue;
              if (text.match(/Category|类别|Type|规格|Codec|Format|Resolution|Source|Audio/i)) {
                const next = cell.nextElementSibling;
                if (next && next.textContent) {
                  infoParts.push(`${text} ${next.textContent}`);
                } else {
                  infoParts.push(text);
                }
              }
            }
          }
          const infoText = infoParts.length ? infoParts.join(" ") : (details == null ? void 0 : details.textContent) || "";
          if (!meta.type) {
            meta.type = getType(infoText) || (meta.title ? getType(meta.title) : "");
          }
          if (!meta.mediumSel) {
            meta.mediumSel = getMediumSel(infoText, meta.title);
          }
          if (!meta.codecSel) {
            meta.codecSel = getCodecSel(infoText);
          }
          if (!meta.audioCodecSel) {
            meta.audioCodecSel = getAudioCodecSel(infoText);
          }
          if (!meta.standardSel) {
            meta.standardSel = getStandardSel(infoText);
          }
          if (meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, ".").replace(/\*/g, "") + ".torrent";
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, ".");
            meta.torrentName = meta.torrentFilename;
          }
          const collectImages = (root) => {
            const urls = [];
            if (!root) return urls;
            const imgs = Array.from(root.querySelectorAll("img"));
            imgs.forEach((img) => {
              const src = img.getAttribute("data-src") || img.getAttribute("src") || img.src || "";
              if (!src) return;
              if (src.match(/smilies|icon|avatar|logo|favicon|rating|badge|button/i)) return;
              const w2 = Number(img.getAttribute("width") || img.width || 0);
              const h2 = Number(img.getAttribute("height") || img.height || 0);
              if (w2 && h2 && w2 <= 80 && h2 <= 80) return;
              if (!src.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) && !src.match(/ptpimg|imgbox|pixhost|image\.php/i)) return;
              urls.push(src);
            });
            return urls;
          };
          try {
            const info = getMediainfoPictureFromDescr(description);
            if (info.mediainfo) {
              const rebuilt = `${info.mediainfo ? `[quote]${info.mediainfo}[/quote]

` : ""}${info.picInfo || ""}`.trim();
              if (rebuilt) {
                meta.description = rebuilt;
              }
            } else {
              meta.description = description;
            }
            if (!meta.description.match(/\[img\]/i)) {
              const screenRow = details ? Array.from(details.querySelectorAll("td, th")).find((cell) => {
                const text = (cell.textContent || "").trim();
                return text.match(/Screenshots?|Screens|截图|截图信息/i);
              }) : null;
              if (screenRow) {
                const next = screenRow.nextElementSibling;
                const shots = collectImages(next);
                if (shots.length) {
                  meta.description = `${meta.description || ""}
${shots.map((u2) => `[img]${u2}[/img]`).join("\n")}`.trim();
                }
              }
            }
            const picMatches = (meta.description || "").match(/\[img\](.*?)\[\/img\]/g);
            if (picMatches) {
              meta.images = picMatches.map((item) => {
                var _a2;
                return (_a2 = item.match(/\[img\](.*?)\[\/img\]/)) == null ? void 0 : _a2[1];
              }).filter((v2) => !!v2);
            }
          } catch {
          }
          this.log(`Parsed: ${meta.title}`);
          return meta;
        }
        async fill(meta) {
          var _a;
          this.log("Filling HDB form...");
          try {
            const userHref = $$1('a[href*="userdetails"]').attr("href") || "";
            if (userHref) {
              const userUrl = new URL(userHref, this.config.baseUrl || this.currentUrl).href;
              const doc = await HtmlFetchService.getDocument(userUrl);
              let passkey = "";
              const tds = Array.from(doc.querySelectorAll("td"));
              for (let i2 = 0; i2 < tds.length; i2++) {
                const text = (tds[i2].textContent || "").trim();
                if (text.includes("Passkey")) {
                  passkey = (((_a = tds[i2].nextElementSibling) == null ? void 0 : _a.textContent) || "").trim();
                  break;
                }
              }
              const announce = passkey ? `http://tracker.hdbits.org/announce.php?passkey=${passkey}` : null;
              const { TorrentService } = await __vitePreload(async () => {
                const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
                return { TorrentService: TorrentService2 };
              }, true ? void 0 : void 0);
              const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announce);
              if (result) {
                TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
              }
            }
          } catch (err) {
            console.error("[Auto-Feed][HDB] Torrent inject failed:", err);
          }
          $$1("#name").val(meta.title || "");
          const setSelect = (selector, value) => {
            const el = $$1(selector);
            if (!el.length) return;
            el.val(value);
            el.trigger("change");
          };
          switch (meta.type) {
            case "电影":
              setSelect("#type_category", "1");
              break;
            case "剧集":
            case "综艺":
              setSelect("#type_category", "2");
              break;
            case "音乐":
              setSelect("#type_category", "4");
              break;
            case "纪录":
              setSelect("#type_category", "3");
              break;
            case "动漫":
              setSelect("#type_category", (meta.title || "").match(/S\d+/i) ? "2" : "1");
              break;
            case "体育":
              setSelect("#type_category", "5");
              break;
          }
          switch (meta.codecSel) {
            case "H264":
            case "X264":
              setSelect("#type_codec", "1");
              break;
            case "H265":
            case "X265":
              setSelect("#type_codec", "5");
              break;
            case "VC-1":
              setSelect("#type_codec", "3");
              break;
            case "MPEG-2":
              setSelect("#type_codec", "2");
              break;
            case "XVID":
              setSelect("#type_codec", "4");
              break;
            default:
              setSelect("#type_codec", "0");
          }
          switch (meta.mediumSel) {
            case "UHD":
            case "Blu-ray":
            case "DVD":
              setSelect("#type_medium", "1");
              break;
            case "Remux":
              setSelect("#type_medium", "5");
              break;
            case "HDTV":
              setSelect("#type_medium", "4");
              break;
            case "WEB-DL":
              setSelect("#type_medium", "6");
              break;
            case "Encode":
              setSelect("#type_medium", "3");
              break;
            default:
              setSelect("#type_medium", "0");
          }
          try {
            const info = getMediainfoPictureFromDescr(meta.description || "", { mediumSel: meta.mediumSel });
            if (meta.mediumSel === "UHD" || meta.mediumSel === "Blu-ray" || meta.mediumSel === "DVD") {
              $$1('textarea[name="descr"]').val(`${info.mediainfo}

${info.picInfo}`.trim());
              $$1('textarea[name="descr"]').css({ height: "300px" });
            } else {
              const mediainfo = (info.mediainfo || "").replace(/ \n/g, "\n");
              $$1('textarea[name="techinfo"]').val(mediainfo);
              $$1('textarea[name="techinfo"]').css({ height: "800px" });
              $$1('textarea[name="descr"]').val(info.picInfo || "");
            }
          } catch {
            $$1('textarea[name="descr"]').val(meta.description || "");
          }
          if (meta.imdbUrl || meta.imdbId) {
            $$1('input[name="imdb"]').val(meta.imdbUrl || meta.imdbId || "");
          }
        }
      }
      class KGEngine extends BaseEngine {
        constructor(config, url) {
          super(config, url);
        }
        async parse() {
          this.log("Parsing KG page (best-effort)...");
          return parseNexus(this.config, this.currentUrl);
        }
        async fill(meta) {
          this.log("Filling KG form (best-effort)...");
          await fillNexus(meta, this.config);
        }
      }
      const siteConfigs = [
        ...NexusSites,
        ...GazelleSites,
        ...Unit3DSites
      ];
      const engineMap = {
        [SiteType.NexusPHP]: NexusPHPEngine,
        [SiteType.Gazelle]: GazelleEngine,
        [SiteType.Unit3D]: Unit3DEngine,
        [SiteType.Unit3DClassic]: Unit3DClassicEngine,
        [SiteType.MTeam]: MTeamEngine,
        [SiteType.CHDBits]: CHDBitsEngine,
        [SiteType.BHD]: BHDEngine,
        [SiteType.PTP]: PTPEngine,
        [SiteType.HDB]: HDBEngine,
        [SiteType.KG]: KGEngine
      };
      class SiteRegistry {
        static registerConfig(config) {
          siteConfigs.push(config);
        }
        static registerEngine(type, engineClass) {
          engineMap[type] = engineClass;
        }
        static getEngine(url) {
          const config = this.matchConfig(url);
          if (!config) return null;
          const EngineClass = engineMap[config.type];
          if (!EngineClass) {
            console.error(`[Auto-Feed] No engine registered for type: ${config.type}`);
            return null;
          }
          return new EngineClass(config, url);
        }
        static matchConfig(url) {
          var _a, _b, _c, _d;
          for (const config of siteConfigs) {
            if (config.keywords.some((k2) => url.includes(k2))) {
              return config;
            }
            if ((_b = (_a = config.match) == null ? void 0 : _a.source) == null ? void 0 : _b.some((r2) => r2.test(url))) return config;
            if ((_d = (_c = config.match) == null ? void 0 : _c.target) == null ? void 0 : _d.some((r2) => r2.test(url))) return config;
          }
          return null;
        }
      }
      const STORAGE_KEY = "auto_feed_current_meta";
      const StorageService = {
        async save(meta) {
          await GMAdapter.setValue(STORAGE_KEY, JSON.stringify(meta));
        },
        async load() {
          const data = await GMAdapter.getValue(STORAGE_KEY);
          if (!data) return null;
          try {
            return JSON.parse(data);
          } catch (e2) {
            console.error("Failed to parse stored meta", e2);
            return null;
          }
        },
        async clear() {
          await GMAdapter.setValue(STORAGE_KEY, "");
        }
      };
      class ImageHostService {
        /**
         * Converts thumbnail URLs to full size URLs for known hosts.
         * Matches logic from `get_full_size_picture_urls`
         */
        static getFullSizeUrl(url) {
          let newUrl = url;
          if (url.match(/imgbox/)) {
            newUrl = url.replace("thumbs2", "images2").replace("t.png", "o.png");
          } else if (url.match(/pixhost/)) {
            newUrl = url.replace("//t", "//img").replace("thumbs", "images");
          } else if (url.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
            newUrl = url.replace(/th.png/, "png").replace(/md.png/, "png");
          } else if (url.match(/beyondhd.co\/(images|cache)/)) {
            newUrl = url.replace(/th.png/, "png").replace(/md.png/, "png").replace("/t/", "/i/");
          } else if (url.match(/tu.totheglory.im/)) {
            newUrl = url.replace(/_thumb.png/, ".png");
          }
          return newUrl;
        }
        static extractImageUrlsFromBBCode(description) {
          const urls = [];
          const matches = description.match(/\[img\](.*?)\[\/img\]/gi);
          if (!matches) return urls;
          matches.forEach((item) => {
            const m2 = item.match(/\[img\](.*?)\[\/img\]/i);
            if (m2 && m2[1]) urls.push(m2[1].trim());
          });
          return urls;
        }
        static extractImageTagsFromBBCode(description) {
          const matches = description.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/gi);
          return matches ? matches.map((m2) => m2.trim()).filter(Boolean) : [];
        }
        static replaceImageUrlsInBBCode(description, newTags) {
          let idx = 0;
          return description.replace(/\[img\](.*?)\[\/img\]/gi, () => {
            const tag = newTags[idx];
            idx += 1;
            return tag || "";
          });
        }
        static convertDescriptionToFullSize(description) {
          const urls = this.extractImageUrlsFromBBCode(description);
          if (!urls.length) return description;
          const newTags = urls.map((u2) => `[img]${this.getFullSizeUrl(u2)}[/img]`);
          return this.replaceImageUrlsInBBCode(description, newTags);
        }
        /**
         * Uploads images to PTPImg (Stub)
         * Requires API Key and GM_xmlhttpRequest
         */
        static async uploadToPtpImg(imageUrls, apiKey) {
          return new Promise((resolve, reject) => {
            const boundary = "--NN-GGn-PTPIMG";
            let data = "";
            data += boundary + "\n";
            data += 'Content-Disposition: form-data; name="link-upload"\n\n';
            data += imageUrls.join("\n") + "\n";
            data += boundary + "\n";
            data += 'Content-Disposition: form-data; name="api_key"\n\n';
            data += apiKey + "\n";
            data += boundary + "--";
            GMAdapter.xmlHttpRequest({
              method: "POST",
              url: "https://ptpimg.me/upload.php",
              responseType: "json",
              headers: {
                "Content-type": "multipart/form-data; boundary=NN-GGn-PTPIMG"
              },
              data,
              onload: (response) => {
                var _a;
                if (response.status !== 200) {
                  reject(`Response error ${response.status}`);
                  return;
                }
                const list = (_a = response.response) == null ? void 0 : _a.map((item) => {
                  return `[img]https://ptpimg.me/${item.code}.${item.ext}[/img]`;
                });
                resolve(list || []);
              }
            });
          });
        }
        static async uploadToPixhost(imageUrls) {
          return new Promise((resolve, reject) => {
            GMAdapter.xmlHttpRequest({
              method: "POST",
              url: "https://pixhost.to/remote/",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
              },
              data: encodeURI(`imgs=${imageUrls.join("\r\n")}&content_type=0&max_th_size=350`),
              onload: (response) => {
                if (response.status !== 200) {
                  reject(response.status);
                  return;
                }
                const data = response.responseText.match(/(upload_results = )({.*})(;)/);
                if (data && data.length) {
                  const imgResultList = JSON.parse(data[2]).images;
                  resolve(
                    imgResultList.map((item) => {
                      return `[url=${item.show_url}][img]${item.th_url}[/img][/url]`;
                    })
                  );
                } else {
                  reject("Upload failed");
                }
              }
            });
          });
        }
        static async uploadToFreeimage(imageUrls, apiKey) {
          const results = [];
          for (const url of imageUrls) {
            const tag = await new Promise((resolve, reject) => {
              const data = encodeURI(`source=${url}&key=${apiKey}`);
              GMAdapter.xmlHttpRequest({
                method: "POST",
                url: "https://freeimage.host/api/1/upload",
                responseType: "json",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
                },
                data,
                onload: (response) => {
                  var _a;
                  if (response.status !== 200) {
                    reject(`Response error ${response.status}`);
                    return;
                  }
                  const data2 = (_a = response.response) == null ? void 0 : _a.image;
                  if (data2 == null ? void 0 : data2.url) {
                    resolve(`[img]${data2.url}[/img]`);
                  } else {
                    reject("Upload failed");
                  }
                }
              });
            });
            results.push(tag);
          }
          return results;
        }
        static async uploadToGifyu(imageUrls, apiKey) {
          const results = [];
          for (const url of imageUrls) {
            const tag = await new Promise((resolve, reject) => {
              const data = encodeURI(`source=${url}&key=${apiKey}`);
              GMAdapter.xmlHttpRequest({
                method: "POST",
                url: "https://gifyu.com/api/1/upload",
                responseType: "json",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
                },
                data,
                onload: (response) => {
                  var _a;
                  if (response.status !== 200) {
                    reject(`Response error ${response.status}`);
                    return;
                  }
                  const data2 = (_a = response.response) == null ? void 0 : _a.image;
                  if (data2 == null ? void 0 : data2.url) {
                    resolve(`[img]${data2.url}[/img]`);
                  } else {
                    reject("Upload failed");
                  }
                }
              });
            });
            results.push(tag);
          }
          return results;
        }
        static async uploadToHdbImg(imageUrls, apiKey, endpoint) {
          const results = [];
          const apiUrl = endpoint || "https://hdbimg.com/api/1/upload";
          for (const url of imageUrls) {
            const tag = await new Promise((resolve, reject) => {
              const data = encodeURI(`source=${url}${apiKey ? `&key=${apiKey}` : ""}`);
              GMAdapter.xmlHttpRequest({
                method: "POST",
                url: apiUrl,
                responseType: "json",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
                },
                data,
                onload: (response) => {
                  var _a, _b, _c, _d, _e, _f;
                  if (response.status !== 200) {
                    reject(`Response error ${response.status}`);
                    return;
                  }
                  const body = response.response || {};
                  const candidates = [
                    (_a = body == null ? void 0 : body.image) == null ? void 0 : _a.url,
                    (_b = body == null ? void 0 : body.image) == null ? void 0 : _b.url_viewer,
                    (_c = body == null ? void 0 : body.data) == null ? void 0 : _c.url,
                    (_e = (_d = body == null ? void 0 : body.data) == null ? void 0 : _d.image) == null ? void 0 : _e.url,
                    (_f = body == null ? void 0 : body.data) == null ? void 0 : _f.display_url,
                    body == null ? void 0 : body.url
                  ].filter(Boolean);
                  if (candidates.length) {
                    resolve(`[img]${candidates[0]}[/img]`);
                    return;
                  }
                  const text = response.responseText || "";
                  const match = text.match(/https?:\/\/[^\s"'<>]+/);
                  if (match) {
                    resolve(`[img]${match[0]}[/img]`);
                  } else {
                    reject("Upload failed");
                  }
                }
              });
            });
            results.push(tag);
          }
          return results;
        }
        static async rehostDescriptionToPtpImg(description, apiKey) {
          const urls = this.extractImageUrlsFromBBCode(description);
          if (!urls.length) return description;
          const newTags = await this.uploadToPtpImg(urls, apiKey);
          return this.replaceImageUrlsInBBCode(description, newTags);
        }
        static async rehostDescriptionToPixhost(description) {
          const urls = this.extractImageUrlsFromBBCode(description);
          if (!urls.length) return description;
          const newTags = await this.uploadToPixhost(urls);
          return this.replaceImageUrlsInBBCode(description, newTags);
        }
        static async rehostDescriptionToFreeimage(description, apiKey) {
          const urls = this.extractImageUrlsFromBBCode(description);
          if (!urls.length) return description;
          const newTags = await this.uploadToFreeimage(urls, apiKey);
          return this.replaceImageUrlsInBBCode(description, newTags);
        }
        static async rehostDescriptionToGifyu(description, apiKey) {
          const urls = this.extractImageUrlsFromBBCode(description);
          if (!urls.length) return description;
          const newTags = await this.uploadToGifyu(urls, apiKey);
          return this.replaceImageUrlsInBBCode(description, newTags);
        }
        static async rehostDescriptionToHdbImg(description, apiKey, endpoint) {
          const urls = this.extractImageUrlsFromBBCode(description);
          if (!urls.length) return description;
          const newTags = await this.uploadToHdbImg(urls, apiKey, endpoint);
          return this.replaceImageUrlsInBBCode(description, newTags);
        }
      }
      class DoubanService {
        static async getByImdb(imdbId) {
          var _a;
          const searchUrl = `https://m.douban.com/search/?query=${encodeURIComponent(imdbId)}&type=movie`;
          const doc = await HtmlFetchService.getDocument(searchUrl);
          const link = doc.querySelector("ul.search_results_subjects a");
          if (!link) return null;
          const href = link.getAttribute("href") || "";
          const id = (_a = href.match(/subject\/(\d+)/)) == null ? void 0 : _a[1];
          if (!id || id === "35580200") return null;
          return this.getById(id);
        }
        static async getById(id) {
          const url = `https://movie.douban.com/subject/${id}/`;
          const doc = await HtmlFetchService.getDocument(url);
          return this.parseDoubanDoc(doc, id);
        }
        static parseDoubanDoc(doc, id) {
          var _a, _b, _c, _d, _e, _f, _g;
          const title = (((_a = doc.querySelector("title")) == null ? void 0 : _a.textContent) || "").replace("(豆瓣)", "").trim();
          let image = "";
          const img = doc.querySelector("#mainpic img");
          if (img == null ? void 0 : img.src) {
            const match = img.src.match(/(p\d+).+$/);
            if (match == null ? void 0 : match[1]) {
              image = `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${match[1]}.jpg`;
            } else {
              image = img.src;
            }
          }
          const yearText = ((_b = doc.querySelector("#content > h1 > span.year")) == null ? void 0 : _b.textContent) || "";
          const year = yearText ? parseInt(yearText.replace(/[()]/g, ""), 10) : "";
          const average = ((_c = doc.querySelector('#interest_sectl [property="v:average"]')) == null ? void 0 : _c.textContent) || "";
          const votes = ((_d = doc.querySelector('#interest_sectl [property="v:votes"]')) == null ? void 0 : _d.textContent) || "";
          const genre = Array.from(doc.querySelectorAll('#info span[property="v:genre"]')).map((e2) => {
            var _a2;
            return (_a2 = e2.textContent) == null ? void 0 : _a2.trim();
          }).filter(Boolean).join("/");
          const releaseDate = Array.from(doc.querySelectorAll('#info span[property="v:initialReleaseDate"]')).map((e2) => {
            var _a2;
            return (_a2 = e2.textContent) == null ? void 0 : _a2.trim();
          }).filter(Boolean).sort((a2, b) => new Date(a2 || "").getTime() - new Date(b || "").getTime()).join("/");
          const runtime = ((_f = (_e = doc.querySelector('#info span[property="v:runtime"]')) == null ? void 0 : _e.textContent) == null ? void 0 : _f.trim()) || "";
          const aka = this.getInfoByLabel(doc, "又名");
          const region = this.getInfoByLabel(doc, "制片国家/地区");
          const director = this.getInfoByLabel(doc, "导演");
          const language = this.getInfoByLabel(doc, "语言");
          const cast = this.getInfoByLabel(doc, "主演");
          const summaryEl = doc.querySelector('#link-report-intra [property="v:summary"]') || doc.querySelector("#link-report-intra span.all.hidden");
          const summary = ((_g = summaryEl == null ? void 0 : summaryEl.textContent) == null ? void 0 : _g.trim()) || "";
          return {
            id,
            title,
            year,
            aka,
            average,
            votes,
            genre,
            region,
            director,
            language,
            releaseDate,
            runtime,
            cast,
            summary,
            image
          };
        }
        static getInfoByLabel(doc, label) {
          const spans = Array.from(doc.querySelectorAll("#info span.pl"));
          const span = spans.find((s2) => (s2.textContent || "").includes(label));
          if (!span || !span.parentElement) return "";
          const text = span.parentElement.textContent || "";
          return text.replace(span.textContent || "", "").replace(":", "").trim();
        }
      }
      const IYUU_API = "https://api.iyuu.cn/App.Movie.Ptgen";
      const TJU_API = "https://ptgen.tju.pt/infogen";
      const buildDoubanFormat = (info, imdbId) => {
        const lines = [];
        if (info.image) lines.push(`[img]${info.image}[/img]`, "");
        const title = info.title || "";
        if (info.aka) lines.push(`◎译　　名　${title} / ${info.aka}`);
        else if (title) lines.push(`◎译　　名　${title}`);
        if (title) lines.push(`◎片　　名　${title}`);
        if (info.year) lines.push(`◎年　　代　${info.year}`);
        if (info.region) lines.push(`◎产　　地　${info.region}`);
        if (info.genre) lines.push(`◎类　　别　${info.genre}`);
        if (info.language) lines.push(`◎语　　言　${info.language}`);
        if (info.releaseDate) lines.push(`◎上映日期　${info.releaseDate}`);
        if (imdbId) lines.push(`◎IMDb链接  https://www.imdb.com/title/${imdbId}/`);
        if (info.average) {
          const votes = info.votes ? ` from ${info.votes} users` : "";
          lines.push(`◎豆瓣评分　${info.average}/10${votes}`);
        }
        if (info.id) lines.push(`◎豆瓣链接　https://movie.douban.com/subject/${info.id}/`);
        if (info.runtime) lines.push(`◎片　　长　${info.runtime}`);
        if (info.director) lines.push(`◎导　　演　${info.director}`);
        if (info.cast) lines.push(`◎主　　演　${info.cast}`);
        lines.push("");
        lines.push("◎简　　介");
        if (info.summary) {
          lines.push(info.summary.replace(/^|\n/g, "\n　　").trim());
        } else {
          lines.push("　　暂无相关剧情介绍");
        }
        return lines.join("\n").replace(/\n{3,}/g, "\n\n").trim();
      };
      class PtgenService {
        static extractSubtitleFromFormat(format) {
          const lines = format.split("\n").map((line) => line.trim()).filter(Boolean);
          const getLineValue = (pattern) => {
            const line = lines.find((l2) => pattern.test(l2));
            if (!line) return "";
            const parts = line.split(/[:：]/);
            const value = parts.length > 1 ? parts.slice(1).join(":").trim() : line.replace(pattern, "").trim();
            return value;
          };
          const pickChinese = (value) => {
            if (!value) return "";
            const first = value.split("/")[0].trim();
            return /[\u4e00-\u9fa5]/.test(first) ? first : "";
          };
          const translated = pickChinese(getLineValue(/译.*名/));
          if (translated) return translated;
          const mainTitle = pickChinese(getLineValue(/片.*名/));
          if (mainTitle) return mainTitle;
          return "";
        }
        static async resolveDoubanId(meta, method) {
          var _a, _b, _c, _d, _e, _f;
          if (meta.doubanId) return meta.doubanId;
          const doubanIdFromUrl = (_b = (_a = meta.doubanUrl) == null ? void 0 : _a.match(/subject\/(\d+)/)) == null ? void 0 : _b[1];
          if (doubanIdFromUrl) return doubanIdFromUrl;
          const imdbId = meta.imdbId || ((_d = (_c = meta.imdbUrl) == null ? void 0 : _c.match(/tt\d+/)) == null ? void 0 : _d[0]);
          if (!imdbId) return null;
          if (method === 0) {
            const url = `https://movie.douban.com/j/subject_suggest?q=${imdbId}`;
            try {
              const text = await HtmlFetchService.getText(url);
              const json = JSON.parse(text);
              if (Array.isArray(json) && json.length) {
                const id = (_f = (_e = json[0]) == null ? void 0 : _e.id) == null ? void 0 : _f.toString();
                if (id && id !== "35580200") return id;
              }
            } catch {
            }
            return null;
          }
          try {
            const info = await DoubanService.getByImdb(imdbId);
            return (info == null ? void 0 : info.id) || null;
          } catch {
            return null;
          }
        }
        static async fetchPtgen(meta, options) {
          var _a, _b, _c;
          const imdbId = meta.imdbId || ((_b = (_a = meta.imdbUrl) == null ? void 0 : _a.match(/tt\d+/)) == null ? void 0 : _b[0]) || "";
          const doubanId = await this.resolveDoubanId(meta, options.imdbToDoubanMethod);
          if (options.ptgenApi === 3) {
            const info = (doubanId ? await DoubanService.getById(doubanId) : null) || (imdbId ? await DoubanService.getByImdb(imdbId) : null);
            if (!info) return null;
            return {
              format: buildDoubanFormat(info, imdbId || void 0),
              doubanId: info.id,
              synopsis: info.summary || ""
            };
          }
          const base = options.ptgenApi === 0 ? IYUU_API : TJU_API;
          let query = "";
          if (doubanId) {
            query = `?url=${encodeURIComponent(`https://movie.douban.com/subject/${doubanId}/`)}`;
          } else if (meta.doubanUrl) {
            query = `?url=${encodeURIComponent(meta.doubanUrl)}`;
          } else if (meta.imdbUrl) {
            if (options.ptgenApi === 1) {
              query = `?site=douban&sid=${imdbId}`;
            } else {
              query = `?url=${encodeURIComponent(meta.imdbUrl)}`;
            }
          } else if (imdbId) {
            if (options.ptgenApi === 1) {
              query = `?site=douban&sid=${imdbId}`;
            } else {
              query = `?url=${encodeURIComponent(`https://www.imdb.com/title/${imdbId}/`)}`;
            }
          } else {
            return null;
          }
          try {
            const text = await HtmlFetchService.getText(`${base}${query}`);
            const json = JSON.parse(text);
            let format = ((_c = json == null ? void 0 : json.data) == null ? void 0 : _c.format) || (json == null ? void 0 : json.format) || (json == null ? void 0 : json.data) || "";
            if (!format || typeof format !== "string") return null;
            format = format.replace("hongleyou.cn", "doubanio.com").replace(/\[\/img\]\[\/center\]/g, "[/img]");
            return { format };
          } catch {
            return null;
          }
        }
        static async applyPtgen(meta, options) {
          var _a, _b;
          const result = await this.fetchPtgen(meta, options);
          if (!result || !result.format) return meta;
          const updated = { ...meta };
          updated.description = `${result.format}

${updated.description || ""}`.trim();
          const subtitle = this.extractSubtitleFromFormat(result.format);
          if (subtitle) {
            updated.subtitle = updated.subtitle || subtitle;
            updated.smallDescr = updated.smallDescr || subtitle;
          }
          const imdbMatch = (_a = result.format.match(/imdb\.com\/title\/(tt\d+)/i)) == null ? void 0 : _a[1];
          if (imdbMatch) {
            updated.imdbId = updated.imdbId || imdbMatch;
            updated.imdbUrl = updated.imdbUrl || `https://www.imdb.com/title/${imdbMatch}/`;
          }
          const doubanMatch = (_b = result.format.match(/douban\.com\/subject\/(\d+)/i)) == null ? void 0 : _b[1];
          if (doubanMatch) {
            updated.doubanId = updated.doubanId || doubanMatch;
            updated.doubanUrl = updated.doubanUrl || `https://movie.douban.com/subject/${doubanMatch}/`;
          }
          if (result.doubanId) {
            updated.doubanId = updated.doubanId || result.doubanId;
            updated.doubanUrl = updated.doubanUrl || `https://movie.douban.com/subject/${result.doubanId}/`;
          }
          if (result.synopsis && !updated.synopsis) {
            updated.synopsis = result.synopsis;
          }
          return updated;
        }
      }
      const PtgenService$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
        __proto__: null,
        PtgenService
      }, Symbol.toStringTag, { value: "Module" }));
      const IMAGE_QUEUE_KEY = "HDB_images";
      class ImageUploadBridgeService {
        static async queueImages(urls, gallery) {
          const list = [...urls];
          if (gallery) list.push(gallery);
          await GMAdapter.setValue(IMAGE_QUEUE_KEY, list.join(", "));
        }
        static async loadQueue() {
          const raw = await GMAdapter.getValue(IMAGE_QUEUE_KEY, null);
          if (!raw) return null;
          const parts = raw.split(", ").map((p2) => p2.trim()).filter(Boolean);
          if (!parts.length) return null;
          let gallery = "";
          const last = parts[parts.length - 1];
          if (last && !last.match(/^https?:\/\//i)) {
            gallery = parts.pop() || "";
          }
          return { urls: parts, gallery: gallery || void 0 };
        }
        static async prepareAndOpen(meta, host) {
          var _a;
          const rawUrls = ((_a = meta.images) == null ? void 0 : _a.length) ? meta.images : ImageHostService.extractImageUrlsFromBBCode(meta.description || "");
          const normalized = Array.from(
            new Set(
              rawUrls.map((u2) => u2.trim()).filter(Boolean).map((u2) => ImageHostService.getFullSizeUrl(u2))
            )
          );
          if (!normalized.length) {
            alert("未检测到可转存的图片链接");
            return;
          }
          const gallery = (meta.title || "").trim().replace(/\s+/g, ".");
          await this.queueImages(normalized, gallery || void 0);
          if (host === "imgbox") {
            window.open("https://imgbox.com/", "_blank");
          } else {
            window.open("https://hdbimg.com/", "_blank");
          }
        }
        static async tryInject() {
          if (document.body.dataset.autofeedImageHost === "1") return;
          const url = window.location.href;
          if (!url.match(/https?:\/\/(www\.)?(imgbox\.com|imagebam\.co|pixhost\.to|img\.hdbits\.org|hdbimg\.com)/i)) {
            return;
          }
          const queue = await this.loadQueue();
          if (!queue || !queue.urls.length) return;
          const $fileInput = await this.waitForFileInput();
          if (!$fileInput.length) return;
          const button = document.createElement("button");
          button.textContent = `一键拉取 (${queue.urls.length})`;
          button.style.cssText = [
            "margin: 8px 0",
            "padding: 6px 10px",
            "border: 1px solid #ccc",
            "border-radius: 4px",
            "background: #f7f7f7",
            "cursor: pointer",
            "font-size: 12px"
          ].join(";");
          const insertTarget = $fileInput.closest("form").length ? $fileInput.closest("form") : $fileInput.parent();
          insertTarget.prepend(button);
          button.addEventListener("click", async () => {
            button.textContent = "拉取中...";
            button.setAttribute("disabled", "true");
            try {
              const files = await this.buildFiles(queue.urls);
              const dt = new DataTransfer();
              files.forEach((file) => dt.items.add(file));
              const input = $fileInput.get(0);
              input.files = dt.files;
              input.dispatchEvent(new Event("change", { bubbles: true }));
              if (queue.gallery) {
                $$1("#gallery-title").val(queue.gallery);
                $$1('input[name="gallery_name"]').val(queue.gallery);
                $$1("#galleryname").val(queue.gallery);
              }
              await GMAdapter.setValue(IMAGE_QUEUE_KEY, "");
              button.textContent = "拉取成功";
            } catch (err) {
              console.error(err);
              button.textContent = "拉取失败";
            } finally {
              setTimeout(() => {
                button.removeAttribute("disabled");
                button.textContent = `一键拉取 (${queue.urls.length})`;
              }, 1200);
            }
          });
          document.body.dataset.autofeedImageHost = "1";
        }
        static normalizeFetchUrl(url) {
          let target = ImageHostService.getFullSizeUrl(url);
          if (target.match(/t\.hdbits\.org/i)) {
            target = target.replace("t.hdbits.org", "i.hdbits.org").replace(/\.jpg(\?|$)/i, ".png$1");
          }
          return target;
        }
        static guessMime(name) {
          var _a;
          const ext = (_a = name.split(".").pop()) == null ? void 0 : _a.toLowerCase();
          if (ext === "png") return "image/png";
          if (ext === "webp") return "image/webp";
          if (ext === "gif") return "image/gif";
          return "image/jpeg";
        }
        static async buildFiles(urls) {
          const tasks = urls.map(async (raw, index) => {
            const url = this.normalizeFetchUrl(raw);
            const filename = decodeURIComponent(url.split("/").pop() || `image-${index}.jpg`).split("?")[0];
            const resp = await GMAdapter.xmlHttpRequest({
              method: "GET",
              url,
              responseType: "blob"
            });
            const blob = resp.response;
            const type = (blob == null ? void 0 : blob.type) || this.guessMime(filename);
            return new File([blob], filename || `image-${index}.jpg`, { type });
          });
          return Promise.all(tasks);
        }
        static async waitForFileInput() {
          for (let i2 = 0; i2 < 20; i2++) {
            const $fileInput = $$1('input[name="files[]"]').first().add($$1('input[type="file"]').first()).add($$1("input.dz-hidden-input").first()).filter((_2, el) => el instanceof HTMLInputElement).first();
            if ($fileInput.length) return $fileInput;
            await new Promise((resolve) => setTimeout(resolve, 500));
          }
          return $$1('input[name="files[]"]').first();
        }
      }
      class QuickLinkService {
        static renderLinkModal(title, sourceLinks, targetLinks, targetTags) {
          const existing = document.getElementById("autofeed-link-modal");
          if (existing) existing.remove();
          const overlay = document.createElement("div");
          overlay.id = "autofeed-link-modal";
          overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
          const panel = document.createElement("div");
          panel.style.cssText = `
            width: 68vw;
            max-width: 980px;
            height: 52vh;
            max-height: 460px;
            min-height: 260px;
            background: #fff;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            padding: 12px;
            box-shadow: 0 10px 24px rgba(0,0,0,0.35);
        `;
          const header = document.createElement("div");
          header.style.cssText = `display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;`;
          header.innerHTML = `<div style="font-weight:bold; color:#2c3e50;">${title}</div>`;
          const closeBtn = document.createElement("button");
          closeBtn.textContent = "×";
          closeBtn.style.cssText = `border:none; background:transparent; font-size:20px; cursor:pointer; color:#999;`;
          closeBtn.onclick = () => overlay.remove();
          header.appendChild(closeBtn);
          const body = document.createElement("div");
          body.style.cssText = `display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:10px; flex:1; align-items: stretch;`;
          const buildBox = (label, value) => {
            const box = document.createElement("div");
            box.style.cssText = `display:flex; flex-direction:column; gap:6px;`;
            const titleEl = document.createElement("div");
            titleEl.textContent = label;
            titleEl.style.cssText = `font-weight:bold; color:#666;`;
            const textarea = document.createElement("textarea");
            textarea.value = value;
            textarea.style.cssText = `width:100%; height:100%; resize:none; padding:8px; border:1px solid #ddd; border-radius:6px; font-family: monospace; font-size:12px;`;
            box.appendChild(titleEl);
            box.appendChild(textarea);
            return box;
          };
          const sourceBox = buildBox("原图直链", sourceLinks.join("\n"));
          const targetBox = buildBox("新图直链", targetLinks.join("\n"));
          const tagBox = buildBox("新图 BBCode", targetTags.join("\n"));
          body.appendChild(sourceBox);
          body.appendChild(targetBox);
          body.appendChild(tagBox);
          panel.appendChild(header);
          panel.appendChild(body);
          overlay.appendChild(panel);
          overlay.addEventListener("click", (e2) => {
            if (e2.target === overlay) overlay.remove();
          });
          document.body.appendChild(overlay);
        }
        static injectImageTools(container, meta) {
          const toolsDiv = $$1('<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 6px;"></div>');
          toolsDiv.append('<span style="color: #8e44ad; font-weight: bold; margin-right: 5px;">图床: </span>');
          const makeToolLink = (label) => $$1(`<a href="#" style="text-decoration: none; color: #8e44ad; font-weight: bold; border-right: 1px solid #ddd; padding-right: 5px; margin-right: 5px;">${label}</a>`);
          const showLinks = (title, before, after) => {
            const beforeUrls = ImageHostService.extractImageUrlsFromBBCode(before);
            const afterUrls = ImageHostService.extractImageUrlsFromBBCode(after);
            const afterTags = ImageHostService.extractImageTagsFromBBCode(after);
            this.renderLinkModal(title, beforeUrls, afterUrls, afterTags);
          };
          const fullSize = makeToolLink("原图");
          fullSize.on("click", async (e2) => {
            e2.preventDefault();
            const before = meta.description || "";
            meta.description = ImageHostService.convertDescriptionToFullSize(meta.description || "");
            await StorageService.save(meta);
            showLinks("原图链接（转换后）", before, meta.description || "");
            alert("已转换为原图链接");
          });
          const ptp = makeToolLink("PTPIMG");
          ptp.on("click", async (e2) => {
            e2.preventDefault();
            const before = meta.description || "";
            const settings = await SettingsService.load();
            if (!settings.ptpImgApiKey) {
              alert("未设置 PTPIMG API Key");
              return;
            }
            meta.description = await ImageHostService.rehostDescriptionToPtpImg(meta.description || "", settings.ptpImgApiKey);
            await StorageService.save(meta);
            showLinks("PTPIMG 结果", before, meta.description || "");
            alert("已转存至 PTPIMG");
          });
          const pix = makeToolLink("PIXHOST");
          pix.on("click", async (e2) => {
            e2.preventDefault();
            const before = meta.description || "";
            meta.description = await ImageHostService.rehostDescriptionToPixhost(meta.description || "");
            await StorageService.save(meta);
            showLinks("PIXHOST 结果", before, meta.description || "");
            alert("已转存至 Pixhost");
          });
          const freeimage = makeToolLink("FREEIMAGE");
          freeimage.on("click", async (e2) => {
            e2.preventDefault();
            const before = meta.description || "";
            const settings = await SettingsService.load();
            if (!settings.freeimageApiKey) {
              alert("未设置 Freeimage API Key");
              return;
            }
            meta.description = await ImageHostService.rehostDescriptionToFreeimage(meta.description || "", settings.freeimageApiKey);
            await StorageService.save(meta);
            showLinks("FREEIMAGE 结果", before, meta.description || "");
            alert("已转存至 Freeimage");
          });
          const gifyu = makeToolLink("GIFYU");
          gifyu.on("click", async (e2) => {
            e2.preventDefault();
            const before = meta.description || "";
            const settings = await SettingsService.load();
            if (!settings.gifyuApiKey) {
              alert("未设置 Gifyu API Key");
              return;
            }
            meta.description = await ImageHostService.rehostDescriptionToGifyu(meta.description || "", settings.gifyuApiKey);
            await StorageService.save(meta);
            showLinks("GIFYU 结果", before, meta.description || "");
            alert("已转存至 Gifyu");
          });
          const hdbimg = makeToolLink("HDBIMG");
          hdbimg.on("click", async (e2) => {
            e2.preventDefault();
            await ImageUploadBridgeService.prepareAndOpen(meta, "hdbimg");
          });
          const imgbox = makeToolLink("IMGBOX");
          imgbox.on("click", async (e2) => {
            e2.preventDefault();
            await ImageUploadBridgeService.prepareAndOpen(meta, "imgbox");
          });
          toolsDiv.append(fullSize, ptp, pix, freeimage, gifyu, hdbimg, imgbox);
          container.append(toolsDiv);
        }
        static injectMetaFetchTools(container, meta) {
          const toolsDiv = $$1('<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 6px;"></div>');
          toolsDiv.append('<span style="color: #2c3e50; font-weight: bold; margin-right: 5px;">外站信息: </span>');
          const btn = $$1('<a href="#" style="text-decoration: none; color: #2c3e50; font-weight: bold; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px;">点击获取</a>');
          btn.on("click", async (e2) => {
            e2.preventDefault();
            const original = btn.text();
            btn.text("获取中...");
            try {
              const settings = await SettingsService.load();
              const updated = await PtgenService.applyPtgen(meta, {
                imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                ptgenApi: settings.ptgenApi ?? 3
              });
              Object.assign(meta, updated);
              await StorageService.save(updated);
              btn.text("获取成功");
              setTimeout(() => btn.text(original), 1200);
            } catch (err) {
              console.error(err);
              btn.text("获取失败");
              setTimeout(() => btn.text(original), 1200);
            }
          });
          toolsDiv.append(btn);
          container.append(toolsDiv);
        }
      }
      const getMTeamBase = (site) => {
        if (window.location.host.includes("m-team")) {
          return `${window.location.protocol}//${window.location.host}/`;
        }
        return (site == null ? void 0 : site.baseUrl) || "https://kp.m-team.cc/";
      };
      const normalizeBaseUrl = (base) => {
        if (!base) return "";
        return base.endsWith("/") ? base : `${base}/`;
      };
      const resolveBaseUrl = (site, options) => {
        if (site.name === "MTeam") return getMTeamBase(site);
        if (site.type === SiteType.CHDBits && (options == null ? void 0 : options.chdBaseUrl)) {
          return normalizeBaseUrl(options.chdBaseUrl);
        }
        return normalizeBaseUrl(site.baseUrl);
      };
      const joinUrl = (base, path) => {
        if (!base.endsWith("/")) base += "/";
        if (path.startsWith("/")) path = path.slice(1);
        return `${base}${path}`;
      };
      const buildUploadUrl = (site, options) => {
        const base = resolveBaseUrl(site, options);
        if (!base) return "#";
        if (site.name === "BHD") return joinUrl(base, "upload");
        if (site.name === "MTeam") return joinUrl(base, "upload");
        if (site.type === SiteType.Unit3D || site.type === SiteType.Unit3DClassic) return joinUrl(base, "torrents/create");
        if (site.type === SiteType.Gazelle) return joinUrl(base, "upload.php");
        if (site.type === SiteType.NexusPHP || site.type === SiteType.CHDBits) return joinUrl(base, "upload.php");
        return joinUrl(base, "upload.php");
      };
      const buildSearchUrl = (site, meta, options) => {
        var _a, _b;
        const base = resolveBaseUrl(site, options);
        if (!base) return "#";
        const imdbId = meta.imdbId || ((_b = (_a = meta.imdbUrl) == null ? void 0 : _a.match(/tt\d+/)) == null ? void 0 : _b[0]) || "";
        const imdbNo = imdbId.replace(/^tt/i, "");
        const searchName = encodeURIComponent(getSearchName(meta.title || "", meta.type) || meta.title || "");
        const specialMap = {
          BHD: () => imdbId ? joinUrl(base, `torrents?imdb=${imdbId}`) : joinUrl(base, `torrents?search=${searchName}`),
          BLU: () => imdbNo ? joinUrl(base, `torrents?imdbid=${imdbNo}&perPage=25&imdbId=${imdbNo}`) : joinUrl(base, `torrents?search=${searchName}`),
          Tik: () => imdbId ? joinUrl(base, `torrents?imdbId=${imdbId}#page/1`) : joinUrl(base, `torrents?search=${searchName}`),
          DarkLand: () => imdbId ? joinUrl(base, `torrents?imdbId=${imdbId}#page/1`) : joinUrl(base, `torrents?search=${searchName}`),
          ACM: () => imdbNo ? joinUrl(base, `torrents?imdb=${imdbNo}#page/1`) : joinUrl(base, `torrents?search=${searchName}`),
          TTG: () => imdbNo ? joinUrl(base, `browse.php?search_field=imdb${imdbNo}&c=M`) : joinUrl(base, `browse.php?search_field=${searchName}`),
          MTeam: () => joinUrl(base, `browse?keyword=${encodeURIComponent(imdbId || meta.title || "")}`),
          PTP: () => imdbId ? joinUrl(base, `torrents.php?searchstr=${imdbId}`) : joinUrl(base, `torrents.php?searchstr=${searchName}`),
          HDB: () => joinUrl(base, `browse.php?search=${imdbId || searchName}`),
          KG: () => imdbId ? joinUrl(base, `browse.php?search=${imdbId}&search_type=imdb`) : joinUrl(base, `browse.php?search=${searchName}`)
        };
        if (specialMap[site.name]) return specialMap[site.name]();
        if (site.type === SiteType.Unit3D || site.type === SiteType.Unit3DClassic) {
          if (imdbId) return joinUrl(base, `torrents?imdbId=${imdbId}#page/1`);
          return joinUrl(base, `torrents?search=${searchName}`);
        }
        if (site.type === SiteType.Gazelle) {
          return joinUrl(base, `torrents.php?searchstr=${imdbId || searchName}`);
        }
        if (site.type === SiteType.NexusPHP || site.type === SiteType.CHDBits) {
          return joinUrl(base, `torrents.php?search=${imdbId || searchName}`);
        }
        return joinUrl(base, `torrents.php?search=${imdbId || searchName}`);
      };
      class ForwardLinkService {
        static getSearchUrl(site, meta, options) {
          return buildSearchUrl(site, meta, options);
        }
        static injectForwardLinks(container, meta, enabledSites, favoriteSites, options) {
          const allSites = SiteCatalogService.getAllSites().filter((s2) => s2.baseUrl);
          const enabled = enabledSites && enabledSites.length ? new Set(enabledSites) : null;
          const sites = enabled ? allSites.filter((s2) => enabled.has(s2.name)) : allSites;
          if (!sites.length) return;
          const row = $$1('<div class="autofeed-forward-links" style="margin: 10px 0; padding: 10px; border-top: 1px solid #eee; font-size: 13px;"></div>');
          const header = $$1('<div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;"></div>');
          header.append('<div style="color:#2c3e50; font-weight:bold;">转发站点：</div>');
          const tabWrap = $$1('<div style="margin-left:auto; display:flex; gap:6px;"></div>');
          const tabUpload = $$1('<button style="padding:2px 8px; border:1px solid #ddd; background:#2c3e50; color:#fff; border-radius:4px; cursor:pointer;">发布</button>');
          const tabSearch = $$1('<button style="padding:2px 8px; border:1px solid #ddd; background:#f5f5f5; color:#333; border-radius:4px; cursor:pointer;">检索</button>');
          tabWrap.append(tabUpload, tabSearch);
          header.append(tabWrap);
          row.append(header);
          const uploadDiv = $$1('<div style="display:flex; flex-direction:column; gap:6px;"></div>');
          const searchDiv = $$1('<div style="display:none; flex-direction:column; gap:6px;"></div>');
          const favoritesSet = new Set(favoriteSites || []);
          const favSites = sites.filter((s2) => favoritesSet.has(s2.name));
          const otherSites = sites.filter((s2) => !favoritesSet.has(s2.name));
          const buildRow = (label, siteList, mode) => {
            if (!siteList.length) return null;
            const rowWrap = $$1('<div style="display:flex; flex-wrap:wrap; gap:10px; align-items:center;"></div>');
            rowWrap.append(`<span style="color:#666; font-weight:bold;">${label}:</span>`);
            siteList.forEach((site) => {
              const base = resolveBaseUrl(site, options);
              const icon = base ? `${base}favicon.ico` : "";
              const url = mode === "upload" ? buildUploadUrl(site, options) : buildSearchUrl(site, meta, options);
              const name = site.name;
              const link = $$1(`
                    <a href="${url}" target="_blank" title="${name}" style="text-decoration:none; color:#333; display:flex; align-items:center; gap:4px;">
                        ${icon ? `<img src="${icon}" style="width:16px; height:16px; border-radius:2px;">` : ""}
                        <span>${name}</span>
                    </a>
                `);
              rowWrap.append(link);
            });
            return rowWrap;
          };
          const uploadFavRow = buildRow("常用", favSites, "upload");
          const uploadAllRow = buildRow("全部", otherSites.length ? otherSites : sites, "upload");
          if (uploadFavRow) uploadDiv.append(uploadFavRow);
          if (uploadAllRow) uploadDiv.append(uploadAllRow);
          const searchFavRow = buildRow("常用", favSites, "search");
          const searchAllRow = buildRow("全部", otherSites.length ? otherSites : sites, "search");
          if (searchFavRow) searchDiv.append(searchFavRow);
          if (searchAllRow) searchDiv.append(searchAllRow);
          tabUpload.on("click", () => {
            tabUpload.css({ background: "#2c3e50", color: "#fff" });
            tabSearch.css({ background: "#f5f5f5", color: "#333" });
            uploadDiv.show();
            searchDiv.hide();
          });
          tabSearch.on("click", () => {
            tabSearch.css({ background: "#2c3e50", color: "#fff" });
            tabUpload.css({ background: "#f5f5f5", color: "#333" });
            uploadDiv.hide();
            searchDiv.show();
          });
          row.append(uploadDiv);
          row.append(searchDiv);
          container.append(row);
        }
      }
      const ForwardLinkService$1 = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
        __proto__: null,
        ForwardLinkService
      }, Symbol.toStringTag, { value: "Module" }));
      class ListSearchService {
        static async tryInject() {
          var _a, _b, _c, _d;
          const url = window.location.href;
          const settings = await SettingsService.load();
          const enabledSites = settings.enabledSites || [];
          const quickSearchList = Array.isArray(settings.quickSearchList) ? settings.quickSearchList : void 0;
          const linkOptions = {
            chdBaseUrl: settings.chdBaseUrl
          };
          if (url.match(/^https:\/\/hdbits\.org\/browse/i) && ((_a = settings.showSearchOnList) == null ? void 0 : _a.HDB)) {
            $$1("#torrent-list").find("tr").each((_2, row) => {
              var _a2;
              const html = $$1(row).html() || "";
              const imdbId = (_a2 = html.match(/https:\/\/www\.imdb\.com\/title\/(tt\d+)/i)) == null ? void 0 : _a2[1];
              if (!imdbId) return;
              const name = $$1(row).find("td:eq(2)").find("a").first().text().trim();
              const $container = $$1(row).find("td:eq(2)");
              this.injectSearchLinks($container, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
          }
          if (url.match(/^https:\/\/passthepopcorn\.me\/torrents\.php/i) && ((_b = settings.showSearchOnList) == null ? void 0 : _b.PTP)) {
            $$1("tbody tr.basic-movie-list__details-row").each((_2, row) => {
              var _a2;
              const html = $$1(row).html() || "";
              const imdbId = (_a2 = html.match(/https?:\/\/www\.imdb\.com\/title\/(tt\d+)/i)) == null ? void 0 : _a2[1];
              if (!imdbId) return;
              const $container = $$1(row).find("td:eq(1)");
              const name = $container.find("span.basic-movie-list__movie__title-row:eq(0)").find("a").first().text().trim();
              this.injectSearchLinks($container, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
          }
          if (url.match(/^https:\/\/uhdbits\.org\/torrents\.php/i) && ((_c = settings.showSearchOnList) == null ? void 0 : _c.UHD)) {
            $$1("#torrent_table td.big_info").each((_2, cell) => {
              var _a2;
              const html = $$1(cell).html() || "";
              const imdbId = (_a2 = html.match(/http:\/\/www\.imdb\.com\/title\/(tt\d+)/i)) == null ? void 0 : _a2[1];
              if (!imdbId) return;
              const $container = $$1(cell).find("div:eq(0)");
              const name = $container.find("a").first().text().trim();
              this.injectSearchLinks($container, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
          }
          if (url.match(/^https:\/\/hd-torrents\.org\/torrents/i) && ((_d = settings.showSearchOnList) == null ? void 0 : _d.HDT)) {
            $$1(".mainblockcontenttt tr").each((_2, row) => {
              var _a2;
              const $td = $$1(row).find("td:eq(2)");
              const name = $td.find("a").first().text().trim();
              if (!name) return;
              const imdbId = (_a2 = ($td.html() || "").match(/imdb\.com\/title\/(tt\d+)/i)) == null ? void 0 : _a2[1];
              if (!imdbId) return;
              this.injectSearchLinks($td, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
            $$1(".hdblock:eq(1) tr").each((_2, row) => {
              var _a2;
              const $td = $$1(row).find("td:eq(1)");
              const name = $td.find("a").first().text().trim();
              if (!name) return;
              const imdbId = (_a2 = ($td.html() || "").match(/imdb\.com\/title\/(tt\d+)/i)) == null ? void 0 : _a2[1];
              if (!imdbId) return;
              this.injectSearchLinks($td, { title: name, imdbId }, enabledSites, linkOptions, quickSearchList);
            });
          }
        }
        static injectSearchLinks(container, meta, enabledSites, linkOptions, quickSearchList) {
          var _a;
          if (!container.length) return;
          if (container.find(".autofeed-search-links").length) return;
          const imdbId = meta.imdbId || "";
          const searchNameRaw = getSearchName(meta.title || "", meta.type);
          let searchName = searchNameRaw || meta.title || "";
          if ((meta.title || "").match(/S\d+/i)) {
            const number = (_a = (meta.title || "").match(/S(\d+)/i)) == null ? void 0 : _a[1];
            if (number) searchName = `${searchName} Season ${parseInt(number, 10)}`;
          }
          const list = Array.isArray(quickSearchList) ? quickSearchList : DEFAULT_QUICK_SEARCH_TEMPLATES;
          const items = buildQuickSearchItems(list, {
            title: searchName,
            imdbId
          });
          if (!items.length) return;
          const row = $$1('<div class="autofeed-search-links" style="margin-top: 4px; font-size: 12px;"></div>');
          row.append('<span style="color:#666; font-weight:bold; margin-right:4px;">快速搜索:</span>');
          items.forEach((item) => {
            const link = $$1(`<a href="${item.url}" target="_blank" style="margin-right:6px; color:#2c3e50;">${item.name}</a>`);
            row.append(link);
          });
          container.append(row);
        }
      }
      class LetterboxdService {
        static async getRatingByImdb(imdbId) {
          var _a, _b;
          const imdbKey = imdbId.replace(/^tt/, "");
          const imdbUrl = `https://letterboxd.com/imdb/tt${imdbKey}/`;
          const doc = await HtmlFetchService.getDocument(imdbUrl);
          const baseUrl = ((_a = doc.querySelector('meta[property="og:url"]')) == null ? void 0 : _a.getAttribute("content")) || "";
          if (!baseUrl) return null;
          const ratingUrl = baseUrl.replace(".com/", ".com/csi/") + "ratings-summary/";
          const ratingDoc = await HtmlFetchService.getDocument(ratingUrl);
          const ratingInfo = ((_b = ratingDoc.body) == null ? void 0 : _b.textContent) || "";
          const match = ratingInfo.match(/Weighted average of (.*?) based on (\d+).*?ratings/);
          if (!match) return null;
          const rate = (parseFloat(match[1]) * 2).toFixed(1);
          const votes = match[2];
          return { url: baseUrl, rating: rate, votes };
        }
      }
      class PageEnhancerService {
        static async tryEnhance() {
          const url = window.location.href;
          const settings = await SettingsService.load();
          if (url.match(/^https?:\/\/passthepopcorn\.me\/torrents\.php/i)) {
            if (settings.ptpShowGroupName) {
              try {
                this.injectPTPGroupNames(settings.ptpNameLocation || 1);
              } catch (err) {
                console.error("[Auto-Feed][PTP] GroupName inject error:", err);
              }
            }
            if (url.match(/torrents\.php\?id=\d+/i) && settings.ptpShowDouban) {
              try {
                await this.injectPTPDouban();
              } catch (err) {
                console.error("[Auto-Feed][PTP] Douban inject error:", err);
              }
            }
          }
          if (url.match(/^https?:\/\/hdbits\.org\/details\.php\?id=/i) && settings.hdbShowDouban) {
            try {
              await this.injectHDBDouban(settings.hdbHideDouban);
            } catch (err) {
              console.error("[Auto-Feed][HDB] Douban inject error:", err);
            }
          }
        }
        static injectPTPGroupNames(locationFlag) {
          if (document.body.dataset.autofeedPtpGroup === "1") return;
          const delimiter = " / ";
          const groupColor = "#20B2AA";
          const formatText = (str, color) => {
            const style = [
              "font-weight:bold",
              color ? `color:${groupColor}` : ""
            ].filter(Boolean).join(";");
            return `<span style="${style}">${str}</span>`;
          };
          const setGroupName = (groupname, target) => {
            if (!groupname || groupname === "Null") return;
            let color = true;
            const $target = $$1(target);
            const parent = $target.parent();
            if (parent.find(".golden-popcorn-character").length) color = false;
            if (parent.find(".torrent-info__download-modifier--free").length) color = false;
            if (parent.find(".torrent-info-link--user-leeching").length) color = false;
            if (parent.find(".torrent-info-link--user-seeding").length) color = false;
            if (parent.find(".torrent-info-link--user-downloaded").length) color = false;
            if (locationFlag === 1) {
              $target.append(delimiter).append(formatText(groupname, color));
            } else {
              $target.prepend(formatText(groupname, color)).prepend(delimiter);
            }
          };
          const getGroupName = (name, torrentInfo = "") => {
            var _a;
            if (typeof name !== "string") return "Null";
            try {
              name = name.replace(/\[.*?\]|web-dl|dts-hd|Blu-ray|MPEG-2|MPEG-4/ig, "");
              name = name.split(/\.mkv|\.mp4|\.iso|\.avi/)[0];
              const special = name.match(/(KJNU|tomorrow505|KG|BMDru|BobDobbs|Dusictv|AFKI)$/i);
              if (special) return special[1];
              let tmpName = ((_a = name.match(/-(.*)/)) == null ? void 0 : _a[1].split(/-/).pop()) || "";
              if (tmpName.match(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i)) {
                if (torrentInfo.match(/Scene/)) {
                  name = name.split("-")[0];
                } else {
                  const parts = tmpName.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i);
                  if (parts.length > 1) {
                    name = parts.pop() || "Null";
                  } else {
                    name = "Null";
                  }
                }
              } else {
                name = tmpName;
              }
            } catch {
              const parts = name.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVDRip|DVD9|DVD5/i);
              name = parts.length > 1 ? parts.pop() || "Null" : "Null";
            }
            name = name.trim();
            if (!name || name.match(/\)|^\d\d/)) name = "Null";
            if (name === "Z0N3") name = "D-Z0N3";
            if (name === "AVC.ZONE") name = "ZONE";
            if (name.match(/CultFilms/)) name = "CultFilms™";
            if (name.match(/™/) && !name.match(/CultFilms/)) name = "Null";
            if (name.includes(".nfo")) name = name.replace(".nfo", "");
            if (name.match(/[_\.! ]/) || name.match(/Extras/i)) name = "Null";
            if (name.length === 1 || name.match(/^\d+$/)) name = "Null";
            return name;
          };
          const applyForTable = () => {
            $$1("table#torrent-table a.torrent-info-link").each(function() {
              const $link = $$1(this);
              if ($link.data("autofeed-group") === 1) return;
              const $row = $link.closest("tr");
              let groupname = $row.data("releasegroup") || "";
              if (!groupname) {
                const releaseName = $row.data("releasename") || "";
                groupname = getGroupName(releaseName, $row.text());
              }
              setGroupName(groupname, this);
              $link.data("autofeed-group", 1);
            });
          };
          const applyForBrowse = () => {
            const pageData = window.PageData;
            if (!pageData || !pageData.Movies) return false;
            const releases = {};
            pageData.Movies.forEach((movie) => {
              var _a;
              (_a = movie.GroupingQualities) == null ? void 0 : _a.forEach((group) => {
                var _a2;
                (_a2 = group.Torrents) == null ? void 0 : _a2.forEach((torrent) => {
                  if (torrent.ReleaseGroup) {
                    releases[torrent.TorrentId] = torrent.ReleaseGroup;
                  } else if (torrent.ReleaseName) {
                    releases[torrent.TorrentId] = getGroupName(torrent.ReleaseName, "");
                  }
                });
              });
            });
            $$1("tbody a.torrent-info-link").each(function() {
              var _a;
              const href = this.href;
              const id = (_a = href.match(/\btorrentid=(\d+)\b/)) == null ? void 0 : _a[1];
              if (!id) return;
              const groupname = releases[parseInt(id, 10)] || "";
              if (groupname) setGroupName(groupname, this);
            });
            return true;
          };
          const appliedBrowse = applyForBrowse();
          if (!appliedBrowse) applyForTable();
          document.body.dataset.autofeedPtpGroup = "1";
        }
        static async injectPTPDouban() {
          var _a;
          if ($$1("#autofeed-ptp-douban").length) return;
          const imdbLink = ($$1("#imdb-title-link").attr("href") || $$1('a:contains("IMDB")').attr("href") || "").toString();
          const imdbId = (_a = imdbLink.match(/tt\d+/)) == null ? void 0 : _a[0];
          if (!imdbId) return;
          const data = await DoubanService.getByImdb(imdbId);
          if (!data) return;
          const isChinese = /[\u4e00-\u9fa5]+/.test(data.title || "");
          if (isChinese) {
            $$1(".page__title").prepend(
              `<a target="_blank" href="https://movie.douban.com/subject/${data.id}">[${data.title.split(" ")[0]}] </a>`
            );
          }
          if (data.summary) {
            const lines = data.summary.split("   ").map((s2) => s2.trim()).filter(Boolean).map((s2) => `	${s2}`);
            const summary = lines.join("\n");
            $$1("#movieinfo").before(`
                <div class="panel" id="autofeed-ptp-douban">
                    <div class="panel__heading"><span class="panel__heading__title">简介</span></div>
                    <div class="panel__body" id="intro">&nbsp&nbsp&nbsp&nbsp${summary}</div>
                </div>
            `);
          } else {
            $$1("#movieinfo").before(`<div class="panel" id="autofeed-ptp-douban"></div>`);
          }
          $$1("#torrent-table").parent().prepend($$1("#movie-ratings-table").parent());
          try {
            $$1("#movieinfo").before(`
                <div class="panel">
                    <div class="panel__heading"><span class="panel__heading__title">电影信息</span></div>
                    <div class="panel__body">
                        <div><strong>导演:</strong> ${data.director || ""}</div>
                        <div><strong>演员:</strong> ${data.cast || ""}</div>
                        <div><strong>类型:</strong> ${data.genre || ""}</div>
                        <div><strong>制片国家/地区:</strong> ${data.region || ""}</div>
                        <div><strong>语言:</strong> ${data.language || ""}</div>
                        <div><strong>时长:</strong> ${data.runtime || ""}</div>
                        <div><strong>又名:</strong> ${data.aka || ""}</div>
                    </div>
                </div>
            `);
          } catch {
          }
          const total = data.average ? 10 : "";
          const split = data.average ? "/" : "";
          const votes = data.votes || 0;
          const average = data.average || "暂无评分";
          $$1("#movie-ratings-table tr").prepend(`
            <td colspan="1" style="width: 110px;">
                <center>
                <a target="_blank" class="rating" href="https://movie.douban.com/subject/${data.id}" rel="noreferrer">
                    <div style="font-size: 0;min-width: 105px;">
                        <span class="icon-pt1" style="font-size: 14px;
                        display: inline-block;
                        text-align: center;
                        border: 1px solid #41be57;
                        background-color: #41be57;
                        color: white;
                        border-top-left-radius: 4px;
                        border-bottom-left-radius: 4px;
                        width: 24px;
                        height: 24px;
                        line-height: 24px;">豆</span>
                        <span class="icon-pt2" style="font-size: 14px;
                        display: inline-block;
                        text-align: center;
                        border: 1px solid #41be57;
                        color: #3ba94d;
                        background: #ffffff;
                        border-top-right-radius: 4px;
                        border-bottom-right-radius: 4px;
                        width: 69px;
                        height: 24px;
                        line-height: 24px;">豆瓣评分</span>
                    </div>
                </a>
                </center>
            </td>
            <td style="width: 150px;">
                <span class="rating">${average}</span>
                <span class="mid">${split}</span>
                <span class="outof"> ${total} </span>
                <br>(${votes} votes)
            </td>
        `);
          try {
            const lb = await LetterboxdService.getRatingByImdb(imdbId);
            if (lb) {
              $$1("#ptp_rating_td").prev().before(`
                    <td colspan="1" style="width: 128px;" id="letterboxd_rating_td">
                        <center>
                            <a target="_blank" class="rating" id="letterboxd-title-link" href="${lb.url}" rel="noreferrer">
                            <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAADAFBMVEUgKDAAAAAcJS7+gQBAu/MA4VT6fQAEBQgA3VAdJCxCxf07uPAdHSMHCQv8/fwAVVUbIikiGy0TGBkcJCsAf39VVVWRVRcExE4APDwWHSMcJCt/f38xd5gMEhXJawsTGBwubIo4mcULoUcPFBgNmUYQhEIXFyCmXRMYHiNhQiEYHSMeNjNPOyUv5nUgJy8pVGo6odHW+eMAAP8zgaYmSFo3NCj82bLYcQg2kbojOEY9ruAAADMbIysA8VfD9tYJsEvK7PsAAH977aWCTxsUGh8bRzYYWDkUbD259c8WHCIXGiG6Zg615fkZIiuN8LWR77CO2PYZQUaUn0L8zJh/0/Vq2Mn7rFf7tmtDuKm3wGcAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAB7F3FFAAABAHRSTlP+Aff/////K//P////R/8Djf8XsQID//8EkW8C/yn/U////2r//xv/c/+l////2v///wH//////////wVA/////wL//4n/////LUz//zv///////////////8AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAt4aTcAAAA0hJREFUeNq9lwl7ojAQhmMEMQh44AUe9W6rVu3Wbu/t9r62e5///49sAiEmIC3Y7s7TRylhXr9MMsMEJF5o4N8AsqXsmXjnDN+KCCixq0Ki4Bi+CA6GAJxfKTzaOdNEEwghcP7gBJlmzn4ssEdCAGTsOIdAqKHcsR8hKhjY1BsGnektZA/CFdghvj6KHQIYmM94M4Y5WAa4m4DINrkLAhowys97ImDDBygmUHR/QkDYhQNkcfxi+BOCTVeTKijEcncQBU5BNpEDMQkQ5FwJVAECsQ3xMbgHK9g9A5Tiz8CdQ4kpQKsoQIspKHAVAFQYYA2sZGsUUExsPJl8ofI2yG7EgNoihpCa90iefTijGqQfXhRrVIHpue+WH/b2muWxi8hf9U8rldP+Vd4dndfbs9l+60CjQJMqeEMXAYJyKunawy4mjHoytd4Ijx7sq65JdSoYYVc3iMj1byaTKdeSqbE2qshpanJllJ9nVCkjYctIatslILYKLqCZ9ATgi9Qu9vcUYMKXjOq4Owi17QOQf+HFwp8g/iz8CeGHxPwJoUXiAD0A2UcQ8O6YZWzxgC1D5QCSdMh2EgNsigJ+GZ94wEfjswBQp5ofUBYBb413POCd8YEHZNQ6D2gQwLofsC1ztm28FxXsEEDjtQDLpvDNuOWncOufQisQg7EI+Gmc84Bz47uoYA59AAD3eEJwGfl9IKmzwDIG1vGruJF+i4CpxgPoVsZRoAj83QSdkzRFpNMnHdjmdpKziIFcIASaTEnsD0FHptkkyx083FadbMK5pNYh4AFeOuNZNKmCC6cg3FRcBZUbpxy0Dt10nk01IKQzKyj4oXF5fb28SfM9D677vV7/mtYkDUzrOzutOStYZrCkAX9Jc4wVQY0YBMGStvFUOxJe8r2i+uKy/govlpe+2mqrvlxrTMHayiGggFWC4IbAa3Gs+C2OJbQ48SVQAazNs+K2eZbY5lWVuI2mUvW1unq8VlcPNtt6HAX6snZfR1HbfaQvP3AoFoxy4ICWEnrk0S343JEHWnr4kQcHVukOUagGiIZdxXks9NhHxhS9ezk0EYKcIWQOL7u6kvC5P3HwVLDp1Mh1xIMntWKpeiTeOaqWiv/z8B0D8Be4B0K6oEftygAAAABJRU5ErkJggg==" style="height:64px;width:64px;" title="LetterBoxd"></a>
                        </center>
                    </td>
                    <td style="width: 150px;">
                        <span class="rating">${lb.rating}</span>
                        <span class="mid">/</span>
                        <span class="outof">10</span>
                        <br>(${lb.votes} votes)
                    </td>
                `);
            }
          } catch {
          }
        }
        static async injectHDBDouban(hideByDefault) {
          var _a;
          if ($$1("#autofeed-hdb-douban").length) return;
          let links = $$1("table.contentlayout").find('a[href^="https://www.imdb.com/title/"]');
          if (links.length === 0) {
            links = $$1(".showlinks").find('a[href^="https://www.imdb.com/title/"]');
            if (links.length === 0) return;
          }
          const imdbHref = links[0].href || "";
          const imdbId = (_a = imdbHref.match(/tt\d+/)) == null ? void 0 : _a[0];
          if (!imdbId) return;
          const data = await DoubanService.getByImdb(imdbId);
          if (!data) return;
          if (data.cast && data.cast.split("/").length > 8) {
            data.cast = data.cast.split("/").slice(0, 8).join("/");
          }
          if (data.director && data.director.split("/").length > 8) {
            data.director = data.director.split("/").slice(0, 8).join("/");
          }
          const label = hideByDefault ? "+ " : "- ";
          const status = hideByDefault ? "none" : "block";
          $$1("#details > tbody > tr").eq(1).after(`
            <tr id="autofeed-hdb-douban"><td>
            <div id="l20201117" class="label collapsable" onclick="showHideEl(20201117)"><span class="plusminus">${label}</span>关于本片 (豆瓣信息)</div>
            <div id="c20201117" class="hideablecontent" style="display: ${status};">
                <table class="contentlayout" cellspacing="0"><tbody>
                    <tr>
                        <td rowspan="3" width="2"><img src="${data.image || ""}" style="max-width:250px;border:0px;" alt></td>
                        <td colspan="2"><h1><a href="https://movie.douban.com/subject/${data.id}" target="_blank">${data.title}</a> (${data.year || ""})</h1><h3>${data.aka || ""}</h3></td>
                    </tr>
                    <tr>
                        <td><table class="content" cellspacing="0" id="imdbinfo" style="white-space: nowrap;"><tbody>
                            <tr><th>评分</th><td>${data.average || "暂无评分"} (${data.votes || 0}人评价)</td></tr>
                            <tr><th>类型</th><td>${data.genre || ""}</td></tr>
                            <tr><th>国家/地区</th><td>${data.region || ""}</td></tr>
                            <tr><th>导演</th><td>${(data.director || "").replace(/\//g, "<br>    ")}</td></tr>
                            <tr><th>语言</th><td>${data.language || ""}</td></tr>
                            <tr><th>上映日期</th><td>${(data.releaseDate || "").replace(/\//g, "<br>    ")}</td></tr>
                            <tr><th>片长</th><td>${data.runtime || ""}</td></tr>
                            <tr><th>演员</th><td>${(data.cast || "").replace(/\//g, "<br>    ")}</td></tr>
                        </tbody></table></td>
                        <td id="plotcell"><table class="content" cellspacing="0"><tbody>
                            <tr><th>简介</th></tr><tr><td>${data.summary ? "　　" + data.summary.replace(/ 　　/g, "<br>　　") : "本片暂无简介"}</td></tr>
                        </tbody></table></td>
                    </tr>
                    <tr>
                        <td colspan="2" id="actors"></td>
                    </tr>
                </tbody></table>
            </div>
            </td></tr>
        `);
          $$1('div.collapsable:contains("About this film (from IMDB)")').parent().find("img").first().css({ width: "250px", "max-height": "660px" });
          if (!hideByDefault) {
            $$1('div.collapsable:contains("About this film (from IMDB)")').click();
          }
        }
      }
      class QuickSearchService {
        static async tryInject() {
          const url = window.location.href;
          const settings = await SettingsService.load();
          if (url.match(/^https?:\/\/movie\.douban\.com\/subject\/\d+/i) && settings.showQuickSearchOnDouban) {
            this.injectDoubanTools();
          }
          if (url.match(/^https?:\/\/www\.imdb\.com\/title\/tt\d+/i) && settings.showQuickSearchOnImdb) {
            this.injectImdbTools();
          }
        }
        static buildSearchLinks(container, meta) {
          if (container.find(".autofeed-search-links").length) return;
          const settings = SettingsService.load();
          settings.then((s2) => {
            const row = $$1('<div class="autofeed-search-links" style="margin-top: 6px; font-size: 12px;"></div>');
            row.append('<span style="color:#666; font-weight:bold; margin-right:4px;">快速搜索:</span>');
            if (Array.isArray(s2.quickSearchList)) {
              const items = buildQuickSearchItems(s2.quickSearchList, meta);
              if (!items.length) return;
              items.forEach((item) => {
                const link = $$1(`<a href="${item.url}" target="_blank" style="margin-right:6px; color:#2c3e50;">${item.name}</a>`);
                row.append(link);
              });
            } else {
              const items = buildQuickSearchItems(DEFAULT_QUICK_SEARCH_TEMPLATES, meta);
              if (items.length) {
                items.forEach((item) => {
                  const link = $$1(`<a href="${item.url}" target="_blank" style="margin-right:6px; color:#2c3e50;">${item.name}</a>`);
                  row.append(link);
                });
              } else {
                const allSites = SiteCatalogService.getAllSites().filter((site) => site.baseUrl);
                const enabled = s2.enabledSites && s2.enabledSites.length ? new Set(s2.enabledSites) : null;
                const sites = enabled ? allSites.filter((site) => enabled.has(site.name)) : allSites;
                if (!sites.length) return;
                sites.forEach((site) => {
                  const url = ForwardLinkService.getSearchUrl(
                    site,
                    {
                      title: meta.title || "",
                      imdbId: meta.imdbId || ""
                    },
                    { chdBaseUrl: s2.chdBaseUrl }
                  );
                  const link = $$1(`<a href="${url}" target="_blank" style="margin-right:6px; color:#2c3e50;">${site.name}</a>`);
                  row.append(link);
                });
              }
            }
            container.append(row);
          });
        }
        static injectDoubanTools() {
          var _a, _b;
          if (document.body.dataset.autofeedDouban === "1") return;
          const $info = $$1("#info");
          const $title = $$1("h1").first();
          if (!$info.length) return;
          const imdbId = ((_a = ($info.html() || "").match(/tt\d+/i)) == null ? void 0 : _a[0]) || "";
          const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : "";
          if (imdbId && !$info.find('a[href*="imdb.com/title"]').length) {
            const imdbSpan = $info.find("span.pl:contains('IMDb')");
            if (imdbSpan.length) {
              try {
                const el = imdbSpan.get(0);
                if (el && el.nextSibling) {
                  el.nextSibling.textContent = "";
                }
                imdbSpan.after(`<a href="${imdbUrl}" target="_blank"> ${imdbId}</a>`);
              } catch {
              }
            }
          }
          const posterImg = $$1("#mainpic img").first().attr("src") || "";
          const poster = posterImg.replace(/^.+(p\d+).+$/, (_2, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`);
          $$1("#mainpic").append(`<br><a href="#" id="autofeed-rehost-poster">海报转存</a>`);
          $$1("#autofeed-rehost-poster").on("click", async (e2) => {
            e2.preventDefault();
            if (!poster) return;
            const settings = await SettingsService.load();
            try {
              let result = [];
              if (settings.ptpImgApiKey) {
                result = await ImageHostService.uploadToPtpImg([poster], settings.ptpImgApiKey);
              } else if (settings.pixhostApiKey || !settings.freeimageApiKey) {
                result = await ImageHostService.uploadToPixhost([poster]);
              } else if (settings.freeimageApiKey) {
                result = await ImageHostService.uploadToFreeimage([poster], settings.freeimageApiKey);
              } else if (settings.gifyuApiKey) {
                result = await ImageHostService.uploadToGifyu([poster], settings.gifyuApiKey);
              }
              if (result.length) {
                await GMAdapter.setClipboard(result[0]);
                alert("海报已转存并复制到剪贴板");
              }
            } catch (err) {
              console.error(err);
              alert("海报转存失败");
            }
          });
          const searchName = (((_b = $title.text().trim().match(/[a-z ]{2,200}/i)) == null ? void 0 : _b[0]) || $title.text().trim()).replace(/season/i, "");
          this.buildSearchLinks($title, { title: searchName, imdbId });
          document.body.dataset.autofeedDouban = "1";
        }
        static injectImdbTools() {
          var _a;
          if (document.body.dataset.autofeedImdb === "1") return;
          const imdbId = ((_a = window.location.href.match(/tt\d+/i)) == null ? void 0 : _a[0]) || "";
          const searchName = $$1("title").text().trim().split(/ \(\d+\) - /)[0].replace(/season/i, "");
          const $container = $$1("h1[data-testid*=pageTitle]").first();
          if ($container.length) {
            this.buildSearchLinks($container, { title: searchName, imdbId });
          }
          document.body.dataset.autofeedImdb = "1";
        }
      }
      class RemoteDownloadService {
        static async tryInject() {
          const settings = await SettingsService.load();
          if (!settings.enableRemoteSidebar || !settings.remoteServer) return;
          if (document.getElementById("autofeed-remote-sidebar")) return;
          const engine = SiteRegistry.getEngine(window.location.href);
          if (!engine) return;
          if (!this.isDetailPage(window.location.href)) return;
          this.injectSidebar(settings.remoteServer, engine);
        }
        static isDetailPage(url) {
          return !!url.match(/details?(\.php)?|threads|topics|torrents|detail\//i);
        }
        static injectSidebar(config, engine) {
          this.injectStyles();
          $$1("body").append(`
            <div id="autofeed-remote-sidebar">
                <div class="sidebar-header">
                    <span>远程推送</span>
                    <div class="download-icon">⬇</div>
                </div>
                <ul id="autofeed-remote-list"></ul>
            </div>
        `);
          $$1("body").append(`
            <div class="autofeed-remote-dialog hide">
                <div class="dialog0">
                    <div class="dialog-header0">
                        <span class="dialog-title0">是否跳过检验？</span>
                        <button class="close-btn"></button>
                    </div>
                    <div class="dialog-body0">
                        <span class="dialog-message">请谨慎选择，如果因为跳检造成做假种或者下载量增加后果自负！！</span>
                    </div>
                    <div class="dialog-footer0">
                        <input type="button" class="qb-btn" id="autofeed-confirm" value="跳过检验" />
                        <input type="button" class="qb-btn ml50" id="autofeed-cancel" value="直接下载" />
                    </div>
                </div>
            </div>
        `);
          $$1("body").append(`
            <div id="autofeed-remote-toast" style="display:none;">
                <p style="margin:8px 12px">种子添加成功~~</p>
            </div>
        `);
          const qb = config.qbittorrent || {};
          const tr = config.transmission || {};
          const $list = $$1("#autofeed-remote-list");
          Object.keys(qb).forEach((server) => {
            $list.append(`<li class="menu-item" data-server="${server}" data-type="qb"><a href="${qb[server].url}" target="_blank">Q-${server}</a><ul class="submenu" id="autofeed-ul-${server}"></ul></li>`);
            const $submenu = $$1(`#autofeed-ul-${server}`);
            Object.keys(qb[server].path || {}).forEach((label) => {
              $submenu.append(`<li><a href="#" class="qb_download" data-path="${qb[server].path[label]}">${label}</a></li>`);
            });
          });
          Object.keys(tr).forEach((server) => {
            $list.append(`<li class="menu-item" data-server="${server}" data-type="tr"><a href="${tr[server].url}" target="_blank">T-${server}</a><ul class="submenu" id="autofeed-ul-${server}"></ul></li>`);
            const $submenu = $$1(`#autofeed-ul-${server}`);
            Object.keys(tr[server].path || {}).forEach((label) => {
              $submenu.append(`<li><a href="#" class="tr_download" data-path="${tr[server].path[label]}">${label}</a></li>`);
            });
          });
          const dialogBox = (yesCallback, noCallback) => {
            $$1(".autofeed-remote-dialog").removeClass("hide").addClass("show");
            $$1("#autofeed-confirm").off("click").on("click", () => {
              $$1(".autofeed-remote-dialog").addClass("hide");
              yesCallback();
            });
            $$1("#autofeed-cancel").off("click").on("click", () => {
              $$1(".autofeed-remote-dialog").addClass("hide");
              noCallback();
            });
            $$1(".close-btn").off("click").on("click", () => {
              $$1(".autofeed-remote-dialog").addClass("hide");
            });
          };
          $$1(".qb_download").on("click", async (e2) => {
            e2.preventDefault();
            const $target = $$1(e2.currentTarget);
            const serverName = $target.closest(".menu-item").data("server");
            const path = $target.data("path");
            const label = $target.text();
            const server = qb[serverName];
            if (!server) return;
            dialogBox(
              () => this.pushToQb(engine, server, path, label, true),
              () => this.pushToQb(engine, server, path, label, false)
            );
          });
          $$1(".tr_download").on("click", async (e2) => {
            e2.preventDefault();
            const $target = $$1(e2.currentTarget);
            const serverName = $target.closest(".menu-item").data("server");
            const path = $target.data("path");
            const label = $target.text();
            const server = tr[serverName];
            if (!server) return;
            dialogBox(
              () => this.pushToTransmission(engine, server, path, label, true),
              () => this.pushToTransmission(engine, server, path, label, false)
            );
          });
          const menuItems = document.querySelectorAll("#autofeed-remote-sidebar .menu-item");
          menuItems.forEach((item) => {
            const submenu = item.querySelector(".submenu");
            if (!submenu) return;
            item.addEventListener("mouseenter", function() {
              const rect = item.getBoundingClientRect();
              submenu.style.display = "block";
              submenu.style.position = "fixed";
              const element = document.getElementById("autofeed-remote-sidebar");
              const height = element ? element.offsetHeight : 0;
              submenu.style.top = `${rect.top - window.innerHeight / 2 + height / 2}px`;
            });
            item.addEventListener("mouseleave", function() {
              submenu.style.display = "none";
            });
          });
        }
        static async getMeta(engine) {
          try {
            const meta = await engine.parse();
            return meta;
          } catch (err) {
            console.error("[Auto-Feed] Parse for remote push failed:", err);
            return null;
          }
        }
        static async pushToQb(engine, server, path, tag, skipChecking) {
          const meta = await this.getMeta(engine);
          if (!(meta == null ? void 0 : meta.torrentUrl)) {
            alert("未找到种子下载链接");
            return;
          }
          const blob = await this.downloadTorrentBlob(meta.torrentUrl);
          if (!blob) return;
          const torrentFile = new File([blob], meta.torrentFilename || "autofeed.torrent", { type: "application/x-bittorrent" });
          const formData = new FormData();
          const siteUpLimits = {
            CMCT: 134217728,
            Audiences: 131072e3
          };
          if (meta.sourceSite && siteUpLimits[meta.sourceSite]) {
            formData.append("upLimit", String(siteUpLimits[meta.sourceSite]));
          }
          formData.append("torrents", torrentFile);
          formData.append("savepath", path);
          formData.append("category", tag);
          formData.append("skip_checking", String(skipChecking));
          const host = this.normalizeHost(server.url);
          try {
            await this.qbRequest(host, "/auth/login", {
              username: server.username,
              password: server.password
            });
            await this.qbRequest(host, "/torrents/add", formData);
            this.showToast();
          } catch (err) {
            console.error(err);
            alert("远程推送失败，请检查 QB 状态和配置");
          }
        }
        static async pushToTransmission(engine, server, path, tag, skipChecking) {
          const meta = await this.getMeta(engine);
          if (!(meta == null ? void 0 : meta.torrentUrl)) {
            alert("未找到种子下载链接");
            return;
          }
          const base64 = await this.downloadTorrentBase64(meta.torrentUrl);
          if (!base64) return;
          const host = this.normalizeHost(server.url);
          try {
            await this.transmissionRequest(
              `${host}transmission/rpc`,
              server.username,
              server.password,
              base64,
              path,
              [tag],
              skipChecking
            );
            this.showToast();
          } catch (err) {
            console.error(err);
            alert("远程推送失败，请检查 Transmission 状态和配置");
          }
        }
        static async downloadTorrentBlob(url) {
          try {
            const res = await GMAdapter.xmlHttpRequest({
              method: "GET",
              url,
              responseType: "blob"
            });
            return res.response;
          } catch (err) {
            console.error("Torrent download failed:", err);
            return null;
          }
        }
        static async downloadTorrentBase64(url) {
          try {
            const res = await GMAdapter.xmlHttpRequest({
              method: "GET",
              url,
              responseType: "arraybuffer"
            });
            const bytes = new Uint8Array(res.response);
            let binary = "";
            for (let i2 = 0; i2 < bytes.length; i2++) binary += String.fromCharCode(bytes[i2]);
            return btoa(binary);
          } catch (err) {
            console.error("Torrent download failed:", err);
            return null;
          }
        }
        static async qbRequest(host, path, parameters) {
          const endpoint = "api/v2";
          const headers = {};
          let data = null;
          if (path === "/auth/login") {
            headers["Content-Type"] = "application/x-www-form-urlencoded; charset=UTF-8";
            data = new URLSearchParams(parameters).toString();
          } else {
            data = parameters;
          }
          return GMAdapter.xmlHttpRequest({
            method: "POST",
            url: `${host}${endpoint}${path}`,
            data,
            headers
          });
        }
        static normalizeHost(url) {
          if (!url) return "";
          return url.endsWith("/") ? url : `${url}/`;
        }
        static async transmissionRequest(rpcUrl, username, password, base64, path, tag, skipChecking) {
          let sessionId = "";
          const data = {
            method: "torrent-add",
            arguments: {
              metainfo: base64,
              "download-dir": path,
              labels: tag,
              "skip-verify": skipChecking
            }
          };
          const headers = {
            "Content-Type": "application/json",
            "X-Transmission-Session-Id": sessionId,
            Authorization: "Basic " + btoa(username + ":" + password)
          };
          const res = await GMAdapter.xmlHttpRequest({
            method: "POST",
            url: rpcUrl,
            headers,
            data: JSON.stringify(data)
          });
          if (res.status === 409) {
            const newSessionId = res.responseHeaders.match(/X-Transmission-Session-Id:\s*(.+)/i);
            if (newSessionId) sessionId = newSessionId[1].trim();
            return GMAdapter.xmlHttpRequest({
              method: "POST",
              url: rpcUrl,
              headers: {
                ...headers,
                "X-Transmission-Session-Id": sessionId
              },
              data: JSON.stringify(data)
            });
          }
          return res;
        }
        static showToast() {
          const $toast = $$1("#autofeed-remote-toast");
          if (!$toast.length) return;
          $toast.fadeIn(400);
          setTimeout(() => {
            $toast.fadeOut(600);
          }, 2e3);
        }
        static injectStyles() {
          const style = `
        .autofeed-remote-dialog {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px);
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }
        .autofeed-remote-dialog.show {
            opacity: 1;
            visibility: visible;
        }
        #autofeed-remote-toast {
            position: fixed;
            top: 5%;
            left: 50%;
            transform: translate(-50%, -50%);
            background-color: #4CAF50;
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
        }
        #autofeed-remote-sidebar {
            position: fixed;
            top: 50%;
            right: 5px;
            transform: translateY(-50%);
            width: 70px;
            background-color: #2c3e50;
            border: none;
            border-radius: 8px;
            z-index: 9999;
        }
        #autofeed-remote-sidebar .sidebar-header {
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            padding: 8px 0;
            margin-bottom: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        #autofeed-remote-sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }
        #autofeed-remote-sidebar li a {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px 10px;
            text-decoration: none;
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 14px;
            font-weight: 500;
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }
        #autofeed-remote-sidebar li a:hover {
            background-color: #34495e;
        }
        #autofeed-remote-sidebar .submenu {
            display: none;
            position: absolute;
            left: -100%;
            width: 70px;
            background-color: #34495e;
            border-radius: 8px;
            box-shadow: -4px 0 10px rgba(0, 0, 0, 0.15);
            z-index: 10;
        }
        #autofeed-remote-sidebar .submenu li a {
            color: #bdc3c7;
            padding: 12px 10px;
            font-size: 13px;
        }
        #autofeed-remote-sidebar .submenu li a:hover {
            background-color: #4a6781;
            color: #ecf0f1;
        }
        .dialog0 {
            width: 90%;
            max-width: 300px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            overflow: hidden;
        }
        .dialog-header0 {
            padding: 6px 8px;
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }
        .dialog-title0 {
            color: white;
            font-size: 16px;
            font-weight: 600;
        }
        .close-btn {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            cursor: pointer;
        }
        .close-btn::after {
            content: "×";
            color: white;
            font-size: 20px;
            line-height: 1;
        }
        .dialog-body0 {
            padding: 18px;
            line-height: 1.2;
            color: #333;
            font-size: 15px;
            min-height: 40px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #f0f0f0;
        }
        .dialog-footer0 {
            padding: 12px 25px;
            display: flex;
            justify-content: center;
            background: white;
        }
        .qb-btn {
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            min-width: 80px;
            padding: 6px 10px;
            min-height: 30px;
            line-height: 1.0;
        }
        #autofeed-confirm {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            box-shadow: 0 4px 6px rgba(103, 119, 239, 0.2);
        }
        #autofeed-cancel {
            background: #e6f0ff;
            color: #4a90e2;
            border: 1px solid #c1d7f5;
            margin-left: 15px;
        }
        .hide {
            display: none !important;
        }
        .ml50 {
            margin-left: 50px;
        }
        `;
          if (!document.getElementById("autofeed-remote-style")) {
            const styleEl = document.createElement("style");
            styleEl.id = "autofeed-remote-style";
            styleEl.textContent = style;
            document.head.appendChild(styleEl);
          }
        }
      }
      class UploadMetaFetchService {
        static async tryInject(adapter) {
          if (document.body.dataset.autofeedUploadFetch === "1") return;
          const $descr = $$1('textarea[name="descr"], textarea[name="description"], #descr, #description').first();
          if (!$descr.length) return;
          const bar = $$1(`
            <div id="autofeed-upload-fetch" style="margin: 6px 0; display: inline-flex; gap: 8px; align-items: center;">
                <button style="background: #2c3e50; color: #fff; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-size: 12px;">点击获取</button>
                <span style="font-size: 12px; color: #666;">(外站豆瓣/ptgen)</span>
            </div>
        `);
          const btn = bar.find("button");
          btn.on("click", async () => {
            btn.text("获取中...");
            btn.prop("disabled", true);
            try {
              const settings = await SettingsService.load();
              const base = await StorageService.load() || {
                title: "",
                description: "",
                sourceSite: adapter.siteName,
                sourceUrl: window.location.href,
                images: []
              };
              const merged = this.applyInputs(base);
              const updated = await PtgenService.applyPtgen(merged, {
                imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                ptgenApi: settings.ptgenApi ?? 3
              });
              await StorageService.save(updated);
              const { normalizeMeta } = await __vitePreload(async () => {
                const { normalizeMeta: normalizeMeta2 } = await module.import('./normalize-BJd7VxQT-BU6-wKi2.js');
                return { normalizeMeta: normalizeMeta2 };
              }, true ? void 0 : void 0);
              const normalized = normalizeMeta(updated, adapter.siteName);
              await adapter.fill(normalized);
              btn.text("已更新");
            } catch (err) {
              console.error("[Auto-Feed] Upload fetch error:", err);
              btn.text("获取失败");
            } finally {
              setTimeout(() => {
                btn.prop("disabled", false);
                btn.text("点击获取");
              }, 1500);
            }
          });
          $descr.before(bar);
          document.body.dataset.autofeedUploadFetch = "1";
        }
        static applyInputs(meta) {
          var _a, _b, _c, _d;
          const next = { ...meta };
          const rawInputs = Array.from(document.querySelectorAll("input"));
          const values = rawInputs.map((input) => input.value || "").filter(Boolean);
          const pick = (pattern) => values.find((v2) => pattern.test(v2)) || "";
          const imdbLink = pick(/imdb\.com\/title\/tt\d+/i);
          const imdbId = pick(/tt\d{6,}/i);
          const doubanLink = pick(/douban\.com\/subject\/\d+/i);
          const doubanId = ((_a = pick(/subject\/(\d{5,})/i).match(/subject\/(\d{5,})/i)) == null ? void 0 : _a[1]) || "";
          if (imdbLink) {
            next.imdbUrl = imdbLink;
            next.imdbId = ((_b = imdbLink.match(/tt\d+/)) == null ? void 0 : _b[0]) || next.imdbId;
          } else if (imdbId) {
            next.imdbId = next.imdbId || ((_c = imdbId.match(/tt\d+/)) == null ? void 0 : _c[0]);
            if (next.imdbId) next.imdbUrl = next.imdbUrl || `https://www.imdb.com/title/${next.imdbId}/`;
          }
          if (doubanLink) {
            next.doubanUrl = doubanLink;
            next.doubanId = ((_d = doubanLink.match(/subject\/(\d+)/)) == null ? void 0 : _d[1]) || next.doubanId;
          } else if (doubanId) {
            next.doubanId = next.doubanId || doubanId;
            if (next.doubanId) next.doubanUrl = next.doubanUrl || `https://movie.douban.com/subject/${next.doubanId}/`;
          }
          return next;
        }
      }
      class SiteManager {
        constructor() {
          __publicField(this, "activeEngine", null);
          this.detectSite();
        }
        detectSite() {
          const url = window.location.href;
          console.log(`[Auto-Feed] Detecting site for URL: ${url}`);
          this.activeEngine = SiteRegistry.getEngine(url);
          if (this.activeEngine) {
            console.log(`[Auto-Feed] Active Engine: ${this.activeEngine.siteName}`);
          } else {
            console.log("[Auto-Feed] No matching engine found for this site.");
          }
        }
        async run() {
          try {
            await PageEnhancerService.tryEnhance();
          } catch (e2) {
            console.error("[Auto-Feed] PageEnhancer Error:", e2);
          }
          try {
            await QuickSearchService.tryInject();
          } catch (e2) {
            console.error("[Auto-Feed] QuickSearch Error:", e2);
          }
          try {
            await ImageUploadBridgeService.tryInject();
          } catch (e2) {
            console.error("[Auto-Feed] ImageHost Error:", e2);
          }
          try {
            await RemoteDownloadService.tryInject();
          } catch (e2) {
            console.error("[Auto-Feed] RemoteDownload Error:", e2);
          }
          try {
            await ListSearchService.tryInject();
          } catch (e2) {
            console.error("[Auto-Feed] ListSearch Error:", e2);
          }
          if (!this.activeEngine) return;
          const adapter = this.activeEngine;
          if (this.isUploadLikePage(window.location.href)) {
            try {
              await UploadMetaFetchService.tryInject(adapter);
            } catch (e2) {
              console.error("[Auto-Feed] UploadMetaFetch Error:", e2);
            }
          }
          if (window.location.href.match(/details?(\.php)?|threads|topics|torrents|detail\//i)) {
            this.injectForwardButton(adapter).catch((err) => console.error("[Auto-Feed] Injection Error:", err));
          }
          try {
            const storedMeta = await StorageService.load();
            if (storedMeta) {
              if (this.isUploadLikePage(window.location.href)) {
                this.injectFillButton(adapter, storedMeta);
              }
              if (!storedMeta.title && !storedMeta.description) {
                this.showStatusToast("缓存存在但内容为空，可能解析失败。");
              }
            } else {
              if (this.isUploadLikePage(window.location.href)) {
                this.showStatusToast("未检测到转发缓存，无法预填。");
              }
            }
          } catch (e2) {
            console.error("[Auto-Feed] Storage Load Error:", e2);
          }
        }
        async injectForwardButton(adapter) {
          var _a;
          console.log("[Auto-Feed] Starting injectForwardButton for:", adapter.siteName);
          this.injectFloatingButton(adapter);
          const config = adapter.getConfig ? adapter.getConfig() : null;
          const selectorList = [];
          const titleSelectors = (_a = config == null ? void 0 : config.selectors) == null ? void 0 : _a.title;
          if (titleSelectors) {
            if (Array.isArray(titleSelectors)) selectorList.push(...titleSelectors);
            else selectorList.push(titleSelectors);
          }
          selectorList.push(
            "menu.torrent__buttons",
            ".torrent__buttons",
            "h1.bhd-title-h1",
            "h1.torrent__name",
            ".torrent-title",
            "h1#top",
            "#top",
            "h1",
            "h2",
            ".movie__details",
            ".movie-details",
            'td.rowhead:contains("标题")',
            'td.rowhead:contains("Title")'
          );
          const findAnchor = () => {
            if (adapter.siteName === "MTeam") {
              const btn = $$1("button.ant-btn-primary").first();
              if (btn.length) return btn.parent();
              return $$1("h2.pr-\\[2em\\]").parent();
            }
            for (const sel of selectorList) {
              const el = $$1(sel).first();
              if (el.length && el.is(":visible")) {
                return el.parent().length ? el.parent() : el;
              }
            }
            return $$1();
          };
          const waitForAnchor = async () => {
            return new Promise((resolve) => {
              let attempts = 0;
              const interval = setInterval(() => {
                attempts++;
                const el = findAnchor();
                if (el.length && el.is(":visible")) {
                  clearInterval(interval);
                  resolve(el);
                } else if (attempts > 10) {
                  clearInterval(interval);
                  resolve($$1());
                }
              }, 500);
            });
          };
          const anchor = await waitForAnchor();
          if (anchor.length) {
            console.log("[Auto-Feed] Anchor found:", anchor);
            const uiContainer = $$1('<div class="autofeed-ui" style="display: inline-flex; flex-direction: column; gap: 8px; margin-left: 10px; vertical-align: middle;"></div>');
            let cachedMeta = null;
            const forwardBtn = $$1(`
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
                    <span>🚀</span> Forward
                </button>
            `);
            const fetchBtn = $$1(`
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
            const quickLinksRow = $$1('<div style="display: none; position: absolute; background: white; border: 1px solid #ddd; padding: 10px; border-radius: 4px; z-index: 1000; box-shadow: 0 4px 10px rgba(0,0,0,0.1); width: 400px; margin-top: 5px;"></div>');
            fetchBtn.on("click", async (e2) => {
              e2.preventDefault();
              e2.stopPropagation();
              fetchBtn.text("获取中...");
              fetchBtn.prop("disabled", true);
              try {
                let meta = await adapter.parse();
                const { MetaCleaner } = await __vitePreload(async () => {
                  const { MetaCleaner: MetaCleaner2 } = await module.import('./MetaCleaner-DjxRUcpo-D812m1vh.js');
                  return { MetaCleaner: MetaCleaner2 };
                }, true ? void 0 : void 0);
                const { normalizeMeta } = await __vitePreload(async () => {
                  const { normalizeMeta: normalizeMeta2 } = await module.import('./normalize-BJd7VxQT-BU6-wKi2.js');
                  return { normalizeMeta: normalizeMeta2 };
                }, true ? void 0 : void 0);
                meta = MetaCleaner.clean(meta);
                meta = normalizeMeta(meta);
                const settings = await __vitePreload(() => Promise.resolve().then(() => SettingsService$1), true ? void 0 : void 0).then((m2) => m2.SettingsService.load());
                const { PtgenService: PtgenService2 } = await __vitePreload(async () => {
                  const { PtgenService: PtgenService3 } = await Promise.resolve().then(() => PtgenService$1);
                  return { PtgenService: PtgenService3 };
                }, true ? void 0 : void 0);
                const updated = await PtgenService2.applyPtgen(meta, {
                  imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                  ptgenApi: settings.ptgenApi ?? 3
                });
                cachedMeta = updated;
                await StorageService.save(updated);
                fetchBtn.text("已获取");
              } catch (err) {
                console.error("[Auto-Feed] Ptgen Fetch Error:", err);
                fetchBtn.text("获取失败");
              } finally {
                setTimeout(() => {
                  fetchBtn.prop("disabled", false);
                  fetchBtn.text("点击获取");
                }, 1500);
              }
            });
            forwardBtn.on("click", async (e2) => {
              e2.preventDefault();
              e2.stopPropagation();
              forwardBtn.find("span").text("⏳");
              forwardBtn.css("opacity", "0.8");
              try {
                console.log("[Auto-Feed] Parsing metadata...");
                let meta = cachedMeta ? { ...cachedMeta } : await adapter.parse();
                const { MetaCleaner } = await __vitePreload(async () => {
                  const { MetaCleaner: MetaCleaner2 } = await module.import('./MetaCleaner-DjxRUcpo-D812m1vh.js');
                  return { MetaCleaner: MetaCleaner2 };
                }, true ? void 0 : void 0);
                const { normalizeMeta } = await __vitePreload(async () => {
                  const { normalizeMeta: normalizeMeta2 } = await module.import('./normalize-BJd7VxQT-BU6-wKi2.js');
                  return { normalizeMeta: normalizeMeta2 };
                }, true ? void 0 : void 0);
                meta = MetaCleaner.clean(meta);
                meta = normalizeMeta(meta);
                if (meta.torrentUrl) {
                  try {
                    forwardBtn.find("span").text("⬇️");
                    console.log(`[Auto-Feed] Downloading torrent from: ${meta.torrentUrl}`);
                    const { TorrentService } = await __vitePreload(async () => {
                      const { TorrentService: TorrentService2 } = await module.import('./TorrentService-DBpL5kU2-DokdCOJA.js');
                      return { TorrentService: TorrentService2 };
                    }, true ? void 0 : void 0);
                    const base64 = await TorrentService.download(meta.torrentUrl);
                    meta.torrentBase64 = base64;
                    if (!meta.torrentFilename) {
                      const safeName = meta.title.replace(/[^a-zA-Z0-9.-]/g, "_").substring(0, 100);
                      meta.torrentFilename = `${safeName}.torrent`;
                    }
                    console.log(`[Auto-Feed] Torrent Downloaded (${base64.length} chars)`);
                  } catch (err) {
                    console.error("[Auto-Feed] Torrent Download Failed:", err);
                    alert("Torrent file download failed. Proceeding with metadata only.");
                  }
                } else {
                  console.warn("[Auto-Feed] No torrent URL found for this item.");
                }
                console.log("[Auto-Feed] Parsed & Cleaned:", meta);
                await StorageService.save(meta);
                try {
                  const saved = await StorageService.load();
                  if (!saved || !saved.title && !saved.description) {
                    this.showStatusToast("转发缓存写入失败，请检查脚本权限/存储。");
                  }
                } catch (err) {
                  console.error("[Auto-Feed] Storage Verify Error:", err);
                  this.showStatusToast("转发缓存校验失败，请检查脚本权限/存储。");
                }
                forwardBtn.find("span").text("✅");
                const { ForwardLinkService: ForwardLinkService2 } = await __vitePreload(async () => {
                  const { ForwardLinkService: ForwardLinkService22 } = await Promise.resolve().then(() => ForwardLinkService$1);
                  return { ForwardLinkService: ForwardLinkService22 };
                }, true ? void 0 : void 0);
                const settings = await __vitePreload(() => Promise.resolve().then(() => SettingsService$1), true ? void 0 : void 0).then((m2) => m2.SettingsService.load());
                ForwardLinkService2.injectForwardLinks(
                  quickLinksRow,
                  meta,
                  settings.enabledSites,
                  settings.favoriteSites,
                  { chdBaseUrl: settings.chdBaseUrl }
                );
                QuickLinkService.injectImageTools(quickLinksRow, meta);
                QuickLinkService.injectMetaFetchTools(quickLinksRow, meta);
                quickLinksRow.show();
                const offset = forwardBtn.offset();
                if (offset) {
                  quickLinksRow.css({
                    top: offset.top + (forwardBtn.outerHeight() || 30) + 5,
                    left: offset.left
                  });
                  $$1("body").append(quickLinksRow);
                }
              } catch (e22) {
                console.error("[Auto-Feed] Parse Error:", e22);
                forwardBtn.find("span").text("❌");
                alert("Parsing failed. Check console.");
              }
            });
            const placeInlineContainer = (target) => {
              var _a2;
              const tag = (((_a2 = target.get(0)) == null ? void 0 : _a2.tagName) || "").toLowerCase();
              if (tag === "tr") {
                const colCount = target.children("td,th").length || target.closest("table").find("tr").first().children("td,th").length || 1;
                const row = $$1(`<tr class="autofeed-row"><td colspan="${colCount}"></td></tr>`);
                row.find("td").append(uiContainer);
                target.after(row);
                return;
              }
              if (["tbody", "thead", "tfoot", "table"].includes(tag)) {
                const table = tag === "table" ? target : target.closest("table");
                const colCount = table.find("tr").first().children("td,th").length || 1;
                const row = $$1(`<tr class="autofeed-row"><td colspan="${colCount}"></td></tr>`);
                row.find("td").append(uiContainer);
                const tbody = table.find("tbody").first();
                if (tbody.length) tbody.prepend(row);
                else table.prepend(row);
                return;
              }
              target.append(uiContainer);
            };
            if (adapter.siteName === "MTeam") {
              anchor.after(uiContainer);
            } else {
              placeInlineContainer(anchor);
            }
            uiContainer.append(forwardBtn);
            uiContainer.append(fetchBtn);
            adapter.parse().then((meta) => {
            }).catch(() => {
            });
          } else {
            console.log("[Auto-Feed] No anchor found for inline button (floating button already added)");
          }
        }
        injectFloatingButton(adapter) {
          const fabId = "autofeed-fab-forced";
          console.log("[Auto-Feed] Attempting to inject floating button:", fabId);
          if (document.getElementById(fabId)) {
            console.log("[Auto-Feed] Floating button already exists");
            return;
          }
          const fab = document.createElement("div");
          fab.id = fabId;
          fab.style.cssText = `
            position: fixed !important;
            bottom: 100px !important;
            right: 30px !important;
            z-index: 2147483647 !important;
            display: flex !important;
            flex-direction: column !important;
            gap: 10px !important;
            align-items: flex-end !important;
            pointer-events: none !important;
        `;
          const mainBtn = document.createElement("button");
          mainBtn.innerText = "🚀 Forward Torrent";
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
          const linksPanel = document.createElement("div");
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
            mainBtn.innerText = "⏳ Parsing...";
            try {
              let meta = await adapter.parse();
              const { MetaCleaner } = await __vitePreload(async () => {
                const { MetaCleaner: MetaCleaner2 } = await module.import('./MetaCleaner-DjxRUcpo-D812m1vh.js');
                return { MetaCleaner: MetaCleaner2 };
              }, true ? void 0 : void 0);
              meta = MetaCleaner.clean(meta);
              await StorageService.save(meta);
              mainBtn.innerText = "✅ Parsed";
              const settings = await __vitePreload(() => Promise.resolve().then(() => SettingsService$1), true ? void 0 : void 0).then((m2) => m2.SettingsService.load());
              $$1(linksPanel).empty();
              ForwardLinkService.injectForwardLinks(
                $$1(linksPanel),
                meta,
                settings.enabledSites,
                settings.favoriteSites,
                { chdBaseUrl: settings.chdBaseUrl }
              );
              QuickLinkService.injectImageTools($$1(linksPanel), meta);
              linksPanel.style.display = "block";
              setTimeout(() => mainBtn.innerHTML = "🚀 Forward Torrent", 3e3);
            } catch (e2) {
              console.error(e2);
              mainBtn.innerText = "❌ Error";
            }
          };
          fab.appendChild(linksPanel);
          fab.appendChild(mainBtn);
          (document.body || document.documentElement).appendChild(fab);
          console.log("[Auto-Feed] Floating button matched and appended to body");
          setInterval(() => {
            if (!document.getElementById(fabId)) {
              console.log("[Auto-Feed] Floating button vanished, re-injecting...");
              (document.body || document.documentElement).appendChild(fab);
            }
          }, 2e3);
        }
        async injectFillButton(adapter, meta) {
          const notify = $$1(`<div style="position:fixed; bottom:10px; right:10px; z-index:9999; padding: 12px 14px; background: #4CAF50; color: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); display: flex; align-items: center; gap: 8px; flex-wrap: wrap; max-width: 520px;">
        <span style="font-size: 12px;">Found Data: <strong>${meta.title}</strong></span>
        <button id="autofeed-fill-btn" style="background: white; color: #4CAF50; border: none; padding: 4px 8px; border-radius: 3px; cursor: pointer; font-weight: bold;">重新填充</button>
        <button id="autofeed-close-btn" style="background: transparent; color: white; border: 1px solid white; padding: 4px 8px; border-radius: 3px; cursor: pointer;">Close</button>
      </div>`);
          $$1("body").append(notify);
          try {
            const { normalizeMeta } = await __vitePreload(async () => {
              const { normalizeMeta: normalizeMeta2 } = await module.import('./normalize-BJd7VxQT-BU6-wKi2.js');
              return { normalizeMeta: normalizeMeta2 };
            }, true ? void 0 : void 0);
            const normalized = normalizeMeta(meta, adapter.siteName);
            const ready = await this.waitForForm();
            if (ready) {
              await adapter.fill(normalized);
              notify.find("#autofeed-fill-btn").text("已自动填充");
            }
          } catch (e2) {
            console.error("[Auto-Feed] Auto Fill Error:", e2);
          }
          notify.find("#autofeed-fill-btn").on("click", async () => {
            notify.find("#autofeed-fill-btn").text("Filling...");
            const { normalizeMeta } = await __vitePreload(async () => {
              const { normalizeMeta: normalizeMeta2 } = await module.import('./normalize-BJd7VxQT-BU6-wKi2.js');
              return { normalizeMeta: normalizeMeta2 };
            }, void 0 );
            const normalized = normalizeMeta(meta, adapter.siteName);
            await adapter.fill(normalized);
            notify.find("#autofeed-fill-btn").text("Done!");
            setTimeout(() => notify.fadeOut(), 2e3);
          });
          notify.find("#autofeed-close-btn").on("click", () => {
            notify.fadeOut();
          });
        }
        showStatusToast(message) {
          const toast = $$1(`<div style="position:fixed; bottom:60px; right:10px; z-index:9999; padding: 10px 12px; background: #e67e22; color: white; border-radius: 5px; box-shadow: 0 2px 10px rgba(0,0,0,0.3); font-size: 12px;">
            ${message}
        </div>`);
          $$1("body").append(toast);
          setTimeout(() => toast.fadeOut(600, () => toast.remove()), 3e3);
        }
        isUploadLikePage(url) {
          return !!url.match(/upload|offer|torrents\/create|torrents\/upload|torrent\/upload|torrents\/add|upload\.php|p_torrent\/video_upload|#\/torrent\/add|\/torrent\/add/i);
        }
        async waitForForm() {
          const selectors = [
            'input[name="name"]',
            "input#name",
            "input#titleauto",
            'input[name="title"]',
            'textarea[name="descr"]',
            'textarea[name="description"]',
            'input[name="torrentfile"]',
            'input[type="file"]#torrent',
            'input[name="torrent"]',
            "#torrent-input"
          ];
          for (let i2 = 0; i2 < 20; i2++) {
            if (selectors.some((sel) => document.querySelector(sel))) return true;
            await new Promise((r2) => setTimeout(r2, 500));
          }
          return false;
        }
      }
      var n, l$1, u$2, i$1, o$1, r$1, e$1, f$2, c$1, s$1, a$1, p$1 = {}, v$1 = [], y$1 = /acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i, d$1 = Array.isArray;
      function w$1(n2, l2) {
        for (var u2 in l2) n2[u2] = l2[u2];
        return n2;
      }
      function g(n2) {
        n2 && n2.parentNode && n2.parentNode.removeChild(n2);
      }
      function _(l2, u2, t2) {
        var i2, o2, r2, e2 = {};
        for (r2 in u2) "key" == r2 ? i2 = u2[r2] : "ref" == r2 ? o2 = u2[r2] : e2[r2] = u2[r2];
        if (arguments.length > 2 && (e2.children = arguments.length > 3 ? n.call(arguments, 2) : t2), "function" == typeof l2 && null != l2.defaultProps) for (r2 in l2.defaultProps) void 0 === e2[r2] && (e2[r2] = l2.defaultProps[r2]);
        return m$1(l2, e2, i2, o2, null);
      }
      function m$1(n2, t2, i2, o2, r2) {
        var e2 = { type: n2, props: t2, key: i2, ref: o2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: null == r2 ? ++u$2 : r2, __i: -1, __u: 0 };
        return null == r2 && null != l$1.vnode && l$1.vnode(e2), e2;
      }
      function k$1(n2) {
        return n2.children;
      }
      function x(n2, l2) {
        this.props = n2, this.context = l2;
      }
      function S(n2, l2) {
        if (null == l2) return n2.__ ? S(n2.__, n2.__i + 1) : null;
        for (var u2; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) return u2.__e;
        return "function" == typeof n2.type ? S(n2) : null;
      }
      function C$1(n2) {
        var l2, u2;
        if (null != (n2 = n2.__) && null != n2.__c) {
          for (n2.__e = n2.__c.base = null, l2 = 0; l2 < n2.__k.length; l2++) if (null != (u2 = n2.__k[l2]) && null != u2.__e) {
            n2.__e = n2.__c.base = u2.__e;
            break;
          }
          return C$1(n2);
        }
      }
      function M(n2) {
        (!n2.__d && (n2.__d = true) && i$1.push(n2) && !$.__r++ || o$1 != l$1.debounceRendering) && ((o$1 = l$1.debounceRendering) || r$1)($);
      }
      function $() {
        for (var n2, u2, t2, o2, r2, f2, c2, s2 = 1; i$1.length; ) i$1.length > s2 && i$1.sort(e$1), n2 = i$1.shift(), s2 = i$1.length, n2.__d && (t2 = void 0, o2 = void 0, r2 = (o2 = (u2 = n2).__v).__e, f2 = [], c2 = [], u2.__P && ((t2 = w$1({}, o2)).__v = o2.__v + 1, l$1.vnode && l$1.vnode(t2), O(u2.__P, t2, o2, u2.__n, u2.__P.namespaceURI, 32 & o2.__u ? [r2] : null, f2, null == r2 ? S(o2) : r2, !!(32 & o2.__u), c2), t2.__v = o2.__v, t2.__.__k[t2.__i] = t2, N(f2, t2, c2), o2.__e = o2.__ = null, t2.__e != r2 && C$1(t2)));
        $.__r = 0;
      }
      function I(n2, l2, u2, t2, i2, o2, r2, e2, f2, c2, s2) {
        var a2, h2, y2, d2, w2, g2, _2, m2 = t2 && t2.__k || v$1, b = l2.length;
        for (f2 = P(u2, l2, m2, f2, b), a2 = 0; a2 < b; a2++) null != (y2 = u2.__k[a2]) && (h2 = -1 == y2.__i ? p$1 : m2[y2.__i] || p$1, y2.__i = a2, g2 = O(n2, y2, h2, i2, o2, r2, e2, f2, c2, s2), d2 = y2.__e, y2.ref && h2.ref != y2.ref && (h2.ref && B$1(h2.ref, null, y2), s2.push(y2.ref, y2.__c || d2, y2)), null == w2 && null != d2 && (w2 = d2), (_2 = !!(4 & y2.__u)) || h2.__k === y2.__k ? f2 = A(y2, f2, n2, _2) : "function" == typeof y2.type && void 0 !== g2 ? f2 = g2 : d2 && (f2 = d2.nextSibling), y2.__u &= -7);
        return u2.__e = w2, f2;
      }
      function P(n2, l2, u2, t2, i2) {
        var o2, r2, e2, f2, c2, s2 = u2.length, a2 = s2, h2 = 0;
        for (n2.__k = new Array(i2), o2 = 0; o2 < i2; o2++) null != (r2 = l2[o2]) && "boolean" != typeof r2 && "function" != typeof r2 ? ("string" == typeof r2 || "number" == typeof r2 || "bigint" == typeof r2 || r2.constructor == String ? r2 = n2.__k[o2] = m$1(null, r2, null, null, null) : d$1(r2) ? r2 = n2.__k[o2] = m$1(k$1, { children: r2 }, null, null, null) : void 0 === r2.constructor && r2.__b > 0 ? r2 = n2.__k[o2] = m$1(r2.type, r2.props, r2.key, r2.ref ? r2.ref : null, r2.__v) : n2.__k[o2] = r2, f2 = o2 + h2, r2.__ = n2, r2.__b = n2.__b + 1, e2 = null, -1 != (c2 = r2.__i = L(r2, u2, f2, a2)) && (a2--, (e2 = u2[c2]) && (e2.__u |= 2)), null == e2 || null == e2.__v ? (-1 == c2 && (i2 > s2 ? h2-- : i2 < s2 && h2++), "function" != typeof r2.type && (r2.__u |= 4)) : c2 != f2 && (c2 == f2 - 1 ? h2-- : c2 == f2 + 1 ? h2++ : (c2 > f2 ? h2-- : h2++, r2.__u |= 4))) : n2.__k[o2] = null;
        if (a2) for (o2 = 0; o2 < s2; o2++) null != (e2 = u2[o2]) && 0 == (2 & e2.__u) && (e2.__e == t2 && (t2 = S(e2)), D$1(e2, e2));
        return t2;
      }
      function A(n2, l2, u2, t2) {
        var i2, o2;
        if ("function" == typeof n2.type) {
          for (i2 = n2.__k, o2 = 0; i2 && o2 < i2.length; o2++) i2[o2] && (i2[o2].__ = n2, l2 = A(i2[o2], l2, u2, t2));
          return l2;
        }
        n2.__e != l2 && (t2 && (l2 && n2.type && !l2.parentNode && (l2 = S(n2)), u2.insertBefore(n2.__e, l2 || null)), l2 = n2.__e);
        do {
          l2 = l2 && l2.nextSibling;
        } while (null != l2 && 8 == l2.nodeType);
        return l2;
      }
      function L(n2, l2, u2, t2) {
        var i2, o2, r2, e2 = n2.key, f2 = n2.type, c2 = l2[u2], s2 = null != c2 && 0 == (2 & c2.__u);
        if (null === c2 && null == e2 || s2 && e2 == c2.key && f2 == c2.type) return u2;
        if (t2 > (s2 ? 1 : 0)) {
          for (i2 = u2 - 1, o2 = u2 + 1; i2 >= 0 || o2 < l2.length; ) if (null != (c2 = l2[r2 = i2 >= 0 ? i2-- : o2++]) && 0 == (2 & c2.__u) && e2 == c2.key && f2 == c2.type) return r2;
        }
        return -1;
      }
      function T(n2, l2, u2) {
        "-" == l2[0] ? n2.setProperty(l2, null == u2 ? "" : u2) : n2[l2] = null == u2 ? "" : "number" != typeof u2 || y$1.test(l2) ? u2 : u2 + "px";
      }
      function j$1(n2, l2, u2, t2, i2) {
        var o2, r2;
        n: if ("style" == l2) if ("string" == typeof u2) n2.style.cssText = u2;
        else {
          if ("string" == typeof t2 && (n2.style.cssText = t2 = ""), t2) for (l2 in t2) u2 && l2 in u2 || T(n2.style, l2, "");
          if (u2) for (l2 in u2) t2 && u2[l2] == t2[l2] || T(n2.style, l2, u2[l2]);
        }
        else if ("o" == l2[0] && "n" == l2[1]) o2 = l2 != (l2 = l2.replace(f$2, "$1")), r2 = l2.toLowerCase(), l2 = r2 in n2 || "onFocusOut" == l2 || "onFocusIn" == l2 ? r2.slice(2) : l2.slice(2), n2.l || (n2.l = {}), n2.l[l2 + o2] = u2, u2 ? t2 ? u2.u = t2.u : (u2.u = c$1, n2.addEventListener(l2, o2 ? a$1 : s$1, o2)) : n2.removeEventListener(l2, o2 ? a$1 : s$1, o2);
        else {
          if ("http://www.w3.org/2000/svg" == i2) l2 = l2.replace(/xlink(H|:h)/, "h").replace(/sName$/, "s");
          else if ("width" != l2 && "height" != l2 && "href" != l2 && "list" != l2 && "form" != l2 && "tabIndex" != l2 && "download" != l2 && "rowSpan" != l2 && "colSpan" != l2 && "role" != l2 && "popover" != l2 && l2 in n2) try {
            n2[l2] = null == u2 ? "" : u2;
            break n;
          } catch (n3) {
          }
          "function" == typeof u2 || (null == u2 || false === u2 && "-" != l2[4] ? n2.removeAttribute(l2) : n2.setAttribute(l2, "popover" == l2 && 1 == u2 ? "" : u2));
        }
      }
      function F(n2) {
        return function(u2) {
          if (this.l) {
            var t2 = this.l[u2.type + n2];
            if (null == u2.t) u2.t = c$1++;
            else if (u2.t < t2.u) return;
            return t2(l$1.event ? l$1.event(u2) : u2);
          }
        };
      }
      function O(n2, u2, t2, i2, o2, r2, e2, f2, c2, s2) {
        var a2, h2, p2, v2, y2, _2, m2, b, S2, C2, M2, $2, P2, A2, H, L2, T2, j2 = u2.type;
        if (void 0 !== u2.constructor) return null;
        128 & t2.__u && (c2 = !!(32 & t2.__u), r2 = [f2 = u2.__e = t2.__e]), (a2 = l$1.__b) && a2(u2);
        n: if ("function" == typeof j2) try {
          if (b = u2.props, S2 = "prototype" in j2 && j2.prototype.render, C2 = (a2 = j2.contextType) && i2[a2.__c], M2 = a2 ? C2 ? C2.props.value : a2.__ : i2, t2.__c ? m2 = (h2 = u2.__c = t2.__c).__ = h2.__E : (S2 ? u2.__c = h2 = new j2(b, M2) : (u2.__c = h2 = new x(b, M2), h2.constructor = j2, h2.render = E), C2 && C2.sub(h2), h2.state || (h2.state = {}), h2.__n = i2, p2 = h2.__d = true, h2.__h = [], h2._sb = []), S2 && null == h2.__s && (h2.__s = h2.state), S2 && null != j2.getDerivedStateFromProps && (h2.__s == h2.state && (h2.__s = w$1({}, h2.__s)), w$1(h2.__s, j2.getDerivedStateFromProps(b, h2.__s))), v2 = h2.props, y2 = h2.state, h2.__v = u2, p2) S2 && null == j2.getDerivedStateFromProps && null != h2.componentWillMount && h2.componentWillMount(), S2 && null != h2.componentDidMount && h2.__h.push(h2.componentDidMount);
          else {
            if (S2 && null == j2.getDerivedStateFromProps && b !== v2 && null != h2.componentWillReceiveProps && h2.componentWillReceiveProps(b, M2), u2.__v == t2.__v || !h2.__e && null != h2.shouldComponentUpdate && false === h2.shouldComponentUpdate(b, h2.__s, M2)) {
              for (u2.__v != t2.__v && (h2.props = b, h2.state = h2.__s, h2.__d = false), u2.__e = t2.__e, u2.__k = t2.__k, u2.__k.some(function(n3) {
                n3 && (n3.__ = u2);
              }), $2 = 0; $2 < h2._sb.length; $2++) h2.__h.push(h2._sb[$2]);
              h2._sb = [], h2.__h.length && e2.push(h2);
              break n;
            }
            null != h2.componentWillUpdate && h2.componentWillUpdate(b, h2.__s, M2), S2 && null != h2.componentDidUpdate && h2.__h.push(function() {
              h2.componentDidUpdate(v2, y2, _2);
            });
          }
          if (h2.context = M2, h2.props = b, h2.__P = n2, h2.__e = false, P2 = l$1.__r, A2 = 0, S2) {
            for (h2.state = h2.__s, h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), H = 0; H < h2._sb.length; H++) h2.__h.push(h2._sb[H]);
            h2._sb = [];
          } else do {
            h2.__d = false, P2 && P2(u2), a2 = h2.render(h2.props, h2.state, h2.context), h2.state = h2.__s;
          } while (h2.__d && ++A2 < 25);
          h2.state = h2.__s, null != h2.getChildContext && (i2 = w$1(w$1({}, i2), h2.getChildContext())), S2 && !p2 && null != h2.getSnapshotBeforeUpdate && (_2 = h2.getSnapshotBeforeUpdate(v2, y2)), L2 = a2, null != a2 && a2.type === k$1 && null == a2.key && (L2 = V(a2.props.children)), f2 = I(n2, d$1(L2) ? L2 : [L2], u2, t2, i2, o2, r2, e2, f2, c2, s2), h2.base = u2.__e, u2.__u &= -161, h2.__h.length && e2.push(h2), m2 && (h2.__E = h2.__ = null);
        } catch (n3) {
          if (u2.__v = null, c2 || null != r2) if (n3.then) {
            for (u2.__u |= c2 ? 160 : 128; f2 && 8 == f2.nodeType && f2.nextSibling; ) f2 = f2.nextSibling;
            r2[r2.indexOf(f2)] = null, u2.__e = f2;
          } else {
            for (T2 = r2.length; T2--; ) g(r2[T2]);
            z$1(u2);
          }
          else u2.__e = t2.__e, u2.__k = t2.__k, n3.then || z$1(u2);
          l$1.__e(n3, u2, t2);
        }
        else null == r2 && u2.__v == t2.__v ? (u2.__k = t2.__k, u2.__e = t2.__e) : f2 = u2.__e = q(t2.__e, u2, t2, i2, o2, r2, e2, c2, s2);
        return (a2 = l$1.diffed) && a2(u2), 128 & u2.__u ? void 0 : f2;
      }
      function z$1(n2) {
        n2 && n2.__c && (n2.__c.__e = true), n2 && n2.__k && n2.__k.forEach(z$1);
      }
      function N(n2, u2, t2) {
        for (var i2 = 0; i2 < t2.length; i2++) B$1(t2[i2], t2[++i2], t2[++i2]);
        l$1.__c && l$1.__c(u2, n2), n2.some(function(u3) {
          try {
            n2 = u3.__h, u3.__h = [], n2.some(function(n3) {
              n3.call(u3);
            });
          } catch (n3) {
            l$1.__e(n3, u3.__v);
          }
        });
      }
      function V(n2) {
        return "object" != typeof n2 || null == n2 || n2.__b && n2.__b > 0 ? n2 : d$1(n2) ? n2.map(V) : w$1({}, n2);
      }
      function q(u2, t2, i2, o2, r2, e2, f2, c2, s2) {
        var a2, h2, v2, y2, w2, _2, m2, b = i2.props || p$1, k2 = t2.props, x2 = t2.type;
        if ("svg" == x2 ? r2 = "http://www.w3.org/2000/svg" : "math" == x2 ? r2 = "http://www.w3.org/1998/Math/MathML" : r2 || (r2 = "http://www.w3.org/1999/xhtml"), null != e2) {
          for (a2 = 0; a2 < e2.length; a2++) if ((w2 = e2[a2]) && "setAttribute" in w2 == !!x2 && (x2 ? w2.localName == x2 : 3 == w2.nodeType)) {
            u2 = w2, e2[a2] = null;
            break;
          }
        }
        if (null == u2) {
          if (null == x2) return document.createTextNode(k2);
          u2 = document.createElementNS(r2, x2, k2.is && k2), c2 && (l$1.__m && l$1.__m(t2, e2), c2 = false), e2 = null;
        }
        if (null == x2) b === k2 || c2 && u2.data == k2 || (u2.data = k2);
        else {
          if (e2 = e2 && n.call(u2.childNodes), !c2 && null != e2) for (b = {}, a2 = 0; a2 < u2.attributes.length; a2++) b[(w2 = u2.attributes[a2]).name] = w2.value;
          for (a2 in b) if (w2 = b[a2], "children" == a2) ;
          else if ("dangerouslySetInnerHTML" == a2) v2 = w2;
          else if (!(a2 in k2)) {
            if ("value" == a2 && "defaultValue" in k2 || "checked" == a2 && "defaultChecked" in k2) continue;
            j$1(u2, a2, null, w2, r2);
          }
          for (a2 in k2) w2 = k2[a2], "children" == a2 ? y2 = w2 : "dangerouslySetInnerHTML" == a2 ? h2 = w2 : "value" == a2 ? _2 = w2 : "checked" == a2 ? m2 = w2 : c2 && "function" != typeof w2 || b[a2] === w2 || j$1(u2, a2, w2, b[a2], r2);
          if (h2) c2 || v2 && (h2.__html == v2.__html || h2.__html == u2.innerHTML) || (u2.innerHTML = h2.__html), t2.__k = [];
          else if (v2 && (u2.innerHTML = ""), I("template" == t2.type ? u2.content : u2, d$1(y2) ? y2 : [y2], t2, i2, o2, "foreignObject" == x2 ? "http://www.w3.org/1999/xhtml" : r2, e2, f2, e2 ? e2[0] : i2.__k && S(i2, 0), c2, s2), null != e2) for (a2 = e2.length; a2--; ) g(e2[a2]);
          c2 || (a2 = "value", "progress" == x2 && null == _2 ? u2.removeAttribute("value") : null != _2 && (_2 !== u2[a2] || "progress" == x2 && !_2 || "option" == x2 && _2 != b[a2]) && j$1(u2, a2, _2, b[a2], r2), a2 = "checked", null != m2 && m2 != u2[a2] && j$1(u2, a2, m2, b[a2], r2));
        }
        return u2;
      }
      function B$1(n2, u2, t2) {
        try {
          if ("function" == typeof n2) {
            var i2 = "function" == typeof n2.__u;
            i2 && n2.__u(), i2 && null == u2 || (n2.__u = n2(u2));
          } else n2.current = u2;
        } catch (n3) {
          l$1.__e(n3, t2);
        }
      }
      function D$1(n2, u2, t2) {
        var i2, o2;
        if (l$1.unmount && l$1.unmount(n2), (i2 = n2.ref) && (i2.current && i2.current != n2.__e || B$1(i2, null, u2)), null != (i2 = n2.__c)) {
          if (i2.componentWillUnmount) try {
            i2.componentWillUnmount();
          } catch (n3) {
            l$1.__e(n3, u2);
          }
          i2.base = i2.__P = null;
        }
        if (i2 = n2.__k) for (o2 = 0; o2 < i2.length; o2++) i2[o2] && D$1(i2[o2], u2, t2 || "function" != typeof n2.type);
        t2 || g(n2.__e), n2.__c = n2.__ = n2.__e = void 0;
      }
      function E(n2, l2, u2) {
        return this.constructor(n2, u2);
      }
      function G(u2, t2, i2) {
        var o2, r2, e2, f2;
        t2 == document && (t2 = document.documentElement), l$1.__ && l$1.__(u2, t2), r2 = (o2 = false) ? null : t2.__k, e2 = [], f2 = [], O(t2, u2 = t2.__k = _(k$1, null, [u2]), r2 || p$1, p$1, t2.namespaceURI, r2 ? null : t2.firstChild ? n.call(t2.childNodes) : null, e2, r2 ? r2.__e : t2.firstChild, o2, f2), N(e2, u2, f2);
      }
      n = v$1.slice, l$1 = { __e: function(n2, l2, u2, t2) {
        for (var i2, o2, r2; l2 = l2.__; ) if ((i2 = l2.__c) && !i2.__) try {
          if ((o2 = i2.constructor) && null != o2.getDerivedStateFromError && (i2.setState(o2.getDerivedStateFromError(n2)), r2 = i2.__d), null != i2.componentDidCatch && (i2.componentDidCatch(n2, t2 || {}), r2 = i2.__d), r2) return i2.__E = i2;
        } catch (l3) {
          n2 = l3;
        }
        throw n2;
      } }, u$2 = 0, x.prototype.setState = function(n2, l2) {
        var u2;
        u2 = null != this.__s && this.__s != this.state ? this.__s : this.__s = w$1({}, this.state), "function" == typeof n2 && (n2 = n2(w$1({}, u2), this.props)), n2 && w$1(u2, n2), null != n2 && this.__v && (l2 && this._sb.push(l2), M(this));
      }, x.prototype.forceUpdate = function(n2) {
        this.__v && (this.__e = true, n2 && this.__h.push(n2), M(this));
      }, x.prototype.render = k$1, i$1 = [], r$1 = "function" == typeof Promise ? Promise.prototype.then.bind(Promise.resolve()) : setTimeout, e$1 = function(n2, l2) {
        return n2.__v.__b - l2.__v.__b;
      }, $.__r = 0, f$2 = /(PointerCapture)$|Capture$/i, c$1 = 0, s$1 = F(false), a$1 = F(true);
      var f$1 = 0;
      function u$1(e2, t2, n2, o2, i2, u2) {
        t2 || (t2 = {});
        var a2, c2, p2 = t2;
        if ("ref" in p2) for (c2 in p2 = {}, t2) "ref" == c2 ? a2 = t2[c2] : p2[c2] = t2[c2];
        var l2 = { type: e2, props: p2, key: n2, ref: a2, __k: null, __: null, __b: 0, __e: null, __c: null, constructor: void 0, __v: --f$1, __i: -1, __u: 0, __source: i2, __self: u2 };
        if ("function" == typeof e2 && (a2 = e2.defaultProps)) for (c2 in a2) void 0 === p2[c2] && (p2[c2] = a2[c2]);
        return l$1.vnode && l$1.vnode(l2), l2;
      }
      var t, r, u, i, o = 0, f = [], c = l$1, e = c.__b, a = c.__r, v = c.diffed, l = c.__c, m = c.unmount, s = c.__;
      function p(n2, t2) {
        c.__h && c.__h(r, n2, o || t2), o = 0;
        var u2 = r.__H || (r.__H = { __: [], __h: [] });
        return n2 >= u2.__.length && u2.__.push({}), u2.__[n2];
      }
      function d(n2) {
        return o = 1, h(D, n2);
      }
      function h(n2, u2, i2) {
        var o2 = p(t++, 2);
        if (o2.t = n2, !o2.__c && (o2.__ = [D(void 0, u2), function(n3) {
          var t2 = o2.__N ? o2.__N[0] : o2.__[0], r2 = o2.t(t2, n3);
          t2 !== r2 && (o2.__N = [r2, o2.__[1]], o2.__c.setState({}));
        }], o2.__c = r, !r.__f)) {
          var f2 = function(n3, t2, r2) {
            if (!o2.__c.__H) return true;
            var u3 = o2.__c.__H.__.filter(function(n4) {
              return !!n4.__c;
            });
            if (u3.every(function(n4) {
              return !n4.__N;
            })) return !c2 || c2.call(this, n3, t2, r2);
            var i3 = o2.__c.props !== n3;
            return u3.forEach(function(n4) {
              if (n4.__N) {
                var t3 = n4.__[0];
                n4.__ = n4.__N, n4.__N = void 0, t3 !== n4.__[0] && (i3 = true);
              }
            }), c2 && c2.call(this, n3, t2, r2) || i3;
          };
          r.__f = true;
          var c2 = r.shouldComponentUpdate, e2 = r.componentWillUpdate;
          r.componentWillUpdate = function(n3, t2, r2) {
            if (this.__e) {
              var u3 = c2;
              c2 = void 0, f2(n3, t2, r2), c2 = u3;
            }
            e2 && e2.call(this, n3, t2, r2);
          }, r.shouldComponentUpdate = f2;
        }
        return o2.__N || o2.__;
      }
      function y(n2, u2) {
        var i2 = p(t++, 3);
        !c.__s && C(i2.__H, u2) && (i2.__ = n2, i2.u = u2, r.__H.__h.push(i2));
      }
      function j() {
        for (var n2; n2 = f.shift(); ) if (n2.__P && n2.__H) try {
          n2.__H.__h.forEach(z), n2.__H.__h.forEach(B), n2.__H.__h = [];
        } catch (t2) {
          n2.__H.__h = [], c.__e(t2, n2.__v);
        }
      }
      c.__b = function(n2) {
        r = null, e && e(n2);
      }, c.__ = function(n2, t2) {
        n2 && t2.__k && t2.__k.__m && (n2.__m = t2.__k.__m), s && s(n2, t2);
      }, c.__r = function(n2) {
        a && a(n2), t = 0;
        var i2 = (r = n2.__c).__H;
        i2 && (u === r ? (i2.__h = [], r.__h = [], i2.__.forEach(function(n3) {
          n3.__N && (n3.__ = n3.__N), n3.u = n3.__N = void 0;
        })) : (i2.__h.forEach(z), i2.__h.forEach(B), i2.__h = [], t = 0)), u = r;
      }, c.diffed = function(n2) {
        v && v(n2);
        var t2 = n2.__c;
        t2 && t2.__H && (t2.__H.__h.length && (1 !== f.push(t2) && i === c.requestAnimationFrame || ((i = c.requestAnimationFrame) || w)(j)), t2.__H.__.forEach(function(n3) {
          n3.u && (n3.__H = n3.u), n3.u = void 0;
        })), u = r = null;
      }, c.__c = function(n2, t2) {
        t2.some(function(n3) {
          try {
            n3.__h.forEach(z), n3.__h = n3.__h.filter(function(n4) {
              return !n4.__ || B(n4);
            });
          } catch (r2) {
            t2.some(function(n4) {
              n4.__h && (n4.__h = []);
            }), t2 = [], c.__e(r2, n3.__v);
          }
        }), l && l(n2, t2);
      }, c.unmount = function(n2) {
        m && m(n2);
        var t2, r2 = n2.__c;
        r2 && r2.__H && (r2.__H.__.forEach(function(n3) {
          try {
            z(n3);
          } catch (n4) {
            t2 = n4;
          }
        }), r2.__H = void 0, t2 && c.__e(t2, r2.__v));
      };
      var k = "function" == typeof requestAnimationFrame;
      function w(n2) {
        var t2, r2 = function() {
          clearTimeout(u2), k && cancelAnimationFrame(t2), setTimeout(n2);
        }, u2 = setTimeout(r2, 35);
        k && (t2 = requestAnimationFrame(r2));
      }
      function z(n2) {
        var t2 = r, u2 = n2.__c;
        "function" == typeof u2 && (n2.__c = void 0, u2()), r = t2;
      }
      function B(n2) {
        var t2 = r;
        n2.__c = n2.__(), r = t2;
      }
      function C(n2, t2) {
        return !n2 || n2.length !== t2.length || t2.some(function(t3, r2) {
          return t3 !== n2[r2];
        });
      }
      function D(n2, t2) {
        return "function" == typeof t2 ? t2(n2) : t2;
      }
      const App = () => {
        const [isOpen, setIsOpen] = d(false);
        const [activeTab, setActiveTab] = d("dashboard");
        const [settings, setSettings] = d({
          ptpImgApiKey: "",
          pixhostApiKey: "",
          freeimageApiKey: "",
          gifyuApiKey: "",
          hdbImgApiKey: "",
          hdbImgEndpoint: "https://hdbimg.com/api/1/upload",
          doubanCookie: "",
          tmdbApiKey: "",
          chdBaseUrl: "https://chdbits.co/",
          ptpShowDouban: true,
          ptpShowGroupName: true,
          ptpNameLocation: 1,
          hdbShowDouban: true,
          hdbHideDouban: false,
          showQuickSearchOnDouban: true,
          showQuickSearchOnImdb: true,
          enableRemoteSidebar: false,
          remoteServer: null,
          imdbToDoubanMethod: 0,
          ptgenApi: 3,
          quickSearchList: [],
          quickSearchPresets: [],
          quickSearchTextareaHeight: 220,
          enabledSites: [],
          favoriteSites: [],
          showSearchOnList: {
            PTP: true,
            HDB: false,
            HDT: false,
            UHD: false
          }
        });
        const [quickPreset, setQuickPreset] = d("");
        const [quickPresetInput, setQuickPresetInput] = d("");
        y(() => {
          const handleKey = (e2) => {
            if (e2.altKey && e2.code === "KeyS") {
              setIsOpen((prev) => !prev);
            }
          };
          window.addEventListener("keydown", handleKey);
          SettingsService.load().then((loaded) => {
            setSettings(loaded);
            if (loaded.quickSearchList && loaded.quickSearchList.length) {
              setQuickPreset(loaded.quickSearchList[0]);
            } else if (DEFAULT_QUICK_SEARCH_TEMPLATES.length) {
              setQuickPreset(DEFAULT_QUICK_SEARCH_TEMPLATES[0]);
            }
          });
          return () => window.removeEventListener("keydown", handleKey);
        }, []);
        const handleSaveSettings = async () => {
          await SettingsService.save(settings);
          alert("Settings Saved!");
        };
        const allSites = SiteCatalogService.getAllSites();
        const getQuickSearchPresetLabel = (line) => {
          var _a;
          const anchorText = (_a = line.match(/>([^<]+)<\/a>/i)) == null ? void 0 : _a[1];
          if (anchorText) return anchorText.trim();
          const pipe = line.split("|");
          if (pipe.length > 1) return pipe[0].trim();
          if (line.match(/^https?:\/\//i)) {
            try {
              return new URL(line).hostname.replace(/^www\./, "");
            } catch {
              return line;
            }
          }
          return line;
        };
        const quickSearchPresets = Array.from(/* @__PURE__ */ new Set([
          ...DEFAULT_QUICK_SEARCH_TEMPLATES,
          ...settings.quickSearchPresets || []
        ]));
        const toggleSite = (name) => {
          const set = new Set(settings.enabledSites || []);
          if (set.has(name)) {
            set.delete(name);
          } else {
            set.add(name);
          }
          setSettings({ ...settings, enabledSites: Array.from(set) });
        };
        const toggleFavoriteSite = (name) => {
          const set = new Set(settings.favoriteSites || []);
          if (set.has(name)) {
            set.delete(name);
          } else {
            set.add(name);
          }
          setSettings({ ...settings, favoriteSites: Array.from(set) });
        };
        const selectAllSites = () => {
          setSettings({ ...settings, enabledSites: SiteCatalogService.getAllSiteNames() });
        };
        const clearAllSites = () => {
          setSettings({ ...settings, enabledSites: [] });
        };
        if (!isOpen) {
          return /* @__PURE__ */ u$1(
            "div",
            {
              style: {
                position: "fixed",
                bottom: "20px",
                right: "20px",
                zIndex: 99999,
                background: "#2c3e50",
                color: "white",
                padding: "10px",
                borderRadius: "50%",
                cursor: "pointer",
                width: "50px",
                height: "50px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.3)",
                fontSize: "24px"
              },
              onClick: () => setIsOpen(true),
              title: "Open Auto-Feed Settings (Alt+S)",
              children: "⚙️"
            }
          );
        }
        return /* @__PURE__ */ u$1("div", { style: {
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.5)",
          zIndex: 99999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }, onClick: (e2) => {
          if (e2.target === e2.currentTarget) setIsOpen(false);
        }, children: /* @__PURE__ */ u$1("div", { style: {
          width: "800px",
          height: "600px",
          background: "white",
          borderRadius: "8px",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          boxShadow: "0 5px 20px rgba(0,0,0,0.5)"
        }, onClick: (e2) => e2.stopPropagation(), children: [
          /* @__PURE__ */ u$1("div", { style: {
            padding: "15px 20px",
            background: "#f8f9fa",
            borderBottom: "1px solid #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }, children: [
            /* @__PURE__ */ u$1("h2", { style: { margin: 0, fontSize: "18px", color: "#333" }, children: "Auto-Feed Refactor" }),
            /* @__PURE__ */ u$1(
              "button",
              {
                onClick: () => setIsOpen(false),
                style: {
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                  color: "#6c757d"
                },
                children: "×"
              }
            )
          ] }),
          /* @__PURE__ */ u$1("div", { style: {
            display: "flex",
            borderBottom: "1px solid #dee2e6",
            background: "#fff"
          }, children: ["dashboard", "settings", "sites", "logs"].map((tab) => /* @__PURE__ */ u$1(
            "div",
            {
              onClick: () => setActiveTab(tab),
              style: {
                padding: "10px 20px",
                cursor: "pointer",
                borderBottom: activeTab === tab ? "2px solid #007bff" : "2px solid transparent",
                color: activeTab === tab ? "#007bff" : "#495057",
                fontWeight: activeTab === tab ? "bold" : "normal",
                textTransform: "capitalize"
              },
              children: tab
            },
            tab
          )) }),
          /* @__PURE__ */ u$1("div", { style: { flex: 1, padding: "20px", overflowY: "auto", background: "#fff", color: "#333" }, children: [
            activeTab === "dashboard" && /* @__PURE__ */ u$1("div", { children: [
              /* @__PURE__ */ u$1("p", { children: [
                "Status: ",
                /* @__PURE__ */ u$1("span", { style: { color: "green", fontWeight: "bold" }, children: "Active" })
              ] }),
              /* @__PURE__ */ u$1("p", { children: [
                "Current Site: ",
                window.location.hostname
              ] }),
              /* @__PURE__ */ u$1("p", { children: "Tip: Use Alt+S to toggle this menu." })
            ] }),
            activeTab === "settings" && /* @__PURE__ */ u$1("div", { children: [
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("label", { style: { display: "block", marginBottom: "5px" }, children: "CHD 站点域名" }),
                /* @__PURE__ */ u$1(
                  "select",
                  {
                    style: { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px" },
                    value: settings.chdBaseUrl,
                    onChange: (e2) => {
                      const value = e2.currentTarget.value;
                      const normalized = value.endsWith("/") ? value : `${value}/`;
                      setSettings({ ...settings, chdBaseUrl: normalized });
                    },
                    children: [
                      /* @__PURE__ */ u$1("option", { value: "https://chdbits.co/", children: "chdbits.co (默认)" }),
                      /* @__PURE__ */ u$1("option", { value: "https://ptchdbits.co/", children: "ptchdbits.co" }),
                      /* @__PURE__ */ u$1("option", { value: "https://ptchdbits.org/", children: "ptchdbits.org" }),
                      /* @__PURE__ */ u$1("option", { value: "https://chddiy.xyz/", children: "chddiy.xyz" })
                    ]
                  }
                )
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("label", { style: { display: "block", marginBottom: "5px" }, children: "PtpImg API Key" }),
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "text",
                    style: { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px" },
                    value: settings.ptpImgApiKey,
                    onInput: (e2) => setSettings({ ...settings, ptpImgApiKey: e2.currentTarget.value })
                  }
                )
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("label", { style: { display: "block", marginBottom: "5px" }, children: "Pixhost API Key" }),
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "text",
                    style: { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px" },
                    value: settings.pixhostApiKey,
                    onInput: (e2) => setSettings({ ...settings, pixhostApiKey: e2.currentTarget.value })
                  }
                )
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("label", { style: { display: "block", marginBottom: "5px" }, children: "Freeimage API Key" }),
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "text",
                    style: { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px" },
                    value: settings.freeimageApiKey,
                    onInput: (e2) => setSettings({ ...settings, freeimageApiKey: e2.currentTarget.value })
                  }
                )
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("label", { style: { display: "block", marginBottom: "5px" }, children: "Gifyu API Key" }),
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "text",
                    style: { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px" },
                    value: settings.gifyuApiKey,
                    onInput: (e2) => setSettings({ ...settings, gifyuApiKey: e2.currentTarget.value })
                  }
                )
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("label", { style: { display: "block", marginBottom: "5px" }, children: "HDBImg API Key (可选)" }),
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "text",
                    style: { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px" },
                    value: settings.hdbImgApiKey,
                    onInput: (e2) => setSettings({ ...settings, hdbImgApiKey: e2.currentTarget.value })
                  }
                )
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("label", { style: { display: "block", marginBottom: "5px" }, children: "HDBImg API Endpoint" }),
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "text",
                    style: { width: "100%", padding: "8px", border: "1px solid #ced4da", borderRadius: "4px" },
                    value: settings.hdbImgEndpoint,
                    onInput: (e2) => setSettings({ ...settings, hdbImgEndpoint: e2.currentTarget.value })
                  }
                ),
                /* @__PURE__ */ u$1("div", { style: { fontSize: "12px", color: "#666", marginTop: "4px" }, children: "默认：https://hdbimg.com/api/1/upload，如接口不同可自行修改" })
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "6px", background: "#fafafa" }, children: [
                /* @__PURE__ */ u$1("div", { style: { fontWeight: "bold", marginBottom: "8px" }, children: "页面增强功能" }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!settings.ptpShowDouban,
                      onChange: () => setSettings({ ...settings, ptpShowDouban: !settings.ptpShowDouban })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "PTP 中文评分/简介" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!settings.ptpShowGroupName,
                      onChange: () => setSettings({ ...settings, ptpShowGroupName: !settings.ptpShowGroupName })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "PTP 组名显示" })
                ] }),
                /* @__PURE__ */ u$1("div", { style: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", paddingLeft: "18px" }, children: [
                  /* @__PURE__ */ u$1("span", { style: { color: "#666" }, children: "组名位置:" }),
                  /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
                    /* @__PURE__ */ u$1(
                      "input",
                      {
                        type: "radio",
                        name: "ptp_name_location",
                        value: "0",
                        checked: settings.ptpNameLocation === 0,
                        onChange: () => setSettings({ ...settings, ptpNameLocation: 0 })
                      }
                    ),
                    /* @__PURE__ */ u$1("span", { children: "前" })
                  ] }),
                  /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "4px" }, children: [
                    /* @__PURE__ */ u$1(
                      "input",
                      {
                        type: "radio",
                        name: "ptp_name_location",
                        value: "1",
                        checked: settings.ptpNameLocation !== 0,
                        onChange: () => setSettings({ ...settings, ptpNameLocation: 1 })
                      }
                    ),
                    /* @__PURE__ */ u$1("span", { children: "后" })
                  ] })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!settings.hdbShowDouban,
                      onChange: () => setSettings({ ...settings, hdbShowDouban: !settings.hdbShowDouban })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "HDB 中文豆瓣信息" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!settings.hdbHideDouban,
                      onChange: () => setSettings({ ...settings, hdbHideDouban: !settings.hdbHideDouban })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "HDB 豆瓣信息默认折叠" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", marginTop: "10px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!settings.showQuickSearchOnDouban,
                      onChange: () => setSettings({ ...settings, showQuickSearchOnDouban: !settings.showQuickSearchOnDouban })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "豆瓣页面快速搜索/工具" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!settings.showQuickSearchOnImdb,
                      onChange: () => setSettings({ ...settings, showQuickSearchOnImdb: !settings.showQuickSearchOnImdb })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "IMDb 页面快速搜索/工具" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: !!settings.enableRemoteSidebar,
                      onChange: () => setSettings({ ...settings, enableRemoteSidebar: !settings.enableRemoteSidebar })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "启用远程推送侧边栏" })
                ] }),
                /* @__PURE__ */ u$1("div", { style: { marginTop: "8px", fontSize: "12px", color: "#666" }, children: "远程推送 JSON 配置：" }),
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "file",
                    accept: ".json,application/json",
                    onChange: (e2) => {
                      var _a;
                      const file = (_a = e2.currentTarget.files) == null ? void 0 : _a[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        var _a2;
                        try {
                          const json = JSON.parse(String(((_a2 = evt.target) == null ? void 0 : _a2.result) || "{}"));
                          setSettings({ ...settings, remoteServer: json });
                          alert("远程服务器配置已加载");
                        } catch (err) {
                          alert("JSON 解析失败，请检查格式");
                        }
                      };
                      reader.readAsText(file);
                    }
                  }
                ),
                settings.remoteServer && /* @__PURE__ */ u$1("pre", { style: { marginTop: "8px", padding: "8px", background: "#fff", border: "1px solid #ddd", borderRadius: "4px", maxHeight: "150px", overflow: "auto" }, children: JSON.stringify(settings.remoteServer, null, 2) })
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "6px", background: "#fafafa" }, children: [
                /* @__PURE__ */ u$1("div", { style: { fontWeight: "bold", marginBottom: "8px" }, children: "外站信息获取" }),
                /* @__PURE__ */ u$1("div", { style: { marginBottom: "6px", color: "#666" }, children: "选择 IMDb 到豆瓣 ID 的获取方式" }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "radio",
                      name: "imdb2douban_method",
                      value: "0",
                      checked: settings.imdbToDoubanMethod === 0,
                      onChange: () => setSettings({ ...settings, imdbToDoubanMethod: 0 })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "豆瓣 API" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "radio",
                      name: "imdb2douban_method",
                      value: "1",
                      checked: settings.imdbToDoubanMethod === 1,
                      onChange: () => setSettings({ ...settings, imdbToDoubanMethod: 1 })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "豆瓣爬取" })
                ] }),
                /* @__PURE__ */ u$1("div", { style: { marginTop: "10px", marginBottom: "6px", color: "#666" }, children: "选择 PTGen 的 API 节点" }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "radio",
                      name: "ptgen_api",
                      value: "0",
                      checked: settings.ptgenApi === 0,
                      onChange: () => setSettings({ ...settings, ptgenApi: 0 })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "api.iyuu.cn" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "radio",
                      name: "ptgen_api",
                      value: "1",
                      checked: settings.ptgenApi === 1,
                      onChange: () => setSettings({ ...settings, ptgenApi: 1 })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "ptgen" })
                ] }),
                /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "radio",
                      name: "ptgen_api",
                      value: "3",
                      checked: settings.ptgenApi === 3,
                      onChange: () => setSettings({ ...settings, ptgenApi: 3 })
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { children: "豆瓣页面爬取" })
                ] })
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginBottom: "15px", padding: "10px", border: "1px solid #eee", borderRadius: "6px", background: "#fafafa" }, children: [
                /* @__PURE__ */ u$1("div", { style: { fontWeight: "bold", marginBottom: "8px" }, children: "快速搜索站点设置" }),
                /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }, children: [
                  /* @__PURE__ */ u$1(
                    "select",
                    {
                      style: { flex: 1, padding: "6px", border: "1px solid #ced4da", borderRadius: "4px" },
                      value: quickPreset,
                      onChange: (e2) => setQuickPreset(e2.currentTarget.value),
                      children: quickSearchPresets.map((line) => /* @__PURE__ */ u$1("option", { value: line, children: getQuickSearchPresetLabel(line) }, line))
                    }
                  ),
                  /* @__PURE__ */ u$1(
                    "button",
                    {
                      onClick: () => {
                        if (!quickPreset) return;
                        const set = new Set(settings.quickSearchList || []);
                        set.add(quickPreset);
                        setSettings({ ...settings, quickSearchList: Array.from(set) });
                      },
                      style: { padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", background: "#f5f5f5" },
                      children: "新增"
                    }
                  )
                ] }),
                /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "text",
                      placeholder: "自定义模板（支持 <a href=...> 或 Name|URL）",
                      style: { flex: 1, padding: "6px", border: "1px solid #ced4da", borderRadius: "4px" },
                      value: quickPresetInput,
                      onInput: (e2) => setQuickPresetInput(e2.currentTarget.value)
                    }
                  ),
                  /* @__PURE__ */ u$1(
                    "button",
                    {
                      onClick: () => {
                        const value = quickPresetInput.trim();
                        if (!value) return;
                        const set = new Set(settings.quickSearchPresets || []);
                        set.add(value);
                        setSettings({ ...settings, quickSearchPresets: Array.from(set) });
                        setQuickPresetInput("");
                      },
                      style: { padding: "6px 10px", border: "1px solid #ddd", borderRadius: "4px", cursor: "pointer", background: "#f5f5f5" },
                      children: "加入下拉框"
                    }
                  )
                ] }),
                /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }, children: [
                  /* @__PURE__ */ u$1("label", { style: { color: "#666" }, children: "输入框高度(px)" }),
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "number",
                      min: 120,
                      max: 600,
                      style: { width: "120px", padding: "6px", border: "1px solid #ced4da", borderRadius: "4px" },
                      value: settings.quickSearchTextareaHeight || 220,
                      onInput: (e2) => {
                        const value = parseInt(e2.currentTarget.value, 10);
                        setSettings({ ...settings, quickSearchTextareaHeight: Number.isFinite(value) ? value : 220 });
                      }
                    }
                  )
                ] }),
                /* @__PURE__ */ u$1(
                  "textarea",
                  {
                    style: {
                      width: "100%",
                      height: `${settings.quickSearchTextareaHeight || 220}px`,
                      padding: "8px",
                      border: "1px solid #ced4da",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                      fontSize: "12px"
                    },
                    value: (settings.quickSearchList || []).join("\n"),
                    onInput: (e2) => {
                      const lines = e2.currentTarget.value.split("\n").map((line) => line.trim()).filter(Boolean);
                      setSettings({ ...settings, quickSearchList: lines });
                    }
                  }
                ),
                /* @__PURE__ */ u$1("div", { style: { marginTop: "6px", fontSize: "12px", color: "#666" }, children: [
                  "每行一个模板，支持占位符：",
                  " ",
                  /* @__PURE__ */ u$1("code", { children: "{imdbid}" }),
                  " ",
                  /* @__PURE__ */ u$1("code", { children: "{imdbno}" }),
                  " ",
                  /* @__PURE__ */ u$1("code", { children: "{search_name}" }),
                  " ",
                  /* @__PURE__ */ u$1("code", { children: "{title}" }),
                  " ",
                  /* @__PURE__ */ u$1("code", { children: "{doubanid}" })
                ] })
              ] }),
              /* @__PURE__ */ u$1(
                "button",
                {
                  onClick: handleSaveSettings,
                  style: {
                    padding: "10px 20px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  },
                  children: "Save Settings"
                }
              )
            ] }),
            activeTab === "sites" && /* @__PURE__ */ u$1("div", { children: [
              /* @__PURE__ */ u$1("div", { style: { display: "flex", justifyContent: "space-between", marginBottom: "15px" }, children: [
                /* @__PURE__ */ u$1("h3", { children: "转发站点设置" }),
                /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "8px" }, children: [
                  /* @__PURE__ */ u$1("button", { onClick: selectAllSites, style: { padding: "5px 10px", background: "#28a745", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }, children: "全选" }),
                  /* @__PURE__ */ u$1("button", { onClick: clearAllSites, style: { padding: "5px 10px", background: "#6c757d", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }, children: "取消全选" })
                ] })
              ] }),
              /* @__PURE__ */ u$1("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, minmax(120px, 1fr))", gap: "8px", padding: "10px", border: "1px solid #eee", borderRadius: "6px", background: "#fafafa" }, children: allSites.map((site) => /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }, children: [
                /* @__PURE__ */ u$1(
                  "input",
                  {
                    type: "checkbox",
                    checked: (settings.enabledSites || []).includes(site.name),
                    onChange: () => toggleSite(site.name)
                  }
                ),
                /* @__PURE__ */ u$1("span", { title: site.description || "", children: site.name })
              ] }, site.name)) }),
              /* @__PURE__ */ u$1("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ u$1(
                "button",
                {
                  onClick: handleSaveSettings,
                  style: {
                    padding: "10px 20px",
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer"
                  },
                  children: "Save Sites"
                }
              ) }),
              /* @__PURE__ */ u$1("div", { style: { marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }, children: [
                /* @__PURE__ */ u$1("h3", { style: { marginBottom: "12px" }, children: "常用站点设置" }),
                /* @__PURE__ */ u$1("div", { style: { display: "grid", gridTemplateColumns: "repeat(6, minmax(120px, 1fr))", gap: "8px", padding: "10px", border: "1px solid #eee", borderRadius: "6px", background: "#fafafa" }, children: allSites.map((site) => /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px", fontSize: "13px" }, children: [
                  /* @__PURE__ */ u$1(
                    "input",
                    {
                      type: "checkbox",
                      checked: (settings.favoriteSites || []).includes(site.name),
                      onChange: () => toggleFavoriteSite(site.name)
                    }
                  ),
                  /* @__PURE__ */ u$1("span", { title: site.description || "", children: site.name })
                ] }, `fav-${site.name}`)) }),
                /* @__PURE__ */ u$1("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ u$1(
                  "button",
                  {
                    onClick: handleSaveSettings,
                    style: {
                      padding: "10px 20px",
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    },
                    children: "Save Favorites"
                  }
                ) })
              ] }),
              /* @__PURE__ */ u$1("div", { style: { marginTop: "30px", borderTop: "1px solid #eee", paddingTop: "20px" }, children: [
                /* @__PURE__ */ u$1("h3", { style: { marginBottom: "12px" }, children: "是否在种子列表页显示快速搜索" }),
                /* @__PURE__ */ u$1("div", { style: { display: "flex", gap: "12px", flexWrap: "wrap" }, children: ["PTP", "HDB", "HDT", "UHD"].map((key) => {
                  var _a;
                  return /* @__PURE__ */ u$1("label", { style: { display: "flex", alignItems: "center", gap: "6px" }, children: [
                    /* @__PURE__ */ u$1(
                      "input",
                      {
                        type: "checkbox",
                        checked: !!((_a = settings.showSearchOnList) == null ? void 0 : _a[key]),
                        onChange: () => {
                          var _a2;
                          return setSettings({
                            ...settings,
                            showSearchOnList: {
                              ...settings.showSearchOnList,
                              [key]: !((_a2 = settings.showSearchOnList) == null ? void 0 : _a2[key])
                            }
                          });
                        }
                      }
                    ),
                    /* @__PURE__ */ u$1("span", { children: key })
                  ] }, key);
                }) }),
                /* @__PURE__ */ u$1("div", { style: { marginTop: "20px" }, children: /* @__PURE__ */ u$1(
                  "button",
                  {
                    onClick: handleSaveSettings,
                    style: {
                      padding: "10px 20px",
                      background: "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer"
                    },
                    children: "Save Search Toggles"
                  }
                ) })
              ] })
            ] }),
            activeTab === "logs" && /* @__PURE__ */ u$1("div", { children: /* @__PURE__ */ u$1("p", { children: "Logs placeholder..." }) })
          ] })
        ] }) });
      };
      function mountUI() {
        const host = document.createElement("div");
        host.id = "auto-feed-overlay-host";
        document.body.appendChild(host);
        const shadow = host.attachShadow({ mode: "open" });
        const container = document.createElement("div");
        shadow.appendChild(container);
        G(/* @__PURE__ */ u$1(App, {}), container);
      }
      $$1.fn.wait = function(func, times, interval) {
        let _times = times || 100;
        const _interval = interval || 20;
        let _self = this;
        const _selector = this.selector;
        let _iIntervalID;
        if (this.length) {
          func && func.call(this);
        } else {
          _iIntervalID = window.setInterval(() => {
            if (!_times) {
              if (_iIntervalID) window.clearInterval(_iIntervalID);
            }
            _times <= 0 || _times--;
            _self = $$1(_selector);
            if (_self.length) {
              func && func.call(_self);
              if (_iIntervalID) window.clearInterval(_iIntervalID);
            }
          }, _interval);
        }
        return this;
      };
      window.$ = window.jQuery = $$1;
      (async function() {
        console.log("[Auto-Feed] v3.1.5 initializing...");
        mountUI();
        const manager = new SiteManager();
        await manager.run();
      })();

    })
  };
}));

System.register("./TorrentService-DBpL5kU2-DokdCOJA.js", ['./__monkey.entry-pxiUrdlY.js', 'jquery'], (function (exports, module) {
  'use strict';
  var GMAdapter;
  return {
    setters: [module => {
      GMAdapter = module.G;
    }, null],
    execute: (function () {

      var __defProp = Object.defineProperty;
      var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
      var __publicField = (obj, key, value) => __defNormalProp(obj, key + "" , value);
      class TorrentService {
        /**
         * Downloads a torrent file from a URL and converts it to a Base64 string.
         * @param url The URL of the torrent file.
         * @returns Promise resolving to the Base64 string of the file content.
         */
        static async download(url, progressCallback) {
          return new Promise((resolve, reject) => {
            GMAdapter.xmlHttpRequest({
              method: "GET",
              url,
              responseType: "blob",
              onprogress: (e) => {
                if (e.lengthComputable && progressCallback) {
                  const percent = Math.round(e.loaded / e.total * 100);
                  progressCallback(percent);
                }
              },
              onload: (response) => {
                if (response.status >= 200 && response.status < 300) {
                  const blob = response.response;
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64data = reader.result;
                    resolve(base64data);
                  };
                  reader.onerror = () => reject(new Error("Failed to read blob as Base64"));
                  reader.readAsDataURL(blob);
                } else {
                  reject(new Error(`Failed to download torrent. Status: ${response.status}`));
                }
              },
              onerror: (err) => reject(new Error(`Network error downloading torrent: ${err}`)),
              ontimeout: () => reject(new Error("Timeout downloading torrent"))
            });
          });
        }
        /**
         * Converts a Base64 string back to a File object.
         * @param base64 The Base64 string (including data URI scheme).
         * @param filename The filename for the File object.
         * @returns File object ready for form injection.
         */
        static base64ToFile(base64, filename) {
          const arr = base64.split(",");
          const mimeMatch = arr[0].match(/:(.*?);/);
          const mime = mimeMatch ? mimeMatch[1] : "application/x-bittorrent";
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
          }
          return new File([u8arr], filename, { type: mime });
        }
        /**
         * Injects a File object into a file input element.
         * @param fileInput The file input DOM element.
         * @param file The File object to inject.
         */
        static injectFileIntoInput(fileInput, file) {
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          fileInput.files = dataTransfer.files;
          const changeEvent = new Event("change", { bubbles: true });
          fileInput.dispatchEvent(changeEvent);
          const inputEvent = new Event("input", { bubbles: true });
          fileInput.dispatchEvent(inputEvent);
        }
        /**
         * Download torrent as binary string (for tracker cleaning / rebuild).
         */
        static async downloadBinaryString(url) {
          const response = await GMAdapter.xmlHttpRequest({
            method: "GET",
            url,
            overrideMimeType: "text/plain; charset=x-user-defined"
          });
          const text = response && (response.responseText || response.response);
          if (!text) throw new Error("Empty torrent response");
          return text;
        }
        static base64ToBinaryString(base64DataUrl) {
          const raw = base64DataUrl.includes(",") ? base64DataUrl.split(",")[1] : base64DataUrl;
          return atob(raw);
        }
        static binaryStringToFile(binary, filename) {
          const data = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
          return new File([data], filename, { type: "application/x-bittorrent" });
        }
        static normalizeTorrentName(name) {
          return name.replace(/[\\/:*?"<>|]/g, "").replace(/^\[.*?\](\.| )?/, "").replace(/|™/g, "").replace(/ /g, ".").replace(/\.-\./g, "-").replace(/\.\.+/g, ".").trim();
        }
        static extractTorrentName(binary) {
          const match = binary.match(/4:name(\d+):/);
          if (!match || match.index === void 0) return null;
          const length = parseInt(match[1], 10);
          if (!Number.isFinite(length) || length <= 0) return null;
          const start = match.index + match[0].length;
          return binary.substr(start, length) || null;
        }
        static rebuildTorrentBinary(binary, forwardSite, forwardAnnounce) {
          var _a;
          if (!forwardSite || forwardSite === "hdb-task") return { binary };
          if (binary.match(/value="firsttime"/)) {
            throw new Error("种子下载失败：请先在源站手动下载一次。");
          }
          if (binary.match(/Request frequency limit/)) {
            throw new Error("种子下载频率过快，请稍后再试。");
          }
          let name = "";
          if (binary.match(
            /8:announce\d+:.*(please\.passthepopcorn\.me|blutopia\.cc|beyond-hd\.me|eiga\.moi|hd-olimpo\.club|secret-cinema\.pw|monikadesign\.uk)/
          )) {
            const extracted = this.extractTorrentName(binary);
            if (extracted) name = extracted;
          }
          let announce = (forwardAnnounce || "").trim();
          if (!announce) announce = this.DEFAULT_ANNOUNCE;
          const announceMatch = announce.match(/https?:\/\/[^\s"'<>]+/);
          if (announceMatch) announce = announceMatch[0];
          if (!binary.match(/8:announce\d+:/)) {
            return { binary, name: name || void 0 };
          }
          let newTorrent = "d";
          newTorrent += `8:announce${announce.length}:${announce}`;
          if (binary.match(/13:creation date/)) {
            try {
              const date = (_a = binary.match(/13:creation datei(\d+)e/)) == null ? void 0 : _a[1];
              if (date) {
                const newDate = parseInt(date, 10) + 600 + Math.floor(Math.random() * 600);
                newTorrent += `13:creation datei${newDate.toString()}e`;
              }
            } catch {
            }
          }
          newTorrent += "8:encoding5:UTF-8";
          let info = "";
          let endToken = "ee";
          const infoPrivate = binary.match(/4:info[\s\S]*?privatei\de/);
          if (infoPrivate) {
            info = infoPrivate[0].replace("privatei0e", "privatei1e");
          } else {
            const infoAny = binary.match(/4:info[\s\S]*?e/);
            if (infoAny) {
              info = infoAny[0];
              endToken = "e";
            }
          }
          if (!info) return { binary, name: name || void 0 };
          newTorrent += info;
          const source = `6:source${forwardSite.length}:${forwardSite.toUpperCase()}`;
          newTorrent += source;
          newTorrent += endToken;
          return { binary: newTorrent, name: name || void 0 };
        }
        static async buildForwardTorrentFile(meta, forwardSite, forwardAnnounce) {
          let binary = "";
          if (meta.torrentUrl) {
            if (meta.torrentUrl.match(/d8:announce/)) {
              binary = meta.torrentUrl;
            } else {
              binary = await this.downloadBinaryString(meta.torrentUrl);
            }
          } else if (meta.torrentBase64) {
            binary = this.base64ToBinaryString(meta.torrentBase64);
          }
          if (!binary) return null;
          const rebuilt = this.rebuildTorrentBinary(binary, forwardSite, forwardAnnounce);
          const rawNameFromTorrent = rebuilt.name || "";
          const normalizedNameFromTorrent = rawNameFromTorrent ? this.normalizeTorrentName(rawNameFromTorrent) : "";
          let filename = meta.torrentFilename || meta.title || "autofeed";
          filename = this.normalizeTorrentName(filename) || "autofeed";
          if (normalizedNameFromTorrent) filename = normalizedNameFromTorrent;
          if (!filename.endsWith(".torrent")) filename += ".torrent";
          const file = this.binaryStringToFile(rebuilt.binary, filename);
          return { file, filename, nameFromTorrent: rawNameFromTorrent || void 0 };
        }
        static injectTorrentForSite(forwardSite, file, filename) {
          const makeTransfer = () => {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            return dataTransfer.files;
          };
          if (forwardSite === "MTeam") {
            const input = document.getElementById("torrent-input");
            if (!input) return false;
            const lastValue = input.value;
            input.files = makeTransfer();
            const tracker = input._valueTracker;
            if (tracker) tracker.setValue(lastValue);
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
            if (filename) {
              const buttons = Array.from(document.querySelectorAll("button"));
              const labelBtn = buttons.find((b) => (b.textContent || "").includes("選擇種子") || (b.textContent || "").includes("选择种子"));
              if (labelBtn && labelBtn.nextElementSibling && labelBtn.nextElementSibling.nextElementSibling) {
                labelBtn.nextElementSibling.nextElementSibling.textContent = filename;
              }
            }
            return true;
          }
          if (forwardSite === "CHDBits") {
            const input = document.querySelector('input[name="torrentfile"]');
            if (input) {
              this.injectFileIntoInput(input, file);
              return true;
            }
          }
          if (forwardSite === "PTP") {
            const input = document.querySelector('input[name="file_input"]');
            if (input) {
              input.files = makeTransfer();
              input.dispatchEvent(new Event("change", { bubbles: true }));
              const fileEl = document.getElementById("file");
              if (fileEl) fileEl.dispatchEvent(new Event("change", { bubbles: true }));
              return true;
            }
          }
          if (forwardSite === "HDB") {
            const input = document.querySelector('input[name="file"]');
            if (input) {
              this.injectFileIntoInput(input, file);
              return true;
            }
          }
          if (forwardSite === "BHD") {
            const input = document.querySelector('input#torrent, input[name="torrent"]');
            if (input) {
              this.injectFileIntoInput(input, file);
              return true;
            }
          }
          const fallback = document.querySelector('input[type="file"]');
          if (fallback) {
            this.injectFileIntoInput(fallback, file);
            return true;
          }
          return false;
        }
      } exports("TorrentService", TorrentService);
      __publicField(TorrentService, "DEFAULT_ANNOUNCE", "https://hudbt.hust.edu.cn/announce.php");

    })
  };
}));

System.register("./normalize-BJd7VxQT-BU6-wKi2.js", ['./__monkey.entry-pxiUrdlY.js', 'jquery'], (function (exports, module) {
  'use strict';
  var dealWithTitle, dealWithSubtitle, getSmallDescrFromDescr, getSourceSelFromDescr, getMediumSel, getCodecSel, getAudioCodecSel, getStandardSel, getMediainfoPictureFromDescr, addThanks, getType;
  return {
    setters: [module => {
      dealWithTitle = module.d;
      dealWithSubtitle = module.a;
      getSmallDescrFromDescr = module.g;
      getSourceSelFromDescr = module.b;
      getMediumSel = module.c;
      getCodecSel = module.e;
      getAudioCodecSel = module.f;
      getStandardSel = module.h;
      getMediainfoPictureFromDescr = module.i;
      addThanks = module.j;
      getType = module.k;
    }, null],
    execute: (function () {

      exports("normalizeMeta", normalizeMeta);

      function normalizeMeta(meta, forwardSite) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
        const out = { ...meta };
        let descr = out.description || "";
        descr = descr.replace(/%3A/g, ":").replace(/%2F/g, "/");
        descr = descr.replace("[quote][/quote]", "").replace("[b][/b]", "").replace(/\n\n+/, "\n\n");
        descr = descr.replace(
          "https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png",
          "https://img93.pixhost.to/images/86/435614074_c5134549f13c2c087d67c9fa4089c49e-removebg-preview.png"
        );
        descr = descr.replace(/引用.{0,5}\n/g, "");
        descr = descr.replace(/.*ARDTU.*/g, "");
        if (out.title) {
          out.title = dealWithTitle(out.title);
        }
        if (out.subtitle) {
          out.subtitle = dealWithSubtitle(out.subtitle);
        }
        if (out.smallDescr) {
          out.smallDescr = dealWithSubtitle(out.smallDescr);
        }
        if (!out.smallDescr) {
          out.smallDescr = getSmallDescrFromDescr(descr, out.title || "");
          if (!out.subtitle) out.subtitle = out.smallDescr;
        }
        if (out.type === "电影") {
          if (descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}纪录片/i)) out.type = "纪录";
          if (descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}动画/i)) out.type = "动漫";
        }
        if (!out.imdbUrl && descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)) {
          out.imdbUrl = ((_a = descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)) == null ? void 0 : _a[0]) + "/";
          out.imdbId = (_c = (_b = out.imdbUrl) == null ? void 0 : _b.match(/tt\d+/)) == null ? void 0 : _c[0];
        }
        if (!out.doubanUrl && descr.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)) {
          out.doubanUrl = ((_d = descr.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)) == null ? void 0 : _d[0]) + "/";
          out.doubanId = (_f = (_e = out.doubanUrl) == null ? void 0 : _e.match(/subject\/(\d+)/)) == null ? void 0 : _f[1];
        }
        if (out.tracklist) {
          out.tracklist = out.tracklist.replace(/\t/g, "");
        }
        if (out.imdbUrl) {
          out.imdbUrl = out.imdbUrl.split("?").pop();
        }
        if (!out.sourceSel || out.sourceSel.match(/(港台|日韩)/)) {
          const region = getSourceSelFromDescr(descr);
          if ((_g = out.sourceSel) == null ? void 0 : _g.match(/(港台|日韩)/)) {
            if (out.sourceSel === "港台") {
              out.sourceSel = region === "台湾" ? "台湾" : "香港";
            } else if (out.sourceSel === "日韩") {
              out.sourceSel = region === "日本" ? "日本" : "韩国";
            }
          }
          if (region && !out.sourceSel) out.sourceSel = region;
        }
        if (!out.mediumSel) {
          out.mediumSel = getMediumSel(out.title || "", out.title);
          if (!out.mediumSel && descr.match(/mpls/i)) out.mediumSel = "Blu-ray";
          if (out.type === "音乐" && out.musicMedia) out.mediumSel = out.musicMedia;
        }
        if (out.mediumSel === "Blu-ray" && ((out.title || "").match(/UHD|2160P/i) || descr.match(/2160p/))) {
          out.mediumSel = "UHD";
        }
        if (!out.codecSel) {
          out.codecSel = getCodecSel(out.title || "");
        }
        if (!out.audioCodecSel) {
          out.audioCodecSel = getAudioCodecSel(out.title || "");
          if (!out.audioCodecSel) out.audioCodecSel = getAudioCodecSel(descr);
        }
        if (!out.standardSel) {
          out.standardSel = getStandardSel(out.title || "");
        }
        if (!out.standardSel) {
          try {
            const height = (_h = descr.match(/Height.*?:(.*?)pixels/i)) == null ? void 0 : _h[1].trim();
            if (height === "480" || height === "576") out.standardSel = "SD";
            else if (height === "720") out.standardSel = "720p";
            else if (height === "1 080") {
              out.standardSel = "1080p";
              if (descr.match(/Scan.*?type.*?(Interleaved|Interlaced)/i)) out.standardSel = "1080i";
            } else if (height === "2 160") {
              out.standardSel = "4K";
            }
          } catch {
            if (descr.match(/(1080|2160)p/)) {
              out.standardSel = (_i = descr.match(/(1080|2160)p/)) == null ? void 0 : _i[0].replace("2160p", "4K");
            }
          }
        }
        if (out.standardSel === "1080p") {
          if (getStandardSel(out.title || "") === "1080i") {
            out.standardSel = "1080i";
          } else {
            try {
              const mi = getMediainfoPictureFromDescr(descr, { mediumSel: out.mediumSel }).mediainfo;
              if (mi.match(/1080i|Scan.*?type.*?(Interleaved|Interlaced)/)) {
                out.standardSel = "1080i";
              }
            } catch {
            }
          }
        }
        if ((out.title || "").match(/Remux/i)) out.mediumSel = "Remux";
        if ((out.title || "").match(/webrip/i)) out.mediumSel = "WEB-DL";
        if (out.editionInfo) {
          const editionMedium = getMediumSel(out.editionInfo, out.title);
          if (editionMedium) {
            if (editionMedium !== "Blu-ray" || descr.match(/mpls/i)) out.mediumSel = editionMedium;
            else if (editionMedium === "Blu-ray" && out.editionInfo.match(/mkv/i)) out.mediumSel = "Encode";
          }
        }
        if (out.codecSel === "H265" && (out.title || "").match(/x265/i)) {
          out.codecSel = "X265";
        }
        if (out.audioCodecSel === "TrueHD" && descr.match(/Atmos/)) {
          out.audioCodecSel = "Atmos";
        }
        descr = descr.replace(/\n\n+/g, "\n\n").replace("https://dbimg.audiences.me/?", "").replace("https://imgproxy.pterclub.net/douban/?t=", "").replace("https://imgproxy.tju.pt/?url=", "");
        if (out.editionInfo) {
          const editionCodec = getCodecSel(out.editionInfo);
          if (editionCodec) out.codecSel = editionCodec;
        }
        if (!out.codecSel || forwardSite === "PTer") {
          if (descr.match(/Writing library.*(x264|x265)/)) {
            out.codecSel = (_j = descr.match(/Writing library.*(x264|x265)/)) == null ? void 0 : _j[1].toUpperCase();
            if ((out.title || "").match(/H.?26[45]/)) {
              out.title = out.title.replace(/H.?26[45]/i, ((_k = out.codecSel) == null ? void 0 : _k.toLowerCase()) || "");
            }
          } else if (descr.match(/Video[\s\S]*?Format.*?HEVC/i)) {
            out.codecSel = "H265";
          } else if (descr.match(/Video[\s\S]*?Format.*?AVC/i)) {
            out.codecSel = "H264";
          } else if (descr.match(/XviD/i)) {
            out.codecSel = "XVID";
          } else if (descr.match(/DivX/i)) {
            out.codecSel = "DIVX";
          } else if (descr.match(/Video[\s\S]*?Format.*?MPEG Video[\s\S]{1,10}Format Version.*?Version 4/i)) {
            out.codecSel = "MPEG-4";
          } else if (descr.match(/Video[\s\S]*?Format.*?MPEG Video[\s\S]{1,10}Format Version.*?Version 2/i)) {
            out.codecSel = "MPEG-2";
          }
        }
        if (descr.match(/Writing library.*(x264|x265)/)) {
          out.codecSel = (_l = descr.match(/Writing library.*(x264|x265)/)) == null ? void 0 : _l[1].toUpperCase();
        }
        if ((out.title || "").match(/dvdrip/i)) out.mediumSel = "DVD";
        if (out.originSite === "OurBits") {
          descr = descr.replace(/\[quote\]\n/g, "[quote]");
        }
        try {
          if (((_m = descr.match(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g)) == null ? void 0 : _m.length) && (((_n = descr.match(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g)) == null ? void 0 : _n.length) || 0) >= 2) {
            descr = descr.split(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g).pop() || descr;
            descr = addThanks(descr, out.title || "");
          }
        } catch {
        }
        descr = descr.trim();
        out.description = descr;
        if (!out.type && out.title) out.type = getType(out.title);
        return out;
      }

    })
  };
}));

System.register("./MetaCleaner-DjxRUcpo-D812m1vh.js", [], (function (exports, module) {
  'use strict';
  return {
    execute: (function () {

      class MetaCleaner {
        /**
         * Cleaning rules:
         * 1. Remove [url] wrapping images (often points to image hosts or tracking)
         * 2. Remove "Transferred by", "Thanks", "Staff" footprints
         * 3. Remove tracker announce URLs if found
         * 4. Standardize spacing
         */
        static clean(meta) {
          let desc = meta.description || "";
          desc = desc.replace(/\[url=[^\]]+\](\[img\].*?\[\/img\])\[\/url\]/gi, "$1");
          desc = desc.replace(/\[url\](\[img\].*?\[\/img\])\[\/url\]/gi, "$1");
          const footprints = [
            /Transferred by.*?/gi,
            /Uploaded by.*?/gi,
            /Reposted from.*?/gi,
            /\[quote\].*?Internal.*?\[\/quote\]/gis,
            // Remove internal quotes sometimes
            /This torrent was uploaded by.*/gi,
            /Originally uploaded by.*/gi
          ];
          footprints.forEach((regex) => {
            desc = desc.replace(regex, "");
          });
          desc = desc.replace(/\[quote\]Thanks to.*?\[\/quote\]/gis, "");
          desc = desc.replace(/\[quote\]\s*\[\/quote\]/g, "");
          desc = desc.replace(/\n\s*\n\s*\n/g, "\n\n");
          return {
            ...meta,
            description: desc.trim()
          };
        }
      } exports("MetaCleaner", MetaCleaner);

    })
  };
}));

System.import("./__entry.js", "./");