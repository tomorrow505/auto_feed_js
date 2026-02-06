
export class MetaCleaner {
    /**
     * Cleaning rules:
     * 1. Remove [url] wrapping images (often points to image hosts or tracking)
     * 2. Remove "Transferred by", "Thanks", "Staff" footprints
     * 3. Remove tracker announce URLs if found
     * 4. Standardize spacing
     */
    static clean(meta: any): any {
        let desc = meta.description || '';

        // 1. Remove [url] wrappers around [img]
        // Matches [url=...][img]...[/img][/url] and keeps only [img]...[/img]
        desc = desc.replace(/\[url=[^\]]+\](\[img\].*?\[\/img\])\[\/url\]/gi, '$1');
        desc = desc.replace(/\[url\](\[img\].*?\[\/img\])\[\/url\]/gi, '$1');

        // 2. Remove specific tracker footprints
        // Common regex for "Uploaded by", "Transferred from", "Reposted"
        const footprints = [
            /Transferred by.*?/gi,
            /Uploaded by.*?/gi,
            /Reposted from.*?/gi,
            /\[quote\].*?Internal.*?\[\/quote\]/gis, // Remove internal quotes sometimes
            /This torrent was uploaded by.*/gi,
            /Originally uploaded by.*/gi
        ];

        footprints.forEach(regex => {
            desc = desc.replace(regex, '');
        });

        // 3. Remove "Thanks to" sections often found at bottom
        desc = desc.replace(/\[quote\]Thanks to.*?\[\/quote\]/gis, '');

        // 4. Remove empty quotes
        desc = desc.replace(/\[quote\]\s*\[\/quote\]/g, '');

        // 5. Trim multiple newlines
        desc = desc.replace(/\n\s*\n\s*\n/g, '\n\n');

        return {
            ...meta,
            description: desc.trim()
        };
    }
}
