import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { NexusPHPEngine } from './NexusPHP';
import { TorrentService } from '../services/TorrentService';

// Dedicated engine entry for OpenCD (plugin_upload form quirks).
export class OpenCDEngine extends NexusPHPEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing OpenCD page...');
        // Legacy OpenCD source page (old layout) parser.
        if (
            this.currentUrl.includes('open.cd') &&
            document.getElementsByClassName('title').length &&
            document.getElementsByClassName('smalltitle').length &&
            document.getElementById('divdescr')
        ) {
            const title = (document.getElementsByClassName('title')[0] as HTMLElement).textContent?.trim() || '';
            const small = (document.getElementsByClassName('smalltitle')[0] as HTMLElement).textContent?.trim() || '';

            let cover = '';
            try {
                const coverBox = document.getElementsByClassName('cover')[0] as HTMLElement;
                const img = coverBox.getElementsByTagName('img')[0];
                const onclick = img.getAttribute('onclick') || '';
                cover = onclick.match(/'(.*)'/)?.[1] || img.getAttribute('src') || '';
                if (cover && !/^https?:\/\//i.test(cover)) cover = `https://open.cd/${cover.replace(/^\/+/, '')}`;
            } catch { }

            const descrText = (document.getElementById('divdescr')?.textContent || '').trim();
            const tracklist = (document.getElementById('divtracklist')?.textContent || '').trim();
            const nfo = (document.getElementById('divnfo')?.textContent || '').trim();
            let description = `${cover ? `[img]${cover}[/img]\n\n` : ''}${descrText}`.trim();
            if (tracklist) description += `\n\n[quote]${tracklist}[/quote]`;
            if (nfo) description += `\n\n[quote]${nfo}[/quote]`;

            const torrentTitle = $('a[href*="download.php"]').first().attr('title') || '';
            const dlText = $('td:contains("下载链接"):last').next().find('a').first().text().trim();
            const dlHref = $('td:contains("下载链接"):last').next().find('a').first().attr('href') || '';
            let torrentUrl = dlText || dlHref || '';
            if (torrentUrl && !/^https?:\/\//i.test(torrentUrl)) {
                try { torrentUrl = new URL(torrentUrl, 'https://open.cd/').href; } catch { }
            }

            return {
                title: title || 'OpenCD',
                subtitle: small || undefined,
                smallDescr: small || undefined,
                description,
                type: '音乐',
                sourceSite: this.config.name,
                sourceUrl: this.currentUrl,
                tracklist: tracklist || undefined,
                torrentName: torrentTitle ? `${torrentTitle}.torrent` : undefined,
                torrentFilename: torrentTitle ? `${torrentTitle}.torrent` : undefined,
                torrentUrl: torrentUrl || undefined,
                images: cover ? [cover] : []
            };
        }

        return super.parse();
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling OpenCD form...');
        // OpenCD plugin upload page (`plugin_upload.php`) has custom ids.
        const isPluginUpload =
            !!document.querySelector('#release_desc') ||
            !!document.querySelector('#resource_name') ||
            /open\.cd\/plugin_upload\.php/i.test(this.currentUrl);

        if (!isPluginUpload) {
            await super.fill(meta);
            return;
        }

        const retry = (fn: () => void, times = 12, delayMs = 220) => {
            let i = 0;
            const tick = () => {
                i += 1;
                try { fn(); } catch { }
                if (i < times) setTimeout(tick, delayMs);
            };
            tick();
        };

        const norm1 = (s: string) => (s || '').replace(/\*/g, '').replace(/–/g, '-').replace(/\s+/g, ' ').trim();
        const normBlock = (s: string) =>
            (s || '')
                .replace(/\*/g, '')
                .replace(/–/g, '-')
                .replace(/\r/g, '')
                .replace(/[ \t]+\n/g, '\n')
                .replace(/\n{3,}/g, '\n\n')
                .trim();

        let musicName = '';
        let musicAuthor = '';
        try {
            const dom = JSON.parse(meta.originalDom || '{}') as Record<string, any>;
            musicName = norm1(String(dom.musicName || ''));
            musicAuthor = norm1(String(dom.musicAuthor || ''));
        } catch { }

        const rawTitle = norm1(meta.title || '');
        const subtitle = norm1(meta.subtitle || meta.smallDescr || '');
        const year =
            (subtitle.match(/(19|20)\d{2}/)?.[0]) ||
            (rawTitle.match(/(19|20)\d{2}/)?.[0]) ||
            '';

        const base = norm1(year ? rawTitle.replace(year, '') : rawTitle).replace(/\s*-\s*$/, '').trim();
        let artist = musicAuthor;
        let album = musicName || base;
        if (base.includes('-')) {
            const parts = base.split('-').map((p) => p.trim()).filter(Boolean);
            if (parts.length >= 2) {
                if (!musicName) album = parts.pop() || album;
                if (!musicAuthor) artist = parts.join(' - ').trim();
            }
        }
        if (!album) album = rawTitle;
        const displayName = norm1(artist && album ? `${artist} - ${album}` : (album || rawTitle));

        const cover =
            (Array.isArray(meta.images) && meta.images[0]) ||
            (meta.description || '').match(/\[img\](.*?)\[\/img\]/i)?.[1] ||
            '';
        let releaseDesc = normBlock((meta.description || '').replace(/^\s*\[img\][\s\S]*?\[\/img\]\s*/i, '').trim());
        releaseDesc = releaseDesc
            .replace(/\[b\]\[color=green\]\[size=3\]本站提供的所有影视[\s\S]*$/i, '')
            .replace(/ \n \n/g, ' \n')
            .trim();
        let tracklist = normBlock(meta.tracklist || '');
        if (!tracklist) {
            const m = (meta.description || '').match(/◎曲目[\s\S]*$/);
            if (m?.[0]) tracklist = normBlock(m[0].replace(/^◎曲目/, '').trim());
        }
        if (tracklist) {
            releaseDesc = releaseDesc.replace(tracklist, '').trim();
        }
        let tags = subtitle.includes('|') ? subtitle.split('|').pop()!.trim() : subtitle;
        try {
            const dom = JSON.parse(meta.originalDom || '{}') as Record<string, any>;
            const mt = Array.isArray(dom.musicType) ? dom.musicType : (typeof dom.musicType === 'string' ? dom.musicType.split(',') : []);
            const t2 = mt.map((x: any) => norm1(String(x || ''))).filter(Boolean).join(', ');
            if (t2) tags = t2;
        } catch { }

        const frNameDict: Record<string, string> = {
            RED: 'Redacted',
            OPS: 'Orpheus',
            DIC: 'DICMusic',
            DICMusic: 'DICMusic',
            SugoiMusic: 'SugoiMusic',
            jpop: 'Jpopsuki'
        };
        const frName = frNameDict[meta.sourceSite || ''] || '';

        const setValue = (
            el: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement | null,
            v: string,
            opts?: { force?: boolean }
        ) => {
            if (!el) return;
            const cur = ((el as any).value ?? '').toString().trim();
            if (!opts?.force && cur && cur !== '---') return;
            (el as any).value = v;
            try {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            } catch { }
        };
        const setSelect = (el: HTMLSelectElement | null, v: string) => {
            if (!el) return;
            const cur = (el.value || '').toString().trim();
            if (cur && cur !== '---') return;
            el.value = v;
            try {
                el.dispatchEvent(new Event('input', { bubbles: true }));
                el.dispatchEvent(new Event('change', { bubbles: true }));
            } catch { }
        };

        retry(() => {
            setValue((document.querySelector('#artist') as HTMLInputElement | null) || (document.querySelector('input[name="artist"]') as HTMLInputElement | null), artist);
            setValue((document.querySelector('#resource_name') as HTMLInputElement | null) || (document.querySelector('input[name="resource_name"]') as HTMLInputElement | null), album);
            setValue((document.querySelector('#title') as HTMLInputElement | null) || (document.querySelector('input[name="title"]') as HTMLInputElement | null), displayName, { force: true });
            setValue((document.querySelector('#name') as HTMLInputElement | null) || (document.querySelector('input[name="name"]') as HTMLInputElement | null), displayName, { force: true });
            setValue((document.querySelector('#year') as HTMLInputElement | null) || (document.querySelector('input[name="year"]') as HTMLInputElement | null), year);
            setSelect((document.querySelector('#browsecat') as HTMLSelectElement | null) || (document.querySelector('select[name="browsecat"]') as HTMLSelectElement | null), '408');
            setSelect((document.querySelector('#share_rule') as HTMLSelectElement | null) || (document.querySelector('select[name="share_rule"]') as HTMLSelectElement | null), '3');
            setValue((document.querySelector('#tags') as HTMLInputElement | null) || (document.querySelector('input[name="tags"]') as HTMLInputElement | null), tags);
            setValue((document.querySelector('#image') as HTMLInputElement | null) || (document.querySelector('input[name="image"]') as HTMLInputElement | null), cover);
            setValue((document.querySelector('#release_desc') as HTMLTextAreaElement | null) || (document.querySelector('textarea[name="release_desc"]') as HTMLTextAreaElement | null), releaseDesc);
            setValue((document.querySelector('#descr') as HTMLTextAreaElement | null) || (document.querySelector('textarea[name="descr"]') as HTMLTextAreaElement | null), releaseDesc);
            if (tracklist) {
                setValue((document.querySelector('textarea[name="track_list"]') as HTMLTextAreaElement | null), tracklist);
            }
            if (frName) {
                setValue((document.querySelector('#frname') as HTMLInputElement | null) || (document.querySelector('input[name="frname"]') as HTMLInputElement | null), frName);
            }
            setSelect((document.querySelector('#team') as HTMLSelectElement | null) || (document.querySelector('select[name="team"]') as HTMLSelectElement | null), '5');

            const blob = `${rawTitle} ${subtitle} ${meta.editionInfo || ''} ${tracklist}`.toUpperCase();
            const pickByText = (sel: string) => {
                const el = document.querySelector(sel) as HTMLSelectElement | null;
                if (!el) return;
                const cur = (el.value || '').toString().trim();
                if (cur && cur !== '---') return;
                const opts = Array.from(el.options);
                for (const o of opts) {
                    const t = (o.textContent || '').toUpperCase();
                    if (!t || t === '---') continue;
                    if (blob.includes(t)) {
                        el.value = o.value;
                        el.dispatchEvent(new Event('change', { bubbles: true }));
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                        break;
                    }
                }
            };
            pickByText('#standard');
            pickByText('#medium');
            pickByText('#releasetype');
            pickByText('#format');
            pickByText('#bitrate');
            pickByText('#media');

            // Legacy parity: infer audio mode from media hints.
            const audioMode = document.querySelector('#audio_mode') as HTMLSelectElement | null;
            if (audioMode && (!audioMode.value || audioMode.value === '---')) {
                const b = `${meta.editionInfo || ''} ${meta.smallDescr || ''} ${meta.subtitle || ''} ${tracklist}`;
                if (/整轨/.test(b)) audioMode.value = 'single';
                else if (/分轨/.test(b) || (document.querySelector('#standard') as HTMLSelectElement | null)?.value === '4') audioMode.value = 'multi';
                else audioMode.value = 'none';
                audioMode.dispatchEvent(new Event('change', { bubbles: true }));
                audioMode.dispatchEvent(new Event('input', { bubbles: true }));
            }
        });

        // Plugin upload path bypasses generic Nexus file injection; inject cleaned torrent here.
        try {
            if (meta.torrentBase64 || meta.torrentUrl) {
                const result = await TorrentService.buildForwardTorrentFile(meta, this.config.name, null);
                if (result) {
                    const fileInput =
                        (document.querySelector('input[type="file"][name="file"]') as HTMLInputElement | null) ||
                        (document.querySelector('input[type="file"]#file') as HTMLInputElement | null) ||
                        (document.querySelector('input[type="file"][name*="torrent"]') as HTMLInputElement | null) ||
                        (document.querySelector('input[type="file"]') as HTMLInputElement | null);
                    if (fileInput) {
                        TorrentService.injectFileIntoInput(fileInput, result.file);
                    }
                }
            }
        } catch (e) {
            console.error('[Auto-Feed] OpenCD torrent injection failed:', e);
        }
    }
}
