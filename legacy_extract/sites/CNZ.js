/** Consolidated Logic for: CNZ **/

// --- From Module: 09_data_processing.js (Snippet 1) ---
else if (site == 'PHD' || site == 'avz' || site == 'BHD' || site == 'CNZ') {
    input_box.style.width = '270px';
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
if (site == 'PHD' || site == 'avz' || site == 'CNZ') {
      textarea.style.width = `${parseInt(width) + 90}px`;
    }

// --- From Module: 11_download_clients.js (Snippet 5) ---
else if (forward_site == 'avz' || forward_site == 'PHD' || forward_site == 'CNZ') {
    $('input[name=torrent_file]')[0].files = container.files;
  }

// --- From Module: 14_origin_site_parsing1.js (Snippet 6) ---
if (origin_site == 'PHD' || origin_site == 'avz' || origin_site == 'CNZ') {
      tbody = $('div.table-responsive:contains(Title)').find('tbody')[0];
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 7) ---
if (origin_site == 'PHD' || origin_site == 'avz' || origin_site == 'CNZ') {
        if (i == 1 && tds[i].innerHTML.match(/Movie$/i)) {
          raw_info.type = '电影';
        } else if (i == 1 && tds[i].innerHTML.match(/TV-Show$/i)) {
          raw_info.type = '剧集';
        } else if (i == 3) {
          raw_info.name = tds[i].innerHTML;
          if (raw_info.name.match(/ E\d+/)) {
            raw_info.name = raw_info.name.replace(/E\d+/, function (data) {
              return 'S01' + data;
            });
          }
        }
        if (tds[i].textContent == 'Video Quality') {
          raw_info.standard_sel = tds[i + 1].innerHTML.trim();
        } else if (tds[i].textContent == 'Description') {
          raw_info.descr += walkDOM(tds[i + 1]);
        } else if (tds[i].textContent == 'Rip Type') {
          var tmp_type = tds[i + 1].innerHTML.trim();
          if (tmp_type.match(/BluRay Raw/i)) {
            raw_info.medium_sel = 'Blu-ray';
          } else if (tmp_type.match(/BluRay/i)) {
            raw_info.medium_sel = 'Encode';
          }
        } else if (tds[i].textContent.trim() == 'Title') {
          table = tds[i].parentNode.parentNode;
          insert_row = table.insertRow(i / 2 + 1);
          douban_box = table.insertRow(i / 2 + 1);
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 8) ---
if (origin_site == 'PHD' || origin_site == 'avz' || origin_site == 'CNZ') {

      var mediainfo = document.getElementById('collapseMediaInfo').innerHTML;
      mediainfo = mediainfo.replace('<pre>', '');
      mediainfo = mediainfo.replace('</pre>', '');

      var picture_info = document.getElementById('collapseScreens');

      var imgs = Array.from(picture_info.getElementsByTagName('img'));
      imgs.forEach(e => e.setAttribute("class", 'checkable_IMG'));

      $('.checkable_IMG').imgCheckbox({
        onclick: function (el) {
          setTimeout(function () { $('.mfp-close').click(); }, 500);
          let tagA = Array.from(el.children()[0].parentNode.parentNode.parentNode.getElementsByTagName("a"));
          tagA.forEach(e => { e.onclick = function () { return false; }; });
          var isChecked = el.hasClass("imgChked"),
            imgEl = el.children()[0]; // the img element
          if (isChecked) {
            raw_info.images.push(imgEl.parentNode.parentNode.href);
          } else {
            raw_info.images.remove(imgEl.parentNode.parentNode.href);
          }
        },
        "graySelected": false,
        "checkMarkSize": "20px",
        "fadeCheckMark": false
      });

      raw_info.descr = '[quote]\n' + mediainfo.trim() + '\n[/quote]';
      var movie_detail = document.getElementsByClassName('movie-details')[0];
      var movie_as = movie_detail.getElementsByTagName('a');
      for (i = 0; i < movie_as.length; i++) {
        if (movie_as[i].href.match(/www.thetvdb.com/)) {
          raw_info.tvdb_url = 'https://www.thetvdb.com/?' + movie_as[i].href.split('?').pop();
        }
        if (movie_as[i].href.match(/www.imdb.com/i)) {
          raw_info.url = ('http://www.imdb.com/title/tt' + movie_as[i].innerHTML).replace(/tttt/, 'tt');
        }
        if (movie_as[i].href.match(/www.themoviedb.org/)) {
          raw_info.tmdb_url = movie_as[i].href.split('?').pop();
        }
      }
      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('h3.movie-title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank">${data.data.title.split(' ')[0]}[${score}]</a>`);
            $('p.movie-plot').text(data.data.summary.replace(/ 　　/g, ''));
          }
        });
      }
      raw_info.torrent_url = $(`a[href*="download/torrent"]:last`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 9) ---
