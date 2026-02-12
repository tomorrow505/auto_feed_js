function get_bgmdata(url, func) {
  getDoc(url, null, function (doc) {
    var poster = 'https:' + $('#bangumiInfo', doc).find('img:first').attr('src');
    var story = $('#subject_summary', doc).text();
    var staff = Array.from($('#infobox li', doc).has('a')).map(e => {
      return $(e).text();
    }).join('\n');
    var cast = Array.from($('#browserItemList li', doc)).map(e => {
      if ($(e).find('span.tip').text()) {
        return $(e).find('span.tip').text() + ': ' + $(e).find('a[href*=person]').text();
      } else {
        return $(e).find('a[href*=character]').text().trim() + ': ' + $(e).find('a[href*=person]').text();
      }
    }).join('\n');
    var Cast = "Cast";
    if ($('h2.subtitle:contains("曲目列表")', doc).length) {
      var tracklist = $('h2.subtitle:contains("曲目列表")', doc).next().find('ul').text();
      tracklist = tracklist.split('\n').filter(item => item.trim() !== "").map(item => item.trim()).join('\n');
      cast = tracklist;
      Cast = "Tracklist"
// [Site Logic: 游戏]
    var tmp_descr = `
            [img]${poster}[/img]
            [b]Story: [/b]

            ${story}

            [b]Staff: [/b]
            ${staff}

            [b]${Cast}: [/b]

            ${cast}

            (来源于 ${url} )
        `;
    if (!cast) {
      tmp_descr = tmp_descr.replace('[b]Cast: [/b]', '');
    }
    tmp_descr = tmp_descr.replace(/            /g, '').replace(/\n\n+/g, '\n\n');
    func(tmp_descr);
  });
}

function getImage(url) {
  var p = new Promise(function (resolve, reject) {
    var filetype = getFiletype(url.match(/\.(jpg|jpeg|webp|png)$/)[1]);
    var name = url.split('/').pop();
    getBlob(url, null, null, filetype, function (data) {
      const blob = data.data;
      const file = new window.File([blob], name, { type: blob.type });
      resolve(file);
    });

  });
  return p;
}

//获取ptpimg的apikey自动的
// [Site Logic: PTP]

// [Site Logic: HDB]

// [Site Logic: PTP]

function getImageBlob(imageUrl) {
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: imageUrl,
      responseType: "blob",
      onload: function (response) {
        console.log(response)
        if (response.status === 200) {
          resolve(response.response);
        } else {
          alert(`图片下载失败: ${response.status}`);
          reject(new Error(`下载失败: ${response.status}`));
        }
      },
      onerror: function (err) {
        reject(err);
      }
    });
  });
}

function uploadToPtpimg(imageBlob, api_key) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('api_key', api_key);
    formData.append('file-upload[0]', imageBlob, 'temp.jpg');
    GM_xmlhttpRequest({
      method: "POST",
      url: "https://ptpimg.me/upload.php",
      data: formData,
      headers: {
        "Referer": "https://ptpimg.me/"
      },
      onload: function (response) {
        if (response.status === 200) {
          try {
            const result = JSON.parse(response.responseText);
            if (result && result.length > 0) {
              const imgData = result[0];
              const finalUrl = `https://ptpimg.me/${imgData.code}.${imgData.ext}`;
              resolve(finalUrl);
            } else {
              reject(new Error("上传成功但返回数据为空"));
            }
          } catch (e) {
            reject(new Error("JSON 解析失败: " + e.message));
          }
        } else {
          reject(new Error(`上传失败，状态码: ${response.status}`));
        }
      },
      onerror: function (err) {
        reject(err);
      }
    });
  });
}

async function ptp_send_doubanposter(url, api_key, callback) {
  try {
    const blob = await getImageBlob(url);
    console.log("获取图片成功，开始上传 Ptpimg...");
    const ptp_url = await uploadToPtpimg(blob, api_key);
    console.log("Ptpimg 上传成功:", ptp_url);
    callback(ptp_url);
  } catch (e) {
    console.error(e);
  }
}

function ptp_send_images(urls, api_key) {
  return new Promise(function (resolve, reject) {
    var boundary = "--NN-GGn-PTPIMG";
    var data = "";
    data += boundary + "\n";
    data += "Content-Disposition: form-data; name=\"link-upload\"\n\n";
    data += urls.join("\n") + "\n";
    data += boundary + "\n";
    data += "Content-Disposition: form-data; name=\"api_key\"\n\n";
    data += api_key + "\n";
    data += boundary + "--";
    GM_xmlhttpRequest({
      "method": "POST",
      "url": "https://ptpimg.me/upload.php",
      "responseType": "json",
      "headers": {
        "Content-type": "multipart/form-data; boundary=NN-GGn-PTPIMG"
      },
      "data": data,
      "onload": function (response) {
        console.log(response);
        if (response.status != 200) reject("Response error " + response.status);
        resolve(response.response.map(function (item) {
          return "[img]https://ptpimg.me/" + item.code + "." + item.ext + '[/img]';
        }));
      }
    });
  });
};

function pix_send_images(urls) {
  return new Promise(function (resolve, reject) {
    GM_xmlhttpRequest({
      "method": "POST",
      "url": "https://pixhost.to/remote/",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Accept": "application/json",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
      },
      "data": encodeURI(`imgs=${urls.join('\r\n')}&content_type=0&max_th_size=350`),
      "onload": function (response) {
        if (response.status != 200) {
          reject(response.status);
        } else {
          const data = response.responseText.match(/(upload_results = )({.*})(;)/);
          if (data && data.length) {
            var imgResultList = JSON.parse(data[2]).images;
            resolve(imgResultList.map(function (item) {
              return `[url=${item.show_url}][img]${item.th_url}[/img][/url]`;
            }));
          } else {
            console.log(response);
            reject('上传失败，请重试');
          }
        }
      }
    });
  });
};

