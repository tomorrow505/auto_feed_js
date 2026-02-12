/** Consolidated Logic for: PuTao **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (origin_site == 'TTG' || origin_site == 'PuTao' || origin_site == 'OpenCD' || origin_site == 'HDArea') {
        title = document.getElementsByTagName("h1")[0];
        if ($(title).text().match(/上传成功|编辑成功|发布成功/)) {
          title = document.getElementsByTagName("h1")[1];
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 2) ---
else if (raw_info.type == '电影' && ['HUDBT', 'MTeam', 'TLFbits', 'PuTao', 'TJUPT', 'NanYang', 'BYR', 'TTG'].indexOf(forward_site) < 0) {
        raw_info.type = '动漫';
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
else if (forward_site == 'PuTao') {
          raw_info.name = '[{chinese}] {english}'.format({
            'english': raw_info.name,
            'chinese': get_small_descr_from_descr(raw_info.descr, raw_info.name).split('/')[0].split(/\| 类别/)[0].split('*')[0].trim()
          });
          allinput[i].value = raw_info.name;
        }

// --- From Module: 19_forward_site_filling3.js (Snippet 4) ---
else if (forward_site == 'PuTao') {
      //类型
      set_selected_option_by_value('browsecat', '450');
      switch (raw_info.type) {
        case '电影':
          if (raw_info.source_sel == '欧美') {
            set_selected_option_by_value('browsecat', '402');
          } else if (['大陆', '港台', '香港', '台湾'].indexOf(raw_info.source_sel) > -1) {
            set_selected_option_by_value('browsecat', '401');
          } else if (['日本', '韩国', '日韩', '印度'].indexOf(raw_info.source_sel) > -1) {
            set_selected_option_by_value('browsecat', '403');
          }
          break;
        case '纪录': set_selected_option_by_value('browsecat', '406'); break;
        case '剧集':
          switch (raw_info.source_sel) {
            case '大陆': set_selected_option_by_value('browsecat', '409'); break;
            case '台湾': case '香港': case '港台':
              set_selected_option_by_value('browsecat', '407'); break;
            case '日本': case '韩国': case '日韩': case '印度':
              set_selected_option_by_value('browsecat', '408'); break;
            case '欧美': set_selected_option_by_value('browsecat', '410');
          }
          break;
        case '综艺':
          switch (raw_info.source_sel) {
            case '大陆': set_selected_option_by_value('browsecat', '411'); break;
            case '台湾': case '香港': case '港台':
              set_selected_option_by_value('browsecat', '412');
              break;
            case '日本': case '韩国': case '日韩':
              set_selected_option_by_value('browsecat', '414');
              break;
            case '欧美': set_selected_option_by_value('browsecat', '413');
          }
          break;
        case '动漫': set_selected_option_by_value('browsecat', '431'); break;
        case '音乐': set_selected_option_by_value('browsecat', '423'); break;
        case 'MV': set_selected_option_by_value('browsecat', '427'); break;
        case '体育': set_selected_option_by_value('browsecat', '432'); break;
        case '软件': set_selected_option_by_value('browsecat', '434'); break;
        case '学习': set_selected_option_by_value('browsecat', '435'); break;
        default: set_selected_option_by_value('browsecat', '450');
      }

      //视频编码, 跟馒头一样视频音频混合
      var codec_box = document.getElementsByName('codec_sel')[0];
      var audiocodec_dict = {
        'Flac': 5, 'APE': 6, 'DTS': 7, 'AC3': 8, 'WAV': 9, 'MP3': 9,
        'AAC': 9
      };
      if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
        var index = audiocodec_dict[raw_info.audiocodec_sel];
        codec_box.options[index].selected = true;
      }
      var codec_dict = { 'H264': 1, 'X265': 10, 'X264': 1, 'H265': 10, 'VC-1': 2, 'MPEG-2': 4, 'Xvid': 3 };
      if (codec_dict.hasOwnProperty(raw_info.codec_sel)) {
        var index = codec_dict[raw_info.codec_sel];
        codec_box.options[index].selected = true;
      }

      //分辨率
      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = { '4K': 6, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '': 5 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
    }

