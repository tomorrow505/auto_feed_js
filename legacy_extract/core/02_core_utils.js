
var site_url = decodeSiteURL();
const TIMEOUT = 6000;
const N = "\n";
var evt = document.createEvent("HTMLEvents");
evt.initEvent("change", false, true);
this.$ = this.jQuery = jQuery.noConflict(true);

jQuery.fn.wait = function (func, times, interval) {
  var _times = times || 100, //100次
    _interval = interval || 20, //20毫秒每次
    _self = this,
    _selector = this.selector, //选择器
    _iIntervalID; //定时器id
  if (this.length) { //如果已经获取到了，就直接执行函数
    func && func.call(this);
  } else {
    _iIntervalID = setInterval(function () {
      if (!_times) { //是0就退出
        clearInterval(_iIntervalID);
      }
      _times <= 0 || _times--; //如果是正数就 --
      _self = $(_selector); //再次选择
      if (_self.length) { //判断是否取到
        func && func.call(_self);
        clearInterval(_iIntervalID);
      }
    }, _interval);
  }
  return this;
}

function mutation_observer(target, func) {
  const MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
  const observer = new MutationObserver(mutationList =>
    mutationList.filter(m => m.type === 'childList').forEach(m => {
      try {
        m.addedNodes.forEach(func());
      } catch (Err) { }
    }
    ));
  observer.observe(target, { childList: true, subtree: true });
}

//---------------------------- ant-design-filler -----------------------------------
// 遍历元素属性，查找 React FiberNode
function getReactFiberNode(element) {
  for (let key in element) {
    if (key.startsWith("__reactFiber")) {
      return element[key];
    }
  }
  return null;
}

// 递归遍历 FiberNode，查找 React 组件实例对象
function getReactComponentInstance(fiberNode) {
  if (fiberNode?.stateNode && fiberNode?.stateNode.hasOwnProperty("state")) {
    return fiberNode?.stateNode;
  }
  let child = fiberNode?.child;
  while (child) {
    instance = getReactComponentInstance(child);
    if (instance) {
      return instance;
    }
    child = child.sibling;
  }
  return null;
}

var ant_form_instance = null;
var hdb_color = 'black';

// [Site Logic: HDB]

GM_addStyle(
  `.content th {
        font-weight:bold;
        color: ${hdb_color};
        background-color:transparent;
        padding:4px 10px 4px 0;
        border:0;
        vertical-align:top
    }
    .content td {
        padding:4px 20px 4px 1px
    }
    .contentlayout {
        width:100%
    }
    .contentlayout td {
        border:0;
        vertical-align:top
    }
    .contentlayout h1 {
        margin:0 0 14px 15px
    }
    .contentlayout h3 {
        margin:-14px 0 5px 15px;
        color:gray
    }`
);

/*******************************************************************************************************************
*                                          part 0 简单页面逻辑                                                       *
********************************************************************************************************************/
//修复妞站friend页面两个表列宽不等的问题
function postData(url, meta, callback) {
  GM_xmlhttpRequest({
    'method': "POST",
    'url': url,
    'headers': {
      "Content-Type": 'application/x-www-form-urlencoded; charset=UTF-8',
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36"
    },
    'data': meta,
    onload: function (response) {
      callback(response.responseText);
    }
  });
}

function getDoc(url, meta, callback) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: url,
    onload: function (responseDetail) {
      if (responseDetail.status === 200) {
        let doc = page_parser(responseDetail.responseText);
        callback(doc, responseDetail, meta);
      } else {
        callback('error', null, null);
      }
    }
  });
}

function page_parser(responseText) {
  responseText = responseText.replace(/s+src=/ig, ' data-src=');
  return (new DOMParser()).parseFromString(responseText, 'text/html');
}

function getJson(url, meta, callback) {
  GM_xmlhttpRequest({
    method: 'GET',
    url: url,
    onload: function (responseDetail) {
      if (responseDetail.status === 200 && !responseDetail.responseText.includes("<!DOCTYPE html>")) {
        let response = JSON.parse(responseDetail.responseText);
        callback(response, responseDetail, meta);
      } else {
        callback({}, responseDetail, meta);
      }
    }
  });
}

var pt_icos = GM_getValue('pt_icos');
if (pt_icos === undefined || if_new_site_added) {
  try {
    getJson('https://gitee.com/tomorrow505/auto-feed-helper/raw/master/sorted_pt_sites_icos.json', null, function (data) {
      GM_setValue('pt_icos', data.data);
      location.reload();
    });
  } catch (err) {
    GM_setValue('pt_icos', '{}');
    location.reload();
  }
} else {
  pt_icos = JSON.parse(decodeURIComponent(escape(atob(pt_icos))));
}
