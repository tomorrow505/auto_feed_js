/** Consolidated Logic for: HHClub **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (origin_site == 'HHClub') {
      function get_next_text(label, label_str) {
        $(`div[class="font-bold leading-6"]`).map((index, e) => {
          if ($(e).text() == label_str) {
            raw_info[label] = $(e).next().text();
          }
        });
      }
      function add_douban(tbody) {
        var index = no_need_douban_button_sites.indexOf('HHClub');
        if (index > -1) {
          no_need_douban_button_sites.splice(index, 1);
        }
        search_row = tbody.insertRow(0);
        douban_button_needed = true;
      }
      get_next_text('name', '标题');
      get_next_text('small_descr', '副标题');
      var info = $('div:contains(基本信息):last').next().text();
      raw_info.type = info.get_type();
      raw_info.medium_sel = info.medium_sel();
      raw_info.codec_sel = info.codec_sel();
      raw_info.audiocodec_sel = info.audiocodec_sel();
      $('div:contains(副标题):last').next().after(`
                <div class="font-bold leading-6">转载</div>
                <div class="font-bold leading-6">
                    <table id="mytable" border=none;>
                    </table>
                </div>
            `);
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);
      try {
        if ($('div:contains(其他信息):last').length) {
          var div_descr = $('div:contains(其他信息):last').parent().next()[0];
          raw_info.descr = walkDOM(div_descr.cloneNode(true)).trim();
        }
        if ($('#mediainfo-raw').length) {
          raw_info.descr = raw_info.descr + '[quote]\n' + $('#mediainfo-raw').find('code').text() + '\n[/quote]\n';
          console.log(raw_info.descr);
        }
        if ($('div.nexus-media-info-raw').length) {
          raw_info.descr = raw_info.descr + '[quote]\n' + $('div.nexus-media-info-raw').find('code').text() + '\n[/quote]\n';
          console.log(raw_info.descr)
        }
        if (!raw_info.descr.match(/◎简.*?介/)) {
          add_douban(tbody);
        }
      } catch (err) { }
      try {
        var screen = $('#screenshot-content')[0];
        raw_info.descr = '\n' + walkDOM(screen.cloneNode(true));
      } catch (err) { }
      try {
        raw_info.url = match_link('imdb', $('#kimdb').html());
      } catch (err) { }
      try {
        raw_info.dburl = match_link('douban', $('#douban_info-content').parent().html());
      } catch (err) { }
      raw_info.torrent_url = $('a:contains("点击复制"):last').attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
if (origin_site == 'HHClub') {
            tr = $('div:contains(标签)').last().next();
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 3) ---
if (['PTP', 'MTV', 'UHD', 'HDF', 'RED', 'BTN', 'jpop', 'GPW', 'HD-Only', 'SC', 'ANT', 'lztr', 'DICMusic', 'OPS', 'TVV', 'SugoiMusic', 'HHClub'].indexOf(origin_site) > -1) {
      forward_r = insert_row.insertCell(0);
      forward_r.colSpan = "5";
      forward_r.style.paddingLeft = '12px'; forward_r.style.paddingTop = '10px';
      forward_r.style.paddingBottom = '10px';
      if (origin_site != 'HHClub' || no_need_douban_button_sites.indexOf('HHClub') < 0) {
        forward_l = search_row.insertCell(0);
        forward_l.colSpan = "5";
      } else {
        forward_r.style.paddingLeft = '0px';
        forward_r.style.paddingTop = '0px';
        forward_r.style.paddingRight = '60px';
        forward_r.style.border = 'none';
      }
      if (origin_site == 'MTV') { forward_r.colSpan = "6"; forward_l.colSpan = "6"; }
      if (no_need_douban_button_sites.indexOf(origin_site) < 0) {
        init_buttons_for_transfer(forward_l, origin_site, 1, raw_info);
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
if (origin_site != 'HHClub' || no_need_douban_button_sites.indexOf('HHClub') < 0) {
        forward_l = search_row.insertCell(0);
        forward_l.colSpan = "5";
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == 'HHClub' && douban_button_needed) {
      $(tbody).find('td').css('border', 'none');
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 6) ---
else if (origin_site == 'HHClub' && $('span:contains("禁转")').is(':visible')) {
      if_exclusive = true;
    }

