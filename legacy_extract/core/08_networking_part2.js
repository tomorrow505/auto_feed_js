      return info.join(' / ').trim();
    }).join('\nSubtitle: ').split('[/quote]')[0].replace(/(\nSubtitle: )+$/, '');
  }
  if (descr.match(/Audio:[\s\S]{0,20}Codec/i)) {
    var audio_info = descr.match(/Audio:[\s\S]{0,300}-----------([\s\S]*)/i)[1].split(/subtitles|\[.*?quote\]/i)[0].trim();
    summary['Audio'] = audio_info.split('\n').map(e => {
      var info = e.split(/\s{5,15}/).filter(function (ee) { if (ee.trim() && ee.trim() != '[/quote]') return ee.trim(); });
      return info.join(' / ').trim();
    }).join('\nAudio: ');
  }

  var quick_summary = '';
  for (key in summary) {
    if (summary[key]) {
      quick_summary += key + ': ' + summary[key] + '\n';
    }
  }
  return quick_summary;
}

function add_douban_info_table(container, width, data) {
  data = data.data;
  if (data.cast.split('/').length > 9) {
    data.cast = data.cast.split('/').slice(0, 9).join('/');
  }
  if (data.director.split('/').length > 2) {
    data.director = data.director.split('/').slice(0, 2).join('/');
  }
  if (data.region.split('/').length > 4) {
    data.region = data.region.split('/').slice(0, 4).join('/') + '/<br>' + data.region.split('/').slice(4).join('/');
  }
  container.append(`<table class="contentlayout" cellspacing="0"><tbody>
        <tr>
            <td rowspan="3" width="2"><img src="${data.image}" style="max-width:${width}px;border:0px;" alt></td>
            <td colspan="2"><h1><a href="https://movie.douban.com/subject/${data.id}" target="_blank">${data.title}</a> (${data.year})</h1><h3>${data.aka}</h3></td>
        </tr>
        <tr>
            <td><table class="content" cellspacing="0" id="imdbinfo" style="white-space: nowrap;"><tbody>
                <tr><th>评分</th><td>${data.average} (${data.votes}人评价)</td></tr>
                <tr><th>类型</th><td>${data.genre}</td></tr>
                <tr><th>国家/地区</th><td>${data.region}</td></tr>
                <tr><th>导演</th><td>${data.director.replace(/\//g, '<br>    ')}</td></tr>
                <tr><th>语言</th><td>${data.language}</td></tr>
                <tr><th>上映日期</th><td>${data.releaseDate.split('/').join('<br>')}</td></tr>
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
    </tbody></table>`);
}

async function getFullCredits(url) {
  return new Promise(resolve => {
    GM_xmlhttpRequest({
      method: 'GET',
      url: 'https://www.imdb.com/title/{imdbid}/fullcredits?ref_=tt_ov_wr'.format({ 'imdbid': url.match(/tt\d+/)[0] }),
      onload: function (responseDetail) {
        if (responseDetail.status === 200) {
          let doc = page_parser(responseDetail.responseText);
          var creators = Array.from($('#writer', doc).next().find('td.name').map((i, e) => {
            return $(e).find('a').text().replace(/\n/g, '');
          })).join(', ');
          resolve(creators);
        }
      }
    });
  });
}

async function getFullDescr(url) {
  return new Promise(resolve => {
    getDoc(url, null, function (docx) {
      imdb_descr = $('div[data-testid="sub-section-summaries"]', docx).text().trim();
      resolve(imdb_descr);
    });
  });
}

async function getimdbpage(url) {
  return new Promise(resolve => {
    getDoc(url, null, function (docx) {
      resolve(docx);
    });
  });
}

async function getPoster(url) {
  return new Promise(resolve => {
    getDoc(url, null, function (docx) {
      var poster = '';
      try {
        poster = $('img[src*="m.media-amazon.com/images"]', docx).attr('src').split(',')[0].trim();
        poster = $('div[style*="calc(50% + 0px)"]', docx).find('img').attr('src');
      } catch (err) {
        poster = '';
      }
      resolve(poster);
    });
  });
}

async function getAKAtitle(url) {
  return new Promise(resolve => {
    var search_url = 'https://passthepopcorn.me/ajax.php?' + encodeURI(`action=torrent_info&imdb=${url}&fast=1`)
    getJson(search_url, null, function (data) {
      if (!Object.keys(data).length) {
        resolve('');
      } else {
        if (data.length) {
          data = data[0];
          resolve(data.title);
        }
      }
    })
  });
}

