import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';

export async function parseGazelle(config: SiteConfig, currentUrl: string): Promise<TorrentMeta> {
    const selectors = {
        groupTitle: '#content .header h2',
        year: '.header h2 .year',
        releaseType: '.header h2 .release_type',
        description: '.box_album_description .pad, .box_album_description, .box .pad',
        tags: '.tags a',
        cover: '#cover_div img, .box_image img'
    };

    const titleRaw = $(selectors.groupTitle).text().trim();
    const year = $(selectors.year).text().replace(/[()]/g, '').trim();
    const releaseType = $(selectors.releaseType).text().trim();
    const title = titleRaw.replace(/\(\d{4}\)/, '').replace(/\[.*?\]/g, '').trim();

    const descrEl = $(selectors.description).first();
    const description = descrEl.length ? htmlToBBCode(descrEl[0]) : '';
    const cover = $(selectors.cover).attr('src');
    const tags = $(selectors.tags)
        .map((_, el) => $(el).text().trim())
        .get()
        .filter(Boolean);

    const meta: TorrentMeta = {
        title: title,
        subtitle: [year, releaseType].filter(Boolean).join(' ') || undefined,
        description,
        sourceSite: config.name,
        sourceUrl: currentUrl,
        images: cover ? [cover] : []
    };

    meta.type = '音乐';

    // If URL contains torrentid, try to parse torrent row details
    const torrentIdMatch = currentUrl.match(/torrentid=(\d+)/);
    if (torrentIdMatch) {
        const torrentId = torrentIdMatch[1];
        const row = document.getElementById(`torrent_${torrentId}`) || document.getElementById(`torrent${torrentId}`);
        if (row) {
            const rowText = (row as HTMLElement).innerText;
            if (rowText) {
                meta.smallDescr = rowText.split('\n').slice(0, 2).join(' ').trim();
            }
        }
    }

    if (tags.length) {
        meta.subtitle = meta.subtitle ? `${meta.subtitle} | ${tags.join(', ')}` : tags.join(', ');
    }

    return meta;
}

export async function fillGazelle(meta: TorrentMeta, config: SiteConfig): Promise<void> {
    // Minimal form fill for Gazelle uploads
    const nameInput = $('input[name="title"], input[name="name"]').first();
    const yearInput = $('input[name="year"]').first();
    const tagsInput = $('input[name="tags"]').first();
    const imageInput = $('input[name="image"]').first();
    const descrInput = $('textarea[name="description"], textarea[name="body"]').first();

    if (nameInput.length) nameInput.val(meta.title || '');
    if (yearInput.length) {
        const yearMatch = (meta.subtitle || '').match(/(19|20)\d{2}/);
        if (yearMatch) yearInput.val(yearMatch[0]);
    }
    if (tagsInput.length && meta.subtitle) {
        const tagsPart = meta.subtitle.split('|').pop()?.trim();
        if (tagsPart) tagsInput.val(tagsPart.replace(/,\s*/g, ','));
    }
    if (imageInput.length && meta.images && meta.images[0]) imageInput.val(meta.images[0]);
    if (descrInput.length) descrInput.val(meta.description || '');
}
