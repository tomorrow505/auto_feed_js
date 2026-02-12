/** Consolidated Logic for: OPS **/

// --- From Module: 11_download_clients.js (Snippet 1) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'OPS') {
      if (site_url.match(/torrentid=(\d+)/)) {
        torrent_id = site_url.match(/torrentid=(\d+)/)[1];
      }
      getJson(`https://orpheus.network/ajax.php?action=torrent&id=${torrent_id}`, null, function (data) {
        raw_info.json = JSON.stringify(data);
        if (raw_info.small_descr.match(/Log \(\d+%\)/)) {
          var score = raw_info.small_descr.match(/Log \((\d+)%\)/)[1];
          $('a:contains("View logs")').click();
          raw_info.log_info = [];
          $(`#viewlog_${torrent_id}`).find('.log_section').wait(function () {
            $(`#viewlog_${torrent_id}`).find('.log_section').map((index, e) => {
              raw_info.log_info.push($(e).find('blockquote').text().trim());
              console.log($(e).find('blockquote').text().trim())
            });
            raw_info.log_info = raw_info.log_info.join('==logs==');
            rebuild_href(raw_info);
          });
        }
        rebuild_href(raw_info);
      });
      raw_info.name = document.getElementsByTagName('h2')[0].textContent.replace(/–/g, '-');
      raw_info.music_author = $('h2>a[href*="artist"]:last').text();
      raw_info.music_name = $('h2').text().replace(/–/g, '-').split(raw_info.music_author)[1].replace(/^.?-.?|\[.*?\]/g, '').trim();
      raw_info.music_author = Array.from($('h2>a[href*="artist"]')).map((item) => { return $(item).text() }).join(' & ');
      raw_info.name = raw_info.name.replace(/\[|\]/g, '*');
      try {
        var cover = $('#cover_div_0').find('img').attr('src');
        $('#cover_div_0').append(`<b style="margin-left:15px; color:red">转载前请进行封面转存！</b><br><a id="transfer_pixhost" target="_blank" href="#" style="margin-left:15px; color: yellow">转存Pixhost</a>`);
        $('#transfer_pixhost').click((e) => {
          e.preventDefault();
          pix_send_images([cover]).then(function (new_url) {
            new_url = new_url[0].match(/\[img\](.*)\[\/img\]/)[1].replace('//t', '//img').replace('thumbs', 'images');
            raw_info.descr = raw_info.descr.replace(cover, new_url);
            rebuild_href(raw_info);
            alert('转存成功！！');
          });
        });
      } catch (err) { }
      var mediainfo = $('div.torrent_description').find('div.body');
      raw_info.tracklist = walkDOM(mediainfo[0].cloneNode(true)).trim();

      if ($(mediainfo).find('ol.postlist').length) {
        $(mediainfo).find('ol.postlist').find('li').map((index, e) => {
          if (index == 0) {
            raw_info.tracklist = raw_info.tracklist.split($(e).text())[0];
          }
          raw_info.tracklist += `\n${index + 1} ${$(e).text()}`;
        });
      }
      console.log(raw_info.tracklist);
      raw_info.descr = '[img]' + cover + '[/img]\n\n';
      raw_info.type = '音乐';
      tbody = document.getElementsByClassName('torrent_table')[0];
      var torrent_tr = $(`#torrent${torrent_id}`);
      count = 0;
      while (count <= 25) {
        console.log(torrent_tr.text().trim())
        var edition_info = torrent_tr.text().trim().match(/^– /) ? torrent_tr.text().trim().replace('– ', '') : '';
        if (edition_info) {
          break;
        }
        torrent_tr = torrent_tr.prev();
        count += 1;
      }
      raw_info.edition_info = edition_info;
      console.log(raw_info.edition_info);
      raw_info.small_descr = $(`#torrent${torrent_id}`).find('a:eq(5)').text().replace('▶ ', '');
      console.log(raw_info.small_descr);
      raw_info.descr += $(`#torrent_${torrent_id}`).find('blockquote:last').text();
      console.log(raw_info.descr);
      raw_info.music_type = Array.from($('div.box_tags').find('a[href*="taglist"]').map((index, e) => {
        return $(e).text();
      })).join(',');
      console.log(raw_info.music_type);
      raw_info.file_list = Array.from($(`#files_${torrent_id}`).find('tr:gt(0)').map((index, e) => {
        return $(e).find('td:eq(0)').text();
      }));
      raw_info.file_list = raw_info.file_list.filter((item) => {
        if (item.match(/\.(flac|wav)/i)) {
          return item;
        }
      }).join('\n');
      raw_info.torrent_url = `https://orpheus.network/` + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
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

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 5) ---
if (['RED', 'jpop', 'lztr', 'DICMusic', 'OPS', 'SugoiMusic'].indexOf(raw_info.origin_site) > -1) {
      raw_info.name = raw_info.name.replace(/\*/g, '');
      if (raw_info.tracklist) {
        raw_info.tracklist = '[quote=Tracklist]' + raw_info.tracklist + '[/quote]';
      } else {
        raw_info.tracklist = '';
      }
      if (raw_info.log_info) {
        raw_info.log_info = '\n\n[hide]' + raw_info.log_info + '[/hide]\n\n';
      } else {
        raw_info.log_info = '';
      }
      raw_info.descr = raw_info.descr + raw_info.log_info + raw_info.tracklist;
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 6) ---
if (raw_info.origin_site == 'OPS') {
        raw_info.name = raw_info.name.replace(/–/g, '-');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 7) ---
