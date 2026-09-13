# Auto-Feed｜PT Cross-Site Torrent Assistant (Refactored)

Project: <https://github.com/tomorrow505/auto_feed_js/tree/dev>

This is a refactored version evolved from the original Auto-Feed. We keep the familiar one-click torrent forwarding workflow while organizing site adapters, metadata extraction, automatic form filling, image handling, and remote pushing into clearer, decoupled modules that are easier to maintain and extend.

Some smaller sites, site-specific details, and edge-case workflows are still being migrated and adapted. If you need support for another site, you can refer to the existing adapters and open an adaptation PR.

## Implemented features

- One-click forwarding from a source torrent page to a target upload page
- Automatic filling for titles, descriptions, media information, and images
- Metadata enrichment with IMDb, Douban, PTGen, and more
- Quick search and page enhancements
- Image transfer and hosting tools, including PTPIMG, Pixhost, Freeimage, ImgBB, Hostik, and hdbimg
- Remote pushing to qBittorrent, Transmission, Deluge, and more
- Torrent metadata cleanup and common field handling

## Screenshots

![Settings](https://raw.githubusercontent.com/tomorrow505/auto_feed_js/dev/docs/images/settings.png)

![Site selection](https://raw.githubusercontent.com/tomorrow505/auto_feed_js/dev/docs/images/sites.png)

![Image tools](https://raw.githubusercontent.com/tomorrow505/auto_feed_js/dev/docs/images/image_tools.png)
