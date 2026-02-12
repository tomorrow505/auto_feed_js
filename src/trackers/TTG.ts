import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { NexusPHPEngine } from './NexusPHP';
import { extractImdbId, matchLink } from '../common/rules/links';

// Dedicated engine entry for TTG.
// Keep it separate from generic Nexus so site quirks can be patched in one file.
export class TTGEngine extends NexusPHPEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing TTG page...');
        // Legacy TTG parity: subtitle is often embedded in the bracketed part of the H1 title.
        const rawTitle = $('h1#top, h1').first().text().trim() || document.title || '';
        const pick = (re: RegExp) => rawTitle.match(re)?.[1]?.trim() || '';
        const bracketSubtitle =
            pick(/\[([^\]]+)\]/) ||
            pick(/【([^】]+)】/) ||
            pick(/「([^」]+)」/) ||
            '';

        const meta = await super.parse();
        if (bracketSubtitle) {
            if (!meta.subtitle) meta.subtitle = bracketSubtitle;
            if (!meta.smallDescr) meta.smallDescr = bracketSubtitle;
        }

        // Legacy parity: TTG IMDb often appears in `#kt_d` description area.
        // Try link first, then plain `ttxxxx` id fallback.
        const imdbFromMeta = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        if (!imdbFromMeta) {
            const kt = document.getElementById('kt_d') as HTMLElement | null;
            const html = kt?.innerHTML || document.body?.innerHTML || '';
            const text = kt?.textContent || document.body?.textContent || '';

            const imdbUrl = matchLink('imdb', html) || matchLink('imdb', text) || '';
            const imdbId = extractImdbId(imdbUrl) || extractImdbId(html) || extractImdbId(text);

            if (imdbId) {
                meta.imdbId = imdbId;
                if (!meta.imdbUrl) meta.imdbUrl = imdbUrl || `https://www.imdb.com/title/${imdbId}/`;
            } else if (imdbUrl && !meta.imdbUrl) {
                meta.imdbUrl = imdbUrl;
            }
        }
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling TTG form...');
        await super.fill(meta);

        // TTG target has dedicated fields:
        // - subtitle: input[name="subtitle"]
        // - imdb id: input[name="imdb_c"]
        const isTTGUpload =
            /totheglory\.im\/(upload|offer|viewoffers)\.php/i.test(this.currentUrl) ||
            !!document.querySelector('input[name="subtitle"], input[name="imdb_c"]');
        if (!isTTGUpload) return;

        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '') || '';
        const subtitle = (meta.smallDescr || meta.subtitle || '').trim();
        const ttgName = (meta.title || '')
            .replace(/(5\.1|2\.0|7\.1|1\.0)/g, (m) => m.replace('.', '{@}'))
            .replace(/h\.(26(5|4))/gi, 'H{@}$1');
        const rawType = meta.type || '';
        const type = (() => {
            if (/电影|電影|movie/i.test(rawType)) return '电影';
            if (/纪录|紀錄|doc/i.test(rawType)) return '纪录';
            if (/剧集|劇集|电视剧|TV|series/i.test(rawType)) return '剧集';
            if (/综艺|綜藝|variety/i.test(rawType)) return '综艺';
            if (/动漫|動畫|anime/i.test(rawType)) return '动漫';
            if (/音乐|音樂|music/i.test(rawType)) return '音乐';
            if (/体育|體育|sport/i.test(rawType)) return '体育';
            if (/软件|軟件|software/i.test(rawType)) return '软件';
            if (/学习|學習|study/i.test(rawType)) return '学习';
            if (/书籍|書籍|book/i.test(rawType)) return '书籍';
            if (/mv|music video/i.test(rawType)) return 'MV';
            return rawType;
        })();
        const sourceSel = meta.sourceSel || '';
        const mediumSel = meta.mediumSel || '';
        const standardSel = meta.standardSel || '';
        const nameText = meta.title || '';
        const descr = meta.description || '';

        const isPack = /(complete|S\d{2}[^E])/i.test(nameText) && !/E\d{2,3}/i.test(nameText);
        const isSingleEpUs = /(S\d{2}E\d{2})/i.test(nameText);
        const getTtgTypeValue = () => {
            if (/(pad$|ipad)/i.test(nameText)) return '92';
            if (type === '电影') {
                if (mediumSel === 'Blu-ray') return '54';
                if (mediumSel === 'UHD') return '109';
                if (mediumSel === 'DVD' || /DVDRip/i.test(nameText)) return '51';
                if (standardSel === '720p') return '52';
                if (standardSel === '1080p' || standardSel === '1080i') return '53';
                if (standardSel === '4K') return '108';
                return '';
            }
            if (type === '纪录') {
                if (mediumSel === 'Blu-ray' || mediumSel === 'UHD') return '67';
                if (standardSel === '720p') return '62';
                if (standardSel === '1080p' || standardSel === '1080i') return '63';
                if (standardSel === '4K') return '108';
                return '';
            }
            if (type === '剧集') {
                let v = '';
                if (/大陆|台湾|香港|港台|中國|华语/i.test(sourceSel)) {
                    v = isPack ? '90' : (standardSel === '720p' ? '76' : '75');
                } else if (/日本/i.test(sourceSel)) {
                    v = isPack ? '88' : '73';
                } else if (/韩国|韓國/i.test(sourceSel)) {
                    v = isPack ? '99' : '74';
                } else if (/欧美|歐美|US|USA|UK|Europe/i.test(sourceSel)) {
                    v = isSingleEpUs ? (standardSel === '720p' ? '69' : '70') : '87';
                }
                if (standardSel === '4K') v = '108';
                return v;
            }
            if (type === '综艺') {
                if (/日本/i.test(sourceSel)) return '101';
                if (/韩国|韓國/i.test(sourceSel)) return '103';
                return '60';
            }
            if (type === '动漫') {
                if (/mpls/i.test(descr)) return '111';
                return '58';
            }
            if (type === '音乐') return '83';
            if (type === 'MV') return '59';
            if (type === '体育') return '57';
            if (type === '软件') return '95';
            if (type === '学习') return '94';
            if (type === '书籍') return '56';
            return '';
        };
        const ttgTypeVal = getTtgTypeValue();

        const setInput = (sel: string, value: string, force = true) => {
            if (!value) return;
            const el = document.querySelector(sel) as HTMLInputElement | HTMLTextAreaElement | null;
            if (!el) return;
            const cur = (el.value || '').trim();
            if (!force && cur) return;
            el.value = value;
            try {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            } catch { }
        };

        const retry = (fn: () => void, times = 12, delayMs = 220) => {
            let i = 0;
            const tick = () => {
                i += 1;
                try { fn(); } catch { }
                if (i < times) setTimeout(tick, delayMs);
            };
            tick();
        };

        const setSelect = (sel: string, value: string) => {
            if (!value) return;
            const el = document.querySelector(sel) as HTMLSelectElement | null;
            if (!el) return;
            el.value = value;
            try {
                el.dispatchEvent(new Event('change', { bubbles: true }));
                el.dispatchEvent(new Event('input', { bubbles: true }));
            } catch { }
        };

        retry(() => {
            setInput('input[name="name"], input#name', ttgName, true);
            setInput('input[name="subtitle"]', subtitle, true);
            setInput('input[name="imdb_c"]', imdbId, true);
            setSelect('select[name="type"], #type', ttgTypeVal);
        });
    }
}
