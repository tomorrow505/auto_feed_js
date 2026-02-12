import { webcrypto as nodeWebcrypto } from 'node:crypto';

// Vite 5 uses `crypto.getRandomValues()` during startup. Node 16 doesn't expose Web Crypto
// on `globalThis` by default, but it does provide `crypto.webcrypto`.
try {
  if (!globalThis.crypto || typeof globalThis.crypto.getRandomValues !== 'function') {
    globalThis.crypto = nodeWebcrypto;
  }
} catch {}

// Delegate to Vite's real CLI entry.
await import('../node_modules/vite/bin/vite.js');

