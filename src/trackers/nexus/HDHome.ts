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

export class HDHomeEngine extends NexusPHPEngine {
    protected async afterFill(meta: TorrentMeta): Promise<void> {
        try {
            const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
            const labels = meta.labelInfo || getLabel(labelText);
            if (labels.diy || !labels.yp) return;
            retry(() => {
                const inputs = Array.from(
                    document.querySelectorAll('input[type="checkbox"][name="tags[]"], input[type="checkbox"][name="tags[4][]"]')
                ) as HTMLInputElement[];
                for (const el of inputs) {
                    const val = (el.value || '').toLowerCase();
                    const text = ((el.closest('label') as HTMLLabelElement | null)?.textContent || el.parentElement?.textContent || '').trim();
                    if (!(val === 'ybyp' || val === '17' || val === '28' || /(原盘|untouch|untouched|ybyp)/i.test(text))) continue;
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                }
            });
        } catch { }
    }
}
