/** Consolidated Logic for: SoulVoice **/

// --- From Module: 19_forward_site_filling3.js (Snippet 1) ---
else if (forward_site == 'SoulVoice') {
      //类型
      var browsecat = $('#browsecat');
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
        '体育': 409, '软件': 409, '学习': 407, '': 409, '游戏': 409, 'MV': 406
      };
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }

      //媒介
      var medium_box = $('select[name="medium_sel[4]"]');
      medium_box.val(12);
      if (raw_info.medium_sel == 'Encode') {
        medium_box.val(7);
      } else if (raw_info.name.match(/MiniBD/i)) {
        medium_box.val(4);
      } else if (raw_info.audiocodec_sel == 'Flac' || raw_info.audiocodec_sel == 'APE') {
        medium_box.val(10);
      } else if (raw_info.type == '音乐' && raw_info.name.match(/dsd/i)) {
        medium_box.val(11);
      }

      //编码
      var codec_box = $('select[name="codec_sel[4]"]');
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'H265': case 'X265': codec_box.val(2); break;
        default: codec_box.val(5);
      }
      //分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '4K': 3, '1080p': 1, '1080i': 2, '720p': 4, 'SD': 4, '': 4, '8K': 4 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }

      disableother('browsecat', 'specialcat');

      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
      if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
      if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
      if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
      if (labels.hdr10) { check_label(document.getElementsByName('tags[4][]'), '7'); }
      if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '12'); }
      if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '8'); }
      if (raw_info.name.match(/DV/)) { check_label(document.getElementsByName('tags[4][]'), '12'); }
      if (raw_info.small_descr.match(/特效字幕/)) { check_label(document.getElementsByName('tags[4][]'), '9'); }
    }

