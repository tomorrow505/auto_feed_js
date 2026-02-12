/** Consolidated Logic for: MyPT **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'MyPT':
          if (raw_info.type == '剧集') {
            if (raw_info.source_sel == '韩国' || raw_info.source_sel == '日本') {
              check_label(document.getElementsByName('tags[4][]'), '11');
            } else if (raw_info.source_sel == '大陆') {
              check_label(document.getElementsByName('tags[4][]'), '9');
            } else if (raw_info.source_sel == '香港' || raw_info.source_sel == '澳门' || raw_info.source_sel == '台湾') {
              check_label(document.getElementsByName('tags[4][]'), '8');
            } else if (raw_info.source_sel == '欧美') {
              check_label(document.getElementsByName('tags[4][]'), '10');
            }
          }
          if (labels.diy) {
            check_label(document.getElementsByName('tags[4][]'), '4');
          } else if (labels.yp && (labels.hdr10 || labels.hdr10plus)) {
            check_label(document.getElementsByName('tags[4][]'), '7');
          }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[4][]'), '12'); }
          if (labels.en) { check_label(document.getElementsByName('tags[4][]'), '16'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '13'); }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 2) ---
else if (forward_site == 'MyPT') {
      //类型
      var browsecat = $('#browsecat');
      var browsecat_dict = { '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '纪录': 404, '体育': 407, 'MV': 406, '短剧': 408 };
      if (browsecat_dict.hasOwnProperty(raw_info.type)) {
        var index = browsecat_dict[raw_info.type];
        browsecat.val(index);
        disableother('browsecat', 'specialcat');
        //媒介
        var medium_box = $('select[name="medium_sel[4]"]');
        medium_box.val(0);
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
        // 编码
        var codec_box = $('select[name="codec_sel[4]"]');
        codec_box.val(7);
        switch (raw_info.codec_sel) {
          case 'H264': case 'X264': codec_box.val(1); break;
          case 'H265': case 'X265': codec_box.val(2); break;
          case 'XVID': codec_box.val(3); break; //待审核
          case 'MPEG-2': codec_box.val(4); break;
        }
        // 分辨率
        var standard_box = $('select[name="standard_sel[4]"]');
        var standard_dict = { '8K': 6, '4K': 5, '1080p': 2, '1080i': 2, '720p': 3, 'SD': 8 };
        standard_box.val(1);
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
          var index = standard_dict[raw_info.standard_sel];
          standard_box.val(index);
        }
        //制作组
        $('select[name="team_sel[4]"]').val(5);
        check_team(raw_info, 'team_sel[4]');
      } else {
        $('tr.mode_4').hide();
        mutation_observer(document, function () {
          if ($('tr.mode_4').is(':visible')) {
            $('tr.mode_4').hide();
          }
        });
        $('tr.mode_5').show();
        var specialcat = $('#specialcat');
        var specialcat_dict = { '音乐': 412, '软件': 416, '漫画': 413, '游戏': 415 };
        if (specialcat_dict.hasOwnProperty(raw_info.type)) {
          var index = specialcat_dict[raw_info.type];
          specialcat.val(index);
          disableother('specialcat', 'browsecat');
        }
        if (raw_info.name.match(/flac/i)) {
          $('select[name="audiocodec_sel[5]"]').val(1);
        }
        $('select[name="processing_sel[5]"]').val(1);
      }
    }

