
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { parseNexus, fillNexus } from '../templates/nexus';

export class NexusPHPEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing NexusPHP page...');
        const meta = await parseNexus(this.config, this.currentUrl);
        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling NexusPHP form...');
        await fillNexus(meta, this.config);
    }
}
