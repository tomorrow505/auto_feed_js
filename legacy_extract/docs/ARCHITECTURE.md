# Auto Feed Script Architecture

> Code structure map for `auto_feed.user.js` (30,912 lines)

## Quick Reference

- **[Site Modules](../sites/)**: Consolidated logic for 79 sites.
- **[Core Modules](../core/)**: Split functional modules of the common core.
- **[Utilities Guide](UTILITIES.md)**: Reference for shared functions.
- **[Site Config](SITE_CONFIG.md)**: Metadata on site dictionaries.

---

## Header & Metadata
**Lines 1-115**

UserScript header with GM metadata:
- `@match` rules for 150+ sites
- `@grant` permissions: `GM_xmlhttpRequest`, `GM_setValue`, `GM_getValue`, etc.

## Core Utilities
**Lines 151-700**

### DOM Helpers (151-225)
```
decodeSiteURL()         L:151  - URL normalization
wait(func, times, int)  L:164  - Poll until element appears
mutation_observer()     L:188  - MutationObserver wrapper
getReactFiberNode()     L:202  - React integration for Ant Design
```

### Data Fetchers (337-525)
```
get_bgmdata(url, func)  L:337  - Bangumi API client
get_group_name()        L:385  - Team/group name extraction
getFiletype(file)       L:519  - File extension detection
getImage(url)           L:526  - Image blob fetcher
```

### DOM Walkers (1959-2175)
```
walkDOM(n)              L:1959 - General BBCode converter
walk_cmct(n)            L:2089 - CMCT-specific walker
walk_ptp(n)             L:2115 - PTP-specific walker
domToString(node)       L:2205 - DOM to HTML string
```

## Configuration Data
**Lines 917-1270**

### User Settings (917-965)
```javascript
apis                    L:917  - PTgen API endpoints
used_ptp_img_key        L:923  - Image upload API keys
remote_server           L:937  - Download client config
extra_settings          L:948  - Feature toggles
```

### Site Dictionaries

#### `default_site_info` (Lines 964-1109)
Forward target sites - 100+ entries:
```javascript
{
  'MTeam': { 'url': 'https://kp.m-team.cc/', 'enable': 1 },
  'OurBits': { 'url': 'https://ourbits.club/', 'enable': 1 },
  // ...
}
```

#### `o_site_info` (Lines 1342-1407)
Source-only sites (foreign trackers) - 60+ entries:
```javascript
{
  'PTP': 'https://passthepopcorn.me/',
  'HDB': 'https://hdbits.org/',
  // ...
}
```

#### Team Recognition (Lines 1903-1946)
```javascript
reg_team_name = {
  'MTeam': /-(.*mteam|mpad|tnp|BMDru|MWEB)/i,
  'CHDBits': /-(CHD|.*@CHDBits)|@CHDWEB/i,
  // ...
}
```

## Site & Type Detection
**Lines 1870-2350**

```
find_origin_site(url)           L:1870 - Identify site from URL
add_thanks(descr)               L:1948 - Add team credit quote
judge_if_the_site_as_source()   L:2214 - Is current page a source?
judge_if_the_site_in_domestic() L:2338 - Is site domestic (Chinese)?
deal_with_title(title)          L:2353 - Title normalization
deal_with_subtitle(subtitle)    L:2380 - Subtitle cleanup
```

## Encoding Parsers
**Lines 2433-2700**

String prototype extensions for media attribute detection:
```
String.prototype.medium_sel()      L:2434 - WEB-DL/Remux/Blu-ray/Encode
String.prototype.codec_sel()       L:2464 - H264/H265/VC-1/MPEG-2
String.prototype.audiocodec_sel()  L:2494 - DTS-HDMA/TrueHD/Atmos/AC3
String.prototype.standard_sel()    L:2540 - 4K/1080p/720p/SD
String.prototype.get_type()        L:2621 - 电影/剧集/动漫/纪录/音乐
```

## MediaInfo Processing
**Lines 2700-3270**

```
get_small_descr_from_descr()          L:2710 - Extract subtitle from description
get_source_sel_from_descr()           L:2741 - Region detection from description
get_mediainfo_picture_from_descr()    L:3002 - Parse mediainfo and screenshots
fill_raw_info(raw_info, forward)      L:3066 - Complete missing torrent metadata
check_label(nodes, value)             L:3269 - Checkbox helper
```

## UI Components
**Lines 3278-3560**

```
init_buttons_for_transfer()   L:3278 - Create transfer UI (input, buttons)
```

Creates: IMDB input box, search button, PTgen button, Douban button, image tools.

## Download Client Integration
**Lines 3558-3900**

```
transmissionRequest()         L:3558 - Transmission RPC
qbittorrentRequest()          L:3625 - qBittorrent Web API
get_torrentfile()             L:3667 - Download torrent file
download_to_server_by_file()  L:3713 - Push to client
```

## Part 3: Source Parsing
**Lines ~10500-15000**

Blocks matching: `if (origin_site == 'SiteName') { ... }`

Extracts from source torrent pages:
- Title, subtitle
- Description (BBCode)
- IMDB/Douban links
- MediaInfo
- Screenshots
- Download link

## Part 5: Target Filling
**Lines ~4500-10500**

Blocks matching: `if (forward_site == 'SiteName') { ... }`

Fills target upload forms:
- Form fields population
- Category/type selection
- Torrent file attachment
- Description formatting

---

## Data Flow

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│  Source Page    │──────▶│   raw_info{}     │──────▶│  Target Form    │
│  (origin_site)  │       │  (shared state)  │       │  (forward_site) │
└─────────────────┘       └──────────────────┘       └─────────────────┘
       │                         │                          │
       ▼                         ▼                          ▼
   Part 3 Parser            fill_raw_info()           Part 5 Filler
   walkDOM()                Encoding parsers          Form population
```

### `raw_info` Object (Core Data)
```javascript
{
  name: '',           // Torrent title
  small_descr: '',    // Subtitle
  descr: '',          // BBCode description
  url: '',            // IMDB URL
  dburl: '',          // Douban URL
  type: '',           // 电影/剧集/动漫/...
  medium_sel: '',     // WEB-DL/Remux/...
  codec_sel: '',      // H264/H265/...
  audiocodec_sel: '', // DTS-HDMA/...
  standard_sel: '',   // 1080p/4K/...
  source_sel: '',     // 欧美/大陆/港台/...
  torrent_url: '',    // Download URL
  full_mediainfo: '', // Raw mediainfo text
  images: [],         // Screenshot URLs
  labels: 0           // Language flags (bitmask)
}
```
