import { ACMEngine } from './ACM';
import { TorrentMeta } from '../types/TorrentMeta';
import { extractImdbId } from '../common/rules/links';

export class MonikaEngine extends ACMEngine {
    async fill(meta: TorrentMeta): Promise<void> {
        await super.fill(meta);

        const fire = (el: HTMLElement) => {
            try { el.dispatchEvent(new Event('input', { bubbles: true })); } catch {}
            try { el.dispatchEvent(new Event('change', { bubbles: true })); } catch {}
        };

        const setText = (selectors: string[], value: string) => {
            if (!value) return;
            for (const selector of selectors) {
                const el = document.querySelector(selector) as HTMLInputElement | HTMLTextAreaElement | null;
                if (!el) continue;
                el.value = value;
                fire(el);
                break;
            }
        };

        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const imdbNo = imdbId.replace(/^tt/i, '');

        setText(['input#title', 'input[name="title"]'], meta.title || '');
        setText(['input[name="subhead"]', 'input#subhead'], (meta.smallDescr || meta.subtitle || '').trim());
        setText(['textarea#bbcode-description', 'textarea[name="description"]'], (meta.description || '').trim());
        setText(['input#autoimdb', 'input[name="imdb"]'], imdbNo);
    }
}
