function transmissionRequest(rpcUrl, username, password, base64, path, tag, skip_checking) {
  let sessionId = "";
  let data = {
    method: "torrent-add",
    arguments: {
      'metainfo': base64,
      'download-dir': path,
      'labels': tag,
      'skip-verify': skip_checking
    }
  };
  return new Promise((resolve, reject) => {
    const headers = {
      "Content-Type": "application/json",
      "X-Transmission-Session-Id": sessionId,
      "Authorization": "Basic " + btoa(username + ":" + password)
    };
    GM_xmlhttpRequest({
      method: "POST",
      url: rpcUrl,
      headers,
      data: JSON.stringify(data),
      onload: function (res) {
        // 先带用户名和密码获取sessionID，409返回sessionID
        console.log(res);
        if (res.status === 409) {
          const newSessionId = res.responseHeaders.match(/X-Transmission-Session-Id:\s*(.+)/i);
          if (newSessionId) { sessionId = newSessionId[1].trim(); }
          // 获取sessionID，添加种子
          GM_xmlhttpRequest({
            method: "POST",
            url: rpcUrl,
            headers: {
              ...headers,
              "X-Transmission-Session-Id": sessionId
            },
            data: JSON.stringify(data),
            onload: function (res2) {
              let result = JSON.parse(res2.responseText);
              if (result.result == 'success') {
                var $alertBox = $('#autoDismissAlert');
                $alertBox.fadeIn(400);
                setTimeout(function () {
                  $alertBox.fadeOut(600, function () {
                    $(this).remove();
                  });
                }, 2000);
              }
              resolve(result);
            },
            onerror: reject
          });
        } else {
          resolve(JSON.parse(res.responseText));
        }
      },
      onerror: function (res) {
        console.log(res);
        if (res.status === 408) {
          alert('请求超时，请检查服务器是否已经打开！');
        }
        reject
      }
    });
  });
}

