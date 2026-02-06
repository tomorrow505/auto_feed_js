import { h } from 'preact';
import { useState, useEffect } from 'preact/hooks';
import { SettingsService, AppSettings } from '../services/SettingsService';
import { DEFAULT_QUICK_SEARCH_TEMPLATES } from '../services/QuickSearchTemplateService';
import { SiteCatalogService } from '../services/SiteCatalogService';

export const App = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    const [settings, setSettings] = useState<AppSettings>({
        ptpImgApiKey: '',
        pixhostApiKey: '',
        freeimageApiKey: '',
        gifyuApiKey: '',
        hdbImgApiKey: '',
        hdbImgEndpoint: 'https://hdbimg.com/api/1/upload',
        doubanCookie: '',
        tmdbApiKey: '',
        chdBaseUrl: 'https://chdbits.co/',
        ptpShowDouban: true,
        ptpShowGroupName: true,
        ptpNameLocation: 1,
        hdbShowDouban: true,
        hdbHideDouban: false,
        showQuickSearchOnDouban: true,
        showQuickSearchOnImdb: true,
        enableRemoteSidebar: false,
        remoteServer: null,
        imdbToDoubanMethod: 0,
        ptgenApi: 3,
        quickSearchList: [],
        quickSearchPresets: [],
        quickSearchTextareaHeight: 220,
        enabledSites: [],
        favoriteSites: [],
        showSearchOnList: {
            PTP: true,
            HDB: false,
            HDT: false,
            UHD: false
        }
    });

    const [quickPreset, setQuickPreset] = useState('');
    const [quickPresetInput, setQuickPresetInput] = useState('');

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.altKey && e.code === 'KeyS') {
                setIsOpen(prev => !prev);
            }
        };
        window.addEventListener('keydown', handleKey);

        // Load settings on mount
        SettingsService.load().then((loaded) => {
            setSettings(loaded);
            if (loaded.quickSearchList && loaded.quickSearchList.length) {
                setQuickPreset(loaded.quickSearchList[0]);
            } else if (DEFAULT_QUICK_SEARCH_TEMPLATES.length) {
                setQuickPreset(DEFAULT_QUICK_SEARCH_TEMPLATES[0]);
            }
        });

        return () => window.removeEventListener('keydown', handleKey);
    }, []);

    const handleSaveSettings = async () => {
        await SettingsService.save(settings);
        alert('Settings Saved!');
    };

    const allSites = SiteCatalogService.getAllSites();

    const getQuickSearchPresetLabel = (line: string) => {
        const anchorText = line.match(/>([^<]+)<\/a>/i)?.[1];
        if (anchorText) return anchorText.trim();
        const pipe = line.split('|');
        if (pipe.length > 1) return pipe[0].trim();
        if (line.match(/^https?:\/\//i)) {
            try {
                return new URL(line).hostname.replace(/^www\./, '');
            } catch {
                return line;
            }
        }
        return line;
    };

    const quickSearchPresets = Array.from(new Set([
        ...DEFAULT_QUICK_SEARCH_TEMPLATES,
        ...(settings.quickSearchPresets || [])
    ]));
    const toggleSite = (name: string) => {
        const set = new Set(settings.enabledSites || []);
        if (set.has(name)) {
            set.delete(name);
        } else {
            set.add(name);
        }
        setSettings({ ...settings, enabledSites: Array.from(set) });
    };

    const toggleFavoriteSite = (name: string) => {
        const set = new Set(settings.favoriteSites || []);
        if (set.has(name)) {
            set.delete(name);
        } else {
            set.add(name);
        }
        setSettings({ ...settings, favoriteSites: Array.from(set) });
    };

    const selectAllSites = () => {
        setSettings({ ...settings, enabledSites: SiteCatalogService.getAllSiteNames() });
    };

    const clearAllSites = () => {
        setSettings({ ...settings, enabledSites: [] });
    };

    if (!isOpen) {
        // ... (Keep existing trigger)
        return (
            <div
                style={{
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    zIndex: 99999,
                    background: '#2c3e50',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    width: '50px',
                    height: '50px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    fontSize: '24px'
                }}
                onClick={() => setIsOpen(true)}
                title="Open Auto-Feed Settings (Alt+S)"
            >
                ⚙️
            </div>
        );
    }

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.5)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }} onClick={(e) => {
            // Close on backdrop click
            if (e.target === e.currentTarget) setIsOpen(false);
        }}>
            <div style={{
                width: '800px',
                height: '600px',
                background: 'white',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                boxShadow: '0 5px 20px rgba(0,0,0,0.5)'
            }} onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div style={{
                    padding: '15px 20px',
                    background: '#f8f9fa',
                    borderBottom: '1px solid #dee2e6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <h2 style={{ margin: 0, fontSize: '18px', color: '#333' }}>Auto-Feed Refactor</h2>
                    <button
                        onClick={() => setIsOpen(false)}
                        style={{
                            background: 'none',
                            border: 'none',
                            fontSize: '20px',
                            cursor: 'pointer',
                            color: '#6c757d'
                        }}
                    >×</button>
                </div>

                {/* Tabs */}
                <div style={{
                    display: 'flex',
                    borderBottom: '1px solid #dee2e6',
                    background: '#fff'
                }}>
                    {['dashboard', 'settings', 'sites', 'logs'].map(tab => (
                        <div
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            style={{
                                padding: '10px 20px',
                                cursor: 'pointer',
                                borderBottom: activeTab === tab ? '2px solid #007bff' : '2px solid transparent',
                                color: activeTab === tab ? '#007bff' : '#495057',
                                fontWeight: activeTab === tab ? 'bold' : 'normal',
                                textTransform: 'capitalize'
                            }}
                        >
                            {tab}
                        </div>
                    ))}
                </div>

                {/* Content */}
                <div style={{ flex: 1, padding: '20px', overflowY: 'auto', background: '#fff', color: '#333' }}>
                    {activeTab === 'dashboard' && (
                        <div>
                            <p>Status: <span style={{ color: 'green', fontWeight: 'bold' }}>Active</span></p>
                            <p>Current Site: {window.location.hostname}</p>
                            <p>Tip: Use Alt+S to toggle this menu.</p>
                        </div>
                    )}
                    {activeTab === 'settings' && (
                        <div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>CHD 站点域名</label>
                                <select
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    value={settings.chdBaseUrl}
                                    onChange={(e) => {
                                        const value = e.currentTarget.value;
                                        const normalized = value.endsWith('/') ? value : `${value}/`;
                                        setSettings({ ...settings, chdBaseUrl: normalized });
                                    }}
                                >
                                    <option value="https://chdbits.co/">chdbits.co (默认)</option>
                                    <option value="https://ptchdbits.co/">ptchdbits.co</option>
                                    <option value="https://ptchdbits.org/">ptchdbits.org</option>
                                    <option value="https://chddiy.xyz/">chddiy.xyz</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>PtpImg API Key</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    value={settings.ptpImgApiKey}
                                    onInput={(e) => setSettings({ ...settings, ptpImgApiKey: e.currentTarget.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Pixhost API Key</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    value={settings.pixhostApiKey}
                                    onInput={(e) => setSettings({ ...settings, pixhostApiKey: e.currentTarget.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Freeimage API Key</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    value={settings.freeimageApiKey}
                                    onInput={(e) => setSettings({ ...settings, freeimageApiKey: e.currentTarget.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Gifyu API Key</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    value={settings.gifyuApiKey}
                                    onInput={(e) => setSettings({ ...settings, gifyuApiKey: e.currentTarget.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>HDBImg API Key (可选)</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    value={settings.hdbImgApiKey}
                                    onInput={(e) => setSettings({ ...settings, hdbImgApiKey: e.currentTarget.value })}
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>HDBImg API Endpoint</label>
                                <input
                                    type="text"
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                    value={settings.hdbImgEndpoint}
                                    onInput={(e) => setSettings({ ...settings, hdbImgEndpoint: e.currentTarget.value })}
                                />
                                <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                    默认：https://hdbimg.com/api/1/upload，如接口不同可自行修改
                                </div>
                            </div>
                            <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>页面增强功能</div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!settings.ptpShowDouban}
                                        onChange={() => setSettings({ ...settings, ptpShowDouban: !settings.ptpShowDouban })}
                                    />
                                    <span>PTP 中文评分/简介</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!settings.ptpShowGroupName}
                                        onChange={() => setSettings({ ...settings, ptpShowGroupName: !settings.ptpShowGroupName })}
                                    />
                                    <span>PTP 组名显示</span>
                                </label>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px', paddingLeft: '18px' }}>
                                    <span style={{ color: '#666' }}>组名位置:</span>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <input
                                            type="radio"
                                            name="ptp_name_location"
                                            value="0"
                                            checked={settings.ptpNameLocation === 0}
                                            onChange={() => setSettings({ ...settings, ptpNameLocation: 0 })}
                                        />
                                        <span>前</span>
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                        <input
                                            type="radio"
                                            name="ptp_name_location"
                                            value="1"
                                            checked={settings.ptpNameLocation !== 0}
                                            onChange={() => setSettings({ ...settings, ptpNameLocation: 1 })}
                                        />
                                        <span>后</span>
                                    </label>
                                </div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!settings.hdbShowDouban}
                                        onChange={() => setSettings({ ...settings, hdbShowDouban: !settings.hdbShowDouban })}
                                    />
                                    <span>HDB 中文豆瓣信息</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!settings.hdbHideDouban}
                                        onChange={() => setSettings({ ...settings, hdbHideDouban: !settings.hdbHideDouban })}
                                    />
                                    <span>HDB 豆瓣信息默认折叠</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '10px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!settings.showQuickSearchOnDouban}
                                        onChange={() => setSettings({ ...settings, showQuickSearchOnDouban: !settings.showQuickSearchOnDouban })}
                                    />
                                    <span>豆瓣页面快速搜索/工具</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!settings.showQuickSearchOnImdb}
                                        onChange={() => setSettings({ ...settings, showQuickSearchOnImdb: !settings.showQuickSearchOnImdb })}
                                    />
                                    <span>IMDb 页面快速搜索/工具</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                        type="checkbox"
                                        checked={!!settings.enableRemoteSidebar}
                                        onChange={() => setSettings({ ...settings, enableRemoteSidebar: !settings.enableRemoteSidebar })}
                                    />
                                    <span>启用远程推送侧边栏</span>
                                </label>
                                <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                                    远程推送 JSON 配置：
                                </div>
                                <input
                                    type="file"
                                    accept=".json,application/json"
                                    onChange={(e) => {
                                        const file = e.currentTarget.files?.[0];
                                        if (!file) return;
                                        const reader = new FileReader();
                                        reader.onload = (evt) => {
                                            try {
                                                const json = JSON.parse(String(evt.target?.result || '{}'));
                                                setSettings({ ...settings, remoteServer: json });
                                                alert('远程服务器配置已加载');
                                            } catch (err) {
                                                alert('JSON 解析失败，请检查格式');
                                            }
                                        };
                                        reader.readAsText(file);
                                    }}
                                />
                                {settings.remoteServer && (
                                    <pre style={{ marginTop: '8px', padding: '8px', background: '#fff', border: '1px solid #ddd', borderRadius: '4px', maxHeight: '150px', overflow: 'auto' }}>
                                        {JSON.stringify(settings.remoteServer, null, 2)}
                                    </pre>
                                )}
                            </div>
                            <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>外站信息获取</div>
                                <div style={{ marginBottom: '6px', color: '#666' }}>选择 IMDb 到豆瓣 ID 的获取方式</div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <input
                                        type="radio"
                                        name="imdb2douban_method"
                                        value="0"
                                        checked={settings.imdbToDoubanMethod === 0}
                                        onChange={() => setSettings({ ...settings, imdbToDoubanMethod: 0 })}
                                    />
                                    <span>豆瓣 API</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                        type="radio"
                                        name="imdb2douban_method"
                                        value="1"
                                        checked={settings.imdbToDoubanMethod === 1}
                                        onChange={() => setSettings({ ...settings, imdbToDoubanMethod: 1 })}
                                    />
                                    <span>豆瓣爬取</span>
                                </label>

                                <div style={{ marginTop: '10px', marginBottom: '6px', color: '#666' }}>选择 PTGen 的 API 节点</div>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <input
                                        type="radio"
                                        name="ptgen_api"
                                        value="0"
                                        checked={settings.ptgenApi === 0}
                                        onChange={() => setSettings({ ...settings, ptgenApi: 0 })}
                                    />
                                    <span>api.iyuu.cn</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                                    <input
                                        type="radio"
                                        name="ptgen_api"
                                        value="1"
                                        checked={settings.ptgenApi === 1}
                                        onChange={() => setSettings({ ...settings, ptgenApi: 1 })}
                                    />
                                    <span>ptgen</span>
                                </label>
                                <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <input
                                        type="radio"
                                        name="ptgen_api"
                                        value="3"
                                        checked={settings.ptgenApi === 3}
                                        onChange={() => setSettings({ ...settings, ptgenApi: 3 })}
                                    />
                                    <span>豆瓣页面爬取</span>
                                </label>
                            </div>
                            <div style={{ marginBottom: '15px', padding: '10px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>快速搜索站点设置</div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                    <select
                                        style={{ flex: 1, padding: '6px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                        value={quickPreset}
                                        onChange={(e) => setQuickPreset(e.currentTarget.value)}
                                    >
                                        {quickSearchPresets.map((line) => (
                                            <option key={line} value={line}>
                                                {getQuickSearchPresetLabel(line)}
                                            </option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => {
                                            if (!quickPreset) return;
                                            const set = new Set(settings.quickSearchList || []);
                                            set.add(quickPreset);
                                            setSettings({ ...settings, quickSearchList: Array.from(set) });
                                        }}
                                        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#f5f5f5' }}
                                    >
                                        新增
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                    <input
                                        type="text"
                                        placeholder="自定义模板（支持 <a href=...> 或 Name|URL）"
                                        style={{ flex: 1, padding: '6px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                        value={quickPresetInput}
                                        onInput={(e) => setQuickPresetInput(e.currentTarget.value)}
                                    />
                                    <button
                                        onClick={() => {
                                            const value = quickPresetInput.trim();
                                            if (!value) return;
                                            const set = new Set(settings.quickSearchPresets || []);
                                            set.add(value);
                                            setSettings({ ...settings, quickSearchPresets: Array.from(set) });
                                            setQuickPresetInput('');
                                        }}
                                        style={{ padding: '6px 10px', border: '1px solid #ddd', borderRadius: '4px', cursor: 'pointer', background: '#f5f5f5' }}
                                    >
                                        加入下拉框
                                    </button>
                                </div>
                                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                                    <label style={{ color: '#666' }}>输入框高度(px)</label>
                                    <input
                                        type="number"
                                        min={120}
                                        max={600}
                                        style={{ width: '120px', padding: '6px', border: '1px solid #ced4da', borderRadius: '4px' }}
                                        value={settings.quickSearchTextareaHeight || 220}
                                        onInput={(e) => {
                                            const value = parseInt(e.currentTarget.value, 10);
                                            setSettings({ ...settings, quickSearchTextareaHeight: Number.isFinite(value) ? value : 220 });
                                        }}
                                    />
                                </div>
                                <textarea
                                    style={{
                                        width: '100%',
                                        height: `${settings.quickSearchTextareaHeight || 220}px`,
                                        padding: '8px',
                                        border: '1px solid #ced4da',
                                        borderRadius: '4px',
                                        fontFamily: 'monospace',
                                        fontSize: '12px'
                                    }}
                                    value={(settings.quickSearchList || []).join('\n')}
                                    onInput={(e) => {
                                        const lines = e.currentTarget.value.split('\n').map((line) => line.trim()).filter(Boolean);
                                        setSettings({ ...settings, quickSearchList: lines });
                                    }}
                                />
                                <div style={{ marginTop: '6px', fontSize: '12px', color: '#666' }}>
                                    每行一个模板，支持占位符：
                                    {' '}
                                    <code>{'{imdbid}'}</code>
                                    {' '}
                                    <code>{'{imdbno}'}</code>
                                    {' '}
                                    <code>{'{search_name}'}</code>
                                    {' '}
                                    <code>{'{title}'}</code>
                                    {' '}
                                    <code>{'{doubanid}'}</code>
                                </div>
                            </div>
                            <button
                                onClick={handleSaveSettings}
                                style={{
                                    padding: '10px 20px',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}
                            >
                                Save Settings
                            </button>
                        </div>
                    )}
                    {activeTab === 'sites' && (
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                <h3>转发站点设置</h3>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                    <button onClick={selectAllSites} style={{ padding: '5px 10px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>全选</button>
                                    <button onClick={clearAllSites} style={{ padding: '5px 10px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>取消全选</button>
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))', gap: '8px', padding: '10px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}>
                                {allSites.map((site) => (
                                    <label key={site.name} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                        <input
                                            type="checkbox"
                                            checked={(settings.enabledSites || []).includes(site.name)}
                                            onChange={() => toggleSite(site.name)}
                                        />
                                        <span title={site.description || ''}>{site.name}</span>
                                    </label>
                                ))}
                            </div>
                            <div style={{ marginTop: '20px' }}>
                                <button
                                    onClick={handleSaveSettings}
                                    style={{
                                        padding: '10px 20px',
                                        background: '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer'
                                    }}
                                >
                                    Save Sites
                                </button>
                            </div>

                            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <h3 style={{ marginBottom: '12px' }}>常用站点设置</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, minmax(120px, 1fr))', gap: '8px', padding: '10px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}>
                                    {allSites.map((site) => (
                                        <label key={`fav-${site.name}`} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px' }}>
                                            <input
                                                type="checkbox"
                                                checked={(settings.favoriteSites || []).includes(site.name)}
                                                onChange={() => toggleFavoriteSite(site.name)}
                                            />
                                            <span title={site.description || ''}>{site.name}</span>
                                        </label>
                                    ))}
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <button
                                        onClick={handleSaveSettings}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Save Favorites
                                    </button>
                                </div>
                            </div>

                            <div style={{ marginTop: '30px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
                                <h3 style={{ marginBottom: '12px' }}>是否在种子列表页显示快速搜索</h3>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {(['PTP', 'HDB', 'HDT', 'UHD'] as const).map((key) => (
                                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <input
                                                type="checkbox"
                                                checked={!!settings.showSearchOnList?.[key]}
                                                onChange={() =>
                                                    setSettings({
                                                        ...settings,
                                                        showSearchOnList: {
                                                            ...settings.showSearchOnList,
                                                            [key]: !settings.showSearchOnList?.[key]
                                                        }
                                                    })
                                                }
                                            />
                                            <span>{key}</span>
                                        </label>
                                    ))}
                                </div>
                                <div style={{ marginTop: '20px' }}>
                                    <button
                                        onClick={handleSaveSettings}
                                        style={{
                                            padding: '10px 20px',
                                            background: '#007bff',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Save Search Toggles
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeTab === 'logs' && (
                        <div>
                            <p>Logs placeholder...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
