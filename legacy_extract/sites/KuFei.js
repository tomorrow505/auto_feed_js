/** Consolidated Logic for: KuFei **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
if (allinput[i].name == 'custom_fields[4][1]' && forward_site == 'KuFei') {
        allinput[i].value = raw_info.dburl ? raw_info.dburl : '';
      }

// --- From Module: 18_forward_site_filling2.js (Snippet 2) ---
case 'KuFei':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (raw_info.descr.match(/◎语.*?言.*?英语/)) {
            check_label(document.getElementsByName('tags[4][]'), '8');
          }
          if (raw_info.type == '动漫') {
            check_label(document.getElementsByName('tags[4][]'), '9');
          }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '12'); }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 3) ---
else if (forward_site == 'KuFei') {
      var browsecat = $('#browsecat');
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
        '体育': 407, '软件': 412, '学习': 413, '': 0, '游戏': 410, 'MV': 406
      };
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      var medium_box = $('select[name="medium_sel[4]"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(1); break;
        case 'Blu-ray': medium_box.val(4); break;
        case 'Remux':
          medium_box.val(6);
          if (raw_info.standard_sel == '4K') {
            medium_box.val(3);
          }
          break;
        case 'Encode':
          medium_box.val(18);
          if (raw_info.standard_sel == '720p') {
            medium_box.val(9);
          } else if (raw_info.standard_sel.match(/1080/)) {
            medium_box.val(8);
          } else if (raw_info.standard_sel == '4K') {
            medium_box.val(7);
          }
          break;
        case 'WEB-DL': medium_box.val(11); break;
        case 'HDTV': medium_box.val(12); break;
        case 'DVD': medium_box.val(13); break;
        case 'CD': medium_box.val(14);
      }
      if (raw_info.name.match(/minibd/i)) {
        medium_box.val(10);
      }
      if (labels.diy) {
        if (raw_info.standard_sel == '4K') {
          medium_box.val(2);
        } else {
          medium_box.val(5);
        }
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(10);
      switch (raw_info.codec_sel) {
        case 'H265': codec_box.val(3); break;
        case 'X265': codec_box.val(4); break;
        case 'H264': codec_box.val(1); break;
        case 'X264': codec_box.val(2); break;
        case 'VC-1': codec_box.val(5); break;
        case 'MPEG-2': codec_box.val(6); break;
        case 'MPEG-4': codec_box.val(7); break;
        case 'XVID': codec_box.val(8);
      }
      var standard_box = $(document.getElementsByName('standard_sel[4]')[0]);
      var standard_dict = { '4K': 6, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(7);
      switch (raw_info.audiocodec_sel) {
        case 'Atmos': audiocodec_box.val(8); break;
        case 'DTS-X': case 'DTS-HDMA:X 7.1': audiocodec_box.val(10); break;
        case 'TrueHD': audiocodec_box.val(13); break;
        case 'DTS-HD': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(11); break;
        case 'AC3':
          audiocodec_box.val(17);
          if ((raw_info.descr + $('textarea[name="technical_info"]').val()).match(/Dolby Digital Plus/i) || raw_info.name.match(/DD[P\+]/)) {
            audiocodec_box.val(15);
            if ((raw_info.descr + $('textarea[name="technical_info"]').val()).match(/atmos/i)) {
              audiocodec_box.val(24);
            }
          }
          break;
        case 'DTS': audiocodec_box.val(9); break;
        case 'AAC': audiocodec_box.val(18); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'APE': audiocodec_box.val(2); break;
        case 'MP3': audiocodec_box.val(10); break;
        case 'LPCM': audiocodec_box.val(14); break;
        case 'WAV': audiocodec_box.val(19); break;
      }
      if (raw_info.name.match(/dts.?hd.?hr/i)) {
        audiocodec_box.val(12);
      }
    }

