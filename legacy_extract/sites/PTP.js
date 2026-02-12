/** Consolidated Logic for: PTP **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https?:\/\/passthepopcorn.me.*/)) {
  $('div.main-menu').find('ul').append(`<li class="main-menu__item" id="nav_free"><a class="main-menu__link" href="torrents.php?action=advanced&freetorrent=1&grouping=0">Free</a></li>`);
}

// --- From Module: 02_core_utilities.js (Snippet 2) ---
if (site_url.match(/^https:\/\/passthepopcorn.me\/torrents.php\?id=\d+&torrentid=\d+#separator#/)) {
  var tid = site_url.match(/torrentid=(\d+)/)[1];
  window.open($(`a[href*="action=download&id=${tid}"]`).attr('href'), '_blank');
}

// --- From Module: 09_data_processing.js (Snippet 3) ---
if (site == 'PTP') {
    input_box.style.width = '320px';
  }

// --- From Module: 09_data_processing.js (Snippet 4) ---
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

// --- From Module: 09_data_processing.js (Snippet 5) ---
if (site == 'PTP') {
              raw_info.descr = raw_info.descr.replace(/\[img\].*?(ptpimg|pixhost).*?\[\/img\]/g, '');
            }

// --- From Module: 09_data_processing.js (Snippet 6) ---
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

// --- From Module: 09_data_processing.js (Snippet 7) ---
if (site == 'PTP') {
        textarea.style.width = '675px';
      }

// --- From Module: 09_data_processing.js (Snippet 8) ---
if (['PTP', 'xthor', 'HDF', 'BHD', 'BLU', 'Tik', 'Aither', 'TorrentLeech', 'DarkLand', 'ACM', 'HDOli', 'Monika', 'DTR', 'HONE', 'FNP', 'OnlyEncodes', 'ReelFliX'].indexOf(site) > -1) {
    textarea.style.backgroundColor = '#4d5656';
    textarea.style.color = 'white';
    input_box.style.backgroundColor = '#4d5656';
    input_box.style.color = 'white';
  }

// --- From Module: 11_download_clients.js (Snippet 9) ---
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

// --- From Module: 11_download_clients.js (Snippet 10) ---
else if (['GPW', 'UHD', 'PTP', 'SC', 'MTV', 'NBL', 'ANT', 'TVV', 'HDF', 'BTN', 'OPS', 'RED', 'SugoiMusic'].indexOf(forward_site) > -1) {
    $('input[name=file_input]')[0].files = container.files;
    setTimeout(function () { $('#file')[0].dispatchEvent(evt); }, 1000);
  }

// --- From Module: 12_site_ui_helpers.js (Snippet 11) ---
if (site_url.match(/^https?:\/\/passthepopcorn.me\/torrents.php.*/) && extra_settings.ptp_show_group_name.enable) {
  const boldfont = true;
  const coloredfont = true;
  const groupnamecolor = '#20B2AA';

  const showblankgroups = true;
  const placeholder = 'Null';

  const delimiter = ' / ';
  const blockedgroup = 'TBB';
  const moviesearchtitle = 'Browse Torrents ::';
  const douban_prex = host_link + '#ptgen?tt';

  function formatText(str, color) {
    var style = [];
    if (boldfont) style.push('font-weight:bold');
    if (coloredfont && color) style.push(`color:${groupnamecolor}`);
    return `<span style="${style.join(';')}">${str}</span>`;
  }

  function setGroupName(groupname, target) {
    var color = true;
    if ($(target).parent().find('.golden-popcorn-character').length) {
      color = false;
    }
    if ($(target).parent().find('.torrent-info__download-modifier--free').length) {
      color = false;
    }
    if ($(target).parent().find('.torrent-info-link--user-leeching').length) {
      color = false;
    }
    if ($(target).parent().find('.torrent-info-link--user-seeding').length) {
      color = false;
    }
    if ($(target).parent().find('.torrent-info-link--user-downloaded').length) {
      color = false;
    }

    if (isEmptyOrBlockedGroup(groupname)) {
      if ($(target).text().split(delimiter).includes(blockedgroup)) {
        $(target).html(function (i, htmlsource) {
          return htmlsource.replace(delimiter + blockedgroup, '');
        });
        groupname = blockedgroup;
      }
      else if (showblankgroups) {
        groupname = placeholder;
      }
    }
    if (!isEmpty(groupname)) {
      var location = 1;
      try { location = ptp_name_location; } catch (err) { console.log(err) }
      if (location == 1) {
        return $(target).append(delimiter).append(formatText(groupname, color));
      } else {
        return $(target).prepend(delimiter).prepend(formatText(groupname, color));
      }
    }
  }

  function setDoubanLink(imdb_id, target) {
    if (!isEmpty(imdb_id)) {
      try {
        var td = target.parentNode.parentNode.getElementsByTagName('td')[1];
        var div = td.getElementsByClassName('basic-movie-list__movie__ratings-and-tags')[0];
        var new_div = document.createElement('div');
        new_div.setAttribute('class', 'basic-movie-list__movie__rating-container');
        new_div.style.fontweight = 'bold';
        var span = document.createElement('span');
        span.setAttribute('class', 'basic-movie-list__movie__rating__title');
        var a = document.createElement('a');
        var ptgen_url = douban_prex + imdb_id;
        a.href = "javascript:void(0);";
        a.text = 'PtGen';
        a.target = "_blank";
        span.appendChild(a);
        new_div.appendChild(span);
        div.insertBefore(new_div, div.firstElementChild);
        a.addEventListener('click', function (e) {
          e.preventDefault();
          var raw_info = { 'url': `http://www.imdb.com/title/tt${imdb_id}`, 'dburl': '', 'descr': '', 'bgmurl': '' };
          create_site_url_for_douban_info(raw_info, true).then(function (raw_info) {
            if (raw_info.dburl) {
              window.open(raw_info.dburl);
            }
          }, function (err) {
            console.error(err);
            window.open(ptgen_url, target = "_blank");
          });
        })
      } catch (err) { }
    }
  }

  function isEmpty(str) {
    return (!str || String(str).trim().length === 0);
  }
  function isEmptyOrBlockedGroup(str) {
    return (isEmpty(str) || str === blockedgroup);
  }

  if (document.title.indexOf(moviesearchtitle) !== -1) {
    var movies = PageData.Movies;
    var releases = [];
    var imdb_urls = [];
    movies.forEach(function (movie) {
      imdb_urls[movie.GroupId] = movie.ImdbId;
      movie.GroupingQualities.forEach(function (torrentgroup) {
        torrentgroup.Torrents.forEach(function (torrent) {
          if (torrent.ReleaseGroup) {
            releases[torrent.TorrentId] = torrent.ReleaseGroup;
          } else {
            var groupname = get_group_name(torrent.ReleaseName, '');
            releases[torrent.TorrentId] = groupname;
          }
        });
      });
    });
    if (PageData.ClosedGroups != 1) {
      releases.forEach(function (groupname, index) {
        $(`tbody a.torrent-info-link[href$="torrentid=${index}"]`).each(function () {
          setGroupName(groupname, this);
        });
      });
      imdb_urls.forEach(function (imdbid, groupid) {
        $(`tbody a.basic-movie-list__movie__cover-link[href$="id=${groupid}"]`).each(function () {
          setDoubanLink(imdbid, this);
        });
      })
    }
    else {
      var targetNodes = $('tbody');
      var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
      var myObserver = new MutationObserver(mutationHandler);
      var obsConfig = { childList: true, characterData: false, attributes: false, subtree: false };

      targetNodes.each(function () {
        myObserver.observe(this, obsConfig);
      });

      function mutationHandler(mutationRecords) {
        mutationRecords.forEach(function (mutation) {
          if (mutation.addedNodes.length > 0) {
            $(mutation.addedNodes).find('a.torrent-info-link').each(function () {
              var mutatedtorrentid = this.href.match(/\btorrentid=(\d+)\b/)[1];
              var groupname = releases[mutatedtorrentid];
              setGroupName(groupname, this);
            });
          }
        });
      }

    }
  } else if (document.title.indexOf('upload') !== -1) {
    try {
      $('.torrent-info-link').map((index, e) => {
        var groupname = $(e).attr('title');
        groupname = get_group_name(groupname, '');
        setGroupName(groupname, e);
      })
    } catch (err) { }
  } else {
    $('table#torrent-table a.torrent-info-link').each(function () {
      var groupname = $(this).parent().parent().data('releasegroup');
      if (groupname) {
        setGroupName(groupname, this);
      } else {
        var release_name = $(this).parent().parent().data('releasename');
        if (release_name !== undefined) {
          groupname = get_group_name(release_name, '');
        } else {
          groupname = 'Null';
        }
        setGroupName(groupname, this);
      }
    });
  }

  $('.torrent-info__reported').each(function () {
    $(this).css('color', '#FFAD86');
  });

  $('.torrent-info__download-modifier--free').each(function () {
    $(this).parent().css('color', '#4DFFFF');
  });

  $('.golden-popcorn-character').each(function () {
    var val = $(this).next().attr("class");
    if (val && !val.match(/torrent-info-link--user-leeching|torrent-info-link--user-seeding|torrent-info-link--user-downloaded/i)) {
      $(this).parent().css('color', '#FFD700');
      $(this).next().css('color', '#FFD700');
    } else {
      $(this).attr('class', val)
    }
  });

  $('.torrent-info__trumpable').each(function () {
    $(this).css('color', '#E8FFC4');
  });

  $('.torrent-info-link--user-seeding').each(function () {
    $(this).css('color', 'red');
  });

  $('.torrent-info-link--user-downloaded').each(function () {
    $(this).css('color', 'green');
  });

  $('.torrent-info-link--user-leeching').each(function () {
    $(this).css('color', 'MediumSpringGreen');
  });

  if (location.href.match(/id=\d+/)) {
    $('.group_torrent_header').each(function () {
      var $img = $(this).find('a').eq(3).find('img');
      var $old_url = $img.prop('src');
      $img.prop('src', $old_url)
    })
  }
}

// --- From Module: 12_site_ui_helpers.js (Snippet 12) ---
if (site_url.match(/^https?:\/\/passthepopcorn.me\/torrents.php\?id.*/) && extra_settings.ptp_show_douban.enable) {
  const addInfoToPage = (data) => {
    if (isChinese(data.title)) {
      $('.page__title').prepend(`<a  target='_blank' href="https://movie.douban.com/subject/${data.id}">[${data.title.split(' ')[0]}] </a>`);
    }
    if (data.summary) {
      var tmp = data.summary.split('   ');
      data.summary = '';
      for (var i = 0; i < tmp.length; i++) {
        var tmp_str = tmp[i].trim();
        if (tmp_str) {
          data.summary += '\t' + tmp_str + '\n';
        }
      }
      $('#movieinfo').before(`<div class="panel">
            <div class="panel__heading"><span class="panel__heading__title">简介</span></div>
            <div class="panel__body"  id="intro">&nbsp&nbsp&nbsp&nbsp${data.summary.trim()}</div></div>`);
    }
    $('#torrent-table').parent().prepend($('#movie-ratings-table').parent())
    try {
      $('#movieinfo').before(`
                <div class="panel">
                <div class="panel__heading"><span class="panel__heading__title">电影信息</span></div>
                <div class="panel__body">
                <div><strong>导演:</strong> ${data.director}</div>
                <div><strong>演员:</strong> ${data.cast}</div>
                <div><strong>类型:</strong> ${data.genre}</div>
                <div><strong>制片国家/地区:</strong> ${data.region}</div>
                <div><strong>语言:</strong> ${data.language}</div>
                <div><strong>时长:</strong> ${data.runtime}</div>
                <div><strong>又名:</strong>  ${data.aka}</div>
                </div>
            `)
    } catch (err) { }

    var total = 10;
    var split = '/';
    if (!data.average) {
      data.average = '暂无评分';
      total = '';
      data.votes = 0;
      split = '';
    }

    $('#movie-ratings-table tr').prepend(
      `<td colspan="1" style="width: 110px;">
                <center>
                <a target="_blank" class="rating" href="https://movie.douban.com/subject/${data.id}" rel="noreferrer">
                <div style="font-size: 0;min-width: 105px;">
                    <span class="icon-pt1" style="font-size: 14px;
                    display: inline-block;
                    text-align: center;
                    border: 1px solid #41be57;
                    background-color: #41be57;
                    color: white;
                    border-top-left-radius: 4px;
                    border-bottom-left-radius: 4px;
                    width: 24px;
                    height: 24px;
                    line-height: 24px;">豆</span>
                    <span class="icon-pt2" style="font-size: 14px;
                    display: inline-block;
                    text-align: center;
                    border: 1px solid #41be57;
                    color: #3ba94d;
                    background: #ffffff;
                    border-top-right-radius: 4px;
                    border-bottom-right-radius: 4px;
                    width: 69px;
                    height: 24px;
                    line-height: 24px;">豆瓣评分</span>
                </div>
                </a>
                </center>
            </td>
                <td style="width: 150px;">
                <span class="rating">${data.average}</span>
                <span class="mid">${split}</span>
                <span class="outof"> ${total} </span>
                <br>(${data.votes} votes)
            </td>`
    )
  }
  const isChinese = (title) => {
    return /[\u4e00-\u9fa5]+/.test(title)
  }
  const imdbLink = $('#imdb-title-link').attr('href');
  if (!imdbLink) {
    return;
  }
  getData(imdbLink, function (data) {
    console.log(data);
    if (data.data) {
      addInfoToPage(data['data']);
    } else {
      return;
    }
  });
  var letterboxd_url = 'https://letterboxd.com/imdb/' + imdbLink.match(/tt\d+/)[0];
  getDoc(letterboxd_url, null, function (doc) {
    var b_url = $('meta[property="og:url"]', doc).prop('content');
    var r_url = b_url.replace('.com/', '.com/csi/') + 'ratings-summary/';
    getDoc(r_url, null, function (rating_doc) {
      var rating_info = $('.average-rating', rating_doc).html();
      console.log(rating_info);
      var rates = rating_info.match(/Weighted average of (.*?) based on (\d+).*?ratings/)[1];
      var votes = rating_info.match(/Weighted average of (.*?) based on (\d+).*?ratings/)[2];
      rates = (parseFloat(rates) * 2).toFixed(1);
      console.log(rates, votes);
      $('#ptp_rating_td').prev().before(`
                <td colspan="1" style="width: 128px;" id="letterboxd_rating_td">
                    <center>
                        <a target="_blank" class="rating" id="letterboxd-title-link" href="${b_url}" rel="noreferrer">
                        <img src="data:image/png;base64,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" style="height:64px;width:64px;" title="LetterBoxd"></a>
                    </center>
                </td>
                <td style="width: 150px;">
                    <span class="rating">${rates}</span>
                    <span class="mid">/</span>
                    <span class="outof">10</span>
                    <br>(${votes} votes)
                </td>
            `);
      $('#ptp_rating_td').css("width", "");
      $('#letterboxd_rating_td').prev().css("width", "150px");
    })
  });
}

// --- From Module: 13_site_ui_helpers2.js (Snippet 13) ---
if (raw_info.origin_site == 'PTP') {
        let poster = document.querySelector('.sidebar-cover-image')?.src;
        if (poster) {
          data = data.replace(/https:\/\/img\d.doubanio.com.*?jpg/, poster);
        }
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 14) ---
if (origin_site == 'PTP') {
      if (site_url.match(/torrentid=(\d+)/)) {
        torrent_id = site_url.match(/torrentid=(\d+)/)[1];
      }
      try {
        raw_info.url = document.getElementById("imdb-title-link").href;
      } catch (err) { }
      tbody = document.getElementById("torrent-table");
      var tr_matched = document.getElementById('group_torrent_header_' + torrent_id);

      if (tr_matched.innerHTML.match(/High quality torrent/)) {
        raw_info.golden_torrent = true;
      }
      try {
        var youtube_info = $('.youtube-player').attr('src');
        raw_info.youtube_url = youtube_info.match(/https:\/\/www.youtube.com\/embed\/([a-zA-Z0-9-]*)/)[1];
      } catch (err) { }
      raw_info.ptp_poster = $('.sidebar-cover-image').parent().html();
      if (raw_info.ptp_poster.match(/https:\/\/ptpimg.me\/.*?.(jpg|png)/)) {
        raw_info.ptp_poster = raw_info.ptp_poster.match(/https:\/\/ptpimg.me\/.*?.(jpg|png)/)[0];
      } else {
        raw_info.ptp_poster = '';
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 15) ---
if (['PTP', 'MTV', 'UHD', 'HDF', 'RED', 'BTN', 'jpop', 'GPW', 'HD-Only', 'SC', 'ANT', 'lztr', 'DICMusic', 'OPS', 'TVV', 'SugoiMusic'].indexOf(origin_site) > -1) {
        if (origin_site == 'PTP' || origin_site == 'UHD' || origin_site == 'GPW' || origin_site == 'SC' || origin_site == 'ANT') {
          raw_info.type = '电影';
        } else if (origin_site == 'BTN' || origin_site == 'MTV' || origin_site == 'TVV') {
          raw_info.type = '剧集';
        }
        if (tds[i].innerHTML.match(`torrent_(torrent_|detail_)?${torrent_id}`) || (['BTN', 'jpop', 'TVV', 'SugoiMusic'].indexOf(origin_site) > -1 && tds[i].parentNode.innerHTML.match('id=' + torrent_id))) {
          table = tds[i].parentNode.parentNode;
          if (origin_site == 'HDF' || origin_site == 'UHD') {
            if (tds[i].parentNode.textContent.match(/s\d{1,3}/i)) {
              raw_info.type = '剧集';
            } else {
              raw_info.type = '电影';
            }
          } else if (origin_site == 'RED') {
            raw_info.small_descr = tds[i].getElementsByTagName('a')[3].textContent;
            var tr = tds[i].parentNode;
            while (true) {
              tr = tr.previousElementSibling;
              var class_info = tr.getAttribute('class');
              if (class_info.match(/release/) && !class_info.match(/torrentdetails/)) {
                raw_info.music_media = tr.textContent.trim();
                break;
              }
            }
          }
          if (!is_inserted) {
            var child_nodes = table.childNodes;
            var rowcount = 0;
            for (k = 0; k < child_nodes.length; k++) {
              if (child_nodes[k].nodeName == 'TR') {
                rowcount = rowcount + 1;
                if (child_nodes[k].id.match(`torrent_(torrent_|detail_)?${torrent_id}`)) {
                  break;
                }
              }
            }
            search_row = table.insertRow(rowcount - 1);
            insert_row = table.insertRow(rowcount - 1);
            is_inserted = true;
          }
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 16) ---
if (origin_site == 'PTP' || origin_site == 'UHD' || origin_site == 'GPW' || origin_site == 'SC' || origin_site == 'ANT') {
          raw_info.type = '电影';
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 17) ---
if (origin_site == 'PTP') {
      var torrent_box = document.getElementById("torrent_" + torrent_id);
      var subtitle_box = $(torrent_box).find('#subtitle_manager');
      subtitle_box.find('img').map((idnex, e) => {
        if ($(e).attr('title') != "No Subtitles" && !$(e).parent().is("a")) {
          raw_info.subtitles.push($(e).attr('title'));
        }
      });
      if ($('#trumpable_' + torrent_id).length && $('#trumpable_' + torrent_id).text().match('Hardcoded Subtitles')) {
        raw_info.subtitles.push('Hardcoded');
      }

      raw_info.edition_info = $(`#group_torrent_header_${torrent_id}`).find('a[id="PermaLinkedTorrentToggler"]').text();

      var torrent_div = torrent_box.getElementsByClassName("bbcode-table-guard");
      raw_info.comparisons = walk_ptp(torrent_div[0].cloneNode(true)).trim();
      $(torrent_box).find('a[onclick*="BBCode.MediaInfoToggleShow"]').each((index, e) => {
        raw_info.multi_mediainfo += `[quote]${$(e).next().next().text()}[/quote]`;
      });
      torrent_div = torrent_div[torrent_div.length - 1];

      var tmp_tag_as = torrent_div.getElementsByTagName('a');
      var compare_picture = '';
      for (i = 0; i < tmp_tag_as.length; i++) {
        if (tmp_tag_as[i].getAttribute("onclick") == 'BBCode.MediaInfoToggleShow( this );') {
          raw_info.name = tmp_tag_as[i].textContent.replace(/\[|\]|\(|\)|mkv$|mp4$/g, '').trim();
        }
        try {
          if (tmp_tag_as[i].getAttribute("onclick").match(/BBCode.ScreenshotComparisonToggleShow/i)) {
            comparing_picture = tmp_tag_as[i].getAttribute("onclick");
            info = comparing_picture.match(/\[.*?\]/ig);
            if (info) {
              try {
                tmp_string_0 = info[0].replace(/\[|\]|"/ig, '');
                tmp_string_0 = tmp_string_0.replace(/,/ig, ' | ');
                compare_picture += '\n' + tmp_string_0 + '\n';
                team_count = tmp_string_0.split('|').length;
                tmp_string_1 = info[1].replace(/\[|\]|"/ig, '');
                pictures = tmp_string_1.split(',');
                for (idd = 0; idd < pictures.length; idd++) {
                  if ((idd + 1) % team_count == 0) {
                    compare_picture += '[img]' + pictures[idd].replace(/\\/g, '') + '[/img]\n';
                  } else {
                    compare_picture += '[img]' + pictures[idd].replace(/\\/g, '') + '[/img]';
                  }
                }
              } catch (err) {
              }
            }
          }
        } catch (err) {
        }
      }

      if (!raw_info.name || !raw_info.descr.match(raw_info.name)) {
        var file_box = document.getElementById('files_' + torrent_id);
        raw_info.name = file_box.getElementsByTagName('td')[0].textContent.replace(/\[|\]|\(|\)|mkv$|mp4$/g, '').trim();
      }
      var descr_box = torrent_box.getElementsByTagName('blockquote');
      for (i = 0; i < descr_box.length; i++) {
        var tmp_descr = descr_box[i].textContent;
        if (tmp_descr.match(/Unique ID|DISC INFO:|.MPLS|General/i)) {
          descr_info = descr_box[i].textContent;
          if (descr_info.match(/Complete.*?name.*?(VOB|IFO)/i)) {
            if (descr_info.match(/Complete.*?name.*?VOB/i)) {
              descr_info += '[/quote]\n\n[quote]' + descr_box[i + 1].textContent;
            } else {
              descr_info = descr_box[i + 1].textContent + '[/quote]\n\n[quote]' + descr_info;
            }
          }
          break;
        }
      }
      if (raw_info.edition_info.match(/DVD\d/)) {
        raw_info.medium_sel = 'DVD';
        raw_info.name = $('h2').text().split(/\[.*?\]/)[0] + $('h2').text().match(/\[(\d+)\]/)[1];
        raw_info.name += ' ' + raw_info.edition_info.match(/NTSC|PAL/)[0];
        raw_info.name += ' ' + raw_info.edition_info.match(/DVD\d+/)[0];
      }
      try {
        raw_info.descr = '[quote]' + descr_info + '[/quote]\n\n';
      } catch (err) { }
      var img_urls = '';
      var imgs = torrent_div.getElementsByTagName('img');
      for (i = 0; i < imgs.length; i++) {
        img_urls += '[img]' + imgs[i].src + '[/img]\n';
      }
      raw_info.descr += img_urls;

      var img = Array.from(imgs);
      img.forEach(e => { e.classList.add('checkable_IMG'); e.onclick = ''; });
      $('.checkable_IMG').imgCheckbox({
        onclick: function (el) {
          var isChecked = el.hasClass("imgChked"),
            imgEl = el.children()[0]; // the img element
          img_src = imgEl.src;
          if (isChecked) {
            raw_info.images.push(img_src);
          } else {
            raw_info.images.remove(img_src);
          }
          console.log(raw_info.images);
        },
        "graySelected": false,
        "checkMarkSize": "20px",
        "fadeCheckMark": false
      });

      if (compare_picture) {
        raw_info.descr += '\n\n[b]对比图[/b]\n' + compare_picture;
      }

      raw_info.name = raw_info.name.replace(/\s+-\s+/i, '-');
      //PTP原盘处理
      if (raw_info.descr.match(/.MPLS/i)) {
        var tmp_name = document.getElementsByTagName('h2')[0].textContent.split('[')[0].trim();
        var tmp_year = document.getElementsByTagName('h2')[0].textContent.match(/\[(\d+)\]/)[1];
        raw_info.name = get_bluray_name_from_descr(raw_info.descr, tmp_name + ' ' + tmp_year);
        var team = document.getElementById('group_torrent_header_' + torrent_id).getAttribute('data-releasegroup');
        if (team) {
          raw_info.name = raw_info.name.replace('NoGroup', team);
        }
        raw_info.medium_sel = 'Blu-ray';
        raw_info.name = raw_info.name.replace(/bluray/i, 'Blu-ray');
      }
      else {
        raw_info.name = raw_info.name;
      }
      raw_info.version_info = $(`#group_torrent_header_${torrent_id}`).find('#PermaLinkedTorrentToggler').text();
      raw_info.torrent_url = `https://passthepopcorn.me/` + $(`a[href*="download&id=${torrent_id}"]`).attr('href');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 18) ---
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

// --- From Module: 16_origin_site_parsing3.js (Snippet 19) ---
if (site == 'PTP') {
        if (search_mode == 0 || if_exclusive) {
          return;
        }
        if (raw_info.type != '电影' || (raw_info.name + raw_info.small_descr).match(/DIY|@/)) {
          if (!confirm('该资源可能不是电影或者属于DIY资源，确定发布？')) {
            e.preventDefault();
            return;
          }
        }
        if (raw_info.name.match(/BMDru/)) {
          if (!confirm('该小组作品被PTP认定为劣质资源，确定发布？')) {
            e.preventDefault();
            return;
          }
        }
        if (raw_info.url) {
          var url = 'https://passthepopcorn.me/torrents.php?searchstr=' + raw_info.url.match(/tt\d+/)[0];
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              var upload_url = 'https://passthepopcorn.me/upload.php';
              if (res.finalUrl.match(/id=\d+/)) {
                upload_url += '?group' + res.finalUrl.match(/id=\d+/)[0];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, '_blank');
              return;
            }
          });
        } else {
          var url = 'https://passthepopcorn.me/torrents.php?searchstr=' + search_name;
          GM_xmlhttpRequest({
            method: 'GET',
            url: url,
            onload: function (res) {
              var upload_url = 'https://passthepopcorn.me/upload.php';
              if (res.finalUrl.match(/id=\d+/)) {
                upload_url += '?group' + res.finalUrl.match(/id=\d+/)[0];
              }
              jump_str = dictToString(raw_info);
              site_href = upload_url + separator + encodeURI(jump_str);
              window.open(site_href, '_blank');
              return;
            }
          });
        }
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 20) ---
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

// --- From Module: 18_forward_site_filling2.js (Snippet 21) ---
else if (['BLU', 'Tik', 'Aither', 'BHD', 'iTS', 'PTP', 'ACM', 'Monika', 'DarkLand'].indexOf(forward_site) < 0) {
      setTimeout(() => {
        try {
          document.getElementsByName('uplver')[0].checked = if_uplver;
        } catch (err) { }
      }, 1000)
    }

// --- From Module: 21_additional_handlers1.js (Snippet 22) ---
else if (forward_site == 'PTP') {
      var announce = $('input[value*="announce"]').val();
      addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, announce);
      if ($('#imdb').is(':visible')) {
        $('#imdb').val(raw_info.url);
        $('#autofill').click();
      }
      if (!$('#image').val() && raw_info.url) {
        getDoc(raw_info.url, null, function (doc) {
          if (!raw_info.ptp_poster) {
            try {
              $('#image').val($('a[href*=tt_ov_i]', doc).first().parent().find('img').attr('src').split('_V1_')[0] + '_V1_.jpg');
            } catch (err) { }
          }
        });
      }
      $('#remaster').parent().prepend(`<font color="red">这里脚本默认勾选了版本信息，如果没有特殊版本信息请记得取消勾选。</font><br>`);
      $('#remaster').prop('checked', true);
      $('#remaster_true').removeClass('hidden');

      switch (raw_info.medium_sel) {
        case 'UHD': case 'Blu-ray': case 'Encode': case 'Remux': $('#source').val('Blu-ray'); break;
        case 'HDTV': $('#source').val('HDTV'); break;
        case 'WEB-DL': $('#source').val('WEB'); break;
        case 'DVD': $('#source').val('DVD'); break;
        case 'TV': $('#source').val('TV'); break;
      }
      if (raw_info.name.match(/hd-dvd/i)) {
        $('#source').val('HD-DVD');
      }

      switch (raw_info.codec_sel) {
        case 'H265': $('#codec').val('H.265'); break;
        case 'H264': $('#codec').val('H.264'); break;
        case 'X264': $('#codec').val('x264'); break;
        case 'X265': $('#codec').val('x265'); break;
        case 'VC-1': $('#codec').val('VC-1'); break;
        case 'XVID': $('#codec').val('XviD'); break;
        case 'DIVX': $('#codec').val('DivX'); break;
        case 'MPEG-2': case 'MPEG-4':
          $('#codec').val('Other');
          $('#codec')[0].dispatchEvent(evt);
          $('#other_codec').val(raw_info.codec_sel);
          break;
      }
      if (raw_info.name.match(/dvd5/i)) {
        $('#codec').val('DVD5');
      } else if (raw_info.name.match(/dvd9/i)) {
        $('#codec').val('DVD9');
      }

      var size = 0;
      if ((raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') && raw_info.descr.match(/mpls/i)) {
        size = get_size_from_descr(raw_info.descr);
        if (0 <= size && size < 23.28) {
          $('#codec').val('BD25');
        } else if (size < 46.57) {
          $('#codec').val('BD50');
        } else if (size < 61.47) {
          $('#codec').val('BD66');
        } else {
          $('#codec').val('BD100');
        }
        $('#container').val('m2ts');
      }

      if (raw_info.standard_sel == 'SD') {
        var height = raw_info.descr.match(/Height.*?:(.*?)pixels/i)[1].trim();
        if (height == '480') {
          raw_info.standard_sel = '480p';
        } else if (height == '576') {
          raw_info.standard_sel = '576p';
        }
        if (raw_info.name.match(/576p/i)) {
          raw_info.standard_sel = '576p';
        }
      }
      var standard_dict = {
        'SD': '480p', '720p': '720p', '1080i': '1080i', '1080p': '1080p', '4K': '2160p', '': 'Other', '480p': '480p', '576p': '576p'
      };
      if (standard_dict.hasOwnProperty(raw_info.standard_sel)) {
        $('#resolution').val(standard_dict[raw_info.standard_sel])
      }
      if (raw_info.name.match(/pal/i)) {
        $('#resolution').val('PAL');
      } else if (raw_info.name.match(/ntsc/i)) {
        $('#resolution').val('NTSC');
      }
      if ($('#resolution').val() == 'Other') {
        $('#resolution')[0].dispatchEvent(evt);
        $('input[name="other_resolution_width"]').val(raw_info.descr.match(/Width.*?(\d+).*?pixels/i)[1]);
        $('input[name="other_resolution_height"]').val(raw_info.descr.match(/Height.*?(\d+).*?pixels/i)[1]);
      }

      try {
        infos = get_mediainfo_picture_from_descr(raw_info.descr);
        get_full_size_picture_urls(null, infos.pic_info, $('#nowhere'), true, function (data) {
          if (raw_info.full_mediainfo) {
            $('#release_desc').val(raw_info.full_mediainfo + '\n\n' + data.trim());
          } else {
            $('#release_desc').val(infos.mediainfo + '\n\n' + data.trim());
          }
        });
      } catch (err) {
        raw_info.descr = raw_info.descr.replace(/\[\/?.{1,20}\]\n?/g, '');
        $('#release_desc').val(raw_info.descr);
      }

      if ($('#release_desc').val().match(/Audio Video Interleave|AVI/i)) {
        $('#container').val('AVI');
      } else if ($('#release_desc').val().match(/mp4|\.mp4/i)) {
        $('#container').val('MP4');
      } else if ($('#release_desc').val().match(/Matroska|\.mkv/i)) {
        $('#container').val('MKV');
      } else if ($('#release_desc').val().match(/\.mpg/i)) {
        $('#container').val('MPG');
      } else if (raw_info.descr.match(/MPLS/i)) {
        $('#container').val('m2ts');
      }
      $('#container')[0].dispatchEvent(evt);
      $('#preview_button').before(`<font color="red">由于PTP预览可以自动勾选字幕并且看图床是否正确显示，请先勾选预览后返回发布。<br><br></font>`);
    }

