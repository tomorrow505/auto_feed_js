import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import { extractImdbId, extractTmdbId, matchLink } from '../common/rules/links';
import { getAudioCodecSel, getCodecSel, getMediumSel, getStandardSel, getType } from '../common/rules/text';
import { cleanMediaInfoText, getMediainfoPictureFromDescr } from '../common/rules/media';
import { HtmlFetchService } from '../services/HtmlFetchService';

export class HDBEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    private cleanHdbMediaInfo(raw: string): string {
        let text = String(raw || '').replace(/\r/g, '').trim();
        if (!text) return '';
        try {
            const doc = new DOMParser().parseFromString(text, 'text/html');
            const picked =
                (doc.querySelector('pre, code, textarea') as HTMLElement | null)?.textContent ||
                doc.body?.textContent ||
                '';
            if (picked && picked.trim().length > 40) text = picked;
        } catch {}
        text = cleanMediaInfoText(text);
        return /(General|Unique ID|Complete name|Video|Audio|Text|Format\s*:|Bit rate\s*:|Duration\s*:)/i.test(text)
            ? text
            : '';
    }

    private getHdbReleaseNameFromMediaInfo(raw: string): string {
        const text = cleanMediaInfoText(raw);
        if (!text) return '';

        const release =
            text.match(/RELEASE\.?NAME\s*:\s*([^\r\n]+)/i)?.[1] ||
            text.match(/Complete\s+name\s*:\s*([^\r\n]+)/i)?.[1] ||
            '';
        if (!release) return '';

        let name = release
            .split(/[\\/]/)
            .filter(Boolean)
            .pop() || release;
        name = name
            .replace(/\.(?:mkv|mp4|avi|m2ts|ts|iso|vob|ifo)$/i, '')
            .replace(/\s+/g, ' ')
            .trim();

        return name;
    }

    private getHdbNamesFromDownload(downloadLink: string, downloadText: string): { completeName: string; releaseName: string } {
        let filename = String(downloadText || '').trim();
        if (!filename && downloadLink) {
            try {
                const path = new URL(downloadLink, this.currentUrl).pathname;
                filename = decodeURIComponent(path.split('/').filter(Boolean).pop() || '');
            } catch {
                filename = decodeURIComponent(String(downloadLink || '').split('?')[0].split('/').pop() || '');
            }
        }
        filename = filename
            .replace(/[\\/:*?"<>|]/g, (ch) => (ch === '/' || ch === '\\' ? '.' : ''))
            .replace(/\s+/g, ' ')
            .trim();
        if (!filename) return { completeName: '', releaseName: '' };

        const completeName = filename.replace(/\.torrent$/i, '').trim();
        const releaseName = completeName
            .replace(/\.(?:mkv|mp4|avi|m2ts|ts|iso|vob|ifo)$/i, '')
            .trim();
        return { completeName, releaseName };
    }

    private buildHdbFallbackMediaInfo(completeName: string, technicalSummary: string): string {
        const tech = cleanMediaInfoText(technicalSummary)
            .replace(/^HDB Technical Information\s*/i, '')
            .trim();
        if (!completeName) return tech ? `HDB Technical Information\n${tech}` : '';

        const lines = ['General', `Complete name : ${completeName}`];
        if (/\.mkv$/i.test(completeName)) lines.push('Format : Matroska');
        else if (/\.mp4$/i.test(completeName)) lines.push('Format : MPEG-4');
        else if (/\.avi$/i.test(completeName)) lines.push('Format : AVI');
        else if (/\.m2ts$/i.test(completeName)) lines.push('Format : BDAV');
        else if (/\.ts$/i.test(completeName)) lines.push('Format : MPEG-TS');

        if (tech) {
            lines.push('', 'HDB Technical Information', tech);
        }
        return lines.join('\n').trim();
    }

    private ensureHdbCompleteName(mediaInfo: string, completeName: string): string {
        const clean = cleanMediaInfoText(mediaInfo);
        if (!clean || !completeName || /Complete\s+name\s*:/i.test(clean)) return clean;
        if (/^General\s*$/im.test(clean)) {
            return clean.replace(/^General\s*$/im, `General\nComplete name : ${completeName}`);
        }
        return `General\nComplete name : ${completeName}\n\n${clean}`.trim();
    }

    private async fetchHdbMediaInfo(details: HTMLElement | null): Promise<string> {
        try {
            const href =
                (details?.querySelector('a[href*="/details/mediainfo"]') as HTMLAnchorElement | null)?.href ||
                (document.querySelector('a[href*="/details/mediainfo"]') as HTMLAnchorElement | null)?.href ||
                '';
            if (!href) return '';
            const url = new URL(href, this.currentUrl).href;
            const raw = await HtmlFetchService.getText(url, { withCredentials: true });
            return this.cleanHdbMediaInfo(raw);
        } catch (e) {
            console.warn('[Auto-Feed][HDB] Mediainfo log fetch failed:', e);
            return '';
        }
    }

    private extractHdbTechnicalSummary(details: HTMLElement | null): string {
        if (!details) return '';
        const label = Array.from(details.querySelectorAll('div.label')).find((el) =>
            /Technical Information/i.test(el.textContent || '')
        ) as HTMLElement | undefined;
        const block = label?.nextElementSibling as HTMLElement | null;
        if (!block) return '';
        const rows = Array.from(block.querySelectorAll('tr'));
        const lines: string[] = [];
        rows.forEach((row) => {
            const th = row.querySelector('th');
            const td = row.querySelector('td');
            const key = (th?.textContent || '').replace(/\s+/g, ' ').trim();
            const value = (td?.textContent || '').replace(/\s+/g, ' ').trim();
            if (key && value) lines.push(`${key}: ${value}`);
        });
        if (!lines.length) return '';
        return ['HDB Technical Information', ...lines].join('\n');
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
                        const row = cell.parentElement as HTMLTableRowElement | null;
                        const nextRow = row?.nextElementSibling as HTMLTableRowElement | null;
                        const nextRowCell = nextRow?.querySelector('td, th') as HTMLElement | null;
                        if (nextRowCell) {
                            synopsis = (nextRowCell.textContent || '').trim();
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

        // HDB screenshots: `t.hdbits.org/*.jpg` thumbs should be converted to `i.hdbits.org/*.png` (legacy parity).
        // The page uses thumb URLs in <img>, but forwards should use the full-size CDN where possible.
        if (description && description.match(/https:\/\/t\.hdbits\.org\/.*\.jpg/i)) {
            description = description
                .replace(/https:\/\/t\.hdbits\.org\//gi, 'https://i.hdbits.org/')
                .replace(/\.jpg(\?[^ \]\r\n]*)?(?=\[\/img\])/gi, '.png');
        }

        let imdbUrl =
            (details ? matchLink('imdb', details.innerHTML) : '') ||
            matchLink('imdb', document.body.innerHTML) ||
            $('a[href*="imdb.com/title/"]').first().attr('href') ||
            '';
        if (!imdbUrl) {
            const text = details ? details.textContent || '' : document.body.textContent || '';
            const imdbId = extractImdbId(text);
            if (imdbId) imdbUrl = `https://www.imdb.com/title/${imdbId}/`;
        }

        const downloadAnchor = $('a[href*="download.php"]').first()[0] as HTMLAnchorElement | undefined;
        const fallbackDownloadAnchor = $('a[href*="download"]').first()[0] as HTMLAnchorElement | undefined;
        const downloadLink =
            downloadAnchor?.getAttribute('href') ||
            fallbackDownloadAnchor?.getAttribute('href') ||
            '';
        const downloadText = (downloadAnchor?.textContent || fallbackDownloadAnchor?.textContent || '').trim();

        let torrentUrl = '';
        if (downloadLink) {
            try {
                torrentUrl = new URL(downloadLink, this.currentUrl).href;
            } catch {
                torrentUrl = downloadLink;
            }
        }

        const downloadNames = this.getHdbNamesFromDownload(downloadLink, downloadText);
        const fetchedMediaInfo = await this.fetchHdbMediaInfo(details);
        const technicalSummary = fetchedMediaInfo ? '' : this.extractHdbTechnicalSummary(details);
        const releaseNameFromMedia = this.getHdbReleaseNameFromMediaInfo(fetchedMediaInfo);
        const releaseNameFromDownload = downloadNames.releaseName;
        if (releaseNameFromMedia || releaseNameFromDownload) {
            title = releaseNameFromMedia || releaseNameFromDownload;
        }
        const mediaInfoForMeta =
            this.ensureHdbCompleteName(fetchedMediaInfo, downloadNames.completeName) ||
            this.buildHdbFallbackMediaInfo(downloadNames.completeName, technicalSummary) ||
            technicalSummary;

        const meta: TorrentMeta = {
            title,
            description,
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images: []
        };
        if (mediaInfoForMeta) {
            meta.fullMediaInfo = mediaInfoForMeta;
        }

        if (imdbUrl) {
            meta.imdbUrl = imdbUrl;
            meta.imdbId = extractImdbId(imdbUrl);
        }
        // TMDB: HDB pages may include TMDB links in details/description blocks (legacy parity: keep tmdbUrl+tmdbId for Unit3D targets).
        try {
            const tmdbUrl =
                (details ? matchLink('tmdb', details.innerHTML) : '') ||
                matchLink('tmdb', document.body.innerHTML) ||
                $('a[href*="themoviedb.org/"]').first().attr('href') ||
                '';
            if (tmdbUrl) {
                meta.tmdbUrl = tmdbUrl;
                meta.tmdbId = extractTmdbId(tmdbUrl);
            }
        } catch { }
        if (synopsis) {
            meta.synopsis = synopsis.replace(/\s+/g, ' ').trim();
        }
        if (torrentUrl) meta.torrentUrl = torrentUrl;

        const infoParts: string[] = [];
        const findDetailsValue = (labels: RegExp[]): string => {
            if (!details) return '';
            const cells = Array.from(details.querySelectorAll('td, th'));
            for (const cell of cells) {
                const key = (cell.textContent || '').replace(/\s+/g, ' ').trim();
                if (!key) continue;
                if (!labels.some((re) => re.test(key))) continue;
                const next = cell.nextElementSibling as HTMLElement | null;
                const val = (next?.textContent || '').replace(/\s+/g, ' ').trim();
                if (val) return val;
            }
            return '';
        };

        if (details) {
            const cells = Array.from(details.querySelectorAll('td, th'));
            for (const cell of cells) {
                const text = (cell.textContent || '').trim();
                if (!text) continue;
                // Include Medium (legacy uses `tds[i].textContent.medium_sel()` on the details table).
                if (text.match(/Category|类别|Type|规格|Medium|媒介|介质|Codec|Format|Resolution|Source|Audio/i)) {
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
            const mediumText = findDetailsValue([/^medium$/i, /^source$/i, /媒介|介质|来源/i]);
            if (mediumText) {
                meta.mediumSel = getMediumSel(mediumText, meta.title);
            } else {
                // Only use title for medium detection – avoid concatenated detail text
                // which can false-positive on unrelated "WEB" labels (e.g. "Category: WEB").
                // normalizeMeta() will retry from description/mediainfo as a second pass.
                meta.mediumSel = getMediumSel(meta.title || '', meta.title);
            }
        }
        if (!meta.codecSel) {
            const codecText = findDetailsValue([/^(video )?codec$/i, /^codec$/i, /编码|格式|压制|Video/i]);
            meta.codecSel = getCodecSel(codecText || infoText);
        }
        if (!meta.audioCodecSel) {
            const audioText = findDetailsValue([/^audio/i, /音频/i]);
            meta.audioCodecSel = getAudioCodecSel(audioText || infoText);
        }
        if (!meta.standardSel) {
            const resText = findDetailsValue([/resolution/i, /分辨率/i]);
            meta.standardSel = getStandardSel(resText || infoText);
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
                meta.fullMediaInfo = info.mediainfo;
                const rebuilt = `${info.mediainfo ? `[quote]${info.mediainfo}[/quote]\n\n` : ''}${info.picInfo || ''}`.trim();
                if (rebuilt) {
                    meta.description = rebuilt;
                }
            } else if (meta.fullMediaInfo) {
                const picInfo = info.picInfo || '';
                meta.description = `${meta.fullMediaInfo ? `[quote]${meta.fullMediaInfo}[/quote]\n\n` : ''}${picInfo || description || ''}`.trim();
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
                // Keep source URLs untouched for normal page viewing. The
                // image-host bridge converts HDB thumbs to authenticated PNG
                // downloads only when a rehost operation actually needs files.
                meta.images = picMatches
                    .map((item) => item.match(/\[img\](.*?)\[\/img\]/)?.[1])
                    .filter((v): v is string => !!v);
            }
        } catch { }

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
