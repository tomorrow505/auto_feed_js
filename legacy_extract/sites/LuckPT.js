/** Consolidated Logic for: LuckPT **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
else if (forward_site == '财神' || forward_site == 'LuckPT' || forward_site == 'MTeam') {
            get_full_size_picture_urls(null, infos.pic_info, $('#not'), true, function (img_info) {
              raw_info.descr += img_info.trim();
            }, function (data) {
              for (i = 0; i < data.length; i++) {
                if (data[i]) {
                  raw_info.descr = raw_info.descr.replace(data[i], '');
                }
              }
            });
          }

// --- From Module: 18_forward_site_filling2.js (Snippet 2) ---
case 'LuckPT':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.en) { check_label(document.getElementsByName('tags[4][]'), '22'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[4][]'), '14'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.hdr10) { check_label(document.getElementsByName('tags[4][]'), '19'); }
          if (labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '18'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '20'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '10'); }
          if (raw_info.name.match(/S\d{1,3}.?E\d{1,5}/) || raw_info.small_descr.match(/第\d{1,5}(.\d{1,5})?集/)) {
            check_label(document.getElementsByName('tags[4][]'), '9');
          }
          if (raw_info.small_descr.match(/特效字幕/)) {
            check_label(document.getElementsByName('tags[4][]'), '16');
          }
          break;

// --- From Module: 22_additional_handlers2.js (Snippet 3) ---
else if (forward_site == 'LuckPT') {
      //类型
      var browsecat = $('#browsecat')
      var type_dict = { '电影': 401, '剧集': 402, '动漫': 405, '综艺': 410, '音乐': 408, '纪录': 411, '体育': 412, 'MV': 406, '游戏': 409, '学习': 409, '软件': 409, '短剧': 409, '': 409 };
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }

      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(13);
      switch (raw_info.medium_sel) {
        case 'Blu-ray': medium_box.val(1); break;
        case 'UHD': medium_box.val(10); break;
        case 'Remux': medium_box.val(3); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(11); break;
        case 'HDTV': medium_box.val(5); break;
        case 'DVD': medium_box.val(6); break;
        case 'CD': medium_box.val(8); break;
        case 'MiniBD': medium_box.val(4); break;
      }
      if (raw_info.name.match(/dvdrip/i)) {
        medium_box.val(7);
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H264': codec_box.val(1); break;
        case 'H265': codec_box.val(6); break;
        case 'X264': codec_box.val(1); break;
        case 'X265': codec_box.val(6); break;
        case 'VC-1': codec_box.val(3); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'MPEG-4': codec_box.val(12); break;
        case 'AV1': codec_box.val(2); break;
        case 'XVID': codec_box.val(12);
      }
      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(7);
      switch (raw_info.audiocodec_sel) {
        case 'AAC': audiocodec_box.val(6); break;
        case 'APE': audiocodec_box.val(2); break;
        case 'AC3':
          audiocodec_box.val(8);
          if (raw_info.name.match(/DD[P\+]/)) {
            audiocodec_box.val(12);
          }
          break;
        case 'LPCM': audiocodec_box.val(13); break;
        case 'TrueHD': audiocodec_box.val(14); break;
        case 'Atmos':
          audiocodec_box.val(11);
          if (raw_info.name.match(/DD[\+P]/i)) {
            audiocodec_box.val(12);
          }
          break;
        case 'DTS:X': audiocodec_box.val(15); break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(16); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'M4A': audiocodec_box.val(17); break;
        case 'WAV': audiocodec_box.val(18); break;
        case 'MP3': audiocodec_box.val(4); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'OGG': audiocodec_box.val(5); break;
      }
      //分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '8K': 7, '4K': 6, '2K': 5, '1080p': 1, '1080i': 1, '720p': 3, '720i': 3, '576p': 8, '480p': 4, '480i': 4, 'SD': 8, '': 8 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');

      var img_urls = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
      try {
        var _index = raw_info.descr.indexOf("◎");
      } catch (err) {
        _index = -1;
      }
      console.log(raw_info.descr);
      for (i = 0; i < img_urls.length; i++) {
        if (raw_info && raw_info.descr.indexOf(img_urls[i]) < 80 || (_index > 0 && raw_info.descr.indexOf(img_urls[i]) < _index)) {
          continue;
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
        img_info = `[img]${item}[/img]`;
        raw_info.descr = raw_info.descr.replace(img_urls[i], img_info);
      }
      $('#descr').val(raw_info.descr);
    }

