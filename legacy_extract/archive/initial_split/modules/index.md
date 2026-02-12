# Module Index

> Auto-generated from `auto_feed.user.js` (30,912 lines)

## Overview

| Metric | Value |
|--------|-------|
| Total Lines | 30,912 |
| Modules | 23 |
| Coverage | 100.0% |

## Modules

### Part 1: Header & Configuration
| # | Module | Lines | Description |
|---|--------|-------|-------------|
| 1 | [01_header.js](./01_header.js) | 1-150 (150) | UserScript metadata, @match rules, @grant permissions |
| 2 | [02_core_utilities.js](./02_core_utilities.js) | 151-916 (766) | wait(), mutation_observer(), getReactFiberNode(), file/image helpers |
| 3 | [03_configuration.js](./03_configuration.js) | 917-1,340 (424) | APIs, user settings, default_site_info (100+ sites) |
| 4 | [04_origin_site_config.js](./04_origin_site_config.js) | 1,341-1,550 (210) | o_site_info dictionary, source site URLs |
| 5 | [05_templates_constants.js](./05_templates_constants.js) | 1,551-1,900 (350) | BBCode templates (iTS, KG), region constants |

### Part 2: Detection & Parsing
| # | Module | Lines | Description |
|---|--------|-------|-------------|
| 6 | [06_site_detection.js](./06_site_detection.js) | 1,901-2,200 (300) | find_origin_site(), add_thanks(), reg_team_name |
| 7 | [07_dom_walkers.js](./07_dom_walkers.js) | 2,201-2,430 (230) | walkDOM(), walk_cmct(), walk_ptp(), domToString() |
| 8 | [08_encoding_parsers.js](./08_encoding_parsers.js) | 2,431-2,700 (270) | String.prototype: medium_sel, codec_sel, audiocodec_sel, standard_sel |
| 9 | [09_data_processing.js](./09_data_processing.js) | 2,701-3,600 (900) | fill_raw_info(), get_mediainfo_picture_from_descr() |

### Part 3: UI Components
| # | Module | Lines | Description |
|---|--------|-------|-------------|
| 10 | [10_ui_buttons_forms.js](./10_ui_buttons_forms.js) | 3,601-4,500 (900) | init_buttons_for_transfer(), button creation logic |
| 11 | [11_download_clients.js](./11_download_clients.js) | 4,501-5,000 (500) | transmissionRequest(), qbittorrentRequest(), get_torrentfile() |

### Part 4: Site-Specific UI Helpers
| # | Module | Lines | Description |
|---|--------|-------|-------------|
| 12 | [12_site_ui_helpers.js](./12_site_ui_helpers.js) | 5,001-7,000 (2,000) | Site-specific UI translations, search filters, popups |
| 13 | [13_site_ui_helpers2.js](./13_site_ui_helpers2.js) | 7,001-8,998 (1,998) | More site-specific UI: tooltips, table enhancements |

### Part 5: Origin Site Parsing
| # | Module | Lines | Description |
|---|--------|-------|-------------|
| 14 | [14_origin_site_parsing1.js](./14_origin_site_parsing1.js) | 8,999-11,000 (2,002) | origin_site blocks: digitalcore, HDSpace, HUDBT, BYR, 影, U2... |
| 15 | [15_origin_site_parsing2.js](./15_origin_site_parsing2.js) | 11,001-13,000 (2,000) | origin_site blocks: BTN, MTV, Red, OpenCD, MTeam, BHD... |
| 16 | [16_origin_site_parsing3.js](./16_origin_site_parsing3.js) | 13,001-14,313 (1,313) | origin_site blocks: exclusivity checks, FRDS, HDB, CMCT... |

### Part 6: Forward Site Filling
| # | Module | Lines | Description |
|---|--------|-------|-------------|
| 17 | [17_forward_site_filling1.js](./17_forward_site_filling1.js) | 14,314-16,000 (1,687) | forward_site blocks: CMCT, PTer, HDSky, OpenCD, OPS... |
| 18 | [18_forward_site_filling2.js](./18_forward_site_filling2.js) | 16,001-18,000 (2,000) | forward_site blocks: TTG, CHDBits, PTer, PThome... |
| 19 | [19_forward_site_filling3.js](./19_forward_site_filling3.js) | 18,001-21,000 (3,000) | forward_site blocks: form population, category selection... |
| 20 | [20_forward_site_filling4.js](./20_forward_site_filling4.js) | 21,001-23,000 (2,000) | forward_site blocks: BLU, ACM, Tik, image handling... |

### Part 7: Additional Handlers
| # | Module | Lines | Description |
|---|--------|-------|-------------|
| 21 | [21_additional_handlers1.js](./21_additional_handlers1.js) | 23,001-26,000 (3,000) | Extended site handlers, special pages |
| 22 | [22_additional_handlers2.js](./22_additional_handlers2.js) | 26,001-29,000 (3,000) | More site handlers, list pages |
| 23 | [23_final_handlers.js](./23_final_handlers.js) | 29,001-30,912 (1,912) | Final origin_site handlers: ZHUQUE, MTeam detail pages |


## Usage

```bash
# Re-run extraction
python3 ../split_modules.py

# View a specific module
cat modules/14_origin_site_parsing1.js
```

## Notes

- Modules are numbered for logical ordering
- Site-specific logic is in modules 12-23
- Refine by editing `MODULES` list in `split_modules.py`
