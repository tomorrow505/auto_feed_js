
export interface MediaInfoResult {
    mediainfo: string;
    screenshots: string[];
    description: string; // The remaining description without images/mediainfo
}

export class MediaInfoParser {
    // Regex to match BBCode images
    private static readonly IMG_REGEX = /(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/ig;
    private static readonly MEDIAINFO_KEYWORDS = /General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率|DISC INFO:|\.MPLS|Video Codec|Disc Label/i;
    private static readonly BD_KEYWORDS = /DISC INFO:|\.MPLS|Video Codec|Disc Label/i;

    /**
     * Parses description to extract MediaInfo and Screenshots.
     * Matches legacy logic from `get_mediainfo_picture_from_descr`
     */
    static parse(description: string): MediaInfoResult {
        let mediainfo = '';
        const screenshots: string[] = [];
        let cleanDescription = description;

        // 1. Extract Images
        const imgMatches = description.match(this.IMG_REGEX);
        if (imgMatches) {
            // Legacy logic tries to keep the cover image (first image or before '◎译名' etc)
            // For simplicity in refactor, we extract all images that look like screenshots
            // TODO: Refine cover image detection if needed

            // Remove images from description
            imgMatches.forEach(img => {
                // Check if it's likely a cover (usually at the very top)
                // Legacy uses index check. We will assume parsing engine handles cover separately.
                cleanDescription = cleanDescription.replace(img, '');

                // Extract URL
                const urlMatch = img.match(/\[img\](.*?)\[\/img\]/);
                if (urlMatch) {
                    screenshots.push(urlMatch[1]);
                }
            });
        }

        // 2. Extract MediaInfo
        try {
            // Check for BD Info style
            if (description.match(this.BD_KEYWORDS)) {
                const match = description.match(/\[quote.*?\][\s\S]*?(DISC INFO|\.MPLS|Video Codec|Disc Label)[\s\S]*?\[\/quote\]/i);
                if (match) mediainfo = match[0];
            }
            // Check for Standard MediaInfo style
            else if (description.match(this.MEDIAINFO_KEYWORDS)) {
                const matches = description.match(/\[quote.*?\][\s\S]*?(General|RELEASE.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率)[\s\S]*?\[\/quote\]/ig);
                if (matches) {
                    mediainfo = matches.join('\n\n');
                }
            }
        } catch (e) {
            console.error('Error extracting MediaInfo:', e);
        }

        // Fallback: simple text match for DISC INFO if quote parsing failed
        if (!mediainfo && description.match(/\n.*DISC INFO:[\s\S]*kbps.*/)) {
            const match = description.match(/\n.*DISC INFO:[\s\S]*kbps.*/);
            if (match) mediainfo = match[0].trim();
        }

        // 3. Clean MediaInfo (Remove quotes and formatting)
        if (mediainfo) {
            // Remove from description
            cleanDescription = cleanDescription.replace(mediainfo, '');

            // Clean tags
            mediainfo = mediainfo.replace(/\[quote.*?\]/ig, ''); // Remove opening quote
            mediainfo = mediainfo.replace(/\[\/quote\]/ig, '');  // Remove closing quote
            mediainfo = mediainfo.replace(/\[\/?(font|size|quote|color).{0,80}?\]/ig, ''); // Remove other tags
            mediainfo = mediainfo.trim();
        }

        return {
            mediainfo,
            screenshots,
            description: cleanDescription.trim()
        };
    }
}
