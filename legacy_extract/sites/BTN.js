/** Consolidated Logic for: BTN **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url == 'https://broadcasthe.net/friends.php' || site_url == 'https://backup.landof.tv/friends.php') {
  $('.main_column').find('td:contains("Last seen")').css({ 'width': '150px' });
  return;
}

// --- From Module: 02_core_utilities.js (Snippet 2) ---
if (site_url.match(/^https:\/\/broadcasthe.net\/torrents.php\?id=\d+$/)) {
  if ($('a[href*="action=edit"]').length) {
    $('tr').has('a[href*="action=edit"]').map((index, e) => {
      if ($(e).find('td:eq(3)').text() == '0') {
        window.open($(e).find('a[href*="action=download"]').attr('href'), '_blank');
      }
    });
  }
}

// --- From Module: 03_configuration.js (Snippet 3) ---
else if (site_url.match(/^https?:\/\/broadcasthe.net\/.*/)) {
  used_site_info.BTN.url = 'https://broadcasthe.net/';
}

// --- From Module: 07_dom_walkers.js (Snippet 4) ---
if (site_url.match(/^https:\/\/(broadcasthe.net|backup.landof.tv)\/upload.php.*/)) {
    return 5;
  }

// --- From Module: 09_data_processing.js (Snippet 5) ---
else if (site != 'BTN') {
      $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "border": "1px solid #2F3546", "color": "#FFFFFF", "backgroundColor": "#2F3546" });
      if (site == 'PTP') {
        textarea.style.width = '675px';
      } else if (site == 'GPW') {
        input_box.style.width = '330px';
        textarea.style.width = '650px';
      } else if (site == 'HD-Only') {
        input_box.style.width = '260px';
        textarea.style.width = '540px';
      }
    }

// --- From Module: 09_data_processing.js (Snippet 6) ---
else if (site == 'BTN') {
      textarea.style.width = '530px';
    }

// --- From Module: 11_download_clients.js (Snippet 7) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 11_download_clients.js (Snippet 8) ---
if (site_url.match(/(broadcasthe.net|backup.landof.tv)\/.*.php.*/)) {
  $('#searchbars').find('li').each(function () {
    $(this).find('form').find('input').prop('size', 16);
  });
  $('table.torrent_table').find('tr.torrent').each(function () {
    var index = $(this).index();
    var $td = $(this).find('td:eq(2)');
    var title = $td.find('div.nobr:contains("Release Name")').find('span').prop('title');
    var group = title.match(/.*-(.*)/);
    var font = document.createElement('font');
    var season_info = $td.find('a:eq(3)').text();
    if (!season_info.match('Season')) {
      font.style.color = '#1e90ff';
    } else {
      font.style.color = '#db7093';
    }
    var unknown_group = false;
    if (group && group.length) {
      if (!group[1].match(/\[.*\]/)) {
        if ($td[0].childNodes[10].textContent.match(/\]/)) {
          $td[0].childNodes[9].textContent += ' / ' + group[1];
          if (extra_settings.btn_dark_color.enable) {
            font.innerHTML = ($td[0].childNodes[8].textContent + $td[0].childNodes[9].textContent + $td[0].childNodes[10].textContent).replace(group[1], `<b><font color="#20B2AA">${group[1]}</font></b>`);
            $td[0].childNodes[10].parentNode.removeChild($td[0].childNodes[10]);
            $td[0].childNodes[9].parentNode.removeChild($td[0].childNodes[9]);
            $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
          }
        } else {
          var ori_text = $td[0].childNodes[8].textContent;
          $td[0].childNodes[8].textContent = ori_text.replace(/\[(.*?)\]/, `$1 / ${group[1]}`);
          if (extra_settings.btn_dark_color.enable) {
            font.innerHTML = $td[0].childNodes[8].textContent.replace(group[1], `<b><font color="#20B2AA">${group[1]}</font></b>`);
            $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
          }
        }
      } else {
        unknown_group = true;
      }
    } else {
      unknown_group = true;
    }
    if (unknown_group) {
      font.style.color = '#1e90ff';
      var ori_text = $td[0].childNodes[8].textContent;
      $td[0].childNodes[8].textContent = ori_text.replace(/\[(.*?)\]/, `$1 / Unknown`);
      if (extra_settings.btn_dark_color.enable) {
        font.innerHTML = $td[0].childNodes[8].textContent.replace('Unknown', `<b><font color="#20B2AA">Unknown</font></b>`);
        $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
      }
    }
    if (extra_settings.btn_dark_color.enable) {
      $(this).find('td:gt(2)').css({ 'color': 'grey' });
      $td.find('a:lt(4)').css({ 'font-size': 'small', 'font-weight': 'bold' });
      $td.find('div.nobr:contains("Release Name")').css({ 'color': 'grey' });
      $td.find('div.nobr:contains("Up:")').css({ 'color': 'grey' });
    }

    var name = $td.find('a:eq(2)').text();
    $td.find('br').replaceWith($(`<div><a name="douban_${index}" href=https://search.douban.com/movie/subject_search?search_text=${name.replace(/ /g, '%20')}&cat=1002 target="_blank">[Douban]</a>
            <a name="imdb_${index}" href=https://www.imdb.com/find?q=${name.replace(/ /g, '%20')}&ref_=nv_sr_sm target="_blank">[IMDB]</a>
            <a href=https://www.themoviedb.org/search?language=zh-CN&query=${name.replace(/ /g, '%20')} target="_blank">[TMDB]</a>
            <a name="show_${index}" style="display: none"></a>
            </div><span name="imdb_${index}" style="display: none"><a name="get_${index}">GET</a></span>`
    ));
  });
}

