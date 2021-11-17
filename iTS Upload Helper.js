// ==UserScript==
// @name         iTS Upload Helper
// @namespace    http://tampermonkey.net/
// @version      1.33
// @description  Upload Helper for iTS
// @author       Shix
// @match        https://shadowthein.net/upload.php*
// @match        http://shadowthein.net/upload.php*
// @require      https://gist.github.com/po5/3fc587478a6b2cdb32e403e8a1b0198b/raw/mediainfo.js
// @icon         https://shadowthein.net/favicon.ico
// @connect      omdbapi.com
// @connect      themoviedb.org
// @connect      ptpimg.me
// @connect      imgbb.com
// @connect      imdb.com
// @connect      rottentomatoes.com
// @connect      metacritic.com
// @connect      criterion.com
// @connect      eurekavideo.co.uk
// @grant        GM.xmlHttpRequest
// @grant        GM.getValue
// @grant        GM.setValue
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

// ------------------------------------------------------ User Editable Fields --------------------------------------------------
// OPTIONAL: You can enter your api keys here.
var TMDB_API_KEY = "";
var OMDB_API_KEY = "";
var IMGBB_API_KEY = "";
var PTPIMG_API_KEY = "";

// values can be "final" or "f" for the final template. "compact" or "c" for the compact template or "" for normal
var TEMPLATE_VERSION = "f";

// ------------------------------------------------------ End of User Editable Fields --------------------------------------------------

// ------------------------------------------------------ Do Not Edit Below (Unless you know what you are doing) --------------------------------------------------

// MediaInfo File Parser Variables
var CHUNK_SIZE = 5 * 1024 * 1024;
var miLib, mi;
var processing = false;
miLib = MediaInfo(function () {
  mi = new miLib.MediaInfo();
});

var media = new MediaDetails();

let Utilities = {
  imgbb_key: IMGBB_API_KEY || "48e419e43be3bffe7504554dbe7f604e",
  ptpimg_key: PTPIMG_API_KEY || "",
  capitalize: function (text) {
    return text.replace(/(?:^|\s)\S/g, function (a) {
      return a.toUpperCase();
    });
  },
  /**
       * Fetches a json object from a url
       *
       * @param {string} url A Url that returns a Json
       * @param {object} options fetch options
       * @return {Promise} A Json object
       */
  fetchJson: async (url, options = {}) => {
    const resp = await fetch(url, options);
    if (!resp.ok) {
      throw Error(
        `Error: Fetching data from ${url} resulted in ${resp.status} - ${resp.statusText}`
      );
    }
    const data = await resp.json();
    return data;
  },
  simpleRExtractor: {
    extractReleaseGroup: (name) => {
      try {
        const reTrimEnd = /[.\-\s]$/gi;
        const reGroup = /.*-(?<release_group>[^\-.]*)$/gi;
        const {
          groups: { release_group },
        } = reGroup.exec(name.replace(reTrimEnd, ""));
        return release_group || "";
      } catch (error) {
        return "";
      }
    },
    extractResolution: (name) => {
      try {
        const reRes = /[._\-\s](?<res>(?:\d{3,4}[pi])|(?:pal|ntsc))[._\-\s]/gi;
        const {
          groups: { res },
        } = reRes.exec(name);
        return res || "";
      } catch (error) {
        return "";
      }
    },
    extractCriterion: (name) => {
      const reCriterion = /[._\-\s](criterion)[._\-\s]/gi;
      return reCriterion.test(name) ? "Criterion" : "";
    },
    extractRemux: (name) => {
      const reRemux = /[._\-\s](remux)[._\-\s]/gi;
      return reRemux.test(name) ? "Remux" : "";
    },
    extractSeason: (name) => {
      try {
        const reSeason = /[._\-\s](?<season>[se]\d{1,3}){1,2}[._\-\s]/gi;
        const {
          groups: { season },
        } = reSeason.exec(name);
        return season || "";
      } catch (error) {
        return "";
      }
    },
    extractEpisode: (name) => {
      try {
        const reEpisode = /[._\-\s](?:s\d{1,3})?(?<episode>e\d{1,3})[._\-\s]/gi;
        const {
          groups: { episode },
        } = reEpisode.exec(name);
        return episode || "";
      } catch (error) {
        return "";
      }
    },
  },
  /**
       * Returns an Object with info about the Image uploaded to Imgbb
       *
       * @param {string} imgUrl Image URL you want to upload
       * @return {{id: string,
       *           extension: string,
       *           mime: string,
       *           name: string,
       *           size: string,
       *           time: string,
       *           thumbnail_url: string,
       *           url: string}}
       */
  createimgbbImage: async function (imgUrl) {
    const apiKey = Utilities.imgbb_key || "";
    let url = `https://api.imgbb.com/1/upload?key=${apiKey}`;
    let form = new FormData();
    if (typeof imgUrl === "string" && imgUrl.startsWith("data:")) {
      imgUrl = imgUrl.split(",", 2)[1];
    }
    form.append("image", imgUrl);
    let options = {
      body: form,
      method: "POST",
      timeout: 5000,
      processData: false,
      mimeType: "multipart/form-data",
      contentType: false,
    };
    // let fill = (data) => {
    //     this.id = data.id;
    //     this.extension = data.image.extension;
    //     this.mime = data.image.mime;
    //     this.name = data.title;
    //     this.size = data.size;
    //     this.time = data.time;
    //     this.thumbnail_url = data.thumb.url;
    //     this.url = data.image.url
    // };

    let upload = async (imgUrl) => {
      let response = await Utilities.fetchJson(url, options)
      .then((r) => r.data)
      .catch((err) => console.log(err));
      // fill(response);
      return response;
    };
    let data = await upload(imgUrl);
    // console.log(data);
    if (typeof data === "undefined") return;
    return {
      id: data.id,
      extension: data.image.extension,
      mime: data.image.mime,
      name: data.title,
      size: data.size,
      time: data.time,
      thumbnail_url: data.thumb.url,
      url: data.image.url,
    };
  },
  createPtpImg: async function (imgUrl) {
    const apiKey = Utilities.ptpimg_key || "";
    let url = `https://ptpimg.me/upload.php`;
    let ptpHeaders = new Headers();
    ptpHeaders.append("Referer", "https://ptpimg.me/index.php");
    let form = new FormData();
    let imgKey = imgUrl instanceof File ? "file-upload" : "link-upload";
    if (typeof imgUrl === "string" && imgUrl.startsWith("data:")) {
      imgUrl = imgUrl.split(",", 2)[1];
    }
    let formdata = {
      api_key: apiKey,
    };
    formdata[imgKey] = imgUrl;
    // console.log(formdata);
    let resp = await Utilities.xhrQuery(url, "", "post", {}, formdata).then((r) =>
                                                                            JSON.parse(r.response)
                                                                           );
    return {
      id: resp[0].code,
      extension: resp[0].ext,
      url: `https://ptpimg.me/${resp[0].code}.${resp[0].ext}`,
    };
  },
  createImage: async function (imgUrl) {
    if (Utilities.ptpimg_key) {
      return await Utilities.createPtpImg(imgUrl);
    } else if (Utilities.imgbb_key) {
      return await Utilities.createimgbbImage(imgUrl);
    }
  },
  xhrQuery: function (baseUrl, path, method = "get", params = {}, data = {}) {
    let resolver;
    let rejecter;
    const p = new Promise((resolveFn, rejectFn) => {
      resolver = resolveFn;
      rejecter = rejectFn;
    });

    const formData = new FormData();
    for (const [key, value] of Object.entries(data)) {
      formData.append(key, value);
    }

    const paramStr = new URLSearchParams(params).toString();
    const obj = {
      method,
      timeout: 30000,
      onloadstart: () => {},
      onload: (result) => {
        if (result.status !== 200) {
          console.log("XHR Errored Result", result);
          rejecter(new Error("XHR failed"));
          return;
        }
        resolver(result);
      },
      onerror: (result) => {
        rejecter(result);
      },
      ontimeout: (result) => {
        rejecter(result);
      },
    };

    const final =
          method === "post"
    ? Object.assign({}, obj, {
      url: `${baseUrl}${path}${paramStr.length > 0 ? `?${paramStr}` : ""}`,
      data: formData,
    })
    : Object.assign({}, obj, {
      url: `${baseUrl}${path}${paramStr.length > 0 ? `?${paramStr}` : ""}`,
    });

    GM.xmlHttpRequest(final);

    return p;
  },
  parseHtmlString: function (htmlString, query, hasMultipleResults = false) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, "text/html");
    // const element = doc.querySelector(query);
    // return element;
    if (hasMultipleResults) {
      return doc.querySelectorAll(query);
    }
    return doc.querySelector(query);
  },
  htmlToElement: function (html) {
    let template = document.createElement('template');
    template.innerHTML = html.trim();
    return template.content;
  },
};

let BBCode = {
  Center: function (content) {
    return `[center]${content}[/center]`;
  },
  Hr: function () {
    return `[hr]`;
  },
  Bold: function (content) {
    if(!content) return "";
    return `[b]${content}[/b]`;
  },
  Italic: function (content) {
    return `[i]${content}[/i]`;
  },
  Underline: function (content) {
    return `[u]${content}[/u]`;
  },
  Strikethrough: function (content) {
    return `[s]${content}[/s]`;
  },
  Box: function (title, content) {
    return `[box${title ? "="+title : ""}]${content}[/box]`;
  },
  Size: function (size, content) {
    if (size < 1 || size > 7) return "";
    return `[size=${size}]${content}[/size]`;
  },
  Font: function (font, content) {
    return `[font=${font}]${content}[/font]`;
  },
  Color: function (color, content) {
    return `[color=${color}]${content}[/color]`;
  },
  Hide: function (content) {
    return `[hide]${content}[/hide]`;
  },
  Spoiler: function (content) {
    return `[spoiler]${content}[/spoiler]`;
  },
  Preformat: function (content) {
    return `[pre]${content}[/pre]`;
  },
  Img: function (imgUrl) {
    return `[img]${imgUrl}[/img]`;
  },
  Url: function (url, content) {
    return `[url=${url}]${content}[/url]`;
  },
  Quote: function (name, content) {
    return `[quote=${name}]${content}[/quote]`;
  },
  Youtube: function (ytUrl) {
    return `[youtube]${ytUrl}[/youtube]`;
  },
  Vimeo: function (vimUrl) {
    return `[vimeo]${vimUrl}[/vimeo]`;
  },
  List: function (items) {
    if (!Array.isArray(items)) return `[*] ${items}`;
    return items.map((i) => `[*] ${i}`).join("\n");
  },
};

let tmdb = {
  config: {
    api_key: TMDB_API_KEY || "843bcb3112cd960e28931bdf5e9e0329",
    url: "https://api.themoviedb.org/3/",
    image_url: "https://image.tmdb.org/t/p/original/",
    language: "en-US",
    timeout: 5000,
  },
  common: {
    find: async (id, source = "imdb") => {
      // external_source string Allowed Values: imdb_id, freebase_mid, freebase_id, tvdb_id, tvrage_id, facebook_id, twitter_id, instagram_id
      source = source.endsWith("_id") ? source : source + "_id";
      let options = {
        external_source: source,
      };
      let url = tmdb.common.generateUrl("find", id, options);
      return await Utilities.fetchJson(url);
    },
    /**
         * Gets the TMDB ID and type of content using other IDs
         *
         * @param {string} id IMDB ID
         * @param {string} source Source of the ID you are using
         * @returns {{tmdb_id: string, type: string}}
         */
    getTmdbIdAndType: async (id, source) => {
      let output = {
        tmdb_id: "",
        media_type: "",
      };
      let { movie_results, tv_results } = await tmdb.common.find(id, source);
      if ((await movie_results.length) > 0) {
        output.tmdb_id = movie_results[0].id.toString();
        output.media_type = "movie";
      } else if ((await tv_results.length) > 0) {
        output.tmdb_id = tv_results[0].id.toString();
        output.media_type = "tv";
      }
      return output;
    },
    generateUrl: (endpoint, id, options) => {
      return `${tmdb.config.url}${endpoint}/${id}${tmdb.common.generateQuery(options)}`;
    },
    generateQuery: (options) => {
      "use strict";
      let myOptions, query, option;

      myOptions = options || {};
      query = "?api_key=" + tmdb.config.api_key + "&language=" + tmdb.config.language;

      if (Object.keys(myOptions).length > 0) {
        for (option in myOptions) {
          if (myOptions.hasOwnProperty(option) && option !== "id" && option !== "body") {
            query = query + "&" + option + "=" + myOptions[option];
          }
        }
      }
      return query;
    },
  },
  movie: {
    getDetails: async (id, options) => {
      options = options || {
        append_to_response: "external_ids,credits,images,videos",
        include_image_language: "en,null",
      };
      let url = tmdb.common.generateUrl("movie", id, options);
      let result = {};
      try {
        result = await Utilities.fetchJson(url);
      } catch (err) {
        console.log("TMDB GetDetails", err);
      }
      return result;
    },
  },
  tv: {
    getDetails: async (id, options) => {
      options = options || {
        append_to_response: "external_ids,credits,images,videos",
        include_image_language: "en,null",
      };
      let url = tmdb.common.generateUrl("tv", id, options);
      let result = {};
      try {
        result = await Utilities.fetchJson(url);
      } catch (err) {
        console.log("TMDB GetDetails", err);
      }
      return result;
    },
  },
  getDetails: async (id, media_type, options) => {
    options = options || {
      append_to_response: "external_ids,credits,images,videos",
      include_image_language: "en,null",
    };
    let url = tmdb.common.generateUrl(media_type, id, options);
    let result = {};
    console.log(url);
    try {
      result = await Utilities.fetchJson(url);
    } catch (err) {
      console.log("TMDB GetDetails", err);
    }
    // console.log(result)
    return result;
  },
};
function getOmdbKey() {
  let keys = ["314cc4be", "2c5e0ae7", "3d37ff4d"];
  return keys[Math.floor(Math.random() * keys.length)];
}
let omdb = {
  config: {
    url: "https://www.omdbapi.com/",
    api_key: OMDB_API_KEY || getOmdbKey(),
  },
  getDetails: async (id) => {
    // console.log(omdb.config.api_key)
    const finalUrl = `${omdb.config.url}?apikey=${omdb.config.api_key}&i=${id}&plot=full&y&tomatoes=true&r=json`;
    return await Utilities.fetchJson(finalUrl);
  },
};

