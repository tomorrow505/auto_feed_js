import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { GazelleEngine } from './Gazelle';
import { extractImdbId, matchLink } from '../common/rules/links';
import { fillMusicGazelleUpload } from './musicGazelleFill';

// Dedicated engine entry for RED.
export class REDEngine extends GazelleEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing RED page...');
        const abs = (href: string) => {
            try { return new URL(href, this.currentUrl).href; } catch { return href; }
        };
        const torrentId = this.currentUrl.match(/torrentid=(\d+)/)?.[1] || '';

        let title = (document.querySelector('h2') as HTMLElement | null)?.textContent?.replace(/\s+/g, ' ').trim() || '';
        title = title.replace(/\[|\]/g, '*');

        const musicName = $('h2>span[dir="ltr"]').first().text().trim();
        const musicAuthor = musicName ? title.split(musicName)[0].replace(/-.?$/, '').trim() : '';

        let cover = '';
        const coverBox = document.getElementById('cover_div_0') as HTMLElement | null;
        try {
            const img = coverBox?.querySelector('img') as HTMLImageElement | null;
            const onclick = img?.getAttribute('onclick') || '';
            cover = onclick.match(/'(.*)'/)?.[1] || img?.getAttribute('src') || img?.src || '';
        } catch { }
        if (cover) cover = abs(cover);

        const infoBody =
            (document.querySelector('.torrent_description .body') as HTMLElement | null) ||
            (document.querySelector('.box_torrent_description .pad') as HTMLElement | null);
        let tracklist = (infoBody?.textContent || '').trim();
        if (infoBody && $(infoBody).find('ol.postlist').length) {
            const merged: string[] = [];
            $(infoBody).find('ol.postlist li').each((idx, e) => {
                merged.push(`${idx + 1} ${$(e).text()}`);
            });
            if (merged.length) tracklist = `${tracklist.split(merged[0])[0].trim()}\n${merged.join('\n')}`.trim();
        }

        let smallDescr = '';
        if (torrentId) {
            smallDescr = $(`#torrent${torrentId}`).find('a').eq(3).text().trim() || '';
        }

        let editionInfo = '';
        let musicMedia = '';
        if (torrentId) {
            let row = $(`#torrent${torrentId}`);
            let count = 0;
            while (count <= 25 && row.length) {
                const txt = row.text().trim();
                if (/^[−–]\s/.test(txt)) {
                    editionInfo = txt.replace(/^[−–]\s*/, '').trim();
                    break;
                }
                const cls = (row.attr('class') || '').toLowerCase();
                if (!musicMedia && cls.includes('release') && !cls.includes('torrentdetails')) {
                    musicMedia = txt;
                }
                const prev = row.prev();
                if (!prev.length) break;
                row = prev;
                count += 1;
            }
        }

        const musicType = Array.from($('div.box_tags').find('a[href*="taglist"]'))
            .map((e) => $(e).text().trim())
            .filter(Boolean);

        const rowQuote = torrentId ? ($(`#torrent_${torrentId}`).find('blockquote').last().text() || '').trim() : '';
        let description = '';
        if (cover) description += `[img]${cover}[/img]\n\n`;
        if (rowQuote) description += `${rowQuote}\n\n`;
        if (tracklist) description += `[quote]${tracklist}[/quote]`;
        description = description.trim();

        const torrentHref =
            (torrentId && $(`a[href*="download&id=${torrentId}"]`).first().attr('href')) ||
            '';
        const imdbUrl = matchLink('imdb', document.body.innerHTML) || $('a[href*="imdb.com/title/tt"]').first().attr('href') || '';

        return {
            title: title || 'RED',
            smallDescr: smallDescr || undefined,
            subtitle: smallDescr || undefined,
            description,
            tracklist,
            editionInfo: editionInfo || undefined,
            musicMedia: musicMedia || undefined,
            type: '音乐',
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            imdbUrl: imdbUrl || undefined,
            imdbId: imdbUrl ? extractImdbId(imdbUrl) : undefined,
            torrentUrl: torrentHref ? abs(torrentHref) : undefined,
            images: cover ? [cover] : [],
            originalDom: JSON.stringify({
                musicName,
                musicAuthor,
                musicType
            })
        };
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling RED form...');
        const isMusicUpload =
            /redacted\.(ch|sh)\/upload\.php/i.test(this.currentUrl) ||
            !!document.querySelector('#artistfields, #album_desc, #release_desc, input[name="artists[]"]');
        if (!isMusicUpload) {
            await super.fill(meta);
            return;
        }
        await fillMusicGazelleUpload(meta, 'RED');
    }
}
