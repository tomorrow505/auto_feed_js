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