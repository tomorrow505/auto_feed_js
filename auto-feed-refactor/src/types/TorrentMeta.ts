export interface TorrentMeta {
    // Basic Info
    title: string;
    subtitle?: string;
    smallDescr?: string; // Legacy small description (副标题)
    description: string; // BBCode

    // Media Specifications
    resolution?: '4320p' | '2160p' | '1080p' | '1080i' | '720p' | 'SD';
    codec?: 'H.264' | 'H.265' | 'MPEG-2' | 'VC-1' | 'XviD' | 'AV1' | 'VP9';
    audioCodec?: string;
    processing?: string; // HDR, DoVi, etc.
    medium?: 'Blu-ray' | 'Encode' | 'WEB-DL' | 'Remux' | 'DVD' | 'HDTV';

    // Legacy/Derived Fields (keep for parity with old script)
    type?: string; // 电影/剧集/纪录/综艺/动漫/音乐/体育/MV/学习/软件/游戏/书籍
    mediumSel?: string;
    codecSel?: string;
    audioCodecSel?: string;
    standardSel?: string;
    sourceSel?: string;
    editionInfo?: string;
    musicMedia?: string;
    tracklist?: string;
    originSite?: string;
    labelFlags?: number;
    labelInfo?: Record<string, boolean>;

    // IDs & External Links
    imdbId?: string;
    doubanId?: string;
    tmdbId?: string;
    imdbUrl?: string;
    doubanUrl?: string;
    tmdbUrl?: string;

    // Source Info
    sourceSite: string;
    sourceUrl: string;

    // Advanced
    originalDom?: string; // Store key HTML snippets if needed
    images: string[];

    // Size
    size?: number; // Bytes

    // Torrent File Info
    torrentUrl?: string;     // The download URL on the source site
    torrentBase64?: string;  // The file content in Base64
    torrentFilename?: string; // e.g. "Movie.Year.1080p.mkv.torrent"
    torrentName?: string;     // Legacy alias for filename

    // Extra raw fields (legacy parity)
    fullMediaInfo?: string;
    synopsis?: string;
}
