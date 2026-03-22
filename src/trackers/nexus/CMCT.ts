import $ from 'jquery';
import { NexusPHPEngine } from '../NexusPHP';
import { TorrentMeta } from '../../types/TorrentMeta';
import { htmlToBBCode } from '../../utils/htmlToBBCode';
import { getMediainfoPictureFromDescr } from '../../common/rules/media';
import { getLabel } from '../../common/rules/text';
import { getSourceSelFromDescr } from '../../common/rules/helpers';

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

const setSelectValue = (selector: string, value: number) => {
    const el = document.querySelector(selector) as HTMLSelectElement | null;
    if (!el) return;
    el.value = String(value);
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
};

const checkInput = (selector: string, checked: boolean) => {
    if (!checked) return;
    const el = document.querySelector(selector) as HTMLInputElement | null;
    if (!el) return;
    el.checked = true;
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('input', { bubbles: true }));
};

const buildCmctTitle = (raw: string) => {
    let t = (raw || '').trim();
    if (!t) return '';
    t = t
        .replace(/DDP/gi, 'DD+')
        .replace(/DTS[- .]?HD[\s-]?(?:Master\s*Audio|MA)/gi, 'DTS-HD MA')
        .replace(/DTS[- .]?HD[\s-]?(?:High\s*Resolution|HRA?|HR)/gi, 'DTS-HD HR')
        .replace(/([A-Za-z0-9])[ ]+-(?=[A-Za-z0-9])/g, '$1-')
        .replace(/-(?=[A-Za-z0-9])/g, '-');
    t = t.replace(
        /(DD\+|DD|AAC|TrueHD|DTS-HD MA|DTS-HD HR|DTS|LPCM|FLAC)\s*[. ]\s*(7\.1|5\.1|2\.0|1\.0)/gi,
        '$1 $2'
    );
    t = t.replace(/\s*-\s*/g, '-').replace(/\s+/g, '.').replace(/\.{2,}/g, '.');
    t = t.replace(/\.-/g, '-').replace(/-\./g, '-');
    return t.trim();
};

