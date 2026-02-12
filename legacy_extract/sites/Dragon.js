/** Consolidated Logic for: Dragon **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
if (forward_site == 'PTer' || forward_site == 'Dragon' || forward_site == 'QingWa' || forward_site == 'MTeam') {
      function re_build_name(channels, name) {
        var label = ''; label_str = '';
        if (channels == '1') {
          label = /1\.0/; label_str = '1.0';
        } else if (channels == '2') {
          label = /2\.0/; label_str = '2.0';
        } else if (channels == '6') {
          label = /5\.1/; label_str = '5.1';
        } else if (channels == '8') {
          label = /7\.1/; label_str = '7.1';
        }
        if (!name.match(label)) {
          name = name.replace(/(DDP|DD\+|AAC|FLAC|LPCM|TrueHD|DTS-HD.MA|DTS:X|DTS-HD.?HR|DTS|AC3)/i, `$1 ${label_str}`);
        }
        return name;
      }
      try {
        var channels = (raw_info.descr + raw_info.full_mediainfo).match(/Channel.*?(\d) channel/)[1];
        raw_info.name = re_build_name(channels, raw_info.name);
      } catch (err) {
        if (raw_info.descr.match(/(AUDIO.*CODEC.*?|音频.*?)(2\.0|1\.0|5\.1|7\.1)/i)) {
          channels = raw_info.descr.match(/(AUDIO.*CODEC.*?|音频.*?)(2\.0|1\.0|5\.1|7\.1)/i)[2];
          if (!raw_info.name.includes(channels)) {
            raw_info.name = raw_info.name.replace(/(DDP|AAC|FLAC|LPCM|TrueHD|DTS-HD.MA|DTS:X|DTS-HD.?HR|DTS|AC3|DD)/i, `$1 ${channels}`);
          }
        } else if (raw_info.descr.match(/\d channels/i)) {
          channels = raw_info.descr.match(/(\d) channels/i)[1];
          raw_info.name = re_build_name(channels, raw_info.name);
        }
      }
      if (raw_info.name.match(/WEB-DL/i)) {
        raw_info.name = raw_info.name.replace(/HEVC/, 'H.265').replace(/AVC/, 'H.264');
      }
      if (forward_site == 'MTeam') {
        raw_info.name = raw_info.name.replace(/AC3/, 'DD');
        raw_info.name = raw_info.name.replace(/DD\+/, 'DDP');
        try {
          var audio_number = 1;
          if (raw_info.descr.match(/DISC INFO:/)) {
            if (raw_info.descr.match(/Audio:[\s\S]{0,20}Codec/i)) {
              var audio_info = raw_info.descr.match(/Audio:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/subtitles/i)[0].trim();
              audio_number = audio_info.split('\n').length;
            }
          } else {
            if (raw_info.descr.match(/Audio:(.*)/i)) {
              audio_number = raw_info.descr.match(/Audio:(.*)/ig).length;
            } else if (raw_info.descr.match(/Audio #\d/)) {
              audio_number = raw_info.descr.match(/Audio #\d/ig).length;
            }
          }
          if (audio_number > 1) {
            var audio_str = `${audio_number}Audio`;
            if (!raw_info.name.includes(audio_str)) {
              raw_info.name = raw_info.name.replace(/(DDP|AAC|FLAC|LPCM|TrueHD|DTS-HD.?MA|DTS:X|DTS-HD.?HR|DTS|DD) ?(\d\.\d)?/i, `$1 $2 ${audio_str}`);
            }
          }
        } catch (err) { }

      }
    }

// --- From Module: 19_forward_site_filling3.js (Snippet 2) ---
else if (forward_site == 'Dragon') {
      var browsecat = document.getElementsByName('type')[0];
      switch (raw_info.type) {
        case '电影': browsecat.options[1].selected = true; break;
        case '剧集': browsecat.options[2].selected = true; break;
        case '游戏': browsecat.options[3].selected = true; break;
        case '纪录': browsecat.options[4].selected = true; break;
        case '动漫': browsecat.options[5].selected = true; break;
        case '综艺': browsecat.options[6].selected = true; break;
        case '音乐': browsecat.options[9].selected = true; break;
        case 'MV': browsecat.options[7].selected = true; break;
        case '体育': browsecat.options[8].selected = true; break;
        case '学习': browsecat.options[11].selected = true; break;
        case '软件': browsecat.options[11].selected = true;
      }

      //媒介
      var medium_box = document.getElementsByName('medium_sel')[0];
      medium_box.options[9].selected = true;
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.options[1].selected = true; break;
        case 'Blu-ray': medium_box.options[2].selected = true; break;
        case 'DVD': medium_box.options[6].selected = true; break;
        case 'Remux': medium_box.options[3].selected = true; break;
        case 'HDTV': medium_box.options[7].selected = true; break;
        case 'Encode': medium_box.options[4].selected = true; break;
        case 'WEB-DL': medium_box.options[5].selected = true; break;
        case 'CD': medium_box.options[8].selected = true; break;
      }

      var codec_box = document.getElementsByName('codec_sel')[0];
      codec_box.options[5].selected = true;
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.options[2].selected = true; break;
        case 'H264': case 'X264': codec_box.options[1].selected = true; break;
        case 'VC-1': codec_box.options[3].selected = true; break;
        case 'MPEG-2': case 'MPEG-4': codec_box.options[4].selected = true;
      }

      var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
      audiocodec_box.options[15].selected = true;
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': audiocodec_box.options[1].selected = true; break;
        case 'DTS-HDMA:X 7.1': audiocodec_box.options[3].selected = true; break;
        case 'DTS-HDMA': audiocodec_box.options[4].selected = true; break;
        case 'DTS-HDHR': audiocodec_box.options[5].selected = true; break;
        case 'TrueHD': audiocodec_box.options[2].selected = true; break;
        case 'Atmos': audiocodec_box.options[1].selected = true; break;
        case 'LPCM': audiocodec_box.options[10].selected = true; break;
        case 'DTS': audiocodec_box.options[6].selected = true; break;
        case 'AC3': audiocodec_box.options[9].selected = true; break;
        case 'AAC': audiocodec_box.options[8].selected = true; break;
        case 'Flac': audiocodec_box.options[7].selected = true; break;
        case 'APE': audiocodec_box.options[13].selected = true; break;
        case 'WAV': audiocodec_box.options[14].selected = true;
      }

      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = { '8K': 1, '4K': 2, '1080p': 4, '1080i': 4, '720p': 5, 'SD': 6, '': 6 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
    }

