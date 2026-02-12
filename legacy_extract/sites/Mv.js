/** Consolidated Logic for: Mv **/

// --- From Module: 18_forward_site_filling2.js (Snippet 1) ---
case 'MV': type_code = '演唱'; break;

// --- From Module: 18_forward_site_filling2.js (Snippet 2) ---
case 'MV': type_code = 'MV/演唱会'; break;

// --- From Module: 18_forward_site_filling2.js (Snippet 3) ---
case 'MV': browsecat.val(59); break;

// --- From Module: 18_forward_site_filling2.js (Snippet 4) ---
case 'MV': browsecat.val(419); break;

// --- From Module: 18_forward_site_filling2.js (Snippet 5) ---
case 'MV': set_selected_option_by_value('browsecat', '441'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 6) ---
case 'MV': browsecat.options[8].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 7) ---
case 'MV': set_selected_option_by_value('browsecat', '406'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 8) ---
case 'MV': set_selected_option_by_value('browsecat', '427'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 9) ---
case 'MV': set_selected_option_by_value('browsecat', '406'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 10) ---
case 'MV': set_selected_option_by_value('browsecat', '406'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 11) ---
case 'MV':
          if (raw_info.music_media == 'CD' || raw_info.edition_info.match(/CD/)) {
            $('#music_type').val('CD');
          } else if (raw_info.medium_sel == 'WEB-DL') {
            $('#music_type').val('WEB');
          }
          if (raw_info.type == 'MV') { $('#music_type').val('MV'); }
          if (raw_info.labels) {
            if (raw_info.labels.match(/大陆|chinese/i)) {
              $('select[name="second_type"]').val(23); $('#music_country').val('大陆');
            } else if (raw_info.labels.match(/港台/)) {
              $('select[name="second_type"]').val(24); $('#music_country').val('港台');
            } else if (raw_info.labels.match(/日韩|korean|japan|jpop/i)) {
              $('select[name="second_type"]').val(25); $('#music_country').val('日韩');
            } else if (raw_info.labels.match(/欧美/)) {
              $('select[name="second_type"]').val(26); $('#music_country').val('欧美');
            }
          }
          if (raw_info.music_name) { $('#music_album').val(raw_info.music_name); }
          if (raw_info.music_author) {
            if (raw_info.music_author.match(/群星/)) {
              $('#music_artist').val('V.A.');
            } else {
              $('#music_artist').val(raw_info.music_author);
            }
          }
          if (raw_info.name.match(/flac/i) || raw_info.small_descr.match(/Flac/i)) {
            $('#music_filetype').val('FLAC');
          } else if (raw_info.name.match(/WAV/i) || raw_info.small_descr.match(/WAV/i)) {
            $('#music_filetype').val('WAV');
          }
          if (raw_info.origin_site == 'OpenCD' || raw_info.origin_site == 'DICMusic') {
            $('#music_quality').val('无损');
          }
          $('#music_year').val(raw_info.name.match(/(19|20)\d{2}/)[0]);
          if (!raw_info.small_descr) { $('input[name="small_descr"]').val(`转自${raw_info.origin_site}`); }
      }

      if (raw_info.descr.match(/Audio Video Interleave|AVI/i)) {
        $('#tv_filetype, #record_format').val('AVI');
      } else if (raw_info.descr.match(/mp4|\.mp4/i)) {
        $('#tv_filetype, #record_format').val('MP4');
      } else if (raw_info.descr.match(/Matroska|\.mkv/i)) {
        $('#tv_filetype, #record_format').val('MKV');
      } else if (raw_info.descr.match(/MPLS/i)) {
        $('#tv_filetype, #record_format').val('M2TS');
      }
    }

    else if (forward_site == 'TCCF') {
      try {
        switch (raw_info.type) {
          case '电影': set_selected_option_by_value('browsecat', '622'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 12) ---
case 'MV': set_selected_option_by_value('browsecat', '414'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 13) ---
case 'MV': browsecat.options[7].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 14) ---
case 'MV': browsecat.options[6].selected = true;
      }
      browsecat.dispatchEvent(evt);

      //媒介
      var medium_box = document.getElementsByName('medium_sel')[0];
      medium_box.options[9].selected = true;
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.options[2].selected = true; break;

// --- From Module: 20_forward_site_filling4.js (Snippet 15) ---
case 'MV': browsecat.options[9].selected = true; break;

// --- From Module: 23_final_handlers.js (Snippet 16) ---
case 'MV': $('#browsecat').val('406'); break;