if (['RED', 'jpop', 'lztr', 'DICMusic', 'OPS', 'SugoiMusic'].indexOf(raw_info.origin_site) > -1) {
        if (raw_info.origin_site == 'RED') {
          try {
            raw_info.music_type = raw_info.descr.match(/标签： (.*)/)[1].split(' | ');
            raw_info.descr = raw_info.descr.replace(/标签： (.*)/, '');
          } catch (err) { }
        } else {
          raw_info.music_type = raw_info.music_type.split(',');
        }
        try {
          var music_type = [];
          raw_info.music_type.map((item) => {
            if (item.match(/pop/) && music_type.indexOf("流行(Pop)") < 0) {
              music_type.push("流行(Pop)");
            }
            if (item.match(/rock/) && music_type.indexOf("摇滚(rock)") < 0) {
              music_type.push("摇滚(rock)");
            }
            if (item.match(/punk/) && music_type.indexOf("朋克(Punk)") < 0) {
              music_type.push("朋克(Punk)");
            }
            if (item.match(/Metal/i) && music_type.indexOf("金属(Metal)") < 0) {
              music_type.push("金属(Metal)");
            }
            if (type_dict.hasOwnProperty(item) && music_type.indexOf(type_dict[item]) < 0) {
              music_type.push(type_dict[item]);
            }
            if (item.match(/alternative/) && music_type.indexOf("另类(Alternative)") < 0) {
              music_type.push("另类(Alternative)");
            }
            if (item.match(/world.music/) && music_type.indexOf("世界音乐(World)") < 0) {
              music_type.push("世界音乐(World)");
            }
          });
          raw_info.music_type = music_type;
        } catch (err) { }

        var name_dict = {
          "RED": 'Redacted', 'OPS': 'Orpheus', 'jpop': 'Jpopsuki', 'DICMusic': 'DICMusic', 'lztr': 'LzTr', 'SugoiMusic': 'SugoiMusic'
        }
        $('#frname').val(name_dict[raw_info.origin_site]);
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 8) ---
if (['RED', 'jpop', 'lztr', 'DICMusic', 'OPS', 'SugoiMusic'].indexOf(raw_info.origin_site) > -1) {
          $('a.tag:contains("大陆")').wait(function () {
            raw_info.music_type.map(item => {
              var source = $(`a.tag:contains(${item})`);
              if (item == "贝斯(Drum Bass)") { source = $(`a.tag[value="25"]`); }
              if (source.length) {
                addTag(source);
              }
              if (!source_selected) {
                if (item == '摇滚(rock)') {
                  item = '摇滚(Rock)';
                }
                if ($(`#source>option:contains(${item})`).length) {
                  $(`#source>option:contains(${item})`).attr('selected', true);
                  source_selected = true;
                }
              }
            })
          });
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 9) ---
if (forward_site == 'OPS') {
      var announce = $('a:contains(已隐藏你的个人)').attr('href');
      if (forward_site == 'OPS') {
        announce = $('input[value*="announce"]').val();
        if (raw_info.releasetype !== undefined) {
          switch (raw_info.releasetype) {
            case 'Single': $('#releasetype').val(9); break;
            case 'Album': $('#releasetype').val(1); break;
            case 'PV': $('#releasetype').val(11); break;
            case 'DVD': $('#releasetype').val(21); break;
            case 'TV-Music': $('#releasetype').val(21); break;
            case 'TV-Variety': $('#releasetype').val(21); break;
            case 'TV-Drama': $('#releasetype').val(21); break;
            case 'Fansubs': $('#releasetype').val(21); break;
            case 'Pictures': $('#releasetype').val(21); break;
          }
        }
        try { if (!$('#tags').val()) { $('#tags').val(raw_info.music_type.replace(/,/g, ', ')) } } catch (err) { }
      }
      addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, announce);
      function add_extra_info() {
        $('#artist_tr').before(`<tr class="section_tr"><td class="label">辅助信息:</td><td>${raw_info.name}<br>${raw_info.edition_info}<br>${raw_info.small_descr}</td></tr>`)
        raw_info.name = raw_info.name.trim();
        if (raw_info.origin_site == 'OPS') {
          raw_info.name = raw_info.name.replace(/–/g, '-');
        }
        var info_text = raw_info.name.split('*');
        var author_name = info_text[0];
        var music_name = '待填';
        if (author_name.split('-').length > 1) {
          music_name = author_name.split('-').pop().trim();
        }

        try {
          raw_info.music_author.split(' & ').forEach((item, index) => {
            if (index == $('input[name="artists[]"]').length) {
              AddArtistField();
            }
            if (item) {
              $(`#artist_${index}`).val(item);
            }
          });
        } catch (Err) { }
        raw_info.descr = raw_info.descr.replace(/\[quote=Tracklist\]/, 'Tracklist\n').replace(/\[\/quote\]/, '');

        var year = '';
        if (raw_info.name.match(/(19|20)\d+/)) {
          year = raw_info.name.match(/(19|20)\d+/)[0];
          music_name = music_name.split(year)[0].trim();
        }
        var author = raw_info.name.split(music_name)[0].replace(/-( *)?$/, '').trim();
        $('#yadg_input').wait(function () {
          $('#yadg_input').val(music_name);
        });
        if (!$('#artist').val()) { $('#artist').val(raw_info.music_author || author); }
        if (!$('#year').val()) { $('#year').val(year); }
        if (!$('#title').val()) { $('#title').val(raw_info.music_name || music_name); }
        if (raw_info.edition_info && raw_info.edition_info.match(/(19|20)\d{2}/)) {
          if (!$('#remaster_year').val()) { $('#remaster_year').val(raw_info.edition_info.match(/(19|20)\d{2}/)[0]); }
        }
        var media_selected = false;
        var standard_selected = false;
        if ($('#format').val() == '---' || !$('#format').val()) {
          $('#format>option').map((index, e) => {
            if (!standard_selected && (raw_info.music_media + raw_info.small_descr + raw_info.edition_info).toUpperCase().match(e.innerText)) {
              $(`#format>option:eq(${index})`).attr('selected', true);
              standard_selected = true;
            }
          });
        }
        if ($('#media').val() == '---' || !$('#media').val()) {
          $('#media>option').map((index, e) => {
            if (!media_selected && (raw_info.music_media + raw_info.small_descr + raw_info.edition_info).toUpperCase().match(e.innerText.toUpperCase())) {
              $(`#media>option:eq(${index})`).attr('selected', true);
              media_selected = true;
            }
          });
        }

        if ($('#bitrate').val() == '---' || !$('#bitrate').val()) {
          if ((raw_info.small_descr).match(/24bit Lossless/)) {
            $('#bitrate').val('24bit Lossless');
          } else if ((raw_info.small_descr).match(/Lossless/)) {
            $('#bitrate').val('Lossless');
          } else if (raw_info.small_descr.match(/320|256|192|160|128|96|64/)) {
            $('#bitrate').val(raw_info.small_descr.match(/320|256|192|160|128|96|64/)[0]);
          }
        }
        var poster = raw_info.descr.match(/\[img\](.*?)\[\/img\]/)[1].trim();
        if (!$('#image').val()) { $('#image').val(poster); }
      }

      if (raw_info.json !== undefined) {
        var data = JSON.parse(raw_info.json);
        console.log(data)
        var group = data['response']['group'];
        var torrent = data['response']['torrent'];

        var categories_mapping = {
          'Music': 0,
          'Applications': 1,
          'E-Books': 2,
          'Audiobooks': 3,
          'E-Learning Videos': 4,
          'Comedy': 5,
          'Comics': 6
        };
        var index = 0;
        if (categories_mapping.hasOwnProperty(group['categoryName'])) {
          index = categories_mapping[group['categoryName']];
        }
        if (torrent.format) {
          raw_info.small_descr += torrent.format;
        }
        var categories = $('#categories');
        if (!group['categoryName']) {
          group['categoryName'] = 'Music';
        }
        categories.val(index).triggerHandler('change');
        WaitForCategory(function () {
          fillMusicForm(group, torrent);
          add_extra_info();
          setTimeout(function () {
            if (group.wikiBody.match(/\<(br|span).*?\>/)) {
              var tmp_descr = raw_info.descr;
              raw_info.descr = '';
              var wikiBody = $(`<div>${group.wikiBody}</div>`);
              wikiBody = walkDOM(wikiBody[0]);
              $('#album_desc').val(wikiBody);
              raw_info.descr = tmp_descr;
            }
            $('#release_desc').val(torrent.description.replace(/&emsp;/g, ' '));
            if (torrent.encoding == "24bit Lossless") {
              $('#bitrate').val('24bit Lossless');
            }
            if (group['tags']) {
              $('#tags').val(Object.values(group['tags']).filter(f => f != "").join(', '));
            }
          }, 2000);
        });
      } else {
        add_extra_info();
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 10) ---
if (forward_site == 'OPS') {
        announce = $('input[value*="announce"]').val();
        if (raw_info.releasetype !== undefined) {
          switch (raw_info.releasetype) {
            case 'Single': $('#releasetype').val(9); break;
            case 'Album': $('#releasetype').val(1); break;
            case 'PV': $('#releasetype').val(11); break;
            case 'DVD': $('#releasetype').val(21); break;
            case 'TV-Music': $('#releasetype').val(21); break;
            case 'TV-Variety': $('#releasetype').val(21); break;
            case 'TV-Drama': $('#releasetype').val(21); break;
            case 'Fansubs': $('#releasetype').val(21); break;
            case 'Pictures': $('#releasetype').val(21); break;
          }
        }
        try { if (!$('#tags').val()) { $('#tags').val(raw_info.music_type.replace(/,/g, ', ')) } } catch (err) { }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
if (raw_info.origin_site == 'OPS') {
          raw_info.name = raw_info.name.replace(/–/g, '-');
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
if (forward_site == 'OPS' && raw_info.origin_site == 'jpop') {
          descr_box[0].style.height = '400px';
          raw_info.descr = raw_info.descr.replace(/^\[.*?\/img\]/, '').trim();
        }

