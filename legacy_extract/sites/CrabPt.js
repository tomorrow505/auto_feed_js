/** Consolidated Logic for: CrabPt **/

// --- From Module: 20_forward_site_filling4.js (Snippet 1) ---
else if (forward_site == 'CrabPt') {
      //类型
      var browsecat = $('#browsecat')
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
        '体育': 407, '软件': 409, '学习': 409, '': 409, '游戏': 409, 'MV': 406
      };
      //如果当前类型在上述字典中
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      try { disableother('browsecat', 'specialcat'); } catch (err) { }
      //媒介
      var medium_box = $('select[name="source_sel[4]"]');
      medium_box.val(1);
      if (raw_info.medium_sel == 'UHD') {
        medium_box.val(3);
      } else if (raw_info.medium_sel == 'Blu-ray') {
        medium_box.val(2);
      } else if (raw_info.medium_sel == 'Remux') {
        medium_box.val(4);
      } else if (raw_info.medium_sel == 'Encode') {
        medium_box.val(5);
      } else if (raw_info.medium_sel == 'WEB-DL') {
        medium_box.val(6);
      } else if (raw_info.medium_sel == 'HDTV') {
        medium_box.val(7);
      } else if (raw_info.medium_sel == 'CD') {
        medium_box.val(8);
      }

      //编码
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(1);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(3); break;
        case 'H264': case 'X264': codec_box.val(2); break;
        case 'VP9': codec_box.val(5); break;
        case 'AV1': codec_box.val(6); break;
      }
      if (raw_info.name.match(/H.?266/)) { codec_box.val(4); }

      //分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '8K': 5, '4K': 4, '1080p': 3, '1080i': 3, '720p': 2, 'SD': 1, '': 1 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }

      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': audiocodec_box.val(15); break;
        case 'DTS-HDMA:X 7.1': audiocodec_box.val(8); break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(17); break;
        case 'TrueHD': audiocodec_box.val(6); break;
        case 'DTS': audiocodec_box.val(5); break;
        case 'AC3':
          audiocodec_box.val(3);
          if (raw_info.name.match(/DD[P\+]/)) {
            audiocodec_box.val(4);
          }
          break;
        case 'AAC': audiocodec_box.val(2); break;
        case 'Flac': audiocodec_box.val(10); break;
        case 'APE': audiocodec_box.val(12); break;
        case 'LPCM': audiocodec_box.val(7); break;
        case 'WAV': audiocodec_box.val(11); break;
        case 'Atmos': audiocodec_box.val(26); break;
      }

      //制作组
      $('select[name="team_sel[4]"]').val(1);
      check_team(raw_info, 'team_sel[4]');

      var processing_box = $('select[name="processing_sel[4]"]');
      processing_box.val(1);
      var processing_dict = {
        '欧美': 4, '大陆': 2, '香港': 3, '台湾': 3, '日本': 5, '韩国': 6,
        '印度': 7, '': 1, '港台': 3
      };
      if (processing_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = processing_dict[raw_info.source_sel];
        processing_box.val(index);
      }
    }

