/** Consolidated Logic for: NanYang **/

// --- From Module: 15_origin_site_parsing2.js (Snippet 1) ---
if (origin_site == 'CMCT' || origin_site == 'NanYang' || origin_site == 'CHDBits') {
      raw_info.name = raw_info.name.replace(/\d\.\d\/10.*$/g, '');
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 2) ---
else if (raw_info.type == '电影' && ['HUDBT', 'MTeam', 'TLFbits', 'PuTao', 'TJUPT', 'NanYang', 'BYR', 'TTG'].indexOf(forward_site) < 0) {
        raw_info.type = '动漫';
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
if (['NanYang', 'CMCT', 'iTS', 'NPUPT', 'xthor'].indexOf(forward_site) > -1) {
          allinput[i].value = raw_info.name.replace(/\s/g, ".");
        }

// --- From Module: 19_forward_site_filling3.js (Snippet 4) ---
else if (forward_site == 'NanYang') {
      var browsecat = document.getElementById('browsecat');
      var type_dict = {
        '电影': 1, '剧集': 2, '动漫': 3, '综艺': 4, '音乐': 7, '纪录': 6,
        '体育': 5, '软件': 9, '学习': 8, '': 11, 'MV': 7
      };
      //如果当前类型在上述字典中
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.options[index].selected = true;
      }
    }