// --- From Module: 11_download_clients.js (Snippet 9) ---
if (site_url.match(/^https?:\/\/(broadcasthe.net|backup.landof.tv)\/series.php\?id=\d+/)) {
  var name = $('title').text().split(':')[0].trim();
  var imdb_url = $('img[src*="tvicon/imdb.png"]:eq(0)').parent().attr('href');
  if (imdb_url == '') {
    imdb_url = `https://www.imdb.com/find?q=${name.replace(/ /g, '%20')}&ref_=nv_sr_sm`;
  }
  $('#content').find('div.linkbox:eq(0)').prepend(`<font size="5px" color="red">${name}</font><br>
        <div><a href=https://search.douban.com/movie/subject_search?search_text=${name.replace(/ /g, '%20')}&cat=1002 target="_blank">[Douban]</a>
        <a href=${imdb_url} target="_blank">[IMDB]</a>
        <a href=https://www.themoviedb.org/search?language=zh-CN&query=${name.replace(/ /g, '%20')} target="_blank">[TMDB]</a>
        </div>
    `);
}

// --- From Module: 14_origin_site_parsing1.js (Snippet 10) ---
if (origin_site == 'BTN') {
      tbody = document.getElementsByClassName('torrent_table')[0];
      raw_info.type = '剧集';
      if (site_url.match(/torrentid=(\d+)/)) {
        torrent_id = site_url.match(/torrentid=(\d+)/)[1];
      }
      setTimeout(() => {
        var series_num = $('.thin').find('a').attr('href');
        getDoc(used_site_info.BTN.url + series_num, null, function (doc) {
          var link_as = doc.getElementsByClassName('box')[1].getElementsByTagName('a');
          for (i = 0; i < link_as.length; i++) {
            if (link_as[i].href.match(/imdb.com/)) {
              raw_info.url = link_as[i].href;
            }
            if (link_as[i].href.match(/thetvdb.com/)) {
              raw_info.tvdb_url = link_as[i].href;
            }
          }
          try {
            reBuildHref(raw_info, forward_r);
          } catch (err) { }
        });
      }, 2000);

      //获取name
      var torrent_tr = document.getElementById('torrent_' + torrent_id);
      raw_info.name = torrent_tr.previousElementSibling.getElementsByTagName('td')[0].textContent.replace('» ', '').trim();

      //获取简介
      var descr_box = torrent_tr.getElementsByTagName('blockquote');
      for (i = 0; i < descr_box.length; i++) {
        var tmp_descr = descr_box[i].textContent;
        if (tmp_descr.match(/Unique ID|DISC INFO:|.MPLS|General/i)) {
          descr_box = descr_box[i];
          break;
        }
      }
      raw_info.descr = '[quote]' + descr_box.textContent + '[/quote]\n\n';
      var imgs = descr_box.getElementsByTagName('img');
      var img_urls = '';
      for (i = 0; i < imgs.length; i++) {
        if (imgs[i].parentNode.nodeName == 'A') {
          img_urls += '[url=' + imgs[i].parentNode.href + '][img]' + imgs[i].src + '[/img][/url]';
        } else {
          img_urls += '[img]' + imgs[i].src + '[/img]';
        }
      }
      raw_info.descr += img_urls;
      raw_info.torrent_url = used_site_info.BTN.url + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 11) ---
