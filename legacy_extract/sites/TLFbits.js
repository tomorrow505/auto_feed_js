/** Consolidated Logic for: TLFbits **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
else if (raw_info.type == '电影' && ['HUDBT', 'MTeam', 'TLFbits', 'PuTao', 'TJUPT', 'NanYang', 'BYR', 'TTG'].indexOf(forward_site) < 0) {
        raw_info.type = '动漫';
      }

// --- From Module: 19_forward_site_filling3.js (Snippet 2) ---
else if (forward_site == 'TLFbits') {
      //类型
      var browsecat = document.getElementById('browsecat');
      var type_dict = {
        '电影': 1, '剧集': 2, '动漫': 4, '综艺': 3, '音乐': 8, '纪录': 5,
        '体育': 6, '软件': 10, '学习': 11, '': 12, '游戏': 9, 'MV': 7, '书籍': 12
      };
      //如果当前类型在上述字典中
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.options[index].selected = true;
      }

      //质量类型
      document.getElementsByName('source_sel')[0].options[2].selected = true;

      //媒介
      var medium_box = document.getElementsByName('medium_sel')[0];
      var medium_dict = { 'UHD': 2, 'Blu-ray': 3, 'Encode': 1, 'HDTV': 6, 'WEB-DL': 5, 'Remux': 4, 'DVD': 7, '': 9, 'CD': 8 };
      if (medium_dict.hasOwnProperty(raw_info.medium_sel)) {
        var index = medium_dict[raw_info.medium_sel];
        medium_box.options[index].selected = true;
      }

      //视频编码
      var codec_box = document.getElementsByName('codec_sel')[0];
      var codec_dict = { 'H264': 1, 'X265': 2, 'X264': 1, 'H265': 2, 'VC-1': 4, 'MPEG-2': 3, 'Xvid': 5, '': 6 };
      if (codec_dict.hasOwnProperty(raw_info.codec_sel)) {
        var index = codec_dict[raw_info.codec_sel];
        codec_box.options[index].selected = true;
      }

      //音频编码
      var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
      var audiocodec_dict = {
        'Flac': 8, 'APE': 9, 'DTS': 7, 'AC3': 4, 'WAV': 10, 'MP3': 13, 'DTS-HDHR': 3,
        'AAC': 11, 'DTS-HDMA': 5, 'Atmos': 2, 'TrueHD': 3, 'LPCM': 1
      };
      if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
        var index = audiocodec_dict[raw_info.audiocodec_sel];
        audiocodec_box.options[index].selected = true;
      }

      //分辨率
      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = { '4K': 6, '1080p': 4, '1080i': 3, '720p': 2, 'SD': 1, '': 7 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }

      //地区
      var processing_box = document.getElementsByName('processing_sel')[0];
      var processing_dict = { '欧美': 5, '大陆': 1, '香港': 2, '台湾': 2, '日本': 3, '韩国': 4, '': 6, '印度': 6 };
      if (processing_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = processing_dict[raw_info.source_sel];
        processing_box.options[index].selected = true;
      }

      //选择其他组
      document.getElementsByName('team_sel')[0].options[4].selected = true;
    }

