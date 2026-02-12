import { SiteCatalogService } from './SiteCatalogService';
import { GMAdapter } from './GMAdapter';
import { DEFAULT_QUICK_SEARCH_TEMPLATES } from '../common/quickSearch';

export interface AppSettings {
    ptpImgApiKey: string;
    pixhostApiKey: string;
    freeimageApiKey: string;
    gifyuApiKey: string;
    doubanCookie: string;
    tmdbApiKey: string;
    chdBaseUrl: string;
    tlBaseUrl: string;
    ptpShowDouban: boolean;
    ptpShowGroupName: boolean;
    ptpNameLocation: number;
    hdbShowDouban: boolean;
    hdbHideDouban: boolean;
    showQuickSearchOnDouban: boolean;
    showQuickSearchOnImdb: boolean;
    defaultAnonymous: boolean;
    autoDownloadAfterUpload: boolean;
    remoteSidebarOpacity: number; // 0.3 - 1.0
    settingsPanelOpacity: number; // 0.3 - 1.0
    popupOpacity: number; // 0.3 - 1.0 (forward popup, toolbox panel, dialogs)
    maskOpacity: number; // 0.1 - 0.8 (modal backdrops)
    toastOpacity: number; // 0.3 - 1.0 (toasts)
    enableRemoteSidebar: boolean;
    remoteSkipCheckingDefault: boolean;
    remoteAskSkipConfirm: boolean;
    remoteServer: RemoteServerConfig | null;
    imdbToDoubanMethod: number; // 0: Douban API, 1: Douban scrape
    ptgenApi: number; // 0: api.iyuu.cn, 1: ptgen, 3: Douban page scrape
    quickSearchList: string[];
    quickSearchPresets: string[];
    enabledSites: string[];
    favoriteSites: string[];
    showSearchOnList: {
        PTP: boolean;
        HDB: boolean;
        HDT: boolean;
        UHD: boolean;
    };
    uiLanguage: 'zh' | 'en';
}

// Built-in default (from v3 `used_tmdb_key`), used when user didn't configure one.
export const FALLBACK_TMDB_API_KEY = '0f79586eb9d92afa2b7266f7928b055c';

export function getEffectiveTmdbApiKey(settings?: Pick<AppSettings, 'tmdbApiKey'> | null): string {
    const k = (settings?.tmdbApiKey || '').trim();
    return k || FALLBACK_TMDB_API_KEY;
}

export interface RemoteServerConfig {
    qbittorrent?: Record<string, {
        url: string;
        username: string;
        password: string;
        path: Record<string, string>;
    }>;
    transmission?: Record<string, {
        url: string;
        username: string;
        password: string;
        path: Record<string, string>;
    }>;
    deluge?: Record<string, {
        url: string;
        password: string;
        path: Record<string, string>;
    }>;
}

const DEFAULT_SETTINGS: AppSettings = {
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
    quickSearchList: DEFAULT_QUICK_SEARCH_TEMPLATES.slice(),
    quickSearchPresets: [],
    enabledSites: SiteCatalogService.getDefaultEnabledSiteNames(),
    favoriteSites: ['PTer', 'CHDBits', 'HDSky', 'CMCT', 'Audiences', 'BLU', 'Tik', 'KG']
        .filter((name) => SiteCatalogService.getSupportedSiteNames().includes(name)),
    showSearchOnList: {
        PTP: true,
        HDB: false,
        HDT: false,
        UHD: false
    },
    uiLanguage: 'zh'
};

export class SettingsService {
    private static KEY = 'auto_feed_settings';

    private static migrate(settings: AppSettings): AppSettings {
        // Rename site key: `pterclub` -> `PTer` (legacy parity + torrent `source` field correctness).
        const rename = (v: string) => (v === 'pterclub' ? 'PTer' : v);
        const supported = new Set(SiteCatalogService.getSupportedSiteNames());
        const enabledSites = Array.from(new Set((settings.enabledSites || []).map(rename))).filter((x) => supported.has(x));
        const favoriteSites = Array.from(new Set((settings.favoriteSites || []).map(rename))).filter((x) => enabledSites.includes(x));
        return { ...settings, enabledSites, favoriteSites };
    }

    static async load(): Promise<AppSettings> {
        return new Promise((resolve) => {
            try {
                GMAdapter.getValue<string | null>(this.KEY, null).then((stored) => {
                    if (stored) {
                        const merged = { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } as AppSettings;
                        resolve(this.migrate(merged));
                        return;
                    }
                    resolve(this.migrate({ ...DEFAULT_SETTINGS }));
                });
                return;
            } catch (e) {
                console.error('Error loading settings', e);
            }
            resolve(this.migrate({ ...DEFAULT_SETTINGS }));
        });
    }

    static async save(settings: AppSettings): Promise<void> {
        return new Promise((resolve) => {
            const data = JSON.stringify(this.migrate(settings));
            GMAdapter.setValue(this.KEY, data).then(() => resolve());
        });
    }
}
