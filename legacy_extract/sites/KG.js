/** Consolidated Logic for: KG **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (origin_site == 'KG') {
      if (site_url.match(/reqdetails/)) {
        raw_info.name = $('h1').text().replace(/\(.*\)|Request for/, '').trim();
      }
      tbody = document.getElementsByClassName('main')[0].getElementsByTagName('table');
      for (i = 0; i < tbody.length; i++) {
        if (tbody[i].getElementsByTagName('td').length > 8) {
          tbody = tbody[i];
          break;
        }
      }
      insert_row = tbody.insertRow(1);
      douban_box = tbody.insertRow(1);
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
if (origin_site == 'KG') {
        if (tds[i].textContent == 'Internet Link' || tds[i].textContent == 'IMDB') {
          raw_info.url = tds[i + 1].textContent + '/';
        } else if (tds[i].textContent == 'Type') {
          if (tds[i + 1].textContent.match(/movie/i)) {
            raw_info.type = '电影';
          } else if (tds[i + 1].textContent.match(/music/i)) {
            raw_info.type = '音乐';
          }
        } else if (tds[i].textContent == 'Description') {
          var imgs = tds[i + 1].getElementsByTagName('img');
          var imgs_str = '';
          for (kk = 0; kk < imgs.length; kk++) {
            imgs_str += '[img]' + imgs[kk].src + '[/img]';
          }
        } else if (tds[i].textContent == 'Rip Specs') {
          try {
            raw_info.name = tds[i + 1].getElementsByTagName('a')[0].textContent;
            raw_info.descr = tds[i + 1].getElementsByClassName('mediainfo')[0].textContent;
          } catch (err) {
            raw_info.name = document.getElementsByTagName('h1')[0].textContent.split('-').pop().trim();
            raw_info.descr = tds[i + 1].textContent;
          }
          raw_info.descr = '[quote]' + raw_info.descr + '[/quote]\n\n' + imgs_str;
        } else if (tds[i].textContent == 'Source') {
          raw_info.medium_sel = tds[i + 1].textContent.medium_sel();
          if (tds[i + 1].textContent.trim() == 'WEB') {
            raw_info.medium_sel = 'WEB-DL';
          }
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
if (origin_site == 'KG') {
      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            $('td:contains(Internet Link)').last().parent().before(`<tr><td align=right style="font-weight: bold;">豆瓣</td><td id="douban_info"></td></tr>`);
            add_douban_info_table($('#douban_info'), 150, data);
          }
        });
      }
      raw_info.torrent_url = 'https://karagarga.in/' + $('a[href*="/down.php/"]').attr('href');
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 4) ---
else if (site == 'KG') {
        if (search_mode == 0 || if_exclusive) {
          return;
        }
        GM_setValue('kg_info', JSON.stringify(raw_info));
        var href = 'https://karagarga.in/upload.php';
        window.open(href, target = "_blank");
      }

