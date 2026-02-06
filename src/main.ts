import { SiteManager } from './core/SiteManager';
import { mountUI } from './ui/mount';
import './common/jquery';
import $ from 'jquery';

// Ensure jQuery is available globally if needed by some legacy logic or UI
(window as any).$ = (window as any).jQuery = $;

(async function () {
    console.log('[Auto-Feed] v3.1.5 initializing...');

    mountUI();

    const manager = new SiteManager();
    await manager.run();
})();
