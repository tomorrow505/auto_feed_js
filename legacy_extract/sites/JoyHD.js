/** Consolidated Logic for: JoyHD **/

// --- From Module: 20_forward_site_filling4.js (Snippet 1) ---
else if (forward_site == 'JoyHD') {

      $('input[name="imdburl"]').val(raw_info.url);
      //类型
      var browsecat = document.getElementsByName('type')[0];
      var type_dict = {
        '电影': 1, '剧集': 2, '动漫': 4, '综艺': 3, '音乐': 5, '纪录': 7,
        '体育': 6, '软件': 9, '学习': 11, '': 12, '游戏': 10, 'MV': 8
      };
      //如果当前类型在上述字典中
      browsecat.options[12].selected = true;//默认其他
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.options[index].selected = true;
      }

      document.getElementById('browsecat').dispatchEvent(evt);
      var medium_box = document.getElementsByName('source_sel')[0];
      switch (raw_info.type) {
        case '电影':
          switch (raw_info.medium_sel) {
            case 'UHD': case 'Blu-ray': medium_box.options[5].selected = true; break;
            case 'DVD': medium_box.options[8].selected = true; break;
            case 'Remux': medium_box.options[6].selected = true; break;
            case 'HDTV': medium_box.options[9].selected = true; break;
            case 'WEB-DL': medium_box.options[4].selected = true; break;
            case 'Encode':
              if (raw_info.standard_sel == '1080p') {
                medium_box.options[2].selected = true;
              } else if (raw_info.standard_sel == '720p') {
                medium_box.options[1].selected = true;
              } else if (raw_info.standard_sel == '4K') {
                medium_box.options[11].selected = true;
              }
              if (raw_info.name.match(/pad$|ipad/i)) {
                medium_box.options[12].selected = true;
              }
              break;
            default:
              if (raw_info.standard_sel == '1080p') {
                medium_box.options[2].selected = true;
              } else if (raw_info.standard_sel == '720p') {
                medium_box.options[1].selected = true;
              } else if (raw_info.standard_sel == '4K') {
                medium_box.options[11].selected = true;
              }
          }
          if (raw_info.name.match(/10bit/)) {
            medium_box.options[3].selected = true;
          } else if (raw_info.name.match(/BDRIP/i)) {
            medium_box.options[10].selected = true;
          }

          break;
        case '剧集':
          switch (raw_info.source_sel) {
            case '大陆': medium_box.options[2].selected = true; break;
            case '台湾': case '香港': case '港台': medium_box.options[3].selected = true; break;
            case '日本': medium_box.options[5].selected = true; break;
            case '韩国': medium_box.options[6].selected = true; break;
            case '欧美': medium_box.options[4].selected = true; break;
          }
          if (raw_info.name.match(/S\d+[^E]|complete/i)) {
            medium_box.options[1].selected = true;
          }
          break;
        case '综艺': medium_box.options[2].selected = true; break;
        case '纪录': medium_box.options[7].selected = true; break;
        case '动漫': medium_box.options[2].selected = true; break;
        case '音乐': medium_box.options[1].selected = true; break;
        case '体育': case '学习': case '软件': medium_box.options[4].selected = true; break;
      }
      $('select[name="team_sel"]').val(13);
      check_team(raw_info, 'team_sel');
    }

