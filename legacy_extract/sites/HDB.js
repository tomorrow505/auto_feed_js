/** Consolidated Logic for: HDB **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https?:\/\/hdbits.org\/details.php\?id=.*/)) {
  hdb_color = GM_getValue('HDB_Color');
  if (hdb_color === undefined) {
    getDoc('https://hdbits.org/my.php', null, function (doc) {
      const css = $('input[name="custom_css"]', doc).val();
      if (/berlin.css/.test(css)) {
        GM_setValue('HDB_Color', 'white');
      } else {
        GM_setValue('HDB_Color', 'black');
      }
    });
  }
}

// --- From Module: 02_core_utilities.js (Snippet 2) ---
if (site_url.match(/^https?:\/\/.*(imgbox.com|imagebam.co|pixhost.to|img.hdbits.org).?$/)) {
  var images = GM_getValue('HDB_images') !== undefined ? GM_getValue('HDB_images').split(', ') : '';
  if (images && $('input[name="files[]"]').length) {
    $('div.visible-desktop:first').find('span:first').append(`<br><br><input type="button" value="拉取图片" id="add_images"/>`);
    $('#add_images').click(() => {
      $('#add_images').val("拉取中……");
      var gallary_name = images.pop();
      let container = new DataTransfer();
      var pros = [];
      images.map((item) => {
        console.log(item)
        if (item.match(/t.hdbits.org/)) {
          item = item.replace('t.hdbits.org', 'i.hdbits.org').replace('jpg', 'png');
        }
        if (item.match(/jpg|png/)) {
          var p = getImage(item);
          pros.push(p);
        }
      });
      Promise.all(pros).then((data) => {
        data.forEach((i) => {
          container.items.add(i);
        });
        $('input[name="files[]"]')[0].files = container.files;
        $('input[name="files[]"]')[0].dispatchEvent(evt);
        $('#gallery-title').val(gallary_name);
        $('#add_images').val("拉取成功！");
      });
    });
  }
  if (site_url.match(/pixhost.to|img.hdbits.org/)) {
    if (images.length && images[0]) {
      $('div.logo').append(`<br><br><input type="button" value="拉取图片" id="add_images"/>`);
      $('#header').after(`<br><br><div align="center"><input type="button" value="拉取图片" id="add_images"/></div>`);
    }
    $('#add_images').click(() => {
      $('#add_images').val("拉取中……");
      var gallary_name = images.pop();
      let container = new DataTransfer();
      var pros = [];
      images.map((item) => {
        if (item.match(/t.hdbits.org/)) {
          item = item.replace('t.hdbits.org', 'i.hdbits.org').replace('jpg', 'png');
        }
        console.log(item)
        if (item.match(/jpg|png/)) {
          var p = getImage(item);
          pros.push(p);
        }
      });
      Promise.all(pros).then((data) => {
        data.forEach((i) => {
          container.items.add(i);
        });
        $('input[type="file"]')[0].files = container.files;
        $('input[type="file"]')[0].dispatchEvent(evt);
        if (site_url.match(/pixhost/)) {
          $('input.max_th_size').val('350');
          $('input.max_th_size')[0].dispatchEvent(evt);
          $('#gallery_box').attr('checked', true);
          $('#gallery_box')[0].dispatchEvent(evt);
          $('input[name="gallery_name"]').val(gallary_name);
        } else {
          $('#thumbsize').val('w350');
          $('#galleryname').val(gallary_name);
        }

        $('#add_images').val("拉取成功！");
        GM_setValue('HDB_images', '');
      });
    });
  }
  var imgs_64 = GM_getValue('64imgs') !== undefined ? JSON.parse(GM_getValue('64imgs')) : [];
  if (imgs_64.length) {
    function b64toBlob(b64Data, contentType, sliceSize) {
      contentType = contentType || '';
      sliceSize = sliceSize || 512;
      var byteCharacters = atob(b64Data);
      var byteArrays = [];
      for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
        var slice = byteCharacters.slice(offset, offset + sliceSize);
        var byteNumbers = new Array(slice.length);
        for (var i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        var byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      var blob = new Blob(byteArrays, { type: contentType });
      return blob;
    }
    if (site_url.match(/imgbox/)) {
      $('div.visible-desktop:first').find('span:first').append(`<br><br><input type="button" value="拉取BASE64图片" id="add_64images"/>`);
    } else {
      $('div.main-content').after(`<br><br><input type="button" value="拉取BASE64图片" id="add_64images"/>`);
    }
    $('#add_64images').click(() => {
      var gallary_name = imgs_64.pop();
      let container = new DataTransfer();
      imgs_64.forEach((item, index) => {
        console.log(item)
        var blob = b64toBlob(item.replace('data:image/png;base64,', ''), 'image/png');
        const file = new window.File([blob], `thumbnail-${index}.png`, { type: blob.type });
        container.items.add(file);
      });
      if (site_url.match(/imgbox/)) {
        $('input[name="files[]"]')[0].files = container.files;
        $('input[name="files[]"]')[0].dispatchEvent(evt);
        $('#gallery-title').val(gallary_name);
      } else {
        $('input[class="dz-hidden-input"]')[0].files = container.files;
        $('input[class="dz-hidden-input"')[0].dispatchEvent(evt);
        $('input[value="sfw"]').attr('checked', true);
        $('#gallery').attr('checked', true);
        $('#gallery')[0].dispatchEvent(evt);
        $('#thumbnail-size').val(4);
        $('#gallery-title').val(gallary_name);
      }
    });
  }
  return;
}

// --- From Module: 02_core_utilities.js (Snippet 3) ---
if (item.match(/t.hdbits.org/)) {
          item = item.replace('t.hdbits.org', 'i.hdbits.org').replace('jpg', 'png');
        }

// --- From Module: 02_core_utilities.js (Snippet 4) ---
if (site_url.match(/pixhost.to|img.hdbits.org/)) {
    if (images.length && images[0]) {
      $('div.logo').append(`<br><br><input type="button" value="拉取图片" id="add_images"/>`);
      $('#header').after(`<br><br><div align="center"><input type="button" value="拉取图片" id="add_images"/></div>`);
    }
    $('#add_images').click(() => {
      $('#add_images').val("拉取中……");
      var gallary_name = images.pop();
      let container = new DataTransfer();
      var pros = [];
      images.map((item) => {
        if (item.match(/t.hdbits.org/)) {
          item = item.replace('t.hdbits.org', 'i.hdbits.org').replace('jpg', 'png');
        }
        console.log(item)
        if (item.match(/jpg|png/)) {
          var p = getImage(item);
          pros.push(p);
        }
      });
      Promise.all(pros).then((data) => {
        data.forEach((i) => {
          container.items.add(i);
        });
        $('input[type="file"]')[0].files = container.files;
        $('input[type="file"]')[0].dispatchEvent(evt);
        if (site_url.match(/pixhost/)) {
          $('input.max_th_size').val('350');
          $('input.max_th_size')[0].dispatchEvent(evt);
          $('#gallery_box').attr('checked', true);
          $('#gallery_box')[0].dispatchEvent(evt);
          $('input[name="gallery_name"]').val(gallary_name);
        } else {
          $('#thumbsize').val('w350');
          $('#galleryname').val(gallary_name);
        }

        $('#add_images').val("拉取成功！");
        GM_setValue('HDB_images', '');
      });
    });
  }

// --- From Module: 02_core_utilities.js (Snippet 5) ---
if (item.match(/t.hdbits.org/)) {
          item = item.replace('t.hdbits.org', 'i.hdbits.org').replace('jpg', 'png');
        }

// --- From Module: 02_core_utilities.js (Snippet 6) ---
if (site_url.match(/^https:\/\/uhdbits.org\/torrents.php\?id=\d+#separator#/)) {
  var user_page = $('#nav_userinfo').find('a:first').attr('href');
  $('#torrent_details').find('tr[class*=torrentdetails]').map((index, e) => {
    if ($(e).find(`a[href*="${user_page}"]`).length) {
      if ($(e).find('span[class="time tooltip"]').text().match(/^(\d+ mins?|Just now)/)) {
        tid = $(e).attr('id').match(/\d+/)[0];
        var durl = $(`a[href*="action=download&id=${tid}"]`).attr('href');
        window.open(durl, '_blank');
      }
    }
  });
}

// --- From Module: 02_core_utilities.js (Snippet 7) ---
if (site_url.match(/^https:\/\/hdbits.org\/details.php\?id=\d+&uploaded=1/)) {
  window.open($('a[href*="/download.php/"]').attr('href'), '_blank');
  return;
}

// --- From Module: 09_data_processing.js (Snippet 8) ---
if (site == 'HDB') {
    var send_pixhost = document.createElement('input');
    send_pixhost.type = "button";
    send_pixhost.id = 'send_pixhost';
    send_pixhost.value = 'PIXHOST';
    send_pixhost.style.marginLeft = '12px';
    send_pixhost.onclick = function () {
      if (raw_info.images.length > 0) {
        raw_info.images.push(raw_info.name.replace(/ /g, '.'));
        GM_setValue('HDB_images', raw_info.images.join(', '));
        window.open('https://pixhost.to/', '_blank');
      } else {
        alert('请选择要转存的图片！！！')
      }
    };
    container.appendChild(send_pixhost);

    var send_ptpimg = document.createElement('input');
    send_ptpimg.type = "button";
    send_ptpimg.id = 'send_ptpimg';
    send_ptpimg.value = 'PTPIMG';
    send_ptpimg.style.marginLeft = '12px';
    send_ptpimg.onclick = function () {
      if (raw_info.images.length > 0) {
        GM_setValue('HDB_images', raw_info.images.join(', '));
        window.open('https://ptpimg.me/', '_blank');
      } else {
        alert('请选择要转存的图片！！！')
      }
    };
    container.appendChild(send_ptpimg);

    var send_imgbox = document.createElement('input');
    send_imgbox.type = "button";
    send_imgbox.id = 'send_ptpimg';
    send_imgbox.value = 'IMGBOX';
    send_imgbox.style.marginLeft = '12px';
    send_imgbox.onclick = function () {
      if (raw_info.images.length > 0) {
        raw_info.images.push(raw_info.name.replace(/ /g, '.'));
        GM_setValue('HDB_images', raw_info.images.join(', '));
        window.open('https://imgbox.com/', '_blank');
      } else {
        alert('请选择要转存的图片！！！')
      }
    };
    container.appendChild(send_imgbox);
  }

// --- From Module: 09_data_processing.js (Snippet 9) ---
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

// --- From Module: 12_site_ui_helpers.js (Snippet 10) ---
if (site_url.match(/^https?:\/\/hdbits.org\/browse.php*/)) {
  var css = [
    ".tablesorter-default .header,",
    ".tablesorter-default .tablesorter-header {",
    "    padding: 4px 20px 4px 4px;",
    "    cursor: pointer;",
    "    background-image: url(data:image/gif;base64,R0lGODlhFQAJAIAAAP///////yH5BAEAAAEALAAAAAAVAAkAAAIXjI+AywnaYnhUMoqt3gZXPmVg94yJVQAAOw==);",
    "    background-position: center right;",
    "    background-repeat: no-repeat;",
    "}",
    ".tablesorter-default thead .headerSortUp,",
    ".tablesorter-default thead .tablesorter-headerSortUp,",
    ".tablesorter-default thead .tablesorter-headerAsc {",
    "    background-image: url(data:image/gif;base64,R0lGODlhFQAEAIAAAP///////yH5BAEAAAEALAAAAAAVAAQAAAINjI8Bya2wnINUMopZAQA7);",
    "    border-bottom: #888 1px solid;",
    "}",
    ".tablesorter-default thead .headerSortDown,",
    ".tablesorter-default thead .tablesorter-headerSortDown,",
    ".tablesorter-default thead .tablesorter-headerDesc {",
    "    background-image: url(data:image/gif;base64,R0lGODlhFQAEAIAAAP///////yH5BAEAAAEALAAAAAAVAAQAAAINjB+gC+jP2ptn0WskLQA7);",
    "    border-bottom: #888 1px solid;",
    "}",
    ".tablesorter-default thead .sorter-false {",
    "    background-image: none;",
    "    cursor: default;",
    "    padding: 4px;",
    "}",
    ".disc-100, .disc-50, .disc-25, .disc-neu {",
    "    font-weight: bold;",
    "}",
    ".disc-100 {",
    "    color: #009;",
    "}",
    ".disc-50 {",
    "    color: darkgreen;",
    "}",
    ".disc-25 {",
    "    color: darkred;    ",
    "}",
    ".disc-neu {",
    "    color: #666;       ",
    "}"
  ].join("\n");


  if (typeof GM_addStyle != 'undefined') {
    GM_addStyle(css);
  } else if (typeof PRO_addStyle != 'undefined') {
    PRO_addStyle(css);
  } else if (typeof addStyle != 'undefined') {
    addStyle(css);
  } else {
    var node = document.createElement('style');
    node.type = 'text/css';
    node.appendChild(document.createTextNode(css));
    var heads = document.getElementsByTagName('head');
    if (heads.length > 0) {
      heads[0].appendChild(node);
    } else {
      document.documentElement.appendChild(node);
    }
  }


  this.$ = this.jQuery = jQuery.noConflict(true);

  $('#torrent-list > thead > tr > th:eq(1)').after('<th class="center">FL</th>');

  $('#torrent-list > tbody > tr > td:nth-child(3)').each(function () {
    var discount = $(this).find('a').attr('title').split(' ')[0];
    switch (discount) {
      case '100%':
        $(this).after('<td class="disc-100 center">100%</td>');
        if (extra_settings.hdb_show_discount_color.enable) {
          $(this).parent().css('background', 'linear-gradient(rgba(0,0,153,0.2), rgba(188,202,214,0.5), rgba(0,0,153,0.2))');
        }
        break;
      case '50%':
        $(this).after('<td class="disc-50 center">50%</td>');
        if (extra_settings.hdb_show_discount_color.enable) {
          $(this).parent().css('background', 'linear-gradient(rgba(0,153,0,0.2), rgba(188,202,214,0.5), rgba(0,153,0,0.2))');
        }
        break;
      case '25%':
        $(this).after('<td class="disc-25 center">25%</td>');
        if (extra_settings.hdb_show_discount_color.enable) {
          $(this).parent().css('background', 'linear-gradient(rgba(153,0,0,0.2), rgba(188,202,214,0.5), rgba(153,0,0,0.2))');
        }
        break;
      case 'Neutral':
        $(this).after('<td class="disc-neu center">NEU</td>');
        if (extra_settings.hdb_show_discount_color.enable) {
          $(this).parent().css('background', 'linear-gradient(rgba(102,102,102,0.4), rgba(188,202,214,0.5), rgba(102,102,102,0.4))');
        }
        break;
      case 'All':
        $(this).after('<td class="center">—</td>');
        break;
    }
  });
}

// --- From Module: 12_site_ui_helpers.js (Snippet 11) ---
if (site_url.match(/^https?:\/\/hdbits.org\/details.php\?id=.*/) && extra_settings.hdb_show_douban.enable) {
  try {
    var links = $('table.contentlayout').find('a[href^="https://www.imdb.com/title/"]');
    if (links.length == 0) {
      links = $('.showlinks').find('a[href^="https://www.imdb.com/title/"]');
      if (links.length == 0) {
        return;
      }
    }
    getData(links[0].href, function (data) {
      console.log(data['data'])
      addInfoToPage(data['data']);
    });
    const addInfoToPage = (data) => {
      if (data.cast.split('/').length > 8) {
        data.cast = data.cast.split('/').slice(0, 8).join('/');
      }
      if (data.director.split('/').length > 8) {
        data.director = data.director.split('/').slice(0, 8).join('/');
      }

      var label = '- ';
      var status = 'block';
      if (hdb_hide_douban) {
        label = '+ ';
        status = 'none';
      }

      $('#details > tbody > tr').eq(1).after(`
                <tr><td>
                <div id="l20201117" class="label collapsable" onclick="showHideEl(20201117)"><span class="plusminus">${label}</span>关于本片 (豆瓣信息)</div>
                <div id="c20201117" class="hideablecontent" style="display: ${status};">
                    <table class="contentlayout" cellspacing="0"><tbody>
                        <tr>
                            <td rowspan="3" width="2"><img src="${data.image}" style="max-width:250px;border:0px;" alt></td>
                            <td colspan="2"><h1><a href="https://movie.douban.com/subject/${data.id}" target="_blank">${data.title}</a> (${data.year})</h1><h3>${data.aka}</h3></td>
                        </tr>
                        <tr>
                            <td><table class="content" cellspacing="0" id="imdbinfo" style="white-space: nowrap;"><tbody>
                                <tr><th>评分</th><td>${data.average} (${data.votes}人评价)</td></tr>
                                <tr><th>类型</th><td>${data.genre}</td></tr>
                                <tr><th>国家/地区</th><td>${data.region}</td></tr>
                                <tr><th>导演</th><td>${data.director.replace(/\//g, '<br>    ')}</td></tr>
                                <tr><th>语言</th><td>${data.language}</td></tr>
                                <tr><th>上映日期</th><td>${data.releaseDate.replace(/\//g, '<br>    ')}</td></tr>
                                <tr><th>片长</th><td>${data.runtime}</td></tr>
                                <tr><th>演员</th><td>${data.cast.replace(/\//g, '<br>    ')}</td></tr>
                            </tbody></table></td>
                            <td id="plotcell"><table class="content" cellspacing="0"><tbody>
                                <tr><th>简介</th></tr><tr><td>${data.summary == "" ? '本片暂无简介' : '　　' + data.summary.replace(/ 　　/g, '<br>　　')}</td></tr>
                            </tbody></table></td>
                        </tr>
                        <tr>
                            <td colspan="2" id="actors"></td>
                        </tr>
                    </tbody></table>
                </div>
                </td></tr>
            `);
      $('div.collapsable:contains("About this film (from IMDB)")').parent().find('img').first().css({ "width": "250px", "max-height": "660px" });
      if (!hdb_hide_douban) {
        $('div.collapsable:contains("About this film (from IMDB)")').click();
      }
    }
  } catch (err) { alert(err) }
}

// --- From Module: 13_site_ui_helpers2.js (Snippet 12) ---
if (images[0].match(/t.hdbits.org/)) {
          var name = 'set your gallary name';
          try {
            if (descr.match(/Disc Title:/)) {
              name = descr.match(/Disc Title:(.*)/)[1].trim();
            } else if (descr.match(/Complete name.?:/i)) {
              name = descr.match(/Complete name.?:(.*)/)[1].trim();
            }
          } catch (err) { }
          images.push(name);
          GM_setValue('HDB_images', images.join(', '));
          window.open('https://pixhost.to/', '_blank');
        }

// --- From Module: 14_origin_site_parsing1.js (Snippet 13) ---
if (origin_site == 'HDB') {
      raw_info.url = match_link('imdb', document.getElementById('details').innerHTML);
      tbody = document.getElementById('details');
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 14) ---
if (origin_site == 'HDB') {
            raw_info.type = tds[i].textContent.get_type();
            raw_info.medium_sel = tds[i].textContent.medium_sel();
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 15) ---
if (origin_site == 'HDB') {
      var html = '<tr><td><table id="HDB"><tbody></tbody></table></td></tr>';
      $('#details').find('tr:eq(0)').after(html);
      table = document.getElementById('HDB');
      insert_row = table.insertRow(0);
      douban_box = table.insertRow(0);
      raw_info.name = document.getElementsByTagName('h1')[0].textContent.trim();
      raw_info.torrent_name = $('a[class="js-download"]').text();
      raw_info.torrent_url = `https://hdbits.org/` + $('a[href*="/download.php"]').attr('href');
      var divs = document.getElementsByTagName('div');
      for (var i = 0; i < divs.length; i++) {
        if (divs[i].textContent == 'Tags') {
          var descr = divs[i].parentNode.parentNode.nextElementSibling;
          if (descr.innerHTML.match(/Edit torrent/)) {
            descr = descr.previousElementSibling;
          }
          raw_info.descr = '[quote]' + walkDOM(descr.cloneNode(true)) + '[/quote]\n\n';
          console.log(raw_info.descr)
          if (raw_info.descr.match(/https:\/\/t.hdbits.org\/.*jpg/)) {
            var imgs = Array.from(descr.getElementsByTagName('img'));
            imgs.forEach(e => { e.setAttribute('class', 'checkable_IMG'); });
            $('.checkable_IMG').imgCheckbox({
              onclick: function (el) {
                let tagA = Array.from(el.children()[0].parentNode.parentNode.parentNode.getElementsByTagName("a"));
                tagA.forEach(e => { e.onclick = function () { return false; }; });
                var isChecked = el.hasClass("imgChked"),
                  imgEl = el.children()[0];
                var img_src = imgEl.src.replace('https://t', 'https://i').replace('jpg', 'png');
                if (isChecked) {
                  raw_info.images.push(img_src);
                } else {
                  raw_info.images.remove(img_src);
                }
              },
              "graySelected": false,
              "checkMarkSize": "20px",
              "fadeCheckMark": false
            });
          };
          var insert_point = raw_info.descr.search(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/);
          if (insert_point > -1) {
            raw_info.descr = raw_info.descr.slice(0, insert_point) + '\n[/quote]\n\n' + raw_info.descr.slice(insert_point);
            raw_info.descr = raw_info.descr.replace(/\[\/quote\](\s\n)*$/, '');
          }

          raw_info.descr = raw_info.descr.replace('Quote', '');
          raw_info.descr = raw_info.descr.replace(/[\n ]*\[\/quote\]/gi, '[/quote]');

          if ($('a[href*=mediainfo]').length) {
            function bytes_to_upper_size(size, level) {
              if (level == 'MiB') {
                return parseInt(size / 1024 / 1024);
              } else {
                return parseFloat((size / 1024 / 1024 / 1024).toFixed(2));
              }
            }
            function insert_name_to_descr(descr, name) {
              try {
                var uid = descr.match(/Unique ID.*/)[0];
                var l = raw_info.descr.match(/File size.*: \d+(\.\d+)? (MiB|GiB)/)[0].split(':')[0].length;
                name = "Complete name".padEnd(l) + ": " + name;
                descr = descr.replace(uid, `${uid}\n${name}`);
              } catch (err) {
                console.log(err)
              }
              return descr;
            }
            var url = 'https://hdbits.org' + $('a[href*=mediainfo]').attr("href");
            getDoc(url, null, function (doc) {
              var mediainfo = $('body', doc).text();
              raw_info.descr = '[quote]' + mediainfo + '[/quote]\n\n' + raw_info.descr;
              getDoc(raw_info.torrent_url, null, function (torrent) {
                var t = $('body', torrent).text();
                var length = parseInt(t.match(/4:name(\d+):/)[1]);
                var index = parseInt(t.search('4:name'));
                name = t.substring(index, index + length + 7 + length.toString().length).split(':').pop();
                if (!t.match(/5:files/i)) {
                  try {
                    raw_info.descr = insert_name_to_descr(raw_info.descr, name);
                    console.log(raw_info.descr);
                  } catch (err) { }
                } else {
                  try {
                    var target_length = raw_info.descr.match(/File size.*?: \d+(\.\d+)? (MiB|GiB)/)[0];
                    var target_numer = target_length.match(/\d+(\.\d+)?/)[0];
                    var inserted = false;
                    t.match(/6:lengthi\d+?e4:pathl\d+.*?(eed|eee4)/g).map(e => {
                      var file_length = e.match(/6:lengthi(\d+?)e/)[1];
                      var name_length = parseInt(e.match(/pathl(\d+)/)[1]);
                      var name_index = parseInt(e.search('4:path'));
                      var file_name = e.substring(name_index, name_index + 8 + name_length.toString().length + name_length).split(':').pop();
                      var file_size = bytes_to_upper_size(file_length, target_length.match(/GiB|MiB/)[0]);
                      if (file_size == target_numer && !inserted) {
                        inserted = true;
                        raw_info.descr = insert_name_to_descr(raw_info.descr, file_name);
                        console.log(raw_info.descr);
                      }
                    });
                  } catch (err) { }
                }
              });
            });
          }
          break;
        }
      }
    }

// --- From Module: 15_origin_site_parsing2.js (Snippet 16) ---
if (raw_info.descr.match(/https:\/\/t.hdbits.org\/.*jpg/)) {
            var imgs = Array.from(descr.getElementsByTagName('img'));
            imgs.forEach(e => { e.setAttribute('class', 'checkable_IMG'); });
            $('.checkable_IMG').imgCheckbox({
              onclick: function (el) {
                let tagA = Array.from(el.children()[0].parentNode.parentNode.parentNode.getElementsByTagName("a"));
                tagA.forEach(e => { e.onclick = function () { return false; }; });
                var isChecked = el.hasClass("imgChked"),
                  imgEl = el.children()[0];
                var img_src = imgEl.src.replace('https://t', 'https://i').replace('jpg', 'png');
                if (isChecked) {
                  raw_info.images.push(img_src);
                } else {
                  raw_info.images.remove(img_src);
                }
              },
              "graySelected": false,
              "checkMarkSize": "20px",
              "fadeCheckMark": false
            });
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 17) ---
if (origin_site == 'xthor' || origin_site == 'FileList' || origin_site == 'HDB' || origin_site == 'HDRoute') {
        forward_l.style.width = '80px'; forward_r.style.paddingTop = '10px';
        forward_r.style.paddingBottom = '10px'; forward_r.style.paddingLeft = '12px';
        if (origin_site == 'HDB') {
          forward_l.style.paddingRight = '12px'; forward_r.style.paddingBottom = '12px';
          forward_r.style.borderTop = 'none'; forward_r.style.borderBottom = 'none';
          forward_r.style.borderRight = 'none'; forward_l.style.border = 'none';
        }
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 18) ---
if (origin_site == 'HDB') {
          forward_l.style.paddingRight = '12px'; forward_r.style.paddingBottom = '12px';
          forward_r.style.borderTop = 'none'; forward_r.style.borderBottom = 'none';
          forward_r.style.borderRight = 'none'; forward_l.style.border = 'none';
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 19) ---
if (origin_site == 'FileList' || origin_site == 'xthor' || origin_site == 'HDB') {
          box_right.style.paddingLeft = '12px';
          if (origin_site == 'HDB') {
            box_left.style.paddingRight = '12px'; box_left.style.paddingTop = '12px';
            box_left.style.paddingBottom = '12px';
            box_right.style.borderTop = 'none'; box_right.style.borderBottom = 'none';
            box_right.style.borderRight = 'none'; box_left.style.border = 'none';
          }
        }

// --- From Module: 15_origin_site_parsing2.js (Snippet 20) ---
if (origin_site == 'HDB') {
            box_left.style.paddingRight = '12px'; box_left.style.paddingTop = '12px';
            box_left.style.paddingBottom = '12px';
            box_right.style.borderTop = 'none'; box_right.style.borderBottom = 'none';
            box_right.style.borderRight = 'none'; box_left.style.border = 'none';
          }

// --- From Module: 16_origin_site_parsing3.js (Snippet 21) ---
else if (origin_site == 'HDB' && $('div.torrent-title>span.exclusive').length) {
      if_exclusive = true;
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 22) ---
if (this.id == "影" && ['CMCT', 'TTG', 'UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) < 0) {
          info = if_ying_allowed();
          if (info.length) {
            if (!confirm(`转发该资源可能违反站点以下规则:\n${info.join('\n')}\n具体细节请查看站点规则页面。\n是否仍继续发布？`)) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 23) ---
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

// --- From Module: 17_forward_site_filling1.js (Snippet 24) ---
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

// --- From Module: 21_additional_handlers1.js (Snippet 25) ---
else if (forward_site == 'HDB') {
      var user_page = 'https://hdbits.org' + $('a[href*="userdetails"]').attr('href');
      getDoc(user_page, null, function (doc) {
        var announce = 'http://tracker.hdbits.org/announce.php?passkey=' + $('td:contains(Passkey):last', doc).next().text();
        addTorrent(raw_info.torrent_url, raw_info.torrent_name, forward_site, announce);
      });
      $('#name').val(raw_info.name);
      switch (raw_info.type) {
        case '电影': $('#type_category').val("1"); break;
        case '剧集': $('#type_category').val("2"); break;
        case '音乐': $('#type_category').val("4"); break;
        case '综艺': $('#type_category').val("2"); break;
        case '纪录': $('#type_category').val("3"); break;
        case '动漫':
          $('#type_category').val("1");
          if (raw_info.name.match(/S\d+/)) {
            $('#type_category').val("2");
          }
          break;
        case '体育': $('#type_category').val("5");
      }

      switch (raw_info.codec_sel) {
        case 'H264': case 'X264': $('#type_codec').val("1"); break;
        case 'H265': case 'X265': $('#type_codec').val("5"); break;
        case 'VC-1': $('#type_codec').val("3"); break;
        case 'MPEG-2': $('#type_codec').val("2"); break;
        case 'XVID': $('#type_codec').val("4"); break;
        default: $('#type_codec').val("0");
      }

      switch (raw_info.medium_sel) {
        case 'UHD': case 'Blu-ray': case 'DVD': $('#type_medium').val("1"); break;
        case 'Remux': $('#type_medium').val("5"); break;
        case 'HDTV': $('#type_medium').val("4"); break;
        case 'WEB-DL': $('#type_medium').val("6"); break;
        case 'Encode': $('#type_medium').val("3"); break;
        default: $('#type_medium').val("0");
      }

      var infos = get_mediainfo_picture_from_descr(raw_info.descr);
      if (raw_info.medium_sel == 'UHD' || raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'DVD') {
        $('textarea[name="descr"]').val(infos.mediainfo + '\n\n' + infos.pic_info);
        $('textarea[name="descr"]').css({ 'height': '300px' });
      } else {
        infos.mediainfo = infos.mediainfo.replace(/ \n/g, '\n');
        $('textarea[name="techinfo"]').val(infos.mediainfo);
        $('textarea[name="techinfo"]').css({ 'height': '800px' });
        $('textarea[name="descr"]').val(infos.pic_info);
      }

      $('input[name="imdb"]').val(raw_info.url);
    }

