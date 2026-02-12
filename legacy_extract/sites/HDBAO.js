/** Consolidated Logic for: HDBAO **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'HDBAO':
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.hdr10 || labels.hdr10plus) {
            check_label(document.getElementsByName('tags[4][]'), '7');
          }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 2) ---
else if (forward_site == 'HDBAO') {
      //类型
      var browsecat = $('#browsecat')
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 409, '纪录': 404,
        '体育': 407, 'MV': 406
      };
      browsecat.val(411);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(13);
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(1); break;
        case 'Blu-ray': medium_box.val(3); break;
        case 'Remux': medium_box.val(5); break;
        case 'Encode': medium_box.val(6); break;
        case 'WEB-DL': medium_box.val(7); break;
        case 'HDTV': medium_box.val(8); break;
        case 'DVD': medium_box.val(12); break;
        case 'CD': medium_box.val(12); break;
      }
      if (raw_info.name.match(/dvdrip/i)) {
        medium_box.val(3);
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(7); break;
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'MPEG-4': codec_box.val(9); break;
      }
      //分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '4K': 5, '1080p': 8, '1080i': 2, '720p': 7, 'SD': 10, '': 11 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      //音频编码
      var audiocodec_box = $('select[name^="audiocodec_sel"]');
      audiocodec_box.val(7);
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(11); break;
        case 'DTS-HDMA:X 7.1': audiocodec_box.val(8); break;
        case 'TrueHD': audiocodec_box.val(12); break;
        case 'Atmos': audiocodec_box.val(9); break;
        case 'LPCM': audiocodec_box.val(13); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'AC3': audiocodec_box.val(2); break;
        case 'AAC': audiocodec_box.val(1); break;
        case 'Flac': audiocodec_box.val(15); break;
        case 'APE': audiocodec_box.val(6); break;
        case 'WAV': audiocodec_box.val(1); break;
      }
      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

