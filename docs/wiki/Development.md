# Development

## Environment
- Node.js 18.x (recommended: 18.20.x)
- npm 10+

## Commands
- Install: `npm ci` (CI) or `npm install` (local)
- Dev: `npm run dev`
- Build: `npm run build`

## Output
- Built userscript: `dist/auto_feed.user.js`

## Notes
- Some behaviors depend on userscript managers (Tampermonkey/Violentmonkey) and browser security policies.
- For Safari, prioritize testing the built script (`dist/auto_feed.user.js`) because dev injection differs.

## Dev Install URL (Vite)
`npm run dev` will start Vite on `http://127.0.0.1:5173/`.

Install entry (provided by `vite-plugin-monkey`):
- `http://127.0.0.1:5173/__vite-plugin-monkey.install.user.js?origin=http%3A%2F%2F127.0.0.1%3A5173`

## Safari Friendly (Full Script Over HTTP)
If your userscript manager cannot install via the dev install entry, use the built output served by a plain HTTP server:

1. `npm run build`
2. `python3 -m http.server 5174 -d dist`
3. Install:
   `http://127.0.0.1:5174/auto_feed.user.js`