//添加搜索框架，可以自行添加或者注释站点
function getData(imdb_url, callback) {
  var imdb_id = imdb_url.match(/tt\d+/)[0];
  var search_url = 'https://m.douban.com/search/?query=' + imdb_id + '&type=movie';
  console.log('正在获取数据……');
  getDoc(search_url, null, function (doc) {
    if ($('ul.search_results_subjects', doc).length) {
      var douban_url = 'https://movie.douban.com/subject/' + $('ul.search_results_subjects', doc).find('a').attr('href').match(/subject\/(\d+)/)[1];
      if (douban_url.search('35580200') > -1) {
        return;
      }
      getDoc(douban_url, null, function (html) {
        var raw_data = {};
        var data = { 'data': {} };
        raw_data.title = $("title", html).text().replace("(豆瓣)", "").trim();
        try {
          raw_data.image = $('#mainpic img', html)[0].src.replace(
            /^.+(p\d+).+$/,
            (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
          );
        } catch (e) { raw_data.image = 'null' }

        raw_data.id = douban_url.match(/subject\/(\d+)/)[1];
        $('#input_box').wait(function () {
          $('#input_box').val(douban_url);
          $('#ptgen').attr('href', douban_url);
        });
        try { raw_data.year = parseInt($('#content>h1>span.year', html).text().slice(1, -1)); } catch (e) { raw_data.year = '' }
        try { raw_data.aka = $('#info span.pl:contains("又名")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.aka = 'null' }
        try { raw_data.average = parseFloat($('#interest_sectl', html).find('[property="v:average"]').text()); } catch (e) { raw_data.average = '' }
        try { raw_data.votes = parseInt($('#interest_sectl', html).find('[property="v:votes"]').text()); } catch (e) { raw_data.votes = '' }
        try { raw_data.genre = $('#info span[property="v:genre"]', html).toArray().map(e => e.innerText.trim()).join('/'); } catch (e) { raw_data.genre = '' }
        try { raw_data.region = $('#info span.pl:contains("制片国家/地区")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.region = '' }
        try { raw_data.director = $('#info span.pl:contains("导演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.director = '' }
        try { raw_data.language = $('#info span.pl:contains("语言")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.language = '' }
        try { raw_data.releaseDate = $('#info span[property="v:initialReleaseDate"]', html).toArray().map(e => e.innerText.trim()).sort((a, b) => new Date(a) - new Date(b)).join('/'); } catch (e) { raw_data.releaseDate = '' }
        try { raw_data.runtime = $('span[property="v:runtime"]', html).text(); } catch (e) { raw_data.runtime = '' }
        try { raw_data.cast = $('#info span.pl:contains("主演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.cast = '' }
        try {
          raw_data.summary = Array.from($('#link-report-intra>[property="v:summary"],#link-report-intra>span.all.hidden', html)[0].childNodes)
            .filter(e => e.nodeType === 3)
            .map(e => e.textContent.trim())
            .join('\n');
        } catch (e) {
          raw_data.summary = '';
        }
        data.data = raw_data;
        callback(data)
      });
    }
  });
}

function getDataFromDou(douban_url, callback) {
  getDoc(douban_url, null, function (html) {
    var raw_data = {};
    var data = { 'data': {} };
    raw_data.title = $("title", html).text().replace("(豆瓣)", "").trim();
    try {
      raw_data.image = $('#mainpic img', html)[0].src.replace(
        /^.+(p\d+).+$/,
        (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
      );
    } catch (e) { raw_data.image = 'null' }

    raw_data.id = douban_url.match(/subject\/(\d+)/)[1];
    try { raw_data.year = parseInt($('#content>h1>span.year', html).text().slice(1, -1)); } catch (e) { raw_data.year = '' }
    try { raw_data.aka = $('#info span.pl:contains("又名")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.aka = 'null' }
    try { raw_data.imdb = $('#info span.pl:contains("IMDb")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.imdb = '' }
    try { raw_data.average = parseFloat($('#interest_sectl', html).find('[property="v:average"]').text()); } catch (e) { raw_data.average = '' }
    try { raw_data.votes = parseInt($('#interest_sectl', html).find('[property="v:votes"]').text()); } catch (e) { raw_data.votes = '' }
    try { raw_data.genre = $('#info span[property="v:genre"]', html).toArray().map(e => e.innerText.trim()).join('/'); } catch (e) { raw_data.genre = '' }
    try { raw_data.region = $('#info span.pl:contains("制片国家/地区")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.region = '' }
    try { raw_data.director = $('#info span.pl:contains("导演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.director = '' }
    try { raw_data.language = $('#info span.pl:contains("语言")', html)[0].nextSibling.textContent.trim(); } catch (e) { raw_data.language = '' }
    try { raw_data.releaseDate = $('#info span[property="v:initialReleaseDate"]', html).toArray().map(e => e.innerText.trim()).sort((a, b) => new Date(a) - new Date(b)).join('/'); } catch (e) { raw_data.releaseDate = '' }
    try { raw_data.runtime = $('span[property="v:runtime"]', html).text(); } catch (e) { raw_data.runtime = '' }
    try { raw_data.cast = $('#info span.pl:contains("主演")', html)[0].nextSibling.nextSibling.textContent.trim(); } catch (e) { raw_data.cast = '' }
    try {
      raw_data.summary = Array.from($('#link-report-intra>[property="v:summary"],#link-report-intra>span.all.hidden', html)[0].childNodes)
        .filter(e => e.nodeType === 3)
        .map(e => e.textContent.trim())
        .join('\n');
    } catch (e) {
      raw_data.summary = '';
    }
    data.data = raw_data;
    callback(data)
  });
}

function rehost_single_img(site, img_url) {
  if (site == 'catbox') {
    return new Promise(function (resolve, reject) {
      GM_xmlhttpRequest({
        "method": "POST",
        "url": "https://catbox.moe/user/api.php",
        "headers": {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
        },
        "data": encodeURI(`url=${img_url}&userhash=&reqtype=urlupload`),
        "onload": function (response) {
          if (response.status != 200) {
            reject("Response error " + response.status);
          } else {
            resolve(`[img]${response.responseText}[/img]`);
          }
        }
      });
    });
  } else {
    return new Promise(function (resolve, reject) {
      var raw_str = site == 'imgbb' ? 'image' : 'source';
      var data = encodeURI(`${raw_str}=${img_url}&key=${used_rehost_img_info[site]['api-key']}`);
      const show_temple = ['展示：{url_viewer}', '原图: [img]{origin_url}[/img]', '缩略图：[img]{thumb_url}[/img]', 'bbcode中等: [url={url_viewer}][img]{medium_url}[/img][/url]', 'bbcode缩略: [url={url_viewer}][img]{thumb_url}[/img][/url]']
      GM_xmlhttpRequest({
        "method": "POST",
        "url": used_rehost_img_info[site]['api-url'],
        "responseType": "json",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
        },
        "data": data,
        "onload": function (response) {
          console.log(response);
          if (response.status != 200) { reject("Response error " + response.status); }
          else {
            if (site == 'imgbb') {
              data = JSON.parse(response.responseText).data;
              var bbcode_medium_url = data.url;
            } else if (site == 'gifyu') {
              data = JSON.parse(response.responseText).image;
              var bbcode_medium_url = data.url;
            } else if (site == 'freeimage') {
              data = JSON.parse(response.responseText).image;
              var bbcode_medium_url = data.url;
            }
            var show_result = show_temple.join('\n').format({ 'url_viewer': data.url_viewer, 'thumb_url': data.thumb.url, 'origin_url': data.url, 'medium_url': bbcode_medium_url });
            resolve(show_result);
          }
        }
      });
    });
  }
}

function rebuild_href(raw_info) {
  jump_str = dictToString(raw_info);
  tag_aa = forward_r.getElementsByClassName('forward_a');
  for (i = 0; i < tag_aa.length; i++) {
    if (['常用站点', 'PTgen', '简化MI', '脚本设置', '重置托管', '单图转存', '图标刷新', '提取图片'].indexOf(tag_aa[i].textContent) < 0) {
      tag_aa[i].href = decodeURI(tag_aa[i]).split(separator)[0] + separator + encodeURI(jump_str);
    }
  }
}

function build_blob_from_torrent(r, forward_announce, forward_site, filetype, callback) {
  var name = '';
  if (forward_site !== null && forward_site != 'hdb-task') {
    if (r.match(/value="firsttime"/)) {
      alert("加载种子失败，请先在源站进行一次种子下载操作！！！");
      return;
    }
    if (r.match(/Request frequency limit/)) {
      alert("TTG提示：频率太快，600秒后再来！");
      return;
    }
// [Site Logic: PTP]
    var new_torrent = 'd';
    var announce = 'https://hudbt.hust.edu.cn/announce.php';
    if (forward_announce !== null) {
      announce = forward_announce;
    }
    if (r.match(/8:announce\d+:/)) {
      var new_announce = `8:announce${announce.length}:${announce}`;
      new_torrent += new_announce;
    } else {
      alert('种子文件加载失败！！！');
      return;
    }
    if (r.match(/13:creation date/)) {
      try {
        var date = r.match(/13:creation datei(\d+)e/)[1];
        var new_date = parseInt(date) + 600 + parseInt(Math.random() * (600), 10);
        var new_date_str = `13:creation datei${new_date.toString()}e`;
        new_torrent += new_date_str;
      } catch (err) { }
    }
    new_torrent += '8:encoding5:UTF-8';
    var info = r.match(/4:info[\s\S]*?privatei\de/)[0].replace('privatei0e', 'privatei1e');
    new_torrent += info;
    var new_source = `6:source${forward_site.length}:${forward_site.toUpperCase()}`;
    new_torrent += new_source;
    new_torrent += 'ee';
    r = new_torrent;
  }
  var data = new Uint8Array(r.length)
  var i = 0;
  while (i < r.length) {
    data[i] = r.charCodeAt(i);
    i++;
  }
  var blob = new Blob([data], { type: filetype });
  var data = {
    'data': blob,
    'name': name
  }
  callback(data);
}

function getBlob(url, forward_announce, forward_site, filetype, callback) {
  GM_xmlhttpRequest({
    method: "GET",
    url: url,
    overrideMimeType: "text/plain; charset=x-user-defined",
    onload: (xhr) => {
      var r = xhr.responseText;
      build_blob_from_torrent(r, forward_announce, forward_site, filetype, callback);
    },
    onerror: function (res) {
      console.log(res);
    }
  });
}

function fill_torrent(forward_site, container, name) {
// [Site Logic: Fnp]
// [Site Logic: Gpw]
// [Site Logic: HDB]
// [Site Logic: Cnz]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: ZHUQUE]
// [Site Logic: Yemapt]
// [Site Logic: Rousi]
    $('input[name=file]')[0].files = container.files;
  }
}

function addTorrent(url, name, forward_site, forward_announce) {
// [Site Logic: Opencd]
  name = name.replace(/^\[.*?\](\.| )?/, '').replace(/ /g, '.').replace(/\.-\./, '-').trim();
  if (url.match(/d8:announce/)) {
    build_blob_from_torrent(url, forward_announce, forward_site, "application/x-bittorrent", function (data) {
      const blob = data.data;
      if (data.name) {
        name = data.name + '.torrent';
      }
      const files = new window.File([blob], name, { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
      fill_torrent(forward_site, container, name);
    });
  } else {
    getBlob(url, forward_announce, forward_site, "application/x-bittorrent", function (data) {
      const blob = data.data;
      if (data.name) {
        name = data.name.replace(/|™/g, "").trim().replace(/ /g, '.') + '.torrent';
      }
      const files = new window.File([blob], name, { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
      fill_torrent(forward_site, container, name);
    });
  }
}

function addPoster(url, forward_site) {
  try {
    var extension = url.match(/\.(jpg|jpeg|webp|png)$/)[1];
    if (extension == 'jpg') {
      extension = 'jpeg';
    }
    getBlob(url, null, null, extension, function (data) {
      const blob = data.data;
      const files = new window.File([blob], `cover.${url.match(/\.(jpg|jpeg|webp|png)$/)[1]}`, { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
// [Site Logic: Opencd]
    });
  } catch (err) { alert('封面图加载错误，很有可能是后缀不对') }
};

function reBuildHref(raw_info, forward_r) {
  $('#input_box').val(raw_info.url);
  try {
    var imdbid = raw_info.url.match(/tt\d+/i)[0];
    var imdbno = imdbid.substring(2);
  } catch (err) {
    imdbid = '';
    imdbno = '';
  }
  var container = $('#forward_r');
  if ($('.search_urls').length) {
    $('.search_urls').hide();
  }
  add_search_urls(container, imdbid, imdbno, search_name, 0);
  rebuild_href(raw_info);
}

function check_team(raw_info, s_name, forward_site) {
  if (raw_info.name.match(/MTeam/) && forward_site == 'HDHome') {
    $(`select[name="team_sel"]>option:eq(11)`).attr('selected', true);
    return;
  }
  $(`select[name="${s_name}"]>option`).map(function (index, e) {
    var name = raw_info.name.split(/(19|20)\d{2}/).pop();
    if (name.toLowerCase().match(e.innerText.toLowerCase())) {
      if ((name.match(/PSY|LCHD/) && e.innerText == 'CHD') || (name.match(/PandaMoon/) && e.innerText == 'Panda') || e.innerText == 'DIY' || e.innerText == 'REMUX') {
        console.log('小组名貌似会产生误判');
        return;
      } else if (name.match(/HDSpace/i) && e.innerText.match(/HDS/i)) {
        return;
      } else if (name.match(/HDClub/i) && e.innerText.match(/HDC/i)) {
        return;
      } else if (name.match(/REPACK/i) && e.innerText.match(/PACK/i)) {
        return;
      } else {
        $(`select[name^="${s_name}"]>option:eq(${index})`).attr('selected', true);
      }
    }
  });
}

async function selectDropdownOption(tid, index, targetTitle) {
  var clickEvent = document.createEvent('MouseEvents');
  clickEvent.initEvent('mousedown', true, true);
  document.getElementById(tid).dispatchEvent(clickEvent);
  await new Promise(resolve => setTimeout(resolve, 100));
  const listHolder = document.querySelectorAll('.rc-virtual-list-holder')[index];
  if (!listHolder) {
    console.error("未找到下拉列表，请确保下拉框已经打开！");
    return;
  }
  const findAndClick = () => {
    const option = listHolder.querySelector(`.ant-select-item-option[title="${targetTitle}"]`);
    if (option) {
      option.click();
      console.log(`已选择: ${targetTitle}`);
      return true;
    }
    return false;
  };
  if (typeof targetTitle === 'string') {
    if (findAndClick()) return;
    const scrollStep = 100;
    const delay = 100;
    let totalHeight = listHolder.scrollHeight;
    let currentScroll = 0;
    listHolder.scrollTop = 0;
    while (currentScroll < totalHeight) {
      listHolder.scrollTop += scrollStep;
      currentScroll += scrollStep;
      await new Promise(resolve => setTimeout(resolve, delay));
      if (findAndClick()) {
        return;
      }
      totalHeight = listHolder.scrollHeight;
    }
    console.log(`未找到选项: ${targetTitle}`);
  } else if (Array.isArray(targetTitle)) {
    targetTitle.map((x, index) => {
      setTimeout(function () {
        const option = document.querySelector(`.ant-select-item-option[title="${x}"]`);
        if (option) {
          option.click();
          console.log(`已选择: ${x}`);
        }
      }, index * 100);
    })
  }
}


if (site_url.match(/(broadcasthe.net|backup.landof.tv)\/.*.php.*/)) {
  $('#searchbars').find('li').each(function () {
    $(this).find('form').find('input').prop('size', 16);
  });
  $('table.torrent_table').find('tr.torrent').each(function () {
    var index = $(this).index();
    var $td = $(this).find('td:eq(2)');
    var title = $td.find('div.nobr:contains("Release Name")').find('span').prop('title');
    var group = title.match(/.*-(.*)/);
    var font = document.createElement('font');
    var season_info = $td.find('a:eq(3)').text();
    if (!season_info.match('Season')) {
      font.style.color = '#1e90ff';
    } else {
      font.style.color = '#db7093';
    }
    var unknown_group = false;
    if (group && group.length) {
      if (!group[1].match(/\[.*\]/)) {
        if ($td[0].childNodes[10].textContent.match(/\]/)) {
          $td[0].childNodes[9].textContent += ' / ' + group[1];
          if (extra_settings.btn_dark_color.enable) {
            font.innerHTML = ($td[0].childNodes[8].textContent + $td[0].childNodes[9].textContent + $td[0].childNodes[10].textContent).replace(group[1], `<b><font color="#20B2AA">${group[1]}</font></b>`);
            $td[0].childNodes[10].parentNode.removeChild($td[0].childNodes[10]);
            $td[0].childNodes[9].parentNode.removeChild($td[0].childNodes[9]);
            $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
          }
        } else {
          var ori_text = $td[0].childNodes[8].textContent;
          $td[0].childNodes[8].textContent = ori_text.replace(/\[(.*?)\]/, `$1 / ${group[1]}`);
          if (extra_settings.btn_dark_color.enable) {
            font.innerHTML = $td[0].childNodes[8].textContent.replace(group[1], `<b><font color="#20B2AA">${group[1]}</font></b>`);
            $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
          }
        }
      } else {
        unknown_group = true;
      }
    } else {
      unknown_group = true;
    }
    if (unknown_group) {
      font.style.color = '#1e90ff';
      var ori_text = $td[0].childNodes[8].textContent;
      $td[0].childNodes[8].textContent = ori_text.replace(/\[(.*?)\]/, `$1 / Unknown`);
      if (extra_settings.btn_dark_color.enable) {
        font.innerHTML = $td[0].childNodes[8].textContent.replace('Unknown', `<b><font color="#20B2AA">Unknown</font></b>`);
        $td[0].childNodes[8].parentNode.replaceChild(font, $td[0].childNodes[8]);
      }
    }
    if (extra_settings.btn_dark_color.enable) {
      $(this).find('td:gt(2)').css({ 'color': 'grey' });
      $td.find('a:lt(4)').css({ 'font-size': 'small', 'font-weight': 'bold' });
      $td.find('div.nobr:contains("Release Name")').css({ 'color': 'grey' });
      $td.find('div.nobr:contains("Up:")').css({ 'color': 'grey' });
    }

    var name = $td.find('a:eq(2)').text();
    $td.find('br').replaceWith($(`<div><a name="douban_${index}" href=https://search.douban.com/movie/subject_search?search_text=${name.replace(/ /g, '%20')}&cat=1002 target="_blank">[Douban]</a>
            <a name="imdb_${index}" href=https://www.imdb.com/find?q=${name.replace(/ /g, '%20')}&ref_=nv_sr_sm target="_blank">[IMDB]</a>
            <a href=https://www.themoviedb.org/search?language=zh-CN&query=${name.replace(/ /g, '%20')} target="_blank">[TMDB]</a>
            <a name="show_${index}" style="display: none"></a>
            </div><span name="imdb_${index}" style="display: none"><a name="get_${index}">GET</a></span>`
    ));
  });
}

if (site_url.match(/^https?:\/\/(broadcasthe.net|backup.landof.tv)\/series.php\?id=\d+/)) {
  var name = $('title').text().split(':')[0].trim();
  var imdb_url = $('img[src*="tvicon/imdb.png"]:eq(0)').parent().attr('href');
  if (imdb_url == '') {
    imdb_url = `https://www.imdb.com/find?q=${name.replace(/ /g, '%20')}&ref_=nv_sr_sm`;
  }
  $('#content').find('div.linkbox:eq(0)').prepend(`<font size="5px" color="red">${name}</font><br>
        <div><a href=https://search.douban.com/movie/subject_search?search_text=${name.replace(/ /g, '%20')}&cat=1002 target="_blank">[Douban]</a>
        <a href=${imdb_url} target="_blank">[IMDB]</a>
        <a href=https://www.themoviedb.org/search?language=zh-CN&query=${name.replace(/ /g, '%20')} target="_blank">[TMDB]</a>
        </div>
    `);
}

// [Site Logic: HDOnly]

// [Site Logic: HDB]

// [Site Logic: NZBS]

// [Site Logic: HDB]

// [Site Logic: PTP]

// [Site Logic: PTP]

// [Site Logic: PTP]

if (site_url.match(/^https?:\/\/secret-cinema.pw\/torrents.php\?id.*/) && all_sites_show_douban) {
  $(function () {
    const imdbLink = $('a:contains("IMDB")').attr('href');
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
  })

  const addInfoToPage = (data) => {
    var total = 10;
    var split = '/';
    if (!data.average) {
      data.average = '暂无评分';
      total = '';
      data.votes = 0;
      split = '';
    }
    if (isChinese(data.title)) {
      $('h2').first().prepend(`<a  target='_blank' href="https://movie.douban.com/subject/${data.id}">[${data.title.split(' ')[0]}] </a>`);
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
      $('div.box_artists').before(`<div>
            <div class="head"><span><strong>简介</strong></span></div>
            <div>&nbsp&nbsp&nbsp&nbsp${data.summary}</div></div><br>`);
    }
    try {
      $('div.box_artists').before(`
                <div>
                <div class="head"><span><strong>电影信息</strong></span></div>
                <div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp导演:</strong> ${data.director}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp演员:</strong> ${data.cast}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp类型:</strong> ${data.genre}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp制片国家/地区:</strong> ${data.region}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp语言:</strong> ${data.language}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp时长:</strong> ${data.runtime}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp又名:</strong> ${data.aka}</div>
                <div><span><strong>&nbsp&nbsp&nbsp&nbsp评分:</strong> ${data.average}</span>
                <span class="mid">${split}</span>
                <span class="outof"> ${total} </span> from ${data.votes} votes</div>
                </div>
                <br>
            `)
    } catch (err) { }
  }
  const isChinese = (title) => {
    return /[\u4e00-\u9fa5]+/.test(title)
  }
}

if (site_url.match(/^https?:\/\/www.morethantv.me\/torrents.php\?id.*/)) {
  $(function () {
    const imdbLink = match_link('imdb', $('div.main_column').html());
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
  })

  const addInfoToPage = (data) => {
    var total = 10;
    var split = '/';
    if (!data.average) {
      data.average = '暂无评分';
      total = '';
      data.votes = 0;
      split = '';
    }
    if (isChinese(data.title)) {
      $('h2').first().find('a:eq(1)').prepend(`<a  target='_blank' href="https://movie.douban.com/subject/${data.id}">[${data.title.split(' ')[0]}] </a>`);
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
      $('div.sidebar').prepend(`<div id="introduction">
            <div class="head"><span><strong>简介</strong></span></div>
            <div>&nbsp&nbsp&nbsp&nbsp${data.summary}</div></div><br>`);
    }
    try {
      $('#introduction').after(`
                <div>
                <div class="head"><span><strong>电影信息</strong></span></div>
                <div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp导演:</strong> ${data.director}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp演员:</strong> ${data.cast}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp类型:</strong> ${data.genre}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp制片国家/地区:</strong> ${data.region}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp语言:</strong> ${data.language}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp时长:</strong> ${data.runtime}</div>
                <div><strong>&nbsp&nbsp&nbsp&nbsp又名:</strong> ${data.aka}</div>
                <div><span><strong>&nbsp&nbsp&nbsp&nbsp评分:</strong> ${data.average}</span>
                <span class="mid">${split}</span>
                <span class="outof"> ${total} </span> from ${data.votes} votes</div>
                </div>
            `)
    } catch (err) { }
  }
  const isChinese = (title) => {
    return /[\u4e00-\u9fa5]+/.test(title)
  }
}

// [Site Logic: HDB]

// [Site Logic: HDB]

if (site_url.match(/^https:\/\/hd-torrents\.org\/torrents.*/) && show_search_urls['HDT']) {
  $('.mainblockcontenttt tr').each(function () {
    var $td = $(this).find('td:eq(2)');
    var name = $td.find('a').first().text();
    if (name) {
      try {
        var imdbid = $td.html().match(/imdb\.com\/title\/(tt\d+)/i)[1];
        var imdbno = imdbid.substring(2);

        var search_name = get_search_name(name);
        if (name.match(/S\d+/i)) {
          var number = parseInt(name.match(/S(\d+)/i)[1]);
          search_name = search_name + ' Season ' + number;
        }
        var $container = $td;
        add_search_urls($container, imdbid, imdbno, search_name, 1);
      } catch (err) { }
    }

  });

  $('.hdblock:eq(1) tr').each(function () {
    var $td = $(this).find('td:eq(1)');
    var name = $td.find('a').first().text();
    if (name) {
      try {
        var imdbid = $td.html().match(/imdb\.com\/title\/(tt\d+)/i)[1];
        var imdbno = imdbid.substring(2);

        var search_name = get_search_name(name);
        if (name.match(/S\d+/i)) {
          var number = parseInt(name.match(/S(\d+)/i)[1]);
          search_name = search_name + ' Season ' + number;
        }
        var $container = $td;
        add_search_urls($container, imdbid, imdbno, search_name, 1);
      } catch (err) { }
    }

  });
}

if (site_url.match(/^https:\/\/xthor.tk\/.*/)) {

  try {
    var navbar_html = $('#navbar').html();
    navbar_html = navbar_html.replace(/Recherche/g, 'Research');
    navbar_html = navbar_html.replace('Parcourir', 'Browse');
    navbar_html = navbar_html.replace('Nouveautés/Catégorie', 'New Arrivals/Category');
    navbar_html = navbar_html.replace('Nouveautés', 'News');
    navbar_html = navbar_html.replace('Requêtes', 'Requests');
    navbar_html = navbar_html.replace('Besoin de Seed', 'Need Seed');
    navbar_html = navbar_html.replace('Communauté', 'Community');

    navbar_html = navbar_html.replace('Médiathèque', 'Media Library');
    navbar_html = navbar_html.replace(/Séries/g, 'Series');
    navbar_html = navbar_html.replace(/Auteurs/g, 'Authors');
    navbar_html = navbar_html.replace(/Livres/g, 'Books');
    navbar_html = navbar_html.replace(/Jeux Vidéo/g, 'Video games');
    navbar_html = navbar_html.replace(/Acteurs/g, 'Actors');
    navbar_html = navbar_html.replace(/Porno/g, 'Porn');
    navbar_html = navbar_html.replace(/Séries/g, 'Series');
    navbar_html = navbar_html.replace(`Ce que j'aime`, 'What I like');
    navbar_html = navbar_html.replace(/Mes séries/g, 'My series');
    navbar_html = navbar_html.replace(/Ce que j'aime/g, 'What I like');
    navbar_html = navbar_html.replace('Sagas', 'My series');

    navbar_html = navbar_html.replace(/Mon Profil/g, 'My profile');
    navbar_html = navbar_html.replace(/Activité/g, 'Activity');
    navbar_html = navbar_html.replace(/Réglages/g, 'Settings');
    navbar_html = navbar_html.replace(/Amis/g, 'Friends');
    navbar_html = navbar_html.replace(/Favoris/g, 'Favorites');
    navbar_html = navbar_html.replace(/Mes Flux RSS/g, 'My RSS Feeds');
    navbar_html = navbar_html.replace('Mes messages Privés', 'My private messages');

    navbar_html = navbar_html.replace(/Outils/g, 'Tools');
    navbar_html = navbar_html.replace(/Hebergeur d'images/g, 'Image Host');
    navbar_html = navbar_html.replace(/Teams Bannies/g, 'Banned Teams');
    navbar_html = navbar_html.replace(/Règles/g, 'Rules');
    navbar_html = navbar_html.replace(/Aide/g, 'Aid');
    navbar_html = navbar_html.replace('Contacter le staff', 'Contact staff');
    navbar_html = navbar_html.replace('Signaler un bug', 'Report a bug');
    $('#navbar').html(navbar_html);
  } catch (err) { }

  if (site_url.match(/upload.php/)) {
    var origin_html = $('td:contains(Fichier Torrent)').parent().parent().html();
    origin_html = origin_html.replace('Fichier Torrent', 'Torrent File');
    origin_html = origin_html.replace('Nom du Torrent', 'Torrent Name');
    origin_html = origin_html.replace('Fichier NFO', 'NFO File');
    origin_html = origin_html.replace('Pris du nom du fichier torrent si non spécifié.', '如果未指定，则取种子文件的名称。');
    origin_html = origin_html.replace(`Affiche`, '海报');
    origin_html = origin_html.replace(`Doit être hebergée sur`, '必须托管在');
    origin_html = origin_html.replace(`ou sur Xthor`, '或者xthor上');
    origin_html = origin_html.replace(` l'extension doit être jpg, png ou gif`, '扩展必须是JPG，PNG或GIF)');
    origin_html = origin_html.replace('La largeur du poster doit être de 500 Px maximum', '宽度最大限制为为500px');
    origin_html = origin_html.replace('ou', 'or');
    origin_html = origin_html.replace('pour les livres', 'for books');
    origin_html = origin_html.replace('pour les films, séries et anime', 'for movies, series and anime');
    origin_html = origin_html.replace('pour la musique', 'for music');
    origin_html = origin_html.replace('pour les jeux', 'for games');
    origin_html = origin_html.replace(`Le fait de mettre un lien vers une API permet de lier le torrent à la médiàthèque et de générer une prez si vous la laissez vide pour les torrents films, séries et jeux`,
      '对于电影、影视和动画，填写对应IMDB或TMDB的链接使您可以将种子绑定到对应库，并生成描述文本');
    origin_html = origin_html.replace(`Pour la musique et les livres la médiathèque récupère l'image que vous uploadez avec le torrent, veuillez choisir une image convenable`,
      '对于书籍和音乐，请上传合适的图片，我们将使用您上传的图片作为海报');
    origin_html = origin_html.replace(`inutile d'ajouter le lien imdb si il est déjà présent dans le nfo`, '如果NFO中已经存在，则无需添加IMDB链接');
    origin_html = origin_html.replace(`Ajouter l'url`, '添加');
    origin_html = origin_html.replace(`pour afficher le lien vers la vidéo dans les détails du Torrent`, '链接将在种子详细信息中心显示指向视频的链接');
    origin_html = origin_html.replace(`URL Affiche (facultatif)`, '海报链接(可选)');
    origin_html = origin_html.replace(`Catégorie`, 'Category');
    origin_html = origin_html.replace(`Si vous remplissez une requête, sélectionner la ici.`, '如果填充请求，请选择此处。');
    origin_html = origin_html.replace(`Autres`, 'Other');
    origin_html = origin_html.replace(`Type de Release`, 'Release Type');
    origin_html = origin_html.replace(`Inserez le lien d'une fiche Allociné afin de pouvoir générer une prez`, '不是很必须的链接，可以不填');
    origin_html = origin_html.replace(`Voix`, 'Voice(应该是音频，猜吧就~)');
    origin_html = origin_html.replace(`Voix`, 'Voice');
    $('td:contains(Fichier Torrent)').parent().parent().html(origin_html);
    $('.btn[value*="Générer une prez Allociné"]').val("生成描述文本");

    $('input[name=nfo]').parent().append(`<br><textarea id="pasteNfo" rows="15" style="width:600px"></textarea><br><input type="button" id="genNfo" value="生成nfo并上传">`);
    $('#genNfo').click((e) => {
      e.preventDefault();
      var r = $('#pasteNfo').val();
      if (!r) {
        return;
      }
      var data = new Uint8Array(r.length)
      var i = 0
      while (i < r.length) {
        data[i] = r.charCodeAt(i);
        i++
      }
      var blob = new Blob([data], { type: "text/x-nfo" });
      const files = new window.File([blob], 'movie.nfo', { type: blob.type });
      let container = new DataTransfer();
      container.items.add(files);
      $('input[name=nfo]')[0].files = container.files;
    })
  } else if (site_url.match(/rules.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/xthor_rules.html', null, function (doc) {
      $('table.main').html($('table', doc).html());
      $("#firstpanel p.menu_head").click(function () {
        $(this).css({ backgroundImage: "url(pic/down2.png)" }).next("div.menu_body").slideToggle(300).siblings("div.menu_body").slideUp("slow");
      });
    });
    return;
  } else if (site_url.match(/faq.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/xthor_faq.html', null, function (doc) {
      $('div.container:eq(1)').html($('div.container:eq(0)', doc).html());
    });
  }
}

if (site_url.match(/^https:\/\/hdf.world\/.*/)) {
  if (site_url.match(/upload.php/)) {
    var origin_html = $('p:contains(Votre annonce URL)').html();
    origin_html = origin_html.replace(`Votre annonce URL personnelle pour créer votre .torrent (activez l'option "Torrent Privé") :`, '您的个人Announce URL用于创建种子文件，请重新制作种子！');
    $('p:contains(Votre annonce URL)').html(origin_html);
    function replace_text(dom, o, d) {
      var o_html = dom.html();
      var d_html = o_html.replace(o, d);
      dom.html(d_html);
    }

    replace_text($('td:contains(Votre .Torrent)'), 'Votre .Torrent', 'Torrent File');
    replace_text($('td:contains(Catégorie)'), 'Catégorie', 'Category');
    replace_text($(`p:contains(Collez l'URL)`), `Collez l'URL`, 'Copy URL');
    replace_text($(`p:contains(pour le média)`), ` pour le média`, 'for the media');
    setTimeout(function () { $('#btnAllocineFetch').text("Send"); }, 1000);
    replace_text($(`p:contains(Cliquez sur Envoyer pour valider votre lien)`), `Cliquez sur Envoyer pour valider votre lien`, '点击Send以验证您的链接');
    replace_text($('td:contains(Titre)'), 'Titre', 'Title');
    replace_text($(`p:contains(Ne pas modifier le titre mis à disposition par TheMovieDB)`), `Ne pas modifier le titre mis à disposition par TheMovieDB`, 'Do not modify the title provided by TheMovieDB');
    replace_text($('td:contains(Année)').first(), 'Année', 'Year');
    replace_text($(`p:contains(Si le lien TMDB n'est pas disponible, remplissez tous les champs requis manuellement.)`), `Si le lien TMDB n'est pas disponible, remplissez tous les champs requis manuellement.`, '如果没有TMDB链接，请手动填写所需的所有字段。');
    replace_text($(`td:contains(Restriction d'âge)`).last(), `Restriction d'âge`, '限制年龄');
    replace_text($(`label:contains(Cocher s'il s'agit)`), `Cocher s'il s'agit d'une release issue de la scene. Si vous n'en êtes pas sûr, ne cochez pas la case.`, '是否Scene?');
    replace_text($(`td:contains(Résolution)`).last(), `Résolution`, 'Resolution');
    replace_text($(`td:contains(Type de fichier)`).last(), `Type de fichier`, 'Type of File');
    replace_text($(`td:contains(URL de l'affiche)`).last(), `URL de l'affiche`, 'Poster URL');
    replace_text($(`p:contains(automatiquement rempli)`), `automatiquement rempli`, '自动填充');
    $('input[value=Prévisualiser]').val('Preview');
    replace_text($(`p:contains(Si vous êtes un re-posteur, respectez le travail des releasers en mettant la bonne source et le tag.)`), `Si vous êtes un re-posteur, respectez le travail des releasers en mettant la bonne source et le tag.`, 'If you are a reposter, respect the work of the releasers by putting the correct source and tag.');
    replace_text($(`span:contains(VFF (Doublage Français (France)))`).last(), `VFF (Doublage Français (France))`, 'VFF (French Dubbing (France))');
    replace_text($(`span:contains(VFQ (Doublage Français (Québec)))`).last(), `VFQ (Doublage Français (Québec))`, 'VFQ (French Dubbing (Quebec))');
    replace_text($(`span:contains(VO (Version Originale, non française))`).last(), `VO (Version Originale, non française)`, 'VO (Original Version, not French)');
    replace_text($(`span:contains(VOF (Version Originale Française (France et Belgique)))`).last(), `(Version Originale Française (France et Belgique))`, '(Original French Version (France and Belgium))');
    replace_text($(`span:contains(VOQ (Version Originale Québecoise)`).last(), `(Version Originale Québecoise)`, '(Original Quebec version)');
    replace_text($(`span:contains(VF? (Version Française, origine du doublage inconnue))`).last(), `(Version Française, origine du doublage inconnue)`, '(French version, origin of dubbing not specified)');
    replace_text($(`span:contains(VFI (Version Française Internationale = 1 seul doublage français existant))`).last(), `(Version Française Internationale = 1 seul doublage français existant)`, '(French International Version = only 1 existing French dubbing)');
    replace_text($(`span:contains(Sous-titres : Cocher cette case si la release dispose des sous-titres français complets)`).last(), `Sous-titres : Cocher cette case si la release dispose des sous-titres français complets`, 'Source-subtitles: Check this box if the release has full French subtitles');
    replace_text($(`span:contains(MULTi : Ne cochez que s'il y a la VO + VF + d'autres langues sinon ne cochez que VO + VF(I)/(F)/(Q)`).last(), `MULTi : Ne cochez que s'il y a la VO + VF + d'autres langues sinon ne cochez que VO + VF(I)/(F)/(Q)`, 'MULTi: Only check if there is the VO+VF+ of other languages, otherwise only check VO+VF');
    replace_text($(`span:contains((Cocher quelle version VF est incluse en plus de multi (VFF, VFQ)`).last(), `(Cocher quelle version VF est incluse en plus de multi (VFF, VFQ)`, '(Check which VF version is included in addition to multi(vff,vfq)');
    replace_text($(`span:contains(Muet : Cocher Sous-titres pour les parties texte du film si elles sont en français et rien si elles sont dans une autre langue.)`), `Muet : Cocher Sous-titres pour les parties texte du film si elles sont en français et rien si elles sont dans une autre langue.`, 'Muet: Check Subtitles for the text parts of the film if they are in French and nothing if they are in another language');
  } else if (site_url.match(/rules.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/hdf_rules.html', null, function (doc) {
      if (site_url.match(/rules.php$/)) {
        $('#content').html($('#main', doc).html());
      }
      else if (site_url.match(/golden_rules/)) {
        $('#content').html($('#golden_rules', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/inactivity/)) {
        $('#content').html($('#inactivity', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/bonus/)) {
        $('#content').html($('#bonus', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/ratio$/)) {
        $('#content').html($('#ratio', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/requests$/)) {
        $('#content').html($('#requests', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/collages$/)) {
        $('#content').html($('#collection', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/clients$/)) {
        $('#content').html($('#clients', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').append($('#main', doc).html());
      }
      else if (site_url.match(/upload$|series$/)) {
        if (site_url.match(/upload$/)) {
          $('#content').html($('#upload', doc).find('#content').html() + '<br><br><br><br>');
          $('.rule_table').html($('#main', doc).html());
        } else {
          $('#content').html($('#series', doc).find('#content').html());
          $('#content').find('div.thin').append($('#main', doc).html());
          $('div:contains("HD-Forever General Rules")').last().hide();
        }
        $('.rule_table').html($('#main', doc).html());
        function findRule() {
          var query_string = $('#search_string').val();
          var q = query_string.replace(/\s+/gm, '').split('+');
          var regex = new Array();
          for (var i = 0; i < q.length; i++) {
            regex[i] = new RegExp(q[i], 'mi');
          }
          $('#actual_rules li').each(function () {
            var show = true;
            for (var i = 0; i < regex.length; i++) {
              if (!regex[i].test($(this).html())) {
                show = false;
                break;
              }
            }
            $(this).toggle(show);
          });
          $('.before_rules').toggle(query_string.length == 0);
        }

        var original_value = $('#search_string').val();
        $('#search_string').keyup(findRule);
        $('#search_string').focus(function () {
          if ($(this).val() == original_value) {
            $(this).val('');
          }
        });
        $('#search_string').blur(function () {
          if ($(this).val() == '') {
            $(this).val(original_value);
            $('.before_rules').show();
          }
        })
      }
      else if (site_url.match(/chat$/)) {
        $('#content').html($('#chat', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').last().append($('#main', doc).html());
      }
      else if (site_url.match(/tag$/)) {
        $('#content').html($('#tags', doc).find('#content').html() + '<br><br><br><br><br>');
        $('#content').find('div.thin').last().append($('#main', doc).html());
      }
    });
  } else if (site_url.match(/wiki.php/)) {
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/hdf_faq.html', null, function (doc) {
      if (site_url.match(/wiki.php$/)) {
        $('#content').html($('#content', doc).html());
      } else if (site_url.match(/action=article&id=\d+/)) {
        var aid = site_url.match(/id=(\d+)/)[1];
        $('div.header').html($(`#${aid}`, doc).find('div.header').html());
        $('div.main_column').html($(`#${aid}`, doc).find('div.main_column').html());
        $('div.sidebar').html($(`#sidebar`, doc).html());
      }
    });
  }
}

if (site_url.match(/^https:\/\/bluebird-hd.org\/.*/)) {
  if ($('a:contains(Главная)').length) {
    $('a[title="English"]').find('img').click();
  }

  var table_html = $('table.fblock').first().html();
  table_html = table_html.replace(/Поиск \/ Search/, 'Search');
  table_html = table_html.replace(/Что искать/g, 'What to search');
  table_html = table_html.replace(/По торрентам/g, 'By torrents');
  table_html = table_html.replace(/По запросам/g, 'On request');
  table_html = table_html.replace(/По предложениям/g, 'Suggestions');
  table_html = table_html.replace(/По описаниям/g, 'According descriptions');
  $('table.fblock').first().html(table_html);

  table_html = $('table.fblock:eq(6)').html();
  table_html = table_html.replace(/Используй ключ!/g, `Use the key!`);
  $('table.fblock:eq(6)').html(table_html);

  function repTxt(e, o, d) {
    var el = $(`${e}:contains(${o})`).last();
    var em = el.html();
    try {
      el.html(em.replace(o, d));
    } catch (err) { }
  }
  var dict_info = {
    'Фильмы': `Films`,
    'Мультфильмы': `Cartoons`,
    'Документалистика': `Documentary`,
    'Шоу/Музыка': `Show/Music`,
    'Спорт': `Sport`,
    'Сериалы': `TV series`,
    'Эротика': `Erotica`,
    'Дэмо/Misc': `Demo/Misc`,
  }
  if (site_url.match(/browse.php/)) {
    table = $('#highlighted').prev();
    table_html = table.html();
    table_html = table_html.replace(/Список торрентов/g, `List of torrents`);
    table_html = table_html.replace(/Фильмы/g, `Films`);
    table_html = table_html.replace(/Мультфильмы/g, `Cartoons`);
    table_html = table_html.replace(/Документалистика/g, `Documentary`);
    table_html = table_html.replace(/Шоу\/Музыка/g, `Show/Music`);
    table_html = table_html.replace(/Спорт/g, `Sport`);
    table_html = table_html.replace(/Сериалы/g, `TV series`);
    table_html = table_html.replace(/Эротика/g, `Erotica`);
    table_html = table_html.replace(/Дэмо\/Misc/g, `Demo/Misc`);
    table_html = table_html.replace(/Поиск/g, `Search`);
    table_html = table_html.replace(/Активные/g, `Active`);
    table_html = table_html.replace(/Включая мертвые/g, `Including the dead`);
    table_html = table_html.replace(/Только мертвые/g, `Only the dead`);
    table_html = table_html.replace(/Золотые торренты/g, `Golden torrents`);
    table_html = table_html.replace(/Бриллиантовые торренты/g, `Diamond torrents`);
    table_html = table_html.replace(/Без сидов/g, `No seeds`);
    table_html = table_html.replace(/Все типы/g, `All types`);
    table_html = table_html.replace(/Описание/g, `Description`);
    table_html = table_html.replace(/ИЛИ/g, `OR`);
    table_html = table_html.replace(/И/g, `And`);
    table_html = table_html.replace(/Страницы/g, `Pages`);
    table_html = table_html.replace(/Тип/g, `Type`);
    table_html = table_html.replace(/Носитель/g, `Carrier`);
    table_html = table_html.replace(/Название/g, `Name`);
    table.html(table_html);
  } else if (site_url.match(/userdetails.php/)) {
    repTxt('td', 'Зарегистрирован', 'Registered');
    repTxt('td', 'Последний раз был на трекере', 'Last seen');
    repTxt('td', 'Монет', 'Coins');
    $('td:contains(Пригласил)')[2].textContent = 'Invited by';
    $('td:contains(Раздал)')[2].textContent = 'Uploaded';
    $('td:contains(Скачал)')[2].textContent = 'Downloaded';
    $('td:contains(Пол)')[2].textContent = 'Gender';
    repTxt('td', 'Награды', 'Awards');
    repTxt('td', 'Класс', 'Class');
    repTxt('td', 'Предупреждения', 'Warnings');
    repTxt('td', 'Возраст', 'Age');
    repTxt('td', 'Дата Рождения', 'Date of Birth');
    repTxt('td', 'Знак зодиака', 'Zodiac sign');
    repTxt('td', 'Комментариев', 'Comments');
    try {
      $('td:contains(Скачаные)')[2].textContent = $('td:contains(Скачаные)')[2].textContent.replace('Скачаные торренты', 'Downloaded torrents');
    } catch (err) { }
    repTxt('td', 'Приглашенные', 'Invited');
    repTxt('td', 'Пользователь', 'User');
    try {
      $('td:contains(Пригласил)')[3].textContent = 'Invited by';
    } catch (err) { }
    $('input[value="Послать ЛС"]').val('Send PM');
    repTxt('a', 'Добавить в друзья', 'Add to friends');
    repTxt('a', 'Добавить в блокированные', 'Add to blocked');
    return;
  } else if (site_url.match(/details.php/)) {
    $('nobr').map((index, e) => {
      if (dict_info.hasOwnProperty($(e).text())) {
        repTxt('nobr', $(e).text(), dict_info[$(e).text()])
      }
    });
    repTxt('b', 'Оригинальное название', 'Original name');
    repTxt('b', 'Название', 'Name');
    repTxt('b', 'Год выхода', 'Released');
    repTxt('b', 'Жанр', 'Genre');
    repTxt('b', 'Режиссер', 'Director');
    repTxt('b', 'В ролях', 'Casts');
    repTxt('b', 'О фильме', 'About the movie');
    repTxt('b', 'Выпущено', 'Released');
    repTxt('b', 'Продолжительность', 'Productivity');
    repTxt('b', 'Контейнер', 'Container');
    repTxt('b', 'Видео', 'Video');
    repTxt('b', 'Перевод', 'Translation');
    repTxt('b', 'Звук', 'Sound');
    repTxt('b', 'Субтитры', 'Subtitles');
    repTxt('b', 'Звук', 'Sound');
    while ($('b:contains(Аудио)').length) {
      repTxt('b', 'Аудио', 'Audio');
    }
    repTxt('b', 'Релиз для', 'Release for');
    $('td[align=left]').map((index, e) => {
      if (dict_info.hasOwnProperty($(e).text())) {
        repTxt('td[align=left]', $(e).text(), dict_info[$(e).text()])
      }
    });
  } else if (site_url.match(/getrss.php/)) {
    var td_html = $('td:contains(Категории)').last().next().html();
    for (var key in dict_info) {
      td_html = td_html.replace(key, dict_info[key]);
    }
    td_html = td_html.replace('Если вы не выберете категории для просмотра,', 'If you do not select categories to view,');
    td_html = td_html.replace('вам будет выдана ссылка на все категории.', 'you will be given a link to all categories.');
    $('td:contains(Категории)').last().next().html(td_html);
    repTxt('td', 'Категории', 'Categories');

    td_html = $('td:contains(Тип ссылки в RSS)').last().html();
    td_html = td_html.replace('Ссылка на страницу', 'Link to the page');
    td_html = td_html.replace('Ссылка на скачивание', 'Link to download');
    $('td:contains(Тип ссылки в RSS)').last().html(td_html);
    repTxt('td', 'Тип ссылки в RSS', 'RSS link type');

    td_html = $('td:contains(Тип логина)').last().next().html();
    td_html = td_html.replace('Стандарт (cookies)', 'Standard (cookies)');
    td_html = td_html.replace('Альтернативный (passkey)', 'Alternate (passkey)');
    $('td:contains(Тип логина)').last().next().html(td_html);
    repTxt('td', 'Тип логина', 'Login type');
    repTxt('button', 'Сгенерировать RSS ссылку', 'Generate RSS link');
  } else if (site_url.match(/invite.php/)) {
    repTxt('b', 'Статус приглашенных вами', 'Status of your invitees');
    repTxt('b', 'Статус созданых приглашений', 'Status of created invitations');
    repTxt('b', 'Пользователь', 'User');
    repTxt('b', 'Раздал', 'Uploaded');
    repTxt('b', 'Скачал', 'Downloaded');
    repTxt('b', 'Рейтинг', 'Ratio');
    repTxt('b', 'Статус', 'Status');
    while ($('td:contains(Не подтвержден)').length) {
      repTxt('td', 'Не подтвержден', 'Not confirmed');
    }
    repTxt('b', 'Подтвердить', 'Confirm');
    repTxt('td', 'На данный момент вами не создано ниодного приглашения.', 'You have not created any invitation yet.');
    repTxt('td', 'Еще никто вами не приглашен.', 'No one has been invited by you yet.')
    $('input[value="Подтвердить пользователей"]').val('Verify Users');
    repTxt('b', 'Код приглашения', 'Invitation code');
    repTxt('b', 'Дата создания', 'Date of creation');
    repTxt('a', 'Удалить приглашение', 'Delete invitation');
    $('input[value="Создать приглашение"]').val('Create an invitation');
    repTxt('b', 'Создать пригласительный код', 'Create invitation code');
    repTxt('b', 'осталось', 'Left');
    repTxt('b', 'приглашений', 'invitations');
    $('input[value="Создать"]').val('Create');
// [Site Logic: Rules.Php]
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/bluebird_faq.html', null, function (doc) {
      $('td.outer').find('table:eq(0)').html($('tbody', doc).html());
    });
  } else if (site_url.match(/mybonus.php/)) {
    function send() {
      var frm = document.mybonus;
      var bonus_type = '';
      try { bonus_type = $('input[name="bonus_id"]:checked').val() } catch (err) { }
      var ajax = new tbdev_ajax();
      ajax.onShow('');
      var varsString = "";
      ajax.requestFile = "mybonus.php";
      ajax.setVar("id", bonus_type);
      ajax.method = 'POST';
      ajax.element = 'ajax';
      ajax.sendAJAX(varsString);
    }
    getDoc('https://raw.githubusercontent.com/tomorrow505/auto_feed_js/master/bluebird_bonus.html', null, function (doc) {
      var current_coin = $('#ajax').html().match(/Мои монетки \((.*?) монет .* наличии \/ (.*?) единиц в час\)/)[1];
      var hourly_bonus = $('#ajax').html().match(/Мои монетки \((.*?) монет .* наличии \/ (.*?) единиц в час\)/)[2];
      const searchRegExp = /current_coin/g;
      $('#ajax').find('table').first().html($('#transfer', doc).html().replace(searchRegExp, current_coin).replace('hourly_coin', hourly_bonus));
      $('#ajax').next().html($('#calculator', doc).html());
      $('input[value=Exchange]').click(send);
    });
  }
}

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

if (site_url.match(/^https:\/\/blutopia.cc\/torrents\/similar/)) {
  var ids = $('ul.meta__ids').html()
  raw_info.url = match_link('imdb', ids);
  if (raw_info.url && all_sites_show_douban) {
    getData(raw_info.url, function (data) {
      if (data.data) {
        var score = data.data.average + '分';
        if (!score.replace('分', '')) score = '暂无评分';
        if (data.data.votes) score += `|${data.data.votes}人`;
        $('h1.meta__title').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank" style="display: inline; width: auto; border-bottom: 0px !important; text-decoration: none; color: #d3d3d3; font-weight: bold;">${data.data.title.split(' ')[0]}[${score}]</a>`);
        if (data.data.summary && data.data.summary.length < 700 && data.data.summary.match(/[\u4e00-\u9fa5]/)) {
          $('p.meta__description').text(data.data.summary.replace(/ 　　/g, ''));
        }
      }
    });
  }
  return;
}

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

//脚本设置简单页面，使用猫/杜比等站点的个人设置页面来做的，涵盖转图床的部分操作
if (site_url.match(/^https:\/\/.*?usercp.php\?action=personal(#setting|#ptgen|#mediainfo|#dealimg|#signin)/)) {
  setTimeout(function () {
    var style = `
        #sortable { list-style-type: none; margin: 0; padding: 0; width: 750px; display: inline-block}
        #sortable div { margin: 3px 3px 3px 0; padding: 1px; float: left; width: 100px; height: 20px; font-size: 1em; text-align: left; }
        #ksortable { list-style-type: none; margin: 0; padding: 0; width: 750px; display: inline-block}
        #ksortable div { margin: 3px 3px 3px 0; padding: 1px; float: left; width: 100px; height: 20px; font-size: 1em; text-align: left; }
        `;
    GM_addStyle(style);

    var $table = $('#outer table').last();
    $table.find('tr').css({ "display": "none" });
    $('#usercpnav').hide();
    //********************************************** 0 **********************************************************************************
    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">一键签到</td><td width="99%" class="rowfollow" valign="top" align="left" id="signin"></td></tr>`);
    $('#signin').append(`<b>签到站点设置</b>`);
    $('#signin').append(`&nbsp;&nbsp;&nbsp;<a href="#" id="s_all" style="color:red">全选</a>&nbsp;&nbsp;&nbsp;<a href="#" id="u_all" style="color:red">全不选</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="s_fail" style="color:red">保留失败站点</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="u_fail" style="color:red">去掉失败站点</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="hide_unselected" style="color:red">隐藏未选择(默认)</a>
                            &nbsp;&nbsp;&nbsp;<a href="#" id="show_all" style="color:red">全部显示</a>`);
    $('#signin').append(`<b>&nbsp;&nbsp;&nbsp;</b><a href="#", target="_blank" id="begin_sign"><font color="red"><b>→开始签到←</b></font></a>`);
    $('#signin').append(`<br><div id="ksortable"></div>`);

    var unsupported_sites = ['digitalcore', 'HD-Only', 'HOU', 'OMG', 'TorrentLeech', 'MTeam', 'UBits', 'PigGo'];

    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (unsupported_sites.indexOf(key) < 0) {
        $('#ksortable').append(`<div class="ui-state-default ui-sortable-handle"><input type="checkbox" kname=${key} value="yes" class="s_all">
                    <a href="${used_site_info[key].url}" target="_blank"><b>${key}</b></a></div>`);
      }
    }
    for (key in o_site_info) {
      if (site_order.indexOf(key) < 0 && unsupported_sites.indexOf(key) < 0) {
        $('#ksortable').append(`<div class="ui-state-default ui-sortable-handle"><input type="checkbox" kname=${key} value="yes" class="s_all">
                    <a href="${o_site_info[key]}" target="_blank"><b>${key}</b></a></div>`);
      }
    }
    $("#ksortable").sortable();
    $("#ksortable").disableSelection();

    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (used_signin_sites.indexOf(key) > -1) {
        $(`input[kname=${key}]`).prop('checked', true);
      }
    }
    for (key in o_site_info) {
      if (used_signin_sites.indexOf(key) > -1) {
        $(`input[kname=${key}]`).prop('checked', true);
      }
    }
    $('#signin').append(`<br><br><font color="red">暂不支持的站点列表：</font><div id="unsupported_sites" style="display:inline-block; margin-left:3px"></div>`);
    unsupported_sites.forEach((e) => {
      $('#unsupported_sites').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${o_site_info[e] ? o_site_info[e] : used_site_info[e].url}" target="_blank"><b>${e}</b></a></div>`);
    });
    $('#signin').append(`<br><font color="red">手动获取魔力的站点：</font>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['CHDBits'].url + 'bakatest.php'}" target="_blank"><b>CHDBits</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${o_site_info['U2'] + 'showup.php'}" target="_blank"><b>U2</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['HDSky'].url}" target="_blank"><b>HDSky</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['TJUPT'].url + 'attendance.php'}" target="_blank"><b>TJUPT</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['52PT'].url + 'bakatest.php'}" target="_blank"><b>52PT</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['WT-Sakura'].url + 'attendance.php'}" target="_blank"><b>WT-Sakura</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['OurBits'].url + 'attendance.php'}" target="_blank"><b>OurBits</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['PigGo'].url + 'attendance.php'}" target="_blank"><b>PigGo</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['OpenCD'].url}" target="_blank"><b>OpenCD</b></a></div>`);
    $('#signin').append(` | <div style="display:inline-block; margin-left:5px; margin-right:5px"><a href="${used_site_info['UBits'].url}" target="_blank"><b>UBits</b></a></div>`);

    $('#signin').append(`<br><br><br>`);
    $('#signin').append(`<input type="button" id="ksave_setting" value="保存脚本设置！&nbsp;(只需点击一次)">`);
    $('#signin').append(`&nbsp;&nbsp;<font color="green">说明：红色表示获取到魔力，橙色表示登录成功，蓝色表示登录失败，黑色表示暂不支持或无响应。</font>`);
    if (site_url.match(/springsunday/)) {
      $('#ksave_setting').css({ 'color': 'white', 'background': 'url(https://springsunday.net/styles/Maya/images/btn_submit_bg.gif) repeat left top', 'border': '1px black' });
    }
    $('#ksave_setting').click((e) => {
      used_signin_sites = [];
      for (key in default_site_info) {
        if ($(`input[kname=${key}]`).prop('checked')) {
          used_signin_sites.push(key);
        }
      }
      for (key in o_site_info) {
        if ($(`input[kname=${key}]`).prop('checked')) {
          used_signin_sites.push(key);
        }
      }
      GM_setValue('used_signin_sites', JSON.stringify(used_signin_sites.join(',')));
      alert('保存成功！！！');
    });

    $('#s_all').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').prop('checked', true);
    });
    $('#u_all').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').prop('checked', false);
    });
    $('#s_fail').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').map((index, e) => {
        if ($(e).prop('checked')) {
          if ($(e).parent().find('a').css('color') !== 'rgb(17, 17, 17)' && $(e).parent().find('a').css('color') !== 'rgb(0, 0, 255)') {
            $(e).prop('checked', false);
          }
        }
      });
    });
    $('#u_fail').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').map((index, e) => {
        if ($(e).prop('checked')) {
          if ($(e).parent().find('a').css('color') === 'rgb(17, 17, 17)' || $(e).parent().find('a').css('color') === 'rgb(0, 0, 255)') {
            $(e).prop('checked', false);
          }
        }
      });
    });
    $('#hide_unselected').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').map((index, e) => {
        if (!$(e).prop('checked')) {
          $(e).parent().hide();
        }
      });
    });
    $('#show_all').click(e => {
      e.preventDefault();
      $('#signin').find('.s_all').parent().show();
    });

    $('#signin').find('.s_all').map((index, e) => {
      if (!$(e).prop('checked')) {
        $(e).parent().hide();
      }
    });

    $('#begin_sign').click((e) => {
      e.preventDefault();
      var attendance_sites = ['PThome', 'HDHome', 'HDDolby', 'Audiences', 'PTLGS', 'SoulVoice', 'OKPT', 'UltraHD', 'CarPt', 'ECUST', 'iloli', 'PTChina', 'HDClone',
        'HDVideo', 'HDTime', 'FreeFarm', 'HDfans', 'PTT', 'ZMPT', 'OKPT', 'CrabPt', 'QingWa', 'ICC', 'LemonHD', '1PTBA', 'HDBAO', 'AFUN', '星陨阁',
        'CyanBug', '杏林', '海棠', 'Panda', 'KuFei', 'PTCafe', 'GTK', 'HHClub', '麒麟', 'AGSV', 'Oshen', 'PTFans', 'PTzone', '雨', '唐门', '天枢', '财神', 'DevTraker',
        'CDFile', '柠檬不甜', 'ALing', 'LongPT', 'BaoZi'
      ];

      attendance_sites.forEach((e) => {
        if (used_signin_sites.indexOf(e) > -1) {
          try {
            var signin_url = used_site_info[e].url + 'attendance.php';
          } catch (Err) {
            signin_url = o_site_info[e] + 'attendance.php';
          }
          getDoc(signin_url, null, function (doc) {
            if ($('#outer', doc).find('table.main').find('table').length) {
              console.log(`开始签到${e}：`, $('#outer', doc).find('table.main').find('table').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
            } else if ($('table.mainouter', doc).find('table.main').find('table').length) {
              console.log(`开始签到${e}：`, $('table.mainouter', doc).find('table.main').find('table').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
            } else if ($('div.mainouter', doc).find('div.main').find('table').length) {
              console.log(`开始签到${e}：`, $('div.mainouter', doc).find('div.main').find('table').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
            } else if ($('#content', doc).length) {
              console.log(`开始签到${e}：`, $('#content', doc).find('p[class="register-now-info register-info"]').text().trim());
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "red" });
// [Site Logic: Ptt]
              console.log(`开始签到${e}：`, '失败！！！');
              $(`input[kname=${e}]`).parent().find('a').css({ "color": "blue" });
            }
          });
        }
      });

// [Site Logic: Hdarea]
// [Site Logic: Pter]
// [Site Logic: Hdu]
// [Site Logic: Ttg]
// [Site Logic: Btschool]
// [Site Logic: Hdcity]

      function log_in(sites, judge_str) {
        sites.forEach((e) => {
          if (used_signin_sites.indexOf(e) > -1) {
            var url = used_site_info.hasOwnProperty(e) ? used_site_info[e].url : o_site_info[e];
            getDoc(url, null, function (doc) {
// [Site Logic: Dtr]
// [Site Logic: ZHUQUE]
              if ($(judge_str, doc).length) {
                $(`input[kname=${e}]`).parent().find('a').css({ "color": "DarkOrange" });
                console.log(`开始登陆${e}：`, '成功登陆！！');
              } else {
                $(`input[kname=${e}]`).parent().find('a').css({ "color": "blue" });
                console.log(`开始登陆${e}：`, '登陆失败！！！！！！！');
              }
            });
          }
        });
      }

      var np_sites = ['CHDBits', 'CMCT', 'FRDS', 'TLFbits', 'TCCF', 'PTsbao', 'OpenCD', 'HUDBT', 'HDSky', 'ITZMX',
        'NanYang', 'DiscFan', 'Dragon', 'U2', 'YDY', 'JoyHD', 'HITPT', 'ITZMX', 'OurBits', 'UBits'];
      log_in(np_sites, '#mainmenu');
      log_in(['PuTao'], '#userbar');
      log_in(['HDRoute'], '#nav');
      log_in(['BYR'], '#pagemenu');
      log_in(['TJUPT'], '#info_block');
      log_in(['ANT'], '#nav_home');
      log_in(['NBL'], '#mainnav');
      log_in(['PigGo'], '#info_block');
      log_in(['BTN', 'SC', 'MTV', 'UHD', 'HDSpace', 'TVV', 'HDF', 'RED', 'jpop', 'lztr', 'DICMusic', 'OPS', 'bit-hdtv', 'SugoiMusic'], '#menu');
      log_in(['HDB'], '#menusides');
      log_in(['BHD'], 'div[class="beta-table"]');
      log_in(['PTP'], 'div[class="main-menu"]');
      log_in(['GPW'], 'div[class="HeaderNav"]');
      log_in(['KG'], 'a[class="customtab1"]');
      log_in(['HDT'], 'img[class="torrents"]');
      log_in(['xthor'], '#navbar');
      log_in(['HONE'], '#hoeapp-container');
      log_in(['FileList'], '#navigation');
      log_in(['bib'], '#header_nav');
      log_in(['IN'], '#nav');
      log_in(['影'], '#nav_menu');

      log_in(['BLU', 'HDOli', 'Monika', 'Tik', 'Aither', 'FNP', 'OnlyEncodes', 'DarkLand', 'ReelFliX'], 'nav[class="top-nav"]');
      log_in(['DTR', 'ZHUQUE'], 'nav[class="container mx-auto"]');
      log_in(['ACM'], 'ul[class="left-navbar"]');

      log_in(['BlueBird'], 'a[href*="browse.php"]');
      log_in(['CG'], 'a[href*="userdetails.php"]');
      log_in(['IPT'], 'div[class="stats"]');
      log_in(['HaiDan'], 'div[class="navbar special-border"]');
      log_in(['bwtorrents'], '#menu-aeon');
      log_in(['TorrentLeech'], 'span[class="div-menu-item logout-menu-item"]');
      log_in(['HD-Only'], '#nav_userinfo');
      log_in(['iTS'], 'table[class="menubar"');

      // avz系列
      var avz_list = ['avz', 'PHD', 'CNZ', 'torrentseeds'];
      log_in(avz_list, 'div[class="ratio-bar"]');
    });

    //***********************************************************************************************************************************

    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">脚本设置</td><td width="99%" class="rowfollow" valign="top" align="left" id="setting"></td></tr>`);
    $('#setting').append(`<b>使用教程：</b><a href="https://gitee.com/tomorrow505/auto_feed_js/wikis/pages", target="_blank"><font color="red">→跳转←</font></a>`);
    $('#setting').append(`<b>&nbsp;&nbsp;&nbsp;更新地址：</b><a href="https://greasyfork.org/zh-CN/scripts/424132-auto-feed/", target="_blank"><font color="red">→跳转←</font></a>`);
    $('#setting').append(`<b>&nbsp;&nbsp;&nbsp;项目托管1：</b><a href="https://github.com/tomorrow505/auto_feed_js/", target="_blank"><font color="red">→GitHub←</font></a>`);
    $('#setting').append(`<b>&nbsp;&nbsp;&nbsp;项目托管2：</b><a href="https://gitee.com/tomorrow505/auto_feed_js/", target="_blank"><font color="red">→Gitee←</font></a>`);
    $('#setting').append(`<br><br>`);

    //************************************************** 1 ***************************************************************************
    $('#setting').append(`<b>转发站点设置</b>`);
    $('#setting').append(`<br><div id="sortable"></div>`);
    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      $('#sortable').append(`<div class="ui-state-default ui-sortable-handle"><input type="checkbox" class="support_site" name=${key} value="yes"><a href="${default_site_info[key].url}" target="_blank">${key}</a></div>`);
    }
    $("#sortable").sortable();
    $("#sortable").disableSelection();

    $('#setting').append(`<br><input type="button" id="select_all" value="全部选中" style="margin-top: 10px">`);
    $('#setting').append(`<input type="button" id="unselect_all" value="取消选中" style="margin-left: 25px"></br>`);
    $('#setting').append(`<br>`);

    $('#select_all').click(function () {
      $('.support_site').map(function () {
        $(this).prop('checked', true);
      });
    });
    $('#unselect_all').click(function () {
      $('.support_site').map(function () {
        $(this).prop('checked', false);
      });
    });

    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (used_site_info[key].enable) {
        $(`input[name=${key}]`).prop('checked', true);
      }
    }

    //**************************************************** 2 **************************************************************************
    count = 0;
    $('#setting').append(`<b>常用站点设置</b></br>`);
    for (index = 0; index < site_order.length; index++) {
      var key = site_order[index];
      if (used_site_info[key].enable) {
        $('#setting').append(`<div class="container"><input type="checkbox" title=${key} value="yes">${key}</div>`);
        if ((count + 1) % 8 == 0) {
          $('#setting').append(`<br>`);
        }
        count += 1;
      }
    }
    $('#setting').append(`<br><br>`);
    $('.container').css({ 'display': 'inline-block', 'width': '90px' });

    for (key in used_common_sites) {
      if (used_site_info[used_common_sites[key]] !== undefined && used_site_info[used_common_sites[key]].enable) {
        $(`input[title=${used_common_sites[key]}]`).prop('checked', true);
      }
    }

    //**************************************************** 3 *************************************************************************
    $('#setting').append(`<b>是否在种子页面开启快捷搜索功能：</b>`);
    for (key in show_search_urls) {
      if (show_search_urls[key]) {
        $('#setting').append(`<div class="show_url"><input type="checkbox" show=${key} value="yes" checked="">${key}</div>`);
      } else {
        $('#setting').append(`<div class="show_url"><input type="checkbox" show=${key} value="yes">${key}</div>`);
      }
    }
    $('#setting').append(`<br><br>`);

    //**************************************************** 3.1 *************************************************************************

    $('#setting').append(`<b>是否开启脚本额外显示功能：</b>`);
    for (key in extra_settings) {
      if (extra_settings[key].enable) {
        $('#setting').append(`<div class="extra"><input type="checkbox" name=${key} value="yes" checked="">${extra_settings[key].title}</div>`);
      } else {
        $('#setting').append(`<div class="extra"><input type="checkbox" name=${key} value="yes">${extra_settings[key].title}</div>`);
      }
// [Site Logic: PTP]
    }
    $('.show_url').css({ 'display': 'inline-block', 'width': '70px' });
    $('.extra').css({ 'display': 'inline-block', 'width': '90px' });
    $(`input[name="ptp_show_group_name"]`).parent().css({ 'width': '170px' });
    $('#setting').append(`<br><br>`);

    //**************************************************** 3.2 *************************************************************************
    $('#setting').append(`<b>选择IMDb到豆瓣ID的获取方式(适用于外站)：</b>`);
    $('#setting').append(`<input type="radio" name="imdb2db" value="0">豆瓣API`);
    $('#setting').append(`<input type="radio" name="imdb2db" value="1">豆瓣爬取`);
    $(`input:radio[name="imdb2db"][value="${imdb2db_chosen}"]`).prop('checked', true);
    $('#setting').append(`<br><br>`);

    //**************************************************** 4 ***************************************************************************
    $('#setting').append(`<b>选择PTGen的API节点(适用于外站)：</b>`);
    $('#setting').append(`<input type="radio" name="ptgen" value="0">api.iyuu.cn`);
    $('#setting').append(`<input type="radio" name="ptgen" value="1">ptgen`);
    $('#setting').append(`<input type="radio" name="ptgen" value="3">豆瓣页面爬取`);
    $(`input:radio[name="ptgen"][value="${api_chosen}"]`).prop('checked', true);
    $('#setting').append(`<br><br>`);

    //**************************************************** 4 ***************************************************************************
    $('#setting').append(`<b>选择TorrentLeech的默认域名：</b>`);
    $('#setting').append(`<input type="radio" name="tldomain" value="0">torrentleech.org`);
    $('#setting').append(`<input type="radio" name="tldomain" value="1">torrentleech.me`);
    $('#setting').append(`<input type="radio" name="tldomain" value="2">torrentleech.cc`);
    $('#setting').append(`<input type="radio" name="tldomain" value="3">tlgetin.cc`);
    $(`input:radio[name="tldomain"][value="${tldomain}"]`).prop('checked', true);
    $('#setting').append(`<br><br>`);


    //**************************************************** 4 ***************************************************************************
    $('#setting').append(`<b>快速搜索站点设置(每个一行,可自行添加)
            <a href="https://gitee.com/tomorrow505/auto-feed-helper/raw/master/temple_search_urls" target=_blank>
            <font color="red">范例</font></a></b></br>`);

    getDoc('https://gitee.com/tomorrow505/auto-feed-helper/raw/master/temple_search_urls', null, function (doc) {
      $(`<font>从范例页面获取：</font><input id="url_input" type="text" list="options_jump_href" style="border-radius:2px;">
                <datalist name="options_jump_href" id="options_jump_href" style="width:100px; margin-bottom:3px; margin-right:5px"><option value="---">---</option></datalist><a type="button" id="append_url" href="#" style="color:blue">↓ 新增</a><br>`).insertBefore($('textarea[name="set_jump_href"]'));
      $(`<div style="display:none; margin-bottom:5px"><span id="show_selected"></span><br></div>`).insertBefore($('textarea[name="set_jump_href"]'));
      var urls_to_append = $('body', doc).find('a');
      var urls_appended = $('textarea[name="set_jump_href"]').val();
      urls_to_append.map((index, e) => {
        var url_to_append = $(`a:contains(${$(e).text()})`, doc).attr('href').replace(/\/|\?/g, '.');
        var reg = new RegExp(url_to_append, 'i');
        if (!urls_appended.match(reg)) {
          $('datalist[name="options_jump_href"]').append(`<option value=${$(e).text()}>${$(e).text()}</option>`);
        }
      });
      $('#append_url').click((e) => {
        e.preventDefault();
        var origin_str = $('textarea[name="set_jump_href"]').val();
        $('textarea[name="set_jump_href"]').val(origin_str + '\n' + $('#show_selected').text());
      });
      $('input[id="url_input"]').change((e) => {
        var selected_url = $(e.target).val();
        var jump_url = $(`a:contains(${selected_url})`, doc).prop("outerHTML").replace(/&amp;/g, '&');
        if (jump_url) {
          $('#show_selected').text(jump_url).parent().show();
        }
      });
    })
    $('#setting').append(`<textarea name="set_jump_href" style="width:700px" rows="15"></textarea><br><br>`);
    $('textarea[name="set_jump_href"]').val(used_search_list.join('\n'));

    //**************************************************** 4.2 ***************************************************************************
    $('#setting').append(`
            <div style="margin-bottom=5px"><b>远程服务器配置<目前仅适配QB和TR，<a href="https://gitee.com/tomorrow505/auto_feed_js/wikis/4.%E5%85%B6%E4%BB%96%E5%8A%9F%E8%83%BD/qb%E8%BF%9C%E7%A8%8B%E6%8E%A8%E9%80%81" target="_blank"><font color="red">->配置方式请点击<-</font></a>></b>
            <input type="file" id="jsonFileInput" accept=".json">
            <div id="jsonData"></div>
            </div></br>
        `);
    $('#jsonFileInput').change(function () {
      var file = $(this)[0].files[0];
      if (file) {
        var reader = new FileReader();
        reader.onload = function (event) {
          var fileContent = event.target.result;
          try {
            var jsonData = JSON.parse(fileContent);
            $('#jsonData').html('<h3>解析后的 JSON 数据：</h3><pre>' + JSON.stringify(jsonData, null, 2) + '</pre>');
            GM_setValue('remote_server', JSON.stringify(jsonData));
          } catch (error) {
            $('#jsonData').html('<p>无效的 JSON 格式</p>');
            console.error('Invalid JSON format:', error);
          }
        };
        reader.readAsText(file);
      } else {
        $('#jsonData').html('<p>请选择一个 JSON 文件上传。</p>');
        console.error('Please select a JSON file to upload.');
      }
    });

    //**************************************************** 5 ***************************************************************************
    $('#setting').append(`<div style="margin-bottom=5px"><b>脚本相关API-KEY值设置</b></div></br>`);
    $('#setting').append(`<label><b>TMDB影库对应apikey(<a href="https://www.themoviedb.org/settings/api" target="_blank"><font color="red">登录官网</font></a>自行申请):</b></label><input type="text" name="tmdb_key" style="width: 300px;  margin-left:5px" value=${used_tmdb_key}><br><br>`);
    $('#setting').append(`<label><b>PTPimg对应的apikey(<a href="https://ptpimg.me/" target="_blank"><font color="red">打开首页</font></a>即可获取):</b></label><input type="text" name="ptp_img_key" style="width: 300px; margin-left:5px" value=${used_ptp_img_key}><br><br>`);
    for (key in used_rehost_img_info) {
      if (key == 'catbox') { continue; }
      $('#setting').append(`<label><b>${key}对应apikey(<a href="${used_rehost_img_info[key].url}" target="_blank"><font color="red">登录站点</font></a>即可获取):</b></label><input type="text" name="${key}_key" style="width: 300px; margin-left:5px" value=${used_rehost_img_info[key]['api-key']}><br><br>`);
    }
    $('#setting').append(`<label><b>TorrentLeech的rsskey(<a href="https://wiki.torrentleech.org/doku.php/rss_-_how_to_automatically_download_torrents_with_utorrent" target="_blank"><font color="red">依照教程</font></a>进行设置):</b></label><input type="text" name="tl_rss_key" style="width: 300px; margin-left:5px" value=${used_tl_rss_key}><br><br>`);
    $('label').css({ "width": "280px", "text-align": "right", "display": "inline-block" });

    //**************************************************** 3.2 *************************************************************************
    $('#setting').append(`<input type="checkbox" name="anonymous" value="yes">是否匿名，此处勾选之后，在发布种子时，发布页面将默认预先勾选匿名发布。<br>`);
    if (if_uplver) {
      $(`input[name="anonymous"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="douban_jump" value="yes">是否显示豆瓣页面跳转选项，默认开启。<br>`);
    if (if_douban_jump) {
      $(`input[name="douban_jump"]`).prop('checked', true);
    }
    $('#setting').append(`<input type="checkbox" name="imdb_jump" value="yes">是否显示IMDB页面跳转选项，默认开启。<br>`);
    if (if_imdb_jump) {
      $(`input[name="imdb_jump"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="hdb_hide_douban" value="yes">是否折叠HDB中文豆瓣信息，默认展开。<br>`);
    if (hdb_hide_douban) {
      $(`input[name="hdb_hide_douban"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="chd_use_backup_url" value="yes">是否使用CHD备份网址，如果勾选将采用类似hb.chddiy.xyz的域名。<br>`);
    if (chd_use_backup_url) {
      $(`input[name="chd_use_backup_url"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="checkbox" name="nhd_use_v6_url" value="yes">是否使用NexusHD IPv6网址，如果勾选将采用 IPv6 域名（校内使用一般不勾选）。<br><br>`);
    if (nhd_use_v6_url) {
      $(`input[name="nhd_use_v6_url"]`).prop('checked', true);
    }

    $('#setting').append(`<input type="button" id="save_setting" value="保存脚本设置！&nbsp;(只需点击一次)">`);
    if (site_url.match(/springsunday/)) {
      $('#save_setting, #select_all, #unselect_all').css({ 'color': 'white', 'background': 'url(https://springsunday.net/styles/Maya/images/btn_submit_bg.gif) repeat left top', 'border': '1px black' });
    }

    //点击保存
    $('#save_setting').click(function () {
      // 更新site order
      site_order = [];
      $('#sortable').find('input').each(function () {
        site_order.push($(this).parent().text());
      });
      GM_setValue('site_order', JSON.stringify(site_order.join(',')));

      //处理支持站点
      for (key in used_site_info) {
        if ($(`input[name=${key}]`).prop('checked')) {
          used_site_info[key].enable = 1;
        } else {
          used_site_info[key].enable = 0;
        }
      }
      GM_setValue('used_site_info', JSON.stringify(used_site_info));

      //处理常用站点
      used_common_sites = [];
      for (key in default_site_info) {
        if ($(`input[title=${key}]`).prop('checked')) {
          used_common_sites.push(key);
        }
      }
      GM_setValue('used_common_sites', JSON.stringify(used_common_sites.join(',')));

      GM_setValue('imdb2db_chosen', $('input[name="imdb2db"]:checked').val());

      GM_setValue('api_chosen', $('input[name="ptgen"]:checked').val());

      GM_setValue('tldomain', $('input[name="tldomain"]:checked').val());

      for (key in show_search_urls) {
        if ($(`input[show=${key}]`).prop('checked')) {
          show_search_urls[key] = 1;
        } else {
          show_search_urls[key] = 0;
        }
      }
      GM_setValue('show_search_urls', JSON.stringify(show_search_urls));

      for (key in extra_settings) {
        if ($(`input[name=${key}]`).prop('checked')) {
          extra_settings[key].enable = 1;
        } else {
          extra_settings[key].enable = 0;
        }
      }
      GM_setValue('extra_settings', JSON.stringify(extra_settings));

      //处理快速搜索
      used_search_list = $('textarea[name="set_jump_href"]').val().split('\n').join(',');
      if (!used_search_list[used_search_list.length - 1]) {
        used_search_list.pop();
      }
      GM_setValue('used_search_list', JSON.stringify(used_search_list));

      //处理ptp-tmdb的key
      GM_setValue('used_ptp_img_key', $(`input[name="ptp_img_key"]`).val());
      GM_setValue('used_tmdb_key', $(`input[name="tmdb_key"]`).val());
      GM_setValue('used_tl_rss_key', $(`input[name="tl_rss_key"]`).val());

      //处理匿名
      if_uplver = $(`input[name="anonymous"]:last`).prop('checked') ? 1 : 0;
      GM_setValue('if_uplver', if_uplver);

      if_douban_jump = $(`input[name="douban_jump"]`).prop('checked') ? 1 : 0;
      GM_setValue('if_douban_jump', if_douban_jump);

      if_imdb_jump = $(`input[name="imdb_jump"]`).prop('checked') ? 1 : 0;
      GM_setValue('if_imdb_jump', if_imdb_jump);

      hdb_hide_douban = $(`input[name="hdb_hide_douban"]`).prop('checked') ? 1 : 0;
      GM_setValue('hdb_hide_douban', hdb_hide_douban);

      chd_use_backup_url = $(`input[name="chd_use_backup_url"]`).prop('checked') ? 1 : 0;
      GM_setValue('chd_use_backup_url', chd_use_backup_url);

      nhd_use_v6_url = $(`input[name="nhd_use_v6_url"]`).prop('checked') ? 1 : 0;
      GM_setValue('nhd_use_v6_url', nhd_use_v6_url);

      //处理key值
      for (key in used_rehost_img_info) {
        used_rehost_img_info[key]['api-key'] = $(`input[name="${key}_key"]`).val();
      }
      GM_setValue('used_rehost_img_info', JSON.stringify(used_rehost_img_info));

      ptp_name_location = $(`input:radio[name="name_location"]:checked`).val();
      GM_setValue('ptp_name_location', ptp_name_location);

      alert('保存成功！！！')
    });

    //自制ptgen
    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">PTGen</td><td width="99%" class="rowfollow" valign="top" align="left" id="ptgen"></td></tr>`);
    $('#ptgen').append(`<label><b>输入豆瓣/IMDB/Bangumi链接查询:</b></label><input type="text" name="url" style="width: 320px; margin-left:5px">`);
    $('#ptgen').append(`<input type="button" id="go_ptgen" value="获取信息" style="margin-left:15px"><input type="button" id="douban2ptp" value="海报转存PTPimg" style="margin-left:15px"><br><br>`);
    $('#ptgen').append(`<textarea name="douban_info" style="width:720px" rows="30"></textarea><br>`);

    $('#go_ptgen').click(function () {
      var raw_info = { 'url': '', 'dburl': '', 'descr': '', 'bgmurl': '' };
      var url = $('input[name="url"]').val();
      $('#go_ptgen').prop('value', '正在获取');
      var flag = true;
      if (match_link('imdb', url)) {
        flag = true;
        raw_info.url = match_link('imdb', url);
      } else if (match_link('douban', url)) {
        flag = false;
        raw_info.dburl = match_link('douban', url);
      } else if (match_link('bangumi', url)) {
        flag = false;
        raw_info.bgmurl = match_link('bangumi', url);
      } else {
        alert('请输入合适的链接！！！');
        return;
      }
      if (!raw_info.bgmurl) {
        create_site_url_for_douban_info(raw_info, flag).then(function (raw_info) {
          if (raw_info.dburl) {
            get_douban_info(raw_info);
          }
        }, function (err) {
          if (confirm("该资源貌似没有豆瓣词条，是否获取imdb信息？")) {
            async function formatDescr() {
              var descr = kg_intro_base_content.split('Screenshots here')[0].trim();
              var doc = await getimdbpage(raw_info.url);
              const imdb_json = JSON.parse($('script[type="application/ld+json"]', doc).text());
              var country = Array.from($('li.ipc-metadata-list__item:contains("Countr")', doc).find('a')).map(function (e) {
                return $(e).text();
              });
              country = country.map(function (e) {
                if (e == 'United States') e = 'USA';
                if (e == 'United Kingdom') e = 'UK';
                return e;
              }).join(', ');
              var index = descr.search('Date Published');
              descr = descr.substring(0, index) + `Country: ${country}\n` + descr.substring(index);
              descr = descr.format({ 'poster': imdb_json.image });
              descr = descr.format({ 'title': $('h1:eq(0)', doc).text().trim() });
              descr = descr.format({ 'genres': imdb_json.genre.join(', ') });
              descr = descr.format({ 'date': $('li.ipc-metadata-list__item:contains("Release date")', doc).find('div').find('li').text() });
              descr = descr.format({ 'score': $('div[data-testid*=aggregate-rating__score]:eq(0)', doc).text() });
              descr = descr.format({ 'imdb_url': raw_info.url });
              var director = Array.from($('li.ipc-metadata-list__item:contains("Director"):eq(0)', doc).find('a')).map(function (e) {
                return $(e).text();
              }).join(', ');
              descr = descr.format({ 'director': director });
              var creators = await getFullCredits(raw_info.url);
              descr = descr.format({ 'creator': creators });
              var actors = Array.from($('div.title-cast__grid', doc).find('a[data-testid="title-cast-item__actor"]:lt(8)')).map(function (e) {
                return $(e).text();
              }).join(', ');
              descr = descr.format({ 'cast': actors });
              descr = descr.format({ 'en_descr': imdb_json.description });
              $('#go_ptgen').prop('value', '获取成功');
              $('textarea[name=douban_info]').val(descr);
            }
            formatDescr();
          } else {
            $('#go_ptgen').prop('value', '获取失败');
            if (match_link('imdb', url)) {
              window.open(`https://search.douban.com/movie/subject_search?search_text=${url.match(/tt\d+/)[0]}&cat=1002`, target = "_blank");
            } else {
              window.open(url, target = '_blank');
            }
          }
        });
      } else {
        get_bgmdata(raw_info.bgmurl, function (data) {
          $('#go_ptgen').prop('value', '获取成功');
          $('textarea[name=douban_info]').val(data.trim());
          GM_setClipboard(data.trim());
        });
      }
      $('#douban2ptp').click(function () {
        var textarea = $('textarea[name="douban_info"]');
        if (textarea.val().match(/https:\/\/img\d.doubanio.com.*?jpg/)) {
          var poster = textarea.val().match(/https:\/\/img\d.doubanio.com.*?jpg/)[0];
          ptp_send_doubanposter(poster, used_ptp_img_key, function (new_url) {
            textarea.val(textarea.val().replace(/https:\/\/img\d.doubanio.com.*?jpg/, new_url));
          });
        } else if (textarea.val().match(/\[img\]https:\/\/m.media-amazon.com\/images\/.*?jpg\[\/img\]/)) {
          var poster = textarea.val().match(/https:\/\/m.media-amazon.com\/images.*?jpg/)[0];
          ptp_send_images([poster], used_ptp_img_key)
            .then(function (new_url) {
              new_url = new_url.toString().split(',').join('\n').replace(/\[.*?\]/g, '');
              textarea.val(textarea.val().replace(/https:\/\/m.media-amazon.com\/images.*?jpg/, new_url));
            }).catch(function (err) {
              alert(err);
            });
        }
      });
    });

    //mediainfo转换
    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">简化MI</td><td width="99%" class="rowfollow" valign="top" align="left" id="mediainfo"></td></tr>`);
    $('#mediainfo').append(`<textarea id="media_info" style="width:700px" rows="20"></textarea><br>`);
    $('#mediainfo').append(`<input type="button" id="simplify" value="简化信息" style="margin-bottom:5px"><br>`);
    $('#mediainfo').append(`<textarea id="clarify_media_info" style="width:700px" rows="20"></textarea><br>`);

    $('#simplify').click(function () {
      var mediainfo_text = simplifyMI($('#media_info').val(), null);
      $('#clarify_media_info').val(mediainfo_text);
    });

    $table.append(`<tr style="display:none;"><td width="1%" class="rowhead nowrap" valign="top" align="right">图片处理</td><td width="99%" class="rowfollow" valign="top" align="left" id="dealimg"></td></tr>`);
    $('#dealimg').append(`<input type="button" id="preview" value="图片预览" style="margin-bottom:5px;">`);
    $('#dealimg').append(`<input type="button" id="getsource" value="获取大图" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_ptpimg" value="转ptpimg" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_pixhost" value="转pixhost" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_imgbox" value="转imgbox" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="send_hdbits" value="转HDBits" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="get_imgbb" value="imgbb源图" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="button" id="change" value="字符串替换" style="margin-bottom:5px;margin-left:5px">`);
    $('#dealimg').append(`<input type="text" style="width: 50px; text-align:center; margin-left: 5px" id="img_source" />--<input type="text" style="width: 50px; text-align:center; margin-right: 5px" id="img_dest" /><br>`);
    $('#dealimg').append(`<input type="button" id="350px" value="350px缩略" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`<input type="button" id="del_img_tag" value="链接提取" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`<input type="button" id="enter2space" value="换行->空格" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`<input type="button" id="get_encode" value="图片提取" style="margin-bottom:5px;margin-right:5px">`);
    $('#dealimg').append(`从第<input type="text" style="width: 30px; text-align:center; margin-left: 5px; margin-right:5px" id="start" />张开始每隔<input type="text" style="width: 30px; text-align:center; margin-left: 5px; margin-right:5px" id="step" />张获取其中第<input type="text" style="width: 30px; text-align:center; margin-left: 5px;margin-right:5px" id="number" />张。<br>`);
    $('#dealimg').append(`<font color="red">获取大图目前支持imgbox，pixhost，pter，ttg，瓷器，img4k，其余的可以尝试字符串替换。</font><a href="https://github.com/tomorrow505/auto_feed_js/wiki/%E5%9B%BE%E7%89%87%E5%A4%84%E7%90%86" target="_blank" style="color:blue">→→点我查看教程←←</a><br>`);
    $('#dealimg').append(`<textarea id="picture" style="width:700px" rows="15"></textarea>`);
    $('#dealimg').append(`<div id="imgs_to_show" style="display: none;"></div><br>`);
    $('#dealimg').append(`<div>结果展示 <a href="#" id="up_text" style="color:red;">↑将结果移入输入框</a><br><textarea id="result" style="width:700px;" rows="15"></textarea></div>`);

    var descr = GM_getValue('descr') === undefined ? '' : GM_getValue('descr');
    var imgs_to_deal = descr.match(/(\[url=.*?\])?\[img\].*?(png|jpg|webp)\[\/img\](\[\/url\])?/ig);
    try {
      if (imgs_to_deal) {
        $('#picture').val(imgs_to_deal.join('\n'));
      }
    } catch (err) { }

    $('#preview').click((e) => {
      if (!$('#imgs_to_show').is(":hidden")) {
        $('#imgs_to_show').hide();
        return;
      }
      var origin_str = $('#picture').val();
      var imgs_to_show = origin_str.match(/(\[img(?:=\d+)?\])(http[^\[\]]*?(jpg|jpeg|png|gif|webp))/ig).map(item => { return item.replace(/\[.*?\]/g, '') });
      if (imgs_to_show.length) {
        $('#imgs_to_show').html('');
        imgs_to_show.map((item) => {
          $('#imgs_to_show').append(`<img src=${item} style="max-width: 700px"/><br>`);
        });
        $('#imgs_to_show').show();
      }
    });

    $('#del_img_tag').click((e) => {
      var origin_str = $('#picture').val();
      origin_str = origin_str.replace(/\[\/?img\]/g, '');
      $('#result').val(origin_str);
    })

    $('#getsource').click((e) => {
      var origin_str = $('#picture').val();
      get_full_size_picture_urls(null, origin_str, $('#result'), true);
    });

    $('#enter2space').click((e) => {
      var origin_str = $('#picture').val();
      origin_str = origin_str.replace(/\n/g, ' ');
      $('#picture').val(origin_str);
    })

    $('#send_ptpimg').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
      if (images.length) {
        ptp_send_images(images, used_ptp_img_key)
          .then(function (new_urls) {
            new_urls = new_urls.toString().split(',').join('\n');
            $('#result').val(new_urls);
          }).catch(function (err) {
            alert(err);
          });
      } else {
        alert('请输入图片地址！！');
      }
    });

    $('#send_imgbox').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
      if (images.length) {
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
        window.open('https://imgbox.com/', '_blank');
      }
    });

    $('#send_hdbits').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
      if (images.length) {
        var name = 'set your gallary name';
        try {
          if (descr.match(/Disc Title:/)) {
            name = descr.match(/Disc Title:(.*)/)[1].trim();
          } else if (descr.match(/Complete name.*?:/i)) {
            name = descr.match(/Complete name.*?:(.*)/)[1].trim();
          }
        } catch (err) { console.log(err) }
        images.push(name);
        GM_setValue('HDB_images', images.join(', '));
        window.open('https://img.hdbits.org/', '_blank');
      }
    });

    $('#send_pixhost').click((e) => {
      if ($('#picture').val().match(/http[^\[\]]*?(jpg|png|webp)/ig).length > 0) {
        var origin_str = $('#picture').val();
        images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png|webp)/ig).map((item) => { return item.replace(/\[.*?\]/g, ''); });
// [Site Logic: HDB]
          pix_send_images(images)
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
                urls_append = new_urls[0] + '\n';
              }
              $('#result').val(urls_append);
              alert('转存成功！');
            })
            .catch(function (message) {
              alert('转存失败');
            });
        }
      } else {
        alert('缺少截图');
      }
    });

    $('#change').click((e) => {
      var origin_str = $('#picture').val();
      if (!$('#img_source').val()) {
        alert("请填写源字符串！")
        return;
      }
      var source_str = $('#img_source').val();
      var dest_str = $('#img_dest').val();
      images = origin_str.match(/http[^\[\]]*?(jpg|png)/ig);
      images.map(item => {
        var new_img = item.replace(source_str, dest_str);
        origin_str = origin_str.replace(item, new_img);
      });
      $('#picture').val(origin_str);
    });

    $('#get_imgbb').click((e) => {
      function getibbdoc(url) {
        var p = new Promise((resolve, reject) => {
          getDoc(url, null, function (doc) {
            if (doc == 'error') {
              reject('error');
            } else {
              var source_img_url = $('#embed-code-3', doc).val();
              resolve(source_img_url);
            }
          });
        })
        return p;
      }
      function getpostdoc(url) {
        var p = new Promise((resolve, reject) => {
          getDoc(url, null, function (doc) {
            var source_img_url = $('#download', doc).attr('href').split('?')[0];
            resolve(source_img_url);
          });
        })
        return p;
      }
      var origin_str = $('#picture').val();
      var imgbb_urls = origin_str.match(/\[url=.*?\]\[img\]https?:\/\/i.ibb.co[^\[\]]*?(jpg|png)\[\/img\]\[\/url\]/ig);
      if (imgbb_urls === null) {
        alert("没有监测到imgbb缩略图链接");
      } else {
        var flag = false;
        imgbb_urls.map(item => {
          var a = item.match(/https:\/\/ibb.co\/(.*?)\]/)[1];
          var b = item.match(/https:\/\/i.ibb.co\/(.*?)\//)[1];
          if (a == b) {
            flag = true;
          }
        });
        if (flag) {
          var imgbb_tasks = [];
          imgbb_urls.map(item => {
            var imgbb_show_url = 'https://ibb.co/' + item.match(/https:\/\/i.ibb.co\/(.*?)\//)[1];
            var imgbb_p = getibbdoc(imgbb_show_url);
            imgbb_tasks.push(imgbb_p);
          })
          Promise.all(imgbb_tasks).then((data) => {
            for (i = 0; i < data.length; i++) {
              origin_str = origin_str.replace(imgbb_urls[i], `${data[i]}`);
            }
            get_full_size_picture_urls(null, origin_str, $('#result'), true);
          })
        } else {
          get_full_size_picture_urls(null, origin_str, $('#result'), true);
        }
      }
      var postimg_urls = origin_str.match(/https?:\/\/i.postimg.cc[^\[\]]*?(jpg|png)/ig);
      if (postimg_urls === null) {
        // alert("没有监测到postimg链接");
      } else {
        var imgpost_tasks = [];
        postimg_urls.map(item => {
          var imgpost_show_url = 'https://postimg.cc/' + item.match(/https:\/\/i.postimg.cc\/(.*?)\//)[1];
          console.log(imgpost_show_url)
          var imgpost_p = getpostdoc(imgpost_show_url);
          imgpost_tasks.push(imgpost_p);
        })
        Promise.all(imgpost_tasks).then((data) => {
          console.log(data)
          for (i = 0; i < data.length; i++) {
            origin_str = origin_str.replace(postimg_urls[i], data[i]);
          }
          origin_str = origin_str.match(/\[img\]https?:.*?(jpg|png)\[\/img\]/ig).join('\n');
          $('#result').val(origin_str);
        })
      }
    });

    $('#get_encode').click((e) => {
      var origin_str = $('#picture').val();
      console.log(origin_str)
      var dest_str = '';
      var images = origin_str.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig);
      var start = parseInt($('#start').val() ? $('#start').val() : 1);
      var encode_index = parseInt($('#number').val());
      var step = parseInt($('#step').val());
      for (i = start; i < images.length - step; i += step) {
        console.log(i + encode_index - 2)
        dest_str += images[i + encode_index - 2] + '\n';
      }
      $('#result').val(dest_str);
    });

    $('#350px').click((e) => {
      var origin_str = $('#picture').val();
      images = origin_str.match(/\[img\]http[^\[\]]*?(jpg|png)\[\/img\]/ig).join('\n');
      if (images.length) {
        $('#result').val(deal_img_350(images));
      }
    });

    $('#up_text').click((e) => {
      e.preventDefault();
      $('#picture').val($('#result').val() ? $('#result').val() : $('#picture').val());
      $('#result').val('');
    });

    var id_scroll = site_url.split('#')[1];
    if (id_scroll.match(/\?/)) {
      url = id_scroll.split('?')[1];
      id_scroll = id_scroll.split('?')[0];
      if (url.match(/tt/)) {
        url = 'https://www.imdb.com/title/' + url + '/';
      } else if (url.match(/bgmid/)) {
        url = 'https://bangumi.tv/subject/' + url.split('=').pop() + '/';
      } else {
        url = 'https://movie.douban.com/subject/' + url + '/';
      }
      $('input[name=url]').val(url);
    }
    $(`#${id_scroll}`).parent().show();
    document.querySelector(`#${id_scroll}`).scrollIntoView();
    return;
  }, 1000)
}

//长mediainfo转换简洁版mediainfo
function simplifyMI(mediainfo_text, site) {
  var simplifiedMI = '';
  if (mediainfo_text.match(/QUICK SUMMARY/i)) {
    return mediainfo_text;
  }
  if (mediainfo_text.match(/Disc INFO/i)) {
// [Site Logic: Hdt]
    simplifiedMI = full_bdinfo2summary(mediainfo_text);
    return simplifiedMI;
  }

  if (!mediainfo_text.match(/Video[\S\s]{0,5}ID/)) {
    return mediainfo_text;
  }

  var general_info = mediainfo_text.match(/(general[\s\S]*?)?video/i)[0].trim();
  general_info = get_general_info(general_info);
  if (mediainfo_text.match(/encode.{0,10}date.*?:(.*)/i)) {
    var release_date = mediainfo_text.match(/encode.{0,10}date.*?:(.*)/i)[1].trim();
    general_info += `Release date.......: ${release_date}`;
  }
  general_info += `${N}${N}`;
  simplifiedMI += general_info;
  try { var video_info = mediainfo_text.match(/(video[\s\S]*?)audio/i)[0].trim(); } catch (err) { video_info = mediainfo_text.match(/(video[\s\S]*?)Forced/i)[0].trim(); }
  video_info = get_video_info(video_info);
  simplifiedMI += video_info;
  try { var audio_info = mediainfo_text.match(/(audio[\s\S]*?)(text)/i)[0].trim(); } catch (err) { audio_info = mediainfo_text.match(/(audio[\s\S]*?)(Forced|Alternate group)/i)[0].trim(); }
  var audio_infos = audio_info.split(/audio.*?\nid.*/i).filter(audio => audio.length > 30);
  for (i = 0; i < audio_infos.length; i++) {
    audio_info = get_audio_info(audio_infos[i]);
    simplifiedMI += audio_info;
  }
  try {
    var text_info = mediainfo_text.match(/(text[\s\S]*)$/i)[0].trim();
    var text_infos = text_info.split(/text.*?\nid.*/i).filter(text => text.length > 30);
    for (i = 0; i < text_infos.length; i++) {
      subtitle_info = get_text_info(text_infos[i]);
      simplifiedMI += subtitle_info;
    }
  } catch (err) {
    var subtitle_text = `Subtitles..........: no`;
    simplifiedMI += subtitle_text;
  }
  console.log(simplifiedMI);
  return simplifiedMI;
}
function get_general_info(general_info) {
  var general_text = "General\n";
  try {
    var filename = general_info.match(/Complete name.*?:(.*)/i)[1].split('/').pop().trim();
    general_text += `Release Name.......: ${filename}${N}`;
  } catch (err) { }
  try {
    var format = general_info.match(/format.*:(.*)/i)[1].trim();
    general_text += `Container..........: ${format}${N}`;
  } catch (err) { }
  try {
    var duration = general_info.match(/duration.*:(.*)/i)[1].trim();
    general_text += `Duration...........: ${duration}${N}`;
  } catch (err) { }
  try {
    var file_size = general_info.match(/file.{0,5}size.*:(.*)/i)[1].trim();
    general_text += `Size...............: ${file_size}${N}`;
  } catch (err) { }

  general_text += `Source(s)..........: ${N}`;

  return general_text;
}
function get_video_info(video_info) {
  var video_text = `Video${N}`;
  try {
    var codec = video_info.match(/format.*:(.*)/i)[1].trim();
    video_text += `Codec..............: ${codec}${N}`;
  } catch (err) { }
  try {
    var type = video_info.match(/scan.{0,5}type.*:(.*)/i)[1].trim();
    video_text += `Type...............: ${type}${N}`;
  } catch (err) { }
  try {
    var width = video_info.match(/width.*:(.*)/i)[1].trim();
    var height = video_info.match(/height.*:(.*)/i)[1].trim();
    var resolution = width.replace(/ /g, '').match(/\d+/)[0] + 'x' + height.replace(/ /g, '').match(/\d+/)[0];
    video_text += `Resolution.........: ${resolution}${N}`;
  } catch (err) { }
  try {
    var aspect_ratio = video_info.match(/display.{0,5}aspect.{0,5}ratio.*?:(.*)/i)[1].trim();
    video_text += `Aspect ratio.......: ${aspect_ratio}${N}`;
  } catch (err) { }
  try {
    var bit_rate = video_info.match(/bit.{0,5}rate(?!.*mode).*:(.*)/i)[1].trim();
    video_text += `Bit rate...........: ${bit_rate}${N}`;
  } catch (err) { }
  try {
    var hdr_format = video_info.match(/HDR FORMAT.*:(.*)/i)[1].trim();
    video_text += `HDR format.........: ${hdr_format}${N}`;
  } catch (err) { }
  try {
    var frame_rate = video_info.match(/frame.{0,5}rate.*:(.*fps)/i)[1].trim();
    video_text += `Frame rate.........: ${frame_rate}${N}`;
  } catch (err) { }

  video_text += `${N}`;

  return video_text;
}
function get_audio_info(audio_info) {
  var audio_text = `Audio${N}`;
  try {
    var format = audio_info.match(/format.*:(.*)/i)[1].trim();
    audio_text += `Format.............: ${format}${N}`;
  } catch (err) { }
  try {
    var channels = audio_info.match(/channel\(s\).*:(.*)/i)[1].trim();
    audio_text += `Channels...........: ${channels}${N}`;
  } catch (err) { }
  try {
    var bit_rate = audio_info.match(/bit.{0,5}rate(?!.*mode).*:(.*)/i)[1].trim();
    audio_text += `Bit rate...........: ${bit_rate}${N}`;
  } catch (err) { alert(err) }
  try {
    var language = audio_info.match(/language.*:(.*)/i)[1].trim();
    audio_text += `Language...........: ${language}`;
  } catch (err) { }
  var title = '';
  try { title = audio_info.match(/title.*:(.*)/i)[1].trim(); } catch (err) { title = ''; }
  audio_text += ` ${title}${N}${N}`;

  return audio_text;
}
function get_text_info(text_info) {
  var format = text_info.match(/format.*:(.*)/i)[1].trim();
  var language = text_info.match(/language.*:(.*)/i)[1].trim();
  try { var title = text_info.match(/title.*:(.*)/i)[1].trim(); } catch (err) { title = ''; }
  var subtitle_text = `Subtitles..........: ${language} ${format} ${title}${N}`;
  return subtitle_text;
}

function full_bdinfo2summary(descr) {
  if (!descr.match(/DISC INFO/)) {
    return descr.split(/\[\/quote\]/)[0].replace('[quote]', '');
  }
  var summary = {
    'Disc Title': '',
    'Disc Size': '',
    'Protection': '',
    'BD-Java': '',
    'Playlist': '',
    'Size': '',
    'Length': '',
    'Total Bitrate': '',
    'Protection': '',
    'Video': '',
    'Audio': '',
    'Subtitle': '',
  }

  if (descr.match(/Disc.*?Title:(.*)/i)) {
    summary['Disc Title'] = descr.match(/Disc.*?Title:(.*)/i)[1].trim();
  }
  if (descr.match(/Disc.*?Size:(.*)/i)) {
    summary['Disc Size'] = descr.match(/Disc.*?Size:(.*)/i)[1].trim();
  }
  if (descr.match(/Protection:(.*)/i)) {
    summary['Protection'] = descr.match(/Protection:(.*)/i)[1].trim();
  }
  if (descr.match(/Extras:.*?BD-Java/i)) {
    summary['BD-Java'] = 'Yes';
  } else {
    summary['BD-Java'] = 'No';
  }
  if (descr.match(/PLAYLIST[\s\S]{3,30}?Name:(.*)/i)) {
    summary['Playlist'] = descr.match(/PLAYLIST[\s\S]{3,30}?Name:(.*)/i)[1].trim();
  }
  if (descr.match(/PLAYLIST[\s\S]{3,90}?Length:(.*)/i)) {
    summary['Length'] = descr.match(/PLAYLIST[\s\S]{3,90}?Length:(.*)/i)[1].trim();
  }
  if (descr.match(/PLAYLIST[\s\S]{3,190}?Size:(.*)/i)) {
    summary['Size'] = descr.match(/PLAYLIST[\s\S]{3,190}?Size:(.*)/i)[1].trim();
  }
  if (descr.match(/PLAYLIST[\s\S]{3,290}?Total.*?Bitrate:(.*)/i)) {
    summary['Total Bitrate'] = descr.match(/PLAYLIST[\s\S]{3,290}?Total.*?Bitrate:(.*)/i)[1].trim();
  }

  if (descr.match(/Video:[\s\S]{0,20}Codec/i)) {
    var video_info = descr.match(/Video:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/audio/i)[0].trim();
    summary['Video'] = video_info.split('\n').map(e => {
      var info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') { return ee.trim(); } });
      return info.join(' / ').trim();
    }).join('\nVideo: ').replace(/(\nVideo: )+$/, '');
  }

  if (descr.match(/SUBTITLES:[\s\S]{0,20}Codec/i)) {
    var subtitle_info = descr.match(/SUBTITLES:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/FILES/i)[0].trim();
    summary['Subtitle'] = subtitle_info.split('\n').map(e => {
      var info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') return ee.trim(); });