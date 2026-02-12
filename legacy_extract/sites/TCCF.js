/** Consolidated Logic for: TCCF **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
if (forward_site == 'TCCF') {
          $('span:contains("[bbcode]")').click();
          descr_box[0].value = raw_info.descr;
          $('span:contains("[bbcode]")').click();
        }

// --- From Module: 19_forward_site_filling3.js (Snippet 2) ---
else if (forward_site == 'TCCF') {
      try {
        switch (raw_info.type) {
          case '电影': set_selected_option_by_value('browsecat', '622'); break;
          case '剧集': set_selected_option_by_value('browsecat', '623'); break;
          case '纪录': set_selected_option_by_value('browsecat', '624'); break;
          case '动漫': set_selected_option_by_value('browsecat', '602'); break;
          case '综艺': set_selected_option_by_value('browsecat', '610'); break;
          case '学习': set_selected_option_by_value('browsecat', '605'); break;
          case '音乐': set_selected_option_by_value('browsecat', '615'); break;
          case '体育': set_selected_option_by_value('browsecat', '603'); break;
          case '软件': set_selected_option_by_value('browsecat', '616'); break;
          default:
            set_selected_option_by_value('browsecat', '621');
        }

        var medium_box = document.getElementsByName('medium_sel')[0];
        switch (raw_info.medium_sel) {
          case 'UHD': medium_box.options[1].selected = true; break;
          case 'Blu-ray': medium_box.options[2].selected = true; break;
          case 'DVD':
            medium_box.options[8].selected = true;
            if (raw_info.name.match(/dvdrip/i)) {
              medium_box.options[7].selected = true;
            }
            break;
          case 'Remux': medium_box.options[3].selected = true; break;
          case 'HDTV': medium_box.options[6].selected = true; break;
          case 'WEB-DL': medium_box.options[5].selected = true; break;
          case 'Encode': medium_box.options[4].selected = true; break;
          default: medium_box.options[9].selected = true;
        }
        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        codec_box.options[8].selected = true;
        switch (raw_info.codec_sel) {
          case 'H264': case 'MPEG-4': codec_box.options[1].selected = true; break;
          case 'H265': codec_box.options[3].selected = true; break;
          case 'X265': codec_box.options[2].selected = true; break;
          case 'X264': codec_box.options[4].selected = true; break;
          case 'VC-1': codec_box.options[5].selected = true; break;
          case 'MPEG-2': codec_box.options[7].selected = true; break;
          case 'XVID': codec_box.options[6].selected = true;
        }

        //音频编码
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        var audiocodec_dict = {
          'TrueHD': 7, 'Atmos': 7, 'DTS-HDHR': 6,
          'DTS': 3, 'DTS-HD': 6, 'DTS-HDMA': 6, 'DTS-HDMA:X 7.1': 6,
          'AC3': 4, 'LPCM': 8, 'Flac': 1, 'MP3': 10, 'AAC': 5, 'APE': 2, '': 11
        };
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
          var index = audiocodec_dict[raw_info.audiocodec_sel];
          audiocodec_box.options[index].selected = true;
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 5 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
          var index = standard_dict[raw_info.standard_sel];
          standard_box.options[index].selected = true;
        }

        check_team(raw_info, 'team_sel');
      } catch (err) {

      }
    }

