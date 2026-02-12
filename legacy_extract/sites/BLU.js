/** Consolidated Logic for: BLU **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/(blutopia.cc|darkland.top|eiga.moi|hd-olimpo.club|aither.cc|cinematik.net)\/torrents\?imdb(id)?=.*/)) {
  if (site_url.match(/blutopia.cc/i)) {
    $('div.form-group:contains(IMDb)').find('input').val(site_url.split('=')[1].split('&')[0]);
    $('button.btn-primary:contains(Advanced)').click();
    $('div.form-group:contains(IMDb)').find('input').focus();
  } else {
    $('#imdb').val(site_url.split('=')[1].split('#')[0]);
  }
  return;
}

// --- From Module: 02_core_utilities.js (Snippet 2) ---
if (site_url.match(/blutopia.cc/i)) {
    $('div.form-group:contains(IMDb)').find('input').val(site_url.split('=')[1].split('&')[0]);
    $('button.btn-primary:contains(Advanced)').click();
    $('div.form-group:contains(IMDb)').find('input').focus();
  }

// --- From Module: 02_core_utilities.js (Snippet 3) ---
if (site_url.match(/^https:\/\/(blutopia.cc|darkland.top|eiga.moi|hd-olimpo.club)\/torrents\/download_check/)) {
  window.open($('a[href*="torrents/download"]').has('i').attr('href'), '_blank');
  return;
}

// --- From Module: 06_site_detection.js (Snippet 4) ---
if (site_url.match(/u2.dmhy.org|ourbits.club|hd-space.org|totheglory.im|blutopia.cc|star-space.net|torrent.desi|hudbt|fearnopeer.com|darkland.top|onlyencodes.cc|cinemageddon|eiga.moi|hd-olimpo.club|digitalcore.club|bwtorrents.tv|myanonamouse|greatposterwall.com|m-team.cc/i)) {
        n.innerHTML = '\r\n';
      }

// --- From Module: 09_data_processing.js (Snippet 5) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX', 'IN'].indexOf(site) > -1) {
      $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "border": "1px solid #0D8ED9", "color": "#FFFFFF", "backgroundColor": "#292929" });
      if (site == 'HONE') {
        $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "width": "80px" })
      }
    }

// --- From Module: 09_data_processing.js (Snippet 6) ---
else if (site == 'BLU' || site == 'Tik' || site == 'Aither') {
      textarea.style.width = '585px';
    }

// --- From Module: 09_data_processing.js (Snippet 7) ---
if (['PTP', 'xthor', 'HDF', 'BHD', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(site) > -1) {
    textarea.style.backgroundColor = '#4d5656';
    textarea.style.color = 'white';
    input_box.style.backgroundColor = '#4d5656';
    input_box.style.color = 'white';
  }

// --- From Module: 11_download_clients.js (Snippet 8) ---
if (r.match(/8:announce\d+:.*(please.passthepopcorn.me|blutopia.cc|beyond-hd.me|eiga.moi|hd-olimpo.club|secret-cinema.pw|monikadesign.uk)/)) {
      if (r.match(/4:name\d+:/)) {
        var length = parseInt(r.match(/4:name(\d+):/)[1]);
        var index = parseInt(r.search('4:name'));
        name = r.substring(index, index + length + 7 + length.toString().length).split(':').pop();
      }
      if ($('input[name="name"]').length && !$('input[name="name"]').val()) {
        $('input[name="name"]').val(deal_with_title(name));
      }
    }

// --- From Module: 11_download_clients.js (Snippet 9) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDSpace', 'xthor', 'Monika', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX'].indexOf(forward_site) > -1) {
    $('#torrent')[0].files = container.files;
  }