export class CMCTEngine extends NexusPHPEngine {
    protected async afterParse(meta: TorrentMeta): Promise<TorrentMeta> {
        try {
            const blocks: string[] = [];
            const screenSet = new Set<string>();

            const extraText = ($('.extra-text').first().text() || '').trim();
            if (extraText) {
                const wrapped = extraText.includes('[quote]') ? extraText : `[quote]\n${extraText}\n[/quote]`;
                blocks.push(wrapped.trim());
            }

            const poster = ($('#kposter img').first().attr('src') || '').trim();
            if (poster) blocks.push(`[img]${poster}[/img]`);

            const introEl =
                ($('.info.douban-info artical').first()[0] as Element | undefined) ||
                ($('.info.douban-info article').first()[0] as Element | undefined) ||
                ($('.info.douban-info').first()[0] as Element | undefined);
            if (introEl) {
                let intro = htmlToBBCode(introEl).trim();
                if (extraText && intro.includes(extraText)) intro = intro.replace(extraText, '').trim();
                intro = intro.replace(/\[img\][\s\S]*?\[\/img\]\s*/gi, '').trim();
                if (intro) blocks.push(intro);
            }

            const miEl = $('.codemain').eq(1)[0] as HTMLElement | undefined;
            let fullMediaInfo = '';
            if (miEl) fullMediaInfo = (miEl.innerText || $(miEl).text() || '').trim();
            if (fullMediaInfo) blocks.push(`[quote]${fullMediaInfo}[/quote]`);

            $('.screenshots-container img, #kscreenshots img').each((_, img) => {
                const src = ((img as HTMLImageElement).src || (img as HTMLImageElement).getAttribute('src') || '').trim();
                if (!src) return;
                if (src.includes('detail')) return;
                if (poster && src === poster) return;
                screenSet.add(src);
            });
            if (screenSet.size) {
                blocks.push(Array.from(screenSet).map((u) => `[img]${u}[/img]`).join('\n'));
            }

            const rebuilt = blocks.join('\n\n').trim();
            if (rebuilt) {
                meta.description = rebuilt;
                if (fullMediaInfo) meta.fullMediaInfo = fullMediaInfo;
            } else if ((meta.description || '').trim()) {
                const info = getMediainfoPictureFromDescr(meta.description || '');
                if (!fullMediaInfo && info.mediainfo) fullMediaInfo = info.mediainfo;
                const intro = (meta.description || '').split('[quote]')[0].replace(/\[img\][\s\S]*?\[\/img\]\s*/gi, '').trim();
                const shots = Array.from(new Set(
                    (info.picInfo.match(/\[img\]([^\[]+?)\[\/img\]/gi) || [])
                        .map((s) => s.replace(/\[img\]|\[\/img\]/gi, '').trim())
                        .filter(Boolean)
                        .filter((u) => !poster || u !== poster)
                ));
                meta.description = [intro, fullMediaInfo ? `[quote]${fullMediaInfo}[/quote]` : '', shots.map((u) => `[img]${u}[/img]`).join('\n')]
                    .filter(Boolean)
                    .join('\n\n')
                    .trim();
                if (fullMediaInfo) meta.fullMediaInfo = fullMediaInfo;
            }
        } catch { }
        return meta;
    }

    protected async beforeFill(meta: TorrentMeta): Promise<TorrentMeta> {
        meta.title = buildCmctTitle(meta.title || '');
        return meta;
    }

    protected async afterFill(meta: TorrentMeta): Promise<void> {
        try {
            const tas = Array.from(document.querySelectorAll('textarea')) as HTMLTextAreaElement[];
            if (tas.length >= 3) {
                const info = getMediainfoPictureFromDescr(meta.description || '', { mediumSel: meta.mediumSel });
                const intro = (meta.description || '').split('[quote]')[0].replace(/\[img\][\s\S]*?\[\/img\]\s*/gi, '').trim();
                if (intro) {
                    tas[0].value = intro;
                    tas[0].dispatchEvent(new Event('input', { bubbles: true }));
                    tas[0].dispatchEvent(new Event('change', { bubbles: true }));
                }

                const pickMi = () => {
                    if (meta.fullMediaInfo) return meta.fullMediaInfo;
                    return (info.mediainfo || '').trim();
                };
                let mi = pickMi();
                mi = mi.replace(/ReportBy[\s\S]*$/i, '').replace(/Report created by[\s\S]*$/i, '').trim();
                if (mi) {
                    tas[1].value = mi;
                    tas[1].dispatchEvent(new Event('input', { bubbles: true }));
                    tas[1].dispatchEvent(new Event('change', { bubbles: true }));
                }

                let extra = meta.description || '';
                if (mi) {
                    const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    extra = extra.replace(new RegExp(`\\[quote\\]\\s*${esc(mi)}\\s*\\[/quote\\]\\s*`, 'ig'), '').trim();
                }
                tas[2].value = extra || meta.description || '';
                tas[2].dispatchEvent(new Event('input', { bubbles: true }));
                tas[2].dispatchEvent(new Event('change', { bubbles: true }));

                const cover = (info.coverImg || '').replace(/\[img\]|\[\/img\]/gi, '').trim();
                const imgUrls = Array.from(new Set(
                    (info.picInfo || '')
                        .match(/\[img\]([^\[]+?)\[\/img\]/gi)
                        ?.map((s) => s.replace(/\[img\]|\[\/img\]/gi, '').trim())
                        .filter(Boolean)
                        .filter((u) => !cover || u !== cover) || []
                ));
                const urlBox = document.querySelector('#url_vimages') as HTMLTextAreaElement | HTMLInputElement | null;
                if (urlBox && imgUrls.length) {
                    urlBox.value = imgUrls.join('\n');
                    urlBox.dispatchEvent(new Event('input', { bubbles: true }));
                    urlBox.dispatchEvent(new Event('change', { bubbles: true }));
                }
            }
        } catch { }

        retry(() => {
            const nameBlob = `${meta.title || ''} ${meta.subtitle || ''} ${meta.smallDescr || ''}`;
            const descrBlob = `${meta.description || ''}\n${meta.fullMediaInfo || ''}`;

            const typeDict: Record<string, number> = {
                电影: 501,
                剧集: 502,
                综艺: 505,
                音乐: 508,
                纪录: 503,
                有声小说: 510,
                体育: 506,
                软件: 509,
                学习: 509,
                MV: 507,
                书籍: 509
            };
            let browsecat = typeDict[meta.type || ''] ?? 509;
            if (meta.type === '动漫') {
                checkInput('#animation, input[name="animation"]', true);
                browsecat = /S\d+[^E]/i.test(nameBlob) ? 502 : 501;
            }
            setSelectValue('select[name="browsecat"], #browsecat', browsecat);

            if ((meta.type === '剧集' || meta.type === '动漫') && /S\d+[^E]/i.test(nameBlob)) {
                checkInput('input[name="pack"], #pack', true);
            }

            let medium = 99;
            switch (meta.mediumSel) {
                case 'UHD':
                case 'Blu-ray':
                    medium = 1;
                    break;
                case 'Remux':
                    medium = 4;
                    break;
                case 'HDTV':
                    medium = 5;
                    break;
                case 'WEB-DL':
                    medium = /webrip/i.test(nameBlob) ? 8 : 7;
                    break;
                case 'Encode':
                    medium = 6;
                    break;
                case 'DVD':
                    medium = /dvdrip/i.test(nameBlob) ? 10 : 3;
                    break;
                case 'CD':
                    medium = 11;
                    break;
            }
            setSelectValue('select[name="medium_sel"]', medium);

            let codec = 99;
            switch (meta.codecSel) {
                case 'H265':
                case 'X265':
                    codec = 1;
                    break;
                case 'H264':
                case 'X264':
                    codec = 2;
                    break;
                case 'VC-1':
                    codec = 3;
                    break;
                case 'MPEG-2':
                    codec = 4;
                    break;
                case 'AV1':
                    codec = 5;
                    break;
            }
            setSelectValue('select[name="codec_sel"]', codec);

            let audio = 99;
            switch (meta.audioCodecSel) {
                case 'DTS-HD':
                case 'DTS-HDMA:X 7.1':
                case 'DTS-HDMA':
                case 'DTS-HDHR':
                    audio = 1;
                    break;
                case 'TrueHD':
                case 'Atmos':
                    audio = 2;
                    break;
                case 'LPCM':
                    audio = 6;
                    break;
                case 'DTS':
                    audio = 3;
                    break;
                case 'AC3':
                    audio = /DD[\+p]/i.test(nameBlob) ? 11 : 4;
                    break;
                case 'AAC':
                    audio = 5;
                    break;
                case 'Flac':
                    audio = 7;
                    break;
                case 'APE':
                    audio = 8;
                    break;
                case 'WAV':
                    audio = 9;
                    break;
            }
            setSelectValue('select[name="audiocodec_sel"]', audio);

            const standardDict: Record<string, number> = { '4K': 1, '1080p': 2, '1080i': 3, '720p': 4, SD: 5, '': 0 };
            setSelectValue('select[name="standard_sel"]', standardDict[meta.standardSel || ''] ?? 0);

            let region = (meta.sourceSel || '').trim();
            if (!region) {
                region = getSourceSelFromDescr(meta.description || '') || getSourceSelFromDescr(meta.fullMediaInfo || '');
            }
            if (region === '港台') {
                const parsed = getSourceSelFromDescr(meta.description || '');
                region = parsed === '台湾' ? '台湾' : '香港';
            } else if (region === '日韩') {
                const parsed = getSourceSelFromDescr(meta.description || '');
                region = parsed === '日本' ? '日本' : '韩国';
            }

            const sourceDict: Record<string, number> = {
                欧美: 4,
                大陆: 1,
                香港: 2,
                台湾: 3,
                日本: 5,
                韩国: 6,
                印度: 7,
                泰国: 9
            };
            let source = sourceDict[region] ?? 99;
            if (/◎(地.{0,10}?区|国.{0,10}?家|产.{0,10}?地|◎產.{0,5}?地).*(俄罗斯|苏联)/i.test(descrBlob)) {
                source = 8;
            }
            setSelectValue('select[name="source_sel"], #source_sel', source);
        });

        try {
            const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
            const labels = meta.labelInfo || getLabel(labelText);
            retry(() => {
                setById('subtitlezh', !!labels.zz);
                if (!labels.diy && /mpls/i.test(`${meta.description || ''}${meta.fullMediaInfo || ''}`)) {
                    setById('untouched', true);
                }
                setById('hdr10', !!labels.hdr10);
                setById('hdr10plus', !!labels.hdr10plus);
                setById('dovi', !!labels.db);
                setById('3d', /(\.| )3D(\.| )/i.test(meta.title || ''));
                setById('hlg', /HLG/i.test(meta.title || ''));
                setById('pack', !!labels.complete);
                setById('subtitlesp', /(特效字幕)/.test(meta.smallDescr || meta.subtitle || ''));
                setById('hdrvivid', /HDR Vivid/i.test(`${meta.description || ''}${meta.fullMediaInfo || ''}`));
            });
        } catch { }
    }
}
