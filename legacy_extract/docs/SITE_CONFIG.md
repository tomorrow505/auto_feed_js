# Site Configuration Reference

> Configuration dictionaries and constants from `auto_feed.user.js`

## Site Dictionaries Overview

| Dictionary | Lines | Count | Purpose |
|------------|-------|-------|---------|
| `default_site_info` | 964-1109 | ~100 | Forward targets (upload sites) |
| `o_site_info` | 1342-1407 | ~65 | Source-only sites (scrape sources) |
| `reg_team_name` | 1903-1946 | ~30 | Team/group recognition patterns |

---

## `default_site_info` (Lines 964-1109)

Sites that can be used as upload targets. Each entry:
```javascript
'SiteName': { 'url': 'https://.../', 'enable': 1 }
```

### Sample Entries
```javascript
'MTeam': { 'url': 'https://kp.m-team.cc/', 'enable': 1 },
'OurBits': { 'url': 'https://ourbits.club/', 'enable': 1 },
'HDSky': { 'url': 'https://hdsky.me/', 'enable': 1 },
'PTer': { 'url': 'https://pterclub.com/', 'enable': 1 },
'CHDBits': { 'url': 'https://chdbits.co/', 'enable': 1 },
'HUDBT': { 'url': 'https://hudbt.hust.edu.cn/', 'enable': 1 },
'FRDS': { 'url': 'https://pt.keepfrds.com/', 'enable': 1 },
```

### Dynamic URL Handling
Some sites have multiple domains:
```javascript
// Lines 1182-1197
if (site_url.match(/tjupt.org/)) used_site_info.TJUPT.url = site_domain;
if (site_url.match(/kp.m-team.cc/)) used_site_info.MTeam.url = 'https://kp.m-team.cc/';
```

---

## `o_site_info` (Lines 1342-1407)

Source-only sites (typically foreign trackers). Simple URL mapping:
```javascript
'SiteName': 'https://.../'
```

### Full List
```javascript
'FRDS': 'https://pt.keepfrds.com/',
'BYR': 'https://byr.pt/',
'avz': 'https://avistaz.to/',
'PHD': 'https://privatehd.to/',
'PTP': 'https://passthepopcorn.me/',
'MTV': 'https://www.morethantv.me/',
'BHD': 'https://beyond-hd.me/',
'UHD': 'https://uhdbits.org/',
'BLU': 'https://blutopia.cc/',
'Aither': 'https://aither.cc/',
'HDB': 'https://hdbits.org/',
'BTN': 'https://broadcasthe.net/',
'RED': 'https://redacted.sh/',
'U2': 'https://u2.dmhy.org/',
'KG': 'https://karagarga.in/',
'SC': 'https://secret-cinema.pw/',
'GPW': 'https://greatposterwall.com/',
'ANT': 'https://anthelion.me/',
'SpeedApp': 'https://speedapp.io/',
// ... more
```

---

## `reg_team_name` (Lines 1903-1946)

Regex patterns for recognizing team names to add credit:
```javascript
reg_team_name = {
  'MTeam': /-(.*mteam|mpad|tnp|BMDru|MWEB)/i,
  'CHDBits': /-(CHD|.*@CHDBits)|@CHDWEB/i,
  'HDSky': /-HDSky/i,
  'OurBits': /-(OurBits|OurTV|i18n|DBTV|iQIYI|COOT|OurPad)/i,
  'PTer': /-(PTer|PTERLIVE)/i,
  // ...
}
```

Used by `add_thanks()` function to append credit quotes.

---

## Search Configuration

### `default_search_list` (Lines 1232-1260)
Sites to show in search dropdown:
```javascript
['MTeam', 'CHDBits', 'HDSky', 'OurBits', 'PTer', 'HUDBT', 'TTG', 'CMCT', ...]
```

### `default_common_sites` (Line 1265)
Quick access sites in sidebar:
```javascript
['TTG', 'CMCT', 'HUDBT', 'PTer']
```

---

## API Configuration

### PTgen APIs (Line 917)
```javascript
apis = [
  'https://api.iyuu.cn/App.Movie.Ptgen',
  'https://ptgen.tju.pt/infogen'
]
```

### Image Upload Services
```javascript
used_ptp_img_key     // PTpimg API key
used_imgbox_key      // Imgbox API key
used_pixhost_upload  // Pixhost setting
```

### Download Clients (Line 937)
```javascript
remote_server = {
  type: 'transmission' | 'qbittorrent',
  url: 'http://...',
  user: '...',
  pass: '...'
}
```

---

## Country/Region Constants

### `us_ue` (Line 1272)
Western countries for source classification:
```
阿尔巴尼亚|安道尔|奥地利|...美国|加拿大|澳大利亚|新西兰...
```

### Source Categories
Used by `.get_source_sel()`:
- `欧美` — US/Europe
- `大陆` — Mainland China
- `港台` — Hong Kong/Taiwan
- `日韩` — Japan/Korea
- `其他` — Other
