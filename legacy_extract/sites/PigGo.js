/** Consolidated Logic for: PigGo **/

// --- From Module: 16_origin_site_parsing3.js (Snippet 1) ---
if (origin_site == 'PigGo' && $('span:contains("禁转")').length) {
      if_exclusive = true;
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 2) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
case 'PigGo':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '9'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[4][]'), '13'); }
          if (raw_info.name.match(/DV/)) { check_label(document.getElementsByName('tags[4][]'), '9'); }
          if (raw_info.name.match(/(\.| )3D(\.| )/)) { check_label(document.getElementsByName('tags[4][]'), '8'); }
          if (raw_info.descr.match(/Dolby.*?Atmos/) || $('textarea[name="technical_info"]').val().match(/Dolby.*?Atmos/)) {
            check_label(document.getElementsByName('tags[4][]'), '12');
          }
          if (raw_info.name.match(/-DGB/i)) { check_label(document.getElementsByName('tags[4][]'), '24'); }
          break;

// --- From Module: 20_forward_site_filling4.js (Snippet 4) ---
else if (forward_site == 'PigGo') {
      var browsecat = $('#browsecat')
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
        '体育': 407, '软件': 409, '学习': 409, '': 409, '游戏': 409, 'MV': 406
      };
      browsecat.val(409)
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      disableother('browsecat', 'specialcat');
      var source_box = $('select[name="source_sel[4]"]');
      source_box.val(6)
      switch (raw_info.medium_sel) {
        case 'UHD': source_box.val(1); break;
        case 'Blu-ray': case 'Remux': case 'Encode':
          source_box.val(1); break;
        case 'HDTV': source_box.val(5); break;
        case 'WEB-DL': source_box.val(7); break;
        case 'DVD': source_box.val(3);
      }
      var medium_box = $('select[name="medium_sel[4]"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(11); break;
        case 'Blu-ray': medium_box.val(11); break;
        case 'DVD':
          medium_box.val(11);
          if (raw_info.name.match(/DVDr/i)) {
            medium_box.val(7);
          }
          break;
        case 'Remux': medium_box.val(3); break;
        case 'HDTV': medium_box.val(8); break;
        case 'Encode': medium_box.val(7); break;
        case 'WEB-DL':
          medium_box.val(11);
          if (raw_info.name.match(/webrip/i)) {
            medium_box.val(7);
          }
          break;
        case 'CD': medium_box.val(8);
      }
      var codec_box = $('select[name="codec_sel[4]"]');
      codec_box.val(5);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(6); break;
        case 'H264': codec_box.val(1); case 'X264': codec_box.val(1); break;
        case 'VC-1': codec_box.val(5); break;
        case 'MPEG-2': case 'MPEG-4': codec_box.val(5);; break;
        case 'XVID': codec_box.val(5);
      }
      var audiocodec_box = $('select[name="audiocodec_sel[4]"]');
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': audiocodec_box.val(9); break;
        case 'DTS-HDMA:X 7.1': audiocodec_box.val(9); break;
        case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(9); break;
        case 'TrueHD': audiocodec_box.val(10); break;
        case 'Atmos': audiocodec_box.val(10); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'AC3': audiocodec_box.val(8); break;
        case 'AAC': audiocodec_box.val(6); break;
        case 'Flac': audiocodec_box.val(1); break;
        case 'APE': audiocodec_box.val(2); break;
        case 'LPCM': audiocodec_box.val(11); break;
        case 'WAV': audiocodec_box.val(7);
      }
      var standard_box = $('select[name="standard_sel[4]"]');
      var standard_dict = {
        '4K': 5, '1080p': 1, '1080i': 1, '720p': 3
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      $('select[name="team_sel[4]"]').val(5);
      check_team(raw_info, 'team_sel[4]');
      $('input[name="pt_gen"]').val(raw_info.dburl);

      if (labels.db) {
        $('select[name="processing_sel[4]"]').val(4);
      } else if (labels.hdr10) {
        $('select[name="processing_sel[4]"]').val(2);
      } else if (labels.hdr10plus) {
        $('select[name="processing_sel[4]"]').val(3);
      } else {
        $('select[name="processing_sel[4]"]').val(1);
      }
    }

