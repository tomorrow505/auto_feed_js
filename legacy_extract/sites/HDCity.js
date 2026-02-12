/** Consolidated Logic for: HDCity **/

// --- From Module: 07_dom_walkers.js (Snippet 1) ---
if (site_url.match(/^https:\/\/hdcity.city\/upload/)) {
    return 2;
  }

// --- From Module: 12_site_ui_helpers.js (Snippet 2) ---
if (used_signin_sites.indexOf('HDCity') > -1) {
        var signin_url = used_site_info['HDCity'].url + 'sign';
        getDoc(signin_url, null, function (doc) {
          if ($('#bottomnav', doc).length) {
            if ($('p:contains("本次签到获得魅力")', doc).length || $('p:contains("Bonus earned today")', doc).length) {
              console.log(`开始签到HDCity：`, $('p:contains("本次签到获得魅力")', doc).length ? $('p:contains("本次签到获得魅力")', doc).text() : $('p:contains("Bonus earned today")', doc).text());
              $(`input[kname=HDCity]`).parent().find('a').css({ "color": "red" });
            }
          } else {
            console.log(`开始签到HDCity：`, '失败！！！');
            $(`input[kname=HDCity]`).parent().find('a').css({ "color": "blue" });
          }
        });
      }

// --- From Module: 16_origin_site_parsing3.js (Snippet 3) ---
else if (site == 'HDCity') {
        if (search_mode == 0 || if_exclusive) {
          return;
        }
        GM_setValue('hdcity_info', JSON.stringify(raw_info));
        var href = 'https://hdcity.city/upload';
        window.open(href, target = "_blank");
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

// --- From Module: 18_forward_site_filling2.js (Snippet 5) ---
else if (forward_site == 'HDCity' || forward_site == 'HDSpace') {

      }

// --- From Module: 23_final_handlers.js (Snippet 6) ---
if (location.href == 'https://hdcity.city/upload') {
      document.getElementById('qr').disabled = false;
      addTorrent(raw_info.torrent_url, raw_info.torrent_name, 'HDCity', null);
      $("#name").val(raw_info.name);
    }

