/** Consolidated Logic for: CMCT **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (!descr && origin_site == 'CMCT') {
          descr = document.getElementById("kposter");
          cmct_mode = 2;
        }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
if (origin_site == 'CMCT') {
          raw_info.torrent_url = raw_info.torrent_url.replace(/&https=1/, '');
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
if (origin_site == 'CMCT') {
            tr = $('td:contains(标签)').first().parent();
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
if (origin_site == 'CMCT' || origin_site == 'NanYang' || origin_site == 'CHDBits') {
      raw_info.name = raw_info.name.replace(/\d\.\d\/10.*$/g, '');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 6) ---
if (origin_site != 'CMCT' || cmct_mode == 1) {
        if (origin_site != 'UHD' && origin_site != 'TTG') {
          document.getElementById('common_link').onclick = function () {
            var key;
            for (index in site_order) {
              key = site_order[index];
              if (used_common_sites.indexOf(key) > -1 && origin_site != key) {
                if (['PTP', 'KG', 'BTN', 'GPW', 'SC', 'avz', 'PHD', 'CNZ', 'ANT', 'NBL', 'HDCity'].indexOf(key) < 0) {
                  var site_href = document.getElementById(key).href;
                  window.open(site_href, '_blank');
                } else {
                  $(`#${key}`).click();
                }
              }
            }
          };
        }
      }

// --- From Module: 16_origin_site_parsing3.js (Snippet 7) ---
if (origin_site == 'CMCT' && cmct_mode == 2) {
      setTimeout(function () {
        raw_info.descr = '';
        raw_info.extra_text = '';
        try { raw_info.extra_text = walkDOM(document.getElementsByClassName('extra-text')[0].cloneNode(true)).trim(); } catch (Err) { }
        //海报和简介
        var img_address = document.getElementById("kposter").getElementsByTagName("img")[0].src;
        try {
          var descr_box = document.getElementsByClassName('info douban-info');
          var descr_node = descr_box[0].getElementsByTagName('artical')[0];
          descr_node = descr_node.cloneNode(true);
          raw_info.descr = walk_cmct(descr_node).trim().replace(/        ◎/, '◎');
          if (raw_info.extra_text) {
            raw_info.descr = raw_info.descr.replace(raw_info.extra_text, '');
          }
        } catch (err) { }
        raw_info.descr = '[img]' + img_address + '[/img]\n\n' + raw_info.descr + '\n\n';
        if (raw_info.extra_text) {
          raw_info.extra_text = raw_info.extra_text.includes('[quote]') ? raw_info.extra_text : '[quote]\n' + raw_info.extra_text + '\n[/quote]\n';
          raw_info.descr = raw_info.extra_text + '\n' + raw_info.descr;
        }
        try {
          var $html = $('td').filter('.douban_info').html();
          if ($html.match(/https:\/\/www.imdb.com\/title\/tt\d+/)) {
            raw_info.url = $html.match(/https:\/\/www.imdb.com\/title\/tt\d+/)[0];
            var imdbid = raw_info.url.match(/tt\d+/i)[0];
            var imdbno = imdbid.substring(2);
            var container = $('#forward_r');
            add_search_urls(container, imdbid, imdbno, search_name, 0);
          }
        } catch (err) { }
        //mediainfo——短
        try {
          var mediainfo = document.getElementsByClassName("codemain")[0];
          mediainfo = domToString(mediainfo.cloneNode(true));
          mediainfo = mediainfo.replace(/(<div class="codemain">|<\/div>)/g, '');
          mediainfo = mediainfo.replace(/<br>/g, '\n');
          // raw_info.descr += '[quote]' + mediainfo + '[/quote]\n\n';
        } catch (err) {
          console.log('获取mediainfo失败：' + err);
        }

        try {
          var mediainfo1 = document.getElementsByClassName("codemain")[1];
          mediainfo1 = domToString(mediainfo1.cloneNode(true));
          mediainfo1 = mediainfo1.replace(/(<div class="codemain">|<\/div>)/g, '');
          mediainfo1 = mediainfo1.replace(/<br>/g, '\n');
          raw_info.full_mediainfo = mediainfo1;
          raw_info.descr += '[quote]' + mediainfo1 + '[/quote]\n\n';
        } catch (err) { }

        //截图
        var screenshot = document.getElementsByClassName("screenshots-container");
        for (i = 0; i < screenshot.length; i++) {
          var img = screenshot[i].getElementsByTagName("img");
          for (j = 0; j < img.length; j++) {
            if (img[j] && img[j].src.search(/detail/i) < 0) {
              raw_info.descr = raw_info.descr + '[img]' + img[j].src + '[/img]\n';
            }
          }
        }
        raw_info.descr = add_thanks(raw_info.descr);
      }, 1000);
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 8) ---
else if (origin_site == 'CMCT' && $('span:contains("禁转")').length) {
      if_exclusive = true;
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 9) ---
if (this.id == "影" && ['CMCT', 'TTG', 'UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) < 0) {
          info = if_ying_allowed();
          if (info.length) {
            if (!confirm(`转发该资源可能违反站点以下规则:\n${info.join('\n')}\n具体细节请查看站点规则页面。\n是否仍继续发布？`)) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 10) ---
else if (origin_site == 'CMCT' && cmct_mode == 2) {
      $('.forward_a').click(function (e) {
        e.preventDefault();
        if (if_exclusive && search_mode) {
          return;
        }
        if (search_mode == 0) {
          window.open(this.href, '_blank');
          return;
        }
        var _id = this.id;
        var _href = this.href;
        re_forward(_id, _href, raw_info);
      });
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
if (forward_site == "CMCT") {
        upload_site = upload_site.replace('upload.php', 'upload.php?offer=1');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
if (['NanYang', 'CMCT', 'iTS', 'NPUPT', 'xthor'].indexOf(forward_site) > -1) {
          allinput[i].value = raw_info.name.replace(/\s/g, ".");
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 13) ---
if (forward_site == 'CMCT') {
          allinput[i].value = raw_info.small_descr.replace('【', '[').replace('】', ']');
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 14) ---
if (forward_site == 'CMCT') {
          if (raw_info.dburl) {
            allinput[i].value = raw_info.dburl;
          } else {
            allinput[i].value = raw_info.url;
          }
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
case 'CMCT':
          if (labels.zz) { document.getElementById('subtitlezh').checked = true; }
          if (!labels.diy && raw_info.descr.match(/mpls/i)) { document.getElementById('untouched').checked = true; }
          if (labels.hdr10) { document.getElementById('hdr10').checked = true; }
          if (labels.hdr10plus) { document.getElementById('hdr10plus').checked = true; }
          if (raw_info.descr.match(/HDR Vivid/)) { document.getElementById('hdrvivid').checked = true; }
          if (raw_info.small_descr.match(/特效字幕/)) { document.getElementById('subtitlesp').checked = true; }
          if (labels.db) { document.getElementById('dovi').checked = true; }
          if (raw_info.name.match(/(\.| )3D(\.| )/)) { document.getElementById('3d').checked = true; }
          if (raw_info.name.match(/HLG/)) { document.getElementById('hlg').checked = true; }
          if (labels.complete) { document.getElementById('pack').checked = true; }
          break;

// --- From Module: 18_forward_site_filling2.js (Snippet 17) ---
else if (forward_site == 'CMCT') {
      var browsecat = $('#browsecat');
      var type_dict = {
        '电影': 501, '剧集': 502, '综艺': 505, '音乐': 508, '纪录': 503, '有声小说': 510,
        '体育': 506, '软件': 509, '学习': 509, '': 509, 'MV': 507, '书籍': 509
      };
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }
      if (raw_info.type == '动漫') {
        $('#animation').attr('checked', true);
        if (raw_info.name.match(/S\d+|E\d+/i)) {
          browsecat.val(502);
        } else {
          browsecat.val(501);
        }
      }

      if (raw_info.type == '剧集' || raw_info.type == '动漫') {
        if (raw_info.name.match(/S\d+[^E]/i)) {
          $('input[name="pack"]').attr('checked', true);
        }
      }

      var medium_box = $('select[name="medium_sel"]');
      medium_box.val(99);
      switch (raw_info.medium_sel) {
        case 'UHD': case 'Blu-ray': medium_box.val(1); break;
        case 'Remux': medium_box.val(4); break;
        case 'HDTV': medium_box.val(5); break;
        case 'WEB-DL':
          if (raw_info.name.match(/webrip/i)) {
            medium_box.val(8);
          } else {
            medium_box.val(7);
          }
          break;
        case 'Encode': medium_box.val(6); break;
        case 'DVD':
          if (raw_info.name.match(/dvdrip/i)) {
            medium_box.val(10);
          } else {
            medium_box.val(3);
          }
          break;
        case 'CD': medium_box.val(11);
      }
      var codec_box = $('select[name="codec_sel"]');
      codec_box.val(99);
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(1); break;
        case 'H264': case 'X264': codec_box.val(2); break;
        case 'VC-1': codec_box.val(3); break;
        case 'MPEG-2': codec_box.val(4); break;
        case 'AV1': codec_box.val(5); break;
      }

      var audiocodec_box = $('select[name="audiocodec_sel"]');
      audiocodec_box.val(99);
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HD': case 'DTS-HDMA:X 7.1': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(1); break;
        case 'TrueHD': case 'Atmos': audiocodec_box.val(2); break;
        case 'LPCM': audiocodec_box.val(6); break;
        case 'DTS': audiocodec_box.val(3); break;
        case 'AC3':
          audiocodec_box.val(4);
          if (raw_info.name.match(/DD[\+p]/)) {
            audiocodec_box.val(11);
          }
          break;
        case 'AAC': audiocodec_box.val(5); break;
        case 'Flac': audiocodec_box.val(7); break;
        case 'APE': audiocodec_box.val(8); break;
        case 'WAV': audiocodec_box.val(9);
      }
      var standard_box = $('select[name="standard_sel"]');
      var standard_dict = {
        '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 0
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }

      var source_box = $('select[name="source_sel"]');
      var source_dict = {
        '欧美': 4, '大陆': 1, '香港': 2, '台湾': 3, '日本': 5, '韩国': 6,
        '印度': 7, '泰国': 9, '': 99
      };
      source_box.val(99);
      if (source_dict.hasOwnProperty(raw_info.source_sel)) {
        var index = source_dict[raw_info.source_sel];
        source_box.val(index);
      }

      if (raw_info.descr.match(/◎(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地).*(俄罗斯|苏联)/)) {
        source_box.val(8);
      }
      descr_box[0].style.height = '120px';
      descr_box[1].style.height = '500px';

      var info = get_mediainfo_picture_from_descr(raw_info.descr);
      var cmctinfos = info.mediainfo;
      var cmctimgs = info.pic_info;
      var pic_str = raw_info.imgs_cmct ? raw_info.imgs_cmct : cmctimgs;
      get_full_size_picture_urls(null, pic_str, $('#url_vimages'), false);

      //获取简介
      cmctdescr = raw_info.descr.slice(0, raw_info.descr.search(/\[quote\]/));
      cmctdescr = cmctdescr.replace(/\[img\]htt.*[\s\S]*?img\]/i, '');

      if (raw_info.full_mediainfo) {
        descr_box[1].value = raw_info.full_mediainfo.trim();
      } else if (raw_info.mediainfo_cmct) {
        descr_box[1].value = raw_info.mediainfo_cmct.trim();
      } else {
        descr_box[1].value = cmctinfos.trim();
      }
      if (descr_box[1].value.indexOf('ReportBy') > 0) {
        descr_box[1].value = descr_box[1].value.substring(0, descr_box[1].value.indexOf('ReportBy'));
      }
      if (descr_box[1].value.indexOf('Report created by') > 0) {
        descr_box[1].value = descr_box[1].value.substring(0, descr_box[1].value.indexOf('Report created by'));
      }
      descr_box[2].value = raw_info.descr;
      var clear = document.createElement('input');
      clear.type = 'button';
      clear.value = " 清空附加信息 ";
      clear.id = 'clear';
      document.getElementById('qr').parentNode.insertBefore(clear, document.getElementById('qr'));
      $('#clear').css({ 'color': 'white', 'background-color': 'red', 'height': '22px' });

      $('#clear').click(function () {
        descr_box[2].value = '';
        descr_box[2].style.height = '200px';
      });
    }

