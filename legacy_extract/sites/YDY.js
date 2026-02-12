/** Consolidated Logic for: YDY **/

// --- From Module: 19_forward_site_filling3.js (Snippet 1) ---
else if (forward_site == 'YDY') {
      var browsecat = document.getElementsByName('type')[0];
      if (raw_info.type == '电影') {
        if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
          browsecat.options[8].selected = true;
        } else {
          browsecat.options[7].selected = true;
        }
      } else if (raw_info.type == '剧集') {
        if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
          browsecat.options[10].selected = true;
        } else {
          browsecat.options[9].selected = true;
        }
      } else {
        browsecat.options[12].selected = true;
      }

      $('input[name="url"]').css({ "width": "650px" });

      //来源
      var source_box = document.getElementsByName('source_sel')[0];
      source_box.options[7].selected = true;
      switch (raw_info.medium_sel) {
        case 'UHD': source_box.options[1].selected = true; break;
        case 'Blu-ray': case 'Remux':
          source_box.options[2].selected = true; break;
        case 'Encode': source_box.options[2].selected = true; break;
        case 'HDTV': source_box.options[3].selected = true; break;
        case 'WEB-DL': source_box.options[5].selected = true; break;
        case 'DVD': source_box.options[4].selected = true;
      }
      if (raw_info.name.match(/dvdrip|webrip/i)) {
        source_box.options[6].selected = true;
      }

      //媒介
      var medium_box = document.getElementsByName('medium_sel')[0];
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.options[1].selected = true; break;
        case 'Blu-ray': medium_box.options[2].selected = true; break;
        case 'Remux': medium_box.options[3].selected = true; break;
        case 'HDTV': medium_box.options[5].selected = true; break;
        case 'Encode': medium_box.options[4].selected = true; break;
      }

      //视频编码
      var codec_box = document.getElementsByName('codec_sel')[0];
      codec_box.options[6].selected = true;
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.options[5].selected = true; break;
        case 'H264': case 'X264': codec_box.options[1].selected = true; break;
        case 'VC-1': codec_box.options[2].selected = true; break;
        case 'MPEG-2': case 'MPEG-4': codec_box.options[4].selected = true; break;
        case 'XVID': codec_box.options[3].selected = true;
      }

      //音频编码
      var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': audiocodec_box.options[8].selected = true; break;
        case 'DTS-HDMA:X 7.1': audiocodec_box.options[8].selected = true; break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.options[8].selected = true; break;
        case 'TrueHD': audiocodec_box.options[7].selected = true; break;
        case 'Atmos': audiocodec_box.options[9].selected = true; break;
        case 'DTS': audiocodec_box.options[1].selected = true; break;
        case 'AC3': audiocodec_box.options[5].selected = true; break;
        case 'AAC': audiocodec_box.options[6].selected = true; break;
        case 'Flac': audiocodec_box.options[2].selected = true; break;
        case 'APE': audiocodec_box.options[4].selected = true; break;
        case 'WAV': audiocodec_box.options[3].selected = true;
      }

      //分辨率
      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = {
        '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 5
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
      $('select[name="team_sel"]').val(9);
      check_team(raw_info, 'team_sel');
    }