function getDoubanPoster(doc) {
  try {
    return $('#mainpic img', doc)[0].src.replace(
      /^.+(p\d+).+$/,
      (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
    );
  } catch (e) {
    return null;
  }
}

function getTitles(doc) {
  let isChinese = false;
  const chineseTitle = doc.title.replace(/\(豆瓣\)$/, '').trim();
  const originalTitle = $('#content h1>span[property]', doc).text().replace(chineseTitle, '').trim() || ((isChinese = true), chineseTitle);
  try {
    let akaTitles = $('#info span.pl:contains("又名")', doc)[0].nextSibling.textContent.trim().split(' / ');
    const transTitle = isChinese ? akaTitles.find(e => { return e.match(/[a-z]/i); }) || chineseTitle : chineseTitle;
    const priority = e => {
      if (e === transTitle) {
        return 0;
      }
      if (e.match(/\(港.?台\)/)) {
        return 1;
      }
      if (e.match(/\([港台]\)/)) {
        return 2;
      }
      return 3;
    };
    akaTitles = akaTitles.sort((a, b) => priority(a) - priority(b)).filter(e => e !== transTitle);
    return [{
      chineseTitle: chineseTitle,
      originalTitle: originalTitle,
      translatedTitle: transTitle,
      alsoKnownAsTitles: akaTitles
    },
      isChinese
    ];
  } catch (e) {
    return [{
      chineseTitle: chineseTitle,
      originalTitle: originalTitle,
      translatedTitle: chineseTitle,
      alsoKnownAsTitles: []
    },
      isChinese
    ];
  }
}

function getYear(doc) {
  return parseInt($('#content>h1>span.year', doc).text().slice(1, -1));
}

function getRegions(doc) {
  try {
    return $('#info span.pl:contains("制片国家/地区")', doc)[0].nextSibling.textContent.trim().split(' / ');
  } catch (e) {
    return [];
  }
}

function getGenres(doc) {
  try {
    return $('#info span[property="v:genre"]', doc).toArray().map(e => e.innerText.trim());
  } catch (e) {
    return [];
  }
}

function getLanguages(doc) {
  try {
    return $('#info span.pl:contains("语言")', doc)[0].nextSibling.textContent.trim().split(' / ');
  } catch (e) {
    return [];
  }
}

function getReleaseDates(doc) {
  try {
    return $('#info span[property="v:initialReleaseDate"]', doc).toArray().map(e => e.innerText.trim()).sort((a, b) => new Date(a) - new Date(b));
  } catch (e) {
    return [];
  }
}

function getDurations(doc) {
  try {
    return $('span[property="v:runtime"]', doc).text();
  } catch (e) {
    return [];
  }
}

function getEpisodeDuration(doc) {
  try {
    return $('#info span.pl:contains("单集片长")', doc)[0].nextSibling.textContent.trim();
  } catch (e) {
    return null;
  }
}

function getEpisodeCount(doc) {
  try {
    return parseInt($('#info span.pl:contains("集数")', doc)[0].nextSibling.textContent.trim());
  } catch (e) {
    return null;
  }
}

function getTags(doc) {
  return $('div.tags-body>a', doc).toArray().map(e => e.textContent);
}

function getDoubanScore(doc) {
  const $interest = $('#interest_sectl', doc);
  const ratingAverage = parseFloat(
    $interest.find('[property="v:average"]').text()
  );
  const ratingVotes = parseInt($interest.find('[property="v:votes"]').text());
  return {
    rating: ratingAverage,
    ratingCount: ratingVotes,
    ratingHistograms: {
      'Douban Users': {
        aggregateRating: ratingAverage,
        demographic: 'Douban Users',
        totalRatings: ratingVotes
      }
    }
  };
}

function getDescription(doc) {
  try {
    return Array.from($('#link-report-intra>[property="v:summary"],#link-report-intra>span.all.hidden', doc)[0].childNodes)
      .filter(e => e.nodeType === 3)
      .map(e => e.textContent.trim())
      .join('\n');
  } catch (e) {
    return null;
  }
}

function addComma(x) {
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}

function getDirector(doc) {
  try {
    return $('#info span.pl:contains("导演")', doc)[0].nextSibling.nextSibling.textContent.trim().split(' / ');
  } catch (err) {
    return [];
  }
}

function getWriters(doc) {
  try {
    return $('#info span.pl:contains("编剧")', doc)[0].nextSibling.nextSibling.textContent.trim().split(' / ');
  } catch (err) {
    return [];
  }
}

function getCasts(doc) {
  try {
    return $('#info span.pl:contains("主演")', doc)[0].nextSibling.nextSibling.textContent.trim().split(' / ');
  } catch (err) {
    return [];
  }
}

async function getIMDbScore(ID, timeout = TIMEOUT) {
  if (ID) {
    return new Promise(resolve => {
      GM_xmlhttpRequest({
        method: 'GET',
        url: `http://p.media-imdb.com/static-content/documents/v1/title/tt${ID}/ratings%3Fjsonp=imdb.rating.run:imdb.api.title.ratings/data.json`,
        headers: {
          referrer: 'http://p.media-imdb.com/'
        },
        timout: timeout,
        onload: x => {
          try {
            const e = JSON.parse(x.responseText.slice(16, -1));
            resolve(e.resource);
          } catch (e) {
            console.warn(e);
            resolve(null);
          }
        },
        ontimeout: e => {
          console.warn(e);
          resolve(null);
        },
        onerror: e => {
          console.warn(e);
          resolve(null);
        }
      });
    });
  } else {
    return null;
  }
}

async function getIMDbID(doc) {
  try {
    return $('#info span.pl:contains("IMDb:")', doc).parent().text().match(/tt(\d+)/)[1];
  } catch (e) {
    return null;
  }
}

async function getCelebrities(doubanid, timeout = TIMEOUT) {
  var awardurl = 'https://movie.douban.com/subject/{a}/celebrities/'.format({ 'a': doubanid });
  return new Promise(resolve => {
    getDoc(awardurl, null, function (doc) {
      const entries = $('#celebrities>div.list-wrapper', doc).toArray().map(e => {
        const [positionChinese, positionForeign] = $(e).find('h2').text().match(/([^ ]*)(?:$| )(.*)/).slice(1, 3);
        const people = $(e).find('li.celebrity').toArray().map(e => {
          let [nameChinese, nameForeign] = $(e).find('.info>.name').text().match(/([^ ]*)(?:$| )(.*)/).slice(1, 3);
          if (!nameChinese.match(/[\u4E00-\u9FCC]/)) {
            nameForeign = nameChinese + ' ' + nameForeign;
            nameChinese = null;
          }
          const [roleChinese, roleForeign, character] = $(e).find('.info>.role').text().match(/([^ ]*)(?:$| )([^(]*)(?:$| )(.*)/).slice(1, 4);
          return {
            name: {
              chs: nameChinese,
              for: nameForeign
            },
            role: {
              chs: roleChinese,
              for: roleForeign
            },
            character: character.replace(/[()]/g, '')
          };
        });
        return [
          positionForeign.toLowerCase(),
          {
            position: positionChinese,
            people: people
          }
        ];
      });
      if (entries.length) {
        jsonCeleb = entries;
      } else {
        jsonCeleb = null;
      }
      resolve(jsonCeleb);
    });
  });
}

async function getAwards(doubanid, timeout = TIMEOUT) {
  var awardurl = 'https://movie.douban.com/subject/{a}/awards/'.format({ 'a': doubanid });
  return new Promise(resolve => {
    getDoc(awardurl, null, function (doc) {
      resolve($('div.awards', doc).toArray().map(function (e) {
        const $title = $(e).find('.hd>h2');
        const $awards = $(e).find('.award');
        return {
          name: $title.find('a').text().trim(),
          year: parseInt($title.find('.year').text().match(/\d+/)[0]),
          awards: $awards.toArray().map(e => ({
            name: $(e).find('li:first-of-type').text().trim(),
            people: $(e).find('li:nth-of-type(2)').text().split('/').map(e => e.trim())
          }))
        };
      }));
    });
  })
}

async function getInfo(doc, raw_info) {
  const [titles, isChinese] = getTitles(doc),
    year = getYear(doc),
    regions = getRegions(doc),
    genres = getGenres(doc),
    languages = getLanguages(doc),
    releaseDates = getReleaseDates(doc),
    durations = getDurations(doc),
    episodeDuration = getEpisodeDuration(doc),
    episodeCount = getEpisodeCount(doc),
    tags = getTags(doc),
    DoubanID = raw_info.dburl.match(/subject\/(\d+)/)[1],
    DoubanScore = getDoubanScore(doc),
    poster = getDoubanPoster(doc),
    description = getDescription(doc);
  directors = getDirector(doc);
  writers = getWriters(doc);
  casts = getCasts(doc);

  let IMDbID, IMDbScore, awards, celebrities;

  const concurrentFetches = [];

  concurrentFetches.push(
    // IMDb Fetch
    getIMDbID(doc)
      .then(e => {
        IMDbID = e;
        return getIMDbScore(IMDbID);
      })
      .then(e => {
        IMDbScore = e;
        return getAwards(DoubanID);
      })
      .then(e => {
        awards = e;
        return getCelebrities(DoubanID);
      })
      .then(e => {
        celebrities = e;
      })

  );
  await Promise.all(concurrentFetches);
  if (IMDbScore && IMDbScore.title) {
    if (isChinese) {
      if (!titles.translatedTitle.includes(IMDbScore.title)) {
        titles.alsoKnownAsTitles.push(titles.translatedTitle);
        const index = titles.alsoKnownAsTitles.indexOf(IMDbScore.title);
        if (index >= 0) {
          titles.alsoKnownAsTitles.splice(index, 1);
        }
        titles.translatedTitle = IMDbScore.title;
      }
    } else {
      if (!titles.originalTitle.includes(IMDbScore.title) && titles.alsoKnownAsTitles.indexOf(IMDbScore.title) === -1) {
        titles.alsoKnownAsTitles.push(IMDbScore.title);
      }
    }
  }
  return {
    poster: poster,
    titles: titles,
    year: year,
    regions: regions,
    genres: genres,
    languages: languages,
    releaseDates: releaseDates,
    durations: durations,
    episodeDuration: episodeDuration,
    episodeCount: episodeCount,
    tags: tags,
    DoubanID: DoubanID,
    DoubanScore: DoubanScore,
    IMDbID: IMDbID,
    IMDbScore: IMDbScore,
    description: description,
    directors: directors,
    writers: writers,
    casts: casts,
    awards: awards,
    celebrities: celebrities
  };
}

function formatInfo(info) {
  let temp;
  const infoText = (
    (info.poster ? `[img]${info.poster}[/img]\n\n` : '') +
    '◎译　　名　' + [info.titles.translatedTitle].concat(info.titles.alsoKnownAsTitles).join(' / ') + '\n' +
    '◎片　　名　' + info.titles.originalTitle + '\n' +
    '◎年　　代　' + info.year + '\n' +
    (info.regions.length ? '◎产　　地　' + info.regions.join(' / ') + '\n' : '') +
    (info.genres.length ? '◎类　　别　' + info.genres.join(' / ') + '\n' : '') +
    (info.languages.length ? '◎语　　言　' + info.languages.join(' / ') + '\n' : '') +
    (info.releaseDates.length ? '◎上映日期　' + info.releaseDates.join(' / ') + '\n' : '') +
    ((info.IMDbScore && info.IMDbScore.rating) ? `◎IMDb评分  ${Number(info.IMDbScore.rating).toFixed(1)}/10 from ${addComma(info.IMDbScore.ratingCount)} users\n` : '') +
    (info.IMDbID ? `◎IMDb链接  https://www.imdb.com/title/tt${info.IMDbID}/\n` : '') +
    ((info.DoubanScore && info.DoubanScore.rating) ? `◎豆瓣评分　${info.DoubanScore.rating}/10 from ${addComma(info.DoubanScore.ratingCount)} users\n` : '') +
    (info.DoubanID ? `◎豆瓣链接　https://movie.douban.com/subject/${info.DoubanID}/\n` : '') +
    ((info.durations && info.durations.length) ? '◎片　　长　' + info.durations + '\n' : '') +
    (info.episodeDuration ? '◎单集片长　' + info.episodeDuration + '\n' : '') +
    (info.episodeCount ? '◎集　　数　' + info.episodeCount + '\n' : '') +
    (info.celebrities ? info.celebrities.map(e => {
      const position = e[1].position;
      let title = '◎';
      switch (position.length) {
        case 1:
          title += '　  ' + position + '　  　';
          break;
        case 2:
          title += position.split('').join('　　') + '　';
          break;
        case 3:
          title += position.split('').join('  ') + '　';
          break;
        case 4:
          title += position + '　';
          break;
        default:
          title += position + '\n　　　　　　';
      }
      const people = e[1].people.map((f, i) => {
        const name = f.name.chs ? (f.name.for ? f.name.chs + ' / ' + f.name.for : f.name.chs) : f.name.for;
        return (i > 0 ? '　　　　　　' : '') + name + (f.character ? ` (${f.character})` : '');
      }).join('\n');
      return title + people;
    }).join('\n') + '\n\n' : '') +
    (info.tags.length ? '◎标　　签　' + info.tags.join(' | ') + '\n\n' : '') +
    (info.description ? '◎简　　介　\n' + info.description.replace(/^|\n/g, '\n　　') + '\n\n' : '◎简　　介　\n\n　　暂无相关剧情介绍') +
    (info.awards.length ? '◎获奖情况　\n\n' + info.awards.map(e => {
      const awardName = '　　' + e.name + ' (' + e.year + ')\n';
      const awardItems = e.awards.map(e => '　　' + e.name + (e.people ? ' ' + e.people : '')).join('\n');
      return awardName + awardItems;
    }).join('\n\n') + '\n\n' : '')
  ).trim();
  return infoText;
}

async function transferToPixhost(imgUrl) {
  console.log(imgUrl);
  const blob = await new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: "GET",
      url: imgUrl,
      responseType: "blob",
      onload: (res) => res.status === 200 ? resolve(res.response) : reject("下载失败"),
      onerror: (err) => reject(err)
    });
  });
  console.log('图片下载完成');
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('content_type', '0'); // 0=全年龄, 1=成人
    const name = imgUrl.match(/p\d+.jpg/);
    formData.append('file', blob, `${name[0]}`);
    formData.append('name', `${name[0]}`);
    formData.append('ajax', `yes`);
    GM_xmlhttpRequest({
      method: "POST",
      url: "https://pixhost.to/new-upload/",
      data: formData,
      headers: {
        "Origin": "https://pixhost.to",
        "Referer": "https://pixhost.to/",
        "User-Agent": window.navigator.userAgent
      },
      onload: (res) => {
        console.log(res);
        if (res.status === 200) {
          resolve(JSON.parse(res.responseText).show_url);
        } else {
          reject("上传失败 Status:" + res.status);
        }
      },
      onerror: (err) => reject(err)
    });
  });
}

