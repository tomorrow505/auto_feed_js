/** Consolidated Logic for: ZHUQUE **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https:\/\/zhuque.in\//)) {
  mutation_observer(document, function () {
    if ($('div.ant-message-notice:contains("欢迎回来")').length && $('div.ant-message-notice:contains("欢迎回来")').is(":visible")) {
      $('div.ant-message-notice:contains("欢迎回来")').hide();
    }
    if ($('div.ant-message-notice:contains("有新的")').length && $('div.ant-message-notice:contains("有新的")').is(":visible")) {
      $('div.ant-message-notice:contains("有新的")').hide();
    }
    if ($('div.banner').length == 2 && $('div.banner:last').is(":visible")) {
      $('div.banner:last').hide();
    }
  });
}

// --- From Module: 07_dom_walkers.js (Snippet 2) ---
if (site_url.match(/^https:\/\/zhuque.in\/torrent\/(info|list)\/\d+/)) {
    return 1;
  }

// --- From Module: 09_data_processing.js (Snippet 3) ---
if (site == 'ZHUQUE') {
    var brDiv = document.createElement('br');
    container.appendChild(brDiv);
  }

// --- From Module: 11_download_clients.js (Snippet 4) ---
else if (forward_site == 'ZHUQUE') {
    $('#form_item_torrent').wait(function () {
      $('input[id=form_item_torrent]')[0].files = container.files;
      $('#form_item_torrent')[0].dispatchEvent(evt);
      $('#form_item_title').val(raw_info.name);
      $('#form_item_title')[0].dispatchEvent(evt);
    });
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 5) ---
if (site_url.match(/^https:\/\/zhuque.in\/torrent\/list\/\d+/)) {
    if (!$('div.markdown').length) {
      return;
    }
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 6) ---
if (origin_site == 'ZHUQUE') {

      raw_info.name = $('div.ant-card-body:eq(0)').find('span:first').text();
      raw_info.small_descr = $('div.ant-card-body:eq(0)').find('span:eq(1)').text();
      var info = $('div.ant-card-body:eq(0)').text();
      raw_info.type = info.get_type();
      raw_info.url = match_link('imdb', $('body').html());

      raw_info.torrent_url = 'https://zhuque.in' + $('a[href*="/api/torrent/download/"]').attr('href');

      if ($('div.ant-collapse-content-box').length < 2) {
        $('div.ant-collapse-header:eq(1)').click();
        $('div.ant-collapse-header:eq(1)').click();
      }
      $('div.ant-collapse-content-box:eq(1)').wait(function () {
        var mediainfo = $('div.ant-collapse-content-box:eq(1)').find('span:eq(0)').text();
        raw_info.descr += `[quote]\n${mediainfo.trim()}\n[/quote]\n\n`;

        $('div.ant-card-body:eq(2)').find('img').map((index, e) => {
          raw_info.descr += `[img]${$(e).attr('src')}[/img]\n`;
        });
        $('#forward_r').wait(function () {
          reBuildHref(raw_info, $('#forward_r')[0]);
        });
      });

      $('div.ant-card-body:eq(0)').parent().after(`
                <div class="ant-row ant-form-item" data-v-0e4c1106="" style="row-gap: 0px;">
                    <div class="ant-col ant-col-21 ant-form-item-control">
                        <div class="ant-form-item-control-input">
                            <div class="ant-form-item-control-input-content">
                                <table id="mytable" style="background-color: #F1FAFA; margin-left:10%; margin-top:3%"></table>
                            </div><!---->
                        </div><!----><!---->
                    </div>
                </div>`
      );
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
if (origin_site == 'ZHUQUE') {
          forward_l.innerHTML = " ";
          box_left.innerHTML = ' ';
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 8) ---
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

// --- From Module: 18_forward_site_filling2.js (Snippet 9) ---
else if (forward_site == 'ZHUQUE') {
      $('#form_item_subtitle').wait(function () {
        var i_evt = new Event("input");

        // 标题
        $('#form_item_title').val(raw_info.name);
        $('#form_item_title')[0].dispatchEvent(i_evt);
        // 副标题
        $('#form_item_subtitle').val(raw_info.small_descr);
        $('#form_item_subtitle')[0].dispatchEvent(i_evt);

        if (raw_info.url) {
          $('input[placeholder="tt123456"]').val(raw_info.url.match(/tt\d+/)[0]);
          $('input[placeholder="tt123456"]')[0].dispatchEvent(i_evt);
          $('.ant-space-item').has('button').find('button').click();
        }

        function trigger_select(tid, value, time, order) {
          if (time === undefined) {
            time = 1000;
          }
          $(`#${tid}`)[0].dispatchEvent(i_evt);
          setTimeout(function () {
            if (value !== 'Other') {
              $(`div.ant-select-item-option-content:contains("${value}")`).wait(function () {
                if (value == 'Blu-ray') {
                  $(`div.ant-select-item-option-content:contains("${value}"):eq(2)`).click();
                } else if (value == 'UHD Blu-ray') {
                  $(`div.ant-select-item-option-content:contains("${value}"):eq(0)`).click();
                } else {
                  $(`div.ant-select-item-option-content:contains("${value}")`).click();
                }
              });
            } else {
              $(`div.ant-select-item-option-content:contains("${value}"):eq(${order - 1})`).click();
            }
          }, time);
        }

        // 类别
        var type_dict = {
          '电影': '电影', '剧集': '剧集', '动漫': '动画', '综艺': '节目', '音乐': '其它', '纪录': '其它',
          '体育': '其它', '软件': '其它', '学习': '其它', '': '其它', 'MV': '其它', '书籍': '其它'
        };
        if (type_dict.hasOwnProperty(raw_info.type)) {
          var category = type_dict[raw_info.type];
          trigger_select('form_item_category', category, 1000, 0);
        }

        // 媒介
        var medium_sel = 'Encode';
        switch (raw_info.medium_sel) {
          case 'UHD':
            if (raw_info.name.match(/DIY|@/i)) {
              medium_sel = 'UHD Blu-ray DIY';
            } else {
              medium_sel = 'UHD Blu-ray';
            }
            break;
          case 'Blu-ray':
            if (raw_info.name.match(/DIY|@/i)) {
              medium_sel = 'Blu-ray DIY';
            } else {
              medium_sel = 'Blu-ray';
            }
            break;
          case 'DVD': medium_sel = 'Other';
          case 'Remux': case 'HDTV': case 'Encode': case 'WEB-DL':
            medium_sel = raw_info.medium_sel;
        }
        if (raw_info.name.match(/HDTV/) && raw_info.standard_sel == '4K') {
          medium_sel = 'UHDTV';
        }
        trigger_select('rc_select_1', medium_sel, 1100, 1);

        // 格式
        var codec = 'Other';
        switch (raw_info.codec_sel) {
          case 'H265': codec = 'H265'; break;
          case 'H264': codec = 'H264'; break;
          case 'X265': case 'X264': codec = raw_info.codec_sel.toLowerCase();
        }
        trigger_select('rc_select_2', codec, 1200, 2);

        //分辨率
        var standard = 'Other';
        var standard_dict = {
          '4K': '2160p', '1080p': '1080p', '1080i': '1080i', '720p': '720p', 'SD': 'Other'
        };
        if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
          standard = standard_dict[raw_info.standard_sel];
        }
        trigger_select('rc_select_3', standard, 1400, 3);

        $("#form_item_mediainfo")[0].addEventListener("input", (e) => {
          if (e.myself) return true; //判断是否是伪造的事件
          e.stopPropagation(); //阻止事件传播
          return false;
        }, true);

        $("#form_item_screenshot")[0].addEventListener("input", (e) => {
          if (e.myself) return true;
          e.stopPropagation();
          return false;
        }, true);

        try {
          var infos = get_mediainfo_picture_from_descr(raw_info.descr);
          setTimeout(function () {
            try {
              var container = $('#form_item_mediainfo');
              if (raw_info.full_mediainfo) {
                container.val(raw_info.full_mediainfo.trim());
              } else {
                container.val(infos.mediainfo.trim());
              }
            } catch (Err) {
              if (raw_info.full_mediainfo) {
                $('#form_item_mediainfo').val(raw_info.full_mediainfo);
              } else {
                $('#form_item_mediainfo').val(raw_info.descr);
              }
            }
            let em = new Event("input");
            em.myself = true;
            $('#form_item_mediainfo')[0].dispatchEvent(em);
          }, 100);

          setTimeout(function () {
            try {
              get_full_size_picture_urls(null, infos.pic_info, $('#form_item_screenshot'), false);
              let es = new Event("input");
              es.myself = true;
              $('#form_item_screenshot')[0].dispatchEvent(es);
            } catch (err) { }
          }, 100);
        } catch (Err) { }

        setTimeout(function () {
          addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, null);
        }, 200);

        var note = '';
        if (raw_info.descr.match(/blue\](.*?，感谢原制作者发布。)/i)) {
          note += raw_info.descr.match(/blue\](.*?，感谢原制作者发布。)/i)[1];
        }
        if (raw_info.url) {
          note += `资源IMDB链接：${raw_info.url}`;
        }
        if (note) {
          $('#form_item_note').val(note);
          $('#form_item_note')[0].dispatchEvent(i_evt);
        }

        function check_zhuque_label(value, stime) {
          setTimeout(function () {
            $(`input[value="${value}"]`).parent().click();
          }, stime);
        }
        setTimeout(function () {
          if (labels.gy) { check_zhuque_label('603', 100); }
          if (labels.zz) { check_zhuque_label('604', 200); }
          if (labels.hdr10) { check_zhuque_label('613', 300); }
          if (labels.db) { check_zhuque_label('611', 400); }
          if (labels.hdr10plus) { check_zhuque_label('613', 500); }
          if (labels.complete) {
            check_zhuque_label('621', 700);
          } else if (raw_info.name.match(/E\d+/i)) {
            check_zhuque_label('622', 700);
          }
          if (raw_info.small_descr.match(/特效字幕/)) { check_zhuque_label('614', 600); }
        }, 1000);

        if (!if_uplver) {
          $('#form_item_anonymous').click();
        }
        $('#form_item_confirm').click();
      });
    }

// --- From Module: 23_final_handlers.js (Snippet 10) ---
if (origin_site == 'ZHUQUE' && site_url.match(/^https:\/\/zhuque.in\/torrent\/info\/\d+/)) {
  var executed = false;
  mutation_observer(document, function () {
    if ($('a[href*=download]').length && !executed) {
      setTimeout(auto_feed, sleep_time);
      executed = true;
    }
  })
}

// --- From Module: 23_final_handlers.js (Snippet 11) ---
else if (origin_site == 'ZHUQUE' && site_url.match(/^https:\/\/zhuque.in\/torrent\/list\/\d+/)) {
  mutation_observer(document, function () {
    if ($('div.markdown').length) {
      setTimeout(function () {
        if (!$('#mytable').length) {
          setTimeout(auto_feed, sleep_time);
        }
      }, 1000);

    }
  });
}

