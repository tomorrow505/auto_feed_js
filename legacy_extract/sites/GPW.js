/** Consolidated Logic for: GPW **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https:\/\/greatposterwall.com\/torrents.php.*/)) {
  if (location.href.match(/id=\d+/)) {
    var number = parseInt($('tr.TableTorrent-rowDetail').length / 2);
    $(`tr.TableTorrent-rowDetail:lt(${number + 1})`).each((index, e) => {
      var tid = $(e).attr('id').match(/\d+/)[0];
      var torrent_name = $(e).find('a:contains(详情)').parent().text().split('详情 | ')[1];
      var torrent_info = $(e).prev().find('td').text();
      torrent_name = get_group_name(torrent_name, torrent_info);
      if (torrent_name == 'Unknown' && torrent_info.match(/Blu-ray/)) {
        show_files(tid, 'detail');
        $(e).find('table[class="TableTorrentFileList Table"]').wait(function () {
          var torrent_td = $(e).find('table[class="TableTorrentFileList Table"]').find('tr:first').find('td:first');
          torrent_name = torrent_td.text().replace(/\//g, '');
          torrent_name = get_group_name(torrent_name, torrent_info);
          $(`#torrent${tid}`).find('span.TorrentTitle ').append(`/<span style="font-weight:bold;color:#20B2AA">${torrent_name}</span>`);
          show_files(tid, 'detail');
        });
      } else {
        $(e).prev().find('span.TorrentTitle ').append(` / <span style="font-weight:bold;color:#20B2AA">${torrent_name}</span>`);
      }
    });
  } else {
    $('td.is-name[colspan="3"]').each((index, e) => {
      var torrent = $(e).find('a[href*="torrentid"]');
      var torrent_name = torrent.attr('data-tooltip');
      torrent_name = get_group_name(torrent_name, '');
      torrent.append(` / <span style="font-weight:bold;color:#20B2AA">${torrent_name}</span>`);
    })
  }
}

// --- From Module: 06_site_detection.js (Snippet 2) ---
if (site_url.match(/u2.dmhy.org|ourbits.club|hd-space.org|totheglory.im|blutopia.cc|star-space.net|torrent.desi|hudbt|fearnopeer.com|darkland.top|onlyencodes.cc|cinemageddon|eiga.moi|hd-olimpo.club|digitalcore.club|bwtorrents.tv|myanonamouse|greatposterwall.com|m-team.cc/i)) {
        n.innerHTML = '\r\n';
      }

// --- From Module: 09_data_processing.js (Snippet 3) ---
else if (site == 'GPW') {
        input_box.style.width = '330px';
        textarea.style.width = '650px';
      }

// --- From Module: 11_download_clients.js (Snippet 4) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 5) ---
if (origin_site == 'GPW') {
      if (site_url.match(/torrentid=(\d+)/)) {
        torrent_id = site_url.match(/torrentid=(\d+)/)[1];
      }
      try {
        raw_info.url = match_link('imdb', $('div.LayoutBody').html());
        console.log(raw_info.url)
      } catch (err) { }
      tbody = document.getElementById("torrent_details");
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
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

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
if (origin_site == 'PTP' || origin_site == 'UHD' || origin_site == 'GPW' || origin_site == 'SC' || origin_site == 'ANT') {
          raw_info.type = '电影';
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 8) ---
if (origin_site == 'GPW') {
      var torrent_box = document.getElementById("torrent_detail_" + torrent_id);
      raw_info.name = $(torrent_box).find('a[data-action="toggle-mediainfo"]').parent().text().split('详情 | ')[1].replace(/\[|\]|\(|\)|mkv$|mp4$/g, '').trim();
      if (!raw_info.name) {
        raw_info.name = $(torrent_box).find('table.filelist_table').find('tr:eq(1)').find('td:eq(0)').text().replace(/\[|\]|\(|\)|mkv$|mp4$/g, '').trim();
      }
      raw_info.descr = walkDOM(torrent_box.getElementsByClassName('MediaInfoText')[0].cloneNode(true));
      raw_info.descr = `[quote]\n${raw_info.descr}\n[/quote]\n\n`;
      $(torrent_box).find('img[class="scale_image"]').each((index, e) => {
        raw_info.descr += `[img]${$(e).attr('src')}[/img] `;
      });
      $(torrent_box).find('div[class="comparison"]').each((index, e) => {
        var info = $(e).find('a').attr('onclick').match(/\[.*?\]/g);
        raw_info.descr += '\n\n[b]对比图[/b]\n\n' + info[0].replace(/\[|\]|'/g, '').replace(',', ' |') + '\n';
        info[1].replace(/\[|\]|'/g, '').split(',').forEach((ee) => {
          raw_info.descr += `[img]${ee.trim()}[/img]`;
        });
      });
      raw_info.torrent_url = `https://greatposterwall.com/` + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 9) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 10) ---
else if (site == 'GPW') {
        if (search_mode == 0 || if_exclusive) {
          return;
        }
        if (raw_info.url) {
          var url = 'https://greatposterwall.com/torrents.php?searchstr=' + raw_info.url.match(/tt\d+/)[0];
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              var upload_url = 'https://greatposterwall.com/upload.php';
              if (res.responseText.match(/upload.php\?groupid=\d+/)) {
                upload_url += '?group' + res.responseText.match(/upload.php\?group(id=\d+)/)[1];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, '_blank');
              return;
            }
          });
        } else {
          var url = 'https://greatposterwall.com/torrents.php?searchstr=' + search_name;
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              var upload_url = 'https://greatposterwall.com/upload.php';
              if (res.responseText.match(/group_movie_title_a.*id=\d+/)) {
                upload_url += '?group' + res.responseText.match(/group_movie_title_a.*(id=\d+)/)[1];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, '_blank');
              return;
            }
          });
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
if (allinput[i].name == 'name' && forward_site != 'GPW' && forward_site != 'OpenCD') { //填充标题
        if (['NanYang', 'CMCT', 'iTS', 'NPUPT', 'xthor'].indexOf(forward_site) > -1) {
          allinput[i].value = raw_info.name.replace(/\s/g, ".");
        } else if (forward_site == 'TTG') {
          raw_info.name = raw_info.name.replace(/(5\.1|2\.0|7\.1|1\.0)/, function (data) {
            return data.replace('.', '{@}');
          });
          raw_info.name = raw_info.name.replace(/h\.(26(5|4))/i, 'H{@}$1');
          $('input[name=subtitle]').val(raw_info.small_descr.trim());
          allinput[i].value = raw_info.name;
        } else if (forward_site == 'PuTao') {
          raw_info.name = '[{chinese}] {english}'.format({
            'english': raw_info.name,
            'chinese': get_small_descr_from_descr(raw_info.descr, raw_info.name).split('/')[0].split(/\| 类别/)[0].split('*')[0].trim()
          });
          allinput[i].value = raw_info.name;
        } else if (forward_site == 'Panda') {
          raw_info.name = raw_info.name.replace(/TrueHD(\d\.\d)/, 'TrueHD $1');
          raw_info.name = raw_info.name.replace(/DTS-HD.?MA.?(\d\.\d)/, 'DTS-HD MA $1');
          raw_info.name = raw_info.name.replace(/DTS-HD.?(HRA?).?(\d\.\d)/, 'DTS-HD $1 $2');
          allinput[i].value = raw_info.name;
        } else {
          if (forward_site == 'BLU') {
            raw_info.name = raw_info.name.replace(/Remux/i, 'REMUX');
            raw_info.name = raw_info.name.replace(/(Atmos)(.*?)(TrueHD)(.*?)(7.1)/, '$2$3 $5 $1').replace(/ +/g, ' ');
            if (raw_info.name.match(/DV HDR/i)) {
              raw_info.name = raw_info.name.replace(/(1080|2160)[pi]/i, function (data) {
                return 'Hybrid ' + data;
              });
            }
            raw_info.name = raw_info.name.replace(/DDP/i, 'DD+');
            raw_info.name = raw_info.name.replace(/(DD\+|DD|AAC|TrueHD|DTS.HD.?MA|DTS.HD.?HR|DTS.HD|DTS|L?PCM|FLAC)(.*?)(5\.1|2\.0|7\.1|1\.0)/i, '$1 $3');
            raw_info.name = raw_info.name.replace(/(WEB-DL)(.*?)(AVC|x264|H264)/i, '$1$2H.264');
            raw_info.name = raw_info.name.replace(/(WEB-DL)(.*?)(HEVC|x265|H265)/i, '$1$2H.265');
          }
          if (['ACM'].indexOf(forward_site) > -1) {
            raw_info.name = raw_info.name.replace(/DDP/i, 'DD+');
            raw_info.name = raw_info.name.replace(/(DD\+|DD|AAC|TrueHD|DTS.HD.?MA|DTS.HD.?HR|DTS.HD|DTS|L?PCM|FLAC)[ \.](.*?)(5\.1|2\.0|7\.1|1\.0)/i, '$1$3');
            raw_info.name = raw_info.name.replace(/(WEB-DL|HDTV|SDTV)(.*?)(AVC|x264|H264)/i, '$1$2H.264');
            raw_info.name = raw_info.name.replace(/(WEB-DL|HDTV|SDTV)(.*?)(x265|H265|H.265)/i, '$1$2HEVC');
          }
          if (['BHD'].indexOf(forward_site) > -1) {
            raw_info.name = raw_info.name.replace(/DD\+/i, 'DDP');
            raw_info.name = raw_info.name.replace(/(DDP|DD|AAC|TrueHD|DTS.HD.?MA|DTS.HD.?HR|DTS.HD|DTS|L?PCM|FLAC)(.*?)(5\.1|2\.0|7\.1|1\.0)/i, '$1 $3');
          }
          allinput[i].value = raw_info.name;
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
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

