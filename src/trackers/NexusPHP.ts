
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { parseNexus, fillNexus } from '../templates/nexus';

export class NexusPHPEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    protected async afterParse(meta: TorrentMeta): Promise<TorrentMeta> {
        return meta;
    }

    protected async beforeFill(meta: TorrentMeta): Promise<TorrentMeta> {
        return meta;
    }

    protected async afterFill(_meta: TorrentMeta): Promise<void> {
        // no-op
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing NexusPHP page...');
        const parsed = await parseNexus(this.config, this.currentUrl);
        const meta = await this.afterParse(parsed);
        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling NexusPHP form...');
        const prepared = await this.beforeFill({ ...meta });
        await fillNexus(prepared, this.config);
        await this.afterFill(prepared);
    }
}
