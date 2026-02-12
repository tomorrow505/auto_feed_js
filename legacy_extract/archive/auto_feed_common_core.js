// ==UserScript==
// @name         auto_feed
// @author       tomorrow505
// @thanks       感谢宝大、86大佬、贝壳等大佬提供邀请码;感谢宝大、86大佬提供友情赞助;感谢86大佬、手大、kmeng、黑白、甘蔗等大佬赠予PTP积分.
// @contributor  daoshuailx/hollips/kmeng/wyyqyl/shmt86/sauterne
// @description  PT一键转种脚本
// @connect *
// @match        https://blutopia.cc/torrents?imdb=tt*
// @namespace    https://greasyfork.org/zh-CN/scripts/424132-auto-feed
// @updateURL    https://greasyfork.org/zh-CN/scripts/424132-auto-feed
// @match        http*://*/*detail*.php*
// @match        https://nzbs.in/*
// @match        http*://*/detail*.php*
// @match        http*://*/upload*php*
// @match        https://pixhost.to*
// @match        https://*/upload/*
// @match        https://*.open.cd/plugin_upload.php*
// @match        https://www.myanonamouse.net/t/*
// @match        https://img.hdbits.org/
// @match        http*://*/offer*php*
// @match        https://star-space.net/*upload.php
// @match        http*://*.tieba.baidu.com/*
// @match        https://xthor.tk/*
// @match        https://house-of-usenet.com/threads/*
// @match        https://omgwtfnzbs.org/details*
// @match        https://speedapp.io/browse/*
// @match        https://torrent.desi/torrents*
// @match        https://www.imdb.com/title/tt*
// @match        https://hdf.world/*
// @match        https://kp.m-team.cc/detail/*
// @match        https://kp.m-team.cc/upload*
// @match        https://next.m-team.cc/upload*
// @match        https://next.m-team.cc/detail*
// @match        https://rousi.pro/upload*
// @match        https://blutopia.cc/torrents/create*
// @match        https://secret-cinema.pw/torrents.php?id=*
// @match        https://filelist.io/*
// @match        https://bluebird-hd.org/*
// @match        https://iptorrents.com/torrent.php?id=*
// @match        http*://hd-space.org/index.php?page=torrent-details*
// @match        https://digitalcore.club/torrent/*
// @match        http*://ptpimg.me*
// @match        https://imgbox.com*
// @match        https://www.imagebam.com/*
// @match        https://bangumi.tv/subject/*
// @match        https://sportscult.org/*
// @match        https://totheglory.im/*
// @match        https://hd-space.org/index.php?page=upload
// @match        https://hdcity.city/upload*
// @match        https://hdbits.org/upload*
// @match        https://hdbits.org/browse*
// @match        https://nebulance.io/torrents.php?id=*
// @match        https://hd-only.org/*
// @match        https://jpopsuki.eu/torrents.php*
// @match        https://passthepopcorn.me/*
// @match        https://hd-torrents.org/torrents.php*
// @match        https://greatposterwall.com/torrents.php*
// @match        https://broadcasthe.net/*.php*
// @match        https://backup.landof.tv/*.php*
// @match        https://beyond-hd.me/upload*
// @match        http*://beyond-hd.me/library/*
// @match        https://*/usercp.php?action=personal*
// @match        https://uhdbits.org/torrents.php*
// @match        https://blutopia.cc/torrents/create/*
// @match        https://eiga.moi/upload/*
// @match        http*://totheglory.im/t/*
// @match        http*://privatehd.to/torrent/*
// @match        http*://avistaz.to/torrent/*
// @match        http*://cinemaz.to/torrent/*
// @match        https://zhuque.in/torrent/*
// @match        https://www.yemapt.org/*
// @match        https://beyond-hd.me/download_check/*
// @match        http*://passthepopcorn.me/torrents.php?id*
// @match        http*://*php?id=*&torrentid=*
// @match        http*://*/*php?id=*&torrentid=*
// @match        http*://www.morethantv.me/torrents.php?id=*
// @match        https://*php?torrentid=*&id=*
// @match        https://hdbits.org/details.php?id=*
// @match        https://hdf.world/torrents.php*
// @match        http*://beyond-hd.me/torrents/*
// @match        https://*.douban.com/subject/*
// @match        https://filelist.io/browse.php*
// @match        http*://www.torrentleech.org/torrent/*
// @match        http*://www.torrentleech.me/torrent/*
// @match        http*://www.torrentleech.cc/torrent/*
// @match        http*://www.tlgetin.cc/torrent/*
// @match        http*://*/torrents/*
// @match        https://*/torrents?imdb*
// @match        https://broadcasthe.net/friends.php
// @exclude      http*bitpt.cn*
// @match        http*://*redacted.sh/upload.php*
// @match        http*://*redacted.sh/requests.php*
// @match        http*://*redacted.sh/torrents.php*
// @match        https://c.pc.qq.com/middlem.html?pfurl=*
// @require      https://unpkg.com/@popperjs/core@2/dist/umd/popper.min.js
// @require      https://unpkg.com/tippy.js@6/dist/tippy-bundle.umd.js
// @require      https://greasyfork.org/scripts/453166-jquery/code/jquery.js?version=1105525
// @require      https://greasyfork.org/scripts/28502-jquery-ui-v1-11-4/code/jQuery%20UI%20-%20v1114.js?version=187735
// @require      https://greasyfork.org/scripts/430180-imgcheckbox2/code/imgCheckbox2.js?version=956211
// @require      https://greasyfork.org/scripts/444988-music-helper/code/music-helper.js?version=1268106
// @icon         https://kp.m-team.cc//favicon.ico
// @run-at       document-end
// @version      2.1.0.5
// @grant        GM_xmlhttpRequest
// @grant        GM_setClipboard
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_download
// @grant        GM_getResourceText
// @license      GPL-3.0 License
// @grant        GM_addStyle
// ==/UserScript==

/*
日志：

    2022年6月以前的日志请参看："https://github.com/tomorrow505/auto_feed_js/wiki/更新日志"
    20220604：修复海豹部分bug，修复piggo部分bug。优化禁转判断后跳转逻辑。
    20220605：新增图片提取功能：https://github.com/tomorrow505/auto_feed_js/wiki/图片处理
    20220606：适配BTN另一个网址：https://backup.landof.tv/
    20220608：适配PTChina。
    20220612：ptgen若无豆瓣词条，可以获取imdb信息。
    20220705：清洗种子部分内容并且适配外站转种直接发布。
    20220706：适配多站发布完之后自动下载种子……(该部分还需要测试)
    20220707：修复种子加载之后无效文件名的bug，修复BLU改版引起的bug. 优化洗种逻辑，适配WT-Sakura,冬樱。
    20220708：适配支持TVV转出。
    20220710：优化皮转入，修复GPW部分bug，简单支持一键签到(测试中)。
    20220716：继续完善一键签到。修复部分bug。
    20220726：支持MP4/MKV视频文件获取mediainfo+截图。功能待测试(已取消)...https://unpkg.com/auto-feed-media@1.0.1/index.js
    20220730：适配MV类型转发，修复部分bug。
    20220802：支持转入ITZMX、HDPt(明教)，修复1PTBA部分bug。(by shmt86)
    20220807：一键签到取消天空和北洋，增加支持妞的转入。具体见教程：https://github.com/tomorrow505/auto_feed_js/wiki/%E8%BD%AC%E8%BD%BD%E5%88%B0BTN
    20220808：适配海豚从gz音乐站转入。
    20220816：适配OPS/RED从GZ音乐站转入。修复部分bug。
    20220820：适配sugoimusic转出，修复部分bug。
    20220920：支持HDT备用域名，支持CG转入，待测试。修复部分bug。
    20221013：适配monika，修复部分bug。
    20221021：适配织梦PT，修复部分bug。
    20221117：修复部分bug，去掉mediainfo和截图功能，鸡肋而且占用体积大。修复没有猫不能进入设置页面的bug。第一次NP站点应该都可以设置。
    20221128：适配DTR/HONE转出。

    20230103：修复部分bug。
    20230208：稍加完整适配朱雀。
    20230413：修复部分bug，去掉一些关闭了的站。
    20230511：适配转入 RS (西电睿思)。
    20230708：修复部分bug。适配RouSi(by shmt86)。
    20240526：适配新架构站点YemaPT(by lorentz)。
*/

function decodeSiteURL() {
  var url = new URL(location.href);
  url.hash = decodeURIComponent(url.hash);
  return decodeURI(url.toString())
}

var site_url = decodeSiteURL();
const TIMEOUT = 6000;
const N = "\n";
var evt = document.createEvent("HTMLEvents");
evt.initEvent("change", false, true);
this.$ = this.jQuery = jQuery.noConflict(true);

jQuery.fn.wait = function (func, times, interval) {
  var _times = times || 100, //100次
    _interval = interval || 20, //20毫秒每次
    _self = this,
    _selector = this.selector, //选择器
    _iIntervalID; //定时器id
  if (this.length) { //如果已经获取到了，就直接执行函数
    func && func.call(this);
  } else {
    _iIntervalID = setInterval(function () {
      if (!_times) { //是0就退出
        clearInterval(_iIntervalID);
      }
      _times <= 0 || _times--; //如果是正数就 --
      _self = $(_selector); //再次选择
      if (_self.length) { //判断是否取到
        func && func.call(_self);
        clearInterval(_iIntervalID);
      }
    }, _interval);
  }
  return this;
}

function mutation_observer(target, func) {
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  const observer = new MutationObserver(mutationList =>
    mutationList.filter(m => m.type === 'childList').forEach(m => {
      try {
        m.addedNodes.forEach(func());
      } catch (Err) { }
    }
    ));
  observer.observe(target, { childList: true, subtree: true });
}

//---------------------------- ant-design-filler -----------------------------------
// 遍历元素属性，查找 React FiberNode
function getReactFiberNode(element) {
  for (let key in element) {
    if (key.startsWith("__reactFiber")) {
      return element[key];
    }
  }
  return null;
}

// 递归遍历 FiberNode，查找 React 组件实例对象
function getReactComponentInstance(fiberNode) {
  if (fiberNode?.stateNode && fiberNode?.stateNode.hasOwnProperty("state")) {
    return fiberNode?.stateNode;
  }
  let child = fiberNode?.child;
  while (child) {
    instance = getReactComponentInstance(child);
    if (instance) {
      return instance;
    }
    child = child.sibling;
  }
  return null;
}

var ant_form_instance = null;
var hdb_color = 'black';

// [Site Logic: HDB]

GM_addStyle(
  `.content th {
        font-weight:bold;
        color: ${hdb_color};
        background-color:transparent;
        padding:4px 10px 4px 0;
        border:0;
        vertical-align:top
    }
    .content td {
        padding:4px 20px 4px 1px
    }
    .contentlayout {
        width:100%
    }
    .contentlayout td {
        border:0;
        vertical-align:top
    }
    .contentlayout h1 {
        margin:0 0 14px 15px
    }
    .contentlayout h3 {
        margin:-14px 0 5px 15px;
        color:gray
    }`
);

/*******************************************************************************************************************
*                                          part 0 简单页面逻辑                                                       *
********************************************************************************************************************/
//修复妞站friend页面两个表列宽不等的问题
if (site_url == 'https://broadcasthe.net/friends.php' || site_url == 'https://backup.landof.tv/friends.php') {
  $('.main_column').find('td:contains("Last seen")').css({ 'width': '150px' });
  return;
}
if (site_url == 'https://npupt.com/upload.php') {
  return;
}
if (site_url.match(/^.{3,30}userdetail/i) && !site_url.match(/bluebird-hd/)) {
  return;
}

if (site_url.match(/^https:\/\/www.yemapt.org/) && !site_url.match(/add\?/)) {
  return;
}

// [Site Logic: NZBS]
  return;
}

// 清除PT吧里边的广告
if (site_url.match(/^https?:\/\/.*tieba.baidu.com.*/)) {
  mutation_observer(document, function () {
    $('div[class*="clearfix"]').wait(function () {
      $('div[class="clearfix thread_item_box"]').hide();
      $('div[class="l_post l_post_bright j_l_post clearfix"]').has('span:contains("立即查看")').hide();
      $('img[data-locate="点击关闭"]').click();
      $('#aside-ad').hide();
    });
    $('div[id*="mediago-tb"]').wait(function () {
      $('div[id*="mediago-tb"]').hide();
    });
    $('div[id*="ad-container"]').wait(function () {
      $('div[id*="ad-container"]').hide();
    });
  });
  return;
}

// [Site Logic: ZHUQUE]

function disableother(select, target) {
  if (document.getElementById(select).value == 0) {
    document.getElementById(target).disabled = false;
  } else {
    document.getElementById(target).disabled = true;
    document.getElementById(select).disabled = false;
  }
}

function get_bgmdata(url, func) {
  getDoc(url, null, function (doc) {
    var poster = 'https:' + $('#bangumiInfo', doc).find('img:first').attr('src');
    var story = $('#subject_summary', doc).text();
    var staff = Array.from($('#infobox li', doc).has('a')).map(e => {
      return $(e).text();
    }).join('\n');
    var cast = Array.from($('#browserItemList li', doc)).map(e => {
      if ($(e).find('span.tip').text()) {
        return $(e).find('span.tip').text() + ': ' + $(e).find('a[href*=person]').text();
      } else {
        return $(e).find('a[href*=character]').text().trim() + ': ' + $(e).find('a[href*=person]').text();
      }
    }).join('\n');
    var Cast = "Cast";
    if ($('h2.subtitle:contains("曲目列表")', doc).length) {
      var tracklist = $('h2.subtitle:contains("曲目列表")', doc).next().find('ul').text();
      tracklist = tracklist.split('\n').filter(item => item.trim() !== "").map(item => item.trim()).join('\n');
      cast = tracklist;
      Cast = "Tracklist"
// [Site Logic: 游戏]
    var tmp_descr = `
            [img]${poster}[/img]
            [b]Story: [/b]

            ${story}

            [b]Staff: [/b]
            ${staff}

            [b]${Cast}: [/b]

            ${cast}

            (来源于 ${url} )
        `;
    if (!cast) {
      tmp_descr = tmp_descr.replace('[b]Cast: [/b]', '');
    }
    tmp_descr = tmp_descr.replace(/            /g, '').replace(/\n\n+/g, '\n\n');
    func(tmp_descr);
  });
}

function get_group_name(name, torrent_info) {
  if (typeof (name) != 'string') {
    return 'Null';
  }
  try {
    name = name.replace(/\[.*?\]|web-dl|dts-hd|Blu-ray|MPEG-2|MPEG-4/ig, '');
    name = name.split(/\.mkv|\.mp4|\.iso|\.avi/)[0];
    if (name.match(/(KJNU|tomorrow505|KG|BMDru|BobDobbs|Dusictv|AFKI)$/i)) {
      return name.match(/(KJNU|tomorrow505|KG|BMDru|BobDobbs|Dusictv|AFKI)$/i)[1];
    }
    tmp_name = name.match(/-(.*)/)[1].split(/-/).pop();
    if (tmp_name.match(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i)) {
      if (torrent_info.match(/Scene/)) {
        name = name.split('-')[0];
      } else {
        tmp_name = tmp_name.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVD9|DVD5/i);
        if (tmp_name.length > 1) {
          name = tmp_name.pop();
        } else {
          name = 'Null';
        }
      }
    } else {
      name = tmp_name;
    }
  } catch (err) {
    name = name.split(/AC3|[\. ]DD[\. \+p]|AAC|x264|x265|h.264|h.265|NTSC|PAL|DVDRip|DVD9|DVD5/i);
    if (name.length > 1) {
      name = name.pop();
    } else {
      name = 'Null';
    }
  }
  name = name.trim();
  if (!name || name.match(/\)|^\d\d/)) name = 'Null';
  if (name == 'Z0N3') name = 'D-Z0N3';
  if (name == 'AVC.ZONE') name = 'ZONE';
  if (name.match(/CultFilms/)) name = 'CultFilms™';
  if (name.match(/™/) && !name.match(/CultFilms/)) {
    name = 'Null';
  }
  if (name.search('.nfo')) {
    name = name.replace('.nfo', '');
  }
  if (name.match(/[_\.! ]/) || name.match(/Extras/i)) {
    name = 'Null';
  }
  if (name.length == 1 || name.match(/^\d+$/)) {
    name = 'Null';
  }
  return name;
}

if (site_url.match(/^https:\/\/greatposterwall.com\/torrents.php.*/)) {
  if (location.href.match(/id=\d+/)) {
    var number = parseInt($('tr.TableTorrent-rowDetail').length / 2);
    $(`tr.TableTorrent-rowDetail:lt(${number + 1})`).each((index, e) => {
      var tid = $(e).attr('id').match(/\d+/)[0];
      var torrent_name = $(e).find('a:contains(详情)').parent().text().split('详情 | ')[1];
      var torrent_info = $(e).prev().find('td').text();
      torrent_name = get_group_name(torrent_name, torrent_info);
      if (torrent_name == 'Unknown' && torrent_info.match(/Blu-ray/)) {
        show_files(tid, 'detail');
        $(e).find('table[class="TableTorrentFileList Table"]').wait(function () {
          var torrent_td = $(e).find('table[class="TableTorrentFileList Table"]').find('tr:first').find('td:first');
          torrent_name = torrent_td.text().replace(/\//g, '');
          torrent_name = get_group_name(torrent_name, torrent_info);
          $(`#torrent${tid}`).find('span.TorrentTitle ').append(`/<span style="font-weight:bold;color:#20B2AA">${torrent_name}</span>`);
          show_files(tid, 'detail');
        });
      } else {
        $(e).prev().find('span.TorrentTitle ').append(` / <span style="font-weight:bold;color:#20B2AA">${torrent_name}</span>`);
      }
    });
  } else {
    $('td.is-name[colspan="3"]').each((index, e) => {
      var torrent = $(e).find('a[href*="torrentid"]');
      var torrent_name = torrent.attr('data-tooltip');
      torrent_name = get_group_name(torrent_name, '');
      torrent.append(` / <span style="font-weight:bold;color:#20B2AA">${torrent_name}</span>`);
    })
  }
}

// 解决qq打开链接非官方不跳转的问题
if (site_url.match(/^https:\/\/c.pc.qq.com\/middlem.html\?pfurl=.*/)) {
  var url = decodeURIComponent(location.href).match(/pfurl=(.*?)&pf/)[1];
  window.location.href = url;
  return;
}
if (site_url.match(/^https:\/\/filelist.io\/browse.php/)) {
  $('input[name="search"]').attr('placeholder', 'Search by key-word or IMDB...');
  $('input[type="submit"]').attr('value', 'Go!');
  $('input[onclick*=catlist]').attr('value', 'Category');

  $('select[name="searchin"]').find('option:eq(0)').text('Name and Description');
  $('select[name="searchin"]').find('option:eq(1)').text('Name');
  $('select[name="searchin"]').find('option:eq(2)').text('Description');

  $('select[name="cat"]').find('option:eq(21)').text('Series 4K');
  $('select[name="cat"]').find('option:eq(22)').text('Series HD');
  $('select[name="cat"]').find('option:eq(23)').text('Series SD');

  $('select[name="sort"]').find('option:eq(1)').text('Relevante');
  $('select[name="sort"]').find('option:eq(3)').text('Size');

  var dict_info = {
    'toate': 'Total',
    'Anime': 'Animates',
    'Desene': 'Drawings',
    'Diverse': 'Other',
    'Filme': 'Film',
    'Jocuri Console': 'Console Games',
    'Jocuri PC': 'PC Games',
    'Seriale': 'Series'
  }
  $('input[name="cats[]"]').map((index, e) => {
    var category = $(e).parent().find('a').text();
    for (key in dict_info) {
      category = category.replace(key, dict_info[key]);
    }
    $(e).parent().find('a').text(category);
  });
  $('select[name="cat"]').find('option').map((index, e) => {
    var category = $(e).text();
    for (key in dict_info) {
      category = category.replace(key, dict_info[key]);
    }
    $(e).text(category);
  });

  return;
}

function getFiletype(file) {
  if (file == 'jpg') {
    file = 'jpeg'
  }
  return 'image/' + file;
}

function getImage(url) {
  var p = new Promise(function (resolve, reject) {
    var filetype = getFiletype(url.match(/\.(jpg|jpeg|webp|png)$/)[1]);
    var name = url.split('/').pop();
    getBlob(url, null, null, filetype, function (data) {
      const blob = data.data;
      const file = new window.File([blob], name, { type: blob.type });
      resolve(file);
    });

  });
  return p;
}

//获取ptpimg的apikey自动的
// [Site Logic: PTP]

// [Site Logic: HDB]

// [Site Logic: PTP]

if (site_url.match(/^https:\/\/hdf\.world\/.*/)) {
  var menu_html = $('#header').html();
  menu_html = menu_html.replace(/Accueil/, 'Homepage');
  menu_html = menu_html.replace(/Requêtes/, 'Requests');
  menu_html = menu_html.replace(/Règles/, 'Rules');
  menu_html = menu_html.replace(/Acteurs\/Réal\/Product/g, 'Actors/Real/Product');
  menu_html = menu_html.replace(/Journaux/g, 'Newspapers');
  menu_html = menu_html.replace(/Membres/g, 'Members');

  menu_html = menu_html.replace(/Jetons FL/g, 'FL Tokens');
  menu_html = menu_html.replace(/Messagerie/g, 'Messaging');
  menu_html = menu_html.replace(/Mes ups/g, 'My Uploads');
  menu_html = menu_html.replace(/Signets/g, 'Bookmarks');
  menu_html = menu_html.replace(/Abonnements/g, 'Subscriptions');

  menu_html = menu_html.replace(/Editer/g, 'Edit');
  menu_html = menu_html.replace(/Déconnexion/g, 'Logout');
  menu_html = menu_html.replace(/Dons reçu/g, 'Donations received');
  menu_html = menu_html.replace(/Uploader/g, 'Upload');
  menu_html = menu_html.replace(/Envoyé/g, 'Uploaded');
  menu_html = menu_html.replace(/Reçu/g, 'Downloaded');
  menu_html = menu_html.replace(/Requis/g, 'Required');
  menu_html = menu_html.replace(/Envoyé/g, 'Uploaded');
  menu_html = menu_html.replace(/Reçu/g, 'Downloaded');
  $('#header').html(menu_html);
}

//用于修改hdf的显示样式，不喜欢可以删除或者注释掉
if (site_url.match(/^https:\/\/hdf\.world\/torrents\.php/i) && !site_url.match(/torrentid/i)) {
  $('.team_name').each(function () {
    var $span = $(this).parent().next();
    $span.find('a:eq(1)').append(" / --");
    try {
      if ($span.find('a:eq(1)').html().match(/Free/)) {
        $span.parent().css({ 'border-right': '5px solid yellow' });
      }
    } catch (err) { }
    $(this).html(`<font color='red'>${$(this).html()}</font>`);
    $span.find('a:eq(1)').append($(this));
  });

  $('.group_torrent').each(function () {
    try {
      $(this).find('td:eq(1)').css({ "vertical-align": "middle", "text-align": "center" });
      $(this).find('td:eq(0)').find('a:eq(0)').text('DL');
      $(this).find('td:eq(0)').find('a:eq(2)').text('RP');
      var text = $(this).find('td:eq(2)').html();
      text = text.replace('ans', 'years').replace('mois', 'month').replace('heure', 'hour').replace('jour', 'day').replace('semaine', 'week').replace('1 an', '1 year');
      $(this).find('td:eq(2)').html(text);
    } catch (err) { }
  });

  $('.group').each(function () {
    $(this).find('td').css({ "border-top": "2px solid darkgrey" });
    $(this).find('td:lt(2)').remove();
    $(this).find('td:eq(0)').attr("colSpan", "4");
    var text = $(this).find('td:eq(1)').html();
    text = text.replace('ans', 'years').replace('mois', 'month').replace('heure', 'hour').replace('jour', 'day').replace('semaine', 'week').replace('1 an', '1 year');
    $(this).find('td:eq(1)').html(text);
    $(this).find('td:eq(1)').css({ "text-align": "right" });
    $(this).find('a[id*="bookmarklink_torrent"]').text('Bookmark')
  });
  $('.head:gt(2)').hide();
  $('.head:eq(2)').find('strong').text('Research');
  $('#ft_basic_link').find('font:first').text('Basic');
  $('#ft_basic_text').find('font:first').text('Basic');
  $('#ft_advanced_link').find('font').text('Advanced');
  $('#ft_advanced_text').find('font').text('Advanced');

  $('#nav_logout').find('a').text('Logout');
  $('#nav_upload').find('a').text('Upload');
  $('#nav_donate').find('a').text('Donate');

  $('#stats_seeding').find('a').text('Uploaded');
  $('#stats_leeching').find('a').text('Downloaded');
  return;
}
//处理blutopia跳转检索，因为其使用ajax异步检索
if (site_url.match(/(blutopia.cc|darkland.top|eiga.moi|hd-olimpo.club|aither.cc|cinematik.net)\/torrents\?imdb(id)?=.*/)) {
  if (site_url.match(/blutopia.cc/i)) {
    $('div.form-group:contains(IMDb)').find('input').val(site_url.split('=')[1].split('&')[0]);
    $('button.btn-primary:contains(Advanced)').click();
    $('div.form-group:contains(IMDb)').find('input').focus();
  } else {
    $('#imdb').val(site_url.split('=')[1].split('#')[0]);
  }
  return;
}
//处理ptgen跳转，基本上使用频率很少了，不过还是可以在内站作为豆瓣信息不全的时候使用
if (site_url.match(/^https:\/\/api.iyuu.cn\/ptgen\/\?imdb=/)) {
  url = site_url.split('=')[1];
  if (url.match(/tt/i)) {
    req = 'https://movie.douban.com/j/subject_suggest?q=' + url;
    GM_xmlhttpRequest({
      method: 'GET',
      url: req,
      onload: function (res) {
        var response = JSON.parse(res.responseText);
        if (response.length > 0) {
          url = 'https://movie.douban.com/subject/' + response[0].id;
        } else {
          url = 'https://www.imdb.com/title/' + url;
        }
        document.getElementById('input_value').value = url;
        document.getElementById('query_btn').click();
      }
    });
  } else {
    url = 'https://movie.douban.com/subject/' + url + '/';
    document.getElementById('input_value').value = url;
    document.getElementById('query_btn').click();
  }
  return;
}
// [Site Logic: PTP]
if (site_url.match(/^https:\/\/(blutopia.cc|darkland.top|eiga.moi|hd-olimpo.club)\/torrents\/download_check/)) {
  window.open($('a[href*="torrents/download"]').has('i').attr('href'), '_blank');
  return;
}
if (site_url.match(/^https:\/\/totheglory.im\/details.php\?id=\d+&uploaded=1/)) {
  window.open($('a.index:contains(".torrent")').attr("href"), '_blank');
}
if (site_url.match(/^https:\/\/broadcasthe.net\/torrents.php\?id=\d+$/)) {
  if ($('a[href*="action=edit"]').length) {
    $('tr').has('a[href*="action=edit"]').map((index, e) => {
      if ($(e).find('td:eq(3)').text() == '0') {
        window.open($(e).find('a[href*="action=download"]').attr('href'), '_blank');
      }
    });
  }
}
if (site_url.match(/^https:\/\/kp.m-team.cc\/details.php\?id=\d+&uploaded=1/)) {
  window.open($('a[href*="download.php?id="]').attr("href"), '_blank');
  return;
}
if (site_url.match(/^https:\/\/www.morethantv.me\/torrents.php\?id=\d+#separator#/)) {
  var user_page = 'https://www.morethantv.me' + $('#nav_userinfo').find('a:first').attr('href');
  getDoc(user_page, null, function (doc) {
    var turl = $('#torrentsdiv', doc).find('tr:eq(1)').find('td:eq(1)').find('a').attr('href');
    var tid = turl.match(/torrentid=(\d+)/)[1];
    var durl = $(`a[href*="action=download&id=${tid}"]`).attr('href');
    window.open(durl, '_blank');
    return;
  });
}
if (site_url.match(/^https:\/\/secret-cinema.pw\/torrents.php\?id=\d+#separator#/)) {
  var user_page = $('#nav_userinfo').find('a:first').attr('href');
  $('#torrent_details').find('tr[class*=torrentdetails]').map((index, e) => {
    if ($(e).find(`a[href*="${user_page}"]`).length) {
      if ($(e).find('span[class="time tooltip"]').text().match(/^(\d+ mins? ago|Just now)/)) {
        tid = $(e).attr('id').match(/\d+/)[0];
        var durl = $(`a[href*="action=download&id=${tid}"]`).attr('href');
        window.open(durl, '_blank');
      }
    }
  });
}
// [Site Logic: HDB]
if (site_url.match(/^https:\/\/(privatehd|avistaz|cinemaz).to\/torrent\/\d+/)) {
  if ($('strong:contains(There are possible issues with the torrent)').length) {
    var tid = site_url.match(/torrent\/(\d+)/)[1];
    var turl = $(`a[href*="download/torrent/${tid}"]`).attr('href');
    window.open(turl, '_blank');
  }
}
if (site_url.match(/^https:\/\/hd-torrents.org\/upload.php#separator#/)) {
  if ($('td:contains(Upload successful! The torrent has been added.)').length) {
    window.open($('a[href*="download.php?id"]').attr('href'), '_blank');
    return;
  }
}
if (site_url.match(/https:\/\/hd-space.org\/index.php\?page=upload/)) {
  if ($('td:contains(Upload successful! The torrent has been added.)').length) {
    window.open($('a[href*="download.php?id"]').attr('href'), '_blank');
    return;
  }
}
if (site_url.match(/^https:\/\/beyond-hd.me\/download_check\//)) {
  window.open($('a[href*="beyond-hd.me/download"]').has('i').attr('href'), '_blank');
  return;
}
// [Site Logic: HDB]
if (site_url.match(/^https:\/\/karagarga.in\/details.php\?id=\d+&uploaded=1/)) {
  window.open($('a[href*="/down.php/"]').attr('href'), '_blank');
  return;
}
if (site_url.match(/^https:\/\/nebulance.io\/torrents.php\?id=\d+#separator#/)) {
  window.open($('a[href*="action=download&id"]:contains(Download)').attr('href'), '_blank');
  return;
}

/*******************************************************************************************************************
*                                          part 1 变量初始化层                                                       *
********************************************************************************************************************/

//提供可用的获取豆瓣信息两个api，从0-1选择。主要应用于外站，另一个是自动爬取豆瓣页面
const apis = ['https://api.iyuu.cn/App.Movie.Ptgen', 'https://ptgen.tju.pt/infogen'];
var api_chosen = GM_getValue('api_chosen') === undefined ? 3 : GM_getValue('api_chosen');
var tldomain = GM_getValue('tldomain') === undefined ? 0 : GM_getValue('tldomain');
var imdb2db_chosen = GM_getValue('imdb2db_chosen') === undefined ? 0 : GM_getValue('imdb2db_chosen');

//用来转存海报使用的ptpimg的key,打开首页即可获取
var used_ptp_img_key = GM_getValue('used_ptp_img_key') === undefined ? '' : GM_getValue('used_ptp_img_key');

var used_tl_rss_key = GM_getValue('used_tl_rss_key') === undefined ? '' : GM_getValue('used_tl_rss_key');
var douban_poster_rehost = GM_getValue('douban_poster_rehost') === undefined ? 0 : GM_getValue('douban_poster_rehost');

//用来获取TMDB的key，需要使用请自行申请
var used_tmdb_key = GM_getValue('used_tmdb_key') === undefined ? '0f79586eb9d92afa2b7266f7928b055c' : GM_getValue('used_tmdb_key');

//是否匿名，默认开启匿名选项
var if_uplver = GM_getValue('if_uplver') === undefined ? 1 : GM_getValue('if_uplver');

var if_douban_jump = GM_getValue('if_douban_jump') === undefined ? 1 : GM_getValue('if_douban_jump');
var if_imdb_jump = GM_getValue('if_imdb_jump') === undefined ? 1 : GM_getValue('if_imdb_jump');

var remote_server = GM_getValue('remote_server') === undefined ? null : JSON.parse(GM_getValue('remote_server'));

//额外的功能选项
const default_extra_settings = {
  'ptp_show_douban': { 'title': 'PTP中文', 'enable': 1 },
  'ptp_show_group_name': { 'title': 'PTP组名', 'enable': 1 },
  'hdb_show_douban': { 'title': 'HDB中文', 'enable': 1 },
  'hdb_show_discount_color': { 'title': 'HDB折扣', 'enable': 1 },
  'btn_dark_color': { 'title': '妞暗色系', 'enable': 1 },
  'other_douban_info': { 'title': '中文信息', 'enable': 1 },
};
var extra_settings = GM_getValue('extra_settings') === undefined ? default_extra_settings : JSON.parse(GM_getValue('extra_settings'));
if (!extra_settings.hasOwnProperty('btn_dark_color')) {
  extra_settings = default_extra_settings;
}
if (!extra_settings.hasOwnProperty('other_douban_info')) {
  extra_settings.other_douban_info = default_extra_settings.other_douban_info;
}

const all_sites_show_douban = extra_settings.other_douban_info.enable;

var hdb_hide_douban = GM_getValue('hdb_hide_douban') === undefined ? 0 : GM_getValue('hdb_hide_douban');

//0表示前边，1表示后边
var ptp_name_location = GM_getValue('ptp_name_location') === undefined ? 1 : GM_getValue('ptp_name_location');

//支持转发的站点列表，可以自行取消注释
const default_site_info = {
  '13City': { 'url': 'https://13city.org/', 'enable': 1 },
  '1PTBA': { 'url': 'https://1ptba.com/', 'enable': 1 },
  '52PT': { 'url': 'https://52pt.site/', 'enable': 1 },
  'ACM': { 'url': 'https://eiga.moi/', 'enable': 1 },
  'ANT': { 'url': 'https://anthelion.me/', 'enable': 1 },
  'avz': { 'url': 'https://avistaz.to/', 'enable': 1 },
  'Audiences': { 'url': 'https://audiences.me/', 'enable': 1 },
  'BHD': { 'url': 'https://beyond-hd.me/', 'enable': 1 },
  'Aither': { 'url': 'https://aither.cc/', 'enable': 1 },
  'BLU': { 'url': 'https://blutopia.cc/', 'enable': 1 },
  'BTN': { 'url': 'https://broadcasthe.net/', 'enable': 1 },
  'BYR': { 'url': 'https://byr.pt/', 'enable': 1 },
  'BTSchool': { 'url': 'https://pt.btschool.club/', 'enable': 1 },
  'CarPt': { 'url': 'https://carpt.net/', 'enable': 1 },
  'CG': { 'url': 'http://cinemageddon.net/', 'enable': 1 },
  'CMCT': { 'url': "https://springsunday.net/", 'enable': 1 },
  'CNZ': { 'url': 'https://cinemaz.to/', 'enable': 1 },
  'CHDBits': { 'url': "https://ptchdbits.co/", 'enable': 1 },
  'DiscFan': { 'url': 'https://discfan.net/', 'enable': 1 },
  'Dragon': { 'url': 'https://www.dragonhd.xyz/', 'enable': 1 },
  'FreeFarm': { 'url': 'https://pt.0ff.cc/', 'enable': 1 },
  'GPW': { 'url': 'https://greatposterwall.com/', 'enable': 1 },
  'HaiDan': { 'url': 'https://www.haidan.video/', 'enable': 1 },
  'HDArea': { 'url': 'https://hdarea.club/', 'enable': 1 },
  'HDB': { 'url': 'https://hdbits.org/', 'enable': 1 },
  'HDCity': { 'url': 'https://hdcity.city/', 'enable': 1 },
  'HDDolby': { 'url': 'https://www.hddolby.com/', 'enable': 1 },
  'HDF': { 'url': 'https://hdf.world/', 'enable': 1 },
  'HDfans': { 'url': 'http://hdfans.org/', 'enable': 1 },
  'HDHome': { 'url': 'https://hdhome.org/', 'enable': 1 },
  'DarkLand': { 'url': 'https://darkland.top/', 'enable': 1 },
  'HDRoute': { 'url': 'http://hdroute.org/', 'enable': 1 },
  'HDSky': { 'url': 'https://hdsky.me/', 'enable': 1 },
  'HDSpace': { 'url': 'https://hd-space.org/', 'enable': 1 },
  'HDT': { 'url': 'https://hd-torrents.org/', 'enable': 1 },
  'HDTime': { 'url': 'https://hdtime.org/', 'enable': 1 },
  'HDU': { 'url': 'https://pt.upxin.net/', 'enable': 1 },
  'HDVideo': { 'url': 'https://hdvideo.top/', 'enable': 1 },
  'HD-Only': { 'url': 'https://hd-only.org/', 'enable': 1 },
  'HITPT': { 'url': 'https://www.hitpt.com/', 'enable': 1 },
  'HUDBT': { 'url': 'https://hudbt.hust.edu.cn/', 'enable': 1 },
  'iTS': { 'url': 'https://shadowthein.net/', 'enable': 1 },
  'JoyHD': { 'url': 'https://www.joyhd.net/', 'enable': 1 },
  'KG': { 'url': 'https://karagarga.in/', 'enable': 1 },
  'MTeam': { 'url': 'https://kp.m-team.cc/', 'enable': 1 },
  'MTV': { 'url': 'https://www.morethantv.me/', 'enable': 1 },
  'NanYang': { 'url': 'https://nanyangpt.com/', 'enable': 1 },
  'NexusHD': { 'url': 'https://www.nexushd.org/', 'enable': 1 },
  'NBL': { 'url': 'https://nebulance.io/', 'enable': 1 },
  'NPUPT': { 'url': 'https://npupt.com/', 'enable': 1 },
  'OpenCD': { 'url': 'https://open.cd/', 'enable': 1 },
  'OPS': { 'url': 'https://orpheus.network/', 'enable': 1 },
  'Oshen': { 'url': 'http://www.oshen.win/', 'enable': 1 },
  'OurBits': { 'url': 'https://ourbits.club/', 'enable': 1 },
  'PHD': { 'url': 'https://privatehd.to/', 'enable': 1 },
  'PigGo': { 'url': 'https://piggo.me/', 'enable': 1 },
  'PTCafe': { 'url': 'https://ptcafe.club/', 'enable': 1 },
  'PTChina': { 'url': 'https://ptchina.org/', 'enable': 1 },
  'PTer': { 'url': 'https://pterclub.net/', 'enable': 1 },
  'PThome': { 'url': 'https://www.pthome.net/', 'enable': 1 },
  'PTP': { 'url': 'https://passthepopcorn.me/', 'enable': 1 },
  'PTsbao': { 'url': 'https://ptsbao.club/', 'enable': 1 },
  'PTT': { 'url': 'https://www.pttime.org/', 'enable': 1 },
  'PuTao': { 'url': 'https://pt.sjtu.edu.cn/', 'enable': 1 },
  'RED': { 'url': 'https://redacted.sh/', 'enable': 1 },
  'SC': { 'url': 'https://secret-cinema.pw/', 'enable': 1 },
  'SoulVoice': { 'url': 'https://pt.soulvoice.club/', 'enable': 1 },
  'TCCF': { 'url': 'https://et8.org/', 'enable': 1 },
  'Tik': { 'url': 'https://cinematik.net/', 'enable': 1 },
  'TJUPT': { 'url': 'https://www.tjupt.org/', 'enable': 1 },
  'TLFbits': { 'url': 'http://pt.eastgame.org/', 'enable': 1 },
  'TTG': { 'url': 'https://totheglory.im/', 'enable': 1 },
  'TVV': { 'url': 'http://tv-vault.me/', 'enable': 1 },
  'UHD': { 'url': 'https://uhdbits.org/', 'enable': 1 },
  'UltraHD': { 'url': 'https://ultrahd.net/', 'enable': 1 },
  'WT-Sakura': { 'url': 'https://wintersakura.net/', 'enable': 1 },
  'xthor': { 'url': 'https://xthor.tk/', 'enable': 1 },
  'YDY': { 'url': 'https://pt.hdbd.us/', 'enable': 1 },
  'ITZMX': { 'url': 'https://pt.itzmx.com/', 'enable': 1 },
  'Monika': { 'url': 'https://monikadesign.uk/', 'enable': 1 },
  'ZMPT': { 'url': 'https://zmpt.cc/', 'enable': 1 },
  'ICC': { 'url': 'https://www.icc2022.com/', 'enable': 1 },
  'CyanBug': { 'url': 'https://cyanbug.net/', 'enable': 1 },
  'ZHUQUE': { 'url': 'https://zhuque.in/', 'enable': 1 },
  'YemaPT': { 'url': 'https://www.yemapt.org/', 'enable': 1 },
  '海棠': { 'url': 'https://www.htpt.cc/', 'enable': 1 },
  '杏林': { 'url': 'https://xingtan.one/', 'enable': 1 },
  'UBits': { 'url': 'https://ubits.club/', 'enable': 1 },
  'OKPT': { 'url': 'https://www.okpt.net/', 'enable': 1 },
  'GGPT': { 'url': 'https://www.gamegamept.com/', 'enable': 1 },
  'RS': { 'url': 'https://resource.xidian.edu.cn/', 'enable': 1 },
  'Panda': { 'url': 'https://pandapt.net/', 'enable': 1 },
  'KuFei': { 'url': 'https://kufei.org/', 'enable': 1 },
  'RouSi': { 'url': 'https://rousi.pro/', 'enable': 1 },
  'GTK': { 'url': 'https://pt.gtk.pw/', 'enable': 1 },
  '麒麟': { 'url': 'https://www.hdkyl.in/', 'enable': 1 },
  'AGSV': { 'url': 'https://www.agsvpt.com/', 'enable': 1 },
  'ECUST': { 'url': 'https://pt.ecust.pp.ua/', 'enable': 1 },
  'iloli': { 'url': 'https://mua.xloli.cc/', 'enable': 1 },
  'CrabPt': { 'url': 'https://crabpt.vip/', 'enable': 1 },
  'QingWa': { 'url': 'https://qingwapt.com/', 'enable': 1 },
  'FNP': { 'url': 'https://fearnopeer.com/', 'enable': 1 },
  'OnlyEncodes': { 'url': 'https://onlyencodes.cc/', 'enable': 1 },
  'PTFans': { 'url': 'https://ptfans.cc/', 'enable': 1 },
  '影': { 'url': 'https://star-space.net/', 'enable': 1 },
  'PTzone': { 'url': 'https://ptzone.xyz/', 'enable': 1 },
  '雨': { 'url': 'https://raingfh.top/', 'enable': 1 },
  'PTLGS': { 'url': 'https://ptlgs.org/', 'enable': 1 },
  'NJTUPT': { 'url': 'https://njtupt.top/', 'enable': 1 },
  'LemonHD': { 'url': 'https://lemonhd.club/', 'enable': 1 },
  'ReelFliX': { 'url': 'https://reelflix.xyz/', 'enable': 1 },
  'HDClone': { 'url': 'https://pt.hdclone.top/', 'enable': 1 },
  'CDFile': { 'url': 'https://pt.cdfile.org/', 'enable': 1 },
  'HDBAO': { 'url': 'https://hdbao.cc/', 'enable': 1 },
  'AFUN': { 'url': 'https://www.ptlover.cc/', 'enable': 1 },
  'DevTracker': { 'url': 'https://www.devtracker.me/', 'enable': 1 },
  '唐门': { 'url': 'https://tmpt.top/', 'enable': 1 },
  '天枢': { 'url': 'https://dubhe.site/', 'enable': 1 },
  '财神': { 'url': 'https://cspt.top/', 'enable': 1 },
  '星陨阁': { 'url': 'https://pt.xingyungept.org/', 'enable': 1 },
  '樱花': { 'url': 'http://pt.ying.us.kg/', 'enable': 1 },
  '我好闲': { 'url': 'http://whax.net/', 'enable': 1 },
  '下水道': { 'url': 'https://sewerpt.com/', 'enable': 1 },
  '柠檬不甜': { 'url': 'https://lemonhd.net/', 'enable': 1 },
  'RailgunPT': { 'url': 'https://bilibili.download/', 'enable': 1 },
  'MyPT': { 'url': 'https://cc.mypt.cc/', 'enable': 1 },
  'LaJiDui': { 'url': 'https://pt.lajidui.top/', 'enable': 1 },
  'PTSkit': { 'url': 'https://www.ptskit.org/', 'enable': 1 },
  'MARCH': { 'url': 'https://duckboobee.org/', 'enable': 1 },
  'NovaHD': { 'url': 'https://pt.novahd.top/', 'enable': 1 },
  'LuckPT': { 'url': 'https://pt.luckpt.de/', 'enable': 1 },
  'Tokyo': { 'url': 'https://www.tokyopt.xyz/', 'enable': 1 },
  'ALing': { 'url': 'https://pt.aling.de/', 'enable': 1 },
  'LongPT': { 'url': 'https://longpt.org/', 'enable': 1 },
  '藏宝阁': { 'url': 'https://cangbao.ge/', 'enable': 1 },
  '未来幻境': { 'url': 'https://nex.jivon.de/', 'enable': 1 },
  '自然': { 'url': 'http://zrpt.cc/', 'enable': 1 },
  'SBPT': { 'url': 'https://sbpt.link/', 'enable': 1 },
  '慕雪阁': { 'url': 'https://pt.muxuege.org/', 'enable': 1 },
  'YHPP': { 'url': 'https://www.yhpp.cc/', 'enable': 1 },
  '52MOVIE': { 'url': 'https://www.52movie.top/', 'enable': 1 },
  '好学': { 'url': 'https://www.hxpt.org/', 'enable': 1 },
  '躺平': { 'url': 'https://www.tangpt.top/', 'enable': 1 },
  'BaoZi': { 'url': 'https://p.t-baozi.cc/', 'enable': 1 }
};

var chd_use_backup_url = GM_getValue('chd_use_backup_url') === undefined ? 0 : GM_getValue('chd_use_backup_url');
if (chd_use_backup_url) {
  var region_code = GM_getValue('region_code');
  if (region_code) {
    default_site_info.CHDBits.url = `https://${region_code}.chddiy.xyz/`;
  } else {
    fetch('https://ipapi.co/json/') // 发送GET请求到ipapi
      .then(response => response.json()) // 解析响应的JSON数据
      .then(data => {
        region_code = data.region_code.toLowerCase();
        GM_setValue('region_code', region_code);
      })
      .catch(error => {
        console.log("发生错误: " + error);
      }
      );
  }
}

var nhd_use_v6_url = GM_getValue('nhd_use_v6_url') === undefined ? 0 : GM_getValue('nhd_use_v6_url');
if (nhd_use_v6_url) {
  default_site_info.NexusHD.url = `https://v6.nexushd.org/`;
}

//初始化数据site_order/used_site_info等等
var site_order = GM_getValue('site_order') === undefined ? Object.keys(default_site_info).sort() : JSON.parse(GM_getValue('site_order')).split(',');

var used_site_info = GM_getValue('used_site_info');
var if_new_site_added = false;
if (used_site_info === undefined) {
  used_site_info = default_site_info;
  GM_setValue('used_site_info', JSON.stringify(used_site_info));
} else {
  //预防有新加的站点没有加上的。
  used_site_info = JSON.parse(used_site_info);
  for (key in default_site_info) {
    if (!used_site_info.hasOwnProperty(key)) {
      used_site_info[key] = default_site_info[key];
      if_new_site_added = true;
// [Site Logic: Mteam]
    if (site_order.indexOf(key) < 0) {
      site_order.push(key);
    }
  }
  for (key in used_site_info) {
    if (!default_site_info.hasOwnProperty(key)) {
      delete used_site_info[key];
      if (site_order.indexOf(key) >= 0) {
        site_order = site_order.filter(function (item) {
          return item != key;
        });
      }
      if_new_site_added = true;
    }
  }
  site_order = site_order.filter(function (item) {
    if (!default_site_info.hasOwnProperty(item)) {
      return false;
    } else {
      return true;
    }
  });
}
if (if_new_site_added) {
  GM_setValue('used_site_info', JSON.stringify(used_site_info));
  GM_setValue('site_order', JSON.stringify(site_order.join(',')));
}

// 修正北洋、铂金和皇后有www和不带www两个域名。
if (site_url.match(/^http(s)?:\/\/(www.)?(tjupt.org|open.cd|pthome.net)\//)) {
  var site_domain = site_url.match(/^http(s)?:\/\/(www.)?(tjupt.org|open.cd|pthome.net)\//)[0];
  if (site_domain.match(/tjupt/)) {
    used_site_info.TJUPT.url = site_domain;
  } else if (site_domain.match(/pthome/)) {
    used_site_info.PThome.url = site_domain;
  } else {
    used_site_info.OpenCD.url = site_domain;
  }
}

if (site_url.match(/^https:\/\/hdts.ru\/.*/)) {
  used_site_info.HDT.url = 'https://hdts.ru/';
} else if (site_url.match(/^https:\/\/hd-torrents.org\/.*/)) {
  used_site_info.HDT.url = 'https://hd-torrents.org/';
}

if (site_url.match(/^https:\/\/kp.m-team.cc\/.*/)) {
  used_site_info.MTeam.url = 'https://kp.m-team.cc/';
} else if (site_url.match(/^https:\/\/zp.m-team.io\/.*/)) {
  used_site_info.MTeam.url = 'https://zp.m-team.io/';
} else if (site_url.match(/^https:\/\/next.m-team.cc\/.*/)) {
  used_site_info.MTeam.url = 'https://next.m-team.cc/';
}

if (site_url.match(/^https?:\/\/backup.landof.tv\/.*/)) {
  used_site_info.BTN.url = 'https://backup.landof.tv/';
} else if (site_url.match(/^https?:\/\/broadcasthe.net\/.*/)) {
  used_site_info.BTN.url = 'https://broadcasthe.net/';
}
if (site_url.match(/^https?:\/\/(www.)?qingwapt.org\/.*/)) {
  used_site_info.QingWa.url = 'https://www.qingwapt.org/';
} else if (site_url.match(/^https?:\/\/qingwapt.com\/.*/)) {
  used_site_info.QingWa.url = 'https://qingwapt.com/';
}
if (site_url.match(/^https?:\/\/www.agsvpt.com\/.*/)) {
  used_site_info.AGSV.url = 'https://www.agsvpt.com/';
} else if (site_url.match(/^https?:\/\/abroad.agsvpt.com\/.*/)) {
  used_site_info.AGSV.url = 'https://abroad.agsvpt.com/';
} else if (site_url.match(/^https?:\/\/new.agsvpt.com\/.*/)) {
  used_site_info.AGSV.url = 'https://new.agsvpt.com/';
} else if (site_url.match(/^https?:\/\/pt.agsvpt.cn\/.*/)) {
  used_site_info.AGSV.url = 'https://pt.agsvpt.cn/';
} else if (site_url.match(/^https?:\/\/new.agsvpt.cn\/.*/)) {
  used_site_info.AGSV.url = 'https://new.agsvpt.cn/';
}

GM_setValue('used_site_info', JSON.stringify(used_site_info));

//支持快速搜索的默认站点列表，可自行添加，举例：imdbid表示tt123456, imdbno表示123456，search_name表示the big bang thoery
const default_search_list = [
  `<a href="https://passthepopcorn.me/torrents.php?searchstr={imdbid}" target="_blank">PTP</a>`,
  `<a href="https://broadcasthe.net/torrents.php?action=advanced&imdb={imdbid}" target="_blank">BTN</a>`,
  `<a href="https://hdbits.org/browse.php?search={imdbid}" target="_blank">HDB</a>`,
  `<a href="https://karagarga.in/browse.php?search={imdbid}&search_type=imdb" target="_blank">KG</a>`,
  `<a href="http://cinemageddon.net/browse.php?search={imdbid}&proj=0&descr=1" target="_blank">CG</a>`,
  `<a href="https://filelist.io/browse.php?search={imdbid}" target="_blank">FileList</a>`,
  `<a href="https://beyond-hd.me/torrents?imdb={imdbid}" target="_blank">BHD</a>`,
  `<a href="https://blutopia.cc/torrents?imdbid={imdbno}&perPage=25&imdbId={imdbno}" target="_blank">BLU</a>`,
  `<a href="https://secret-cinema.pw/torrents.php?action=advanced&searchsubmit=1&filter_cat=1&cataloguenumber={imdbid}" target="_blank">SC</a>`,
  `<a href="https://darkland.top/torrents?imdbId={imdbid}#page/1" target="_blank">DarkLand</a>`,
  `<a href="https://totheglory.im/browse.php?search_field=imdb{imdbno}&c=M" target="_blank">TTG</a>`,
  `<a href="https://hd-torrents.org/torrents.php?&search={imdbid}&active=0" target="_blank">HDT</a>`,
  `<a href="https://hd-space.org/index.php?page=torrents&search={imdbno}&active=1&options=2" target="_blank">HDSpace</a>`,
  `<a href="http://hdroute.org/browse.php?action=s&imdb={imdbno}" target="_blank">HDR</a>`,
  `<a href="https://hdf.world/torrents.php?searchstr={search_name}" target="_blank">HDF</a>`,
  `<a href="https://privatehd.to/torrents?in=1&search={search_name}" target="_blank">PHD</a>`,
  `<a href="https://avistaz.to/torrents?in=1&search={search_name}" target="_blank">AVZ</a>`,
  `<a href="https://cinemaz.to/torrents?in=1&search={search_name}" target="_blank">CNZ</a>`,
  `<a href="https://xthor.tk/browse.php?sch={search_name}" target="_blank">xTHOR</a>`,
  `<a href="https://cinematik.net/torrents?imdbId={imdbid}#page/1" target="_blank">Tik</a>`,
  `<a href="https://nzbs.in/search?query=imdb:{imdbid}" target="_blank">IN</a>`,
  `<a href="https://search.douban.com/movie/subject_search?search_text={imdbid}" target="_blank">Douban</a>`,
  `<a href="https://uhdbits.org/torrents.php?searchstr={imdbid}" target="_blank">UHD</a>`,
  `<a href="http://zmk.pw/search?q={search_name}" target="_blank">ZMK</a>`,
  `<a href="https://mediaarea.net/MediaInfoOnline" target="_blank">MediaiInfo</a>`,
  `<a href="https://assrt.net/sub/?searchword={search_name}" target="_blank">SSW</a>`,
  `<a href="https://eiga.moi/torrents?imdb={imdbno}#page/1" target="_blank">ACM</a>`
];

var used_search_list = GM_getValue('used_search_list') === undefined ? default_search_list : JSON.parse(GM_getValue('used_search_list')).split(',');

//常用站点列表，这里只是举例说明，可以替换成自己想要的站点名称即可
const default_common_sites = ['TTG', 'CMCT', 'HUDBT', 'PTer'];
var used_common_sites = GM_getValue('used_common_sites') === undefined ? default_common_sites : JSON.parse(GM_getValue('used_common_sites')).split(',');
//签到站点列表
const default_signin_sites = ['TTG', 'CMCT', 'HUDBT', 'PTer'];
var used_signin_sites = GM_getValue('used_signin_sites') === undefined ? default_common_sites : JSON.parse(GM_getValue('used_signin_sites')).split(',');

//欧美国家列表，可以酌情添加
const us_ue = ['阿尔巴尼亚|安道尔|奥地利|俄罗斯|比利时|波黑|保加利亚|克罗地亚|塞浦路斯|捷克|丹麦|爱沙尼亚|法罗群岛[丹]|冰岛|芬兰|法国|德国|希腊|匈牙利|爱尔兰|意大利|拉脱维亚|列支敦士登|立陶宛|卢森堡|马其顿|马耳他|摩尔多瓦|摩纳哥|荷兰|挪威|波兰|葡萄牙|罗马尼亚|俄罗斯|圣马力诺|塞黑|斯洛伐克|斯洛文尼亚|西班牙|瑞典|瑞士|乌克兰|英国|梵蒂冈|美国|加拿大|澳大利亚|新西兰|西德|苏联|秘鲁|阿根廷|墨西哥'];

const us_ue_english = ['Albania|Andorra|Austria|Russia|Belgium|Bosnia and Herzegovina|Bulgaria|Croatia|Cyprus|Czechia|Denmark|Estonia|Faroe Islands (Denmark)|Iceland|Finland|France|Germany|Greece|Hungary|Ireland|Italy|Latvia|Liechtenstein|Lithuania|Luxembourg|North Macedonia|Malta|Moldova|Monaco|Netherlands|Norway|Poland|Portugal|Romania|Russia|San Marino|Serbia|Slovakia|Slovenia|Spain|Sweden|Switzerland|Ukraine|United Kingdom|Vatican City|United States|Canada|Australia|New Zealand|West Germany|Soviet Union|Peru|Argentina|Mexico'];

//是否在PTP/HDB/HDT/UHD种子列表显示搜索跳转功能，1表示显示，0表示隐藏
const default_show_search_urls = {
  'PTP': 1,
  'HDB': 0,
  'HDT': 0,
  'UHD': 0,
};
var show_search_urls = GM_getValue('show_search_urls') === undefined ? default_show_search_urls : JSON.parse(GM_getValue('show_search_urls'));

function set_host_link() {
  var host_link = prompt(`-------------Auto-feed依托NP架构站进行部分功能布局-------------\n请在输入框输入托管站点的个人设置链接，步骤如下：
    1.进入任意NexusPHP架构PT站点主页;
    2.打开控制面板;
    3.选择个人设定;
    4.复制网页地址输入到下方输入框;
    格式形如：https://(站点域名)/usercp.php?action=personal
    注意：后期可通过>重置托管<按钮进行重置。`, "");
  if (host_link.match(/https?:\/\/.*?\/usercp\.php\?action=personal/)) {
    GM_setValue("host_link", host_link);
    location.reload();
  } else {
    alert('链接格式不对！！');
  }
}

if (GM_getValue("host_link") === undefined && judge_if_the_site_as_source(site_url) !== undefined) {
  set_host_link();
} else {
  host_link = GM_getValue("host_link");
}

if (site_url.match(/^https:\/\/bangumi.tv\/subject/)) {
  var bgm_id = site_url.match(/subject\/(\d+)/)[1];
  $('ul[class="navTabs clearit"]').append(`<li><a href="${host_link}#ptgen?bgmid=${bgm_id}" pcked="1" target="_blank">PtGen</a></li>`);
  return;
}

const default_rehost_img_info = {
  'freeimage': {
    'url': 'https://freeimage.host/page/api',
    'api-url': 'https://freeimage.host/api/1/upload',
    'api-key': ''
  },
  'gifyu': {
    'url': 'https://gifyu.com/',
    'api-url': 'https://gifyu.com/api/1/upload',
    'api-key': ''
  },
  'imgbb': {
    'url': 'https://api.imgbb.com/',
    'api-url': 'https://api.imgbb.com/1/upload',
    'api-key': ''
  }
};

var used_rehost_img_info = GM_getValue('used_rehost_img_info') === undefined ? default_rehost_img_info : JSON.parse(GM_getValue('used_rehost_img_info'));
for (key in default_rehost_img_info) {
  if (!used_rehost_img_info.hasOwnProperty(key)) {
    used_rehost_img_info[key] = default_rehost_img_info[key];
  }
}

/*******************************************************************************************************************
*                                          part 2 常量、变量及函数定义封装层                                          *
********************************************************************************************************************/
//用于作为源站点但是不是转发站点的字典，大部分都外站，用作判断是否是外站的标准
const o_site_info = {
  'FRDS': 'https://pt.keepfrds.com/',
  'BYR': 'https://byr.pt/',
  'avz': 'https://avistaz.to/',
  'PHD': 'https://privatehd.to/',
  'PTP': 'https://passthepopcorn.me/',
  'HDT': used_site_info.HDT.url,
  'MTV': 'https://www.morethantv.me/',
  'BHD': 'https://beyond-hd.me/',
  'UHD': 'https://uhdbits.org/',
  'BLU': 'https://blutopia.cc/',
  'Aither': 'https://aither.cc/',
  'DarkLand': 'https://darkland.top/',
  'FNP': 'https://fearnopeer.com/',
  'OnlyEncodes': 'https://onlyencodes.cc/',
  'TorrentLeech': 'https://www.torrentleech.org/',
  'xthor': 'https://xthor.tk/',
  'FileList': 'https://filelist.io/',
  'HDF': 'https://hdf.world/',
  'HDB': 'https://hdbits.org/',
  'BTN': used_site_info.BTN.url,
  'RED': 'https://redacted.sh/',
  'OpenCD': 'https://open.cd/',
  'U2': 'https://u2.dmhy.org/',
  'jpop': 'https://jpopsuki.eu/',
  'CG': 'http://cinemageddon.net/',
  'KG': 'https://karagarga.in/',
  'SC': 'https://secret-cinema.pw/',
  'iTS': 'https://shadowthein.net/',
  'HDRoute': 'http://hdroute.org/',
  'HDSpace': 'https://hd-space.org/',
  'ACM': 'https://eiga.moi/',
  'HDOli': 'https://hd-olimpo.club/',
  'Tik': 'https://cinematik.net/',
  'CNZ': 'https://cinemaz.to/',
  'GPW': 'https://greatposterwall.com/',
  'HD-Only': 'https://hd-only.org/',
  'NBL': 'https://nebulance.io/',
  'ANT': 'https://anthelion.me/',
  'IPT': 'https://iptorrents.com/',
  'torrentseeds': 'https://torrentseeds.org/',
  'IN': 'https://nzbs.in/',
  'HOU': 'https://house-of-usenet.com/',
  'OMG': 'https://omgwtfnzbs.org/',
  'digitalcore': 'https://digitalcore.club/',
  'BlueBird': 'https://bluebird-hd.org/',
  'bwtorrents': 'https://bwtorrents.tv/',
  'lztr': 'https://lztr.me/',
  'DICMusic': 'https://dicmusic.com/',
  'OPS': 'https://orpheus.network/',
  'bib': 'https://bibliotik.me/',
  'mam': 'https://www.myanonamouse.net',
  'bit-hdtv': 'https://www.bit-hdtv.com/',
  'TVV': 'http://tv-vault.me/',
  'SugoiMusic': 'https://sugoimusic.me/',
  'Monika': 'https://monikadesign.uk/',
  'DTR': 'https://torrent.desi/',
  'HONE': 'https://hawke.uno/',
  'ZHUQUE': 'https://zhuque.in/',
  'YemaPT': 'https://www.yemapt.org/',
  'SpeedApp': 'https://speedapp.io/',
  'MTeam': used_site_info.MTeam.url,
  'ReelFliX': 'https://reelflix.xyz/',
  'HHClub': 'https://hhanclub.top/',
  'SportsCult': 'https://sportscult.org/'
};

if (tldomain == 0) {
  o_site_info.TorrentLeech = 'https://www.torrentleech.org/';
} else if (tldomain == 1) {
  o_site_info.TorrentLeech = 'https://www.torrentleech.me/';
} else if (tldomain == 2) {
  o_site_info.TorrentLeech = 'https://www.torrentleech.cc/';
} else if (tldomain == 3) {
  o_site_info.TorrentLeech = 'https://www.tlgetin.cc/';
}

if (site_url.match(/^https:\/\/hhan.club\/.*/)) {
  o_site_info.HHClub = 'https://hhan.club/';
  GM_setValue('o_site_info', JSON.stringify(o_site_info));
} else if (site_url.match(/^https:\/\/hhanclub.top\/.*/)) {
  o_site_info.HHClub = 'https://hhanclub.top/';
  GM_setValue('o_site_info', JSON.stringify(o_site_info));
}

//用来拼接发布站点的url和字符串,也可用于识别发布页和源页面
var separator = '#separator#';
//获取源站点简称
const origin_site = find_origin_site(site_url);

const douban_prex = 'https://movie.douban.com/subject/';
const imdb_prex = 'https://www.imdb.com/title/';

//iTS的简介模板，用于获取数据替换后填充
const its_base_content = `
[center]

[img]{poster}[/img]

[url={imdb_url}][img]https://i.ibb.co/KD855ZM/IMDb-Logo-2016.png[/img][/url]  [size=3]{imdb_score}[/size]  [*] [size=3][url={rt_url}][img]https://i.ibb.co/cDSgzxm/rt-logo.png[/img][/url] {rt_score}%[/size]  [*] [url={tmdb_url}][img]https://i.ibb.co/VWMtVnN/0fa9aceda3e5.png[/img][/url] [size=3]{tmdb_score}%[/size]


[color=DarkOrange][size=2]◢ SYNOPSIS ◣[/size][/color]
    {en_descr}


[color=DarkOrange][size=2]◢ TRAILER ◣[/size][/color]
[youtube]{youtube_url}[/youtube]


[color=DarkOrange][size=2]◢ SCREENSHOTS ◣[/size][/color]
{screenshots}

[/center]
`;

const kg_intro_base_content = `[img]{poster}[/img]

Title: {title}
Genres: {genres}
Date Published: {date}
IMDB Rating: {score}
IMDB Link: {imdb_url}
Directors: {director}
Creators: {creator}
Actors: {cast}

Introduction
  {en_descr}

Screenshots here:
{screenshots}

-------------------------------------------------------------------------------------------------------------

Not my rip. Many thanks to the original uploader.

-------------------------------------------------------------------------------------------------------------
`;

const kg_dvd_base_content = `DVD label: {label}
DVD5 / DVD9: {size}
DVD Format: {source}
DVD Audio: Codec {audio}, Channels {channels}
Program(s): Not my rip.
Menus: Untouched
Video: Untouched
Audio: Untouched
DVD extras: Untouched
Extras contain: {extras}
DVD runtime(s): {runtime}
`;

const kg_bluray_base_content = `Blu-Ray label: {label}
BD25 / BD50: {size}
Blu-Ray Audio: Codec {audio}, Channels {channels}
Program(s): Not my rip.
Menus: Untouched
Video: Untouched
Audio: Untouched
DVD extras: Untouched
Extras contain: {extras}
Blu-Ray runtime(s): {runtime}
`;

//tik的简介模板，用于获取数据替换后填充
const tik_base_content = `
[center][img]{poster}[/img]
{screenshots}
[/center]

[b][color=blue]SYNOPSIS:[/color][/b]
{en_descr}

[code]
IMDb...............: [url]http://www.imdb.com/title/{imdbid}/[/url]

Year...............: {year}
Country............: {country}
Runtime............: {runtime} Minutes
Audio..............: {audio}
Subtitles..........: {subtitles}
Video Format.......: {format}
Film Aspect Ratio..: {aspect_ratio}{dvdformat}
Source.............: {source}
Film Distributor...: [url=addlink]To be specified.[/url]
Ripping Program....: Not my rip
Total  Bitrate.....: {bitrate}

Menus......: [x] Untouched
Video......: [x] Untouched
Extras.....: [x] Untouched
Audio......: [x] Untouched
[/code]

[b][color=blue]Extras:[/color][/b]
[*]
[*]
[*]

[b][color=blue]Uploader Comments:[/color][/b]
- All credit goes to the original uploader.
`;

//需要从源网页获取的信息，有些可能没有
var raw_info = {
  //填充类信息
  'name': '', //主标题
  'small_descr': '', //副标题
  'url': '', //imdb链接
  'dburl': '', //豆瓣链接
  'descr': '', //简介
  'log_info': '',  //音乐特有
  'tracklist': '', //音乐特有
  'music_type': '', //音乐特有
  'music_media': '', //音乐特有
  'edition_info': '',//音乐特有
  'music_name': '', //音乐特有
  'music_author': '', //音乐特有
  'log_info': '', //音乐特有
  'animate_info': '', //动漫特有|针对北邮人北洋U2的命名方式
  'anidb': '', //动漫特有
  'torrentName': '', //动漫辅助
  'images': [], // 截图

  'torrent_name': '', // 用于转发内站
  'torrent_url': '',  // 用于转发内站

  //选择类信息
  'type': '',  //type:可取值——电影/纪录/体育/剧集/动画/综艺……
  'source_sel': '', //来源(地区)：可取值——欧美/大陆/港台/日本/韩国/印度……
  'standard_sel': '',  //分辨率：可取值——4K/1080p/1080i/720p/SD
  'audiocodec_sel': '',  //音频：可取值——AAC/AC3/DTS…………
  'codec_sel': '', //编码：可取值——H264/H265……
  'medium_sel': '', //媒介：可取值——web-dl/remux/encode……

  //其他
  'origin_site': '', //记录源站点用于跳转后识别
  'origin_url': '', //记录源站点用于跳转后识别
  'golden_torrent': false, //主要用于皮转柠檬, 转过去之后会变成字符串
  'mediainfo_cmct': '', //适用于春天的info
  'imgs_cmct': '', //适用于春天的截图
  'full_mediainfo': '', //完整的mediainfo有的站点有长短两种，如：铂金家、猫、春天
  'subtitles': [], //针对皮转海豹，字幕

  'youtube_url': '', //用于发布iTS
  'ptp_poster': '',  //用于发布iTS
  'comparisons': '', //用于海豹
  'version_info': '', //用于海豹
  'multi_mediainfo': '', //用于海豹
  'labels': 0
};

var no_need_douban_button_sites = ['RED', 'OpenCD', 'lztr', 'DICMusic', 'OPS', 'jpop', 'bib', 'mam', 'SugoiMusic', 'MTeam', 'HHClub', 'SportsCult'];

Array.prototype.remove = function (val) {
  var index = this.indexOf(val);
  if (index > -1) {
    this.splice(index, 1);
  }
};

function getImageBlob(imageUrl) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: imageUrl,
      responseType: "blob",
      onload: function (response) {
        console.log(response)
        if (response.status === 200) {
          resolve(response.response);
        } else {
          alert(`图片下载失败: ${response.status}`);
          reject(new Error(`下载失败: ${response.status}`));
        }
      },
      onerror: function (err) {
        reject(err);
      }
    });
  });
}

function uploadToPtpimg(imageBlob, api_key) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('api_key', api_key);
    formData.append('file-upload[0]', imageBlob, 'temp.jpg');
    GM_xmlhttpRequest({
      method: "POST",
      url: "https://ptpimg.me/upload.php",
      data: formData,
      headers: {
        "Referer": "https://ptpimg.me/"
      },
      onload: function (response) {
        if (response.status === 200) {
          try {
            const result = JSON.parse(response.responseText);
            if (result && result.length > 0) {
              const imgData = result[0];
              const finalUrl = `https://ptpimg.me/${imgData.code}.${imgData.ext}`;
              resolve(finalUrl);
            } else {
              reject(new Error("上传成功但返回数据为空"));
            }
          } catch (e) {
            reject(new Error("JSON 解析失败: " + e.message));
          }
        } else {
          reject(new Error(`上传失败，状态码: ${response.status}`));
        }
      },
      onerror: function (err) {
        reject(err);
      }
    });
  });
}

async function ptp_send_doubanposter(url, api_key, callback) {
  try {
    const blob = await getImageBlob(url);
    console.log("获取图片成功，开始上传 Ptpimg...");
    const ptp_url = await uploadToPtpimg(blob, api_key);
    console.log("Ptpimg 上传成功:", ptp_url);
    callback(ptp_url);
  } catch (e) {
    console.error(e);
  }
}

function ptp_send_images(urls, api_key) {
  return new Promise(function (resolve, reject) {
    var boundary = "--NN-GGn-PTPIMG";
    var data = "";
    data += boundary + "\n";
    data += "Content-Disposition: form-data; name=\"link-upload\"\n\n";
    data += urls.join("\n") + "\n";
    data += boundary + "\n";
    data += "Content-Disposition: form-data; name=\"api_key\"\n\n";
    data += api_key + "\n";
    data += boundary + "--";
    GM_xmlhttpRequest({
      "method": "POST",
      "url": "https://ptpimg.me/upload.php",
      "responseType": "json",
      "headers": {
        "Content-type": "multipart/form-data; boundary=NN-GGn-PTPIMG"
      },
      "data": data,
      "onload": function (response) {
        console.log(response);
        if (response.status != 200) reject("Response error " + response.status);
        resolve(response.response.map(function (item) {
          return "[img]https://ptpimg.me/" + item.code + "." + item.ext + '[/img]';
        }));
      }
    });
  });
};

function pix_send_images(urls) {
  return new Promise(function (resolve, reject) {
    GM_xmlhttpRequest({
      "method": "POST",
      "url": "https://pixhost.to/remote/",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
      },
      "data": encodeURI(`imgs=${urls.join('\r\n')}&content_type=0&max_th_size=350`),
      "onload": function (response) {
        if (response.status != 200) {
          reject(response.status);
        } else {
          const data = response.responseText.match(/(upload_results = )({.*})(;)/);
          if (data && data.length) {
            var imgResultList = JSON.parse(data[2]).images;
            resolve(imgResultList.map(function (item) {
              return `[url=${item.show_url}][img]${item.th_url}[/img][/url]`;
            }));
          } else {
            console.log(response);
            reject('上传失败，请重试');
          }
        }
      }
    });
  });
};

//添加搜索框架，可以自行添加或者注释站点
function add_search_urls(container, imdbid, imdbno, search_name, mode) {
  var div_style = 'align="center" style="border: 1px solid blue;"';
  var text = '快速搜索：';
  var brs = '</br></br>';
  var font_color = 'red';
  var font_size = '';
  if (mode == 1) {
    div_style = ''; font_color = 'green'; text = ''; brs = '</br>';
    if (site_url.match(/^https:\/\/www.imdb.com\/title\/tt\d+/)) {
      font_size = 'size=2px';
    }
  } else if (mode == 2) {
    div_style = ''; brs = '</br>';
    font_size = 'size=2px';
  } else if (mode == 3) {
    div_style = ''; font_color = 'green'; text = ''; brs = '';
  }
  if (raw_info.url) {
    tmp_search_list = used_search_list.map((e) => {
      if (e.match(/avistaz|privatehd|cinemaz/)) {
        var domain = e.match(/avistaz|privatehd|cinemaz/)[0];
// [Site Logic: 剧集]
          var o = $(e).attr('href');
          var d = $(e).attr('href').replace(/torrents\?in=1&.*/, 'movies?search=&imdb={imdbid}');
          return e.replace(o, d);
        }
      } else {
        return e;
      }
    })
  } else {
    if (imdbid == '') {
      tmp_search_list = used_search_list.map((e) => {
        if (e.match(/imdbid|imdbno/)) {
          e = e.replace(/<a/, '<a class="disabled"');
        }
        return e;
      });
    } else {
      tmp_search_list = used_search_list;
    }
  }
  tmp_search_list = tmp_search_list.map(item => {
// [Site Logic: ZHUQUE]
    return item;
  });
  var site_search_lists = tmp_search_list.join(' | ');
  if ($('.search_urls').length == 1) {
    $('.search_urls').hide();
    brs = '';
  } else if ($('.search_urls').length > 2) {
    $('.search_urls').show();
  }
  if (site_url.match(/^https?:\/\/movie.douban.com/)) {
    if (site_search_lists.match(/https:\/\/www.imdb.com.*?imdbid/)) {
      site_search_lists = site_search_lists.replace(/www.imdb.com.*?imdbid}/, 'click_new');
    }
  }
  site_search_lists = site_search_lists.format({ 'imdbid': imdbid, 'imdbno': imdbno, 'search_name': search_name });
  container.append(`${brs}<div ${div_style} class="search_urls"><font ${font_size} color=${font_color}>${text}${site_search_lists}</font></div>`);
  container.find('.disabled').attr("disabled", true).click(e => {
    e.preventDefault();
    alert('当前影视没有IMDB信息！！');
    return;
  });
  $('.hdb-task').click((e) => {
    GM_setValue('task_info', JSON.stringify(raw_info));
  });
  if (mode == 1) {
    $('.search_urls').find('a').css("color", "darkblue");
  }
  try {
    var imdbid = $('#info').html().match(/tt\d+/i)[0];
    var imdb_url = 'https://www.imdb.com/title/' + imdbid;
    $('a[href*="click_new"').click(e => {
      e.preventDefault();
      window.open(imdb_url, target = "_blank");
    });
  } catch (err) { }
}

//函数用来豆瓣信息搜索时候进行处理, 后期准备作废
const numToChn = function (num) {
  var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  var index = num.toString().indexOf(".");
  if (index != -1) {
    var str = num.toString().slice(index);
    var a = "点";
    for (var i = 1; i < str.length; i++) {
      a += chnNumChar[parseInt(str[i])];
    }
    return a;
  } else {
    return;
  }
};

function numToChinese(num) { //定义在每个小节的内部进行转化的方法，其他部分则与小节内部转化方法相同
  var chnNumChar = ["零", "一", "二", "三", "四", "五", "六", "七", "八", "九"];
  var chnUnitChar = ["", "十", "百", "千"];
  var str = '',
    chnstr = '',
    zero = false,
    count = 0; //zero为是否进行补零， 第一次进行取余由于为个位数，默认不补零
  if (num > 0 && num < 100) {
    var v = num % 10;
    var q = Math.floor(num / 10);

    if (num < 10) { //如果数字为零，则对字符串进行补零
      chnstr = chnNumChar[v] + chnstr;

    } else if (num == 10) chnstr = chnUnitChar[1];
    else if (num > 10 && num < 20) chnstr = "十" + chnNumChar[v];
    else {
      if (v == 0) chnstr = chnNumChar[q] + "十";
      else chnstr = chnNumChar[q] + "十" + chnNumChar[v];
    }
  }
  return chnstr;
}

//用来判断地址属于哪个站点（国内发布站点，国外源站点，或其他）
function find_origin_site(url) {

  var domain; //域名
  var reg;    //正则匹配表达式
  var key;
  //先从发布站点找
  for (key in used_site_info) {
    //获取域名
    domain = used_site_info[key].url.split('//')[1].replace('/', '');
    reg = new RegExp(domain, 'i');
    if (url.match(reg)) {
// [Site Logic: Hdb]
      return key;
    }
  }
  //再从特殊源站点找
  for (key in o_site_info) {
    //获取域名
    domain = o_site_info[key].split('//')[1].replace('/', '');
    reg = new RegExp(domain, 'i');
    if (url.match(reg)) {
      return key;
    }
  }
  if (url.match(/^https:\/\/.{0,4}?chddiy.xyz\//) || url.match(/^https:\/\/ptchdbits.co\//)) {
    return 'CHDBits';
  }
  return 'other';
}

//这部分是属于官种名称匹配，用于声明感谢，可自定义匹配正则以及感谢bbcode
const reg_team_name = {
  'MTeam': /-(.*mteam|mpad|tnp|BMDru|MWEB)/i,
  'CMCT': /-(CMCT|cmctv)/i,
  'HDSky': /-(hds|.*@HDSky)/i,
  'CHDBits': /-(CHD|.*@CHDBits)|@CHDWEB/i,
  'OurBits': /(-Ao|-.*OurBits|-FLTTH|-IloveTV|OurTV|-IloveHD|OurPad|-MGs)$/i,
  'TTG': /-(WiKi|DoA|.*TTG|NGB|ARiN)/i,
  'HDChina': /-(HDC)/i,
  'PTer': /-(Pter|.*Pter)/i,
  'HDHome': /(-hdh|.*@HDHome)/i,
  'PThome': /(-pthome|-pth|.*@pth)/i,
  'Audiences': /(-Audies|.*@Audies|-ADE|-ADWeb|.*@ADWeb)/i,
  'PTLGS': /(-PTLGS|.*@PTLGS)/i,
  'PuTao': /-putao/i,
  'NanYang': /-nytv/i,
  'TLFbits': /-tlf/i,
  'HDDolby': /-DBTV|-QHstudIo|Dream$|.*@dream/i,
  'FRDS': /-FRDS|@FRDS/i,
  'PigGo': /PigoHD|PigoWeb|PiGoNF/i,
  'CarPt': /CarPT/i,
  'HDVideo': /(-HDVWEB|-HDVMV)/i,
  'HDfans': /HDFans/i,
  'WT-Sakura': /SakuraWEB|SakuraSUB|WScode/i,
  'HHClub': /HHWEB/i,
  'HaresClub': /Hares?WEB|HaresTV|DIY@Hares|-hares/i,
  'HDPt': /hdptweb/i,
  'Panda': /AilMWeb|-PANDA|@Panda/i,
  'UBits': /@UBits|-UBits|-UBWEB/i,
  'PTCafe': /CafeWEB|CafeTV|DIY@PTCafe/i,
  '影': /Ying(WEB|DIY|TV|MV|MUSIC)?$/i,
  'DaJiao': /DJWEB|DJTV/i,
  'OKPT': /OK(WEB|Web)?$/i,
  'AGSV': /AGSV(PT|E|WEB|REMUX|Rip|TV|DIY|MUS)?$/i,
  'TJUPT': /TJUPT$/,
  'FileList': /Play(HD|SD|WEB|TV)$/i,
  'CrabPt': /XHBWeb$/i,
  '红叶': /(RLWEB|RLeaves|RLTV|-R²)$/i,
  'QingWa': /(FROG|FROGE|FROGWeb)$/i,
  'ZMPT': /ZmWeb|ZmPT/i,
  'LemonHD': /(-LHD|League(WEB|CD|NF|HD|TV|MV))$/i,
  'ptsbao': /-(FFans|sBao|FHDMV|OPS)/i,
  '麒麟': /-HDK(WEB|TV|MV|Game|DIY|ylin)/i,
  '13City': /-(13City|.*13City)/i,
};

function add_thanks(descr) {
  const thanks_str = "[quote][b][color=blue]{site}官组作品，感谢原制作者发布。[/color][/b][/quote]\n\n{descr}";
  for (var key in reg_team_name) {
    if (raw_info.name.match(reg_team_name[key]) && !raw_info.name.match(/PandaMoon|HDSpace|HDClub|LCHD/i)) {
      descr = thanks_str.format({ 'site': key, 'descr': descr });
    }
  }
  return descr;
}

//标签及其字标签转换为字符串，主要用于获取简介等等, 根据网页树的结构，采用前序遍历递归呈现。
function walkDOM(n) {
  do {
    if (n.nodeName == 'FONT') {
      if (n.color != '') {
        n.innerHTML = '[color=' + n.color + ']' + n.innerHTML + '[/color]';
      }
      if (n.size != '') {
        n.innerHTML = '[size=' + n.size + ']' + n.innerHTML + '[/size]';
      }
      if (n.face != '') {
        n.innerHTML = '[font=' + n.face + ']' + n.innerHTML + '[/font]';
      }
    } else if (n.nodeName == 'SCRIPT') {
      n.innerHTML = '';
    } else if (n.nodeName == 'SPAN') {
      if (n.style.color != '') {
        n.innerHTML = '[color=' + rgb_2_hex(n.style.color) + ']' + n.innerHTML + '[/color]';
      }
    } else if (n.nodeName == 'U') {
      n.innerHTML = '[u]' + n.innerHTML + '[/u]';
    } else if (n.nodeName == 'A') {
      if (n.innerHTML != "" && n.href) {
        if (site_url.match(/http(s*):\/\/ptchdbits.co\/details.php.*/i)) {
          if (!n.innerHTML.match(/pic\/hdl\.gif/g)) {
            n.innerHTML = '[url=' + n.href + ']' + n.innerHTML + '[/url]';
          }
        } else {
          n.innerHTML = '[url=' + n.href + ']' + n.innerHTML + '[/url]';
        }
      }
    } else if (n.nodeName == 'TABLE') {
      if (n.innerHTML != "") {
        if (site_url.match(/http(s*):\/\/totheglory.im.*|bwtorrents.tv/i)) {
          n.innerHTML = '[quote]' + n.innerHTML + '[/quote]';
        } else if (site_url.match(/u2.dmhy/)) {
          n.innerHTML = '';
        } else if (site_url.match(/nexushd/i) && n.className == 'mediainfotabletable') {
          n.innerHTML = '';
        }
      }
    } else if (n.nodeName == 'P') {
      if (n.innerHTML != "") {
        if (site_url.match(/http(s*):\/\/totheglory.im.*/i)) {
          n.innerHTML = '';
        } else if (site_url.match(/hdroute/i) && n.className == 'quoted') {
          n.innerHTML = '[quote]' + n.innerHTML + '[/quote]';
        }
      }
      if (site_url.match(/hhanclub.top|hhan.club/)) {
        n.innerHTML = n.innerHTML + '\n';
      }
    } else if (n.nodeName == 'FIELDSET' || n.nodeName == 'BLOCKQUOTE') {
      if (!site_url.match(/hudbt/i) || n.nodeName != 'BLOCKQUOTE') {
        n.innerHTML = '[quote]' + n.innerHTML.trim() + '[/quote]';
      }
      if (n.nodeName == 'FIELDSET' && n.textContent.match(/(温馨提示|郑重声明|您的保种|商业盈利|相关推荐|自动发布|仅供测试宽带|不用保种|本站仅负责连接|感谢发布者|转载请注意礼节)/g)) {
        n.innerHTML = '';
      }
      if (n.nodeName == 'BLOCKQUOTE' && n.textContent.match(/勿作商用/)) {
        n.innerHTML = '';
      }
    } else if (n.nodeName == 'DIV' && n.innerHTML == '代码') {
      n.innerHTML = '';
      n.nextSibling.innerHTML = '[quote]' + n.nextSibling.innerHTML + '[/quote]';
    } else if (n.nodeName == 'DIV' && n.className == 'quoted' && site_url.match(/digitalcore/)) {
      n.innerHTML = '[quote]' + n.innerHTML + '[/quote]';
    } else if (n.nodeName == 'B') {
      n.innerHTML = '[b]' + n.innerHTML + '[/b]';
    } else if (n.nodeName == 'DIV' && site_url.match(/npupt/) && n.className == 'well small') {
      n.innerHTML = '';
    } else if (n.nodeName == 'DIV' && site_url.match(/nexushd/i) && n.className == 'spoiler') {
      var head = n.querySelector('.spoiler_head');
      var body = n.querySelector('.spoiler_body');
      var title = head ? head.innerHTML : '';
      var content = body ? body.innerHTML : '';
      if (title == '隐藏内容') {
        n.innerHTML = '[quote]' + content.trim() + '[/quote]';
      } else {
        n.innerHTML = '[quote=' + title.trim() + ']' + content.trim() + '[/quote]';
      }
    } else if (n.nodeName == '#text' && site_url.match(/npupt/)) {
      n.data = n.data.replace(/^ +| +$/g, '');
    } else if (n.nodeName == 'BR') {
      if (site_url.match(/u2.dmhy.org|ourbits.club|hd-space.org|totheglory.im|blutopia.cc|star-space.net|torrent.desi|hudbt|fearnopeer.com|darkland.top|onlyencodes.cc|cinemageddon|eiga.moi|hd-olimpo.club|digitalcore.club|bwtorrents.tv|myanonamouse|greatposterwall.com|m-team.cc/i)) {
        n.innerHTML = '\r\n';
      }
    } else if (n.nodeName == 'LEGEND') {
      n.innerHTML = '';
    } else if (n.nodeName == 'IMG') {
      if (site_url.match(/http(s*):\/\/ptchdbits.co\/details.php.*/i)) {
        if (!n.src.match(/pic\/hdl\.gif/g)) {
          raw_info.descr = raw_info.descr + '[img]' + n.src + '[/img]';
        }
      } else if (site_url.match(/http(s*):\/\/.*tjupt.org\/details.php.*/i)) {
        if ($(n).attr('data-src') !== undefined) {
          raw_info.descr = raw_info.descr + '[img]' + $(n).attr('data-src') + '[/img]';
        } else {
          raw_info.descr = raw_info.descr + '[img]' + n.src + '[/img]';
        }
      } else {
        raw_info.descr = raw_info.descr + '[img]' + n.src + '[/img]';
      }
// [Site Logic: Audiences]
      n.innerHTML = '';
    } else if (n.nodeName == 'DIV' && site_url.match(/tjupt/i) && n.id == 'formatMediainfo') {
      n.innerHTML = '';
    }
    if (n.hasChildNodes()) {
      walkDOM(n.firstChild);
    } else {
      raw_info.descr = raw_info.descr + n.textContent;
    }
    n = n.nextSibling;
  } while (n);
  return raw_info.descr;
}

//为了春天获取简介而写的定制节点转文本
function walk_cmct(n) {
  do {
    if (n.nodeName == 'SPAN') {
      if (n.style.color != '') {
        n.innerHTML = '[color=' + n.style.color + ']' + n.innerHTML + '[/color]';
      }
    } else if (n.nodeName == 'A') {
      if (n.innerHTML != "") {
        n.innerHTML = n.innerHTML;
      }
    } else if (n.nodeName == 'BR') {
      n.innerHTML = '\r\n';
    }

    if (n.hasChildNodes()) {
      walk_cmct(n.firstChild);
    } else {
      if (n.nodeType != 1) {
        raw_info.descr = raw_info.descr + n.textContent;
      }
    }
    n = n.nextSibling;
  } while (n);
  return raw_info.descr;
}

function walk_ptp(n) {
  do {
    if (n.nodeName == 'A' && n.getAttribute('onclick')) {
      if (n.getAttribute('onclick').match(/MediaInfoToggleShow|BBCode.spoiler/)) {
        n.innerHTML = '';
      } else if (n.getAttribute('onclick').match(/BBCode.ScreenshotComparisonToggleShow/)) {
        var info = n.getAttribute('onclick').match(/\[.*?\]/g);
        var item = info[0].replace(/\[|\]|"/g, '');
        var pics_text = '';
        info[1].replace(/\[|\]|"|\\/g, '').split(',').forEach((e) => {
          pics_text += `[img]${e.trim()}[/img]`;
        });
        n.innerHTML = `[comparison=${item}]\n\n${pics_text}\n\n[/comparison]`;
      }
    } else if (n.nodeName == 'A') {
      n.innerHTML = '[url=' + n.href + ']' + n.innerHTML + '[/url]';
    } else if (n.nodeName == 'TABLE') {
      n.nextSibling.innerHTML = n.nextSibling.textContent;
      n.innerHTML = '';
    } else if (n.nodeName == 'LI') {
      n.innerHTML = '　　* ' + n.textContent + '\n';
    } else if (n.nodeName == 'STRONG') {
      try {
        if (n.nextSibling.nextSibling.nextSibling.nodeName == 'BLOCKQUOTE') {
          n.nextSibling.nextSibling.nextSibling.innerHTML = `[hide=${n.textContent}]${n.nextSibling.nextSibling.nextSibling.innerHTML}[/hide]`;
          n.innerHTML = '';
          n.nextSibling.textContent = '';
          n.nextSibling.nextSibling.textContent = '';
        } else if (n.nextSibling.nextSibling.textContent == 'Show comparison') {
          n.textContent = '';
          n.nextSibling.textContent = '';
        } else {
          n.innerHTML = `[b]${n.innerHTML}[/b]`;
        }
      } catch (err) {
        n.innerHTML = `[b]${n.innerHTML}[/b]`;
      }
    } else if (n.nodeName == 'SPAN') {
      if (n.style.cssText.match(/underline/i)) {
        n.innerHTML = '[u]' + n.innerHTML + '[/u]';
      } else {
        n.innerHTML = n.innerHTML;
      }
    } else if (n.nodeName == 'IMG') {
      n.innerHTML = '[img]' + n.src + '[/img]';
    } else if (n.nodeName == 'BLOCKQUOTE' && n.textContent.match(/general|Disc Title|DISC INFO|mpls/i)) {
      n.innerHTML = `[quote]${n.innerHTML}[/quote]`;
    }

    if (n.hasChildNodes()) {
      walk_ptp(n.firstChild);
    } else {
      if (n.nodeType != 1) {
        raw_info.descr = raw_info.descr + n.textContent;
      }
    }
    n = n.nextSibling;
  } while (n);
  return raw_info.descr;
}

function deal_img_350(pic_info) {
  var imgs = pic_info.match(/\[img\].*?(jpg|png).*?\[\/img\]/g);
  if (imgs) {
    imgs.map((item) => {
      var img_url = item.match(/http.*?(png|jpg)/)[0];
// [Site Logic: PTP]
    })
  }
  return pic_info;
}

function deal_img_350_ptpimg(pic_info) {
  var imgs = pic_info.match(/\[img\].*?(jpg|png).*?\[\/img\]/g);
  if (imgs) {
    imgs.map((item) => {
      var img_url = item.match(/http.*?(png|jpg)/)[0];
// [Site Logic: PTP]
    })
  }
  return pic_info;
}

//标签节点连带转换成字符串
function domToString(node) {
  var tmpNode = document.createElement('div');
  tmpNode.appendChild(node);
  var str = tmpNode.innerHTML;
  tmpNode = node = null; // 解除引用，以便于垃圾回收
  return str;
}

//方便进行判断是否是源站点，不然太长了,属于源站点进入逻辑业务层
function judge_if_the_site_as_source() {
  if (site_url.match(/^https:\/\/karagarga.in\/upload\.php.*/)) {
    return 4;
  }
  if (site_url.match(/^https:\/\/(broadcasthe.net|backup.landof.tv)\/upload.php.*/)) {
    return 5;
  }
  if (site_url.match(/^https?:\/\/\d+.\d+.\d+.\d+:5678/)) {
    return 7;
  }
  if (site_url.match(/^https?:\/\/.*\/.*(upload|create|offer|viewoffers).*?(php)?#separator#/i)) {
    return 0;
  }
  if (site_url.match(/^https:\/\/.*open.cd\/plugin_upload.php#separator#/i)) {
    return 0;
  }
  if (site_url.match(/^https:\/\/www.yemapt.org\/#\/torrent\/add\?/i)) {
    return 0;
  }
  if (site_url.match(/^https?:\/\/(avistaz|privatehd|cinemaz).to\/upload\/torrent\/\d+/i)) {
    return 6;
  }
  if (site_url.match(/^https:\/\/hd-space\.org\/index.php\?page=upload/)) {
    return 0;
  }
  if (site_url.match(/^https:\/\/hdcity.city\/upload/)) {
    return 2;
  }
  if (site_url.match(/^https:\/\/(www.)?(darkland.top|eiga.moi|hd-olimpo.club|fearnopeer.com|onlyencodes.cc|blutopia.cc|aither.cc|torrent.desi|monikadesign.uk|hawke.uno|cinematik.net|reelflix.xyz)\/torrents\/\d+$/)) {
    return 1;
  }
  if (site_url.match(/^https:\/\/(www.)?torrentseeds.org\/torrents\/\d+/)) {
    return 1;
  }
// [Site Logic: ZHUQUE]
  if (site_url.match(/^https:\/\/bibliotik.me\/torrents\/\d+/)) {
    return 1;
  }
  if (site_url.match(/^https:\/\/www.myanonamouse.net\/t\/\d+/)) {
    return 1;
  }
  if (site_url.match(/^https:\/\/speedapp.io\/browse\/\d+\/t/)) {
    return 1;
  }
  if (site_url.match(/^https:\/\/hd-space.org\/index.php\?page=torrent-details/)) {
    return 1;
  }
  if (site_url.match(/^https:\/\/digitalcore.club\/torrent\/\d+/)) {
    return 1;
  }
// [Site Logic: NZBS]
  if (site_url.match(/^https:\/\/nebulance.io\/torrents.php\?id=\d+/i)) {
    return 1;
  }
  if (site_url.match(/^https:\/\/star-space.net\/p_torrent\/video_detail.php\?tid=\d+/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/.*\/.*details.*php.*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/sportscult.org\/.*torrent-details/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/.*\/.*detail\/\d+/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/totheglory.im\/t\/.*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/(passthepopcorn.me|tv-vault.me|broadcasthe.net|backup.landof.tv|greatposterwall.com|sugoimusic.me).*torrentid.*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/iptorrents.com\/torrent.php\?id=*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/anthelion.me.*torrentid.*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/secret-cinema.pw.*torrentid.*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/www.morethantv.me.*torrentid.*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/hd-only.org.*torrentid.*/i)) {
    return 1;
  }
// [Site Logic: HDB]
  if (site_url.match(/^http(s*):\/\/(privatehd|cinemaz|avistaz).to\/torrent/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/www.morethan.tv\/torrents.php\?id/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/beyond-hd.me\/torrents/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/uhdbits.org\/torrents.php\?id=\d+&torrentid=\d+/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/hdf.world\/torrents.php\?id=\d+&torrentid=\d+/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/jpopsuki.eu\/torrents.php\?id=\d+&torrentid=\d+/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/(redacted.sh|lztr.me|dicmusic.com|orpheus.network)\/torrents.php\?id=\d+&torrentid=\d+/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/www\.(torrentleech|tlgetin)\..*?\/torrent\/*/i)) {
    return 1;
  }
  if (site_url.match(/^http(s*):\/\/xthor.tk\/details.php/i)) {
    return 1;
  }
}

//判断是否是国内的站点，国内站点架构基本一致且不需要额外获取豆瓣信息
function judge_if_the_site_in_domestic() {
  var domain, reg, key;
  for (key in o_site_info) {
// [Site Logic: Byr]
  }
  return 1;
}

//处理标题业务封装进函数
function deal_with_title(title) {
  title = title.replace(/\./g, ' ').replace(/torrent$/g, '').trim() + ' ';
  if (title.match(/[^\d](2 0|5 1|7 1|1 0|6 1|2 1|4 0|5 0)[^\d]/)) {
    title = title.replace(/[^\d](2 0|5 1|7 1|1 0|6 1|2 1|4 0|5 0)[^\d]/g, function (data) {
      return data.slice(0, 2) + '.' + data.slice(3, data.length);
    }).trim();
  }
  title = title.replace(/H ?(26[45])/i, "H.$1").replace(/x265[.-]10bit/i, 'x265 10bit');
  title = title.replace(/\s+\[2?x?(免费|free)\].*$|\(限时.*\)|\(限時.*\)|\(已审|通过|待定\)/ig, '').replace(/\[.*?\]/ig, '').replace(/剩余时间.*/i, '');
  title = title.replace(/\(|\)/ig, '').replace(/ - /g, function (data, index) {
    try {
      let y_index = title.match(/(19|20)\d+/).index;
      if (index > y_index) {
        return '-';
      } else {
        return data;
      }
    } catch (err) {
      return data;
    }
  });
  title = title.replace('_10_', '(_10_)');
  title = title.replace('V2.1080p', 'V2 1080p').replace(/mkv$|mp4$/i, '').trim();
  return title;
}

//处理副标题逻辑业务封装进函数
function deal_with_subtitle(subtitle) {
  subtitle = subtitle.replace(/\[checked by.*?\]/i, '').replace(/autoup/i, '').replace(/ +/, ' ').trim();
  return subtitle;
}

//字典转成字符串传达到跳转页面
function dictToString(my_dict) {
  my_dict = fill_raw_info(my_dict, null);
  var tmp_string = '', link_str = '#linkstr#', key;
  for (key in my_dict) {
    tmp_string += key + link_str + my_dict[key] + link_str;
  }
  tmp_string = tmp_string.slice(0, tmp_string.length - 9);
  return btoa(encodeURIComponent(tmp_string));
}

//字符串转换成字典回来填充发布页面
function stringToDict(my_string) {
  my_string = decodeURIComponent(atob(my_string));
  var link_str = '#linkstr#';
  var tmp_array = my_string.split(link_str);
  var tmp_dict = {};
  for (i = 0; i < tmp_array.length; i++) {
    if (i % 2 == 0) {
      tmp_dict[tmp_array[i]] = tmp_array[i + 1];
    }
  }
  return tmp_dict;
}

//下面两个函数用来为字符串赋予format方法：例如——'thank you {site}'.format({'site':'ttg'}) => 'thank you ttg'
String.prototype.replaceAll = function (exp, newStr) {
  return this.replace(new RegExp(exp, "gm"), newStr);
};

String.prototype.format = function (args) {
  var result = this;
  if (arguments.length < 1) {
    return result;
  }
  var data = arguments;
  if (arguments.length == 1 && typeof (args) == "object") {
    data = args;
  }
  for (var key in data) {
    var value = data[key];
    if (undefined != value) {
      result = result.replaceAll("\\{" + key + "\\}", value);
    }
  }
  return result;
};

//下面几个函数为字符串赋予获取各种编码信息的方法——适用于页面基本信息和字符串
String.prototype.medium_sel = function () { //媒介
  var result = this.toString();
  if (result.match(/(Webdl|Web-dl|WEB[\. ])/i) && !raw_info.name.match(/webrip/i)) {
    result = 'WEB-DL';
  } else if (result.match(/(UHDTV)/i)) {
    result = 'UHDTV';
  } else if (result.match(/(HDTV)/i)) {
    result = 'HDTV';
  } else if (result.match(/(Remux)/i) && !result.match(/Encode/)) {
    result = 'Remux';
  } else if (result.match(/(Blu-ray|.MPLS|Bluray原盘)/i) && !result.match(/Encode/i)) {
    result = 'Blu-ray';
  } else if (result.match(/(UHD|UltraHD)/i) && !result.match(/Encode/i)) {
    result = 'UHD';
  } else if (result.match(/(Encode|BDRIP|webrip|BluRay)/i) || result.match(/(x|H).?(264|265)/i)) {
    result = 'Encode';
  } else if (result.match(/(DVDRip|DVD)/i)) {
    result = 'DVD';
  } else if (result.match(/TV/)) {
    result = 'TV';
  } else if (result.match(/VHS/)) {
    result = 'VHS';
  } else if (result.match(/格式: CD|媒介: CD/)) {
    result = 'CD';
  } else {
    result = '';
  }
  return result;
};

String.prototype.codec_sel = function () { //编码
  var result = this;
  if (result.match(/(H264|H\.264|AVC)/i)) {
    result = 'H264';
  } else if (result.match(/(HEVC|H265|H\.265)/i)) {
    result = 'H265';
  } else if (result.match(/(VVC|H266|H\.266)/i)) {
    result = 'H266';
  } else if (result.match(/(X265)/i)) {
    result = 'X265';
  } else if (result.match(/(X264)/i)) {
    result = 'X264';
  } else if (result.match(/(VC-1)/i)) {
    result = 'VC-1';
  } else if (result.match(/(MPEG-2)/i)) {
    result = 'MPEG-2';
  } else if (result.match(/(MPEG-4)/i)) {
    result = 'MPEG-4';
  } else if (result.match(/(XVID)/i)) {
    result = 'XVID';
  } else if (result.match(/(VP9)/i)) {
    result = 'VP9';
  } else if (result.match(/DIVX/i)) {
    result = 'DIVX';
  } else {
    result = '';
  }
  return result;
};

String.prototype.audiocodec_sel = function () { //音频编码
  var result = this.toString();
  if (result.match(/(DTS-HDMA:X 7\.1|DTS.?X.?7\.1)/i)) {
    result = 'DTS-HDMA:X 7.1';
  } else if (result.match(/(DTS-HD.?MA)/i)) {
    result = 'DTS-HDMA';
  } else if (result.match(/(DTS-HD.?HR)/i)) {
    result = 'DTS-HDHR';
  } else if (result.match(/(DTS-HD)/i)) {
    result = 'DTS-HD';
  } else if (result.match(/(DTS.?X[^2])/i)) {
    result = 'DTS-X';
  } else if (result.match(/(LPCM)/i)) {
    result = 'LPCM';
  } else if (result.match(/(OPUS)/i)) {
    result = 'OPUS';
  } else if (result.match(/([ \.]DD|AC3|AC-3|Dolby Digital)/i)) {
    result = 'AC3';
  } else if (result.match(/(Atmos)/i) && result.match(/True.?HD/)) {
    result = 'Atmos';
  } else if (result.match(/(AAC)/i)) {
    result = 'AAC';
  } else if (result.match(/(TrueHD)/i)) {
    result = 'TrueHD';
  } else if (result.match(/(DTS)/i)) {
    result = 'DTS';
  } else if (result.match(/(Flac)/i)) {
    result = 'Flac';
  } else if (result.match(/(APE)/i)) {
    result = 'APE';
  } else if (result.match(/(MP3)/i)) {
    result = 'MP3';
  } else if (result.match(/(WAV)/i)) {
    result = 'WAV';
  } else if (result.match(/(OGG)/i)) {
    result = 'OGG';
  } else {
    result = '';
  }
  if (this.toString().match(/AUDiO CODEC/i) && this.toString().match(/-WiKi/)) {
    result = this.match(/AUDiO CODEC.*/i)[0];
    result = result.audiocodec_sel();
  }
  return result;
};

String.prototype.standard_sel = function () {

  var result = this;
  if (result.match(/(4320p|8k)/i)) {
    result = '8K';
  } else if (result.match(/(1080p|2K)/i)) {
    result = '1080p';
  } else if (result.match(/(720p)/i)) {
    result = '720p';
  } else if (result.match(/(1080i)/i)) {
    result = '1080i';
  } else if (result.match(/(576[pi]|480[pi])/i)) {
    result = 'SD';
  } else if (result.match(/(1440p)/i)) {
    result = '144Op';
  } else if (result.match(/(2160p|4k)/i)) {
    result = '4K';
  } else {
    result = '';
  }
  return result;
};

//获取类型
String.prototype.get_type = function () {
  var result = this.toString().split('來源')[0];
  if (result.match(/(Movie|电影|UHD原盘|films|電影|剧场)/i)) {
    result = '电影';
  } else if (result.match(/(Animation|动漫|動畫|动画|Anime|Cartoons?)/i)) {
    result = '动漫';
  } else if (result.match(/(TV.*Show|综艺)/i)) {
    result = '综艺';
  } else if (result.match(/(Docu|纪录|Documentary)/i)) {
    result = '纪录';
  } else if (result.match(/(短剧)/i)) {
    result = '短剧';
  } else if (result.match(/(TV.*Series|影劇|剧|TV-PACK|TV-Episode|TV)/i)) {
    result = '剧集';
  } else if (result.match(/(Music Videos|音乐短片|MV\(演唱\)|MV.演唱会|MV\(音乐视频\)|Music Video|Musics MV|Music-Video|音乐视频|演唱会\/MV|MV\/演唱会|MV)/i)) {
    result = 'MV';
  } else if (result.match(/(有声小说|Audio\(有声\)|有声书|有聲書)/i)) {
    result = '有声小说';
  } else if (result.match(/(Music|音乐)/i)) {
    result = '音乐';
  } else if (result.match(/(Sport|体育|運動)/i)) {
    result = '体育';
  } else if (result.match(/(学习|资料|Study)/i)) {
    result = '学习';
  } else if (result.match(/(Software|软件|軟體)/i)) {
    result = '软件';
  } else if (result.match(/(Game|游戏|PC遊戲)/i)) {
    result = '游戏';
  } else if (result.match(/(eBook|電子書|电子书|书籍|book)/i)) {
    result = '书籍';
  } else {
    result = '';
  }
  return result;
};

String.prototype.source_sel = function () {
  var info_text = this;
  //来源就在这里获取
  if (info_text.match(/(大陆|China|中国|CN|chinese)/i)) {
    source_sel = '大陆';
  } else if (info_text.match(/(HK&TW|港台|thai)/i)) {
    source_sel = '港台';
  } else if (info_text.match(/(EU&US|欧美|US\/EU|英美)/i)) {
    source_sel = '欧美';
  } else if (info_text.match(/(JP&KR|日韩|japanese|korean)/i)) {
    source_sel = '日韩';
  } else if (info_text.match(/(香港)/i)) {
    source_sel = '香港';
  } else if (info_text.match(/(台湾)/i)) {
    source_sel = '台湾';
  } else if (info_text.match(/(日本|JP)/i)) {
    source_sel = '日本';
  } else if (info_text.match(/(韩国|KR)/i)) {
    source_sel = '韩国';
  } else if (info_text.match(/(印度)/i)) {
    source_sel = '印度';
  } else {
    source_sel = '';
  }
  return source_sel;
};

//获取副标题或是否中字、国语、粤语以及DIY
String.prototype.get_label = function () {
  var my_string = this.toString();
  var name = my_string.split('#separator#')[0];
  var labels = { 'gy': false, 'yy': false, 'zz': false, 'diy': false, 'hdr10': false, 'db': false, 'hdr10plus': false, 'yz': false, 'en': false, 'yp': false, 'hdr': false };

  if (my_string.match(/([简繁].{0,12}字幕|[简繁中].{0,3}字|简中|DIY.{1,5}字|内封.{0,3}[繁中字])|(Text.*?[\s\S]*?Chinese|Text.*?[\s\S]*?Mandarin|subtitles.*chs|subtitles.*mandarin|subtitle.*chinese|Presentation Graphics.*?Chinese)/i)) {
    labels.zz = true;
  }
  if (my_string.match(/(英.{0,12}字幕|英.{0,3}字|内封.{0,3}英.{0,3}字)|(Text.*?[\s\S]*?English|subtitles.*eng|subtitle.*english|Graphics.*?English)/i)) {
    labels.yz = true;
  }

  if (my_string.match(/([^多]国.{0,3}语|国.{0,3}配|台.{0,3}语|台.{0,3}配)|(Audio.*Chinese|Audio.*mandarin)/i)) {
    var sub_str = my_string.match(/([^多]国.{0,3}语|国.{0,3}配|台.{0,3}语|台.{0,3}配)|(Audio.*Chinese|Audio.*mandarin)/i)[0];
    if (!sub_str.match(/国家|Subtitles/)) {
      labels.gy = true;
    }
  }
  if (my_string.match(/(Audio.*English|◎语.*?言.*?英语)/i)) {
    labels.en = true;
  }
  try {
    var audio = my_string.match(/Audio[\s\S]*?English/)[0].split('Text')[0];
    if (audio.match(/Language.*?English/)) {
      labels.en = true;
    }
  } catch (err) { }
  if (name.match(/(粤.{0,3}语|粤.{0,3}配|Audio.*cantonese)/i)) {
    labels.yy = true;
  }
// [Site Logic: HDB]
    labels.yp = true;
  }
  if (my_string.match(/HDR10\+/)) {
    labels.hdr10plus = true;
  } else if (my_string.match(/HDR10/)) {
    labels.hdr10 = true;
  } else if (my_string.match(/HDR/)) {
    labels.hdr = true;
  }
  if (my_string.match(/Dolby Vision|杜比视界/i)) {
    labels.db = true;
  }
  return labels;
};

function set_selected_option_by_value(my_id, value) {

  var box = document.getElementById(my_id);
  for (i = 0; i < box.options.length; i++) {
    if (box.options[i].value == value) {
      box.options[i].selected = true;
    }
  }
}

//副标题增加原盘版本信息
function blurayVersion(name) {
  var small_descr;
  const ver = ['AUS', 'CAN', 'CEE', 'CZE', 'ESP', 'EUR', 'FRA', 'GBR', 'GER', 'HKG', 'ITA', 'JPN', 'KOR', 'NOR', 'NLD', 'RUS', 'TWN', 'USA'];
  const ver_chinese = ['澳版', '加拿大', 'CEE', '捷克', '西班牙版', '欧版', '法版', '英版', '德版', '港版', '意大利版', '日版', '韩版', '北欧版', '荷兰版', '俄版', '台版', '美版'];
  for (i = 0; i < ver.length; i++) {
    var reg = new RegExp('(\\.| )' + ver[i] + '(\\.| )', 'i');
    if (name.match(reg)) {
      small_descr = '【' + ver_chinese[i] + '原盘】';
      break;
    }
  }
  return small_descr;
}

function judge_forward_site_in_domestic(site) {
  if (Object.keys(o_site_info).indexOf(site) < 0 && site != "HDSpace") {
    return true;
  } else {
    return false;
  }
}

//从简介和名称获取副标题
function get_small_descr_from_descr(descr, name) {
  var small_descr = '', videoname = '', sub_str = '', type_str = '';
  if (descr.match(/译.{0,5}名[^\r\n]+/)) {
    videoname = descr.match(/译.*?名([^\r\n]+)/)[1];
    if (!/.*[\u4e00-\u9fa5]+.*/.test(videoname) || videoname.trim() == '') {
      try { videoname = descr.match(/片.*?名([^\r\n]+)/)[1]; } catch (err) { }
    }
    videoname = videoname.trim(); //去除首尾空格
    if (name.match(/S\d{2}E\d{2}/i)) { //电视剧单集
      sub_str = name.match(/S(\d{2})E(\d{2})/i);
      sub_str = ' *第' + numToChinese(parseInt(sub_str[1])) + '季 第' + parseInt(sub_str[2]) + '集*';
    } else if (name.match(/S\d{2}/)) {
      sub_str = name.match(/S(\d{2})/i);
      sub_str = ' *第' + numToChinese(parseInt(sub_str[1])) + '季';
      if (descr.match(/◎集.{1,10}数.*?(\d+)/)) {
        sub_str += ' 全' + parseInt(descr.match(/◎集.{1,10}数.*?(\d+)/)[1]) + '集*'
      } else {
        sub_str += '*';
      }
    }
    small_descr = videoname + sub_str;
  } if (descr.match(/类.{0,5}别[^\r\n]+/)) {
    type_str = descr.match(/类.*别([^\r\n]+)/)[1];
    type_str = type_str.trim(); //去除首尾空格
    type_str = type_str.replace(/\//g, ''); //去除/
    small_descr = small_descr + ' | 类别：' + type_str;
  }
  return small_descr.trim();
}

//根据简介获取来源，也就是地区国家产地之类的——尤其分类是日韩或者港台的，有的站点需要明确一下
function get_source_sel_from_descr(descr) {
  var region = '';
  var reg_region = descr.match(/◎(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地)([^\r\n]+)/);
  if (!reg_region) {
    reg_region = descr.match(/(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地)([^\r\n]+)/);
  }
  if (reg_region) {
    region = reg_region[2].split('/')[0].trim();
    reg_region = RegExp(us_ue, 'i');
    if (region.match(/香港/)) {
      region = '香港';
    } else if (region.match(/台湾|臺灣/)) {
      region = '台湾';
    } else if (region.match(/日本/)) {
      region = '日本';
    } else if (region.match(/韩国/)) {
      region = '韩国';
    } else if (region.match(/印度/) && !region.match(/印度尼西亚/)) {
      region = '印度';
    } else if (region.match(/中国|大陆/)) {
      region = '大陆';
    } else if (region.match(reg_region)) {
      region = '欧美';
    } else {
      region = region;
    }
  } else {
    reg_region = descr.match(/Country: (.*)/);
    if (reg_region) {
      region = reg_region[1].trim();
      reg_region = RegExp(us_ue_english, 'i');
      if (region.match(reg_region)) {
        region = '欧美'
      }
    }
  }
  return region;
}

//为获取豆瓣信息提供链接简化 promise
function create_site_url_for_douban_info(raw_info, is_douban_search_needed) {
  if (imdb2db_chosen == 0) {
    var p = new Promise(function (resolve, reject) {
      if (is_douban_search_needed) {
        url = raw_info.url.match(/tt\d+/)[0];
        req = 'https://movie.douban.com/j/subject_suggest?q={url}'.format({ 'url': url });
        GM_xmlhttpRequest({
          method: 'GET',
          url: req,
          onload: function (res) {
            var response = JSON.parse(res.responseText);
            if (response.length > 0) {
              raw_info.dburl = douban_prex + response[0].id;
              resolve(raw_info);
            } else {
              reject();
            }
          }
        });
      } else {
        resolve(raw_info);
      }
    });
  }
  else {
    var p = new Promise(function (resolve, reject) {
      if (is_douban_search_needed) {
        url = raw_info.url.match(/tt\d+/)[0];
        var search_url = 'https://m.douban.com/search/?query=' + url + '&type=movie';
        getDoc(search_url, null, function (doc) {
          if ($('ul.search_results_subjects', doc).length) {
            var douban_url = 'https://movie.douban.com/subject/' + $('ul.search_results_subjects', doc).find('a').attr('href').match(/subject\/(\d+)/)[1];
            if (douban_url.search('35580200') > -1) {
              reject();
            }
            raw_info.dburl = douban_url;
            resolve(raw_info);
          } else {
            reject();
          }
        });
      } else {
        resolve(raw_info);
      }
    });
  }
  return p;
}

//颜色转换rgb转16进制
function rgb_2_hex(data) {
  if (data.match(/rgb\((.*)\)/)) {
    data = data.match(/rgb\((.*)\)/)[1];
    data = data.split(',');
    color = '#';
    for (iii = 0; iii < data.length; iii++) {
      var color_tmp = parseInt(data[iii]).toString(16);
      if (color_tmp.length < 2) {
        color_tmp = '0' + color_tmp;
      }
      color += color_tmp;
    }
    return color;
  } else {
    return data;
  }
}

//判断是否是原盘
function check_descr(descr) {
  flag = false;
  if (descr.match(/mpls/i)) {
    flag = true;
  }
  return flag;
}

function get_full_size_picture_urls(raw_info, imgs, container, need_img_label, callback, remove_img) {
  var img_urls = null;
  if (raw_info !== null) {
    img_urls = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
  } else if (imgs) {
    img_urls = imgs.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
  }
  var img_info = '';
  try {
    try {
      var _index = raw_info.descr.indexOf("◎");
    } catch (err) {
      _index = -1;
    }
    for (i = 0; i < img_urls.length; i++) {
      if (raw_info && raw_info.descr.indexOf(img_urls[i]) < 80 || (_index > 0 && raw_info.descr.indexOf(img_urls[i]) < _index)) {
        img_urls[i] = '';
        continue;
      }
      if (raw_info) {
        raw_info.descr = raw_info.descr.replace(img_urls[i], '');
      }
      var item = img_urls[i].match(/\[img\](.*?)\[\/img\]/)[1];
      if (img_urls[i].match(/\[url=(https:\/\/i.ibb.co\/.*?\.png)\]/)) {
        item = img_urls[i].match(/\[url=(https:\/\/i.ibb.co\/.*?\.png)\]/)[1];
      }
      if (item.match(/imgbox/)) {
        item = item.replace('thumbs2', 'images2').replace('t.png', 'o.png');
      } else if (item.match(/pixhost/)) {
        item = item.replace('//t', '//img').replace('thumbs', 'images');
      } else if (item.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
        item = item.replace(/th.png/, 'png').replace(/md.png/, 'png');
      } else if (item.match(/beyondhd.co\/(images|cache)/)) {
        item = item.replace(/th.png/, 'png').replace(/md.png/, 'png').replace('/t/', '/i/');
      } else if (item.match(/tu.totheglory.im/)) {
        item = item.replace(/_thumb.png/, '.png');
      }
      if (need_img_label) {
        img_info += '\n' + `[img]${item}[/img]`;
      } else {
        img_info += '\n' + item;
      }
    }
    container.val(img_info.trim());
    if (callback) {
      callback(img_info);
    }
    if (remove_img) {
      remove_img(img_urls);
    }
  } catch (err) { }
}

if (site_url.match(/https:\/\/(springsunday.net|www.hddolby.com|ptlgs.org)\/upload.php/)) {
  $('#url_vimages').after(`<a href="" id="get_full_size" style="color: red" title="点击获取原图,目前支持imgbox，pixhost，pter，ttg，瓷器，img4k">获取原图</a>`);
  $('textarea[name="screenshots"]').after(`<br><a href="" id="get_full_size" style="color: red" title="点击获取原图,目前支持imgbox，pixhost，pter，ttg，瓷器，img4k">获取原图</a>`);
  $('#get_full_size').click(function (e) {
    e.preventDefault();
    get_full_size_picture_urls(null, $('#url_vimages').val(), $('#url_vimages'), false);
    get_full_size_picture_urls(null, $('textarea[name="screenshots"]').val(), $('textarea[name="screenshots"]'), false);
  });
}

function get_bluray_name_from_descr(descr, name) {
  var temp_title = "";
  //分辨率
  if (descr.match(/(2160)(P|I)/i)) {
    temp_title = temp_title + "2160p.Blu-ray ";
  } else if (descr.match(/(1080)(P)/i)) {
    temp_title = temp_title + "1080p.Blu-ray.";
  } else if (descr.match(/(1080)(i)/i)) {
    temp_title = temp_title + "1080i.Blu-ray.";
  }

  if (descr.match(/Ultra HD|UHD/i)) {
    temp_title = "UHD ";
  }

  //视频编码
  if (descr.match(/(AVC Video)/i)) {
    temp_title = temp_title + "AVC.";
  } else if (descr.match(/(HEVC)/i)) {
    temp_title = temp_title + "HEVC.";
  } else if (descr.match(/MPEG-2 Video/i)) {
    temp_title = temp_title + "MPEG-2.";
  }

  //音频编码
  if (descr.match(/DTS:X[\s\S]{0,200}?7.1/i)) {
    temp_title = temp_title + "DTS-HD.MA.7.1";
  } else if (descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
    temp_title = temp_title + "TrueHD." + descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)[1];
  } else if (descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
    temp_title = temp_title + "DTS-HD.MA." + descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)[1];
  } else if (descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
    temp_title = temp_title + "LPCM." + descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)[1];
  } else if (descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
    temp_title = temp_title + "DD." + descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)[1];
  }

  if (raw_info.name.match(/Blu-ray|DTS-HD|TrueHD|LPCM|HEVC|Bluray/)) {
    name = raw_info.name;
  } else if (name.match(/BLURAY|UHD.BLURAY/)) {
    name = name.replace(/MULTi.|DUAL.|SWEDiSH|DOCU/i, "");
    name = name.replace(/GERMAN/i, "GER");
    name = name.replace(/REMASTERED/i, "Remastered");
    name = name.replace(/UNCUT/i, "Uncut");
    name = name.replace(/COMPLETE[\s\S]{0,20}BLURAY/, temp_title);
  } else {
    name = name + '.' + temp_title + "-NoGroup";
  }
  return name;
}

const skip_img = [
  '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png[/img]',
  '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c7782a.png[/img]',
  '[img]https://images2.imgbox.com/04/6b/Ggp5ReQb_o.png[/img]',
  '[img]https://www.z4a.net/images/2019/09/13/info.png[/img]',
  '[img]https://www.z4a.net/images/2019/09/13/screens.png[/img]',
  '[img]https://i.loli.net/2019/03/28/5c9cb8f8216d7.png[/img]',
  '[img]https://hdsky.me/attachments/201410/20141003100205b81803ac0903724ad88de90649c5a36e.jpg[/img]',
  '[img]https://hdsky.me/adv/hds_logo.png[/img]',
  '[img]https://iili.io/XF9HEQ.png[/img]',
  '[img]https://img.pterclub.net/images/2022/03/24/58ef34eb1c04aa6f87442e439d103b29.png[/img]',
  '[img]https://img.pterclub.net/images/2021/07/14/78c58ee6b3e092d0c5a7fa02f3a1905e.png[/img]',
  '[img]https://pterclub.net/pic/CS.png[/img]',
  '[img]https://pterclub.net/pic/GDJT.png[/img]',
  '[img]http://img.pterclub.net/images/CS.png[/img]',
  '[img]https://img.pterclub.net/images/GDJT.png[/img]',
  '[img]https://kp.m-team.cc/logo.png[/img]',
  '[img]http://tpimg.ccache.org/images/2015/03/08/c736743e65f95c4b68a8acd3f3e2d599.png[/img]',
  '[img]https://ourbits.club/pic/Ourbits_info.png[/img]',
  '[img]https://ourbits.club/pic/Ourbits_MoreScreens.png[/img]',
  '[img]https://images2.imgbox.com/ce/e7/KCmGFMOB_o.png[/img]',
  '[img]https://img.m-team.cc/images/2016/12/05/d3be0d6f0cf8738edfa3b8074744c8e8.png[/img]',
  '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png[/img]',
  '[img]https://pic.imgdb.cn/item/6170004c2ab3f51d91c7782a.png[/img]',
  '[img]https://img.pterclub.net/images/CS.png[/img]',
  '[img]https://img.pterclub.net/images/2022/10/19/1.gif[/img]',
  '[img]https://img93.pixhost.to/images/86/435614074_c5134549f13c2c087d67c9fa4089c49e-removebg-preview.png[/img]'
];

//从简介拆分出来mediainfo和截图
function get_mediainfo_picture_from_descr(descr) {
  var info = { 'mediainfo': '', 'pic_info': '', 'multi_mediainfos': '' };
  var img_info = '';
  var mediainfo = '';
  var img_urls = descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
  var index_of_info = 0;
  if (descr.match(/◎译.{2,10}名|◎片.{2,10}名|片.{2,10}名/)) {
    index_of_info = descr.match(/◎译.{2,10}名|◎片.{2,10}名|片.{2,10}名/).index;
  }
  try {
    for (i = 0; i < img_urls.length; i++) {
      if (descr.indexOf(img_urls[i]) < 10 || descr.indexOf(img_urls[i]) < index_of_info) {
        info.cover_img = img_urls[i];
      } else {
        descr = descr.replace(img_urls[i], '');
        img_info += img_urls[i].match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/)[0];
      }
    }
  } catch (err) { img_info = ''; }
  descr = descr + '\n\n' + img_info;

  try {
    //获取mediainfo,这里可以扩展匹配不同情形
    if (descr.match(/DISC INFO:|.MPLS|Video Codec|Disc Label/i) && (raw_info.medium_sel == 'UHD' || raw_info.medium_sel == 'BluRay')) {
      mediainfo = descr.match(/\[quote.*?\][\s\S]*?(DISC INFO|.MPLS|Video Codec|Disc Label)[\s\S]*?\[\/quote\]/i)[0];
    } else if (descr.match(/General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率/i)) {
      mediainfo = descr.match(/\[quote.*?\][\s\S]*?(General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率)[\s\S]*?\[\/quote\]/ig);
      mediainfo = mediainfo.join('\n\n');
      if (mediainfo.match(/\.VOB|\.IFO/i)) {
        info.multi_mediainfos = mediainfo.replace(/\[\/?quote\]/g, '');
      }
    }
  } catch (err) {
    if (descr.match(/\n.*DISC INFO:[\s\S]*kbps.*/)) {
      mediainfo = descr.match(/\n.*DISC INFO:[\s\S]*kbps.*/)[0].trim();
    }
  }

  mediainfo = mediainfo.replace(/\[quote.*?\]/ig, '[quote]');
  while (mediainfo.match(/\[quote\]/i)) {
    mediainfo = mediainfo.slice(mediainfo.search(/\[quote\]/) + 7);
  }
  mediainfo = mediainfo.replace(/\[\/quote\]/i, '');
  mediainfo = mediainfo.replace(/\[\/?(font|size|quote|color).{0,80}?\]/ig, '');
  //获取图片
  var imgs = descr.split(/\[\/quote\]/).pop();
  imgs = imgs.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/g);
  try {
    if (imgs) {
      imgs = imgs.filter((item) => {
        if (skip_img.indexOf(item) < 0 && !item.match(/m.media-amazon.com\/images/)) {
          return item;
        }
      }).join(' ');
    } else {
      imgs = '';
    }
  } catch (err) {
    imgs = '';
  }
  info.mediainfo = mediainfo.trim();
  info.pic_info = imgs.trim();
  return info;
}
function fill_raw_info(raw_info, forward_site) {
  raw_info.descr = raw_info.descr.replace(/%3A/g, ':').replace(/%2F/g, "/");
  raw_info.descr = raw_info.descr.replace('[quote][/quote]', '').replace('[b][/b]', '').replace(/\n\n+/, '\n\n');
  raw_info.descr = raw_info.descr.replace('https://pic.imgdb.cn/item/6170004c2ab3f51d91c77825.png', 'https://img93.pixhost.to/images/86/435614074_c5134549f13c2c087d67c9fa4089c49e-removebg-preview.png');
  raw_info.descr = raw_info.descr.replace(/引用.{0,5}\n/g, '');
  raw_info.descr = raw_info.descr.replace(/.*ARDTU.*/g, '');
  //标题肯定都有，副标题可能没有，从简介获取
  if (raw_info.small_descr == '') {
    raw_info.small_descr = get_small_descr_from_descr(raw_info.descr, raw_info.name);
  }

// [Site Logic: 电影]

// [Site Logic: Lajidui]

  //补充豆瓣和imdb链接
  if (raw_info.url == '') {
    var url = raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i);
    if (url) {
      raw_info.url = url[0] + '/';
    }
  }
  if (raw_info.dburl == '') {
    var dburl = raw_info.descr.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i);
    if (dburl) {
      raw_info.dburl = dburl[0] + '/';
    }
  }

  raw_info.tracklist = raw_info.tracklist.replace(/\t/g, '');

  raw_info.url = raw_info.url.split('?').pop();
  //没有来源或者指向不明
  if (raw_info.source_sel == '' || raw_info.source_sel.match(/(港台|日韩)/)) {
    var region = get_source_sel_from_descr(raw_info.descr);
    if (raw_info.source_sel.match(/(港台|日韩)/)) {
// [Site Logic: 港台]
// [Site Logic: 日韩]
    }
    if (region != '' && raw_info.source_sel == '') {
      raw_info.source_sel = region;
    }
  }

  //如果没有媒介, 从标题获取
  if (raw_info.medium_sel == '') {
    raw_info.medium_sel = raw_info.name.medium_sel();
    if (!raw_info.medium_sel && raw_info.descr.match(/mpls/i)) {
      raw_info.medium_sel = 'Blu-ray';
    }
// [Site Logic: 音乐]
  }
// [Site Logic: Blu-Ray]

  //如果没有编码信息
  if (raw_info.codec_sel == '') {
    raw_info.codec_sel = raw_info.name.codec_sel();
  }

  //没有音频编码, 从标题获取，最后从简介获取
  if (raw_info.audiocodec_sel == '') {
    raw_info.audiocodec_sel = raw_info.name.audiocodec_sel();
    if (raw_info.audiocodec_sel == '') {
      raw_info.audiocodec_sel = raw_info.descr.audiocodec_sel();
    }
  }

  //没有分辨率
  if (raw_info.standard_sel == '') {
    raw_info.standard_sel = raw_info.name.standard_sel();
  }

  if (raw_info.standard_sel == '') {
    try {
      var height = raw_info.descr.match(/Height.*?:(.*?)pixels/i)[1].trim();
      if (height == '480' || height == '576') {
        raw_info.standard_sel = 'SD';
      } else if (height == '720') {
        raw_info.standard_sel = '720p';
      } else if (height == '1 080') {
        raw_info.standard_sel = '1080p';
        if (raw_info.descr.match(/Scan.*?type.*?(Interleaved|Interlaced)/i)) {
          raw_info.standard_sel = '1080i';
        }
      } else if (height == '2 160') {
        raw_info.standard_sel = '4K';
      }
    } catch (err) {
      if (raw_info.descr.match(/(1080|2160)p/)) {
        raw_info.standard_sel = raw_info.descr.match(/(1080|2160)p/)[0].replace('2160p', '4K');
      }
    }
  }

// [Site Logic: 1080P]

  if (raw_info.name.match(/Remux/i)) {
    raw_info.medium_sel = 'Remux';
  }

  if (raw_info.name.match(/webrip/i)) {
    raw_info.medium_sel = 'WEB-DL';
  }
  if (raw_info.edition_info.medium_sel()) {
    if (raw_info.edition_info.medium_sel() != 'Blu-ray' || raw_info.descr.match(/mpls/i)) {
      raw_info.medium_sel = raw_info.edition_info.medium_sel();
    } else if (raw_info.edition_info.medium_sel() == 'Blu-ray' && raw_info.edition_info.match(/mkv/i)) {
      raw_info.medium_sel = 'Encode';
    }
  }

// [Site Logic: H265]

// [Site Logic: Truehd]

  raw_info.descr = raw_info.descr.replace(/\n\n+/g, '\n\n').replace('https://dbimg.audiences.me/?', '').replace('https://imgproxy.pterclub.net/douban/?t=', '');
  raw_info.descr = raw_info.descr.replace('https://imgproxy.tju.pt/?url=', '');

  if (raw_info.edition_info.codec_sel()) {
    raw_info.codec_sel = raw_info.edition_info.codec_sel();
  }
// [Site Logic: Pter]
  if (raw_info.descr.match(/Writing library.*(x264|x265)/)) {
    raw_info.codec_sel = raw_info.descr.match(/Writing library.*(x264|x265)/)[1].toUpperCase();
  }

  if (raw_info.name.match(/dvdrip/i)) {
    raw_info.medium_sel = 'DVD';
  }
// [Site Logic: OurBits]
  try {
    if (raw_info.descr.match(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g).length >= 2) {
      raw_info.descr = raw_info.descr.split(/\[quote\].*?官组作品.*?\n?\[\/quote\]/g).pop();
      raw_info.descr = add_thanks(raw_info.descr);
    }
  } catch (err) { }
  raw_info.descr = raw_info.descr.trim();
  return raw_info;
}

//PTHome、HDHome、杜比标签勾选
function check_label(nodes, value) {
  for (i = 0; i < nodes.length; i++) {
    if (nodes[i].value == value) {
      nodes[i].checked = true;
      break;
    }
  }
}

function init_buttons_for_transfer(container, site, mode, raw_info) {
  //imdb框
  var input_box = document.createElement('input');
  input_box.type = "text";
  input_box.className = "input";
  input_box.id = "input_box";
  input_box.value = raw_info.url;
  if (!raw_info.url && raw_info.dburl) {
    input_box.value = raw_info.dburl;
  }

// [Site Logic: PTP]
// [Site Logic: Bhd]
    input_box.style.width = '280px';
  }
// [Site Logic: Torrentleech]
  container.appendChild(input_box);

  var search_button = document.createElement("input");
  search_button.type = "button";
  search_button.style.marginLeft = '12px';
  search_button.style.marginRight = '4px';
  search_button.value = "检索名称";
  search_button.id = 'search_button';
  container.appendChild(search_button);

  var checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.setAttribute("id", 'douban_api');
  var douban_text = document.createTextNode('API');
  container.append(checkBox);
  container.append(douban_text);

  var ptgen_button = document.createElement("input");
  ptgen_button.type = "button";
  ptgen_button.style.marginLeft = '12px';
  ptgen_button.value = "ptgen跳转";
  ptgen_button.id = 'ptgen_button';
  container.appendChild(ptgen_button);

  var douban_button = document.createElement("input");
  douban_button.type = "button";
  douban_button.value = "点击获取";
  douban_button.id = 'douban_button';
  douban_button.style.marginLeft = '12px';
  container.appendChild(douban_button);

// [Site Logic: ZHUQUE]

// [Site Logic: Ttg]

// [Site Logic: Hdb]

// [Site Logic: In]
    checkBox.disabled = true;
  }

  // 上下结构
  if (mode == 1) {
    container.align = 'center';
    //匹配站点样式，为了美观
// [Site Logic: Mtv]
// [Site Logic: Btn]
// [Site Logic: Gpw]
// [Site Logic: HDOnly]
// [Site Logic: Btn]
  } else {
// [Site Logic: Hdoli]
// [Site Logic: Torrentleech]
// [Site Logic: Bhd]
// [Site Logic: Tik]
  }

// [Site Logic: Ttg]

  //把白框换个颜色
// [Site Logic: Hdoli]

// [Site Logic: Torrentleech]
}

function transmissionRequest(rpcUrl, username, password, base64, path, tag, skip_checking) {
  let sessionId = "";
  let data = {
    method: "torrent-add",
    arguments: {
      'metainfo': base64,
      'download-dir': path,
      'labels': tag,
      'skip-verify': skip_checking
    }
  };
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json",
      "X-Transmission-Session-Id": sessionId,
      "Authorization": "Basic " + btoa(username + ":" + password)
    };
    GM_xmlhttpRequest({
      method: "POST",
      url: rpcUrl,
      headers,
      data: JSON.stringify(data),
      onload: function (res) {
        // 先带用户名和密码获取sessionID，409返回sessionID
        console.log(res);
        if (res.status === 409) {
          const newSessionId = res.responseHeaders.match(/X-Transmission-Session-Id:\s*(.+)/i);
          if (newSessionId) { sessionId = newSessionId[1].trim(); }
          // 获取sessionID，添加种子
          GM_xmlhttpRequest({
            method: "POST",
            url: rpcUrl,
            headers: {
              ...headers,
              "X-Transmission-Session-Id": sessionId
            },
            data: JSON.stringify(data),
            onload: function (res2) {
              let result = JSON.parse(res2.responseText);
              if (result.result == 'success') {
                var $alertBox = $('#autoDismissAlert');
                $alertBox.fadeIn(400);
                setTimeout(function () {
                  $alertBox.fadeOut(600, function () {
                    $(this).remove();
                  });
                }, 2000);
              }
              resolve(result);
            },
            onerror: reject
          });
        } else {
          resolve(JSON.parse(res.responseText));
        }
      },
      onerror: function (res) {
        console.log(res);
        if (res.status === 408) {
          alert('请求超时，请检查服务器是否已经打开！');
        }
        reject
      }
    });
  });
}

function qbittorrentRequest(host, path, parameters) {
  var data = null, headers = {}, info = '添加种子';
  if (path == '/auth/login') {
    headers = { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" };
    data = new URLSearchParams(parameters).toString();
    info = '登录';
  } else {
    data = parameters;
  }
  const endpoint = 'api/v2';
  var alerted = false;
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${host}${endpoint}${path}`,
      data: data,
      headers: headers,
      onload: function (response) {
        if (response.responseText !== "Ok." && !alerted) {
          alert(`${info}请求错误，请检查qb状态和种子是否重复以及链接是否能正常下载种子。`);
          alerted = true;
          reject(response);
        } else {
          if (path == '/torrents/add') {
            var $alertBox = $('#autoDismissAlert');
            $alertBox.fadeIn(400);
            setTimeout(function () {
              $alertBox.fadeOut(600, function () {
                $(this).remove();
              });
            }, 2000);
          }
          resolve(`${info}成功！`);
        }
      },
      onerror: function (error) {
        reject(`${info}失败， ${error}！`);
      }
    });
  })
}

function get_torrentfile(path, category, skip_checking, server, callback) {
  if (server == 'qb') {
    GM_xmlhttpRequest({
      method: "GET",
      url: raw_info.torrent_url,
      responseType: "blob",
      onload: (xhr) => {
        const blob = xhr.response;
        const torrentFile = new File([blob], raw_info.torrent_name, { type: "application/x-bittorrent" });
        const formData = new FormData();
        const siteUpLimits = {
          'CMCT': 134217728,
          'Audiences': 131072000
        };
        if (siteUpLimits[raw_info.origin_site]) {
          formData.append('upLimit', siteUpLimits[raw_info.origin_site]);
        }
        formData.append('torrents', torrentFile);
        formData.append('savepath', path);
        formData.append('category', category);
        formData.append('skip_checking', skip_checking);
        callback(formData);
      },
      onerror: (res) => {
        console.error("Torrent download failed:", res);
      }
    });
  } else {
    GM_xmlhttpRequest({
      method: "GET",
      url: raw_info.torrent_url,
      responseType: "arraybuffer",
      onload: function (xhr) {
        const arrayBuffer = xhr.response;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        callback(base64Data);
      }
    });
  }
}

async function download_to_server_by_file(host, username, pwd, path, tag, skip_checking, server) {
  get_torrentfile(path, tag, skip_checking, server, function (formData) {
    if (server == 'qb') {
      qbittorrentRequest(host, '/auth/login', { username: username, password: pwd })
        .then(login_info => {
          console.log(login_info);
          return qbittorrentRequest(host, '/torrents/add', formData);
        }).then(info => {
          console.log(info);
        });
    } else {
      transmissionRequest(host +
        'transmission/rpc', username, pwd, formData, path, [tag], skip_checking);
    }
  });
}

function dialogBox(yesCallback, noCallback) {
  // 显示遮罩和对话框
  $('.wrap-dialog0').removeClass("hide").addClass("show");;
  // 确定按钮
  $('#confirm').click(function () {
    $('.wrap-dialog0').addClass("hide");
    yesCallback();
  });
  // 取消按钮
  $('#cancel').click(function () {
    $('.wrap-dialog0').addClass("hide");
    noCallback();
  });
  // 新增关闭按钮事件绑定
  $('.close-btn').click(function () {
    $('.wrap-dialog0').addClass("hide");
  });
}

function init_remote_server_button() {
  GM_addStyle(`
        /* 遮罩层样式 */
        .wrap-dialog0 {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px); /* 毛玻璃效果 */
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .wrap-dialog0.show {
            opacity: 1;
            visibility: visible;
        }

        /* 对话框容器 */
        .dialog0 {
            width: 90%;
            max-width: 300px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            transform: scale(0.95);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        .wrap-dialog0.show .dialog0 {
            transform: scale(1);
        }

        /* 标题栏样式 */
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
            margin: 5;
        }

        /* 关闭按钮样式 */
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
            backdrop-filter: blur(4px);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-50%) rotate(90deg);
        }

        .close-btn::after {
            content: "×";
            color: white;
            font-size: 20px;
            line-height: 1;
        }

        /* 内容区域样式 */
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

        /* 按钮组样式 */
        .dialog-footer0 {
            padding: 12px 25px;/* 进一步缩小内边距 */
            display: flex;
            justify-content: center;
            background: white;
        }

        /* 通用按钮样式 */
        .qb-btn {
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            font-weight: 500;
            min-width: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 10px;  /* 修改上下内边距 */
            min-height: 30px;    /* 新增最小高度 */
            line-height: 1.0;    /* 新增行高控制 */
        }

        /* 确认按钮 */
        #confirm {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            box-shadow: 0 4px 6px rgba(103, 119, 239, 0.2);
        }

        #confirm:hover {
            box-shadow: 0 6px 8px rgba(103, 119, 239, 0.3);
            transform: translateY(-1px);
        }

        /* 取消按钮 */
        #cancel {
            background: #e6f0ff;   /* 基础色 */
            color: #4a90e2;        /* 标题色 */
            border: 1px solid #c1d7f5;
            margin-left: 15px;
            &:hover {
                background: #d4e6ff;
                border-color: #99c2ff;
            }
        }

        /* 按钮点击效果 */
        .btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* 隐藏类样式 */
        .hide {
            display: none !important;
        }

        /* 辅助样式 */
        .ml50 {
            margin-left: 50px;
        }

        #autoDismissAlert {
            position: fixed; /* Stays in place even if the user scrolls */
            top: 5%;
            left: 50%;
            transform: translate(-50%, -50%); /* Centers the element perfectly */
            background-color: #4CAF50; /* Green background for success/info */
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
            z-index: 1000; /* Ensures it's on top of most other content */
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
        }

        #sidebar {
            position: fixed;
            top: 50%;
            right: 5px;
            transform: translateY(-50%);
            width: 70px;
            background-color: #2c3e50; /* Darker, modern primary color */
            border: none; /* Remove border for a cleaner look */
            border-radius: 8px 8px 8px 8px;
        }

        .sidebar-header {
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

        .download-icon {
            font-size: 18px;
            margin-top: 2px;
        }

        #sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar li {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar ul li:first-child a {
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar ul li:last-child a {
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar li a {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px 10px;
            text-decoration: none;
            color: #ecf0f1; /* Lighter text for contrast */
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; /* Modern font stack */
            font-size: 14px;
            font-weight: 500; /* Slightly bolder for readability */
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; /* Smooth transitions */
            gap: 8px; /* Add some space between icon and text if you add one */
        }

        #sidebar li a:hover {
            background-color: #34495e;
        }

        #sidebar .submenu {
            display: none;
            position: absolute;
            left: -100%;
            width: 70px;
            background-color: #34495e; /* Slightly different shade for submenu */
            border: none;
            border-radius: 8px 8px 8px 8px; /* Match main sidebar */
            box-shadow: -4px 0 10px rgba(0, 0, 0, 0.15); /* Subtler shadow for submenu */
            z-index: 10; /* Ensure submenu is above other content */
        }

        #sidebar li:hover .submenu {
            display: block;
        }

        #sidebar .submenu li a {
            display: flex;
            justify-content: center;
            align-items: center;
            color: #bdc3c7; /* Even lighter text for submenu items */
            padding: 12px 10px; /* Slightly less padding than main items */
            font-size: 13px; /* Slightly smaller font */
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }

        #sidebar .submenu li a:hover {
            background-color: #4a6781; /* Distinct hover for submenu */
            color: #ecf0f1; /* White text on hover for contrast */
        }
    `);
  $('body').append(`
        <div id="sidebar">
            <div class="sidebar-header">
                <span>远程推送</span>
                <div class="download-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="20" viewBox="0,0,256,256">
                        <g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="none" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path transform="scale(5.12,5.12)" d="M50,32c0,4.96484 -4.03516,9 -9,9h-30c-6.06641,0 -11,-4.93359 -11,-11c0,-4.97266 3.32422,-9.30469 8.01563,-10.59375c0.30859,-6.34375 5.56641,-11.40625 11.98438,-11.40625c4.01953,0 7.79688,2.05469 10.03516,5.40625c0.96875,-0.27344 1.94531,-0.40625 2.96484,-0.40625c5.91016,0 10.75,4.6875 10.98828,10.54297c3.52734,1.19141 6.01172,4.625 6.01172,8.45703z" id="strokeMainSVG" fill="#2c3e50" stroke="#2c3e50" stroke-width="2" stroke-linejoin="round"></path><g transform="scale(5.12,5.12)" fill="#ffffff" stroke="none" stroke-width="1" stroke-linejoin="miter"><path d="M43.98828,23.54297c-0.23828,-5.85547 -5.07812,-10.54297 -10.98828,-10.54297c-1.01953,0 -1.99609,0.13281 -2.96484,0.40625c-2.23828,-3.35156 -6.01562,-5.40625 -10.03516,-5.40625c-6.41797,0 -11.67578,5.0625 -11.98437,11.40625c-4.69141,1.28906 -8.01562,5.62109 -8.01562,10.59375c0,6.06641 4.93359,11 11,11h30c4.96484,0 9,-4.03516 9,-9c0,-3.83203 -2.48437,-7.26562 -6.01172,-8.45703zM25,35.41406l-6.70703,-6.70703l1.41406,-1.41406l4.29297,4.29297v-11.58594h2v11.58594l4.29297,-4.29297l1.41406,1.41406z"></path></g></g></g>
                    </svg>

                </div>
            </div>
            <ul id="sidebar_ul">
            </ul>
        </div>
    `);
  $('body').append(`
        <div id="autoDismissAlert" style="display:none;">
            <p style="margin:8px 12px">种子添加成功~~</p>
        </div>
    `);
  $('body').append(`
        <div class="wrap-dialog0 hide">
            <div class="dialog0">
                <div class="dialog-header0">
                    <span class="dialog-title0">是否跳过检验？</span>
                    <button class="close-btn"></button> <!-- 新增关闭按钮 -->
                </div>
                <div class="dialog-body0">
                    <span class="dialog-message">请谨慎选择，如果因为跳检造成做假种或者下载量增加后果自负！！</span>
                </div>
                <div class="dialog-footer0">
                    <input type="button" class="qb-btn" id="confirm" value="跳过检验" />
                    <input type="button" class="qb-btn ml50" id="cancel" value="直接下载" />
                </div>
            </div>
        </div>
    `);
  var qb = remote_server.qbittorrent;
  var tr = remote_server.transmission;
  for (let server in qb) {
    $('#sidebar_ul').append(`<li class="menu-item" id=${server}><a href="${qb[server].url}" target="_blank" title="${qb[server].url}">Q-${server}</a><ul class="submenu" id="ul_${server}"></ul></li>`);
    for (let path in qb[server].path) {
      $(`#ul_${server}`).append(`<li><a href="#" path=${qb[server].path[path]} class="qb_download" title="${qb[server].path[path]}">${path}</a></li>`);
    }
  }
  for (let server in tr) {
    $('#sidebar_ul').append(`<li class="menu-item" id=${server}><a href="${tr[server].url}" target="_blank" title="${tr[server].url}">T-${server}</a><ul class="submenu" id="ul_${server}"></ul></li>`);
    for (let path in tr[server].path) {
      $(`#ul_${server}`).append(`<li><a href="#" path=${tr[server].path[path]} class="tr_download" title="${tr[server].path[path]}">${path}</a></li>`);
    }
  }
  $('.qb_download').click(e => {
    e.preventDefault();
    server = $(e.target).parent().parent().parent().attr('id');
    path = $(e.target).attr('path');
    url = qb[server].url;
    username = qb[server].username;
    pwd = qb[server].password;
    tag = $(e.target).text();
    dialogBox(
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, true, 'qb');
      },
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, false, 'qb');
      }
    );
  });
  $('.tr_download').click(e => {
    e.preventDefault();
    server = $(e.target).parent().parent().parent().attr('id');
    path = $(e.target).attr('path');
    url = tr[server].url;
    username = tr[server].username;
    pwd = tr[server].password;
    tag = $(e.target).text();
    dialogBox(
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, true, 'tr');
      },
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, false, 'tr');
      }
    );
  });
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    const submenu = item.querySelector('.submenu');
    if (!submenu) return;
    item.addEventListener('mouseenter', function (e) {
      const rect = item.getBoundingClientRect();
      submenu.style.display = 'block';
      submenu.style.position = 'fixed';
      var element = document.getElementById('sidebar');
      const height = element.offsetHeight;
      submenu.style.top = `${rect.top - window.innerHeight / 2 + height / 2}px`;
    });

    item.addEventListener('mouseleave', function () {
      submenu.style.display = 'none';
    });
  });
}

function get_size_from_descr(descr) {
  size_ = 0;
  try {
    if (descr.match(/disc.{1,10}size.*?([\d, ]+).*?bytes/i)) {
      var size = descr.match(/disc.{1,10}size.*?([\d,\. ]+).*?bytes/i)[1];
      size = size.replace(/,|\.| /g, '');
      size_ = parseInt(size) / 1024 / 1024 / 1024;
    } else if (descr.match(/size[^\d]{0,20}(\d+\.\d+).+GiB/i)) {
      size_ = parseInt(descr.match(/size[^\d]{0,20}(\d+\.\d+).+GiB/i)[1]);
    }
  } catch (err) { }
  return size_;
}

function match_link(site, data) {
  var link = '';
  if (site == 'imdb' && data.match(/http(s*):\/\/.*?imdb.com\/title\/tt\d+/i)) {
    link = imdb_prex + data.match(/tt\d{5,13}/i)[0] + '/';
  } else if (site == 'douban' && data.match(/http(s*):\/\/.*?douban.com\/subject\/(\d+)/i)) {
    link = douban_prex + data.match(/subject\/(\d+)/i)[1] + '/';
  } else if (site == 'anidb' && data.match(/https:\/\/anidb\.net\/a\d+/i)) {
    link = data.match(/https:\/\/anidb\.net\/a\d+/i)[0] + '/';
  } else if (site == 'tmdb' && data.match(/http(s*):\/\/www.themoviedb.org\//i)) {
    link = data.match(/http(s*):\/\/www.themoviedb.org\/(tv|movie)\/\d+/i)[0] + '/';
  } else if (site == 'tvdb' && data.match(/http(s*):\/\/www.thetvdb.com\//i)) {
    link = 'https://www.thetvdb.com/?tab=series&id=' + data.match(/https?:\/\/www.thetvdb.com\/.*?id=(\d+)/i)[1];
  } else if (site == 'bangumi' && data.match(/https:\/\/bangumi.tv\/subject/i)) {
    link = 'https://bangumi.tv/subject/' + data.match(/https:\/\/bangumi.tv\/subject\/(\d+)/)[1];
  }
  return link;
}

function set_jump_href(raw_info, mode) {
  if (mode == 1) {
    for (key in used_site_info) {
      if (used_site_info[key].enable) {
// [Site Logic: Acm]
// [Site Logic: 纪录]
// [Site Logic: Acm]
// [Site Logic: Hdcity]
// [Site Logic: Byr]
// [Site Logic: 剧集]
// [Site Logic: 综艺]
// [Site Logic: Byr]
// [Site Logic: 纪录]
// [Site Logic: 剧集]
// [Site Logic: Blu]
// [Site Logic: 剧集]
// [Site Logic: Tik]
// [Site Logic: Cnz]
// [Site Logic: Hdspace]
// [Site Logic: ZHUQUE]
// [Site Logic: Yemapt]
// [Site Logic: Mteam]
// [Site Logic: 影]
// [Site Logic: Fnp]
          forward_url = used_site_info[key].url + 'upload.php';
// [Site Logic: Mtv]
        }
        jump_str = dictToString(raw_info);
        document.getElementById(key).href = forward_url + separator + encodeURI(jump_str);
      }
    }
  } else {
    var search_name = get_search_name(raw_info.name);
    if (raw_info.url) {
      var url = raw_info.url.match(/tt\d+/)[0];
      for (key in used_site_info) {
        if (used_site_info[key].enable) {
// [Site Logic: Ttg]
// [Site Logic: Hdroute]
// [Site Logic: Gpw]
// [Site Logic: Sc]
// [Site Logic: Hdb]
// [Site Logic: Mtv]
// [Site Logic: Bhd]
// [Site Logic: Nbl]
// [Site Logic: Ant]
// [Site Logic: Uhd]
// [Site Logic: Kg]
// [Site Logic: Hdspace]
// [Site Logic: Cnz]
// [Site Logic: Its]
// [Site Logic: Mteam]
// [Site Logic: Tvv]
// [Site Logic: Fnp]
            forward_url = used_site_info[key].url + 'torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={url}&search_area=4&search_mode=0'.format({ 'url': url });
          }
          try { document.getElementById(key).href = forward_url; } catch (err) { }
        }
      }
    } else {
      for (key in used_site_info) {
        if (used_site_info[key].enable) {
// [Site Logic: Opencd]
            search_name = get_search_name(raw_info.name);
          }
// [Site Logic: Ttg]
// [Site Logic: Hdroute]
// [Site Logic: Gpw]
// [Site Logic: Nbl]
// [Site Logic: Ant]
// [Site Logic: Cnz]
// [Site Logic: Mtv]
// [Site Logic: Its]
// [Site Logic: Tvv]
// [Site Logic: Kg]
// [Site Logic: Sc]
// [Site Logic: Hdb]
// [Site Logic: Opencd]
// [Site Logic: Ops]
// [Site Logic: Red]
// [Site Logic: Mteam]
// [Site Logic: Tik]
            forward_url = used_site_info[key].url + 'torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={name}&search_area=0&search_mode=0'.format({ 'name': search_name });
          }
          try { document.getElementById(key).href = forward_url; } catch (err) { }
        }
      }
    }
  }
}

function postData(url, meta, callback) {
  GM_xmlhttpRequest({
    'method': "POST",
    'url': url,
    'headers': {
      "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
    },
    'data': meta,
    onload: function (response) {
      callback(response.responseText);
    }
  });
}

function getDoc(url, meta, callback) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: url,
    onload: function (responseDetail) {
      if (responseDetail.status === 200) {
        let doc = page_parser(responseDetail.responseText);
        callback(doc, responseDetail, meta);
      } else {
        callback('error', null, null);
      }
    }
  });
}

function page_parser(responseText) {
  responseText = responseText.replace(/s+src=/ig, ' data-src=');
  return (new DOMParser()).parseFromString(responseText, 'text/html');
}

function get_search_name(name) {
  search_name = name;
// [Site Logic: 音乐]
  if (name.match(/S\d{1,3}/i)) {
    search_name = name.split(/S\d{1,3}/i)[0];
    search_name = search_name.replace(/(19|20)\d{2}/ig, '').trim();
  } else {
    if (name.match(/(19|20)\d{2}/)) {
      search_name = name.split(name.match(/(19|20)\d{2}/g).pop())[0];
    }
  }
  search_name = search_name.replace(/repack|Extended|cut/ig, '');
  search_name = search_name.split(/aka/i)[0];
  return search_name;
}

function getJson(url, meta, callback) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: url,
    onload: function (responseDetail) {
      if (responseDetail.status === 200 && !responseDetail.responseText.includes("<!DOCTYPE html>")) {
        let response = JSON.parse(responseDetail.responseText);
        callback(response, responseDetail, meta);
      } else {
        callback({}, responseDetail, meta);
      }
    }
  });
}

var pt_icos = GM_getValue('pt_icos');
if (pt_icos === undefined || if_new_site_added) {
  try {
    getJson('https://gitee.com/tomorrow505/auto-feed-helper/raw/master/sorted_pt_sites_icos.json', null, function (data) {
      GM_setValue('pt_icos', data.data);
      location.reload();
    });
  } catch (err) {
    GM_setValue('pt_icos', '{}');
    location.reload();
  }
} else {
  pt_icos = JSON.parse(decodeURIComponent(escape(atob(pt_icos))));
}

function getData(imdb_url, callback) {
  var imdb_id = imdb_url.match(/tt\d+/)[0];
  var search_url = 'https://m.douban.com/search/?query=' + imdb_id + '&type=movie';
  console.log('正在获取数据……');
  getDoc(search_url, null, function (doc) {
    if ($('ul.search_results_subjects', doc).length) {
      var douban_url = 'https://movie.douban.com/subject/' + $('ul.search_results_subjects', doc).find('a').attr('href').match(/subject\/(\d+)/)[1];
      if (douban_url.search('35580200') > -1) {
        return;
      }
      getDoc(douban_url, null, function (html) {
        var raw_data = {};
        var data = { 'data': {} };
        raw_data.title = $("title", html).text().replace("(豆瓣)", "").trim();
        try {
          raw_data.image = $('#mainpic img', html)[0].src.replace(
            /^.+(p\d+).+$/,
            (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
          );
        } catch (e) { raw_data.image = 'null' }

        raw_data.id = douban_url.match(/subject\/(\d+)/)[1];
        $('#input_box').wait(function () {
          $('#input_box').val(douban_url);
          $('#ptgen').attr('href', douban_url);
        });
        try { raw_data.year = parseInt($('#content>h1>span.year', html).text().slice(1, -1)); } catch (e) { raw_data.year = '' }
        try { raw_data.aka = $('#info span.pl:contains("又名")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.aka = 'null' }
        try { raw_data.average = parseFloat($('#interest_sectl', html).find('[property="v:average"]').text()); } catch (e) { raw_data.average = '' }
        try { raw_data.votes = parseInt($('#interest_sectl', html).find('[property="v:votes"]').text()); } catch (e) { raw_data.votes = '' }
        try { raw_data.genre = $('#info span[property="v:genre"]', html).toArray().map(e => e.innerText.trim()).join('/'); } catch (e) { raw_data.genre = '' }
        try { raw_data.region = $('#info span.pl:contains("制片国家/地区")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.region = '' }
        try { raw_data.director = $('#info span.pl:contains("导演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.director = '' }
        try { raw_data.language = $('#info span.pl:contains("语言")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.language = '' }
        try { raw_data.releaseDate = $('#info span[property="v:initialReleaseDate"]', html).toArray().map(e => e.innerText.trim()).sort((a, b) => new Date(a) - new Date(b)).join('/'); } catch (e) { raw_data.releaseDate = '' }
        try { raw_data.runtime = $('span[property="v:runtime"]', html).text(); } catch (e) { raw_data.runtime = '' }
        try { raw_data.cast = $('#info span.pl:contains("主演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.cast = '' }
        try {
          raw_data.summary = Array.from($('#link-report-intra>[property="v:summary"],#link-report-intra>span.all.hidden', html)[0].childNodes)
            .filter(e => e.nodeType === 3)
            .map(e => e.textContent.trim())
            .join('\n');
        } catch (e) {
          raw_data.summary = '';
        }
        data.data = raw_data;
        callback(data)
      });
    }
  });
}

function getDataFromDou(douban_url, callback) {
  getDoc(douban_url, null, function (html) {
    var raw_data = {};
    var data = { 'data': {} };
    raw_data.title = $("title", html).text().replace("(豆瓣)", "").trim();
    try {
      raw_data.image = $('#mainpic img', html)[0].src.replace(
        /^.+(p\d+).+$/,
        (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
      );
    } catch (e) { raw_data.image = 'null' }

    raw_data.id = douban_url.match(/subject\/(\d+)/)[1];
    try { raw_data.year = parseInt($('#content>h1>span.year', html).text().slice(1, -1)); } catch (e) { raw_data.year = '' }
    try { raw_data.aka = $('#info span.pl:contains("又名")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.aka = 'null' }
    try { raw_data.imdb = $('#info span.pl:contains("IMDb")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.imdb = '' }
    try { raw_data.average = parseFloat($('#interest_sectl', html).find('[property="v:average"]').text()); } catch (e) { raw_data.average = '' }
    try { raw_data.votes = parseInt($('#interest_sectl', html).find('[property="v:votes"]').text()); } catch (e) { raw_data.votes = '' }
    try { raw_data.genre = $('#info span[property="v:genre"]', html).toArray().map(e => e.innerText.trim()).join('/'); } catch (e) { raw_data.genre = '' }
    try { raw_data.region = $('#info span.pl:contains("制片国家/地区")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.region = '' }
    try { raw_data.director = $('#info span.pl:contains("导演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.director = '' }
    try { raw_data.language = $('#info span.pl:contains("语言")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.language = '' }
    try { raw_data.releaseDate = $('#info span[property="v:initialReleaseDate"]', html).toArray().map(e => e.innerText.trim()).sort((a, b) => new Date(a) - new Date(b)).join('/'); } catch (e) { raw_data.releaseDate = '' }
    try { raw_data.runtime = $('span[property="v:runtime"]', html).text(); } catch (e) { raw_data.runtime = '' }
    try { raw_data.cast = $('#info span.pl:contains("主演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.cast = '' }
    try {
      raw_data.summary = Array.from($('#link-report-intra>[property="v:summary"],#link-report-intra>span.all.hidden', html)[0].childNodes)
        .filter(e => e.nodeType === 3)
        .map(e => e.textContent.trim())
        .join('\n');
    } catch (e) {
      raw_data.summary = '';
    }
    data.data = raw_data;
    callback(data)
  });
}

function rehost_single_img(site, img_url) {
  if (site == 'catbox') {
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://catbox.moe/user/api.php",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
        },
        "data": encodeURI(`url=${img_url}&userhash=&reqtype=urlupload`),
        "onload": function (response) {
          if (response.status != 200) {
            reject("Response error " + response.status);
          } else {
            resolve(`[img]${response.responseText}[/img]`);
          }
        }
      });
    });
  } else {
    return new Promise(function (resolve, reject) {
      var raw_str = site == 'imgbb' ? 'image' : 'source';
      var data = encodeURI(`${raw_str}=${img_url}&key=${used_rehost_img_info[site]['api-key']}`);
      const show_temple = ['展示：{url_viewer}', '原图: [img]{origin_url}[/img]', '缩略图：[img]{thumb_url}[/img]', 'bbcode中等: [url={url_viewer}][img]{medium_url}[/img][/url]', 'bbcode缩略: [url={url_viewer}][img]{thumb_url}[/img][/url]']
      GM_xmlhttpRequest({
        "method": "POST",
        "url": used_rehost_img_info[site]['api-url'],
        "responseType": "json",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
        },
        "data": data,
        "onload": function (response) {
          console.log(response);
          if (response.status != 200) { reject("Response error " + response.status); }
          else {
            if (site == 'imgbb') {
              data = JSON.parse(response.responseText).data;
              var bbcode_medium_url = data.url;
            } else if (site == 'gifyu') {
              data = JSON.parse(response.responseText).image;
              var bbcode_medium_url = data.url;
            } else if (site == 'freeimage') {
              data = JSON.parse(response.responseText).image;
              var bbcode_medium_url = data.url;
            }
            var show_result = show_temple.join('\n').format({ 'url_viewer': data.url_viewer, 'thumb_url': data.thumb.url, 'origin_url': data.url, 'medium_url': bbcode_medium_url });
            resolve(show_result);
          }
        }
      });
    });
  }
}

function rebuild_href(raw_info) {
  jump_str = dictToString(raw_info);
  tag_aa = forward_r.getElementsByClassName('forward_a');
  for (i = 0; i < tag_aa.length; i++) {
    if (['常用站点', 'PTgen', '简化MI', '脚本设置', '重置托管', '单图转存', '图标刷新', '提取图片'].indexOf(tag_aa[i].textContent) < 0) {
      tag_aa[i].href = decodeURI(tag_aa[i]).split(separator)[0] + separator + encodeURI(jump_str);
    }
  }
}

function build_blob_from_torrent(r, forward_announce, forward_site, filetype, callback) {
  var name = '';
  if (forward_site !== null && forward_site != 'hdb-task') {
    if (r.match(/value="firsttime"/)) {
      alert("加载种子失败，请先在源站进行一次种子下载操作！！！");
      return;
    }
    if (r.match(/Request frequency limit/)) {
      alert("TTG提示：频率太快，600秒后再来！");
      return;
    }
// [Site Logic: PTP]
    var new_torrent = 'd';
    var announce = 'https://hudbt.hust.edu.cn/announce.php';
    if (forward_announce !== null) {
      announce = forward_announce;
    }
    if (r.match(/8:announce\d+:/)) {
      var new_announce = `8:announce${announce.length}:${announce}`;
      new_torrent += new_announce;
    } else {
      alert('种子文件加载失败！！！');
      return;
    }
    if (r.match(/13:creation date/)) {
      try {
        var date = r.match(/13:creation datei(\d+)e/)[1];
        var new_date = parseInt(date) + 600 + parseInt(Math.random() * (600), 10);
        var new_date_str = `13:creation datei${new_date.toString()}e`;
        new_torrent += new_date_str;
      } catch (err) { }
    }
    new_torrent += '8:encoding5:UTF-8';
    var info = r.match(/4:info[\s\S]*?privatei\de/)[0].replace('privatei0e', 'privatei1e');
    new_torrent += info;
    var new_source = `6:source${forward_site.length}:${forward_site.toUpperCase()}`;
    new_torrent += new_source;
    new_torrent += 'ee';
    r = new_torrent;
  }
  var data = new Uint8Array(r.length)
  var i = 0;
  while (i < r.length) {
    data[i] = r.charCodeAt(i);
    i++;
  }
  var blob = new Blob([data], { type: filetype });
  var data = {
    'data': blob,
    'name': name
  }
  callback(data);
}

function getBlob(url, forward_announce, forward_site, filetype, callback) {
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    overrideMimeType: "text/plain; charset=x-user-defined",
    onload: (xhr) => {
      var r = xhr.responseText;
      build_blob_from_torrent(r, forward_announce, forward_site, filetype, callback);
    },
    onerror: function (res) {
      console.log(res);
    }
  });
}

function fill_torrent(forward_site, container, name) {
// [Site Logic: Fnp]
// [Site Logic: Gpw]
// [Site Logic: HDB]
// [Site Logic: Cnz]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: ZHUQUE]
// [Site Logic: Yemapt]
// [Site Logic: Rousi]
    $('input[name=file]')[0].files = container.files;
  }
}

function addTorrent(url, name, forward_site, forward_announce) {
// [Site Logic: Opencd]
  name = name.replace(/^\[.*?\](\.| )?/, '').replace(/ /g, '.').replace(/\.-\./, '-').trim();
  if (url.match(/d8:announce/)) {
    build_blob_from_torrent(url, forward_announce, forward_site, "application/x-bittorrent", function (data) {
      const blob = data.data;
      if (data.name) {
        name = data.name + '.torrent';
      }
      const files = new window.File([blob], name, { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
      fill_torrent(forward_site, container, name);
    });
  } else {
    getBlob(url, forward_announce, forward_site, "application/x-bittorrent", function (data) {
      const blob = data.data;
      if (data.name) {
        name = data.name.replace(/|™/g, "").trim().replace(/ /g, '.') + '.torrent';
      }
      const files = new window.File([blob], name, { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
      fill_torrent(forward_site, container, name);
    });
  }
}

function addPoster(url, forward_site) {
  try {
    var extension = url.match(/\.(jpg|jpeg|webp|png)$/)[1];
    if (extension == 'jpg') {
      extension = 'jpeg';
    }
    getBlob(url, null, null, extension, function (data) {
      const blob = data.data;
      const files = new window.File([blob], `cover.${url.match(/\.(jpg|jpeg|webp|png)$/)[1]}`, { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
// [Site Logic: Opencd]
    });
  } catch (err) { alert('封面图加载错误，很有可能是后缀不对') }
};

function reBuildHref(raw_info, forward_r) {
  $('#input_box').val(raw_info.url);
  try {
    var imdbid = raw_info.url.match(/tt\d+/i)[0];
    var imdbno = imdbid.substring(2);
  } catch (err) {
    imdbid = '';
    imdbno = '';
  }
  var container = $('#forward_r');
  if ($('.search_urls').length) {
    $('.search_urls').hide();
  }
  add_search_urls(container, imdbid, imdbno, search_name, 0);
  rebuild_href(raw_info);
}

function check_team(raw_info, s_name, forward_site) {
  if (raw_info.name.match(/MTeam/) && forward_site == 'HDHome') {
    $(`select[name="team_sel"]>option:eq(11)`).attr('selected', true);
    return;
  }
  $(`select[name="${s_name}"]>option`).map(function (index, e) {
    var name = raw_info.name.split(/(19|20)\d{2}/).pop();
    if (name.toLowerCase().match(e.innerText.toLowerCase())) {
      if ((name.match(/PSY|LCHD/) && e.innerText == 'CHD') || (name.match(/PandaMoon/) && e.innerText == 'Panda') || e.innerText == 'DIY' || e.innerText == 'REMUX') {
        console.log('小组名貌似会产生误判');
        return;
      } else if (name.match(/HDSpace/i) && e.innerText.match(/HDS/i)) {
        return;
      } else if (name.match(/HDClub/i) && e.innerText.match(/HDC/i)) {
        return;
      } else if (name.match(/REPACK/i) && e.innerText.match(/PACK/i)) {
        return;
      } else {
        $(`select[name^="${s_name}"]>option:eq(${index})`).attr('selected', true);
      }
    }
  });
}

async function selectDropdownOption(tid, index, targetTitle) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent('mousedown', true, true);
  document.getElementById(tid).dispatchEvent(clickEvent);
  await new Promise(resolve => setTimeout(resolve, 100));
  const listHolder = document.querySelectorAll('.rc-virtual-list-holder')[index];
  if (!listHolder) {
    console.error("未找到下拉列表，请确保下拉框已经打开！");
    return;
  }
  const findAndClick = () => {
    const option = listHolder.querySelector(`.ant-select-item-option[title="${targetTitle}"]`);
    if (option) {
      option.click();
      console.log(`已选择: ${targetTitle}`);
      return true;
    }
    return false;
  };
  if (typeof targetTitle === 'string') {
    if (findAndClick()) return;
    const scrollStep = 100;
    const delay = 100;
    let totalHeight = listHolder.scrollHeight;
    let currentScroll = 0;
    listHolder.scrollTop = 0;
    while (currentScroll < totalHeight) {
      listHolder.scrollTop += scrollStep;
      currentScroll += scrollStep;
      await new Promise(resolve => setTimeout(resolve, delay));
      if (findAndClick()) {
        return;
      }
      totalHeight = listHolder.scrollHeight;
    }
    console.log(`未找到选项: ${targetTitle}`);
  } else if (Array.isArray(targetTitle)) {
    targetTitle.map((x, index) => {
      setTimeout(function () {
        const option = document.querySelector(`.ant-select-item-option[title="${x}"]`);
        if (option) {
          option.click();
          console.log(`已选择: ${x}`);
        }
      }, index * 100);
    })
  }
}


if (site_url.match(/(broadcasthe.net|backup.landof.tv)\/.*.php.*/)) {
  $('#searchbars').find('li').each(function () {
    $(this).find('form').find('input').prop('size', 16);
  });
  $('table.torrent_table').find('tr.torrent').each(function () {
    var index = $(this).index();
    var $td = $(this).find('td:eq(2)');
    var title = $td.find('div.nobr:contains("Release Name")').find('span').prop('title');
    var group = title.match(/.*-(.*)/);
    var font = document.createElement('font');
    var season_info = $td.find('a:eq(3)').text();
    if (!season_info.match('Season')) {
      font.style.color = '#1e90ff';
    } else {
      font.style.color = '#db7093';
    }
    var unknown_group = false;
    if (group && group.length) {
      if (!group[1].match(/\[.*\]/)) {
        if ($td[0].childNodes[10].textContent.match(/\]/)) {
          $td[0].childNodes[9].textContent += ' / ' + group[1];
          if (extra_settings.btn_dark_color.enable) {
            font.innerHTML = ($td[0].childNodes[8].textContent + $td[0].childNodes[9].textContent + $td[0].childNodes[10].textContent).replace(group[1], `<b><font color="#20B2AA">${group[1]}</font></b>`);
            $td[0].childNodes[10].parentNode.removeChild($td[0].childNodes[10]);
            $td[0].childNodes[9].parentNode.removeChild($td[0].childNodes[9]);
            $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
          }
        } else {
          var ori_text = $td[0].childNodes[8].textContent;
          $td[0].childNodes[8].textContent = ori_text.replace(/\[(.*?)\]/, `$1 / ${group[1]}`);
          if (extra_settings.btn_dark_color.enable) {
            font.innerHTML = $td[0].childNodes[8].textContent.replace(group[1], `<b><font color="#20B2AA">${group[1]}</font></b>`);
            $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
          }
        }
      } else {
        unknown_group = true;
      }
    } else {
      unknown_group = true;
    }
    if (unknown_group) {
      font.style.color = '#1e90ff';
      var ori_text = $td[0].childNodes[8].textContent;
      $td[0].childNodes[8].textContent = ori_text.replace(/\[(.*?)\]/, `$1 / Unknown`);
      if (extra_settings.btn_dark_color.enable) {
        font.innerHTML = $td[0].childNodes[8].textContent.replace('Unknown', `<b><font color="#20B2AA">Unknown</font></b>`);
        $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
      }
    }
    if (extra_settings.btn_dark_color.enable) {
      $(this).find('td:gt(2)').css({ 'color': 'grey' });
      $td.find('a:lt(4)').css({ 'font-size': 'small', 'font-weight': 'bold' });
      $td.find('div.nobr:contains("Release Name")').css({ 'color': 'grey' });
      $td.find('div.nobr:contains("Up:")').css({ 'color': 'grey' });
    }

    var name = $td.find('a:eq(2)').text();
    $td.find('br').replaceWith($(`<div><a name="douban_${index}" href=https://search.douban.com/movie/subject_search?search_text=${name.replace(/ /g, '%20')}&cat=1002 target="_blank">[Douban]</a>
            <a name="imdb_${index}" href=https://www.imdb.com/find?q=${name.replace(/ /g, '%20')}&ref_=nv_sr_sm target="_blank">[IMDB]</a>
            <a href=https://www.themoviedb.org/search?language=zh-CN&query=${name.replace(/ /g, '%20')} target="_blank">[TMDB]</a>
            <a name="show_${index}" style="display: none"></a>
            </div><span name="imdb_${index}" style="display: none"><a name="get_${index}">GET</a></span>`
    ));
  });
}

if (site_url.match(/^https?:\/\/(broadcasthe.net|backup.landof.tv)\/series.php\?id=\d+/)) {
  var name = $('title').text().split(':')[0].trim();
  var imdb_url = $('img[src*="tvicon/imdb.png"]:eq(0)').parent().attr('href');
  if (imdb_url == '') {
    imdb_url = `https://www.imdb.com/find?q=${name.replace(/ /g, '%20')}&ref_=nv_sr_sm`;
  }
  $('#content').find('div.linkbox:eq(0)').prepend(`<font size="5px" color="red">${name}</font><br>
        <div><a href=https://search.douban.com/movie/subject_search?search_text=${name.replace(/ /g, '%20')}&cat=1002 target="_blank">[Douban]</a>
        <a href=${imdb_url} target="_blank">[IMDB]</a>
        <a href=https://www.themoviedb.org/search?language=zh-CN&query=${name.replace(/ /g, '%20')} target="_blank">[TMDB]</a>
        </div>
    `);
}

// [Site Logic: HDOnly]

// [Site Logic: HDB]

// [Site Logic: NZBS]

// [Site Logic: HDB]

// [Site Logic: PTP]

// [Site Logic: PTP]

// [Site Logic: PTP]

if (site_url.match(/^https?:\/\/secret-cinema.pw\/torrents.php\?id.*/) && all_sites_show_douban) {
  $(function () {
    const imdbLink = $('a:contains("IMDB")').attr('href');
    if (!imdbLink) {
      return;
    }
    getData(imdbLink, function (data) {
      console.log(data);
      if (data.data) {
        addInfoToPage(data['data']);
      } else {
        return;
      }
    });
  })

  const addInfoToPage = (data) => {
    var total = 10;
    var split = '/';
    if (!data.average) {
      data.average = '暂无评分';
      total = '';
      data.votes = 0;
      split = '';
    }
    if (isChinese(data.title)) {
      $('h2').first().prepend(`<a  target='_blank' href="https://movie.douban.com/subject/${data.id}">[${data.title.split(' ')[0]}] </a>`);
    }
    if (data.summary) {
      var tmp = data.summary.split('   ');
      data.summary = '';
      for (var i = 0; i < tmp.length; i++) {
        var tmp_str = tmp[i].trim();
        if (tmp_str) {
          data.summary += '\t' + tmp_str + '\n';
        }
      }
      $('div.box_artists').before(`<div>
            <div class="head"><span><strong>简介</strong></span></div>
            <div>&nbsp&nbsp&nbsp&nbsp${data.summary}</div></div><br>`);
    }
    try {
      $('div.box_artists').before(`
                <div>
                <div class="head"><span><strong>电影信息</strong></span></div>
                <div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp导演:</strong> ${data.director}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp演员:</strong> ${data.cast}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp类型:</strong> ${data.genre}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp制片国家/地区:</strong> ${data.region}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp语言:</strong> ${data.language}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp时长:</strong> ${data.runtime}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp又名:</strong> ${data.aka}</div>
                <div><span><strong>&nbsp&nbsp&nbsp&nbsp评分:</strong> ${data.average}</span>
                <span class="mid">${split}</span>
                <span class="outof"> ${total} </span> from ${data.votes} votes</div>
                </div>
                <br>
            `)
    } catch (err) { }
  }
  const isChinese = (title) => {
    return /[\u4e00-\u9fa5]+/.test(title)
  }
}

if (site_url.match(/^https?:\/\/www.morethantv.me\/torrents.php\?id.*/)) {
  $(function () {
    const imdbLink = match_link('imdb', $('div.main_column').html());
    if (!imdbLink) {
      return;
    }
    getData(imdbLink, function (data) {
      console.log(data);
      if (data.data) {
        addInfoToPage(data['data']);
      } else {
        return;
      }
    });
  })

  const addInfoToPage = (data) => {
    var total = 10;
    var split = '/';
    if (!data.average) {
      data.average = '暂无评分';
      total = '';
      data.votes = 0;
      split = '';
    }
    if (isChinese(data.title)) {
      $('h2').first().find('a:eq(1)').prepend(`<a  target='_blank' href="https://movie.douban.com/subject/${data.id}">[${data.title.split(' ')[0]}] </a>`);
    }
    if (data.summary) {
      var tmp = data.summary.split('   ');
      data.summary = '';
      for (var i = 0; i < tmp.length; i++) {
        var tmp_str = tmp[i].trim();
        if (tmp_str) {
          data.summary += '\t' + tmp_str + '\n';
        }
      }
      $('div.sidebar').prepend(`<div id="introduction">
            <div class="head"><span><strong>简介</strong></span></div>
            <div>&nbsp&nbsp&nbsp&nbsp${data.summary}</div></div><br>`);
    }
    try {
      $('#introduction').after(`
                <div>
                <div class="head"><span><strong>电影信息</strong></span></div>
                <div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp导演:</strong> ${data.director}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp演员:</strong> ${data.cast}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp类型:</strong> ${data.genre}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp制片国家/地区:</strong> ${data.region}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp语言:</strong> ${data.language}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp时长:</strong> ${data.runtime}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp又名:</strong> ${data.aka}</div>
                <div><span><strong>&nbsp&nbsp&nbsp&nbsp评分:</strong> ${data.average}</span>
                <span class="mid">${split}</span>
                <span class="outof"> ${total} </span> from ${data.votes} votes</div>
                </div>
            `)
    } catch (err) { }
  }
  const isChinese = (title) => {
    return /[\u4e00-\u9fa5]+/.test(title)
  }
}

// [Site Logic: HDB]

// [Site Logic: HDB]

if (site_url.match(/^https:\/\/hd-torrents\.org\/torrents.*/) && show_search_urls['HDT']) {
  $('.mainblockcontenttt tr').each(function () {
    var $td = $(this).find('td:eq(2)');
    var name = $td.find('a').first().text();
    if (name) {
      try {
        var imdbid = $td.html().match(/imdb\.com\/title\/(tt\d+)/i)[1];
        var imdbno = imdbid.substring(2);

        var search_name = get_search_name(name);
        if (name.match(/S\d+/i)) {
          var number = parseInt(name.match(/S(\d+)/i)[1]);
          search_name = search_name + ' Season ' + number;
        }
        var $container = $td;
        add_search_urls($container, imdbid, imdbno, search_name, 1);
      } catch (err) { }
    }

  });

  $('.hdblock:eq(1) tr').each(function () {
    var $td = $(this).find('td:eq(1)');
    var name = $td.find('a').first().text();
    if (name) {
      try {
        var imdbid = $td.html().match(/imdb\.com\/title\/(tt\d+)/i)[1];
        var imdbno = imdbid.substring(2);

        var search_name = get_search_name(name);
        if (name.match(/S\d+/i)) {
          var number = parseInt(name.match(/S(\d+)/i)[1]);
          search_name = search_name + ' Season ' + number;
        }
        var $container = $td;
        add_search_urls($container, imdbid, imdbno, search_name, 1);
      } catch (err) { }
    }

  });
}

if (site_url.match(/^https:\/\/xthor.tk\/.*/)) {

  try {
    var navbar_html = $('#navbar').html();
    navbar_html = navbar_html.replace(/Recherche/g, 'Research');
    navbar_html = navbar_html.replace('Parcourir', 'Browse');
    navbar_html = navbar_html.replace('Nouveautés/Catégorie', 'New Arrivals/Category');
    navbar_html = navbar_html.replace('Nouveautés', 'News');
    navbar_html = navbar_html.replace('Requêtes', 'Requests');
    navbar_html = navbar_html.replace('Besoin de Seed', 'Need Seed');
    navbar_html = navbar_html.replace('Communauté', 'Community');

    navbar_html = navbar_html.replace('Médiathèque', 'Media Library');
    navbar_html = navbar_html.replace(/Séries/g, 'Series');
    navbar_html = navbar_html.replace(/Auteurs/g, 'Authors');
    navbar_html = navbar_html.replace(/Livres/g, 'Books');
    navbar_html = navbar_html.replace(/Jeux Vidéo/g, 'Video games');
    navbar_html = navbar_html.replace(/Acteurs/g, 'Actors');
    navbar_html = navbar_html.replace(/Porno/g, 'Porn');
    navbar_html = navbar_html.replace(/Séries/g, 'Series');
    navbar_html = navbar_html.replace(`Ce que j'aime`, 'What I like');
    navbar_html = navbar_html.replace(/Mes séries/g, 'My series');
    navbar_html = navbar_html.replace(/Ce que j'aime/g, 'What I like');
    navbar_html = navbar_html.replace('Sagas', 'My series');

    navbar_html = navbar_html.replace(/Mon Profil/g, 'My profile');
    navbar_html = navbar_html.replace(/Activité/g, 'Activity');
    navbar_html = navbar_html.replace(/Réglages/g, 'Settings');
    navbar_html = navbar_html.replace(/Amis/g, 'Friends');
    navbar_html = navbar_html.replace(/Favoris/g, 'Favorites');
    navbar_html = navbar_html.replace(/Mes Flux RSS/g, 'My RSS Feeds');
    navbar_html = navbar_html.replace('Mes messages Privés', 'My private messages');

    navbar_html = navbar_html.replace(/Outils/g, 'Tools');
    navbar_html = navbar_html.replace(/Hebergeur d'images/g, 'Image Host');
    navbar_html = navbar_html.replace(/Teams Bannies/g, 'Banned Teams');
    navbar_html = navbar_html.replace(/Règles/g, 'Rules');
    navbar_html = navbar_html.replace(/Aide/g, 'Aid');
    navbar_html = navbar_html.replace('Contacter le staff', 'Contact staff');
    navbar_html = navbar_html.replace('Signaler un bug', 'Report a bug');
    $('#navbar').html(navbar_html);
  } catch (err) { }

  if (site_url.match(/upload.php/)) {
    var origin_html = $('td:contains(Fichier Torrent)').parent().parent().html();
    origin_html = origin_html.replace('Fichier Torrent', 'Torrent File');
    origin_html = origin_html.replace('Nom du Torrent', 'Torrent Name');
    origin_html = origin_html.replace('Fichier NFO', 'NFO File');
    origin_html = origin_html.replace('Pris du nom du fichier torrent si non spécifié.', '如果未指定，则取种子文件的名称。');
    origin_html = origin_html.replace(`Affiche`, '海报');
    origin_html = origin_html.replace(`Doit être hebergée sur`, '必须托管在');
    origin_html = origin_html.replace(`ou sur Xthor`, '或者xthor上');
    origin_html = origin_html.replace(` l'extension doit être jpg, png ou gif`, '扩展必须是JPG，PNG或GIF)');
    origin_html = origin_html.replace('La largeur du poster doit être de 500 Px maximum', '宽度最大限制为为500px');
    origin_html = origin_html.replace('ou', 'or');
    origin_html = origin_html.replace('pour les livres', 'for books');
    origin_html = origin_html.replace('pour les films, séries et anime', 'for movies, series and anime');
    origin_html = origin_html.replace('pour la musique', 'for music');
    origin_html = origin_html.replace('pour les jeux', 'for games');
    origin_html = origin_html.replace(`Le fait de mettre un lien vers une API permet de lier le torrent à la médiàthèque et de générer une prez si vous la laissez vide pour les torrents films, séries et jeux`,
      '对于电影、影视和动画，填写对应IMDB或TMDB的链接使您可以将种子绑定到对应库，并生成描述文本');
    origin_html = origin_html.replace(`Pour la musique et les livres la médiathèque récupère l'image que vous uploadez avec le torrent, veuillez choisir une image convenable`,
      '对于书籍和音乐，请上传合适的图片，我们将使用您上传的图片作为海报');
    origin_html = origin_html.replace(`inutile d'ajouter le lien imdb si il est déjà présent dans le nfo`, '如果NFO中已经存在，则无需添加IMDB链接');
    origin_html = origin_html.replace(`Ajouter l'url`, '添加');
    origin_html = origin_html.replace(`pour afficher le lien vers la vidéo dans les détails du Torrent`, '链接将在种子详细信息中心显示指向视频的链接');
    origin_html = origin_html.replace(`URL Affiche (facultatif)`, '海报链接(可选)');
    origin_html = origin_html.replace(`Catégorie`, 'Category');
    origin_html = origin_html.replace(`Si vous remplissez une requête, sélectionner la ici.`, '如果填充请求，请选择此处。');
    origin_html = origin_html.replace(`Autres`, 'Other');
    origin_html = origin_html.replace(`Type de Release`, 'Release Type');
    origin_html = origin_html.replace(`Inserez le lien d'une fiche Allociné afin de pouvoir générer une prez`, '不是很必须的链接，可以不填');
    origin_html = origin_html.replace(`Voix`, 'Voice(应该是音频，猜吧就~)');
    origin_html = origin_html.replace(`Voix`, 'Voice');
    $('td:contains(Fichier Torrent)').parent().parent().html(origin_html);
    $('.btn[value*="Générer une prez Allociné"]').val("生成描述文本");

    $('input[name=nfo]').parent().append(`<br><textarea id="pasteNfo" rows="15" style="width:600px"></textarea><br><input type="button" id="genNfo" value="生成nfo并上传">`);
    $('#genNfo').click((e) => {
      e.preventDefault();
      var r = $('#pasteNfo').val();
      if (!r) {
        return;
      }
      var data = new Uint8Array(r.length)
      var i = 0
      while (i < r.length) {
        data[i] = r.charCodeAt(i);
        i++
      }
      var blob = new Blob([data], { type: "text/x-nfo" });
      const files = new window.File([blob], 'movie.nfo', { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
      $('input[name=nfo]')[0].files = container.files;
    })
  } else if (site_url.match(/rules.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/xthor_rules.html', null, function (doc) {
      $('table.main').html($('table', doc).html());
      $("#firstpanel p.menu_head").click(function () {
        $(this).css({ backgroundImage: "url(pic/down2.png)" }).next("div.menu_body").slideToggle(300).siblings("div.menu_body").slideUp("slow");
      });
    });
    return;
  } else if (site_url.match(/faq.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/xthor_faq.html', null, function (doc) {
      $('div.container:eq(1)').html($('div.container:eq(0)', doc).html());
    });
  }
}

if (site_url.match(/^https:\/\/hdf.world\/.*/)) {
  if (site_url.match(/upload.php/)) {
    var origin_html = $('p:contains(Votre annonce URL)').html();
    origin_html = origin_html.replace(`Votre annonce URL personnelle pour créer votre .torrent (activez l'option "Torrent Privé") :`, '您的个人Announce URL用于创建种子文件，请重新制作种子！');
    $('p:contains(Votre annonce URL)').html(origin_html);
    function replace_text(dom, o, d) {
      var o_html = dom.html();
      var d_html = o_html.replace(o, d);
      dom.html(d_html);
    }

    replace_text($('td:contains(Votre .Torrent)'), 'Votre .Torrent', 'Torrent File');
    replace_text($('td:contains(Catégorie)'), 'Catégorie', 'Category');
    replace_text($(`p:contains(Collez l'URL)`), `Collez l'URL`, 'Copy URL');
    replace_text($(`p:contains(pour le média)`), ` pour le média`, 'for the media');
    setTimeout(function () { $('#btnAllocineFetch').text("Send"); }, 1000);
    replace_text($(`p:contains(Cliquez sur Envoyer pour valider votre lien)`), `Cliquez sur Envoyer pour valider votre lien`, '点击Send以验证您的链接');
    replace_text($('td:contains(Titre)'), 'Titre', 'Title');
    replace_text($(`p:contains(Ne pas modifier le titre mis à disposition par TheMovieDB)`), `Ne pas modifier le titre mis à disposition par TheMovieDB`, 'Do not modify the title provided by TheMovieDB');
    replace_text($('td:contains(Année)').first(), 'Année', 'Year');
    replace_text($(`p:contains(Si le lien TMDB n'est pas disponible, remplissez tous les champs requis manuellement.)`), `Si le lien TMDB n'est pas disponible, remplissez tous les champs requis manuellement.`, '如果没有TMDB链接，请手动填写所需的所有字段。');
    replace_text($(`td:contains(Restriction d'âge)`).last(), `Restriction d'âge`, '限制年龄');
    replace_text($(`label:contains(Cocher s'il s'agit)`), `Cocher s'il s'agit d'une release issue de la scene. Si vous n'en êtes pas sûr, ne cochez pas la case.`, '是否Scene?');
    replace_text($(`td:contains(Résolution)`).last(), `Résolution`, 'Resolution');
    replace_text($(`td:contains(Type de fichier)`).last(), `Type de fichier`, 'Type of File');
    replace_text($(`td:contains(URL de l'affiche)`).last(), `URL de l'affiche`, 'Poster URL');
    replace_text($(`p:contains(automatiquement rempli)`), `automatiquement rempli`, '自动填充');
    $('input[value=Prévisualiser]').val('Preview');
    replace_text($(`p:contains(Si vous êtes un re-posteur, respectez le travail des releasers en mettant la bonne source et le tag.)`), `Si vous êtes un re-posteur, respectez le travail des releasers en mettant la bonne source et le tag.`, 'If you are a reposter, respect the work of the releasers by putting the correct source and tag.');
    replace_text($(`span:contains(VFF (Doublage Français (France)))`).last(), `VFF (Doublage Français (France))`, 'VFF (French Dubbing (France))');
    replace_text($(`span:contains(VFQ (Doublage Français (Québec)))`).last(), `VFQ (Doublage Français (Québec))`, 'VFQ (French Dubbing (Quebec))');
    replace_text($(`span:contains(VO (Version Originale, non française))`).last(), `VO (Version Originale, non française)`, 'VO (Original Version, not French)');
    replace_text($(`span:contains(VOF (Version Originale Française (France et Belgique)))`).last(), `(Version Originale Française (France et Belgique))`, '(Original French Version (France and Belgium))');
    replace_text($(`span:contains(VOQ (Version Originale Québecoise)`).last(), `(Version Originale Québecoise)`, '(Original Quebec version)');
    replace_text($(`span:contains(VF? (Version Française, origine du doublage inconnue))`).last(), `(Version Française, origine du doublage inconnue)`, '(French version, origin of dubbing not specified)');
    replace_text($(`span:contains(VFI (Version Française Internationale = 1 seul doublage français existant))`).last(), `(Version Française Internationale = 1 seul doublage français existant)`, '(French International Version = only 1 existing French dubbing)');
    replace_text($(`span:contains(Sous-titres : Cocher cette case si la release dispose des sous-titres français complets)`).last(), `Sous-titres : Cocher cette case si la release dispose des sous-titres français complets`, 'Source-subtitles: Check this box if the release has full French subtitles');
    replace_text($(`span:contains(MULTi : Ne cochez que s'il y a la VO + VF + d'autres langues sinon ne cochez que VO + VF(I)/(F)/(Q)`).last(), `MULTi : Ne cochez que s'il y a la VO + VF + d'autres langues sinon ne cochez que VO + VF(I)/(F)/(Q)`, 'MULTi: Only check if there is the VO+VF+ of other languages, otherwise only check VO+VF');
    replace_text($(`span:contains((Cocher quelle version VF est incluse en plus de multi (VFF, VFQ)`).last(), `(Cocher quelle version VF est incluse en plus de multi (VFF, VFQ)`, '(Check which VF version is included in addition to multi(vff,vfq)');
    replace_text($(`span:contains(Muet : Cocher Sous-titres pour les parties texte du film si elles sont en français et rien si elles sont dans une autre langue.)`), `Muet : Cocher Sous-titres pour les parties texte du film si elles sont en français et rien si elles sont dans une autre langue.`, 'Muet: Check Subtitles for the text parts of the film if they are in French and nothing if they are in another language');
  } else if (site_url.match(/rules.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/hdf_rules.html', null, function (doc) {
      if (site_url.match(/rules.php$/)) {
        $('#content').html($('#main', doc).html());
      }
      else if (site_url.match(/golden_rules/)) {
        $('#content').html($('#golden_rules', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/inactivity/)) {
        $('#content').html($('#inactivity', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/bonus/)) {
        $('#content').html($('#bonus', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/ratio$/)) {
        $('#content').html($('#ratio', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/requests$/)) {
        $('#content').html($('#requests', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/collages$/)) {
        $('#content').html($('#collection', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/clients$/)) {
        $('#content').html($('#clients', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/upload$|series$/)) {
        if (site_url.match(/upload$/)) {
          $('#content').html($('#upload', doc).find('#content').html() + '<br><br><br><br>');
          $('.rule_table').html($('#main', doc).html());
        } else {
          $('#content').html($('#series', doc).find('#content').html());
          $('#content').find('div.thin').append($('#main', doc).html());
          $('div:contains("HD-Forever General Rules")').last().hide();
        }
        $('.rule_table').html($('#main', doc).html());
        function findRule() {
          var query_string = $('#search_string').val();
          var q = query_string.replace(/\s+/gm, '').split('+');
          var regex = new Array();
          for (var i = 0; i < q.length; i++) {
            regex[i] = new RegExp(q[i], 'mi');
          }
          $('#actual_rules li').each(function () {
            var show = true;
            for (var i = 0; i < regex.length; i++) {
              if (!regex[i].test($(this).html())) {
                show = false;
                break;
              }
            }
            $(this).toggle(show);
          });
          $('.before_rules').toggle(query_string.length == 0);
        }

        var original_value = $('#search_string').val();
        $('#search_string').keyup(findRule);
        $('#search_string').focus(function () {
          if ($(this).val() == original_value) {
            $(this).val('');
          }
        });
        $('#search_string').blur(function () {
          if ($(this).val() == '') {
            $(this).val(original_value);
            $('.before_rules').show();
          }
        })
      }
      else if (site_url.match(/chat$/)) {
        $('#content').html($('#chat', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').last().append($('#main', doc).html());
      }
      else if (site_url.match(/tag$/)) {
        $('#content').html($('#tags', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').last().append($('#main', doc).html());
      }
    });
  } else if (site_url.match(/wiki.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/hdf_faq.html', null, function (doc) {
      if (site_url.match(/wiki.php$/)) {
        $('#content').html($('#content', doc).html());
      } else if (site_url.match(/action=article&id=\d+/)) {
        var aid = site_url.match(/id=(\d+)/)[1];
        $('div.header').html($(`#${aid}`, doc).find('div.header').html());
        $('div.main_column').html($(`#${aid}`, doc).find('div.main_column').html());
        $('div.sidebar').html($(`#sidebar`, doc).html());
      }
    });
  }
}

if (site_url.match(/^https:\/\/bluebird-hd.org\/.*/)) {
  if ($('a:contains(Главная)').length) {
    $('a[title="English"]').find('img').click();
  }

  var table_html = $('table.fblock').first().html();
  table_html = table_html.replace(/Поиск \/ Search/, 'Search');
  table_html = table_html.replace(/Что искать/g, 'What to search');
  table_html = table_html.replace(/По торрентам/g, 'By torrents');
  table_html = table_html.replace(/По запросам/g, 'On request');
  table_html = table_html.replace(/По предложениям/g, 'Suggestions');
  table_html = table_html.replace(/По описаниям/g, 'According descriptions');
  $('table.fblock').first().html(table_html);

  table_html = $('table.fblock:eq(6)').html();
  table_html = table_html.replace(/Используй ключ!/g, `Use the key!`);
  $('table.fblock:eq(6)').html(table_html);

  function repTxt(e, o, d) {
    var el = $(`${e}:contains(${o})`).last();
    var em = el.html();
    try {
      el.html(em.replace(o, d));
    } catch (err) { }
  }
  var dict_info = {
    'Фильмы': `Films`,
    'Мультфильмы': `Cartoons`,
    'Документалистика': `Documentary`,
    'Шоу/Музыка': `Show/Music`,
    'Спорт': `Sport`,
    'Сериалы': `TV series`,
    'Эротика': `Erotica`,
    'Дэмо/Misc': `Demo/Misc`,
  }
  if (site_url.match(/browse.php/)) {
    table = $('#highlighted').prev();
    table_html = table.html();
    table_html = table_html.replace(/Список торрентов/g, `List of torrents`);
    table_html = table_html.replace(/Фильмы/g, `Films`);
    table_html = table_html.replace(/Мультфильмы/g, `Cartoons`);
    table_html = table_html.replace(/Документалистика/g, `Documentary`);
    table_html = table_html.replace(/Шоу\/Музыка/g, `Show/Music`);
    table_html = table_html.replace(/Спорт/g, `Sport`);
    table_html = table_html.replace(/Сериалы/g, `TV series`);
    table_html = table_html.replace(/Эротика/g, `Erotica`);
    table_html = table_html.replace(/Дэмо\/Misc/g, `Demo/Misc`);
    table_html = table_html.replace(/Поиск/g, `Search`);
    table_html = table_html.replace(/Активные/g, `Active`);
    table_html = table_html.replace(/Включая мертвые/g, `Including the dead`);
    table_html = table_html.replace(/Только мертвые/g, `Only the dead`);
    table_html = table_html.replace(/Золотые торренты/g, `Golden torrents`);
    table_html = table_html.replace(/Бриллиантовые торренты/g, `Diamond torrents`);
    table_html = table_html.replace(/Без сидов/g, `No seeds`);
    table_html = table_html.replace(/Все типы/g, `All types`);
    table_html = table_html.replace(/Описание/g, `Description`);
    table_html = table_html.replace(/ИЛИ/g, `OR`);
    table_html = table_html.replace(/И/g, `And`);
    table_html = table_html.replace(/Страницы/g, `Pages`);
    table_html = table_html.replace(/Тип/g, `Type`);
    table_html = table_html.replace(/Носитель/g, `Carrier`);
    table_html = table_html.replace(/Название/g, `Name`);
    table.html(table_html);
  } else if (site_url.match(/userdetails.php/)) {
    repTxt('td', 'Зарегистрирован', 'Registered');
    repTxt('td', 'Последний раз был на трекере', 'Last seen');
    repTxt('td', 'Монет', 'Coins');
    $('td:contains(Пригласил)')[2].textContent = 'Invited by';
    $('td:contains(Раздал)')[2].textContent = 'Uploaded';
    $('td:contains(Скачал)')[2].textContent = 'Downloaded';
    $('td:contains(Пол)')[2].textContent = 'Gender';
    repTxt('td', 'Награды', 'Awards');
    repTxt('td', 'Класс', 'Class');
    repTxt('td', 'Предупреждения', 'Warnings');
    repTxt('td', 'Возраст', 'Age');
    repTxt('td', 'Дата Рождения', 'Date of Birth');
    repTxt('td', 'Знак зодиака', 'Zodiac sign');
    repTxt('td', 'Комментариев', 'Comments');
    try {
      $('td:contains(Скачаные)')[2].textContent = $('td:contains(Скачаные)')[2].textContent.replace('Скачаные торренты', 'Downloaded torrents');
    } catch (err) { }
    repTxt('td', 'Приглашенные', 'Invited');
    repTxt('td', 'Пользователь', 'User');
    try {
      $('td:contains(Пригласил)')[3].textContent = 'Invited by';
    } catch (err) { }
    $('input[value="Послать ЛС"]').val('Send PM');
    repTxt('a', 'Добавить в друзья', 'Add to friends');
    repTxt('a', 'Добавить в блокированные', 'Add to blocked');
    return;
  } else if (site_url.match(/details.php/)) {
    $('nobr').map((index, e) => {
      if (dict_info.hasOwnProperty($(e).text())) {
        repTxt('nobr', $(e).text(), dict_info[$(e).text()])
      }
    });
    repTxt('b', 'Оригинальное название', 'Original name');
    repTxt('b', 'Название', 'Name');
    repTxt('b', 'Год выхода', 'Released');
    repTxt('b', 'Жанр', 'Genre');
    repTxt('b', 'Режиссер', 'Director');
    repTxt('b', 'В ролях', 'Casts');
    repTxt('b', 'О фильме', 'About the movie');
    repTxt('b', 'Выпущено', 'Released');
    repTxt('b', 'Продолжительность', 'Productivity');
    repTxt('b', 'Контейнер', 'Container');
    repTxt('b', 'Видео', 'Video');
    repTxt('b', 'Перевод', 'Translation');
    repTxt('b', 'Звук', 'Sound');
    repTxt('b', 'Субтитры', 'Subtitles');
    repTxt('b', 'Звук', 'Sound');
    while ($('b:contains(Аудио)').length) {
      repTxt('b', 'Аудио', 'Audio');
    }
    repTxt('b', 'Релиз для', 'Release for');
    $('td[align=left]').map((index, e) => {
      if (dict_info.hasOwnProperty($(e).text())) {
        repTxt('td[align=left]', $(e).text(), dict_info[$(e).text()])
      }
    });
  } else if (site_url.match(/getrss.php/)) {
    var td_html = $('td:contains(Категории)').last().next().html();
    for (var key in dict_info) {
      td_html = td_html.replace(key, dict_info[key]);
    }
    td_html = td_html.replace('Если вы не выберете категории для просмотра,', 'If you do not select categories to view,');
    td_html = td_html.replace('вам будет выдана ссылка на все категории.', 'you will be given a link to all categories.');
    $('td:contains(Категории)').last().next().html(td_html);
    repTxt('td', 'Категории', 'Categories');

    td_html = $('td:contains(Тип ссылки в RSS)').last().html();
    td_html = td_html.replace('Ссылка на страницу', 'Link to the page');
    td_html = td_html.replace('Ссылка на скачивание', 'Link to download');
    $('td:contains(Тип ссылки в RSS)').last().html(td_html);
    repTxt('td', 'Тип ссылки в RSS', 'RSS link type');

    td_html = $('td:contains(Тип логина)').last().next().html();
    td_html = td_html.replace('Стандарт (cookies)', 'Standard (cookies)');
    td_html = td_html.replace('Альтернативный (passkey)', 'Alternate (passkey)');
    $('td:contains(Тип логина)').last().next().html(td_html);
    repTxt('td', 'Тип логина', 'Login type');
    repTxt('button', 'Сгенерировать RSS ссылку', 'Generate RSS link');
  } else if (site_url.match(/invite.php/)) {
    repTxt('b', 'Статус приглашенных вами', 'Status of your invitees');
    repTxt('b', 'Статус созданых приглашений', 'Status of created invitations');
    repTxt('b', 'Пользователь', 'User');
    repTxt('b', 'Раздал', 'Uploaded');
    repTxt('b', 'Скачал', 'Downloaded');
    repTxt('b', 'Рейтинг', 'Ratio');
    repTxt('b', 'Статус', 'Status');
    while ($('td:contains(Не подтвержден)').length) {
      repTxt('td', 'Не подтвержден', 'Not confirmed');
    }
    repTxt('b', 'Подтвердить', 'Confirm');
    repTxt('td', 'На данный момент вами не создано ниодного приглашения.', 'You have not created any invitation yet.');
    repTxt('td', 'Еще никто вами не приглашен.', 'No one has been invited by you yet.')
    $('input[value="Подтвердить пользователей"]').val('Verify Users');
    repTxt('b', 'Код приглашения', 'Invitation code');
    repTxt('b', 'Дата создания', 'Date of creation');
    repTxt('a', 'Удалить приглашение', 'Delete invitation');
    $('input[value="Создать приглашение"]').val('Create an invitation');
    repTxt('b', 'Создать пригласительный код', 'Create invitation code');
    repTxt('b', 'осталось', 'Left');
    repTxt('b', 'приглашений', 'invitations');
    $('input[value="Создать"]').val('Create');
// [Site Logic: Rules.Php]
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/bluebird_faq.html', null, function (doc) {
      $('td.outer').find('table:eq(0)').html($('tbody', doc).html());
    });
  } else if (site_url.match(/mybonus.php/)) {
    function send() {
      var frm = document.mybonus;
      var bonus_type = '';
      try { bonus_type = $('input[name="bonus_id"]:checked').val() } catch (err) { }
      var ajax = new tbdev_ajax();
      ajax.onShow('');
      var varsString = "";
      ajax.requestFile = "mybonus.php";
      ajax.setVar("id", bonus_type);
      ajax.method = 'POST';
      ajax.element = 'ajax';
      ajax.sendAJAX(varsString);
    }
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/bluebird_bonus.html', null, function (doc) {
      var current_coin = $('#ajax').html().match(/Мои монетки \((.*?) монет .* наличии \/ (.*?) единиц в час\)/)[1];
      var hourly_bonus = $('#ajax').html().match(/Мои монетки \((.*?) монет .* наличии \/ (.*?) единиц в час\)/)[2];
      const searchRegExp = /current_coin/g;
      $('#ajax').find('table').first().html($('#transfer', doc).html().replace(searchRegExp, current_coin).replace('hourly_coin', hourly_bonus));
      $('#ajax').next().html($('#calculator', doc).html());
      $('input[value=Exchange]').click(send);
    });
  }
}

if (site_url.match(/^https:\/\/filelist.io\/.*/)) {
  if (site_url.match(/rules.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/fl_rules.html', null, function (doc) {
      $('div.cblock-content').html($('div.cblock-content', doc).html());
    });
  } else if (site_url.match(/faq.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/fl_faq.html', null, function (doc) {
      $('#maincolumn').html($('#maincolumn', doc).html());
    });
  }
}

if (site_url.match(/^https:\/\/blutopia.cc\/torrents\/similar/)) {
  var ids = $('ul.meta__ids').html()
  raw_info.url = match_link('imdb', ids);
  if (raw_info.url && all_sites_show_douban) {
    getData(raw_info.url, function (data) {
      if (data.data) {
        var score = data.data.average + '分';
        if (!score.replace('分', '')) score = '暂无评分';
        if (data.data.votes) score += `|${data.data.votes}人`;
        $('h1.meta__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
        if (data.data.summary && data.data.summary.length < 700 && data.data.summary.match(/[\u4e00-\u9fa5]/)) {
          $('p.meta__description').text(data.data.summary.replace(/ 　　/g, ''));
        }
      }
    });
  }
  return;
}

if (site_url.match(/^https:\/\/beyond-hd.me\/library\/title/)) {
  var imdb_box = document.getElementsByTagName('body')[0];
  try {
    raw_info.url = match_link('imdb', imdb_box.innerHTML);
    if (raw_info.url && all_sites_show_douban) {
      getData(raw_info.url, function (data) {
        console.log(data);
        if (data.data) {
          var score = data.data.average + '分';
          if (!score.replace('分', '')) score = '暂无评分';
          if (data.data.votes) score += `|${data.data.votes}人`;
          $('h1.bhd-title-h1').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
          if (data.data.summary.trim() && data.data.summary.match(/[\u4e00-\u9fa5]/)) {
            $('div.movie-overview').text(data.data.summary.replace(/ 　　/g, ''));
          }
        }
      });
    }
  } catch (err) { }
  return;
}

//脚本设置简单页面，使用猫/杜比等站点的个人设置页面来做的，涵盖转图床的部分操作
if (site_url.match(/^https:\/\/.*?usercp.php\?action=personal(#setting|#ptgen|#mediainfo|#dealimg|#signin)/)) {
  setTimeout(function () {
    var style = `
        #sortable { list-style-type: none; margin: 0; padding: 0; width: 750px; display: inline-block}
        #sortable div { margin: 3px 3px 3px 0; padding: 1px; float: left; width: 100px; height: 20px; font-size: 1em; text-align: left; }
        #ksortable { list-style-type: none; margin: 0; padding: 0; width: 750px; display: inline-block}
        #ksortable div { margin: 3px 3px 3px 0; padding: 1px; float: left; width: 100px; height: 20px; font-size: 1em; text-align: left; }
        `;
    GM_addStyle(style);

    var $table = $('#outer table').last();
    $table.find('tr').css({ "display": "none" });
    $('#usercpnav').hide();
    //********************************************** 0 **********************************************************************************
    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">一键签到</td><td width="99%" class="rowfollow" valign="top" align="left" id="signin"></td></tr>`);
    $('#signin').append(`<b>签到站点设置</b>`);
    $('#signin').append(`&nbsp;&nbsp;&nbsp;<a href="#" id="s_all" style="color:red">全选</a>&nbsp;&nbsp;&nbsp;<a href="#" id="u_all" style="color:red">全不选</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="s_fail" style="color:red">保留失败站点</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="u_fail" style="color:red">去掉失败站点</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="hide_unselected" style="color:red">隐藏未选择(默认)</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="show_all" style="color:red">全部显示</a>`);
    $('#signin').append(`<b>&nbsp;&nbsp;&nbsp;</b><a href="#", target="_blank" id="begin_sign"><font color="red"><b>→开始签到←</b></font></a>`);
    $('#signin').append(`<br><div id="ksortable"></div>`);

    var unsupported_sites = ['digitalcore', 'HD-Only', 'HOU', 'OMG', 'TorrentLeech', 'MTeam', 'UBits', 'PigGo'];

    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (unsupported_sites.indexOf(key) < 0) {
        $('#ksortable').append(`<div class="ui-state-default ui-sortable-handle"><input type="checkbox" kname=${key} value="yes" class="s_all">
                    <a href="${used_site_info[key].url}" target="_blank"><b>${key}</b></a></div>`);
      }
    }
    for (key in o_site_info) {
      if (site_order.indexOf(key) < 0 && unsupported_sites.indexOf(key) < 0) {
        $('#ksortable').append(`<div class="ui-state-default ui-sortable-handle"><input type="checkbox" kname=${key} value="yes" class="s_all">
                    <a href="${o_site_info[key]}" target="_blank"><b>${key}</b></a></div>`);
      }
    }
    $("#ksortable").sortable();
    $("#ksortable").disableSelection();

    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (used_signin_sites.indexOf(key) > -1) {
        $(`input[kname=${key}]`).prop('checked', true);
      }
    }
    for (key in o_site_info) {
      if (used_signin_sites.indexOf(key) > -1) {
        $(`input[kname=${key}]`).prop('checked', true);
      }
    }
    $('#signin').append(`<br><br><font color="red">暂不支持的站点列表：</font><div id="unsupported_sites" style="display:inline-block; margin-left:3px"></div>`);
    unsupported_sites.forEach((e) => {
      $('#unsupported_sites').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${o_site_info[e] ? o_site_info[e] : used_site_info[e].url}" target="_blank"><b>${e}</b></a></div>`);
    });
    $('#signin').append(`<br><font color="red">手动获取魔力的站点：</font>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['CHDBits'].url + 'bakatest.php'}" target="_blank"><b>CHDBits</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${o_site_info['U2'] + 'showup.php'}" target="_blank"><b>U2</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['HDSky'].url}" target="_blank"><b>HDSky</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['TJUPT'].url + 'attendance.php'}" target="_blank"><b>TJUPT</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['52PT'].url + 'bakatest.php'}" target="_blank"><b>52PT</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['WT-Sakura'].url + 'attendance.php'}" target="_blank"><b>WT-Sakura</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['OurBits'].url + 'attendance.php'}" target="_blank"><b>OurBits</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['PigGo'].url + 'attendance.php'}" target="_blank"><b>PigGo</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['OpenCD'].url}" target="_blank"><b>OpenCD</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['UBits'].url}" target="_blank"><b>UBits</b></a></div>`);

    $('#signin').append(`<br><br><br>`);
    $('#signin').append(`<input type="button" id="ksave_setting" value="保存脚本设置！&nbsp;(只需点击一次)">`);
    $('#signin').append(`&nbsp;&nbsp;<font color="green">说明：红色表示获取到魔力，橙色表示登录成功，蓝色表示登录失败，黑色表示暂不支持或无响应。</font>`);
    if (site_url.match(/springsunday/)) {
      $('#ksave_setting').css({ 'color': 'white', 'background': 'url(https://springsunday.net/styles/Maya/images/btn_submit_bg.gif) repeat left top', 'border': '1px black' });
    }
    $('#ksave_setting').click((e) => {
      used_signin_sites = [];
      for (key in default_site_info) {
        if ($(`input[kname=${key}]`).prop('checked')) {
          used_signin_sites.push(key);
        }
      }
      for (key in o_site_info) {
        if ($(`input[kname=${key}]`).prop('checked')) {
          used_signin_sites.push(key);
        }
      }
      GM_setValue('used_signin_sites', JSON.stringify(used_signin_sites.join(',')));
      alert('保存成功！！！');
    });

    $('#s_all').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').prop('checked', true);
    });
    $('#u_all').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').prop('checked', false);
    });
    $('#s_fail').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').map((index, e) => {
        if ($(e).prop('checked')) {
          if ($(e).parent().find('a').css('color') !== 'rgb(17, 17, 17)' && $(e).parent().find('a').css('color') !== 'rgb(0, 0, 255)') {
            $(e).prop('checked', false);
          }
        }
      });
    });
    $('#u_fail').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').map((index, e) => {
        if ($(e).prop('checked')) {
          if ($(e).parent().find('a').css('color') === 'rgb(17, 17, 17)' || $(e).parent().find('a').css('color') === 'rgb(0, 0, 255)') {
            $(e).prop('checked', false);
          }
        }
      });
    });
    $('#hide_unselected').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').map((index, e) => {
        if (!$(e).prop('checked')) {
          $(e).parent().hide();
        }
      });
    });
    $('#show_all').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').parent().show();
    });

    $('#signin').find('.s_all').map((index, e) => {
      if (!$(e).prop('checked')) {
        $(e).parent().hide();
      }
    });

    $('#begin_sign').click((e) => {
      e.preventDefault();
      var attendance_sites = ['PThome', 'HDHome', 'HDDolby', 'Audiences', 'PTLGS', 'SoulVoice', 'OKPT', 'UltraHD', 'CarPt', 'ECUST', 'iloli', 'PTChina', 'HDClone',
        'HDVideo', 'HDTime', 'FreeFarm', 'HDfans', 'PTT', 'ZMPT', 'OKPT', 'CrabPt', 'QingWa', 'ICC', 'LemonHD', '1PTBA', 'HDBAO', 'AFUN', '星陨阁',
        'CyanBug', '杏林', '海棠', 'Panda', 'KuFei', 'PTCafe', 'GTK', 'HHClub', '麒麟', 'AGSV', 'Oshen', 'PTFans', 'PTzone', '雨', '唐门', '天枢', '财神', 'DevTraker',
        'CDFile', '柠檬不甜', 'ALing', 'LongPT', 'BaoZi'
      ];

      attendance_sites.forEach((e) => {
        if (used_signin_sites.indexOf(e) > -1) {
          try {
            var signin_url = used_site_info[e].url + 'attendance.php';
          } catch (Err) {
            signin_url = o_site_info[e] + 'attendance.php';
          }
          getDoc(signin_url, null, function (doc) {
            if ($('#outer', doc).find('table.main').find('table').length) {
              console.log(`开始签到${e}：`, $('#outer', doc).find('table.main').find('table').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
            } else if ($('table.mainouter', doc).find('table.main').find('table').length) {
              console.log(`开始签到${e}：`, $('table.mainouter', doc).find('table.main').find('table').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
            } else if ($('div.mainouter', doc).find('div.main').find('table').length) {
              console.log(`开始签到${e}：`, $('div.mainouter', doc).find('div.main').find('table').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
            } else if ($('#content', doc).length) {
              console.log(`开始签到${e}：`, $('#content', doc).find('p[class="register-now-info register-info"]').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
// [Site Logic: Ptt]
              console.log(`开始签到${e}：`, '失败！！！');
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "blue" });
            }
          });
        }
      });

// [Site Logic: Hdarea]
// [Site Logic: Pter]
// [Site Logic: Hdu]
// [Site Logic: Ttg]
// [Site Logic: Btschool]
// [Site Logic: Hdcity]

      function log_in(sites, judge_str) {
        sites.forEach((e) => {
          if (used_signin_sites.indexOf(e) > -1) {
            var url = used_site_info.hasOwnProperty(e) ? used_site_info[e].url : o_site_info[e];
            getDoc(url, null, function (doc) {
// [Site Logic: Dtr]
// [Site Logic: ZHUQUE]
              if ($(judge_str, doc).length) {
                $(`input[kname=${e}]`).parent().find('a').css({ "color": "DarkOrange" });
                console.log(`开始登陆${e}：`, '成功登陆！！');
              } else {
                $(`input[kname=${e}]`).parent().find('a').css({ "color": "blue" });
                console.log(`开始登陆${e}：`, '登陆失败！！！！！！！');
              }
            });
          }
        });
      }

      var np_sites = ['CHDBits', 'CMCT', 'FRDS', 'TLFbits', 'TCCF', 'PTsbao', 'OpenCD', 'HUDBT', 'HDSky', 'ITZMX',
        'NanYang', 'DiscFan', 'Dragon', 'U2', 'YDY', 'JoyHD', 'HITPT', 'ITZMX', 'OurBits', 'UBits'];
      log_in(np_sites, '#mainmenu');
      log_in(['PuTao'], '#userbar');
      log_in(['HDRoute'], '#nav');
      log_in(['BYR'], '#pagemenu');
      log_in(['TJUPT'], '#info_block');
      log_in(['ANT'], '#nav_home');
      log_in(['NBL'], '#mainnav');
      log_in(['PigGo'], '#info_block');
      log_in(['BTN', 'SC', 'MTV', 'UHD', 'HDSpace', 'TVV', 'HDF', 'RED', 'jpop', 'lztr', 'DICMusic', 'OPS', 'bit-hdtv', 'SugoiMusic'], '#menu');
      log_in(['HDB'], '#menusides');
      log_in(['BHD'], 'div[class="beta-table"]');
      log_in(['PTP'], 'div[class="main-menu"]');
      log_in(['GPW'], 'div[class="HeaderNav"]');
      log_in(['KG'], 'a[class="customtab1"]');
      log_in(['HDT'], 'img[class="torrents"]');
      log_in(['xthor'], '#navbar');
      log_in(['HONE'], '#hoeapp-container');
      log_in(['FileList'], '#navigation');
      log_in(['bib'], '#header_nav');
      log_in(['IN'], '#nav');
      log_in(['影'], '#nav_menu');

      log_in(['BLU', 'HDOli', 'Monika', 'Tik', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX'], 'nav[class="top-nav"]');
      log_in(['DTR', 'ZHUQUE'], 'nav[class="container mx-auto"]');
      log_in(['ACM'], 'ul[class="left-navbar"]');

      log_in(['BlueBird'], 'a[href*="browse.php"]');
      log_in(['CG'], 'a[href*="userdetails.php"]');
      log_in(['IPT'], 'div[class="stats"]');
      log_in(['HaiDan'], 'div[class="navbar special-border"]');
      log_in(['bwtorrents'], '#menu-aeon');
      log_in(['TorrentLeech'], 'span[class="div-menu-item logout-menu-item"]');
      log_in(['HD-Only'], '#nav_userinfo');
      log_in(['iTS'], 'table[class="menubar"');

      // avz系列
      var avz_list = ['avz', 'PHD', 'CNZ', 'torrentseeds'];
      log_in(avz_list, 'div[class="ratio-bar"]');
    });

    //***********************************************************************************************************************************

    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">脚本设置</td><td width="99%" class="rowfollow" valign="top" align="left" id="setting"></td></tr>`);
    $('#setting').append(`<b>使用教程：</b><a href="https://gitee.com/tomorrow505/auto_feed_js/wikis/pages", target="_blank"><font color="red">→跳转←</font></a>`);
    $('#setting').append(`<b>&nbsp;&nbsp;&nbsp;更新地址：</b><a href="https://greasyfork.org/zh-CN/scripts/424132-auto-feed/", target="_blank"><font color="red">→跳转←</font></a>`);
    $('#setting').append(`<b>&nbsp;&nbsp;&nbsp;项目托管1：</b><a href="https://github.com/tomorrow505/auto_feed_js/", target="_blank"><font color="red">→GitHub←</font></a>`);
    $('#setting').append(`<b>&nbsp;&nbsp;&nbsp;项目托管2：</b><a href="https://gitee.com/tomorrow505/auto_feed_js/", target="_blank"><font color="red">→Gitee←</font></a>`);
    $('#setting').append(`<br><br>`);

    //************************************************** 1 ***************************************************************************
    $('#setting').append(`<b>转发站点设置</b>`);
    $('#setting').append(`<br><div id="sortable"></div>`);
    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      $('#sortable').append(`<div class="ui-state-default ui-sortable-handle"><input type="checkbox" class="support_site" name=${key} value="yes"><a href="${default_site_info[key].url}" target="_blank">${key}</a></div>`);
    }
    $("#sortable").sortable();
    $("#sortable").disableSelection();

    $('#setting').append(`<br><input type="button" id="select_all" value="全部选中" style="margin-top: 10px">`);
    $('#setting').append(`<input type="button" id="unselect_all" value="取消选中" style="margin-left: 25px"></br>`);
    $('#setting').append(`<br>`);

    $('#select_all').click(function () {
      $('.support_site').map(function () {
        $(this).prop('checked', true);
      });
    });
    $('#unselect_all').click(function () {
      $('.support_site').map(function () {
        $(this).prop('checked', false);
      });
    });

    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (used_site_info[key].enable) {
        $(`input[name=${key}]`).prop('checked', true);
      }
    }

    //**************************************************** 2 **************************************************************************
    count = 0;
    $('#setting').append(`<b>常用站点设置</b></br>`);
    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (used_site_info[key].enable) {
        $('#setting').append(`<div class="container"><input type="checkbox" title=${key} value="yes">${key}</div>`);
        if ((count + 1) % 8 == 0) {
          $('#setting').append(`<br>`);
        }
        count += 1;
      }
    }
    $('#setting').append(`<br><br>`);
    $('.container').css({ 'display': 'inline-block', 'width': '90px' });

    for (key in used_common_sites) {
      if (used_site_info[used_common_sites[key]] !== undefined && used_site_info[used_common_sites[key]].enable) {
        $(`input[title=${used_common_sites[key]}]`).prop('checked', true);
      }
    }

    //**************************************************** 3 *************************************************************************
    $('#setting').append(`<b>是否在种子页面开启快捷搜索功能：</b>`);
    for (key in show_search_urls) {
      if (show_search_urls[key]) {
        $('#setting').append(`<div class="show_url"><input type="checkbox" show=${key} value="yes" checked="">${key}</div>`);
      } else {
        $('#setting').append(`<div class="show_url"><input type="checkbox" show=${key} value="yes">${key}</div>`);
      }
    }
    $('#setting').append(`<br><br>`);

    //**************************************************** 3.1 *************************************************************************

    $('#setting').append(`<b>是否开启脚本额外显示功能：</b>`);
    for (key in extra_settings) {
      if (extra_settings[key].enable) {
        $('#setting').append(`<div class="extra"><input type="checkbox" name=${key} value="yes" checked="">${extra_settings[key].title}</div>`);
      } else {
        $('#setting').append(`<div class="extra"><input type="checkbox" name=${key} value="yes">${extra_settings[key].title}</div>`);
      }
// [Site Logic: PTP]
    }
    $('.show_url').css({ 'display': 'inline-block', 'width': '70px' });
    $('.extra').css({ 'display': 'inline-block', 'width': '90px' });
    $(`input[name="ptp_show_group_name"]`).parent().css({ 'width': '170px' });
    $('#setting').append(`<br><br>`);

    //**************************************************** 3.2 *************************************************************************
    $('#setting').append(`<b>选择IMDb到豆瓣ID的获取方式(适用于外站)：</b>`);
    $('#setting').append(`<input type="radio" name="imdb2db" value="0">豆瓣API`);
    $('#setting').append(`<input type="radio" name="imdb2db" value="1">豆瓣爬取`);
    $(`input:radio[name="imdb2db"][value="${imdb2db_chosen}"]`).prop('checked', true);
    $('#setting').append(`<br><br>`);

    //**************************************************** 4 ***************************************************************************
    $('#setting').append(`<b>选择PTGen的API节点(适用于外站)：</b>`);
    $('#setting').append(`<input type="radio" name="ptgen" value="0">api.iyuu.cn`);
    $('#setting').append(`<input type="radio" name="ptgen" value="1">ptgen`);
    $('#setting').append(`<input type="radio" name="ptgen" value="3">豆瓣页面爬取`);
    $(`input:radio[name="ptgen"][value="${api_chosen}"]`).prop('checked', true);
    $('#setting').append(`<br><br>`);

    //**************************************************** 4 ***************************************************************************
    $('#setting').append(`<b>选择TorrentLeech的默认域名：</b>`);
    $('#setting').append(`<input type="radio" name="tldomain" value="0">torrentleech.org`);
    $('#setting').append(`<input type="radio" name="tldomain" value="1">torrentleech.me`);
    $('#setting').append(`<input type="radio" name="tldomain" value="2">torrentleech.cc`);
    $('#setting').append(`<input type="radio" name="tldomain" value="3">tlgetin.cc`);
    $(`input:radio[name="tldomain"][value="${tldomain}"]`).prop('checked', true);
    $('#setting').append(`<br><br>`);


    //**************************************************** 4 ***************************************************************************
    $('#setting').append(`<b>快速搜索站点设置(每个一行,可自行添加)
            <a href="https://gitee.com/tomorrow505/auto-feed-helper/raw/master/temple_search_urls" target=_blank>
            <font color="red">范例</font></a></b></br>`);

    getDoc('https://gitee.com/tomorrow505/auto-feed-helper/raw/master/temple_search_urls', null, function (doc) {
      $(`<font>从范例页面获取：</font><input id="url_input" type="text" list="options_jump_href" style="border-radius:2px;">
                <datalist name="options_jump_href" id="options_jump_href" style="width:100px; margin-bottom:3px; margin-right:5px"><option value="---">---</option></datalist><a type="button" id="append_url" href="#" style="color:blue">↓ 新增</a><br>`).insertBefore($('textarea[name="set_jump_href"]'));
      $(`<div style="display:none; margin-bottom:5px"><span id="show_selected"></span><br></div>`).insertBefore($('textarea[name="set_jump_href"]'));
      var urls_to_append = $('body', doc).find('a');
      var urls_appended = $('textarea[name="set_jump_href"]').val();
      urls_to_append.map((index, e) => {
        var url_to_append = $(`a:contains(${$(e).text()})`, doc).attr('href').replace(/\/|\?/g, '.');
        var reg = new RegExp(url_to_append, 'i');
        if (!urls_appended.match(reg)) {
          $('datalist[name="options_jump_href"]').append(`<option value=${$(e).text()}>${$(e).text()}</option>`);
        }
      });
      $('#append_url').click((e) => {
        e.preventDefault();
        var origin_str = $('textarea[name="set_jump_href"]').val();
        $('textarea[name="set_jump_href"]').val(origin_str + '\n' + $('#show_selected').text());
      });
      $('input[id="url_input"]').change((e) => {
        var selected_url = $(e.target).val();
        var jump_url = $(`a:contains(${selected_url})`, doc).prop("outerHTML").replace(/&amp;/g, '&');
        if (jump_url) {
          $('#show_selected').text(jump_url).parent().show();
        }
      });
    })
    $('#setting').append(`<textarea name="set_jump_href" style="width:700px" rows="15"></textarea><br><br>`);
    $('textarea[name="set_jump_href"]').val(used_search_list.join('\n'));

    //**************************************************** 4.2 ***************************************************************************
    $('#setting').append(`
            <div style="margin-bottom=5px"><b>远程服务器配置<目前仅适配QB和TR，<a href="https://gitee.com/tomorrow505/auto_feed_js/wikis/4.%E5%85%B6%E4%BB%96%E5%8A%9F%E8%83%BD/qb%E8%BF%9C%E7%A8%8B%E6%8E%A8%E9%80%81" target="_blank"><font color="red">->配置方式请点击<-</font></a>></b>
            <input type="file" id="jsonFileInput" accept=".json">
            <div id="jsonData"></div>
            </div></br>
        `);
    $('#jsonFileInput').change(function () {
      var file = $(this)[0].files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
          var fileContent = event.target.result;
          try {
            var jsonData = JSON.parse(fileContent);
            $('#jsonData').html('<h3>解析后的 JSON 数据：</h3><pre>' + JSON.stringify(jsonData, null, 2) + '</pre>');
            GM_setValue('remote_server', JSON.stringify(jsonData));
          } catch (error) {
            $('#jsonData').html('<p>无效的 JSON 格式</p>');
            console.error('Invalid JSON format:', error);
          }
        };
        reader.readAsText(file);
      } else {
        $('#jsonData').html('<p>请选择一个 JSON 文件上传。</p>');
        console.error('Please select a JSON file to upload.');
      }
    });

    //**************************************************** 5 ***************************************************************************
    $('#setting').append(`<div style="margin-bottom=5px"><b>脚本相关API-KEY值设置</b></div></br>`);
    $('#setting').append(`<label><b>TMDB影库对应apikey(<a href="https://www.themoviedb.org/settings/api" target="_blank"><font color="red">登录官网</font></a>自行申请):</b></label><input type="text" name="tmdb_key" style="width: 300px;  margin-left:5px" value=${used_tmdb_key}><br><br>`);
    $('#setting').append(`<label><b>PTPimg对应的apikey(<a href="https://ptpimg.me/" target="_blank"><font color="red">打开首页</font></a>即可获取):</b></label><input type="text" name="ptp_img_key" style="width: 300px; margin-left:5px" value=${used_ptp_img_key}><br><br>`);
    for (key in used_rehost_img_info) {
      if (key == 'catbox') { continue; }
      $('#setting').append(`<label><b>${key}对应apikey(<a href="${used_rehost_img_info[key].url}" target="_blank"><font color="red">登录站点</font></a>即可获取):</b></label><input type="text" name="${key}_key" style="width: 300px; margin-left:5px" value=${used_rehost_img_info[key]['api-key']}><br><br>`);
    }
    $('#setting').append(`<label><b>TorrentLeech的rsskey(<a href="https://wiki.torrentleech.org/doku.php/rss_-_how_to_automatically_download_torrents_with_utorrent" target="_blank"><font color="red">依照教程</font></a>进行设置):</b></label><input type="text" name="tl_rss_key" style="width: 300px; margin-left:5px" value=${used_tl_rss_key}><br><br>`);
    $('label').css({ "width": "280px", "text-align": "right", "display": "inline-block" });

    //**************************************************** 3.2 *************************************************************************
    $('#setting').append(`<input type="checkbox" name="anonymous" value="yes">是否匿名，此处勾选之后，在发布种子时，发布页面将默认预先勾选匿名发布。<br>`);
    if (if_uplver) {
      $(`input[name="anonymous"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="douban_jump" value="yes">是否显示豆瓣页面跳转选项，默认开启。<br>`);
    if (if_douban_jump) {
      $(`input[name="douban_jump"]`).prop('checked', true);
    }
    $('#setting').append(`<input type="checkbox" name="imdb_jump" value="yes">是否显示IMDB页面跳转选项，默认开启。<br>`);
    if (if_imdb_jump) {
      $(`input[name="imdb_jump"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="hdb_hide_douban" value="yes">是否折叠HDB中文豆瓣信息，默认展开。<br>`);
    if (hdb_hide_douban) {
      $(`input[name="hdb_hide_douban"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="chd_use_backup_url" value="yes">是否使用CHD备份网址，如果勾选将采用类似hb.chddiy.xyz的域名。<br>`);
    if (chd_use_backup_url) {
      $(`input[name="chd_use_backup_url"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="nhd_use_v6_url" value="yes">是否使用NexusHD IPv6网址，如果勾选将采用 IPv6 域名（校内使用一般不勾选）。<br><br>`);
    if (nhd_use_v6_url) {
      $(`input[name="nhd_use_v6_url"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="button" id="save_setting" value="保存脚本设置！&nbsp;(只需点击一次)">`);
    if (site_url.match(/springsunday/)) {
      $('#save_setting, #select_all, #unselect_all').css({ 'color': 'white', 'background': 'url(https://springsunday.net/styles/Maya/images/btn_submit_bg.gif) repeat left top', 'border': '1px black' });
    }

    //点击保存
    $('#save_setting').click(function () {
      // 更新site order
      site_order = [];
      $('#sortable').find('input').each(function () {
        site_order.push($(this).parent().text());
      });
      GM_setValue('site_order', JSON.stringify(site_order.join(',')));

      //处理支持站点
      for (key in used_site_info) {
        if ($(`input[name=${key}]`).prop('checked')) {
          used_site_info[key].enable = 1;
        } else {
          used_site_info[key].enable = 0;
        }
      }
      GM_setValue('used_site_info', JSON.stringify(used_site_info));

      //处理常用站点
      used_common_sites = [];
      for (key in default_site_info) {
        if ($(`input[title=${key}]`).prop('checked')) {
          used_common_sites.push(key);
        }
      }
      GM_setValue('used_common_sites', JSON.stringify(used_common_sites.join(',')));

      GM_setValue('imdb2db_chosen', $('input[name="imdb2db"]:checked').val());

      GM_setValue('api_chosen', $('input[name="ptgen"]:checked').val());

      GM_setValue('tldomain', $('input[name="tldomain"]:checked').val());

      for (key in show_search_urls) {
        if ($(`input[show=${key}]`).prop('checked')) {
          show_search_urls[key] = 1;
        } else {
          show_search_urls[key] = 0;
        }
      }
      GM_setValue('show_search_urls', JSON.stringify(show_search_urls));

      for (key in extra_settings) {
        if ($(`input[name=${key}]`).prop('checked')) {
          extra_settings[key].enable = 1;
        } else {
          extra_settings[key].enable = 0;
        }
      }
      GM_setValue('extra_settings', JSON.stringify(extra_settings));

      //处理快速搜索
      used_search_list = $('textarea[name="set_jump_href"]').val().split('\n').join(',');
      if (!used_search_list[used_search_list.length - 1]) {
        used_search_list.pop();
      }
      GM_setValue('used_search_list', JSON.stringify(used_search_list));

      //处理ptp-tmdb的key
      GM_setValue('used_ptp_img_key', $(`input[name="ptp_img_key"]`).val());
      GM_setValue('used_tmdb_key', $(`input[name="tmdb_key"]`).val());
      GM_setValue('used_tl_rss_key', $(`input[name="tl_rss_key"]`).val());

      //处理匿名
      if_uplver = $(`input[name="anonymous"]:last`).prop('checked') ? 1 : 0;
      GM_setValue('if_uplver', if_uplver);

      if_douban_jump = $(`input[name="douban_jump"]`).prop('checked') ? 1 : 0;
      GM_setValue('if_douban_jump', if_douban_jump);

      if_imdb_jump = $(`input[name="imdb_jump"]`).prop('checked') ? 1 : 0;
      GM_setValue('if_imdb_jump', if_imdb_jump);

      hdb_hide_douban = $(`input[name="hdb_hide_douban"]`).prop('checked') ? 1 : 0;
      GM_setValue('hdb_hide_douban', hdb_hide_douban);

      chd_use_backup_url = $(`input[name="chd_use_backup_url"]`).prop('checked') ? 1 : 0;
      GM_setValue('chd_use_backup_url', chd_use_backup_url);

      nhd_use_v6_url = $(`input[name="nhd_use_v6_url"]`).prop('checked') ? 1 : 0;
      GM_setValue('nhd_use_v6_url', nhd_use_v6_url);

      //处理key值
      for (key in used_rehost_img_info) {
        used_rehost_img_info[key]['api-key'] = $(`input[name="${key}_key"]`).val();
      }
      GM_setValue('used_rehost_img_info', JSON.stringify(used_rehost_img_info));

      ptp_name_location = $(`input:radio[name="name_location"]:checked`).val();
      GM_setValue('ptp_name_location', ptp_name_location);

      alert('保存成功！！！')
    });

    //自制ptgen
    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">PTGen</td><td width="99%" class="rowfollow" valign="top" align="left" id="ptgen"></td></tr>`);
    $('#ptgen').append(`<label><b>输入豆瓣/IMDB/Bangumi链接查询:</b></label><input type="text" name="url" style="width: 320px; margin-left:5px">`);
    $('#ptgen').append(`<input type="button" id="go_ptgen" value="获取信息" style="margin-left:15px"><input type="button" id="douban2ptp" value="海报转存PTPimg" style="margin-left:15px"><br><br>`);
    $('#ptgen').append(`<textarea name="douban_info" style="width:720px" rows="30"></textarea><br>`);

    $('#go_ptgen').click(function () {
      var raw_info = { 'url': '', 'dburl': '', 'descr': '', 'bgmurl': '' };
      var url = $('input[name="url"]').val();
      $('#go_ptgen').prop('value', '正在获取');
      var flag = true;
      if (match_link('imdb', url)) {
        flag = true;
        raw_info.url = match_link('imdb', url);
      } else if (match_link('douban', url)) {
        flag = false;
        raw_info.dburl = match_link('douban', url);
      } else if (match_link('bangumi', url)) {
        flag = false;
        raw_info.bgmurl = match_link('bangumi', url);
      } else {
        alert('请输入合适的链接！！！');
        return;
      }
      if (!raw_info.bgmurl) {
        create_site_url_for_douban_info(raw_info, flag).then(function (raw_info) {
          if (raw_info.dburl) {
            get_douban_info(raw_info);
          }
        }, function (err) {
          if (confirm("该资源貌似没有豆瓣词条，是否获取imdb信息？")) {
            async function formatDescr() {
              var descr = kg_intro_base_content.split('Screenshots here')[0].trim();
              var doc = await getimdbpage(raw_info.url);
              const imdb_json = JSON.parse($('script[type="application/ld+json"]', doc).text());
              var country = Array.from($('li.ipc-metadata-list__item:contains("Countr")', doc).find('a')).map(function (e) {
                return $(e).text();
              });
              country = country.map(function (e) {
                if (e == 'United States') e = 'USA';
                if (e == 'United Kingdom') e = 'UK';
                return e;
              }).join(', ');
              var index = descr.search('Date Published');
              descr = descr.substring(0, index) + `Country: ${country}\n` + descr.substring(index);
              descr = descr.format({ 'poster': imdb_json.image });
              descr = descr.format({ 'title': $('h1:eq(0)', doc).text().trim() });
              descr = descr.format({ 'genres': imdb_json.genre.join(', ') });
              descr = descr.format({ 'date': $('li.ipc-metadata-list__item:contains("Release date")', doc).find('div').find('li').text() });
              descr = descr.format({ 'score': $('div[data-testid*=aggregate-rating__score]:eq(0)', doc).text() });
              descr = descr.format({ 'imdb_url': raw_info.url });
              var director = Array.from($('li.ipc-metadata-list__item:contains("Director"):eq(0)', doc).find('a')).map(function (e) {
                return $(e).text();
              }).join(', ');
              descr = descr.format({ 'director': director });
              var creators = await getFullCredits(raw_info.url);
              descr = descr.format({ 'creator': creators });
              var actors = Array.from($('div.title-cast__grid', doc).find('a[data-testid="title-cast-item__actor"]:lt(8)')).map(function (e) {
                return $(e).text();
              }).join(', ');
              descr = descr.format({ 'cast': actors });
              descr = descr.format({ 'en_descr': imdb_json.description });
              $('#go_ptgen').prop('value', '获取成功');
              $('textarea[name=douban_info]').val(descr);
            }
            formatDescr();
          } else {
            $('#go_ptgen').prop('value', '获取失败');
            if (match_link('imdb', url)) {
              window.open(`https://search.douban.com/movie/subject_search?search_text=${url.match(/tt\d+/)[0]}&cat=1002`, target = "_blank");
            } else {
              window.open(url, target = '_blank');
            }
          }
        });
      } else {
        get_bgmdata(raw_info.bgmurl, function (data) {
          $('#go_ptgen').prop('value', '获取成功');
          $('textarea[name=douban_info]').val(data.trim());
          GM_setClipboard(data.trim());
        });
      }
      $('#douban2ptp').click(function () {
        var textarea = $('textarea[name="douban_info"]');
        if (textarea.val().match(/https:\/\/img\d.doubanio.com.*?jpg/)) {
          var poster = textarea.val().match(/https:\/\/img\d.doubanio.com.*?jpg/)[0];
          ptp_send_doubanposter(poster, used_ptp_img_key, function (new_url) {
            textarea.val(textarea.val().replace(/https:\/\/img\d.doubanio.com.*?jpg/, new_url));
          });
        } else if (textarea.val().match(/\[img\]https:\/\/m.media-amazon.com\/images\/.*?jpg\[\/img\]/)) {
          var poster = textarea.val().match(/https:\/\/m.media-amazon.com\/images.*?jpg/)[0];
          ptp_send_images([poster], used_ptp_img_key)
            .then(function (new_url) {
              new_url = new_url.toString().split(',').join('\n').replace(/\[.*?\]/g, '');
              textarea.val(textarea.val().replace(/https:\/\/m.media-amazon.com\/images.*?jpg/, new_url));
            }).catch(function (err) {
              alert(err);
            });
        }
      });
    });

    //mediainfo转换
    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">简化MI</td><td width="99%" class="rowfollow" valign="top" align="left" id="mediainfo"></td></tr>`);
    $('#mediainfo').append(`<textarea id="media_info" style="width:700px" rows="20"></textarea><br>`);
    $('#mediainfo').append(`<input type="button" id="simplify" value="简化信息" style="margin-bottom:5px"><br>`);
    $('#mediainfo').append(`<textarea id="clarify_media_info" style="width:700px" rows="20"></textarea><br>`);

    $('#simplify').click(function () {
      var mediainfo_text = simplifyMI($('#media_info').val(), null);
      $('#clarify_media_info').val(mediainfo_text);
    });

    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">图片处理</td><td width="99%" class="rowfollow" valign="top" align="left" id="dealimg"></td></tr>`);
    $('#dealimg').append(`<input type="button" id="preview" value="图片预览" style="margin-bottom:5px;">`);
    $('#dealimg').append(`<input type="button" id="getsource" value="获取大图" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_ptpimg" value="转ptpimg" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_pixhost" value="转pixhost" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_imgbox" value="转imgbox" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_hdbits" value="转HDBits" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="get_imgbb" value="imgbb源图" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="change" value="字符串替换" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="text" style="width: 50px; text-align:center; margin-left: 5px" id="img_source" />--<input type="text" style="width: 50px; text-align:center; margin-right: 5px" id="img_dest" /><br>`);
    $('#dealimg').append(`<input type="button" id="350px" value="350px缩略" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`<input type="button" id="del_img_tag" value="链接提取" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`<input type="button" id="enter2space" value="换行->空格" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`<input type="button" id="get_encode" value="图片提取" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`从第<input type="text" style="width: 30px; text-align:center; margin-left: 5px; margin-right:5px" id="start" />张开始每隔<input type="text" style="width: 30px; text-align:center; margin-left: 5px; margin-right:5px" id="step" />张获取其中第<input type="text" style="width: 30px; text-align:center; margin-left: 5px;margin-right:5px" id="number" />张。<br>`);
    $('#dealimg').append(`<font color="red">获取大图目前支持imgbox，pixhost，pter，ttg，瓷器，img4k，其余的可以尝试字符串替换。</font><a href="https://github.com/tomorrow505/auto_feed_js/wiki/%E5%9B%BE%E7%89%87%E5%A4%84%E7%90%86" target="_blank" style="color:blue">→→点我查看教程←←</a><br>`);
    $('#dealimg').append(`<textarea id="picture" style="width:700px" rows="15"></textarea>`);
    $('#dealimg').append(`<div id="imgs_to_show" style="display: none;"></div><br>`);
    $('#dealimg').append(`<div>结果展示 <a href="#" id="up_text" style="color:red;">↑将结果移入输入框</a><br><textarea id="result" style="width:700px;" rows="15"></textarea></div>`);

    var descr = GM_getValue('descr') === undefined ? '' : GM_getValue('descr');
    var imgs_to_deal = descr.match(/(\[url=.*?\])?\[img\].*?(png|jpg|webp)\[\/img\](\[\/url\])?/ig);
    try {
      if (imgs_to_deal) {
        $('#picture').val(imgs_to_deal.join('\n'));
      }
    } catch (err) { }

    $('#preview').click((e) => {
      if (!$('#imgs_to_show').is(":hidden")) {
        $('#imgs_to_show').hide();
        return;
      }
      var origin_str = $('#picture').val();
      var imgs_to_show = origin_str.match(/(\[img(?:=\d+)?\])(http[^\[\]]*?(jpg|jpeg|png|gif|webp))/ig).map(item => { return item.replace(/\[.*?\]/g, '') });
      if (imgs_to_show.length) {
        $('#imgs_to_show').html('');
        imgs_to_show.map((item) => {
          $('#imgs_to_show').append(`<img src=${item} style="max-width: 700px"/><br>`);
        });
        $('#imgs_to_show').show();
      }
    });

    $('#del_img_tag').click((e) => {
      var origin_str = $('#picture').val();
      origin_str = origin_str.replace(/\[\/?img\]/g, '');
      $('#result').val(origin_str);
    })

    $('#getsource').click((e) => {
      var origin_str = $('#picture').val();
      get_full_size_picture_urls(null, origin_str, $('#result'), true);
    });

    $('#enter2space').click((e) => {
      var origin_str = $('#picture').val();
      origin_str = origin_str.replace(/\n/g, ' ');
      $('#picture').val(origin_str);
    })

    $('#send_ptpimg').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
      if (images.length) {
        ptp_send_images(images, used_ptp_img_key)
          .then(function (new_urls) {
            new_urls = new_urls.toString().split(',').join('\n');
            $('#result').val(new_urls);
          }).catch(function (err) {
            alert(err);
          });
      } else {
        alert('请输入图片地址！！');
      }
    });

    $('#send_imgbox').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
      if (images.length) {
        var name = 'set your gallary name';
        try {
          if (descr.match(/Disc Title:/)) {
            name = descr.match(/Disc Title:(.*)/)[1].trim();
          } else if (descr.match(/Complete name.?:/i)) {
            name = descr.match(/Complete name.?:(.*)/)[1].trim();
          }
        } catch (err) { }
        images.push(name);
        GM_setValue('HDB_images', images.join(', '));
        window.open('https://imgbox.com/', '_blank');
      }
    });

    $('#send_hdbits').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
      if (images.length) {
        var name = 'set your gallary name';
        try {
          if (descr.match(/Disc Title:/)) {
            name = descr.match(/Disc Title:(.*)/)[1].trim();
          } else if (descr.match(/Complete name.*?:/i)) {
            name = descr.match(/Complete name.*?:(.*)/)[1].trim();
          }
        } catch (err) { console.log(err) }
        images.push(name);
        GM_setValue('HDB_images', images.join(', '));
        window.open('https://img.hdbits.org/', '_blank');
      }
    });

    $('#send_pixhost').click((e) => {
      if ($('#picture').val().match(/http[^\[\]]*?(jpg|png|webp)/ig).length > 0) {
        var origin_str = $('#picture').val();
        images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
// [Site Logic: HDB]
          pix_send_images(images)
            .then(function (new_urls) {
              new_urls = new_urls.toString().split(',');
              var urls_append = '';
              if (new_urls.length > 1) {
                for (var i = 0; i <= new_urls.length - 2; i += 2) {
                  urls_append += `${new_urls[i]} ${new_urls[i + 1]}\n`
                }
                if (new_urls.length % 2 == 1) {
                  urls_append += new_urls[new_urls.length - 1] + '\n';
                }
              } else {
                urls_append = new_urls[0] + '\n';
              }
              $('#result').val(urls_append);
              alert('转存成功！');
            })
            .catch(function (message) {
              alert('转存失败');
            });
        }
      } else {
        alert('缺少截图');
      }
    });

    $('#change').click((e) => {
      var origin_str = $('#picture').val();
      if (!$('#img_source').val()) {
        alert("请填写源字符串！")
        return;
      }
      var source_str = $('#img_source').val();
      var dest_str = $('#img_dest').val();
      images = origin_str.match(/http[^\[\]]*?(jpg|png)/ig);
      images.map(item => {
        var new_img = item.replace(source_str, dest_str);
        origin_str = origin_str.replace(item, new_img);
      });
      $('#picture').val(origin_str);
    });

    $('#get_imgbb').click((e) => {
      function getibbdoc(url) {
        var p = new Promise((resolve, reject) => {
          getDoc(url, null, function (doc) {
            if (doc == 'error') {
              reject('error');
            } else {
              var source_img_url = $('#embed-code-3', doc).val();
              resolve(source_img_url);
            }
          });
        })
        return p;
      }
      function getpostdoc(url) {
        var p = new Promise((resolve, reject) => {
          getDoc(url, null, function (doc) {
            var source_img_url = $('#download', doc).attr('href').split('?')[0];
            resolve(source_img_url);
          });
        })
        return p;
      }
      var origin_str = $('#picture').val();
      var imgbb_urls = origin_str.match(/\[url=.*?\]\[img\]https?:\/\/i.ibb.co[^\[\]]*?(jpg|png)\[\/img\]\[\/url\]/ig);
      if (imgbb_urls === null) {
        alert("没有监测到imgbb缩略图链接");
      } else {
        var flag = false;
        imgbb_urls.map(item => {
          var a = item.match(/https:\/\/ibb.co\/(.*?)\]/)[1];
          var b = item.match(/https:\/\/i.ibb.co\/(.*?)\//)[1];
          if (a == b) {
            flag = true;
          }
        });
        if (flag) {
          var imgbb_tasks = [];
          imgbb_urls.map(item => {
            var imgbb_show_url = 'https://ibb.co/' + item.match(/https:\/\/i.ibb.co\/(.*?)\//)[1];
            var imgbb_p = getibbdoc(imgbb_show_url);
            imgbb_tasks.push(imgbb_p);
          })
          Promise.all(imgbb_tasks).then((data) => {
            for (i = 0; i < data.length; i++) {
              origin_str = origin_str.replace(imgbb_urls[i], `${data[i]}`);
            }
            get_full_size_picture_urls(null, origin_str, $('#result'), true);
          })
        } else {
          get_full_size_picture_urls(null, origin_str, $('#result'), true);
        }
      }
      var postimg_urls = origin_str.match(/https?:\/\/i.postimg.cc[^\[\]]*?(jpg|png)/ig);
      if (postimg_urls === null) {
        // alert("没有监测到postimg链接");
      } else {
        var imgpost_tasks = [];
        postimg_urls.map(item => {
          var imgpost_show_url = 'https://postimg.cc/' + item.match(/https:\/\/i.postimg.cc\/(.*?)\//)[1];
          console.log(imgpost_show_url)
          var imgpost_p = getpostdoc(imgpost_show_url);
          imgpost_tasks.push(imgpost_p);
        })
        Promise.all(imgpost_tasks).then((data) => {
          console.log(data)
          for (i = 0; i < data.length; i++) {
            origin_str = origin_str.replace(postimg_urls[i], data[i]);
          }
          origin_str = origin_str.match(/\[img\]https?:.*?(jpg|png)\[\/img\]/ig).join('\n');
          $('#result').val(origin_str);
        })
      }
    });

    $('#get_encode').click((e) => {
      var origin_str = $('#picture').val();
      console.log(origin_str)
      var dest_str = '';
      var images = origin_str.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
      var start = parseInt($('#start').val() ? $('#start').val() : 1);
      var encode_index = parseInt($('#number').val());
      var step = parseInt($('#step').val());
      for (i = start; i < images.length - step; i += step) {
        console.log(i + encode_index - 2)
        dest_str += images[i + encode_index - 2] + '\n';
      }
      $('#result').val(dest_str);
    });

    $('#350px').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png)\[\/img\]/ig).join('\n');
      if (images.length) {
        $('#result').val(deal_img_350(images));
      }
    });

    $('#up_text').click((e) => {
      e.preventDefault();
      $('#picture').val($('#result').val() ? $('#result').val() : $('#picture').val());
      $('#result').val('');
    });

    var id_scroll = site_url.split('#')[1];
    if (id_scroll.match(/\?/)) {
      url = id_scroll.split('?')[1];
      id_scroll = id_scroll.split('?')[0];
      if (url.match(/tt/)) {
        url = 'https://www.imdb.com/title/' + url + '/';
      } else if (url.match(/bgmid/)) {
        url = 'https://bangumi.tv/subject/' + url.split('=').pop() + '/';
      } else {
        url = 'https://movie.douban.com/subject/' + url + '/';
      }
      $('input[name=url]').val(url);
    }
    $(`#${id_scroll}`).parent().show();
    document.querySelector(`#${id_scroll}`).scrollIntoView();
    return;
  }, 1000)
}

//长mediainfo转换简洁版mediainfo
function simplifyMI(mediainfo_text, site) {
  var simplifiedMI = '';
  if (mediainfo_text.match(/QUICK SUMMARY/i)) {
    return mediainfo_text;
  }
  if (mediainfo_text.match(/Disc INFO/i)) {
// [Site Logic: Hdt]
    simplifiedMI = full_bdinfo2summary(mediainfo_text);
    return simplifiedMI;
  }

  if (!mediainfo_text.match(/Video[\S\s]{0,5}ID/)) {
    return mediainfo_text;
  }

  var general_info = mediainfo_text.match(/(general[\s\S]*?)?video/i)[0].trim();
  general_info = get_general_info(general_info);
  if (mediainfo_text.match(/encode.{0,10}date.*?:(.*)/i)) {
    var release_date = mediainfo_text.match(/encode.{0,10}date.*?:(.*)/i)[1].trim();
    general_info += `Release date.......: ${release_date}`;
  }
  general_info += `${N}${N}`;
  simplifiedMI += general_info;
  try { var video_info = mediainfo_text.match(/(video[\s\S]*?)audio/i)[0].trim(); } catch (err) { video_info = mediainfo_text.match(/(video[\s\S]*?)Forced/i)[0].trim(); }
  video_info = get_video_info(video_info);
  simplifiedMI += video_info;
  try { var audio_info = mediainfo_text.match(/(audio[\s\S]*?)(text)/i)[0].trim(); } catch (err) { audio_info = mediainfo_text.match(/(audio[\s\S]*?)(Forced|Alternate group)/i)[0].trim(); }
  var audio_infos = audio_info.split(/audio.*?\nid.*/i).filter(audio => audio.length > 30);
  for (i = 0; i < audio_infos.length; i++) {
    audio_info = get_audio_info(audio_infos[i]);
    simplifiedMI += audio_info;
  }
  try {
    var text_info = mediainfo_text.match(/(text[\s\S]*)$/i)[0].trim();
    var text_infos = text_info.split(/text.*?\nid.*/i).filter(text => text.length > 30);
    for (i = 0; i < text_infos.length; i++) {
      subtitle_info = get_text_info(text_infos[i]);
      simplifiedMI += subtitle_info;
    }
  } catch (err) {
    var subtitle_text = `Subtitles..........: no`;
    simplifiedMI += subtitle_text;
  }
  console.log(simplifiedMI);
  return simplifiedMI;
}
function get_general_info(general_info) {
  var general_text = "General\n";
  try {
    var filename = general_info.match(/Complete name.*?:(.*)/i)[1].split('/').pop().trim();
    general_text += `Release Name.......: ${filename}${N}`;
  } catch (err) { }
  try {
    var format = general_info.match(/format.*:(.*)/i)[1].trim();
    general_text += `Container..........: ${format}${N}`;
  } catch (err) { }
  try {
    var duration = general_info.match(/duration.*:(.*)/i)[1].trim();
    general_text += `Duration...........: ${duration}${N}`;
  } catch (err) { }
  try {
    var file_size = general_info.match(/file.{0,5}size.*:(.*)/i)[1].trim();
    general_text += `Size...............: ${file_size}${N}`;
  } catch (err) { }

  general_text += `Source(s)..........: ${N}`;

  return general_text;
}
function get_video_info(video_info) {
  var video_text = `Video${N}`;
  try {
    var codec = video_info.match(/format.*:(.*)/i)[1].trim();
    video_text += `Codec..............: ${codec}${N}`;
  } catch (err) { }
  try {
    var type = video_info.match(/scan.{0,5}type.*:(.*)/i)[1].trim();
    video_text += `Type...............: ${type}${N}`;
  } catch (err) { }
  try {
    var width = video_info.match(/width.*:(.*)/i)[1].trim();
    var height = video_info.match(/height.*:(.*)/i)[1].trim();
    var resolution = width.replace(/ /g, '').match(/\d+/)[0] + 'x' + height.replace(/ /g, '').match(/\d+/)[0];
    video_text += `Resolution.........: ${resolution}${N}`;
  } catch (err) { }
  try {
    var aspect_ratio = video_info.match(/display.{0,5}aspect.{0,5}ratio.*?:(.*)/i)[1].trim();
    video_text += `Aspect ratio.......: ${aspect_ratio}${N}`;
  } catch (err) { }
  try {
    var bit_rate = video_info.match(/bit.{0,5}rate(?!.*mode).*:(.*)/i)[1].trim();
    video_text += `Bit rate...........: ${bit_rate}${N}`;
  } catch (err) { }
  try {
    var hdr_format = video_info.match(/HDR FORMAT.*:(.*)/i)[1].trim();
    video_text += `HDR format.........: ${hdr_format}${N}`;
  } catch (err) { }
  try {
    var frame_rate = video_info.match(/frame.{0,5}rate.*:(.*fps)/i)[1].trim();
    video_text += `Frame rate.........: ${frame_rate}${N}`;
  } catch (err) { }

  video_text += `${N}`;

  return video_text;
}
function get_audio_info(audio_info) {
  var audio_text = `Audio${N}`;
  try {
    var format = audio_info.match(/format.*:(.*)/i)[1].trim();
    audio_text += `Format.............: ${format}${N}`;
  } catch (err) { }
  try {
    var channels = audio_info.match(/channel\(s\).*:(.*)/i)[1].trim();
    audio_text += `Channels...........: ${channels}${N}`;
  } catch (err) { }
  try {
    var bit_rate = audio_info.match(/bit.{0,5}rate(?!.*mode).*:(.*)/i)[1].trim();
    audio_text += `Bit rate...........: ${bit_rate}${N}`;
  } catch (err) { alert(err) }
  try {
    var language = audio_info.match(/language.*:(.*)/i)[1].trim();
    audio_text += `Language...........: ${language}`;
  } catch (err) { }
  var title = '';
  try { title = audio_info.match(/title.*:(.*)/i)[1].trim(); } catch (err) { title = ''; }
  audio_text += ` ${title}${N}${N}`;

  return audio_text;
}
function get_text_info(text_info) {
  var format = text_info.match(/format.*:(.*)/i)[1].trim();
  var language = text_info.match(/language.*:(.*)/i)[1].trim();
  try { var title = text_info.match(/title.*:(.*)/i)[1].trim(); } catch (err) { title = ''; }
  var subtitle_text = `Subtitles..........: ${language} ${format} ${title}${N}`;
  return subtitle_text;
}

function full_bdinfo2summary(descr) {
  if (!descr.match(/DISC INFO/)) {
    return descr.split(/\[\/quote\]/)[0].replace('[quote]', '');
  }
  var summary = {
    'Disc Title': '',
    'Disc Size': '',
    'Protection': '',
    'BD-Java': '',
    'Playlist': '',
    'Size': '',
    'Length': '',
    'Total Bitrate': '',
    'Protection': '',
    'Video': '',
    'Audio': '',
    'Subtitle': '',
  }

  if (descr.match(/Disc.*?Title:(.*)/i)) {
    summary['Disc Title'] = descr.match(/Disc.*?Title:(.*)/i)[1].trim();
  }
  if (descr.match(/Disc.*?Size:(.*)/i)) {
    summary['Disc Size'] = descr.match(/Disc.*?Size:(.*)/i)[1].trim();
  }
  if (descr.match(/Protection:(.*)/i)) {
    summary['Protection'] = descr.match(/Protection:(.*)/i)[1].trim();
  }
  if (descr.match(/Extras:.*?BD-Java/i)) {
    summary['BD-Java'] = 'Yes';
  } else {
    summary['BD-Java'] = 'No';
  }
  if (descr.match(/PLAYLIST[\s\S]{3,30}?Name:(.*)/i)) {
    summary['Playlist'] = descr.match(/PLAYLIST[\s\S]{3,30}?Name:(.*)/i)[1].trim();
  }
  if (descr.match(/PLAYLIST[\s\S]{3,90}?Length:(.*)/i)) {
    summary['Length'] = descr.match(/PLAYLIST[\s\S]{3,90}?Length:(.*)/i)[1].trim();
  }
  if (descr.match(/PLAYLIST[\s\S]{3,190}?Size:(.*)/i)) {
    summary['Size'] = descr.match(/PLAYLIST[\s\S]{3,190}?Size:(.*)/i)[1].trim();
  }
  if (descr.match(/PLAYLIST[\s\S]{3,290}?Total.*?Bitrate:(.*)/i)) {
    summary['Total Bitrate'] = descr.match(/PLAYLIST[\s\S]{3,290}?Total.*?Bitrate:(.*)/i)[1].trim();
  }

  if (descr.match(/Video:[\s\S]{0,20}Codec/i)) {
    var video_info = descr.match(/Video:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/audio/i)[0].trim();
    summary['Video'] = video_info.split('\n').map(e => {
      var info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') { return ee.trim(); } });
      return info.join(' / ').trim();
    }).join('\nVideo: ').replace(/(\nVideo: )+$/, '');
  }

  if (descr.match(/SUBTITLES:[\s\S]{0,20}Codec/i)) {
    var subtitle_info = descr.match(/SUBTITLES:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/FILES/i)[0].trim();
    summary['Subtitle'] = subtitle_info.split('\n').map(e => {
      var info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') return ee.trim(); });
      return info.join(' / ').trim();
    }).join('\nSubtitle: ').split('[/quote]')[0].replace(/(\nSubtitle: )+$/, '');
  }
  if (descr.match(/Audio:[\s\S]{0,20}Codec/i)) {
    var audio_info = descr.match(/Audio:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/subtitles|\[.*?quote\]/i)[0].trim();
    summary['Audio'] = audio_info.split('\n').map(e => {
      var info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') return ee.trim(); });
      return info.join(' / ').trim();
    }).join('\nAudio: ');
  }

  var quick_summary = '';
  for (key in summary) {
    if (summary[key]) {
      quick_summary += key + ': ' + summary[key] + '\n';
    }
  }
  return quick_summary;
}

function add_douban_info_table(container, width, data) {
  data = data.data;
  if (data.cast.split('/').length > 9) {
    data.cast = data.cast.split('/').slice(0, 9).join('/');
  }
  if (data.director.split('/').length > 2) {
    data.director = data.director.split('/').slice(0, 2).join('/');
  }
  if (data.region.split('/').length > 4) {
    data.region = data.region.split('/').slice(0, 4).join('/') + '/<br>' + data.region.split('/').slice(4).join('/');
  }
  container.append(`<table class="contentlayout" cellspacing="0"><tbody>
        <tr>
            <td rowspan="3" width="2"><img src="${data.image}" style="max-width:${width}px;border:0px;" alt></td>
            <td colspan="2"><h1><a href="https://movie.douban.com/subject/${data.id}" target="_blank">${data.title}</a> (${data.year})</h1><h3>${data.aka}</h3></td>
        </tr>
        <tr>
            <td><table class="content" cellspacing="0" id="imdbinfo" style="white-space: nowrap;"><tbody>
                <tr><th>评分</th><td>${data.average} (${data.votes}人评价)</td></tr>
                <tr><th>类型</th><td>${data.genre}</td></tr>
                <tr><th>国家/地区</th><td>${data.region}</td></tr>
                <tr><th>导演</th><td>${data.director.replace(/\//g, '<br>    ')}</td></tr>
                <tr><th>语言</th><td>${data.language}</td></tr>
                <tr><th>上映日期</th><td>${data.releaseDate.split('/').join('<br>')}</td></tr>
                <tr><th>片长</th><td>${data.runtime}</td></tr>
                <tr><th>演员</th><td>${data.cast.replace(/\//g, '<br>    ')}</td></tr>
            </tbody></table></td>
            <td id="plotcell"><table class="content" cellspacing="0"><tbody>
                <tr><th>简介</th></tr><tr><td>${data.summary == "" ? '本片暂无简介' : '　　' + data.summary.replace(/ 　　/g, '<br>　　')}</td></tr>
            </tbody></table></td>
        </tr>
        <tr>
            <td colspan="2" id="actors"></td>
        </tr>
    </tbody></table>`);
}

async function getFullCredits(url) {
  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://www.imdb.com/title/{imdbid}/fullcredits?ref_=tt_ov_wr'.format({ 'imdbid': url.match(/tt\d+/)[0] }),
      onload: function (responseDetail) {
        if (responseDetail.status === 200) {
          let doc = page_parser(responseDetail.responseText);
          var creators = Array.from($('#writer', doc).next().find('td.name').map((i, e) => {
            return $(e).find('a').text().replace(/\n/g, '');
          })).join(', ');
          resolve(creators);
        }
      }
    });
  });
}

async function getFullDescr(url) {
  return new Promise(resolve => {
    getDoc(url, null, function (docx) {
      imdb_descr = $('div[data-testid="sub-section-summaries"]', docx).text().trim();
      resolve(imdb_descr);
    });
  });
}

async function getimdbpage(url) {
  return new Promise(resolve => {
    getDoc(url, null, function (docx) {
      resolve(docx);
    });
  });
}

async function getPoster(url) {
  return new Promise(resolve => {
    getDoc(url, null, function (docx) {
      var poster = '';
      try {
        poster = $('img[src*="m.media-amazon.com/images"]', docx).attr('src').split(',')[0].trim();
        poster = $('div[style*="calc(50% + 0px)"]', docx).find('img').attr('src');
      } catch (err) {
        poster = '';
      }
      resolve(poster);
    });
  });
}

async function getAKAtitle(url) {
  return new Promise(resolve => {
    var search_url = 'https://passthepopcorn.me/ajax.php?' + encodeURI(`action=torrent_info&imdb=${url}&fast=1`)
    getJson(search_url, null, function (data) {
      if (!Object.keys(data).length) {
        resolve('');
      } else {
        if (data.length) {
          data = data[0];
          resolve(data.title);
        }
      }
    })
  });
}

function getDoubanPoster(doc) {
  try {
    return $('#mainpic img', doc)[0].src.replace(
      /^.+(p\d+).+$/,
      (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
    );
  } catch (e) {
    return null;
  }
}

function getTitles(doc) {
  let isChinese = false;
  const chineseTitle = doc.title.replace(/\(豆瓣\)$/, '').trim();
  const originalTitle = $('#content h1>span[property]', doc).text().replace(chineseTitle, '').trim() || ((isChinese = true), chineseTitle);
  try {
    let akaTitles = $('#info span.pl:contains("又名")', doc)[0].nextSibling.textContent.trim().split(' / ');
    const transTitle = isChinese ? akaTitles.find(e => { return e.match(/[a-z]/i); }) || chineseTitle : chineseTitle;
    const priority = e => {
      if (e === transTitle) {
        return 0;
      }
      if (e.match(/\(港.?台\)/)) {
        return 1;
      }
      if (e.match(/\([港台]\)/)) {
        return 2;
      }
      return 3;
    };
    akaTitles = akaTitles.sort((a, b) => priority(a) - priority(b)).filter(e => e !== transTitle);
    return [{
      chineseTitle: chineseTitle,
      originalTitle: originalTitle,
      translatedTitle: transTitle,
      alsoKnownAsTitles: akaTitles
    },
      isChinese
    ];
  } catch (e) {
    return [{
      chineseTitle: chineseTitle,
      originalTitle: originalTitle,
      translatedTitle: chineseTitle,
      alsoKnownAsTitles: []
    },
      isChinese
    ];
  }
}

function getYear(doc) {
  return parseInt($('#content>h1>span.year', doc).text().slice(1, -1));
}

function getRegions(doc) {
  try {
    return $('#info span.pl:contains("制片国家/地区")', doc)[0].nextSibling.textContent.trim().split(' / ');
  } catch (e) {
    return [];
  }
}

function getGenres(doc) {
  try {
    return $('#info span[property="v:genre"]', doc).toArray().map(e => e.innerText.trim());
  } catch (e) {
    return [];
  }
}

function getLanguages(doc) {
  try {
    return $('#info span.pl:contains("语言")', doc)[0].nextSibling.textContent.trim().split(' / ');
  } catch (e) {
    return [];
  }
}

function getReleaseDates(doc) {
  try {
    return $('#info span[property="v:initialReleaseDate"]', doc).toArray().map(e => e.innerText.trim()).sort((a, b) => new Date(a) - new Date(b));
  } catch (e) {
    return [];
  }
}

function getDurations(doc) {
  try {
    return $('span[property="v:runtime"]', doc).text();
  } catch (e) {
    return [];
  }
}

function getEpisodeDuration(doc) {
  try {
    return $('#info span.pl:contains("单集片长")', doc)[0].nextSibling.textContent.trim();
  } catch (e) {
    return null;
  }
}

function getEpisodeCount(doc) {
  try {
    return parseInt($('#info span.pl:contains("集数")', doc)[0].nextSibling.textContent.trim());
  } catch (e) {
    return null;
  }
}

function getTags(doc) {
  return $('div.tags-body>a', doc).toArray().map(e => e.textContent);
}

function getDoubanScore(doc) {
  const $interest = $('#interest_sectl', doc);
  const ratingAverage = parseFloat(
    $interest.find('[property="v:average"]').text()
  );
  const ratingVotes = parseInt($interest.find('[property="v:votes"]').text());
  return {
    rating: ratingAverage,
    ratingCount: ratingVotes,
    ratingHistograms: {
      'Douban Users': {
        aggregateRating: ratingAverage,
        demographic: 'Douban Users',
        totalRatings: ratingVotes
      }
    }
  };
}

function getDescription(doc) {
  try {
    return Array.from($('#link-report-intra>[property="v:summary"],#link-report-intra>span.all.hidden', doc)[0].childNodes)
      .filter(e => e.nodeType === 3)
      .map(e => e.textContent.trim())
      .join('\n');
  } catch (e) {
    return null;
  }
}

function addComma(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function getDirector(doc) {
  try {
    return $('#info span.pl:contains("导演")', doc)[0].nextSibling.nextSibling.textContent.trim().split(' / ');
  } catch (err) {
    return [];
  }
}

function getWriters(doc) {
  try {
    return $('#info span.pl:contains("编剧")', doc)[0].nextSibling.nextSibling.textContent.trim().split(' / ');
  } catch (err) {
    return [];
  }
}

function getCasts(doc) {
  try {
    return $('#info span.pl:contains("主演")', doc)[0].nextSibling.nextSibling.textContent.trim().split(' / ');
  } catch (err) {
    return [];
  }
}

async function getIMDbScore(ID, timeout = TIMEOUT) {
  if (ID) {
    return new Promise(resolve => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `http://p.media-imdb.com/static-content/documents/v1/title/tt${ID}/ratings%3Fjsonp=imdb.rating.run:imdb.api.title.ratings/data.json`,
        headers: {
          referrer: 'http://p.media-imdb.com/'
        },
        timout: timeout,
        onload: x => {
          try {
            const e = JSON.parse(x.responseText.slice(16, -1));
            resolve(e.resource);
          } catch (e) {
            console.warn(e);
            resolve(null);
          }
        },
        ontimeout: e => {
          console.warn(e);
          resolve(null);
        },
        onerror: e => {
          console.warn(e);
          resolve(null);
        }
      });
    });
  } else {
    return null;
  }
}

async function getIMDbID(doc) {
  try {
    return $('#info span.pl:contains("IMDb:")', doc).parent().text().match(/tt(\d+)/)[1];
  } catch (e) {
    return null;
  }
}

async function getCelebrities(doubanid, timeout = TIMEOUT) {
  var awardurl = 'https://movie.douban.com/subject/{a}/celebrities/'.format({ 'a': doubanid });
  return new Promise(resolve => {
    getDoc(awardurl, null, function (doc) {
      const entries = $('#celebrities>div.list-wrapper', doc).toArray().map(e => {
        const [positionChinese, positionForeign] = $(e).find('h2').text().match(/([^ ]*)(?:$| )(.*)/).slice(1, 3);
        const people = $(e).find('li.celebrity').toArray().map(e => {
          let [nameChinese, nameForeign] = $(e).find('.info>.name').text().match(/([^ ]*)(?:$| )(.*)/).slice(1, 3);
          if (!nameChinese.match(/[\u4E00-\u9FCC]/)) {
            nameForeign = nameChinese + ' ' + nameForeign;
            nameChinese = null;
          }
          const [roleChinese, roleForeign, character] = $(e).find('.info>.role').text().match(/([^ ]*)(?:$| )([^(]*)(?:$| )(.*)/).slice(1, 4);
          return {
            name: {
              chs: nameChinese,
              for: nameForeign
            },
            role: {
              chs: roleChinese,
              for: roleForeign
            },
            character: character.replace(/[()]/g, '')
          };
        });
        return [
          positionForeign.toLowerCase(),
          {
            position: positionChinese,
            people: people
          }
        ];
      });
      if (entries.length) {
        jsonCeleb = entries;
      } else {
        jsonCeleb = null;
      }
      resolve(jsonCeleb);
    });
  });
}

async function getAwards(doubanid, timeout = TIMEOUT) {
  var awardurl = 'https://movie.douban.com/subject/{a}/awards/'.format({ 'a': doubanid });
  return new Promise(resolve => {
    getDoc(awardurl, null, function (doc) {
      resolve($('div.awards', doc).toArray().map(function (e) {
        const $title = $(e).find('.hd>h2');
        const $awards = $(e).find('.award');
        return {
          name: $title.find('a').text().trim(),
          year: parseInt($title.find('.year').text().match(/\d+/)[0]),
          awards: $awards.toArray().map(e => ({
            name: $(e).find('li:first-of-type').text().trim(),
            people: $(e).find('li:nth-of-type(2)').text().split('/').map(e => e.trim())
          }))
        };
      }));
    });
  })
}

async function getInfo(doc, raw_info) {
  const [titles, isChinese] = getTitles(doc),
    year = getYear(doc),
    regions = getRegions(doc),
    genres = getGenres(doc),
    languages = getLanguages(doc),
    releaseDates = getReleaseDates(doc),
    durations = getDurations(doc),
    episodeDuration = getEpisodeDuration(doc),
    episodeCount = getEpisodeCount(doc),
    tags = getTags(doc),
    DoubanID = raw_info.dburl.match(/subject\/(\d+)/)[1],
    DoubanScore = getDoubanScore(doc),
    poster = getDoubanPoster(doc),
    description = getDescription(doc);
  directors = getDirector(doc);
  writers = getWriters(doc);
  casts = getCasts(doc);

  let IMDbID, IMDbScore, awards, celebrities;

  const concurrentFetches = [];

  concurrentFetches.push(
    // IMDb Fetch
    getIMDbID(doc)
      .then(e => {
        IMDbID = e;
        return getIMDbScore(IMDbID);
      })
      .then(e => {
        IMDbScore = e;
        return getAwards(DoubanID);
      })
      .then(e => {
        awards = e;
        return getCelebrities(DoubanID);
      })
      .then(e => {
        celebrities = e;
      })

  );
  await Promise.all(concurrentFetches);
  if (IMDbScore && IMDbScore.title) {
    if (isChinese) {
      if (!titles.translatedTitle.includes(IMDbScore.title)) {
        titles.alsoKnownAsTitles.push(titles.translatedTitle);
        const index = titles.alsoKnownAsTitles.indexOf(IMDbScore.title);
        if (index >= 0) {
          titles.alsoKnownAsTitles.splice(index, 1);
        }
        titles.translatedTitle = IMDbScore.title;
      }
    } else {
      if (!titles.originalTitle.includes(IMDbScore.title) && titles.alsoKnownAsTitles.indexOf(IMDbScore.title) === -1) {
        titles.alsoKnownAsTitles.push(IMDbScore.title);
      }
    }
  }
  return {
    poster: poster,
    titles: titles,
    year: year,
    regions: regions,
    genres: genres,
    languages: languages,
    releaseDates: releaseDates,
    durations: durations,
    episodeDuration: episodeDuration,
    episodeCount: episodeCount,
    tags: tags,
    DoubanID: DoubanID,
    DoubanScore: DoubanScore,
    IMDbID: IMDbID,
    IMDbScore: IMDbScore,
    description: description,
    directors: directors,
    writers: writers,
    casts: casts,
    awards: awards,
    celebrities: celebrities
  };
}

function formatInfo(info) {
  let temp;
  const infoText = (
    (info.poster ? `[img]${info.poster}[/img]\n\n` : '') +
    '◎译　　名　' + [info.titles.translatedTitle].concat(info.titles.alsoKnownAsTitles).join(' / ') + '\n' +
    '◎片　　名　' + info.titles.originalTitle + '\n' +
    '◎年　　代　' + info.year + '\n' +
    (info.regions.length ? '◎产　　地　' + info.regions.join(' / ') + '\n' : '') +
    (info.genres.length ? '◎类　　别　' + info.genres.join(' / ') + '\n' : '') +
    (info.languages.length ? '◎语　　言　' + info.languages.join(' / ') + '\n' : '') +
    (info.releaseDates.length ? '◎上映日期　' + info.releaseDates.join(' / ') + '\n' : '') +
    ((info.IMDbScore && info.IMDbScore.rating) ? `◎IMDb评分  ${Number(info.IMDbScore.rating).toFixed(1)}/10 from ${addComma(info.IMDbScore.ratingCount)} users\n` : '') +
    (info.IMDbID ? `◎IMDb链接  https://www.imdb.com/title/tt${info.IMDbID}/\n` : '') +
    ((info.DoubanScore && info.DoubanScore.rating) ? `◎豆瓣评分　${info.DoubanScore.rating}/10 from ${addComma(info.DoubanScore.ratingCount)} users\n` : '') +
    (info.DoubanID ? `◎豆瓣链接　https://movie.douban.com/subject/${info.DoubanID}/\n` : '') +
    ((info.durations && info.durations.length) ? '◎片　　长　' + info.durations + '\n' : '') +
    (info.episodeDuration ? '◎单集片长　' + info.episodeDuration + '\n' : '') +
    (info.episodeCount ? '◎集　　数　' + info.episodeCount + '\n' : '') +
    (info.celebrities ? info.celebrities.map(e => {
      const position = e[1].position;
      let title = '◎';
      switch (position.length) {
        case 1:
          title += '　  ' + position + '　  　';
          break;
        case 2:
          title += position.split('').join('　　') + '　';
          break;
        case 3:
          title += position.split('').join('  ') + '　';
          break;
        case 4:
          title += position + '　';
          break;
        default:
          title += position + '\n　　　　　　';
      }
      const people = e[1].people.map((f, i) => {
        const name = f.name.chs ? (f.name.for ? f.name.chs + ' / ' + f.name.for : f.name.chs) : f.name.for;
        return (i > 0 ? '　　　　　　' : '') + name + (f.character ? ` (${f.character})` : '');
      }).join('\n');
      return title + people;
    }).join('\n') + '\n\n' : '') +
    (info.tags.length ? '◎标　　签　' + info.tags.join(' | ') + '\n\n' : '') +
    (info.description ? '◎简　　介　\n' + info.description.replace(/^|\n/g, '\n　　') + '\n\n' : '◎简　　介　\n\n　　暂无相关剧情介绍') +
    (info.awards.length ? '◎获奖情况　\n\n' + info.awards.map(e => {
      const awardName = '　　' + e.name + ' (' + e.year + ')\n';
      const awardItems = e.awards.map(e => '　　' + e.name + (e.people ? ' ' + e.people : '')).join('\n');
      return awardName + awardItems;
    }).join('\n\n') + '\n\n' : '')
  ).trim();
  return infoText;
}

async function transferToPixhost(imgUrl) {
  console.log(imgUrl);
  const blob = await new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: imgUrl,
      responseType: "blob",
      onload: (res) => res.status === 200 ? resolve(res.response) : reject("下载失败"),
      onerror: (err) => reject(err)
    });
  });
  console.log('图片下载完成');
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('content_type', '0'); // 0=全年龄, 1=成人
    const name = imgUrl.match(/p\d+.jpg/);
    formData.append('file', blob, `${name[0]}`);
    formData.append('name', `${name[0]}`);
    formData.append('ajax', `yes`);
    GM_xmlhttpRequest({
      method: "POST",
      url: "https://pixhost.to/new-upload/",
      data: formData,
      headers: {
        "Origin": "https://pixhost.to",
        "Referer": "https://pixhost.to/",
        "User-Agent": window.navigator.userAgent
      },
      onload: (res) => {
        console.log(res);
        if (res.status === 200) {
          resolve(JSON.parse(res.responseText).show_url);
        } else {
          reject("上传失败 Status:" + res.status);
        }
      },
      onerror: (err) => reject(err)
    });
  });
}

function get_douban_info(raw_info) {
  getDoc(raw_info.dburl, null, function (doc) {
    const infoGenClickEvent = async e => {
      var data = formatInfo(await getInfo(doc, raw_info));
// [Site Logic: PTP]
      raw_info.descr = data + '\n\n' + raw_info.descr;
      var thanks = raw_info.descr.match(/\[quote\].*?感谢原制作者发布。.*?\[\/quote\]/);
      if (thanks) {
        raw_info.descr = thanks[0] + '\n\n' + raw_info.descr.replace(thanks[0], '').trim();
      }
      if (!location.href.match(/usercp.php\?action=persona|pter.*upload.php|piggo.me.*upload.php|^https:\/\/.*.douban.com|^https?:\/\/\d+.\d+.\d+.\d+.*5678/)) {
        if (raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)) {
          raw_info.url = raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)[0] + '/';
        }
        if (raw_info.descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}纪录片/i)) {
          raw_info.type = '纪录';
        } else if (raw_info.descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}动画/i)) {
          raw_info.type = '动漫';
        }
        set_jump_href(raw_info, 1);
        douban_button.value = '获取成功';
        $('#textarea').val(data);
        if ($('#input_box').length && !$('#input_box').val()) {
          try {
            raw_info.url = match_link('imdb', raw_info.descr);
            $('#input_box').val(raw_info.url);
            var search_name = get_search_name(raw_info.name);
            try {
              var imdbid = raw_info.url.match(/tt\d+/i)[0];
              var imdbno = imdbid.substring(2);
              var container = $('#forward_r');
              add_search_urls(container, imdbid, imdbno, search_name, 0);
            } catch (err) { }
          } catch (err) { }
        }
        GM_setClipboard(data);
        rebuild_href(raw_info);
      } else if (site_url.match(/pter.*upload.php|piggo.*upload.php|^https?:\/\/\d+.\d+.\d+.\d+.*5678/)) {
        $('#descr').val(data + '\n\n' + $('#descr').val());
        $('.get_descr[value=正在获取]').val("获取成功");
        if (!$('input[name=small_descr]').val()) {
          $('input[name=small_descr]').val(get_small_descr_from_descr(data, $('input[name=name]').val()));
        }
        if (!$('input[name=url]').val()) {
          $('input[name=url]').val(match_link('imdb', data));
        }
        if (!$('input[name=douban]').val()) {
          $('input[name=douban]').val(match_link('douban', data));
        }
      } else if (site_url.match(/^https:\/\/.*.douban.com/)) {
        if (douban_poster_rehost == -1) {
          GM_setClipboard(data);
          $('#copy').text('完成');
        } else if (douban_poster_rehost == 0) {
          var if_rehost = confirm("是否选择转存豆瓣海报？\n如果选择为是：则优先ptpimg，没有配置key则PixHost。");
          if (if_rehost) {
            var poster = data.match(/https:\/\/img\d.doubanio.com.*?jpg/)[0];
// [Site Logic: PTP]
              douban_poster_rehost = 2;
            }
            GM_setValue('douban_poster_rehost', douban_poster_rehost);
          } else {
            GM_setValue('douban_poster_rehost', -1);
            GM_setClipboard(data);
            $('#copy').text('完成');
          }
        } else {
// [Site Logic: PTP]
            transferToPixhost(poster).then(new_url => {
              data = data.replace(/https:\/\/img\d.doubanio.com.*?jpg/, new_url);
              GM_setClipboard(data);
              $('#copy').text('完成');
            });
          }
        }
      } else {
        $('textarea[name="douban_info"]').val(raw_info.descr);
        $('#go_ptgen').prop('value', '获取成功');
      };
    }
    infoGenClickEvent();
  });
}

function add_picture_transfer() {
  GM_addStyle(
    `.delete_div {
        position: fixed;
        bottom: 30%;
        right: 27%;
        width: 46%;
        color:white;
    }`);
  $(`body`).append(`
        <div class="delete_div" style="align:center; color:white; display:none; border-radius: 5px">
            <div id="rehost" style="width: 100%; margin:auto;"></div>
        </div>`);
  $('#rehost').append(`<td style="width:100%; border: none; background-color:rgba(72,101,131,0.7); padding: 6px" valign="top" align="left" id="rehostimg"></td>`);

  $('#rehostimg').append(`<b>选择转存站点：</b>`)
  for (key in used_rehost_img_info) {
    $('#rehostimg').append(`<input style="vertical-align:middle" type="radio" name="rehost_site" value="${key}">${key}`);
  }
  $('#rehostimg').append(`<input style="vertical-align:middle" type="radio" name="rehost_site" value="PixHost">PixHost`);
  $('#rehostimg').append(`<input style="vertical-align:middle" type="radio" name="rehost_site" value="PTPimg">PTPimg`);
  $('#rehostimg').append(`<input style="vertical-align:middle;margin-left:160px;color:red;width:20px;" type="button" name="close_panel" value="&times;">`);
  $('input[name="close_panel"]').click(() => {
    $('input[name="img_url"]').val('');
    $('textarea[name="show_result"]').val('');
    $('div.delete_div').hide();
  });

  $(`input:radio[value="freeimage"]`).prop('checked', true);
  $('#rehostimg').append(`<br><br>`);

  $('#rehostimg').append(`<label><b>输入想要转存的图片链接:</b></label><input type="text" name="img_url" style="width: 350px; margin-left:5px">`);
  $('#rehostimg').append(`<input type="button" id="go_rehost" value="开始转存" style="margin-left:5px"><br>`);
  $('#rehostimg').append(`<p>注意：自动获取的为img9域名，如失败，可自行更换为1,2,9。</p>`)
  if (site_url.match(/springsunday/)) {
    $('#go_rehost').css({ 'color': 'white', 'background': 'url(https://springsunday.net/styles/Maya/images/btn_submit_bg.gif) repeat left top', 'border': '1px black' });
  }
  $('#rehostimg').append(`<textarea name="show_result" style="width:560px" rows="6"></textarea><br>`);
  $('#go_rehost').click(function () {
    var rehost_site = $('input[name="rehost_site"]:checked').val();
    var img_url = $('input[name="img_url"]').val();
// [Site Logic: PTP]
      alert('没有APIKEY无法完成转存工作！！');
      return;
    }
    $('#go_rehost').prop('value', '正在转存');
    if (rehost_site == 'PixHost') {
      transferToPixhost(img_url).then(new_url => {
        $('textarea[name="show_result"]').val(new_url);
        $('#go_rehost').prop('value', '转存成功');
        GM_setClipboard(new_url);
      });
// [Site Logic: PTP]
      rehost_single_img(rehost_site, img_url)
        .then(function (result) {
          $('textarea[name="show_result"]').val(result);
          $('#go_rehost').prop('value', '转存成功');
        })
        .catch(function (err) {
          $('#go_rehost').prop('value', '转存失败');
          alert(err);
        })
    }
  });
  $('a:contains("单图转存"),a:contains("海报转存")').click((e) => {
    e.preventDefault();
    if ($('div.delete_div').is(":hidden")) {
      $('div.delete_div').show();
    } else {
      $('div.delete_div').hide();
    }
  });
}

if (site_url.match(/^https:\/\/pterclub.net\/upload.php/)) {
  $('input[name=url]:first').after(`<input type="button" value="获取简介" class="get_descr" data="url" />`);
  $('input[name=douban]').after(`<input type="button" value="获取简介" class="get_descr" data="douban" />`);
  $('.get_descr').click((e) => {
    var tmp_raw_info = { 'url': '', 'dburl': '', 'descr': '' };
    var link_type = $(e.target).attr('data');
    if ($(`input[name="${link_type}"]`).val()) {
      var link = $(`input[name="${link_type}"]`).val();
      $(e.target).prop('value', '正在获取');
      var flag = true;
      if (link_type == 'url') {
        falg = true;
        tmp_raw_info.url = link;
      } else {
        flag = false;
        tmp_raw_info.dburl = link;
      }
      create_site_url_for_douban_info(tmp_raw_info, flag).then(function (tmp_raw_info) {
        console.log(tmp_raw_info)
        if (tmp_raw_info.dburl) {
          get_douban_info(tmp_raw_info);
        }
      }, function (err) {
        console.log(err);
        $(e.target).prop('value', '获取失败');
        if (link_type == 'url') {
          window.open(`https://search.douban.com/movie/subject_search?search_text=${link.match(/tt\d+/)[0]}&cat=1002`, target = "_blank");
        } else {
          window.open(url, target = '_blank');
        }
      });
    } else {
      alert("请输入合适的链接！！！")
    }
  })
}

if (site_url.match(/^https:\/\/piggo.me\/upload.php/)) {
  $('input[name=url]').parent().after(`<div><input type="button" value="获取豆瓣" class="get_descr" data="url" /></div>`);
  $('input[name=pt_gen]').parent().after(`<div><input type="button" value="获取豆瓣" class="get_descr" data="pt_gen" /></div>`);
  $('.btn-get-pt-gen').hide();
  $('.get_descr').click((e) => {
    var tmp_raw_info = { 'url': '', 'dburl': '', 'descr': '' };
    var link_type = $(e.target).attr('data');
    if ($(`input[name="${link_type}"]`).val()) {
      var link = $(`input[name="${link_type}"]`).val();
      $(e.target).prop('value', '正在获取');
      var flag = true;
      if (link_type == 'url') {
        falg = true;
        tmp_raw_info.url = link;
      } else {
        flag = false;
        tmp_raw_info.dburl = link;
      }
      create_site_url_for_douban_info(tmp_raw_info, flag).then(function (tmp_raw_info) {
        console.log(tmp_raw_info)
        if (tmp_raw_info.dburl) {
          get_douban_info(tmp_raw_info);
        }
      }, function (err) {
        console.log(err);
        $(e.target).prop('value', '获取失败');
        if (link_type == 'url') {
          window.open(`https://search.douban.com/movie/subject_search?search_text=${link.match(/tt\d+/)[0]}&cat=1002`, target = "_blank");
        } else {
          window.open(url, target = '_blank');
        }
      });
    } else {
      alert("请输入合适的链接！！！")
    }
  })
}

if (site_url.match(/jpopsuki.eu.*torrents.php\?id=/)) {
  $('tr.group_torrent').find("a:contains(RP)").map((index, e) => {
    $(e).after(` | <a href="https://jpopsuki.eu/torrents.php?id=${site_url.match(/id=(\d+)/)[1]}&torrentid=${$(e).attr('href').match(/id=(\d+)/)[1]}">PL</a>`);
  });
}

//添加豆瓣到ptgen跳转
if (site_url.match(/^https:\/\/movie.douban.com\/subject\/\d+/i) && if_douban_jump) {
  $(document).ready(function () {
    $('#info').append(`<span class="pl">描述信息: </span><a id="copy">复制</a>`);
    $('#copy').click(e => {
      var tmp_raw_info = { 'url': '', 'dburl': match_link('douban', site_url), 'descr': '' };
      get_douban_info(tmp_raw_info);
    });

    var year = $('span.year').text().match(/\d+/)[0];
    var ch_name = $('h1').find('span:first').text().split(' ')[0];

    try {
      var imdbid = $('#info').html().match(/tt\d+/i)[0];
      var imdb_url = 'https://www.imdb.com/title/' + imdbid;
      setTimeout(function () {
        if (!$('#info').find('a[href*="www.imdb.com"]').length) {
          $("span.pl:contains('IMDb')").get(0).nextSibling.nodeValue = '';
          $("span.pl:contains('IMDb')").after(`<a href="${imdb_url}" target="_blank"> ${imdbid}</a>`);
        }
      }, 1000);
      getDoc(imdb_url, null, function (doc) {
        var en_name = $('h1', doc).text();
        if ($('span.pl:contains("季数")').length) {
          var en_name02 = $('div:contains("All episodes"):last', doc).parent().parent().prev().text();
          en_name = en_name02 ? en_name02 : en_name;
          var number = $('#season option:selected').text();
          if (!number) { number = $('span.pl:contains("季数")')[0].nextSibling.textContent.trim(); }
          if (number.length < 2) { number = '0' + number; }
          en_name = en_name + ' S' + number;
        }
        var name = `${ch_name} ${en_name} ${year} `.replace(/ +/g, ' ').replace(/ /g, '.').replace(/:\./, '.').replace('-.', '-').replace('..', '.').replace('.-', '-');
        $('#info').append(`<br><span class="pl">影视名称:</span> ${name}<br>`);
        add_search_urls($container, imdbid, imdbno, en_name, 2);
      });
    } catch (err) {
      var en_name = null;
      var aka_names = $('#info span.pl:contains("又名")')[0].nextSibling.textContent.trim();
      aka_names.split('/').forEach((e, index) => {
        if (e.match(/^[a-zA-Z0-9 '-:]*$/)) {
          en_name = e;
        }
      });
      var name = `${ch_name} ${en_name} ${year} `.replace(/ +/g, ' ').replace(/ /g, '.').replace(/:\./, '.').replace('-.', '-').replace('..', '.').replace('.-', '-');
      $('#info').append(`<br><span class="pl">影视名称:</span> ${name}<br>`);
    }

    $('#mainpic').append(`<br><a href="#">海报转存</a>`);
    add_picture_transfer();
    var poster = $('#mainpic img')[0].src.replace(
      /^.+(p\d+).+$/,
      (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
    );
    $('input[name=img_url]').val(poster);

    try {
      if ($('#info').html().match(/tt\d+/i)) {
        var imdbid = $('#info').html().match(/tt\d+/i)[0];
        var imdbno = imdbid.substring(2);
        var search_name = $('h1').text().trim().match(/[a-z ]{2,200}/i)[0];
        search_name = search_name.replace(/season/i, '');
        if (!search_name.trim()) {
          try {
            search_name = $('#info span.pl:contains("又名")')[0]
              .nextSibling.textContent.trim()
              .split(" / ")[0];
          } catch (err) { }
        }
        var $container = $('h1');
        add_search_urls($container, imdbid, imdbno, search_name, 2);
      }
    } catch (err) { console.log(err) }
  });
  return;
}

if (site_url.match(/^https:\/\/www.imdb.com\/title\/tt\d+/) && if_imdb_jump) {
  mutation_observer(document, function () {
    if (!$('.search_urls').length) {
      var imdbid = site_url.match(/tt\d+/i)[0];
      var imdbno = imdbid.substring(2);
      var search_name = $('title').text().trim().split(/ \(\d+\) - /)[0];
      search_name = search_name.replace(/season/i, '');
      var $container = $('h1[data-testid*=pageTitle]');
      add_search_urls($container, imdbid, imdbno, search_name, 1);
      $('.search_urls').find('a').css('color', 'yellow');
    }
  });
  return;
}

if (site_url.match(/^https:\/\/(music|book).douban.com\/subject\/\d+/)) {
  var source_type = '音乐';
  if (site_url.match(/book/)) {
    source_type = '书籍';
  }
  $('#mainpic').append(`<br><a href="#">海报转存</a>`);
  add_picture_transfer();
  var poster = $('#mainpic img')[0].src.replace(
    /^.+(p\d+).+$/,
    (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
  );
  $('input[name=img_url]').val(poster);
  function walk_Dom(n) {
    do {
      if (n.nodeName == 'SPAN' && n.className == 'pl') {
        n.innerHTML = '◎' + n.innerHTML.trim();
      } else if (n.nodeName == 'BR') {
        n.innerHTML = '\r\n';
      }
      if (n.hasChildNodes()) {
        walk_Dom(n.firstChild);
      } else {
        if (n.nodeType != 1) {
          raw_info = raw_info + n.textContent.trim();
        }
      }
      n = n.nextSibling;
    } while (n);
    return raw_info;
  }
  var raw_info = '';
  var poster = `[img]${$('div#mainpic').find('a').prop('href')}[/img]\n`;
  var info = walk_Dom($('#info')[0].cloneNode(true));
  info = info.replace(/◎/g, '\n◎');
  info = info.replace(/:/g, '：');
  info = poster + info;
  try {
    info += '\n◎豆瓣评分：' + `${$('strong.rating_num').text()}/10 from ${$('div.rating_sum').text().match(/\d+/)[0]} users`;
  } catch (err) {
    info += '\n◎豆瓣评分： NaN';
  }
  info += '\n◎豆瓣链接：' + site_url.split('?')[0] + '\n';

  var tag = $('div.tags-body');
  if (tag.length) {
    info += '\n◎标签：' + Array.from(tag.find('a').map((index, e) => {
      return $(e).text();
    })).join(' | ');
  }

// [Site Logic: 音乐]
    var introduction = $('#link-report').find('div.intro:first');
    if (introduction.length) {
      if (introduction.text().match(/展开全部/i)) {
        introduction = $('#link-report').find('span[class*="all hidden"]').find('div.intro');
      }
      introduction = introduction.clone();
      introduction.find('p').map((index, e) => {
        $(e).text($(e).text() + '\n\n');
      });
      info += `\n◎内容简介\n${'　　' + introduction.text().trim()}`;
    } else {
      info += `\n◎内容简介\n　　该${source_type}暂无简介。`;
    }
    var author_intro = $('span:contains(作者简介)').parent().next();
    if (author_intro.length) {
      if (author_intro.text().match('展开全部')) {
        author_intro = author_intro.find('span[class*="all hidden"]').find('div.intro');
      } else {
        author_intro = author_intro.find('div.intro')
      }
      author_intro = author_intro.clone();
      author_intro.find('p').map((index, e) => {
        $(e).text($(e).text() + '\n\n');
      });
      info += `\n\n◎作者简介\n${'　　' + author_intro.text().trim()}`;
    }
  }

  $('#info').append(`描述: <a id="copy">复制</a>`);
  $('#copy').click(e => {
    GM_setClipboard(info);
    $('#copy').text('完成')
  });
}

/*******************************************************************************************************************
*                                         part 3 页面逻辑处理（源网页）                                              *
********************************************************************************************************************/
var sleep_time = 0;
// [Site Logic: Hdf]
// [Site Logic: Digitalcore]
if (site_url.match(/https:\/\/redacted.sh\/upload.php#separator#/)) {
  sleep_time = 2500;
} else if (site_url.match(/https:\/\/springsunday.net\/upload.php#/)) {
  sleep_time = 1500;
} else if (site_url.match(/https:\/\/rousi.pro\/upload#/)) {
  sleep_time = 3000;
}

// [Site Logic: Byr]
// [Site Logic: Yemapt]

function auto_feed() {
// [Site Logic: ZHUQUE]
  if (judge_if_the_site_as_source() == 1) {
    raw_info.origin_site = origin_site;
    raw_info.origin_url = site_url.replace('/', '***');

    var title, small_descr, descr, tbody, frds_nfo;
    var cmct_mode = 1;
    var torrent_id = "";//gz架构站点种子id
    var douban_button_needed = false;
    var search_mode = 1;

    var is_inserted = false;
    var opencd_mode = 0; //皇后有两种版面,默认新版面
// [Site Logic: Opencd]

    //----------------------------------标题简介获取——国内站点-------------------------------------------
    if ((judge_if_the_site_in_domestic(site_url) && origin_site != 'HHClub') || opencd_mode) {
// [Site Logic: Ttg]
// [Site Logic: Hudbt]
// [Site Logic: Byr]
// [Site Logic: Npupt]
        title = document.getElementById("top");
      }

// [Site Logic: Byr]
// [Site Logic: Ttg]
        descr = document.getElementById("kdescr");
// [Site Logic: Cmct]
// [Site Logic: Frds]
        if (site_url.match(/detailsgame/)) {
          descr = document.getElementById("kdescription");
          raw_info.type = '游戏';
          try { raw_info.small_descr = document.getElementsByTagName('h1')[1].textContent; } catch (err) { }
        }
// [Site Logic: Ptlgs]
      }
// [Site Logic: Qingwa]


// [Site Logic: OurBits]

// [Site Logic: 影]

      //获取最外层table
      tbody = descr.parentNode.parentNode.parentNode;
      descr = descr.cloneNode(true);

      try {
        var codetop = descr.getElementsByClassName('codetop');
        Array.from(codetop).map((e, index) => {
          try { descr.removeChild(e); } catch (err) { e.parentNode.removeChild(e) }
        });
        var codemain = descr.getElementsByClassName('codemain');
        Array.from(codemain).map((e, index) => {
          if (!e.innerHTML.match(/<table>/) && (origin_site != 'OurBits' || !$(e).find("fieldset").length)) {
            try { e.innerHTML = '[quote]{mediainfo}[/quote]'.format({ 'mediainfo': e.innerHTML.trim() }); } catch (err) { }
          }
        });
// [Site Logic: Audiences]
      } catch (err) {
        console.log(err);
      }

      raw_info.descr = walkDOM(descr);
      raw_info.descr = raw_info.descr.replace(/\[\/img\]\n\n/g, '[/img]\n');

// [Site Logic: 影]
// [Site Logic: Audiences]

      raw_info.descr = raw_info.descr.replace(/\[img\]https:\/\/ourbits.club\/pic\/(Ourbits_MoreScreens|Ourbits_info).png\[\/img\]/g, '');

// [Site Logic: U2]

// [Site Logic: Frds]

      // HDDolby 详情页：按页面结构抓取 MediaInfo 与 截图
// [Site Logic: Hddolby]

      if ($('.nexus-media-info-raw').length || $('#kmediainfo').length) {
        var mediainfo = $('.nexus-media-info-raw').text() ? $('.nexus-media-info-raw').text() : $('#kmediainfo').text();
        if ($('.spoiler-content').length) {
          mediainfo = $('.spoiler-content').text();
        }
        if (mediainfo !== '暂无媒体信息') {
          raw_info.descr += `\n  \n[quote]${mediainfo.trim()}[/quote]\n  \n`;
          try {
            var intro = raw_info.descr.indexOf('◎简　　介');
            intro = intro ? intro : 300;
            var pictures = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/g);
            pictures.forEach(item => {
              if (raw_info.descr.indexOf(item) > intro) {
                raw_info.descr = raw_info.descr.replace(item, '');
                raw_info.descr += item;
              }
            });
          } catch (err) { }
        }
      }

      //ourbits没有简介的话补充简介
// [Site Logic: OurBits]

// [Site Logic: Ttg]

// [Site Logic: Frds]
// [Site Logic: 影]
// [Site Logic: U2]
// [Site Logic: Other]
// [Site Logic: HDSky]
// [Site Logic: Ttg]
// [Site Logic: Zmpt]
// [Site Logic: Hdarea]
        raw_info.torrent_name = $('a[href*="download.php"]:contains(torrent)').text();
        if ($('a[href*="download.php"]:contains(下载地址)').length) {
          raw_info.torrent_url = $('a[href*="download.php"]:contains(下载地址)').attr('href');
        } else if ($('td:contains(种子链接)').length) {
          raw_info.torrent_url = $('td:contains(种子链接)').next().find('a').attr('href');
        } else if ($('td:contains(下载直链)').length) {
          raw_info.torrent_url = $('td:contains(下载直链)').next().find('a').attr('href');
        } else if ($('td:contains(下载链接)').length) {
          raw_info.torrent_url = $('td:contains(下载链接)').next().find('a').attr('href');
// [Site Logic: Hdarea]
        } else if ($('td:contains(下載鏈接)').length) {
          raw_info.torrent_url = $('td:contains(下載鏈接)').next().find('a').attr('href');
        } else if ($('a[href*="download.php"]:contains(下载种子)').length) {
          raw_info.torrent_url = $('a[href*="download.php"]:contains(下载种子)').attr('href');
        } else {
          raw_info.torrent_url = $('a[href*="download.php"]:contains(torrent)').attr('href');
        }
        if (!raw_info.torrent_url.match(/^http/)) {
          if (raw_info.torrent_url.match(/^\//)) {
            raw_info.torrent_url = raw_info.torrent_url.replace(/^\//, '');
          }
          raw_info.torrent_url = used_site_info[origin_site].url + raw_info.torrent_url;
        }
// [Site Logic: Cmct]
      }
    }

// [Site Logic: Hdroute]

// [Site Logic: Opencd]

    //------------------------------国外站点table获取(简介后续单独处理)-------------------------------------------

    var table, insert_row, douban_box;
// [Site Logic: Hdt]

// [Site Logic: Ptlgs]

// [Site Logic: Hhclub]

// [Site Logic: Tik]

// [Site Logic: Cnz]

// [Site Logic: PTP]

// [Site Logic: Ant]

// [Site Logic: Sc]

// [Site Logic: HDOnly]

// [Site Logic: Gpw]

// [Site Logic: Btn]

// [Site Logic: Tvv]

// [Site Logic: Nbl]

// [Site Logic: Ipt]

// [Site Logic: Hdspace]

// [Site Logic: Torrentseeds]

// [Site Logic: Speedapp]

// [Site Logic: In]

// [Site Logic: Hou]

// [Site Logic: Omg]

// [Site Logic: Digitalcore]

// [Site Logic: Bluebird]

// [Site Logic: Bwtorrents]

// [Site Logic: Bit-Hdtv]

// [Site Logic: Bib]

// [Site Logic: Mam]

// [Site Logic: Mtv]

// [Site Logic: Bhd]

// [Site Logic: Hdoli]

// [Site Logic: Fnp]

// [Site Logic: Hone]

// [Site Logic: Blu]

// [Site Logic: Uhd]

// [Site Logic: Hdf]

// [Site Logic: Hdb]

// [Site Logic: Red]

// [Site Logic: Lztr]

// [Site Logic: Ops]

// [Site Logic: Dicmusic]

// [Site Logic: Sugoimusic]

// [Site Logic: Jpop]

// [Site Logic: Opencd]

// [Site Logic: Torrentleech]

    if (origin_site.match(/xthor/i)) {
      try { raw_info.name = document.getElementsByTagName('h1')[0].textContent; } catch {
        raw_info.name = document.getElementsByTagName('h2')[0].textContent;
      }
      var download = document.getElementById('Download');
      var tbody = download.getElementsByTagName('tbody')[0];
      raw_info.url = match_link('imdb', download.innerHTML).split('?').pop();

      if (download.innerHTML.match(/https:\/\/xthor.tk\/pic\/bannieres\/info_film.png/i)) {
        raw_info.type = '电影';
      } else if (download.innerHTML.match(/https:\/\/xthor.tk\/pic\/bannieres\/info_serie.png/i)) {
        raw_info.type = '剧集';
      }
      if (!raw_info.type && raw_info.name.match(/s\d+/i)) {
        raw_info.type = '剧集';
      } else {
        raw_info.type = '电影';
      }
      var div_index = document.getElementsByClassName('breadcrumb')[0];
      var div = document.createElement('div');
      var mytable = document.createElement('table');
      var mytbody = document.createElement('tbody');
      insert_row = mytable.insertRow(0);
      douban_box = mytable.insertRow(0);
      div.appendChild(mytable);
      div_index.parentNode.insertBefore(div, div_index);

      var nfo = document.getElementById('NFO');
      raw_info.descr = nfo.textContent;
      raw_info.descr = '[quote]\n' + raw_info.descr + '\n[/quote]';

      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('td>h2:first').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank">${data.data.title.split(' ')[0]}[${score}]</a>`)
            $a = $('h2').parent().find('i:eq(-2)').find('a').text('查看……');
            $('h2:first').parent().find('i:eq(-1)').text(`${data.data.summary.replace(/ 　　/g, '')}`);
            $('h2:first').parent().find('i:eq(-1)').append($a);
            $('span:contains(/10)').before(` / ${data.data.genre}`)
          }
        });
      }
      raw_info.torrent_url = `https://xthor.tk/` + $('a[href^="download.php"]').attr('href');
      var torrent_pass = $('link[href*="torrent_pass"]').attr('href').split('torrent_pass')[1];
      raw_info.torrent_url += `&torrent_pass${torrent_pass}`;
    }

// [Site Logic: Hdroute]

// [Site Logic: ZHUQUE]

// [Site Logic: Filelist]

// [Site Logic: Cg]

// [Site Logic: Kg]

// [Site Logic: Its]

// [Site Logic: Sportscult]

// [Site Logic: Npupt]

// [Site Logic: Mteam]

// [Site Logic: Nexushd]

    //-------------------------------------根据table获取其他信息——包含插入节点（混合）-------------------------------------------
    var tds = tbody.getElementsByTagName("td");
// [Site Logic: Hudbt]

    //循环处理所有信息
    for (i = 0; i < tds.length; i++) {
// [Site Logic: Cnz]

// [Site Logic: Hdt]

// [Site Logic: Its]

// [Site Logic: HDOnly]

// [Site Logic: Hdoli]
        if (tds[i].textContent.match(/Category/)) {
// [Site Logic: Hdb]
// [Site Logic: Bit-Hdtv]
            raw_info.type = tds[i + 1].textContent.get_type();
            raw_info.medium_sel = tds[i + 1].textContent.medium_sel();
            if (raw_info.name.match(/COMPLETE.*?BLURAY/)) {
              raw_info.medium_sel = 'Blu-ray';
            }
          }
        }
      }

// [Site Logic: Torrentleech]

// [Site Logic: Hudbt]
        if (['行为', '小货车', '行為', '种子认领', '簡介', '简介', '操作', 'Action', 'Tagline', 'Tools:', '设备'].indexOf(tds[i].textContent.trim()) > -1 && origin_site != 'KG') {
          if (!is_inserted) {
// [Site Logic: Mtv]
// [Site Logic: Cg]
// [Site Logic: OurBits]
            is_inserted = true;
          }
        }
      }

      if (['副标题', '副標題', '副标题', 'Small Description'].indexOf(tds[i].textContent) > -1 && !raw_info.small_descr) {
// [Site Logic: Hudbt]
// [Site Logic: 影]
// [Site Logic: U2]
// [Site Logic: Filelist]
        }
      }
      if (['标题'].indexOf(tds[i].textContent) > -1 && !raw_info.name && origin_site == '影') {
        raw_info.name = tds[i].nextSibling.nextSibling.textContent;
      }

// [Site Logic: Cg]

// [Site Logic: Kg]

      //主要是类型、medium_sel、地区等等信息
      if (['基本信息', '详细信息', '类型', '基本資訊', '標籤列表：', '媒介：', 'Basic Info', '分类 / 制作组', '种子信息'].indexOf(tds[i].textContent) > -1) {
        if (i + 1 < tds.length) {
// [Site Logic: Hudbt]
// [Site Logic: 影]
            info_text = tds[i + 1].textContent;
          }
          if (info_text.source_sel()) {
            raw_info.source_sel = info_text.source_sel();
          }
          if (tds[i].innerHTML == '標籤列表：') {
            raw_info.music_type = tds[i + 1].textContent;
            raw_info.descr += '\n标签： ' + raw_info.music_type + '\n';
          } else if (tds[i].innerHTML == '媒介：') {
            raw_info.music_media = tds[i + 1].textContent;
          }

          if (tds[i].innerHTML == '基本資訊' && opencd_mode) {
            raw_info.music_type = tds[i + 1].textContent;
            raw_info.music_media = tds[i + 1].textContent;
          }
          if (info_text.get_type()) {
            raw_info.type = info_text.get_type();
          }
// [Site Logic: Ttg]
          if (info_text.medium_sel()) {
            raw_info.medium_sel = info_text.medium_sel();
          }
          if (info_text.codec_sel()) {
            raw_info.codec_sel = info_text.codec_sel();
          }
          if (info_text.audiocodec_sel()) {
            raw_info.audiocodec_sel = info_text.audiocodec_sel();
          }
// [Site Logic: Ttg]
          if (site_url.match(/music.php/)) {
            raw_info.music_media = tds[i + 1].textContent;
          }
        }
      }

// [Site Logic: Tjupt]
    }

// [Site Logic: U2]

// [Site Logic: Mteam]
    //------------------------------------国外站点简介单独处理，最后辅以豆瓣按钮----------------------------------------------

// [Site Logic: PTP]

// [Site Logic: Ant]

// [Site Logic: Sc]

// [Site Logic: HDOnly]

// [Site Logic: Gpw]

// [Site Logic: Hdb]

// [Site Logic: Red]

// [Site Logic: Hdf]

// [Site Logic: Uhd]

// [Site Logic: Cnz]

// [Site Logic: Hdt]
// [Site Logic: Mtv]
// [Site Logic: Hdt]
// [Site Logic: Kg]
// [Site Logic: Hdt]
// [Site Logic: Cg]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Tik]
// [Site Logic: Hdt]
// [Site Logic: Hdoli]
// [Site Logic: Hdt]
// [Site Logic: Torrentleech]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: Frds]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hdt]
// [Site Logic: Byr]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hhclub]
// [Site Logic: Hdt]
// [Site Logic: Hdarea]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hddolby]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 音乐]
// [Site Logic: Hdt]
// [Site Logic: U2]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Hdt]
// [Site Logic: 音乐]
// [Site Logic: Hdt]
// [Site Logic: HDOnly]
// [Site Logic: Hudbt]
// [Site Logic: Hdt]
// [Site Logic: Xthor]
// [Site Logic: Opencd]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdoli]
// [Site Logic: Mteam]
// [Site Logic: Xthor]
// [Site Logic: Mteam]
// [Site Logic: Fnp]
// [Site Logic: Mteam]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hhclub]
// [Site Logic: Hdspace]
// [Site Logic: Hdt]
// [Site Logic: Filelist]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Bib]
// [Site Logic: Hdt]
// [Site Logic: Filelist]
// [Site Logic: Hdt]
// [Site Logic: Cg]
// [Site Logic: Hdt]
// [Site Logic: Mam]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Gpw]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: Mtv]
// [Site Logic: Hdt]
// [Site Logic: Piggo]
// [Site Logic: Hhclub]
// [Site Logic: Tjupt]
// [Site Logic: Pter]
// [Site Logic: Opencd]
// [Site Logic: HDB]
// [Site Logic: Frds]
// [Site Logic: Audiences]
// [Site Logic: Bhd]
// [Site Logic: Hdb]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: 电影]
// [Site Logic: PTP]
// [Site Logic: Sc]
// [Site Logic: Tvv]
// [Site Logic: Cnz]
// [Site Logic: 纪录]
// [Site Logic: Cnz]
// [Site Logic: 电影]
// [Site Logic: Cnz]
// [Site Logic: Ant]
// [Site Logic: Gpw]
// [Site Logic: Kg]
// [Site Logic: Hdcity]
// [Site Logic: Btn]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Encode]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 软件]
// [Site Logic: Hdt]
// [Site Logic: Frds]
// [Site Logic: OurBits]
// [Site Logic: Frds]
// [Site Logic: Ptt]
// [Site Logic: OurBits]
// [Site Logic: HDOnly]
// [Site Logic: Hdt]
// [Site Logic: Gpw]
// [Site Logic: Hdt]
// [Site Logic: Gpw]
// [Site Logic: Hdt]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: HDOnly]
// [Site Logic: Cmct]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 电影]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Tjupt]
// [Site Logic: Hdt]
// [Site Logic: Dicmusic]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hudbt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: H264]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hudbt]
// [Site Logic: Hdt]
// [Site Logic: 纪录]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Sugoimusic]
// [Site Logic: Hdt]
// [Site Logic: Opencd]
// [Site Logic: Hdt]
// [Site Logic: Ops]
// [Site Logic: Hdt]
// [Site Logic: Red]
// [Site Logic: Flac]
// [Site Logic: Red]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Gpw]
// [Site Logic: Xthor]
// [Site Logic: Gpw]
// [Site Logic: Hdt]
// [Site Logic: Darkland]
// [Site Logic: Cmct]
// [Site Logic: Darkland]
// [Site Logic: Hdt]
// [Site Logic: Ubits]
// [Site Logic: Hdt]
// [Site Logic: Kufei]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: Hddolby]
// [Site Logic: Hdt]
// [Site Logic: Btschool]
// [Site Logic: Hdt]
// [Site Logic: Tjupt]
// [Site Logic: Hdt]
// [Site Logic: Agsv]
// [Site Logic: Hdt]
// [Site Logic: Fnp]
// [Site Logic: Audiences]
// [Site Logic: Fnp]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: Lemonhd]
// [Site Logic: Hddolby]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: Hddolby]
// [Site Logic: 财神]
// [Site Logic: Hdt]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Hdt]
// [Site Logic: Njtupt]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: HDHome]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: Dts-X]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: Mv]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 电影]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: 游戏]
// [Site Logic: Hdt]
// [Site Logic: 游戏]
// [Site Logic: 学习]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: Mv]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 8K]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Mv]
// [Site Logic: 音乐]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdroute]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Hdspace]
// [Site Logic: Fnp]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: HDB]
// [Site Logic: Hdcity]
// [Site Logic: Bhd]
// [Site Logic: Fnp]
// [Site Logic: Tik]
// [Site Logic: Xthor]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: 剧集]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: 影]
// [Site Logic: 4K]
// [Site Logic: 影]
// [Site Logic: 4K]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: ZHUQUE]
// [Site Logic: Blu-Ray]
// [Site Logic: ZHUQUE]
// [Site Logic: Hdt]
// [Site Logic: Yemapt]
// [Site Logic: Uhd]
// [Site Logic: Yemapt]
// [Site Logic: Uhd]
// [Site Logic: Yemapt]
// [Site Logic: 欧美]
// [Site Logic: Yemapt]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: Dvd]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: Uhd]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Hdt]
// [Site Logic: HDHome]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: HDHome]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: HDHome]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: HDHome]
// [Site Logic: Uhd]
// [Site Logic: Encode]
// [Site Logic: HDHome]
// [Site Logic: Hdt]
// [Site Logic: H264]
// [Site Logic: H265]
// [Site Logic: Hdt]
// [Site Logic: HDB]
// [Site Logic: Hdt]
// [Site Logic: Hudbt]
// [Site Logic: Hdt]
// [Site Logic: Nanyang]
// [Site Logic: Hdt]
// [Site Logic: Putao]
// [Site Logic: 欧美]
// [Site Logic: Putao]
// [Site Logic: 印度]
// [Site Logic: Putao]
// [Site Logic: Hdt]
// [Site Logic: Tlfbits]
// [Site Logic: Hdt]
// [Site Logic: Hddolby]
// [Site Logic: 剧集]
// [Site Logic: Hddolby]
// [Site Logic: 剧集]
// [Site Logic: Hddolby]
// [Site Logic: 剧集]
// [Site Logic: Hddolby]
// [Site Logic: Hdt]
// [Site Logic: Itzmx]
// [Site Logic: Hdt]
// [Site Logic: Hdtime]
// [Site Logic: Blu-Ray]
// [Site Logic: Hdtime]
// [Site Logic: Hdt]
// [Site Logic: Hdarea]
// [Site Logic: Uhd]
// [Site Logic: Blu-Ray]
// [Site Logic: Hdarea]
// [Site Logic: Dvd]
// [Site Logic: Hdarea]
// [Site Logic: 4K]
// [Site Logic: Hdarea]
// [Site Logic: 720P]
// [Site Logic: Hdarea]
// [Site Logic: H264]
// [Site Logic: Hdarea]
// [Site Logic: Ac3]
// [Site Logic: Hdarea]
// [Site Logic: Hdt]
// [Site Logic: Btschool]
// [Site Logic: Hdt]
// [Site Logic: Tjupt]
// [Site Logic: 剧集]
// [Site Logic: Tjupt]
// [Site Logic: 纪录]
// [Site Logic: 1080I]
// [Site Logic: 纪录]
// [Site Logic: Tjupt]
// [Site Logic: Hdt]
// [Site Logic: Nexushd]
// [Site Logic: Hdt]
// [Site Logic: 电影]
// [Site Logic: 港台]
// [Site Logic: 欧美]
// [Site Logic: 日韩]
// [Site Logic: 电影]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Byr]
// [Site Logic: Hdt]
// [Site Logic: Tccf]
// [Site Logic: Hdt]
// [Site Logic: Ptsbao]
// [Site Logic: 720P]
// [Site Logic: 4K]
// [Site Logic: Ptsbao]
// [Site Logic: 720P]
// [Site Logic: 4K]
// [Site Logic: Ptsbao]
// [Site Logic: Uhd]
// [Site Logic: Encode]
// [Site Logic: Ptsbao]
// [Site Logic: Hdt]
// [Site Logic: Haidan]
// [Site Logic: 剧集]
// [Site Logic: Haidan]
// [Site Logic: Hdt]
// [Site Logic: Hdfans]
// [Site Logic: 4K]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Hdfans]
// [Site Logic: 欧美]
// [Site Logic: Hdfans]
// [Site Logic: Hdt]
// [Site Logic: Cyanbug]
// [Site Logic: Hdt]
// [Site Logic: Ptchina]
// [Site Logic: 4K]
// [Site Logic: Ptchina]
// [Site Logic: 1080I]
// [Site Logic: Ptchina]
// [Site Logic: Ac3]
// [Site Logic: Ptchina]
// [Site Logic: 欧美]
// [Site Logic: Ptchina]
// [Site Logic: Hdt]
// [Site Logic: Hdroute]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Uhd]
// [Site Logic: Bhd]
// [Site Logic: Uhd]
// [Site Logic: Bhd]
// [Site Logic: 剧集]
// [Site Logic: Bhd]
// [Site Logic: 剧集]
// [Site Logic: Bhd]
// [Site Logic: 剧集]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Hdu]
// [Site Logic: 剧集]
// [Site Logic: 4K]
// [Site Logic: 剧集]
// [Site Logic: Hdu]
// [Site Logic: 剧集]
// [Site Logic: Hdu]
// [Site Logic: 剧集]
// [Site Logic: Hdu]
// [Site Logic: Hdt]
// [Site Logic: Dragon]
// [Site Logic: Hdt]
// [Site Logic: Ultrahd]
// [Site Logic: Hdt]
// [Site Logic: 52Pt]
// [Site Logic: Hdt]
// [Site Logic: Ydy]
// [Site Logic: Uhd]
// [Site Logic: Ydy]
// [Site Logic: 剧集]
// [Site Logic: Ydy]
// [Site Logic: Hdt]
// [Site Logic: Soulvoice]
// [Site Logic: Encode]
// [Site Logic: Soulvoice]
// [Site Logic: Flac]
// [Site Logic: 音乐]
// [Site Logic: Soulvoice]
// [Site Logic: Hdt]
// [Site Logic: Okpt]
// [Site Logic: Uhd]
// [Site Logic: Blu-Ray]
// [Site Logic: Okpt]
// [Site Logic: Hdtv]
// [Site Logic: Dvd]
// [Site Logic: Cd]
// [Site Logic: Okpt]
// [Site Logic: Mteam]
// [Site Logic: Okpt]
// [Site Logic: Hdt]
// [Site Logic: Discfan]
// [Site Logic: Hdt]
// [Site Logic: Piggo]
// [Site Logic: Hdt]
// [Site Logic: Rousi]
// [Site Logic: Hdt]
// [Site Logic: 财神]
// [Site Logic: 下水道]
// [Site Logic: Hdt]
// [Site Logic: 唐门]
// [Site Logic: Hdt]
// [Site Logic: Zmpt]
// [Site Logic: Hdt]
// [Site Logic: Icc]
// [Site Logic: Hdt]
// [Site Logic: 海棠]
// [Site Logic: Hdt]
// [Site Logic: 麒麟]
// [Site Logic: Hdt]
// [Site Logic: Carpt]
// [Site Logic: Hdt]
// [Site Logic: Joyhd]
// [Site Logic: Hdt]
// [Site Logic: Crabpt]
// [Site Logic: Uhd]
// [Site Logic: Blu-Ray]
// [Site Logic: Crabpt]
// [Site Logic: Encode]
// [Site Logic: Crabpt]
// [Site Logic: Hdtv]
// [Site Logic: Cd]
// [Site Logic: Crabpt]
// [Site Logic: Hdt]
// [Site Logic: Qingwa]
// [Site Logic: Hdt]
// [Site Logic: 52Movie]
// [Site Logic: Hdt]
// [Site Logic: Ptfans]
// [Site Logic: Hdt]
// [Site Logic: Ptzone]
// [Site Logic: Hdt]
// [Site Logic: 雨]
// [Site Logic: Hdt]
// [Site Logic: Njtupt]
// [Site Logic: Hdt]
// [Site Logic: 纪录]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Hdt]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 1080I]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 1080I]
// [Site Logic: Fnp]
// [Site Logic: Hdt]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: 剧集]
// [Site Logic: Uhd]
// [Site Logic: 剧集]
// [Site Logic: Uhd]
// [Site Logic: Hdt]
// [Site Logic: Hdspace]
// [Site Logic: Uhd]
// [Site Logic: Hdspace]
// [Site Logic: Dvd]
// [Site Logic: Encode]
// [Site Logic: 纪录]
// [Site Logic: Encode]
// [Site Logic: 剧集]
// [Site Logic: Encode]
// [Site Logic: Hdspace]
// [Site Logic: Hdt]
// [Site Logic: Hdb]
// [Site Logic: Uhd]
// [Site Logic: Hdb]
// [Site Logic: Hdt]
// [Site Logic: 1Ptba]
// [Site Logic: Uhd]
// [Site Logic: 1Ptba]
// [Site Logic: Hdt]
// [Site Logic: Aling]
// [Site Logic: Hdt]
// [Site Logic: Longpt]
// [Site Logic: Hdt]
// [Site Logic: 柠檬不甜]
// [Site Logic: Hdt]
// [Site Logic: Railgunpt]
// [Site Logic: Hdt]
// [Site Logic: Mypt]
// [Site Logic: Hdt]
// [Site Logic: 13City]
// [Site Logic: Hdt]
// [Site Logic: Lajidui]
// [Site Logic: Encode]
// [Site Logic: Lajidui]
// [Site Logic: Hdt]
// [Site Logic: Hdvideo]
// [Site Logic: Hdt]
// [Site Logic: Ubits]
// [Site Logic: Hdt]
// [Site Logic: Panda]
// [Site Logic: Hdt]
// [Site Logic: Lemonhd]
// [Site Logic: Hdt]
// [Site Logic: Cdfile]
// [Site Logic: Hdt]
// [Site Logic: Afun]
// [Site Logic: Hdt]
// [Site Logic: 星陨阁]
// [Site Logic: Hdt]
// [Site Logic: Devtracker]
// [Site Logic: Hdt]
// [Site Logic: 樱花]
// [Site Logic: Hdt]
// [Site Logic: 我好闲]
// [Site Logic: 4K]
// [Site Logic: 我好闲]
// [Site Logic: Hdt]
// [Site Logic: Freefarm]
// [Site Logic: 学习]
// [Site Logic: 游戏]
// [Site Logic: Freefarm]
// [Site Logic: Hdt]
// [Site Logic: Kufei]
// [Site Logic: Hdt]
// [Site Logic: Wt-Sakura]
// [Site Logic: 剧集]
// [Site Logic: Wt-Sakura]
// [Site Logic: Hdt]
// [Site Logic: Hitpt]
// [Site Logic: Hdt]
// [Site Logic: Ptt]
// [Site Logic: Hdt]
// [Site Logic: 720P]
// [Site Logic: 电影]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: Uhd]
// [Site Logic: PTP]
// [Site Logic: Hdt]
// [Site Logic: Sc]
// [Site Logic: Hdt]
// [Site Logic: Mtv]
// [Site Logic: Hdt]
// [Site Logic: Torrents.Php]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Hdt]
// [Site Logic: Sd]
// [Site Logic: Hdt]
// [Site Logic: Sd]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: 纪录]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: Hdt]
// [Site Logic: Nbl]
// [Site Logic: Hdt]
// [Site Logic: Ant]
// [Site Logic: 剧集]
// [Site Logic: Ant]
// [Site Logic: Hdt]
// [Site Logic: Cnz]
// [Site Logic: 纪录]
// [Site Logic: Cnz]
// [Site Logic: Hdt]
// [Site Logic: Tvv]
// [Site Logic: Torrents.Php]
// [Site Logic: Tvv]
// [Site Logic: Hdt]
// [Site Logic: Xthor]
// [Site Logic: 剧集]
// [Site Logic: Xthor]
// [Site Logic: Hdt]
// [Site Logic: Hdf]
// [Site Logic: 剧集]
// [Site Logic: 纪录]
// [Site Logic: Hdf]
// [Site Logic: Hdt]
// [Site Logic: Cg]
// [Site Logic: Uhd]
// [Site Logic: Cg]
// [Site Logic: Hdt]
// [Site Logic: Rs]
// [Site Logic: Hdt]
// [Site Logic: Gtk]
// [Site Logic: Hdt]
// [Site Logic: Agsv]
// [Site Logic: Hdt]
// [Site Logic: Ptskit]
// [Site Logic: Hdt]
// [Site Logic: March]
// [Site Logic: Hdt]
// [Site Logic: Novahd]
// [Site Logic: Hdt]
// [Site Logic: 躺平]
// [Site Logic: Hdt]
// [Site Logic: Baozi]
// [Site Logic: Hdt]
// [Site Logic: Luckpt]
// [Site Logic: Hdt]
// [Site Logic: 未来幻境]
// [Site Logic: Hdt]
// [Site Logic: 自然]
// [Site Logic: Hdt]
// [Site Logic: Sbpt]
// [Site Logic: 4K]
// [Site Logic: Sbpt]
// [Site Logic: Hdt]
// [Site Logic: 慕雪阁]
// [Site Logic: Hdt]
// [Site Logic: 天枢]
// [Site Logic: 4K]
// [Site Logic: 天枢]
// [Site Logic: Hdt]
// [Site Logic: Yhpp]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Yhpp]
// [Site Logic: 欧美]
// [Site Logic: Yhpp]
// [Site Logic: Hdt]
// [Site Logic: 好学]
// [Site Logic: Hdt]
// [Site Logic: Tokyo]
// [Site Logic: 藏宝阁]
// [Site Logic: Ecust]
// [Site Logic: Hdt]
// [Site Logic: Atmos]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Dvd]
// [Site Logic: Hdt]
// [Site Logic: H264]
// [Site Logic: X265]
// [Site Logic: Hdt]
// [Site Logic: Hdtv]
// [Site Logic: Hdt]
// [Site Logic: Blu-Ray]
// [Site Logic: Hdt]
// [Site Logic: 720P]
// [Site Logic: Hdt]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: Omg]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: Hdt]
      return;
    }
  }
}

// [Site Logic: ZHUQUE]
// [Site Logic: Mteam]
  setTimeout(auto_feed, sleep_time);

}