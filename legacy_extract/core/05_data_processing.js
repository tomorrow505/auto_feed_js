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
