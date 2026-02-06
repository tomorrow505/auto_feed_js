# Auto-Feed Refactor Agent Notes

This file is the handoff log and operating rules for continuing work in new Codex/LLM sessions without losing context.

## Non-Negotiables

- Behavior parity: do not "optimize" or change UX/behavior unless it matches legacy `auto_feed.user.js`.
- No surprise commits: do not `git commit` / `git push` unless the user explicitly confirms in the current session.
- No personal info leaks: never embed local absolute paths (for example `/path/to/...` or `C:\\Users\\...`) or `file:///` in generated userscripts or README.
- Do not auto-upload on behalf of users: if we assist image hosts, we can only prefill or prepare; never click "upload" automatically.

## Dev Install (Safari-Friendly)

Safari Tampermonkey cannot load local `file://` in `@require`, so dev install must use the full bundled userscript served over HTTP.

- Full script dev server (serves bundled userscript):
  - `cd auto-feed-refactor`
  - `nvm use 18.20.8`
  - `npm run dev`
  - Install URL:
    - `http://127.0.0.1:5174/auto-feed-refactor.user.js`
  - Compatibility install URL (also serves full script, not loader):
    - `http://127.0.0.1:5174/__vite-plugin-monkey.install.user.js?origin=http%3A%2F%2F127.0.0.1%3A5174`

- Loader dev server (Vite dev, not Safari-friendly, port separated to avoid conflicts):
  - `cd auto-feed-refactor`
  - `npm run dev:loader` (port `5173`)

## Build

- Recommended Node: `18.20.8` (nvm: `lts/hydrogen`)
- Build command:
  - `cd auto-feed-refactor`
  - `nvm use 18.20.8`
  - `npm run build`

Quick sanity checks (avoid personal path leaks):

```bash
rg -n \"(file:///|\\\\\\\\Users\\\\\\\\|/Users/)\" auto-feed-refactor/dist -S || true
```

## Repo Layout (Refactor)

- Source code: `auto-feed-refactor/src/`
- Site implementations: `auto-feed-refactor/src/trackers/` (formerly "engines", renamed for PT context)
- Settings UI: `auto-feed-refactor/src/ui/App.tsx`
- Full-script dev server: `auto-feed-refactor/scripts/dev-full.js`
- Built userscript output: `auto-feed-refactor/dist/auto-feed-refactor.user.js`

## Settings UX Rules

- Settings tab: general behavior toggles, API keys, quick search templates, PTGen/Douban method toggles.
- Sites tab: "enabled sites" and "favorite sites" checkboxes (favorites must match what forward panel shows).
- Remote tab: remote server JSON import and structured add/edit/test UI for qBittorrent/Transmission.

## Session Log (2026-02-06)

Context: user asked to refactor a ~30k line single-file userscript into a modular self-build project, while keeping full feature parity.

Key changes implemented across the refactor work so far:

- Created modular TS + Vite + `vite-plugin-monkey` userscript project under `auto-feed-refactor/`.
- Implemented site catalog + multiple trackers under `src/trackers/` (Gazelle/NexusPHP/Unit3D families plus common logic).
- Forward/Search buttons:
  - Implemented forward panel showing implemented target sites (not user-defined links).
  - Added "发布/检索" exclusive segmented toggle in `src/services/ForwardLinkService.ts`.
  - Added basic 禁转/禁止转载 keyword detection with confirm gate (needs further parity passes with legacy).
- Placement parity (PTP/HDB/CHD first):
  - Inline `🚀 Forward` + `点击获取` are now placed under the page title (not at the bottom of detail tables) for:
    - PTP: `.page__title`
    - HDB: `h1#top` / `h1`
    - CHDBits: `h1#top` / `#top` / `h1`
  - File: `auto-feed-refactor/src/core/SiteManager.ts`
