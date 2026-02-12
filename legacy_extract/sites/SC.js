/** Consolidated Logic for: SC **/

// --- From Module: 11_download_clients.js (Snippet 1) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'SC') {
      if (site_url.match(/torrentid=(\d+)/)) {
        torrent_id = site_url.match(/torrentid=(\d+)/)[1];
      }
      try {
        raw_info.url = $(`tr#torrent${torrent_id}`).find('a:contains("IMDB")').attr("href");
      } catch (err) { }
      tbody = document.getElementById("torrent_details");
      raw_info.ptp_poster = $('#covers').find('img').first().attr("src");
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
if (origin_site == 'PTP' || origin_site == 'UHD' || origin_site == 'GPW' || origin_site == 'SC' || origin_site == 'ANT') {
          raw_info.type = '电影';
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == "SC") {
      var torrent_box = document.getElementById("torrent_" + torrent_id);
      var torrent_div = $(torrent_box).find('blockquote').has('blockquote').last();
      raw_info.descr = '[quote]' + torrent_div.find('blockquote').text() + '[/quote]\n\n';
      torrent_div.find('img').map((index, item) => {
        raw_info.descr += '[img]' + $(item).attr('src') + '[/img]\n';
      });
      try { raw_info.name = raw_info.descr.match(/complete.*? name.*?:(.*)/i)[1].trim(); } catch (err) { }
      raw_info.torrent_url = `https://secret-cinema.pw/` + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 7) ---
else if (site == 'SC') {
        if (search_mode == 0 || if_exclusive) {
          return;
        }
        if (raw_info.type != '电影' || (raw_info.name + raw_info.small_descr).match(/DIY|@/)) {
          if (!confirm('该资源可能不是电影或者属于DIY资源，确定发布？')) {
            e.preventDefault();
            return;
          }
        }
        if (raw_info.url) {
          var url = 'https://secret-cinema.pw/torrents.php?action=advanced&searchsubmit=1&filter_cat=1&cataloguenumber=' + raw_info.url.match(/tt\d+/)[0];
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              doc = res.responseText;
              var upload_url = 'https://secret-cinema.pw/upload.php';
              if ($('div.torrent_card_container', doc).length) {
                upload_url += '?group' + $('div.torrent_card_container', doc).find('a').attr('href').match(/id=\d+/)[0];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, '_blank');
              return;
            }
          });
        } else {
          var url = 'https://secret-cinema.pw/torrents.php?searchstr=' + search_name;
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              doc = res.responseText;
              var upload_url = 'https://secret-cinema.pw/upload.php';
              if ($('div.torrent_card_container', doc).length) {
                upload_url += '?group' + $('div.torrent_card_container', doc).find('a').attr('href').match(/id=\d+/)[0];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, '_blank');
              return;
            }
          });
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 8) ---
if (['CMCT', 'PTsbao', 'HDCity', 'BLU', 'UHD', 'HDSpace', 'HDB', 'iTS', 'PTP', 'BYR', 'GPW', 'HDTime', 'HD-Only', 'HDfans',
      'SC', 'MTV', 'NBL', 'avz', 'PHD', 'CNZ', 'ANT', 'TVV', 'xthor', 'HDF', 'OpenCD', 'PigGo', 'RED', 'Tik', 'Aither', 'SugoiMusic', 'CG',
      'ZHUQUE', 'MTeam', 'FNP', 'OnlyEncodes', 'YemaPT', 'DarkLand', '影', 'PTLGS', 'ReelFliX', 'RouSi'].indexOf(forward_site) < 0) {
      if (forward_site == 'HDT') {
        descr_box[0].style.height = '600px';
        var mediainfo_hdt = get_mediainfo_picture_from_descr(raw_info.descr);
        descr_box[0].value = '[quote]' + simplifyMI(mediainfo_hdt.mediainfo, 'HDT') + '[/quote]\n' + mediainfo_hdt.pic_info.replace(/\n/g, '');
      } else if (forward_site != 'HaiDan') {
        if (forward_site != 'OpenCD') {
          descr_box[0].style.height = '800px';
          if ($('textarea[name="technical_info"]').length) {
            descr_box[0].style.height = '460px';
          }
        }
        if (forward_site == 'OPS' && raw_info.origin_site == 'jpop') {
          descr_box[0].style.height = '400px';
          raw_info.descr = raw_info.descr.replace(/^\[.*?\/img\]/, '').trim();
        }
        if (forward_site == 'PTer') {
          if (raw_info.full_mediainfo) {
            if (raw_info.full_mediainfo.match(/mpls/i)) {
              try {
                raw_info.full_mediainfo = raw_info.full_mediainfo.match(/QUICK SUMMARY:([\s\S]*)/)[1].trim();
              } catch (err) { }
            }
            try {
              var info = get_mediainfo_picture_from_descr(raw_info.descr);
              raw_info.descr = raw_info.descr.replace(info.mediainfo, raw_info.full_mediainfo);
            } catch (err) { }
          }
          try {
            raw_info.descr.match(/\[quote\][\s\S]*?\[\/quote\]/g).map((e) => {
              if (e.match(/General.{0,2}\n?(Unique|Complete name)/)) {
                var ee = e.replace('[quote]', '[hide=mediainfo]').replace('[/quote]', '[/hide]');
                raw_info.descr = raw_info.descr.replace(e, ee);
              } else if (e.match(/Disc Title|Disc Info|Disc Label/)) {
                var ee = e.replace('[quote]', '[hide=bdinfo]').replace('[/quote]', '[/hide]');
                raw_info.descr = raw_info.descr.replace(e, ee);
              }
            });
          } catch (err) { }
        } else if (forward_site == 'Audiences' || forward_site == 'TJUPT' || forward_site == 'NexusHD') {
          try {
            raw_info.descr.match(/\[quote\][\s\S]*?\[\/quote\]/g).map((e) => {
              if (e.match(/General|Disc Title|Disc Info|Disc Label|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率/i)) {
                var ee = e.replace('[quote]', '[Mediainfo]').replace('[/quote]', '[/Mediainfo]');
                if (raw_info.full_mediainfo) {
                  ee = `[Mediainfo]${raw_info.full_mediainfo}[/Mediainfo]`;
                }
                if (forward_site == 'TJUPT') {
                  ee = ee.replace('[Mediainfo]', '[mediainfo]').replace('[/Mediainfo]', '[/mediainfo]');
                }
                raw_info.descr = raw_info.descr.replace(e, ee);
              }
            });
          } catch (err) { }
        }
        descr_box[0].value = raw_info.descr;
        if (forward_site == 'BHD') {
          document.getElementById('mediainfo').dispatchEvent(evt);
        }
        if (forward_site == 'TCCF') {
          $('span:contains("[bbcode]")').click();
          descr_box[0].value = raw_info.descr;
          $('span:contains("[bbcode]")').click();
        }
      } else {
        descr_box[2].value = raw_info.descr;
      }
    }