function get_douban_info(raw_info) {
  getDoc(raw_info.dburl, null, function (doc) {
    const infoGenClickEvent = async e => {
      var data = formatInfo(await getInfo(doc, raw_info));
// [Site Logic: PTP]
      raw_info.descr = data + '\n\n' + raw_info.descr;
      var thanks = raw_info.descr.match(/\[quote\].*?感谢原制作者发布。.*?\[\/quote\]/);
      if (thanks) {
        raw_info.descr = thanks[0] + '\n\n' + raw_info.descr.replace(thanks[0], '').trim();
      }
      if (!location.href.match(/usercp.php\?action=persona|pter.*upload.php|piggo.me.*upload.php|^https:\/\/.*.douban.com|^https?:\/\/\d+.\d+.\d+.\d+.*5678/)) {
        if (raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)) {
          raw_info.url = raw_info.descr.match(/http(s*):\/\/www.imdb.com\/title\/tt(\d+)/i)[0] + '/';
        }
        if (raw_info.descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}纪录片/i)) {
          raw_info.type = '纪录';
        } else if (raw_info.descr.match(/类[\s\S]{0,5}别[\s\S]{0,30}动画/i)) {
          raw_info.type = '动漫';
        }
        set_jump_href(raw_info, 1);
        douban_button.value = '获取成功';
        $('#textarea').val(data);
        if ($('#input_box').length && !$('#input_box').val()) {
          try {
            raw_info.url = match_link('imdb', raw_info.descr);
            $('#input_box').val(raw_info.url);
            var search_name = get_search_name(raw_info.name);
            try {
              var imdbid = raw_info.url.match(/tt\d+/i)[0];
              var imdbno = imdbid.substring(2);
              var container = $('#forward_r');
              add_search_urls(container, imdbid, imdbno, search_name, 0);
            } catch (err) { }
          } catch (err) { }
        }
        GM_setClipboard(data);
        rebuild_href(raw_info);
      } else if (site_url.match(/pter.*upload.php|piggo.*upload.php|^https?:\/\/\d+.\d+.\d+.\d+.*5678/)) {
        $('#descr').val(data + '\n\n' + $('#descr').val());
        $('.get_descr[value=正在获取]').val("获取成功");
        if (!$('input[name=small_descr]').val()) {
          $('input[name=small_descr]').val(get_small_descr_from_descr(data, $('input[name=name]').val()));
        }
        if (!$('input[name=url]').val()) {
          $('input[name=url]').val(match_link('imdb', data));
        }
        if (!$('input[name=douban]').val()) {
          $('input[name=douban]').val(match_link('douban', data));
        }
      } else if (site_url.match(/^https:\/\/.*.douban.com/)) {
        if (douban_poster_rehost == -1) {
          GM_setClipboard(data);
          $('#copy').text('完成');
        } else if (douban_poster_rehost == 0) {
          var if_rehost = confirm("是否选择转存豆瓣海报？\n如果选择为是：则优先ptpimg，没有配置key则PixHost。");
          if (if_rehost) {
            var poster = data.match(/https:\/\/img\d.doubanio.com.*?jpg/)[0];
// [Site Logic: PTP]
              douban_poster_rehost = 2;
            }
            GM_setValue('douban_poster_rehost', douban_poster_rehost);
          } else {
            GM_setValue('douban_poster_rehost', -1);
            GM_setClipboard(data);
            $('#copy').text('完成');
          }
        } else {
// [Site Logic: PTP]
            transferToPixhost(poster).then(new_url => {
              data = data.replace(/https:\/\/img\d.doubanio.com.*?jpg/, new_url);
              GM_setClipboard(data);
              $('#copy').text('完成');
            });
          }
        }
      } else {
        $('textarea[name="douban_info"]').val(raw_info.descr);
        $('#go_ptgen').prop('value', '获取成功');
      };
    }
    infoGenClickEvent();
  });
}

function add_picture_transfer() {
  GM_addStyle(
    `.delete_div {
        position: fixed;
        bottom: 30%;
        right: 27%;
        width: 46%;
        color:white;
    }`);
  $(`body`).append(`
        <div class="delete_div" style="align:center; color:white; display:none; border-radius: 5px">
            <div id="rehost" style="width: 100%; margin:auto;"></div>
        </div>`);
  $('#rehost').append(`<td style="width:100%; border: none; background-color:rgba(72,101,131,0.7); padding: 6px" valign="top" align="left" id="rehostimg"></td>`);

  $('#rehostimg').append(`<b>选择转存站点：</b>`)
  for (key in used_rehost_img_info) {
    $('#rehostimg').append(`<input style="vertical-align:middle" type="radio" name="rehost_site" value="${key}">${key}`);
  }
  $('#rehostimg').append(`<input style="vertical-align:middle" type="radio" name="rehost_site" value="PixHost">PixHost`);
  $('#rehostimg').append(`<input style="vertical-align:middle" type="radio" name="rehost_site" value="PTPimg">PTPimg`);
  $('#rehostimg').append(`<input style="vertical-align:middle;margin-left:160px;color:red;width:20px;" type="button" name="close_panel" value="&times;">`);
  $('input[name="close_panel"]').click(() => {
    $('input[name="img_url"]').val('');
    $('textarea[name="show_result"]').val('');
    $('div.delete_div').hide();
  });

  $(`input:radio[value="freeimage"]`).prop('checked', true);
  $('#rehostimg').append(`<br><br>`);

  $('#rehostimg').append(`<label><b>输入想要转存的图片链接:</b></label><input type="text" name="img_url" style="width: 350px; margin-left:5px">`);
  $('#rehostimg').append(`<input type="button" id="go_rehost" value="开始转存" style="margin-left:5px"><br>`);
  $('#rehostimg').append(`<p>注意：自动获取的为img9域名，如失败，可自行更换为1,2,9。</p>`)
  if (site_url.match(/springsunday/)) {
    $('#go_rehost').css({ 'color': 'white', 'background': 'url(https://springsunday.net/styles/Maya/images/btn_submit_bg.gif) repeat left top', 'border': '1px black' });
  }
  $('#rehostimg').append(`<textarea name="show_result" style="width:560px" rows="6"></textarea><br>`);
  $('#go_rehost').click(function () {
    var rehost_site = $('input[name="rehost_site"]:checked').val();
    var img_url = $('input[name="img_url"]').val();
// [Site Logic: PTP]
      alert('没有APIKEY无法完成转存工作！！');
      return;
    }
    $('#go_rehost').prop('value', '正在转存');
    if (rehost_site == 'PixHost') {
      transferToPixhost(img_url).then(new_url => {
        $('textarea[name="show_result"]').val(new_url);
        $('#go_rehost').prop('value', '转存成功');
        GM_setClipboard(new_url);
      });
// [Site Logic: PTP]
      rehost_single_img(rehost_site, img_url)
        .then(function (result) {
          $('textarea[name="show_result"]').val(result);
          $('#go_rehost').prop('value', '转存成功');
        })
        .catch(function (err) {
          $('#go_rehost').prop('value', '转存失败');
          alert(err);
        })
    }
  });
  $('a:contains("单图转存"),a:contains("海报转存")').click((e) => {
    e.preventDefault();
    if ($('div.delete_div').is(":hidden")) {
      $('div.delete_div').show();
    } else {
      $('div.delete_div').hide();
    }
  });
}