- Quick search tools:
  - Inject quick search links on Douban/IMDb pages (`src/services/QuickSearchService.ts`).
  - Settings provide quick search templates via dropdown and list textarea (`src/ui/App.tsx`).
  - Reduced quick-search button spacing (tighter site buttons).
  - Files:
    - `auto-feed-refactor/src/services/QuickSearchService.ts`
    - `auto-feed-refactor/src/services/ListSearchService.ts`
- PTGen/Douban fetch:
  - Added "点击获取" tool to fetch external CN info and write back to stored meta (`src/services/QuickLinkService.ts` -> `PtgenService.applyPtgen`).
- Image tools:
  - Rehost utilities to PTPIMG/Pixhost/Freeimage/Gifyu.
  - For HDB/IMGBOX: open host page and provide "一键拉取" to prefill file input (no auto upload click) via `auto-feed-refactor/src/services/ImageUploadBridgeService.ts`.
  - Image download uses legacy-style binary fetch (overrideMimeType) with arraybuffer fallback to avoid zero-byte files on some environments.
- Remote push settings:
  - Moved remote JSON config out of Settings and into a dedicated Remote tab.
  - Added add/edit/delete/test UI + qBittorrent/Transmission test routines (`src/services/RemoteServerTestService.ts`).
  - Added Deluge Web support (config/test/push) alongside qBittorrent/Transmission:
    - Config key: `remoteServer.deluge`
    - Test: `auto-feed-refactor/src/services/RemoteServerTestService.ts`
    - Push sidebar: `auto-feed-refactor/src/services/RemoteDownloadService.ts`
  - Skip-checking UX parity:
    - Added settings: `remoteSkipCheckingDefault`, `remoteAskSkipConfirm`
    - Sidebar uses defaults instead of prompting every click (prompt only if enabled).
    - Sidebar now shows an in-place status line (downloading/login/pushing/done/fail) that auto-hides.
    - Files:
      - `auto-feed-refactor/src/services/SettingsService.ts`
      - `auto-feed-refactor/src/ui/App.tsx`
      - `auto-feed-refactor/src/services/RemoteDownloadService.ts`
- Dev server:
  - Fixed the issue where `5174` sometimes served only the loader by separating ports:
    - `dev-full` binds `127.0.0.1:5174` and serves the full bundled script at both `/auto-feed-refactor.user.js` and `/__vite-plugin-monkey.install.user.js`.
    - `dev:loader` runs on `5173`.
  - File: `auto-feed-refactor/scripts/dev-full.js`
- Settings UI windowing:
  - Settings is now a right-side semi-transparent draggable panel to reduce page obstruction.
  - Removed a broken global capture-phase stopPropagation that caused UI to freeze; event containment now handled locally.
  - File: `auto-feed-refactor/src/ui/App.tsx`
- UI overlap & close fixes:
  - Floating forward FAB is now fallback-only: removed when inline anchor exists and removed on non-source pages; its z-index was lowered to reduce click blocking.
  - Upload-page "Found Data" toast is single-instance, has `pointer-events: auto`, and Close removes the element.
  - Settings close buttons now use `type="button"` and stop propagation to reliably close.
  - Files:
    - `auto-feed-refactor/src/core/SiteManager.ts`
    - `auto-feed-refactor/src/ui/App.tsx`
- Forward label localization:
  - Inline forward button text follows UI language: `转发` (zh) / `Reupload` (en).
  - Floating FAB label follows UI language: `🚀 转发种子` (zh) / `🚀 Reupload Torrent` (en).
  - File: `auto-feed-refactor/src/core/SiteManager.ts`
- Forward popup enhancements:
  - Quick-search links are now included in the forward popup panel above image tools.
  - Added `QuickSearchService.buildQuickSearchHtml(...)` to build the same compact link row for embedded UIs.
  - Files:
    - `auto-feed-refactor/src/core/SiteManager.ts`
    - `auto-feed-refactor/src/services/QuickSearchService.ts`

Reminder:

- Do not commit unless the user explicitly confirms in this session.
- Prefer verifying fixes by building and letting the user validate in Safari install from `5174`.
