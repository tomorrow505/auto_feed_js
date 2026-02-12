/** Consolidated Logic for: OpenCD **/

// --- From Module: 07_dom_walkers.js (Snippet 1) ---
if (site_url.match(/^https:\/\/.*open.cd\/plugin_upload.php#separator#/i)) {
    return 0;
  }

// --- From Module: 11_download_clients.js (Snippet 2) ---
if (forward_site == 'OpenCD') {
    name = name.replace(/\*/g, '');
  }

// --- From Module: 11_download_clients.js (Snippet 3) ---
if (forward_site == 'OpenCD') {
        $('iframe[src*="target=cover"]').contents().find('#file')[0].files = container.files;
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 4) ---
if (origin_site == 'OpenCD' && document.getElementById('kdescr')) {
      opencd_mode = 1;  //皇后老版面
    }

// --- From Module: 14_origin_site_parsing1.js (Snippet 5) ---
if (origin_site == 'TTG' || origin_site == 'PuTao' || origin_site == 'OpenCD' || origin_site == 'HDArea') {
        title = document.getElementsByTagName("h1")[0];
        if ($(title).text().match(/上传成功|编辑成功|发布成功/)) {
          title = document.getElementsByTagName("h1")[1];
        }
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 6) ---
if (origin_site == 'OpenCD') {
      raw_info.torrent_name = $('a[href*="download.php"]').attr('title') + '.torrent';
      raw_info.torrent_url = $('td:contains("下载链接"):last').next().find('a').text();
    }

// --- From Module: 14_origin_site_parsing1.js (Snippet 7) ---
if (origin_site == 'OpenCD' && !opencd_mode) {
      raw_info.name = document.getElementsByClassName('title')[0].textContent;
      raw_info.type = '音乐';
      raw_info.small_descr = document.getElementsByClassName('smalltitle')[0].textContent;

      var cover_box = document.getElementsByClassName('cover')[0];
      try {
        var cover = cover_box.getElementsByTagName('img')[0].getAttribute('onclick');
        cover = cover.match(/'(.*)'/)[1];
        cover = 'https://open.cd/' + cover;
      } catch (err) {
        var cover = cover_box.getElementsByTagName('img')[0].getAttribute('src');
      }

      var descr_box = document.getElementById('divdescr');
      raw_info.descr = '[img]' + cover + '[/img]\n\n' + descr_box.textContent;

      var tracklist_box = document.getElementById('divtracklist');
      raw_info.tracklist = tracklist_box.textContent;

      var nfo_box = document.getElementById('divnfo');
      raw_info.log_info = nfo_box.textContent;

      tbodys = document.getElementById('outer').getElementsByTagName('tbody');
      if (tbodys.length == 6) {
        tbody = tbodys[2];
      } else {
        tbody = tbodys[1];
      }

      raw_info.music_name = $('td:contains("专辑名称"):last').next().text();
      raw_info.music_author = $('td:contains("艺术家名"):last').next().find('a').text();
      raw_info.labels = Array.from($('td:contains("标签列表"):last').next().find('a').map((_, e) => {
        return $(e).text();
      })).join(', ');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 8) ---
else if (origin_site == 'OpenCD') {
                insert_row = table.insertRow(6);
                douban_box = table.insertRow(6);
              }

// --- From Module: 15_origin_site_parsing2.js (Snippet 9) ---
else if (origin_site == 'OpenCD') {
        forward_r.colSpan = "4";
      }

// --- From Module: 16_origin_site_parsing3.js (Snippet 10) ---
else if (origin_site == 'OpenCD' && opencd_mode == 0 && document.querySelector("#outer > center > table:nth-child(4) > tbody > tr:nth-child(6) > td:nth-child(2) > table > tbody > tr:nth-child(13)").textContent == "禁止轉載") {
      if_exclusive = true;
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
if (forward_site == 'OpenCD') {
        raw_info.music_media += raw_info.small_descr + (raw_info.file_list ? raw_info.file_list : '');
        raw_info.descr = raw_info.descr.split(/\[b\]\[color=green\]\[size=3\]本站提供的所有影视/)[0].trim();
        raw_info.descr = raw_info.descr.replace(/ \n \n/g, ' \n');
        raw_info.descr = raw_info.descr.replace(raw_info.tracklist, '');
        raw_info.name = raw_info.name.replace(/(Album|Single)$/, '');
        $('#artist').val(raw_info.music_author || author); $('#year').val(year); $('#browsecat').val(408); $('#resource_name').val(raw_info.music_name || music_name); $('#share_rule').val(3);
        $(`#name`).parent().parent().after(`<tr>
                    <td class="rowhead nowrap rowtitle">豆瓣搜索:</td>
                    <td><input id="douban"/></td>
                    <td><input id="douban_button" type="button" value="搜索"></td>
                    </tr>`);
        $('#douban').val(music_name);
        $('#douban_button').click(() => {
          window.open(`https://search.douban.com/music/subject_search?search_text=${$('#douban').val()}&cat=1003`, '_blank');
        })
        try {
          var poster = raw_info.descr.match(/\[img\](.*?)\[\/img\]/)[1].trim();
          $('#cover').after(`<img style="max-width:200px; margin-top:5px;" src=${poster} />`);
          setTimeout(function () {
            addPoster(poster, forward_site);
          }, 2000);
        } catch (err) {
          console.log(err)
        }
        raw_info.descr = raw_info.descr.replace(/^\[img\].*?\[\/img\]([\n\s]*)/, '');

        function add_log(name, log_txt, index) {
          log_txt = log_txt.replace(/^\n{0,5}\[hide\]/, '').replace(/\[\/hide\]/, '').replace(/^Score.*?\(max 100\)/, '').trim();
          var fileData = new Blob([log_txt], { type: "text/plain" });
          var fileName = `${name}-${index + 1}.log`;
          console.log(log_txt)
          var fileInput = $('input[name*=nfo1]:last')[0];
          let container = new DataTransfer();
          const files = new window.File([fileData], fileName, { type: 'text/plain' });
          container.items.add(files);
          fileInput.files = container.files;
        }

        if (raw_info.log_info !== '' && raw_info.log_info) {
          raw_info.log_info = raw_info.log_info.split('==logs==');
          add_log(raw_info.name, raw_info.log_info[0], 0);
          if (raw_info.log_info.length > 1) {
            for (var index = 1; index < raw_info.log_info.length; index++) {
              $('#nfoadd').click();
              add_log(raw_info.name, raw_info.log_info[index], index);
            }
          }
        }

        if (raw_info.music_media) {
          raw_info.music_media += raw_info.edition_info ? raw_info.edition_info : '';
          var media_selected = false;
          var standard_selected = false;
          $('#standard>option').map((index, e) => {
            if (!standard_selected && (raw_info.music_media + raw_info.small_descr).toUpperCase().match(e.innerText)) {
              $(`#standard>option:eq(${index})`).attr('selected', true);
              standard_selected = true;
            }
          });

          $('#medium>option').map((index, e) => {
            if (!media_selected && (raw_info.music_media + raw_info.small_descr).toUpperCase().match(e.innerText.toUpperCase())) {
              $(`#medium>option:eq(${index})`).attr('selected', true);
              media_selected = true;
            }
          });
          if (raw_info.music_media.match(/整轨/)) {
            $('#audio_mode').val('single');
          } else if (raw_info.music_media.match(/分轨/) || $('#standard').val() == 4) {
            $('#audio_mode').val('multi');
          } else {
            $('#audio_mode').val('none');
          }

          if ($('#medium').val() == "1") {
            var dict_cd = { "LPCD": "4", "HDCD": "5", "SACD": "6", "SRCD": "7", "K2CD": "8", "HQCD": "16", "XRCD": "17", "SHM-CD": "18" };
            for (key in dict_cd) {
              var reg = new RegExp(key, 'i');
              if (raw_info.music_media.match(reg)) {
                $('#medium').val(dict_cd[key]);
              }
            }
          }
        }
        $('#team').val('5');
        var source_selected = false;
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
        try {
          if (raw_info.tracklist) {
            raw_info.tracklist = raw_info.tracklist.replace(/\[.*?\]/g, function (data) {
              if (data.match(/url/)) {
                return data;
              } else {
                return '';
              }
            }).trim();
            $('textarea[name="track_list"]').val(raw_info.tracklist.replace(/\.(flac|wav)/g, ''));
            $('#descr').wait(function () {
              $('#descr').val(raw_info.tracklist);
              $('#descr').parent().append(`<a style="text-decoration:none;" href="#" id="file2descr"><font color="red">从简介导入</font></a>`);
              $('#file2descr').click((e) => {
                e.preventDefault();
                $('#descr').val(raw_info.descr);
              });
            });
          } else {
            var track_list = raw_info.descr.match(/0?1(\.|\))[\s\S]*\d+.*(\n|$)/)[0];
            $('textarea[name="track_list"]').val(track_list);
          }
        } catch (err) { }
        try {
          if (raw_info.musicspectrum !== null) {
            $('#spectrogram').val(raw_info.musicspectrum);
          }
        } catch (err) { }
        try {
          if (raw_info.file_list) {
            $('textarea[name=track_list]').parent().append(`<a style="text-decoration:none;" href="#" id="file2tracklist"><font color="red">从文件列表导入</font></a>`);
            $('#file2tracklist').click((e) => {
              e.preventDefault();
              $('textarea[name=track_list]').val(`[b]Tracklist[/b]\n` + raw_info.file_list.replace(/\.flac|\.wav/g, ''));
            });
          }
        } catch (err) { }
        document.getElementById('audio_mode').dispatchEvent(evt);
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
else if (raw_info.origin_site == 'OpenCD') {
      raw_info.descr += '\n\n' + '[quote]' + raw_info.tracklist + '[/quote]'
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 13) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 14) ---
if (forward_site == 'OpenCD') {
          allinput[i].value = raw_info.small_descr.replace('- {自抓}', '');
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 15) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 16) ---
if (forward_site != 'OpenCD') {
          descr_box[0].style.height = '800px';
          if ($('textarea[name="technical_info"]').length) {
            descr_box[0].style.height = '460px';
          }
        }

// --- From Module: 19_forward_site_filling3.js (Snippet 17) ---
if (raw_info.origin_site == 'OpenCD' || raw_info.origin_site == 'DICMusic') {
            $('#music_quality').val('无损');
          }

