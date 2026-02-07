import { h, render } from 'preact';
import { App } from './App';
import { appleStyles } from './styles';

export function mountUI() {
    // Create host element
    const host = document.createElement('div');
    host.id = 'auto-feed-overlay-host';
    document.body.appendChild(host);

    // Create Shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });

    // Inject Styles
    const styleEl = document.createElement('style');
    styleEl.textContent = appleStyles;
    shadow.appendChild(styleEl);

    // Container for the app
    const container = document.createElement('div');
    shadow.appendChild(container); // App container

    // Render Preact App
    render(<App />, container);
}