function MediaDetails() {
  const imdbUrl = "https://www.imdb.com/title/";
  const tmdbUrl = "https://www.themoviedb.org/";
  const tmdbImageUrl = "https://image.tmdb.org/t/p/original/";
  const youtubeUrl = "https://www.youtube.com/watch?v=";
  const vimeoUrl = "https://vimeo.com/";
  const infoTemplate = {
    imdb_id: "",
    tmdb_id: "",
    title: "",
    year: "",
    created_by: [],
    directors: [],
    in_production: false,
    genres: [],
    networks: [],
    overview: "",
    criterion_overview: "",
    original_title: "",
    original_language: "",
    origin_country: "",
    backdrop_url: "",
    poster_url: "",
    criterion_poster_url: "",
    criterion_spine: "",
    criterion_box_sets: [],
    moc_overview: "",
    moc_poster_url: "",
    moc_spine: "",
    moc_url: "",
    producers: "",
    production_companies: [],
    production_countries: [],
    rated: "",
    release_date: "",
    runtime: "",
    spoken_languages: [],
    status: "",
    imdb_rating: "",
    tmdb_rating: "",
    metacritic_rating: "",
    rt_rating: "",
    site_urls: {
      imdb: "",
      tmdb: "",
      metacritic: "",
      rotten_tomatoes: "",
      criterion: "",
    },
    ratings: {
      imdb: "",
      tmdb: "",
      metacritic: "",
      rotten_tomatoes: "",
      criterion: "",
      moc: "",
    },
    tagline: "",
    trailer_url: "",
    type: "",
    seasons: [],
    writers: [],
    input_source: "",
    media_type: "",
  };
  const torrentInfoTemplate = {
    name: "",
    resolution: "",
    season: "",
    criterion: "",
    remux: "",
    release_group: "",
    media_type: "",
  };
  let details = false;
  this.info = {};
  this.torrentInfo = {};
  this.mediaInfo = {};
  this.screenshots = [];
  this.success = false;
  this.init = async function ({
    url = "",
    torrentName = "",
    mediaInfo = "",
    screenshots = "",
    criterion = "",
    mocUrl = "",
  }) {
    if (url) {
      await this.initURL(url);
    }
    if (torrentName) {
      this.initTorrentName(torrentName);
    }
    if (mediaInfo && /General[\S\s]*Video[\S\s]*Audio/gi.test(mediaInfo)) {
      this.initMediaInfo(mediaInfo);
    }
    if (screenshots) {
      this.initScreenshots(screenshots);
    }
    if (criterion) {
      await this.initCriterion(criterion);
    } else {
      clearCriterionInfo();
    }
    if (mocUrl) {
      await this.initMoc(mocUrl);
    } else {
      clearMocInfo();
    }
  };
  this.initURL = async function (url) {
    // debugger;
    if (!url) {
      return;
    }
    const urlInfo = extractUrlInfo(url);
    if (
      Object.keys(this.info).length > 0 &&
      ((urlInfo.imdb_id && urlInfo.imdb_id !== this.info.imdb_id) ||
       (urlInfo.tmdb_id && urlInfo.tmdb_id !== this.info.tmdb_id))
    ) {
      details = false;
      this.info = {};
    }
    if (
      (Object.keys(this.info).length > Object.keys(urlInfo).length &&
       urlInfo.imdb_id &&
       urlInfo.imdb_id === this.info.imdb_id) ||
      (urlInfo.tmdb_id && urlInfo.tmdb_id === this.info.tmdb_id)
    ) {
      return;
    }
    if (!details) {
      details = true;
      details = this.initURL(url);
    } else if (typeof details.then === "function") {
      await details;
      details = false;
      return;
    }

    setInfo(urlInfo);
    if (typeof tmdb != "undefined" && tmdb.config.api_key) {
      if (this.info.tmdb_id && this.info.media_type) {
        fillTmdbInfo(await tmdb.getDetails(this.info.tmdb_id, this.info.media_type));
      } else if (this.info.imdb_id && this.info.media_type === "movie") {
        fillTmdbInfo(await tmdb.movie.getDetails(this.info.imdb_id));
      } else if (this.info.imdb_id) {
        setInfo(await tmdb.common.getTmdbIdAndType(this.info.imdb_id, this.info.input_source));
        fillTmdbInfo(await tmdb.getDetails(this.info.tmdb_id, this.info.media_type));
      } else {
        throw Error("Url or Id Provided is Invalid");
      }
    } else {
      throw Error("TMDB Error");
    }
    if (typeof omdb != "undefined" && omdb.config.api_key) {
      if (this.info.imdb_id) {
        fillOmdbInfo(await omdb.getDetails(this.info.imdb_id));
      }
    }
    if (!this.success) return;
    await fillSiteUrls();
  };
  this.initTorrentName = function (torrentName) {
    if (!torrentName) return;
    this.torrentInfo = extractTorrentNameInfo(torrentName);
  };
  this.initMediaInfo = function (text) {
    if (!text) return;
    this.mediaInfo = parseMediaInfoTextToJson(text);
    this.mediaInfo.General["Complete Name"] = this.mediaInfo.General["Complete Name"]
      .trim()
      .split("\\")
      .pop()
      .split("/")
      .pop();
  };
  this.initScreenshots = function (screenshots) {
    if (Array.isArray(screenshots)) {
      this.screenshots = screenshots;
    }
    if (typeof screenshots === "string") {
      this.screenshots = screenshots.split("\n");
    }
  };
  this.initCriterion = async function (criterion) {
    if (!criterion || /.*criterion.com\/films\/\d+.*/gi.test(criterion) === false) {
      clearCriterionInfo();
      return;
    }
    if (!Object.keys(this.info).includes("site_urls")) {
      this.info.site_urls = {};
    }
    if (!Object.keys(this.info).includes("ratings")) {
      this.info.ratings = {};
    }
    if (
      Object.keys(this.info.site_urls).includes("criterion") &&
      this.info.site_urls.criterion === criterion
    ) {
      return;
    }
    clearCriterionInfo();
    this.info.site_urls.criterion = criterion;
    await fillCriterionInfo(criterion);
  };
  this.initMoc = async function (mocUrl) {
    if (!mocUrl || /.*eurekavideo.co.uk\/movie\/.*/gi.test(mocUrl) === false) {
      clearMocInfo();
      return;
    }
    if (!Object.keys(this.info).includes("site_urls")) {
      this.info.site_urls = {};
    }
    if (!Object.keys(this.info).includes("ratings")) {
      this.info.ratings = {};
    }
    if (
      Object.keys(this.info.site_urls).includes("moc") &&
      this.info.site_urls.moc === mocUrl
    ) {
      return;
    }
    clearMocInfo();
    this.info.site_urls.moc = mocUrl;
    await fillMocInfo(mocUrl);
  };
  this.getImdbUrl = function () {
    if (typeof this.info.site_urls !== "undefined" && this.info.site_urls.imdb) {
      return this.info.site_urls.imdb;
    }
    return (checkKeyInInfo("imdb_id") && imdbUrl + this.info.imdb_id) || "";
  };
  this.getTmdbUrl = function () {
    if (typeof this.info.site_urls !== "undefined" && this.info.site_urls.tmdb) {
      return this.info.site_urls.tmdb;
    }
    return (checkKeyInInfo("tmdb_id") && tmdbUrl + this.info.media_type + "/" + this.info.tmdb_id) || "";
  };
  this.isDocumentary = function () {
    return this.info.genres?.some((g) => g.id === 99);
  };
  this.hasCriterionBoxSet = function () {
    return this.info.criterion_box_sets?.length > 0;
  };
  this.getCriterionBoxSetSpine = function () {
    return this.hasCriterionBoxSet
      ? this.info.criterion_box_sets.filter((set) => set.spine)[0]?.spine || ""
    : "";
  };
  this.isCriterion = function () {
    return Boolean(checkKeyInInfo("site_urls") && this.info.site_urls.criterion);
  };
  this.getCriterionUrl = function () {
    return this.isCriterion() ? this.info.site_urls.criterion : "";
  };
  this.hasCriterionSpine = function () {
    return this.info.criterion_spine;
  };
  this.getCriterionSpine = function () {
    return this.isCriterion() ? this.info.criterion_spine : "";
  };
  this.isMoC = function () {
    return Boolean(checkKeyInInfo("site_urls") && this.info.site_urls.moc);
  };
  this.getMocUrl = function () {
    return this.isMoC() ? this.info.site_urls.moc : "";
  };
  this.hasMocSpine = function () {
    return this.info.moc_spine;
  };
  this.getMocSpine = function () {
    return this.isMoC ? this.info.moc_spine : "";
  };
  this.getYoutubeTrailerId = function () {
    if (checkKeyInInfo("trailer_url") && this.info.trailer_url.site.toLowerCase() === "youtube"){
      return this.info.trailer_url.key || "";
    }
    return ""
  };
  this.getYoutubeTrailerUrl = function () {
    if (checkKeyInInfo("trailer_url") && this.info.trailer_url.site.toLowerCase() === "youtube"){
      return youtubeUrl + this.getYoutubeTrailerId() || "";
    }
    return "";
  };
  this.getVimeoTrailerId = function () {
    if (checkKeyInInfo("trailer_url") && this.info.trailer_url.site.toLowerCase() === "vimeo"){
      return this.info.trailer_url.key || "";
    }
    return ""
  };
  this.getVimeoTrailerUrl = function () {
    if (checkKeyInInfo("trailer_url") && this.info.trailer_url.site.toLowerCase() === "vimeo"){
      return vimeoUrl + this.getYoutubeTrailerId() || "";
    }
    return "";
  };
  this.getDirectorNames = function () {
    // if(checkKeyInInfo("directors") && typeof this.info.directors === "string"){
    //   return this.info.directors.split(", ");
    // }
    return (checkKeyInInfo("directors") && this.info.directors.map((i) => i.name)) || [];
  };
  this.getProducerNames = function () {
    return (checkKeyInInfo("producers") && this.info.producers.map((i) => i.name)) || [];
  };
  this.getCreatorNames = function () {
    return (checkKeyInInfo("created_by") && this.info.created_by.map((i) => i.name)) || [];
  };
  this.getSpokenLanguagesEnglishNames = function () {
    return (
      (checkKeyInInfo("spoken_languages") &&
       this.info.spoken_languages.map((i) => i.english_name)) ||
      []
    );
  };
  this.getSpokenLanguagesOriginalNames = function () {
    return (
      (checkKeyInInfo("spoken_languages") && this.info.spoken_languages.map((i) => i.name)) || []
    );
  };
  this.getSpokenLanguagesIsos = function () {
    return (
      (checkKeyInInfo("spoken_languages") && this.info.spoken_languages.map((i) => i.iso)) || []
    );
  };
  this.getCompanyNames = function () {
    return (
      (checkKeyInInfo("production_companies") &&
       this.info.production_companies.map((i) => i.name)) ||
      []
    );
  };
  this.getOriginCountry = function () {
    return (checkKeyInInfo("origin_country") && this.info.origin_country[0]) || "";
  };
  this.getCountries = function () {
    return (checkKeyInInfo("production_countries") && this.info.production_countries) || [];
  };
  this.getCountryNames = function () {
    return (
      (checkKeyInInfo("production_countries") &&
       this.info.production_countries.map((i) => i.name)) ||
      []
    );
  };
  this.getCountryIsos = function () {
    return (
      (checkKeyInInfo("production_countries") &&
       this.info.production_countries.map((i) => i.iso)) ||
      []
    );
  };
  this.getNetworkNames = function () {
    return (checkKeyInInfo("networks") && this.info.networks.map((i) => i.name)) || [];
  };
  this.getMediaInfoWidthValue = function () {
    if (Object.keys(this.mediaInfo).length === 0) {
      return 0;
    }
    return Number(this.mediaInfo.Video[0].Width.replace(" pixels", "").replace(" ", ""));
  };
  this.getMediaInfoHeightValue = function () {
    if (Object.keys(this.mediaInfo).length === 0) {
      return 0;
    }
    return Number(this.mediaInfo.Video[0].Height.replace(" pixels", "").replace(" ", ""));
  };
  /**
       * Extract Info from the Inputted IMDB/TMDB URL or ID
       *
       * @param {string}  input  TMDB/IMDB URL or ID.
       * @return {{imdb_id: string,
       *           tmdb_id: string,
       *           media_type: string
       *           input_source: string,}}    imdb_id, tmdb_id, input_source(imdb/themoviedb), type(movie/tv)
       */
  const extractUrlInfo = (url) => {
    if (typeof url === "undefined" || url === "") {
      throw Error("url not Provided");
    }
    if (typeof url !== "string") {
      throw TypeError("Expected a String, got a(n)" + typeof url + "instead");
    }
    //   let output = new urlInfo();
    let output = {
      imdb_id: "",
      tmdb_id: "",
      media_type: "",
      input_source: "",
    };
    const imdbRe = new RegExp(
      `(?:(?:http(?:s)?:\\/\\/)?(?:www.)?imdb\\.com\\/title\\/)?(?<id>tt\\d{7,8})`
    );
    const tmdbUrlRe = new RegExp(
      `(?:http(?:s)?:\\/\\/)?(?:www.)?themoviedb\\.org\\/(?<media_type>\\S+)\\/(?<id>\\d+)`
    );
    const tmdbIdRe = new RegExp(`^(?<media_type>m|t|tv)(?<id>\\d+)`);
    if (imdbRe.test(url)) {
      output.input_source = "imdb";
      output.imdb_id = imdbRe.exec(url).groups.id;
    } else if (tmdbUrlRe.test(url)) {
      output.input_source = "tmdb";
      output.media_type = tmdbUrlRe.exec(url).groups.media_type;
      output.tmdb_id = tmdbUrlRe.exec(url).groups.id;
    } else if (tmdbIdRe.test(url)) {
      output.input_source = "tmdb";
      output.tmdb_id = tmdbIdRe.exec(url).groups.id;
      output.media_type = tmdbIdRe
        .exec(url)
        .groups.media_type.replace("m", "movie")
        .replace(/t$/gi, "tv");
    } else {
      return false;
      throw Error("URL invalid. Make sure you are passing a TMDB/IMDB Url or Id");
    }
    // const re = /.*(?<input_source>imdb|themoviedb)\.(?:com|org)\/(?<type>\S+)\/(?<id>tt\d+|\d+).*|(?<imdb_id>tt\d+)|(?<tmdb_id>\d+)/g;
    //     const re =
    //       /(?:.*(?<input_source>imdb|themoviedb)\.(?:com|org)\/(?<media_type>\S+)\/){0,1}(?<id>tt\d+|\d+)/gm;
    //     const {
    //       groups: { input_source, media_type, id },
    //     } = re.exec(url);

    //     if (input_source === "imdb" || /tt\d+/g.test(id)) {
    //       output.imdb_id = id;
    //       output.input_source = "imdb";
    //     } else if (input_source === "themoviedb" || /(?:m|t|tv)\d+/.test(url.toLocaleLowerCase())) {
    //       output.tmdb_id = id;
    //       output.input_source = "tmdb";
    //       if (/(?:m)\d+/.test(url.toLocaleLowerCase())) {
    //         output.media_type = "movie";
    //       } else if (/(?:t|tv)\d+/.test(url.toLocaleLowerCase())) {
    //         output.media_type = "tv";
    //       } else output.media_type = media_type ? media_type : "";
    //     } else {
    //       throw Error("URL invalid. Make sure you are passing a TMDB/IMDB Url or Id");
    //     }
    return output;
  };
  const extractTorrentNameInfo = (name) => {
    let output = {
      name: "",
      resolution: "",
      season: "",
      episode: "",
      criterion: "",
      remux: "",
      release_group: "",
      media_type: "",
    };
    if (typeof Utilities.simpleRExtractor == "undefined") {
      throw Error("Utilities.simpleRExtractor is not defined");
    }
    output.name = name;
    output.resolution = Utilities.simpleRExtractor.extractResolution(name);
    output.season = Utilities.simpleRExtractor.extractSeason(name);
    output.criterion = Utilities.simpleRExtractor.extractCriterion(name);
    output.remux = Utilities.simpleRExtractor.extractRemux(name);
    output.release_group = Utilities.simpleRExtractor.extractReleaseGroup(name);
    output.media_type = output.season ? "tv" : "movie";
    output.episode = Utilities.simpleRExtractor.extractEpisode(name);
    return output;
  };
  /**
          /**
           * Fills the info with values of keys that match infoTemplate
           *
           * @param {object} data Object containing same keys as info
           * @return {Array} List of Keys that were updated
           */
  const setInfo = (data) => {
    let oldKeys = Object.keys(this.info);
    for (const key in data) {
      // if(typeof info[key] === "string" && info[key] !== "") continue;
      // if(Array.isArray(info[key]) && info[key] !== []) continue;
      if (infoTemplate.hasOwnProperty(key)) {
        this.info[key] = data[key];
      }
    }
    return Object.keys(this.info).filter((k) => !oldKeys.includes(k));
  };
  const checkKeyInInfo = (prop) => {
    return this.info != null && Object.keys(this.info).length > 0 && this.info.hasOwnProperty(prop);
  };
  const fillTmdbInfo = (data) => {
    if (Object.keys(data).length === 0) return;
    this.success = true;
    setInfo(data);
    if (!Object.keys(this.info).includes("ratings")) {
      this.info.ratings = {};
    }
    this.info.tmdb_id = data.id || "";
    if (!this.info.imdb_id) {
      if (Object.keys(data.external_ids).includes("imdb_id") && data.external_ids.imdb_id != null) {
        this.info.imdb_id = data.external_ids.imdb_id || "";
      }
    }
    this.info.title = data.title || data.name || "";
    this.info.original_title = data.original_title || data.original_name || "";
    this.info.directors = getTMDBDirectors(data);
    this.info.year = getTMDBYear(data);
    if (data.poster_path) {
      this.info.poster_url = `${tmdb.config.image_url}${data.poster_path}`;
    }
    this.info.backdrop_url = `${tmdb.config.image_url}${data.backdrop_path}`;
    this.info.tmdb_rating =
      data.vote_average && !isNaN(data.vote_average) ? (data.vote_average * 10).toString() : "";
    this.info.ratings.tmdb =
      data.vote_average && !isNaN(data.vote_average) ? (data.vote_average * 10).toString() : "";
    this.info.release_date = getTMDBReleaseDate(data);
    this.info.trailer_url = getTMDBTrailerUrl(data);
    this.info.producers = getTMDBProducers(data);
    this.info.production_companies = getTMDBProductionCompanies(data);
    this.info.production_countries = getTMDBProductionCountries(data);
    this.info.spoken_languages = getTMDBSpokenLanguages(data);
    this.info.writers = getTMDBWriters(data);
    cleanInfo();
  };
  const fillOmdbInfo = (data) => {
    if (data == null) return;
    if (!Object.keys(this.info).includes("ratings")) {
      this.info.ratings = {};
    }
    if (!Object.keys(this.info).includes("site_urls")) {
      this.info.site_urls = {};
    }
    this.info.media_type = this.info.media_type || getOmdbType(data);
    this.info.rated = data.Rated?.toString() || "";
    this.info.imdb_rating = data.imdbRating?.toString() || "";
    if (typeof data.Metascore != "undefined" && data.Metascore.toLowerCase() !== "n/a") {
      this.info.metacritic_rating = data.Metascore?.toString() || "";
      this.info.ratings.metacritic = data.Metascore?.toString() || "";
    }
    this.info.rt_rating =
      data.Ratings?.filter((i) => i.Source === "Rotten Tomatoes")[0]?.Value.replace("%", "") || "";
    this.info.ratings.imdb = data.imdbRating?.toString() || "";
    this.info.ratings.rotten_tomatoes =
      data.Ratings?.filter((i) => i.Source === "Rotten Tomatoes")[0]?.Value.replace("%", "") || "";
    if (Object.keys(data).includes("tomatoURL") && data.tomatoURL.toLowerCase() !== "n/a") {
      this.info.site_urls.rotten_tomatoes = data.tomatoURL.replace("http://", "https://") || "";
    }
    if(!this.info.poster_url && data.Poster && data.Poster.toLowerCase() !== "n/a"){
      this.info.poster_url = data.Poster || "";
    }
    if(data.Plot && data.Plot.toLowerCase() !== "n/a" && !this.info.overview) {
      this.info.overview = data.Plot.trim() || "";
    }
    if(data.Director && data.Director.toLowerCase() !== "n/a" && (!this.info.directors || (Array.isArray(this.info.directors) && this.info.directors.length === 0))){
      this.info.directors = [];
      data.Director.split(", ").forEach((director, index) => {
        this.info.directors[index] = {};
        this.info.directors[index].name = director;
      });
    }
    if(data.Writer && data.Director.toLowerCase() !== "n/a" && (!this.info.writers || (Array.isArray(this.info.writers) && this.info.writers.length === 0))){
      this.info.writers = [];
      data.Director.split(", ").forEach((writer, index) => {
        this.info.writers[index] = {};
        this.info.writers[index].name = writer;
      });
    }
  };
  const getOmdbType = (data) => {
    if (data.Type == null) return;
    switch (data.Type) {
      case "series":
        return "tv";
      case "movie":
        return "movie";
      default:
        return "";
    }
  };
  const cleanInfo = () => {
    // Remove Any Elements in this.info having no values
    for (const i in this.info) {
      if (this.info[i] === null || this.info[i] === undefined) {
        delete this.info[i];
      }
      if (Array.isArray(this.info[i]) && this.info[i].length === 0) {
        delete this.info[i];
      }
      if (!this.info[i]) {
        delete this.info[i];
      }
    }
  };
  const getTMDBReleaseDate = function (data) {
    return data.release_date || data.first_air_date || "";
  };
  const getTMDBYear = function (data) {
    return getTMDBReleaseDate(data).split("-", 1)[0];
  };
  const getTMDBDirectors = function ({ credits: { crew } }) {
    if (!crew) throw Error("No Credits Provided");
    if (!arguments.length) throw Error("No Parameter Provided");
    return crew.length ? crew.filter((k) => k.job === "Director") : [];
  };
  const getTMDBProducers = function ({ credits: { crew } }) {
    if (!crew) throw Error("No Credits Provided");
    if (!arguments.length) throw Error("No Parameter Provided");
    return crew.length ? crew.filter((k) => k.department === "Production") : [];
  };
  const getTMDBWriters = function ({ credits: { crew } }) {
    if (!crew) throw Error("No Credits Provided");
    if (!arguments.length) throw Error("No Parameter Provided");
    return crew.length ? crew.filter((k) => k.department === "Writing") : [];
  };
  const getTMDBTrailerUrl = function ({ videos: { results } }) {
    if (!arguments.length) throw Error("No Parameter Provided");
    return results.length
      ? results.filter((element) => {
      return element.type.toLowerCase() === "trailer";
    })[0]
    : "";
  };
  const getTMDBProductionCompanies = function ({ production_companies }) {
    if (!arguments.length) throw Error("No Parameter Provided");
    return production_companies.length
      ? production_companies.map((i) => {
      return {
        id: i.id,
        logo_url: i.logo_path !== null ? `${tmdb.config.image_url}${i.logo_path}` : "",
        name: i.name,
        origin_country: i.origin_country,
      };
    })
    : [];
  };
  const getTMDBProductionCountries = function ({ production_countries }) {
    if (!arguments.length) throw Error("No Parameter Provided");
    return production_countries.length
      ? production_countries.map((item) => {
      return {
        iso: item.iso_3166_1,
        name: item.name,
      };
    })
    : [];
  };
  const getTMDBSpokenLanguages = function ({ spoken_languages }) {
    if (!arguments.length) throw Error("No Parameter Provided");
    return spoken_languages.length
      ? spoken_languages.map((item) => {
      return {
        english_name: item.english_name,
        iso: item.iso_639_1,
        name: item.name,
      };
    })
    : [];
  };
  const fillSiteUrls = async () => {
    if (!Object.keys(this.info).includes("site_urls")) {
      this.info.site_urls = {};
    }
    this.info.site_urls.imdb = this.getImdbUrl();
    this.info.site_urls.tmdb = this.getTmdbUrl();
    this.info.site_urls.metacritic = await fetchMetacriticUrl(this.getImdbUrl());
    if (
      Object.keys(this.info.site_urls).includes("rotten_tomatoes") &&
      !this.info.site_urls.rotten_tomatoes
    ) {
      this.info.site_urls.rotten_tomatoes = await fetchRottenUrl(this.getImdbUrl());
    }
  };
  const fetchMetacriticUrl = async (imdbUrl) => {
    if (!this.getImdbUrl()) {
      return "";
    }
    const result = await Utilities.xhrQuery(this.getImdbUrl(), "/criticreviews");
    if (result.status !== 200) return "";
    const element = Utilities.parseHtmlString(result.responseText, ".see-more a[href*=metacritic]");
    return element?.href?.trim().split("?")[0] || "";
  };
  const fetchRottenUrl = async (imdbUrl) => {
    if (!this.getImdbUrl()) {
      return "";
    }
    const result = await Utilities.xhrQuery(this.getImdbUrl(), "/externalreviews");
    if (result.status !== 200) return "";
    const element = Utilities.parseHtmlString(
      result.responseText,
      "a.tracked-offsite-link[href*=rottentomatoes]"
    );
    return element?.href?.trim().split("?")[0] || "";
  };
  const fillCriterionInfo = async (criterionUrl) => {
    const result = await Utilities.xhrQuery(this.getCriterionUrl(), "");
    let boxSets = [];
    if (result.status !== 200) return "";
    this.info.criterion_poster_url = Utilities.parseHtmlString(
      result.responseText,
      ".product-box-art img"
    ).src;

    this.info.criterion_overview = Utilities.parseHtmlString(result.responseText, ".product-summary p").innerText.trim();

    let spine = Utilities.parseHtmlString(
      result.responseText,
      ".film-meta-list li:last-child"
    ).innerText.toLowerCase();
    if (spine.includes("spine #")) {
      this.info.criterion_spine = spine.replace("spine #", "");
      this.info.ratings.criterion = "#" + this.info.criterion_spine;
    }
    boxSets = Utilities.parseHtmlString(result.responseText, ".collector-set-options", true);
    if (boxSets.length <= 0) {
      return;
    }
    this.info.criterion_box_sets = [];
    for (const set of boxSets) {
      let s = {};
      s.title = set.querySelector(".cso-title").innerText;
      s.type = set.querySelector(".cso-type").innerText;
      s.discs = set.querySelector(".cso-num").innerText.replace(" Discs", "");
      s.url = set.dataset.href;
      const setPage = await Utilities.xhrQuery(set.dataset.href, "");
      s.spine =
        Utilities.parseHtmlString(setPage.responseText, ".film-meta-list li:last-child")
        ?.innerText.toLowerCase()
        .replace("spine #", "") || "";
      this.info.criterion_box_sets.push(s);
    }
  };
  const clearCriterionInfo = () => {
    if (this.info.criterion_overview) {
      this.info.criterion_overview = "";
    };
    if (this.info.criterion_poster_url) {
      this.info.criterion_poster_url = "";
    };
    if (this.info.criterion_spine){
      this.info.criterion_spine = "";
    };
    if (this.info.criterion_box_sets && this.info.criterion_box_sets.length > 0) {
      this.info.criterion_box_sets = [];
    };
    if (this.info.site_urls && this.info.site_urls.criterion) {
      this.info.site_urls.criterion = "";
    };
  };
  const fillMocInfo = async (mocUrl) => {
    const result = await Utilities.xhrQuery(this.getMocUrl(), "");
    if (result.status !== 200) return "";
    this.info.moc_poster_url = Utilities.parseHtmlString(
      result.responseText,
      ".img-fluid.media-cover-display"
    ).src;

    this.info.moc_overview = Utilities.parseHtmlString(result.responseText, ".col-md-6.pr-md-5").innerText.replace("SYNOPSIS","").trim();

    let spine = Utilities.parseHtmlString(
      result.responseText,
      "p.media-spine-no.mt-4"
    ).innerText.toLowerCase();
    this.info.moc_spine = spine.replace("#", "").trim();
    this.info.ratings.moc = "#" + this.info.moc_spine;
  };
  const clearMocInfo = () => {
    if (this.info.moc_overview) {
      this.info.moc_overview = "";
    };
    if (this.info.moc_poster_url) {
      this.info.moc_poster_url = "";
    };
    if (this.info.moc_spine){
      this.info.moc_spine = "";
    };
    if (this.info.site_urls && this.info.site_urls.moc) {
      this.info.site_urls.moc = "";
    };
  };
  const parseMediaInfoTextToJson = (text) => {
    let lines = text.split("\n");
    let temp = {};
    let output = {};
    for (const line of lines) {
      if (line && !line.includes(":")) {
        temp = {};
        let root = Utilities.capitalize(line.replace(/\s*#\d+$/gi, ""));
        if (/(?:Video|Audio|Text)/gi.test(root)) {
          if (!Array.isArray(output[root])) {
            output[root] = [];
          }
          output[root].push(temp);
        } else {
          output[root] = temp;
        }
      } else if (line && line.includes(":")) {
        // " :" to make it work with Menu Chapters since they have many :
        const [key, value] = line.split(" :", 2);
        temp[Utilities.capitalize(key.trim())] = value.trim();
      }
    }
    return output;
  };
}

let ShadowForm = {
  TYPES: {
    DEFAULT: 0,
    TV: 65,
    MOVIESD: 67,
    MOVIEHD: 68,
  },
  COLLECTION_PRIORITY: {
    PRIMARY: 0,
    SECONDARY: 1,
    TERTIARY: 2,
  },
  fields: {
    formRows: document.querySelectorAll("#myForm tr"),
    uplTorrentFile: document.querySelector("input[name=file]"),
    txtTorrentName: document.querySelector("input[name=name]"),
    txtImdbLink: document.querySelector("input[name=imdblink]"),
    txtDescription: document.querySelector("textarea[name=descr]"),
    txtMediainfo: document.querySelector("textarea[name=mediainfo]"),
    ddlType: document.querySelector("select[name=type]"),
    rbReleaseTypes: document.querySelectorAll("input[name='rtgrp']"),
    ddlCollections: document
    .querySelector("select[name=collection_id1]")
    .parentElement.querySelectorAll("select"),
    ddlCollection1: document.querySelector("select[name=collection_id1]"),
    ddlCollection2: document.querySelector("select[name=collection_id2]"),
    ddlCollection3: document.querySelector("select[name=collection_id3]"),
    alertPosition: document.querySelector("#myForm a[href='uploadrules.php']").parentElement
    .nextElementSibling,
    alertTorrentPosition: document
    .querySelector("#myForm table")
    .querySelectorAll("tr")[0]
    .querySelectorAll("td")[1],
    btnAutoFill: "",
    txtScreenshots: "",
    txtCriterionLink: "",
    txtMoCLink: "",
    txtMoCSpine: "",
    txtTrailer: "",
    txtArtowrk: "",
    txtNotes: "",
    txtEncodeSettings: "",
    txtReleaseInfo: "",
    txtCompScreenshots: "",
    trExtraFields: "",
    btnFillForm: "",
    chkMediaInfo: "",
    compScreenshots: [],
  },
  eventHandlers: {
    clickFillForm: async function (event) {
      event.preventDefault();
      ShadowForm.alert.clearAll();
      ShadowForm.common.txtLoading(ShadowForm.fields.txtDescription);
      let ok = true;
      const url = ShadowForm.common.getImdbLink();
      const torrentName = ShadowForm.common.getTorrentName();
      const mediaInfo = ShadowForm.common.getMediaInfo();
      let screenshots = ShadowForm.common.getScreenshots();
      let criterion = ShadowForm.common.getCriterionLink();
      let mocUrl = ShadowForm.common.getMoCLink();
      // let mocSpine = ShadowForm.common.getMoCSpine();
      let extraInfo = {
        yt_trailer: "",
        vm_trailer: "",
        artwork: [],
        notes: "",
        encode_settings: "",
        release_info: "",
        comp_screenshots: "",
        extraLinks: {},
        moc_spine: "",
      };
      if (!url) {
        ok = false;
        ShadowForm.alert.createIMDBLinkAlert("Error", "This field is required");
      }
      if (!ShadowForm.common.checkUrl(url)) {
        ok = false;
        ShadowForm.alert.createIMDBLinkAlert(
          "Error",
          "Invalid input! Please input a valid IMDB/TMDB Url or Id"
        );
      }
      if (!criterion && torrentName.includes("criterion")) {
        ShadowForm.alert.createCriterionAlert(
          "Warning",
          "Possibly criterion, if so fill this field otherwise ignore it"
        );
      }
      if (!torrentName) {
        ShadowForm.alert.createTorrentNameAlert("Error", "This field is required");
      }
      if (!mediaInfo) {
        ShadowForm.alert.createMediaInfoAlert("Error", "This field is required");
      }
      if (mediaInfo && !/General[\S\s]*Video[\S\s]*Audio/gi.test(mediaInfo)) {
        ShadowForm.alert.createMediaInfoAlert("Error", "Invalid MediaInfo provided");
      }
      if (!screenshots) {
        ShadowForm.alert.createScreenshotAlert("Error", "This field is required");
      } else {
        screenshots = screenshots.split("\n");
        if (!screenshots.every((ss) => ss.includes("https://"))) {
          ShadowForm.alert.createScreenshotAlert(
            "Warning",
            "Make sure all your links are Secure (https)"
          );
        }
      }
      if (ShadowForm.common.getTrailer()){
        let ytRe = /(?<=(?:https?\:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.?be)\/|v=)[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]|^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/i;
        let vimeoRe = /(?<=https?:\/\/vimeo\.com\/)\d+|^\d+$/i;
        if (ytRe.test(ShadowForm.common.getTrailer())) {
          extraInfo.yt_trailer = ytRe.exec(ShadowForm.common.getTrailer())[0];
        } else if (vimeoRe.test(ShadowForm.common.getTrailer())) {
          extraInfo.vm_trailer = vimeoRe.exec(ShadowForm.common.getTrailer())[0];
        }
      }
      if (ShadowForm.common.getMoCLink()){
        extraInfo.extraLinks.moc = extraInfo.extraLinks.moc || {};
        extraInfo.extraLinks.moc.url = ShadowForm.common.getMoCLink();
      }
      if (ShadowForm.common.getMoCSpine()){
        extraInfo.extraLinks.moc = extraInfo.extraLinks.moc || {};
        extraInfo.extraLinks.moc.spine = ShadowForm.common.getMoCSpine();
      }
      if (ShadowForm.common.getArtwork()){
        extraInfo.artwork = ShadowForm.common.getArtwork().split("\n");
      }
      if (ShadowForm.common.getNotes()){
        extraInfo.notes = ShadowForm.common.getNotes()
      }
      if (ShadowForm.common.getEncodeSettings()){
        extraInfo.encode_settings = ShadowForm.common.getEncodeSettings()
      } else if (ShadowForm.common.getReleaseType() === "rtpers" || ShadowForm.common.getReleaseType() === "rtint"){
        ShadowForm.alert.createAlertBefore(ShadowForm.fields.txtEncodeSettings, "Error", "x264 Encode Settings are required for Internal and Personal Releases");
        ok = false;
      }
      if (ShadowForm.common.getReleaseInfo()){
        extraInfo.release_info = ShadowForm.common.getReleaseInfo();
      } else if (ShadowForm.common.getReleaseType() === "rtpers" || ShadowForm.common.getReleaseType() === "rtint"){
        ShadowForm.alert.createAlertBefore(ShadowForm.fields.txtReleaseInfo, "Error", "Release Info is required for Internal and Personal Releases");
        ok = false;
      }
      if (ShadowForm.common.getCompScreenshots().length > 0){
        extraInfo.comp_screenshots = ShadowForm.common.getCompScreenshots();
      } else if (ShadowForm.common.getReleaseType() === "rtpers" || ShadowForm.common.getReleaseType() === "rtint"){
        ShadowForm.alert.createAlertBefore(ShadowForm.fields.txtCompScreenshots, "Error", "Comparison Screensots are required for Internal and Personal Releases");
        ok = false;
      }
      if(!ok && ShadowForm.fields.txtDescription.value.trim()){
        ShadowForm.common.resetShadowForm();
      }
      if (!ok) {
        ShadowForm.common.txtDone(ShadowForm.fields.txtDescription);
        return false;
      }
      console.log(Date.now());
      try {
        await media.init({ url, torrentName, mediaInfo, screenshots, criterion, mocUrl });
        console.log(Date.now());
        console.log(media.info);
        if(!media.getImdbUrl()){
          ShadowForm.alert.createIMDBLinkAlert(
            "Error",
            "Could not find an IMDB URL, Please try to find manually."
          );
        }
        if(media.isMoC() && media.getMocSpine()){
          ShadowForm.common.setMoCSpine(media.getMocSpine());
        }
        if(!ShadowForm.common.getTrailer() && media.getYoutubeTrailerId() || media.getVimeoTrailerId()){
          ShadowForm.common.setTrailer(media.getYoutubeTrailerUrl() || media.getVimeoTrailerUrl() || "");
        }
        if(!ShadowForm.common.getTrailer() && !media.getYoutubeTrailerId() && !media.getVimeoTrailerId()){
          document.querySelector("#sf-trailer").checked = true;
          ShadowForm.eventHandlers.changeEFCheckBox("#sf-trailer-row", true);
          ShadowForm.alert.createDescriptionAlert("Info", "Trailer not found");
        }
        ShadowForm.common.setImdbLink(media.getImdbUrl());
        ShadowForm.common.setType(media);
        if (TEMPLATE_VERSION.toLowerCase() === "final" || TEMPLATE_VERSION.toLowerCase() === "f") {
          ShadowForm.common.fillDescription(await ShadowForm.template.createFinalTemplate(media, extraInfo));
        } else if (TEMPLATE_VERSION.toLowerCase() === "compact" || TEMPLATE_VERSION.toLowerCase() === "c") {
          ShadowForm.common.fillDescription(await ShadowForm.template.createCompactTemplate(media, extraInfo));
        }else {
          ShadowForm.common.fillDescription(await ShadowForm.template.createTemplate(media, extraInfo));
        }
      } catch (error) {
        if(ShadowForm.fields.txtDescription.value.trim()){
          ShadowForm.common.resetShadowForm();
        }
        console.log("Error while executing the FillForm Event", error);
      }
      finally {
        ShadowForm.common.txtDone(ShadowForm.fields.txtDescription);
      }
      // let possibleCollectionValues = [];
      // possibleCollectionValues = [
      //   ...media.getDirectorNames(),
      //   media.isCriterion()? "Criterion" : "",
      //   ShadowForm.common.getCriterionCollectionRange(media),
      //   ...media.getCompanyNames(),
      //   media.getOriginCountry().replace("GB", "UK"),
      //   ...media.getCountryIsos(),
      //   ...media.getNetworkNames(),
      //   media.torrentInfo.release_group,
      //   media.torrentInfo.resolution === "2160p" ? "4k" : "",
      // ];
      ShadowForm.common.clearCollections();
      // ShadowForm.common.fillCollections(possibleCollectionValues);
      ShadowForm.common.fillCollectionsInOrder(media);
      return false;
    },
    changeTorrentFile: function () {
      const torrentFileName = this.files[0].name;
      const torrentName = ShadowForm.common.cleanTorrentName(torrentFileName);
      media.init({ torrentName });

      ShadowForm.common.fillTorrentName(torrentName);
      ShadowForm.alert.clearTorrentAlert();
      if (media.torrentInfo.remux) {
        ShadowForm.alert.createTorrentAlert("Error", "iTS doesn't allow Remuxes");
      }
      if (media.torrentInfo.episode) {
        ShadowForm.alert.createTorrentAlert("Error", "iTS doesn't allow individual episodes");
      }
    },
    changeTorrentName: function () {
      media.init({ torrentName: this.value });
      // debugger;
      if (media.torrentInfo.remux) {
        ShadowForm.alert.createTorrentAlert("Error", "iTS doesn't allow Remuxes");
      }
      if (media.torrentInfo.episode) {
        ShadowForm.alert.createTorrentAlert("Error", "iTS doesn't allow individual episodes");
      }
    },
    changeIMDBLink: function () {
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtImdbLink);
      if (this.value && ShadowForm.common.checkUrl(this.value) === false) {
        ShadowForm.alert.createIMDBLinkAlert("Error", "Please input a valid IMDB/TMDB url or id");
      } else {
        media.initURL(this.value);
      }
    },
    changeCriterionLink: function () {
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtCriterionLink);
      if (this.value && /.*criterion.com\/films\/\d+.*/gi.test(this.value) === false) {
        ShadowForm.alert.createCriterionAlert("Error", "Invalid Criterion Url");
      }
    },
    changeMoCLink: function () {
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtMoCLink);
      if (this.value && /.*eurekavideo\.co\.uk\/movie\/.*/gi.test(this.value) === false) {
        ShadowForm.alert.createMoCAlert("Error", "Invalid Criterion Url");
      }
    },
    changeMediaInfo: function () {
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtMediainfo);
      this.value = this.value.replace(/^[ \t]+/gm, "").replace(/[ \t]+$/gm, "");
      if (this.value && /General[\S\s]*Video[\S\s]*Audio/gi.test(this.value) === false) {
        ShadowForm.alert.createMediaInfoAlert(
          "Warning",
          "Make sure you have inputted valid MediaInfo"
        );
      }
      // remove path from complete name, keep only filename
      this.value = this.value.replace(/(Complete name.*?:\s)(?<path>.*)/gi, (text,c,p) =>
                                      c + p.trim().split("\\").pop().split("/").pop()
                                     );
      media.init({ mediaInfo: this.value });
    },
    changeEFCheckBox: function(rowId, checked) {
      if (checked == undefined) {
        document.querySelector(rowId).classList.toggle("hidden");
        return;
      }
      checked ? document.querySelector(rowId).classList.remove("hidden") : document.querySelector(rowId).classList.add("hidden");
    },
    changeReleaseType: function() {
      switch (this.value) {
        case "rtpers":
        case "rtint":
          ShadowForm.common.checkInternalExtraFields();
          break;
        case "rtnorm":
          ShadowForm.common.clearExtraFields();
          break;
        default:

      }
    },
    pasteScreenshots: async function (event) {
      const items = event.clipboardData.items;
      const element = event.target;
      if (items.length === 0) {
        return;
      }
      if (!items[0].type.startsWith("image/")) {
        return;
      }
      const blob = items[0].getAsFile();
      ShadowForm.common.txtLoading(element);
      let img = await Utilities.createImage(blob).catch((err) => {
        ShadowForm.alert.createScreenshotAlert("Error", "Problem occured while uploading to IMGBB");
        return err;
      });
      ShadowForm.common.fillScreenshots(img.url);
      ShadowForm.common.txtDone(element);
      // var reader = new FileReader();
      // reader.onload = async function(event)
      // {
      //     ShadowForm.common.txtLoading(element)
      //     let img = await Utilities.createImage(event.target.result.split(',',2)[1]).catch((err) => {
      //           ShadowForm.alert.createScreenshotAlert("Error", "Problem occured while uploading to IMGBB");
      //           return err;
      //       });
      //     ShadowForm.common.fillScreenshots(img.url);
      //     ShadowForm.common.txtDone(element);
      // }; // data url
      // reader.readAsDataURL(blob);
    },
    makeScreenshotsDroppable: (element) => {
      function highlight(e) {
        element.classList.add("ssHighlight");
      }

      function unhighlight(e) {
        element.classList.remove("ssHighlight");
      }
      async function handleDrop(e) {
        if (!e.dataTransfer) return false;
        const dt = e.dataTransfer;
        const files = dt.files;
        ShadowForm.common.txtLoading(element);
        const imgBBImages = await Promise.all(handleFiles(files)).then((r) => {
          ShadowForm.common.txtDone(element);
          return r;
        });
        if (typeof imgBBImages[0] === "undefined") {
          ShadowForm.alert.createScreenshotAlert("Error", "Problem Uploading Files to IMGBB");
          return false;
        }
        fillScreenshots(formatImages(imgBBImages));
        // if (element.value) {
        //     element.value = element.value.trimEnd() + "\n" + formatImages(imgBBImages).trim();
        // } else {
        //     element.value = formatImages(imgBBImages).trim();
        // }
      }
      function fillScreenshots (input) {
        let lines = input.split("\n");
        for (const line of lines) {
          if (element.value.trim()) {
            if (element.value.trim().includes(line.trim())) {
              continue;
            }
            element.value = element.value.trim() + "\n" + line;
          } else {
            element.value = input.trim();
          }
        }
      }
      function formatImages(data) {
        if (typeof data === "undefined") return;
        return data
          .map((image) => {
          if (typeof image === "undefined") return;
          return `${image.url}`;
        })
          .join("\n");
      }
      function loading(el) {
        el.classList.add("ssLoading");
        el.disabled = true;
      }
      function done(el) {
        el.classList.remove("ssLoading");
        el.disabled = false;
      }
      function handleFiles(files) {
        ShadowForm.alert.clearFieldAlerts(element);
        let output = [];
        for (const file of files) {
          output.push(uploadFile(file));
        }
        return output;
      }
      function uploadFile(file) {
        if (!file.type.startsWith("image/")) {
          ShadowForm.alert.createScreenshotAlert(
            "Error",
            file.name + " isn't an image. Please make sure you only drop images."
          );
          return;
        }
        return Utilities.createImage(file).catch((err) => {
          ShadowForm.alert.createScreenshotAlert("Error", file.name + " failed to upload to IMGBB");
          return err;
        });
      }
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        element.addEventListener(eventName, preventDefaults, false);
      });

      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      ["dragenter", "dragover"].forEach((eventName) => {
        element.addEventListener(eventName, highlight, false);
      });

      ["dragleave", "drop"].forEach((eventName) => {
        element.addEventListener(eventName, unhighlight, false);
      });

      element.addEventListener("drop", handleDrop, false);
    },
    makeMediaInfoDroppable: (element) => {
      function highlight(e) {
        element.classList.add("ssHighlight");
      }

      function unhighlight(e) {
        element.classList.remove("ssHighlight");
      }
      function handleDrop(e) {
        if (!e.dataTransfer) return false;
        const dt = e.dataTransfer;
        const file = dt.files;
        if (file.length > 1) {
          ShadowForm.alert.createMediaInfoAlert("Error", "Please Drop only one file");
          return false;
        }
        handleFile(file[0]);
        // element.value = result;
      }
      function loading(el) {
        el.classList.add("ssLoading");
        el.disabled = true;
      }
      function done(el) {
        el.classList.remove("ssLoading");
        el.disabled = false;
      }
      function handleFile(file) {
        ShadowForm.common.txtLoading(element);
        parseFileMediaInfo(file);
      }
      function parseFileMediaInfo(file) {
        if (processing) {
          return;
        }
        processing = true;
        var fileSize = file.size,
            offset = 0,
            state = 0,
            seekTo = -1,
            seek = null;

        mi.open_buffer_init(fileSize, offset);

        var processChunk = function (e) {
          var l;
          if (e.target.error === null) {
            var chunk = new Uint8Array(e.target.result);
            l = chunk.length;
            state = mi.open_buffer_continue(chunk, l);

            var seekTo = -1;
            var seekToLow = mi.open_buffer_continue_goto_get_lower();
            var seekToHigh = mi.open_buffer_continue_goto_get_upper();

            if (seekToLow == -1 && seekToHigh == -1) {
              seekTo = -1;
            } else if (seekToLow < 0) {
              seekTo = seekToLow + 4294967296 + seekToHigh * 4294967296;
            } else {
              seekTo = seekToLow + seekToHigh * 4294967296;
            }

            if (seekTo === -1) {
              offset += l;
            } else {
              offset = seekTo;
              mi.open_buffer_init(fileSize, seekTo);
            }
            chunk = null;
          } else {
            var msg = "An error happened reading your file!";
            ShadowForm.alert.createMediaInfoAlert("Error", "Error reading file");
            console.err("parseMediaInfo Error: ", e.target.error);
            processing = false;
            return;
          }
          // bit 4 set means finalized
          if (state & 0x08) {
            var result = mi.inform();
            mi.close();
            processing = false;
            element.value = result
              .replace(/^Format\s{7}(\s*)/m, "Complete name$1: " + file.name + "\nFormat       $1")
              .trim();
            ShadowForm.common.txtDone(element);
            // return result;
          }
          seek(l);
        };
        seek = function (length) {
          if (processing) {
            var r = new FileReader();
            var blob = file.slice(offset, length + offset);
            r.onload = processChunk;
            r.readAsArrayBuffer(blob);
          } else {
            mi.close();
            processing = false;
          }
        };

        // start
        seek(CHUNK_SIZE);
      }
      ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
        element.addEventListener(eventName, preventDefaults, false);
      });

      function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
      }
      ["dragenter", "dragover"].forEach((eventName) => {
        element.addEventListener(eventName, highlight, false);
      });

      ["dragleave", "drop"].forEach((eventName) => {
        element.addEventListener(eventName, unhighlight, false);
      });

      element.addEventListener("drop", handleDrop, false);
    },
  },
  create: {
    stylesheet: () => {
      let css = `
            .ssHighlight {
              // border-color: #226694;
              box-shadow: 0px 0px 5px 2px #226694;
            }
            .ssLoading {
              // background: gray url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNMzEuOTcgNzkuMjVBMTkuOTUgMTkuOTUgMCAwIDEgNjYuNyA5OC44N2M0LjU2IDIuNiAxOC4zIDkuMjcgMzAuOCAyLjc0IDIyLjU3LTExLjggMjQuMS0zMy41IDIzLjQtNTAuNiA2LjE0IDEwIDExLjM3IDQ3LjY4LTI1LjM4IDY3LjgtMTAuNTYgNS44LTI4Ljk4IDYuOTQtNDEuOCAxLjE2LTIxLjctOS43OC0yOC4yNy0yOS40LTIxLjc1LTQwLjY4ek05Mi45IDgzLjhhMTkuOTUgMTkuOTUgMCAwIDEtLjM4LTM5Ljg4YzAtNS4yNS0xLjEtMjAuNDgtMTMtMjguMDJDNTggMi4yNCAzOC40MiAxMS43NSAyMy45NiAyMC45NWM1LjU4LTEwLjMyIDM1LjYtMzMuNyA3MS40LTExLjk0IDEwLjMgNi4zIDIwLjUgMjEuNjggMjEuOSAzNS42OEMxMTkuNjQgNjguMyAxMDUuOTMgODMuOCA5Mi45IDgzLjh6TTY2LjY2IDI4LjdBMTkuOTUgMTkuOTUgMCAwIDEgMzIuMyA0OWMtNC41NCAyLjYzLTE3LjE4IDExLjItMTcuNzcgMjUuMjctMS4wNiAyNS40NiAxNi45NSAzNy42NCAzMi4xNiA0NS41OC0xMS43Ny4zMy00Ny0xMy45OC00Ni4wOC01NS44Ny4yNy0xMi4wNCA4LjUtMjguNTYgMTkuOS0zNi43OCAxOS4zMi0xMy45IDM5LjYtOS43NyA0Ni4xIDEuNTJ6IiBmaWxsPSIjZmExNTAyIi8+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgNjQgNjQiIHRvPSIxMjAgNjQgNjQiIGR1cj0iNzIwbXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+PC9nPjwvc3ZnPg==") no-repeat scroll center center !important;
              background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+PHN2ZyB4bWxuczpzdmc9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjAiIHdpZHRoPSI2NHB4IiBoZWlnaHQ9IjY0cHgiIHZpZXdCb3g9IjAgMCAxMjggMTI4IiB4bWw6c3BhY2U9InByZXNlcnZlIj48Zz48cGF0aCBkPSJNMzEuOTcgNzkuMjVBMTkuOTUgMTkuOTUgMCAwIDEgNjYuNyA5OC44N2M0LjU2IDIuNiAxOC4zIDkuMjcgMzAuOCAyLjc0IDIyLjU3LTExLjggMjQuMS0zMy41IDIzLjQtNTAuNiA2LjE0IDEwIDExLjM3IDQ3LjY4LTI1LjM4IDY3LjgtMTAuNTYgNS44LTI4Ljk4IDYuOTQtNDEuOCAxLjE2LTIxLjctOS43OC0yOC4yNy0yOS40LTIxLjc1LTQwLjY4ek05Mi45IDgzLjhhMTkuOTUgMTkuOTUgMCAwIDEtLjM4LTM5Ljg4YzAtNS4yNS0xLjEtMjAuNDgtMTMtMjguMDJDNTggMi4yNCAzOC40MiAxMS43NSAyMy45NiAyMC45NWM1LjU4LTEwLjMyIDM1LjYtMzMuNyA3MS40LTExLjk0IDEwLjMgNi4zIDIwLjUgMjEuNjggMjEuOSAzNS42OEMxMTkuNjQgNjguMyAxMDUuOTMgODMuOCA5Mi45IDgzLjh6TTY2LjY2IDI4LjdBMTkuOTUgMTkuOTUgMCAwIDEgMzIuMyA0OWMtNC41NCAyLjYzLTE3LjE4IDExLjItMTcuNzcgMjUuMjctMS4wNiAyNS40NiAxNi45NSAzNy42NCAzMi4xNiA0NS41OC0xMS43Ny4zMy00Ny0xMy45OC00Ni4wOC01NS44Ny4yNy0xMi4wNCA4LjUtMjguNTYgMTkuOS0zNi43OCAxOS4zMi0xMy45IDM5LjYtOS43NyA0Ni4xIDEuNTJ6IiBmaWxsPSIjZmExNTAyIi8+PGFuaW1hdGVUcmFuc2Zvcm0gYXR0cmlidXRlTmFtZT0idHJhbnNmb3JtIiB0eXBlPSJyb3RhdGUiIGZyb209IjAgNjQgNjQiIHRvPSIxMjAgNjQgNjQiIGR1cj0iNzIwbXMiIHJlcGVhdENvdW50PSJpbmRlZmluaXRlIj48L2FuaW1hdGVUcmFuc2Zvcm0+PC9nPjwvc3ZnPg==");
              background-repeat: no-repeat;
              background-position: right bottom;
              background-color: gray;
              background-size: 30px;
            }
            .sfInfo {
              color: aqua;
            }
            .sfWarning {
              color: yellow;
            }
            .sfError {
              color: red;
            }
            .sf-settings {
      position: fixed;
      display: flex;
      align-items: center;
      justify-content: center;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(0, 0, 0, 0.6);
    }
    .sf-settings__container {
      width: 350px;
      min-height: 100px;
      background: #f3f3f3;
      color: #1c1c1c;
      padding: 10px;
      border-radius: 5px;
    }
    .sf-settings__header {
      text-align: center;
      padding: 0 5px 5px;
      margin-bottom: 10px;
      font-size: 14px;
      border-bottom: 1px dashed #ccc;
    }
    .sf-settings__desc {
      font-size: 10px;
      color: #333;
    }
    .sf-settings__desc ul {
      margin: 4px 0 0 0;
      padding: 0 0 10px 13px;
      border-bottom: 1px dashed #ccc;
    }
    .sf-settings__desc ul a {
      color: #ff8c00;
      text-decoration: none;
    }
    .sf-settings__row {
      padding: 5px 0;
      border-bottom: 1px dashed #ccc;
    }
    .sf-settings__row:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }
    .sf-settings__label {
      display: inline-block;
      vertical-align: middle;
      width: 70px;
      text-align: right;
      padding-right: 5px;
    }
    .sf-settings__input {
      display: inline-block;
      vertical-align: middle;
      width: 260px;
      padding: 3px;
    }
    .sf-settings__text {
      padding: 3px 0;
      font-size: 9px;
      color: #ababab;
      margin-left: 78px;
    }
    .sf-settings__save {
      margin: 0 auto;
      display: block;
    }
    #sf-extra-fields-row td.row1 {
      display: flex;
      justify-content: space-evenly;
      user-select: none;
    }
    #sf-extra-fields-row td.row1 input[type='checkbox'] {
      margin-right: 5px;
    }
    #sf-extra-fields-row td.row1 input[type='checkbox'],
    #sf-extra-fields-row td.row1 label{
      cursor: pointer;
    }
    #sf-comp-screenshots-row td.row1 {
      display: flex;
    }
    #sf-comparison-boxes {
      display: flex;
      flex-grow: 1;
      flex-wrap: wrap;
      gap: 5px;
      width: 0;
    }
    #sf-comparison-boxes div {
      flex-grow: 1;
      flex-basis: 49%;
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 1px;
    }
    #sf-comparison-boxes div input {
      width: 45%;
      flex-basis: 48%;
      flex-grow: 1;
      height: 16px;
    }
    #sf-comparison-boxes div textarea {
      width: 45%;
      flex-grow: 1;
      /*min-height: 149px;*/
      max-width: 644px;
    }
    /*#sf-comparison-boxes div:nth-child(2n) {
      margin-left: 5px;
    }*/
    #sf-comparison-buttons {
      display: flex;
      flex-direction: column;
    }

    #add-comparison-button,
    #remove-comparison-button {
      background-color: transparent;
      border: 0px;
      color: #61625d;
      font-size: 16px;
      box-shadow: inset 0px 0px 2px;
      margin-block: 2px;
      margin: 1px -4px 1px 1px;
      width: 20px;
      flex-grow: 1;
    }
    #add-comparison-button:hover,
    #remove-comparison-button:hover{
      color: white;
    }
    .hidden {
      display: none !important;
    };
          `;
      let style = document.createElement("style");

      if (style.styleSheet) {
        style.styleSheet.cssText = css;
      } else {
        style.appendChild(document.createTextNode(css));
      }
      document.getElementsByTagName("head")[0].appendChild(style);
    },
    btnAutoFill: () => {
      let btn = document.createElement("button");
      btn.innerHTML = "Auto Fill";
      btn.style.marginLeft = "5px";
      ShadowForm.fields.txtImdbLink.after(btn);
      return btn;
    },
    btnFillForm: () => {
      let btn = document.createElement("button");
      btn.innerText = "Fill Form";
      btn.style.float = "right";
      ShadowForm.fields.ddlType.after(btn);
      ShadowForm.fields.btnFillForm = btn;
      btn.addEventListener("click", ShadowForm.eventHandlers.clickFillForm, false);
      return btn;
    },
    criterionField: () => {
      let tr = document.createElement("tr");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let inp = document.createElement("input");
      td1.classList.add("row2");
      td1.innerText = "Criterion Link";
      td2.classList.add("row1");
      td2.appendChild(inp);
      inp.name = "criterionLink";
      inp.size = 50;
      inp.placeholder = "Only fill if source is criterion!";
      inp.addEventListener("change", ShadowForm.eventHandlers.changeCriterionLink, false);
      tr.appendChild(td1);
      tr.appendChild(td2);
      ShadowForm.fields.formRows[3].insertAdjacentElement("afterend", tr);
      ShadowForm.fields.txtCriterionLink = inp;
      return tr;
    },
    MoCField: () => {
      let tr = document.createElement("tr");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let inp = document.createElement("input");
      let inp1 = document.createElement("input");
      td1.classList.add("row2");
      td1.innerText = "MoC Link";
      td2.classList.add("row1");
      td2.appendChild(inp);
      td2.appendChild(inp1);
      inp.name = "MoCLink";
      inp.size = 50;
      inp.placeholder = "Only fill if source is from Masters of Cinema!";
      inp.addEventListener("change", ShadowForm.eventHandlers.changeMoCLink, false);
      inp1.name = "MoCSpine";
      inp1.size = 3;
      inp1.placeholder = "Spine#";
      inp1.style.marginLeft = "1px";
      tr.appendChild(td1);
      tr.appendChild(td2);
      ShadowForm.fields.formRows[3].insertAdjacentElement("afterend", tr);
      ShadowForm.fields.txtMoCLink = inp;
      ShadowForm.fields.txtMoCSpine = inp1;
      return tr;
    },
    screenshotsRow: () => {
      let tr = document.createElement("tr");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let txt = document.createElement("textarea");
      td1.classList.add("row2");
      td1.innerText = "Screenshots";
      td2.classList.add("row1");
      td2.appendChild(txt);
      txt.name = "screenshots";
      txt.classList.add("torrent_edit");
      txt.placeholder =
        "Drag and Drop or Paste Images here to upload to PTPIMG/IMGBB or paste your own links on separate lines";
      txt.rows = 5;
      txt.cols = 100;
      tr.appendChild(td1);
      tr.appendChild(td2);
      // ShadowForm.fields.txtMediainfo.parentElement.parentElement.insertAdjacentElement(
      //   "afterend",
      //   tr
      // );
      txt.addEventListener("paste", ShadowForm.eventHandlers.pasteScreenshots, false);
      ShadowForm.fields.txtScreenshots = txt;
      ShadowForm.eventHandlers.makeScreenshotsDroppable(txt);
      return tr;
    },
    extraFieldsRow: () => {
      let tr = document.createElement("tr");
      tr.id = "sf-extra-fields-row";
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      td1.classList.add("row2");
      td1.innerText = "Extra Fields";
      td2.classList.add("row1");
      tr.appendChild(td1);
      tr.appendChild(td2);
      td2.appendChild(ShadowForm.create.labeledCheckBox("sf-trailer", "Trailer", "#sf-trailer-row"));
      td2.appendChild(ShadowForm.create.labeledCheckBox("sf-artwork", "Artwork", "#sf-artwork-row"));
      td2.appendChild(ShadowForm.create.labeledCheckBox("sf-notes", "Notes", "#sf-notes-row"));
      td2.appendChild(ShadowForm.create.labeledCheckBox("sf-release-info", "Release Info", "#sf-release-info-row"));
      td2.appendChild(ShadowForm.create.labeledCheckBox("sf-encode-settings", "Encode Settings", "#sf-encode-settings-row"));
      td2.appendChild(ShadowForm.create.labeledCheckBox("sf-comp-screenshots", "Comparison Screenshots", "#sf-comp-screenshots-row"));
      ShadowForm.fields.trExtraFields = tr;
      return tr;
    },
    extraFields: () => {
      let before = ShadowForm.fields.txtScreenshots.parentElement.parentElement;
      before.insertAdjacentElement("afterend", ShadowForm.create.compScreenshotsRow());
      before.insertAdjacentElement("afterend", ShadowForm.create.encodeSettingsRow());
      before.insertAdjacentElement("afterend", ShadowForm.create.releaseInfoRow());
      before.insertAdjacentElement("afterend", ShadowForm.create.notesRow());
      before.insertAdjacentElement("afterend", ShadowForm.create.artworkRow());
      before.insertAdjacentElement("afterend", ShadowForm.create.trailerRow());
    },
    compScreenshotsField: (id, isHidden = false) => {
      // let docuFrag = new DocumentFragment();
      let comp = document.createElement("div");
      let inp = document.createElement("input");
      let inp2 = document.createElement("input");
      let txt = document.createElement("textarea");
      comp.appendChild(inp);
      comp.appendChild(inp2);
      comp.appendChild(txt);

      //       docuFrag.appendChild(inp);
      //       docuFrag.appendChild(inp2);
      //       docuFrag.appendChild(txt);
      // comp.appendChild(docuFrag);
      // docuFrag.append(...comp.childNodes);


      comp.id = "sf-comp-screenshots-" + id;
      comp.style.flexGrow = 1;
      if(isHidden){
        comp.classList.add("hidden");
      }
      inp.placeholder = "Comparison Header";
      inp2.placeholder = "Source - Filtered - Encode";
      txt.name = "sf-comp-screenshots-txt-" + id;
      txt.classList.add("torrent_edit");
      // txt.placeholder =
      //   "Drag and Drop or Paste Images here to upload to PTPIMG/IMGBB. Make sure you fix the bbcode to your liking.\nThis field will be put as is under Screenshots header before the normal screenshots so fix the bbcode and text as you see fit\nExample Template\n[b]Deband/Deblock[/b]\nSource, Filtered, Encode\n[hide][img][/img]\n[img][/img]\n[img][/img][/hide]";
      txt.placeholder = "Drag and Drop or Paste Images here to upload to PTPIMG/IMGBB or paste your own links on separate lines";
      txt.rows = 10;
      txt.style.width = "99%";
      ShadowForm.eventHandlers.makeScreenshotsDroppable(txt);

      ShadowForm.fields.compScreenshots.push(comp);
      return comp;
    },
    compScreenshotsRow: () => {
      let tr = document.createElement("tr");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let flexDiv = document.createElement("div");
      let btnPlus = document.createElement("button");
      let btnMinus = document.createElement("button");
      let btnDiv = document.createElement("div");
      let comp = [];
      [1,2,3,4].forEach((c, index) => {
        let cs = ShadowForm.create.compScreenshotsField(c, index !== 0)
        comp.push(cs);
        flexDiv.appendChild(cs);
      })
      // let comp1 = ShadowForm.create.compScreenshotsField("comp-screenshots1");
      // let comp2 = ShadowForm.create.compScreenshotsField("comp-screenshots2", true);
      // let comp3 = ShadowForm.create.compScreenshotsField("comp-screenshots3", true);
      // let comp4 = ShadowForm.create.compScreenshotsField("comp-screenshots4", true);

      tr.appendChild(td1);
      tr.appendChild(td2);
      td2.appendChild(flexDiv);
      td2.appendChild(btnDiv);
      btnDiv.appendChild(btnMinus);
      btnDiv.appendChild(btnPlus);

      flexDiv.id = "sf-comparison-boxes";
      btnDiv.id = "sf-comparison-buttons";

      tr.id = "sf-comp-screenshots-row"
      tr.classList.add("hidden");

      td1.classList.add("row2");
      td1.innerHTML = "Screenshot <br> Comparisons";
      td2.classList.add("row1");

      btnPlus.innerText = "+";
      btnPlus.id = "add-comparison-button";
      btnMinus.innerText = "-";
      btnMinus.id = "remove-comparison-button";
      btnPlus.addEventListener("click", function (event) {
        event.preventDefault()
        event.stopPropagation()
        for (let c of comp.slice(1)){
          if (c.classList.contains("hidden")) {
            c.classList.remove("hidden");
            break;
          }
        }
      });
      btnMinus.addEventListener("click", function (event) {
        event.preventDefault()
        event.stopPropagation()
        for (let c of comp.slice(1).reverse()){
          if (c.classList.contains("hidden") === false) {
            c.classList.add("hidden");
            break;
          }
        }
      });
      return tr;
    },
    compScreenshotsRowOld: () => {
      let tr = document.createElement("tr");
      tr.id = "sf-comp-screenshots-row"
      tr.classList.add("hidden");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let comp = document.createElement("div");
      let inp = document.createElement("input");
      let txt = document.createElement("textarea");
      let comp2 = document.createElement("div");
      let inp2 = document.createElement("input");
      let txt2 = document.createElement("textarea");
      let btn = document.createElement("button");

      comp.appendChild(inp);
      comp.appendChild(txt);
      comp2.appendChild(inp2);
      comp2.appendChild(txt2);

      td1.classList.add("row2");
      td1.innerHTML = "Screenshot <br> Comparisons";
      td2.classList.add("row1");
      td2.style.display = "flex";
      td2.appendChild(comp);
      td2.appendChild(comp2);
      td2.appendChild(btn);

      comp.style.flexGrow = 1;
      txt.name = "comp-screenshots1";
      txt.classList.add("torrent_edit");
      txt.placeholder =
        "Drag and Drop or Paste Images here to upload to PTPIMG/IMGBB. Make sure you fix the bbcode to your liking.\nThis field will be put as is under Screenshots header before the normal screenshots so fix the bbcode and text as you see fit\nExample Template\n[b]Deband/Deblock[/b]\nSource, Filtered, Encode\n[hide][img][/img]\n[img][/img]\n[img][/img][/hide]";
      txt.rows = 10;
      txt.style.width = "99%";
      // txt.style.flexGrow = 1;
      // txt.style.marginRight = "5px"
      // txt.cols = 100;
      comp2.style.flexGrow = 1;
      txt2.name = "comp-screenshots2";
      txt2.classList.add("torrent_edit");
      txt2.placeholder =
        "Drag and Drop or Paste Images here to upload to PTPIMG/IMGBB. Make sure you fix the bbcode to your liking.\nThis field will be put as is under Screenshots header before the normal screenshots so fix the bbcode and text as you see fit\nExample Template\n[b]Deband/Deblock[/b]\nSource, Filtered, Encode\n[hide][img][/img]\n[img][/img]\n[img][/img][/hide]";
      txt2.rows = 10;
      txt2.style.width = "99%";
      comp2.classList.add("hidden");

      btn.innerText = "+";
      btn.id = "add-comparison-button";

      btn.addEventListener("click", function (event) {
        event.preventDefault()
        event.stopPropagation()
        if(comp2.classList.contains("hidden")) {
          comp2.classList.remove("hidden");
          this.innerText = "-";
          comp.style.marginRight = "5px";
        } else {
          comp2.classList.add("hidden");
          this.innerText = "+";
          comp.style.marginRight = "0px";
        }
      })

      tr.appendChild(td1);
      tr.appendChild(td2);
      txt.addEventListener("paste", ShadowForm.eventHandlers.pasteScreenshots, false);
      ShadowForm.fields.txtCompScreenshots = txt;
      ShadowForm.eventHandlers.makeScreenshotsDroppable(txt);
      return tr;
    },
    trailerRow: () => {
      let tr = document.createElement("tr");
      tr.id = "sf-trailer-row";
      tr.classList.add("hidden");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let txt = document.createElement("input");
      td1.classList.add("row2");
      td1.innerHTML = "Trailer";
      td2.classList.add("row1");
      td2.appendChild(txt);
      txt.name = "trailer";
      txt.size = 50;
      txt.placeholder = "Youtube or Vimeo Trailer";
      tr.appendChild(td1);
      tr.appendChild(td2);
      ShadowForm.fields.txtTrailer = txt;
      return tr;
    },
    artworkRow: () => {
      let tr = document.createElement("tr");
      tr.id = "sf-artwork-row";
      tr.classList.add("hidden");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let txt = document.createElement("textarea");
      td1.classList.add("row2");
      td1.innerHTML = "Extra Artwork";
      td2.classList.add("row1");
      td2.appendChild(txt);
      txt.name = "artwork";
      txt.classList.add("torrent_edit");
      txt.placeholder =
        "Drag and Drop or Paste Images here to upload to PTPIMG/IMGBB or paste your own links on separate lines";
      txt.rows = 5;
      txt.cols = 100;
      tr.appendChild(td1);
      tr.appendChild(td2);
      txt.addEventListener("paste", ShadowForm.eventHandlers.pasteScreenshots, false);
      ShadowForm.fields.txtArtwork = txt;
      ShadowForm.eventHandlers.makeScreenshotsDroppable(txt);
      return tr;
    },
    encodeSettingsRow: () => {
      let tr = document.createElement("tr");
      tr.id = "sf-encode-settings-row";
      tr.classList.add("hidden");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let txt = document.createElement("textarea");
      td1.classList.add("row2");
      td1.innerHTML = "Encode Settings";
      td2.classList.add("row1");
      td2.appendChild(txt);
      txt.name = "encode-settings";
      txt.classList.add("torrent_edit");
      txt.placeholder =
        "This field will be placed inside a hidden [box] tag so enter the bbcode and text that you see fit";
      txt.rows = 5;
      txt.cols = 100;
      tr.appendChild(td1);
      tr.appendChild(td2);
      ShadowForm.fields.txtEncodeSettings = txt;
      return tr;
    },
    notesRow: () => {
      let tr = document.createElement("tr");
      tr.id = "sf-notes-row";
      tr.classList.add("hidden");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let txt = document.createElement("textarea");
      td1.classList.add("row2");
      td1.innerHTML = "Notes";
      td2.classList.add("row1");
      td2.appendChild(txt);
      txt.name = "encode-settings";
      txt.classList.add("torrent_edit");
      txt.placeholder =
        "This field will be placed inside a hidden [box] tag so enter the bbcode and text that you see fit";
      txt.rows = 5;
      txt.cols = 100;
      tr.appendChild(td1);
      tr.appendChild(td2);
      ShadowForm.fields.txtNotes = txt;
      return tr;
    },
    releaseInfoRow: () => {
      let tr = document.createElement("tr");
      tr.id = "sf-release-info-row";
      tr.classList.add("hidden");
      let td1 = document.createElement("td");
      let td2 = document.createElement("td");
      let txt = document.createElement("textarea");
      td1.classList.add("row2");
      td1.innerHTML = "Release Info";
      td2.classList.add("row1");
      td2.appendChild(txt);
      txt.name = "release-info";
      txt.classList.add("torrent_edit");
      txt.placeholder =
        "This field will be placed inside a hidden [box] tag so enter the bbcode and text that you see fit";
      txt.rows = 5;
      txt.cols = 100;
      tr.appendChild(td1);
      tr.appendChild(td2);
      ShadowForm.fields.txtReleaseInfo = txt;
      return tr;
    },
    shadowForm: () => {
      ShadowForm.create.stylesheet();
      // ShadowForm.create.btnAutoFill();
      ShadowForm.create.MoCField();
      ShadowForm.create.criterionField();
      ShadowForm.create.alertDiv();
      // Put MediaInfo Row before Descripttion
      ShadowForm.fields.txtMediainfo.parentElement.parentElement.insertAdjacentElement(
        "afterend",
        ShadowForm.fields.txtDescription.parentElement.parentElement
      );
      ShadowForm.fields.txtMediainfo.parentElement.parentElement.querySelector("td.row2").appendChild(ShadowForm.create.chkMediaInfo());
      let screenshotsRow = ShadowForm.create.screenshotsRow();
      ShadowForm.fields.txtMediainfo.parentElement.parentElement.insertAdjacentElement(
        "afterend",
        screenshotsRow
      );
      ShadowForm.create.extraFields();
      screenshotsRow.insertAdjacentElement("afterend", ShadowForm.create.extraFieldsRow());
      if (ShadowForm.common.getReleaseType() == "rtpers" || ShadowForm.common.getReleaseType() == "rtint"){
        ShadowForm.common.checkInternalExtraFields();
      }else {
        ShadowForm.common.clearExtraFields();
      }
      ShadowForm.create.btnFillForm();
      ShadowForm.fields.txtDescription.placeholder =
        "Use the Fill Form Button before manually filling the Description since it will overwirte everything";
      ShadowForm.fields.txtMediainfo.placeholder =
        "Drag and Drop your media file to extract Media Info or paste your Media Info";
      ShadowForm.eventHandlers.makeMediaInfoDroppable(ShadowForm.fields.txtMediainfo);

      // Already existing element EventListeners
      ShadowForm.fields.uplTorrentFile.addEventListener(
        "change",
        ShadowForm.eventHandlers.changeTorrentFile,
        false
      );
      // ShadowForm.fields.txtTorrentName.addEventListener(
      //   "change",
      //   ShadowForm.eventHandlers.changeTorrentName,
      //   false
      // );
      ShadowForm.fields.txtImdbLink.addEventListener(
        "change",
        ShadowForm.eventHandlers.changeIMDBLink,
        false
      );
      ShadowForm.fields.txtMediainfo.addEventListener(
        "change",
        ShadowForm.eventHandlers.changeMediaInfo,
        false
      );
      for(const rt of ShadowForm.fields.rbReleaseTypes) {
        // console.log(rt);
        rt.addEventListener("change", ShadowForm.eventHandlers.changeReleaseType);
      }
    },
    alertDiv: () => {
      if (document.querySelector("#sfAlert") != null) {
        return document.querySelector("#sfAlert");
      }
      let divAlert = document.createElement("div");
      divAlert.id = "sfAlert";
      ShadowForm.fields.alertPosition.insertAdjacentElement("afterend", divAlert);
      return divAlert;
    },
    alert: (type, message) => {
      const divAlert = ShadowForm.create.alertDiv();
      let p = document.createElement("p");
      p.className = "sf" + type;
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      divAlert.appendChild(p);
      return p;
    },
    torrentAlert: (type, message) => {
      let p = document.createElement("p");
      p.className = "sf" + type;
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      ShadowForm.fields.alertTorrentPosition.appendChild(p);
      return p;
    },
    chkMediaInfo: () => {
      let chk = document.createElement("input");
      chk.type = "checkbox";
      chk.id = "mediainfo-checkbox";
      ShadowForm.fields.chkMediaInfo = chk;
      return chk;
    },
    labeledCheckBox: (id, text, rowId) => {
      let temp = new DocumentFragment();
      let span = document.createElement("span");
      let chk = document.createElement("input");
      chk.id = id;
      chk.type = "checkbox";
      chk.addEventListener("change", function() {ShadowForm.eventHandlers.changeEFCheckBox(rowId)});
      let lbl = document.createElement("label");
      lbl.htmlFor = id;
      lbl.innerText = text;
      span.appendChild(chk);
      span.appendChild(lbl);
      temp.appendChild(span);
      // temp.appendChild(lbl);
      return temp;
    },
  },
  alert: {
    createFormAlertDiv: () => {
      if (document.querySelector("#sfAlert") != null) {
        return document.querySelector("#sfAlert");
      }
      let divAlert = document.createElement("div");
      divAlert.id = "sfAlert";
      ShadowForm.fields.alertPosition.insertAdjacentElement("afterend", divAlert);
      return divAlert;
    },
    createFormAlert: (type, message) => {
      const divAlert = ShadowForm.alert.createFormAlertDiv();
      let p = document.createElement("p");
      p.className = "sf" + type;
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      divAlert.appendChild(p);
      return p;
    },
    createTorrentAlert: (type, message) => {
      let p = document.createElement("p");
      p.className = "sf" + type;
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.alertTorrentPosition.appendChild(p);
    },
    clearFormAlert: () => {
      const divAlert = document.querySelector("#sfAlert");
      if (divAlert == null) return;
      divAlert.remove();
    },
    clearTorrentAlert: () => {
      const a = ShadowForm.fields.alertTorrentPosition.querySelectorAll("[class^='sf']");
      if (a.length === 0) return;
      for (const i of a) {
        i.remove();
      }
    },
    createTorrentNameAlert: (type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.txtTorrentName.after(p);
    },
    createIMDBLinkAlert: (type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.txtImdbLink.after(p);
    },
    createCriterionAlert: (type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.txtCriterionLink.after(p);
    },
    createMoCAlert: (type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.txtMoCLink.after(p);
    },
    createMediaInfoAlert: (type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.txtMediainfo.before(p);
    },
    createScreenshotAlert: (type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.txtScreenshots.before(p);
    },
    createDescriptionAlert: (type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      ShadowForm.fields.txtDescription.before(p);
    },
    createAlertBefore: (element, type, message) => {
      const p = document.createElement("p");
      p.classList.add("sf" + type);
      p.innerHTML = `<strong>${type}:</strong> ${message}`;
      p.style.margin = 0;
      element.before(p);
    },
    clearFieldAlerts: (elem) => {
      // console.log(elem);
      elem.parentElement.querySelectorAll("[class^='sf']").forEach((el) => el.remove());
    },
    clearAll: () => {
      ShadowForm.alert.clearFormAlert();
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtTorrentName);
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtImdbLink);
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtCriterionLink);
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtMoCLink);
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtMediainfo);
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtScreenshots);
      ShadowForm.alert.clearFieldAlerts(ShadowForm.fields.txtDescription);
    },
  },
  common: {
    getTorrentName: () => {
      return ShadowForm.fields.txtTorrentName.value.trim();
    },
    fillTorrentName: (name) => {
      ShadowForm.fields.txtTorrentName.value = name.trim();
    },
    getImdbLink: () => {
      return ShadowForm.fields.txtImdbLink.value.trim();
    },
    setImdbLink: (input) => {
      ShadowForm.fields.txtImdbLink.value = input.trim();
    },
    getCriterionLink: () => {
      return ShadowForm.fields.txtCriterionLink.value.trim() || "";
    },
    setCriterionLink: (input) => {
      ShadowForm.fields.txtCriterionLink.value = input.trim();
    },
    getMoCLink: () => {
      return ShadowForm.fields.txtMoCLink.value.trim() || "";
    },
    getMoCSpine: () => {
      return ShadowForm.fields.txtMoCSpine.value.trim() || "";
    },
    setMoCLink: (input) => {
      ShadowForm.fields.txtMoCLink.value = input.trim();
    },
    setMoCSpine: (input) => {
      ShadowForm.fields.txtMoCSpine.value = input.trim();
    },
    getMediaInfo: () => {
      return ShadowForm.fields.txtMediainfo.value.trim();
    },
    isMediaInfoChecked: () => {
      return ShadowForm.fields.chkMediaInfo.checked;
    },
    setMediaInfo: (input) => {
      ShadowForm.fields.txtMediainfo.value = input.trim();
    },
    getScreenshots: () => {
      return ShadowForm.fields.txtScreenshots.value.trim();
    },
    setScreenshots: (input) => {
      ShadowForm.fields.txtScreenshots.value = input.trim();
    },
    fillScreenshots: (input) => {
      let lines = input.split("\n");
      for (const line of lines) {
        if (ShadowForm.common.getScreenshots()) {
          if (ShadowForm.common.getScreenshots().includes(line.trim())) {
            continue;
          }
          ShadowForm.common.setScreenshots(ShadowForm.common.getScreenshots() + "\n" + line);
        } else {
          ShadowForm.common.setScreenshots(input);
        }
      }
    },
    fillDescription: (desc) => {
      ShadowForm.fields.txtDescription.value = desc.trim();
    },
    clearDescription: () => {
      ShadowForm.fields.txtDescription.value = "";
    },
    setType: (media) => {
      // movie HD: 68, movie SD: 67, tv: 65
      if (media.info.media_type === "tv") {
        ShadowForm.fields.ddlType.value = ShadowForm.TYPES.TV;
      } else if (media.info.media_type === "movie") {
        const w = media.getMediaInfoWidthValue();
        const h = media.getMediaInfoHeightValue();
        const res = w * h;
        if (!res) {
          ShadowForm.fields.ddlType.value = ShadowForm.TYPES.DEFAULT;
          return;
        }
        if (res > 680000) {
          ShadowForm.fields.ddlType.value = ShadowForm.TYPES.MOVIEHD;
        } else {
          ShadowForm.fields.ddlType.value = ShadowForm.TYPES.MOVIESD;
        }
      } else {
        ShadowForm.fields.ddlType.value = ShadowForm.TYPES.DEFAULT;
      }
      // if (type.toLocaleLowerCase() === "tv") {
      //   ShadowForm.fields.ddlType.value = ShadowForm.TYPES.TV;
      // } else if (type.toLocaleLowerCase() === "movie") {
      //   switch (resolution.toLocaleLowerCase()) {
      //     case "720p":
      //     case "1080p":
      //     case "2160p":
      //       ShadowForm.fields.ddlType.value = ShadowForm.TYPES.MOVIEHD;
      //       break;
      //     case "480p":
      //     case "pal":
      //     case "ntsc":
      //       ShadowForm.fields.ddlType.value = ShadowForm.TYPES.MOVIESD;
      //       break;
      //     default:
      //       ShadowForm.fields.ddlType.value = ShadowForm.TYPES.DEFAULT;
      //   }
      // } else {
      //   ShadowForm.fields.ddlType.value = ShadowForm.TYPES.DEFAULT;
      // }
    },
    getCollectionSelectedTexts: () => {
      let output = [];
      ShadowForm.fields.ddlCollections.forEach((i) => {
        if (i.selectedIndex !== 0) output.push(i.selectedOptions[0].text);
      });
      return output;
    },
    inCollection: (name) => {
      for (const i of ShadowForm.fields.ddlCollection1) {
        if (i.text.toLowerCase() === name.toLowerCase()) {
          return i.value;
        }
      }
      return 0;
    },
    fillCollectionsInOrder: (media) => {
      let PrimaryValues = [
        ...media.getDirectorNames(),
        ...media.getCompanyNames(),
        ShadowForm.common.getCriterionCollectionRange(media),
        media.hasCriterionBoxSet() && !media.hasCriterionSpine() ? "Criterion Box Sets" : "",
        media.info.media_type === "tv" ? "TV Packs" : "",
        media.isDocumentary() ? "Documentaries" : "",
        // ...media.getNetworkNames().map(name => {
        //     if(name === "Amazon"){
        //         return "Amazon Studios";
        //     }
        //     return name;
        // })
      ];
      let SecondaryValues = [
        media.getOriginCountry().replace("GB", "UK"),
        ...media.getCountryIsos(),
      ];

      let TertiaryValues = [
        media.torrentInfo.release_group,
        media.torrentInfo.resolution === "2160p" ? "4k" : "",
      ];
      ShadowForm.common.fillCollections(PrimaryValues, ShadowForm.COLLECTION_PRIORITY.PRIMARY);
      ShadowForm.common.fillCollections(SecondaryValues, ShadowForm.COLLECTION_PRIORITY.SECONDARY);
      ShadowForm.common.fillCollections(TertiaryValues, ShadowForm.COLLECTION_PRIORITY.TERTIARY);
    },
    fillCollections: (values, collection = ShadowForm.COLLECTION_PRIORITY.PRIMARY) => {
      let start = collection;
      // filter out values that already are selected
      values = values.filter(
        (i) =>
        i &&
        !ShadowForm.common
        .getCollectionSelectedTexts()
        .map((t) => t.toLowerCase())
        .includes(i.toLowerCase())
      );
      for (const v of values) {
        for (let i = start; i < ShadowForm.fields.ddlCollections.length; i++) {
          if (ShadowForm.fields.ddlCollections[i].selectedIndex !== 0) continue;
          ShadowForm.fields.ddlCollections[i].value = ShadowForm.common.inCollection(v);
          break;
        }
      }
    },
    clearCollections: () => {
      for (const i of ShadowForm.fields.ddlCollections) {
        i.value = 0;
      }
    },
    getCriterionCollectionRange: (data) => {
      if (!data.isCriterion() || !data.hasCriterionSpine()) {
        return "";
      }
      if (Number(data.getCriterionSpine() <= 100)) {
        return "Criterion 0001-0100";
      } else if (Number(data.getCriterionSpine() <= 200)) {
        return "Criterion 0101-0200";
      } else if (Number(data.getCriterionSpine() <= 300)) {
        return "Criterion 0201-0300";
      } else if (Number(data.getCriterionSpine() <= 400)) {
        return "Criterion 0301-0400";
      } else if (Number(data.getCriterionSpine() <= 500)) {
        return "Criterion 0401-0500";
      } else if (Number(data.getCriterionSpine() <= 600)) {
        return "Criterion 0501-0600";
      } else if (Number(data.getCriterionSpine() <= 700)) {
        return "Criterion 0601-0700";
      } else if (Number(data.getCriterionSpine() <= 800)) {
        return "Criterion 0701-0800";
      } else if (Number(data.getCriterionSpine() <= 900)) {
        return "Criterion 0801-0900";
      } else if (Number(data.getCriterionSpine() <= 1000)) {
        return "Criterion 0901-1000";
      } else if (Number(data.getCriterionSpine() <= 1100)) {
        return "Criterion 1001-1100";
      } else {
        return "";
      }
    },
    cleanTorrentName: (torrent) => {
      // strip path from string
      let name = torrent.trim().split("\\").pop().split("/").pop();
      // strip the extensions from the end of the string
      name = name
        .replace(".avi.torrent", "")
        .replace(".mk3d.torrent", "")
        .replace(".m2ts.torrent", "")
        .replace(".mkv.torrent", "")
        .replace(".mp4.torrent", "")
        .replace(".torrent", "");
      // strip PTP torrent name (filname.MKV.123456)
      name = name.replace(
        /(?:\.(?:mkv|MKV|mp4|MP4|m2ts|M2TS|mk3d|MK3D|avi|AVI)){0,1}\.\d{4,}$/g,
        ""
      );
      // remove the (1) from the end of the string
      name = name.replace(/(?:\(\d*\))*$/g, "");
      // strip the -dddddd from the end of torrent names like beydonhd's
      name = name.replace(/-\d+$/g, "");
      // strip the [TrackerTag] from the beginning of the string
      name = name.replace(/^\[\S+\]/g, "");
      return name;
    },
    txtLoading: (el) => {
      el.classList.add("ssLoading");
      el.disabled = true;
      ShadowForm.fields.btnFillForm.disabled = true;
    },
    txtDone: (el) => {
      el.classList.remove("ssLoading");
      el.disabled = false;
      ShadowForm.fields.btnFillForm.disabled = false;
    },
    checkUrl: (url) => {
      if (!url) {
        return false;
      }
      const imdbRe = new RegExp(
        `(?:(?:http(?:s)?:\\/\\/)?(?:www.)?imdb\\.com\\/title\\/)?(?<id>tt\\d{7,8})`
      );
      const tmdbUrlRe = new RegExp(
        `(?:http(?:s)?:\\/\\/)?(?:www.)?themoviedb\\.org\\/(?<media_type>\\S+)\\/(?<id>\\d+)`
      );
      const tmdbIdRe = new RegExp(`^(?<media_type>m|t|tv)(?<id>\\d+)`);
      if (imdbRe.test(url) || tmdbUrlRe.test(url) || tmdbIdRe.test(url)) {
        return true;
      } else {
        return false;
      }
    },
    getReleaseType: () => {
      let selected = [...ShadowForm.fields.rbReleaseTypes].filter(rb => rb.checked);
      return selected[0].value;
    },
    checkInternalExtraFields: () => {
      document.querySelector("#sf-encode-settings").checked = true;
      document.querySelector("#sf-encode-settings").disabled = true;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-encode-settings-row", true);
      document.querySelector("#sf-release-info").checked = true;
      document.querySelector("#sf-release-info").disabled = true;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-release-info-row", true);
      document.querySelector("#sf-comp-screenshots").checked = true;
      document.querySelector("#sf-comp-screenshots").disabled = true;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-comp-screenshots-row", true);

    },
    clearExtraFields: () => {
      document.querySelector("#sf-trailer").checked = false;
      document.querySelector("#sf-trailer").disabled = false;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-trailer-row", false);
      document.querySelector("#sf-artwork").checked = false;
      document.querySelector("#sf-artwork").disabled = false;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-artwork-row", false);
      document.querySelector("#sf-notes").checked = false;
      document.querySelector("#sf-notes").disabled = false;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-notes-row", false);
      document.querySelector("#sf-encode-settings").checked = false;
      document.querySelector("#sf-encode-settings").disabled = false;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-encode-settings-row", false);
      document.querySelector("#sf-release-info").checked = false;
      document.querySelector("#sf-release-info").disabled = false;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-release-info-row", false);
      document.querySelector("#sf-comp-screenshots").checked = false;
      document.querySelector("#sf-comp-screenshots").disabled = false;
      ShadowForm.eventHandlers.changeEFCheckBox("#sf-comp-screenshots-row", false);

    },
    getTrailer: () => {
      if (ShadowForm.fields.txtTrailer.parentElement.parentElement.classList.contains("hidden")) {
        return "";
      }
      return ShadowForm.fields.txtTrailer.value.trim()
    },
    setTrailer: (inp) => {
      ShadowForm.fields.txtTrailer.value = inp.trim()
    },
    getArtwork: () => {
      if (ShadowForm.fields.txtArtwork.parentElement.parentElement.classList.contains("hidden")) {
        return "";
      }
      return ShadowForm.fields.txtArtwork.value.trim()
    },
    getNotes: () => {
      if (ShadowForm.fields.txtNotes.parentElement.parentElement.classList.contains("hidden")) {
        return "";
      }
      return ShadowForm.fields.txtNotes.value.trim()
    },
    getEncodeSettings: () => {
      if (ShadowForm.fields.txtEncodeSettings.parentElement.parentElement.classList.contains("hidden")) {
        return "";
      }
      return ShadowForm.fields.txtEncodeSettings.value.trim()
    },
    getReleaseInfo: () => {
      if (ShadowForm.fields.txtReleaseInfo.parentElement.parentElement.classList.contains("hidden")) {
        return "";
      }
      return ShadowForm.fields.txtReleaseInfo.value.trim()
    },
    getCompScreenshots: () => {
      // if (ShadowForm.fields.txtCompScreenshots.parentElement.parentElement.classList.contains("hidden")) {
      //   return "";
      // }
      // return ShadowForm.fields.txtCompScreenshots.value.trim()
      let output = [];
      ShadowForm.fields.compScreenshots.forEach((comp)=>{
        if (comp.classList.contains("hidden") || [...comp.childNodes].every(c => !c.value.trim())) {
          return;
        }
        output.push({
          header: comp.childNodes[0].value.trim(),
          subheader: comp.childNodes[1].value.trim(),
          screenshots: comp.childNodes[2].value.trim().split("\n"),
        });
      });
      return output;
    },
    resetShadowForm: () => {
      ShadowForm.fields.txtDescription.value = "";
      ShadowForm.fields.txtMediainfo.value = "";
      // ShadowForm.fields.txtCriterionLink.value = "";
      ShadowForm.fields.ddlType.value = ShadowForm.TYPES.DEFAULT;
      ShadowForm.common.clearCollections();
    },
  },
  template: {
    createNfoEntry: function (key, value, padLength = 20, padChar = ".") {
      if (!value) return "";
      return `${key.padEnd(padLength, padChar)}: ${value.trim()}\n`;
    },
    createMediaInfoTemplate: function (mediainfo) {
      if (Object.keys(mediainfo).length === 0) {
        return "";
      }
      let templateDetails = {};
      templateDetails.General = {};
      templateDetails.General["File Name"] = mediainfo.General["Complete Name"];
      templateDetails.General.Container = mediainfo.General.Format;
      templateDetails.General["File Size"] = mediainfo.General["File Size"];
      templateDetails.General.Runtime = mediainfo.General.Duration;
      templateDetails.General["Overall Bit Rate"] = mediainfo.General["Overall Bit Rate"];
      templateDetails.Video = [];
      if (Object.keys(mediainfo).includes("Video")) {
        for (const i of mediainfo.Video) {
          const {
            groups: { crf },
          } = /\/\s(?<crf>crf=\d{1,2}(?:\.\d{1,2})?)\s\//gi.exec(i["Encode Settings"]) || {
            groups: { crf: "" },
          };
          templateDetails.Video.push({
            Codec: i.Format || "",
            "Format Profile": i["Format Profile"] || "",
            "Bit Depth": i["Bit Depth"] || "",
            Type: i["Scan Type"] || "",
            Crf: crf,
            Resolution: `${i.Width.replace(" pixels", "").replace(" ", "")}x${i.Height.replace(
              " pixels",
              ""
            ).replace(" ", "")}`,
            "Aspect Ratio": i["Display Aspect Ratio"] || "",
            "Bit Rate": i["Bit Rate"] || "",
          });
        }
      }
      if (Object.keys(mediainfo).includes("Audio")) {
        templateDetails.Audio = [];
        for (const i of mediainfo.Audio) {
          templateDetails.Audio.push({
            Format: i.Format || "",
            "Commercial Name": i["Commercial Name"] || "",
            "Channel Layout": i["Channel Layout"] || "",
            Channels: i["Channel(s)"] || "",
            Language: i.Language || "",
            "Bit Rate": i["Bit Rate"] || "",
            Title: i.Title || "",
          });
        }
      }
      if (Object.keys(mediainfo).includes("Text")) {
        templateDetails.Subtitles = [];
        for (const i of mediainfo.Text) {
          templateDetails.Subtitles.push({
            Language: i.Language || "",
            Format: i.Format || "",
            Default: i.Default || "",
            Forced: i.Forced || "",
          });
        }
      }

      //Output Template
      let output = "";
      output = Object.entries(templateDetails.General).reduce((acc, value) => {
        value[0] = value[0].padEnd(20, ".");
        return acc + "\n" + value.join(": ");
      }, "");
      if (Object.keys(templateDetails).includes("Video")) {
        output += "\n\nVideo\n";
        const video = templateDetails.Video;
        if (video.length === 1) {
          const codec = [video[0].Codec, video[0]["Format Profile"], video[0]["Bit Depth"]]
          .filter((i) => i)
          .join(" | ");
          const type = [video[0].Type, video[0].Crf].filter((i) => i).join(" | ");
          output += ShadowForm.template.createNfoEntry("Codec", codec);
          output += ShadowForm.template.createNfoEntry("Type", type);
          output += ShadowForm.template.createNfoEntry("Resolution", video[0].Resolution);
          output += ShadowForm.template.createNfoEntry("Aspect Ratio", video[0]["Aspect Ratio"]);
          output += ShadowForm.template.createNfoEntry("Bit Rate", video[0]["Bit Rate"]);
        } else if (video.length > 1) {
          for (const [i, v] of video.entries()) {
            output += ShadowForm.template.createNfoEntry(
              `Track #${i + 1}`,
              Object.entries(v).reduce((acc, value) => {
                return (acc ? `${acc} / ` : "") + value[1];
              }, "")
            );
          }
        }
      }
      if (Object.keys(templateDetails).includes("Audio")) {
        output += "\n\nAudio\n";
        const audio = templateDetails.Audio;
        if (audio.length === 1) {
          output += Object.entries(audio[0]).reduce((acc, value) => {
            if (!value[1]) return acc + "";
            value[0] = value[0].padEnd(20, ".");
            return (acc ? acc + "\n" : acc) + value.join(": ");
          }, "");
        } else if (audio.length > 1) {
          for (const [i, v] of audio.entries()) {
            output += `Track #${i + 1}`.padEnd(20, ".") + ": ";
            output +=
              [v.Language, v.Format, v.Channels.replace("channels", "ch"), v["Bit Rate"], v.Title]
              .filter((i) => i)
              .join(" / ") + "\n";
          }
        }
      }
      if (Object.keys(templateDetails).includes("Subtitles")) {
        output += "\n\nSubtitles: ";
        output += templateDetails.Subtitles.reduce((acc, value) => {
          let temp = "";
          if (value.Default === "Yes") {
            temp += "D ";
          }
          if (value.Forced === "Yes") {
            temp += "F";
          }
          if (temp) {
            temp = ` (${temp.trim().replace(" ", ",")})`;
          }
          return (acc ? `${acc} | ` : "") + value.Language + temp;
        }, "");
      }
      return output;
    },
    createTemplateRatings: function (info, extra) {
      if (typeof info == "undefined" || !info || typeof info.ratings == "undefined" || typeof info.site_urls == "undefined") {
        return "";
      }
      // const siteLogos = {
      //   criterion: "https://i.ibb.co/fkRVSwM/criterion-logo.png",
      //   imdb: "https://i.ibb.co/2v3tFtS/imdb-logo-16.png",
      //   rotten_tomatoes: "https://i.ibb.co/NmdfPkg/rt-logo-16.png",
      //   tmdb: "https://i.ibb.co/9Gd0Xqy/tmdb-logo-16.png",
      //   metacritic: "https://i.ibb.co/12XrY13/metacritic-logo-16.png",
      // };
      const siteLogos = {
        moc: "https://i.ibb.co/tpmstMf/eureka.png",
        criterion: "https://shadowthein.net/pic/criterion.png",
        imdb: "https://shadowthein.net/pic/imdb.png",
        rotten_tomatoes: "https://shadowthein.net/pic/rottent.png",
        tmdb: "https://shadowthein.net/pic/tmdb.png",
        metacritic: "https://shadowthein.net/pic/metacritic.png",
      };
      let temp = "";
      let ratingList = [];
      for (const site in siteLogos) {
        if (!info.ratings[site] && !info.site_urls[site]) {
          continue;
        }
        temp = "";
        temp = BBCode.Img(siteLogos[site]);
        if (info.site_urls[site]) {
          temp = BBCode.Url(info.site_urls[site], temp);
        }
        if (info.ratings[site] && info.ratings[site] !== "0") {
          temp += `  ${BBCode.Size(4, BBCode.Bold(info.ratings[site]))}`;
        }
        //   if (!info.ratings[site]) continue;
        //   temp = `${BBCode.Img(siteLogos[site])}  ${BBCode.Size(
        //     4,
        //     BBCode.Bold(info.ratings[site])
        //   )}`;
        //   if (info.site_urls[site]) {
        //     temp = BBCode.Url(info.site_urls[site], temp);
        //   }
        ratingList.push(temp);
      }
      let extraSiteLogos = {
        moc: "https://i.ibb.co/tpmstMf/eureka.png",
      };
      if(extra){
        for ( let [k,v] of Object.entries(extra)) {
          temp = BBCode.Img(extraSiteLogos[k]);
          if(v.url){
            temp = BBCode.Url(v.url,temp);
          }
          if(v.rating){
            temp += `  ${BBCode.Size(4,BBCode.Bold(v.rating))}`;
            ratingList.push(temp);
          }else if (v.spine){
            temp += `  ${BBCode.Size(4,BBCode.Bold(`#${v.spine}`))}`;
            ratingList = [temp, ...ratingList];
          }
        };
      }
      return ratingList.join("   ");
    },
    createInfoTemplate: function (data) {
      let output = [];
      let directorField = "";
      let directors = "";
      switch (data.info.media_type) {
        case "movie":
          directors = data.getDirectorNames().join(", ");
          directorField = "Director" + (data.getDirectorNames().length > 1 ? "s" : "");
          break;
        case "tv":
          directors = data.getCreatorNames().join(", ");
          directorField = "Creator" + (data.getCreatorNames().length > 1 ? "s" : "");
          break;
      }
      const countries = data
      .getCountryNames()
      .map((country) => {
        if (country.includes("United States")) {
          return "US";
        }
        if (country.includes("United Kingdom")) {
          return "UK";
        }
        return country;
      })
      .join(", ");
      // const countries = data.getCountryIsos().join(", ");
      const countryField = data.getCountryIsos().length > 1 ? "Countries" : "Country";
      const languageField =
            "Language" + (data.getSpokenLanguagesEnglishNames().length > 1 ? "s" : "");
      const languages = data.getSpokenLanguagesEnglishNames().join(", ");
      const runtime = data.info.runtime ? `${data.info.runtime} minutes` : "";
      if (directors) {
        output.push(ShadowForm.template.createInfoItem(directorField, directors));
      }
      if (countries) {
        output.push(ShadowForm.template.createInfoItem(countryField, countries));
      }
      if (data.info.year) {
        output.push(ShadowForm.template.createInfoItem("Year", data.info.year));
      }
      if (runtime) {
        output.push(ShadowForm.template.createInfoItem("Runtime", runtime));
      }
      if (languages) {
        output.push(ShadowForm.template.createInfoItem(languageField, languages));
      }
      if (data.info.criterion_spine) {
        output.push(ShadowForm.template.createInfoItem("Spine", data.info.criterion_spine));
      }
      if (data.hasCriterionBoxSet() && data.getCriterionBoxSetSpine()) {
        output.push(
          ShadowForm.template.createInfoItem("Box Set Spine", data.getCriterionBoxSetSpine())
        );
      }
      return output.join("\n");
    },
    createUrlImg: function (imgUrl) {
      return BBCode.Url(imgUrl, BBCode.Img(imgUrl));
    },
    createInfoItem: function (emphasis, text) {
      return `${BBCode.Color("Silver", BBCode.Bold(emphasis + ":"))} ${text}`;
    },
    createHeader: function (content) {
      return BBCode.Color("DarkOrange", BBCode.Size(4, BBCode.Bold(content)));
    },
    createSubHeader: function (title, content , isBoxed = true) {
      if (!content) {
        return "";
      }
      if (isBoxed) {
        content = `[box]${content}[/box]`;
      }
      return `[font=Fixedsys][color=DarkOrange][size=3]${title}[/size][/color][/font]  [hide]${content}[/hide]     `;
    },
    createCompactTemplate: async function (data, extraInfo) {
      if (!data.success) return "";
      let output = "";
      let poster_url = "";
      try {
        if (data.info.criterion_poster_url) {
          ({ url: poster_url } = await Utilities.createImage(data.info.criterion_poster_url));
        } else if (data.info.poster_url) {
          ({ url: poster_url } = await Utilities.createImage(data.info.poster_url));
        } else {
          poster_url = "";
          ShadowForm.alert.createDescriptionAlert(
            "Error",
            "Insufficient Information retrieved, please check the autofilled description for missing info and manually fill"
          );
        }
      } catch {
        ShadowForm.alert.createDescriptionAlert("Error", "Problem occured uploading link to IMGBB");
      } finally {
        ShadowForm.common.txtDone(ShadowForm.fields.txtDescription);
      }
      let screenshots = "";
      if (data.screenshots) {
        screenshots = data.screenshots
          .map((ss) => {
          if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
            return ss;
          }
          return ShadowForm.template.createUrlImg(ss);
        })
          .join("\n");
      }

      let artwork = "";
      if(extraInfo.artwork){
        artwork = extraInfo.artwork.map((ss) => {
          if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
            return ss;
          }
          return ShadowForm.template.createUrlImg(ss);
        })
          .join("\n");
        // artwork = artwork ? BBCode.Hide(artwork) : "";

      }
      let notes = "";
      if (extraInfo.notes) {
        notes = extraInfo.notes.trim();
      }

      let encodeSettings = "";
      if (extraInfo.encode_settings) {
        encodeSettings = extraInfo.encode_settings.trim();
      }

      let releaseInfo = "";
      if (extraInfo.release_info) {
        releaseInfo = extraInfo.release_info.trim();
      }
      let compScreenshots = "";
      if (extraInfo.comp_screenshots.length > 0) {
        // compScreenshots = extraInfo.comp_screenshots.trim() + "\n\n" + BBCode.Bold("Encode");
        extraInfo.comp_screenshots.forEach((item, index) => {
          let cs = item.screenshots.map((ss) => {
            if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
              return ss;
            }
            return ShadowForm.template.createUrlImg(ss);
          }).join("\n");
          compScreenshots += BBCode.Bold(item.header || `Comp ${index+1}`) + "\n" + item.subheader + "\n" + cs + "\n\n";
        });
        compScreenshots = compScreenshots.trim();
      }
      let encodeInfoSection = ""
      if ( notes || encodeSettings || releaseInfo) {
        encodeInfoSection = `[hr][font=Georgia][color=DarkOrange][size=5][b]▼ Encode Info ▼[/b][/size][/color][/font][hr]


    ${ShadowForm.template.createSubHeader("Release Info", releaseInfo)}${ShadowForm.template.createSubHeader("Encode Settings", encodeSettings)}${ShadowForm.template.createSubHeader("Notes", notes)}\n\n\n`;
      }
      let imageSection = "";
      if ( screenshots || compScreenshots || artwork ) {
        imageSection = `[hr][font=Georgia][color=DarkOrange][size=5][b]▼ Images ▼[/b][/size][/color][/font][hr]


    ${ShadowForm.template.createSubHeader("Screenshots", screenshots, false)}${ShadowForm.template.createSubHeader("Comparison Screenshots", compScreenshots, false)}${ShadowForm.template.createSubHeader("Artwork", artwork, false)}
    \n`;
      }

      let trailer = "";
      if(data.getYoutubeTrailerId()){
        trailer = `[youtube]${data.getYoutubeTrailerId()}[/youtube]`;
      } else if(data.getVimeoTrailerId()){
        trailer = `[vimeo]${data.getVimeoTrailerId()}[/vimeo]`;
      }

      output += `[center]
    ${ShadowForm.template.createUrlImg(poster_url)}
    [hr]
    ${ShadowForm.template.createTemplateRatings(data.info, extraInfo.extraLinks)}

    [hr][font=Georgia][color=DarkOrange][size=5][b]▼ Main Info ▼[/b][/size][/color][/font][hr]


    ${ShadowForm.template.createSubHeader("Info", ShadowForm.template.createInfoTemplate(data))}${ShadowForm.template.createSubHeader("Synopsis", data.info.criterion_overview || data.info.overview || "")}${ShadowForm.template.createSubHeader("Trailer", trailer)}


    ${encodeInfoSection}${imageSection}`
      return output.trim() + "\n[/center]";
    },
    createFinalTemplate: async function (data, extraInfo) {
      if (!data.success) return "";
      let output = "";
      let poster_url = "";
      try {
        if (data.info.criterion_poster_url) {
          ({ url: poster_url } = await Utilities.createImage(data.info.criterion_poster_url));
        } else if (data.info.poster_url) {
          ({ url: poster_url } = await Utilities.createImage(data.info.poster_url));
        } else {
          poster_url = "";
          ShadowForm.alert.createDescriptionAlert(
            "Error",
            "Insufficient Information retrieved, please check the autofilled description for missing info and manually fill"
          );
        }
      } catch {
        ShadowForm.alert.createDescriptionAlert("Error", "Problem occured uploading link to IMGBB");
      } finally {
        ShadowForm.common.txtDone(ShadowForm.fields.txtDescription);
      }
      let screenshots = "";
      if (data.screenshots) {
        screenshots = data.screenshots
          .map((ss) => {
          if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
            return ss;
          }
          return ShadowForm.template.createUrlImg(ss);
        })
          .join("\n");
      }
      let trailer = "N/A";
      let ytRe = /(?<=(?:https?\:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.?be)\/|v=)[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]|^[0-9A-Za-z_-]{10}[048AEIMQUYcgkosw]$/i;
      let vimeoRe = /(?<=https?:\/\/vimeo\.com\/)\d+|^\d+$/i;
      // if (extraInfo.trailer){
      //   if (ytRe.test(extraInfo.trailer)) {
      //     trailer = `[youtube]${ytRe.exec(extraInfo.trailer.trim())[0]}[/youtube]`;
      //   }else if (vimeoRe.test(extraInfo.trailer.trim())) {
      //     trailer = `[vimeo]${vimeoRe.exec(extraInfo.trailer)[0]}[/vimeo]`;
      //   }
      // }else
      if(extraInfo.yt_trailer){
        trailer = `[youtube]${extraInfo.yt_trailer}[/youtube]`;
      }else if (extraInfo.vm_trailer) {
        trailer = `[vimeo]${extraInfo.vm_trailer}[/vimeo]`;
      }else if(data.getYoutubeTrailerId()){
        trailer = `[youtube]${data.getYoutubeTrailerId()}[/youtube]`;
      } else if(data.getVimeoTrailerId()){
        trailer = `[vimeo]${data.getVimeoTrailerId()}[/vimeo]`;
      }
      let artwork = "";
      if(extraInfo.artwork){
        artwork = extraInfo.artwork.map((ss) => {
          if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
            return ss;
          }
          return ShadowForm.template.createUrlImg(ss);
        })
          .join("\n");
        artwork = artwork ? "\n" + BBCode.Hide(artwork) : "";

      }
      let notes = "";
      if (extraInfo.notes) {
        notes = extraInfo.notes.trim();
      }

      let encodeSettings = "";
      if (extraInfo.encode_settings) {
        encodeSettings = extraInfo.encode_settings.trim();
      }

      let releaseInfo = "";
      if (extraInfo.release_info) {
        releaseInfo = extraInfo.release_info.trim();
      }
      let encodeInfoSection = ""
      if ( notes || encodeSettings || releaseInfo) {
        encodeInfoSection = `[font=Verdana][color=DarkOrange][size=4][b]⮞ Encode Info ⮜[/b][/size][/color][/font]


    ${ShadowForm.template.createSubHeader("Release Info", releaseInfo)}${ShadowForm.template.createSubHeader("Encode Settings", encodeSettings)}${ShadowForm.template.createSubHeader("Notes", notes)}\n\n\n`;
      }
      let compScreenshots = "";
      if (extraInfo.comp_screenshots.length > 0) {
        // compScreenshots = extraInfo.comp_screenshots.trim() + "\n\n" + BBCode.Bold("Encode");
        extraInfo.comp_screenshots.forEach((item, index) => {
          let cs = item.screenshots.map((ss) => {
            if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
              return ss;
            }
            return ShadowForm.template.createUrlImg(ss);
          }).join("\n");
          compScreenshots += ShadowForm.template.createSubHeader(item.header || `Comp ${index+1}`, `${BBCode.Bold(item.subheader)}\n${cs}`, false);
          compScreenshots += index == 1 ? "\n\n" : ""
        });
      }
      // screenshots = screenshots + "     " + compScreenshots;

      output += `[center]
    ${ShadowForm.template.createUrlImg(poster_url)}${artwork}

    ${ShadowForm.template.createTemplateRatings(data.info, extraInfo.extraLinks)}

    [font=Verdana]
    [box=[size=4]⮞ Information ⮜[/size]][size=2]${ShadowForm.template.createInfoTemplate(
        data
      )}[/size][/box]

    ${ShadowForm.template.createHeader("⮞ Synopsis ⮜")}
    [size=2]${data.info.criterion_overview || data.info.overview || ""}[/size][/font]
    `;
      if (trailer) {
        output += `
    [font=Verdana]${ShadowForm.template.createHeader("⮞ Trailer ⮜")}[/font]
    ${trailer}
    `;
      }
      if (ShadowForm.common.isMediaInfoChecked() && Object.keys(data.mediaInfo).length > 0) {
        output += `
    [font=Verdana]${ShadowForm.template.createHeader("⮞ MediaInfo ⮜")}[/font]
    [font=Courier New][box]${ShadowForm.template.createMediaInfoTemplate(data.mediaInfo)}[/box][/font]`;
      }
      if ( notes || encodeSettings || releaseInfo) {
        output += `
    [font=Verdana][color=DarkOrange][size=4][b]⮞ Encode Info ⮜[/b][/size][/color][/font]

    ${ShadowForm.template.createSubHeader("Release Info", releaseInfo)}${ShadowForm.template.createSubHeader("Encode Settings", encodeSettings)}${ShadowForm.template.createSubHeader("Notes", notes)}\n\n`;
      }
      if (screenshots) {
        output += `
    [font=Verdana]${ShadowForm.template.createHeader("⮞ Screenshots ⮜")}[/font]

    ${ShadowForm.template.createSubHeader("Encode", screenshots, false)}\n\n`;
      }
      if (compScreenshots) {
        output += compScreenshots;
      }
      output += `

    [/center]`;
      output = output
        .split("\n")
        .map((l) => l.trim())
        .join("\n");
      return output;
    },
    createTemplate: async function (data, extraInfo) {
      if (!data.success) return "";
      let output = "";
      let poster_url = "";
      try {
        if (data.info.criterion_poster_url) {
          ({ url: poster_url } = await Utilities.createImage(data.info.criterion_poster_url));
        } else if (data.info.poster_url) {
          ({ url: poster_url } = await Utilities.createImage(data.info.poster_url));
        } else {
          poster_url = "";
          ShadowForm.alert.createDescriptionAlert(
            "Error",
            "Insufficient Information retrieved, please check the autofilled description for missing info and manually fill"
          );
        }
      } catch {
        ShadowForm.alert.createDescriptionAlert("Error", "Problem occured uploading link to IMGBB");
      } finally {
        ShadowForm.common.txtDone(ShadowForm.fields.txtDescription);
      }
      let screenshots = "";
      if (data.screenshots) {
        screenshots = data.screenshots
          .map((ss) => {
          if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
            return ss;
          }
          return ShadowForm.template.createUrlImg(ss);
        })
          .join("\n");
      }

      let artwork = "";
      if(extraInfo.artwork){
        artwork = extraInfo.artwork.map((ss) => {
          if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
            return ss;
          }
          return ShadowForm.template.createUrlImg(ss);
        })
          .join("\n");
        artwork = artwork ? "\n" + BBCode.Hide(artwork) : "";

      }
      let notes = "";
      if (extraInfo.notes) {
        notes = "\n" + ShadowForm.template.createHeader("⮞ Notes ⮜") + "\n" + BBCode.Hide(BBCode.Box("", extraInfo.notes.trim())) + "\n";
      }

      let encodeSettings = "";
      if (extraInfo.encode_settings) {
        encodeSettings = "\n" + ShadowForm.template.createHeader("⮞ Encode Settings ⮜") + "\n" + BBCode.Hide(BBCode.Box("", extraInfo.encode_settings.trim())) + "\n";
      }

      let releaseInfo = "";
      if (extraInfo.release_info) {
        releaseInfo = "\n" + ShadowForm.template.createHeader("⮞ Release Info ⮜") + "\n" + BBCode.Hide(BBCode.Box("", extraInfo.release_info.trim())) + "\n";
      }
      let compScreenshots = "";
      if (extraInfo.comp_screenshots.length > 0) {
        // compScreenshots = extraInfo.comp_screenshots.trim() + "\n\n" + BBCode.Bold("Encode");
        extraInfo.comp_screenshots.forEach((item, index) => {
          let cs = item.screenshots.map((ss) => {
            if (/^(\[url.*\])?\[img.*\].*\[\/img\](\[\/url\])?/gi.test(ss)) {
              return ss;
            }
            return ShadowForm.template.createUrlImg(ss);
          }).join("\n");
          compScreenshots += BBCode.Bold(item.header || `Comp ${index+1}`) + "\n" + item.subheader + "\n" + BBCode.Hide(cs) + "\n\n";
        });
        compScreenshots = compScreenshots.trim() + "\n\n" + BBCode.Bold("Encode");
      }
      let trailer = "";
      if(data.getYoutubeTrailerId()){
        trailer = `[youtube]${data.getYoutubeTrailerId()}[/youtube]`;
      } else if(data.getVimeoTrailerId()){
        trailer = `[vimeo]${data.getVimeoTrailerId()}[/vimeo]`;
      }
      //       let compScreenshots = "";
      //       if (extraInfo.comp_screenshots) {
      //         compScreenshots = extraInfo.comp_screenshots.trim() + "\n\n" + BBCode.Bold("Encode");

      //       }

      output += `[center]
    ${ShadowForm.template.createUrlImg(poster_url)}${artwork}

    ${ShadowForm.template.createTemplateRatings(data.info, extraInfo.extraLinks)}

    [font=Verdana]
    [box=[size=4]⮞ Information ⮜[/size]][size=2]${ShadowForm.template.createInfoTemplate(
        data
      )}[/size][/box]${notes}${releaseInfo}${encodeSettings}

    ${ShadowForm.template.createHeader("⮞ Synopsis ⮜")}
    [size=2]${data.info.criterion_overview || data.info.overview || ""}[/size][/font]
    `;
      if (trailer) {
        output += `
    [font=Verdana]${ShadowForm.template.createHeader("⮞ Trailer ⮜")}[/font]
    &{trailer}
    `;
      }
      if (ShadowForm.common.isMediaInfoChecked() && Object.keys(data.mediaInfo).length > 0) {
        output += `
    [font=Verdana]${ShadowForm.template.createHeader("⮞ MediaInfo ⮜")}[/font]
    [font=Courier New][box]${ShadowForm.template.createMediaInfoTemplate(data.mediaInfo)}[/box][/font]`;
      }
      if (screenshots) {
        output += `[font=Verdana]${ShadowForm.template.createHeader("⮞ Screenshots ⮜")}[/font]
    ${compScreenshots}
    [hide]${screenshots}[/hide]`;
      }
      output += `
    [/center]`;
      output = output
        .split("\n")
        .map((l) => l.trim())
        .join("\n");
      return output;
    },
  },
};

