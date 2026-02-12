/** Consolidated Logic for: NBL **/

// --- From Module: 11_download_clients.js (Snippet 1) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'NBL') {
      $('#mediainfobox').parent().prepend(`
                <div style="padding-left:55px; padding-right:55px">
                    <table id="mytable">
                    </table>
                </div>
            `);
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);

      raw_info.type = '剧集';
      var search_name = $('h2').text().split('-')[0].trim();
      raw_info.name = $('div[id*=files_]').find('tr:eq(0)').find('td:first').text().replace(/\//g, '');
      try {
        var show_href = 'https://nebulance.io' + $('#coverimage').find('a').attr('href');
        getDoc(show_href, null, function (doc) {
          var show_id = $('#showinfobox', doc).find('a[href*="tvmaze.com"]').attr('href').match(/\d+/)[0];
          var show_url = 'https://api.tvmaze.com/shows/' + show_id;
          console.log(show_id)
          console.log(show_url)
          getJson(show_url, null, function (data) {
            if (data.externals.imdb) {
              raw_info.url = 'https://www.imdb.com/title/' + data.externals.imdb;
              reBuildHref(raw_info, forward_r);
              if (all_sites_show_douban) {
                getData(raw_info.url, function (data) {
                  console.log(data);
                  if (data.data) {
                    $('td:contains(豆瓣信息)').last().parent().before(`<tr><td align=right style="font-weight: bold;">豆瓣</td><td id="douban_info"></td></tr>`);
                    add_douban_info_table($('#douban_info'), 150, data);
                    $('#douban_info').find('th').css({ "color": "white" });
                  }
                });
              }
            }
          });
        });
      } catch (Err) { }
      raw_info.descr = '[quote]\n' + $('#mediainfobox').find('div.mediainfo').text() + '\n[/quote]';
      raw_info.torrent_url = `https://nebulance.io/` + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
if (origin_site == 'NBL' || origin_site == 'IPT' || origin_site == 'torrentseeds' || origin_site == 'HONE') {
          box_left.style.width = '60px';
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 4) ---
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

// --- From Module: 22_additional_handlers2.js (Snippet 5) ---
else if (forward_site == 'NBL') {
      var announce = $('input[value*="announce"]').val();
      addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, announce);
      if (!$('#categorywrap').is(':hidden')) {
        return;
      }
      $('#categorywrap').show();
      if (raw_info.name.match(/S\d+E\d+/i)) {
        $('#category').val("1");
      } else {
        $('#category').val("3");
      }
      $(document).ready(() => {
        if ($('#title').val()) {
          if (!raw_info.name.match(/S\d+/i)) {
            $('#title').val($('#title').val() + ' - S01');
          }
        }
      });
      $('#tvmaze').show();
      var search_name = get_search_name(raw_info.name);
      getJson('https://api.tvmaze.com/search/shows?q=' + search_name, null, (data) => {
        if (data.length) {
          $('#tvmaze>td:last').append(`</br></br><font color="red" size="1">请点击对应剧照填充id:</font></br>`);
          GM_addStyle(
            `div.img {
                            margin: 5px;
                            border: 1px solid #ccc;
                            float: left;
                            width: 120px;
                        }

                        div.img:hover {
                            border: 1px solid #777;
                        }

                        div.img img {
                            width: 100%;
                            height: auto;
                        }

                        div.desc {
                            padding: 15px;
                            text-align: center;
                        }`
          );

          data.map((item) => {
            item = item.show;
            console.log(item)
            try {
              var html = `<div class="responsive">
                                            <div class='img' style="max-height:230px">
                                                <img src=${item.image.medium} style="width:120px" name="tvmaze" id=${item.id} />
                                                <div class="desc">
                                                    <a href=${item.url} target="_blank">${item.name} [${item.premiered.match(/\d{4}/)[0]}]</a>
                                                </div>
                                            </div>
                                        </div>`;
              $('#tvmaze>td:last').append(html);
            } catch (err) { }
            console.log(raw_info.url)
            if (item.externals.imdb && raw_info.url) {
              if (raw_info.url.match(item.externals.imdb)) {
                $('#tvmazeid').val(item.id);
              }
            }
          })
          $('img[name=tvmaze]').click((e) => {
            $('#tvmazeid').val($(e.target).attr('id'));
          })
        }
      });
      $('#mediainfowrap').show();
      try {
        var infos = get_mediainfo_picture_from_descr(raw_info.descr);
        if (raw_info.full_mediainfo) {
          $('#media').val(raw_info.full_mediainfo);
        } else {
          $('#media').val(infos.mediainfo.replace(/\[.*?\]/g, ''));
        }
      } catch (err) {
        if (raw_info.full_mediainfo) {
          $('#media').val(raw_info.full_mediainfo);
        } else {
          $('#media').val(raw_info.descr.replace(/\[.*?\]/g, ''));
        }
      }
      $('#checkbutton').show();
    }