if (['PHD', 'avz', 'CNZ', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'BHD', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'OMG'].indexOf(origin_site) > -1) {
          direct = "left";
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 10) ---
else if (site == 'avz' || site == 'PHD' || site == 'CNZ') {
        if (search_mode == 0 || if_exclusive) {
          return;
        }
        GM_setValue('avz_info', JSON.stringify(raw_info));
        var domain = {
          'avz': 'avistaz.to', 'PHD': 'privatehd.to', 'CNZ': 'cinemaz.to'
        }
        if (raw_info.url) {
          var url = `https://${domain[site]}/movies?search=&imdb=` + raw_info.url.match(/tt\d+/)[0];
          var upload_url = `https://${domain[site]}/upload/movie`;
          if (raw_info.type != '电影' && raw_info.type != '纪录') {
            url = `https://${domain[site]}/tv-shows?search=&imdb=` + raw_info.url.match(/tt\d+/)[0];
            upload_url = `https://${domain[site]}/upload/tv`;
          }
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              doc = res.responseText;
              if ($('div.overlay-container', doc).length) {
                upload_url += '?movie_id=' + $('div.overlay-container', doc).find('a').attr('href').match(/\d+/)[0];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, '_blank');
              return;
            }
          });
        } else {
          var upload_url = `https://${domain[site]}/upload/movie`;
          if (raw_info.type != '电影') {
            upload_url = `https://${domain[site]}/upload/tv`;
          }
          jump_str = dictToString(raw_info);
          site_href = upload_url + separator + encodeURI(jump_str);
          window.open(site_href, '_blank');
          return;
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 11) ---
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

// --- From Module: 22_additional_handlers2.js (Snippet 12) ---
else if (forward_site == 'avz' || forward_site == 'PHD' || forward_site == 'CNZ') {
      var announce = $('h2:contains(announce)').text().replace('Announce URL:', '').trim();
      addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, announce);
      $('#form_upload_torrent').prepend(`<div class="form-group">
                                                    <label class="col-sm-2 control-label">Name</label>
                                                    <span><p style="padding-top:10px; padding-left:225px">${raw_info.name}</a></p></span>
                                                </div>
                                               <div class="form-group">
                                                    <label class="col-sm-2 control-label">IMDB</label>
                                                    <span><p style="padding-top: 10px; padding-left:225px"><a href=${raw_info.url} target="_blank">${raw_info.url.match(/tt\d+/)[0]}</a></p></span>
                                               </div>
                                               <div class="form-group">
                                                    <label class="col-sm-2 control-label">Country</label>
                                                    <span><p id="country" style="padding-top: 10px; padding-left:225px"></p></span>
                                               </div>`);
      if (raw_info.url) {
        getDoc(raw_info.url, null, function (doc) {
          var country = Array.from($('li.ipc-metadata-list__item:contains("Countr")', doc).find('a')).map(function (e) {
            return $(e).text();
          }).join(', ');
          $('#country').text(country);
        });
      }
      $('.alert-info').append(`<p style="font-size:14px">请上传亚洲影视（包括：南亚，东南亚，东亚）到 <a id="avz" class="other" href="#" style="color:yellow;text-decoration: underline;">AVZ</a>；
                上传欧洲（除了英国和爱尔兰）、南美和非洲以及50年前的影视到 <a id="CNZ" href="#" class="other" style="color:yellow;text-decoration: underline;">CNZ</a>；
                上传所有主流英语国家（美国、英国、加拿大、爱尔兰、苏格兰、澳洲、新西兰）到 <a id="PHD" href="#" class="other" style="color:yellow;text-decoration: underline;">PHD</a>。</p>`);
      $('.other').click((e) => {
        e.preventDefault();
        var site = e.target.id;
        var url_domain = {
          'avz': 'avistaz.to',
          'PHD': 'privatehd.to',
          'CNZ': 'cinemaz.to'
        }
        if (raw_info.url && forward_site != site) {
          e.preventDefault();
          var url = `https://${url_domain[site]}/movies?search=&imdb=` + raw_info.url.match(/tt\d+/)[0];
          var upload_url = `https://${url_domain[site]}/upload/movie`;
          if (raw_info.type != '电影' && raw_info.type != '纪录') {
            url = `https://${url_domain[site]}/tv-shows?search=&imdb=` + raw_info.url.match(/tt\d+/)[0];
            upload_url = `https://${url_domain[site]}/upload/tv`;
          }
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              console.log(res)
              doc = res.responseText;
              if ($('div.overlay-container', doc).length) {
                upload_url += '?movie_id=' + $('div.overlay-container', doc).find('a').attr('href').match(/\d+/)[0];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, "_self");
              return;
            }
          });
        } else if (forward_site != site) {
          var url = encodeURI(site_url.replace(url_domain[forward_site], url_domain[site]));
          window.open(url, "_self");
        }
      })
      try {
        var infos = get_mediainfo_picture_from_descr(raw_info.descr);
        var container = $('textarea[name="media_info"]');
        if (raw_info.full_mediainfo) {
          container.val(raw_info.full_mediainfo);
        } else {
          container.val(infos.mediainfo.replace(/\[.{1,20}\]/g, ''));
        }
        $('textarea[name="media_info"]').css({ 'height': '600px' });
      } catch (Err) {
        if (raw_info.full_mediainfo) {
          $('textarea[name="media_info"]').val(raw_info.full_mediainfo);
        } else {
          $('textarea[name="media_info"]').val(raw_info.descr);
        }
        $('textarea[name="media_info"]').css({ 'height': '600px' });
      }
    }

