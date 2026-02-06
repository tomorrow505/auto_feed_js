import $ from 'jquery';
import { BaseEngine } from '../core/BaseEngine';
import { TorrentMeta } from '../types/TorrentMeta';
import { SiteConfig } from '../types/SiteConfig';
import { htmlToBBCode } from '../utils/htmlToBBCode';
import { matchLink } from '../common/legacy/links';
import { addThanks } from '../common/legacy/teams';
import { getType, getLabel, getMediumSel, getCodecSel, getAudioCodecSel, getStandardSel } from '../common/legacy/text';
import { getMediainfoPictureFromDescr } from '../common/legacy/media';
import { dealWithTitle } from '../common/legacy/title';

export class MTeamEngine extends BaseEngine {
    constructor(config: SiteConfig, url: string) {
        super(config, url);
    }

    async parse(): Promise<TorrentMeta> {
        this.log('Parsing MTeam page...');
        const meta: TorrentMeta = {
            title: '',
            description: '',
            sourceSite: this.config.name,
            sourceUrl: this.currentUrl,
            images: []
        };

        const descrEl = $('div.markdown-body').first();
        if (descrEl.length) {
            meta.description = htmlToBBCode(descrEl[0]);
        }

        const torrentId = this.currentUrl.match(/detail\/(\d+)/)?.[1];
        if (!torrentId) {
            this.error('Cannot find MTeam torrent id in URL.');
            return meta;
        }

        const buildFetch = (api: string) => {
            return fetch(`https://api.m-team.io/${api}`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    ts: Math.floor(Date.now() / 1000).toString(),
                    authorization: localStorage.getItem('auth') || ''
                },
                body: new URLSearchParams({ id: torrentId }).toString()
            });
        };

        const apis = ['api/torrent/detail', 'api/torrent/genDlToken'];
        const results = await Promise.all(
            apis.map(async (api) => {
                try {
                    const response = await buildFetch(api);
                    const responseJson = await response.json();
                    if (!response.ok) throw new Error(`${response.statusText}`);
                    return responseJson.data;
                } catch (err) {
                    return null;
                }
            })
        );

        const detail = results[0] as any;
        const downloadToken = results[1] as any;

        if (downloadToken) {
            meta.torrentUrl = downloadToken;
        } else {
            meta.torrentUrl = this.currentUrl;
        }

        if (detail) {
            meta.title = detail.name || meta.title;
            meta.torrentFilename = meta.title
                ? meta.title.replace(/ /g, '.').replace(/\*/g, '') + '.torrent'
                : meta.torrentFilename;
            if (meta.torrentFilename) {
                meta.torrentFilename = meta.torrentFilename.replace(/\.\.+/g, '.');
                meta.torrentName = meta.torrentFilename;
            }

            meta.smallDescr = meta.smallDescr || detail.smallDescr;
            if (!meta.subtitle) meta.subtitle = meta.smallDescr;

            const imdbUrl = detail.descr && detail.descr.match(/title\/tt\d+/) ? matchLink('imdb', detail.descr) : detail.imdb;
            if (imdbUrl) {
                meta.imdbUrl = imdbUrl;
                meta.imdbId = imdbUrl.match(/tt\d+/)?.[0];
            }
            if (detail.douban) {
                meta.doubanUrl = detail.douban;
                meta.doubanId = detail.douban.match(/subject\/(\d+)/)?.[1];
            }

            if (!meta.description) {
                meta.description = detail.descr || '';
                try {
                    meta.description = meta.description.replace(/\*\*(.*?)\*\*/g, '$1');
                } catch {}
                try {
                    meta.description = meta.description.replace(/!\[\]\((.*?)\)/g, '[img]$1[/img]\n');
                } catch {}
            }

            meta.type = getType($('span[class*="ant-typography"]:contains(類別)').text());

            if (detail.mediainfo) {
                let mediainfo = detail.mediainfo as string;
                meta.fullMediaInfo = mediainfo;
                try {
                    mediainfo = decodeURIComponent(detail.mediainfo);
                } catch {}
                let pictureInfo = '';
                try {
                    const intro = meta.description.indexOf('◎简　　介');
                    const pictures = meta.description.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?\n?/g);
                    if (pictures) {
                        pictures.forEach((item) => {
                            if (meta.description.indexOf(item) > 300 || (intro > -1 && meta.description.indexOf(item) > intro)) {
                                if (!item.match(/doubanio.com/)) {
                                    meta.description = meta.description.replace(item, '');
                                    pictureInfo += `${item}\n`;
                                }
                            }
                        });
                    }
                    meta.description =
                        meta.description.trim() +
                        `\n  \n[quote]\n${mediainfo.trim()}\n[/quote]\n  \n` +
                        pictureInfo;
                } catch {}
            }

            meta.description = meta.description.replace(/https:\/\/kp\.m-team\.cc.*?url=/gi, '');
            meta.description = meta.description.replace(/\n+/g, '\n');
            meta.description = meta.description.replace(
                /^\[quote\]\[b\]\[color=blue\]转自.*?，感谢原制作者发布。\[\/color\]\[\/b\]\[\/quote\]/i,
                ''
            );
            meta.description = addThanks(meta.description, meta.title || '');
        }

        this.log(`Parsed: ${meta.title}`);
        return meta;
    }

    async fill(meta: TorrentMeta): Promise<void> {
        this.log('Filling MTeam form...');

        // Derive media info if missing
        const infoText = `${meta.title} ${meta.subtitle || meta.smallDescr || ''} ${meta.description} ${meta.fullMediaInfo || ''}`;
        meta.mediumSel = meta.mediumSel || getMediumSel(infoText, meta.title);
        meta.codecSel = meta.codecSel || getCodecSel(infoText);
        meta.audioCodecSel = meta.audioCodecSel || getAudioCodecSel(infoText);
        meta.standardSel = meta.standardSel || getStandardSel(infoText);

        try {
            const { TorrentService } = await import('../services/TorrentService');
            const result = await TorrentService.buildForwardTorrentFile(meta, this.siteName, null);
            if (result) {
                TorrentService.injectTorrentForSite(this.siteName, result.file, result.filename);
                const nameInput = document.getElementById('name') as HTMLInputElement | null;
                if (result.nameFromTorrent && nameInput && !nameInput.value) {
                    nameInput.value = dealWithTitle(result.nameFromTorrent);
                }
            }
        } catch (err) {
            console.error('[Auto-Feed][MTeam] Torrent inject failed:', err);
        }

        let typeCode = '電影/HD';
        switch (meta.type) {
            case '电影':
                if (meta.mediumSel === 'Blu-ray' || meta.mediumSel === 'UHD') {
                    typeCode = '電影/Blu-Ray';
                } else if (meta.mediumSel === 'Remux') {
                    typeCode = '電影/Remux';
                } else if (meta.mediumSel === 'DVD' || meta.mediumSel === 'DVDRip') {
                    typeCode = '電影/DVDiSo';
                } else {
                    typeCode = meta.standardSel !== 'SD' ? '電影/HD' : '電影/SD';
                }
                break;
            case '剧集':
            case '综艺':
                if (meta.mediumSel === 'Blu-ray' || meta.mediumSel === 'UHD') {
                    typeCode = '影劇/綜藝/BD';
                } else if (meta.mediumSel === 'DVD' || meta.mediumSel === 'DVDRip') {
                    typeCode = '影劇/綜藝/DVDiSo';
                } else {
                    typeCode = meta.standardSel !== 'SD' ? '影劇/綜藝/HD' : '影劇/綜藝/SD';
                }
                break;
            case '纪录':
                typeCode = '紀錄';
                break;
            case '学习':
                typeCode = '教育(書面)';
                break;
            case '动漫':
                typeCode = '動畫';
                break;
            case '音乐':
                typeCode = meta.title.match(/(flac|ape)/i) ? 'Music(無損)' : 'Music(AAC/ALAC)';
                break;
            case 'MV':
                typeCode = '演唱';
                break;
            case '体育':
                typeCode = '運動';
                break;
            case '软件':
                typeCode = '軟體';
                break;
            case '游戏':
                typeCode = 'PC遊戲';
                break;
            case '书籍':
                typeCode = 'Misc(其他)';
                break;
        }

        let videoCodec = 'H.264';
        switch (meta.codecSel) {
            case 'H264':
            case 'X264':
                videoCodec = 'H.264(x264/AVC)';
                break;
            case 'VC-1':
                videoCodec = 'VC-1';
                break;
            case 'XVID':
                videoCodec = 'Xvid';
                break;
            case 'MPEG-2':
                videoCodec = 'MPEG-2';
                break;
            case 'H265':
            case 'X265':
                videoCodec = 'H.265(x265/HEVC)';
                break;
            case 'AV1':
                videoCodec = 'AV1';
                break;
        }

        let audioCodec = 'Other';
        switch (meta.audioCodecSel) {
            case 'DTS-HD':
            case 'DTS-HDMA:X 7.1':
            case 'DTS-HDMA':
            case 'DTS-HDHR':
                audioCodec = 'DTS-HD MA';
                break;
            case 'TrueHD':
                audioCodec = 'TrueHD';
                break;
            case 'Atmos':
                audioCodec = 'TrueHD Atmos';
                break;
            case 'AC3':
                audioCodec = 'AC3(DD)';
                if (meta.title.match(/DDP|DD\+/)) {
                    audioCodec = 'E-AC3(DDP)';
                    if (meta.title.match(/Atoms/)) {
                        audioCodec = 'E-AC3 Atoms(DDP Atoms)';
                    }
                }
                break;
            case 'LPCM':
                audioCodec = 'LPCM/PCM';
                break;
            case 'DTS':
            case 'AAC':
            case 'Flac':
            case 'APE':
            case 'WAV':
                audioCodec = meta.audioCodecSel.toUpperCase();
                break;
        }

        const setValue = (input: HTMLInputElement | HTMLTextAreaElement, value: string) => {
            const lastValue = input.value;
            input.value = value;
            const tracker = (input as any)._valueTracker;
            if (tracker) tracker.setValue(lastValue);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
        };

        const selectDropdownOption = async (tid: string, index: number, targetTitle: string | string[]) => {
            const clickEvent = document.createEvent('MouseEvents');
            clickEvent.initEvent('mousedown', true, true);
            document.getElementById(tid)?.dispatchEvent(clickEvent);
            await new Promise((resolve) => setTimeout(resolve, 100));
            const listHolder = document.querySelectorAll('.rc-virtual-list-holder')[index] as HTMLElement | undefined;
            if (!listHolder) {
                console.error('未找到下拉列表，请确保下拉框已经打开！');
                return;
            }
            const findAndClick = (title: string) => {
                const option = listHolder.querySelector(`.ant-select-item-option[title=\"${title}\"]`) as HTMLElement | null;
                if (option) {
                    option.click();
                    return true;
                }
                return false;
            };

            if (typeof targetTitle === 'string') {
                if (findAndClick(targetTitle)) return;
                const scrollStep = 100;
                const delay = 100;
                let totalHeight = listHolder.scrollHeight;
                let currentScroll = 0;
                listHolder.scrollTop = 0;
                while (currentScroll < totalHeight) {
                    listHolder.scrollTop += scrollStep;
                    currentScroll += scrollStep;
                    await new Promise((resolve) => setTimeout(resolve, delay));
                    if (findAndClick(targetTitle)) return;
                    totalHeight = listHolder.scrollHeight;
                }
            } else if (Array.isArray(targetTitle)) {
                targetTitle.forEach((x, idx) => {
                    setTimeout(() => {
                        const option = document.querySelector(`.ant-select-item-option[title=\"${x}\"]`) as HTMLElement | null;
                        if (option) option.click();
                    }, 200 * idx);
                });
            }
        };

        const labels = getLabel(`${meta.smallDescr || meta.subtitle || ''}${meta.title}#separator#${meta.description}`);
        meta.labelInfo = labels;

        // Fill basic fields
        $('#category').wait(async () => {
            const nameInput = document.getElementById('name') as HTMLInputElement | null;
            const smallInput = document.getElementById('smallDescr') as HTMLInputElement | null;
            const imdbInput = document.getElementById('imdb') as HTMLInputElement | null;
            const doubanInput = document.getElementById('douban') as HTMLInputElement | null;
            if (nameInput) setValue(nameInput, meta.title);
            if (smallInput) setValue(smallInput, meta.smallDescr || meta.subtitle || '');
            if (imdbInput && meta.imdbUrl) setValue(imdbInput, meta.imdbUrl);
            if (doubanInput && meta.doubanUrl) setValue(doubanInput, meta.doubanUrl);

            setTimeout(() => {
                if (nameInput) setValue(nameInput, meta.title);
                if (labels.gy || labels.yy) {
                    const el = document.getElementsByClassName('ant-checkbox-input')[1] as HTMLInputElement | undefined;
                    if (el) el.click();
                }
                if (labels.zz) {
                    const checkbox = document.getElementsByClassName('ant-checkbox-input')[0] as HTMLInputElement | undefined;
                    if (checkbox) {
                        const parent = checkbox.parentNode as HTMLElement | null;
                        const nodeClass = parent?.classList;
                        let clicked = false;
                        nodeClass?.forEach((className: string) => {
                            if (className === 'ant-checkbox-checked') clicked = true;
                        });
                        if (!clicked) checkbox.click();
                    }
                }
            }, 3000);

            const regRegion = meta.description.match(/(地.{0,5}?区|国.{0,5}?家|产.{0,5}?地|產.{0,5}?地)([^\r\n]+)/);
            if (regRegion) {
                const region = regRegion[2].trim();
                if (!$('#region_tips').length) {
                    $('span:contains("請選擇國家/地區")')
                        .first()
                        .parent()
                        .parent()
                        .parent()
                        .parent()
                        .after(`<p id="region_tips">当前资源的来源国家/地区为：${region}</p>`);
                }
            }

            const mediainfoContainer = document.getElementById('mediainfo') as HTMLTextAreaElement | null;
            let mediainfo = '';
            if (meta.fullMediaInfo) {
                mediainfo = meta.fullMediaInfo;
            } else {
                mediainfo = getMediainfoPictureFromDescr(meta.description, { mediumSel: meta.mediumSel }).mediainfo;
            }
            if (mediainfoContainer) setValue(mediainfoContainer, mediainfo.trim());

            await selectDropdownOption('standard', 0, meta.standardSel || '1080p');
            await selectDropdownOption('videoCodec', 1, videoCodec);
            await selectDropdownOption('audioCodec', 2, audioCodec);
            await selectDropdownOption('category', 3, typeCode);

            await new Promise((resolve) => setTimeout(resolve, 2000));
            const editor = document.querySelector('.editor-input[contenteditable=\"true\"]') as HTMLElement | null;
            if (!editor) {
                console.log('未找到编辑器');
                return;
            }
            editor.focus();
            const dataTransfer = new DataTransfer();
            dataTransfer.setData('text/plain', meta.description);
            const pasteEvent = new ClipboardEvent('paste', {
                clipboardData: dataTransfer,
                bubbles: true,
                cancelable: true
            } as ClipboardEventInit);
            editor.dispatchEvent(pasteEvent);
            editor.dispatchEvent(new InputEvent('input', { bubbles: true }));
        }, 10000, 20);
    }
}
