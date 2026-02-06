import { SiteCatalogService } from './SiteCatalogService';
import { GMAdapter } from './GMAdapter';
import { DEFAULT_QUICK_SEARCH_TEMPLATES } from './QuickSearchTemplateService';

export interface AppSettings {
    ptpImgApiKey: string;
    pixhostApiKey: string;
    freeimageApiKey: string;
    gifyuApiKey: string;
    hdbImgApiKey: string;
    hdbImgEndpoint: string;
    doubanCookie: string;
    tmdbApiKey: string;
    chdBaseUrl: string;
    ptpShowDouban: boolean;
    ptpShowGroupName: boolean;
    ptpNameLocation: number;
    hdbShowDouban: boolean;
    hdbHideDouban: boolean;
    showQuickSearchOnDouban: boolean;
    showQuickSearchOnImdb: boolean;
    enableRemoteSidebar: boolean;
    remoteServer: RemoteServerConfig | null;
    imdbToDoubanMethod: number; // 0: Douban API, 1: Douban scrape
    ptgenApi: number; // 0: api.iyuu.cn, 1: ptgen, 3: Douban page scrape
    quickSearchList: string[];
    quickSearchPresets: string[];
    quickSearchTextareaHeight: number;
    enabledSites: string[];
    favoriteSites: string[];
    showSearchOnList: {
        PTP: boolean;
        HDB: boolean;
        HDT: boolean;
        UHD: boolean;
    };
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
}

const DEFAULT_SETTINGS: AppSettings = {
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
    quickSearchList: DEFAULT_QUICK_SEARCH_TEMPLATES.slice(),
    quickSearchPresets: [],
    quickSearchTextareaHeight: 220,
    enabledSites: SiteCatalogService.getDefaultEnabledSiteNames(),
    favoriteSites: ['TTG', 'CMCT', 'pterclub', 'CHDBits', 'BHD', 'MTeam'].filter((name) =>
        SiteCatalogService.getAllSiteNames().includes(name)
    ),
    showSearchOnList: {
        PTP: true,
        HDB: false,
        HDT: false,
        UHD: false
    }
};

export class SettingsService {
    private static KEY = 'auto_feed_settings';

    static async load(): Promise<AppSettings> {
        return new Promise((resolve) => {
            try {
                GMAdapter.getValue<string | null>(this.KEY, null).then((stored) => {
                    if (stored) {
                        resolve({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
                        return;
                    }
                    resolve({ ...DEFAULT_SETTINGS });
                });
                return;
            } catch (e) {
                console.error('Error loading settings', e);
            }
            resolve({ ...DEFAULT_SETTINGS });
        });
    }

    static async save(settings: AppSettings): Promise<void> {
        return new Promise((resolve) => {
            const data = JSON.stringify(settings);
            GMAdapter.setValue(this.KEY, data).then(() => resolve());
        });
    }
}
