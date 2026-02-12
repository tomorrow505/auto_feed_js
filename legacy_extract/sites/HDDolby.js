/** Consolidated Logic for: HDDolby **/

// --- From Module: 14_origin_site_parsing1.js (Snippet 1) ---
if (origin_site == 'HDDolby') {
        try {
          var hdd_mi = $('.mediainfo-container .mediainfo-full pre').text().trim();
          if (hdd_mi) {
            raw_info.descr += `\n  \n[quote]\n${hdd_mi}\n[/quote]\n  \n`;
          }
        } catch (err) { }
        try {
          $('#kscreenshots img').each(function (index, e) {
            var src = $(e).attr('src');
            if (src) {
              raw_info.descr += `[img]${src}[/img]\n`;
            }
          });
        } catch (err) { }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 2) ---
if (['PTer', 'PThome', 'HDHome', 'HDDolby'].indexOf(origin_site) > -1) {
        var bookmark = document.getElementById('bookmark0');
        while (bookmark.previousElementSibling) {
          bookmark = bookmark.previousElementSibling;
          if (bookmark.nodeName == 'A') {
            raw_info.torrentName = bookmark.textContent.replace('.torrent', '');
            break;
          }
        }
      }

// --- From Module: 16_origin_site_parsing3.js (Snippet 3) ---
else if (['HDDolby', 'HDHome', 'PThome', 'Audiences'].indexOf(origin_site) > -1) {
      if ($('tr:contains("标签"):last').find('span.txz').length || $('tr:contains("标签"):last').find('span.tjz').length) {
        if_exclusive = true;
      }
    }

// --- From Module: 17_forward_site_filling1.js (Snippet 4) ---
if (['HDDolby'].indexOf(forward_site) > -1 && allinput[i].name == 'douban_id' && raw_info.dburl) {
        allinput[i].value = raw_info.dburl.match(/\d+/i)[0];
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 5) ---
else if (forward_site == 'HDDolby') {
        container = $('textarea[name="media_info"]');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 6) ---
if (forward_site == 'HDDolby' || forward_site == 'PTLGS') {
            get_full_size_picture_urls(null, infos.pic_info, $('#not'), false, function (img_info) {
              $('textarea[name="screenshots"]').val(img_info.trim());
            }, function (data) {
              for (i = 0; i < data.length; i++) {
                if (data[i]) {
                  raw_info.descr = raw_info.descr.replace(data[i], '');
                }
              }
            });
          }

// --- From Module: 17_forward_site_filling1.js (Snippet 7) ---
case 'HDDolby': case 'PThome': case 'HDHome': case 'Audiences':
          if (labels.gy) { check_label(document.getElementsByName('tags[]'), 'gy'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[]'), 'yy'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[]'), 'zz'); }
          if (labels.diy) {
            check_label(document.getElementsByName('tags[]'), 'diy');
          } else {
            if (labels.yp && forward_site == 'HDHome') {
              check_label(document.getElementsByName('tags[]'), 'ybyp');
            }
          }
          if (labels.hdr10) { check_label(document.getElementsByName('tags[]'), 'hdr10'); }
          if (labels.hdr10plus) { check_label(document.getElementsByName('tags[]'), 'hdrm'); }
          if (labels.db) { check_label(document.getElementsByName('tags[]'), 'db'); }
          if (labels.complete) { check_label(document.getElementsByName('tags[]'), 'wj'); }
          break;

