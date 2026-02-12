/** Consolidated Logic for: ECUST **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'ECUST':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (raw_info.type == '游戏') { check_label(document.getElementsByName('tags[4][]'), '9'); }
          if (raw_info.type == '学习') { check_label(document.getElementsByName('tags[4][]'), '4'); }
          break;

// --- From Module: 23_final_handlers.js (Snippet 2) ---
else if (forward_site == 'ECUST') {
      var browsecat = $('#browsecat');
      var type_dict = {
        '电影': 401, '剧集': 402, '综艺': 403, '纪录': 404, '动漫': 405, 'MV': 406,
        '体育': 407, '音乐': 411, '其他': 409
      };
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      disableother('browsecat', 'specialcat');

      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(9);
      switch (raw_info.medium_sel) {
        case 'Blu-ray': case 'UHD': medium_box.val(1); break;
        case 'DVD':
          medium_box.val(6);
          if (raw_info.name.match(/HD.?DVD/)) {
            medium_box.val(2);
          }
          break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'Remux': medium_box.val(3); break;
        case 'HDTV': medium_box.val(5); break;
        case 'Encode': medium_box.val(7); break;
        case 'CD': medium_box.val(8); break;
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
        case 'XVID': codec_box.val(3); break;
        case 'MPEG-2': case 'MPEG-4': codec_box.val(4); break;
      }

      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');

      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = {
        'SD': 4, '720p': 3, '1080i': 2, '1080p': 1, '4K': 5, '8K': 1
      }
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
    }

