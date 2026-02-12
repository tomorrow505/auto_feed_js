/** Consolidated Logic for: BHD **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https:\/\/beyond-hd.me\/download_check\//)) {
  window.open($('a[href*="beyond-hd.me/download"]').has('i').attr('href'), '_blank');
  return;
}

// --- From Module: 09_data_processing.js (Snippet 2) ---
else if (site == 'PHD' || site == 'avz' || site == 'BHD' || site == 'CNZ') {
    input_box.style.width = '270px';
  }

// --- From Module: 09_data_processing.js (Snippet 3) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX', 'IN'].indexOf(site) > -1) {
      $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "border": "1px solid #0D8ED9", "color": "#FFFFFF", "backgroundColor": "#292929" });
      if (site == 'HONE') {
        $('#douban_button,#ptgen_button,#search_button,#download_pngs').css({ "width": "80px" })
      }
    }

// --- From Module: 09_data_processing.js (Snippet 4) ---
if (site == 'BHD') {
      textarea.style.width = '550px';
    }

// --- From Module: 09_data_processing.js (Snippet 5) ---
if (['PTP', 'xthor', 'HDF', 'BHD', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(site) > -1) {
    textarea.style.backgroundColor = '#4d5656';
    textarea.style.color = 'white';
    input_box.style.backgroundColor = '#4d5656';
    input_box.style.color = 'white';
  }

// --- From Module: 11_download_clients.js (Snippet 6) ---
if (r.match(/8:announce\d+:.*(please.passthepopcorn.me|blutopia.cc|beyond-hd.me|eiga.moi|hd-olimpo.club|secret-cinema.pw|monikadesign.uk)/)) {
      if (r.match(/4:name\d+:/)) {
        var length = parseInt(r.match(/4:name(\d+):/)[1]);
        var index = parseInt(r.search('4:name'));
        name = r.substring(index, index + length + 7 + length.toString().length).split(':').pop();
      }
      if ($('input[name="name"]').length && !$('input[name="name"]').val()) {
        $('input[name="name"]').val(deal_with_title(name));
      }
    }

// --- From Module: 11_download_clients.js (Snippet 7) ---
if (['BHD', 'BLU', 'Tik', 'ACM', 'HDSpace', 'xthor', 'Monika', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX'].indexOf(forward_site) > -1) {
    $('#torrent')[0].files = container.files;
  }

// --- From Module: 12_site_ui_helpers.js (Snippet 8) ---
if (site_url.match(/^https:\/\/beyond-hd.me\/library\/title/)) {
  var imdb_box = document.getElementsByTagName('body')[0];
  try {
    raw_info.url = match_link('imdb', imdb_box.innerHTML);
    if (raw_info.url && all_sites_show_douban) {
      getData(raw_info.url, function (data) {
        console.log(data);
        if (data.data) {
          var score = data.data.average + '分';
          if (!score.replace('分', '')) score = '暂无评分';
          if (data.data.votes) score += `|${data.data.votes}人`;
          $('h1.bhd-title-h1').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
          if (data.data.summary.trim() && data.data.summary.match(/[\u4e00-\u9fa5]/)) {
            $('div.movie-overview').text(data.data.summary.replace(/ 　　/g, ''));
          }
        }
      });
    }
  } catch (err) { }
  return;
}

// --- From Module: 14_origin_site_parsing1.js (Snippet 9) ---
if (origin_site == 'BHD') {
      tbody = document.getElementsByClassName('table-details')[0].getElementsByTagName('tbody')[0];
      var imdb_box = document.getElementsByTagName('body')[0];
      try {
        raw_info.url = match_link('imdb', imdb_box.innerHTML);
      } catch (err) { }
      var trailer_info = $('.movie-details').find('span').last().html();
      if (trailer_info.match(/https:\/\/www.youtube.com\/watch\?v=.*/)) {
        raw_info.youtube_url = trailer_info.match(/https:\/\/www.youtube.com\/watch\?v=[a-zA-Z0-9-]*/)[0];
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 10) ---
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

