/** Consolidated Logic for: FileList **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https:\/\/filelist.io\/browse.php/)) {
  $('input[name="search"]').attr('placeholder', 'Search by key-word or IMDB...');
  $('input[type="submit"]').attr('value', 'Go!');
  $('input[onclick*=catlist]').attr('value', 'Category');

  $('select[name="searchin"]').find('option:eq(0)').text('Name and Description');
  $('select[name="searchin"]').find('option:eq(1)').text('Name');
  $('select[name="searchin"]').find('option:eq(2)').text('Description');

  $('select[name="cat"]').find('option:eq(21)').text('Series 4K');
  $('select[name="cat"]').find('option:eq(22)').text('Series HD');
  $('select[name="cat"]').find('option:eq(23)').text('Series SD');

  $('select[name="sort"]').find('option:eq(1)').text('Relevante');
  $('select[name="sort"]').find('option:eq(3)').text('Size');

  var dict_info = {
    'toate': 'Total',
    'Anime': 'Animates',
    'Desene': 'Drawings',
    'Diverse': 'Other',
    'Filme': 'Film',
    'Jocuri Console': 'Console Games',
    'Jocuri PC': 'PC Games',
    'Seriale': 'Series'
  }
  $('input[name="cats[]"]').map((index, e) => {
    var category = $(e).parent().find('a').text();
    for (key in dict_info) {
      category = category.replace(key, dict_info[key]);
    }
    $(e).parent().find('a').text(category);
  });
  $('select[name="cat"]').find('option').map((index, e) => {
    var category = $(e).text();
    for (key in dict_info) {
      category = category.replace(key, dict_info[key]);
    }
    $(e).text(category);
  });

  return;
}

// --- From Module: 09_data_processing.js (Snippet 2) ---
if (['PHD', 'avz', 'CNZ', 'FileList', 'TTG', 'PTP'].indexOf(site) > -1) {
    var download_button = document.createElement('input');

    var select_img = document.createElement("input");
    select_img.setAttribute("type", "checkbox");
    select_img.setAttribute("id", 'select_img');
    container.append(select_img);
    select_img.style.marginLeft = '8px';
    select_img.style.marginRight = '-1px';
    select_img.checked = true;

    select_img.addEventListener('click', function (e) {
      if (e.target.checked) {
        location.reload();
      } else {
        $('span.imgCheckbox0').map((_, e) => {
          $(e).replaceWith(e.innerHTML)
        });
      }
    }, false);

    download_button.type = "button";
    download_button.id = 'download_pngs';
    download_button.value = '转存截图';
    download_button.style.marginLeft = '0px';
    download_button.style.paddingLeft = '2px';
    download_button.onclick = function () {
      if (textarea.value.match(/ilikeshots/)) {
        raw_info.images = textarea.value.match(/https?:\/\/yes\.ilikeshots\.club\/images\/.*?png/g);
      }
      if (raw_info.images.length > 0) {
        download_button.value = '处理中…';
        if (raw_info.images[0].match(/ilikeshots/) && !raw_info.images[0].match(/.png|.jpg/)) {
          raw_info.images.map((e) => {
            getDoc(e, null, function (doc) {
              textarea.value += $('#image-viewer-container', doc).find('img').attr('src').replace(/\.md/, '') + '\n';
            })
          });
        }
        pix_send_images(raw_info.images)
          .then(function (new_urls) {
            new_urls = new_urls.toString().split(',');
            var urls_append = '';
            if (new_urls.length > 1) {
              for (var i = 0; i <= new_urls.length - 2; i += 2) {
                urls_append += `${new_urls[i]} ${new_urls[i + 1]}\n`
              }
              if (new_urls.length % 2 == 1) {
                urls_append += new_urls[new_urls.length - 1] + '\n';
              }
            } else {
              urls_append = new_urls;
            }
            $('#textarea').val($('#textarea').val() + '\n' + urls_append);
            if (site == 'PTP') {
              raw_info.descr = raw_info.descr.replace(/\[img\].*?(ptpimg|pixhost).*?\[\/img\]/g, '');
            }
            raw_info.descr = raw_info.descr + '\n' + urls_append;
            set_jump_href(raw_info, 1);
            download_button.value = '处理成功';
            download_button.disable = true;
          })
          .catch(function (message) {
            alert(message);
            download_button.disable = true;
            download_button.value = '转存失败';
          });
      }
    };
    container.appendChild(download_button);

    if (site != 'PTP') {
      var hdb_transfer = document.createElement('input');
      hdb_transfer.type = "button";
      hdb_transfer.id = 'transfer_hdb';
      hdb_transfer.value = '转存HDB';
      hdb_transfer.style.marginLeft = '5px';
      hdb_transfer.style.paddingLeft = '2px';
      container.appendChild(hdb_transfer);
      hdb_transfer.onclick = function () {
        if (raw_info.images.length > 0) {
          raw_info.images.push(raw_info.name.replace(/ /g, '.'));
          GM_setValue('HDB_images', raw_info.images.join(', '));
          window.open('https://img.hdbits.org/', '_blank');
        } else {
          alert('请选择要转存的图片！！！')
        }
      }
    }
  }

// --- From Module: 09_data_processing.js (Snippet 3) ---
if (['HDB', 'PHD', 'avz', 'CNZ', 'FileList', 'TTG'].indexOf(site) > -1) {
    var width = textarea.style.width.match(/\d+/)[0];
    if (site == 'PHD' || site == 'avz' || site == 'CNZ') {
      textarea.style.width = `${parseInt(width) + 90}px`;
    } else if (site == 'FileList') {
      textarea.style.width = `${parseInt(width) + 35}px`;
    } else {
      textarea.style.width = `${parseInt(width) + 55}px`;
    }
  }

// --- From Module: 09_data_processing.js (Snippet 4) ---
else if (site == 'FileList') {
      textarea.style.width = `${parseInt(width) + 35}px`;
    }

// --- From Module: 12_site_ui_helpers.js (Snippet 5) ---
if (site_url.match(/^https:\/\/filelist.io\/.*/)) {
  if (site_url.match(/rules.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/fl_rules.html', null, function (doc) {
      $('div.cblock-content').html($('div.cblock-content', doc).html());
    });
  } else if (site_url.match(/faq.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/fl_faq.html', null, function (doc) {
      $('#maincolumn').html($('#maincolumn', doc).html());
    });
  }
}

