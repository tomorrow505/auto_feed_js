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