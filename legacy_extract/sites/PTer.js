/** Consolidated Logic for: PTer **/

// --- From Module: 09_data_processing.js (Snippet 1) ---
if (!raw_info.codec_sel || forward_site == 'PTer') {
    if (raw_info.descr.match(/Writing library.*(x264|x265)/)) {
      raw_info.codec_sel = raw_info.descr.match(/Writing library.*(x264|x265)/)[1].toUpperCase();
      if (raw_info.name.match(/H.?26[45]/)) {
        raw_info.name = raw_info.name.replace(/H.?26[45]/i, raw_info.codec_sel.toLowerCase())
      }
    } else if (raw_info.descr.match(/Video[\s\S]*?Format.*?HEVC/i)) {
      raw_info.codec_sel = 'H265';
    } else if (raw_info.descr.match(/Video[\s\S]*?Format.*?AVC/i)) {
      raw_info.codec_sel = 'H264';
    } else if (raw_info.descr.match(/XviD/i)) {
      raw_info.codec_sel = 'XVID';
    } else if (raw_info.descr.match(/DivX/i)) {
      raw_info.codec_sel = 'DIVX';
    } else if (raw_info.descr.match(/Video[\s\S]*?Format.*?MPEG Video[\s\S]{1,10}Format Version.*?Version 4/i)) {
      raw_info.codec_sel = 'MPEG-4';
    } else if (raw_info.descr.match(/Video[\s\S]*?Format.*?MPEG Video[\s\S]{1,10}Format Version.*?Version 2/i)) {
      raw_info.codec_sel = 'MPEG-2';
    }
  }

