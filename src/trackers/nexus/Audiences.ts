import $ from 'jquery';
import { NexusPHPEngine } from '../NexusPHP';
import { TorrentMeta } from '../../types/TorrentMeta';
import { getLabel, getType } from '../../common/rules/text';
import { htmlToBBCode } from '../../utils/htmlToBBCode';

const retry = (fn: () => void, times = 6, delayMs = 250) => {
    let i = 0;
    const tick = () => {
        i++;
        try { fn(); } catch { }
        if (i < times) setTimeout(tick, delayMs);
    };
    tick();
};

export class AudiencesEngine extends NexusPHPEngine {
    protected async afterParse(meta: TorrentMeta): Promise<TorrentMeta> {
        const out: TorrentMeta = { ...meta };

        try {
            // Legacy parity: Audiences marks anime with `tags tdh`.
            if (document.querySelector('span.tags.tdh')) out.type = '动漫';
        } catch {}

        try {
            // Fallback type from details row when generic parser misses it.
            const typeText = $('td.rowhead:contains("类型") + td, td.rowhead:contains("類別") + td, td.rowhead:contains("Category") + td, td.rowhead:contains("Type") + td')
                .first()
                .text()
                .trim();
            if (typeText && !out.type) out.type = getType(typeText) || typeText;
        } catch {}

        try {
            // Legacy parity: pull mediainfo from the last `.codemain` block.
            if (!out.fullMediaInfo) {
                const codemains = Array.from(document.querySelectorAll('.codemain')) as HTMLElement[];
                if (codemains.length) {
                    let node = codemains[codemains.length - 1];
                    const font = node.querySelector('font') as HTMLElement | null;
                    if (font) node = font;
                    let mi = htmlToBBCode(node)
                        .replace(/\[\/?(font|size|color)[^\]]*\]/gi, '')
                        .replace(/\r/g, '')
                        .replace(/\n{3,}/g, '\n\n')
                        .trim();
                    if (mi && /General|Video|Audio|DISC INFO|MPLS|Unique ID|Bit rate|Frame rate/i.test(mi)) {
                        out.fullMediaInfo = mi;
                    }
                }
            }
        } catch {}

