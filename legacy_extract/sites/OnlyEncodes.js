/** Consolidated Logic for: OnlyEncodes **/

// --- From Module: 09_data_processing.js (Snippet 1) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX', 'IN'].indexOf(site) > -1) {
      $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "border": "1px solid #0D8ED9", "color": "#FFFFFF", "backgroundColor": "#292929" });
      if (site == 'HONE') {
        $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "width": "80px" })
      }
    }

// --- From Module: 09_data_processing.js (Snippet 2) ---
if (['PTP', 'xthor', 'HDF', 'BHD', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(site) > -1) {
    textarea.style.backgroundColor = '#4d5656';
    textarea.style.color = 'white';
    input_box.style.backgroundColor = '#4d5656';
    input_box.style.color = 'white';
  }

// --- From Module: 11_download_clients.js (Snippet 3) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDSpace', 'xthor', 'Monika', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX'].indexOf(forward_site) > -1) {
    $('#torrent')[0].files = container.files;
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 4) ---
if (origin_site == 'FNP' || origin_site == 'OnlyEncodes' || origin_site == 'DarkLand' || origin_site == 'ReelFliX') {
      raw_info.url = match_link('imdb', $('section.meta').html());
      raw_info.type = $('.torrent__tags').text().get_type();
      raw_info.name = $('h1.torrent__name').text().trim().match(/([\u4e00-\u9fa5]* )?(.*)/)[2];
      $('menu[class="torrent__buttons form__group--short-horizontal"]').after(`
                <section class="panelV2" style="padding-left:55px; padding-right:55px; padding-top:15px; padding-bottom:15px">
                    <table id="mytable">
                    </table>
                </section>
            `);
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);
      raw_info.descr = `[quote]\n${$('code[x-ref="mediainfo"]').text()}\n[/quote]\n\n`;
      $('.panel__heading:contains("描述")').parent().next().find('img').map((index, e) => {
        if ($(e)[0].parentNode.href) {
          raw_info.descr += '[url=' + $(e)[0].parentNode.href + '][img]' + $(e)[0].src + '[/img][/url] ';
        } else {
          raw_info.descr += '[img]' + $(e)[0].src + '[/img] ';
        }
      });
      $('.panel__heading:contains("Description")').parent().next().find('img').map((index, e) => {
        if ($(e)[0].parentNode.href) {
          raw_info.descr += '[url=' + $(e)[0].parentNode.href + '][img]' + $(e)[0].src + '[/img][/url] ';
        } else {
          raw_info.descr += '[img]' + $(e)[0].src + '[/img] ';
        }
      });
      raw_info.descr = raw_info.descr.replace(/https:\/\/wsrv.nl\/\?n=-1&url=/g, '');
      raw_info.torrent_url = $('a[href*="download/"]').attr('href');
      if (raw_info.url && all_sites_show_douban && (origin_site == 'FNP' || origin_site == 'OnlyEncodes' || origin_site == 'ReelFliX')) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('h1.meta__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
            $('p.meta__description,span.movie-overview').text(data.data.summary.replace(/ 　　/g, ''));
          }
        });
      }
    }

// --- From Module: 14_origin_site_parsing1.js (Snippet 5) ---
if (raw_info.url && all_sites_show_douban && (origin_site == 'FNP' || origin_site == 'OnlyEncodes' || origin_site == 'ReelFliX')) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('h1.meta__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
            $('p.meta__description,span.movie-overview').text(data.data.summary.replace(/ 　　/g, ''));
          }
        });
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
else if (['IN', 'digitalcore', 'BlueBird', 'bwtorrents', 'HOU', 'BLU', 'Tik', 'Aither', 'DarkLand', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(origin_site) >= 0) {
          box_left.style.width = '80px';
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 7) ---
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

// --- From Module: 18_forward_site_filling2.js (Snippet 8) ---
else if (forward_site == 'FNP' || forward_site == 'OnlyEncodes' || forward_site == 'ReelFliX') {
      $('#anon').prop('checked', if_uplver);
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 9) ---
else if (['DarkLand', 'ACM', 'Monika', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(forward_site) > -1) {
        torrent_box.parentNode.innerHTML = '<label for="torrent" class="form__label">Torrent 文件</label><input class="upload-form-file form__file" type="file" accept=".torrent" name="torrent" id="torrent" required="">';
      }

// --- From Module: 20_forward_site_filling4.js (Snippet 10) ---
else if (forward_site == 'OnlyEncodes') {
        switch (raw_info.medium_sel) {
          case 'UHD': source_box.options[4].selected = true; break;
          case 'Blu-ray': source_box.options[4].selected = true; break;
          case 'Remux': source_box.options[5].selected = true; break;
          case 'HDTV': source_box.options[6].selected = true; break;
          case 'Encode':
            if (raw_info.codec_sel == 'X264' || raw_info.codec_sel == 'H264') {
              source_box.options[2].selected = true;
            } else {
              source_box.options[1].selected = true;
            }
            break;
          case 'WEB-DL': source_box.options[6].selected = true;
        }
      }

