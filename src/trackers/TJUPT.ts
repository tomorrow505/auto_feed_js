import $ from 'jquery';
import { NexusPHPEngine } from './NexusPHP';
import { TorrentMeta } from '../types/TorrentMeta';
import { extractDoubanId, extractImdbId } from '../common/rules/links';
import { dispatchFormEvents } from '../common/dom/form';

function setValue(selector: string, value?: string) {
    if (!value) return;
    document.querySelectorAll(selector).forEach((node) => {
        const el = node as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
        el.value = value;
        dispatchFormEvents(el);
    });
}

function selectValue(selector: string, value: string) {
    const el = document.querySelector(selector) as HTMLSelectElement | null;
    if (!el || !value) return;
    el.value = value;
    dispatchFormEvents(el);
}

function convertMediaInfoQuotes(description: string, fullMediaInfo?: string): string {
    let out = String(description || '');
    try {
        out = out.replace(/\[quote\]([\s\S]*?)\[\/quote\]/gi, (block, body) => {
            if (!String(body || '').match(/General|Disc Title|Disc Info|Disc Label|RELEASE\.NAME|RELEASE DATE|Unique ID|RESOLUTiON|Bitrate|帧　率|音频码率|视频码率/i)) {
                return block;
            }
            return `[mediainfo]${fullMediaInfo || body}[/mediainfo]`;
        });
    } catch {}
    return out;
}

export class TJUPTEngine extends NexusPHPEngine {
    protected async afterParse(meta: TorrentMeta): Promise<TorrentMeta> {
        try {
            const detailsHtml = $('td:contains("详细信息")').filter((_, el) => (el.textContent || '').trim() === '详细信息').next('td').html() || '';
            if (detailsHtml) {
                const enName = detailsHtml.match(/英文名:<\/b>(.*?)(&nbsp|<br>)/i)?.[1]?.trim();
                if (enName) meta.title = enName;
                const cnName = detailsHtml.match(/中文名:<\/b>(.*?)(&nbsp|<br>)/i)?.[1]?.trim();
                if (cnName) {
                    meta.smallDescr = meta.smallDescr ? `${cnName} | ${meta.smallDescr}` : cnName;
                    meta.subtitle = meta.subtitle || meta.smallDescr;
                }
                const region = detailsHtml.match(/动漫国别:<\/b>(.*?)<br>/i)?.[1]?.trim() || '';
                if (region === '日漫') meta.sourceSel = '日本';
                if (region === '美漫') meta.sourceSel = '欧美';
                if (region === '国产') meta.sourceSel = '大陆';
            }
            const torrentName = $('#bookmark0').parent().find('a:first').text().trim();
            if (torrentName) {
                meta.torrentFilename = torrentName.endsWith('.torrent') ? torrentName : `${torrentName}.torrent`;
                meta.torrentName = meta.torrentFilename;
            }
        } catch {}
        return meta;
    }

    protected async beforeFill(meta: TorrentMeta): Promise<TorrentMeta> {
        return {
            ...meta,
            description: convertMediaInfoQuotes(meta.description || '', meta.fullMediaInfo)
        };
    }

    protected async afterFill(meta: TorrentMeta): Promise<void> {
        const imdbId = meta.imdbId || extractImdbId(meta.imdbUrl || '');
        const imdbUrl = meta.imdbUrl || (imdbId ? `https://www.imdb.com/title/${imdbId}/` : '');
        const doubanId = meta.doubanId || extractDoubanId(meta.doubanUrl || '');
        const doubanUrl = meta.doubanUrl || (doubanId ? `https://movie.douban.com/subject/${doubanId}/` : '');
        setValue('input[name="external_url"], input#external_url', imdbUrl || doubanUrl);

        const typeMap: Record<string, string> = {
            电影: '401',
            剧集: '402',
            纪录: '411',
            动漫: '405',
            综艺: '403',
            学习: '404',
            音乐: '406',
            MV: '406',
            体育: '407',
            软件: '408'
        };
        selectValue('select[name="browsecat"], select#browsecat', typeMap[meta.type || ''] || '410');
        try { (window as any).getcategory?.('class2', 'browsecat'); } catch {}

        const fillDependent = () => {
            setValue('#ename', (meta.targetTitle || meta.title || '').replace(/\s+/g, '.'));
            const source = `${meta.description || ''}\n${meta.synopsis || ''}`.replace(/\[\/?.+?\]/g, '');
            const cname =
                source.match(/(?:片\s*名|中文名)\s*[:：]?\s*([^\r\n]+)/)?.[1]?.trim() ||
                source.match(/(?:译\s*名|譯\s*名)\s*[:：]?\s*([^\r\n]+)/)?.[1]?.split('/')?.[0]?.trim() ||
                '';
            setValue('#cname', cname);
            const district =
                source.match(/(?:地.{0,5}?区|国.{0,5}?家|产.{0,5}?地|產.{0,5}?地)\s*[:：]?\s*([^\r\n]+)/)?.[1]?.trim() ||
                meta.sourceSel ||
                '';
            setValue('#district', district.replace(/\s+/g, '').replace(/中国大陆|中国/g, '大陆'));
            const language = source.match(/语.{0,5}?言\s*[:：]?\s*([^\r\n]+)/)?.[1]?.trim() || '';
            setValue('#language', language);
        };

        fillDependent();
        [300, 900, 1800].forEach((ms) => window.setTimeout(fillDependent, ms));
    }
}
