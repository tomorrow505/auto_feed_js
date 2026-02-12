import $ from 'jquery';
import { NexusPHPEngine } from './NexusPHP';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { getLabel } from '../common/rules/text';

export class CHDBitsEngine extends NexusPHPEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling CHDBits form...');
        await super.fill(meta);
        this.lockNameField(meta.title || '');

        const labels = meta.labelInfo || getLabel(`${meta.smallDescr || meta.subtitle || ''}${meta.title}#separator#${meta.description}`);
        meta.labelInfo = labels;

        try {
            if (labels.gy) (document.getElementsByName('cnlang')[0] as HTMLInputElement).checked = true;
            if (labels.zz) (document.getElementsByName('cnsub')[0] as HTMLInputElement).checked = true;
            if (labels.diy) (document.getElementsByName('diy')[0] as HTMLInputElement).checked = true;
        } catch {}
        try {
            // CHD variants differ by skin; match by id/name/value/label text.
            this.checkByAlias(!!labels.hdr10, ['hdr10', 'hdr'], /(HDR10)/i);
            this.checkByAlias(!!labels.hdr10plus, ['hdr10plus', 'hdrm', 'hdr10+'], /(HDR10\+|HDR\+)/i);
            this.checkByAlias(!!labels.db, ['dovi', 'dolbyvision', 'db', 'dv'], /(Dolby.?Vision|杜比视界|DoVi|\bDV\b)/i);
        } catch {}

        try {
            const browsecat = document.getElementsByName('type')[0] as HTMLSelectElement;
            const typeDict: Record<string, number> = {
                电影: 1,
                剧集: 4,
                动漫: 3,
                综艺: 5,
                音乐: 6,
                MV: 6,
                纪录: 2,
                体育: 7
            };
            if (typeDict.hasOwnProperty(meta.type || '')) {
                const index = typeDict[meta.type || ''];
                browsecat.options[index].selected = true;
            }
            if (meta.type === '书籍' && meta.description.match(/m4a|mp3/i)) {
                browsecat.options[9].selected = true;
            }

            const audiocodecBox = document.getElementsByName('audiocodec_sel')[0] as HTMLSelectElement;
            const audiocodecDict: Record<string, number> = {
                Flac: 6,
                APE: 7,
                AC3: 2,
                WAV: 8,
                Atmos: 4,
                AAC: 9,
                'DTS-HDMA': 3,
                'DTS-HDHR': 3,
                'TrueHD Atmos': 4,
                TrueHD: 4,
                DTS: 1,
                LPCM: 5,
                'DTS-HDMA:X 7.1': 3
            };
            if (audiocodecDict.hasOwnProperty(meta.audioCodecSel || '')) {
                const index = audiocodecDict[meta.audioCodecSel || ''];
                audiocodecBox.options[index].selected = true;
            }

            const standardBox = document.getElementsByName('standard_sel')[0] as HTMLSelectElement;
            const standardDict: Record<string, number> = {
                '8K': 5,
                '4K': 6,
                '1080p': 1,
                '1080i': 2,
                '720p': 3,
                SD: 4,
                '': 4
            };
            if (standardDict.hasOwnProperty(meta.standardSel || '')) {
                const index = standardDict[meta.standardSel || ''];
                standardBox.options[index].selected = true;
            }

            const codecBox = document.getElementsByName('codec_sel')[0] as HTMLSelectElement;
            const codecDict: Record<string, number> = { H264: 1, X265: 2, X264: 1, H265: 2, 'VC-1': 5, 'MPEG-2': 4 };
            if (codecDict.hasOwnProperty(meta.codecSel || '')) {
                const index = codecDict[meta.codecSel || ''];
                codecBox.options[index].selected = true;
            }

            const mediumBox = document.getElementsByName('medium_sel')[0] as HTMLSelectElement;
            const mediumDict: Record<string, number> = { UHD: 2, 'Blu-ray': 1, Encode: 4, HDTV: 5, 'WEB-DL': 6, Remux: 3, CD: 7 };
            if (mediumDict.hasOwnProperty(meta.mediumSel || '')) {
                const index = mediumDict[meta.mediumSel || ''];
                mediumBox.options[index].selected = true;
            }
            switch (meta.mediumSel) {
                case 'UHD':
                    if (meta.title.match(/(diy|@)/i)) {
                        mediumBox.options[2].selected = true;
                    }
                    break;
                case 'Blu-ray':
                    if (meta.title.match(/(diy|@)/i)) {
                        mediumBox.options[1].selected = true;
                    }
                    break;
            }
        } catch (err) {
            console.error(err);
        }

        try {
            $('select[name="source_sel"]').val(7);
            this.checkTeam(meta, 'team_sel');
        } catch {}

        // Torrent input name differs on CHDBits
        try {
            const { TorrentService } = await import('../services/TorrentService');
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, null);
            if (result) {
                TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
                this.lockNameField(meta.title || '');
            }
        } catch (err) {
            console.error('[Auto-Feed][CHDBits] Torrent inject failed:', err);
        }
    }

    private lockNameField(target: string) {
        const expect = String(target || '').trim();
        if (!expect) return;
        const apply = () => {
            const inputs = Array.from(
                document.querySelectorAll('input[name="name"], input#name, #name')
            ) as HTMLInputElement[];
            inputs.forEach((input) => {
                if (!input) return;
                if ((input.value || '').trim() === expect) return;
                input.value = expect;
                input.dispatchEvent(new Event('input', { bubbles: true }));
                input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        };
        [0, 120, 360, 800, 1500, 2600, 4200, 6500, 9000, 12000].forEach((ms) => {
            window.setTimeout(apply, ms);
        });
    }

    private checkByAlias(on: boolean, aliases: string[], labelPattern: RegExp) {
        if (!on) return;
        const aliasSet = new Set(aliases.map((x) => String(x).toLowerCase()));
        const inputs = Array.from(document.querySelectorAll('input[type="checkbox"]')) as HTMLInputElement[];
        const getText = (el: HTMLInputElement) => {
            if (el.id) {
                const byFor = document.querySelector(`label[for="${el.id}"]`) as HTMLLabelElement | null;
                if (byFor?.textContent) return byFor.textContent.trim();
            }
            return ((el.closest('label') as HTMLLabelElement | null)?.textContent || el.parentElement?.textContent || '').trim();
        };
        inputs.forEach((el) => {
            const name = (el.name || '').toLowerCase();
            const id = (el.id || '').toLowerCase();
            const val = (el.value || '').toLowerCase();
            const txt = getText(el);
            const hit = aliasSet.has(name) || aliasSet.has(id) || aliasSet.has(val) || labelPattern.test(txt);
            if (!hit) return;
            el.checked = true;
            el.dispatchEvent(new Event('change', { bubbles: true }));
            el.dispatchEvent(new Event('input', { bubbles: true }));
        });
    }

    private checkTeam(meta: TorrentMeta, selectName: string) {
        if (!meta.title) return;
        const nameTail = meta.title.split(/(19|20)\d{2}/).pop() || '';
        $(`select[name="${selectName}"]>option`).each((index, el) => {
            const text = (el as HTMLOptionElement).innerText || '';
            if (nameTail.toLowerCase().match(text.toLowerCase())) {
                if (
                    (nameTail.match(/PSY|LCHD/) && text === 'CHD') ||
                    (nameTail.match(/PandaMoon/) && text === 'Panda') ||
                    text === 'DIY' ||
                    text === 'REMUX'
                ) {
                    return;
                } else if (nameTail.match(/HDSpace/i) && text.match(/HDS/i)) {
                    return;
                } else if (nameTail.match(/HDClub/i) && text.match(/HDC/i)) {
                    return;
                } else if (nameTail.match(/REPACK/i) && text.match(/PACK/i)) {
                    return;
                } else {
                    $(`select[name^="${selectName}"]>option:eq(${index})`).prop('selected', true);
                }
            }
        });
    }
}
