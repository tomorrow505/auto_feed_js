import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { parseKG, fillKG } from '../templates/kg';

export class KGEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing KG page...');
        return parseKG(this.config, this.currentUrl);
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling KG form...');
        await fillKG(meta, this.config);
    }
}
