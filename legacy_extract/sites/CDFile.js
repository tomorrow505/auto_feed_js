/** Consolidated Logic for: CDFile **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'CDFile':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 2) ---
else if (forward_site == 'CDFile') {
      var browsecat = $('#browsecat');
      var type_dict = { '音乐': 408, '体育': 407, 'MV': 406, '综艺': 403, '剧集': 402, '动漫': 405, '纪录': 404, '电影': 401 };
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(10);
      switch (raw_info.medium_sel) {
        case 'UHD': case 'Blu-ray': medium_box.val(1); break;
        case 'DVD': medium_box.val(6); break;
        case 'CD': medium_box.val(8); break;
      }
      //编码
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'H265': case 'X265': codec_box.val(6); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'MPEG-4': codec_box.val(7); break;
        case 'VC-1': codec_box.val(2); break;
        case 'XVID': codec_box.val(3); break;
      }
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '4K': 5, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '8K': 6, '': 4 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

