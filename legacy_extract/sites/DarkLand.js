/** Consolidated Logic for: DarkLand **/

// --- From Module: 09_data_processing.js (Snippet 1) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX', 'IN'].indexOf(site) > -1) {
      $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "border": "1px solid #0D8ED9", "color": "#FFFFFF", "backgroundColor": "#292929" });
      if (site == 'HONE') {
        $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "width": "80px" })
      }
    }

// --- From Module: 09_data_processing.js (Snippet 2) ---
if (['PTP', 'xthor', 'HDF', 'BHD', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(site) > -1) {
    textarea.style.backgroundColor = '#4d5656';
    textarea.style.color = 'white';
    input_box.style.backgroundColor = '#4d5656';
    input_box.style.color = 'white';
  }

// --- From Module: 11_download_clients.js (Snippet 3) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDSpace', 'xthor', 'Monika', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX'].indexOf(forward_site) > -1) {
    $('#torrent')[0].files = container.files;
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 4) ---
if (origin_site == 'FNP' || origin_site == 'OnlyEncodes' || origin_site == 'DarkLand' || origin_site == 'ReelFliX') {
      raw_info.url = match_link('imdb', $('section.meta').html());
      raw_info.type = $('.torrent__tags').text().get_type();
      raw_info.name = $('h1.torrent__name').text().trim().match(/([\u4e00-\u9fa5]* )?(.*)/)[2];
      $('menu[class="torrent__buttons form__group--short-horizontal"]').after(`
                <section class="panelV2" style="padding-left:55px; padding-right:55px; padding-top:15px; padding-bottom:15px">
                    <table id="mytable">
                    </table>
                </section>
            `);
      tbody = $('#mytable')[0];
      insert_row = tbody.insertRow(0);
      douban_box = tbody.insertRow(0);
      raw_info.descr = `[quote]\n${$('code[x-ref="mediainfo"]').text()}\n[/quote]\n\n`;
      $('.panel__heading:contains("描述")').parent().next().find('img').map((index, e) => {
        if ($(e)[0].parentNode.href) {
          raw_info.descr += '[url=' + $(e)[0].parentNode.href + '][img]' + $(e)[0].src + '[/img][/url] ';
        } else {
          raw_info.descr += '[img]' + $(e)[0].src + '[/img] ';
        }
      });
      $('.panel__heading:contains("Description")').parent().next().find('img').map((index, e) => {
        if ($(e)[0].parentNode.href) {
          raw_info.descr += '[url=' + $(e)[0].parentNode.href + '][img]' + $(e)[0].src + '[/img][/url] ';
        } else {
          raw_info.descr += '[img]' + $(e)[0].src + '[/img] ';
        }
      });
      raw_info.descr = raw_info.descr.replace(/https:\/\/wsrv.nl\/\?n=-1&url=/g, '');
      raw_info.torrent_url = $('a[href*="download/"]').attr('href');
      if (raw_info.url && all_sites_show_douban && (origin_site == 'FNP' || origin_site == 'OnlyEncodes' || origin_site == 'ReelFliX')) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('h1.meta__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
            $('p.meta__description,span.movie-overview').text(data.data.summary.replace(/ 　　/g, ''));
          }
        });
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (['PHD', 'avz', 'CNZ', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'BHD', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'OMG'].indexOf(origin_site) > -1) {
          direct = "left";
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
else if (['IN', 'digitalcore', 'BlueBird', 'bwtorrents', 'HOU', 'BLU', 'Tik', 'Aither', 'DarkLand', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(origin_site) >= 0) {
          box_left.style.width = '80px';
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 7) ---
if (allinput[i].name == 'small_descr' || allinput[i].name == 'small_desc' || allinput[i].name == 'subhead' || (allinput[i].name == 'keywords' && forward_site == 'DarkLand')) { //填充副标题
        allinput[i].value = raw_info.small_descr;
        if (forward_site == 'OpenCD') {
          allinput[i].value = raw_info.small_descr.replace('- {自抓}', '');
        }
        if (forward_site == 'CMCT') {
          allinput[i].value = raw_info.small_descr.replace('【', '[').replace('】', ']');
        }
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
else if (['BLU', 'Tik', 'Aither', 'BHD', 'iTS', 'PTP', 'ACM', 'Monika', 'DarkLand'].indexOf(forward_site) < 0) {
      setTimeout(() => {
        try {
          document.getElementsByName('uplver')[0].checked = if_uplver;
        } catch (err) { }
      }, 1000)
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 10) ---
else if (['DarkLand', 'ACM', 'Monika', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(forward_site) > -1) {
        torrent_box.parentNode.innerHTML = '<label for="torrent" class="form__label">Torrent 文件</label><input class="upload-form-file form__file" type="file" accept=".torrent" name="torrent" id="torrent" required="">';
      }

// --- From Module: 21_additional_handlers1.js (Snippet 11) ---
else if (forward_site == 'DarkLand') {
      if (raw_info.type == '剧集' || raw_info.type == '综艺' || ((raw_info.type == '纪录' || raw_info.type == '动漫') && raw_info.descr.match(/集.*?数/))) {
        try { $('#season_number').val(parseInt(raw_info.name.match(/S(\d+)/i)[1])) } catch (err) { $('#season_number').val("1") }
        try { $('#episode_number').val(parseInt(raw_info.name.match(/E(\d+)/i)[1])) } catch (err) { $('#episode_number').val(0) }
      }
      $('#automal').val(0);
      var source_box = document.getElementsByName('type_id')[0];
      switch (raw_info.medium_sel) {
        case 'UHD': source_box.options[1].selected = true; break;
        case 'Blu-ray': source_box.options[1].selected = true; break;
        case 'Remux': source_box.options[2].selected = true; break;
        case 'HDTV': source_box.options[6].selected = true; break;
        case 'Encode': source_box.options[3].selected = true; break;
        case 'WEB-DL': source_box.options[4].selected = true;
      }
      if (raw_info.name.match(/webrip/i)) {
        source_box.options[5].selected = true;
      }

      //分辨率
      var standard_box = document.getElementsByName('resolution_id')[0];
      var standard_dict = { '4K': 2, '1080p': 3, '1080i': 4, '720p': 5, 'SD': 6, '': 10, '8K': 1 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.options[index].selected = true;
      }

      if (raw_info.standard_sel == 'SD') {
        $('input[name="sd"]:eq(0)').prop("checked", true);
      }

      if (raw_info.name.match(/576p/i)) {
        standard_box.options[6].selected = true;
      } else if (raw_info.name.match(/576i/i)) {
        standard_box.options[7].selected = true;
      } else if (raw_info.name.match(/480p/i)) {
        standard_box.options[8].selected = true;
      } else if (raw_info.name.match(/480i/i)) {
        standard_box.options[9].selected = true;
      }

      $('#apimatch').attr('disabled', false);
      function search_by_name(search_name) {
        var $div = $(`<div style="margin-top: 10px;"></div>`);
        var $table = $(`<table style="width: 100%" class="table table-condensed table-bordered table-striped table-hover"></table>`);
        $div.append($table);
        var search_url;
        if (raw_info.type == '剧集') {
          search_url = 'http://api.tmdb.org/3/search/tv?api_key={key}&language=zh-CN&query={name}&page=1&include_adult=true';
        } else if (raw_info.type == '电影') {
          search_url = 'http://api.tmdb.org/3/search/movie?api_key={key}&language=zh-CN&query={name}&page=1&include_adult=true';
        } else {
          search_url = 'http://api.tmdb.org/3/search/multi?api_key={key}&language=zh-CN&query={name}&page=1&include_adult=true';
        }
        search_url = search_url.format({ 'key': used_tmdb_key, 'name': search_name.trim().replace(/ /g, '+') });
        console.log(search_url);

        function compare(date) {
          return function (obj1, obj2) {
            try { var value1 = obj1[date].split('-')[0] + obj1[date].split('-')[1] + obj1[date].split('-')[2]; } catch (err) { value1 = '00000000' }
            try { var value2 = obj2[date].split('-')[0] + obj2[date].split('-')[1] + obj2[date].split('-')[2]; } catch (err) { value2 = '00000000' }
            return value2 - value1;
          }
        }
        getJson(search_url, null, function (data) {
          if (data.results.length > 2) {
            if (raw_info.type == '剧集') {
              data.results = data.results.sort(compare('first_air_date'));
            } else {
              data.results = data.results.sort(compare('release_date'));
            }
          }
          data = data.results;
          data.map((e) => {
            var $tr = $("<tr></tr>");
            var media_type = e.media_type;
            if (!media_type) {
              if (raw_info.type == '剧集' || raw_info.name.match(/S\d+|E\d+/)) {
                media_type = 'tv';
              } else {
                media_type = 'movie';
              }
            }
            if (media_type == 'tv') {
              $td0 = $(`<td><img src="https://image.tmdb.org/t/p/w300_and_h450_bestv2${e.poster_path}"; style="width:80px; height: 120px;"></td>`);
              $td1 = $(`<td>${e.first_air_date}</td>`);
              $td2 = $(`<td>${e.original_name}</td>`);
              $td3 = $(`<td><a href="https://www.themoviedb.org/TV/${e.id}" target="_blank">${e.name}</a></td>`);
              $td5 = $(`<td><input type="button" class="fill_number" name=${e.id} value="USE"></td>`);
              $tr.append($td0); $tr.append($td1); $tr.append($td2); $tr.append($td3); $tr.append($td5);
            } else {
              $td0 = $(`<td><img src="https://image.tmdb.org/t/p/w300_and_h450_bestv2${e.poster_path}"; style="width: 80px; height: 120px;"></td>`);
              $td1 = $(`<td>${e.release_date}</td>`);
              $td2 = $(`<td>${e.original_title}</td>`);
              $td3 = $(`<td><a href="https://www.themoviedb.org/movie/${e.id}" target="_blank">${e.title}</a></td>`);
              $td5 = $(`<td><input type="button" class="fill_number" name=${e.id} value="USE"></td>`);
              $tr.append($td0); $tr.append($td1); $tr.append($td2); $tr.append($td3); $tr.append($td5);
            }
            $table.append($tr);
          });
          $('.fill_number').css({ 'backgroundColor': 'rgb(70, 77, 96)' });
          $('.fill_number').click(function () {
            $('#auto_tmdb_movie').val($(this).attr('name'));
            $table.slideUp(500);
            window.scrollTo(0, 500);
          });

          $('#auto_tmdb_movie').change(function () {
            if (!$(this).val()) {
              $table.slideDown(1000);
            }
          });

          $table.find('td').css({ 'backgroundColor': 'rgb(62, 59, 100)' });
        });
        $('#apimatch').parent().parent().after($div);
        $('#apimatch').parent().parent().after(`<output name="apimatch" id="apimatch" for="torrent" style="color: white;">${raw_info.name}</output>`);
      }

      if (raw_info.url && used_tmdb_key) {
        var imdb_id = raw_info.url.match(/tt\d+/)[0];
        var search_url = `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${used_tmdb_key}&external_source=imdb_id&include_adult=false&language=zh-CN`;
        getJson(search_url, null, function (data) {
          console.log(data);
          if (data.movie_results.length) {
            $('#auto_tmdb_movie').val(data.movie_results[0].id);
          } else if (data.tv_results.length) {
            $('#auto_tmdb_movie').val(data.tv_results[0].id);
          } else if (data.tv_episode_results.length) {
            $('#auto_tmdb_movie').val(data.tv_episode_results[0].show_id);
          }
          if (!$('#auto_tmdb_movie').val()) {
            search_by_name(search_name);
          }
        });
      }
      else if (search_name && used_tmdb_key) {
        search_by_name(search_name);
      }

      try { $('#autoimdb').val(raw_info.url.match(/tt(\d+)/i)[1]); } catch (err) { }
      try {
        var infos = get_mediainfo_picture_from_descr(raw_info.descr);
        var container = $('textarea[name="mediainfo"]');
        if (raw_info.descr.match(/MPLS/)) {
          container = $('textarea[name="bdinfo"]');
        }
        if (raw_info.full_mediainfo) {
          container.val(raw_info.full_mediainfo);
        } else {
          container.val(infos.mediainfo);
        }
        container.css({ 'height': '600px' });
        var event = new Event('input', { bubbles: true });
        $('#bbcode-description').val(infos.pic_info);
        $('#bbcode-description')[0].dispatchEvent(event);
        pic_info = deal_img_350_ptpimg(infos.pic_info);
        $('#upload-form-mediainfo').parent().before(`<div style="margin-bottom:5px"><a id="img350" style="margin-left:5px" href="#">IMG350</a>
                    <font style="margin-left:5px" color="red">选中要转换的bbcode图片部分点击即可。</font></div>
                `);
        $('#img350').click(function (e) {
          e.preventDefault();
          var text = $('#bbcode-description').val();
          var textarea = document.getElementById('bbcode-description');
          if (textarea && textarea.selectionStart != undefined && textarea.selectionEnd != undefined) {
            var chosen_value = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
            if (chosen_value) {
              $('#bbcode-description').val(text.replace(chosen_value, chosen_value.replace(/\[img\]/g, '[img=350]')));
            } else {
              $('#bbcode-description').val(text.replace(/\[img\]/g, '[img=350]'));
            }
          }
        })
      } catch (err) {
        if (raw_info.full_mediainfo) {
          $('textarea[name="mediainfo"]').val(raw_info.full_mediainfo);
        } else {
          $('textarea[name="mediainfo"]').val(raw_info.descr);
        }
        $('#upload-form-description').css({ 'height': '600px' });
      }
      if (if_uplver) {
        $('#anon').prop("checked", true);
      }
      try {
        var genre = raw_info.descr.match(/◎类.*?别(.*)/)[1].trim();
        genre = genre.split('/')[0].trim();
        $(`select[name="type_id"]>option`).map(function (index, e) {
          if (e.innerText.includes(genre)) {
            $(`select[name^="type_id"]>option:eq(${index})`).attr('selected', true);
          }
        });
      } catch (Err) {
        console.log(Err);
      }
    }

