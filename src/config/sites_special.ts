import { SiteConfig, SiteType } from '../types/SiteConfig';

// Site-specific/non-framework trackers. Keep them out of Nexus/Gazelle/Unit3D
// buckets so future adapter work has an obvious home.
export const SpecialSites: SiteConfig[] = [
    {
        name: 'HDB',
        type: SiteType.HDB,
        keywords: ['hdbits.org'],
        baseUrl: 'https://hdbits.org/',
        description: 'HDBits'
    },
    {
        name: 'KG',
        type: SiteType.KG,
        keywords: ['karagarga.in'],
        baseUrl: 'https://karagarga.in/',
        description: 'Karagarga'
    },
    {
        name: 'HDT',
        type: SiteType.HDT,
        keywords: ['hd-torrents.org', 'hdts.ru'],
        baseUrl: 'https://hd-torrents.org/',
        mirrorUrl: 'https://hdts.ru/',
        description: 'HD-Torrents'
    }
];
