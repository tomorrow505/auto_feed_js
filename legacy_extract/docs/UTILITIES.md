# Utility Functions Reference (Refined)

> Shared functions and extensions from the 11,526-line Common Core of `auto_feed.user.js`.

## Core Utilities
| Function | Purpose | Example / Line Ref |
|----------|---------|-------------------|
| `wait(func, t, i)` | Poll for element | L:169 |
| `mutation_observer(t, f)` | Observe DOM changes | L:193 |
| `getDoc(url, ...)` | Fetch and parse HTML | L:238 |
| `find_origin_site(url)` | Detect site from URL | L:1875 |

## Data Processing
| Function | Purpose | Patterns |
|----------|---------|----------|
| `get_group_name(name)` | Extract release group | Generic regex |
| `deal_with_title(title)` | Normalize torrent title | Cleanup logic (L:2358) |
| `add_thanks(descr)` | Add brand-specific thanks | MTeam, CMCT, TTG, etc. (L:1953) |

## DOM & BBCode
| Function | Purpose | Special Cases |
|----------|---------|---------------|
| `walkDOM(node)` | Recursive DOM to BBCode | U2, NexusHD, HDSky (L:1964) |
| `walk_cmct(node)` | CMCT-specific walker | CMCT (L:2094) |
| `walk_ptp(node)` | PTP-specific walker | PTP (L:2120) |

## Prototype Extensions
- `String.prototype.format`: BBCode template filling (L:2420).
- `String.prototype.medium_sel`: Media type detection (WEB-DL, Blu-ray, etc) (L:2439).
- `String.prototype.codec_sel`: Video codec detection (H264, H265) (L:2469).
- `String.prototype.audiocodec_sel`: Audio codec detection (DTS, AC3) (L:2499).

## UI Injectors
| Function | Purpose | Key Logic |
|----------|---------|-----------|
| `add_search_urls` | Add quick search links | ZHUQUE, HDB, PTP, Douban (L:1742) |
| `init_buttons` | Create "Transfer" buttons | Source site logic (L:3600-4500) |

---

## Site-Specific Exceptions in Common Code
Some "common" functions contain hardcoded logic for specific sites. These should be refactored into a registry pattern:
- `walkDOM`: Contains checks for `u2.dmhy`, `nexushd`, `totheglory.im`.
- `add_search_urls`: Contains checks for `avistaz`, `zhuque`, `imdb`.
- `add_poster`: Contains check for `OpenCD`.
