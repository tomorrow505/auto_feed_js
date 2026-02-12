/** Consolidated Logic for: HUDBT **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
else if (origin_site == 'HUDBT') {
        title = document.getElementById('page-title');
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
if (origin_site == 'HUDBT') {
      tds = tbody.getElementsByTagName("dt");
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
if (origin_site == 'HUDBT') {
        if (!is_inserted) {
          if (['行为'].indexOf(tds[i].textContent) > -1) {
            table = tds[i].parentNode;
            var dd = document.createElement('dd');
            table.insertBefore(dd, tds[i]);
            var dt = document.createElement('dt');
            dt.textContent = '转载';
            table.insertBefore(dt, dd);
            is_inserted = true;
          }
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
if (origin_site == 'HUDBT') {
          raw_info.small_descr = tds[i].nextSibling.textContent;
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == 'HUDBT') {
            info_text = tds[i].nextSibling.textContent;
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
else if (origin_site == 'HUDBT') {
      forward_r = dd;
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 7) ---
else if (forward_site == 'HUDBT') {
        upload_site = upload_site.replace('offers.php', 'offers.php?add_offer=1');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 8) ---
else if (raw_info.type == '电影' && ['HUDBT', 'MTeam', 'TLFbits', 'PuTao', 'TJUPT', 'NanYang', 'BYR', 'TTG'].indexOf(forward_site) < 0) {
        raw_info.type = '动漫';
      }

// --- From Module: 19_forward_site_filling3.js (Snippet 9) ---
else if (forward_site == 'HUDBT') {
      //类型
      switch (raw_info.type) {
        case '电影':
          if (raw_info.source_sel == '欧美') {
            set_selected_option_by_value('browsecat', '415');
          } else if (raw_info.source_sel == '大陆') {
            set_selected_option_by_value('browsecat', '401');
          } else if (['港台', '香港', '台湾'].indexOf(raw_info.source_sel) > -1) {
            set_selected_option_by_value('browsecat', '413');
          } else if (['日本', '韩国', '日韩', '印度'].indexOf(raw_info.source_sel) > -1) {
            set_selected_option_by_value('browsecat', '414');
          }
          break;
        case '纪录': set_selected_option_by_value('browsecat', '404'); break;
        case '剧集':
          switch (raw_info.source_sel) {
            case '大陆': set_selected_option_by_value('browsecat', '402'); break;
            case '台湾': case '香港': case '港台':
              set_selected_option_by_value('browsecat', '417'); break;
            case '日本': case '韩国': case '日韩': case '印度':
              set_selected_option_by_value('browsecat', '416'); break;
            case '欧美': set_selected_option_by_value('browsecat', '418');
          }
          break;

        case '综艺':
          switch (raw_info.source_sel) {
            case '大陆': set_selected_option_by_value('browsecat', '403'); break;
            case '台湾': case '香港': case '港台':
              set_selected_option_by_value('browsecat', '419');
              break;
            case '日本': case '韩国': case '日韩':
              set_selected_option_by_value('browsecat', '420');
              break;
            case '欧美': set_selected_option_by_value('browsecat', '421');
          }
          break;

        case '动漫': set_selected_option_by_value('browsecat', '405'); break;
        //太乱，随便匹配一个
        case '音乐': set_selected_option_by_value('browsecat', '408'); break;
        case 'MV': set_selected_option_by_value('browsecat', '406'); break;
        case '游戏': set_selected_option_by_value('browsecat', '410'); break;
        case '体育': set_selected_option_by_value('browsecat', '407'); break;
        case '软件': set_selected_option_by_value('browsecat', '411'); break;
        case '学习': set_selected_option_by_value('browsecat', '412'); break;
        case '书籍': $('#browsecat').val(432);
      }

      if (raw_info.name.match(/pad$|ipad/i)) {
        set_selected_option_by_value('browsecat', '430');
      }

      //分辨率
      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = {
        '4K': 6, '1080p': 1, '1080i': 2, '720p': 3, 'SD': 4, '': 0
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
    }

