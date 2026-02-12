/** Consolidated Logic for: TTG **/

// --- From Module: 02_core_utilities.js (Snippet 1) ---
if (site_url.match(/^https:\/\/totheglory.im\/details.php\?id=\d+&uploaded=1/)) {
  window.open($('a.index:contains(".torrent")').attr("href"), '_blank');
}

// --- From Module: 06_site_detection.js (Snippet 2) ---
if (site_url.match(/u2.dmhy.org|ourbits.club|hd-space.org|totheglory.im|blutopia.cc|star-space.net|torrent.desi|hudbt|fearnopeer.com|darkland.top|onlyencodes.cc|cinemageddon|eiga.moi|hd-olimpo.club|digitalcore.club|bwtorrents.tv|myanonamouse|greatposterwall.com|m-team.cc/i)) {
        n.innerHTML = '\r\n';
      }

// --- From Module: 09_data_processing.js (Snippet 3) ---
else if (item.match(/tu.totheglory.im/)) {
        item = item.replace(/_thumb.png/, '.png');
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

// --- From Module: 12_site_ui_helpers.js (Snippet 6) ---
if (used_signin_sites.indexOf('TTG') > -1) {
        GM_xmlhttpRequest({
          method: "GET",
          url: `https://totheglory.im/`,
          headers: {
            "Accept": 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
            "Accept-Language": 'zh-CN,zh;q=0.9,tr;q=0.8,en-US;q=0.7,en;q=0.6',
            "sec-ch-ua": '".Not/A)Brand";v="99", "Google Chrome";v="103", "Chromium";v="103"',
            "sec-ch-ua-mobile": '?0',
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "document",
            "sec-fetch-mode": "navigate",
            "sec-fetch-site": "none",
            "sec-fetch-user": "?1",
            "upgrade-insecure-requests": "1",
            "User-Agent": 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36',
          },
          onload: function (response) {
            var resp = response.responseText;
            if (resp.match(/次失败登录会导致你的 IP 被禁止。/)) {
              $(`input[kname=TTG]`).parent().find('a').css({ "color": "blue" });
              console.log(`开始登录TTG：`, '失败！！！');
            } else {
              var data = resp.match(/signed_timestamp: "\d+", signed_token: ".*?"/)[0];
              setTimeout(function () {
                var timestamp = data.match(/signed_timestamp: "(\d+)"/)[1];
                var token = data.match(/signed_token: "(.*?)"/)[1];
                postData('https://totheglory.im/signed.php', encodeURI(`signed_timestamp=${timestamp}&signed_token=${token}`), function (rep) {
                  if (rep === undefined) {
                    $(`input[kname=TTG]`).parent().find('a').css({ "color": "DarkOrange" });
                    console.log(`开始登录TTG：`, '成功！！！');
                  } else {
                    $(`input[kname=TTG]`).parent().find('a').css({ "color": "red" });
                    console.log(`开始签到TTG：`, rep);
                  }
                })
              }, 1000);
            }
          }
        });
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 7) ---
if (origin_site == 'TTG' || origin_site == 'PuTao' || origin_site == 'OpenCD' || origin_site == 'HDArea') {
        title = document.getElementsByTagName("h1")[0];
        if ($(title).text().match(/上传成功|编辑成功|发布成功/)) {
          title = document.getElementsByTagName("h1")[1];
        }
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 8) ---
if (origin_site == 'TTG') {
        descr = document.getElementById("kt_d");
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 9) ---
if (origin_site == 'TTG') {
        if (raw_info.descr.search(/主.*演/i) < 0 && raw_info.descr.search(/类.*别/i) < 0) {
          var douban_content = document.getElementsByClassName('douban_content');
          if (douban_content[0]) {
            raw_info.dburl = match_link('douban', douban_content[0].textContent);
            if (raw_info.dburl) {
              douban_button_needed = true;
            }
          }
        }
        if (raw_info.descr.match(/https:\/\/img.hdchina.org\/images/) || raw_info.descr.match(/https?:\/\/tu.totheglory.im\/files/)) {
          douban_button_needed = true;
          if (origin_site == 'TTG') {
            var img = Array.from(document.getElementById("kt_d").getElementsByTagName('img'));
          } else {
            var img = Array.from(document.getElementById("kdescr").getElementsByTagName('img'));
          }
          raw_info.url = match_link('imdb', raw_info.descr);
          img.forEach(e => { e.setAttribute("class", 'checkable_IMG'); e.onclick = ''; });
          $('.checkable_IMG').imgCheckbox({
            onclick: function (el) {
              let tagA = Array.from(el.children()[0].parentNode.parentNode.parentNode.getElementsByTagName("a"));
              tagA.forEach(e => { e.onclick = function () { return false; }; });
              var isChecked = el.hasClass("imgChked"),
                imgEl = el.children()[0];
              var img_src = '';
              img_src = imgEl.parentNode.parentNode.href;
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
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 10) ---
if (origin_site == 'TTG') {
            var img = Array.from(document.getElementById("kt_d").getElementsByTagName('img'));
          }

// --- From Module: 14_origin_site_parsing1.js (Snippet 11) ---
else if (origin_site == 'TTG') {
        raw_info.torrent_name = $('a[href*="dl"]:contains(torrent)').text();
        raw_info.torrent_url = $('a[href*="dl"]:contains(点击复制到剪切板)').attr('href');
      }

// --- From Module: 15_origin_site_parsing2.js (Snippet 12) ---
if (origin_site == 'TTG') {
                insert_row = table.insertRow(i / 2 - 1);
                if (douban_button_needed) {
                  douban_box = table.insertRow(i / 2 - 1);
                }
              }

// --- From Module: 15_origin_site_parsing2.js (Snippet 13) ---
if (origin_site == 'TTG' && info_text == 'BluRay原盘') {
            raw_info.type = '电影';
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 14) ---
if (origin_site != 'TTG') {
            if (info_text.standard_sel()) {
              raw_info.standard_sel = info_text.standard_sel();
            }
          }

// --- From Module: 15_origin_site_parsing2.js (Snippet 15) ---
if (origin_site == 'TTG') {
      raw_info.small_descr = raw_info.name.split('[')[1].replace(']', '');
      raw_info.small_descr = raw_info.small_descr.replace('「', '');
      raw_info.small_descr = raw_info.small_descr.replace('」', '');
      raw_info.name = raw_info.name.split('[')[0];
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 16) ---
if (origin_site != 'UHD' && origin_site != 'TTG') {
          document.getElementById('common_link').onclick = function () {
            var key;
            for (index in site_order) {
              key = site_order[index];
              if (used_common_sites.indexOf(key) > -1 && origin_site != key) {
                if (['PTP', 'KG', 'BTN', 'GPW', 'SC', 'avz', 'PHD', 'CNZ', 'ANT', 'NBL', 'HDCity'].indexOf(key) < 0) {
                  var site_href = document.getElementById(key).href;
                  window.open(site_href, '_blank');
                } else {
                  $(`#${key}`).click();
                }
              }
            }
          };
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 17) ---
if (this.id == "影" && ['CMCT', 'TTG', 'UHD', 'FileList', 'RED', 'TJUPT', 'HDB', 'PTsbao', 'HD-Only'].indexOf(origin_site) < 0) {
          info = if_ying_allowed();
          if (info.length) {
            if (!confirm(`转发该资源可能违反站点以下规则:\n${info.join('\n')}\n具体细节请查看站点规则页面。\n是否仍继续发布？`)) {
              e.preventDefault();
              return;
            }
          }
        }

// --- From Module: 16_origin_site_parsing3.js (Snippet 18) ---
else if (origin_site == 'TTG') {
      $('.forward_a').click(function (e) {
        e.preventDefault();
        if (if_exclusive && search_mode) {
          return;
        }
        if (search_mode == 0) {
          window.open(this.href, '_blank');
          return;
        }
        raw_info.descr = '';
        descr = document.getElementById('kt_d');
        descr_box = descr.cloneNode(true);
        raw_info.descr = walkDOM(descr_box);
        raw_info.descr = add_thanks(raw_info.descr);

        var reg_img = raw_info.descr.match(/\[img\]http(s*):\/\/totheglory.im\/pic\/ico_(free|half|30).gif\[\/img\].*/i);
        if (reg_img) {
          raw_info.descr = raw_info.descr.replace(reg_img[0], '');
        }
        //替换官种简介顺序
        var reg_source = raw_info.descr.match(/\[color=.*?\]\.Comparisons[\s\S]*(thumb\.png|ajax-loader\.gif)\[\/img\]\[\/url\][\s\S]*?\[\/quote\]/im);
        if (reg_source) {
          reg_source = reg_source[0];
          raw_info.descr = raw_info.descr.replace(reg_source, '');
          if (reg_source.match(/\[size=3\].*\[\/size\]/)) {
            var tmp_name = reg_source.match(/\[size=3\].*\[\/size\]/)[0];
            reg_source = reg_source.split(tmp_name);
            reg_source[0] = reg_source[0].replace(/http/g, 'https').replace(/httpss/g, 'https');
            reg_source = tmp_name + reg_source[1] + '\n\n' + reg_source[0];
          }
          raw_info.descr = raw_info.descr + reg_source;
          raw_info.descr = raw_info.descr.replace(/\n{3,5}/ig, '\n\n');
        }

        if (raw_info.images.length > 0) {
          raw_info.descr += $('#textarea').val();
        }

        var _id = this.id;
        var _href = this.href;
        re_forward(_id, _href, raw_info);
      });
    }

// --- From Module: 16_origin_site_parsing3.js (Snippet 19) ---
if (origin_site == 'TTG') {
        descr = document.getElementById('kt_d');
        descr_box = descr.cloneNode(true);
        raw_info.descr = walkDOM(descr_box);
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 20) ---
else if (forward_site == "TTG") {
        upload_site = upload_site.replace('viewoffers.php', 'offer.php');
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 21) ---
else if (raw_info.type == '电影' && ['HUDBT', 'MTeam', 'TLFbits', 'PuTao', 'TJUPT', 'NanYang', 'BYR', 'TTG'].indexOf(forward_site) < 0) {
        raw_info.type = '动漫';
      }

// --- From Module: 17_forward_site_filling1.js (Snippet 22) ---
else if (forward_site == 'TTG') {
          raw_info.name = raw_info.name.replace(/(5\.1|2\.0|7\.1|1\.0)/, function (data) {
            return data.replace('.', '{@}');
          });
          raw_info.name = raw_info.name.replace(/h\.(26(5|4))/i, 'H{@}$1');
          $('input[name=subtitle]').val(raw_info.small_descr.trim());
          allinput[i].value = raw_info.name;
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 23) ---
if (forward_site == 'TTG' && raw_info.dburl) {
          allinput[i].value = raw_info.dburl.match(/\d+/)[0];
        }

// --- From Module: 17_forward_site_filling1.js (Snippet 24) ---
if (forward_site == 'TTG') {
      setTimeout(function () {
        descr_box[0].value = descr_box[0].value.replace(/http:\/\/anonym\.to\/\?/ig, '');
      }, 2000);
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 25) ---
if (forward_site == 'TTG') {
      var anonymity = if_uplver ? "option[value='yes']" : "option[value='no']";
      $("select[name='anonymity']").find(anonymity).attr("selected", true);
    }

// --- From Module: 18_forward_site_filling2.js (Snippet 26) ---
else if (forward_site == 'TTG') {
      var browsecat = $('select[name="type"]');
      switch (raw_info.type) {
        case '电影':
          if (raw_info.medium_sel == 'Blu-ray') {
            browsecat.val(54)
          } else if (raw_info.medium_sel == 'UHD') {
            browsecat.val(109);
          } else if (raw_info.medium_sel == 'DVD' || raw_info.medium_sel == 'DVDRip') {
            browsecat.val(51);
          } else {
            if (raw_info.standard_sel == '720p') {
              browsecat.val(52);
            } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i') {
              browsecat.val(53);
            } else if (raw_info.standard_sel == '4K') {
              browsecat.val(108);
            }
          }
          break;

        case '纪录':
          if (raw_info.medium_sel == 'Blu-ray' || raw_info.medium_sel == 'UHD') {
            browsecat.val(67);
          } else {
            if (raw_info.standard_sel == '720p') {
              browsecat.val(62);
            } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i') {
              browsecat.val(63);
            } else if (raw_info.standard_sel == '4K') {
              browsecat.val(108);
            }
          }
          break;
        case '剧集':
          switch (raw_info.source_sel) {
            case '大陆': case '台湾': case '香港': case '港台':
              if (raw_info.name.match(/(complete|S\d{2}[^E])/i) && (!raw_info.name.match(/E\d{2,3}/i))) {
                browsecat.val(90);
              } else {
                if (raw_info.standard_sel == '720p') {
                  browsecat.val(76);
                } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i') {
                  browsecat.val(75);
                }
              }
              break;
            case '日本':
              if (raw_info.name.match(/(complete|S\d{2}[^E])/i)) {
                browsecat.val(88);
              } else {
                browsecat.val(73);
              }
              break;
            case '韩国':
              if (raw_info.name.match(/(complete|S\d{2}[^E])/i)) {
                browsecat.val(99);
              } else {
                browsecat.val(74);
              }
              break;
            case '欧美':
              if (raw_info.name.match(/(S\d{2}E\d{2})/i)) {
                if (raw_info.standard_sel == '720p') {
                  browsecat.val(69);
                } else if (raw_info.standard_sel == '1080p' || raw_info.standard_sel == '1080i') {
                  browsecat.val(70);
                }
              } else {
                browsecat.val(87);
              }
              break;
          }
          if (raw_info.standard_sel == '4K') {
            browsecat.val(108);
          }
          break;
        case '综艺':
          if (raw_info.source_sel == '日本') {
            browsecat.val(101);
          } else if (raw_info.source_sel == '韩国') {
            browsecat.val(103);
          } else {
            browsecat.val(60);
          }
          break;
        case '动漫':
          browsecat.val(58);
          if (raw_info.descr.match(/mpls/i)) { browsecat.val(111); }
          break;
        case '音乐': browsecat.val(83); break;
        case 'MV': browsecat.val(59); break;
        case '体育': browsecat.val(57); break;
        case '软件': browsecat.val(95); break;
        case '学习': browsecat.val(94); break;
        case '书籍': browsecat.val(56);
      }

      if (raw_info.name.match(/(pad$|ipad)/i)) {
        browsecat.val(92);
      }
      if (raw_info.url != '') {
        $("input[name='imdb_c']").val(raw_info.url.match(/tt\d+/i));
      }
    }

// --- From Module: 22_additional_handlers2.js (Snippet 27) ---
if (raw_info.origin_site == 'TTG' && raw_info.name.match(/wiki$/i)) {
                        urls_append += '[comparison=Source, Encode]\n';
                        for (var i = 0; i <= new_urls.length - 2; i += 2) {
                          urls_append += `${new_urls[i]} ${new_urls[i + 1]}\n`
                        }
                        urls_append += '[/comparison]';
                        for (var i = 1; i <= (new_urls.length > 5 ? 5 : new_urls.length); i += 2) {
                          urls_append += `\n${new_urls[i]}`
                        }
                        origin_str = origin_str.substring(0, origin_str.search(raw_info.images[0]) - 5) + urls_append;
                      }

// --- From Module: 22_additional_handlers2.js (Snippet 28) ---
else if (item.match(/tu.totheglory.im/)) {
          item = item.replace(/_thumb.png/, '.png');
        }

