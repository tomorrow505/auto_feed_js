/** Consolidated Logic for: QingWa **/

// --- From Module: 03_configuration.js (Snippet 1) ---
else if (default_site_info[key].url != used_site_info[key].url && ['AGSV', 'QingWa', 'MTeam'].indexOf(key) < 0) {
      used_site_info[key].url = default_site_info[key].url
    }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'QingWa') {
        if ($('#kimdb').length) {
          raw_info.url = match_link('imdb', $('#kimdb').html());
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
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

// --- From Module: 18_forward_site_filling2.js (Snippet 4) ---
case 'QingWa':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[4][]'), '8'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) {
            check_label(document.getElementsByName('tags[4][]'), '4');
          } else if (labels.yp) {
            check_label(document.getElementsByName('tags[4][]'), '11');
          }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '14'); }
          if (labels.hdr10) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '13'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '12'); }
          if (raw_info.medium_sel == 'Remux') { check_label(document.getElementsByName('tags[4][]'), '15'); }
          break;

// --- From Module: 20_forward_site_filling4.js (Snippet 5) ---
else if (forward_site == 'QingWa') {
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
      medium_box.val(6);
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(1); break;
        case 'Blu-ray': medium_box.val(8); break;
        case 'Remux': medium_box.val(9); break;
        case 'Encode': medium_box.val(10); break;
        case 'WEB-DL': medium_box.val(7); break;
        case 'HDTV': medium_box.val(4); break;
        case 'DVD': medium_box.val(2); break;
        case 'CD': medium_box.val(3); break;
      }

      //编码
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(6); break;
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'MPEG-4': codec_box.val(3); break;
        case 'VP9': codec_box.val(8); break;
        case 'AV1': codec_box.val(7); break;
      }

      //分辨率
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = { '8K': 6, '4K': 7, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '': 5 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }

      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      audiocodec_box.val(7);
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': audiocodec_box.val(5); break;
        case 'DTS-HDMA:X 7.1': audiocodec_box.val(9); break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(10); break;
        case 'TrueHD': audiocodec_box.val(12); break;
        case 'DTS': audiocodec_box.val(14); break;
        case 'AC3':
          audiocodec_box.val(15);
          if (raw_info.name.match(/DD[P\+]/)) {
            audiocodec_box.val(16);
          }
          break;
        case 'AAC': audiocodec_box.val(17); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'APE': audiocodec_box.val(18); break;
        case 'LPCM': audiocodec_box.val(13); break;
        case 'OPUS': audiocodec_box.val(20); break;
        case 'WAV': audiocodec_box.val(19); break;
        case 'Atmos':
          var info_plus = raw_info.name + raw_info.descr + $('textarea[name="technical_info"]').val();
          if (info_plus.match(/True.?HD/i)) {
            audiocodec_box.val(11);
          }
          break;
        case 'MP3': audiocodec_box.val(4); break;
      }

      //制作组
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
    }

