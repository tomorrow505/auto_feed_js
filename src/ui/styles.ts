
export const appleStyles = `
:host {
    --af-bg-primary: rgba(245, 245, 247, 0.95);
    --af-bg-secondary: #ffffff;
    --af-text-primary: #1d1d1f;
    --af-text-secondary: #86868b;
    --af-accent: #0071e3;
    --af-accent-hover: #0077ed;
    --af-border: #d2d2d7;
    --af-border-light: #e5e5ea;
    --af-danger: #ff3b30;
    --af-success: #34c759;
    --af-warn: #ffcc00;
    --af-radius-l: 12px;
    --af-radius-m: 8px;
    --af-radius-s: 6px;
    --af-shadow: 0 4px 24px rgba(0,0,0,0.12);
    --af-font: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* {
    box-sizing: border-box;
    font-family: var(--af-font);
}

/* Scrollbar */
::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
::-webkit-scrollbar-track {
    background: transparent;
}
::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
}
::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}

.af-panel {
    background: var(--af-bg-primary);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-radius: var(--af-radius-l);
    box-shadow: var(--af-shadow);
    color: var(--af-text-primary);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    font-size: 13px;
    border: 1px solid rgba(0,0,0,0.1);
}

.af-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: rgba(255,255,255,0.8);
    border-bottom: 1px solid var(--af-border-light);
    user-select: none;
    -webkit-user-select: none;
}

.af-title {
    font-weight: 600;
    font-size: 15px;
    margin: 0;
}

.af-close-btn {
    background: none;
    border: none;
    font-size: 20px;
    color: var(--af-text-secondary);
    cursor: pointer;
    padding: 0;
    line-height: 1;
    width: 24px;
    height: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    transition: background 0.2s;
}
.af-close-btn:hover {
    background: rgba(0,0,0,0.05);
    color: var(--af-text-primary);
}

/* Layout */
.af-layout {
    display: flex;
    flex: 1;
    overflow: hidden;
}

.af-sidebar {
    width: 120px;
    background: rgba(242, 242, 247, 0.5);
    border-right: 1px solid var(--af-border-light);
    padding: 8px 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.af-nav-item {
    padding: 7px 8px;
    border-radius: var(--af-radius-s);
    cursor: pointer;
    font-weight: 500;
    color: var(--af-text-primary);
    transition: background 0.2s;
    font-size: 12px;
}
.af-nav-item:hover {
    background: rgba(0,0,0,0.05);
}
.af-nav-item.active {
    background: rgba(0,113,227,0.12);
    color: var(--af-accent);
}

.af-content {
    flex: 1;
    padding: 16px;
    overflow-y: auto;
    background: var(--af-bg-secondary);
}

/* Components */
.af-card {
    background: #fff;
    border-radius: var(--af-radius-l);
    border: 1px solid var(--af-border-light);
    margin-bottom: 20px;
    overflow: hidden;
}

.af-card-header {
    background: #fcfcfc;
    padding: 10px 16px;
    font-weight: 600;
    border-bottom: 1px solid var(--af-border-light);
    color: var(--af-text-secondary);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.af-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid var(--af-border-light);
    min-height: 44px;
}
.af-row:last-child {
    border-bottom: none;
}

.af-two-col {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 0;
    position: relative;
}

.af-two-col::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: var(--af-border-light);
    pointer-events: none;
}

.af-two-col .af-row {
    border-bottom: 1px solid var(--af-border-light);
}

@media (max-width: 860px) {
    .af-two-col {
        grid-template-columns: 1fr;
    }
    .af-two-col::before {
        display: none;
    }
}

.af-label {
    flex: 1;
    font-size: 13px;
}
.af-label-desc {
    font-size: 11px;
    color: var(--af-text-secondary);
    margin-top: 2px;
}

/* Inputs */
.af-input {
    padding: 6px 10px;
    border: 1px solid var(--af-border);
    border-radius: var(--af-radius-s);
    font-size: 13px;
    outline: none;
    transition: border 0.2s, box-shadow 0.2s;
}
.af-input:focus {
    border-color: var(--af-accent);
    box-shadow: 0 0 0 3px rgba(0,113,227,0.2);
}

/* Buttons */
.af-btn {
    padding: 6px 14px;
    border-radius: var(--af-radius-s);
    border: none;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    background: rgba(0,0,0,0.05);
    color: var(--af-accent);
}
.af-btn:hover {
    background: rgba(0,0,0,0.1);
}
.af-btn-primary {
    background: var(--af-accent);
    color: #fff;
}
.af-btn-primary:hover {
    background: var(--af-accent-hover);
}
.af-btn-danger {
    background: rgba(255,59,48,0.1);
    color: var(--af-danger);
}
.af-btn-danger:hover {
    background: rgba(255,59,48,0.2);
}

/* iOS Toggle Switch */
.af-toggle {
    position: relative;
    display: inline-block;
    width: 36px;
    height: 20px;
}
.af-toggle input { 
    opacity: 0;
    width: 0;
    height: 0;
}
.af-slider {
    position: absolute;
    cursor: pointer;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: #e9e9ea;
    transition: .3s;
    border-radius: 20px;
}
.af-slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 2px;
    bottom: 2px;
    background-color: white;
    transition: .3s;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
.af-toggle input:checked + .af-slider {
    background-color: var(--af-success);
}
.af-toggle input:checked + .af-slider:before {
    transform: translateX(16px);
}

/* Site Grid */
.af-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, 58px);
    justify-content: start;
    gap: 3px;
    padding: 6px;
}
.af-site-tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4px 2px;
    background: #f5f5f7;
    border-radius: var(--af-radius-s);
    cursor: pointer;
    transition: background 0.2s;
    position: relative;
    height: 46px;
    user-select: none;
    -webkit-user-select: none;
}
.af-site-tile:hover {
    background: #e5e5e7;
}
.af-site-check {
    position: absolute;
    top: 2px;
    left: 2px;
    margin: 0;
    pointer-events: none;
    transform: scale(0.78);
    transform-origin: top left;
}
.af-site-icon {
    width: 15px;
    height: 15px;
    border-radius: 3px;
    overflow: hidden;
    background: rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}
.af-site-icon img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    display: block;
    position: absolute;
    inset: 0;
}
.af-site-icon span {
    font-weight: 800;
    font-size: 10px;
    color: rgba(0,0,0,0.45);
    position: relative;
    z-index: 0;
}
.af-site-label {
    margin-top: 4px;
    font-size: 9px;
    font-weight: 700;
    letter-spacing: 0.2px;
    max-width: 56px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Segmented Control */
.af-segmented {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    background: #eceff3;
    padding: 3px;
    border-radius: 999px;
}
.af-segment-opt {
    flex: 1;
    min-height: 28px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 0 11px;
    font-size: 12px;
    cursor: pointer;
    border-radius: 999px;
    color: var(--af-text-primary);
    font-weight: 500;
    transition: background-color 0.2s ease, box-shadow 0.2s ease, color 0.2s ease;
}
.af-segment-opt.active {
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.14);
}

.af-path-row {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
}
.af-path-row .af-input {
    min-height: 32px;
}
.af-path-label {
    width: 96px;
}
.af-path-value {
    flex: 1;
}
`;
