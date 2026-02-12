/** Consolidated Logic for: OurBits **/

// --- From Module: 06_site_detection.js (Snippet 1) ---
if (site_url.match(/u2.dmhy.org|ourbits.club|hd-space.org|totheglory.im|blutopia.cc|star-space.net|torrent.desi|hudbt|fearnopeer.com|darkland.top|onlyencodes.cc|cinemageddon|eiga.moi|hd-olimpo.club|digitalcore.club|bwtorrents.tv|myanonamouse|greatposterwall.com|m-team.cc/i)) {
        n.innerHTML = '\r\n';
      }

// --- From Module: 09_data_processing.js (Snippet 2) ---
if (raw_info.origin_site == 'OurBits') {
    raw_info.descr = raw_info.descr.replace(/\[quote\]\n/g, '[quote]')
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 3) ---
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

// --- From Module: 14_origin_site_parsing1.js (Snippet 4) ---
if (origin_site != 'OurBits') {
            mediainfo1 = mediainfo1.getElementsByTagName('font')[0];
          }

// --- From Module: 14_origin_site_parsing1.js (Snippet 5) ---
if (origin_site == 'OurBits') {
        raw_info.descr = raw_info.descr.replace(/Mediainfo|Screenshot|BDInfo|screenshot/g, '');
        try {
          var imdbnew2 = document.getElementsByClassName("imdbnew2")[0];
          raw_info.url = match_link('imdb', imdbnew2.innerHTML);
        } catch (err) { }

        if (raw_info.descr.search(/主.*演/i) < 0 && raw_info.descr.search(/类.*别/i) < 0) {
          try {
            var doubanimg = document.getElementsByClassName("doubannew")[0];
            doubanimg = doubanimg.getElementsByTagName("img")[0].src;
            var douban = document.getElementsByClassName("doubaninfo")[0];
            var douban_new = douban.cloneNode(true);
            douban = domToString(douban_new);
            douban = douban.replace(/<br>/g, '\n').replace('<div class="doubaninfo">', '').replace('</div>', '');
            raw_info.descr = '[img]' + doubanimg + '[/img]\n' + douban + '\n\n' + raw_info.descr;
          } catch (err) {
            if (raw_info.url) {
              douban_button_needed = true;
            }
          }
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
else if ((origin_site == 'OurBits' || origin_site == 'FRDS' || origin_site == 'PTLGS') && douban_button_needed) {
              douban_box = table.insertRow(i / 2 + 1);
            }

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
if (origin_site == 'HDHome' || origin_site == 'MTeam' || origin_site == 'HDRoute' || origin_site == 'OurBits') {
      raw_info.small_descr = raw_info.small_descr.replace(/【|】/g, " ");
      raw_info.small_descr = raw_info.small_descr.replace(/diy/i, "【DIY】");

      //DIY图文换序兼顾圆盘补quote
      var img_info = '';
      if (raw_info.name.match(/DIY/i)) {
        var img_urls = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
        try {
          for (i = 0; i < img_urls.length; i++) {
            if (raw_info.descr.indexOf(img_urls[i]) < 10) {
            } else {
              raw_info.descr = raw_info.descr.replace(img_urls[i], '');
              img_info += img_urls[i].match(/\[img\].*?\[\/img\]/)[0];
            }
          }
        } catch (Err) { }
      }

      raw_info.descr = raw_info.descr.replace(/\n{3,10}/g, '\n\n');

      //圆盘补quote
      var tem_str = "";
      if (raw_info.descr.match(/DISC.INFO/i)) {
        var disc_info = raw_info.descr.match(/.*?DISC.INFO/i)[0];
        tem_str = raw_info.descr.slice(raw_info.descr.indexOf(disc_info) - 10, raw_info.descr.length);
        if (!tem_str.match(/quote/i)) {
          var img_urls = tem_str.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
          var t_img_info = '';
          try {
            for (i = 0; i < img_urls.length; i++) {
              raw_info.descr = raw_info.descr.replace(img_urls[i], '');
              t_img_info += img_urls[i].match(/\[img\].*?\[\/img\]/)[0];
            }
          } catch (err) { }
          raw_info.descr = raw_info.descr.replace(disc_info, `[img]https://images2.imgbox.com/04/6b/Ggp5ReQb_o.png[/img]\n\n[quote]\r${disc_info}`);
          raw_info.descr = raw_info.descr.trim() + "\r" + "[/quote]\n" + t_img_info;
        }
      }
      raw_info.descr = raw_info.descr + '\n\n' + img_info;

      if (raw_info.descr.match(/^(\[img\].*?\[\/img\])\s*(\[quote\][\s\S]*?\[\/quote\])/)) {
        raw_info.descr = raw_info.descr.replace(/^(\[img\].*?\[\/img\])\s*(\[quote\][\s\S]*?\[\/quote\])/, '$2\n\n$1');
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 8) ---
if (origin_site == 'CMCT' || origin_site == 'OurBits' || origin_site == 'TJUPT' || origin_site == 'bit-hdtv' || origin_site == 'MTeam' || origin_site == '影') {
      if (origin_site == 'TJUPT') {
        forward_r.style.border = "2px solid #FFFFFF";
      } else if (origin_site == 'MTeam') {
        forward_l.parentNode.setAttribute('class', 'ant-descriptions-row');
        forward_l.setAttribute('class', 'ant-descriptions-item-label');
        $(forward_l).css({ 'width': '135px', 'text-align': 'right' });
        forward_r.setAttribute('class', 'ant-descriptions-item-content');
      } else if (origin_site == '影') {
        forward_l.parentNode.id = 'tr_item';
      } else {
        forward_l.style.border = "1px solid #D0D0D0";
        forward_r.style.border = "1px solid #D0D0D0";
      }
      if (douban_button_needed || origin_site == 'bit-hdtv') {
        box_left.style.border = "1px solid #D0D0D0";
        box_right.style.border = "1px solid #D0D0D0";
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 9) ---
case 'OurBits':
        var ob_link = raw_info.origin_url.replace('***', '/');
        var search_url = `https://ourbits.club/torrents.php?search=${raw_info.small_descr}&search_area=0&search_mode=0`;
        getDoc(search_url, null, function (doc) {
          $('.torrentname', doc).map((index, e) => {
            ob_url = $(e).find('a:first').attr('href');
            if (ob_link.includes(ob_url)) {
              if ($(e).find('.tag-gy').length) {
                raw_info.labels += 1;
              }
              if ($(e).find('.tag-zz').length) {
                raw_info.labels += 100;
              }
            }
          });
          rebuild_href(raw_info);
        });
        break;

// --- From Module: 17_forward_site_filling1.js (Snippet 10) ---
if (raw_info.origin_site == 'OurBits') {
      raw_info.descr = raw_info.descr.replace(/ /g, ' ');
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
if (forward_site == 'OurBits' && raw_info.url == '') {
          if (raw_info.dburl) {
            raw_info.url = raw_info.dburl;
          }
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
case 'OurBits':
          if (labels.gy) { document.getElementById('tag_gy').checked = true; }
          if (labels.zz) { document.getElementById('tag_zz').checked = true; }
          if (labels.diy) { document.getElementById('tag_diy').checked = true; }
          if (labels.hdr10) { document.getElementById('tag_hdr').checked = true; }
          if (labels.hdr10plus) { document.getElementById('tag_hdrp').checked = true; }
          if (labels.db) { document.getElementById('tag_db').checked = true; }
          if (raw_info.name.match(/HLG/)) { document.getElementById('tag_hlg').checked = true; }
          break;

// --- From Module: 18_forward_site_filling2.js (Snippet 13) ---
else if (forward_site == 'OurBits') {
      var browsecat = $('#browsecat');
      switch (raw_info.type) {
        case '电影':
          if (raw_info.name.match(/3D/i)) {
            browsecat.val(402);
          } else {
            browsecat.val(401);
          }
          break;
        case '剧集':
          if (raw_info.name.match(/(S\d{2}[^E]|complete)/i) && !raw_info.name.match(/E\d+/)) {
            browsecat.val(405);
          } else {
            browsecat.val(412);
          }
          break;
        case '音乐':
          if (raw_info.small_descr.match(/音乐会|演唱会/i)) {
            browsecat.val(419);
          } else {
            browsecat.val(416);
          }
          break;
        case 'MV': browsecat.val(419); break;
        case '综艺': browsecat.val(413); break;
        case '纪录': browsecat.val(410); break;
        case '动漫': browsecat.val(411); break;
        case '体育': browsecat.val(415);
      }

      switch (raw_info.medium_sel) {
        case 'UHD': $("select[name='medium_sel']").val('12'); break;
        case 'Blu-ray': $("select[name='medium_sel']").val('1'); break;
        case 'HDTV': $("select[name='medium_sel']").val('5'); break;
        case 'WEB-DL': $("select[name='medium_sel']").val('9'); break;
        case 'Encode': $("select[name='medium_sel']").val('7'); break;
        case 'DVD': $("select[name='medium_sel']").val('2'); break;
        case 'CD': $("select[name='medium_sel']").val('8');
      }

      switch (raw_info.codec_sel) {
        case 'H265': case 'X265':
          $("select[name='codec_sel']").val('14'); break;
        case 'H264': case 'X264':
          $("select[name='codec_sel']").val('12'); break;
        case 'XVID':
          $("select[name='codec_sel']").val('17'); break;
        case 'VC-1':
          $("select[name='codec_sel']").val('16'); break;
        case 'MPEG-2': case 'MPEG-4':
          $("select[name='codec_sel']").val('15'); break;
        case '':
          $("select[name='codec_sel']").val('18');
      }

      switch (raw_info.audiocodec_sel) {
        case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': case 'DTS-HD': case 'DTS-HDHR':
          $("select[name='audiocodec_sel']").val('1'); break;
        case 'Atmos':
          $("select[name='audiocodec_sel']").val('14'); break;
        case 'TrueHD':
          $("select[name='audiocodec_sel']").val('2'); break;
        case 'LPCM':
          $("select[name='audiocodec_sel']").val('5'); break;
        case 'DTS':
          if (raw_info.name.match(/DTS.?X[^ \d]/i)) {
            $("select[name='audiocodec_sel']").val('21');
          } else {
            $("select[name='audiocodec_sel']").val('4');
          }
          break;
        case 'AC3':
          $("select[name='audiocodec_sel']").val('6'); break;
        case 'AAC':
          $("select[name='audiocodec_sel']").val('7'); break;
        case 'Flac':
          $("select[name='audiocodec_sel']").val('13'); break;
        case 'APE':
          $("select[name='audiocodec_sel']").val('12'); break;
        case 'WAV':
          $("select[name='audiocodec_sel']").val('11');
      }

      var standard_dict = { '4K': '5', '1080p': '1', '1080i': '2', '720p': '3', 'SD': '4', '': '0' };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        $("select[name='standard_sel']").val(index);
      }

      var source_dict = { '欧美': '2', '大陆': '1', '香港': '3', '台湾': '3', '日本': '4', '韩国': '5', '印度': 6, '': 6 };
      $("select[name='processing_sel']").val(6);
      if (source_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = source_dict[raw_info.source_sel];
        $("select[name='processing_sel']").val(index);
      }
    }

