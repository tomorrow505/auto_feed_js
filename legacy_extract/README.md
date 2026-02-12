# Auto-Feed Legacy Extraction Project

This project contains the modularized and consolidated logic extracted from the monolithic `auto_feed.user.js`.

## Project Structure

- **[sites/](sites/)**: Consolidated logic for **79 sites** (origin, forward, and URL-based).
- **[core/](core/)**: Split functional modules of the common core logic.
- **[docs/](docs/)**: Detailed documentation on architecture, utilities, and configuration.
- **[scripts/](scripts/)**: Python scripts used for extraction and consolidation.
- **[archive/](archive/)**: Legacy monolithic core and intermediate extraction data.

---

## Site Extraction Index

| Site | Snippets | Site Module | Raw Header Matches (Archived) |
| :--- | :---: | :--- | :--- |
| TTG | 18 | [TTG.js](sites/TTG.js) | [TTG.txt](archive/raw_matches/TTG.txt) |
| OpenCD | 14 | [OpenCD.js](sites/OpenCD.js) | [OpenCD.txt](archive/raw_matches/OpenCD.txt) |
| CMCT | 13 | [CMCT.js](sites/CMCT.js) | [CMCT.txt](archive/raw_matches/CMCT.txt) |
| MTeam | 12 | [MTeam.js](sites/MTeam.js) | [MTeam.txt](archive/raw_matches/MTeam.txt) |
| OurBits | 11 | [OurBits.js](sites/OurBits.js) | [OurBits.txt](archive/raw_matches/OurBits.txt) |
| Tik | 11 | [Tik.js](sites/Tik.js) | [Tik.txt](archive/raw_matches/Tik.txt) |
| PTer | 9 | [PTer.js](sites/PTer.js) | [PTer.txt](archive/raw_matches/PTer.txt) |
| Audiences | 8 | [Audiences.js](sites/Audiences.js) | [Audiences.txt](archive/raw_matches/Audiences.txt) |
| BLU | 8 | [BLU.js](sites/BLU.js) | [BLU.txt](archive/raw_matches/BLU.txt) |
| HDB | 8 | [HDB.js](sites/HDB.js) | [HDB.txt](archive/raw_matches/HDB.txt) |
| HUDBT | 8 | [HUDBT.js](sites/HUDBT.js) | [HUDBT.txt](archive/raw_matches/HUDBT.txt) |
| TJUPT | 8 | [TJUPT.js](sites/TJUPT.js) | [TJUPT.txt](archive/raw_matches/TJUPT.txt) |
| UHD | 8 | [UHD.js](sites/UHD.js) | [UHD.txt](archive/raw_matches/UHD.txt) |
| BHD | 7 | [BHD.js](sites/BHD.js) | [BHD.txt](archive/raw_matches/BHD.txt) |
| HDRoute | 7 | [HDRoute.js](sites/HDRoute.js) | [HDRoute.txt](archive/raw_matches/HDRoute.txt) |
| MTV | 7 | [MTV.js](sites/MTV.js) | [MTV.txt](archive/raw_matches/MTV.txt) |
| CG | 6 | [CG.js](sites/CG.js) | [CG.txt](archive/raw_matches/CG.txt) |
| CHDBits | 6 | [CHDBits.js](sites/CHDBits.js) | [CHDBits.txt](archive/raw_matches/CHDBits.txt) |
| PThome | 6 | [PThome.js](sites/PThome.js) | [PThome.txt](archive/raw_matches/PThome.txt) |
| Aither | 5 | [Aither.js](sites/Aither.js) | [Aither.txt](archive/raw_matches/Aither.txt) |
| FileList | 5 | [FileList.js](sites/FileList.js) | [FileList.txt](archive/raw_matches/FileList.txt) |
| GPW | 5 | [GPW.js](sites/GPW.js) | [GPW.txt](archive/raw_matches/GPW.txt) |
| HDArea | 5 | [HDArea.js](sites/HDArea.js) | [HDArea.txt](archive/raw_matches/HDArea.txt) |
| HDDolby | 5 | [HDDolby.js](sites/HDDolby.js) | [HDDolby.txt](archive/raw_matches/HDDolby.txt) |
| HDHome | 5 | [HDHome.js](sites/HDHome.js) | [HDHome.txt](archive/raw_matches/HDHome.txt) |
| PTP | 5 | [PTP.js](sites/PTP.js) | [PTP.txt](archive/raw_matches/PTP.txt) |
| RED | 5 | [RED.js](sites/RED.js) | [RED.txt](archive/raw_matches/RED.txt) |
| U2 | 5 | [U2.js](sites/U2.js) | [U2.txt](archive/raw_matches/U2.txt) |
| ZHUQUE | 4 | [ZHUQUE.js](sites/ZHUQUE.js) | [ZHUQUE.txt](archive/raw_matches/ZHUQUE.txt) |
| LemonHD | 3 | [LemonHD.js](sites/LemonHD.js) | [LemonHD.txt](archive/raw_matches/LemonHD.txt) |

> See [sites/](sites/) for the full list of consolidated site logic.

## Documentation References

- **[Architecture Map](docs/ARCHITECTURE.md)**: Overview of the 30k line source and its functional sections.
- **[Utilities Guide](docs/UTILITIES.md)**: Reference for shared DOM helpers, fetchers, and bbcode walkers.
- **[Site Config Documentation](docs/SITE_CONFIG.md)**: Metadata on site dictionaries and recognition patterns.
