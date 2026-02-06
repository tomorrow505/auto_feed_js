import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const BASE_PORT = Number.parseInt(process.env.AUTO_FEED_DEV_PORT || '5174', 10) || 5174;

const runBuild = () =>
  new Promise((resolve, reject) => {
    const child = exec('npm run build', { cwd: ROOT }, (err, stdout, stderr) => {
      if (stdout) process.stdout.write(stdout);
      if (stderr) process.stderr.write(stderr);
      if (err) return reject(err);
      resolve(null);
    });
    child.on('error', reject);
  });

const serveFile = (res, filePath) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const contentType =
      ext === '.js' ? 'application/javascript' : ext === '.map' ? 'application/json' : 'text/plain';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-store'
    });
    res.end(data);
  });
};

const startServer = () => {
  const server = http.createServer((req, res) => {
    const url = (req.url || '/').split('?')[0];
    if (url === '/' || url === '/auto-feed-refactor.user.js') {
      return serveFile(res, path.join(DIST, 'auto-feed-refactor.user.js'));
    }
    // Compatibility: some tooling (vite-plugin-monkey) uses this install endpoint.
    // In "full" mode we just serve the full bundled userscript.
    if (url === '/__vite-plugin-monkey.install.user.js') {
      return serveFile(res, path.join(DIST, 'auto-feed-refactor.user.js'));
    }
    // Avoid accidental installation of the loader when user expects full script.
    if (url === '/auto-feed-loader.user.js') {
      res.writeHead(302, { Location: '/auto-feed-refactor.user.js' });
      res.end();
      return;
    }
    if (url.endsWith('.map')) {
      return serveFile(res, path.join(DIST, path.basename(url)));
    }
    res.writeHead(302, { Location: '/auto-feed-refactor.user.js' });
    res.end();
  });

  server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
      console.error(`[Auto-Feed] Port ${BASE_PORT} is in use.`);
      console.error('[Auto-Feed] If you are running the loader dev server, stop it first (npm run dev:loader).');
      process.exit(1);
    }
    throw err;
  });

  server.listen({ port: BASE_PORT, host: '127.0.0.1' }, () => {
    console.log(`[Auto-Feed] Full script dev server: http://127.0.0.1:${BASE_PORT}/auto-feed-refactor.user.js`);
    console.log(`[Auto-Feed] Monkey install URL: http://127.0.0.1:${BASE_PORT}/__vite-plugin-monkey.install.user.js?origin=http%3A%2F%2F127.0.0.1%3A${BASE_PORT}`);
  });
};

const watch = process.argv.includes('--watch');
const noBuild = process.argv.includes('--no-build') || process.env.AUTO_FEED_NO_BUILD === '1';

const main = async () => {
  if (!noBuild) {
    await runBuild();
  }
  startServer();
  if (!watch) return;

  let timer = null;
  const trigger = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      try {
        console.log('[Auto-Feed] Rebuilding...');
        await runBuild();
      } catch (err) {
        console.error('[Auto-Feed] Build failed:', err);
      }
    }, 400);
  };

  const watchDirs = [path.join(ROOT, 'src'), path.join(ROOT, 'scripts')];
  watchDirs.forEach((dir) => {
    if (fs.existsSync(dir)) {
      fs.watch(dir, { recursive: true }, trigger);
    }
  });
  const watchFiles = ['vite.config.ts', 'package.json', 'tsconfig.json'];
  watchFiles.forEach((file) => {
    const full = path.join(ROOT, file);
    if (fs.existsSync(full)) {
      fs.watch(full, trigger);
    }
  });
};

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
