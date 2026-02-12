/** Consolidated Logic for: MTeam **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https:\/\/kp.m-team.cc\/details.php\?id=\d+&uploaded=1/)) {
  window.open($('a[href*="download.php?id="]').attr("href"), '_blank');
  return;
}

// --- From Module: 03_configuration.js (Snippet 2) ---
else if (default_site_info[key].url != used_site_info[key].url && ['AGSV', 'QingWa', 'MTeam'].indexOf(key) < 0) {
      used_site_info[key].url = default_site_info[key].url
    }

// --- From Module: 03_configuration.js (Snippet 3) ---
if (site_url.match(/^https:\/\/kp.m-team.cc\/.*/)) {
  used_site_info.MTeam.url = 'https://kp.m-team.cc/';
}

// --- From Module: 03_configuration.js (Snippet 4) ---
else if (site_url.match(/^https:\/\/next.m-team.cc\/.*/)) {
  used_site_info.MTeam.url = 'https://next.m-team.cc/';
}

// --- From Module: 06_site_detection.js (Snippet 5) ---
if (site_url.match(/u2.dmhy.org|ourbits.club|hd-space.org|totheglory.im|blutopia.cc|star-space.net|torrent.desi|hudbt|fearnopeer.com|darkland.top|onlyencodes.cc|cinemageddon|eiga.moi|hd-olimpo.club|digitalcore.club|bwtorrents.tv|myanonamouse|greatposterwall.com|m-team.cc/i)) {
        n.innerHTML = '\r\n';
      }

