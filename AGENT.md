# Auto-Feed Refactor Agent Notes

This file is the handoff log and operating rules for continuing work in new Codex/LLM sessions without losing context.

## Non-Negotiables

- Behavior parity: do not change UX/behavior unless it matches legacy `auto_feed.user.js`.
- No personal info leaks: never embed local absolute paths (for example `/Users/...`) or `file:///` in generated userscripts or docs.
- Do not auto-upload on behalf of users: for image hosts, only prefill/prepare, never click "upload/start" automatically.
- No surprise commits: do not `git commit` / `git push` unless the user explicitly asks in the current session.

## Branches

- `master`: legacy single-file userscript history.
- `refactor-dev`: modular refactor (this work).

## Repo Layout (Refactor)

- Entry: `src/main.ts`
- Site implementations (PT context): `src/trackers/`
- Common logic: `src/services/`, `src/templates/`, `src/common/legacy/`
- UI: `src/ui/App.tsx`
- Build output: `dist/auto_feed.user.js` (not committed)
- Refactor Wiki: `docs/wiki/Home.md` (committed)
- Legacy Wiki reference folder (local only, ignored): `auto_feed_js.wiki/`

## Dev / Build

Recommended Node: 18.20.x.

Dev:
- `npm run dev`
- Install URL (vite-plugin-monkey):
  `http://127.0.0.1:5173/__vite-plugin-monkey.install.user.js?origin=http%3A%2F%2F127.0.0.1%3A5173`

Safari-friendly full script over HTTP:
1. `npm run build`
2. `python3 -m http.server 5174 -d dist`
3. Install:
   `http://127.0.0.1:5174/auto_feed.user.js`

## Local-Only Files (Must Not Commit)

- `auto_feed.user.js` legacy reference copy
- `auto_feed_js.wiki/` legacy wiki clone
- `dist/` build output
- local helper scripts under `scripts/` (dev server, loader generator, verification) are ignored by design

## Session Log

### 2026-02-06

Context: user requested refactoring a ~30k-line single-file userscript into a modular, self-build project while keeping parity with legacy behavior.

Work completed in this refactor branch:
- Modularized code into `src/` with trackers/services/templates/ui structure.
- Implemented forward panel based on implemented trackers (no user-defined forward links).
- Implemented quick search injection and forward-popup quick search row.
- Implemented external meta fetch ("点击获取") via ptgen/douban with configurable sources.
- Implemented image tools and image-host bridge (prefill file input, no auto upload).
- Implemented remote download sidebar (qBittorrent, Transmission, Deluge) with structured add/edit/test UI.
- Adjusted button placement to be near torrent title for key sites (PTP/HDB/CHD), not at the bottom.
- Added settings for opacity/theme language toggle and common behavior toggles.

### 2026-02-06 (Later)

Repo maintenance and documentation work:
- Flattened refactor project into repo root (removed nested subproject directory approach).
- Removed legacy unrelated HTML artifacts from repo.
- Added `docs/wiki/*` as the refactor wiki (implemented vs planned).
- Rewrote `todo.md` to be gap-only vs legacy wiki pages.
- Updated `.gitignore` to prevent committing local-only reference files and build outputs.

