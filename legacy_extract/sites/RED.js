/** Consolidated Logic for: RED **/

// --- From Module: 11_download_clients.js (Snippet 1) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'RED') {
      if (site_url.match(/torrentid=(\d+)/)) {
        torrent_id = site_url.match(/torrentid=(\d+)/)[1];
      }
      getJson(`https://redacted.sh/ajax.php?action=torrent&id=${torrent_id}`, null, function (data) {
        raw_info.json = JSON.stringify(data);
        raw_info.log_info = [];
        $(`#logs_${torrent_id}`).find('blockquote').map((index, e) => {
          if (!$(e).text().match(/max 100/)) {
            raw_info.log_info.push($(e).text());
          }
        });
        raw_info.log_info = raw_info.log_info.join('==logs==');
        rebuild_href(raw_info);
      });
      raw_info.name = document.getElementsByTagName('h2')[0].textContent;
      raw_info.music_name = $('h2>span[dir="ltr"]').text();
      raw_info.music_author = raw_info.name.split(raw_info.music_name)[0].replace(/-.?$/, '').trim();
      raw_info.name = raw_info.name.replace(/\[|\]/g, '*');
      var cover_box = document.getElementById('cover_div_0');
      try {
        var cover = cover_box.getElementsByTagName('img')[0].getAttribute('onclick');
        cover = cover.match(/'(.*)'/)[1];
      } catch (err) {
        var cover = cover_box.getElementsByTagName('img')[0].getAttribute('src');
      }
      var mediainfo = document.getElementsByClassName('torrent_description')[0].getElementsByClassName('body')[0];
      raw_info.tracklist = mediainfo.textContent;
      if ($(mediainfo).find('ol.postlist').length) {
        $(mediainfo).find('ol.postlist').find('li').map((index, e) => {
          if (index == 0) {
            raw_info.tracklist = raw_info.tracklist.split($(e).text())[0];
          }
          raw_info.tracklist += `\n${index + 1} ${$(e).text()}`;
        });
      }
      raw_info.descr = '[img]' + cover + '[/img]\n\n';
      raw_info.type = '音乐';
      tbody = document.getElementById('torrent_details');
      var torrent_tr = $(`#torrent${torrent_id}`);
      count = 0;
      while (count <= 25) {
        var edition_info = torrent_tr.text().trim().match(/^− /) ? torrent_tr.text().trim().replace('− ', '') : '';
        if (edition_info) {
          break;
        }
        torrent_tr = torrent_tr.prev();
        count += 1;
      }
      raw_info.edition_info = edition_info;
      raw_info.torrent_url = `https://redacted.sh/` + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
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
else if (origin_site == 'RED') {
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

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == 'RED') {
      var torrent_box = document.getElementById('torrent_' + torrent_id);
      var aaas = torrent_box.getElementsByTagName('a')[2];
      if (aaas.getAttribute('onclick').match(/show_logs/)) {
        aaas.click();
        setTimeout(function () {
          try {
            var log_box = document.getElementById('logs_' + torrent_id);
            raw_info.log_info = log_box.textContent;
          } catch (err) { }
        }, 3000);
      }

      var append_info = torrent_box.getElementsByTagName('blockquote');
      append_info = append_info[append_info.length - 1].textContent;
      if (!append_info.match(/Uploaded/)) {
        raw_info.descr += append_info;
      }

      var tag_box = document.getElementsByClassName('nobullet');
      tag_box = tag_box[tag_box.length - 1];
      var aaaas = tag_box.getElementsByTagName('a');

      raw_info.descr += '\n\n标签： ';

      for (i = 0; i < aaaas.length; i++) {
        if (aaaas[i].textContent.match(/[a-z]/i)) {
          if (i > 0) {
            raw_info.descr += ' | ' + aaaas[i].textContent;
          } else {
            raw_info.descr += aaaas[i].textContent;
          }
        }
      }
      raw_info.descr += '\n\n';
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
if (this.id == "影" && ['CMCT', 'TTG', 'UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) < 0) {
          info = if_ying_allowed();
          if (info.length) {
            if (!confirm(`转发该资源可能违反站点以下规则:\n${info.join('\n')}\n具体细节请查看站点规则页面。\n是否仍继续发布？`)) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 8) ---
if (['UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) > -1) {
      $('.forward_a').click(function (e) {
        if (['KG', 'PTP', 'HDCity', 'BTN', 'GPW', 'common_link', 'SC', 'avz', 'PHD', 'CNZ', 'TVV', 'ANT', 'NBL', 'CarPt'].indexOf(this.id) > -1) {
          return;
        }
        e.preventDefault();
        if (if_exclusive && search_mode) {
          return;
        }
        if (search_mode == 0) {
          window.open(this.href, '_blank');
          return;
        }
        if (origin_site == 'UHD' && uhd_lack_descr) {
          var tmp_name = raw_info.descr.match(/movie name.*?:(.*)/i);
          if (tmp_name && !raw_info.name) {
            raw_info.name = tmp_name[1].trim();
            if (check_descr(raw_info.descr)) {
              tmp_name = document.getElementsByClassName('imovie_title')[0].textContent.replace(/\(|\)/g, '').trim();
              raw_info.name = get_bluray_name_from_descr(raw_info.descr, tmp_name);
            }
          }
          raw_info.name = deal_with_title(raw_info.name);
          if (raw_info.name.match(/S\d{2,3}/i)) {
            raw_info.type = '剧集';
          } else {
            raw_info.type = '电影';
          }
          uhd_lack_descr = false;
        }
        if (origin_site == 'TJUPT' || origin_site == 'PTsbao') {
          if (raw_info.type == '动漫') {
            raw_info.animate_info = document.getElementById('top').textContent;
          }
          descr = document.getElementById("kdescr");
          descr = descr.cloneNode(true);
          try {
            var codetop = descr.getElementsByClassName('codetop');
            Array.from(codetop).map((e, index) => {
              try { descr.removeChild(e); } catch (err) { e.parentNode.removeChild(e) }
            });
          } catch (err) {
            console.log(err);
          }
          raw_info.descr = '';
          raw_info.descr = walkDOM(descr);
          raw_info.descr = raw_info.descr.replace(/站外链接 :: /ig, '');
          if (raw_info.descr.match(/Infinity-1.2s-64px.svg/)) {
            if (!confirm('图片可能加载不完全，是否仍继续转载？')) {
              e.preventDefault();
              return;
            }
          }
        }

        var _id = this.id;
        var _href = this.href;
        re_forward(_id, _href, raw_info);
      });
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 9) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 10) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
if (raw_info.origin_site == 'RED') {
          try {
            raw_info.music_type = raw_info.descr.match(/标签： (.*)/)[1].split(' | ');
            raw_info.descr = raw_info.descr.replace(/标签： (.*)/, '');
          } catch (err) { }
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 13) ---
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

