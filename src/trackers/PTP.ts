import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import { extractImdbId } from '../common/rules/links';
import { cleanMediaInfoText, getMediainfoPictureFromDescr } from '../common/rules/media';
import { getAudioCodecSel, getCodecSel, getMediumSel, getStandardSel, getType } from '../common/rules/text';
import { rebuildReleaseTitleFromMedia } from '../common/rules/titleRebuild';
import { getSizeFromDescr } from '../common/rules/helpers';
import { HtmlFetchService } from '../services/HtmlFetchService';

const cleanTitle = (name: string) => name.replace(/\[|\]|\(|\)|mkv$|mp4$/gi, '').trim();

const extractAspectRatioText = (text: string): string => {
    const raw = String(text || '').replace(/\s+/g, ' ').trim();
    if (!raw) return '';
    const ratio = raw.match(/(\d+(?:\.\d+)?\s*:\s*\d+(?:\.\d+)?)/)?.[1] || '';
    if (ratio) return ratio.replace(/\s+/g, '');
    const dec = raw.match(/\b(\d(?:\.\d{1,3})?)\b/)?.[1] || '';
    if (dec) {
        const n = parseFloat(dec);
        if (Number.isFinite(n) && n > 1) return `${Number(n.toFixed(2))}:1`;
    }
    return raw;
};

const extractSynopsisFallback = (text: string): string => {
    const plain = String(text || '')
        .replace(/\[\/?(quote|code|url|img|font|size|color|b|i|u|list|spoiler|mediainfo|hide)[^\]]*\]/gi, ' ')
        .replace(/https?:\/\/\S+/g, ' ')
        .replace(/\r/g, '')
        .replace(/\n{3,}/g, '\n\n');
    const cn =
        plain.match(/◎\s*简\s*介\s*[:：]?\s*([\s\S]{20,2000}?)(?=\n\s*◎|\n\s*(?:Format|Video|Audio|Screenshots?|Files?|Disc|Subtitle|Subtitles|Source)\b|$)/i)?.[1] ||
        '';
    if (cn.trim()) return cn.trim();
    const en =
        plain.match(/\b(?:Plot|Synopsis|Introduction|Summary)\b\s*[:：]?\s*([\s\S]{20,2000}?)(?=\n\s*(?:Format|Video|Audio|Screenshots?|Files?|Disc|Subtitle|Subtitles|Source)\b|$)/i)?.[1] ||
        '';
    return en.trim();
};

const hasCjk = (text: string) => /[\u3400-\u9fff]/i.test(String(text || ''));

const extractPosterFromDescription = (text: string): string =>
    String(text || '').match(/\[img\](https?:\/\/[^\]]+)\[\/img\]/i)?.[1]?.trim() || '';

const parseImdbJsonLd = (doc: Document): any | null => {
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    for (const script of scripts) {
        const text = (script.textContent || '').trim();
        if (!text) continue;
        try {
            const json = JSON.parse(text);
            const nodes = Array.isArray(json) ? json : [json];
            const hit = nodes.find((node: any) => {
                const type = String(node?.['@type'] || '').toLowerCase();
                return type === 'movie' || type === 'tvseries' || type === 'tvmini series';
            });
            if (hit) return hit;
        } catch {}
    }
    return null;
};

async function fetchPtpImdbBasics(imdbUrlOrId: string): Promise<{ synopsis: string; poster: string }> {
    const imdbId = extractImdbId(imdbUrlOrId || '');
    if (!imdbId) return { synopsis: '', poster: '' };

    try {
        const api = `https://www.omdbapi.com/?apikey=2edf5c13&i=${encodeURIComponent(imdbId)}&plot=full`;
        const text = await HtmlFetchService.getText(api, { headers: { accept: 'application/json' } });
        const data = JSON.parse(text || '{}');
        if (data?.Response === 'True') {
            const synopsis = String(data.Plot || '').trim();
            const poster = String(data.Poster || '').trim();
            if ((synopsis && synopsis !== 'N/A') || (poster && poster !== 'N/A')) {
                return {
                    synopsis: synopsis === 'N/A' ? '' : synopsis,
                    poster: poster === 'N/A' ? '' : poster
                };
            }
        }
    } catch {}

    try {
        const url = `https://www.imdb.com/title/${imdbId}/`;
        const doc = await HtmlFetchService.getDocument(url, { headers: { 'accept-language': 'en-US,en;q=0.9' } });
        const json = parseImdbJsonLd(doc) || {};
        const synopsis = String(json?.description || '').trim();
        const img = json?.image;
        const poster =
            (typeof img === 'string' ? img : '') ||
            String(img?.url || img?.contentUrl || '').trim() ||
            (doc.querySelector('meta[property="og:image"]') as HTMLMetaElement | null)?.content ||
            '';
        return { synopsis, poster: String(poster || '').trim() };
    } catch {
        return { synopsis: '', poster: '' };
    }
}

