var used_site_info = GM_getValue('used_site_info');
var if_new_site_added = false;
if (used_site_info === undefined) {
  used_site_info = default_site_info;
  GM_setValue('used_site_info', JSON.stringify(used_site_info));
} else {
  //预防有新加的站点没有加上的。
  used_site_info = JSON.parse(used_site_info);
  for (key in default_site_info) {
    if (!used_site_info.hasOwnProperty(key)) {
      used_site_info[key] = default_site_info[key];
      if_new_site_added = true;
// [Site Logic: Mteam]
    if (site_order.indexOf(key) < 0) {
      site_order.push(key);
    }
  }
  for (key in used_site_info) {
    if (!default_site_info.hasOwnProperty(key)) {
      delete used_site_info[key];
      if (site_order.indexOf(key) >= 0) {
        site_order = site_order.filter(function (item) {
          return item != key;
        });
      }
      if_new_site_added = true;
    }
  }
  site_order = site_order.filter(function (item) {
    if (!default_site_info.hasOwnProperty(item)) {
      return false;
    } else {
      return true;
    }
  });
}
if (if_new_site_added) {
  GM_setValue('used_site_info', JSON.stringify(used_site_info));
  GM_setValue('site_order', JSON.stringify(site_order.join(',')));
}

// 修正北洋、铂金和皇后有www和不带www两个域名。