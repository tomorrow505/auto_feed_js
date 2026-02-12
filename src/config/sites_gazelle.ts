
import { SiteConfig, SiteType } from '../types/SiteConfig';

export const GazelleSites: SiteConfig[] = [
    {
        name: 'GPW',
        type: SiteType.Gazelle,
        keywords: ['greatposterwall.com'],
        baseUrl: 'https://greatposterwall.com/',
        description: 'GreatPosterWall'
    },
    {
        name: 'PTP',
        // PTP is a Gazelle (GZ) site. Keep a dedicated engine type for PTP-specific logic,
        // but group/configure it under the Gazelle site list for settings parity.
        type: SiteType.PTP,
        keywords: ['passthepopcorn.me'],
        baseUrl: 'https://passthepopcorn.me/',
        description: 'PassThePopcorn'
    },
    {
        name: 'RED',
        type: SiteType.Gazelle,
        keywords: ['redacted.ch', 'redacted.sh'],
        baseUrl: 'https://redacted.ch/',
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