async function checkForSettingsPage() {
  if (window.location.hash === "#!sf-settings") {
    const tmdbKey = await GM.getValue("sf-tmdb-key", "");
    const omdbKey = await GM.getValue("sf-omdb-key", "");
    const imgBbKey = await GM.getValue("sf-imgbb-key", "");
    createSettingsPage(tmdbKey, omdbKey, imgBbKey);

    document.body.classList.add("sf-helper-no-scroll");
    document.getElementById("sf-setting-save").addEventListener("click", () => {
      window.location.hash = "";
    });
  } else {
    const settingsElem = document.getElementById("sf-settings");
    settingsElem && settingsElem.remove();
    document.body.classList.remove("sf-helper-no-scroll");
  }
}

function createSettingsPage(tmdbKey, omdbKey, imgBbKey) {
  const settingsOverlay = document.createElement("div");
  settingsOverlay.id = "sf-settings";
  settingsOverlay.classList.add("sf-settings");
  settingsOverlay.onclick = (event) => {
    if (event.target === settingsOverlay) window.location.hash = "";
  };

  const settingsContainer = document.createElement("div");
  settingsContainer.classList.add("sf-settings__container");
  settingsContainer.innerHTML = `<header class="sf-settings__header">iTS Upload Helper Settings</header>`;

  const desc = document.createElement("div");
  desc.classList.add("sf-settings__desc");
  desc.innerHTML = `To use the iTS Upload Helper, you <strong>must</strong> have these 3 API Keys:
        <ul>
          <li><a href="https://www.themoviedb.org/" target="_blank" rel="noreferrer noopener">TMDb</a></li>
          <li><a href="https://www.omdbapi.com/" target="_blank" rel="noreferrer noopener">OMDb</a></li>
          <li><a href="https://imgbb.com/" target="_blank" rel="noreferrer noopener">ImgBB</a></li>
        </ul>
        <div class="sf-settings__row">
          <label class="sf-settings__label" for="sf-tmdb-key">TMDB API Key</label>
          <input class="sf-settings__input" type="text" id="sf-tmdb-key" spellcheck="false" value="${tmdbKey}" />
          <div class="sf-settings__text">themoviedb.org &gt; Settings &gt; API &gt; API Key (v3 auth)</div>
        </div>
        <div class="sf-settings__row">
          <label class="sf-settings__label" for="sf-omdb-key">OMDB API Key</label>
          <input class="sf-settings__input" type="text" id="sf-omdb-key" spellcheck="false" value="${omdbKey}" />
          <div class="sf-settings__text">omdbapi.com &gt; API Key &gt; Request a Free API Key</div>
        </div>
        <div class="sf-settings__row">
          <label class="sf-settings__label" for="sf-imgbb-key">ImgBB API Key</label>
          <input class="sf-settings__input" type="text" id="sf-imgbb-key" spellcheck="false" value="${imgBbKey}" />
          <div class="sf-settings__text">api.imgbb.com &gt; Add API key</div>
        </div>
        <div class="sf-settings__row">
          <button id="sf-setting-save" class="sf-settings__save">Save</button>
        </div>`;

  settingsContainer.appendChild(desc);
  settingsOverlay.appendChild(settingsContainer);
  document.body.appendChild(settingsOverlay);

  // Listeners
  ["sf-tmdb-key", "sf-omdb-key", "sf-imgbb-key"].forEach((id) => {
    document.getElementById(id).addEventListener("keyup", (event) => {
      const key = event.target.value;
      GM.setValue(id, key);
    });
  });
}

