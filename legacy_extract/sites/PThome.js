/** Consolidated Logic for: PThome **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (origin_site == 'PThome' || origin_site == 'Audiences' || origin_site == 'OurBits') {
        try {
          var mediainfo1 = document.getElementsByClassName("codemain").pop();
          if (origin_site != 'OurBits') {
            mediainfo1 = mediainfo1.getElementsByTagName('font')[0];
          }
          mediainfo1 = walkDOM(mediainfo1.cloneNode(true));
          mediainfo1 = mediainfo1.replace(/(<div class="codemain">|<\/div>|\[\/?(font|size|color).*?\])/g, '');
          mediainfo1 = mediainfo1.replace(/<br>/g, '\n');
          raw_info.full_mediainfo = mediainfo1;
          raw_info.descr = "";
        } catch (err) {
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 3) ---
else if (['HDDolby', 'HDHome', 'PThome', 'Audiences'].indexOf(origin_site) > -1) {
      if ($('tr:contains("标签"):last').find('span.txz').length || $('tr:contains("标签"):last').find('span.tjz').length) {
        if_exclusive = true;
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 4) ---
case 'PThome': case 'HDHome': case 'Audiences':
          if (labels.gy) { check_label(document.getElementsByName('tags[]'), 'gy'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[]'), 'yy'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[]'), 'zz'); }
          if (labels.diy) {
            check_label(document.getElementsByName('tags[]'), 'diy');
          } else {
            if (labels.yp && forward_site == 'HDHome') {
              check_label(document.getElementsByName('tags[]'), 'ybyp');
            }
          }
          if (labels.hdr10) { check_label(document.getElementsByName('tags[]'), 'hdr10'); }
          if (labels.hdr10plus) { check_label(document.getElementsByName('tags[]'), 'hdrm'); }
          if (labels.db) { check_label(document.getElementsByName('tags[]'), 'db'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[]'), 'wj'); }
          break;

// --- From Module: 18_forward_site_filling2.js (Snippet 5) ---
else if (forward_site == 'PThome' || forward_site == 'Audiences') {
      var browsecat = $('#browsecat');
      if (forward_site == 'PThome') {
        var type_dict = {
          '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
          '体育': 407, '软件': 411, '学习': 412, '游戏': 410, 'MV': 408,
        };
      } else {
        var type_dict = {
          '电影': 401, '剧集': 402, '动漫': 409, '综艺': 403, '音乐': 408, '纪录': 406,
          '体育': 407, '软件': 411, '学习': 412, '游戏': 410, '书籍': 405, 'MV': 108
        };
        if (raw_info.type == '动漫') {
          type_dict['动漫'] = 401;
          if (raw_info.name.match(/S\d+|E\d+/) || raw_info.descr.match(/◎集.*?数.*?\d+/)) {
            type_dict['动漫'] = 402;
          }
          $('input[name="tags[]"][value="dh"]').attr('checked', true);
        }
        if (raw_info.type == '动漫' || raw_info.descr.match(/◎类.*?别.*动画/)) {
          $('#qr').parent().append('<font color="red" style="margin-left:5px"><b> 疑似动画，确认是否剧集并勾选标签。</b></font>')
        }
      }
      browsecat.val(409);
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }

      document.getElementById('browsecat').dispatchEvent(evt);

      if (raw_info.type == '书籍' && forward_site == 'PThome') {
        $('#specialcat').val(508);
        if (raw_info.descr.match(/m4a|mp3/i)) {
          $('#specialcat').val(507);
          raw_info.audiocodec_sel = raw_info.descr.match(/m4a|mp3/i)[0].toUpperCase();
        }
        document.getElementById('specialcat').dispatchEvent(evt);
      }
      if (raw_info.type == '书籍' && forward_site == 'Audiences' && raw_info.descr.match(/m4a|mp3/i)) {
        raw_info.audiocodec_sel = raw_info.descr.match(/m4a|mp3/i)[0].toUpperCase();
        browsecat.val(404);
      }

      var medium_box = $('select[name="medium_sel"]');
      medium_box.val(11);
      switch (raw_info.medium_sel) {
        case 'UHD':
          if (raw_info.name.match(/DIY|@/i)) {
            medium_box.val(13);
          } else {
            medium_box.val(12);
          }
          break;
        case 'Blu-ray':
          if (raw_info.name.match(/DIY|@/i)) {
            medium_box.val(14);
          } else {
            medium_box.val(1);
          }
          break;
        case 'DVD': medium_box.val(2); break;
        case 'Remux': medium_box.val(3); break;
        case 'HDTV': medium_box.val(5); break;
        case 'Encode': medium_box.val(15); break;
        case 'WEB-DL': medium_box.val(10); break;
        case 'CD': medium_box.val(8);
      }

      //视频编码
      var codec_box = $('select[name="codec_sel"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(6); break;
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'VC-1': codec_box.val(2); break;
        case 'MPEG-2': case 'MPEG-4': codec_box.val(4);
      }

      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel"]');
      audiocodec_box.val(7);
      console.log(raw_info.audiocodec_sel)
      if (forward_site == 'PThome') {
        switch (raw_info.audiocodec_sel) {
          case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(19); break;
          case 'TrueHD': case 'Atmos': audiocodec_box.val(20); break;
          case 'LPCM': audiocodec_box.val(21); break;
          case 'DTS': audiocodec_box.val(3); break;
          case 'AC3': audiocodec_box.val(18); break;
          case 'AAC': audiocodec_box.val(6); break;
          case 'Flac': audiocodec_box.val(1); break;
          case 'APE': audiocodec_box.val(2); break;
          case 'WAV': audiocodec_box.val(22); break;
          case 'MP3': audiocodec_box.val(23); break;
          case 'M4A': audiocodec_box.val(24);
        }
        if (raw_info.name.match(/Atmos/i)) {
          audiocodec_box.val(20);
        }
      } else {
        switch (raw_info.audiocodec_sel) {
          case 'DTS-HDMA:X 7.1': case 'DTS-X': audiocodec_box.val(25); break;
          case 'DTS-HD': case 'DTS-HDMA': audiocodec_box.val(19); break;
          case 'TrueHD': audiocodec_box.val(20); break;
          case 'Atmos': audiocodec_box.val(26); break;
          case 'LPCM': audiocodec_box.val(21); break;
          case 'DTS': case 'DTS-HDHR': audiocodec_box.val(3); break;
          case 'AC3': audiocodec_box.val(18); break;
          case 'AAC': audiocodec_box.val(6); break;
          case 'Flac': audiocodec_box.val(1); break;
          case 'APE': audiocodec_box.val(2); break;
          case 'WAV': audiocodec_box.val(22); break;
          case 'MP3': audiocodec_box.val(23); break;
          case 'M4A': audiocodec_box.val(24);
        }
      }
      $('select[name="team_sel"]').val("5");
      check_team(raw_info, 'team_sel');

      //分辨率
      var standard_box = document.getElementsByName('standard_sel')[0];
      var standard_dict = {
        '8K': 1, '4K': 2, '1080p': 3, '1080i': 4, '720p': 5, 'SD': 6, '': 7
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 6) ---
if (forward_site == 'PThome') {
        var type_dict = {
          '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
          '体育': 407, '软件': 411, '学习': 412, '游戏': 410, 'MV': 408,
        };
      }

// --- From Module: 18_forward_site_filling2.js (Snippet 7) ---
if (raw_info.type == '书籍' && forward_site == 'PThome') {
        $('#specialcat').val(508);
        if (raw_info.descr.match(/m4a|mp3/i)) {
          $('#specialcat').val(507);
          raw_info.audiocodec_sel = raw_info.descr.match(/m4a|mp3/i)[0].toUpperCase();
        }
        document.getElementById('specialcat').dispatchEvent(evt);
      }

// --- From Module: 18_forward_site_filling2.js (Snippet 8) ---
if (forward_site == 'PThome') {
        switch (raw_info.audiocodec_sel) {
          case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(19); break;
          case 'TrueHD': case 'Atmos': audiocodec_box.val(20); break;
          case 'LPCM': audiocodec_box.val(21); break;
          case 'DTS': audiocodec_box.val(3); break;
          case 'AC3': audiocodec_box.val(18); break;
          case 'AAC': audiocodec_box.val(6); break;
          case 'Flac': audiocodec_box.val(1); break;
          case 'APE': audiocodec_box.val(2); break;
          case 'WAV': audiocodec_box.val(22); break;
          case 'MP3': audiocodec_box.val(23); break;
          case 'M4A': audiocodec_box.val(24);
        }
        if (raw_info.name.match(/Atmos/i)) {
          audiocodec_box.val(20);
        }
      }

