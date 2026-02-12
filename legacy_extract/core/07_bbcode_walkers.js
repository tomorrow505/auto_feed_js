function add_thanks(descr) {
  const thanks_str = "[quote][b][color=blue]{site}官组作品，感谢原制作者发布。[/color][/b][/quote]\n\n{descr}";
  for (var key in reg_team_name) {
    if (raw_info.name.match(reg_team_name[key]) && !raw_info.name.match(/PandaMoon|HDSpace|HDClub|LCHD/i)) {
      descr = thanks_str.format({ 'site': key, 'descr': descr });
    }
  }
  return descr;
}

//标签及其字标签转换为字符串，主要用于获取简介等等, 根据网页树的结构，采用前序遍历递归呈现。
function walkDOM(n) {
  do {
    if (n.nodeName == 'FONT') {
      if (n.color != '') {
        n.innerHTML = '[color=' + n.color + ']' + n.innerHTML + '[/color]';
      }
      if (n.size != '') {
        n.innerHTML = '[size=' + n.size + ']' + n.innerHTML + '[/size]';
      }
      if (n.face != '') {
        n.innerHTML = '[font=' + n.face + ']' + n.innerHTML + '[/font]';
      }
    } else if (n.nodeName == 'SCRIPT') {
      n.innerHTML = '';
    } else if (n.nodeName == 'SPAN') {
      if (n.style.color != '') {
        n.innerHTML = '[color=' + rgb_2_hex(n.style.color) + ']' + n.innerHTML + '[/color]';
      }
    } else if (n.nodeName == 'U') {
      n.innerHTML = '[u]' + n.innerHTML + '[/u]';
    } else if (n.nodeName == 'A') {
      if (n.innerHTML != "" && n.href) {
function walk_cmct(n) {
  do {
    if (n.nodeName == 'SPAN') {
      if (n.style.color != '') {
        n.innerHTML = '[color=' + n.style.color + ']' + n.innerHTML + '[/color]';
      }
    } else if (n.nodeName == 'A') {
      if (n.innerHTML != "") {
        n.innerHTML = n.innerHTML;
      }
    } else if (n.nodeName == 'BR') {
      n.innerHTML = '\r\n';
    }

    if (n.hasChildNodes()) {
      walk_cmct(n.firstChild);
    } else {
      if (n.nodeType != 1) {
        raw_info.descr = raw_info.descr + n.textContent;
      }
    }
    n = n.nextSibling;
  } while (n);
  return raw_info.descr;
}

function walk_ptp(n) {
  do {
    if (n.nodeName == 'A' && n.getAttribute('onclick')) {
      if (n.getAttribute('onclick').match(/MediaInfoToggleShow|BBCode.spoiler/)) {
        n.innerHTML = '';
      } else if (n.getAttribute('onclick').match(/BBCode.ScreenshotComparisonToggleShow/)) {
        var info = n.getAttribute('onclick').match(/\[.*?\]/g);
        var item = info[0].replace(/\[|\]|"/g, '');
        var pics_text = '';
        info[1].replace(/\[|\]|"|\\/g, '').split(',').forEach((e) => {
          pics_text += `[img]${e.trim()}[/img]`;
        });
        n.innerHTML = `[comparison=${item}]\n\n${pics_text}\n\n[/comparison]`;
      }
    } else if (n.nodeName == 'A') {
      n.innerHTML = '[url=' + n.href + ']' + n.innerHTML + '[/url]';
    } else if (n.nodeName == 'TABLE') {
      n.nextSibling.innerHTML = n.nextSibling.textContent;
      n.innerHTML = '';
    } else if (n.nodeName == 'LI') {
      n.innerHTML = '　　* ' + n.textContent + '\n';
    } else if (n.nodeName == 'STRONG') {
      try {
        if (n.nextSibling.nextSibling.nextSibling.nodeName == 'BLOCKQUOTE') {
          n.nextSibling.nextSibling.nextSibling.innerHTML = `[hide=${n.textContent}]${n.nextSibling.nextSibling.nextSibling.innerHTML}[/hide]`;
          n.innerHTML = '';
          n.nextSibling.textContent = '';
          n.nextSibling.nextSibling.textContent = '';
        } else if (n.nextSibling.nextSibling.textContent == 'Show comparison') {
          n.textContent = '';
          n.nextSibling.textContent = '';
        } else {
          n.innerHTML = `[b]${n.innerHTML}[/b]`;
        }
      } catch (err) {
        n.innerHTML = `[b]${n.innerHTML}[/b]`;
      }
    } else if (n.nodeName == 'SPAN') {
      if (n.style.cssText.match(/underline/i)) {
        n.innerHTML = '[u]' + n.innerHTML + '[/u]';
      } else {
        n.innerHTML = n.innerHTML;
      }
    } else if (n.nodeName == 'IMG') {
      n.innerHTML = '[img]' + n.src + '[/img]';
    } else if (n.nodeName == 'BLOCKQUOTE' && n.textContent.match(/general|Disc Title|DISC INFO|mpls/i)) {
      n.innerHTML = `[quote]${n.innerHTML}[/quote]`;
    }

    if (n.hasChildNodes()) {
      walk_ptp(n.firstChild);
    } else {
      if (n.nodeType != 1) {
        raw_info.descr = raw_info.descr + n.textContent;
      }
    }
    n = n.nextSibling;
  } while (n);
  return raw_info.descr;
}

function deal_img_350(pic_info) {
  var imgs = pic_info.match(/\[img\].*?(jpg|png).*?\[\/img\]/g);
  if (imgs) {
    imgs.map((item) => {
      var img_url = item.match(/http.*?(png|jpg)/)[0];
// [Site Logic: PTP]
    })
  }
  return pic_info;
}

function deal_img_350_ptpimg(pic_info) {
  var imgs = pic_info.match(/\[img\].*?(jpg|png).*?\[\/img\]/g);
  if (imgs) {
    imgs.map((item) => {
      var img_url = item.match(/http.*?(png|jpg)/)[0];
// [Site Logic: PTP]
    })
  }
  return pic_info;
}

//标签节点连带转换成字符串
function domToString(node) {
  var tmpNode = document.createElement('div');
  tmpNode.appendChild(node);
  var str = tmpNode.innerHTML;
  tmpNode = node = null; // 解除引用，以便于垃圾回收
  return str;
}

//方便进行判断是否是源站点，不然太长了,属于源站点进入逻辑业务层
function judge_if_the_site_as_source() {