// --- From Module: 21_additional_handlers1.js (Snippet 9) ---
else if (forward_site == 'SC') {
      var announce = $('input[value*="announce"]').val();
      addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, announce);
      var populate = function (res) {
        $('input#title[value=""]').val(res.title);
        if (res.hasOwnProperty('alt_title')) {
          $('input#alternate_title[value=""]').val(res.alt_title);
        }
        $('input#year[value=""]').val(res.year);
        $('input#country[value=""]').val(res.country);
        $('input#language[value=""]').val(res.language);
        $('input#runtime[value=""]').val(res.runtime);
        $('input#tags[value=""]').val(res.taglist);
        if (!$('textarea#album_desc').val()) {
          $('textarea#album_desc').val(res.group_desc);
        }
        if (raw_info.ptp_poster) {
          $('input[name="image"]').val(raw_info.ptp_poster);
        }
        if (!$('input#country').val()) {
          getDoc(raw_info.url, null, function (doc) {
            $('input#country').val($('li.ipc-metadata-list__item:contains("Countr")', doc).find('a').first().text().replace('United States', 'USA').replace('United Kingdom', 'UK'));
            if (!raw_info.ptp_poster) {
              try {
                $('input[name="image"]').val($('a[href*=tt_ov_i]', doc).first().parent().find('img').attr('src').split('_V1_')[0] + '_V1_.jpg');
              } catch (err) { }
              try {
                poster = raw_info.descr.match(/\[img\](\S*?)\[\/img\]/i)[1];
                if (poster.match(/ptpimg/)) {
                  $('input[name="image"]').val(poster);
                }
              } catch (err) { }
            }
          })
        }

        artists = []
        for (var i = 0; i < res.directors.length; i++) {
          artists.push([res.directors[i], 1]);
        }
        for (var i = 0; i < res.writers.length; i++) {
          artists.push([res.writers[i], 2]);
        }
        for (var i = 0; i < res.producers.length; i++) {
          artists.push([res.producers[i], 3]);
        }
        for (var i = 0; i < res.composers.length; i++) {
          artists.push([res.composers[i], 4]);
        }
        for (var i = 0; i < res.actors.length; i++) {
          artists.push([res.actors[i], 5]);
        }
        for (var i = 0; i < res.cinematographers.length; i++) {
          artists.push([res.cinematographers[i], 6]);
        }
        if (artists.length == 1) {
          $('input#artist').val(artists[0])
        } else {
          for (var i = 0; i < artists.length - 1; i++) {
            AddArtistField();
          }
          $('input[name="artists[]"]').each(function (idx) {
            $(this).val(artists[idx][0]);
          })
          var importances = document.querySelectorAll("#importance");
          for (var i = 0; i < importances.length; i++) {
            importances[i].value = artists[i][1];
          }
        }
      }

      $("#imdb_autofill").click(function (event) {
        event.preventDefault();
        var tt = '';
        if ($('#catalogue_number')[0] != undefined)
          tt = $('#catalogue_number')[0].value;
        if ($('#cataloguenumber')[0] != undefined)
          tt = $('#cataloguenumber')[0].value;
        $.ajax({
          type: "GET",
          enctype: 'multipart/form-data',
          url: "/imdb.php?code=" + tt,
          success: function (d) {
            console.log("SUCCESS : ", d);
            var res = JSON.parse(d);
            if (!res.hasOwnProperty('err')) {
              populate(res)
            }
          },
          error: function (e) {
            $("#result").text(e.responseText);
            console.log("ERROR : ", e);
            $("#btnSubmit").prop("disabled", false);

          }
        });
      });

      if (!$('#catalogue_number').val() && raw_info.url) {
        $('#catalogue_number').val(raw_info.url.match(/tt\d+/)[0]);
        $('#imdb_autofill').click();
      }
      switch (raw_info.medium_sel) {
        case 'UHD': case 'Blu-ray': $('#media').val('BDMV'); break;
        case 'Encode': case 'Remux': case 'HDTV': case 'WEB-DL': case 'TV':
          if (raw_info.standard_sel == '1080p') {
            $('#media').val('1080p');
          } else if (raw_info.standard_sel == '720p') {
            $('#media').val('720p');
          } else if (raw_info.standard_sel == '4K') {
            $('#media').val('2160p');
          } else {
            $('#media').val('SD');
          }
          break;
        case 'DVD':
          if (raw_info.name.match(/dvdrip/i)) {
            $('#media').val('SD'); break;
          } else {
            $('#media').val('DVD-R'); break;
          }
      }

      var descr = `{poster}\n\n[hide=MediaInfo]\n{mediainfo}\n[/hide]`;
      var container = $('textarea[name="release_desc"]');
      container.css({ "height": "600px" });
      $('span:contains("[bbcode]")').last().parent().click();
      container.val("");
      try {
        var infos = get_mediainfo_picture_from_descr(raw_info.descr);
        if (raw_info.full_mediainfo) {
          descr = descr.format({ 'mediainfo': raw_info.full_mediainfo });
        } else {
          descr = descr.format({ 'mediainfo': infos.mediainfo })
        }
        get_full_size_picture_urls(null, infos.pic_info, $('#nowhere'), true, function (data) {
          descr = descr.format({ 'poster': data.trim() });
          container.val(descr);
        })
      } catch (err) {
        if (raw_info.full_mediainfo) {
          descr = descr.format({ 'mediainfo': raw_info.full_mediainfo })
        } else {
          descr = descr.format({ 'mediainfo': raw_info.descr })
        }
        container.val(descr);
      }

      $('tr:contains(Film Cover:)').last().find('td:last').append(`<br><br><input type="text" id="poster" name="poster" size="60" value=""><input type="button" id="ptp" value="to-ptp"><input type="button" id="preview" value="preview">
                <br><br><font color="red">如果IMDB的海报不能使用，或许可以检查后转存简介的第一张图片到PTP(需要apikey)。</font>`);
      try { $('#poster').val(raw_info.descr.match(/\[img\](\S*?)\[\/img\]/i)[1]); } catch (err) { }
      $('#ptp').click(() => {
        if ($('#poster').val().match(/https?:\/\/.*?(jpg|png|webp)/)) {
          ptp_send_images($('#poster').val().split(','), used_ptp_img_key)
            .then(function (new_urls) {
              new_urls = new_urls.toString().split(',').join('\n');
              $('#image').val(new_urls.replace(/\[.*?\]/g, ''));
            }).catch(function (err) {
              alert(err);
            });
        } else {
          alert('请输入图片地址！！');
        }
      });
      $('#preview').click(() => {
        window.open($('#poster').val(), '_blank');
      });
    }

