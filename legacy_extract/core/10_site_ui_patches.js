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