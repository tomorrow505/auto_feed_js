# 🚀 Usage Tutorial

This tutorial will guide you through the core operations of **Auto-Feed Refactor**.

---

## 1. Installation & Setup
1. **Environment**: Ensure you have [Tampermonkey](https://www.tampermonkey.net/) installed.
2. **Install Script**:
   - dev (rolling build from `refactor-dev`): https://github.com/Gawain12/auto_feed_js/releases/download/dev/auto_feed.user.js
   - stable (after tagging `v*`): https://github.com/Gawain12/auto_feed_js/releases/latest/download/auto_feed.user.js
3. **Open Panel**: On any supported site, press `Alt + S` to open the main settings panel.
4. **Language**: Click the language toggle (CN/EN) in the top-right corner of the panel header to switch to English.

---

## 2. Basic Forwarding (Core Workflow)
This is the main feature of the script. Just follow these 4 steps:

1. **Source Site**: Go to any supported torrent details page (e.g., M-Team, PTP, HDB).
2. **Open Panel**: Click the `转发/Reupload` button next to the torrent title.
3. **Enhance Metadata (Optional)**:
   - Click **"Fetch Info"**. The script will automatically fetch Chinese titles, descriptions, and posters from Douban/Ptgen based on the IMDb ID.
4. **Go to Target**: Click the icon of the site you want to upload to (e.g., BHD) in the panel.
5. **Auto-Fill**: The upload page will open, and the script will automatically detect the cache and fill in the form. You will see a **"Found Data & Injected"** notification.

---

## 3. Image Tools
You can use powerful image processing features in the Forwarding Panel or Settings:

- **Single Image Re-host**: Paste an image URL (even with anti-hotlink protection), choose a host (PTPIMG/PIXhost), and the script will upload it via a backend bridge and return BBCode.
- **Batch Re-host**: The script detects screenshots on the page. Select the ones you want, and batch upload them to PIXhost with one click.
- **Image Host Bridge**: Click a host icon (e.g., HDBits), and the script will open the host's upload page with the file URL pre-filled. You just need to click "Upload".

---

## 4. Remote Download
1. **Configuration**: Go to Settings Panel -> **Remote Download** tab.
2. **Add Client**: Select type (qBittorrent/Transmission/Deluge), enter URL and credentials.
3. **Test Connection**: Click the "Test" button to verify your settings.
4. **One-Click Push**: Click the downloader icon in the sidebar or button area of the source torrent page to push the torrent directly to your server.

---

## 5. FAQ
- **Shortcut Conflict?**: You can change `Alt + S` to another key in the settings.
- **Auto-Fill Failed?**: Check if you are logged into the target site and if the site is in the [Supported Sites List](Site-Support.md).
- **Data Mismatch?**: Some foreign sites require original English info. Switch to "Check/Publish" mode in the Forwarding Panel.

> [!TIP]
> Want more advanced tips? Check out [Image Tools](Image-Tools.md) or [Remote Download](Remote-Download.md).