if (site_url.match(/^https:\/\/pterclub.net\/upload.php/)) {
  $('input[name=url]:first').after(`<input type="button" value="获取简介" class="get_descr" data="url" />`);
  $('input[name=douban]').after(`<input type="button" value="获取简介" class="get_descr" data="douban" />`);
  $('.get_descr').click((e) => {
    var tmp_raw_info = { 'url': '', 'dburl': '', 'descr': '' };
    var link_type = $(e.target).attr('data');
    if ($(`input[name="${link_type}"]`).val()) {
      var link = $(`input[name="${link_type}"]`).val();
      $(e.target).prop('value', '正在获取');
      var flag = true;
      if (link_type == 'url') {
        falg = true;
        tmp_raw_info.url = link;
      } else {
        flag = false;
        tmp_raw_info.dburl = link;
      }
      create_site_url_for_douban_info(tmp_raw_info, flag).then(function (tmp_raw_info) {
        console.log(tmp_raw_info)
        if (tmp_raw_info.dburl) {
          get_douban_info(tmp_raw_info);
        }
      }, function (err) {
        console.log(err);
        $(e.target).prop('value', '获取失败');
        if (link_type == 'url') {
          window.open(`https://search.douban.com/movie/subject_search?search_text=${link.match(/tt\d+/)[0]}&cat=1002`, target = "_blank");
        } else {
          window.open(url, target = '_blank');
        }
      });
    } else {
      alert("请输入合适的链接！！！")
    }
  })
}

if (site_url.match(/^https:\/\/piggo.me\/upload.php/)) {
  $('input[name=url]').parent().after(`<div><input type="button" value="获取豆瓣" class="get_descr" data="url" /></div>`);
  $('input[name=pt_gen]').parent().after(`<div><input type="button" value="获取豆瓣" class="get_descr" data="pt_gen" /></div>`);
  $('.btn-get-pt-gen').hide();
  $('.get_descr').click((e) => {
    var tmp_raw_info = { 'url': '', 'dburl': '', 'descr': '' };
    var link_type = $(e.target).attr('data');
    if ($(`input[name="${link_type}"]`).val()) {
      var link = $(`input[name="${link_type}"]`).val();
      $(e.target).prop('value', '正在获取');
      var flag = true;
      if (link_type == 'url') {
        falg = true;
        tmp_raw_info.url = link;
      } else {
        flag = false;
        tmp_raw_info.dburl = link;
      }
      create_site_url_for_douban_info(tmp_raw_info, flag).then(function (tmp_raw_info) {
        console.log(tmp_raw_info)
        if (tmp_raw_info.dburl) {
          get_douban_info(tmp_raw_info);
        }
      }, function (err) {
        console.log(err);
        $(e.target).prop('value', '获取失败');
        if (link_type == 'url') {
          window.open(`https://search.douban.com/movie/subject_search?search_text=${link.match(/tt\d+/)[0]}&cat=1002`, target = "_blank");
        } else {
          window.open(url, target = '_blank');
        }
      });
    } else {
      alert("请输入合适的链接！！！")
    }
  })
}

if (site_url.match(/jpopsuki.eu.*torrents.php\?id=/)) {
  $('tr.group_torrent').find("a:contains(RP)").map((index, e) => {
    $(e).after(` | <a href="https://jpopsuki.eu/torrents.php?id=${site_url.match(/id=(\d+)/)[1]}&torrentid=${$(e).attr('href').match(/id=(\d+)/)[1]}">PL</a>`);
  });
}

