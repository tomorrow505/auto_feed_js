/** Consolidated Logic for: UHD **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https:\/\/uhdbits.org\/torrents.php\?id=\d+#separator#/)) {
  var user_page = $('#nav_userinfo').find('a:first').attr('href');
  $('#torrent_details').find('tr[class*=torrentdetails]').map((index, e) => {
    if ($(e).find(`a[href*="${user_page}"]`).length) {
      if ($(e).find('span[class="time tooltip"]').text().match(/^(\d+ mins?|Just now)/)) {
        tid = $(e).attr('id').match(/\d+/)[0];
        var durl = $(`a[href*="action=download&id=${tid}"]`).attr('href');
        window.open(durl, '_blank');
      }
    }
  });
}

// --- From Module: 11_download_clients.js (Snippet 2) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 3) ---
if (origin_site == 'UHD') {
      uhd_lack_descr = true;
      if (site_url.match(/torrentid=(\d+)/)) {
        torrent_id = site_url.match(/torrentid=(\d+)/)[1];
      }
      var imdb_box = document.getElementsByClassName('imovie_title')[0];
      raw_info.url = match_link('imdb', imdb_box.innerHTML);
      tbody = document.getElementById('torrent_details');
      try {
        var youtube_info = $('.box_trailer').html();
        if (youtube_info.match(/www.youtube.com\/embed\/([a-zA-Z0-9-]*)/)) {
          raw_info.youtube_url = youtube_info.match(/www.youtube.com\/embed\/([a-zA-Z0-9-]*)/)[1];
        }
      } catch (err) { }

      setTimeout(function () {
        if (raw_info.url && all_sites_show_douban) {
          getData(raw_info.url, function (res) {
            console.log(res);
            if (res.data) {
              var score = res.data.average + '分';
              if (!score.replace('分', '')) score = '暂无评分';
              if (res.data.votes) score += `|${res.data.votes}人`;
              $a = $('div.imovie_title').find('a:eq(0)').attr('href', `${douban_prex}${res.data.id}`);
              $('div.imovie_title').html(`${res.data.title.split(' ')[0]}[${score}]`)
              $('div.imovie_title').append($a);
              console.log($('dt:contains(Plot)').next())
              $('dt:contains(Plot)').next().text(res.data.summary.replace(/ 　　/g, ''))
            }
          });
        }

      }, 1000);
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
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

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == 'PTP' || origin_site == 'UHD' || origin_site == 'GPW' || origin_site == 'SC' || origin_site == 'ANT') {
          raw_info.type = '电影';
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
if (origin_site == 'HDF' || origin_site == 'UHD') {
            if (tds[i].parentNode.textContent.match(/s\d{1,3}/i)) {
              raw_info.type = '剧集';
            } else {
              raw_info.type = '电影';
            }
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
if (origin_site == 'UHD') {
      raw_info.name = $('h2:first').text().split('[')[0];
      var realese_box = document.getElementById('release_' + torrent_id);

      var compare_string = '';
      var img_urls = '';
      raw_info.descr = '[quote]' + $(`#torrent_${torrent_id}`).find('#media-info').text() + '[/quote]\n\n';

      setTimeout(function () {
        var torrent_tr = document.getElementById('torrent_' + torrent_id);
        var description_box = document.getElementById('files_' + torrent_id);
        raw_info.name = description_box.getElementsByTagName('tr')[1].getElementsByTagName('td')[0].textContent;
        raw_info.name = raw_info.name.replace(/(\.mkv$|\.mp4)/, '');
        if (raw_info.name.match(/S\d+/i)) {
          raw_info.type = '剧集';
        }
        try {
          raw_info.name = description_box.getElementsByTagName('tr')[0].textContent.match(/\/(.*)\//)[1];
        } catch (err) { }

        if (raw_info.descr.match(/.MPLS/i)) {
          var tmp_name = document.getElementsByClassName('imovie_title')[0].textContent.replace(/\(|\)/g, '').trim();
          raw_info.name = get_bluray_name_from_descr(raw_info.descr, tmp_name);
        }

        raw_info.name = deal_with_title(raw_info.name);

        while (true) {
          description_box = description_box.nextSibling;
          if (description_box.nodeName == 'DIV') {
            break;
          }
        }
        var spans = description_box.getElementsByTagName('span');
        compare_count = 0;
        for (i = 0; i < spans.length; i++) {
          if (spans[i].style.color) {
            color = rgb_2_hex(spans[i].style.color);
            compare_string += '|' + '[color=' + color + ']' + spans[i].textContent + '[/color]';
            compare_count += 1;
          }
        }
        if (compare_string) {
          compare_string += '|';
        }
        var imgs = description_box.getElementsByTagName('img');
        img_count = 0;
        for (i = 0; i < imgs.length; i++) {
          if (imgs[i].parentNode.nodeName == 'A') {
            if (compare_count) {
              img_count += 1;
              if ((img_count) % compare_count == 0 && i != 1) {
                img_urls += '[url=' + imgs[i].parentNode.href + '][img]' + imgs[i].src + '[/img][/url]\n';
              } else {
                img_urls += '[url=' + imgs[i].parentNode.href + '][img]' + imgs[i].src + '[/img][/url]';
              }
            }
            else {
              img_urls += '[url=' + imgs[i].parentNode.href + '][img]' + imgs[i].src + '[/img][/url]';
            }
          } else {
            img_urls += '[img]' + imgs[i].src + '[/img]\n';
          }
        }
        img_urls = img_urls.replace(/http:\/\/anonym.to\/\?/ig, '');
        raw_info.descr += img_urls;

        set_jump_href(raw_info, 1);
      }, 2000);
      raw_info.torrent_url = `https://uhdbits.org/` + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 8) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 9) ---
if (origin_site != 'UHD' && origin_site != 'TTG') {
          document.getElementById('common_link').onclick = function () {
            var key;
            for (index in site_order) {
              key = site_order[index];
              if (used_common_sites.indexOf(key) > -1 && origin_site != key) {
                if (['PTP', 'KG', 'BTN', 'GPW', 'SC', 'avz', 'PHD', 'CNZ', 'ANT', 'NBL', 'HDCity'].indexOf(key) < 0) {
                  var site_href = document.getElementById(key).href;
                  window.open(site_href, '_blank');
                } else {
                  $(`#${key}`).click();
                }
              }
            }
          };
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 10) ---
if (this.id == "影" && ['CMCT', 'TTG', 'UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) < 0) {
          info = if_ying_allowed();
          if (info.length) {
            if (!confirm(`转发该资源可能违反站点以下规则:\n${info.join('\n')}\n具体细节请查看站点规则页面。\n是否仍继续发布？`)) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 11) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 12) ---
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

// --- From Module: 18_forward_site_filling2.js (Snippet 14) ---
else if (forward_site == 'UHD') {
      $('#anonymous').prop('checked', if_uplver);
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 15) ---
case 'UHD': source_box.val(1); break;

// --- From Module: 18_forward_site_filling2.js (Snippet 16) ---
case 'UHD': case 'Blu-ray': medium_box.val(1); break;

// --- From Module: 18_forward_site_filling2.js (Snippet 17) ---
case 'UHD':
          medium_box.val('s54');
          if (labels.diy) {
            medium_box.val('s53')
          }
          break;

// --- From Module: 18_forward_site_filling2.js (Snippet 18) ---
case 'UHD':
            if (raw_info.name.match(/DIY|@/i)) {
              medium_sel = 'UHD Blu-ray DIY';
            } else {
              medium_sel = 'UHD Blu-ray';
            }
            break;

// --- From Module: 18_forward_site_filling2.js (Snippet 19) ---
case 'UHD': medium_code = 'Blu-rayUHD'; break;

// --- From Module: 18_forward_site_filling2.js (Snippet 20) ---
case 'UHD': $("select[name='medium_sel']").val('12'); break;

// --- From Module: 18_forward_site_filling2.js (Snippet 21) ---
case 'UHD':
          if (raw_info.name.match(/DIY|@/i)) {
            medium_box.val(13);
          } else {
            medium_box.val(12);
          }
          break;

// --- From Module: 19_forward_site_filling3.js (Snippet 22) ---
case 'UHD': source_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 23) ---
case 'UHD': medium_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 24) ---
case 'UHD':
            if (raw_info.name.match(/(diy|@)/i)) {
              medium_box.options[2].selected = true;
            }
            break;

// --- From Module: 19_forward_site_filling3.js (Snippet 25) ---
case 'UHD':
            if (raw_info.name.match(/(diy|@)/i)) {
              medium_box.options[2].selected = true;
            }
            break;

// --- From Module: 19_forward_site_filling3.js (Snippet 26) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 27) ---
case 'UHD': case 'Blu-ray': medium_box.val(1); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 28) ---
case 'UHD': case 'Blu-ray': medium_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 29) ---
case 'UHD': medium_box.options[2].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 30) ---
case 'UHD': case 'Blu-ray': $('#torrent_name_field2').val('BluRay'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 31) ---
case 'UHD': case 'Blu-ray': case 'Remux': case 'Encode': $('#record_medium').val('BluRay'); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 32) ---
case 'UHD': medium_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 33) ---
case 'UHD': case 'Blu-ray': source_box.val(55); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 34) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 19_forward_site_filling3.js (Snippet 35) ---
case 'UHD': medium_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 36) ---
case 'UHD':
          if (labels.diy) {
            medium_box.val(18);
          } else if (raw_info.name.match(/remux/i)) {
            medium_box.val(19);
          } else {
            medium_box.val(17);
          }
          break;

// --- From Module: 19_forward_site_filling3.js (Snippet 37) ---
case 'UHD':
          if (labels.diy) {
            medium_box.val(2);
          } else {
            medium_box.val(1);
          }
          break;

// --- From Module: 19_forward_site_filling3.js (Snippet 38) ---
case 'UHD': medium_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 39) ---
case 'UHD': case 'Blu-ray': case 'Encode': autosource.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 40) ---
case 'UHD': medium_box.options[2].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 41) ---
case 'UHD': medium_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 42) ---
case 'UHD': medium_box.options[2].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 43) ---
case 'UHD':
          if (labels.diy) {
            medium_box.options[8].selected = true;
          } else {
            medium_box.options[4].selected = true;
          }
          break;

// --- From Module: 19_forward_site_filling3.js (Snippet 44) ---
case 'UHD': source_box.options[1].selected = true; break;

// --- From Module: 19_forward_site_filling3.js (Snippet 45) ---
case 'UHD': medium_box.options[1].selected = true; break;

// --- From Module: 20_forward_site_filling4.js (Snippet 46) ---
case 'UHD': source_box.val(2); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 47) ---
case 'UHD': source_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 48) ---
case 'UHD': medium_box.val(11); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 49) ---
case 'UHD': r_source = 'UHD Blu-ray'; break;

// --- From Module: 20_forward_site_filling4.js (Snippet 50) ---
case 'UHD': medium_box.val(8); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 51) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 52) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 53) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 54) ---
case 'UHD': case 'Blu-ray':
          medium_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 55) ---
case 'UHD': medium_box.val(24); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 56) ---
case 'UHD': medium_box.val(8); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 57) ---
case 'UHD': case 'Blu-ray': medium_box.options[5].selected = true; break;

// --- From Module: 20_forward_site_filling4.js (Snippet 58) ---
case 'UHD': case 'Blu-ray': medium_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 59) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 60) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 61) ---
case 'UHD': case 'Blu-ray': medium_box.val(6); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 62) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 63) ---
case 'UHD': case 'Blu-ray': medium_box.val(1); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 64) ---
case 'UHD': medium_box.val(14); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 65) ---
case 'UHD': case 'Blu-ray': medium_box.val(9); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 66) ---
case 'UHD': category_box.val('70'); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 67) ---
case 'UHD': category_box.val('72'); break;

// --- From Module: 20_forward_site_filling4.js (Snippet 68) ---
case 'UHD':
            if (raw_info.name.match(/remux/i)) {
              $('#autotype').val('12');
            } else {
              if (0 <= size && size < 46.57) {
                $('#autotype').val('3');
              } else if (size < 61.47) {
                $('#autotype').val('2');
              } else {
                $('#autotype').val('1');
              }
            }
            break;

// --- From Module: 20_forward_site_filling4.js (Snippet 69) ---
case 'UHD': source_box.options[4].selected = true; break;

// --- From Module: 20_forward_site_filling4.js (Snippet 70) ---
case 'UHD': source_box.options[1].selected = true; break;

// --- From Module: 21_additional_handlers1.js (Snippet 71) ---
else if (forward_site == 'UHD') {

      function add_info(mode) {
        var announce = $('input[value*="announce"]').val();
        addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, announce);

        if ((raw_info.type == '剧集' || raw_info.type == '纪录' || raw_info.type == '综艺') && mode) {
          $('#categories').val("2");
          document.getElementById('categories').dispatchEvent(evt);
        }

        try { $('#imdbid').val(raw_info.url.match(/tt\d+/)[0]); $('#imdb_button').click(); } catch (err) { }

        setTimeout(function () {
          try { $('#imdbid').val(raw_info.url.match(/tt\d+/)[0]); } catch (err) { }
          if ((raw_info.type == '剧集' || raw_info.type == '纪录') && mode) {
            try { $('#season').val(parseInt(raw_info.name.match(/S(\d+)/i)[1])); } catch (err) { }
          }
          var standard_box = document.getElementsByName('format')[0];
          var standard_dict = { '4K': 5, '1080p': 3, '1080i': 4, '720p': 2, 'SD': 6, '': 6, '8K': 5 };
          if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
            var index = standard_dict[raw_info.standard_sel];
            standard_box.options[index].selected = true;
          }
          try { $('#team').val(raw_info.name.split('-').pop()); } catch (err) { }
          var source_box = document.getElementsByName('media')[0];
          switch (raw_info.medium_sel) {
            case 'UHD': source_box.options[1].selected = true; break;
            case 'Blu-ray': source_box.options[1].selected = true; break;
            case 'Remux': source_box.options[2].selected = true; break;
            case 'HDTV': source_box.options[7].selected = true; break;
            case 'Encode': source_box.options[3].selected = true; break;
            case 'WEB-DL': source_box.options[4].selected = true; break;
            default:
              source_box.options[8].selected = true;
          }
          if (raw_info.name.match(/webrip/i)) {
            source_box.options[5].selected = true;
          } else if (raw_info.name.match(/hdrip/i)) {
            source_box.options[6].selected = true;
          }

          //视频编码
          var codec_box = $('select[name=codec]');
          switch (raw_info.codec_sel) {
            case 'H265': codec_box.val('HEVC'); break;
            case 'X265': codec_box.val('x265'); break;
            case 'H264': codec_box.val('H.264'); break;
            case 'X264': codec_box.val('x264'); break;
            case 'VC-1': codec_box.val('VC-1'); break;
            case 'MPEG-2': case 'MPEG-4': codec_box.val('MPEG-2'); break;
          }


          var infos = get_mediainfo_picture_from_descr(raw_info.descr);
          infos.mediainfo = infos.mediainfo.replace(/ \n/g, '\n');
          $('textarea[name="mediainfo"]').val(infos.mediainfo);
          $('textarea[name="mediainfo"]').css({ 'height': '400px' });
          $('textarea[name="release_desc"]').val(infos.pic_info);
          $('textarea[name="release_desc"]').css({ 'height': '300px' });

          $('#genre_tags').parent().append(`<input type="button" id="remove_id" value="移除ID"></input>`);
          $('#remove_id').click(function () {
            $('#tags').removeAttr('id');
            $('#remove_id').attr('disabled', true);
          });
        }, 5000);
      }
      add_info(1);
      $('#categories').on('change', function () {
        add_info(0);
      });
    }

// --- From Module: 21_additional_handlers1.js (Snippet 72) ---
case 'UHD': source_box.options[1].selected = true; break;

// --- From Module: 21_additional_handlers1.js (Snippet 73) ---
case 'UHD': source_box.options[1].selected = true; break;

// --- From Module: 21_additional_handlers1.js (Snippet 74) ---
case 'UHD': case 'Blu-ray': case 'DVD': $('#type_medium').val("1"); break;

// --- From Module: 21_additional_handlers1.js (Snippet 75) ---
case 'UHD':
          source_box.val(16);
          if (labels.diy) {
            source_box.val(17);
          }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 76) ---
case 'UHD': medium_box.val(16); break;

// --- From Module: 21_additional_handlers1.js (Snippet 77) ---
case 'UHD': medium_box.val(2); break;

// --- From Module: 21_additional_handlers1.js (Snippet 78) ---
case 'UHD': medium_box.val(2); break;

// --- From Module: 21_additional_handlers1.js (Snippet 79) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 80) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 81) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 82) ---
case 'UHD': source_box.val(23); break;

// --- From Module: 21_additional_handlers1.js (Snippet 83) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 21_additional_handlers1.js (Snippet 84) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 21_additional_handlers1.js (Snippet 85) ---
case 'UHD': medium_box.val(11); break;

// --- From Module: 21_additional_handlers1.js (Snippet 86) ---
case 'UHD': medium_box.val(3); break;

// --- From Module: 21_additional_handlers1.js (Snippet 87) ---
case 'UHD': medium_box.val(9); break;

// --- From Module: 21_additional_handlers1.js (Snippet 88) ---
case 'UHD': case 'Blu-ray': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 89) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 90) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 91) ---
case 'UHD': medium_box.val(2); break;

// --- From Module: 21_additional_handlers1.js (Snippet 92) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 93) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 94) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 21_additional_handlers1.js (Snippet 95) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 96) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 21_additional_handlers1.js (Snippet 97) ---
case 'UHD':
          if (raw_info.name.match(/DIY|@/i)) {
            medium_box.val(11);
          } else {
            medium_box.val(10);
          }
          break;

// --- From Module: 21_additional_handlers1.js (Snippet 98) ---
case 'UHD': source_box.val(11); break;

// --- From Module: 21_additional_handlers1.js (Snippet 99) ---
case 'UHD': case 'Blu-ray': case 'Encode': case 'Remux': $('#source').val('Blu-ray'); break;

// --- From Module: 21_additional_handlers1.js (Snippet 100) ---
case 'UHD': case 'Blu-ray': $('#media').val('BDMV'); break;

// --- From Module: 22_additional_handlers2.js (Snippet 101) ---
case 'UHD': case 'Blu-ray': case 'Encode': case 'Remux':
          $('#source').val('Blu-ray');
          $('#processing-container').removeClass('hidden');
          if (raw_info.medium_sel == 'Encode') {
            $('#processing').val('Encode');
          } else if (raw_info.medium_sel == 'Remux') {
            $('#processing').val('Remux');
          } else if (labels.diy) {
            $('#processing').val('DIY');
          } else if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
            $('#processing').val('Untouched');
            var size = 0;
            try {
              $('select[name="processing_other"]').removeClass('hidden');
              size = get_size_from_descr(raw_info.descr);
              if (0 <= size && size < 23.28) {
                $('select[name="processing_other"]').val('BD25');
              } else if (size < 46.57) {
                $('select[name="processing_other"]').val('BD50');
              } else if (size < 61.47) {
                $('select[name="processing_other"]').val('BD66');
              } else {
                $('select[name="processing_other"]').val('BD100');
              }
              $('#container').val('m2ts');
            } catch (Err) { }
          }
          break;

// --- From Module: 22_additional_handlers2.js (Snippet 102) ---
case 'UHD': source_box.val('Blu-ray 4K'); break;

// --- From Module: 22_additional_handlers2.js (Snippet 103) ---
case 'UHD': case 'Blu-ray': case 'Encode': case 'Remux': $('select[name=media]').val('Blu-ray'); break;

// --- From Module: 22_additional_handlers2.js (Snippet 104) ---
case 'UHD': case 'Blu-ray': case 'Encode': case 'Remux': $('select[name=media]').val('Blu-ray'); break;

// --- From Module: 22_additional_handlers2.js (Snippet 105) ---
case 'UHD': case 'Blu-ray': $('select[name=media]').val('Blu-Ray Original'); break;

// --- From Module: 22_additional_handlers2.js (Snippet 106) ---
case 'UHD': case 'Blu-ray': $('select[name="source"]').val('Other'); break;

// --- From Module: 22_additional_handlers2.js (Snippet 107) ---
case 'UHD': medium_box.val(0); break;

// --- From Module: 22_additional_handlers2.js (Snippet 108) ---
case 'UHD':
          if (labels.diy) {
            medium_box.val(2);
          } else {
            medium_box.val(1);
          }
          break;

// --- From Module: 22_additional_handlers2.js (Snippet 109) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 22_additional_handlers2.js (Snippet 110) ---
case 'UHD': medium_box.val(11); break;

// --- From Module: 22_additional_handlers2.js (Snippet 111) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 22_additional_handlers2.js (Snippet 112) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 22_additional_handlers2.js (Snippet 113) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 22_additional_handlers2.js (Snippet 114) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 22_additional_handlers2.js (Snippet 115) ---
case 'UHD': labels.diy ? medium_box.val(12) : medium_box.val(11); break;

// --- From Module: 22_additional_handlers2.js (Snippet 116) ---
case 'UHD': medium_box.val(10); break;

// --- From Module: 22_additional_handlers2.js (Snippet 117) ---
case 'UHD': medium_box.val(4); break;

// --- From Module: 22_additional_handlers2.js (Snippet 118) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 22_additional_handlers2.js (Snippet 119) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 22_additional_handlers2.js (Snippet 120) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 22_additional_handlers2.js (Snippet 121) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 22_additional_handlers2.js (Snippet 122) ---
case 'UHD':
          if (labels.diy) {
            medium_box.val(18);
          } else if (raw_info.name.match(/remux/i)) {
            medium_box.val(17);
          } else {
            medium_box.val(19);
          }
          break;

// --- From Module: 22_additional_handlers2.js (Snippet 123) ---
case 'UHD':
          if (labels.diy) {
            medium_box.options[1].selected = true;
          } else {
            medium_box.options[1].selected = true;
          }
          break;

// --- From Module: 23_final_handlers.js (Snippet 124) ---
case 'UHD': medium_box.val(2); break;

// --- From Module: 23_final_handlers.js (Snippet 125) ---
case 'UHD': medium_box.val(9); break;

// --- From Module: 23_final_handlers.js (Snippet 126) ---
case 'UHD': medium_box.val(1); break;

// --- From Module: 23_final_handlers.js (Snippet 127) ---
case 'UHD': case 'Blu-ray':
            medium_box.options[1].selected = true; break;

// --- From Module: 23_final_handlers.js (Snippet 128) ---
case 'UHD': case 'Blu-ray': case 'Encode': case 'Remux': $('select[name=source]').val('Blu-ray'); break;

// --- From Module: 23_final_handlers.js (Snippet 129) ---
case 'UHD': case 'Blu-ray': case 'Encode': case 'Remux': $('#source').val('Blu-ray'); break;

// --- From Module: 23_final_handlers.js (Snippet 130) ---
case 'UHD': case 'Blu-ray': case 'DVD': $('#type_medium').val("1"); break;

// --- From Module: 23_final_handlers.js (Snippet 131) ---
case 'UHD': case 'Blu-ray':
            $("select[name='medium_sel']").val('11'); break;

