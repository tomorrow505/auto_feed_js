function add_search_urls(container, imdbid, imdbno, search_name, mode) {
  var div_style = 'align="center" style="border: 1px solid blue;"';
  var text = '快速搜索：';
  var brs = '</br></br>';
  var font_color = 'red';
  var font_size = '';
  if (mode == 1) {
    div_style = ''; font_color = 'green'; text = ''; brs = '</br>';
function init_buttons_for_transfer(container, site, mode, raw_info) {
  //imdb框
  var input_box = document.createElement('input');
  input_box.type = "text";
  input_box.className = "input";
  input_box.id = "input_box";
  input_box.value = raw_info.url;
  if (!raw_info.url && raw_info.dburl) {
    input_box.value = raw_info.dburl;
  }

// [Site Logic: PTP]
// [Site Logic: Bhd]
    input_box.style.width = '280px';
  }
// [Site Logic: Torrentleech]
  container.appendChild(input_box);

  var search_button = document.createElement("input");
  search_button.type = "button";
  search_button.style.marginLeft = '12px';
  search_button.style.marginRight = '4px';
  search_button.value = "检索名称";
  search_button.id = 'search_button';
  container.appendChild(search_button);

  var checkBox = document.createElement("input");
  checkBox.setAttribute("type", "checkbox");
  checkBox.setAttribute("id", 'douban_api');
  var douban_text = document.createTextNode('API');
  container.append(checkBox);
  container.append(douban_text);

  var ptgen_button = document.createElement("input");
  ptgen_button.type = "button";
  ptgen_button.style.marginLeft = '12px';
  ptgen_button.value = "ptgen跳转";
  ptgen_button.id = 'ptgen_button';
  container.appendChild(ptgen_button);

  var douban_button = document.createElement("input");
  douban_button.type = "button";
  douban_button.value = "点击获取";
  douban_button.id = 'douban_button';
  douban_button.style.marginLeft = '12px';
  container.appendChild(douban_button);

// [Site Logic: ZHUQUE]

// [Site Logic: Ttg]

// [Site Logic: Hdb]

// [Site Logic: In]
    checkBox.disabled = true;
  }

  // 上下结构
  if (mode == 1) {
    container.align = 'center';
    //匹配站点样式，为了美观
// [Site Logic: Mtv]
// [Site Logic: Btn]
// [Site Logic: Gpw]
// [Site Logic: HDOnly]
// [Site Logic: Btn]
  } else {
// [Site Logic: Hdoli]
// [Site Logic: Torrentleech]
// [Site Logic: Bhd]
// [Site Logic: Tik]
  }

// [Site Logic: Ttg]

  //把白框换个颜色
// [Site Logic: Hdoli]

// [Site Logic: Torrentleech]
}

function set_jump_href(raw_info, mode) {
  if (mode == 1) {
    for (key in used_site_info) {
      if (used_site_info[key].enable) {
// [Site Logic: Acm]
// [Site Logic: 纪录]
// [Site Logic: Acm]
// [Site Logic: Hdcity]
// [Site Logic: Byr]
// [Site Logic: 剧集]
// [Site Logic: 综艺]
// [Site Logic: Byr]
// [Site Logic: 纪录]
// [Site Logic: 剧集]
// [Site Logic: Blu]
// [Site Logic: 剧集]
// [Site Logic: Tik]
// [Site Logic: Cnz]
// [Site Logic: Hdspace]
// [Site Logic: ZHUQUE]
// [Site Logic: Yemapt]
// [Site Logic: Mteam]
// [Site Logic: 影]
// [Site Logic: Fnp]
          forward_url = used_site_info[key].url + 'upload.php';
// [Site Logic: Mtv]
        }
        jump_str = dictToString(raw_info);
        document.getElementById(key).href = forward_url + separator + encodeURI(jump_str);
      }
    }
  } else {
    var search_name = get_search_name(raw_info.name);
    if (raw_info.url) {
      var url = raw_info.url.match(/tt\d+/)[0];
      for (key in used_site_info) {
        if (used_site_info[key].enable) {
// [Site Logic: Ttg]
// [Site Logic: Hdroute]
// [Site Logic: Gpw]
// [Site Logic: Sc]
// [Site Logic: Hdb]
// [Site Logic: Mtv]
// [Site Logic: Bhd]
// [Site Logic: Nbl]
// [Site Logic: Ant]
// [Site Logic: Uhd]
// [Site Logic: Kg]
// [Site Logic: Hdspace]
// [Site Logic: Cnz]
// [Site Logic: Its]
// [Site Logic: Mteam]
// [Site Logic: Tvv]
// [Site Logic: Fnp]
            forward_url = used_site_info[key].url + 'torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={url}&search_area=4&search_mode=0'.format({ 'url': url });
          }
          try { document.getElementById(key).href = forward_url; } catch (err) { }
        }
      }
    } else {
      for (key in used_site_info) {
        if (used_site_info[key].enable) {
// [Site Logic: Opencd]
            search_name = get_search_name(raw_info.name);
          }
// [Site Logic: Ttg]
// [Site Logic: Hdroute]
// [Site Logic: Gpw]
// [Site Logic: Nbl]
// [Site Logic: Ant]
// [Site Logic: Cnz]
// [Site Logic: Mtv]
// [Site Logic: Its]
// [Site Logic: Tvv]
// [Site Logic: Kg]
// [Site Logic: Sc]
// [Site Logic: Hdb]
// [Site Logic: Opencd]
// [Site Logic: Ops]
// [Site Logic: Red]
// [Site Logic: Mteam]
// [Site Logic: Tik]
            forward_url = used_site_info[key].url + 'torrents.php?incldead=0&spstate=0&inclbookmarked=0&search={name}&search_area=0&search_mode=0'.format({ 'name': search_name });
          }
          try { document.getElementById(key).href = forward_url; } catch (err) { }
        }
      }
    }
  }
}