//添加豆瓣到ptgen跳转
if (site_url.match(/^https:\/\/movie.douban.com\/subject\/\d+/i) && if_douban_jump) {
  $(document).ready(function () {
    $('#info').append(`<span class="pl">描述信息: </span><a id="copy">复制</a>`);
    $('#copy').click(e => {
      var tmp_raw_info = { 'url': '', 'dburl': match_link('douban', site_url), 'descr': '' };
      get_douban_info(tmp_raw_info);
    });

    var year = $('span.year').text().match(/\d+/)[0];
    var ch_name = $('h1').find('span:first').text().split(' ')[0];

    try {
      var imdbid = $('#info').html().match(/tt\d+/i)[0];
      var imdb_url = 'https://www.imdb.com/title/' + imdbid;
      setTimeout(function () {
        if (!$('#info').find('a[href*="www.imdb.com"]').length) {
          $("span.pl:contains('IMDb')").get(0).nextSibling.nodeValue = '';
          $("span.pl:contains('IMDb')").after(`<a href="${imdb_url}" target="_blank"> ${imdbid}</a>`);
        }
      }, 1000);
      getDoc(imdb_url, null, function (doc) {
        var en_name = $('h1', doc).text();
        if ($('span.pl:contains("季数")').length) {
          var en_name02 = $('div:contains("All episodes"):last', doc).parent().parent().prev().text();
          en_name = en_name02 ? en_name02 : en_name;
          var number = $('#season option:selected').text();
          if (!number) { number = $('span.pl:contains("季数")')[0].nextSibling.textContent.trim(); }
          if (number.length < 2) { number = '0' + number; }
          en_name = en_name + ' S' + number;
        }
        var name = `${ch_name} ${en_name} ${year} `.replace(/ +/g, ' ').replace(/ /g, '.').replace(/:\./, '.').replace('-.', '-').replace('..', '.').replace('.-', '-');
        $('#info').append(`<br><span class="pl">影视名称:</span> ${name}<br>`);
        add_search_urls($container, imdbid, imdbno, en_name, 2);
      });
    } catch (err) {
      var en_name = null;
      var aka_names = $('#info span.pl:contains("又名")')[0].nextSibling.textContent.trim();
      aka_names.split('/').forEach((e, index) => {
        if (e.match(/^[a-zA-Z0-9 '-:]*$/)) {
          en_name = e;
        }
      });
      var name = `${ch_name} ${en_name} ${year} `.replace(/ +/g, ' ').replace(/ /g, '.').replace(/:\./, '.').replace('-.', '-').replace('..', '.').replace('.-', '-');
      $('#info').append(`<br><span class="pl">影视名称:</span> ${name}<br>`);
    }

    $('#mainpic').append(`<br><a href="#">海报转存</a>`);
    add_picture_transfer();
    var poster = $('#mainpic img')[0].src.replace(
      /^.+(p\d+).+$/,
      (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
    );
    $('input[name=img_url]').val(poster);

    try {
      if ($('#info').html().match(/tt\d+/i)) {
        var imdbid = $('#info').html().match(/tt\d+/i)[0];
        var imdbno = imdbid.substring(2);
        var search_name = $('h1').text().trim().match(/[a-z ]{2,200}/i)[0];
        search_name = search_name.replace(/season/i, '');
        if (!search_name.trim()) {
          try {
            search_name = $('#info span.pl:contains("又名")')[0]
              .nextSibling.textContent.trim()
              .split(" / ")[0];
          } catch (err) { }
        }
        var $container = $('h1');
        add_search_urls($container, imdbid, imdbno, search_name, 2);
      }
    } catch (err) { console.log(err) }
  });
  return;
}

if (site_url.match(/^https:\/\/www.imdb.com\/title\/tt\d+/) && if_imdb_jump) {
  mutation_observer(document, function () {
    if (!$('.search_urls').length) {
      var imdbid = site_url.match(/tt\d+/i)[0];
      var imdbno = imdbid.substring(2);
      var search_name = $('title').text().trim().split(/ \(\d+\) - /)[0];
      search_name = search_name.replace(/season/i, '');
      var $container = $('h1[data-testid*=pageTitle]');
      add_search_urls($container, imdbid, imdbno, search_name, 1);
      $('.search_urls').find('a').css('color', 'yellow');
    }
  });
  return;
}

if (site_url.match(/^https:\/\/(music|book).douban.com\/subject\/\d+/)) {
  var source_type = '音乐';
  if (site_url.match(/book/)) {
    source_type = '书籍';
  }
  $('#mainpic').append(`<br><a href="#">海报转存</a>`);
  add_picture_transfer();
  var poster = $('#mainpic img')[0].src.replace(
    /^.+(p\d+).+$/,
    (_, p1) => `https://img9.doubanio.com/view/photo/l_ratio_poster/public/${p1}.jpg`
  );
  $('input[name=img_url]').val(poster);
  function walk_Dom(n) {
    do {
      if (n.nodeName == 'SPAN' && n.className == 'pl') {
        n.innerHTML = '◎' + n.innerHTML.trim();
      } else if (n.nodeName == 'BR') {
        n.innerHTML = '\r\n';
      }
      if (n.hasChildNodes()) {
        walk_Dom(n.firstChild);
      } else {
        if (n.nodeType != 1) {
          raw_info = raw_info + n.textContent.trim();
        }
      }
      n = n.nextSibling;
    } while (n);
    return raw_info;
  }
  var raw_info = '';
  var poster = `[img]${$('div#mainpic').find('a').prop('href')}[/img]\n`;
  var info = walk_Dom($('#info')[0].cloneNode(true));
  info = info.replace(/◎/g, '\n◎');
  info = info.replace(/:/g, '：');
  info = poster + info;
  try {
    info += '\n◎豆瓣评分：' + `${$('strong.rating_num').text()}/10 from ${$('div.rating_sum').text().match(/\d+/)[0]} users`;
  } catch (err) {
    info += '\n◎豆瓣评分： NaN';
  }
  info += '\n◎豆瓣链接：' + site_url.split('?')[0] + '\n';

  var tag = $('div.tags-body');
  if (tag.length) {
    info += '\n◎标签：' + Array.from(tag.find('a').map((index, e) => {
      return $(e).text();
    })).join(' | ');
  }

// [Site Logic: 音乐]
    var introduction = $('#link-report').find('div.intro:first');
    if (introduction.length) {
      if (introduction.text().match(/展开全部/i)) {
        introduction = $('#link-report').find('span[class*="all hidden"]').find('div.intro');
      }
      introduction = introduction.clone();
      introduction.find('p').map((index, e) => {
        $(e).text($(e).text() + '\n\n');
      });
      info += `\n◎内容简介\n${'　　' + introduction.text().trim()}`;
    } else {
      info += `\n◎内容简介\n　　该${source_type}暂无简介。`;
    }
    var author_intro = $('span:contains(作者简介)').parent().next();
    if (author_intro.length) {
      if (author_intro.text().match('展开全部')) {
        author_intro = author_intro.find('span[class*="all hidden"]').find('div.intro');
      } else {
        author_intro = author_intro.find('div.intro')
      }
      author_intro = author_intro.clone();
      author_intro.find('p').map((index, e) => {
        $(e).text($(e).text() + '\n\n');
      });
      info += `\n\n◎作者简介\n${'　　' + author_intro.text().trim()}`;
    }
  }

  $('#info').append(`描述: <a id="copy">复制</a>`);
  $('#copy').click(e => {
    GM_setClipboard(info);
    $('#copy').text('完成')
  });
}

/*******************************************************************************************************************
*                                         part 3 页面逻辑处理（源网页）                                              *
********************************************************************************************************************/
var sleep_time = 0;
// [Site Logic: Hdf]
// [Site Logic: Digitalcore]
if (site_url.match(/https:\/\/redacted.sh\/upload.php#separator#/)) {
  sleep_time = 2500;
} else if (site_url.match(/https:\/\/springsunday.net\/upload.php#/)) {
  sleep_time = 1500;
} else if (site_url.match(/https:\/\/rousi.pro\/upload#/)) {
  sleep_time = 3000;
}

// [Site Logic: Byr]
// [Site Logic: Yemapt]

function auto_feed() {
// [Site Logic: ZHUQUE]
  if (judge_if_the_site_as_source() == 1) {
    raw_info.origin_site = origin_site;
    raw_info.origin_url = site_url.replace('/', '***');

    var title, small_descr, descr, tbody, frds_nfo;
    var cmct_mode = 1;
    var torrent_id = "";//gz架构站点种子id
    var douban_button_needed = false;
    var search_mode = 1;

    var is_inserted = false;
    var opencd_mode = 0; //皇后有两种版面,默认新版面
// [Site Logic: Opencd]

    //----------------------------------标题简介获取——国内站点-------------------------------------------
    if ((judge_if_the_site_in_domestic(site_url) && origin_site != 'HHClub') || opencd_mode) {
// [Site Logic: Ttg]
// [Site Logic: Hudbt]
// [Site Logic: Byr]
// [Site Logic: Npupt]
        title = document.getElementById("top");
      }

// [Site Logic: Byr]
// [Site Logic: Ttg]
        descr = document.getElementById("kdescr");
// [Site Logic: Cmct]
// [Site Logic: Frds]
        if (site_url.match(/detailsgame/)) {
          descr = document.getElementById("kdescription");
          raw_info.type = '游戏';
          try { raw_info.small_descr = document.getElementsByTagName('h1')[1].textContent; } catch (err) { }
        }
// [Site Logic: Ptlgs]
      }
// [Site Logic: Qingwa]


// [Site Logic: OurBits]

// [Site Logic: 影]

      //获取最外层table
      tbody = descr.parentNode.parentNode.parentNode;
      descr = descr.cloneNode(true);

      try {
        var codetop = descr.getElementsByClassName('codetop');
        Array.from(codetop).map((e, index) => {
          try { descr.removeChild(e); } catch (err) { e.parentNode.removeChild(e) }
        });
        var codemain = descr.getElementsByClassName('codemain');
        Array.from(codemain).map((e, index) => {
          if (!e.innerHTML.match(/<table>/) && (origin_site != 'OurBits' || !$(e).find("fieldset").length)) {
            try { e.innerHTML = '[quote]{mediainfo}[/quote]'.format({ 'mediainfo': e.innerHTML.trim() }); } catch (err) { }
          }
        });
// [Site Logic: Audiences]
      } catch (err) {
        console.log(err);
      }

      raw_info.descr = walkDOM(descr);
      raw_info.descr = raw_info.descr.replace(/\[\/img\]\n\n/g, '[/img]\n');

// [Site Logic: 影]
// [Site Logic: Audiences]

      raw_info.descr = raw_info.descr.replace(/\[img\]https:\/\/ourbits.club\/pic\/(Ourbits_MoreScreens|Ourbits_info).png\[\/img\]/g, '');

// [Site Logic: U2]

// [Site Logic: Frds]

      // HDDolby 详情页：按页面结构抓取 MediaInfo 与 截图
// [Site Logic: Hddolby]

      if ($('.nexus-media-info-raw').length || $('#kmediainfo').length) {
        var mediainfo = $('.nexus-media-info-raw').text() ? $('.nexus-media-info-raw').text() : $('#kmediainfo').text();
        if ($('.spoiler-content').length) {
          mediainfo = $('.spoiler-content').text();
        }
        if (mediainfo !== '暂无媒体信息') {
          raw_info.descr += `\n  \n[quote]${mediainfo.trim()}[/quote]\n  \n`;
          try {
            var intro = raw_info.descr.indexOf('◎简　　介');
            intro = intro ? intro : 300;
            var pictures = raw_info.descr.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/g);
            pictures.forEach(item => {
              if (raw_info.descr.indexOf(item) > intro) {
                raw_info.descr = raw_info.descr.replace(item, '');
                raw_info.descr += item;
              }
            });
          } catch (err) { }
        }
      }

      //ourbits没有简介的话补充简介
// [Site Logic: OurBits]

// [Site Logic: Ttg]

// [Site Logic: Frds]
// [Site Logic: 影]
// [Site Logic: U2]
// [Site Logic: Other]
// [Site Logic: HDSky]
// [Site Logic: Ttg]
// [Site Logic: Zmpt]
// [Site Logic: Hdarea]
        raw_info.torrent_name = $('a[href*="download.php"]:contains(torrent)').text();
        if ($('a[href*="download.php"]:contains(下载地址)').length) {
          raw_info.torrent_url = $('a[href*="download.php"]:contains(下载地址)').attr('href');
        } else if ($('td:contains(种子链接)').length) {
          raw_info.torrent_url = $('td:contains(种子链接)').next().find('a').attr('href');
        } else if ($('td:contains(下载直链)').length) {
          raw_info.torrent_url = $('td:contains(下载直链)').next().find('a').attr('href');
        } else if ($('td:contains(下载链接)').length) {
          raw_info.torrent_url = $('td:contains(下载链接)').next().find('a').attr('href');
// [Site Logic: Hdarea]
        } else if ($('td:contains(下載鏈接)').length) {
          raw_info.torrent_url = $('td:contains(下載鏈接)').next().find('a').attr('href');
        } else if ($('a[href*="download.php"]:contains(下载种子)').length) {
          raw_info.torrent_url = $('a[href*="download.php"]:contains(下载种子)').attr('href');
        } else {
          raw_info.torrent_url = $('a[href*="download.php"]:contains(torrent)').attr('href');
        }
        if (!raw_info.torrent_url.match(/^http/)) {
          if (raw_info.torrent_url.match(/^\//)) {
            raw_info.torrent_url = raw_info.torrent_url.replace(/^\//, '');
          }
          raw_info.torrent_url = used_site_info[origin_site].url + raw_info.torrent_url;
        }
// [Site Logic: Cmct]
      }
    }

// [Site Logic: Hdroute]

// [Site Logic: Opencd]

    //------------------------------国外站点table获取(简介后续单独处理)-------------------------------------------

    var table, insert_row, douban_box;
// [Site Logic: Hdt]

// [Site Logic: Ptlgs]

// [Site Logic: Hhclub]

// [Site Logic: Tik]

// [Site Logic: Cnz]

// [Site Logic: PTP]

// [Site Logic: Ant]

// [Site Logic: Sc]

// [Site Logic: HDOnly]

// [Site Logic: Gpw]

// [Site Logic: Btn]

// [Site Logic: Tvv]

// [Site Logic: Nbl]

// [Site Logic: Ipt]

// [Site Logic: Hdspace]

// [Site Logic: Torrentseeds]

// [Site Logic: Speedapp]

// [Site Logic: In]

// [Site Logic: Hou]

// [Site Logic: Omg]

// [Site Logic: Digitalcore]

// [Site Logic: Bluebird]

// [Site Logic: Bwtorrents]

// [Site Logic: Bit-Hdtv]

// [Site Logic: Bib]

// [Site Logic: Mam]

// [Site Logic: Mtv]

// [Site Logic: Bhd]

// [Site Logic: Hdoli]

// [Site Logic: Fnp]

// [Site Logic: Hone]

// [Site Logic: Blu]

// [Site Logic: Uhd]

// [Site Logic: Hdf]

// [Site Logic: Hdb]

// [Site Logic: Red]

// [Site Logic: Lztr]

// [Site Logic: Ops]

// [Site Logic: Dicmusic]

// [Site Logic: Sugoimusic]

// [Site Logic: Jpop]

// [Site Logic: Opencd]

// [Site Logic: Torrentleech]

    if (origin_site.match(/xthor/i)) {
      try { raw_info.name = document.getElementsByTagName('h1')[0].textContent; } catch {
        raw_info.name = document.getElementsByTagName('h2')[0].textContent;
      }
      var download = document.getElementById('Download');
      var tbody = download.getElementsByTagName('tbody')[0];
      raw_info.url = match_link('imdb', download.innerHTML).split('?').pop();

      if (download.innerHTML.match(/https:\/\/xthor.tk\/pic\/bannieres\/info_film.png/i)) {
        raw_info.type = '电影';
      } else if (download.innerHTML.match(/https:\/\/xthor.tk\/pic\/bannieres\/info_serie.png/i)) {
        raw_info.type = '剧集';
      }
      if (!raw_info.type && raw_info.name.match(/s\d+/i)) {
        raw_info.type = '剧集';
      } else {
        raw_info.type = '电影';
      }
      var div_index = document.getElementsByClassName('breadcrumb')[0];
      var div = document.createElement('div');
      var mytable = document.createElement('table');
      var mytbody = document.createElement('tbody');
      insert_row = mytable.insertRow(0);
      douban_box = mytable.insertRow(0);
      div.appendChild(mytable);
      div_index.parentNode.insertBefore(div, div_index);

      var nfo = document.getElementById('NFO');
      raw_info.descr = nfo.textContent;
      raw_info.descr = '[quote]\n' + raw_info.descr + '\n[/quote]';

      if (raw_info.url && all_sites_show_douban) {
        getData(raw_info.url, function (data) {
          console.log(data);
          if (data.data) {
            var score = data.data.average + '分';
            if (!score.replace('分', '')) score = '暂无评分';
            if (data.data.votes) score += `|${data.data.votes}人`;
            $('td>h2:first').append(`<span> | </span><a href="${douban_prex}${data.data.id}" target="_blank">${data.data.title.split(' ')[0]}[${score}]</a>`)
            $a = $('h2').parent().find('i:eq(-2)').find('a').text('查看……');
            $('h2:first').parent().find('i:eq(-1)').text(`${data.data.summary.replace(/ 　　/g, '')}`);
            $('h2:first').parent().find('i:eq(-1)').append($a);
            $('span:contains(/10)').before(` / ${data.data.genre}`)
          }
        });
      }
      raw_info.torrent_url = `https://xthor.tk/` + $('a[href^="download.php"]').attr('href');
      var torrent_pass = $('link[href*="torrent_pass"]').attr('href').split('torrent_pass')[1];
      raw_info.torrent_url += `&torrent_pass${torrent_pass}`;
    }

// [Site Logic: Hdroute]

// [Site Logic: ZHUQUE]

// [Site Logic: Filelist]

// [Site Logic: Cg]

// [Site Logic: Kg]

// [Site Logic: Its]

// [Site Logic: Sportscult]

// [Site Logic: Npupt]

// [Site Logic: Mteam]

// [Site Logic: Nexushd]

    //-------------------------------------根据table获取其他信息——包含插入节点（混合）-------------------------------------------
    var tds = tbody.getElementsByTagName("td");
// [Site Logic: Hudbt]

    //循环处理所有信息
    for (i = 0; i < tds.length; i++) {
// [Site Logic: Cnz]

// [Site Logic: Hdt]

// [Site Logic: Its]

// [Site Logic: HDOnly]

// [Site Logic: Hdoli]
        if (tds[i].textContent.match(/Category/)) {
// [Site Logic: Hdb]
// [Site Logic: Bit-Hdtv]
            raw_info.type = tds[i + 1].textContent.get_type();
            raw_info.medium_sel = tds[i + 1].textContent.medium_sel();
            if (raw_info.name.match(/COMPLETE.*?BLURAY/)) {
              raw_info.medium_sel = 'Blu-ray';
            }
          }
        }
      }

// [Site Logic: Torrentleech]

// [Site Logic: Hudbt]
        if (['行为', '小货车', '行為', '种子认领', '簡介', '简介', '操作', 'Action', 'Tagline', 'Tools:', '设备'].indexOf(tds[i].textContent.trim()) > -1 && origin_site != 'KG') {
          if (!is_inserted) {
// [Site Logic: Mtv]
// [Site Logic: Cg]
// [Site Logic: OurBits]
            is_inserted = true;
          }
        }
      }

      if (['副标题', '副標題', '副标题', 'Small Description'].indexOf(tds[i].textContent) > -1 && !raw_info.small_descr) {
// [Site Logic: Hudbt]
// [Site Logic: 影]
// [Site Logic: U2]
// [Site Logic: Filelist]
        }
      }
      if (['标题'].indexOf(tds[i].textContent) > -1 && !raw_info.name && origin_site == '影') {
        raw_info.name = tds[i].nextSibling.nextSibling.textContent;
      }

// [Site Logic: Cg]

// [Site Logic: Kg]

      //主要是类型、medium_sel、地区等等信息
      if (['基本信息', '详细信息', '类型', '基本資訊', '標籤列表：', '媒介：', 'Basic Info', '分类 / 制作组', '种子信息'].indexOf(tds[i].textContent) > -1) {
        if (i + 1 < tds.length) {
// [Site Logic: Hudbt]
// [Site Logic: 影]
            info_text = tds[i + 1].textContent;
          }
          if (info_text.source_sel()) {
            raw_info.source_sel = info_text.source_sel();
          }
          if (tds[i].innerHTML == '標籤列表：') {
            raw_info.music_type = tds[i + 1].textContent;
            raw_info.descr += '\n标签： ' + raw_info.music_type + '\n';
          } else if (tds[i].innerHTML == '媒介：') {
            raw_info.music_media = tds[i + 1].textContent;
          }

          if (tds[i].innerHTML == '基本資訊' && opencd_mode) {
            raw_info.music_type = tds[i + 1].textContent;
            raw_info.music_media = tds[i + 1].textContent;
          }
          if (info_text.get_type()) {
            raw_info.type = info_text.get_type();
          }
// [Site Logic: Ttg]
          if (info_text.medium_sel()) {
            raw_info.medium_sel = info_text.medium_sel();
          }
          if (info_text.codec_sel()) {
            raw_info.codec_sel = info_text.codec_sel();
          }
          if (info_text.audiocodec_sel()) {
            raw_info.audiocodec_sel = info_text.audiocodec_sel();
          }
// [Site Logic: Ttg]
          if (site_url.match(/music.php/)) {
            raw_info.music_media = tds[i + 1].textContent;
          }
        }
      }

// [Site Logic: Tjupt]
    }

