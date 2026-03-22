import { NexusPHPEngine } from '../NexusPHP';
import { TorrentMeta } from '../../types/TorrentMeta';
import { getLabel } from '../../common/rules/text';

const retry = (fn: () => void, times = 8, delayMs = 220) => {
    let i = 0;
    const tick = () => {
        i++;
        try { fn(); } catch { }
        if (i < times) setTimeout(tick, delayMs);
    };
    tick();
};

const setById = (id: string, on: boolean) => {
    if (!on) return;
    const el = document.getElementById(id) as HTMLInputElement | null;
    if (!el || el.type !== 'checkbox') return;
    el.checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
};

export class OurBitsEngine extends NexusPHPEngine {
    protected async afterFill(meta: TorrentMeta): Promise<void> {
        try {
            const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
            const labels = meta.labelInfo || getLabel(labelText);
            retry(() => {
                setById('tag_gy', !!labels.gy);
                setById('tag_zz', !!labels.zz);
                setById('tag_diy', !!labels.diy);
                setById('tag_hdr', !!labels.hdr10);
                setById('tag_hdrp', !!labels.hdr10plus);
                setById('tag_db', !!labels.db);
                setById('tag_hlg', /HLG/i.test(meta.title || ''));
            });
        } catch { }
    }
}
