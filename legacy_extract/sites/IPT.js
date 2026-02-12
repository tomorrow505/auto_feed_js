/** Consolidated Logic for: IPT **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (origin_site == 'IPT') {
      if ($('#media').length) {
        $('#media').prepend(`
                    <div style="padding-left:55px; padding-right:55px">
                        <table id="mytable">
                        </table>
                    </div>
                `);
      } else {
        $('div.info').after(`<br>
                    <div style="padding-left:90px; padding-right:90px">
                        <table id="mytable">
                        </table>
                    </div>
                `);
      }
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);
      try {
        raw_info.url = match_link('imdb', $('.des').has('blockquote').text());
        if (!raw_info.url) {
          raw_info.url = match_link('imdb', $('#media').html());
        }
      } catch (err) { }
      raw_info.type = $('div.tags').text().get_type();
      var descr = $('.des').has('blockquote')[0];
      raw_info.descr = walkDOM(descr.cloneNode(true));

      if (all_sites_show_douban && raw_info.url) {
        getData(raw_info.url, function (data) {
          if (data.data) {
            $('td:contains(豆瓣信息)').last().parent().before(`<tr><td colSpan="2" id="douban_info"></td></tr>`);
            add_douban_info_table($('#douban_info'), 150, data);
            $('#douban_info').find('th').css({ "color": "white" });
            $('#douban_info').find('h3').hide();
          }
        });
      }
      raw_info.name = $('h1').text();
      raw_info.torrent_url = 'https://iptorrents.com/' + $('a[href*="download.php"]').attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
if (origin_site == 'NBL' || origin_site == 'IPT' || origin_site == 'torrentseeds' || origin_site == 'HONE') {
          box_left.style.width = '60px';
        }

