/** Consolidated Logic for: HDOli **/

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

// --- From Module: 14_origin_site_parsing1.js (Snippet 3) ---
if (['ACM', 'HDOli', 'Monika', 'DTR'].indexOf(origin_site) > -1) {
      var iii, div_box, imdb_box;
      if (origin_site == 'DTR') {
        iii = document.getElementsByClassName('torrent-general')[0];
        div_box = iii.getElementsByClassName('table-responsive')[1];
        imdb_box = document.getElementsByClassName('movie__details')[0];
      }
      else if (origin_site == 'Monika') {
        iii = document.getElementsByTagName('h4')[0].parentNode.parentNode;
        div_box = iii.getElementsByClassName('table-responsive')[1];
        imdb_box = document.getElementsByClassName('movie-details')[0];
        $('h4').first().click();
      }
      else if (origin_site == 'ACM') {
        div_box = document.getElementsByClassName('shoutbox')[0];
        imdb_box = document.getElementsByClassName('movie-details')[0];
      }
      else {
        iii = document.getElementsByTagName('h4')[0].parentNode.parentNode;
        div_box = iii.getElementsByClassName('table-responsive')[0];
        imdb_box = document.getElementsByClassName('movie-details')[0];
      }
      tbody = div_box.getElementsByTagName('table')[0];
      raw_info.url = match_link('imdb', imdb_box.parentNode.innerHTML);
      if (!raw_info.url) {
        var tmdb_url = match_link('tmdb', imdb_box.parentNode.innerHTML);
        if (tmdb_url) {
          var _url = `https://api.themoviedb.org/3/${tmdb_url.match(/(tv|movie)\/\d+/)[0]}/external_ids?api_key=${used_tmdb_key}`;
          getJson(_url, null, function (d) {
            console.log(d);
            if (d.imdb_id) {
              raw_info.url = 'https://www.imdb.com/title/' + d.imdb_id;
              reBuildHref(raw_info, forward_r);
            }
          });
        }
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 4) ---
if (['BHD', 'ACM', 'HDOli', 'Monika', 'DTR'].indexOf(origin_site) > -1) {
        if (['副标题'].indexOf(tds[i].textContent.trim()) > -1) {
          raw_info.small_descr = tds[i + 1].textContent.replace(/ *\n.*/gm, '').trim();
        }
        if (['Name', 'Nombre', '名称', '标题'].indexOf(tds[i].textContent.trim()) > -1) {
          raw_info.name = tds[i + 1].textContent.replace(/ *\n.*/gm, '').trim();
          if (origin_site == 'HDOli') {
            raw_info.name = raw_info.name.replace(/[|]/g, '');
          }
          table = tds[i].parentNode.parentNode;
          insert_row = table.insertRow(i / 2 + 1);
          douban_box = table.insertRow(i / 2 + 1);
        }
        if (['Category', '类别', 'Categoría'].indexOf(tds[i].textContent.trim()) > -1) {
          if (tds[i + 1].innerHTML.match(/Movie|电影|Películas/i)) {
            raw_info.type = '电影';
          }
          if (tds[i + 1].innerHTML.match(/(TV-Show|TV|剧集|Series)/i)) {
            raw_info.type = '剧集';
          }
          if (tds[i + 1].innerHTML.match(/Anime (TV|Movie)/i)) {
            raw_info.type = '动漫';
          }
        }
        if (['Type', 'Tipo', '规格'].indexOf(tds[i].textContent.trim()) > -1) {
          //还有一些类型
          var tmp_type = tds[i + 1].innerHTML.trim();
          if (tmp_type.match(/BD 50/i)) {
            raw_info.medium_sel = 'Blu-ray';
          } else if (tmp_type.match(/Remux/i)) {
            raw_info.medium_sel = 'Remux';
          } else if (tmp_type.match(/encode/i)) {
            raw_info.medium_sel = 'Encode';
          } else if (tmp_type.match(/web-dl/i)) {
            raw_info.medium_sel = 'WEB-DL';
          }
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 5) ---
if (origin_site == 'HDOli') {
            raw_info.name = raw_info.name.replace(/[|]/g, '');
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 6) ---
if (['ACM', 'HDOli', 'Monika', 'DTR'].indexOf(origin_site) > -1) {
      var mediainfo_lack = false;
      try {
        var mediainfo_box = document.getElementsByClassName('slidingDiv')[0];
        var code_box = mediainfo_box.getElementsByTagName('code')[0];
        var mediainfo = code_box.textContent.trim();
      } catch (err) {
        mediainfo_lack = true;
      }
      if (mediainfo_lack && (origin_site == 'Monika' || origin_site == 'DTR')) {
        mediainfo = $('pre[class="decoda-code"]').eq(0).text();
        mediainfo_lack = false;
      }
      var picture_boxes = document.getElementsByClassName('panel panel-chat shoutbox');
      var picture_info = document.getElementsByClassName('panel panel-chat shoutbox')[1];
      for (i = 0; i < picture_boxes.length; i++) {
        var tmp_str = picture_boxes[i].getElementsByTagName('h4')[0].textContent;
        if (tmp_str.trim().match(/Description|描述/)) {
          picture_info = picture_boxes[i];
          break;
        }
      }
      //候补方式获取mediainfo
      if (mediainfo_lack) {
        var tmp_box = picture_info.getElementsByTagName('table')[0].cloneNode(true);
        mediainfo = walkDOM(tmp_box);
        mediainfo = mediainfo.slice(0, mediainfo.search(/\[url=/i));
        mediainfo = mediainfo.replace('[img]https://blutopia.cc/img/joypixels/24c2.png[/img]', ':m:');
        mediainfo = mediainfo.trim();
      }

      if ($('summary').length) {
        try {
          var vob_info = $('details[class="label label-primary"]').find('code')[0].innerHTML;
          vob_info = vob_info.replace(/<br>/g, '\n');
          vob_info = vob_info.replace(/<div.*?>/, '[quote]');
          vob_info = vob_info.replace(/<\/div>/, '[/quote]\n\n');
          vob_info = vob_info.replace(/<\/?pre>/g, '');
          vob_info = vob_info.replace(/&nbsp;/g, ' ');
        } catch (err) {
          vob_info = ''
        }
      } else {
        vob_info = ''
      }

      picture_info = picture_info.getElementsByTagName('img');
      var img_urls = '';
      for (i = 0; i < picture_info.length; i++) {
        if (picture_info[i].parentNode.href) {
          img_urls += '[url=' + picture_info[i].parentNode.href + '][img]' + picture_info[i].src + '[/img][/url] ';
        } else {
          img_urls += '[img]' + picture_info[i].src + '[/img] ';
        }
      }
      picture_info = img_urls;
      raw_info.mediainfo_cmct = mediainfo;
      raw_info.imgs_cmct = img_urls;
      raw_info.descr = '[quote]' + mediainfo + '[/quote]\n\n' + vob_info + picture_info;

      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('h1.movie-heading').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
            $('div.movie-overview,span.movie-overview').text(data.data.summary.replace(/ 　　/g, ''));
            if (origin_site == 'DTR') {
              $('h1.movie__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
              $('div.movie__overview').text(data.data.summary.replace(/ 　　/g, ''));
            }
          }
        });
      }
      raw_info.torrent_url = $('a[href*="torrents/download"]').attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
if (['PHD', 'avz', 'CNZ', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'BHD', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'OMG'].indexOf(origin_site) > -1) {
          direct = "left";
        }

