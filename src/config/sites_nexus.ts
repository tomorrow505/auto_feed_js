
import { SiteConfig, SiteType } from '../types/SiteConfig';

export const NexusSites: SiteConfig[] = [
    {
        name: 'OpenCD',
        type: SiteType.NexusPHP,
        keywords: ['open.cd'],
        baseUrl: 'https://open.cd/',
        description: 'OpenCD'
    },
    {
        name: 'HDHome',
        type: SiteType.NexusPHP,
        keywords: ['hdhome.org'],
        baseUrl: 'https://hdhome.org/',
        description: 'HDHome'
    },
    {
        name: 'MTeam',
        type: SiteType.MTeam,
        keywords: ['m-team.cc', 'm-team.io'],
        baseUrl: 'https://kp.m-team.cc/',
        description: 'M-Team TP (New AntD Layout)',
        features: {
            imdbSearch: true,
            doubanSearch: true,
        },
        selectors: {
            title: [
                'h2.ant-typography',           // New Antd
                '#top',                        // Legacy Nexus
                'h1#top',
                '.torrent-title',
                '.ant-descriptions-item-content:first'
            ],
            description: [
                'div[id="kdescr"]',            // Classic
                '.braft-output-content',       // New Editor
                '.ant-card-body .markdown',
                '#description'
            ],
            // Hardcode these for now to be safe
            nameInput: 'input#name',
            descrInput: 'textarea#description',
            imdbInput: 'input#imdb_id'
        }
    },
    {
        name: 'HDSky',
        type: SiteType.NexusPHP,
        keywords: ['hdsky.me'],
        baseUrl: 'https://hdsky.me/',
        description: 'HDSky'
    },
    {
        name: 'OurBits',
        type: SiteType.NexusPHP,
        keywords: ['ourbits.club'],
        baseUrl: 'https://ourbits.club/',
        description: 'OurBits'
    },
    {
        name: 'CMCT',
        type: SiteType.NexusPHP,
        keywords: ['hdcmct.org', 'springsunday.net'],
        baseUrl: 'https://springsunday.net/',
        description: 'SpringSunday'
    },
    {
        name: 'TTG',
        type: SiteType.NexusPHP,
        keywords: ['totheglory.im'],
        baseUrl: 'https://totheglory.im/',
        description: 'TTG (Nexus-like parsing)',
        // TTG detail pages use a different description container (`#kt_d`) and sometimes lack a structured subtitle row.
        // Rely on legacy normalization (`getSmallDescrFromDescr`) after parsing the raw description.
        selectors: {
            title: ['h1#top', 'h1'],
            description: ['#kt_d', '#kdescr', '#description']
        }
    },
    {
        name: 'PTer',
        type: SiteType.NexusPHP,
        keywords: ['pterclub.net'],
        baseUrl: 'https://pterclub.net/',
        description: 'Pter'
    },
    {
        name: 'Audiences',
        type: SiteType.NexusPHP,
        keywords: ['audiences.me'],
        baseUrl: 'https://audiences.me/',
        description: 'Audiences'
    },
    {
        name: 'FRDS',
        type: SiteType.NexusPHP,
        keywords: ['keepfrds.com'],
        baseUrl: 'https://keepfrds.com/',
        description: 'FRDS'
    },
    {
        name: 'CHDBits',
        type: SiteType.CHDBits,
        keywords: ['chdbits.co', 'ptchdbits.co', 'ptchdbits.org', 'chddiy.xyz', 'chdbits'],
        baseUrl: 'https://chdbits.co/',
        description: 'CHDBits',
        features: {
            imdbSearch: true
        }
    },
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
    }
];
