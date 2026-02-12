
import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { SettingsService, AppSettings } from '../services/SettingsService';
import { DEFAULT_QUICK_SEARCH_TEMPLATES } from '../common/quickSearch';
import { SiteCatalogService } from '../services/SiteCatalogService';
import { RemoteDownloadService } from '../services/RemoteDownloadService';
import { i18n, SupportedLang } from './i18n';

export const App = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [panelPos, setPanelPos] = useState<{ x: number; y: number } | null>(null);
    const [drag, setDrag] = useState<{ offsetX: number; offsetY: number } | null>(null);
    const [settings, setSettings] = useState<AppSettings>({
        ptpImgApiKey: '',
        pixhostApiKey: '',
        freeimageApiKey: '',
        gifyuApiKey: '',
        doubanCookie: '',
        tmdbApiKey: '',
        chdBaseUrl: 'https://chdbits.co/',
        tlBaseUrl: 'https://www.torrentleech.org/',
        ptpShowDouban: true,
        ptpShowGroupName: true,
        ptpNameLocation: 1,
        hdbShowDouban: true,
        hdbHideDouban: false,
        showQuickSearchOnDouban: true,
        showQuickSearchOnImdb: true,
        defaultAnonymous: false,
        autoDownloadAfterUpload: true,
        remoteSidebarOpacity: 0.92,
        settingsPanelOpacity: 0.95,
        popupOpacity: 0.96,
        maskOpacity: 0.25,
        toastOpacity: 0.95,
        enableRemoteSidebar: false,
        remoteSkipCheckingDefault: false,
        remoteAskSkipConfirm: false,
        remoteServer: null,
        imdbToDoubanMethod: 0,
        ptgenApi: 3,
        quickSearchList: [],
        quickSearchPresets: [],
        enabledSites: [],
        favoriteSites: [],
        showSearchOnList: {
            PTP: true,
            HDB: false,
            HDT: false,
            UHD: false
        },
        uiLanguage: 'zh'
    });
    const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

    const [remoteModalOpen, setRemoteModalOpen] = useState(false);
    const [remoteForm, setRemoteForm] = useState<{
        type: 'qb' | 'tr' | 'de';
        name: string;
        url: string;
        username: string;
        password: string;
        paths: { label: string; path: string }[];
        editingKey?: { type: 'qb' | 'tr' | 'de'; name: string };
    }>({
        type: 'qb',
        name: '',
        url: '',
        username: '',
        password: '',
        paths: [{ label: 'default', path: '' }]
    });

    const [quickPreset, setQuickPreset] = useState('');
    const [quickPresetInput, setQuickPresetInput] = useState('');

    const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
    const getPanelSize = () => {
        // Keep it compact, but still wide enough to show >= 8 site tiles per row.
        const w = Math.min(880, Math.min(980, window.innerWidth - 24));
        const h = Math.min(760, window.innerHeight - 24);
        return { w: Math.max(660, w), h: Math.max(540, h) };
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.altKey && e.code === 'KeyS') {
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKey);

        const openSettings = () => {
            setIsOpen(true);
            setActiveTab('dashboard');
        };
        window.addEventListener('autofeed:open-settings', openSettings as any);

        SettingsService.load().then((loaded) => {
            setSettings(loaded);
            if (loaded.quickSearchList && loaded.quickSearchList.length) {
                setQuickPreset(loaded.quickSearchList[0]);
            } else if (DEFAULT_QUICK_SEARCH_TEMPLATES.length) {
                setQuickPreset(DEFAULT_QUICK_SEARCH_TEMPLATES[0]);
            }
        });

        return () => {
            window.removeEventListener('keydown', handleKey);
            window.removeEventListener('autofeed:open-settings', openSettings as any);
        };
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        const onMouseDown = (e: MouseEvent) => {
            const host = document.getElementById('auto-feed-overlay-host');
            const root = host?.shadowRoot;
            if (!host || !root) return;
            const target = e.target as Node | null;
            const inUI = !!target && (root.contains(target) || host.contains(target));
            if (!inUI) setIsOpen(false);
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('mousedown', onMouseDown);
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('mousedown', onMouseDown);
        };
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;
        if (panelPos) return;
        const { w, h } = getPanelSize();
        setPanelPos({
            x: Math.max(20, window.innerWidth - w - 20),
            y: Math.max(20, Math.floor((window.innerHeight - h) / 2))
        });
    }, [isOpen, panelPos]);

    useEffect(() => {
        if (!drag) return;

        const onMove = (e: MouseEvent) => {
            e.preventDefault();
            const { w, h } = getPanelSize();
            const nextX = clamp(e.clientX - drag.offsetX, 0, Math.max(0, window.innerWidth - w));
            const nextY = clamp(e.clientY - drag.offsetY, 0, Math.max(0, window.innerHeight - h));
            setPanelPos({ x: nextX, y: nextY });
        };
        const onUp = () => setDrag(null);

        document.addEventListener('mousemove', onMove, true);
        document.addEventListener('mouseup', onUp, true);
        return () => {
            document.removeEventListener('mousemove', onMove, true);
            document.removeEventListener('mouseup', onUp, true);
        };
    }, [drag]);

    const handleSaveSettings = async () => {
        setSaveState('saving');
        try {
            await SettingsService.save(settings);
            setSaveState('saved');
            window.setTimeout(() => setSaveState('idle'), 1500);
        } catch {
            setSaveState('error');
            window.setTimeout(() => setSaveState('idle'), 1800);
        }
    };

    const setAndPersist = (next: AppSettings) => {
        setSettings(next);
        SettingsService.save(next).catch(() => { });
    };

    const applyRemoteSidebarOpacity = (value: number) => {
        const sidebar = document.getElementById('autofeed-remote-sidebar') as HTMLElement | null;
        if (!sidebar) return;
        const opacity = clamp(Number(value) || 0.92, 0.3, 1);
        sidebar.style.opacity = String(opacity);
    };

    const toggleLanguage = () => {
        const next = settings.uiLanguage === 'zh' ? 'en' : 'zh';
        setAndPersist({ ...settings, uiLanguage: next as any });
    };

    const allSites = SiteCatalogService.getSupportedSites();
    const t = i18n[settings.uiLanguage as SupportedLang] || i18n.en;

    const sortSites = (sites: any[]) => sites.slice().sort((a, b) => String(a.name).localeCompare(String(b.name)));
    const getSiteFavicon = (site: any) => {
        try {
            const base =
                site.baseUrl ||
                (site.keywords && site.keywords.length
                    ? `https://${String(site.keywords.find((k: string) => k.includes('.') && !k.includes('/')) || site.keywords[0]).replace(/^https?:\/\//, '').replace(/\/.*$/, '')}/`
                    : '');
            if (!base) return '';
            return new URL('/favicon.ico', base).href;
        } catch {
            return '';
        }
    };
    const getSiteAbbr = (name: string) => {
        const n = String(name || '').trim();
        if (!n) return '';
        if (/[A-Za-z0-9]/.test(n)) {
            const s = n.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
            return (s.slice(0, 4) || n.slice(0, 4)).toUpperCase();
        }
        return n.slice(0, 2);
    };

    const getQuickSearchPresetLabel = (line: string) => {
        const anchorText = line.match(/>([^<]+)<\/a>/i)?.[1];
        if (anchorText) return anchorText.trim();
        const pipe = line.split('|');
        if (pipe.length > 1) return pipe[0].trim();
        try {
            return new URL(line).hostname.replace(/^www\./, '');
        } catch {
            return line;
        }
    };

    const quickSearchPresets = Array.from(new Set([
        ...DEFAULT_QUICK_SEARCH_TEMPLATES,
        ...(settings.quickSearchPresets || [])
    ]));

    const toggleSite = (name: string) => {
        const set = new Set(settings.enabledSites || []);
        if (set.has(name)) set.delete(name); else set.add(name);
        const enabledSites = Array.from(set);
        // Keep favorites as a subset of enabled sites to reduce clutter.
        const favoriteSites = (settings.favoriteSites || []).filter((x) => enabledSites.includes(x));
        setAndPersist({ ...settings, enabledSites, favoriteSites });
    };

    const toggleFavoriteSite = (name: string) => {
        // Favorites should only come from enabled sites.
        if (!(settings.enabledSites || []).includes(name)) return;
        const set = new Set(settings.favoriteSites || []);
        if (set.has(name)) set.delete(name); else set.add(name);
        setAndPersist({ ...settings, favoriteSites: Array.from(set) });
    };

    const selectAllSites = () => setAndPersist({ ...settings, enabledSites: SiteCatalogService.getSupportedSiteNames() });
    const clearAllSites = () => setAndPersist({ ...settings, enabledSites: [], favoriteSites: [] });

    // Components
    const CheckboxRow = ({ label, checked, onChange, desc }: { label: string, checked: boolean, onChange: () => void, desc?: string }) => (
        <label className="af-row" style={{ cursor: 'pointer' }}>
            <div className="af-label">
                <div>{label}</div>
                {desc && <div className="af-label-desc">{desc}</div>}
            </div>
            <div className="af-toggle">
                <input type="checkbox" checked={checked} onChange={onChange} />
                <span className="af-slider"></span>
            </div>
        </label>
    );

    const InputRow = ({ label, value, onInput, placeholder, desc }: { label: string, value: string, onInput: (v: string) => void, placeholder?: string, desc?: string }) => (
        <div className="af-row">
            <div className="af-label">
                <div>{label}</div>
                {desc && <div className="af-label-desc">{desc}</div>}
            </div>
            <input
                className="af-input"
                style={{ width: '340px', maxWidth: '100%' }}
                type="text"
                value={value}
                onInput={(e) => onInput(e.currentTarget.value)}
                placeholder={placeholder}
            />
        </div>
    );

    // Avoid fixed overlay controls that can block site UI; open via embedded entry or Alt+S.
    if (!isOpen) return null;

    const { w: panelW, h: panelH } = getPanelSize();
    const pos = panelPos || { x: 20, y: 20 };

    return (
        <div
            className="af-panel"
            style={{
                position: 'fixed',
                left: `${pos.x}px`,
                top: `${pos.y}px`,
                width: `${panelW}px`,
                height: `${panelH}px`,
                zIndex: 99999,
                opacity: Math.min(1, Math.max(0.3, Number(settings.settingsPanelOpacity ?? 0.95)))
            }}
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
        >
            <div
                className="af-header"
                onMouseDown={(e) => {
                    if ((e.target as HTMLElement).closest('button')) return;
                    setDrag({ offsetX: e.clientX - pos.x, offsetY: e.clientY - pos.y });
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <h2 className="af-title">Auto-Feed Refactor</h2>
                    <button
                        type="button"
                        className="af-btn"
                        style={{ padding: '4px 10px', fontSize: '12px', height: '26px', color: '#111' }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleLanguage(); }}
                        title={t.language}
                    >
                        中/en
                    </button>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="button" className="af-btn af-btn-primary" onClick={handleSaveSettings}>
                        {saveState === 'saving' ? t.saving : saveState === 'saved' ? t.saved : saveState === 'error' ? t.saveFailed : t.save}
                    </button>
                    <button
                        type="button"
                        className="af-close-btn"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                    >
                        ×
                    </button>
                </div>
            </div>

            <div className="af-layout">
                <div className="af-sidebar">
                    {[
                        { id: 'dashboard', label: t.dashboard, icon: '📊' },
                        { id: 'settings', label: t.settings, icon: '🔧' },
                        { id: 'sites', label: t.sites, icon: '🌐' },
                        { id: 'remote', label: t.remote, icon: '📡' }
                    ].map(item => (
                        <div
                            key={item.id}
                            className={`af-nav-item ${activeTab === item.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(item.id)}
                        >
                            {item.icon} {item.label}
                        </div>
                    ))}
                </div>

                <div className="af-content">
                    {/* Dashboard */}
                    {activeTab === 'dashboard' && (
                        <div>
                            <div className="af-card">
                                <div className="af-card-header">{t.status}</div>
                                <div className="af-row">
                                    <span className="af-label">{t.status}</span>
                                    <span style={{ color: 'var(--af-success)', fontWeight: '600' }}>{t.active}</span>
                                </div>
                                <div className="af-row">
                                    <span className="af-label">{t.currentHost}</span>
                                    <span style={{ color: 'var(--af-text-secondary)' }}>{window.location.hostname}</span>
                                </div>
                                <div className="af-row">
                                    <span className="af-label">{t.version}</span>
                                    <span style={{ color: 'var(--af-text-secondary)' }}>Refactor v1.0</span>
                                </div>
                            </div>
                            <div className="af-card">
                                <div className="af-card-header">UI</div>
                                <div className="af-row">
                                    <div className="af-label">
                                        <div>{t.settingsPanelOpacity}</div>
                                        <div className="af-label-desc">0.30 - 1.00</div>
                                    </div>
                                    <input
                                        className="af-input"
                                        style={{ width: '200px' }}
                                        type="range"
                                        min="0.3"
                                        max="1"
                                        step="0.01"
                                        value={String(settings.settingsPanelOpacity ?? 0.95)}
                                        onInput={(e) => setAndPersist({ ...settings, settingsPanelOpacity: Number(e.currentTarget.value) })}
                                    />
                                </div>
                                <div className="af-row">
                                    <div className="af-label">
                                        <div>{t.popupOpacity}</div>
                                        <div className="af-label-desc">0.30 - 1.00</div>
                                    </div>
                                    <input
                                        className="af-input"
                                        style={{ width: '200px' }}
                                        type="range"
                                        min="0.3"
                                        max="1"
                                        step="0.01"
                                        value={String(settings.popupOpacity ?? 0.96)}
                                        onInput={(e) => setAndPersist({ ...settings, popupOpacity: Number(e.currentTarget.value) })}
                                    />
                                </div>
                                <div className="af-row">
                                    <div className="af-label">
                                        <div>{t.maskOpacity}</div>
                                        <div className="af-label-desc">0.10 - 0.80</div>
                                    </div>
                                    <input
                                        className="af-input"
                                        style={{ width: '200px' }}
                                        type="range"
                                        min="0.1"
                                        max="0.8"
                                        step="0.01"
                                        value={String(settings.maskOpacity ?? 0.25)}
                                        onInput={(e) => setAndPersist({ ...settings, maskOpacity: Number(e.currentTarget.value) })}
                                    />
                                </div>
                                <div className="af-row">
                                    <div className="af-label">
                                        <div>{t.toastOpacity}</div>
                                        <div className="af-label-desc">0.30 - 1.00</div>
                                    </div>
                                    <input
                                        className="af-input"
                                        style={{ width: '200px' }}
                                        type="range"
                                        min="0.3"
                                        max="1"
                                        step="0.01"
                                        value={String(settings.toastOpacity ?? 0.95)}
                                        onInput={(e) => setAndPersist({ ...settings, toastOpacity: Number(e.currentTarget.value) })}
                                    />
                                </div>
                            </div>
                            <div style={{ textAlign: 'center', color: 'var(--af-text-secondary)', marginTop: '20px', fontSize: '12px' }}>
                                Press <span style={{ padding: '2px 6px', background: '#eee', borderRadius: '4px' }}>Alt+S</span> to toggle overlay
                            </div>
                        </div>
                    )}

                    {/* Settings - Reordered as requested */}
                    {activeTab === 'settings' && (
                        <div>
                            {/* 1. Page Features (Most frequent) */}
                            <div className="af-card">
                                <div className="af-card-header">{t.pageFeatures}</div>
                                <div className="af-two-col">
                                    <CheckboxRow label={t.ptpShowDouban} checked={!!settings.ptpShowDouban} onChange={() => setSettings({ ...settings, ptpShowDouban: !settings.ptpShowDouban })} />
                                    <CheckboxRow label={t.ptpShowGroupName} checked={!!settings.ptpShowGroupName} onChange={() => setSettings({ ...settings, ptpShowGroupName: !settings.ptpShowGroupName })} />
                                    <CheckboxRow label={t.hdbShowDouban} checked={!!settings.hdbShowDouban} onChange={() => setSettings({ ...settings, hdbShowDouban: !settings.hdbShowDouban })} />
                                    <CheckboxRow label={t.hdbCollapseDouban} checked={!!settings.hdbHideDouban} onChange={() => setSettings({ ...settings, hdbHideDouban: !settings.hdbHideDouban })} />
                                    <CheckboxRow label={t.doubanQuickSearch} checked={!!settings.showQuickSearchOnDouban} onChange={() => setSettings({ ...settings, showQuickSearchOnDouban: !settings.showQuickSearchOnDouban })} />
                                    <CheckboxRow label={t.imdbQuickSearch} checked={!!settings.showQuickSearchOnImdb} onChange={() => setSettings({ ...settings, showQuickSearchOnImdb: !settings.showQuickSearchOnImdb })} />
                                    <CheckboxRow label={t.defaultAnonymous} checked={!!settings.defaultAnonymous} onChange={() => setSettings({ ...settings, defaultAnonymous: !settings.defaultAnonymous })} />
                                    <CheckboxRow label={t.autoDownloadAfterUpload} checked={!!settings.autoDownloadAfterUpload} onChange={() => setSettings({ ...settings, autoDownloadAfterUpload: !settings.autoDownloadAfterUpload })} />
                                </div>
                                <div className="af-row">
                                    <span className="af-label">{t.ptpGroupNamePos}</span>
                                    <div className="af-segmented">
                                        {[0, 1].map(v => (
                                            <div
                                                key={v}
                                                className={`af-segment-opt ${settings.ptpNameLocation === v ? 'active' : ''}`}
                                                onClick={() => setSettings({ ...settings, ptpNameLocation: v })}
                                            >
                                                {v === 0 ? t.before : t.after}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* 2. External Sources */}
                            <div className="af-card">
                                <div className="af-card-header">{t.externalSources}</div>
                                <div className="af-row">
                                    <span className="af-label">{t.imdbToDoubanMethod}</span>
                                    <div className="af-segmented">
                                        {[t.api, t.scrape].map((l, i) => (
                                            <div className={`af-segment-opt ${settings.imdbToDoubanMethod === i ? 'active' : ''}`} onClick={() => setSettings({ ...settings, imdbToDoubanMethod: i })}>{l}</div>
                                        ))}
                                    </div>
                                </div>
                                <div className="af-row">
                                    <span className="af-label">{t.ptgenSource}</span>
                                    <div className="af-segmented">
                                        <div className={`af-segment-opt ${settings.ptgenApi === 0 ? 'active' : ''}`} onClick={() => setSettings({ ...settings, ptgenApi: 0 })}>IYUU</div>
                                        <div className={`af-segment-opt ${settings.ptgenApi === 1 ? 'active' : ''}`} onClick={() => setSettings({ ...settings, ptgenApi: 1 })}>PTGen</div>
                                        <div className={`af-segment-opt ${settings.ptgenApi === 3 ? 'active' : ''}`} onClick={() => setSettings({ ...settings, ptgenApi: 3 })}>Douban</div>
                                    </div>
                                </div>
                                <div className="af-row">
                                    <span className="af-label">{t.chdDomain}</span>
                                    <select
                                        className="af-input"
                                        style={{ width: '340px', maxWidth: '100%' }}
                                        value={settings.chdBaseUrl}
                                        onChange={(e) => setAndPersist({ ...settings, chdBaseUrl: e.currentTarget.value.endsWith('/') ? e.currentTarget.value : e.currentTarget.value + '/' })}
                                    >
                                        <option value="https://chdbits.co/">chdbits.co</option>
                                        <option value="https://ptchdbits.co/">ptchdbits.co</option>
                                        <option value="https://ptchdbits.org/">ptchdbits.org</option>
                                        <option value="https://chddiy.xyz/">chddiy.xyz</option>
                                    </select>
                                </div>
                                <div className="af-row">
                                    <span className="af-label">{t.tlDomain}</span>
                                    <select
                                        className="af-input"
                                        style={{ width: '340px', maxWidth: '100%' }}
                                        value={settings.tlBaseUrl}
                                        onChange={(e) => setAndPersist({ ...settings, tlBaseUrl: e.currentTarget.value.endsWith('/') ? e.currentTarget.value : e.currentTarget.value + '/' })}
                                    >
                                        <option value="https://www.torrentleech.org/">torrentleech.org</option>
                                        <option value="https://www.torrentleech.cc/">torrentleech.cc</option>
                                    </select>
                                </div>
                            </div>

                            {/* 3. Quick Search Editor */}
                            <div className="af-card">
                                <div className="af-card-header">{t.quickSearchEditor}</div>
                                <div style={{ padding: '12px' }}>
                                    <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                                        <select className="af-input" style={{ flex: 1 }} value={quickPreset} onChange={e => setQuickPreset(e.currentTarget.value)}>
                                            {quickSearchPresets.map(l => <option key={l} value={l}>{getQuickSearchPresetLabel(l)}</option>)}
                                        </select>
                                        <button className="af-btn" onClick={() => {
                                            if (!quickPreset) return;
                                            const set = new Set(settings.quickSearchList || []);
                                            set.add(quickPreset);
                                            setAndPersist({ ...settings, quickSearchList: Array.from(set) });
                                        }}>{t.add}</button>
                                    </div>
                                    <textarea
                                        className="af-input"
                                        style={{ width: '100%', height: '150px', fontFamily: 'monospace' }}
                                        value={(settings.quickSearchList || []).join('\n')}
                                        onInput={e => setAndPersist({ ...settings, quickSearchList: e.currentTarget.value.split('\n').filter(Boolean) })}
                                    />
                                </div>
                            </div>

                            {/* 4. API Keys (Least frequent) */}
                            <div className="af-card">
                                <div className="af-card-header">{t.servicesApiKeys}</div>
                                <InputRow label="PtpImg API Key" value={settings.ptpImgApiKey} onInput={v => setAndPersist({ ...settings, ptpImgApiKey: v })} />
                                <InputRow label="Pixhost API Key" value={settings.pixhostApiKey} onInput={v => setAndPersist({ ...settings, pixhostApiKey: v })} />
                                <InputRow label="Freeimage API Key" value={settings.freeimageApiKey} onInput={v => setAndPersist({ ...settings, freeimageApiKey: v })} />
                                <InputRow label="Gifyu API Key" value={settings.gifyuApiKey} onInput={v => setAndPersist({ ...settings, gifyuApiKey: v })} />
                            </div>
                        </div>
                    )}

                    {/* Sites */}
                    {activeTab === 'sites' && (
                        <div>
                            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                <button className="af-btn af-btn-primary" onClick={selectAllSites}>{t.selectAll}</button>
                                <button className="af-btn" onClick={clearAllSites}>{t.clearAll}</button>
                            </div>

                            <div className="af-card">
                                <div className="af-card-header">{t.enabledSites}</div>
                                <div style={{ padding: '0 10px 10px' }}>
                                    <div className="af-grid">
                                        {sortSites(allSites).map((site: any) => (
                                            <div
                                                key={site.name}
                                                className="af-site-tile"
                                                onClick={() => toggleSite(site.name)}
                                                style={{ background: (settings.enabledSites || []).includes(site.name) ? 'rgba(0,113,227,0.1)' : undefined }}
                                                title={site.name}
                                            >
                                                <input className="af-site-check" type="checkbox" checked={(settings.enabledSites || []).includes(site.name)} readOnly />
                                                <div className="af-site-icon">
                                                    <span>{getSiteAbbr(site.name).slice(0, 1)}</span>
                                                    {getSiteFavicon(site) ? (
                                                        <img
                                                            src={getSiteFavicon(site)}
                                                            onError={(e) => {
                                                                const img = e.currentTarget as HTMLImageElement;
                                                                img.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="af-site-label">{getSiteAbbr(site.name)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="af-card">
                                <div className="af-card-header">{t.favoriteSites}</div>
                                <div style={{ padding: '0 10px 10px' }}>
                                    <div className="af-grid">
                                        {sortSites(allSites.filter((s: any) => (settings.enabledSites || []).includes(s.name))).map((site: any) => (
                                            <div
                                                key={'fav-' + site.name}
                                                className="af-site-tile"
                                                onClick={() => toggleFavoriteSite(site.name)}
                                                style={{ background: (settings.favoriteSites || []).includes(site.name) ? 'rgba(0,113,227,0.1)' : undefined }}
                                                title={site.name}
                                            >
                                                <input className="af-site-check" type="checkbox" checked={(settings.favoriteSites || []).includes(site.name)} readOnly />
                                                <div className="af-site-icon">
                                                    <span>{getSiteAbbr(site.name).slice(0, 1)}</span>
                                                    {getSiteFavicon(site) ? (
                                                        <img
                                                            src={getSiteFavicon(site)}
                                                            onError={(e) => {
                                                                const img = e.currentTarget as HTMLImageElement;
                                                                img.style.display = 'none';
                                                            }}
                                                        />
                                                    ) : null}
                                                </div>
                                                <div className="af-site-label">{getSiteAbbr(site.name)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="af-card">
                                <div className="af-card-header">{t.listPageQuickSearch}</div>
                                <div style={{ padding: '0 10px' }}>
                                    {(['PTP', 'HDB', 'HDT', 'UHD'] as const).map(key => (
                                        <CheckboxRow
                                            key={key}
                                            label={key}
                                            checked={!!settings.showSearchOnList?.[key]}
                                            onChange={() => setAndPersist({
                                                ...settings,
                                                showSearchOnList: { ...settings.showSearchOnList, [key]: !settings.showSearchOnList?.[key] }
                                            })}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Remote */}
                    {activeTab === 'remote' && (
                        <div>
                            <div className="af-card">
                                <div className="af-card-header">{t.globalSettings}</div>
                                <CheckboxRow label={t.enableSidebar} checked={!!settings.enableRemoteSidebar} onChange={() => setAndPersist({ ...settings, enableRemoteSidebar: !settings.enableRemoteSidebar })} />
                                <CheckboxRow label={t.skipCheckingDefault} checked={!!settings.remoteSkipCheckingDefault} onChange={() => setAndPersist({ ...settings, remoteSkipCheckingDefault: !settings.remoteSkipCheckingDefault })} />
                                <CheckboxRow label={t.askConfirmBeforePush} checked={!!settings.remoteAskSkipConfirm} onChange={() => setAndPersist({ ...settings, remoteAskSkipConfirm: !settings.remoteAskSkipConfirm })} />
                                <div className="af-row">
                                    <div className="af-label">
                                        <div>{t.remoteSidebarOpacity}</div>
                                        <div className="af-label-desc">0.30 - 1.00</div>
                                    </div>
                                    <input
                                        className="af-input"
                                        style={{ width: '200px' }}
                                        type="range"
                                        min="0.3"
                                        max="1"
                                        step="0.01"
                                        value={String(settings.remoteSidebarOpacity ?? 0.92)}
                                        onInput={(e) => {
                                            const value = Number(e.currentTarget.value);
                                            applyRemoteSidebarOpacity(value);
                                            setAndPersist({ ...settings, remoteSidebarOpacity: value });
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="af-card">
                                <div className="af-card-header">{t.clientConfigs}</div>
                                <div style={{ padding: '16px' }}>
                                    <div style={{ display: 'flex', gap: '10px', marginBottom: '16px' }}>
                                        <button className="af-btn" onClick={() => {
                                            setRemoteForm({
                                                type: 'qb', name: '', url: '', username: '', password: '', paths: [{ label: 'default', path: '' }]
                                            });
                                            setRemoteModalOpen(true);
                                        }}>
                                            {t.addClient}
                                        </button>
                                        <label className="af-btn">
                                            {t.importJson}
                                            <input
                                                type="file"
                                                style={{ display: 'none' }}
                                                accept=".json"
                                                onChange={(e) => {
                                                    const f = e.currentTarget.files?.[0];
                                                    if (!f) return;
                                                    const r = new FileReader();
                                                    r.onload = (ev) => {
                                                        try {
                                                            const json = JSON.parse(ev.target?.result as string);
                                                            setAndPersist({ ...settings, remoteServer: json });
                                                            alert('Config loaded');
                                                        } catch { alert('Invalid JSON'); }
                                                    };
                                                    r.readAsText(f);
                                                }}
                                            />
                                        </label>
                                    </div>

                                    {settings.remoteServer && (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            {Object.entries(settings.remoteServer.qbittorrent || {}).map(([name, conf]) => (
                                                <div key={'qb' + name} className="af-row" style={{ background: '#f9f9f9', borderRadius: '8px', gap: '8px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                                        <div className="af-label" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            <strong>[QB]</strong> {name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conf.url}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                        <button type="button" className="af-btn" onClick={async () => {
                                                            const r = await RemoteDownloadService.testQbittorrent({ url: conf.url, username: conf.username, password: conf.password });
                                                            alert(r.ok ? `${t.testSuccess}: ${r.message}` : `${t.testFailed}: ${r.message}`);
                                                        }}>{t.testConnection}</button>
                                                        <button type="button" className="af-btn" onClick={() => {
                                                            setRemoteForm({
                                                                type: 'qb',
                                                                name,
                                                                url: conf.url,
                                                                username: conf.username || '',
                                                                password: conf.password || '',
                                                                paths: Object.entries(conf.path || {}).map(([label, path]) => ({ label, path })),
                                                                editingKey: { type: 'qb', name }
                                                            });
                                                            setRemoteModalOpen(true);
                                                        }}>{t.edit}</button>
                                                        <button type="button" className="af-btn af-btn-danger" onClick={async () => {
                                                            if (!confirm(`Delete QB client "${name}"?`)) return;
                                                            const next = { ...settings };
                                                            if (next.remoteServer?.qbittorrent) {
                                                                delete (next.remoteServer.qbittorrent as any)[name];
                                                                await setAndPersist(next);
                                                            }
                                                        }}>{t.delete}</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.entries(settings.remoteServer.transmission || {}).map(([name, conf]) => (
                                                <div key={'tr' + name} className="af-row" style={{ background: '#f9f9f9', borderRadius: '8px', gap: '8px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                                        <div className="af-label" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            <strong>[TR]</strong> {name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conf.url}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                        <button type="button" className="af-btn" onClick={async () => {
                                                            const r = await RemoteDownloadService.testTransmission({ url: conf.url, username: conf.username, password: conf.password });
                                                            alert(r.ok ? `${t.testSuccess}: ${r.message}` : `${t.testFailed}: ${r.message}`);
                                                        }}>{t.testConnection}</button>
                                                        <button type="button" className="af-btn" onClick={() => {
                                                            setRemoteForm({
                                                                type: 'tr',
                                                                name,
                                                                url: conf.url,
                                                                username: conf.username || '',
                                                                password: conf.password || '',
                                                                paths: Object.entries(conf.path || {}).map(([label, path]) => ({ label, path })),
                                                                editingKey: { type: 'tr', name }
                                                            });
                                                            setRemoteModalOpen(true);
                                                        }}>{t.edit}</button>
                                                        <button type="button" className="af-btn af-btn-danger" onClick={async () => {
                                                            if (!confirm(`Delete TR client "${name}"?`)) return;
                                                            const next = { ...settings };
                                                            if (next.remoteServer?.transmission) {
                                                                delete (next.remoteServer.transmission as any)[name];
                                                                await setAndPersist(next);
                                                            }
                                                        }}>{t.delete}</button>
                                                    </div>
                                                </div>
                                            ))}
                                            {Object.entries(settings.remoteServer.deluge || {}).map(([name, conf]) => (
                                                <div key={'de' + name} className="af-row" style={{ background: '#f9f9f9', borderRadius: '8px', gap: '8px' }}>
                                                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
                                                        <div className="af-label" style={{ margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                            <strong>[DE]</strong> {name}
                                                        </div>
                                                        <div style={{ fontSize: '12px', color: '#666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conf.url}</div>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
                                                        <button type="button" className="af-btn" onClick={async () => {
                                                            const r = await RemoteDownloadService.testDeluge({ url: conf.url, password: conf.password });
                                                            alert(r.ok ? `${t.testSuccess}: ${r.message}` : `${t.testFailed}: ${r.message}`);
                                                        }}>{t.testConnection}</button>
                                                        <button type="button" className="af-btn" onClick={() => {
                                                            setRemoteForm({
                                                                type: 'de',
                                                                name,
                                                                url: conf.url,
                                                                username: '',
                                                                password: conf.password || '',
                                                                paths: Object.entries(conf.path || {}).map(([label, path]) => ({ label, path })),
                                                                editingKey: { type: 'de', name }
                                                            });
                                                            setRemoteModalOpen(true);
                                                        }}>{t.edit}</button>
                                                        <button type="button" className="af-btn af-btn-danger" onClick={async () => {
                                                            if (!confirm(`Delete DE client "${name}"?`)) return;
                                                            const next = { ...settings };
                                                            if (next.remoteServer?.deluge) {
                                                                delete (next.remoteServer.deluge as any)[name];
                                                                await setAndPersist(next);
                                                            }
                                                        }}>{t.delete}</button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Remote Config Modal - Using English for tech labels potentially, but keys are translated */}
            {remoteModalOpen && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100000
                }}>
                    <div className="af-panel" style={{ width: '400px', maxHeight: '90%', padding: '0', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>
                        <div className="af-header">
                            <h3 className="af-title">{t.addClient}</h3>
                            <button
                                type="button"
                                className="af-close-btn"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    setRemoteModalOpen(false);
                                }}
                            >
                                ×
                            </button>
                        </div>
                        <div style={{ padding: '20px', overflowY: 'auto' }}>
                            <div className="af-row">
                                <span className="af-label">{t.type}</span>
                                <div className="af-segmented">
                                    {(['qb', 'tr', 'de'] as const).map(t => (
                                        <div key={t} className={`af-segment-opt ${remoteForm.type === t ? 'active' : ''}`} onClick={() => setRemoteForm({ ...remoteForm, type: t })}>{t.toUpperCase()}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="af-row"><input className="af-input" style={{ flex: 1 }} placeholder={t.name} value={remoteForm.name} onInput={e => setRemoteForm({ ...remoteForm, name: e.currentTarget.value })} /></div>
                            <div className="af-row"><input className="af-input" style={{ flex: 1 }} placeholder={t.url} value={remoteForm.url} onInput={e => setRemoteForm({ ...remoteForm, url: e.currentTarget.value })} /></div>
                            <div className="af-row"><input className="af-input" style={{ flex: 1 }} placeholder={t.username} value={remoteForm.username} onInput={e => setRemoteForm({ ...remoteForm, username: e.currentTarget.value })} /></div>
                            <div className="af-row"><input className="af-input" style={{ flex: 1 }} placeholder={t.password} type="password" value={remoteForm.password} onInput={e => setRemoteForm({ ...remoteForm, password: e.currentTarget.value })} /></div>

                            <div style={{ marginTop: '10px' }}>
                                <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>{t.downloadPaths}</div>
                                {remoteForm.paths.map((p, i) => (
                                    <div key={i} style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                                        <input className="af-input" style={{ width: '80px' }} placeholder={t.pathLabel} value={p.label} onInput={e => {
                                            const np = [...remoteForm.paths]; np[i].label = e.currentTarget.value; setRemoteForm({ ...remoteForm, paths: np });
                                        }} />
                                        <input className="af-input" style={{ flex: 1 }} placeholder={t.pathValue} value={p.path} onInput={e => {
                                            const np = [...remoteForm.paths]; np[i].path = e.currentTarget.value; setRemoteForm({ ...remoteForm, paths: np });
                                        }} />
                                    </div>
                                ))}
                                <button type="button" className="af-btn" style={{ width: '100%', marginTop: '4px' }} onClick={() => setRemoteForm({ ...remoteForm, paths: [...remoteForm.paths, { label: '', path: '' }] })}>{t.addPath}</button>
                            </div>
                        </div>
                        <div style={{ padding: '16px', borderTop: '1px solid var(--af-border-light)', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                            <button type="button" className="af-btn" style={{ marginRight: 'auto' }} onClick={async (e) => {
                                const btn = e.currentTarget;
                                const originalText = btn.textContent;
                                btn.textContent = t.testing;
                                btn.disabled = true;
                                try {
                                    const { type, url, username, password } = remoteForm;
                                    let res = { ok: false, message: '' };
                                    if (type === 'qb') res = await RemoteDownloadService.testQbittorrent({ url, username, password });
                                    else if (type === 'tr') res = await RemoteDownloadService.testTransmission({ url, username, password });
                                    else res = await RemoteDownloadService.testDeluge({ url, password });

                                    alert(res.ok ? `${t.testSuccess}: ${res.message}` : `${t.testFailed}: ${res.message}`);
                                } catch (err: any) {
                                    alert(`${t.testFailed}: ${err?.message || String(err)}`);
                                } finally {
                                    btn.textContent = t.testConnection;
                                    btn.disabled = false;
                                }
                            }}>{t.testConnection}</button>
                            <button type="button" className="af-btn" onClick={() => setRemoteModalOpen(false)}>{t.cancel}</button>
                            <button type="button" className="af-btn af-btn-primary" onClick={async () => {
                                const newSettings = { ...settings };
                                if (!newSettings.remoteServer) newSettings.remoteServer = {};
                                const key = remoteForm.type === 'qb' ? 'qbittorrent' : remoteForm.type === 'tr' ? 'transmission' : 'deluge';
                                if (!newSettings.remoteServer[key]) newSettings.remoteServer[key] = {};

                                const pathsMap: Record<string, string> = {};
                                remoteForm.paths.forEach(p => { if (p.label && p.path) pathsMap[p.label] = p.path; });

                                // If editing and name changed, remove old key first.
                                if (remoteForm.editingKey) {
                                    const oldKey = remoteForm.editingKey.type === 'qb' ? 'qbittorrent' : remoteForm.editingKey.type === 'tr' ? 'transmission' : 'deluge';
                                    const oldName = remoteForm.editingKey.name;
                                    if (oldKey !== key || oldName !== remoteForm.name) {
                                        try { delete (newSettings.remoteServer[oldKey] as any)[oldName]; } catch {}
                                    }
                                }

                                newSettings.remoteServer[key]![remoteForm.name] = {
                                    url: remoteForm.url,
                                    username: remoteForm.username,
                                    password: remoteForm.password,
                                    path: pathsMap
                                };

                                await setAndPersist(newSettings);
                                setRemoteModalOpen(false);
                            }}>{t.save}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
