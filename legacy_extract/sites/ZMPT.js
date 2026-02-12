/** Consolidated Logic for: ZMPT **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
else if (origin_site == 'ZMPT') {
        raw_info.torrent_name = $('a[href*="download.php"]:contains(torrent)').text();
        raw_info.torrent_url = $('#content').text().trim();
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 2) ---
case 'ZMPT':
          if (labels.gy) { $('input[name="tags[4][]"][value="5"]').attr('checked', true); }
          if (labels.yy) { $('input[name="tags[4][]"][value="5"]').attr('checked', true); }
          if (labels.zz) { $('input[name="tags[4][]"][value="6"]').attr('checked', true); }
          if (labels.diy) {
            $('input[name="tags[4][]"][value="4"]').attr('checked', true);
          } else if (labels.yp) {
            $('input[name="tags[4][]"][value="10"]').attr('checked', true);
          }
          if (labels.hdr10 || labels.hdr10plus) { try { $('input[name="tags[4][]"][value="7"]').attr('checked', true); } catch (err) { } }
          if (labels.complete) { $('input[name="tags[4][]"][value="12"]').attr('checked', true); }
          break;

// --- From Module: 20_forward_site_filling4.js (Snippet 3) ---
else if (forward_site == 'ZMPT') {
      var browsecat = $('#browsecat');
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 417, '综艺': 403, '音乐': 423, '纪录': 422,
        '体育': 409, '软件': 425, '游戏': 426, 'MV': 423
      };
      browsecat.val(409)
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }

      if (raw_info.type == '书籍' && raw_info.descr.match(/m4a|mp3/i)) {
        browsecat.val(424);
      }
      var medium_box = $('select[name="medium_sel[4]"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(1); break;
        case 'Blu-ray': medium_box.val(1); break;
        case 'DVD':
          medium_box.val(2);
          if (raw_info.name.match(/DVDr/i)) {
            medium_box.val(6);
          }
          break;
        case 'Remux': medium_box.val(3); break;
        case 'HDTV': medium_box.val(5); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'CD': medium_sel.val(8);
      }
      if (raw_info.name.match(/MiniBD/i)) {
        medium_box.val(4);
      }
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': audiocodec_box.val(3); break;
        case 'TrueHD': audiocodec_box.val(7); break;
        case 'Atmos': audiocodec_box.val(7); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'AC3': audiocodec_box.val(8); break;
        case 'AAC': audiocodec_box.val(6); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'APE': audiocodec_box.val(2); break;
        case 'LPCM': audiocodec_box.val(7); break;
        case 'WAV': audiocodec_box.val(7);
      }

      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = {
        '4K': 5, '1080p': 1, '1080i': 1, '720p': 8, 'SD': 7,
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

