
export interface ExternalMeta {
    imdbId?: string;
    doubanId?: string;
    imdbRating?: string;
    doubanRating?: string;
    doubanVote?: string;
    description?: string; // from doubam
    poster?: string;
}

export class ExternalMetaService {

    /**
     * Fetch Douban info by ID
     */
    static async getDoubanInfo(doubanId: string): Promise<ExternalMeta | null> {
        // TODO: Port `getDoc` logic for Douban
        console.log(`Fetching Douban info for ${doubanId}`);
        return null;
    }

    /**
     * Search Douban by IMDb ID
     */
    static async searchDouban(imdbId: string): Promise<string | null> {
        // TODO: Port search logic
        return null;
    }
}
