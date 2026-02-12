/** Consolidated Logic for: ICC **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
case 'ICC':
          if (labels.gy) { $('input[name="tags[4][]"][value="5"]').attr('checked', true); }
          if (labels.yy) { $('input[name="tags[4][]"][value="5"]').attr('checked', true); }
          if (labels.zz) { $('input[name="tags[4][]"][value="6"]').attr('checked', true); }
          if (labels.diy) { $('input[name="tags[4][]"][value="4"]').attr('checked', true); }
          if (labels.hdr10 || labels.hdr10plus) { try { $('input[name="tags[4][]"][value="7"]').attr('checked', true); } catch (err) { } }
          break;

// --- From Module: 20_forward_site_filling4.js (Snippet 2) ---
else if (forward_site == 'ICC') {
      var browsecat = $('#browsecat')
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
        '体育': 407, '软件': 409, '学习': 409, '': 409, '游戏': 409, 'MV': 406
      };
      browsecat.val(409)
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      try { disableother('browsecat', 'specialcat'); } catch (err) { }
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
      var medium_box = $('select[name="medium_sel[4]"]');
      switch (raw_info.medium_sel) {
        case 'UHD': case 'Blu-ray':
          medium_box.val(1); break;
        case 'DVD':
          if (raw_info.name.match(/dvdr/i)) {
            medium_box.val(6);
          } else {
            medium_box.val(2);
          }
          break;
        case 'Remux': medium_box.val(3); break
        case 'HDTV': medium_box.val(5); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'CD': medium_box.val(8);
      }
      if (raw_info.name.match(/MiniBD/i)) {
        medium_box.val(4);
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(6); break;
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': case 'MPEG-4': codec_box.val(4); break;
        case 'XVID': codec_box.val(3);
      }
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = {
        '4K': 6, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      try {
        var year = raw_info.name.match(/\d{4}[^pi]/gi).pop().slice(0, 4);
        year = parseInt(year);
        var years = [2011, 2001, 1981, 1961, 1941, 1921, 1901, 1851, 1800];
        var year_selected = false;
        years.forEach((item, index) => {
          if (year > item && !year_selected) {
            $('select[name="processing_sel[5]"]').val(9 - index);
            year_selected = true;
          }
        });
      } catch (err) { }
    }

