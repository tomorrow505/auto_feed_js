/** Consolidated Logic for: HDChina **/

// --- From Module: 09_data_processing.js (Snippet 1) ---
else if (item.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
        item = item.replace(/th.png/, 'png').replace(/md.png/, 'png');
      }

// --- From Module: 14_origin_site_parsing1.js (Snippet 2) ---
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

// --- From Module: 22_additional_handlers2.js (Snippet 3) ---
else if (item.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
          item = item.replace(/th.png/, 'png').replace(/md.png/, 'png');
        }

