import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const fullPath = path.join(dist, 'auto_feed.user.js');
const loaderPath = path.join(dist, 'auto-feed-refactor.user.js');

const localRequireUrl = (process.env.AUTO_FEED_LOCAL_REQUIRE_URL || pathToFileURL(fullPath).href).trim();
const localLoaderUrl = (process.env.AUTO_FEED_LOCAL_LOADER_URL || pathToFileURL(loaderPath).href).trim();
const localLoaderVersion = (process.env.AUTO_FEED_LOCAL_LOADER_VERSION || '').trim();

const full = fs.readFileSync(fullPath, 'utf8');
const headerMatch = full.match(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==/);
if (!headerMatch) {
    throw new Error('Cannot find userscript metadata block in dist/auto_feed.user.js');
}

const lines = headerMatch[0].split('\n');
// Keep the metadata block small and stable: the loader itself is local, and it
// pulls the full bundled userscript from disk instead of depending on a dev server.
const withoutLocalUrls = lines.filter((line) => !/^\s*\/\/\s*@(require|downloadURL|updateURL)\b/i.test(line));
const versionIdx = withoutLocalUrls.findIndex((line) => /^\s*\/\/\s*@version\s+/i.test(line));
if (versionIdx !== -1) {
    const baseVersion = withoutLocalUrls[versionIdx].replace(/^\s*\/\/\s*@version\s+/i, '').trim();
    const buildStamp = new Date().toISOString().replace(/\D/g, '').slice(0, 12);
    const version = localLoaderVersion || `${baseVersion}.${buildStamp}`;
    withoutLocalUrls[versionIdx] = withoutLocalUrls[versionIdx].replace(/(^\s*\/\/\s*@version\s+).+$/i, `$1${version}`);
}
const endIdx = withoutLocalUrls.findIndex((line) => line.includes('==/UserScript=='));
if (endIdx === -1) {
    throw new Error('Invalid metadata block: missing ==/UserScript==');
}
withoutLocalUrls.splice(
    endIdx,
    0,
    `// @downloadURL  ${localLoaderUrl}`,
    `// @updateURL    ${localLoaderUrl}`,
    `// @require      ${localRequireUrl}`
);

const loader = `${withoutLocalUrls.join('\n')}

// Local loader entry.
// The full userscript code is loaded from the local file:// @require above.
`;

fs.writeFileSync(loaderPath, loader, 'utf8');
console.log(`[postbuild] wrote loader: ${path.relative(root, loaderPath)}`);
console.log(`[postbuild] loader URL: ${localLoaderUrl}`);
console.log(`[postbuild] require URL: ${localRequireUrl}`);
