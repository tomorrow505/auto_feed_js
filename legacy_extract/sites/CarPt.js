/** Consolidated Logic for: CarPt **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
case "CarPt":
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          break;

// --- From Module: 20_forward_site_filling4.js (Snippet 2) ---
else if (forward_site == 'CarPt') {
      //类型
      var browsecat = $('#browsecat')
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 403, '综艺': 405, '音乐': 406, '纪录': 404,
        '体育': 407, '软件': 407, '学习': 407, '': 407, '游戏': 407, 'MV': 406
      };
      browsecat.val(407);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(8); break;
        case 'Blu-ray': medium_box.val(7); break;
        case 'DVD':
          medium_box.val(4);
          if (raw_info.name.match(/DVDr/i)) {
            medium_box.val(4);
          }
          break;
        case 'Remux': medium_box.val(9); break;
        case 'HDTV': medium_box.val(3); break;
        case 'Encode': medium_box.val(1); break;
        case 'WEB-DL': medium_box.val(2); break;
        case 'CD': medium_box.val(8);
      }
      //视频编码
      var codec_box = document.getElementsByName('codec_sel[4]')[0];
      codec_box.options[6].selected = true;
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.options[2].selected = true; break;
        case 'H264': case 'X264': codec_box.options[1].selected = true; break;
        case 'VC-1': codec_box.options[4].selected = true; break;
        case 'MPEG-2': case 'MPEG-4': codec_box.options[3].selected = true; break;
        case 'XVID': codec_box.options[5].selected = true;
      }
      //音频编码
      var audiocodec_box = document.getElementsByName('audiocodec_sel[4]')[0];
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': audiocodec_box.options[2].selected = true; break;
        case 'DTS-HDMA:X 7.1': audiocodec_box.options[2].selected = true; break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.options[2].selected = true; break;
        case 'TrueHD': audiocodec_box.options[1].selected = true; break;
        case 'Atmos': audiocodec_box.options[1].selected = true; break;
        case 'DTS': audiocodec_box.options[2].selected = true; break;
        case 'AC3': audiocodec_box.options[3].selected = true; break;
        case 'LPCM': audiocodec_box.options[4].selected = true; break;
        case 'AAC': audiocodec_box.options[7].selected = true; break;
        case 'Flac': audiocodec_box.options[5].selected = true; break;
        case 'APE': audiocodec_box.options[8].selected = true; break;
        case 'WAV': audiocodec_box.options[9].selected = true;
      }
      //分辨率
      var standard_box = document.getElementsByName('standard_sel[4]')[0];
      var standard_dict = {
        '4K': 1, '1080p': 2, '1080i': 2, '720p': 3, 'SD': 4, '': 5
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

