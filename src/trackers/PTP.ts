import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import { getMediainfoPictureFromDescr } from '../common/legacy/media';
import { getType } from '../common/legacy/text';

const cleanTitle = (name: string) => name.replace(/\[|\]|\(|\)|mkv$|mp4$/gi, '').trim();

const getBlurayNameFromDescr = (descr: string, name: string, currentName?: string) => {
    let tempTitle = '';
    if (descr.match(/(2160)(P|I)/i)) {
        tempTitle += '2160p.Blu-ray ';
    } else if (descr.match(/(1080)(P)/i)) {
        tempTitle += '1080p.Blu-ray.';
    } else if (descr.match(/(1080)(i)/i)) {
        tempTitle += '1080i.Blu-ray.';
    }

    if (descr.match(/Ultra HD|UHD/i)) {
        tempTitle = 'UHD ';
    }

    if (descr.match(/(AVC Video)/i)) {
        tempTitle += 'AVC.';
    } else if (descr.match(/(HEVC)/i)) {
        tempTitle += 'HEVC.';
    } else if (descr.match(/MPEG-2 Video/i)) {
        tempTitle += 'MPEG-2.';
    }

    if (descr.match(/DTS:X[\s\S]{0,200}?7.1/i)) {
        tempTitle += 'DTS-HD.MA.7.1';
    } else if (descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `TrueHD.${descr.match(/TrueHD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    } else if (descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `DTS-HD.MA.${descr.match(/DTS-HD[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    } else if (descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `LPCM.${descr.match(/LPCM[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    } else if (descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)) {
        tempTitle += `DD.${descr.match(/Dolby Digital[\s\S]{0,200}?(7\.1|5\.1|2\.0|1\.0)/i)?.[1]}`;
    }

    if (currentName && currentName.match(/Blu-ray|DTS-HD|TrueHD|LPCM|HEVC|Bluray/i)) {
        return currentName;
    }
    if (name.match(/BLURAY|UHD\.BLURAY/i)) {
        let fixed = name.replace(/MULTi.|DUAL.|SWEDiSH|DOCU/i, '');
        fixed = fixed.replace(/GERMAN/i, 'GER');
        fixed = fixed.replace(/REMASTERED/i, 'Remastered');
        fixed = fixed.replace(/UNCUT/i, 'Uncut');
        fixed = fixed.replace(/COMPLETE[\s\S]{0,20}BLURAY/i, tempTitle);
        return fixed;
    }
    return `${name}.${tempTitle}-NoGroup`;
};

export class PTPEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing PTP page...');

        const url = new URL(this.currentUrl);
        let torrentId = url.searchParams.get('torrentid') || '';
        let torrentBox: HTMLElement | null = null;
        if (torrentId) {
            torrentBox = document.getElementById(`torrent_${torrentId}`);
        }
        if (!torrentBox) {
            const first = document.querySelector('[id^="torrent_"]') as HTMLElement | null;
            if (first) {
                torrentBox = first;
                if (!torrentId) {
                    const idMatch = first.id.match(/torrent_(\d+)/);
                    if (idMatch) torrentId = idMatch[1];
                }
            }
        }

        const $torrentBox = torrentBox ? $(torrentBox) : $();
        const groupHeader = torrentId ? document.getElementById(`group_torrent_header_${torrentId}`) : null;
        const editionInfo = groupHeader ? $(groupHeader).find('a#PermaLinkedTorrentToggler').text().trim() : '';

        const titleCandidates: string[] = [];
        if ($torrentBox.length) {
            $torrentBox.find('a[onclick*="MediaInfoToggleShow"]').each((_, el) => {
                const text = $(el).text().trim();
                if (text && text.length > 4) titleCandidates.push(text);
            });
            if (torrentId) {
                $torrentBox.find(`a[data-torrentid="${torrentId}"]`).each((_, el) => {
                    const text = $(el).text().trim();
                    if (text && text.length > 4) titleCandidates.push(text);
                });
                $torrentBox.find(`a[href*="torrentid=${torrentId}"]`).each((_, el) => {
                    const text = $(el).text().trim();
                    if (text && text.length > 4) titleCandidates.push(text);
                });
            }
            const fileTd = torrentId ? document.querySelector(`#files_${torrentId} td`) : null;
            if (fileTd?.textContent) titleCandidates.push(fileTd.textContent.trim());
        }

        const pickBestTitle = () => {
            if (!titleCandidates.length) return '';
            return titleCandidates.reduce((best, cur) => (cur.length > best.length ? cur : best), titleCandidates[0]);
        };

        let title = cleanTitle(pickBestTitle());
        if (!title) {
            title = $('.page__title').first().text().trim() || $('h1').first().text().trim();
            title = title.replace(/\[.*?\]/g, '').trim();
        }

        let description = '';
        let fullMediaInfo = '';
        if (torrentBox) {
            const blockquotes = torrentBox.getElementsByTagName('blockquote');
            for (let i = 0; i < blockquotes.length; i++) {
                const tmp = (blockquotes[i].textContent || '').trim();
                if (tmp.match(/Unique ID|DISC INFO:|.MPLS|General/i)) {
                    fullMediaInfo = tmp;
                    if (tmp.match(/Complete.*?name.*?(VOB|IFO)/i)) {
                        const next = (blockquotes[i + 1]?.textContent || '').trim();
                        if (tmp.match(/VOB/i)) {
                            fullMediaInfo = `${tmp}[/quote]\n\n[quote]${next}`;
                        } else {
                            fullMediaInfo = `${next}[/quote]\n\n[quote]${tmp}`;
                        }
                    }
                    break;
                }
            }
        }
        if (fullMediaInfo) {
            description = `[quote]${fullMediaInfo}[/quote]\n\n`;
        }

        const images: string[] = [];
        if (torrentBox) {
            const guards = torrentBox.getElementsByClassName('bbcode-table-guard');
            const lastGuard = guards.length ? (guards[guards.length - 1] as HTMLElement) : null;
            if (lastGuard) {
                lastGuard.querySelectorAll('img').forEach((img) => {
                    const src = img.getAttribute('data-src') || img.getAttribute('src');
                    if (src) {
                        images.push(src);
                        description += `[img]${src}[/img]\n`;
                    }
                });

                let comparePicture = '';
                lastGuard.querySelectorAll('a[onclick*="ScreenshotComparisonToggleShow"]').forEach((link) => {
                    const onclick = link.getAttribute('onclick') || '';
                    const info = onclick.match(/\[[^\]]+\]/g);
                    if (!info || info.length < 2) return;
                    const label = info[0].replace(/[\[\]\"]/g, '').replace(/,/g, ' | ').trim();
                    const rawPics = info[1].replace(/[\[\]\"]/g, '').split(',').map((p) => p.replace(/\\/g, '').trim()).filter(Boolean);
                    if (!rawPics.length) return;
                    const teamCount = label ? label.split('|').length : rawPics.length;
                    comparePicture += `\n${label}\n`;
                    rawPics.forEach((pic, idx) => {
                        comparePicture += `[img]${pic}[/img]`;
                        if ((idx + 1) % teamCount === 0) comparePicture += '\n';
                    });
                });
                if (comparePicture) {
                    description += `\n\n[b]对比图[/b]\n${comparePicture}`;
                }
            }
        }

        if (!description) {
            const descrEl =
                $('.torrent_description .body').first()[0] ||
                $('.box .pad').first()[0] ||
                $('.panel__body').first()[0] ||
                undefined;
            description = descrEl ? htmlToBBCode(descrEl) : '';
        }

        const imdbLink =
            $('#imdb-title-link').attr('href') ||
            $('a[href*="imdb.com/title/"]').first().attr('href') ||
            '';
        const imdbId = imdbLink.match(/tt\d+/)?.[0];

        let downloadLink = '';
        if (torrentId) {
            downloadLink =
                $torrentBox.find(`a[href*="download&id=${torrentId}"]`).first().attr('href') ||
                $torrentBox.find(`a[href*="download.php?id=${torrentId}"]`).first().attr('href') ||
                '';
        }
        if (!downloadLink) {
            downloadLink =
                $('a[href*="action=download"]').first().attr('href') ||
                $('a[href*="download"]').first().attr('href') ||
                '';
        }
        let torrentUrl = '';
        if (downloadLink) {
            try {
                torrentUrl = new URL(downloadLink, this.currentUrl).href;
            } catch {
                torrentUrl = downloadLink;
            }
        }

        const meta: TorrentMeta = {
            title,
            description,
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images
        };

        if (imdbLink) {
            meta.imdbUrl = imdbLink;
            meta.imdbId = imdbId;
        }
        if (editionInfo) {
            meta.editionInfo = editionInfo;
        }
        if (fullMediaInfo) {
            meta.fullMediaInfo = fullMediaInfo;
        }
        if (torrentUrl) meta.torrentUrl = torrentUrl;
        if (!meta.type && meta.title) meta.type = getType(meta.title);

        if (editionInfo.match(/DVD\d/i)) {
            meta.mediumSel = 'DVD';
            const h2 = $('h2').first().text();
            const baseName = h2.split(/\[.*?\]/)[0].trim();
            const year = h2.match(/\[(\d+)\]/)?.[1] || '';
            const ntscPal = editionInfo.match(/NTSC|PAL/i)?.[0] || '';
            const dvdTag = editionInfo.match(/DVD\d+/i)?.[0] || '';
            const parts = [baseName, year, ntscPal, dvdTag].filter(Boolean);
            if (parts.length) meta.title = parts.join(' ').trim();
        }

        if (meta.description.match(/.MPLS/i)) {
            const h2 = $('h2').first().text();
            const baseName = h2.split(/\[.*?\]/)[0].trim();
            const year = h2.match(/\[(\d+)\]/)?.[1] || '';
            const base = [baseName, year].filter(Boolean).join(' ').trim();
            let blurayName = getBlurayNameFromDescr(meta.description, base, meta.title);
            const releaseGroup = groupHeader?.getAttribute('data-releasegroup');
            if (releaseGroup) {
                blurayName = blurayName.replace('NoGroup', releaseGroup);
            }
            meta.mediumSel = 'Blu-ray';
            meta.title = blurayName.replace(/bluray/i, 'Blu-ray');
        }

        if (meta.title) {
            meta.title = meta.title.replace(/\s+-\s+/i, '-').trim();
        }

        if (meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, '.').replace(/\*/g, '') + '.torrent';
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, '.');
            meta.torrentName = meta.torrentFilename;
        }

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling PTP form...');

        const announce = $('input[value*="announce"]').val()?.toString() || null;
        try {
            const { TorrentService } = await import('../services/TorrentService');
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announce);
            if (result) {
                TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
            }
        } catch (err) {
            console.error('[Auto-Feed][PTP] Torrent inject failed:', err);
        }

        if ($('#imdb').is(':visible')) {
            const imdb = meta.imdbUrl || meta.imdbId || '';
            if (imdb) {
                $('#imdb').val(imdb);
                $('#autofill').trigger('click');
            }
        }

        // Synopsis / plot (best-effort)
        if (meta.synopsis) {
            const synopsis = meta.synopsis.trim();
            const synopsisSelectors = [
                '#body',
                'textarea[name="body"]',
                '#synopsis',
                'textarea[name="synopsis"]',
                '#plot',
                'textarea[name="plot"]',
                '#summary',
                'textarea[name="summary"]',
                '#description',
                'textarea[name="description"]'
            ];
            for (const sel of synopsisSelectors) {
                const el = document.querySelector(sel) as HTMLTextAreaElement | null;
                if (el && (el.id === 'release_desc' || el.name === 'release_desc')) {
                    continue;
                }
                if (el && el.value.trim() === '') {
                    el.value = synopsis;
                    el.dispatchEvent(new Event('input', { bubbles: true }));
                    el.dispatchEvent(new Event('change', { bubbles: true }));
                    break;
                }
            }
        }

        // Remaster
        try {
            $('#remaster').prop('checked', true);
            $('#remaster_true').removeClass('hidden');
        } catch {}

        // Source
        switch (meta.mediumSel) {
            case 'UHD':
            case 'Blu-ray':
            case 'Encode':
            case 'Remux':
                $('#source').val('Blu-ray');
                break;
            case 'HDTV':
                $('#source').val('HDTV');
                break;
            case 'WEB-DL':
                $('#source').val('WEB');
                break;
            case 'DVD':
                $('#source').val('DVD');
                break;
            case 'TV':
                $('#source').val('TV');
                break;
        }
        if ((meta.title || '').match(/hd-dvd/i)) {
            $('#source').val('HD-DVD');
        }

        // Codec
        switch (meta.codecSel) {
            case 'H265':
                $('#codec').val('H.265');
                break;
            case 'H264':
                $('#codec').val('H.264');
                break;
            case 'X264':
                $('#codec').val('x264');
                break;
            case 'X265':
                $('#codec').val('x265');
                break;
            case 'VC-1':
                $('#codec').val('VC-1');
                break;
            case 'XVID':
                $('#codec').val('XviD');
                break;
            case 'DIVX':
                $('#codec').val('DivX');
                break;
            case 'MPEG-2':
            case 'MPEG-4':
                $('#codec').val('Other');
                $('#codec')[0]?.dispatchEvent(new Event('change', { bubbles: true }));
                $('#other_codec').val(meta.codecSel || '');
                break;
        }
        if ((meta.title || '').match(/dvd5/i)) {
            $('#codec').val('DVD5');
        } else if ((meta.title || '').match(/dvd9/i)) {
            $('#codec').val('DVD9');
        }

        // Resolution
        let standard = meta.standardSel || '';
        if (standard === 'SD') {
            const height = (meta.description || '').match(/Height.*?:(.*?)pixels/i)?.[1]?.trim();
            if (height === '480') standard = '480p';
            else if (height === '576') standard = '576p';
            if ((meta.title || '').match(/576p/i)) standard = '576p';
        }
        const standardMap: Record<string, string> = {
            SD: '480p',
            '720p': '720p',
            '1080i': '1080i',
            '1080p': '1080p',
            '4K': '2160p',
            '480p': '480p',
            '576p': '576p',
            '': 'Other'
        };
        if (standard in standardMap) {
            $('#resolution').val(standardMap[standard]);
        }
        if ((meta.title || '').match(/pal/i)) {
            $('#resolution').val('PAL');
        } else if ((meta.title || '').match(/ntsc/i)) {
            $('#resolution').val('NTSC');
        }
        if ($('#resolution').val() === 'Other') {
            $('#resolution')[0]?.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // Release description
        try {
            const info = getMediainfoPictureFromDescr(meta.description || '', { mediumSel: meta.mediumSel });
            const miText = (meta.fullMediaInfo || info.mediainfo || '').trim();
            const miWrapped = miText ? `[mediainfo]\n${miText}\n[/mediainfo]` : '';
            const releaseDesc = `${miWrapped}${miWrapped && info.picInfo ? '\n\n' : ''}${info.picInfo || ''}`.trim();
            $('#release_desc').val(releaseDesc);
        } catch {
            $('#release_desc').val((meta.description || '').replace(/\[\/?.{1,20}\]\n?/g, ''));
        }

        // Container
        const releaseText = ($('#release_desc').val() || '').toString();
        if (releaseText.match(/Audio Video Interleave|AVI/i)) {
            $('#container').val('AVI');
        } else if (releaseText.match(/mp4|\.mp4/i)) {
            $('#container').val('MP4');
        } else if (releaseText.match(/Matroska|\.mkv/i)) {
            $('#container').val('MKV');
        } else if (releaseText.match(/\.mpg/i)) {
            $('#container').val('MPG');
        } else if ((meta.description || '').match(/MPLS/i)) {
            $('#container').val('m2ts');
        }
        $('#container')[0]?.dispatchEvent(new Event('change', { bubbles: true }));
    }
}
