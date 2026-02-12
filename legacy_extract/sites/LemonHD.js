/** Consolidated Logic for: LemonHD **/

// --- From Module: 15_origin_site_parsing2.js (Snippet 1) ---
case 'LemonHD':
        var tr = $('div.tags_block');
        if (tr.find('span.tag_gy').length) {
          raw_info.labels = 1;
        }
        if (tr.find('span.tag_yy').length) {
          raw_info.labels += 10;
        }
        if (tr.find('span.tag_zz').length) {
          raw_info.labels += 100;
        }
        break;

// --- From Module: 17_forward_site_filling1.js (Snippet 2) ---
if (forward_site == 'LemonHD') {
        container = $('textarea[name="mediainfo"]');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
case 'LemonHD':
          if (labels.gy) { check_label(document.getElementsByName('tag_gy'), '1'); }
          if (labels.yy) { check_label(document.getElementsByName('tag_yy'), '1'); }
          if (labels.zz) { check_label(document.getElementsByName('tag_zz'), '1'); }
          if (labels.diy) {
            check_label(document.getElementsByName('tag_diy'), '1');
          } else if (labels.yp) {
            check_label(document.getElementsByName('tag_untouch'), '1');
          }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tag_hdr'), '1'); }
          if (labels.db) { check_label(document.getElementsByName('tag_dv'), '1'); }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 4) ---
else if (forward_site == 'LemonHD') {
      var browsecat = $('select[name=type]');
      var type_dict = { '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 411, '纪录': 404, 'MV': 406 };
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
        browsecat.trigger('change');
        if (index == 402 && labels.complete) {
          $('#is_complete').attr('checked', true);
        }
      }
      var medium_box = $('select[name="medium_sel"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(3); break;
        case 'Blu-ray': medium_box.val(1); break;
        case 'Remux': medium_box.val(12); break;
        case 'Encode': medium_box.val(13); break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'HDTV': medium_box.val(11); break;
        case 'DVD': medium_box.val(2); break;
        default: medium_box.val(5);
      }
      var codec_box = $('select[name="codec_sel"]');
      codec_box.val(100);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(3); break;
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': codec_box.val(4); break;
      }
      var audiocodec_box = $('select[name="audiocodec_sel"]');
      switch (raw_info.audiocodec_sel) {
        case 'Atmos': audiocodec_box.val(1); break;
        case 'DTS-X': case 'DTS-HDMA:X 7.1': audiocodec_box.val(4); break;
        case 'TrueHD': audiocodec_box.val(2); break;
        case 'DTS-HD': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(3); break;
        case 'AC3':
          audiocodec_box.val(6);
          if (raw_info.descr.match(/Dolby Digital Plus/i) || raw_info.name.match(/DD[P\+]/)) {
            audiocodec_box.val(7);
          }
          break;
        case 'DTS': audiocodec_box.val(5); break;
        case 'AAC': audiocodec_box.val(8); break;
        case 'Flac': audiocodec_box.val(10); break;
        case 'APE': audiocodec_box.val(12); break;
        case 'LPCM': audiocodec_box.val(9); break;
        case 'WAV': audiocodec_box.val(11); break;
      }
      var standard_box = $('select[name="standard_sel"]');
      var standard_dict = { '4K': 5, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '8K': 6 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      var source_box = $('select[name="team_sel"]');
      var source_dict = { '欧美': 1, '大陆': 3, '香港': 2, '台湾': 2, '日本': 4, '韩国': 4, '印度': 5 };
      source_box.val(10);
      if (source_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = source_dict[raw_info.source_sel];
        source_box.val(index);
      }
    }