// --- From Module: 14_origin_site_parsing1.js (Snippet 6) ---
if (origin_site == 'FileList') {

      raw_info.name = document.getElementsByTagName('h4')[0].textContent;

      var mydiv = document.getElementsByClassName('cblock-innercontent')[0];
      raw_info.url = match_link('imdb', mydiv.innerHTML);
      raw_info.tmdb_url = match_link('tmdb', mydiv.innerHTML);
      var filelist_tmdb = match_link('tmdb', mydiv.innerHTML);

      if (filelist_tmdb && $('#descr').length) {
        var bbbs = document.getElementsByTagName('b');
        for (i = 0; i < bbbs.length; i++) {
          if (bbbs[i].textContent == 'Category') {
            var info = bbbs[i].parentNode.textContent;
            if (info.match(/Filme/)) {
              raw_info.type = '电影';
            } else if (info.match(/Seriale HD/)) {
              raw_info.type = '剧集';
            } else if (info.match(/Anime|Desene/)) {
              raw_info.type = '动漫';
            }
          }
        }

        var div_index = document.getElementById('descr');
        var div = document.createElement('div');
        var mytable = document.createElement('table');
        var mytbody = document.createElement('tbody');
        insert_row = mytable.insertRow(0);
        douban_box = mytable.insertRow(0);
        div.appendChild(mytable);

        var hr = document.createElement('hr');
        hr.setAttribute('class', 'separator');
        hr.style.marginTop = '15px';
        hr.style.marginBottom = '15px';
        div.appendChild(hr);

        div_index.previousElementSibling.parentNode.insertBefore(div, div_index.previousElementSibling);
        tbody = mytbody;

        var imgs = Array.from(div_index.getElementsByTagName('img'));
        imgs.forEach(e => e.setAttribute("class", 'checkable_IMG'));
        try { raw_info.youtube_url = mydiv.innerHTML.match(/www.youtube.com\/embed\/([a-zA-Z0-9-]*)/)[1]; } catch (err) { raw_info.youtube_url = ''; }
      } else {
        var tds = document.getElementsByTagName('td');
        for (i = 0; i < tds.length; i++) {
          if (tds[i].textContent.trim() == 'Type') {
            var info = tds[i + 1].textContent;
            if (info.match(/Filme/)) {
              raw_info.type = '电影';
            } else if (info.match(/Seriale HD/)) {
              raw_info.type = '剧集';
            } else if (info.match(/Anime|Desene/)) {
              raw_info.type = '动漫';
            }
          }
        }

        var mytable = document.getElementsByClassName('cblock-innercontent')[0].getElementsByTagName('tbody')[0];
        insert_row = mytable.insertRow(1);
        douban_box = mytable.insertRow(1);
        tbody = mytable;

        var description = document.getElementsByTagName('center')[0];
        var imgs = Array.from(description.getElementsByTagName('img'));
        imgs.forEach(e => e.setAttribute("class", 'checkable_IMG'));
      }

      var img_urls = '';
      for (i = 0; i < imgs.length; i++) {
        if (imgs[i].src.match(/tvdb|imdb|tmdb/)) {
          continue;
        }
        if (imgs[i].parentNode.nodeName == 'A') {
          img_urls += '[url=' + imgs[i].parentNode.href + '][img]' + imgs[i].src + '[/img][/url]';
        } else {
          img_urls += '[img]' + imgs[i].src + '[/img]';
        }
      }

      function get_email(email) {
        if (email.length) {
          var email_str = "";
          var a = email.attr('data-cfemail');
          r = parseInt(a.substr(0, 2), 16);
          for (j = 2; a.length - j; j += 2) {
            c = parseInt(a.substr(j, 2), 16) ^ r;
            email_str += String.fromCharCode(c);
          }
          email.replaceWith(`${email_str}`);
        }
      }

      var torrentid = site_url.match(/id=\d+/)[0];
      var mediainfo_url = 'https://filelist.io/mediainfo.php?' + torrentid;
      setTimeout(() => {
        getDoc(mediainfo_url, null, function (doc) {
          var email = $('#maincolumn', doc).find('div[class="cblock-innercontent"]').find('a[class="__cf_email__"]');
          get_email(email);
          var mediainfo = $('#maincolumn', doc).find('div[class="cblock-innercontent"]')[0];
          raw_info.descr = '';
          descr = walkDOM(mediainfo.cloneNode(true));
          descr = descr.replace(/\[.?font.*?\]/g, '');
          raw_info.descr = '[quote]' + descr + '[/quote]';
          raw_info.descr = add_thanks(raw_info.descr);
          $('h4:first').after('<h4 style="margin-left:5px;"><font color="red"><--Mediainfo/BDinfo加载成功！！！--></font></h4>');
          if (img_urls.match(/yes.ilikeshots.club\/images/)) {
            $('.checkable_IMG').imgCheckbox({
              onclick: function (el) {
                let tagA = Array.from(el.children()[0].parentNode.parentNode.parentNode.getElementsByTagName("a"));
                tagA.forEach(e => { e.onclick = function () { return false; }; });
                var isChecked = el.hasClass("imgChked"),
                  imgEl = el.children()[0];
                if (isChecked) {
                  raw_info.images.push(imgEl.parentNode.parentNode.href.split('?')[1]);
                } else {
                  raw_info.images.remove(imgEl.parentNode.parentNode.href.split('?')[1]);
                }
              },
              "graySelected": false,
              "checkMarkSize": "20px",
              "fadeCheckMark": false
            });
          }
          raw_info.descr += '\n\n' + img_urls.replace(/https:\/\/filelist.io\/redir.php\?/g, '');
        })
      }, 1000);

      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            $('img[src="/styles/images/starbig.png"]').first().parent().append(` | 豆：${data.data.average}`);
            $container = $('img[src="/styles/images/starbig.png"]').parent().parent().next();
            $container.find('div').prepend(`<a href="${douban_prex}${data.data.id}" target="_blank"><font color="red">${data.data.title.split(' ')[0]}</font></a> [${data.data.region}-${data.data.year}]`)
            $container.find('div').find('i:eq(0)').text(' ' + data.data.genre);
            $container.find('div').find('span').text(data.data.summary.replace(/ 　　/g, ''));
          }
        });
      }
      raw_info.torrent_url = 'https://filelist.io/' + $('a[href^="download.php"]').attr('href');
      raw_info.torrent_name = $('a[href^="download.php"]').text().trim();
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
else if (origin_site != 'FileList') {
            raw_info.small_descr += tds[i].parentNode.lastChild.textContent;
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 8) ---
if (origin_site == 'xthor' || origin_site == 'FileList' || origin_site == 'HDB' || origin_site == 'HDRoute') {
        forward_l.style.width = '80px'; forward_r.style.paddingTop = '10px';
        forward_r.style.paddingBottom = '10px'; forward_r.style.paddingLeft = '12px';
        if (origin_site == 'HDB') {
          forward_l.style.paddingRight = '12px'; forward_r.style.paddingBottom = '12px';
          forward_r.style.borderTop = 'none'; forward_r.style.borderBottom = 'none';
          forward_r.style.borderRight = 'none'; forward_l.style.border = 'none';
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 9) ---
if (origin_site == 'FileList' || origin_site == 'xthor' || origin_site == 'HDB') {
          box_right.style.paddingLeft = '12px';
          if (origin_site == 'HDB') {
            box_left.style.paddingRight = '12px'; box_left.style.paddingTop = '12px';
            box_left.style.paddingBottom = '12px';
            box_right.style.borderTop = 'none'; box_right.style.borderBottom = 'none';
            box_right.style.borderRight = 'none'; box_left.style.border = 'none';
          }
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 10) ---
if (origin_site == 'FileList' && !$('#descr').length) {
      $(tbody).find('td:even').addClass('colhead');
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 11) ---
if (this.id == "影" && ['CMCT', 'TTG', 'UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) < 0) {
          info = if_ying_allowed();
          if (info.length) {
            if (!confirm(`转发该资源可能违反站点以下规则:\n${info.join('\n')}\n具体细节请查看站点规则页面。\n是否仍继续发布？`)) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 12) ---
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