// --- From Module: 15_origin_site_parsing2.js (Snippet 11) ---
if (origin_site == 'BHD') {
      var mediainfo_box = $('div[id*="stats-full"]')[0];
      var code_box = mediainfo_box.getElementsByClassName('decoda-code')[0];
      var mediainfo = code_box.textContent.trim();

      var picture_info = document.getElementsByClassName('decoda-image');
      var img_urls = '';
      for (i = 0; i < picture_info.length; i++) {
        img_urls += '[url=' + picture_info[i].parentNode.href + '][img]' + picture_info[i].src + '[/img][/url] ';
      }
      picture_info = img_urls;
      raw_info.mediainfo_cmct = mediainfo;
      raw_info.imgs_cmct = img_urls;
      raw_info.descr = '[quote]' + mediainfo + '[/quote]\n\n' + picture_info;
      raw_info.descr = raw_info.descr.replace('[url=undefined][img]https://beyondhd.co/images/2017/11/30/c5802892418ee2046efba17166f0cad9.png[/img][/url]', '');

      if (raw_info.descr.match(/beyondhd.co\/images\/20\d{2}/)) {
        var imgs = Array.from(document.getElementsByClassName('decoda-image'));
        imgs.forEach(e => { e.setAttribute('class', 'checkable_IMG'); });
        $('.checkable_IMG').imgCheckbox({
          onclick: function (el) {
            let tagA = Array.from(el.children()[0].parentNode.parentNode.parentNode.getElementsByTagName("a"));
            tagA.forEach(e => { e.onclick = function () { return false; }; });
            var isChecked = el.hasClass("imgChked"),
              imgEl = el.children()[0];
            var img_src = imgEl.src.replace('.md', '');
            if (isChecked) {
              raw_info.images.push(img_src);
            } else {
              raw_info.images.remove(img_src);
            }
            console.log(raw_info.images)
          },
          "graySelected": false,
          "checkMarkSize": "20px",
          "fadeCheckMark": false
        });
      };

      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('h1.bhd-title-h1').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
            if (data.data.summary.trim() && data.data.summary.match(/[\u4e00-\u9fa5]/)) {
              $('div.movie-overview').text(data.data.summary.replace(/ 　　/g, ''));
            }
          }
        });
      }
      raw_info.torrent_url = $('a[href*="me/download"][role=button]').attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 12) ---
if (['PHD', 'avz', 'CNZ', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'BHD', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'OMG'].indexOf(origin_site) > -1) {
          direct = "left";
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 13) ---
else if (origin_site == 'BHD') {
      forward_l.parentNode.setAttribute('class', 'dotborder');
      box_left.parentNode.setAttribute('class', 'dotborder');
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 14) ---
else if (origin_site == 'BHD') {
      if ($('strong:contains("THIS IS A BEYONDHD EXCLUSIVE.")').length) {
        if_exclusive = true;
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 15) ---
if (raw_info.origin_site == 'BHD' && raw_info.name.match(/-FraMeSToR/)) {
      raw_info.name = raw_info.name.replace(/(BluRay)(.*?)(AVC|VC-1|HEVC)(.*?)(REMUX)/i, '$1 $5 $3 $2').replace(/ +/g, ' ').replace(' -', '-');
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 16) ---
if (['BHD'].indexOf(forward_site) > -1) {
            raw_info.name = raw_info.name.replace(/DD\+/i, 'DDP');
            raw_info.name = raw_info.name.replace(/(DDP|DD|AAC|TrueHD|DTS.HD.?MA|DTS.HD.?HR|DTS.HD|DTS|L?PCM|FLAC)(.*?)(5\.1|2\.0|7\.1|1\.0)/i, '$1 $3');
          }

// --- From Module: 17_forward_site_filling1.js (Snippet 17) ---
if (forward_site == 'BHD') {
          document.getElementById('mediainfo').dispatchEvent(evt);
        }

// --- From Module: 18_forward_site_filling2.js (Snippet 18) ---
else if (['BLU', 'Tik', 'Aither', 'BHD', 'iTS', 'PTP', 'ACM', 'Monika', 'DarkLand'].indexOf(forward_site) < 0) {
      setTimeout(() => {
        try {
          document.getElementsByName('uplver')[0].checked = if_uplver;
        } catch (err) { }
      }, 1000)
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 19) ---
else if (forward_site == 'BHD') {
        torrent_box.parentNode.innerHTML = ' <input class="beta-form-main" type="file" accept=".torrent" name="torrent" id="torrent" style="width: 100% !important;" required="">';
      }

