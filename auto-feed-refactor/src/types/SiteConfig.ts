
import { TorrentMeta } from './TorrentMeta';

export enum SiteType {
    NexusPHP = 'NexusPHP',
    Gazelle = 'Gazelle',
    Unit3D = 'Unit3D',
    Unit3DClassic = 'Unit3DClassic',
    MTeam = 'MTeam',
    CHDBits = 'CHDBits',
    BHD = 'BHD',
    PTP = 'PTP',
    HDB = 'HDB',
    KG = 'KG',
    Avistaz = 'Avistaz',
    General = 'General'
}

export interface SiteSelectors {
    title?: string | string[];
    subtitle?: string | string[];
    description?: string | string[];
    imdb?: string | string[];
    douban?: string | string[];
    // Upload form selectors
    nameInput?: string;
    descrInput?: string;
    smallDescrInput?: string;
    imdbInput?: string;
    doubanInput?: string;
    torrentInput?: string;
}

export interface SiteConfig {
    name: string;
    type: SiteType;
    keywords: string[]; // Domains or URL patterns to match
    description?: string; // Human readable description
    baseUrl?: string; // Canonical base URL for cross-site links

    // URL matching patterns
    match?: {
        source?: RegExp[];
        target?: RegExp[];
    };

    // Custom selectors override
    selectors?: SiteSelectors;

    // Feature flags
    features?: {
        imdbSearch?: boolean;
        doubanSearch?: boolean;
        autoFill?: boolean;
    };

    // Legacy "site_info" compatibility if needed
    legacyUrl?: string;
}