// --- From Module: 12_site_ui_helpers.js (Snippet 10) ---
if (site_url.match(/^https:\/\/blutopia.cc\/torrents\/similar/)) {
  var ids = $('ul.meta__ids').html()
  raw_info.url = match_link('imdb', ids);
  if (raw_info.url && all_sites_show_douban) {
    getData(raw_info.url, function (data) {
      if (data.data) {
        var score = data.data.average + '分';
        if (!score.replace('分', '')) score = '暂无评分';
        if (data.data.votes) score += `|${data.data.votes}人`;
        $('h1.meta__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
        if (data.data.summary && data.data.summary.length < 700 && data.data.summary.match(/[\u4e00-\u9fa5]/)) {
          $('p.meta__description').text(data.data.summary.replace(/ 　　/g, ''));
        }
      }
    });
  }
  return;
}

// --- From Module: 14_origin_site_parsing1.js (Snippet 11) ---
if (origin_site == 'BLU') {
      var ids = $('ul.meta__ids').html()
      raw_info.url = match_link('imdb', ids);
      raw_info.tmdb_url = match_link('tmdb', ids);
      raw_info.tvdb_url = match_link('tvdb', ids);
      $('menu[class="torrent__buttons form__group--short-horizontal"]').after(`
                <div style="padding-left:55px; padding-right:55px">
                    <table id="mytable">
                    </table>
                </div>
            `);
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 12) ---
if (origin_site == 'BLU' || origin_site == 'Tik' || origin_site == 'Aither') {
      var mediainfo = '';
      try {
        mediainfo = $('code[x-ref="mediainfo"]').text().trim();
        if (!mediainfo) {
          mediainfo = $('code[x-ref="bdinfo"]').text().trim();
        }
        raw_info.descr = `[quote]\n${mediainfo}\n[/quote]`;
      } catch (err) { }
      raw_info.name = $('h1.torrent__name').text().trim();
      raw_info.type = $('li.torrent__category').text().get_type();

      var img_urls = '';
      try {
        var picture_info = $('h2.panel__heading:contains("Description"), h2.panel__heading:contains("描述")').parent().next()[0].getElementsByTagName('img');
        for (i = 0; i < picture_info.length; i++) {
          if (picture_info[i].parentNode.href) {
            img_urls += '[url=' + picture_info[i].parentNode.href + '][img]' + picture_info[i].src + '[/img][/url] ';
          } else {
            img_urls += '[img]' + picture_info[i].src + '[/img] ';
          }
        }
      } catch (err) { }
      img_urls = img_urls.replace(/https:\/\/wsrv.nl\/\?n=-1&url=/g, '');
      var vob_info = '';
      if ($('summary').length && raw_info.descr.match(/IFO/)) {
        try {

          $('details').has('pre').map((index, e) => {
            var info = $(e).find('code')[0].innerHTML;
            console.log(index, info)
            if (info.match(/Overall bit rate|Stream size|Format version/)) {
              vob_info = info;
              vob_info = vob_info.replace(/<br>/g, '\n');
              vob_info = vob_info.replace(/<div.*?>/, '[quote]');
              vob_info = vob_info.replace(/<\/div>/, '[/quote]\n\n');
              vob_info = vob_info.replace(/<\/?pre>/g, '');
              vob_info = vob_info.replace(/&nbsp;/g, ' ');
            }
          })

        } catch (err) {
          vob_info = ''
        }
      } else {
        vob_info = ''
      }
      raw_info.descr += '\n\n' + vob_info + img_urls;

      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('h1.meta__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
            if (data.data.summary && data.data.summary.length < 700) {
              $('p.meta__description').text(data.data.summary.replace(/ 　　/g, ''));
            }
          }
        });
      }
      raw_info.torrent_url = $('a[href*="torrents/download"]').attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 13) ---
if (['PHD', 'avz', 'CNZ', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'BHD', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'OMG'].indexOf(origin_site) > -1) {
          direct = "left";
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 14) ---
else if (['IN', 'digitalcore', 'BlueBird', 'bwtorrents', 'HOU', 'BLU', 'Tik', 'Aither', 'DarkLand', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(origin_site) >= 0) {
          box_left.style.width = '80px';
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 15) ---
if (forward_site == 'BLU' || forward_site == 'Audiences' || forward_site == 'Tik' || forward_site == 'Aither') {
      if (raw_info.descr.match(/Atmos/) && !raw_info.name.match(/atmos/i)) {
        raw_info.name = raw_info.name.replace(/(DDP|DD|AAC|HDMA|TrueHD|DTS.HD|DTS|PCM|FLAC)[ \.](.*?)(\d.\d)/i, '$1 $2 $3 Atmos').replace(/ +/g, ' ');
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 16) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 17) ---
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

// --- From Module: 18_forward_site_filling2.js (Snippet 18) ---
else if (['BLU', 'Tik', 'Aither', 'BHD', 'iTS', 'PTP', 'ACM', 'Monika', 'DarkLand'].indexOf(forward_site) < 0) {
      setTimeout(() => {
        try {
          document.getElementsByName('uplver')[0].checked = if_uplver;
        } catch (err) { }
      }, 1000)
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 19) ---
else if (forward_site == 'BLU' || forward_site == 'Tik' || forward_site == 'Aither') {
        torrent_box.parentNode.innerHTML = '<label for="torrent" class="form__label">Torrent File</label><input class="upload-form-file form__file" type="file" accept=".torrent" name="torrent" id="torrent" required="">';
      }

// --- From Module: 20_forward_site_filling4.js (Snippet 20) ---
if (forward_site == 'BLU') {
        var announce = $('a[href*="https://blutopia.cc/announce/"]').attr('href');
      }

// --- From Module: 20_forward_site_filling4.js (Snippet 21) ---
else if (forward_site == 'BLU') {
        standard_dict = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 5, 'SD': 0, '': 0, '8K': 11 };
      }

// --- From Module: 21_additional_handlers1.js (Snippet 22) ---
if (forward_site == 'BLU' || forward_site == 'Tik') {
          pic_info = deal_img_350_ptpimg(infos.pic_info);
          if (raw_info.name.match(/DV HDR/i)) {
            pic_info = '[CODE]This release contains a derived Dolby Vision profile 8 layer. Comparisons not required as DV and HDR are from same provider.[/CODE]\n\n' + pic_info;
          }
          $('#upload-form-mediainfo').parent().before(`<div style="margin-bottom:5px"><a id="img350" style="margin-left:5px" href="#">IMG350</a>
                        <font style="margin-left:5px" color="red">选中要转换的bbcode图片部分点击即可。</font></div>
                    `);
          $('#img350').click(function (e) {
            e.preventDefault();
            var text = $('#bbcode-description').val();
            var textarea = document.getElementById('bbcode-description');
            if (textarea && textarea.selectionStart != undefined && textarea.selectionEnd != undefined) {
              var chosen_value = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
              if (chosen_value) {
                $('#bbcode-description').val(text.replace(chosen_value, chosen_value.replace(/\[img\]/g, '[img=350]')));
              } else {
                $('#bbcode-description').val(text.replace(/\[img\]/g, '[img=350]'));
              }
            }
          })
        }

