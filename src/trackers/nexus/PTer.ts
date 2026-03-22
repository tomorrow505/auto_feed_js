import $ from 'jquery';
import { NexusPHPEngine } from '../NexusPHP';
import { TorrentMeta } from '../../types/TorrentMeta';
import { getLabel } from '../../common/rules/text';
import { buildPTerDescr } from '../../templates/nexus/helpers';

const retry = (fn: () => void, times = 6, delayMs = 350) => {
    let i = 0;
    const tick = () => {
        i++;
        try { fn(); } catch { }
        if (i < times) setTimeout(tick, delayMs);
    };
    tick();
};

export class PTerEngine extends NexusPHPEngine {
    protected async beforeFill(meta: TorrentMeta): Promise<TorrentMeta> {
        meta.description = buildPTerDescr(meta);
        return meta;
    }

    protected async afterFill(meta: TorrentMeta): Promise<void> {
        try {
            retry(() => {
                document.querySelectorAll('tr.mode_4').forEach((tr) => {
                    (tr as HTMLElement).style.display = '';
                });
                try { $('tr.mode_4').show(); } catch { }
            }, 10, 150);
        } catch { }

        try {
            const typeDict: Record<string, number> = {
                电影: 401,
                剧集: 404,
                动漫: 403,
                综艺: 405,
                音乐: 406,
                纪录: 402,
                体育: 407,
                软件: 410,
                学习: 411,
                书籍: 408,
                MV: 413
            };
            const typeSel = document.querySelector('select[name="type"]') as HTMLSelectElement | null;
            if (typeSel && meta.type && typeDict[meta.type]) {
                const v = String(typeDict[meta.type]);
                retry(() => {
                    typeSel.value = v;
                    typeSel.dispatchEvent(new Event('change', { bubbles: true }));
                    typeSel.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        } catch { }

        try {
            const sourceSel = document.querySelector('select[name="source_sel"]') as HTMLSelectElement | null;
            if (sourceSel) {
                let v: number | null = null;
                if (meta.audioCodecSel === 'Flac') v = 8;
                else if (meta.audioCodecSel === 'WAV') v = 9;
                else {
                    const dict: Record<string, number> = {
                        UHD: 1,
                        'Blu-ray': 2,
                        Remux: 3,
                        HDTV: 4,
                        'WEB-DL': 5,
                        Encode: 6,
                        DVD: 7
                    };
                    if (meta.mediumSel && dict[meta.mediumSel]) v = dict[meta.mediumSel];
                }
                if (v !== null) {
                    const vv = String(v);
                    retry(() => {
                        sourceSel.value = vv;
                        sourceSel.dispatchEvent(new Event('change', { bubbles: true }));
                        sourceSel.dispatchEvent(new Event('input', { bubbles: true }));
                    });
                }
            }
        } catch { }

        try {
            const teamSel =
                (document.querySelector('select[name="team_sel"]') as HTMLSelectElement | null) ||
                (document.querySelector('select[name="team"]') as HTMLSelectElement | null);
            if (teamSel) {
                const teamDict: Record<string, number> = { 欧美: 4, 大陆: 1, 香港: 2, 台湾: 3, 日本: 6, 韩国: 5, 印度: 7 };
                let v = 8;
                if (meta.sourceSel && teamDict[meta.sourceSel]) v = teamDict[meta.sourceSel];
                const vv = String(v);
                retry(() => {
                    teamSel.value = vv;
                    if (teamSel.value !== vv) {
                        const opts = Array.from(teamSel.options);
                        const other = opts.find((o) => (o.textContent || '').match(/(其他|其它|Other|Unknown)/i));
                        if (other) teamSel.value = other.value;
                        else if (opts.length) teamSel.value = opts[opts.length - 1].value;
                    }
                    teamSel.dispatchEvent(new Event('change', { bubbles: true }));
                    teamSel.dispatchEvent(new Event('input', { bubbles: true }));
                });
            }
        } catch { }

        try {
            const labelText = `${meta.smallDescr || ''}${meta.subtitle || ''}${meta.title || ''}#separator#${meta.description || ''}${meta.fullMediaInfo || ''}`;
            const labels = meta.labelInfo || getLabel(labelText);
            const apply = () => {
                const setById = (id: string, on: boolean) => {
                    if (!on) return;
                    const el = document.getElementById(id) as HTMLInputElement | null;
                    if (!el || el.type !== 'checkbox') return;
                    el.checked = true;
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                };
                setById('guoyu', !!labels.gy);
                setById('yueyu', !!labels.yy);
                setById('zhongzi', !!labels.zz);
                setById('diy', !!labels.diy);
                setById('ensub', !!labels.yz);
            };
            retry(apply, 10, 200);
        } catch { }
    }
}
