/** Consolidated Logic for: RS **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
case 'RS':
          if (labels.diy) { check_label(document.getElementsByName('tags[]'), '4'); }
          if (labels.gy) { check_label(document.getElementsByName('tags[]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[]'), '6'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[]'), '7'); }
          break;

// --- From Module: 22_additional_handlers2.js (Snippet 2) ---
else if (forward_site == 'RS') {
      switch (raw_info.type) {
        case '电影': $('#browsecat').val('401'); break;
        case '剧集': $('#browsecat').val('402'); break;
        case '纪录': $('#browsecat').val('404'); break;
        case '动漫': $('#browsecat').val('405'); break;
        case '综艺': $('#browsecat').val('403'); break;
        case '学习': $('#browsecat').val('411'); break;
        case '音乐': $('#browsecat').val('408'); break;
        case '体育': $('#browsecat').val('407'); break;
        case '软件': $('#browsecat').val('412'); break;
        default:
          $('#browsecat').val('409');
      }

      // TODO 来源
      var source_box = $('select[name="source_sel"]');

      // 媒介
      var medium_box = $('select[name="medium_sel"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(0); break;
        case 'Blu-ray': medium_box.val(1); break;
        case 'DVD':
          if (raw_info.name.match(/DVDR/i)) {
            medium_box.val(6); break;
          } else {
            medium_box.val(2); break;
          }
        case 'Remux': medium_box.val(3); break;
        case 'HDTV': medium_box.val(5); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL': medium_box.val(10);
      }
      if (raw_info.name.match(/MiniBD/i)) {
        medium_box.val(10);
      }

      //视频编码
      var codec_box = $(document.getElementsByName('codec_sel')[0]);
      codec_box.val(0);
      switch (raw_info.codec_sel) {
        case 'H264': codec_box.val(1); break;
        case 'VC-1': codec_box.val(2); break;
        case 'XVID': codec_box.val(3); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'H265': codec_box.val(8); break;
        case 'X265': codec_box.val(3); break;
        case 'X264': codec_box.val(6); break;
        case 'MPEG-4': codec_box.val(5); break;
        default: codec_box.val(5); // Other
      }

      //音频编码
      var audiocodec_box = $(document.getElementsByName('audiocodec_sel')[0]);
      audiocodec_box.val(0);
      switch (raw_info.audiocodec_sel) {
        case 'Flac':
          audiocodec_box.val(1); break;
        case 'APE':
          audiocodec_box.val(2); break;
        case 'DTS': case 'DTS-HD': case 'DTS-HDHR':
          audiocodec_box.val(3); break;
        case 'DTS-HDMA':
          audiocodec_box.val(3); break;
        case 'MP3':
          audiocodec_box.val(4); break;
        case 'OGG':
          audiocodec_box.val(5); break;
        case 'AAC':
          audiocodec_box.val(6); break;
        default:
          audiocodec_box.val(7);
      }

      //分辨率
      var standard_box = $(document.getElementsByName('standard_sel')[0]);
      var standard_dict = { '4K': 6, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '8K': 0 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
    }

