
import { h, render } from 'preact';
import { App } from './App';

export function mountUI() {
    // Create host element
    const host = document.createElement('div');
    host.id = 'auto-feed-overlay-host';
    document.body.appendChild(host);

    // Create Shadow DOM
    const shadow = host.attachShadow({ mode: 'open' });

    // Container for the app
    const container = document.createElement('div');
    shadow.appendChild(container); // App container

    // Optional: Inject styles into shadow DOM if needed (e.g. Tailwind or custom CSS)
    // For now, we are using inline styles in App.tsx for simplicity, 
    // but typically we would inject <style> tags here.

    // Render Preact App
    render(<App />, container);
}
