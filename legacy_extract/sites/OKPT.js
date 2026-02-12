/** Consolidated Logic for: OKPT **/

// --- From Module: 17_forward_site_filling1.js (Snippet 1) ---
case 'OKPT':
          if (labels.gy) { check_label(document.getElementsByName('tags[4][]'), '5'); }
          if (labels.en) { check_label(document.getElementsByName('tags[4][]'), '57'); }
          if (labels.yy) { check_label(document.getElementsByName('tags[4][]'), '45'); }
          if (labels.zz) { check_label(document.getElementsByName('tags[4][]'), '6'); }
          if (labels.yz) { check_label(document.getElementsByName('tags[4][]'), '58'); }
          if (labels.diy) { check_label(document.getElementsByName('tags[4][]'), '4'); }
          if (labels.complete) {
            check_label(document.getElementsByName('tags[4][]'), '51');
          } else if (raw_info.name.match(/[\d ]E\d+[ \.]/)) {
            check_label(document.getElementsByName('tags[4][]'), '50');
          }
          if (labels.hdr10 || labels.hdr10plus) { check_label(document.getElementsByName('tags[4][]'), '7'); }
          if (labels.db) { check_label(document.getElementsByName('tags[4][]'), '8'); }
          if (raw_info.small_descr.match(/特效字幕/)) { check_label(document.getElementsByName('tags[4][]'), '12'); }
          if (raw_info.descr.match(/Dolby.*?Atmos/) || $('textarea[name="technical_info"]').val().match(/Dolby.*?Atmos/)) {
            check_label(document.getElementsByName('tags[4][]'), '53');
          }
          break;

