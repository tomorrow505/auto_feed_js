/** Consolidated Logic for: NPUPT **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
else if (origin_site == 'NPUPT') {
        title = document.getElementsByClassName('jtextfill')[0];
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
if (origin_site == 'NPUPT') {
      raw_info.name = raw_info.name.split('剩')[0].trim();
      raw_info.small_descr = $('.large').text();
      tbody = document.getElementsByClassName('table-striped')[0];
      insert_row = tbody.insertRow(0);
      raw_info.type = $('#main').html().match(/<span class="label label-success">类型:(.*)<\/span>/)[1].get_type();
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 3) ---
if (['NanYang', 'CMCT', 'iTS', 'NPUPT', 'xthor'].indexOf(forward_site) > -1) {
          allinput[i].value = raw_info.name.replace(/\s/g, ".");
        }

// --- From Module: 19_forward_site_filling3.js (Snippet 4) ---
else if (forward_site == 'NPUPT') {
      evt.initEvent("change", false, true);
      switch (raw_info.type) {
        case '电影': $('#browsecat').val('401'); break;
        case '剧集': $('#browsecat').val('402'); break;
        case '纪录': $('#browsecat').val('404'); break;
        case '动漫': $('#browsecat').val('405'); break;
        case '综艺': $('#browsecat').val('403'); break;
        case '学习': $('#browsecat').val('411'); break;
        case '音乐': $('#browsecat').val('414'); break;
        case '体育': $('#browsecat').val('407'); break;
        case '软件': $('#browsecat').val('408'); break;
        default:
          $('#browsecat').val('409');
      }
      document.getElementById('browsecat').dispatchEvent(evt);
      $('#torrent_name_checkbox').prop('checked', true);
      document.getElementById('torrent_name_checkbox').dispatchEvent(evt);
      if (raw_info.type == '电影') {
        if (raw_info.source_sel == '大陆' || raw_info.source_sel == '台湾' || raw_info.source_sel == '香港' || raw_info.source_sel == '港台') {
          $('#source_sel').val(6);
        } else if (raw_info.source_sel == '欧美') {
          $('#source_sel').val(5);
        } else if (raw_info.source_sel == '日本' || raw_info.source_sel == '韩国' || raw_info.source_sel == '日韩') {
          $('#source_sel').val(4);
        } else {
          $('#source_sel').val(7);
        }
        document.getElementById('source_sel').dispatchEvent(evt);
        $('#torrent_name_field0').val(get_search_name(raw_info.name));
        try { $('#torrent_name_field1').val(raw_info.name.match(/(19|20)\d{2}/)[0]); } catch (err) { }
      } else if (raw_info.type == '剧集') {
        if (raw_info.source_sel == '大陆') {
          $('#source_sel').val(23);
        } else if (raw_info.source_sel == '台湾' || raw_info.source_sel == '香港' || raw_info.source_sel == '港台') {
          $('#source_sel').val(24);
        } else if (raw_info.source_sel == '欧美') {
          $('#source_sel').val(25);
        } else if (raw_info.source_sel == '日本') {
          $('#source_sel').val(26);
        } else if (raw_info.source_sel == '韩国') {
          $('#source_sel').val(27);
        } else {
          $('#source_sel').val(63);
        }
        document.getElementById('source_sel').dispatchEvent(evt);
        $('#torrent_name_field0').val(get_search_name(raw_info.name));
        try { $('#torrent_name_field1').val(raw_info.name.match(/S\d+(-S\d+)?|S\d+(E\d+)?|EP?\d+(-E?\d+)?/i)[0]); } catch (err) { alert(err) }
      }

      switch (raw_info.medium_sel) {
        case 'UHD': case 'Blu-ray': $('#torrent_name_field2').val('BluRay'); break;
        case 'DVD': $('#torrent_name_field2').val('DVD'); break;
        case 'Remux': $('#torrent_name_field2').val('Remux'); break;
        case 'HDTV': $('#torrent_name_field2').val('HDTV'); break;
        case 'WEB-DL': $('#torrent_name_field2').val('WEB-DL'); break;
        case 'Encode': $('#torrent_name_field2').val('Encode'); break;
      }

      var standard_dict = { '4K': '2160p', '1080p': '1080p', '1080i': '1080i', '720p': '720p', 'SD': '480p' };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        $('#torrent_name_field3').val(index);
      }

      switch (raw_info.codec_sel) {
        case 'H264': $('#torrent_name_field4').val('H264'); break;
        case 'X264': $('#torrent_name_field4').val('x264'); break;
        case 'H265': case 'X265': $('#torrent_name_field4').val('x265'); break;
        case 'VC-1': $('#torrent_name_field4').val('WMV'); break;
        case 'MPEG-2': $('#torrent_name_field4').val('MPEG2'); break;
        case 'XVID': $('#torrent_name_field4').val('Xvid'); break;
      }
      if (raw_info.name.trim().match(/(wiki|cmct|mteam|epic|HDChina|hds|beast|ctrlhd|chd)/i)) {
        $('#torrent_name_field5').val(raw_info.name.trim().match(/(wiki|cmct|mteam|epic|HDChina|hds|beast|ctrlhd|chd)/i)[1]);
      }
    }

