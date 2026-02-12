/** Consolidated Logic for: TJUPT **/

// --- From Module: 15_origin_site_parsing2.js (Snippet 1) ---
if (tds[i].innerHTML == '详细信息' && origin_site == 'TJUPT') {
        if (tds[i + 1].innerHTML.match(/英文名:(.*)/i)) {
          raw_info.name = tds[i + 1].innerHTML.match(/英文名:<\/b>(.*?)(&nbsp|<br>)/i)[1];
        }
        raw_info.fullname = $('h1').text();
        if (tds[i + 1].innerHTML.match(/动漫文件格式:(.*)/i)) {
          var type = tds[i + 1].innerHTML.match(/动漫类别:<\/b>(.*?)<br>/i)[1];
          raw_info.name += type == '剧场' ? ' MOVIE' : ' ' + type;

          if (tds[i + 1].innerHTML.match(/动漫集数:(.*)/i)) {
            raw_info.name += ' ' + tds[i + 1].innerHTML.match(/动漫集数:<\/b>(.*?)<br>/i)[1].replace(type, '').replace('连载', '');
          }
          var format = tds[i + 1].innerHTML.match(/动漫文件格式:<\/b>(.*?)<br>/i)[1];
          var standard = tds[i + 1].innerHTML.match(/画面分辨率:<\/b>(.*?)<br>/i)[1];
          var team = tds[i + 1].innerHTML.match(/字幕组\/漫画作者\/专辑艺术家:<\/b>(.*?)<br>/i)[1];
          if (format.match(/BDRip|TVRip|DVDRip|BDMV|DVDISO|HQ-HDTVRip|HDTVRip/i)) {
            raw_info.name += ' ' + format.match(/BDrip|TVRip|DVDRip|BDMV|DVDISO|HQ-HDTVRip|HDTVRip/i)[0];
          }
          raw_info.name += ' ' + standard;
          if ((format + raw_info.descr).match(/x264|x265|h.?264|h.265|hevc/i)) {
            raw_info.name += ' ' + (format + raw_info.descr).match(/x264|x265|h.?264|h.265|hevc|AVC/i)[0];
          }
          if ((format + raw_info.descr).match(/FLAC|AAC|AC3|DTS/i)) {
            raw_info.name += ' ' + (format + raw_info.descr).match(/FLAC|AAC|AC3|DTS|LPCM/i)[0];
          }
          raw_info.name += team.trim() ? '-' + team.replace(/&amp;/, '&') : '';
          try {
            var region = tds[i + 1].innerHTML.match(/动漫国别:<\/b>(.*?)<br>/i)[1];
            if (region == '日漫') { raw_info.source_sel = '日本' }
            if (region == '美漫') { raw_info.source_sel = '欧美' }
            if (region == '国产') { raw_info.source_sel = '大陆' }
          } catch (err) { }
          var c_name = tds[i + 1].innerHTML.match(/中文名:<\/b>(.*?)(&nbsp|<br>)/i)[1];
          raw_info.small_descr += c_name + ' | ';
        }
        raw_info.torrentName = $('#bookmark0').parent().find('a:first').text();
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
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

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
if (origin_site == 'TJUPT') {
        forward_r.style.border = "2px solid #FFFFFF";
      }

// --- From Module: 16_origin_site_parsing3.js (Snippet 4) ---
else if (origin_site == 'TJUPT' && ($('#tag').find('.tag-exclusive').length)) {
      if_exclusive = true;
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 5) ---
if (this.id == "影" && ['CMCT', 'TTG', 'UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) < 0) {
          info = if_ying_allowed();
          if (info.length) {
            if (!confirm(`转发该资源可能违反站点以下规则:\n${info.join('\n')}\n具体细节请查看站点规则页面。\n是否仍继续发布？`)) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 6) ---
if (['UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) > -1) {
      $('.forward_a').click(function (e) {
        if (['KG', 'PTP', 'HDCity', 'BTN', 'GPW', 'common_link', 'SC', 'avz', 'PHD', 'CNZ', 'TVV', 'ANT', 'NBL', 'CarPt'].indexOf(this.id) > -1) {
          return;
        }
        e.preventDefault();
        if (if_exclusive && search_mode) {
          return;
        }
        if (search_mode == 0) {
          window.open(this.href, '_blank');
          return;
        }
        if (origin_site == 'UHD' && uhd_lack_descr) {
          var tmp_name = raw_info.descr.match(/movie name.*?:(.*)/i);
          if (tmp_name && !raw_info.name) {
            raw_info.name = tmp_name[1].trim();
            if (check_descr(raw_info.descr)) {
              tmp_name = document.getElementsByClassName('imovie_title')[0].textContent.replace(/\(|\)/g, '').trim();
              raw_info.name = get_bluray_name_from_descr(raw_info.descr, tmp_name);
            }
          }
          raw_info.name = deal_with_title(raw_info.name);
          if (raw_info.name.match(/S\d{2,3}/i)) {
            raw_info.type = '剧集';
          } else {
            raw_info.type = '电影';
          }
          uhd_lack_descr = false;
        }
        if (origin_site == 'TJUPT' || origin_site == 'PTsbao') {
          if (raw_info.type == '动漫') {
            raw_info.animate_info = document.getElementById('top').textContent;
          }
          descr = document.getElementById("kdescr");
          descr = descr.cloneNode(true);
          try {
            var codetop = descr.getElementsByClassName('codetop');
            Array.from(codetop).map((e, index) => {
              try { descr.removeChild(e); } catch (err) { e.parentNode.removeChild(e) }
            });
          } catch (err) {
            console.log(err);
          }
          raw_info.descr = '';
          raw_info.descr = walkDOM(descr);
          raw_info.descr = raw_info.descr.replace(/站外链接 :: /ig, '');
          if (raw_info.descr.match(/Infinity-1.2s-64px.svg/)) {
            if (!confirm('图片可能加载不完全，是否仍继续转载？')) {
              e.preventDefault();
              return;
            }
          }
        }

        var _id = this.id;
        var _href = this.href;
        re_forward(_id, _href, raw_info);
      });
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 7) ---
if (origin_site == 'TJUPT' || origin_site == 'PTsbao') {
          if (raw_info.type == '动漫') {
            raw_info.animate_info = document.getElementById('top').textContent;
          }
          descr = document.getElementById("kdescr");
          descr = descr.cloneNode(true);
          try {
            var codetop = descr.getElementsByClassName('codetop');
            Array.from(codetop).map((e, index) => {
              try { descr.removeChild(e); } catch (err) { e.parentNode.removeChild(e) }
            });
          } catch (err) {
            console.log(err);
          }
          raw_info.descr = '';
          raw_info.descr = walkDOM(descr);
          raw_info.descr = raw_info.descr.replace(/站外链接 :: /ig, '');
          if (raw_info.descr.match(/Infinity-1.2s-64px.svg/)) {
            if (!confirm('图片可能加载不完全，是否仍继续转载？')) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 8) ---
else if (origin_site == 'TJUPT' || origin_site == 'PTsbao') {
        descr = document.getElementById("kdescr");
        descr = descr.cloneNode(true);
        raw_info.descr = '';
        raw_info.descr = walkDOM(descr);
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 9) ---
else if (raw_info.type == '电影' && ['HUDBT', 'MTeam', 'TLFbits', 'PuTao', 'TJUPT', 'NanYang', 'BYR', 'TTG'].indexOf(forward_site) < 0) {
        raw_info.type = '动漫';
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 10) ---
if (['TJUPT'].indexOf(forward_site) > -1 && allinput[i].name == 'external_url') {
        allinput[i].value = raw_info.url ? raw_info.url : raw_info.dburl;
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
else if (forward_site == 'Audiences' || forward_site == 'TJUPT' || forward_site == 'NexusHD') {
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

// --- From Module: 17_forward_site_filling1.js (Snippet 12) ---
if (forward_site == 'TJUPT') {
                  ee = ee.replace('[Mediainfo]', '[mediainfo]').replace('[/Mediainfo]', '[/mediainfo]');
                }

// --- From Module: 19_forward_site_filling3.js (Snippet 13) ---
else if (forward_site == 'TJUPT') {
      try {
        switch (raw_info.type) {
          case '电影': set_selected_option_by_value('browsecat', '401'); break;
          case '剧集': set_selected_option_by_value('browsecat', '402'); break;
          case '纪录': set_selected_option_by_value('browsecat', '411'); break;
          case '动漫': set_selected_option_by_value('browsecat', '405'); break;
          case '综艺': set_selected_option_by_value('browsecat', '403'); break;
          case '学习': set_selected_option_by_value('browsecat', '404'); break;
          case '音乐': case 'MV': set_selected_option_by_value('browsecat', '406'); break;
          case '体育': set_selected_option_by_value('browsecat', '407'); break;
          case '软件': set_selected_option_by_value('browsecat', '408'); break;
          default:
            set_selected_option_by_value('browsecat', '410');
        }
        //ipad的简单判定
        if (raw_info.name.match(/(pad$|ipad)/i)) {
          set_selected_option_by_value('browsecat', '412');
        }
        getcategory('class2', 'browsecat');
        setTimeout(function () {
          //中文译名填写
          try {
            if (raw_info.source_sel == '大陆') {
              vidoename = raw_info.descr.match(/片.*?名([^\r\n]+)/)[1];
            } else {
              vidoename = raw_info.descr.match(/译.*?名([^\r\n]+)/)[1];
            }
            videoname = vidoename.trim(); //去除首尾空格
            cname_box = document.getElementById('cname');
            cname_box.value = videoname.split('/')[0].trim();
          } catch (Err) { }

          //英文名填写
          ename_box = document.getElementById('ename');
          ename_box.value = raw_info.name.replace(/\s+/ig, '.');

          //地区填写，针对电影
          if (raw_info.type == '电影' || raw_info.type == '综艺') {
            district_box = document.getElementById('district');
            district = raw_info.descr.match(/(地.{0,5}?区|国.{0,5}?家|产.{0,5}?地|產.{0,5}?地)([^\r\n]+)/);
            if (district) {
              district = district[2];
              district = district.trim().replace(/ /g, ''); //去除首尾空格
              district_box.value = district;
            }
            else {
              district_box.value = raw_info.source_sel;
            }
          }

          //剧集类型，针对剧集
          if (raw_info.type == '剧集') {
            switch (raw_info.source_sel) {
              case '大陆': $('#specificcat1').attr('checked', 'true'); break;
              case '台湾': case '香港': case '港台': $('#specificcat2').attr('checked', 'true'); break;
              case '日本': $('#specificcat4').attr('checked', 'true'); break;
              case '韩国': $('#specificcat5').attr('checked', 'true'); break;
              case '欧美':
                var reg_region = raw_info.descr.match(/(地.{0,5}?区|国.{0,5}?家|产.{0,5}?地|產.{0,5}?地)([^\r\n]+)/);
                if (reg_region && reg_region[2].trim().match(/^英国/)) {
                  $('#specificcat6').attr('checked', 'true');
                } else {
                  $('#specificcat3').attr('checked', 'true');
                }
                break;
              default:
                $('#specificcat').val(raw_info.source_sel); break;
            }
            getcheckboxvalue('specificcat', 7);
            if (!$('#specificcat').val()) {
              $('#specificcat').val(raw_info.source_sel + '剧');
            }
          }
          if (raw_info.type == '综艺') {
            if (labels.zz) {
              document.getElementsByName('subsinfo')[0].options[2].selected = true;
            }
            //语言
            language = raw_info.descr.match(/语.{0,5}?言([^\r\n]+)/);
            if (language) {
              language = language[1];
              language = language.trim(); //去除首尾空格
              language_box = document.getElementById('language');
              language_box.value = language;
            }
          }

          if (raw_info.type == '纪录') {
            var format_box = document.getElementById('format');
            if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i') {
              $('#format1').attr('checked', true);
            } else if (raw_info.standard_sel == '720p') {
              $('#format2').attr('checked', true);
            } else {
              if (raw_info.name.match(/BDRIP/i)) {
                $('#format3').attr('checked', true);
              } else if (raw_info.name.match(/DVDRIP/i)) {
                $('#format4').attr('checked', true);
              } else if (raw_info.name.match(/TVRIP/i)) {
                $('#format5').attr('checked', true);
              }
            }
            if (labels.zz) {
              document.getElementsByName('subsinfo')[0].options[2].selected = true;
            }

            language = raw_info.descr.match(/语.{0,5}?言([^\r\n]+)/);
            if (language) {
              language = language[1];
              language = language.trim();
              language_box = document.getElementById('language');
              language_box.value = language;
            }
          }

        }, 3000);
      } catch (err) {
        alert(err);
      }
    }

