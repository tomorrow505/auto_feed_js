/** Consolidated Logic for: HDU **/

// --- From Module: 12_site_ui_helpers.js (Snippet 1) ---
if (used_signin_sites.indexOf('HDU') > -1) {
        GM_xmlhttpRequest({
          method: "POST",
          url: `https://pt.upxin.net/added.php`,
          data: encodeURI("action=qiandao"),
          headers: {
            "Accept": '*/*',
            "Accept-Encoding": 'gzip, deflate, br',
            "Accept-Language": 'zh-CN,zh;q=0.9,tr;q=0.8,en-US;q=0.7,en;q=0.6',
            "Cache-Control": 'no-cache',
            "Connection": 'keep-alive',
            "Content-Length": '14',
            "Content-type": 'application/x-www-form-urlencoded',
            "Host": 'pt.upxin.net',
            "Origin": 'https://pt.upxin.net',
            "Pragma": 'no-cache',
            "Referer": 'https://pt.upxin.net/index.php',
            "sec-ch-ua": '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            "sec-ch-ua-mobile": '?0',
            "sec-ch-ua-platform": '"Windows"',
            "Sec-Fetch-Dest": 'empty',
            "Sec-Fetch-Mode": 'cors',
            "Sec-Fetch-Site": 'same-origin',
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36'
          },
          onload: function (response) {
            var data = response.responseText;
            console.log(data)
          }
        });
        setTimeout(function () {
          getDoc('https://pt.upxin.net/', null, function (doc) {
            if ($('span:contains(已签到)', doc).length) {
              $(`input[kname=HDU]`).parent().find('a').css({ "color": "red" });
              console.log(`开始签到HDU：`, '成功！！！');
            } else if ($('#nav_block', doc).length) {
              $(`input[kname=HDU]`).parent().find('a').css({ "color": "DarkOrange" });
              console.log(`开始登录HDU：`, '成功！！！');
            } else {
              $(`input[kname=HDU]`).parent().find('a').css({ "color": "blue" });
              console.log(`开始登录HDU：`, '失败！！！');
            }
          });
        }, 2000);
      }

// --- From Module: 19_forward_site_filling3.js (Snippet 2) ---
else if (forward_site == 'HDU') {
      var browsecat = document.getElementsByName('type')[0];
      var type_dict = {
        '电影': 1, '剧集': 2, '动漫': 5, '综艺': 3, '音乐': 8, '纪录': 4,
        '体育': 7, '软件': 9, '学习': 9, '': 9, '游戏': 10, 'MV': 6
      };
      browsecat.options[9].selected = true;//默认其他
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.options[index].selected = true;
      }

      var medium_box = document.getElementsByName('medium_sel')[0];
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.options[2].selected = true; break;
        case 'Blu-ray': medium_box.options[1].selected = true; break;
        case 'DVD': medium_box.options[4].selected = true; break;
        case 'Remux':
          if (raw_info.standard_sel == '4K' && raw_info.type == '剧集') {
            medium_box.options[7].selected = true; break;
          } else if (raw_info.standard_sel == '4K') {
            medium_box.options[6].selected = true; break;
          } else if (raw_info.type == '剧集') {
            medium_box.options[8].selected = true; break;
          } else {
            medium_box.options[5].selected = true;
          }
          break;
        case 'HDTV': medium_box.options[3].selected = true; break;
        case 'WEB-DL':
          if (raw_info.type == '剧集') {
            medium_box.options[12].selected = true; break;
          } else {
            medium_box.options[11].selected = true; break;
          }
        case 'Encode':
          if (raw_info.type == '剧集') {
            medium_box.options[10].selected = true;
          } else {
            medium_box.options[9].selected = true;
          }
          break;
        case 'CD': medium_box.options[14].selected = true;
        default: medium_box.options[9].selected = true;
      }

      var codec_box = document.getElementsByName('codec_sel')[0];
      switch (raw_info.codec_sel) {
        case 'H264': codec_box.options[1].selected = true; break;
        case 'X264': codec_box.options[4].selected = true; break;
        case 'H265': codec_box.options[2].selected = true; break;
        case 'X265': codec_box.options[2].selected = true; break;
        case 'VC-1': codec_box.options[3].selected = true; break;
        case 'MPEG-2': codec_box.options[6].selected = true; break;
        case 'XVID': codec_box.options[5].selected = true; break;
        default: codec_box.options[7].selected = true;
      }

      var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
      var audiocodec_dict = {
        'TrueHD': 3, 'Atmos': 3, 'DTS': 5, 'DTS-HD': 6, 'DTS-HDMA': 2, 'DTS-HDMA:X 7.1': 1, 'WAV': 10,
        'AC3': 6, 'LPCM': 4, 'Flac': 8, 'MP3': 10, 'AAC': 7, 'APE': 9, '': 11, 'DTS-HDHR': 5
      };
      if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
        var index = audiocodec_dict[raw_info.audiocodec_sel];
        audiocodec_box.options[index].selected = true;
      }

      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = { '4K': 3, '1080p': 1, '1080i': 2, '720p': 4, 'SD': 5, '': 5 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
      if (raw_info.name.match(/(pad$|ipad)/i)) {
        standard_box.options[6].selected = true;
      }

      var source_box = document.getElementsByName('processing_sel')[0];
      var source_dict = {
        '欧美': 3, '大陆': 1, '香港': 2, '台湾': 2, '日本': 4, '韩国': 5, '日韩': 5,
        '印度': 6, '': 8, '港台': 2
      };
      if (source_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = source_dict[raw_info.source_sel];
        source_box.options[index].selected = true;
      }

      $('select[name="team_sel"]').val(5);
    }

