/** Consolidated Logic for: U2 **/

// --- From Module: 06_site_detection.js (Snippet 1) ---
if (site_url.match(/u2.dmhy.org|ourbits.club|hd-space.org|totheglory.im|blutopia.cc|star-space.net|torrent.desi|hudbt|fearnopeer.com|darkland.top|onlyencodes.cc|cinemageddon|eiga.moi|hd-olimpo.club|digitalcore.club|bwtorrents.tv|myanonamouse|greatposterwall.com|m-team.cc/i)) {
        n.innerHTML = '\r\n';
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'U2') {
        tmp_descr = raw_info.descr;
        $('table.spoiler').map((index, e) => {
          raw_info.descr = '';
          var clonetable = $(e).find('span.spoiler-content')[0].cloneNode(true);
          if ($(e).html().match(/Screenshot/)) {
            tmp_descr += walkDOM(clonetable);
          } else {
            tmp_descr += `[quote]\n${walkDOM(clonetable)}\n[/quote]\n\n`;
          }
        });
        raw_info.descr = tmp_descr;
        console.log(raw_info.descr);
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 3) ---
else if (origin_site == 'U2') {
        raw_info.torrent_name = $('a[href*="download.php"]:first').text();
        raw_info.torrent_url = o_site_info[origin_site] + $('a[href^="download.php"]:eq(1)').attr('href');
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
if (origin_site == 'U2') {
            raw_info.small_descr = $(tds[i]).parent().find('td:last').text();
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == 'U2') {
      raw_info.torrentName = $('a:contains(".torrent")').text();
      raw_info.descr = raw_info.descr.replace('SPEC', '[quote]\r\nSPEC');
      raw_info.descr = raw_info.descr.replace(/\[quote\]\n(感|Thank|OP From|OP&ED)/, function (data) {
        return `[/quote]\r\n[quote]\r\n${data.split('\n')[1]}`;
      });
      raw_info.animate_info = raw_info.name;
      raw_info.name = raw_info.name.match(/\[.*?\]/g)[1].replace(/\[|\]/g, '');
      var anidb_info = '';
      if ($('#kanidb').length) {
        var anidb_info = $('#kanidb').text();
        if (anidb_info.match(/Wiki \(JP\)/)) {
          raw_info.source_sel = '日本';
        }
      }
      if ((anidb_info).match(/(放映年份|Year): (\d{4})/)) {
        raw_info.name += ' ' + (anidb_info).match(/(放映年份|Year): (\d{4})/)[2];
      }
      if (raw_info.animate_info.match(/\[movie\]/i)) {
        raw_info.name += ' MOVIE'
      }
      if (raw_info.animate_info.match(/BDRip|TVRip|DVDRip|BDMV|DVDISO|HQ-HDTVRip|HDTVRip/i)) {
        raw_info.name += ' ' + raw_info.animate_info.match(/BDrip|TVRip|DVDRip|BDMV|DVDISO|HQ-HDTVRip|HDTVRip/i)[0];
      }
      if (raw_info.name.match(/BDMV|BDRip/)) {
        raw_info.name += ' 1080p';
        raw_info.standard_sel = '1080p';
      }
      var release = raw_info.animate_info.match(/\[.*?\]/g).filter((e) => { if (e.match(/disc|fin|Vol/i)) return e });
      if (release.length) {
        raw_info.name += ' ' + release[0].replace(/\[|\]/g, '');
      }
      if ((raw_info.animate_info + raw_info.descr).match(/x264|x265|h.?264|h.265|hevc|avc/i)) {
        raw_info.name += ' ' + (raw_info.animate_info + raw_info.descr).match(/x264|x265|h.?264|h.265|hevc|AVC/i)[0];
      }
      if ((raw_info.animate_info + raw_info.descr).match(/Truehd|DTS(.?HD.?MA.*)?|LPCM|FLAC|AC3/i)) {
        var audio = (raw_info.animate_info + raw_info.descr).match(/Truehd|DTS(.?HD.?MA.*)?|LPCM|FLAC|AC3/i)[0];
        if (audio.match(/DTS(.?HD.?MA.*\d\.\d)/i)) {
          audio = 'DTS-HDMA ' + audio.match(/\d\.\d/)[0];
        }
        raw_info.name += ' ' + audio;
      } else {
        if ((raw_info.animate_info + raw_info.descr).match(/AAC/) && !(raw_info.animate_info + raw_info.descr).match(/AACS/)) {
          raw_info.name += ' AAC';
        }
      }

      var author = raw_info.animate_info.match(/\[.*?\]/g).pop().replace(/\[|\]/g, '');
      if ((raw_info.small_descr + raw_info.animate_info).match(/自抓|自购|自購|自压|自壓/)) {
        if (author.match(/^(jp|r2j|r2_j.*|r2fr|ita|ger|uk|tw|hk|.*flac.*|scans|.*\+.*|usa|fra|movie|tv|自压|自抓|自购|自購|.*自壓.*)$/i)) {
          raw_info.name += '-Anonymous@U2';
        } else {
          raw_info.name += `-${author}@U2`;
        }
      } else {
        if (author.match(/@|arin/i)) {
          raw_info.name += `-${author}`;
        } else {
          var authors = ['lolihouse', 'jsum', 'Raws', 'KoushinRip', 'ANK', 'VCB-Studio', 'VCB', 'LittlePox', 'LittleBakas', 'ANE', 'Reinforce', 'SweetDreamDay', 'Moozzi2', 'mawen1250']
          authors.forEach((item) => {
            if (author.match(item)) {
              raw_info.name += `-${author}@U2`;
            }
          });
        }
        raw_info.descr = '[quote]转自U2, 对原作者表示感谢[/quote]\n\n' + raw_info.descr;
      }
      try {
        var uploader = $('td:contains("发布人")').next().text().replace(/\(.*\)/, '').trim();
        raw_info.name = raw_info.name.replace('Anonymous', uploader);
      } catch (err) { }

      raw_info.small_descr += ' ' + raw_info.animate_info.match(/\[.*?\]/g)[0].replace(/\[|\]/g, '');
      raw_info.type = '动漫';
      try { raw_info.anidb = raw_info.descr.match(/https:\/\/anidb\.net\/a\d+/i)[0]; } catch (err) { }
      if (!raw_info.anidb) {
        try { raw_info.anidb = document.getElementById('kanidb').parentNode.innerHTML.match(/https:\/\/anidb\.net\/a\d+/i)[0]; } catch (err) { }
      }
      raw_info.anidb = raw_info.anidb.replace('anidb.net/a', 'anidb.net/anime/');
      try { raw_info.url = raw_info.descr.match(/https:\/\/www\.imdb\.com\/title\/tt\d+/i)[0]; } catch (err) { }
      var info_text = raw_info.animate_info + raw_info.descr + raw_info.name;
      if (info_text.medium_sel()) {
        raw_info.medium_sel = info_text.medium_sel();
      }
      if (info_text.codec_sel()) {
        raw_info.codec_sel = info_text.codec_sel();
      }
      if (info_text.audiocodec_sel()) {
        raw_info.audiocodec_sel = info_text.audiocodec_sel();
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
if (origin_site != 'U2') {
      raw_info.name = deal_with_title(raw_info.name);
    }