function qbittorrentRequest(host, path, parameters) {
  var data = null, headers = {}, info = '添加种子';
  if (path == '/auth/login') {
    headers = { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" };
    data = new URLSearchParams(parameters).toString();
    info = '登录';
  } else {
    data = parameters;
  }
  const endpoint = 'api/v2';
  var alerted = false;
  return new Promise((resolve, reject) => {
    GM_xmlhttpRequest({
      method: 'POST',
      url: `${host}${endpoint}${path}`,
      data: data,
      headers: headers,
      onload: function (response) {
        if (response.responseText !== "Ok." && !alerted) {
          alert(`${info}请求错误，请检查qb状态和种子是否重复以及链接是否能正常下载种子。`);
          alerted = true;
          reject(response);
        } else {
          if (path == '/torrents/add') {
            var $alertBox = $('#autoDismissAlert');
            $alertBox.fadeIn(400);
            setTimeout(function () {
              $alertBox.fadeOut(600, function () {
                $(this).remove();
              });
            }, 2000);
          }
          resolve(`${info}成功！`);
        }
      },
      onerror: function (error) {
        reject(`${info}失败， ${error}！`);
      }
    });
  })
}

function get_torrentfile(path, category, skip_checking, server, callback) {
  if (server == 'qb') {
    GM_xmlhttpRequest({
      method: "GET",
      url: raw_info.torrent_url,
      responseType: "blob",
      onload: (xhr) => {
        const blob = xhr.response;
        const torrentFile = new File([blob], raw_info.torrent_name, { type: "application/x-bittorrent" });
        const formData = new FormData();
        const siteUpLimits = {
          'CMCT': 134217728,
          'Audiences': 131072000
        };
        if (siteUpLimits[raw_info.origin_site]) {
          formData.append('upLimit', siteUpLimits[raw_info.origin_site]);
        }
        formData.append('torrents', torrentFile);
        formData.append('savepath', path);
        formData.append('category', category);
        formData.append('skip_checking', skip_checking);
        callback(formData);
      },
      onerror: (res) => {
        console.error("Torrent download failed:", res);
      }
    });
  } else {
    GM_xmlhttpRequest({
      method: "GET",
      url: raw_info.torrent_url,
      responseType: "arraybuffer",
      onload: function (xhr) {
        const arrayBuffer = xhr.response;
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        const base64Data = btoa(binary);
        callback(base64Data);
      }
    });
  }
}

async function download_to_server_by_file(host, username, pwd, path, tag, skip_checking, server) {
  get_torrentfile(path, tag, skip_checking, server, function (formData) {
    if (server == 'qb') {
      qbittorrentRequest(host, '/auth/login', { username: username, password: pwd })
        .then(login_info => {
          console.log(login_info);
          return qbittorrentRequest(host, '/torrents/add', formData);
        }).then(info => {
          console.log(info);
        });
    } else {
      transmissionRequest(host +
        'transmission/rpc', username, pwd, formData, path, [tag], skip_checking);
    }
  });
}

function dialogBox(yesCallback, noCallback) {
  // 显示遮罩和对话框
  $('.wrap-dialog0').removeClass("hide").addClass("show");;
  // 确定按钮
  $('#confirm').click(function () {
    $('.wrap-dialog0').addClass("hide");
    yesCallback();
  });
  // 取消按钮
  $('#cancel').click(function () {
    $('.wrap-dialog0').addClass("hide");
    noCallback();
  });
  // 新增关闭按钮事件绑定
  $('.close-btn').click(function () {
    $('.wrap-dialog0').addClass("hide");
  });
}

function init_remote_server_button() {
  GM_addStyle(`
        /* 遮罩层样式 */
        .wrap-dialog0 {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(4px); /* 毛玻璃效果 */
            z-index: 999;
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            visibility: hidden;
            transition: all 0.3s ease;
        }

        .wrap-dialog0.show {
            opacity: 1;
            visibility: visible;
        }

        /* 对话框容器 */
        .dialog0 {
            width: 90%;
            max-width: 300px;
            background: white;
            border-radius: 16px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
            transform: scale(0.95);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            overflow: hidden;
        }

        .wrap-dialog0.show .dialog0 {
            transform: scale(1);
        }

        /* 标题栏样式 */
        .dialog-header0 {
            padding: 6px 8px;
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            display: flex;
            align-items: center;
            gap: 12px;
            position: relative;
        }

        .dialog-title0 {
            color: white;
            font-size: 16px;
            font-weight: 600;
            margin: 5;
        }

        /* 关闭按钮样式 */
        .close-btn {
            position: absolute;
            right: 16px;
            top: 50%;
            transform: translateY(-50%);
            width: 24px;
            height: 24px;
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 50%;
            backdrop-filter: blur(4px);
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-50%) rotate(90deg);
        }

        .close-btn::after {
            content: "×";
            color: white;
            font-size: 20px;
            line-height: 1;
        }

        /* 内容区域样式 */
        .dialog-body0 {
            padding: 18px;
            line-height: 1.2;
            color: #333;
            font-size: 15px;
            min-height: 40px;
            display: flex;
            align-items: center;
            border-bottom: 1px solid #f0f0f0;
        }

        /* 按钮组样式 */
        .dialog-footer0 {
            padding: 12px 25px;/* 进一步缩小内边距 */
            display: flex;
            justify-content: center;
            background: white;
        }

        /* 通用按钮样式 */
        .qb-btn {
            border: none;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 14px;
            font-weight: 500;
            min-width: 80px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            padding: 6px 10px;  /* 修改上下内边距 */
            min-height: 30px;    /* 新增最小高度 */
            line-height: 1.0;    /* 新增行高控制 */
        }

        /* 确认按钮 */
        #confirm {
            background: linear-gradient(135deg, #6e8efb, #a777e3);
            color: white;
            box-shadow: 0 4px 6px rgba(103, 119, 239, 0.2);
        }

        #confirm:hover {
            box-shadow: 0 6px 8px rgba(103, 119, 239, 0.3);
            transform: translateY(-1px);
        }

        /* 取消按钮 */
        #cancel {
            background: #e6f0ff;   /* 基础色 */
            color: #4a90e2;        /* 标题色 */
            border: 1px solid #c1d7f5;
            margin-left: 15px;
            &:hover {
                background: #d4e6ff;
                border-color: #99c2ff;
            }
        }

        /* 按钮点击效果 */
        .btn:active {
            transform: translateY(0);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        /* 隐藏类样式 */
        .hide {
            display: none !important;
        }

        /* 辅助样式 */
        .ml50 {
            margin-left: 50px;
        }

        #autoDismissAlert {
            position: fixed; /* Stays in place even if the user scrolls */
            top: 5%;
            left: 50%;
            transform: translate(-50%, -50%); /* Centers the element perfectly */
            background-color: #4CAF50; /* Green background for success/info */
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */
            z-index: 1000; /* Ensures it's on top of most other content */
            font-family: Arial, sans-serif;
            font-size: 14px;
            text-align: center;
        }

        #sidebar {
            position: fixed;
            top: 50%;
            right: 5px;
            transform: translateY(-50%);
            width: 70px;
            background-color: #2c3e50; /* Darker, modern primary color */
            border: none; /* Remove border for a cleaner look */
            border-radius: 8px 8px 8px 8px;
        }

        .sidebar-header {
            color: #ecf0f1;
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            font-size: 12px;
            font-weight: 600;
            text-align: center;
            padding: 8px 0;
            margin-bottom: 5px;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }

        .download-icon {
            font-size: 18px;
            margin-top: 2px;
        }

        #sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar li {
            list-style: none;
            padding: 0;
            margin: 0;
            width: 100%;
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar ul li:first-child a {
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar ul li:last-child a {
            border-radius: 8px 8px 8px 8px;
        }

        #sidebar li a {
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 15px 10px;
            text-decoration: none;
            color: #ecf0f1; /* Lighter text for contrast */
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; /* Modern font stack */
            font-size: 14px;
            font-weight: 500; /* Slightly bolder for readability */
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out; /* Smooth transitions */
            gap: 8px; /* Add some space between icon and text if you add one */
        }

        #sidebar li a:hover {
            background-color: #34495e;
        }

        #sidebar .submenu {
            display: none;
            position: absolute;
            left: -100%;
            width: 70px;
            background-color: #34495e; /* Slightly different shade for submenu */
            border: none;
            border-radius: 8px 8px 8px 8px; /* Match main sidebar */
            box-shadow: -4px 0 10px rgba(0, 0, 0, 0.15); /* Subtler shadow for submenu */
            z-index: 10; /* Ensure submenu is above other content */
        }

        #sidebar li:hover .submenu {
            display: block;
        }

        #sidebar .submenu li a {
            display: flex;
            justify-content: center;
            align-items: center;
            color: #bdc3c7; /* Even lighter text for submenu items */
            padding: 12px 10px; /* Slightly less padding than main items */
            font-size: 13px; /* Slightly smaller font */
            transition: background-color 0.2s ease-in-out, color 0.2s ease-in-out;
        }

        #sidebar .submenu li a:hover {
            background-color: #4a6781; /* Distinct hover for submenu */
            color: #ecf0f1; /* White text on hover for contrast */
        }
    `);
  $('body').append(`
        <div id="sidebar">
            <div class="sidebar-header">
                <span>远程推送</span>
                <div class="download-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="20" viewBox="0,0,256,256">
                        <g transform=""><g fill="none" fill-rule="nonzero" stroke="none" stroke-width="none" stroke-linecap="butt" stroke-linejoin="none" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><path transform="scale(5.12,5.12)" d="M50,32c0,4.96484 -4.03516,9 -9,9h-30c-6.06641,0 -11,-4.93359 -11,-11c0,-4.97266 3.32422,-9.30469 8.01563,-10.59375c0.30859,-6.34375 5.56641,-11.40625 11.98438,-11.40625c4.01953,0 7.79688,2.05469 10.03516,5.40625c0.96875,-0.27344 1.94531,-0.40625 2.96484,-0.40625c5.91016,0 10.75,4.6875 10.98828,10.54297c3.52734,1.19141 6.01172,4.625 6.01172,8.45703z" id="strokeMainSVG" fill="#2c3e50" stroke="#2c3e50" stroke-width="2" stroke-linejoin="round"></path><g transform="scale(5.12,5.12)" fill="#ffffff" stroke="none" stroke-width="1" stroke-linejoin="miter"><path d="M43.98828,23.54297c-0.23828,-5.85547 -5.07812,-10.54297 -10.98828,-10.54297c-1.01953,0 -1.99609,0.13281 -2.96484,0.40625c-2.23828,-3.35156 -6.01562,-5.40625 -10.03516,-5.40625c-6.41797,0 -11.67578,5.0625 -11.98437,11.40625c-4.69141,1.28906 -8.01562,5.62109 -8.01562,10.59375c0,6.06641 4.93359,11 11,11h30c4.96484,0 9,-4.03516 9,-9c0,-3.83203 -2.48437,-7.26562 -6.01172,-8.45703zM25,35.41406l-6.70703,-6.70703l1.41406,-1.41406l4.29297,4.29297v-11.58594h2v11.58594l4.29297,-4.29297l1.41406,1.41406z"></path></g></g></g>
                    </svg>

                </div>
            </div>
            <ul id="sidebar_ul">
            </ul>
        </div>
    `);
  $('body').append(`
        <div id="autoDismissAlert" style="display:none;">
            <p style="margin:8px 12px">种子添加成功~~</p>
        </div>
    `);
  $('body').append(`
        <div class="wrap-dialog0 hide">
            <div class="dialog0">
                <div class="dialog-header0">
                    <span class="dialog-title0">是否跳过检验？</span>
                    <button class="close-btn"></button> <!-- 新增关闭按钮 -->
                </div>
                <div class="dialog-body0">
                    <span class="dialog-message">请谨慎选择，如果因为跳检造成做假种或者下载量增加后果自负！！</span>
                </div>
                <div class="dialog-footer0">
                    <input type="button" class="qb-btn" id="confirm" value="跳过检验" />
                    <input type="button" class="qb-btn ml50" id="cancel" value="直接下载" />
                </div>
            </div>
        </div>
    `);
  var qb = remote_server.qbittorrent;
  var tr = remote_server.transmission;
  for (let server in qb) {
    $('#sidebar_ul').append(`<li class="menu-item" id=${server}><a href="${qb[server].url}" target="_blank" title="${qb[server].url}">Q-${server}</a><ul class="submenu" id="ul_${server}"></ul></li>`);
    for (let path in qb[server].path) {
      $(`#ul_${server}`).append(`<li><a href="#" path=${qb[server].path[path]} class="qb_download" title="${qb[server].path[path]}">${path}</a></li>`);
    }
  }
  for (let server in tr) {
    $('#sidebar_ul').append(`<li class="menu-item" id=${server}><a href="${tr[server].url}" target="_blank" title="${tr[server].url}">T-${server}</a><ul class="submenu" id="ul_${server}"></ul></li>`);
    for (let path in tr[server].path) {
      $(`#ul_${server}`).append(`<li><a href="#" path=${tr[server].path[path]} class="tr_download" title="${tr[server].path[path]}">${path}</a></li>`);
    }
  }
  $('.qb_download').click(e => {
    e.preventDefault();
    server = $(e.target).parent().parent().parent().attr('id');
    path = $(e.target).attr('path');
    url = qb[server].url;
    username = qb[server].username;
    pwd = qb[server].password;
    tag = $(e.target).text();
    dialogBox(
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, true, 'qb');
      },
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, false, 'qb');
      }
    );
  });
  $('.tr_download').click(e => {
    e.preventDefault();
    server = $(e.target).parent().parent().parent().attr('id');
    path = $(e.target).attr('path');
    url = tr[server].url;
    username = tr[server].username;
    pwd = tr[server].password;
    tag = $(e.target).text();
    dialogBox(
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, true, 'tr');
      },
      function () {
        download_to_server_by_file(url, username, pwd, path, tag, false, 'tr');
      }
    );
  });
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    const submenu = item.querySelector('.submenu');
    if (!submenu) return;
    item.addEventListener('mouseenter', function (e) {
      const rect = item.getBoundingClientRect();
      submenu.style.display = 'block';
      submenu.style.position = 'fixed';
      var element = document.getElementById('sidebar');
      const height = element.offsetHeight;
      submenu.style.top = `${rect.top - window.innerHeight / 2 + height / 2}px`;
    });

    item.addEventListener('mouseleave', function () {
      submenu.style.display = 'none';
    });
  });
}
