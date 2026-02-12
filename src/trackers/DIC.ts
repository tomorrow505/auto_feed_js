import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { GazelleEngine } from './Gazelle';
import { extractImdbId, matchLink } from '../common/rules/links';
import { fillMusicGazelleUpload } from './musicGazelleFill';

// Dedicated engine entry for DICMusic.
export class DICEngine extends GazelleEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing DIC page...');
        const abs = (href: string) => {
            try { return new URL(href, this.currentUrl).href; } catch { return href; }
        };
        const torrentId = this.currentUrl.match(/torrentid=(\d+)/)?.[1] || '';

        let title = (document.querySelector('h2') as HTMLElement | null)?.textContent?.replace(/\s+/g, ' ').trim() || '';
        title = title.replace(/\[|\]/g, '*');

        const musicName = $('h2>span[dir="ltr"]').first().text().trim();
        const musicAuthor = musicName ? title.split(musicName)[0].replace(/-.?$/, '').trim() : '';

        let cover = '';
        try {
            const img = $('#cover_div_0').find('img').first();
            const onclick = (img.attr('onclick') || '').trim();
            cover = onclick.match(/http.*?(jpg|png|jpeg|webp)/i)?.[0] || (img.attr('src') || '').trim();
        } catch { }
        if (cover) cover = abs(cover);

        const infoBody =
            (document.querySelector('.torrent_description .body') as HTMLElement | null) ||
            (document.querySelector('.torrent_description div:nth-child(2)') as HTMLElement | null) ||
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
            smallDescr = $(`#torrent${torrentId}`).find('a').eq(5).text().trim() || '';
        }

        let editionInfo = '';
        if (torrentId) {
            const prevTxt = $(`#torrent${torrentId}`).prev().text().replace('− ', '').trim();
            if (prevTxt) editionInfo = prevTxt;
        }

        const rowQuote = torrentId ? ($(`#torrent_${torrentId}`).find('blockquote').last().text() || '').trim() : '';
        let description = '';
        if (cover) description += `[img]${cover}[/img]\n\n`;
        if (rowQuote && !/发布于/.test(rowQuote)) description += `${rowQuote}\n\n`;
        if (tracklist) description += `[quote]${tracklist}[/quote]`;
        description = description.trim();

        const musicType = Array.from($('div.box_tags').find('a[href*="taglist"]')).map((e) => $(e).text().trim()).filter(Boolean);
        if (/原声/.test(title) && !musicType.some((t) => /ost/i.test(t))) musicType.push('OST');

        const torrentHref =
            (torrentId && $(`a[href*="download&id=${torrentId}"]`).first().attr('href')) ||
            '';
        const imdbUrl = matchLink('imdb', document.body.innerHTML) || $('a[href*="imdb.com/title/tt"]').first().attr('href') || '';

        return {
            title: title || 'DIC',
            smallDescr: smallDescr || undefined,
            subtitle: smallDescr || undefined,
            description,
            tracklist,
            editionInfo: editionInfo || undefined,
            musicMedia: editionInfo || undefined,
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
        this.log('Filling DIC form...');
        const isMusicUpload =
            /dicmusic\.com\/upload\.php/i.test(this.currentUrl) ||
            !!document.querySelector('#artistfields, #album_desc, #release_desc, input[name="artists[]"]');
        if (!isMusicUpload) {
            await super.fill(meta);
            return;
        }
        await fillMusicGazelleUpload(meta, 'DIC');
    }
}
