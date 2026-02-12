import { SiteConfig } from '../types/SiteConfig';
import { NexusSites } from '../config/sites_nexus';
import { GazelleSites } from '../config/sites_gazelle';
import { Unit3DSites } from '../config/sites_unit3d';

export const DEFAULT_ENABLED_SITE_NAMES = [
    // Default enabled sites (user can edit in Settings).
    'PTP',
    'HDB',
    'PTer',
    'HDSky',
    'CHDBits',
    'CMCT',
    'Audiences',
    'BLU',
    'Tik',
    'KG',
    // Additional legacy sites commonly used as source/target.
    'GPW',
    'MTeam',
    'OurBits',
    'TTG',
    'HDHome',
    'OpenCD',
    'OPS',
    'DIC',
    'RED',
    'Monika'
] as const;

const CHINESE_NEXUS_SITES = new Set([
    'TTG',
    'PTer',
    'HDSky',
    'CHDBits',
    'CMCT',
    'FRDS',
    'HDHome',
    'OurBits',
    'OpenCD',
    'Audiences'
]);

export function isChineseNexusSite(siteName: string): boolean {
    return CHINESE_NEXUS_SITES.has(siteName);
}

export class SiteCatalogService {
    static getAllSites(): SiteConfig[] {
        return [...NexusSites, ...GazelleSites, ...Unit3DSites];
    }

    static getSupportedSites(): SiteConfig[] {
        // "Supported" means we have a config entry and a canonical baseUrl.
        // Do not gate by a hardcoded allow-list; users may customize enabled/favorite sites.
        return this.getAllSites().filter((s) => !!s.baseUrl);
    }

    static getAllSiteNames(): string[] {
        return this.getAllSites().map((s) => s.name);
    }

    static getSupportedSiteNames(): string[] {
        return this.getSupportedSites().map((s) => s.name);
    }

    static getDefaultEnabledSiteNames(): string[] {
        // Default to a curated subset, but only keep those that exist in config.
        const supported = new Set(this.getSupportedSiteNames());
        return (DEFAULT_ENABLED_SITE_NAMES as readonly string[]).filter((name) => supported.has(name));
    }
}
