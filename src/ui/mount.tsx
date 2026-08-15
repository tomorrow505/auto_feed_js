import { h, render } from 'preact';
import { App } from './App';
import { appleStyles } from './styles';

const HOST_ID = 'auto-feed-overlay-host';
let observerBound = false;

function ensureHost(): HTMLElement | null {
    const root = document.body || document.documentElement;
    if (!root) return null;

    let host = document.getElementById(HOST_ID) as HTMLDivElement | null;
    if (!host) {
        host = document.createElement('div');
        host.id = HOST_ID;
        root.appendChild(host);
    }

    if (!host.shadowRoot) {
        const shadow = host.attachShadow({ mode: 'open' });

        const styleEl = document.createElement('style');
        styleEl.textContent = appleStyles;
        shadow.appendChild(styleEl);

        const container = document.createElement('div');
        shadow.appendChild(container);
        render(<App />, container);
    }

    return host;
}

function bindHostRecovery() {
    if (observerBound) return;
    observerBound = true;

    const remount = () => {
        try {
            ensureHost();
        } catch (e) {
            console.warn('[Auto-Feed] Overlay remount failed:', e);
        }
    };

    const root = document.documentElement || document;
    const observer = new MutationObserver(() => {
        if (!document.getElementById(HOST_ID)) remount();
    });
    observer.observe(root, { childList: true, subtree: true });

    if (document.readyState !== 'complete') {
        window.addEventListener('load', remount, { once: true });
    }
    [250, 1000, 2500, 5000].forEach((ms) => window.setTimeout(remount, ms));
}

export function mountUI() {
    ensureHost();
    bindHostRecovery();
}
