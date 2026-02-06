import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { exec } from 'node:child_process';

const ROOT = process.cwd();
const DIST = path.join(ROOT, 'dist');
const PORT = 5174;

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

  server.listen(PORT, () => {
    console.log(`[Auto-Feed] Full script dev server: http://localhost:${PORT}/auto-feed-refactor.user.js`);
  });
};

const watch = process.argv.includes('--watch');

const main = async () => {
  await runBuild();
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
