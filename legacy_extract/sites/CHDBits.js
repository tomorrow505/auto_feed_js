/** Consolidated Logic for: CHDBits **/

// --- From Module: 11_download_clients.js (Snippet 1) ---
else if (forward_site == 'CHDBits') {
    $('input[name=torrentfile]')[0].files = container.files;
  }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
if (origin_site == 'CMCT' || origin_site == 'NanYang' || origin_site == 'CHDBits') {
      raw_info.name = raw_info.name.replace(/\d\.\d\/10.*$/g, '');
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 3) ---
else if (origin_site == 'CHDBits') {
      if (raw_info.name.match(/CHD|SGNB|STBOX|ONEHD|BLUCOOK|HQC|GBT|KAN|PLP/i)) {
        if (raw_info.url) {
          $('#top').append(`<br><b><span id="checking"><font color="red">[禁转判断中……]</font></span></b>`);
          var check_url = default_site_info[origin_site].url + 'torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={imdbid}&search_area=4&search_mode=0';
          var imdbid = raw_info.url.match(/tt\d+/)[0];
          check_url = check_url.format({ 'imdbid': imdbid });
          getDoc(check_url, null, function (doc) {
            var $table = $('.torrents', doc);
            var torrentid = site_url.match(/id=\d+/)[0];
            var torrent = $table.find(`a[href*="${torrentid}"]`);
            if (torrent) {
              if (torrent.parent().html().match(/tag-dz/)) {
                $('#checking').html('<font color="red">[独占资源]</font>');
                if_exclusive = true;
              } else if (torrent.parent().html().match(/tag-limited/)) {
                $('#checking').html('<font color="red">[限转资源]</font>');
                if_exclusive = true;
              } else {
                $('#checking').html('<font color="red">[一般资源]</font>');
              }
            } else {
              $('#checking').html('<font color="red">[查找失败, 自己检查]</font>');
            }
          });
        } else {
          $('#top').append(`<br><b><span id="checking"><font color="red">[缺少IMDB请自查]</font></span></b>`);
        }
      } else {
        $('#top').append(`<br><b><span id="checking"><font color="red">[一般资源]</font></span></b>`);
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 4) ---
case 'CHDBits':
          if (labels.gy) { document.getElementsByName('cnlang')[0].checked = true; }
          if (labels.zz) { document.getElementsByName('cnsub')[0].checked = true; }
          if (labels.diy) { document.getElementsByName('diy')[0].checked = true; }
          break;

// --- From Module: 18_forward_site_filling2.js (Snippet 5) ---
if (forward_site == 'CHDBits') {
        torrent_box.parentNode.innerHTML = '<input type="file" class="file" id="torrent" name="torrentfile" accept=".torrent">';
      }

// --- From Module: 19_forward_site_filling3.js (Snippet 6) ---
else if (forward_site == 'CHDBits') {
      try {
        var browsecat = document.getElementsByName('type')[0];
        var type_dict = {
          '电影': 1,
          '剧集': 4,
          '动漫': 3,
          '综艺': 5,
          '音乐': 6,
          'MV': 6,
          '纪录': 2,
          '体育': 7
        };
        //如果当前类型在上述字典中
        if (type_dict.hasOwnProperty(raw_info.type)) {
          var index = type_dict[raw_info.type];
          browsecat.options[index].selected = true;
        }
        if (raw_info.type == '书籍' && raw_info.descr.match(/m4a|mp3/i)) {
          browsecat.options[9].selected = true;
        }
        var audiocodec_box = document.getElementsByName('audiocodec_sel')[0];
        var audiocodec_dict = {
          'Flac': 6,
          'APE': 7,
          'AC3': 2,
          'WAV': 8,
          'Atmos': 4,
          'AAC': 9,
          'DTS-HDMA': 3,
          'DTS-HDHR': 3,
          'TrueHD Atmos': 4,
          'TrueHD': 4,
          'DTS': 1,
          'LPCM': 5,
          'DTS-HDMA:X 7.1': 3
        };
        if (audiocodec_dict.hasOwnProperty(raw_info.audiocodec_sel)) {
          var index = audiocodec_dict[raw_info.audiocodec_sel];
          audiocodec_box.options[index].selected = true;
        }
        var standard_box = document.getElementsByName('standard_sel')[0];
        var standard_dict = {
          '8K': 5,
          '4K': 6,
          '1080p': 1,
          '1080i': 2,
          '720p': 3,
          'SD': 4,
          '': 4
        };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
          var index = standard_dict[raw_info.standard_sel];
          standard_box.options[index].selected = true;
        }

        var codec_box = document.getElementsByName('codec_sel')[0];
        var codec_dict = { 'H264': 1, 'X265': 2, 'X264': 1, 'H265': 2, 'VC-1': 5, 'MPEG-2': 4 };
        if (codec_dict.hasOwnProperty(raw_info.codec_sel)) {
          var index = codec_dict[raw_info.codec_sel];
          codec_box.options[index].selected = true;
        }

        var medium_box = document.getElementsByName('medium_sel')[0];
        var medium_dict = { 'UHD': 2, 'Blu-ray': 1, 'Encode': 4, 'HDTV': 5, 'WEB-DL': 6, 'Remux': 3, 'CD': 7 };
        if (medium_dict.hasOwnProperty(raw_info.medium_sel)) {
          var index = medium_dict[raw_info.medium_sel];
          medium_box.options[index].selected = true;
        }
        switch (raw_info.medium_sel) {
          case 'UHD':
            if (raw_info.name.match(/(diy|@)/i)) {
              medium_box.options[2].selected = true;
            }
            break;
          case 'Blu-ray':
            if (raw_info.name.match(/(diy|@)/i)) {
              medium_box.options[1].selected = true;
            }
        }
      } catch (err) {
        alert(err);
      }
      $('select[name="source_sel"]').val(7);
      check_team(raw_info, 'team_sel');
    }

