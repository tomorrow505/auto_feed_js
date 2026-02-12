/** Consolidated Logic for: HDRoute **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (origin_site == 'HDRoute') {
      raw_info.torrent_name = $('.details-title-eng').text().trim().replace(/ /g, '.') + '.torrent';
      raw_info.torrent_url = 'http://hdroute.org/' + $('.buttonDownload').attr('onclick').match(/download.*id=\d+/)[0];
    }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'HDRoute') {
      var hdroute = GM_getResourceText("hdroute");
      if (hdroute !== null) {
        eval(hdroute);
      } else {
        throw new Error('error');
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
if (origin_site == 'HDHome' || origin_site == 'MTeam' || origin_site == 'HDRoute' || origin_site == 'OurBits') {
      raw_info.small_descr = raw_info.small_descr.replace(/【|】/g, " ");
      raw_info.small_descr = raw_info.small_descr.replace(/diy/i, "【DIY】");

      //DIY图文换序兼顾圆盘补quote
      var img_info = '';
      if (raw_info.name.match(/DIY/i)) {
        var img_urls = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
        try {
          for (i = 0; i < img_urls.length; i++) {
            if (raw_info.descr.indexOf(img_urls[i]) < 10) {
            } else {
              raw_info.descr = raw_info.descr.replace(img_urls[i], '');
              img_info += img_urls[i].match(/\[img\].*?\[\/img\]/)[0];
            }
          }
        } catch (Err) { }
      }

      raw_info.descr = raw_info.descr.replace(/\n{3,10}/g, '\n\n');

      //圆盘补quote
      var tem_str = "";
      if (raw_info.descr.match(/DISC.INFO/i)) {
        var disc_info = raw_info.descr.match(/.*?DISC.INFO/i)[0];
        tem_str = raw_info.descr.slice(raw_info.descr.indexOf(disc_info) - 10, raw_info.descr.length);
        if (!tem_str.match(/quote/i)) {
          var img_urls = tem_str.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
          var t_img_info = '';
          try {
            for (i = 0; i < img_urls.length; i++) {
              raw_info.descr = raw_info.descr.replace(img_urls[i], '');
              t_img_info += img_urls[i].match(/\[img\].*?\[\/img\]/)[0];
            }
          } catch (err) { }
          raw_info.descr = raw_info.descr.replace(disc_info, `[img]https://images2.imgbox.com/04/6b/Ggp5ReQb_o.png[/img]\n\n[quote]\r${disc_info}`);
          raw_info.descr = raw_info.descr.trim() + "\r" + "[/quote]\n" + t_img_info;
        }
      }
      raw_info.descr = raw_info.descr + '\n\n' + img_info;

      if (raw_info.descr.match(/^(\[img\].*?\[\/img\])\s*(\[quote\][\s\S]*?\[\/quote\])/)) {
        raw_info.descr = raw_info.descr.replace(/^(\[img\].*?\[\/img\])\s*(\[quote\][\s\S]*?\[\/quote\])/, '$2\n\n$1');
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
if (origin_site == 'xthor' || origin_site == 'FileList' || origin_site == 'HDB' || origin_site == 'HDRoute') {
        forward_l.style.width = '80px'; forward_r.style.paddingTop = '10px';
        forward_r.style.paddingBottom = '10px'; forward_r.style.paddingLeft = '12px';
        if (origin_site == 'HDB') {
          forward_l.style.paddingRight = '12px'; forward_r.style.paddingBottom = '12px';
          forward_r.style.borderTop = 'none'; forward_r.style.borderBottom = 'none';
          forward_r.style.borderRight = 'none'; forward_l.style.border = 'none';
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 5) ---
case 'HDRoute':
          if (labels.gy) { document.getElementsByName('is_mandrain')[0].checked = true; }
          if (labels.yy) { document.getElementsByName('is_cantonese')[0].checked = true; }
          if (labels.diy) { document.getElementsByName('is_diyed')[0].checked = true; }
          break;

// --- From Module: 18_forward_site_filling2.js (Snippet 6) ---
else if (forward_site == 'HDRoute') {
      document.getElementsByName('is_anonymous')[0].checked = if_uplver;
    }

// --- From Module: 19_forward_site_filling3.js (Snippet 7) ---
else if (forward_site == 'HDRoute') {
      var title_chs = document.getElementById('title_chs');
      try {
        var chs_name = raw_info.descr.match(/(译|片)\s*?名[^\r\n]*/g);
        chs_name.map((e) => {
          var name = e.split(/(译|片).*?名/).pop().split('/')[0].trim();
          if (/.*[\u4e00-\u9fa5]+.*/.test(name) && name.trim() != '') {
            if (!title_chs.value) {
              title_chs.value = name;
            }
          }
        })
      } catch (err) { }
      if (!title_chs.value) {
        title_chs.value = raw_info.small_descr.split('/', 1)[0].trim();
      }

      $('input[name=title_sub]').val(raw_info.small_descr);

      var tmp_descr = raw_info.descr;
      var standard_dou = true;
      try {
        var list_str = tmp_descr.split(/◎/);
        if (list_str.length > 1) {
          list_str.splice(0, 1)
          var str = '◎' + list_str.join('◎');
          $('div.upload-title-name:contains(资源描述)').last().append(` <a href="#" style="text-decoration : none" id="copy_intro">=>复制描述</a><font color="red"> 提示：如果描述填写失败请复制之后转换源码手动填写再预览。</font>`);
          $('#copy_intro').click((e) => {
            e.preventDefault();
            GM_setClipboard(str);
            $('#copy_intro').text("=>复制成功");
          });
          descr_box[0].value = str;
        } else {
          standard_dou = false;
        }
      } catch (Err) {
        standard_dou = false;
      }
      if (!standard_dou) {
        var index = 90;
        while (tmp_descr.indexOf('[img]') < index && tmp_descr.indexOf('[img]') > -1) {
          tmp_descr = tmp_descr.substring(tmp_descr.indexOf('[/img]\n') + 7).trim();
        }
        $('div.upload-title-name:contains(资源描述)').last().append(` <a href="#" style="text-decoration : none" id="copy_intro">=>复制描述</a><font color="red"> 提示：如果描述填写失败请复制之后转换源码手动填写再预览。</font>`);
        $('#copy_intro').click((e) => {
          e.preventDefault();
          GM_setClipboard(tmp_descr);
          $('#copy_intro').text("=>复制成功");
        });
        descr_box[0].value = tmp_descr;
      }

      if (raw_info.small_descr.match(/【(.*?版原盘)】/)) {
        $('input[name=title_one_sentence]').val(raw_info.small_descr.match(/【(.*?版原盘)】/)[1]);
      } else if (raw_info.small_descr.match(/.版原盘/)) {
        $('input[name=title_one_sentence]').val(raw_info.small_descr.match(/.版原盘/)[0]);
      }

      var type_category = document.getElementById('type_category');
      var type_dict = {
        '电影': 1, '剧集': 3, '动漫': 4, '综艺': 9, '音乐': 8, '纪录': 2,
        '体育': 6, '软件': 9, '学习': 9
      };
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        type_category.options[index].selected = true;
      }

      var type_audio = document.getElementById('type_audio');
      var audiocodec_dict = {
        'TrueHD': 3, 'Atmos': 3, 'DTS': 4, 'DTS-HD': 2, 'DTS-HDMA': 2, 'DTS-HDMA:X 7.1': 2,
        'AC3': 5, 'LPCM': 1, 'Flac': 7, 'MP3': 6, 'AAC': 9, 'APE': 6, '': 8
      };
      if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
        var index = audiocodec_dict[raw_info.audiocodec_sel];
        type_audio.options[index].selected = true;
      }

      var codec_box = document.getElementById('type_codec');
      codec_box.options[5].selected = true;
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': codec_box.options[1].selected = true; break;
        case 'H265': case 'X265': codec_box.options[7].selected = true; break;
        case 'VC-1': codec_box.options[2].selected = true; break;
        case 'MPEG-2': codec_box.options[3].selected = true; break;
        case 'XVID': codec_box.options[4].selected = true;
      }

      var medium_box = document.getElementById('type_medium');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.options[1].selected = true; break;
        case 'Blu-ray': medium_box.options[1].selected = true; break;
        case 'DVD': medium_box.options[6].selected = true; break;
        case 'Remux': medium_box.options[2].selected = true; break;
        case 'HDTV': medium_box.options[3].selected = true; break;
        case 'WEB-DL': medium_box.options[6].selected = true; break;
        case 'Encode': medium_box.options[4].selected = true; break;
        case 'CD': medium_box.options[5].selected = true; break;
        default: medium_box.options[6].selected = true;
      }

      var standard_box = document.getElementById('type_resolution');
      var standard_dict = { '4K': 5, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '': 4 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }

      //英文标题
      var title_eng = document.getElementById('title_eng');
      title_eng.value = raw_info.name;

      //简介
      var upload_introduction = document.getElementById('upload_introduction');
      if (raw_info.descr.match(/简[\s]*?介[\s\S]+?\[quote\]/)) {
        var introduction = raw_info.descr.match(/简[\s]*?介([\s\S]+?)\[quote\]/i)[1].trim();
        if (introduction.match(/◎获奖情况|\[size=3\]\[color=#ff0000\]/)) {
          introduction = introduction.split(/◎获奖情况|\[size=3\]\[color=#ff0000\]/)[0].trim();
        }
        introduction = introduction.replace(/\[.*\]/g, '');
        upload_introduction.value = '　　' + introduction;
      }

      //大海报
      var poster_big = document.getElementsByName('poster_big')[0];
      if (raw_info.descr.match(/\[img\](\S*?)\[\/img\]/i)) {
        poster_big.value = raw_info.descr.match(/\[img\](\S*?)\[\/img\]/i)[1];
        $('input[name="poster"]').val(raw_info.descr.match(/\[img\](\S*?)\[\/img\]/i)[1]);
      }

      //imdb得分及其编号
      var upload_imdb = document.getElementById('upload-imdb');
      if (raw_info.descr.match(/IMDb评分.*?(\d+\.?\d?)\/10/)) {
        upload_imdb.value = raw_info.descr.match(/IMDb评分.*?(\d+\.?\d?)\/10/)[1].trim();
      } else {
        if (raw_info.url) {
          try {
            getIMDbScore(raw_info.url.match(/tt(\d+)/)[1]).then((data) => {
              if (data.rating) {
                upload_imdb.value = data.rating;
              } else {
                upload_imdb.value = 'NaN';
              }
            });
          } catch (err) { }
        }
      }
      var upload_imdb_url = document.getElementById('upload-imdb_url');
      if (raw_info.url) {
        upload_imdb_url.value = raw_info.url.match(/tt(\d+)/i)[1];
      }

      if (raw_info.url || raw_info.dburl) {
        function add_href(data) {
          $('#get_douban').text("=>获取成功");
          $('span.upload-title-hint:contains(电影名)').last().after(`<a style="text-decoration : none" href="#" id="get_name">=>替换名称</a><font color="red"> 提示：如果名称出错点击此处替换。</font>`);
          $('#get_name').click((e) => {
            e.preventDefault();
            $('input[name="title_chs"]').val(data.data.title);
            $('#get_name').text("=>替换成功");
          });
          $('span.upload-title-hint:contains(该处)').last().after(`<a style="text-decoration : none" href="#" id="get_intro">=>替换简介</a><font color="red"> 提示：如果简介出错点击此处替换。</font>`);
          $('#get_intro').click((e) => {
            e.preventDefault();
            upload_introduction.value = '　　' + data.data.summary.replace(/\n/g, '\n　　');
            $('#get_intro').text("=>替换成功");
          });
          $('span.upload-title-hint:contains(禁止)').last().after(`<a style="text-decoration : none" href="#" id="get_poster">=>替换海报</a><font color="red"> 提示：如果海报出错点击此处替换。</font>`);
          $('#get_poster').click((e) => {
            e.preventDefault();
            $('input[name="poster"]').val(data.data.image.match(/https.*?(png|jpg|webp)/i)[0]);
            $('input[name="poster_big"]').val(data.data.image.match(/https.*?(png|jpg|webp)/i)[0]);
            $('#get_poster').text("=>替换成功");
          });
          if (!raw_info.url && data.data.imdb) {
            upload_imdb_url.value = data.data.imdb.match(/tt(\d+)/i)[1];
            getIMDbScore(data.data.imdb.match(/tt(\d+)/)[1]).then((data) => {
              if (data.rating) {
                upload_imdb.value = data.rating;
              } else {
                upload_imdb.value = 'NaN';
              }
            });
          }
        }
        $('div.optionalPartTitle').after(`<div style="padding-bottom:5px; padding-top:5px"><b><span>#获取豆瓣:</span><a style="text-decoration : none" href="#" id="get_douban">=>点击获取</a><font color="red"> 提示：如果页面简介或海报填写有误差可以获取豆瓣信息后替换对应信息。</font></b></div>`)
        $('#get_douban').click((e) => {
          e.preventDefault();
          if (raw_info.dburl) {
            getDataFromDou(raw_info.dburl, function (data) {
              console.log(data);
              add_href(data);
            });
          } else if (raw_info.url) {
            getData(raw_info.url, function (data) {
              add_href(data);
            });
          }
        });
      }
    }