async function GetPtpImgKey() {
  let url = "https://ptpimg.me/";
  let resp = await Utilities.xhrQuery(url, "");
  let input = Utilities.parseHtmlString(resp.responseText, "#api_key");
  if (!input) {
    return;
  }
  console.log(input.value);
  GM.setValue("sf-ptpimg-key", input.value);
}

function createSettingsButton() {
  let a = document.createElement("a");
  a.id = "sf-open-settings";
  a.innerText = "[API Keys]";
  a.href = "#!sf-settings";
  a.style.float = "right";
  a.style.color = "#61625d";
  a.addEventListener("mouseover", () => {a.style.color="#fff"}, false);
  a.addEventListener("mouseout", () => {a.style.color="#61625d"}, false);
  ShadowForm.fields.uplTorrentFile.after(a)
}


// ------------------------------------------------------ MAIN --------------------------------------------------

// Main script runner
(async function () {
  "use strict";

  ShadowForm.create.shadowForm(media);
  createSettingsButton()
  // If we're on the settings page, open it, otherwise start listenening for hash changes to open the settings page
  checkForSettingsPage();
  window.addEventListener("hashchange", checkForSettingsPage, false);

  if (TMDB_API_KEY && OMDB_API_KEY && IMGBB_API_KEY) {
    // ShadowForm.create.shadowForm(media);
    return;
  }
  const ptpImgKey = await GM.getValue("sf-ptpimg-key", "");
  if (ptpImgKey === "") {
    await GetPtpImgKey();
  } else {
    Utilities.ptpimg_key = ptpImgKey;
  }
  // if we don't have one of our required keys, open settings now
  const tmdbKey = await GM.getValue("sf-tmdb-key", "");
  const omdbKey = await GM.getValue("sf-omdb-key", "");
  const imgBbKey = await GM.getValue("sf-imgbb-key", "");
  // console.log(imgBbKey);

  if (tmdbKey === "" || omdbKey === "" || (ptpImgKey === "" && imgBbKey === "")) {
    // window.location.hash = "#!sf-settings";
  } else {
    tmdb.config.api_key = tmdbKey;
    omdb.config.api_key = omdbKey;
    Utilities.imgbb_key = imgBbKey;
  }
})();