// --- From Module: 11_download_clients.js (Snippet 6) ---
else if (forward_site == 'MTeam') {
    var i_evt = new Event("change", { bubbles: true, cancelable: false });
    i_evt.simulated = true;
    function setValue(input, value) {
      let lastValue = input.value;
      input.files = container.files;
      let tracker = input._valueTracker;
      if (tracker) {
        tracker.setValue(lastValue);
      }
      input.dispatchEvent(i_evt);
    }
    $('#torrent-input').wait(function () {
      document.getElementById('torrent-input').files = container.files;
      setValue(document.getElementById('torrent-input'), "torrent")
      $('button:contains("選擇種子")').next().next().text(name);
    }, 30000, 20);
  }

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
if (origin_site == 'MTeam') {
      $('label:contains(字幕)').parent().parent().before(`
                <div style="padding-right:55px">
                    <table id="mytable">
                    </table>
                </div>
            `);
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);
      raw_info.torrent_url = site_url;
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 8) ---
if (origin_site == 'MTeam') {
      raw_info.descr = walkDOM($('div.markdown-body')[0])
      raw_info.descr = raw_info.descr.replace(/預覽/g, '');
      var torrent_id = site_url.match(/detail\/(\d+)/)[1];
      function build_fetch(api) {
        new_fetch = fetch(`https://api.m-team.io/${api}`, {
          method: 'POST',
          headers: {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "ts": Math.floor(Date.now() / 1000),
            "authorization": localStorage.getItem("auth") || ""
          },
          body: new URLSearchParams({ "id": torrent_id }).toString()
        });
        return new_fetch;
      }
      // https://github.com/lfkid/fuzzy-enigma/blob/master/ECMAScript/使Promise.all()不会rejected从而并行处理多个fetch.md
      const apis = ['api/torrent/detail', 'api/torrent/genDlToken'];
      const getDataFromAPIs = async () => {
        const results = await Promise.all(
          apis.map(async api => {
            try {
              const response = await build_fetch(api);
              const responseJson = await response.json();
              if (!response.ok) {
                throw new Error(`${response.statusText}`);
              }
              return responseJson.data;
            } catch (error) {
              return error;
            }
          })
        );
        raw_info.torrent_url = results[1];
        console.log(raw_info.torrent_url);
        var detail = results[0];
        console.log(detail);
        raw_info.name = detail.name;
        raw_info.torrent_name = raw_info.name.replace(/ /g, '.').replace(/\*/g, '') + '.torrent';
        raw_info.torrent_name = raw_info.torrent_name.replace(/\.\.+/g, '.');
        if (!raw_info.small_descr) { raw_info.small_descr = detail.smallDescr; }
        if (!raw_info.url) { raw_info.url = detail.descr.match(/title\/tt\d+/) ? match_link('imdb', detail.descr) : detail.imdb; reBuildHref(raw_info, forward_r); }
        if (!raw_info.db_url) { raw_info.db_url = detail.douban; }
        if (!raw_info.descr) {
          raw_info.descr = detail.descr;
          try {
            raw_info.descr = raw_info.descr.replace(/\*\*(.*?)\*\*/g, `$1`);
          } catch (Err) { }
          try {
            raw_info.descr = raw_info.descr.replace(/!\[\]\((.*?)\)/g, `[img]$1[/img]\n`);
          } catch (Err) { }
        }
        raw_info.type = $('span[class*="ant-typography"]:contains(類別)').text().get_type();
        if (detail.mediainfo) {
          var mediainfo = detail.mediainfo;
          raw_info.full_mediainfo = mediainfo;
          try {
            mediainfo = decodeURIComponent(detail.mediainfo);
          } catch (err) { }
          var picture_info = '';
          try {
            var intro = raw_info.descr.indexOf('◎简　　介');
            var pictures = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?\n?/g);
            pictures.forEach(item => {
              if (raw_info.descr.indexOf(item) > 300 || (intro > -1 && raw_info.descr.indexOf(item) > intro)) {
                if (!item.match(/doubanio.com/)) {
                  raw_info.descr = raw_info.descr.replace(item, '');
                  picture_info += item + '\n';
                }
              }
            });
            raw_info.descr = raw_info.descr.trim() + `\n  \n[quote]\n${mediainfo.trim()}\n[/quote]\n  \n` + picture_info;
          } catch (err) {
            console.log(err);
          }
        }
        raw_info.descr = raw_info.descr.replace(/https:\/\/kp.m-team.cc.*?url=/ig, '');
        raw_info.descr = raw_info.descr.replace(/\n+/g, '\n');
        raw_info.descr = raw_info.descr.replace(/^\[quote\]\[b\]\[color=blue\]转自.*?，感谢原制作者发布。\[\/color\]\[\/b\]\[\/quote\]/i, '');
        raw_info.descr = add_thanks(raw_info.descr);
        rebuild_href(raw_info);
      };
      getDataFromAPIs();
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 9) ---
if (origin_site == 'HDHome' || origin_site == 'MTeam' || origin_site == 'HDRoute' || origin_site == 'OurBits') {
      raw_info.small_descr = raw_info.small_descr.replace(/【|】/g, " ");
      raw_info.small_descr = raw_info.small_descr.replace(/diy/i, "【DIY】");

      //DIY图文换序兼顾圆盘补quote
      var img_info = '';
      if (raw_info.name.match(/DIY/i)) {
        var img_urls = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
        try {
          for (i = 0; i < img_urls.length; i++) {
            if (raw_info.descr.indexOf(img_urls[i]) < 10) {
            } else {
              raw_info.descr = raw_info.descr.replace(img_urls[i], '');
              img_info += img_urls[i].match(/\[img\].*?\[\/img\]/)[0];
            }
          }
        } catch (Err) { }
      }

      raw_info.descr = raw_info.descr.replace(/\n{3,10}/g, '\n\n');

      //圆盘补quote
      var tem_str = "";
      if (raw_info.descr.match(/DISC.INFO/i)) {
        var disc_info = raw_info.descr.match(/.*?DISC.INFO/i)[0];
        tem_str = raw_info.descr.slice(raw_info.descr.indexOf(disc_info) - 10, raw_info.descr.length);
        if (!tem_str.match(/quote/i)) {
          var img_urls = tem_str.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
          var t_img_info = '';
          try {
            for (i = 0; i < img_urls.length; i++) {
              raw_info.descr = raw_info.descr.replace(img_urls[i], '');
              t_img_info += img_urls[i].match(/\[img\].*?\[\/img\]/)[0];
            }
          } catch (err) { }
          raw_info.descr = raw_info.descr.replace(disc_info, `[img]https://images2.imgbox.com/04/6b/Ggp5ReQb_o.png[/img]\n\n[quote]\r${disc_info}`);
          raw_info.descr = raw_info.descr.trim() + "\r" + "[/quote]\n" + t_img_info;
        }
      }
      raw_info.descr = raw_info.descr + '\n\n' + img_info;

      if (raw_info.descr.match(/^(\[img\].*?\[\/img\])\s*(\[quote\][\s\S]*?\[\/quote\])/)) {
        raw_info.descr = raw_info.descr.replace(/^(\[img\].*?\[\/img\])\s*(\[quote\][\s\S]*?\[\/quote\])/, '$2\n\n$1');
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 10) ---
if (origin_site != 'MTeam') forward_l.style.fontWeight = "bold";
      if ((!judge_if_the_site_in_domestic() && no_need_douban_button_sites.indexOf(origin_site) < 0) || douban_button_needed) {
        var direct;
        if (['PHD', 'avz', 'CNZ', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'BHD', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'OMG'].indexOf(origin_site) > -1) {
          direct = "left";
        } else {
          direct = "right";
        }
        forward_l.align = direct;
        var box_left = douban_box.insertCell(0);
        var box_right = douban_box.insertCell(1);
        if (origin_site == 'FileList' || origin_site == 'xthor' || origin_site == 'HDB') {
          box_right.style.paddingLeft = '12px';
          if (origin_site == 'HDB') {
            box_left.style.paddingRight = '12px'; box_left.style.paddingTop = '12px';
            box_left.style.paddingBottom = '12px';
            box_right.style.borderTop = 'none'; box_right.style.borderBottom = 'none';
            box_right.style.borderRight = 'none'; box_left.style.border = 'none';
          }
        }
        box_left.innerHTML = '豆瓣信息';
        if (origin_site == 'NBL' || origin_site == 'IPT' || origin_site == 'torrentseeds' || origin_site == 'HONE') {
          box_left.style.width = '60px';
        } else if (['IN', 'digitalcore', 'BlueBird', 'bwtorrents', 'HOU', 'BLU', 'Tik', 'Aither', 'DarkLand', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(origin_site) >= 0) {
          box_left.style.width = '80px';
        }
        box_left.align = direct;
        box_left.style.fontWeight = "bold";
        box_right.id = 'box_right';
        if (origin_site == 'ZHUQUE') {
          forward_l.innerHTML = " ";
          box_left.innerHTML = ' ';
        }
        init_buttons_for_transfer(box_right, origin_site, 0, raw_info);
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 11) ---
if (origin_site == 'CMCT' || origin_site == 'OurBits' || origin_site == 'TJUPT' || origin_site == 'bit-hdtv' || origin_site == 'MTeam' || origin_site == '影') {
      if (origin_site == 'TJUPT') {
        forward_r.style.border = "2px solid #FFFFFF";
      } else if (origin_site == 'MTeam') {
        forward_l.parentNode.setAttribute('class', 'ant-descriptions-row');
        forward_l.setAttribute('class', 'ant-descriptions-item-label');
        $(forward_l).css({ 'width': '135px', 'text-align': 'right' });
        forward_r.setAttribute('class', 'ant-descriptions-item-content');
      } else if (origin_site == '影') {
        forward_l.parentNode.id = 'tr_item';
      } else {
        forward_l.style.border = "1px solid #D0D0D0";
        forward_r.style.border = "1px solid #D0D0D0";
      }
      if (douban_button_needed || origin_site == 'bit-hdtv') {
        box_left.style.border = "1px solid #D0D0D0";
        box_right.style.border = "1px solid #D0D0D0";
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 12) ---
else if (origin_site == 'MTeam') {
        forward_l.parentNode.setAttribute('class', 'ant-descriptions-row');
        forward_l.setAttribute('class', 'ant-descriptions-item-label');
        $(forward_l).css({ 'width': '135px', 'text-align': 'right' });
        forward_r.setAttribute('class', 'ant-descriptions-item-content');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 13) ---
if (raw_info.origin_site == 'MTeam') {
      raw_info.descr = raw_info.descr.replace(/░/g, '');
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 14) ---
else if (raw_info.type == '电影' && ['HUDBT', 'MTeam', 'TLFbits', 'PuTao', 'TJUPT', 'NanYang', 'BYR', 'TTG'].indexOf(forward_site) < 0) {
        raw_info.type = '动漫';
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 15) ---
if (forward_site == 'PTer' || forward_site == 'Dragon' || forward_site == 'QingWa' || forward_site == 'MTeam') {
      function re_build_name(channels, name) {
        var label = ''; label_str = '';
        if (channels == '1') {
          label = /1\.0/; label_str = '1.0';
        } else if (channels == '2') {
          label = /2\.0/; label_str = '2.0';
        } else if (channels == '6') {
          label = /5\.1/; label_str = '5.1';
        } else if (channels == '8') {
          label = /7\.1/; label_str = '7.1';
        }
        if (!name.match(label)) {
          name = name.replace(/(DDP|DD\+|AAC|FLAC|LPCM|TrueHD|DTS-HD.MA|DTS:X|DTS-HD.?HR|DTS|AC3)/i, `$1 ${label_str}`);
        }
        return name;
      }
      try {
        var channels = (raw_info.descr + raw_info.full_mediainfo).match(/Channel.*?(\d) channel/)[1];
        raw_info.name = re_build_name(channels, raw_info.name);
      } catch (err) {
        if (raw_info.descr.match(/(AUDIO.*CODEC.*?|音频.*?)(2\.0|1\.0|5\.1|7\.1)/i)) {
          channels = raw_info.descr.match(/(AUDIO.*CODEC.*?|音频.*?)(2\.0|1\.0|5\.1|7\.1)/i)[2];
          if (!raw_info.name.includes(channels)) {
            raw_info.name = raw_info.name.replace(/(DDP|AAC|FLAC|LPCM|TrueHD|DTS-HD.MA|DTS:X|DTS-HD.?HR|DTS|AC3|DD)/i, `$1 ${channels}`);
          }
        } else if (raw_info.descr.match(/\d channels/i)) {
          channels = raw_info.descr.match(/(\d) channels/i)[1];
          raw_info.name = re_build_name(channels, raw_info.name);
        }
      }
      if (raw_info.name.match(/WEB-DL/i)) {
        raw_info.name = raw_info.name.replace(/HEVC/, 'H.265').replace(/AVC/, 'H.264');
      }
      if (forward_site == 'MTeam') {
        raw_info.name = raw_info.name.replace(/AC3/, 'DD');
        raw_info.name = raw_info.name.replace(/DD\+/, 'DDP');
        try {
          var audio_number = 1;
          if (raw_info.descr.match(/DISC INFO:/)) {
            if (raw_info.descr.match(/Audio:[\s\S]{0,20}Codec/i)) {
              var audio_info = raw_info.descr.match(/Audio:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/subtitles/i)[0].trim();
              audio_number = audio_info.split('\n').length;
            }
          } else {
            if (raw_info.descr.match(/Audio:(.*)/i)) {
              audio_number = raw_info.descr.match(/Audio:(.*)/ig).length;
            } else if (raw_info.descr.match(/Audio #\d/)) {
              audio_number = raw_info.descr.match(/Audio #\d/ig).length;
            }
          }
          if (audio_number > 1) {
            var audio_str = `${audio_number}Audio`;
            if (!raw_info.name.includes(audio_str)) {
              raw_info.name = raw_info.name.replace(/(DDP|AAC|FLAC|LPCM|TrueHD|DTS-HD.?MA|DTS:X|DTS-HD.?HR|DTS|DD) ?(\d\.\d)?/i, `$1 $2 ${audio_str}`);
            }
          }
        } catch (err) { }

      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 16) ---
if (forward_site == 'MTeam') {
        raw_info.name = raw_info.name.replace(/AC3/, 'DD');
        raw_info.name = raw_info.name.replace(/DD\+/, 'DDP');
        try {
          var audio_number = 1;
          if (raw_info.descr.match(/DISC INFO:/)) {
            if (raw_info.descr.match(/Audio:[\s\S]{0,20}Codec/i)) {
              var audio_info = raw_info.descr.match(/Audio:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/subtitles/i)[0].trim();
              audio_number = audio_info.split('\n').length;
            }
          } else {
            if (raw_info.descr.match(/Audio:(.*)/i)) {
              audio_number = raw_info.descr.match(/Audio:(.*)/ig).length;
            } else if (raw_info.descr.match(/Audio #\d/)) {
              audio_number = raw_info.descr.match(/Audio #\d/ig).length;
            }
          }
          if (audio_number > 1) {
            var audio_str = `${audio_number}Audio`;
            if (!raw_info.name.includes(audio_str)) {
              raw_info.name = raw_info.name.replace(/(DDP|AAC|FLAC|LPCM|TrueHD|DTS-HD.?MA|DTS:X|DTS-HD.?HR|DTS|DD) ?(\d\.\d)?/i, `$1 $2 ${audio_str}`);
            }
          }
        } catch (err) { }

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

// --- From Module: 17_forward_site_filling1.js (Snippet 18) ---
if (forward_site == 'MTeam' || forward_site == 'RouSi') {
          mediainfo_mteam = v.trim();
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 19) ---
else if (forward_site == '财神' || forward_site == 'LuckPT' || forward_site == 'MTeam') {
            get_full_size_picture_urls(null, infos.pic_info, $('#not'), true, function (img_info) {
              raw_info.descr += img_info.trim();
            }, function (data) {
              for (i = 0; i < data.length; i++) {
                if (data[i]) {
                  raw_info.descr = raw_info.descr.replace(data[i], '');
                }
              }
            });
          }

// --- From Module: 18_forward_site_filling2.js (Snippet 20) ---
else if (forward_site == 'MTeam') {
      addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, null);
      var i_evt = new Event("change", { bubbles: true, cancelable: false });
      i_evt.simulated = true;
      function setValue(input, value) {
        let lastValue = input.value;
        input.value = value;
        let tracker = input._valueTracker;
        if (tracker) {
          tracker.setValue(lastValue);
        }
        input.dispatchEvent(i_evt);
      }
      var type_code = '電影/HD';
      switch (raw_info.type) {
        case '电影':
          if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
            type_code = '電影/Blu-Ray';
          } else if (raw_info.medium_sel == 'Remux') {
            type_code = '電影/Remux';
          } else if (raw_info.medium_sel == 'DVD' || raw_info.medium_sel == 'DVDRip') {
            type_code = '電影/DVDiSo';
          } else {
            if (raw_info.standard_sel != 'SD') {
              type_code = '電影/HD';
            } else {
              type_code = '電影/SD';
            }
          }
          break;
        case '剧集': case '综艺':
          if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
            type_code = '影劇/綜藝/BD';
          } else if (raw_info.medium_sel == 'DVD' || raw_info.medium_sel == 'DVDRip') {
            type_code = '影劇/綜藝/DVDiSo';
          } else {
            if (raw_info.standard_sel != 'SD') {
              type_code = '影劇/綜藝/HD';
            } else {
              type_code = '影劇/綜藝/SD';
            }
          }
          break;
        case '纪录': type_code = '紀錄'; break;
        case '学习': type_code = '教育(書面)'; break;
        case '动漫': type_code = '動畫'; break;
        case '音乐':
          if (raw_info.name.match(/(flac|ape)/i)) {
            type_code = 'Music(無損)';
          } else {
            type_code = 'Music(AAC/ALAC)';
          }
          break;
        case 'MV': type_code = '演唱'; break;
        case '体育': type_code = '運動'; break;
        case '软件': type_code = '軟體'; break;
        case '游戏': type_code = 'PC遊戲'; break;
        case '书籍': type_code = 'Misc(其他)';
      }
      var videoCodec = 'H.264';
      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': videoCodec = 'H.264(x264/AVC)'; break;
        case 'VC-1': videoCodec = 'VC-1'; break;
        case 'XVID': videoCodec = 'Xvid'; break;
        case 'MPEG-2': videoCodec = 'MPEG-2'; break;
        case 'H265': case 'X265': videoCodec = 'H.265(x265/HEVC)'; break;
        case 'AV1': videoCodec = 'AV1';
      }
      var audioCodec = 'Other';
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': case 'DTS-HDHR':
          audioCodec = 'DTS-HD MA';
          break;
        case 'TrueHD': audioCodec = 'TrueHD'; break;
        case 'Atmos':
          audioCodec = 'TrueHD Atmos';
          break;
        case 'AC3':
          audioCodec = 'AC3(DD)';
          if (raw_info.name.match(/DDP|DD\+/)) {
            audioCodec = 'E-AC3(DDP)';
            if (raw_info.name.match(/Atoms/)) {
              audioCodec = 'E-AC3 Atoms(DDP Atoms)';
            }
          }
          break;
        case 'LPCM': audioCodec = 'LPCM/PCM'; break;
        case 'DTS': case 'AAC': case 'Flac': case 'APE': case 'WAV':
          audioCodec = raw_info.audiocodec_sel.toUpperCase();
      }

      async function runSequence(standard_sel, videoCodec, audioCodec, type_code) {
        try {
          await selectDropdownOption('standard', 0, standard_sel);
          await selectDropdownOption('videoCodec', 1, videoCodec);
          await selectDropdownOption('audioCodec', 2, audioCodec);
          await selectDropdownOption('category', 3, type_code);
          await new Promise(resolve => setTimeout(resolve, 2000));
          const editor = document.querySelector('.editor-input[contenteditable="true"]');
          if (!editor) {
            console.log("未找到编辑器");
            return;
          }
          editor.focus();
          const dataTransfer = new DataTransfer();
          dataTransfer.setData('text/plain', raw_info.descr);
          const pasteEvent = new ClipboardEvent('paste', {
            clipboardData: dataTransfer,
            bubbles: true,
            cancelable: true,
            view: window
          });
          editor.dispatchEvent(pasteEvent);
          editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
        } catch (error) {
          console.error("执行过程中出错:", error);
        }
      }

      $('#category').wait(function () {
        setValue(document.getElementById('name'), raw_info.name);
        setValue(document.getElementById('smallDescr'), raw_info.small_descr);
        setValue(document.getElementById('imdb'), raw_info.url);
        setValue(document.getElementById('douban'), raw_info.dburl);

        setTimeout(function () {
          setValue(document.getElementById('name'), raw_info.name);
          if (labels.gy || labels.yy) { document.getElementsByClassName('ant-checkbox-input')[1].click(); }
          if (labels.zz) {
            var node_class = document.getElementsByClassName('ant-checkbox-input')[0].parentNode.classList;
            var clicked = false;
            node_class.forEach(function (className) {
              if (className == 'ant-checkbox-checked') {
                clicked = true;
              }
            });
            if (!clicked) {
              document.getElementsByClassName('ant-checkbox-input')[0].click();
            }
          }
        }, 3000);
        var reg_region = raw_info.descr.match(/(地.{0,5}?区|国.{0,5}?家|产.{0,5}?地|產.{0,5}?地)([^\r\n]+)/);
        if (reg_region) {
          var region = reg_region[2].trim();
          if (!$('#region_tips').length) {
            $('span:contains("請選擇國家/地區")').first().parent().parent().parent().parent().after(`<p id="region_tips">当前资源的来源国家/地区为：${region}</p>`);
          }
        }

        var container = document.getElementById('mediainfo');
        setValue(container, mediainfo_mteam);
        runSequence(raw_info.standard_sel, videoCodec, audioCodec, type_code);
      }, 10000, 20);
    }

// --- From Module: 23_final_handlers.js (Snippet 21) ---
else if (origin_site == 'MTeam' && site_url.match(/^https:\/\/(kp|next).m-team.cc\/detail.*/)) {
  var executed = false;
  mutation_observer(document, function () {
    if ($('label:contains(字幕)').length && !executed) {
      setTimeout(auto_feed, sleep_time);
      executed = true;
    }
  });
}