// --- From Module: 12_site_ui_helpers.js (Snippet 2) ---
if (used_signin_sites.indexOf('PTer') > -1) {
        getJson('https://pterclub.net/attendance-ajax.php', null, function (data) {
          if (typeof data == 'object') {
            console.log(`开始签到猫站：`, data);
            $(`input[kname=PTer]`).parent().find('a').css({ "color": "red" });
          } else if (data.match(/该页面必须在登录后才能访问/)) {
            console.log(`开始签到猫站：`, '失败，请重新登录！！！');
            $(`input[kname=PTer]`).parent().find('a').css({ "color": "blue" });
          }
        });
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 3) ---
if ((origin_site == 'PTer' || origin_site == 'FRDS' || origin_site == 'Audiences') && descr.getElementsByTagName('table').length) {
          var descr_table = descr.getElementsByTagName('table');
          var table_num = descr_table.length;
          var table_id = 0;
          while (table_num >= 0) {
            descr_table = descr_table[0];
            if (descr_table.textContent.match(/general/i)) {
              descr_table.parentNode.removeChild(descr_table);
              raw_info.full_mediainfo += $(`div.codemain:contains("General"):eq(${table_id})`).text() + '\n';
              raw_info.full_mediainfo += $(`div.codemain:contains("MPLS"):eq(${table_id})`).text() + '\n';
              if (!raw_info.full_mediainfo.trim()) {
                raw_info.full_mediainfo += $(`div.codemain:contains("DISC INFO"):eq(${table_id})`).text() + '\n';
              }
            }
            descr_table = descr.getElementsByTagName('table');
            if (!descr_table.length) {
              break;
            }
            table_id += 1;
            table_num -= 1;
          }
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
if (origin_site == 'PTer') {
      raw_info.descr = raw_info.descr.replace(/https:\/\/pterclub.net\/link.php\?sign=.*?&target=/ig, '');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (['PTer', 'PThome', 'HDHome', 'HDDolby'].indexOf(origin_site) > -1) {
        var bookmark = document.getElementById('bookmark0');
        while (bookmark.previousElementSibling) {
          bookmark = bookmark.previousElementSibling;
          if (bookmark.nodeName == 'A') {
            raw_info.torrentName = bookmark.textContent.replace('.torrent', '');
            break;
          }
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
case 'PTer':
        try {
          if (!$('a.chs_tag-gy:last').is(":hidden")) {
            raw_info.labels += 1;
          }
          if (!$('a.chs_tag-yy:last').is(":hidden")) {
            raw_info.labels += 10;
          }
          if (!$('a.chs_tag-sub:last').is(":hidden")) {
            raw_info.labels += 100;
          }
        } catch (err) { }
        break;

// --- From Module: 16_origin_site_parsing3.js (Snippet 7) ---
if (origin_site == 'PTer') {
      try { raw_info.url = $('a:contains("http://www.imdb.com")').last().text(); } catch (err) { }
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 8) ---
else if (origin_site == 'PTer' && $('#kdescr').parent().parent().parent().find('a[href*="tag_exclusive=yes"]').length) {
      if_exclusive = true;
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 9) ---
if (forward_site == 'PTer') {
        raw_info.type = '动漫';
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 10) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
if (forward_site == 'PTer') {
          if (raw_info.full_mediainfo) {
            if (raw_info.full_mediainfo.match(/mpls/i)) {
              try {
                raw_info.full_mediainfo = raw_info.full_mediainfo.match(/QUICK SUMMARY:([\s\S]*)/)[1].trim();
              } catch (err) { }
            }
            try {
              var info = get_mediainfo_picture_from_descr(raw_info.descr);
              raw_info.descr = raw_info.descr.replace(info.mediainfo, raw_info.full_mediainfo);
            } catch (err) { }
          }
          try {
            raw_info.descr.match(/\[quote\][\s\S]*?\[\/quote\]/g).map((e) => {
              if (e.match(/General.{0,2}\n?(Unique|Complete name)/)) {
                var ee = e.replace('[quote]', '[hide=mediainfo]').replace('[/quote]', '[/hide]');
                raw_info.descr = raw_info.descr.replace(e, ee);
              } else if (e.match(/Disc Title|Disc Info|Disc Label/)) {
                var ee = e.replace('[quote]', '[hide=bdinfo]').replace('[/quote]', '[/hide]');
                raw_info.descr = raw_info.descr.replace(e, ee);
              }
            });
          } catch (err) { }
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
case 'PTer':
          if (labels.gy) { document.getElementById('guoyu').checked = true; }
          if (labels.yy) { document.getElementById('yueyu').checked = true; }
          if (labels.zz) { document.getElementById('zhongzi').checked = true; }
          if (labels.diy) { document.getElementById('diy').checked = true; }
          if (labels.yz) { document.getElementById('ensub').checked = true; }
          break;

// --- From Module: 18_forward_site_filling2.js (Snippet 13) ---
if (forward_site == 'PTer') {
      var type_dict = {
        '电影': 401, '剧集': 404, '动漫': 403, '综艺': 405, '音乐': 406, '纪录': 402,
        '体育': 407, '软件': 410, '学习': 411, '书籍': 408, 'MV': 413
      };
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        $('select[name="type"]').val(index);
      }

      var source_box = $('select[name=source_sel]');
      switch (raw_info.audiocodec_sel) {
        case 'Flac': source_box.val(8); break;
        case 'WAV': source_box.val(9);
      }
      switch (raw_info.medium_sel) {
        case 'UHD': source_box.val(1); break;
        case 'Blu-ray': source_box.val(2); break;
        case 'Remux': source_box.val(3); break;
        case 'HDTV': source_box.val(4); break;
        case 'WEB-DL': source_box.val(5); break;
        case 'Encode': source_box.val(6); break;
        case 'DVD': source_box.val(7);
      }

      var team_box = $('select[name=team_sel]');
      var team_dict = { '欧美': 4, '大陆': 1, '香港': 2, '台湾': 3, '日本': 6, '韩国': 5, '印度': 7 };
      team_box.val(8);
      if (team_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = team_dict[raw_info.source_sel];
        team_box.val(index);
      }

      $('tr:contains(简介):last').after(`<tr><td style="text-align:right"><b>转换</b></td>
                <td><a id="img2" style="margin-left:5px" href="#">IMG2</a>
                <a id="img3" style="margin-left:5px" href="#">IMG3</a>
                <a id="img4" style="margin-left:5px" href="#">IMG4</a>
                <font style="margin-left:5px" color="red">选中要转换的bbcode图片部分点击即可。</font></td></tr>`);
      $('#img2,#img3').click(function (e) {
        e.preventDefault();
        var text = $('#descr').val();
        var textarea = document.getElementById('descr');
        if (textarea && textarea.selectionStart != undefined && textarea.selectionEnd != undefined) {
          var chosen_value = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
          if (this.id == 'img2') {
            $('#descr').val(text.replace(chosen_value, chosen_value.replace(/\[img\]/g, '[img2]')));
          } else if (this.id == 'img3') {
            $('#descr').val(text.replace(chosen_value, chosen_value.replace(/\[img\]/g, '[img3]')));
          } else if (this.id == 'img4') {
            $('#descr').val(text.replace(chosen_value, chosen_value.replace(/\[img\]/g, '[img4]')));
          }
        }
      })
    }

