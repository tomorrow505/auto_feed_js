import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import { matchLink } from '../common/legacy/links';
import { getAudioCodecSel, getCodecSel, getMediumSel, getStandardSel, getType } from '../common/legacy/text';
import { getMediainfoPictureFromDescr } from '../common/legacy/media';
import { HtmlFetchService } from '../services/HtmlFetchService';

export class HDBEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing HDB page...');

        let title = $('h1#top, h1').first().text().trim();
        title = title.replace(/\[.*?\]/g, '').trim();

        const details = document.getElementById('details');
        let descrEl: HTMLElement | undefined;
        let synopsis = '';
        const findDescrByTags = () => {
            const divs = Array.from(document.querySelectorAll('div'));
            for (const div of divs) {
                const text = (div.textContent || '').trim();
                if (text === 'Tags') {
                    let descr = div.parentElement?.parentElement?.nextElementSibling as HTMLElement | null;
                    if (descr && descr.innerHTML.match(/Edit torrent/i)) {
                        descr = descr.previousElementSibling as HTMLElement | null;
                    }
                    if (descr) return descr;
                }
            }
            return null;
        };

        const tagDescr = findDescrByTags();
        if (tagDescr) {
            descrEl = tagDescr;
        }
        if (details) {
            const cells = Array.from(details.querySelectorAll('td, th'));
            for (const cell of cells) {
                const text = (cell.textContent || '').trim().toLowerCase();
                if (text === 'description' || text === 'descr') {
                    const next = cell.nextElementSibling as HTMLElement | null;
                    if (next) {
                        descrEl = next;
                        break;
                    }
                }
            }
            if (!synopsis) {
                for (const cell of cells) {
                    const text = (cell.textContent || '').trim().toLowerCase();
                    if (text.match(/plot|synopsis|summary|简介|剧情|故事/i)) {
                        const next = cell.nextElementSibling as HTMLElement | null;
                        if (next) {
                            synopsis = (next.textContent || '').trim();
                            if (synopsis) break;
                        }
                    }
                }
            }
            if (!descrEl) {
                descrEl =
                    (details.querySelector('#descr') as HTMLElement | null) ||
                    (details.querySelector('.torrent_description .body') as HTMLElement | null) ||
                    (details.querySelector('.body') as HTMLElement | null) ||
                    undefined;
            }
        }
        if (!descrEl) {
            descrEl = ($('#details .body').first()[0] as HTMLElement | undefined) ||
                (document.querySelector('#descr') as HTMLElement | null) ||
                undefined;
        }
        let description = descrEl ? htmlToBBCode(descrEl) : '';
        if (description) {
            let wrapped = `[quote]${description}[/quote]`;
            const insertPoint = wrapped.search(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/i);
            if (insertPoint > -1) {
                wrapped = `${wrapped.slice(0, insertPoint)}\n[/quote]\n\n${wrapped.slice(insertPoint)}`;
                wrapped = wrapped.replace(/\[\/quote\](\s\n)*$/, '');
            }
            wrapped = wrapped.replace(/[\n ]*\[\/quote\]/gi, '[/quote]');
            wrapped = wrapped.replace('Quote', '');
            description = wrapped.trim();
            description = description.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (_m, inner) => {
                const compact = inner.replace(/\n{2,}/g, '\n').trim();
                return `[quote]${compact}\n[/quote]`;
            });
        }

        let imdbUrl =
            (details ? matchLink('imdb', details.innerHTML) : '') ||
            matchLink('imdb', document.body.innerHTML) ||
            $('a[href*="imdb.com/title/"]').first().attr('href') ||
            '';
        if (!imdbUrl) {
            const text = details ? details.textContent || '' : document.body.textContent || '';
            const imdbId = text.match(/tt\d+/)?.[0];
            if (imdbId) imdbUrl = `https://www.imdb.com/title/${imdbId}/`;
        }

        const downloadLink =
            $('a[href*="download.php"]').first().attr('href') ||
            $('a[href*="download"]').first().attr('href') ||
            '';

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
            images: []
        };

        if (imdbUrl) {
            meta.imdbUrl = imdbUrl;
            meta.imdbId = imdbUrl.match(/tt\d+/)?.[0];
        }
        if (synopsis) {
            meta.synopsis = synopsis.replace(/\s+/g, ' ').trim();
        }
        if (torrentUrl) meta.torrentUrl = torrentUrl;

        const infoParts: string[] = [];
        if (details) {
            const cells = Array.from(details.querySelectorAll('td, th'));
            for (const cell of cells) {
                const text = (cell.textContent || '').trim();
                if (!text) continue;
                if (text.match(/Category|类别|Type|规格|Codec|Format|Resolution|Source|Audio/i)) {
                    const next = cell.nextElementSibling as HTMLElement | null;
                    if (next && next.textContent) {
                        infoParts.push(`${text} ${next.textContent}`);
                    } else {
                        infoParts.push(text);
                    }
                }
            }
        }
        const infoText = infoParts.length ? infoParts.join(' ') : (details?.textContent || '');

        if (!meta.type) {
            meta.type = getType(infoText) || (meta.title ? getType(meta.title) : '');
        }
        if (!meta.mediumSel) {
            meta.mediumSel = getMediumSel(infoText, meta.title);
        }
        if (!meta.codecSel) {
            meta.codecSel = getCodecSel(infoText);
        }
        if (!meta.audioCodecSel) {
            meta.audioCodecSel = getAudioCodecSel(infoText);
        }
        if (!meta.standardSel) {
            meta.standardSel = getStandardSel(infoText);
        }

        if (meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, '.').replace(/\*/g, '') + '.torrent';
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, '.');
            meta.torrentName = meta.torrentFilename;
        }

        const collectImages = (root?: Element | null) => {
            const urls: string[] = [];
            if (!root) return urls;
            const imgs = Array.from(root.querySelectorAll('img')) as HTMLImageElement[];
            imgs.forEach((img) => {
                const src = img.getAttribute('data-src') || img.getAttribute('src') || img.src || '';
                if (!src) return;
                if (src.match(/smilies|icon|avatar|logo|favicon|rating|badge|button/i)) return;
                const w = Number(img.getAttribute('width') || img.width || 0);
                const h = Number(img.getAttribute('height') || img.height || 0);
                if (w && h && w <= 80 && h <= 80) return;
                if (!src.match(/\.(jpg|jpeg|png|webp|gif)(\?|$)/i) && !src.match(/ptpimg|imgbox|pixhost|image\.php/i)) return;
                urls.push(src);
            });
            return urls;
        };

        try {
            const info = getMediainfoPictureFromDescr(description);
            if (info.mediainfo) {
                const rebuilt = `${info.mediainfo ? `[quote]${info.mediainfo}[/quote]\n\n` : ''}${info.picInfo || ''}`.trim();
                if (rebuilt) {
                    meta.description = rebuilt;
                }
            } else {
                meta.description = description;
            }

            if (!meta.description.match(/\[img\]/i)) {
                const screenRow = details
                    ? Array.from(details.querySelectorAll('td, th')).find((cell) => {
                        const text = (cell.textContent || '').trim();
                        return text.match(/Screenshots?|Screens|截图|截图信息/i);
                    })
                    : null;
                if (screenRow) {
                    const next = screenRow.nextElementSibling as HTMLElement | null;
                    const shots = collectImages(next);
                    if (shots.length) {
                        meta.description = `${meta.description || ''}\n${shots.map((u) => `[img]${u}[/img]`).join('\n')}`.trim();
                    }
                }
            }
            const picMatches = (meta.description || '').match(/\[img\](.*?)\[\/img\]/g);
            if (picMatches) {
                meta.images = picMatches
                    .map((item) => item.match(/\[img\](.*?)\[\/img\]/)?.[1])
                    .filter((v): v is string => !!v);
            }
        } catch {}

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling HDB form...');

        // Passkey announce
        try {
            const userHref = $('a[href*="userdetails"]').attr('href') || '';
            if (userHref) {
                const userUrl = new URL(userHref, this.config.baseUrl || this.currentUrl).href;
                const doc = await HtmlFetchService.getDocument(userUrl);
                let passkey = '';
                const tds = Array.from(doc.querySelectorAll('td'));
                for (let i = 0; i < tds.length; i++) {
                    const text = (tds[i].textContent || '').trim();
                    if (text.includes('Passkey')) {
                        passkey = (tds[i].nextElementSibling?.textContent || '').trim();
                        break;
                    }
                }
                const announce = passkey ? `http://tracker.hdbits.org/announce.php?passkey=${passkey}` : null;
                const { TorrentService } = await import('../services/TorrentService');
                const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announce);
                if (result) {
                    TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
                }
            }
        } catch (err) {
            console.error('[Auto-Feed][HDB] Torrent inject failed:', err);
        }

        $('#name').val(meta.title || '');

        const setSelect = (selector: string, value: string) => {
            const el = $(selector);
            if (!el.length) return;
            el.val(value);
            el.trigger('change');
        };

        switch (meta.type) {
            case '电影':
                setSelect('#type_category', '1');
                break;
            case '剧集':
            case '综艺':
                setSelect('#type_category', '2');
                break;
            case '音乐':
                setSelect('#type_category', '4');
                break;
            case '纪录':
                setSelect('#type_category', '3');
                break;
            case '动漫':
                setSelect('#type_category', (meta.title || '').match(/S\d+/i) ? '2' : '1');
                break;
            case '体育':
                setSelect('#type_category', '5');
                break;
        }

        switch (meta.codecSel) {
            case 'H264':
            case 'X264':
                setSelect('#type_codec', '1');
                break;
            case 'H265':
            case 'X265':
                setSelect('#type_codec', '5');
                break;
            case 'VC-1':
                setSelect('#type_codec', '3');
                break;
            case 'MPEG-2':
                setSelect('#type_codec', '2');
                break;
            case 'XVID':
                setSelect('#type_codec', '4');
                break;
            default:
                setSelect('#type_codec', '0');
        }

        switch (meta.mediumSel) {
            case 'UHD':
            case 'Blu-ray':
            case 'DVD':
                setSelect('#type_medium', '1');
                break;
            case 'Remux':
                setSelect('#type_medium', '5');
                break;
            case 'HDTV':
                setSelect('#type_medium', '4');
                break;
            case 'WEB-DL':
                setSelect('#type_medium', '6');
                break;
            case 'Encode':
                setSelect('#type_medium', '3');
                break;
            default:
                setSelect('#type_medium', '0');
        }

        try {
            const info = getMediainfoPictureFromDescr(meta.description || '', { mediumSel: meta.mediumSel });
            if (meta.mediumSel === 'UHD' || meta.mediumSel === 'Blu-ray' || meta.mediumSel === 'DVD') {
                $('textarea[name="descr"]').val(`${info.mediainfo}\n\n${info.picInfo}`.trim());
                $('textarea[name="descr"]').css({ height: '300px' });
            } else {
                const mediainfo = (info.mediainfo || '').replace(/ \n/g, '\n');
                $('textarea[name="techinfo"]').val(mediainfo);
                $('textarea[name="techinfo"]').css({ height: '800px' });
                $('textarea[name="descr"]').val(info.picInfo || '');
            }
        } catch {
            $('textarea[name="descr"]').val(meta.description || '');
        }

        if (meta.imdbUrl || meta.imdbId) {
            $('input[name="imdb"]').val(meta.imdbUrl || meta.imdbId || '');
        }
    }
}
