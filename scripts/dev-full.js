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

const serveFile = (res, filePath, { devBaseUrl, scriptPath = '/auto-feed.user.js' } = {}) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    }
    const ext = path.extname(filePath);
    const contentType =
      ext === '.js' ? 'application/javascript' : ext === '.map' ? 'application/json' : 'text/plain';
    res.writeHead(200, { 'Content-Type': contentType, 'Cache-Control': 'no-store' });

    if (ext === '.js' && devBaseUrl) {
      // When installing from a local URL, Tampermonkey prefers @downloadURL/@updateURL if present.
      // Rewrite them to point back to the local dev server so updates stay local.
      let s = data.toString('utf8');
      s = s.replace(/(^\/\/\s*@downloadURL\s+).+$/m, `$1${devBaseUrl}${scriptPath}`);
      s = s.replace(/(^\/\/\s*@updateURL\s+).+$/m, `$1${devBaseUrl}${scriptPath}`);
      s = s.replace(/(^\/\/\s*@require\s+).+\/auto_feed\.user\.js$/m, `$1${devBaseUrl}/auto_feed.user.js`);
      res.end(s);
      return;
    }

    res.end(data);
  });
};

const createDevServer = (activePort) =>
  http.createServer((req, res) => {
    const url = (req.url || '/').split('?')[0];
    const devBaseUrl = `http://127.0.0.1:${activePort}`;
    if (url === '/' || url === '/auto_feed.user.js' || url === '/auto-feed.user.js') {
      return serveFile(res, path.join(DIST, 'auto_feed.user.js'), { devBaseUrl, scriptPath: '/auto-feed.user.js' });
    }
    // Local loader URL (metadata + @require).
    if (url === '/auto-feed-refactor.user.js') {
      return serveFile(res, path.join(DIST, 'auto-feed-refactor.user.js'), { devBaseUrl, scriptPath: '/auto-feed-refactor.user.js' });
    }
    // Compatibility: some tooling (vite-plugin-monkey) uses this install endpoint.
    // In "full" mode we just serve the full bundled userscript.
    if (url === '/__vite-plugin-monkey.install.user.js') {
      return serveFile(res, path.join(DIST, 'auto_feed.user.js'), { devBaseUrl, scriptPath: '/auto-feed.user.js' });
    }
    // Avoid accidental installation of the loader when user expects full script.
    if (url === '/auto-feed-loader.user.js') {
      res.writeHead(302, { Location: '/auto_feed.user.js' });
      res.end();
      return;
    }
    if (url.endsWith('.map')) {
      return serveFile(res, path.join(DIST, path.basename(url)));
    }
    res.writeHead(302, { Location: '/auto_feed.user.js' });
    res.end();
  });

const startServer = () => {
  const triedPorts = new Set();
  const maxAttempts = 12;
  const retryable = new Set(['EADDRINUSE', 'EACCES', 'EPERM']);

  const tryListen = (port, attempt = 1) => {
    const server = createDevServer(port);
    triedPorts.add(port);

    server.on('error', (err) => {
      const code = err && err.code ? String(err.code) : 'UNKNOWN';
      if (retryable.has(code) && attempt < maxAttempts) {
        const nextPort = port + 1;
        if (!triedPorts.has(nextPort)) {
          console.warn(`[Auto-Feed] Port ${port} unavailable (${code}), retrying ${nextPort}...`);
          tryListen(nextPort, attempt + 1);
          return;
        }
      }

      if (retryable.has(code)) {
        console.error(`[Auto-Feed] Unable to bind local dev server after ${attempt} attempts.`);
        console.error(`[Auto-Feed] Last error: ${code}. Try setting AUTO_FEED_DEV_PORT to an available port.`);
        process.exit(1);
      }
      throw err;
    });

    server.listen({ port, host: '127.0.0.1' }, () => {
      console.log(`[Auto-Feed] Full script dev server: http://127.0.0.1:${port}/auto-feed.user.js`);
      console.log(`[Auto-Feed] (compat) http://127.0.0.1:${port}/auto_feed.user.js`);
      console.log(`[Auto-Feed] Loader URL: http://127.0.0.1:${port}/auto-feed-refactor.user.js`);
      console.log(`[Auto-Feed] Monkey install URL: http://127.0.0.1:${port}/__vite-plugin-monkey.install.user.js?origin=http%3A%2F%2F127.0.0.1%3A${port}`);
    });
  };

  tryListen(BASE_PORT, 1);
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
