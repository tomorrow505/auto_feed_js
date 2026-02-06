import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SettingsService } from './SettingsService';
import { StorageService } from './StorageService';
import { ImageHostService } from './ImageHostService';
import { PtgenService } from './PtgenService';
import { ImageUploadBridgeService } from './ImageUploadBridgeService';

export class QuickLinkService {
    private static renderLinkModal(title: string, sourceLinks: string[], targetLinks: string[], targetTags: string[]) {
        const existing = document.getElementById('autofeed-link-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'autofeed-link-modal';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.6);
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            width: 68vw;
            max-width: 980px;
            height: 52vh;
            max-height: 460px;
            min-height: 260px;
            background: #fff;
            border-radius: 8px;
            display: flex;
            flex-direction: column;
            padding: 12px;
            box-shadow: 0 10px 24px rgba(0,0,0,0.35);
        `;

        const header = document.createElement('div');
        header.style.cssText = `display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;`;
        header.innerHTML = `<div style="font-weight:bold; color:#2c3e50;">${title}</div>`;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.style.cssText = `border:none; background:transparent; font-size:20px; cursor:pointer; color:#999;`;
        closeBtn.onclick = () => overlay.remove();
        header.appendChild(closeBtn);

        const body = document.createElement('div');
        body.style.cssText = `display:grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap:10px; flex:1; align-items: stretch;`;

        const buildBox = (label: string, value: string) => {
            const box = document.createElement('div');
            box.style.cssText = `display:flex; flex-direction:column; gap:6px;`;
            const titleEl = document.createElement('div');
            titleEl.textContent = label;
            titleEl.style.cssText = `font-weight:bold; color:#666;`;
            const textarea = document.createElement('textarea');
            textarea.value = value;
            textarea.style.cssText = `width:100%; height:100%; resize:none; padding:8px; border:1px solid #ddd; border-radius:6px; font-family: monospace; font-size:12px;`;
            box.appendChild(titleEl);
            box.appendChild(textarea);
            return box;
        };

        const sourceBox = buildBox('原图直链', sourceLinks.join('\n'));
        const targetBox = buildBox('新图直链', targetLinks.join('\n'));
        const tagBox = buildBox('新图 BBCode', targetTags.join('\n'));

        body.appendChild(sourceBox);
        body.appendChild(targetBox);
        body.appendChild(tagBox);

        panel.appendChild(header);
        panel.appendChild(body);
        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.remove();
        });
        document.body.appendChild(overlay);
    }

    static injectImageTools(container: JQuery, meta: TorrentMeta) {
        const toolsDiv = $('<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 6px;"></div>');
        toolsDiv.append('<span style="color: #8e44ad; font-weight: bold; margin-right: 5px;">图床: </span>');

        const makeToolLink = (label: string) =>
            $(`<a href="#" style="text-decoration: none; color: #8e44ad; font-weight: bold; border-right: 1px solid #ddd; padding-right: 5px; margin-right: 5px;">${label}</a>`);

        const showLinks = (title: string, before: string, after: string) => {
            const beforeUrls = ImageHostService.extractImageUrlsFromBBCode(before);
            const afterUrls = ImageHostService.extractImageUrlsFromBBCode(after);
            const afterTags = ImageHostService.extractImageTagsFromBBCode(after);
            this.renderLinkModal(title, beforeUrls, afterUrls, afterTags);
        };

        const fullSize = makeToolLink('原图');
        fullSize.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            meta.description = ImageHostService.convertDescriptionToFullSize(meta.description || '');
            await StorageService.save(meta);
            showLinks('原图链接（转换后）', before, meta.description || '');
            alert('已转换为原图链接');
        });

        const ptp = makeToolLink('PTPIMG');
        ptp.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            const settings = await SettingsService.load();
            if (!settings.ptpImgApiKey) {
                alert('未设置 PTPIMG API Key');
                return;
            }
            meta.description = await ImageHostService.rehostDescriptionToPtpImg(meta.description || '', settings.ptpImgApiKey);
            await StorageService.save(meta);
            showLinks('PTPIMG 结果', before, meta.description || '');
            alert('已转存至 PTPIMG');
        });

        const pix = makeToolLink('PIXHOST');
        pix.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            meta.description = await ImageHostService.rehostDescriptionToPixhost(meta.description || '');
            await StorageService.save(meta);
            showLinks('PIXHOST 结果', before, meta.description || '');
            alert('已转存至 Pixhost');
        });

        const freeimage = makeToolLink('FREEIMAGE');
        freeimage.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            const settings = await SettingsService.load();
            if (!settings.freeimageApiKey) {
                alert('未设置 Freeimage API Key');
                return;
            }
            meta.description = await ImageHostService.rehostDescriptionToFreeimage(meta.description || '', settings.freeimageApiKey);
            await StorageService.save(meta);
            showLinks('FREEIMAGE 结果', before, meta.description || '');
            alert('已转存至 Freeimage');
        });

        const gifyu = makeToolLink('GIFYU');
        gifyu.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            const settings = await SettingsService.load();
            if (!settings.gifyuApiKey) {
                alert('未设置 Gifyu API Key');
                return;
            }
            meta.description = await ImageHostService.rehostDescriptionToGifyu(meta.description || '', settings.gifyuApiKey);
            await StorageService.save(meta);
            showLinks('GIFYU 结果', before, meta.description || '');
            alert('已转存至 Gifyu');
        });

        const hdbimg = makeToolLink('HDBIMG');
        hdbimg.on('click', async (e) => {
            e.preventDefault();
            await ImageUploadBridgeService.prepareAndOpen(meta, 'hdbimg');
        });

        const imgbox = makeToolLink('IMGBOX');
        imgbox.on('click', async (e) => {
            e.preventDefault();
            await ImageUploadBridgeService.prepareAndOpen(meta, 'imgbox');
        });

        toolsDiv.append(fullSize, ptp, pix, freeimage, gifyu, hdbimg, imgbox);
        container.append(toolsDiv);
    }

    static injectMetaFetchTools(container: JQuery, meta: TorrentMeta) {
        const toolsDiv = $('<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 6px;"></div>');
        toolsDiv.append('<span style="color: #2c3e50; font-weight: bold; margin-right: 5px;">外站信息: </span>');

        const btn = $('<a href="#" style="text-decoration: none; color: #2c3e50; font-weight: bold; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px;">点击获取</a>');
        btn.on('click', async (e) => {
            e.preventDefault();
            const original = btn.text();
            btn.text('获取中...');
            try {
                const settings = await SettingsService.load();
                const updated = await PtgenService.applyPtgen(meta, {
                    imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                    ptgenApi: settings.ptgenApi ?? 3
                });
                Object.assign(meta, updated);
                await StorageService.save(updated);
                btn.text('获取成功');
                setTimeout(() => btn.text(original), 1200);
            } catch (err) {
                console.error(err);
                btn.text('获取失败');
                setTimeout(() => btn.text(original), 1200);
            }
        });

        toolsDiv.append(btn);
        container.append(toolsDiv);
    }
}