if (['PTP', 'MTV', 'UHD', 'HDF', 'RED', 'BTN', 'jpop', 'GPW', 'HD-Only', 'SC', 'ANT', 'lztr', 'DICMusic', 'OPS', 'TVV', 'SugoiMusic'].indexOf(origin_site) > -1) {
        if (origin_site == 'PTP' || origin_site == 'UHD' || origin_site == 'GPW' || origin_site == 'SC' || origin_site == 'ANT') {
          raw_info.type = '电影';
        } else if (origin_site == 'BTN' || origin_site == 'MTV' || origin_site == 'TVV') {
          raw_info.type = '剧集';
        }
        if (tds[i].innerHTML.match(`torrent_(torrent_|detail_)?${torrent_id}`) || (['BTN', 'jpop', 'TVV', 'SugoiMusic'].indexOf(origin_site) > -1 && tds[i].parentNode.innerHTML.match('id=' + torrent_id))) {
          table = tds[i].parentNode.parentNode;
          if (origin_site == 'HDF' || origin_site == 'UHD') {
            if (tds[i].parentNode.textContent.match(/s\d{1,3}/i)) {
              raw_info.type = '剧集';
            } else {
              raw_info.type = '电影';
            }
          } else if (origin_site == 'RED') {
            raw_info.small_descr = tds[i].getElementsByTagName('a')[3].textContent;
            var tr = tds[i].parentNode;
            while (true) {
              tr = tr.previousElementSibling;
              var class_info = tr.getAttribute('class');
              if (class_info.match(/release/) && !class_info.match(/torrentdetails/)) {
                raw_info.music_media = tr.textContent.trim();
                break;
              }
            }
          }
          if (!is_inserted) {
            var child_nodes = table.childNodes;
            var rowcount = 0;
            for (k = 0; k < child_nodes.length; k++) {
              if (child_nodes[k].nodeName == 'TR') {
                rowcount = rowcount + 1;
                if (child_nodes[k].id.match(`torrent_(torrent_|detail_)?${torrent_id}`)) {
                  break;
                }
              }
            }
            search_row = table.insertRow(rowcount - 1);
            insert_row = table.insertRow(rowcount - 1);
            is_inserted = true;
          }
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 12) ---
else if (origin_site == 'BTN' || origin_site == 'MTV' || origin_site == 'TVV') {
          raw_info.type = '剧集';
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 13) ---
if (['PTP', 'MTV', 'UHD', 'HDF', 'RED', 'BTN', 'jpop', 'GPW', 'HD-Only', 'SC', 'ANT', 'lztr', 'DICMusic', 'OPS', 'TVV', 'SugoiMusic', 'HHClub'].indexOf(origin_site) > -1) {
      forward_r = insert_row.insertCell(0);
      forward_r.colSpan = "5";
      forward_r.style.paddingLeft = '12px'; forward_r.style.paddingTop = '10px';
      forward_r.style.paddingBottom = '10px';
      if (origin_site != 'HHClub' || no_need_douban_button_sites.indexOf('HHClub') < 0) {
        forward_l = search_row.insertCell(0);
        forward_l.colSpan = "5";
      } else {
        forward_r.style.paddingLeft = '0px';
        forward_r.style.paddingTop = '0px';
        forward_r.style.paddingRight = '60px';
        forward_r.style.border = 'none';
      }
      if (origin_site == 'MTV') { forward_r.colSpan = "6"; forward_l.colSpan = "6"; }
      if (no_need_douban_button_sites.indexOf(origin_site) < 0) {
        init_buttons_for_transfer(forward_l, origin_site, 1, raw_info);
      }
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 14) ---
else if (site == 'BTN') {
        if (search_mode == 0 || if_exclusive) {
          return;
        }
        GM_setValue('btn_info', JSON.stringify(raw_info));
        var href = `${used_site_info.BTN.url}upload.php`;
        window.open(href, target = "_blank");
      }

