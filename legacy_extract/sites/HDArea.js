/** Consolidated Logic for: HDArea **/

// --- From Module: 12_site_ui_helpers.js (Snippet 1) ---
if (used_signin_sites.indexOf('HDArea') > -1) {
        postData('https://hdarea.club/sign_in.php', encodeURI('action=sign_in'), function (data) {
          if (data.match(/该页面必须在登录后才能访问/)) {
            console.log(`开始签到HDArea：`, '失败，请重新登录！！！');
            $(`input[kname=HDArea]`).parent().find('a').css({ "color": "blue" });
          } else {
            console.log(`开始签到HDArea：`, data);
            $(`input[kname=HDArea]`).parent().find('a').css({ "color": "red" });
          }
        });
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'TTG' || origin_site == 'PuTao' || origin_site == 'OpenCD' || origin_site == 'HDArea') {
        title = document.getElementsByTagName("h1")[0];
        if ($(title).text().match(/上传成功|编辑成功|发布成功/)) {
          title = document.getElementsByTagName("h1")[1];
        }
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 3) ---
else if (origin_site == 'HDArea') {
        raw_info.torrent_url = $('td:contains("passkey"):last').text().split("链接")[0];
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 4) ---
if (origin_site == 'HDArea') {
            raw_info.torrent_url = $('td:contains(下载链接)').next().text().split('链接')[0];
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == 'HDArea') {
      let searchIndex = raw_info.descr.search(/\[quote\]\[color=red\]\[size=2\]\[font=Tahoma\] 本站列出的文件并没有保存在本站的服务器上/);
      if (searchIndex !== -1) {
        raw_info.descr = raw_info.descr.slice(0, searchIndex);
      }

      let needRemovedStr = '\n HDARAEA详情页 \n\n';
      if (raw_info.descr.startsWith(needRemovedStr)) {
        raw_info.descr = raw_info.descr.slice(needRemovedStr.length);
      }
    }

// --- From Module: 19_forward_site_filling3.js (Snippet 6) ---
else if (forward_site == 'HDArea') {
      try {
        //类型
        switch (raw_info.type) {
          case '电影':
            if (raw_info.medium_sel == 'UHD') {
              set_selected_option_by_value('browsecat', '300');
            } else if (raw_info.medium_sel == 'Blu-ray') {
              set_selected_option_by_value('browsecat', '401');
            } else if (raw_info.medium_sel == 'Remux') {
              set_selected_option_by_value('browsecat', '415');
            } else if (raw_info.medium_sel == 'WEB-DL') {
              set_selected_option_by_value('browsecat', '412');
            } else if (raw_info.medium_sel == 'HDTV') {
              set_selected_option_by_value('browsecat', '413');
            } else if (raw_info.medium_sel == 'DVD') {
              set_selected_option_by_value('browsecat', '414');
            } else {
              if (raw_info.name.match(/pad$|ipad/i)) {
                set_selected_option_by_value('browsecat', '417');
              } else {
                if (raw_info.standard_sel == '4K') {
                  set_selected_option_by_value('browsecat', '300');
                } else if (raw_info.standard_sel == '1080p') {
                  set_selected_option_by_value('browsecat', '410');
                } else if (raw_info.standard_sel == '720p') {
                  set_selected_option_by_value('browsecat', '411');
                }
              }
            }
            break;
          case '剧集': set_selected_option_by_value('browsecat', '402'); break;
          case '纪录': set_selected_option_by_value('browsecat', '404'); break;
          case '动漫': set_selected_option_by_value('browsecat', '405'); break;
          case '综艺': set_selected_option_by_value('browsecat', '403'); break;
          case '音乐': set_selected_option_by_value('browsecat', '408'); break;
          case 'MV': set_selected_option_by_value('browsecat', '406'); break;
          case '体育': set_selected_option_by_value('browsecat', '407'); break;
          default:
            set_selected_option_by_value('browsecat', '409');
        }

        //媒介
        var medium_box = document.getElementsByName('medium_sel')[0];
        switch (raw_info.medium_sel) {
          case 'UHD': case 'Blu-ray': medium_box.options[1].selected = true; break;
          case 'Remux': medium_box.options[2].selected = true; break;
          case 'Encode': medium_box.options[3].selected = true; break;
          case 'HDTV': medium_box.options[6].selected = true; break;
          case 'WEB-DL': medium_box.options[4].selected = true; break;
          case 'DVD': medium_box.options[8].selected = true; break;
          case 'CD': medium_box.options[9].selected = true;
        }
        if (raw_info.name.match(/MiniBD/i)) {
          medium_box.options[5].selected = true;
        }

        //视频编码
        var codec_box = document.getElementsByName('codec_sel')[0];
        codec_box.options[6].selected = true;
        switch (raw_info.codec_sel) {
          case 'H264': case 'MPEG-4': codec_box.options[2].selected = true; break;
          case 'H265': case 'X265': codec_box.options[3].selected = true; break;
          case 'VC-1': codec_box.options[6].selected = true; break;
          case 'MPEG-2': codec_box.options[4].selected = true; break;
          case 'X264': codec_box.options[1].selected = true; break;
          case 'XVID': codec_box.options[5].selected = true;
        }
        //单独对x264匹配
        if (raw_info.codec_sel == 'H264') {
          if (raw_info.name.match(/X264/i)) {
            codec_box.options[1].selected = true;
          }
        }

        //音频编码
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        var audiocodec_dict = {
          'AAC': 1, 'AC3': 2, 'TrueHD': 3, 'DTS-HDHR': 5,
          'DTS': 4, 'DTS-HD': 5, 'DTS-HDMA': 5, 'DTS-HDMA:X 7.1': 5,
          'LPCM': 6, 'WAV': 7, 'APE': 8, 'Flac': 9, 'Atmos': 10
        };
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
          var index = audiocodec_dict[raw_info.audiocodec_sel];
          audiocodec_box.options[index].selected = true;
        }
        if (raw_info.audiocodec_sel == 'AC3') {
          if (raw_info.name.match(/(DD|DD\+|AC3|).*?2.0/i)) {
            audiocodec_box.options[11].selected = true;
          }
        }

        //分辨率
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = { '4K': 5, '1080p': 2, '1080i': 4, '720p': 1, 'SD': 3 };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
          var index = standard_dict[raw_info.standard_sel];
          standard_box.options[index].selected = true;
        }

        $('select[name="team_sel"]').val(6);
        check_team(raw_info, 'team_sel');
      } catch (err) { }
    }