// [Site Logic: U2]

// [Site Logic: Mteam]
    //------------------------------------国外站点简介单独处理，最后辅以豆瓣按钮----------------------------------------------

// [Site Logic: PTP]

// [Site Logic: Ant]

// [Site Logic: Sc]

// [Site Logic: HDOnly]

// [Site Logic: Gpw]

// [Site Logic: Hdb]

// [Site Logic: Red]

// [Site Logic: Hdf]

// [Site Logic: Uhd]

// [Site Logic: Cnz]

// [Site Logic: Hdt]
// [Site Logic: Mtv]
// [Site Logic: Hdt]
// [Site Logic: Kg]
// [Site Logic: Hdt]
// [Site Logic: Cg]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Tik]
// [Site Logic: Hdt]
// [Site Logic: Hdoli]
// [Site Logic: Hdt]
// [Site Logic: Torrentleech]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: Frds]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hdt]
// [Site Logic: Byr]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hhclub]
// [Site Logic: Hdt]
// [Site Logic: Hdarea]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hddolby]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 音乐]
// [Site Logic: Hdt]
// [Site Logic: U2]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Hdt]
// [Site Logic: 音乐]
// [Site Logic: Hdt]
// [Site Logic: HDOnly]
// [Site Logic: Hudbt]
// [Site Logic: Hdt]
// [Site Logic: Xthor]
// [Site Logic: Opencd]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdoli]
// [Site Logic: Mteam]
// [Site Logic: Xthor]
// [Site Logic: Mteam]
// [Site Logic: Fnp]
// [Site Logic: Mteam]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hhclub]
// [Site Logic: Hdspace]
// [Site Logic: Hdt]
// [Site Logic: Filelist]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Bib]
// [Site Logic: Hdt]
// [Site Logic: Filelist]
// [Site Logic: Hdt]
// [Site Logic: Cg]
// [Site Logic: Hdt]
// [Site Logic: Mam]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Gpw]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: Mtv]
// [Site Logic: Hdt]
// [Site Logic: Piggo]
// [Site Logic: Hhclub]
// [Site Logic: Tjupt]
// [Site Logic: Pter]
// [Site Logic: Opencd]
// [Site Logic: HDB]
// [Site Logic: Frds]
// [Site Logic: Audiences]
// [Site Logic: Bhd]
// [Site Logic: Hdb]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: 电影]
// [Site Logic: PTP]
// [Site Logic: Sc]
// [Site Logic: Tvv]
// [Site Logic: Cnz]
// [Site Logic: 纪录]
// [Site Logic: Cnz]
// [Site Logic: 电影]
// [Site Logic: Cnz]
// [Site Logic: Ant]
// [Site Logic: Gpw]
// [Site Logic: Kg]
// [Site Logic: Hdcity]
// [Site Logic: Btn]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Encode]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 软件]
// [Site Logic: Hdt]
// [Site Logic: Frds]
// [Site Logic: OurBits]
// [Site Logic: Frds]
// [Site Logic: Ptt]
// [Site Logic: OurBits]
// [Site Logic: HDOnly]
// [Site Logic: Hdt]
// [Site Logic: Gpw]
// [Site Logic: Hdt]
// [Site Logic: Gpw]
// [Site Logic: Hdt]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: HDOnly]
// [Site Logic: Cmct]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 电影]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Tjupt]
// [Site Logic: Hdt]
// [Site Logic: Dicmusic]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: Hudbt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: H264]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hudbt]
// [Site Logic: Hdt]
// [Site Logic: 纪录]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Sugoimusic]
// [Site Logic: Hdt]
// [Site Logic: Opencd]
// [Site Logic: Hdt]
// [Site Logic: Ops]
// [Site Logic: Hdt]
// [Site Logic: Red]
// [Site Logic: Flac]
// [Site Logic: Red]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Gpw]
// [Site Logic: Xthor]
// [Site Logic: Gpw]
// [Site Logic: Hdt]
// [Site Logic: Darkland]
// [Site Logic: Cmct]
// [Site Logic: Darkland]
// [Site Logic: Hdt]
// [Site Logic: Ubits]
// [Site Logic: Hdt]
// [Site Logic: Kufei]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: Hddolby]
// [Site Logic: Hdt]
// [Site Logic: Btschool]
// [Site Logic: Hdt]
// [Site Logic: Tjupt]
// [Site Logic: Hdt]
// [Site Logic: Agsv]
// [Site Logic: Hdt]
// [Site Logic: Fnp]
// [Site Logic: Audiences]
// [Site Logic: Fnp]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: Lemonhd]
// [Site Logic: Hddolby]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: Hddolby]
// [Site Logic: 财神]
// [Site Logic: Hdt]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Hdt]
// [Site Logic: Njtupt]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: HDHome]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: Dts-X]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: Mv]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 电影]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: 游戏]
// [Site Logic: Hdt]
// [Site Logic: 游戏]
// [Site Logic: 学习]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: Mv]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 8K]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Hdt]
// [Site Logic: 动漫]
// [Site Logic: Mv]
// [Site Logic: 音乐]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdroute]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Hdspace]
// [Site Logic: Fnp]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: HDB]
// [Site Logic: Hdcity]
// [Site Logic: Bhd]
// [Site Logic: Fnp]
// [Site Logic: Tik]
// [Site Logic: Xthor]
// [Site Logic: Hdt]
// [Site Logic: Pter]
// [Site Logic: Hdt]
// [Site Logic: Mteam]
// [Site Logic: Hdt]
// [Site Logic: Cmct]
// [Site Logic: 剧集]
// [Site Logic: Cmct]
// [Site Logic: Hdt]
// [Site Logic: 影]
// [Site Logic: 4K]
// [Site Logic: 影]
// [Site Logic: 4K]
// [Site Logic: 影]
// [Site Logic: Hdt]
// [Site Logic: ZHUQUE]
// [Site Logic: Blu-Ray]
// [Site Logic: ZHUQUE]
// [Site Logic: Hdt]
// [Site Logic: Yemapt]
// [Site Logic: Uhd]
// [Site Logic: Yemapt]
// [Site Logic: Uhd]
// [Site Logic: Yemapt]
// [Site Logic: 欧美]
// [Site Logic: Yemapt]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: Dvd]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: Uhd]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: Audiences]
// [Site Logic: Hdt]
// [Site Logic: HDHome]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: HDHome]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: HDHome]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: Blu-Ray]
// [Site Logic: Uhd]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: HDHome]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: HDHome]
// [Site Logic: Uhd]
// [Site Logic: Encode]
// [Site Logic: HDHome]
// [Site Logic: Hdt]
// [Site Logic: H264]
// [Site Logic: H265]
// [Site Logic: Hdt]
// [Site Logic: HDB]
// [Site Logic: Hdt]
// [Site Logic: Hudbt]
// [Site Logic: Hdt]
// [Site Logic: Nanyang]
// [Site Logic: Hdt]
// [Site Logic: Putao]
// [Site Logic: 欧美]
// [Site Logic: Putao]
// [Site Logic: 印度]
// [Site Logic: Putao]
// [Site Logic: Hdt]
// [Site Logic: Tlfbits]
// [Site Logic: Hdt]
// [Site Logic: Hddolby]
// [Site Logic: 剧集]
// [Site Logic: Hddolby]
// [Site Logic: 剧集]
// [Site Logic: Hddolby]
// [Site Logic: 剧集]
// [Site Logic: Hddolby]
// [Site Logic: Hdt]
// [Site Logic: Itzmx]
// [Site Logic: Hdt]
// [Site Logic: Hdtime]
// [Site Logic: Blu-Ray]
// [Site Logic: Hdtime]
// [Site Logic: Hdt]
// [Site Logic: Hdarea]
// [Site Logic: Uhd]
// [Site Logic: Blu-Ray]
// [Site Logic: Hdarea]
// [Site Logic: Dvd]
// [Site Logic: Hdarea]
// [Site Logic: 4K]
// [Site Logic: Hdarea]
// [Site Logic: 720P]
// [Site Logic: Hdarea]
// [Site Logic: H264]
// [Site Logic: Hdarea]
// [Site Logic: Ac3]
// [Site Logic: Hdarea]
// [Site Logic: Hdt]
// [Site Logic: Btschool]
// [Site Logic: Hdt]
// [Site Logic: Tjupt]
// [Site Logic: 剧集]
// [Site Logic: Tjupt]
// [Site Logic: 纪录]
// [Site Logic: 1080I]
// [Site Logic: 纪录]
// [Site Logic: Tjupt]
// [Site Logic: Hdt]
// [Site Logic: Nexushd]
// [Site Logic: Hdt]
// [Site Logic: 电影]
// [Site Logic: 港台]
// [Site Logic: 欧美]
// [Site Logic: 日韩]
// [Site Logic: 电影]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Byr]
// [Site Logic: Hdt]
// [Site Logic: Tccf]
// [Site Logic: Hdt]
// [Site Logic: Ptsbao]
// [Site Logic: 720P]
// [Site Logic: 4K]
// [Site Logic: Ptsbao]
// [Site Logic: 720P]
// [Site Logic: 4K]
// [Site Logic: Ptsbao]
// [Site Logic: Uhd]
// [Site Logic: Encode]
// [Site Logic: Ptsbao]
// [Site Logic: Hdt]
// [Site Logic: Haidan]
// [Site Logic: 剧集]
// [Site Logic: Haidan]
// [Site Logic: Hdt]
// [Site Logic: Hdfans]
// [Site Logic: 4K]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Hdfans]
// [Site Logic: 欧美]
// [Site Logic: Hdfans]
// [Site Logic: Hdt]
// [Site Logic: Cyanbug]
// [Site Logic: Hdt]
// [Site Logic: Ptchina]
// [Site Logic: 4K]
// [Site Logic: Ptchina]
// [Site Logic: 1080I]
// [Site Logic: Ptchina]
// [Site Logic: Ac3]
// [Site Logic: Ptchina]
// [Site Logic: 欧美]
// [Site Logic: Ptchina]
// [Site Logic: Hdt]
// [Site Logic: Hdroute]
// [Site Logic: Hdt]
// [Site Logic: Bhd]
// [Site Logic: Uhd]
// [Site Logic: Bhd]
// [Site Logic: Uhd]
// [Site Logic: Bhd]
// [Site Logic: 剧集]
// [Site Logic: Bhd]
// [Site Logic: 剧集]
// [Site Logic: Bhd]
// [Site Logic: 剧集]
// [Site Logic: Bhd]
// [Site Logic: Hdt]
// [Site Logic: Hdu]
// [Site Logic: 剧集]
// [Site Logic: 4K]
// [Site Logic: 剧集]
// [Site Logic: Hdu]
// [Site Logic: 剧集]
// [Site Logic: Hdu]
// [Site Logic: 剧集]
// [Site Logic: Hdu]
// [Site Logic: Hdt]
// [Site Logic: Dragon]
// [Site Logic: Hdt]
// [Site Logic: Ultrahd]
// [Site Logic: Hdt]
// [Site Logic: 52Pt]
// [Site Logic: Hdt]
// [Site Logic: Ydy]
// [Site Logic: Uhd]
// [Site Logic: Ydy]
// [Site Logic: 剧集]
// [Site Logic: Ydy]
// [Site Logic: Hdt]
// [Site Logic: Soulvoice]
// [Site Logic: Encode]
// [Site Logic: Soulvoice]
// [Site Logic: Flac]
// [Site Logic: 音乐]
// [Site Logic: Soulvoice]
// [Site Logic: Hdt]
// [Site Logic: Okpt]
// [Site Logic: Uhd]
// [Site Logic: Blu-Ray]
// [Site Logic: Okpt]
// [Site Logic: Hdtv]
// [Site Logic: Dvd]
// [Site Logic: Cd]
// [Site Logic: Okpt]
// [Site Logic: Mteam]
// [Site Logic: Okpt]
// [Site Logic: Hdt]
// [Site Logic: Discfan]
// [Site Logic: Hdt]
// [Site Logic: Piggo]
// [Site Logic: Hdt]
// [Site Logic: Rousi]
// [Site Logic: Hdt]
// [Site Logic: 财神]
// [Site Logic: 下水道]
// [Site Logic: Hdt]
// [Site Logic: 唐门]
// [Site Logic: Hdt]
// [Site Logic: Zmpt]
// [Site Logic: Hdt]
// [Site Logic: Icc]
// [Site Logic: Hdt]
// [Site Logic: 海棠]
// [Site Logic: Hdt]
// [Site Logic: 麒麟]
// [Site Logic: Hdt]
// [Site Logic: Carpt]
// [Site Logic: Hdt]
// [Site Logic: Joyhd]
// [Site Logic: Hdt]
// [Site Logic: Crabpt]
// [Site Logic: Uhd]
// [Site Logic: Blu-Ray]
// [Site Logic: Crabpt]
// [Site Logic: Encode]
// [Site Logic: Crabpt]
// [Site Logic: Hdtv]
// [Site Logic: Cd]
// [Site Logic: Crabpt]
// [Site Logic: Hdt]
// [Site Logic: Qingwa]
// [Site Logic: Hdt]
// [Site Logic: 52Movie]
// [Site Logic: Hdt]
// [Site Logic: Ptfans]
// [Site Logic: Hdt]
// [Site Logic: Ptzone]
// [Site Logic: Hdt]
// [Site Logic: 雨]
// [Site Logic: Hdt]
// [Site Logic: Njtupt]
// [Site Logic: Hdt]
// [Site Logic: 纪录]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Hdt]
// [Site Logic: 4K]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Hdt]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 1080I]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 剧集]
// [Site Logic: Fnp]
// [Site Logic: 1080I]
// [Site Logic: Fnp]
// [Site Logic: Hdt]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: 剧集]
// [Site Logic: Darkland]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: 剧集]
// [Site Logic: Uhd]
// [Site Logic: 剧集]
// [Site Logic: Uhd]
// [Site Logic: Hdt]
// [Site Logic: Hdspace]
// [Site Logic: Uhd]
// [Site Logic: Hdspace]
// [Site Logic: Dvd]
// [Site Logic: Encode]
// [Site Logic: 纪录]
// [Site Logic: Encode]
// [Site Logic: 剧集]
// [Site Logic: Encode]
// [Site Logic: Hdspace]
// [Site Logic: Hdt]
// [Site Logic: Hdb]
// [Site Logic: Uhd]
// [Site Logic: Hdb]
// [Site Logic: Hdt]
// [Site Logic: 1Ptba]
// [Site Logic: Uhd]
// [Site Logic: 1Ptba]
// [Site Logic: Hdt]
// [Site Logic: Aling]
// [Site Logic: Hdt]
// [Site Logic: Longpt]
// [Site Logic: Hdt]
// [Site Logic: 柠檬不甜]
// [Site Logic: Hdt]
// [Site Logic: Railgunpt]
// [Site Logic: Hdt]
// [Site Logic: Mypt]
// [Site Logic: Hdt]
// [Site Logic: 13City]
// [Site Logic: Hdt]
// [Site Logic: Lajidui]
// [Site Logic: Encode]
// [Site Logic: Lajidui]
// [Site Logic: Hdt]
// [Site Logic: Hdvideo]
// [Site Logic: Hdt]
// [Site Logic: Ubits]
// [Site Logic: Hdt]
// [Site Logic: Panda]
// [Site Logic: Hdt]
// [Site Logic: Lemonhd]
// [Site Logic: Hdt]
// [Site Logic: Cdfile]
// [Site Logic: Hdt]
// [Site Logic: Afun]
// [Site Logic: Hdt]
// [Site Logic: 星陨阁]
// [Site Logic: Hdt]
// [Site Logic: Devtracker]
// [Site Logic: Hdt]
// [Site Logic: 樱花]
// [Site Logic: Hdt]
// [Site Logic: 我好闲]
// [Site Logic: 4K]
// [Site Logic: 我好闲]
// [Site Logic: Hdt]
// [Site Logic: Freefarm]
// [Site Logic: 学习]
// [Site Logic: 游戏]
// [Site Logic: Freefarm]
// [Site Logic: Hdt]
// [Site Logic: Kufei]
// [Site Logic: Hdt]
// [Site Logic: Wt-Sakura]
// [Site Logic: 剧集]
// [Site Logic: Wt-Sakura]
// [Site Logic: Hdt]
// [Site Logic: Hitpt]
// [Site Logic: Hdt]
// [Site Logic: Ptt]
// [Site Logic: Hdt]
// [Site Logic: 720P]
// [Site Logic: 电影]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: Uhd]
// [Site Logic: PTP]
// [Site Logic: Hdt]
// [Site Logic: Sc]
// [Site Logic: Hdt]
// [Site Logic: Mtv]
// [Site Logic: Hdt]
// [Site Logic: Torrents.Php]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Remux]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Hdt]
// [Site Logic: Sd]
// [Site Logic: Hdt]
// [Site Logic: Sd]
// [Site Logic: Hdt]
// [Site Logic: Ttg]
// [Site Logic: Hdt]
// [Site Logic: OurBits]
// [Site Logic: Hdt]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: 纪录]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: 剧集]
// [Site Logic: HDOnly]
// [Site Logic: Hdt]
// [Site Logic: Nbl]
// [Site Logic: Hdt]
// [Site Logic: Ant]
// [Site Logic: 剧集]
// [Site Logic: Ant]
// [Site Logic: Hdt]
// [Site Logic: Cnz]
// [Site Logic: 纪录]
// [Site Logic: Cnz]
// [Site Logic: Hdt]
// [Site Logic: Tvv]
// [Site Logic: Torrents.Php]
// [Site Logic: Tvv]
// [Site Logic: Hdt]
// [Site Logic: Xthor]
// [Site Logic: 剧集]
// [Site Logic: Xthor]
// [Site Logic: Hdt]
// [Site Logic: Hdf]
// [Site Logic: 剧集]
// [Site Logic: 纪录]
// [Site Logic: Hdf]
// [Site Logic: Hdt]
// [Site Logic: Cg]
// [Site Logic: Uhd]
// [Site Logic: Cg]
// [Site Logic: Hdt]
// [Site Logic: Rs]
// [Site Logic: Hdt]
// [Site Logic: Gtk]
// [Site Logic: Hdt]
// [Site Logic: Agsv]
// [Site Logic: Hdt]
// [Site Logic: Ptskit]
// [Site Logic: Hdt]
// [Site Logic: March]
// [Site Logic: Hdt]
// [Site Logic: Novahd]
// [Site Logic: Hdt]
// [Site Logic: 躺平]
// [Site Logic: Hdt]
// [Site Logic: Baozi]
// [Site Logic: Hdt]
// [Site Logic: Luckpt]
// [Site Logic: Hdt]
// [Site Logic: 未来幻境]
// [Site Logic: Hdt]
// [Site Logic: 自然]
// [Site Logic: Hdt]
// [Site Logic: Sbpt]
// [Site Logic: 4K]
// [Site Logic: Sbpt]
// [Site Logic: Hdt]
// [Site Logic: 慕雪阁]
// [Site Logic: Hdt]
// [Site Logic: 天枢]
// [Site Logic: 4K]
// [Site Logic: 天枢]
// [Site Logic: Hdt]
// [Site Logic: Yhpp]
// [Site Logic: 1080I]
// [Site Logic: 720P]
// [Site Logic: Yhpp]
// [Site Logic: 欧美]
// [Site Logic: Yhpp]
// [Site Logic: Hdt]
// [Site Logic: 好学]
// [Site Logic: Hdt]
// [Site Logic: Tokyo]
// [Site Logic: 藏宝阁]
// [Site Logic: Ecust]
// [Site Logic: Hdt]
// [Site Logic: Atmos]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Dvd]
// [Site Logic: Hdt]
// [Site Logic: H264]
// [Site Logic: X265]
// [Site Logic: Hdt]
// [Site Logic: Hdtv]
// [Site Logic: Hdt]
// [Site Logic: Blu-Ray]
// [Site Logic: Hdt]
// [Site Logic: 720P]
// [Site Logic: Hdt]
// [Site Logic: 1080I]
// [Site Logic: 4K]
// [Site Logic: Hdt]
// [Site Logic: Omg]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: Encode]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: 剧集]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: Hdt]
// [Site Logic: Uhd]
// [Site Logic: 720P]
// [Site Logic: 1080I]
// [Site Logic: Hdt]
// [Site Logic: PTP]
// [Site Logic: Hdt]
      return;
    }
  }
}

// [Site Logic: ZHUQUE]
// [Site Logic: Mteam]
  setTimeout(auto_feed, sleep_time);

}