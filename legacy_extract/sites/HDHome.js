/** Consolidated Logic for: HDHome **/

// --- From Module: 09_data_processing.js (Snippet 1) ---
else if (item.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
        item = item.replace(/th.png/, 'png').replace(/md.png/, 'png');
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
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

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 4) ---
else if (['HDDolby', 'HDHome', 'PThome', 'Audiences'].indexOf(origin_site) > -1) {
      if ($('tr:contains("标签"):last').find('span.txz').length || $('tr:contains("标签"):last').find('span.tjz').length) {
        if_exclusive = true;
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 5) ---
if (raw_info.origin_site == 'Audiences' || raw_info.origin_site == 'HDHome') {
          tmp_descr = tmp_descr.replace(/\[\/?font.*?\]/g, '');
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 6) ---
if (labels.yp && forward_site == 'HDHome') {
              check_label(document.getElementsByName('tags[]'), 'ybyp');
            }

// --- From Module: 17_forward_site_filling1.js (Snippet 7) ---
case 'HDHome': case 'Audiences':
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

// --- From Module: 22_additional_handlers2.js (Snippet 8) ---
else if (item.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
          item = item.replace(/th.png/, 'png').replace(/md.png/, 'png');
        }

