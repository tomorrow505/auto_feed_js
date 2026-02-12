/** Consolidated Logic for: FreeFarm **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
case 'FreeFarm':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (raw_info.name.match(/(\.| )3D(\.| )/)) { check_label(document.getElementsByName('tags[4][]'), '11'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '10'); }
          if (raw_info.name.match(/S\d{1,3}.?E\d{1,5}/) || raw_info.small_descr.match(/第\d{1,5}(.\d{1,5})?集/)) {
            check_label(document.getElementsByName('tags[4][]'), '12');
          }
          if (raw_info.type == '短剧') { check_label(document.getElementsByName('tags[4][]'), '8'); }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 2) ---
else if (forward_site == 'FreeFarm') {
      var browsecat = $('select[name=type]');
      var type_dict = { '电影': 401, '剧集': 402, '动漫': 405, '综艺': 404, 'MV': 406, '音乐': 407, '纪录': 403, '体育': 408 };
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
        $('select[name=type]')[0].dispatchEvent(evt);
      } else {
        if (raw_info.type == '学习') {
          $('#specialcat').val(413);
          $('#specialcat')[0].dispatchEvent(evt);
        } else if (raw_info.type == '游戏') {
          $('#specialcat').val(417);
          $('#specialcat')[0].dispatchEvent(evt);
        }
      }

      var medium_box = $('select[name="medium_sel[4]"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(1); break;
        case 'Blu-ray': medium_box.val(2); break;
        case 'DVD':
          if (raw_info.name.match(/DVDR/i)) {
            medium_box.val(8); break;
          } else {
            medium_box.val(14); break;
          }
        case 'Remux': medium_box.val(5); break;
        case 'HDTV': medium_box.val(7); break;
        case 'Encode': medium_box.val(6); break;
        case 'WEB-DL': medium_box.val(12);
      }
      if (raw_info.name.match(/MiniBD/i)) {
        medium_box.val(10);
      }
      //视频编码
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(14);
      switch (raw_info.codec_sel) {
        case 'H265': codec_box.val(1); break;
        case 'X265': codec_box.val(3); break;
        case 'H264': codec_box.val(2); break;
        case 'X264': codec_box.val(4); break;
        case 'VC-1': codec_box.val(6); break;
        case 'XVID': codec_box.val(9); break;
        case 'MPEG-2': codec_box.val(8); break;
        case 'MPEG-4': codec_box.val(7);
      }
      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(21);
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HDMA:X 7.1': audiocodec_box.val(6); break;
        case 'DTS-HDMA': audiocodec_box.val(2); break;
        case 'DTS-HDHR': audiocodec_box.val(3); break;
        case 'TrueHD': audiocodec_box.val(5); break;
        case 'Atmos': audiocodec_box.val(1); break;
        case 'LPCM': audiocodec_box.val(7); break;
        case 'DTS': audiocodec_box.val(14); break;
        case 'AC3': audiocodec_box.val(4); break;
        case 'AAC': audiocodec_box.val(13); break;
        case 'Flac': audiocodec_box.val(9); break;
        case 'APE': audiocodec_box.val(15); break;
        case 'WAV': audiocodec_box.val(11); break;
        case 'MP3': audiocodec_box.val(12); break;
      }

      //分辨率
      var standard_box = $(document.getElementsByName('standard_sel[4]')[0]);
      var standard_dict = { '4K': 2, '1080p': 3, '1080i': 5, '720p': 6, 'SD': 7, '8K': 1 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      $('select[name="team_sel[4]"]').val(14);

      var source_box = $('select[name="source_sel[4]"]');
      var source_dict = {
        '欧美': 38, '大陆': 35, '香港': 36, '台湾': 37, '日本': 40, '韩国': 39,
        '印度': 41, '': 42
      };
      source_box.val(42);
      if (source_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = source_dict[raw_info.source_sel];
        source_box.val(index);
      }
    }

