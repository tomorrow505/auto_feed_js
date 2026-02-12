/** Consolidated Logic for: HITPT **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
case 'HITPT':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[4][]'), '8'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '9'); }
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
else if (forward_site == 'HITPT') {
      // 分类
      // 使用js用于兼容change事件监听器
      var i_evt = new Event("change", { bubbles: true, cancelable: false });
      var browsecat = document.getElementById('browsecat');
      var specialcat = document.getElementById('specialcat');
      var bro_type_dict = {
        '电影': 401, '纪录': 413, '动漫': 405, '剧集': 402, '综艺': 416, '体育': 407, 'MV': 415, '': 0,
      };
      var spe_type_dict = { '音乐': 406, '软件': 408, '游戏': 410 };
      if (bro_type_dict.hasOwnProperty(raw_info.type)) {
        var index = bro_type_dict[raw_info.type];
        browsecat.value = index;
        browsecat.dispatchEvent(i_evt);
      }
      if (spe_type_dict.hasOwnProperty(raw_info.type)) {
        var index = spe_type_dict[raw_info.type];
        specialcat.value = index;
        specialcat.dispatchEvent(i_evt);
      }

      // 来源
      var source_box = $('select[name="source_sel[4]"]');
      switch (raw_info.medium_sel) {
        case 'UHD': source_box.val(11); break;
        case 'Blu-ray': source_box.val(1); break;
        case 'Remux': source_box.val(12); break;
        case 'HDTV': source_box.val(4); break;
        case 'Encode': source_box.val(2); break;
        case 'WEB-DL': source_box.val(9); break;
        case 'DVD': source_box.val(3); break;
        case 'CD': source_box.val(7); break;
        case 'TV': source_box.val(5);
        default: source_box.val(8);
      }

      // 分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = {
        '8K': 7, '4K': 5, '1440p': 6, '1080p': 1, '1080i': 2, '720p': 3, '720i': 3, 'SD': 4
      }
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      } else {
        standard_box.val(8);
      }

      //视频编码
      var codec_box = $('select[name="codec_sel[4]"]');
      //console.log(raw_info.codec_sel);
      switch (raw_info.codec_sel) {
        case 'H265': codec_box.val(10); break;
        case 'H264': codec_box.val(1); break;
        case 'X265': codec_box.val(14); break;
        case 'X264': codec_box.val(13); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'MPEG-4': codec_box.val(12); break;
        case 'XVID': codec_box.val(3); break;
        case 'VP9': codec_box.val(11); break;
        default: codec_box.val(5);
      }

      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HDMA:X 7.1': audiocodec_box.val(19); break;
        case 'DTS-HDMA': audiocodec_box.val(18); break;
        case 'DTS-HDMR': audiocodec_box.val(17); break;
        case 'DTS-HD': audiocodec_box.val(16); break;
        case 'DTS-X': audiocodec_box.val(15); break;
        case 'LPCM': audiocodec_box.val(14); break;
        case 'AC3': audiocodec_box.val(8); break;
        case 'Atmos': audiocodec_box.val(13); break;
        case 'AAC': audiocodec_box.val(6); break;
        case 'TrueHD': audiocodec_box.val(12); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'APE': audiocodec_box.val(2); break;
        case 'MP3': audiocodec_box.val(4); break;
        case 'WAV': audiocodec_box.val(11); break;
        case 'OGG': audiocodec_box.val(5); break;
        default: audiocodec_box.val(7);
      }

      // IMDB, douban
      if (raw_info.url) {
        $('input[name="url"]').val(raw_info.url);
      }
      if (raw_info.dburl) {
        $('input[name="pt_gen"]').val(raw_info.dburl);
      }
      disableother('browsecat', 'specialcat');
      $('select[name="team_sel[4]"]').val(4);
      check_team(raw_info, 'team_sel[4]');
    }

