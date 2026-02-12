/** Consolidated Logic for: BTSchool **/

// --- From Module: 12_site_ui_helpers.js (Snippet 1) ---
if (used_signin_sites.indexOf('BTSchool') > -1) {
        var signin_url = used_site_info['BTSchool'].url + 'index.php?action=addbonus';
        getDoc(signin_url, null, function (doc) {
          if ($('#nav_block', doc).length) {
            if ($('font:contains("今天签到您获得"):last', doc).length) {
              console.log(`开始签到BTSchool：`, $('font:contains("今天签到您获得"):last', doc).text().trim());
            } else {
              console.log(`开始签到BTSchool：`, '重复签到！！');
            }
            $(`input[kname=BTSchool]`).parent().find('a').css({ "color": "red" });
          } else {
            console.log(`开始签到BTSchool：`, '失败！！！');
            $(`input[kname=BTSchool]`).parent().find('a').css({ "color": "blue" });
          }
        })
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 2) ---
if (forward_site == 'BTSchool' && allinput[i].name == 'imdbid' && raw_info.url) {
        allinput[i].value = raw_info.url.match(/tt\d+/i)[0];
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
if (forward_site == 'BTSchool' && allinput[i].name == 'doubanid' && raw_info.dburl) {
        allinput[i].value = raw_info.dburl.match(/\d+/i)[0];
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 4) ---
case 'BTSchool':
          if (labels.gy) { document.getElementsByName('span[]')[4].checked = true; }
          if (labels.yy) { document.getElementsByName('span[]')[4].checked = true; }
          if (labels.zz) { document.getElementsByName('span[]')[5].checked = true; }
          break;

// --- From Module: 19_forward_site_filling3.js (Snippet 5) ---
else if (forward_site == 'BTSchool') {
      //类型
      var browsecat = document.getElementsByName('type')[0];
      var type_dict = {
        '电影': 1, '剧集': 2, '动漫': 3, '纪录': 4, '综艺': 5, '软件': 6,
        '学习': 7, '游戏': 8, '音乐': 9, '体育': 10, '': 11
      };
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.options[index].selected = true;
      }

      //媒介
      var medium_box = document.getElementsByName('medium_sel')[0];
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.options[2].selected = true; break;
        case 'Blu-ray': medium_box.options[1].selected = true; break;
        case 'DVD': medium_box.options[7].selected = true; break;
        case 'Remux': medium_box.options[5].selected = true; break;
        case 'HDTV': medium_box.options[6].selected = true; break;
        case 'WEB-DL': medium_box.options[4].selected = true; break;
        case 'Encode': medium_box.options[3].selected = true; break;
        case 'CD': medium_box.options[8].selected = true;
      }

      //视频编码
      var codec_box = document.getElementsByName('codec_sel')[0];
      codec_box.options[6].selected = true;
      switch (raw_info.codec_sel) {
        case 'H264': case 'MPEG-4': case 'X264': codec_box.options[1].selected = true; break;
        case 'H265': case 'X265': codec_box.options[2].selected = true; break;
        case 'VC-1': codec_box.options[4].selected = true; break;
        case 'MPEG-2': codec_box.options[3].selected = true; break;
        case 'XVID': codec_box.options[5].selected = true;
      }

      //音频编码
      var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
      var audiocodec_dict = {
        'TrueHD': 1, 'Atmos': 1, 'DTS': 2, 'DTS-HD': 2, 'DTS-HDMA': 2, 'DTS-HDMA:X 7.1': 2, 'DTS-HDHR': 2,
        'AC3': 3, 'LPCM': 4, 'Flac': 5, 'MP3': 6, 'AAC': 7, 'APE': 8, '': 9
      };
      if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
        var index = audiocodec_dict[raw_info.audiocodec_sel];
        audiocodec_box.options[index].selected = true;
      }

      //分辨率
      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = { '4K': 1, '1080p': 2, '1080i': 2, '720p': 3, 'SD': 4, '': 5 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
      $(`select[name="team_sel"]>option:eq(12)`).attr('selected', true);
      check_team(raw_info, 'team_sel');
    }

