import { NexusPHPEngine } from '../NexusPHP';
import { TorrentMeta } from '../../types/TorrentMeta';
import { getLabel } from '../../common/rules/text';
import { applyHDSkyOptions, buildHDSkySmallDescr, fillHDSkySelects } from '../../templates/nexus/helpers';

export class HDSkyEngine extends NexusPHPEngine {
    protected async beforeFill(meta: TorrentMeta): Promise<TorrentMeta> {
        const small = buildHDSkySmallDescr(meta);
        if (small) {
            meta.smallDescr = small;
            meta.subtitle = small;
        }
        return meta;
    }

    protected async afterFill(meta: TorrentMeta): Promise<void> {
        try {
            const small = meta.subtitle || meta.smallDescr || '';
            const descr = meta.description || '';
            const labelText = `${small}${meta.title || ''}#separator#${descr}${meta.fullMediaInfo || ''}`;
            const labels = meta.labelInfo || getLabel(labelText);
            applyHDSkyOptions(labels, small, descr);
            fillHDSkySelects(meta);
        } catch { }
    }
}
