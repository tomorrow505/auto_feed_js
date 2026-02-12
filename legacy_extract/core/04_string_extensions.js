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
