import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { parseMediaInfoFromDescription, type MediaInfoResult } from '../common/rules/media';

export abstract class BaseEngine {
    constructor(
        protected config: SiteConfig,
        protected currentUrl: string
    ) { }

    get siteName(): string {
        return this.config.name;
    }

    getConfig(): SiteConfig {
        return this.config;
    }

    /**
     * Scrape data from the current page
     */
    abstract parse(): Promise<TorrentMeta>;

    /**
     * Fill the upload form with data
     */
    abstract fill(meta: TorrentMeta): Promise<void>;

    protected log(message: string) {
        console.log(`[Auto-Feed][${this.siteName}] ${message}`);
    }

    protected error(message: string) {
        console.error(`[Auto-Feed][${this.siteName}] ${message}`);
    }

    protected selectOption(selectName: string, value: string) {
        // Simple helper to select option by value or text
        const $ = (window as any).$; // Assume jQuery is available
        const select = $(`select[name="${selectName}"]`);
        if (select.length === 0) return;

        // Try by value
        select.val(value);

        // If value didn't change (invalid option), try text match
        if (select.val() !== value) {
            select.find('option').each((_: number, el: any) => {
                if ($(el).text().includes(value)) {
                    $(el).prop('selected', true);
                }
            });
        }
    }

    protected parseMediaInfo(description: string): MediaInfoResult {
        return parseMediaInfoFromDescription(description);
    }
}
