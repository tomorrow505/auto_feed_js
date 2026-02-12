/** Consolidated Logic for: HDSky **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
else if (origin_site == 'HDSky') {
        raw_info.torrent_name = $('input[value*=".torrent"]').val();
        raw_info.torrent_url = $('a[href*="download.php"]').attr('href');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 2) ---
if (forward_site == "HDSky") {
      var tmp_small_descr = raw_info.small_descr.split('| 类别：');
      if (tmp_small_descr.length == 1) {
        tmp_small_descr = tmp_small_descr[0];
      } else {
        var plus_info = tmp_small_descr[1].replace('【', '[').replace('】', ']');
        plus_info = plus_info.match(/\[.*\]/) ? plus_info.match(/\[.*\]/)[0] : '';
        tmp_small_descr = tmp_small_descr[0] + plus_info;
      }
      raw_info.small_descr = tmp_small_descr.replace(/([\s]\/)/ig, '/');
      raw_info.small_descr = raw_info.small_descr.replace(/(\/[\s])/ig, '/');
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
if (forward_site == 'HDSky' && ['纪录', '动漫'].indexOf(raw_info.type) > -1) {
      raw_info.small_descr = (raw_info.type == "纪录" ? `[${raw_info.type}]` : '[动画]') + ' ' + raw_info.small_descr;
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 4) ---
if (forward_site == 'HDSky' && ['剧集'].indexOf(raw_info.type) > -1) {
      if (raw_info.name.match(/s(\d+)/i)) {
        if (raw_info.name.match(/s?(\d+)-s?(\d+)/i)) {
          [s1, s2] = raw_info.name.match(/ep?(\d+)-ep?(\d+)/i).slice(1, 3);
          raw_info.small_descr = raw_info.small_descr + ` [第${parseInt(s1)}-${parseInt(s2)}季]`;
        } else {
          var season = raw_info.name.match(/s(\d+)/i)[1];
          raw_info.small_descr = raw_info.small_descr + ` [第${parseInt(season)}季]`;
          if (!raw_info.name.match(/e(p)?(\d+)/i) && raw_info.descr.match(/◎集.*数.*?(\d+)/)) {
            var number = raw_info.descr.match(/◎集.*数.*?(\d+)/)[1];
            raw_info.small_descr = raw_info.small_descr + `[${parseInt(number)}集全]`;
          }
        }
      }
      if (raw_info.name.match(/e(p)?(\d+)/i)) {
        if (raw_info.name.match(/ep?(\d+)-ep?(\d+)/i)) {
          [ep1, ep2] = raw_info.name.match(/ep?(\d+)-ep?(\d+)/i).slice(1, 3);
          raw_info.small_descr = raw_info.small_descr + ` [第${parseInt(ep1)}-${parseInt(ep2)}集]`;
        } else {
          var episode = raw_info.name.match(/e(p)?(\d+)/i).pop();
          raw_info.small_descr = raw_info.small_descr + ` [第${parseInt(episode)}集]`;
        }
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 5) ---
case 'HDSky':
          if (labels.diy) {
            $('input[name="option_sel[]"][value="13"]').attr('checked', true);
          } else if (labels.yp) {
            $('input[name="option_sel[]"][value=28]').attr('checked', true);
          }
          if (labels.gy) { $('input[name="option_sel[]"][value="5"]').attr('checked', true); }
          if (labels.yy) { $('input[name="option_sel[]"][value="11"]').attr('checked', true); }
          if (labels.zz) { $('input[name="option_sel[]"][value="6"]').attr('checked', true); }
          if (raw_info.small_descr.match(/特效字幕/)) { $('input[name="option_sel[]"][value="20"]').attr('checked', true); }
          if (labels.db && (labels.hdr10plus || labels.hdr10)) {
            $('input[name="option_sel[]"][value="24"]').attr('checked', true);
          } else if (labels.db) {
            $('input[name="option_sel[]"][value="15"]').attr('checked', true);
          } else if (labels.hdr10plus) {
            $('input[name="option_sel[]"][value="17"]').attr('checked', true);
          } else if (labels.hdr10) {
            $('input[name="option_sel[]"][value="9"]').attr('checked', true);
          }
          if (raw_info.descr.match(/atmos /i)) {
            $('input[name="option_sel[]"][value=21]').attr('checked', true);
          }
          break;

// --- From Module: 19_forward_site_filling3.js (Snippet 6) ---
else if (forward_site == 'HDSky') {
      try {
        var browsecat = document.getElementsByName('type')[0];
        switch (raw_info.type) {
          case '电影': browsecat.options[1].selected = true; break;
          case '剧集': browsecat.options[6].selected = true; break;
          case '纪录': browsecat.options[2].selected = true; break;
          case '动漫': browsecat.options[4].selected = true; break;
          case '综艺': browsecat.options[7].selected = true; break;
          case '音乐': browsecat.options[10].selected = true; break;
          case 'MV': browsecat.options[8].selected = true; break;
          case '体育': browsecat.options[9].selected = true; break;
          default: browsecat.options[11].selected = true;

        }
        if (raw_info.name.match(/(pad$|ipad)/i)) {
          browsecat.options[3].selected = true;
        }

        //音频编码
        var audiocodec_dict = {
          'Flac': 1, 'APE': 2, 'DTS': 3, 'AC3': 12, 'WAV': 15, 'MP3': 4, 'DTS-HDHR': 14,
          'AAC': 6, 'DTS-HDMA': 10, 'Atmos': 17, 'TrueHD': 11, 'LPCM': 13
        };
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
          var index = audiocodec_dict[raw_info.audiocodec_sel];
          $('select[name="audiocodec_sel"]').val(index)
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 0 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
          var index = standard_dict[raw_info.standard_sel];
          standard_box.options[index].selected = true;
        }

        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        var codec_dict = { 'H264': 1, 'X265': 2, 'X264': 3, 'H265': 4, 'VC-1': 5, 'MPEG-2': 6, 'Xvid': 7, '': 8 };
        if (codec_dict.hasOwnProperty(raw_info.codec_sel)) {
          var index = codec_dict[raw_info.codec_sel];
          codec_box.options[index].selected = true;
        }
        //单独对x264和x265匹配
        if (raw_info.codec_sel == 'H264') {
          if (raw_info.name.match(/X264/i)) {
            codec_box.options[3].selected = true;
          }
        }
        if (raw_info.codec_sel == 'H265') {
          if (raw_info.name.match(/X265/i)) {
            codec_box.options[2].selected = true;
          }
        }

        //媒介
        var medium_box = document.getElementsByName('medium_sel')[0];
        var medium_dict = { 'UHD': 1, 'Blu-ray': 3, 'Encode': 6, 'HDTV': 7, 'WEB-DL': 12, 'Remux': 5, 'CD': 9 };
        if (medium_dict.hasOwnProperty(raw_info.medium_sel)) {
          var index = medium_dict[raw_info.medium_sel];
          medium_box.options[index].selected = true;
        }
        switch (raw_info.medium_sel) {
          case 'UHD':
            if (raw_info.name.match(/(diy|@)/i)) {
              medium_box.options[2].selected = true;
            }
            break;
          case 'Blu-ray':
            if (raw_info.name.match(/(diy|@)/i)) {
              medium_box.options[4].selected = true;
            }
        }

        // 制作组
        document.getElementsByName('team_sel')[0].options[10].selected = true;
      } catch (err) { }
    }

