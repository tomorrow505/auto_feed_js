
import { SiteConfig, SiteType } from '../types/SiteConfig';

export const Unit3DSites: SiteConfig[] = [
    {
        name: 'BLU',
        type: SiteType.Unit3DClassic,
        keywords: ['blutopia.cc'],
        baseUrl: 'https://blutopia.cc/',
        description: 'Blutopia'
    },
    {
        name: 'Tik',
        type: SiteType.Unit3DClassic,
        keywords: ['cinematik.net', 'cinematik.me', 'cinematik.cc'],
        baseUrl: 'https://cinematik.net/',
        description: 'Cinematik (Tik)'
    },
    {
        name: 'ACM',
        type: SiteType.Unit3DClassic,
        keywords: ['eiga.moi'],
        baseUrl: 'https://eiga.moi/',
        description: 'ACM'
    },
    {
        name: 'Monika',
        type: SiteType.Unit3DClassic,
        keywords: ['monikadesign.uk'],
        baseUrl: 'https://monikadesign.uk/',
        description: 'Monika'
    },
    {
        name: 'BHD',
        type: SiteType.BHD,
        keywords: ['beyond-hd.me', 'beyond-hd.xyz', 'beyond-hd.site', 'beyond-hd.io', 'beyond-hd.', 'beyondhd.co', 'beyondhd.'],
        baseUrl: 'https://beyond-hd.me/',
        description: 'Beyond-HD',
        features: {
            imdbSearch: true,
            doubanSearch: false,
        }
    },
    {
        name: 'HDF',
        type: SiteType.Unit3D,
        keywords: ['hdf.world'],
        baseUrl: 'https://hdf.world/',
        description: 'HDFans',
    },
    {
        name: 'PrivateHD',
        type: SiteType.Unit3D,
        keywords: ['privatehd.to'],
        baseUrl: 'https://privatehd.to/',
        description: 'PrivateHD'
    }
];
