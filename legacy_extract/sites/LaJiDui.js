/** Consolidated Logic for: LaJiDui **/

// --- From Module: 09_data_processing.js (Snippet 1) ---
if (forward_site == 'LaJiDui') {
    raw_info.descr += `\n\n[quote]转载种子来源：${raw_info.origin_url.replace('***', '/')}[/quote]`;
  }

// --- From Module: 18_forward_site_filling2.js (Snippet 2) ---
case 'LaJiDui':
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[4][]'), '11'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '9'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '10'); }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 3) ---
else if (forward_site == 'LaJiDui') {
      //类型
      var browsecat = $('#browsecat');
      var type_dict = { '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '纪录': 404, '音乐': 408, 'MV': 406, '体育': 407, '有声小说': 408 };
      $('#browsecat').val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(11);
      switch (raw_info.medium_sel) {
        case 'Blu-ray': case 'UHD': medium_box.val(1); break;
        case 'Remux': medium_box.val(3); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'HDTV': medium_box.val(5); break;
        case 'DVD': medium_box.val(2); break;
        case 'CD': medium_box.val(8); break;
      }
      if (raw_info.name.match(/minibd/i)) {
        medium_box.val(4);
      } else if (raw_info.name.match(/dvdr/i)) {
        medium_box.val(6);
      } else if (raw_info.name.match(/HD.DVD/i)) {
        medium_box.val(2);
      }
      //格式
      var processing_box = $('select[name="processing_sel[4]"]');
      if (raw_info.medium_sel == 'Remux' || raw_info.medium_sel == 'Encode') {
        processing_box.val(10);
      } else if ($(`textarea[name="technical_info"]`).val().match(/\.mp4/)) {
        processing_box.val(11);
      } else {
        processing_box.val(17);;
      }
      // 编码
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'H265': case 'X265': codec_box.val(7); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'AV1': codec_box.val(6); break;
        case 'XVID': codec_box.val(3); break;
      }
      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(7);
      switch (raw_info.audiocodec_sel) {
        case 'AAC': audiocodec_box.val(6); break;
        case 'APE': audiocodec_box.val(2); break;
        case 'AC3':
          audiocodec_box.val(13);
          if (raw_info.name.match(/DD[\+p]/)) {
            audiocodec_box.val(12);
          }
          break;
        case 'DTS:X': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(9); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'MP3': audiocodec_box.val(4); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'WAV': audiocodec_box.val(8); break;
        case 'Atmos': case 'TrueHD': audiocodec_box.val(10); break;
        case 'LPCM': audiocodec_box.val(11); break;
      }
      // 分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '8K': 7, '4K': 6, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '': 8 };
      standard_box.val(8);
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      // 区域
      var source_box = $('select[name="source_sel[4]"]');
      switch (raw_info.source_sel) {
        case '大陆': source_box.val(7); break;
        case '台湾': source_box.val(2); break;
        case '香港': source_box.val(8); break;
        case '日本': source_box.val(10); break;
        case '韩国': source_box.val(11); break;
        case '欧美': source_box.val(1); break;
        case '印度': source_box.val(3); break;
        default:
          source_box.val(6); break;
      }
      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

