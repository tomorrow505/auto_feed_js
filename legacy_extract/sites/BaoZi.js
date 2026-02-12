/** Consolidated Logic for: BaoZi **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'BaoZi':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[4][]'), '8'); }
          if (labels.hdr10) { check_label(document.getElementsByName('tags[4][]'), '14'); }
          if (labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '15'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '13'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '12'); }
          if (raw_info.type == '动漫') {
            check_label(document.getElementsByName('tags[4][]'), '11');
          }
          if (raw_info.type == 'MV') {
            check_label(document.getElementsByName('tags[4][]'), '18');
          }
          if (raw_info.type == '音乐' && raw_info.name.match(/album/)) {
            check_label(document.getElementsByName('tags[4][]'), '22');
          }
          if (raw_info.small_descr.match(/live现场/i)) {
            check_label(document.getElementsByName('tags[4][]'), '20');
          }
          break;

// --- From Module: 22_additional_handlers2.js (Snippet 2) ---
else if (forward_site == 'BaoZi') {
      //类型
      var browsecat = $('#browsecat')
      var type_dict = { '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404, '体育': 407, 'MV': 406 };
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }

      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(0);
      switch (raw_info.medium_sel) {
        case 'Blu-ray': labels.diy ? medium_box.val(13) : medium_box.val(1); break;
        case 'UHD': labels.diy ? medium_box.val(12) : medium_box.val(11); break;
        case 'Remux': medium_box.val(3); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'HDTV': medium_box.val(5); break;
        case 'DVD': medium_box.val(6); break;
        case 'CD': medium_box.val(8); break;
      }
      if (raw_info.name.match(/dvdrip/i)) {
        medium_box.val(6);
      }
      if (raw_info.name.match(/HD DVD/i)) {
        medium_box.val(2);
      }
      if (raw_info.name.match(/minibd/i)) {
        medium_box.val(4);
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'H265': case 'X265': codec_box.val(6); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'AV1': codec_box.val(3); break;
      }

      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(7);
      switch (raw_info.audiocodec_sel) {
        case 'AAC': audiocodec_box.val(6); break;
        case 'APE': audiocodec_box.val(14); break;
        case 'AC3': audiocodec_box.val(1); break;
        case 'LPCM': audiocodec_box.val(12); break;
        case 'TrueHD': audiocodec_box.val(11); break;
        case 'Atmos': audiocodec_box.val(9); break;
        case 'DTS:X': audiocodec_box.val(8); break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(10); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'M4A': audiocodec_box.val(5); break;
        case 'WAV': audiocodec_box.val(15); break;
        case 'MP3': audiocodec_box.val(4); break;
        case 'Flac': audiocodec_box.val(13); break;
        case 'OGG': audiocodec_box.val(5); break;
        case 'OPUS': audiocodec_box.val(2); break;
      }

      //分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      standard_box.val(7);
      var standard_dict = { '8K': 6, '4K': 5, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

