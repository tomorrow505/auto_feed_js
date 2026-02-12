import $ from 'jquery';
import { TorrentMeta } from '../types/TorrentMeta';
import { SettingsService } from './SettingsService';
import { StorageService } from './StorageService';
import { ImageHostService } from './ImageHostService';
import { PtgenService, PtgenApplyFlags } from './PtgenService';

export class QuickLinkService {
    private static clamp(n: number, min: number, max: number) {
        return Math.min(max, Math.max(min, n));
    }

    private static renderLinkModal(title: string, sourceLinks: string[], targetLinks: string[], targetTags: string[]) {
        const existing = document.getElementById('autofeed-link-modal');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'autofeed-link-modal';
        // Best-effort settings driven opacity; keep safe defaults.
        const maskAlpha = 0.6;
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,${maskAlpha});
            z-index: 2147483647;
            display: flex;
            align-items: center;
            justify-content: center;
        `;

        const panel = document.createElement('div');
        panel.style.cssText = `
            width: 64vw;
            max-width: 980px;
            height: 38vh;
            max-height: 320px;
            min-height: 200px;
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

    static injectImageTools(container: JQuery, meta: TorrentMeta, lang: 'zh' | 'en' = 'zh') {
        // Safari-safe "direct tools" UI, plus a legacy-like "Image Toolbox" modal entry.
        const t = lang === 'zh' ? {
            section: '图床: ',
            toolbox: '图片处理',
            full: '原图',
            ptp: 'PTPIMG',
            pix: 'PIXHOST',
            hdb: 'HDBits',
            imgbox: 'IMGBOX',
            hostik: 'Hostik',
            free: 'FREEIMAGE',
            gifyu: 'GIFYU',
            needPtpKey: '未设置 PTPIMG API Key',
            needFreeKey: '未设置 Freeimage API Key',
            needGifyuKey: '未设置 Gifyu API Key',
            okFull: '已转换为原图链接',
            okPtp: '已转存至 PTPIMG',
            okPix: '已转存至 Pixhost',
            okFree: '已转存至 Freeimage',
            okGifyu: '已转存至 Gifyu'
        } : {
            section: 'Images: ',
            toolbox: 'Image Tools',
            full: 'Full',
            ptp: 'PTPIMG',
            pix: 'PIXHOST',
            hdb: 'HDBits',
            imgbox: 'IMGBOX',
            hostik: 'Hostik',
            free: 'FREEIMAGE',
            gifyu: 'GIFYU',
            needPtpKey: 'PTPIMG API Key not set',
            needFreeKey: 'Freeimage API Key not set',
            needGifyuKey: 'Gifyu API Key not set',
            okFull: 'Converted to full-size links',
            okPtp: 'Rehosted to PTPIMG',
            okPix: 'Rehosted to Pixhost',
            okFree: 'Rehosted to Freeimage',
            okGifyu: 'Rehosted to Gifyu'
        };

        const toolsDiv = $('<div style="display:flex; flex-wrap:wrap; gap:6px; align-items:center; border-top:1px dashed #ddd; padding-top:8px; margin-top:6px;"></div>');
        toolsDiv.append(`<span style="color:#8e44ad; font-weight:800; margin-right:4px;">${t.section}</span>`);

        const makeTool = (label: string) =>
            $(`<button type="button" style="
                appearance:none;
                border:1px solid rgba(0,0,0,0.18);
                background:#2c3e50;
                color:#ffffff;
                padding:2px 6px;
                border-radius:4px;
                cursor:pointer;
                font-weight:800;
                font-size:12px;
                line-height:16px;
            ">${label}</button>`);

        const toolbox = makeTool(t.toolbox);
        toolbox.css({ background: '#8e44ad', borderColor: 'rgba(0,0,0,0.18)' });
        toolbox.on('click', (e) => {
            e.preventDefault();
            try { (e as any).stopImmediatePropagation?.(); } catch { }
            e.stopPropagation();
            const old = toolbox.text();
            toolbox.text(lang === 'zh' ? '打开中...' : 'Opening...');
            this.openImageToolbox(meta, lang)
                .catch((err: any) => {
                    const msg = err?.message ? String(err.message) : String(err);
                    alert(`Image Tools open failed: ${msg}`);
                })
                .finally(() => toolbox.text(old));
        });

        const showLinks = (title: string, before: string, after: string) => {
            const beforeUrls = ImageHostService.extractImageUrlsFromBBCode(before);
            const afterUrls = ImageHostService.extractImageUrlsFromBBCode(after);
            const afterTags = ImageHostService.extractImageTagsFromBBCode(after);
            this.renderLinkModal(title, beforeUrls, afterUrls, afterTags);
        };

        const fullSize = makeTool(t.full);
        fullSize.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            meta.description = ImageHostService.convertDescriptionToFullSize(meta.description || '');
            await StorageService.save(meta);
            showLinks(lang === 'zh' ? '原图链接（转换后）' : 'Full-size (Converted)', before, meta.description || '');
            alert(t.okFull);
        });

        const ptp = makeTool(t.ptp);
        ptp.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            const settings = await SettingsService.load();
            if (!settings.ptpImgApiKey) {
                alert(t.needPtpKey);
                return;
            }
            meta.description = await ImageHostService.rehostDescriptionToPtpImg(meta.description || '', settings.ptpImgApiKey);
            await StorageService.save(meta);
            showLinks(lang === 'zh' ? 'PTPIMG 结果' : 'PTPIMG Result', before, meta.description || '');
            alert(t.okPtp);
        });

        const pix = makeTool(t.pix);
        pix.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            meta.description = await ImageHostService.rehostDescriptionToPixhost(meta.description || '');
            await StorageService.save(meta);
            showLinks(lang === 'zh' ? 'PIXHOST 结果' : 'PIXHOST Result', before, meta.description || '');
            alert(t.okPix);
        });

        const hdb = makeTool(t.hdb);
        hdb.on('click', async (e) => {
            e.preventDefault();
            await ImageHostService.prepareAndOpen(meta, 'hdbits');
        });

        const imgbox = makeTool(t.imgbox);
        imgbox.on('click', async (e) => {
            e.preventDefault();
            await ImageHostService.prepareAndOpen(meta, 'imgbox');
        });

        const hostik = makeTool(t.hostik);
        hostik.on('click', async (e) => {
            e.preventDefault();
            await ImageHostService.prepareAndOpen(meta, 'hostik');
        });

        const freeimage = makeTool(t.free);
        freeimage.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            const settings = await SettingsService.load();
            if (!settings.freeimageApiKey) {
                alert(t.needFreeKey);
                return;
            }
            meta.description = await ImageHostService.rehostDescriptionToFreeimage(meta.description || '', settings.freeimageApiKey);
            await StorageService.save(meta);
            showLinks(lang === 'zh' ? 'FREEIMAGE 结果' : 'FREEIMAGE Result', before, meta.description || '');
            alert(t.okFree);
        });

        const gifyu = makeTool(t.gifyu);
        gifyu.on('click', async (e) => {
            e.preventDefault();
            const before = meta.description || '';
            const settings = await SettingsService.load();
            if (!settings.gifyuApiKey) {
                alert(t.needGifyuKey);
                return;
            }
            meta.description = await ImageHostService.rehostDescriptionToGifyu(meta.description || '', settings.gifyuApiKey);
            await StorageService.save(meta);
            showLinks(lang === 'zh' ? 'GIFYU 结果' : 'GIFYU Result', before, meta.description || '');
            alert(t.okGifyu);
        });

        toolsDiv.append(toolbox, fullSize, ptp, pix, imgbox, hdb, hostik, freeimage, gifyu);
        container.append(toolsDiv);
    }

    private static getUrlsFromText(text: string): string[] {
        const out = new Set<string>();
        const bb = ImageHostService.extractImageUrlsFromBBCode(text);
        bb.forEach((u) => out.add(u));
        const m = text.match(/https?:\/\/[^\s"'<>\\]]+/gi) || [];
        m.forEach((u) => out.add(u));
        return Array.from(out).map((u) => u.trim()).filter(Boolean);
    }

    private static extractImgTags(text: string): string[] {
        const tags = text.match(/(\[url=.*?\])?\[img(?:=[^\]]+)?\].*?\[\/img\](\[\/url\])?/ig);
        return tags ? tags.map((s) => s.trim()).filter(Boolean) : [];
    }

    private static extractImgUrlsFromTags(tags: string[]): string[] {
        const urls: string[] = [];
        for (const tag of tags) {
            // Legacy special: some imgbb tags keep original url in [url=...]
            const imgbb = tag.match(/\[url=(https:\/\/i\.ibb\.co\/.*?\.(png|jpg|jpeg|webp|gif))\]/i)?.[1];
            if (imgbb) {
                urls.push(imgbb);
                continue;
            }
            const m = tag.match(/\[img(?:=[^\]]+)?\](.*?)\[\/img\]/i)?.[1];
            if (m) urls.push(m.trim());
        }
        return urls.filter(Boolean);
    }

    private static guessGalleryName(meta: TorrentMeta, fallback: string): string {
        const descr = fallback || '';
        try {
            if (descr.match(/Disc Title:/i)) return (descr.match(/Disc Title:(.*)/i)?.[1] || '').trim();
            if (descr.match(/Complete name.*?:/i)) return (descr.match(/Complete name.*?:(.*)/i)?.[1] || '').trim();
            if (descr.match(/RELEASE\\.NAME\\s*:/i)) return (descr.match(/RELEASE\\.NAME\\s*:(.*)/i)?.[1] || '').trim();
        } catch {}
        return (meta.title || 'set your gallary name').trim();
    }

    private static async openImageToolbox(meta: TorrentMeta, lang: 'zh' | 'en') {
        // Render immediately, then apply settings asynchronously to avoid Safari userscript quirks
        // where async storage calls can fail silently and prevent the modal from appearing.
        const defaultPopupOpacity = 0.96;
        const defaultMaskOpacity = 0.25;

        const t = lang === 'zh' ? {
            title: '图片处理',
            input: '输入（描述或图片 BBCode）',
            output: '结果输出',
            moveUp: '↑ 将结果移入输入框',
            note: '获取大图目前支持 imgbox，pixhost，pter，ttg，瓷器，img4k，其余可以尝试字符串替换。',
            from: '从第',
            startEvery: '张开始每隔',
            pick: '张获取其中第',
            end: '张。',
            preview: '图片预览',
            full: '获取大图',
            ptp: '转ptpimg',
            pix: '转pixhost',
            imgbox: '转imgbox',
            hdb: '转HDBits',
            hostik: '转Hostik',
            change: '字符串替换',
            thumb350: '350px缩略',
            extractLink: '链接提取',
            enter2space: '换行->空格',
            extract: '图片提取',
            needKey: '未设置 PTPIMG API Key',
            needImages: '请输入图片地址！',
            missingShots: '缺少截图',
            sourceRequired: '请填写源字符串！',
            saved: '已写回缓存描述（目标站填充会使用最新缓存）'
        } : {
            title: 'Image Tools',
            input: 'Input (Description or Image BBCode)',
            output: 'Output',
            moveUp: '↑ Move output to input',
            note: 'Full-size currently supports imgbox, pixhost, pter, ttg, ciqi, img4k. Otherwise try string replace.',
            from: 'From #',
            startEvery: ' start, every ',
            pick: ' pick #',
            end: '.',
            preview: 'Preview',
            full: 'Full Size',
            ptp: 'To PTPIMG',
            pix: 'To Pixhost',
            imgbox: 'To Imgbox',
            hdb: 'To HDBits',
            hostik: 'To Hostik',
            change: 'Replace',
            thumb350: '350px Thumb',
            extractLink: 'Extract Links',
            enter2space: 'NL -> Space',
            extract: 'Extract',
            needKey: 'PTPIMG API Key not set',
            needImages: 'Please input image urls!',
            missingShots: 'Missing screenshots',
            sourceRequired: 'Source string required!',
            saved: 'Saved back to cached description.'
        };
        const existing = document.getElementById('autofeed-image-toolbox-host');
        if (existing) existing.remove();

        // Shadow DOM has proven unreliable on Safari userscript contexts (panel sometimes fails to open).
        // Use normal DOM with scoped styles + !important for stability.
        const host = document.createElement('div');
        host.id = 'autofeed-image-toolbox-host';
        // "all: initial" helps avoid site CSS (e.g. PTP dark theme) breaking our modal.
        host.style.cssText = 'all: initial; position: fixed; inset: 0; z-index: 2147483647; pointer-events: auto;';

        const styleId = 'autofeed-image-toolbox-style';
        if (!document.getElementById(styleId)) {
            const s = document.createElement('style');
            s.id = styleId;
            s.textContent = `
                #autofeed-image-toolbox-host, #autofeed-image-toolbox-host * {
                    box-sizing: border-box !important;
                    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif !important;
                    text-shadow: none !important;
                }
                #autofeed-image-toolbox-host a { color: inherit !important; }
                #autofeed-image-toolbox-host button { font: inherit !important; color: #13293d !important; }
                #autofeed-image-toolbox-host textarea, #autofeed-image-toolbox-host input { font: inherit !important; }
                /* Prevent site themes (PTP dark) from making our small inputs unreadable */
                #autofeed-image-toolbox-host input[type="text"] {
                    background: rgba(255,255,255,0.92) !important;
                    color: #111827 !important;
                }
            `;
            (document.head || document.documentElement).appendChild(s);
        }

        const overlay = document.createElement('div');
        overlay.id = 'autofeed-image-toolbox';
        overlay.style.cssText = [
            'position: fixed',
            'inset: 0',
            `background: rgba(0,0,0,${defaultMaskOpacity})`,
            'display: flex',
            'align-items: center',
            'justify-content: center'
        ].join(';');

        const panel = document.createElement('div');
        panel.style.cssText = [
            'width: calc(100vw - 40px)',
            'max-width: 1100px',
            'height: calc(100vh - 60px)',
            'max-height: 860px',
            'min-height: 360px',
            'background: #b8c9d6',
            'border: 1px solid rgba(0,0,0,0.22)',
            'border-radius: 4px',
            'box-shadow: 0 14px 40px rgba(0,0,0,0.28)',
            'box-sizing: border-box',
            'display: flex',
            'flex-direction: column',
            'overflow: hidden',
            'color: #1f2d3a',
            `opacity: ${defaultPopupOpacity}`
        ].join(';');

        const header = document.createElement('div');
        header.style.cssText = [
            'display:flex',
            'align-items:center',
            'justify-content:space-between',
            'padding: 10px 12px',
            'background: linear-gradient(#f7fbff, #e6eef6)',
            'border-bottom: 1px solid rgba(0,0,0,0.18)'
        ].join(';');
        header.innerHTML = `<div style="font-weight:700; color:#1f2d3a;">${t.title}</div>`;

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '×';
        closeBtn.type = 'button';
        closeBtn.style.cssText = [
            'border: 1px solid rgba(0,0,0,0.08)',
            'background: rgba(255,255,255,0.85)',
            'border-radius: 6px',
            'width: 42px',
            'height: 38px',
            'font-size: 22px',
            'cursor: pointer',
            'color:#334'
        ].join(';');
        closeBtn.onclick = () => host.remove();
        header.appendChild(closeBtn);

        const toolbar = document.createElement('div');
        toolbar.style.cssText = [
            'display:flex',
            'flex-wrap:wrap',
            'gap: 8px',
            'padding: 10px 12px',
            'background: rgba(241, 247, 252, 0.75)',
            'border-bottom: 1px solid rgba(0,0,0,0.14)'
        ].join(';');

        const body = document.createElement('div');
        body.style.cssText = 'display:flex; flex-direction:column; gap: 10px; padding: 10px 12px; flex: 1; overflow: hidden;';

        const mkBtn = (label: string, onClick: () => void) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.textContent = label;
            b.style.cssText = [
                'padding: 6px 10px',
                'border: 1px solid rgba(0,0,0,0.25)',
                'border-radius: 4px',
                'background: rgba(248,250,252,0.95)',
                'color: #13293d',
                'cursor: pointer',
                'font-size: 12px'
            ].join(';');
            b.onclick = onClick;
            return b;
        };

        // Legacy-like layout: one input textarea ("picture") and one result textarea ("result").
        const textareaStyle = [
            'width: 100%',
            'resize: none',
            'padding: 10px',
            'border: 1px solid rgba(0,0,0,0.22)',
            'border-radius: 4px',
            'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
            'font-size: 12px',
            'background: #0b1220 !important',
            'color: #e8f0ff !important',
            'caret-color: #e8f0ff !important',
            'line-height: 1.35'
        ].join(';');

        const picture = document.createElement('textarea');
        picture.id = 'autofeed-picture';
        picture.style.cssText = `${textareaStyle}; height: 42%; min-height: 180px;`;
        const initialTags = this.extractImgTags(meta.description || '');
        picture.value = initialTags.length ? initialTags.join('\n') : (meta.description || '');

        const imgsToShow = document.createElement('div');
        imgsToShow.style.cssText = 'display:none; margin-top:10px;';

        const result = document.createElement('textarea');
        result.id = 'autofeed-result';
        result.style.cssText = `${textareaStyle}; height: 42%; min-height: 180px;`;
        result.value = '';

        const inputLabel = document.createElement('div');
        inputLabel.style.cssText = 'font-weight:700; color:#b00000; margin: 2px 0 6px;';
        inputLabel.textContent = t.input;

        const resultLabelRow = document.createElement('div');
        resultLabelRow.style.cssText = 'display:flex; align-items:center; gap:10px; margin: 2px 0 6px;';
        resultLabelRow.innerHTML = `<div style="font-weight:700; color:#b00000;">${t.output}</div>`;
        const moveUp = document.createElement('a');
        moveUp.href = '#';
        moveUp.textContent = t.moveUp;
        moveUp.style.cssText = 'color:#b00000; font-weight:700; text-decoration:none;';
        moveUp.onclick = (e) => {
            e.preventDefault();
            if (result.value.trim()) picture.value = result.value;
            result.value = '';
        };
        resultLabelRow.appendChild(moveUp);

        const note = document.createElement('div');
        note.style.cssText = 'color:#b00000; font-weight:700; margin-bottom:8px; font-size:12px;';
        note.innerHTML = t.note;

        // Controls (match legacy behavior closely)
        const btnPreview = mkBtn(t.preview, () => {
            if (imgsToShow.style.display !== 'none') {
                imgsToShow.style.display = 'none';
                return;
            }
            const originStr = picture.value || '';
            const urls = (originStr.match(/(\[img(?:=\d+)?\])(http[^\[\]]*?(jpg|jpeg|png|gif|webp))/ig) || [])
                .map((item) => item.replace(/\[.*?\]/g, ''))
                .filter(Boolean);
            if (!urls.length) return;
            imgsToShow.innerHTML = '';
            urls.forEach((u) => {
                const img = document.createElement('img');
                img.src = u;
                img.style.cssText = 'max-width: 100%; display:block; margin: 0 0 8px;';
                imgsToShow.appendChild(img);
            });
            imgsToShow.style.display = 'block';
        });

        const btnGetSource = mkBtn(t.full, () => {
            const originStr = picture.value || '';
            const tags = this.extractImgTags(originStr);
            const urls = this.extractImgUrlsFromTags(tags).map((u) => ImageHostService.getFullSizeUrl(u));
            const out = urls.map((u) => `[img]${u}[/img]`).join('\n');
            result.value = out.trim();
        });

        const btnPtp = mkBtn(t.ptp, async () => {
            const settings = await SettingsService.load();
            if (!settings.ptpImgApiKey) {
                alert(t.needKey);
                return;
            }
            const originStr = picture.value || '';
            const tags = this.extractImgTags(originStr);
            const urls = this.extractImgUrlsFromTags(tags).map((u) => ImageHostService.getFullSizeUrl(u));
            if (!urls.length) {
                alert(t.needImages);
                return;
            }
            const newTags = await ImageHostService.uploadToPtpImg(urls, settings.ptpImgApiKey);
            result.value = newTags.join('\n');
        });

        const btnPix = mkBtn(t.pix, async () => {
            const originStr = picture.value || '';
            const tags = this.extractImgTags(originStr);
            const urls = this.extractImgUrlsFromTags(tags).map((u) => ImageHostService.getFullSizeUrl(u));
            if (!urls.length) {
                alert(t.missingShots);
                return;
            }
            if (urls[0] && urls[0].match(/t\.hdbits\.org/i)) {
                const name = this.guessGalleryName(meta, meta.description || '').trim();
                await ImageHostService.queueImages(urls, name || undefined);
                window.open('https://pixhost.to/', '_blank');
                return;
            }
            const newTags = await ImageHostService.uploadToPixhost(urls);
            result.value = newTags.join('\n');
            alert('转存成功！');
        });

        const btnImgbox = mkBtn(t.imgbox, async () => {
            const originStr = picture.value || '';
            const tags = this.extractImgTags(originStr);
            const urls = this.extractImgUrlsFromTags(tags).map((u) => ImageHostService.getFullSizeUrl(u));
            if (!urls.length) return;
            const name = this.guessGalleryName(meta, meta.description || '').trim();
            await ImageHostService.queueImages(urls, name || undefined);
            window.open('https://imgbox.com/', '_blank');
        });

        const btnHdb = mkBtn(t.hdb, async () => {
            const originStr = picture.value || '';
            const tags = this.extractImgTags(originStr);
            const urls = this.extractImgUrlsFromTags(tags).map((u) => ImageHostService.getFullSizeUrl(u));
            if (!urls.length) return;
            const name = this.guessGalleryName(meta, meta.description || '').trim();
            await ImageHostService.queueImages(urls, name || undefined);
            window.open('https://img.hdbits.org/', '_blank');
        });

        const btnHostik = mkBtn(t.hostik, async () => {
            const originStr = picture.value || '';
            const tags = this.extractImgTags(originStr);
            const urls = this.extractImgUrlsFromTags(tags).map((u) => ImageHostService.getFullSizeUrl(u));
            if (!urls.length) return;
            const name = this.guessGalleryName(meta, meta.description || '').trim();
            await ImageHostService.queueImages(urls, name || undefined);
            window.open('https://hostik.cinematik.net/index.php?/add_photos', '_blank');
        });

        const sourceStr = document.createElement('input');
        sourceStr.type = 'text';
        sourceStr.placeholder = '';
        sourceStr.style.cssText = 'width: 56px; text-align:center; border:1px solid rgba(0,0,0,0.25); border-radius:4px; padding:4px 6px; background: rgba(255,255,255,0.92); color:#111827;';
        const destStr = document.createElement('input');
        destStr.type = 'text';
        destStr.placeholder = '';
        destStr.style.cssText = sourceStr.style.cssText;

        const btnChange = mkBtn(t.change, () => {
            const originStr = picture.value || '';
            if (!sourceStr.value) {
                alert(t.sourceRequired);
                return;
            }
            const s = sourceStr.value;
            const d = destStr.value || '';
            const urls = originStr.match(/http[^\[\]\s]*?(jpg|jpeg|png|gif|webp)/ig) || [];
            let next = originStr;
            urls.forEach((u) => {
                next = next.replaceAll(u, u.replaceAll(s, d));
            });
            picture.value = next;
        });

        const btn350 = mkBtn(t.thumb350, () => {
            const originStr = picture.value || '';
            const imgs = originStr.match(/\[img\].*?(jpg|png).*?\[\/img\]/ig) || [];
            let next = originStr;
            imgs.forEach((item) => {
                const imgUrl = item.match(/http.*?(png|jpg)/i)?.[0] || '';
                if (imgUrl && imgUrl.match(/ptpimg/i)) {
                    const newImgs = `[url=${imgUrl}]${item.replace('[img]', '[img=350x350]')}[/url]`;
                    next = next.replace(item, newImgs);
                }
            });
            result.value = next.trim();
        });

        const btnDelImgTag = mkBtn(t.extractLink, () => {
            let originStr = picture.value || '';
            originStr = originStr.replace(/\[\/?img(?:=[^\]]+)?\]/ig, '');
            result.value = originStr.trim();
        });

        const btnEnter2Space = mkBtn(t.enter2space, () => {
            picture.value = (picture.value || '').replace(/\n/g, ' ');
        });

        const startInput = document.createElement('input');
        startInput.type = 'text';
        startInput.style.cssText = 'width: 36px; text-align:center; border:1px solid rgba(0,0,0,0.25); border-radius:4px; padding:4px 6px; background: rgba(255,255,255,0.92); color:#111827;';
        const stepInput = document.createElement('input');
        stepInput.type = 'text';
        stepInput.style.cssText = startInput.style.cssText;
        const numberInput = document.createElement('input');
        numberInput.type = 'text';
        numberInput.style.cssText = startInput.style.cssText;

        const btnGetEncode = mkBtn(t.extract, () => {
            const originStr = picture.value || '';
            const images = this.extractImgTags(originStr);
            const start = parseInt(startInput.value || '1', 10);
            const encodeIndex = parseInt(numberInput.value || '1', 10);
            const step = parseInt(stepInput.value || '1', 10);
            let dest = '';
            for (let i = start; i < images.length - step; i += step) {
                const idx = i + encodeIndex - 2;
                if (idx >= 0 && idx < images.length) dest += images[idx] + '\n';
            }
            result.value = dest.trim();
        });

        // Toolbar order like legacy
        toolbar.appendChild(btnPreview);
        toolbar.appendChild(btnGetSource);
        toolbar.appendChild(btnPtp);
        toolbar.appendChild(btnPix);
        toolbar.appendChild(btnImgbox);
        toolbar.appendChild(btnHdb);
        toolbar.appendChild(btnHostik);
        toolbar.appendChild(btnChange);
        toolbar.appendChild(sourceStr);
        toolbar.appendChild(document.createTextNode('--'));
        toolbar.appendChild(destStr);
        toolbar.appendChild(btn350);
        toolbar.appendChild(btnDelImgTag);
        toolbar.appendChild(btnEnter2Space);
        toolbar.appendChild(btnGetEncode);

        const pickRow = document.createElement('div');
        pickRow.style.cssText = 'display:flex; align-items:center; gap:6px; flex-wrap:wrap; color:#223; font-size:12px; margin-top: 4px;';
        pickRow.appendChild(document.createTextNode(t.from));
        pickRow.appendChild(startInput);
        pickRow.appendChild(document.createTextNode(t.startEvery));
        pickRow.appendChild(stepInput);
        pickRow.appendChild(document.createTextNode(t.pick));
        pickRow.appendChild(numberInput);
        pickRow.appendChild(document.createTextNode(t.end));

        const inputBlock = document.createElement('div');
        inputBlock.style.cssText = 'display:flex; flex-direction:column; flex: 1; overflow:hidden;';
        inputBlock.appendChild(inputLabel);
        inputBlock.appendChild(picture);
        inputBlock.appendChild(imgsToShow);

        const outBlock = document.createElement('div');
        outBlock.style.cssText = 'display:flex; flex-direction:column; flex: 1; overflow:hidden;';
        outBlock.appendChild(resultLabelRow);
        outBlock.appendChild(result);

        body.appendChild(note);
        body.appendChild(pickRow);
        body.appendChild(inputBlock);
        body.appendChild(outBlock);

        panel.appendChild(header);
        panel.appendChild(toolbar);
        panel.appendChild(body);
        overlay.appendChild(panel);
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) host.remove();
        });

        host.appendChild(overlay);
        (document.body || document.documentElement).appendChild(host);

        // Apply configured opacity without blocking render.
        try {
            SettingsService.load()
                .then((settings) => {
                    const popupOpacity = this.clamp(Number(settings?.popupOpacity ?? defaultPopupOpacity), 0.3, 1);
                    const maskOpacity = this.clamp(Number(settings?.maskOpacity ?? defaultMaskOpacity), 0.1, 0.8);
                    panel.style.opacity = String(popupOpacity);
                    overlay.style.background = `rgba(0,0,0,${maskOpacity})`;
                })
                .catch(() => { });
        } catch { }
    }

    // Public wrapper: legacy-like embedded UI needs to open the toolbox on demand.
    static async openImageToolboxModal(meta: TorrentMeta, lang: 'zh' | 'en' = 'zh') {
        // Best-effort: refresh from storage so late changes (e.g. HDB screenshot selection) are reflected.
        try {
            const stored = await StorageService.load();
            if (stored) Object.assign(meta, stored);
        } catch {}
        return this.openImageToolbox(meta, lang);
    }

    static injectMetaFetchTools(container: JQuery, meta: TorrentMeta, lang: 'zh' | 'en' = 'zh') {
        const t = lang === 'zh' ? {
            label: '外站信息: ',
            fetch: '点击获取',
            fetching: '获取中...',
            ok: '获取成功',
            fail: '获取失败',
            merge: '简介',
            subtitle: '副标题',
            region: '地区',
            ids: 'ID'
        } : {
            label: 'External Info: ',
            fetch: 'Fetch',
            fetching: 'Fetching...',
            ok: 'Fetched',
            fail: 'Failed',
            merge: 'Descr',
            subtitle: 'Subtitle',
            region: 'Region',
            ids: 'IDs'
        };
        const toolsDiv = $('<div style="display: flex; flex-wrap: wrap; gap: 8px; align-items: center; border-top: 1px dashed #ddd; padding-top: 8px; margin-top: 6px;"></div>');
        toolsDiv.append(`<span style="color: #2c3e50; font-weight: bold; margin-right: 5px;">${t.label}</span>`);

        const optWrap = $(`
            <span style="display:inline-flex; gap:8px; align-items:center; font-size: 12px; color: #444;">
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="mergeDescription" checked />${t.merge}
                </label>
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="updateSubtitle" checked />${t.subtitle}
                </label>
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="updateRegion" checked />${t.region}
                </label>
                <label style="display:inline-flex; gap:4px; align-items:center; cursor:pointer;">
                    <input type="checkbox" data-k="updateIds" checked />${t.ids}
                </label>
            </span>
        `);

        const btn = $(`<button type="button" style="color: #2c3e50; font-weight: 800; border: 1px solid #ddd; padding: 2px 6px; border-radius: 4px; background: rgba(255,255,255,0.8); cursor: pointer;">${t.fetch}</button>`);
        btn.on('click', async (e) => {
            e.preventDefault();
            try { (e as any).stopImmediatePropagation?.(); } catch { }
            e.stopPropagation();
            const original = btn.text();
            btn.text(t.fetching);
            try {
                const settings = await SettingsService.load();
                const flags: PtgenApplyFlags = {};
                try {
                    optWrap.find('input[type="checkbox"]').each((_i, el) => {
                        const key = (el as HTMLInputElement).dataset.k as keyof PtgenApplyFlags | undefined;
                        if (!key) return;
                        (flags as any)[key] = (el as HTMLInputElement).checked;
                    });
                } catch {}

                const updated = await PtgenService.applyPtgen(meta, {
                    imdbToDoubanMethod: settings.imdbToDoubanMethod || 0,
                    ptgenApi: settings.ptgenApi ?? 3,
                    doubanCookie: settings.doubanCookie || undefined
                }, flags);
                const changed =
                    (updated.description || '') !== (meta.description || '') ||
                    (updated.subtitle || '') !== (meta.subtitle || '') ||
                    (updated.sourceSel || '') !== (meta.sourceSel || '') ||
                    (updated.doubanId || '') !== (meta.doubanId || '') ||
                    (updated.imdbId || '') !== (meta.imdbId || '');
                if (!changed) throw new Error('No external meta fetched (missing IDs/blocked provider)');
                Object.assign(meta, updated);
                await StorageService.save(updated);
                btn.text(t.ok);
                setTimeout(() => btn.text(original), 1200);
            } catch (err) {
                console.error(err);
                btn.text(t.fail);
                setTimeout(() => btn.text(original), 1200);
            }
        });

        toolsDiv.append(optWrap);
        toolsDiv.append(btn);
        container.append(toolsDiv);
    }
}
