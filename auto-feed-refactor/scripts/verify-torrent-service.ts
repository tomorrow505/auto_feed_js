
import { TorrentService } from '../src/services/TorrentService';

// Mock Browser Globals for Node environment if missing
if (typeof File === 'undefined') {
    global.File = class File extends Blob {
        name: string;
        lastModified: number;
        constructor(parts: any[], name: string, options?: any) {
            super(parts, options);
            this.name = name;
            this.lastModified = Date.now();
        }
    } as any;
}

if (typeof atob === 'undefined') {
    global.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}

async function verify() {
    console.log('Testing TorrentService.base64ToFile...');

    // 1. Create a dummy Base64 string (mimic a .torrent file content)
    // "Hello World" in Base64 is "SGVsbG8gV29ybGQ="
    const mime = 'application/x-bittorrent';
    const base64 = `data:${mime};base64,SGVsbG8gV29ybGQ=`;
    const filename = 'test.torrent';

    try {
        const file = TorrentService.base64ToFile(base64, filename);

        console.log(`[PASS] File created: ${file.name}`);
        console.log(`[PASS] File type: ${file.type}`);

        // Verify Size
        if (file.size === 11) {
            console.log(`[PASS] File size correct: ${file.size} bytes`);
        } else {
            console.error(`[FAIL] File size mismatch. Expected 11, got ${file.size}`);
            process.exit(1);
        }

        // Verify Content (if possible in Node Blob)
        const text = await file.text();
        if (text === 'Hello World') {
            console.log(`[PASS] File content correct: "${text}"`);
        } else {
            console.error(`[FAIL] Content mismatch. Expected "Hello World", got "${text}"`);
            process.exit(1);
        }

    } catch (e) {
        console.error('[FAIL] Exception:', e);
        process.exit(1);
    }
}

verify();
