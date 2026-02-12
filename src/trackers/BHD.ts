import $ from 'jquery';
import { Unit3DEngine } from '../templates/unit3d';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { getLabel, getType } from '../common/rules/text';
import { getMediainfoPictureFromDescr } from '../common/rules/media';
import { dealImg350, getSizeFromDescr } from '../common/rules/helpers';
import { extractImdbId, matchLink } from '../common/rules/links';
import { dealWithTitle } from '../common/rules/title';

export class BHDEngine extends Unit3DEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing BHD page...');

        const base = await super.parse();
        const meta: TorrentMeta = {
            ...base,
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl
        };

        const titleText = $('h1.bhd-title-h1, h1').first().text().trim();
        if (titleText) {
            meta.title = titleText.replace(/\[.*?\]/g, '').trim();
        }

        // Details table parsing (name/subtitle/category/type)
        const tbody = $('.table-details tbody').first();
        if (tbody.length) {
            const tds = tbody.find('td').toArray();
            for (let i = 0; i < tds.length; i++) {
                const key = (tds[i].textContent || '').trim();
                const nextText = (tds[i + 1]?.textContent || '').replace(/ *\n.*/gm, '').trim();
                if (!key) continue;

                if (['副标题', 'Subtitle', 'Sub Title', 'Sub-title'].includes(key) && nextText) {
                    meta.smallDescr = nextText;
                    if (!meta.subtitle) meta.subtitle = nextText;
                }
                if (['Name', 'Nombre', '名称', '标题'].includes(key) && nextText) {
                    meta.title = nextText;
                }
                if (['Category', '类别', 'Categoría'].includes(key) && nextText) {
                    if (nextText.match(/Movie|电影|Películas/i)) meta.type = '电影';
                    if (nextText.match(/(TV-Show|TV|剧集|Series)/i)) meta.type = '剧集';
                    if (nextText.match(/Anime (TV|Movie)/i)) meta.type = '动漫';
                    if (nextText.match(/(Docu|纪录|Documentary)/i)) meta.type = '纪录';
                }
                if (['Type', 'Tipo', '规格'].includes(key) && nextText) {
                    if (nextText.match(/BD 50/i)) meta.mediumSel = 'Blu-ray';
                    else if (nextText.match(/Remux/i)) meta.mediumSel = 'Remux';
                    else if (nextText.match(/encode/i)) meta.mediumSel = 'Encode';
                    else if (nextText.match(/web-?dl/i)) meta.mediumSel = 'WEB-DL';
                }
            }
        }

        // IMDB
        try {
            const imdbUrl = matchLink('imdb', document.body.innerHTML);
            if (imdbUrl) {
                meta.imdbUrl = imdbUrl;
                meta.imdbId = extractImdbId(imdbUrl);
            }
        } catch {}

        // MediaInfo + screenshots
        const mediainfo = $('div[id*="stats-full"] .decoda-code').first().text().trim();
        if (mediainfo) {
            meta.fullMediaInfo = mediainfo;
        }

        const pictureNodes = Array.from(document.getElementsByClassName('decoda-image')) as HTMLImageElement[];
        let imgUrls = '';
        if (pictureNodes.length) {
            pictureNodes.forEach((img) => {
                const parent = img.parentElement as HTMLAnchorElement | null;
                const href = parent?.href;
                const src = img.getAttribute('data-src') || img.getAttribute('src') || img.src || '';
                if (!src) return;
                const fullSrc = src.replace(/\.md(?=\\.|$)/, '');
                meta.images.push(fullSrc || src);
                if (href) {
                    imgUrls += `[url=${href}][img]${src}[/img][/url] `;
                } else {
                    imgUrls += `[img]${src}[/img] `;
                }
            });
        }

        if (mediainfo || imgUrls) {
            meta.description = `${mediainfo ? `[quote]${mediainfo}[/quote]\n\n` : ''}${imgUrls}`.trim();
            meta.description = meta.description.replace(
                '[url=undefined][img]https://beyondhd.co/images/2017/11/30/c5802892418ee2046efba17166f0cad9.png[/img][/url]',
                ''
            );
        }

        if (!meta.type && meta.title) {
            meta.type = getType(meta.title);
        }

        const downloadLink = $('a[href*="me/download"][role=button]').attr('href') || '';
        if (downloadLink) {
            try {
                meta.torrentUrl = new URL(downloadLink, this.currentUrl).href;
            } catch {
                meta.torrentUrl = downloadLink;
            }
        }

        if (!meta.torrentFilename && meta.title) {
            meta.torrentFilename = meta.title.replace(/ /g, '.').replace(/\*/g, '') + '.torrent';
            meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, '.');
            meta.torrentName = meta.torrentFilename;
        }

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling BHD form...');

        // Title
        const titleInput = document.getElementById('titleauto') as HTMLInputElement | null;
        if (titleInput) titleInput.value = meta.title || '';

        // Inject torrent file (Unit3D input)
        await super.fill(meta);

        try {
            const announceText = $('h2').find('div').text().trim();
            const announceUrl = announceText.match(/https?:\/\/[^\s"'<>]+/)?.[0] || announceText || null;
            const { TorrentService } = await import('../services/TorrentService');
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, announceUrl);
            if (result) {
                TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
                if (result.nameFromTorrent && titleInput && !titleInput.value) {
                    titleInput.value = dealWithTitle(result.nameFromTorrent);
                }
            }
        } catch (err) {
            console.error('[Auto-Feed][BHD] Torrent inject failed:', err);
        }

        // Category
        const categoryId = document.getElementById('category_id') as HTMLSelectElement | null;
        if (categoryId) {
            const typeDict: Record<string, number> = { 电影: 1, 剧集: 2, 纪录: 2, 综艺: 2 };
            if (typeDict.hasOwnProperty(meta.type || '')) {
                const index = typeDict[meta.type || ''];
                categoryId.options[index].selected = true;
            }
        }

        // Source
        const autosource = document.getElementById('autosource') as HTMLSelectElement | null;
        if (autosource) {
            switch (meta.mediumSel) {
                case 'Remux':
                case 'UHD':
                case 'Blu-ray':
                case 'Encode':
                    autosource.options[1].selected = true;
                    break;
                case 'DVD':
                    autosource.options[5].selected = true;
                    break;
                case 'HDTV':
                    autosource.options[4].selected = true;
                    break;
                case 'WEB-DL':
                    autosource.options[3].selected = true;
                    break;
                default:
                    autosource.options[0].selected = true;
            }
        }

        // Type
        const autotype = document.getElementById('autotype') as HTMLSelectElement | null;
        if (autotype) {
            let size = 0;
            if (meta.mediumSel === 'Blu-ray' || meta.mediumSel === 'UHD') {
                size = getSizeFromDescr(meta.description || '');
            }
            switch (meta.standardSel) {
                case '4K':
                    if (meta.mediumSel === 'UHD') {
                        if (0 <= size && size < 50) autotype.options[3].selected = true;
                        else if (size < 66) autotype.options[2].selected = true;
                        else autotype.options[1].selected = true;
                    } else if (meta.mediumSel === 'Remux') {
                        autotype.options[4].selected = true;
                    } else {
                        autotype.options[8].selected = true;
                    }
                    break;
                case '1080p':
                    if (meta.mediumSel !== 'Blu-ray' && meta.mediumSel !== 'Remux') {
                        autotype.options[9].selected = true;
                        break;
                    }
                case '1080i':
                    if (meta.mediumSel === 'Blu-ray') {
                        if (0 <= size && size < 25) autotype.options[6].selected = true;
                        else autotype.options[5].selected = true;
                    } else if (meta.mediumSel === 'Remux') {
                        autotype.options[7].selected = true;
                    } else {
                        autotype.options[10].selected = true;
                    }
                    break;
                case '720p':
                    autotype.options[11].selected = true;
                    break;
                default:
                    autotype.options[0].selected = true;
            }
        }

        // Region
        const region = document.getElementsByName('region')[0] as HTMLSelectElement | undefined;
        if (region) {
            const options = region.options;
            for (let i = 0; i < options.length; i++) {
                if (options[i].value) {
                    const reg = new RegExp(' ' + options[i].value + ' ', 'i');
                    if ((meta.title || '').match(reg)) {
                        options[i].selected = true;
                        break;
                    }
                }
            }
        }

        // Edition
        const edition = document.getElementsByName('edition')[0] as HTMLSelectElement | undefined;
        if (edition) {
            if ((meta.title || '').match(/Collector/)) edition.options[1].selected = true;
            else if ((meta.title || '').match(/Director/)) edition.options[2].selected = true;
            else if ((meta.title || '').match(/Extended/)) edition.options[3].selected = true;
            else if ((meta.title || '').match(/Limited/)) edition.options[4].selected = true;
            else if ((meta.title || '').match(/Special/)) edition.options[5].selected = true;
            else if ((meta.title || '').match(/Theatrical/)) edition.options[6].selected = true;
            else if ((meta.title || '').match(/Uncut/)) edition.options[7].selected = true;
            else if ((meta.title || '').match(/Unrated/)) edition.options[8].selected = true;
        }

        const labels = meta.labelInfo || getLabel(`${meta.smallDescr || meta.subtitle || ''}${meta.title}#separator#${meta.description}`);
        meta.labelInfo = labels;

        if (labels.hdr10) document.getElementById('HDR10')?.click();
        if (labels.hdr10plus) document.getElementById('HDR10P')?.click();
        if (labels.db) document.getElementById('DV')?.click();
        if ((meta.title || '').match(/WEB-DL/i)) document.getElementById('WEBDL')?.click();
        if ((meta.title || '').match(/WEBRIP/i)) document.getElementById('WEBRip')?.click();
        if ((meta.title || '').match(/4K remaster/i) || (meta.smallDescr || '').match(/4K.?修复/i)) document.getElementById('4kRemaster')?.click();
        if ((meta.title || '').match(/2-Disc/) || (meta.smallDescr || '').match(/双碟版/)) document.getElementById('2in1')?.click();
        if ((meta.title || '').match(/commentary/i) || (meta.smallDescr || '').match(/评论音轨/)) document.getElementById('Commentary')?.click();
        if ((meta.title || '').match(/[\. ]3D[\. ]/) || (meta.smallDescr || '').match(/3D/)) document.getElementById('3D')?.click();

        try {
            const infos = getMediainfoPictureFromDescr(meta.description || '', { mediumSel: meta.mediumSel });
            const container = $('#mediainfo');
            if (meta.fullMediaInfo) container.val(meta.fullMediaInfo);
            else container.val(infos.mediainfo);
            $('#mediainfo').css({ height: '600px' });
            const picInfo = dealImg350(infos.picInfo);
            $('#upload-form-description').val(picInfo);
            $('#upload-form-description')
                .parent()
                .after(
                    `<div style="margin-bottom:5px"><a id="img350" style="margin-left:5px" href="#">IMG350</a>
                    <font style="margin-left:5px" color="red">选中要转换的bbcode图片部分点击即可。</font></div>`
                );
            $('#img350').off('click').on('click', (e) => {
                e.preventDefault();
                const text = $('#upload-form-description').val() as string;
                const textarea = document.getElementById('upload-form-description') as HTMLTextAreaElement | null;
                if (textarea && textarea.selectionStart !== undefined && textarea.selectionEnd !== undefined) {
                    const chosen = textarea.value.substring(textarea.selectionStart, textarea.selectionEnd);
                    if (chosen) {
                        $('#upload-form-description').val(text.replace(chosen, chosen.replace(/\[img\]/g, '[img=350]')));
                    } else {
                        $('#upload-form-description').val(text.replace(/\[img\]/g, '[img=350x350]'));
                    }
                }
            });
        } catch {
            if (meta.fullMediaInfo) $('#mediainfo').val(meta.fullMediaInfo);
            else $('#mediainfo').val(meta.description);
            $('#mediainfo').css({ height: '600px' });
        }

        // imdb id
        if (meta.imdbId) {
            const uploadImdb = document.getElementById('imdbauto') as HTMLInputElement | null;
            if (uploadImdb) uploadImdb.value = meta.imdbId.match(/tt(\d+)/i)?.[1] || '';
        }
    }
}