        return out;
    }

    protected async afterFill(meta: TorrentMeta): Promise<void> {
        retry(() => {
            const title = meta.title || '';
            const descr = meta.description || '';

            if (meta.type === '书籍') {
                const m = descr.match(/m4a|mp3/i)?.[0];
                if (m) meta.audioCodecSel = m.toUpperCase();
            }

            const browsecat = document.querySelector('#browsecat, select[name="browsecat"]') as HTMLSelectElement | null;
            if (browsecat) {
                const typeDict: Record<string, number> = {
                    电影: 401,
                    剧集: 402,
                    动漫: 409,
                    综艺: 403,
                    音乐: 408,
                    纪录: 406,
                    体育: 407,
                    软件: 411,
                    学习: 412,
                    游戏: 410,
                    书籍: 405,
                    MV: 108
                };

                let v = typeDict[meta.type || ''] ?? 409;
                if (meta.type === '动漫') {
                    v = 401;
                    if (/S\d+|E\d+/i.test(title) || /◎集.*?数.*?\d+/.test(descr)) v = 402;
                    const dh = document.querySelector('input[name="tags[]"][value="dh"]') as HTMLInputElement | null;
                    if (dh) dh.checked = true;
                }
                if (meta.type === '书籍' && (descr.match(/m4a|mp3/i))) {
                    v = 404;
                }

                browsecat.value = String(v);
                browsecat.dispatchEvent(new Event('change', { bubbles: true }));
                browsecat.dispatchEvent(new Event('input', { bubbles: true }));
            }

            const mediumSel = document.querySelector('select[name="medium_sel"]') as HTMLSelectElement | null;
            if (mediumSel) {
                let mv = 11;
                switch (meta.mediumSel) {
                    case 'UHD':
                        mv = /DIY|@/i.test(title) ? 13 : 12;
                        break;
                    case 'Blu-ray':
                        mv = /DIY|@/i.test(title) ? 14 : 1;
                        break;
                    case 'DVD':
                        mv = 2;
                        break;
                    case 'Remux':
                        mv = 3;
                        break;
                    case 'HDTV':
                        mv = 5;
                        break;
                    case 'Encode':
                        mv = 15;
                        break;
                    case 'WEB-DL':
                        mv = 10;
                        break;
                    case 'CD':
                        mv = 8;
                        break;
                }
                mediumSel.value = String(mv);
                mediumSel.dispatchEvent(new Event('change', { bubbles: true }));
                mediumSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            const codecSel = document.querySelector('select[name="codec_sel"]') as HTMLSelectElement | null;
            if (codecSel) {
                let cv = 5;
                switch (meta.codecSel) {
                    case 'H265':
                    case 'X265':
                        cv = 6;
                        break;
                    case 'H264':
                    case 'X264':
                        cv = 1;
                        break;
                    case 'VC-1':
                        cv = 2;
                        break;
                    case 'MPEG-2':
                    case 'MPEG-4':
                        cv = 4;
                        break;
                }
                codecSel.value = String(cv);
                codecSel.dispatchEvent(new Event('change', { bubbles: true }));
                codecSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            const audioSel = document.querySelector('select[name="audiocodec_sel"]') as HTMLSelectElement | null;
            if (audioSel) {
                let av = 7;
                switch (meta.audioCodecSel) {
                    case 'DTS-HDMA:X 7.1':
                    case 'DTS-X':
                        av = 25;
                        break;
                    case 'DTS-HD':
                    case 'DTS-HDMA':
                        av = 19;
                        break;
                    case 'TrueHD':
                        av = 20;
                        break;
                    case 'Atmos':
                        av = 26;
                        break;
                    case 'LPCM':
                        av = 21;
                        break;
                    case 'DTS':
                    case 'DTS-HDHR':
                        av = 3;
                        break;
                    case 'AC3':
                        av = 18;
                        break;
                    case 'AAC':
                        av = 6;
                        break;
                    case 'Flac':
                        av = 1;
                        break;
                    case 'APE':
                        av = 2;
                        break;
                    case 'WAV':
                        av = 22;
                        break;
                    case 'MP3':
                        av = 23;
                        break;
                    case 'M4A':
                        av = 24;
                        break;
                }
                audioSel.value = String(av);
                audioSel.dispatchEvent(new Event('change', { bubbles: true }));
                audioSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            const standardSel = document.querySelector('select[name="standard_sel"]') as HTMLSelectElement | null;
            if (standardSel) {
                const dict: Record<string, number> = { '8K': 1, '4K': 2, '1080p': 3, '1080i': 4, '720p': 5, SD: 6, '': 7 };
                const idx = dict[meta.standardSel || ''] ?? 7;
                if (standardSel.options[idx]) standardSel.options[idx].selected = true;
                standardSel.dispatchEvent(new Event('change', { bubbles: true }));
                standardSel.dispatchEvent(new Event('input', { bubbles: true }));
            }

            try {
                const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
                const labels = meta.labelInfo || getLabel(labelText);
                const check = (value: string, on: boolean) => {
                    if (!on) return;
                    const el = document.querySelector(`input[name="tags[]"][value="${value}"]`) as HTMLInputElement | null;
                    if (el) el.checked = true;
                };
                check('gy', !!labels.gy);
                check('yy', !!labels.yy);
                check('zz', !!labels.zz);
                check('diy', !!labels.diy);
                check('hdr10', !!labels.hdr10);
                check('hdrm', !!labels.hdr10plus);
                check('db', !!labels.db);
                check('wj', !!labels.complete);
            } catch { }
        }, 10, 200);
    }
}