const resolvePtpSynopsis = (sourceSynopsis: string, imdbSynopsis: string): string => {
    const imdbText = String(imdbSynopsis || '').trim();
    if (imdbText) return imdbText;
    const sourceText = String(sourceSynopsis || '').trim();
    if (!sourceText || hasCjk(sourceText)) return '';
    return sourceText;
};

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
        const torrentId = url.searchParams.get('torrentid') || '';
        if (!torrentId) {
            // Legacy expects a specific torrent in a multi-torrent group; avoid accidentally parsing another torrent.
            throw new Error('[Auto-Feed][PTP] Missing torrentid in URL');
        }

        const torrentBox = document.getElementById(`torrent_${torrentId}`) as HTMLElement | null;
        if (!torrentBox) {
            // PTP pages are not SPA; if we can't find the box, the DOM likely hasn't loaded or the user is on a wrong page.
            throw new Error(`[Auto-Feed][PTP] torrent_${torrentId} not found in DOM`);
        }

        const $torrentBox = torrentBox ? $(torrentBox) : $();
        const groupHeader = torrentId ? document.getElementById(`group_torrent_header_${torrentId}`) : null;
        const editionInfo = groupHeader ? $(groupHeader).find('a#PermaLinkedTorrentToggler').text().trim() : '';

        // Title (legacy-inspired, but with strict scoping to avoid "串种子"):
        // Prefer the release-like text from the mediainfo toggle anchor inside THIS torrent box.
        const titleCandidates: string[] = [];
        const push = (s: string) => {
            const t = cleanTitle(String(s || '').trim());
            if (!t) return;
            if (t.length < 5) return;
            if (t.match(/^(show|hide)\\b/i)) return;
            if (t.match(/media\\s*info/i)) return;
            titleCandidates.push(t);
        };

        try {
            const guards = torrentBox.getElementsByClassName('bbcode-table-guard');
            const lastGuard = guards.length ? (guards[guards.length - 1] as HTMLElement) : null;
            if (lastGuard) {
                const as = lastGuard.getElementsByTagName('a');
                for (let i = 0; i < as.length; i++) {
                    const onclick = (as[i].getAttribute('onclick') || '').replace(/\\s+/g, ' ').trim();
                    if (onclick.includes('MediaInfoToggleShow')) {
                        push(as[i].textContent || '');
                    }
                }
            }
        } catch {}
        try {
            // Some layouts place this link outside the last guard; still scope to the torrent box.
            torrentBox.querySelectorAll('a[onclick*="MediaInfoToggleShow"]').forEach((a) => push(a.textContent || ''));
        } catch {}

        // Strict fallback candidate only (avoid directly trusting file/folder names).
        const fileTd = document.querySelector(`#files_${torrentId} td`) as HTMLElement | null;
        const fileNameCandidate = cleanTitle(fileTd?.textContent || '');

        const scoreReleaseLike = (s: string) => {
            const t = (s || '').trim();
            let score = 0;
            if (!t) return score;
            if (t.match(/(2160p|1080p|1080i|720p|480p|576p|4k|uhd|8k)/i)) score += 6;
            if (t.match(/(WEB[- .]?DL|WEBRIP|HDTV|Blu[- ]?ray|BDRip|REMUX|DVDRip|DVD)/i)) score += 4;
            if (t.match(/(x264|x265|H\\.?264|H\\.?265|AVC|HEVC|VC-1|MPEG-2|XviD|DivX|AV1)/i)) score += 3;
            if (t.match(/-(?!\\s)([A-Za-z0-9]{2,})$/)) score += 2; // release group
            if (t.match(/(19|20)\\d{2}/)) score += 1;
            if (t.includes('.')) score += 1;
            // Penalize direct file paths / very raw filenames.
            if (t.match(/\\.(mkv|mp4|avi|m2ts|ts|iso|rar|zip)$/i)) score -= 5;
            if (t.includes('/') || t.includes('\\\\')) score -= 8;
            return score;
        };

        let title = '';
        if (
            fileNameCandidate &&
            scoreReleaseLike(fileNameCandidate) >= 6 &&
            !/[\\/]/.test(fileNameCandidate) &&
            !/\.(mkv|mp4|avi|m2ts|ts|iso|rar|zip)$/i.test(fileNameCandidate)
        ) {
            titleCandidates.push(fileNameCandidate);
        }
        if (titleCandidates.length) {
            title = titleCandidates.reduce((best, cur) => {
                const sb = scoreReleaseLike(best);
                const sc = scoreReleaseLike(cur);
                if (sc > sb) return cur;
                if (sc === sb && cur.length > best.length) return cur;
                return best;
            }, titleCandidates[0]);
        }

        if (!title) {
            title = $('.page__title').first().text().trim() || $('h1').first().text().trim();
            title = title.replace(/\\[.*?\\]/g, '').trim();
        }
        title = title.replace(/\\s+-\\s+/i, '-').trim();

        let description = '';
        let fullMediaInfo = '';
        let aspectRatio = '';
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
            try {
                const ratioRow = Array.from(torrentBox.querySelectorAll('tr, li, div')).find((node) =>
                    /Aspect ratio/i.test((node.textContent || '').replace(/\s+/g, ' ').trim())
                );
                const rowText = (ratioRow?.textContent || '').replace(/\s+/g, ' ').trim();
                if (rowText) {
                    const cleaned = rowText.replace(/Aspect ratio/i, '').replace(/^[\s:：-]+/, '').trim();
                    aspectRatio = extractAspectRatioText(cleaned);
                }
            } catch {}
        }
        if (fullMediaInfo) {
            description = `[quote]${fullMediaInfo}[/quote]\n\n`;
            if (!aspectRatio) {
                const m =
                    fullMediaInfo.match(/Display.*?aspect.*?ratio.*?:\s*([^\r\n]+)/i) ||
                    fullMediaInfo.match(/Aspect ratio\s*:\s*([^\r\n]+)/i) ||
                    fullMediaInfo.match(/DAR\s*[:：]\s*([^\r\n]+)/i);
                aspectRatio = extractAspectRatioText((m?.[1] || '').trim());
            }
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
        const imdbId = extractImdbId(imdbLink);

        let downloadLink = '';
        if (torrentId) {
            downloadLink =
                $torrentBox.find(`a[href*="download&id=${torrentId}"]`).first().attr('href') ||
                $torrentBox.find(`a[href*="download.php?id=${torrentId}"]`).first().attr('href') ||
                '';
        }
        if (!downloadLink) {
            downloadLink =
                $(`a[href*="download&id=${torrentId}"]`).first().attr('href') ||
                $(`a[href*="download.php?id=${torrentId}"]`).first().attr('href') ||
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
        if (aspectRatio) meta.aspectRatio = aspectRatio;
        if (torrentUrl) meta.torrentUrl = torrentUrl;
        // PTP torrents are movies by definition in this script's workflow.
        meta.type = meta.type || '电影';
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

        const discBlob = `${meta.description || ''}\n${meta.fullMediaInfo || ''}`;
        if (discBlob.match(/DISC INFO|\.MPLS|Disc Label|BDMV|Blu[- ]?ray|Ultra HD|UHD/i)) {
            const h2 = $('h2').first().text();
            const baseName = h2.split(/\[.*?\]/)[0].trim();
            const year = h2.match(/\[(\d+)\]/)?.[1] || '';
            const releaseGroup = (groupHeader?.getAttribute('data-releasegroup') || '').trim();

            const rebuilt = rebuildReleaseTitleFromMedia(
                {
                    title: meta.title || '',
                    description: discBlob,
                    fullMediaInfo: meta.fullMediaInfo || ''
                },
                {
                    preferredBaseName: baseName,
                    preferredYear: year,
                    releaseGroup,
                    requireDiscInfo: true,
                    defaultGroup: 'UNTOUCHED'
                }
            );

            if (rebuilt) {
                meta.title = rebuilt;
            } else {
                const base = [baseName, year].filter(Boolean).join(' ').trim();
                let blurayName = getBlurayNameFromDescr(discBlob, base, meta.title);
                if (releaseGroup) {
                    blurayName = blurayName.replace('NoGroup', releaseGroup);
                }
                meta.title = blurayName.replace(/bluray/i, 'Blu-ray');
            }
            meta.mediumSel = 'Blu-ray';
        }

        // Derive mandatory "quality" fields for Nexus targets (PTer/CMCT/Audiences/etc.)
        // PTP pages expose these in the torrent header row; use best-effort parsing over text blobs.
        try {
            const headerText = groupHeader ? ($(groupHeader).text() || '') : '';
            const infoText = `${meta.title || ''} ${meta.subtitle || meta.smallDescr || ''} ${editionInfo || ''} ${headerText} ${fullMediaInfo || ''} ${meta.description || ''}`;
            meta.mediumSel = meta.mediumSel || getMediumSel(infoText, meta.title);
            meta.codecSel = meta.codecSel || getCodecSel(infoText);
            meta.audioCodecSel = meta.audioCodecSel || getAudioCodecSel(infoText);
            meta.standardSel = meta.standardSel || getStandardSel(infoText);
        } catch {}

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

        const imdb = meta.imdbUrl || meta.imdbId || '';
        const sourceSynopsis = (meta.synopsis || extractSynopsisFallback(`${meta.description || ''}\n${meta.fullMediaInfo || ''}`)).trim();
        const imdbBasics = imdb ? await fetchPtpImdbBasics(imdb) : { synopsis: '', poster: '' };
        const synopsis = resolvePtpSynopsis(sourceSynopsis, imdbBasics.synopsis);
        const poster = imdbBasics.poster || meta.images?.[0] || extractPosterFromDescription(meta.description || '');
        const sourceValue = (() => {
            switch (meta.mediumSel) {
                case 'UHD':
                case 'Blu-ray':
                case 'Encode':
                case 'Remux':
                    return 'Blu-ray';
                case 'HDTV':
                    return 'HDTV';
                case 'WEB-DL':
                    return 'WEB';
                case 'DVD':
                    return 'DVD';
                case 'TV':
                    return 'TV';
                default:
                    return '';
            }
        })();
        let codecValue = '';
        let otherCodec = '';
        switch (meta.codecSel) {
            case 'H265':
                codecValue = 'H.265';
                break;
            case 'H264':
                codecValue = 'H.264';
                break;
            case 'X264':
                codecValue = 'x264';
                break;
            case 'X265':
                codecValue = 'x265';
                break;
            case 'VC-1':
                codecValue = 'VC-1';
                break;
            case 'XVID':
                codecValue = 'XviD';
                break;
            case 'DIVX':
                codecValue = 'DivX';
                break;
            case 'MPEG-2':
            case 'MPEG-4':
                codecValue = 'Other';
                otherCodec = meta.codecSel || '';
                break;
        }
        if ((meta.title || '').match(/dvd5/i)) {
            codecValue = 'DVD5';
        } else if ((meta.title || '').match(/dvd9/i)) {
            codecValue = 'DVD9';
        }

        const discSize =
            (meta.mediumSel === 'Blu-ray' || meta.mediumSel === 'UHD') && /mpls/i.test(meta.description || '')
                ? getSizeFromDescr(meta.description || '')
                : 0;
        if (discSize > 0) {
            if (discSize < 23.28) codecValue = 'BD25';
            else if (discSize < 46.57) codecValue = 'BD50';
            else if (discSize < 61.47) codecValue = 'BD66';
            else codecValue = 'BD100';
        }

        let resolutionValue = standardMap[standard] || '';
        if ((meta.title || '').match(/pal/i)) {
            resolutionValue = 'PAL';
        } else if ((meta.title || '').match(/ntsc/i)) {
            resolutionValue = 'NTSC';
        }
        const resolutionWidth = (meta.description || '').match(/Width.*?(\d+).*?pixels/i)?.[1] || '';
        const resolutionHeight = (meta.description || '').match(/Height.*?(\d+).*?pixels/i)?.[1] || '';

        let releaseDesc = '';
        try {
            const info = getMediainfoPictureFromDescr(meta.description || '', { mediumSel: meta.mediumSel });
            const miText = cleanMediaInfoText(meta.fullMediaInfo || info.mediainfo || '').trim();
            const miWrapped = miText ? `[mediainfo]\n${miText}\n[/mediainfo]` : '';
            releaseDesc = `${miWrapped}${miWrapped && info.picInfo ? '\n\n' : ''}${info.picInfo || ''}`.trim();
        } catch {
            releaseDesc = (meta.description || '').replace(/\[\/?.{1,20}\]\n?/g, '');
        }

        let containerValue = '';
        if (releaseDesc.match(/Audio Video Interleave|AVI/i)) {
            containerValue = 'AVI';
        } else if (releaseDesc.match(/mp4|\.mp4/i)) {
            containerValue = 'MP4';
        } else if (releaseDesc.match(/Matroska|\.mkv/i)) {
            containerValue = 'MKV';
        } else if (releaseDesc.match(/\.mpg/i)) {
            containerValue = 'MPG';
        } else if ((meta.description || '').match(/MPLS/i)) {
            containerValue = 'm2ts';
        }

        const dispatch = (el: Element | null, type: 'input' | 'change') => {
            if (!el) return;
            try {
                el.dispatchEvent(new Event(type, { bubbles: true }));
            } catch {}
        };
        const first = <T extends Element>(sel: string) => document.querySelector(sel) as T | null;
        const setValue = (sel: string, value: string, force = true) => {
            if (!value) return;
            const el = first<HTMLInputElement | HTMLTextAreaElement>(sel);
            if (!el) return;
            const cur = (el.value || '').trim();
            if (!force && cur) return;
            el.value = value;
            dispatch(el, 'input');
            dispatch(el, 'change');
        };
        const setSelect = (sel: string, value: string) => {
            if (!value) return;
            const el = first<HTMLSelectElement>(sel);
            if (!el) return;
            if (![...el.options].some((opt) => opt.value === value)) return;
            el.value = value;
            dispatch(el, 'change');
            dispatch(el, 'input');
        };
        const retry = (fn: () => void, times = 18, delayMs = 350) => {
            let i = 0;
            const tick = () => {
                i += 1;
                try { fn(); } catch {}
                if (i < times) setTimeout(tick, delayMs);
            };
            tick();
        };
        const imdbInputSel = '#imdb, input[name="imdb"]';
        const autofillSel = '#autofill, input#autofill, button#autofill';

        if (imdb) {
            setValue(imdbInputSel, imdb, true);
            first<HTMLElement>(autofillSel)?.click();
        }

        retry(() => {
            if (imdb) setValue(imdbInputSel, imdb, true);
            const maybeAutofill = first<HTMLElement>(autofillSel);
            if (
                imdb &&
                maybeAutofill &&
                !document.querySelector('#source, select[name="source"], #release_desc, textarea[name="release_desc"]')
            ) {
                maybeAutofill.click();
            }

            if (synopsis) {
                const synopsisSelectors = [
                    '#album_desc',
                    'textarea[name="album_desc"]',
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
                    const el = first<HTMLTextAreaElement>(sel);
                    if (!el || el.id === 'release_desc' || el.name === 'release_desc') continue;
                    if (!el.value.trim()) {
                        el.value = synopsis;
                        dispatch(el, 'input');
                        dispatch(el, 'change');
                        break;
                    }
                }
            }

            if (poster) {
                setValue('#image, input[name="image"]', poster, false);
            }

            const remaster = first<HTMLInputElement>('#remaster, input[name="remaster"]');
            if (remaster && !remaster.checked) {
                remaster.checked = true;
                dispatch(remaster, 'change');
            }
            const remasterTrue = first<HTMLElement>('#remaster_true');
            if (remasterTrue) remasterTrue.classList.remove('hidden');

            const resolvedSource = (meta.title || '').match(/hd-dvd/i) ? 'HD-DVD' : sourceValue;
            setSelect('#source, select[name="source"]', resolvedSource);
            setSelect('#codec, select[name="codec"]', codecValue);
            if (codecValue === 'Other' && otherCodec) {
                setValue('#other_codec, input[name="other_codec"]', otherCodec, true);
            }
            setSelect('#resolution, select[name="resolution"]', resolutionValue || 'Other');
            if ((resolutionValue || 'Other') === 'Other') {
                setValue('input[name="other_resolution_width"]', resolutionWidth, true);
                setValue('input[name="other_resolution_height"]', resolutionHeight, true);
            }
            setValue('#release_desc, textarea[name="release_desc"]', releaseDesc || (meta.description || ''), true);
            setSelect('#container, select[name="container"]', containerValue);
        });
    }
}
