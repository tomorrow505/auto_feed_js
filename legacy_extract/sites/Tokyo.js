/** Consolidated Logic for: Tokyo **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'Tokyo':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.yz) { check_label(document.getElementsByName('tags[4][]'), '12'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '13'); }
          if (raw_info.name.match(/S\d{1,3}.?E\d{1,5}/) || raw_info.small_descr.match(/第\d{1,5}(.\d{1,5})?集/)) {
            check_label(document.getElementsByName('tags[4][]'), '14');
          }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '9'); }
          break;

// --- From Module: 23_final_handlers.js (Snippet 2) ---
else if (forward_site == 'Tokyo') {
      //类型
      var browsecat = $('#browsecat')
      var type_dict = { '电影': 401, '剧集': 402, '动漫': 405, '综艺': 409, '音乐': 408, '纪录': 409, '体育': 409, 'MV': 406, '游戏': 409, '学习': 409, '软件': 409, '短剧': 409, '': 409 };
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }

      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(11);
      switch (raw_info.medium_sel) {
        case 'Blu-ray': medium_box.val(1); break;
        case 'UHD': medium_box.val(2); break;
        case 'Remux': medium_box.val(3); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'HDTV': medium_box.val(5); break;
        case 'DVD': medium_box.val(6); break;
        case 'CD': medium_box.val(8); break;
        case 'MiniBD': medium_box.val(11); break;
      }
      if (raw_info.name.match(/dvdrip/i)) {
        medium_box.val(7);
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H264': codec_box.val(1); break;
        case 'H265': codec_box.val(2); break;
        case 'X264': codec_box.val(1); break;
        case 'X265': codec_box.val(7); break;
        case 'VC-1': codec_box.val(3); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'MPEG-4': codec_box.val(5); break;
        case 'AV1': codec_box.val(6); break;
        case 'XVID': codec_box.val(5);
      }
      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(7);
      switch (raw_info.audiocodec_sel) {
        case 'AAC': audiocodec_box.val(6); break;
        case 'APE': audiocodec_box.val(17); break;
        case 'AC3':
          audiocodec_box.val(14);
          if (raw_info.name.match(/DD[P\+]/)) {
            audiocodec_box.val(15);
          }
          break;
        case 'LPCM': audiocodec_box.val(13); break;
        case 'TrueHD': audiocodec_box.val(12); break;
        case 'Atmos':
          audiocodec_box.val(16);
          if (raw_info.name.match(/DD[\+P]/i)) {
            audiocodec_box.val(15);
          }
          break;
        case 'DTS:X': audiocodec_box.val(11); break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(10); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'M4A': audiocodec_box.val(9); break;
        case 'WAV': audiocodec_box.val(8); break;
        case 'MP3': audiocodec_box.val(4); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'OGG': audiocodec_box.val(7); break;
        case 'AV3V': audiocodec_box.val(19); break;
        case 'OPUS': audiocodec_box.val(18); break;
        case 'ALAC': audiocodec_box.val(5); break;
      }
      //分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '8K': 5, '4K': 6, '2K': 4, '1080p': 1, '1080i': 1, '720p': 3, '720i': 3, '576p': 4, '480p': 7, '480i': 7, 'SD': 4, '': 4 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

