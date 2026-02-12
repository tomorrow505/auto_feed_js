# Usage (EN)

## Core Flow
1. Open `Reupload` on a **torrent detail page**.
2. Use `Fetch Info` when needed (only injected on Chinese Nexus-like source pages).
3. Jump to a target upload page.
4. Script auto-fills from cached metadata.

## Strict Page Binding
- PTP / GPW / RED / OPS / DIC: only pages with `torrentid` are treated as valid source pages.
- HDB / CHDBits / OpenCD: only `details.php?id=...` pages are valid.
- TTG: `/t/{id}` or `details.php?id=...`.
- If page binding is not reliable, embed/remote UI is intentionally hidden.

## Hotkey
- `Alt + S`: open settings panel.

## If Autofill Fails
1. Check target-site login status.
2. Confirm current page is a valid detail page (especially `torrentid`).
3. Ensure target site is enabled in settings.
4. Check console logs for parse/fill errors.
