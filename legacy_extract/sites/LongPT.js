/** Consolidated Logic for: LongPT **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'LongPT':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.yz) { check_label(document.getElementsByName('tags[4][]'), '9'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) {
            check_label(document.getElementsByName('tags[4][]'), '4');
          }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '8'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '10'); }
          if (raw_info.small_descr.match(/特效字幕/)) {
            check_label(document.getElementsByName('tags[4][]'), '11');
          }
          if (raw_info.type == '剧集' && raw_info.source_sel == '韩国') {
            check_label(document.getElementsByName('tags[4][]'), '14');
          }
          if (raw_info.type == '剧集' && raw_info.source_sel == '欧美') {
            check_label(document.getElementsByName('tags[4][]'), '13');
          }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 2) ---
else if (forward_site == 'LongPT') {
      //类型
      var browsecat = $('#browsecat')
      var type_dict = { '电影': 401, '剧集': 402, '综艺': 403, '纪录': 404, '动漫': 405, 'MV': 406, '体育': 407, '有声书': 410 }
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(16);
      switch (raw_info.medium_sel) {
        case 'Blu-ray': medium_box.val(1); break;
        case 'UHD': medium_box.val(2); break;
        case 'Remux': medium_box.val(3); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(4); break;
        case 'HDTV': medium_box.val(5); break;
        case 'DVD': medium_box.val(6); break;
        case 'CD': medium_box.val(8); break;
        case 'Other': medium_box.val(10); break;
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'H265': case 'X265': codec_box.val(2); break;
        case 'VC-1': codec_box.val(3); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'AV1': codec_box.val(5); break;
        case 'Other': codec_box.val(6); break;
      }
      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(11);
      switch (raw_info.audiocodec_sel) {
        case 'AAC': audiocodec_box.val(6); break;
        case 'APE': audiocodec_box.val(2); break;
        case 'AC3':
          audiocodec_box.val(15);
          if (raw_info.name.match(/DD[P\+]/)) {
            audiocodec_box.val(10);
          }
          break;
        case 'LPCM': audiocodec_box.val(14); break;
        case 'TrueHD': case 'Atmos': audiocodec_box.val(9); break;
        case 'DTS:X': audiocodec_box.val(7); break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(3); break;
        case 'DTS': audiocodec_box.val(13); break;
        case 'M4A': audiocodec_box.val(8); break;
        case 'WAV': audiocodec_box.val(17); break;
        case 'MP3': audiocodec_box.val(4); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'OGG': audiocodec_box.val(5); break;
      }
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = {
        '8K': 6, '4320p': 6, '4K': 5, '2160p': 5, '2K': 1, '1440p': 5,
        '1080p': 2, '1080i': 2, '720p': 3, '480p': 4, '': 7
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