// --- From Module: 19_forward_site_filling3.js (Snippet 8) ---
else if (forward_site == 'HDDolby') {
      //类型
      var browsecat = $('#browsecat');
      var type_dict = {
        '电影': 401, '剧集': 402, '动漫': 405, '综艺': 403, '音乐': 408, '纪录': 404,
        '体育': 407, '软件': 409, '学习': 411, '游戏': 410, 'MV': 406, '书籍': 409
      };
      //如果当前类型在上述字典中
      if (type_dict.hasOwnProperty(raw_info.type)) {
        var index = type_dict[raw_info.type];
        browsecat.val(index);
      }

      //媒介
      var medium_box = $('select[name="medium_sel"]');
      switch (raw_info.medium_sel) {
        case 'UHD': medium_box.val(1); break;
        case 'Blu-ray': medium_box.val(2); break;
        case 'DVD': medium_box.val(8); break;
        case 'Remux': medium_box.val(3); break;
        case 'HDTV': medium_box.val(5); break;
        case 'WEB-DL':
          if (raw_info.name.match(/webrip/i)) {
            medium_box.val(7);
          } else {
            medium_box.val(6);
          }
          break;
        case 'Encode': medium_box.val(10); break;
        case 'CD': medium_box.val(9); break;
        default: medium_box.val(11);
      }

      //视频编码和音频混合了
      var codec_box = $('select[name="codec_sel"]');
      switch (raw_info.codec_sel) {
        case 'H265': case 'X265': codec_box.val(2); break;
        case 'H264': case 'X264': codec_box.val(1); break;
        case 'AV1': codec_box.val(11); break;
        case 'VP9': codec_box.val(12); break;
        case 'VC-1': codec_box.val(5); break;
        case 'MPEG-2': case 'MPEG-4': codec_box.val(6); break;
        default: codec_box.val(7);
      }

      //音频编码
      var audiocodec_box = $('select[name="audiocodec_sel"]');
      switch (raw_info.audiocodec_sel) {
        case 'DTS-HDMA:X 7.1': audiocodec_box.val(15);
        case 'DTS-HD': case 'DTS-HDMA': case 'DTS-HDHR': audiocodec_box.val(1); break;
        case 'Atmos': case 'TrueHD': audiocodec_box.val(2); break;
        case 'LPCM': audiocodec_box.val(3); break;
        case 'DTS': audiocodec_box.val(4); break;
        case 'AC3': audiocodec_box.val(5); break;
        case 'AAC': audiocodec_box.val(6); break;
        case 'Flac': audiocodec_box.val(7); break;
        case 'APE': audiocodec_box.val(8); break;
        case 'WAV': audiocodec_box.val(9); break;
        case 'MP3': audiocodec_box.val(10); break;
        case 'M4A': audiocodec_box.val(11); break;
        default: audiocodec_box.val(12);
      }
      if (raw_info.name.match(/DDP|DD\+|EAC3/i)) {
        audiocodec_box.val(14);
      }

      //分辨率
      var standard_box = $('select[name="standard_sel"]');
      var standard_dict = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, 'SD': 5, '': 5, '8K': 6 };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        var index = standard_dict[raw_info.standard_sel];
        standard_box.val(index);
      }
      $('select[name="team_sel"]').val(8);
      check_team(raw_info, 'team_sel');

      function search_by_name(search_name) {
        var $div = $(`<div style="margin-top: 10px;"><br>以下是根据名称搜索结果，如果有符合的选项点选对应的USE按钮即可：</div>`);
        var $table = $(`<table style="width: 80%" class="table table-condensed table-bordered table-striped table-hover"></table>`);
        $div.append($table);
        var search_url;
        if (raw_info.type == '剧集') {
          search_url = 'http://api.tmdb.org/3/search/tv?api_key={key}&language=zh-CN&query={name}';
        } else if (raw_info.type == '电影') {
          search_url = 'http://api.tmdb.org/3/search/movie?api_key={key}&language=zh-CN&query={name}';
        } else {
          search_url = 'http://api.tmdb.org/3/search/multi?api_key={key}&language=zh-CN&query={name}';
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
          console.log(data);
          if (data.results.length > 2) {
            if (raw_info.type == '剧集') {
              data.results = data.results.sort(compare('first_air_date'));
            } else {
              data.results = data.results.sort(compare('release_date'));
            }
          }
          if (data.results.length > 0) {
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
                $td1 = $(`<td style='width:150px;'>${e.first_air_date}</td>`);
                $td2 = $(`<td style='width:250px;'>${e.original_name}</td>`);
                $td3 = $(`<td style='width:250px;'><a href="https://www.themoviedb.org/tv/${e.id}" target="_blank">${e.name}</a></td>`);
                $td5 = $(`<td style='width:50px;'><input type="button" class="fill_number" name=https://www.themoviedb.org/tv/${e.id} title="${e.name}" value="USE"></td>`);
                $tr.append($td1); $tr.append($td2); $tr.append($td3); $tr.append($td5);
              } else {
                $td1 = $(`<td style='width:150px;'>${e.release_date}</td>`);
                $td2 = $(`<td style='width:250px;'>${e.original_title}</td>`);
                $td3 = $(`<td style='width:250px;'><a href="https://www.themoviedb.org/movie/${e.id}" target="_blank">${e.title}</a></td>`);
                $td5 = $(`<td style='width:50px;'><input type="button" class="fill_number" name=https://www.themoviedb.org/movie/${e.id} title="${e.title}" value="USE"></td>`);
                $tr.append($td1); $tr.append($td2); $tr.append($td3); $tr.append($td5);
              }
              $table.append($tr);
            });
            $('.fill_number').css({ 'backgroundColor': 'rgb(239, 239, 239)' });

            $('.fill_number').click(function () {
              var tmdb_url = $(this).attr('name');
              console.log(tmdb_url)
              getDoc(tmdb_url, null, function (doc) {
                tmdb_url = $(`link[href*="${tmdb_url}"]`, doc).attr('href');
                $('input[name="tmdb_url"]').val(tmdb_url);
              });
              $div.slideUp(500);
              window.scrollTo(0, 500);
            });

            $('#autotmdb').change(function () {
              if (!$(this).val()) {
                $div.slideDown(1000);
              }
            });
            $table.find('td').css({ 'backgroundColor': 'rgb(198, 227, 198)' });
          }
        });
        $('input[name="tmdb_url"]').after($div);
      }

      if (raw_info.url && used_tmdb_key) {
        var imdb_id = raw_info.url.match(/tt\d+/)[0];
        var search_url = `https://api.themoviedb.org/3/find/${imdb_id}?api_key=${used_tmdb_key}&external_source=imdb_id&include_adult=false&language=zh-CN`;
        getJson(search_url, null, function (data) {
          console.log(data)
          var tmdb_url = '';
          var base_url = 'https://www.themoviedb.org'
          if (data.movie_results.length) {
            tmdb_url = `${base_url}/movie/${data.movie_results[0].id}`;
          } else if (data.tv_results.length) {
            tmdb_url = `${base_url}/tv/${data.tv_results[0].id}`;
          } else if (data.tv_episode_results.length) {
            tmdb_url = `${base_url}/tv/${data.tv_episode_results[0].show_id}`;
          }
          if (tmdb_url) {
            getDoc(tmdb_url, null, function (doc) {
              tmdb_url = $(`link[href*="${tmdb_url}"]`, doc).attr('href');
              $('input[name="tmdb_url"]').val(tmdb_url);
            });
          } else {
            search_by_name(search_name);
          }

        });
      } else if (search_name && used_tmdb_key) {
        search_by_name(search_name);
      }
    }

