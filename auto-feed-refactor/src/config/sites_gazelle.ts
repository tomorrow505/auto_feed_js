
import { SiteConfig, SiteType } from '../types/SiteConfig';

export const GazelleSites: SiteConfig[] = [
    {
        name: 'RED',
        type: SiteType.Gazelle,
        keywords: ['redacted.sh'],
        baseUrl: 'https://redacted.sh/',
        description: 'Redacted',
        features: {
            imdbSearch: false,
            doubanSearch: false,
        }
    },
    {
        name: 'OPS',
        type: SiteType.Gazelle,
        keywords: ['orpheus.network'],
        baseUrl: 'https://orpheus.network/',
        description: 'Orpheus',
    },
    {
        name: 'DIC',
        type: SiteType.Gazelle,
        keywords: ['dicmusic.com'],
        baseUrl: 'https://dicmusic.com/',
        description: 'DICMusic'
    }
];
