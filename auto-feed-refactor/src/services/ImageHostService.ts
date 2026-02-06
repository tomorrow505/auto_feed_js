
/**
 * Service to handle image hosting operations.
 * Ported from `get_full_size_picture_urls`, `ptp_send_images` etc.
 */
import { GMAdapter } from './GMAdapter';
export class ImageHostService {

    /**
     * Converts thumbnail URLs to full size URLs for known hosts.
     * Matches logic from `get_full_size_picture_urls`
     */
    static getFullSizeUrl(url: string): string {
        let newUrl = url;

        if (url.match(/imgbox/)) {
            newUrl = url.replace('thumbs2', 'images2').replace('t.png', 'o.png');
        } else if (url.match(/pixhost/)) {
            newUrl = url.replace('//t', '//img').replace('thumbs', 'images');
        } else if (url.match(/shewang.net|pterclub.net|img4k.net|img.hdhome.org|img.hdchina.org/)) {
            newUrl = url.replace(/th.png/, 'png').replace(/md.png/, 'png');
        } else if (url.match(/beyondhd.co\/(images|cache)/)) {
            newUrl = url.replace(/th.png/, 'png').replace(/md.png/, 'png').replace('/t/', '/i/');
        } else if (url.match(/tu.totheglory.im/)) {
            newUrl = url.replace(/_thumb.png/, '.png');
        }

        return newUrl;
    }

    static extractImageUrlsFromBBCode(description: string): string[] {
        const urls: string[] = [];
        const matches = description.match(/\[img\](.*?)\[\/img\]/gi);
        if (!matches) return urls;
        matches.forEach((item) => {
            const m = item.match(/\[img\](.*?)\[\/img\]/i);
            if (m && m[1]) urls.push(m[1].trim());
        });
        return urls;
    }

    static extractImageTagsFromBBCode(description: string): string[] {
        const matches = description.match(/(\[url=.*?\])?\[img\].*?\[\/img\](\[\/url\])?/gi);
        return matches ? matches.map((m) => m.trim()).filter(Boolean) : [];
    }

    static replaceImageUrlsInBBCode(description: string, newTags: string[]): string {
        let idx = 0;
        return description.replace(/\[img\](.*?)\[\/img\]/gi, () => {
            const tag = newTags[idx];
            idx += 1;
            return tag || '';
        });
    }

    static convertDescriptionToFullSize(description: string): string {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = urls.map((u) => `[img]${this.getFullSizeUrl(u)}[/img]`);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    /**
     * Uploads images to PTPImg (Stub)
     * Requires API Key and GM_xmlhttpRequest
     */
    static async uploadToPtpImg(imageUrls: string[], apiKey: string): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const boundary = '--NN-GGn-PTPIMG';
            let data = '';
            data += boundary + '\n';
            data += 'Content-Disposition: form-data; name="link-upload"\n\n';
            data += imageUrls.join('\n') + '\n';
            data += boundary + '\n';
            data += 'Content-Disposition: form-data; name="api_key"\n\n';
            data += apiKey + '\n';
            data += boundary + '--';
            GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: 'https://ptpimg.me/upload.php',
                responseType: 'json',
                headers: {
                    'Content-type': 'multipart/form-data; boundary=NN-GGn-PTPIMG'
                },
                data,
                onload: (response: any) => {
                    if (response.status !== 200) {
                        reject(`Response error ${response.status}`);
                        return;
                    }
                    const list = response.response?.map((item: any) => {
                        return `[img]https://ptpimg.me/${item.code}.${item.ext}[/img]`;
                    });
                    resolve(list || []);
                }
            });
        });
    }

    static async uploadToPixhost(imageUrls: string[]): Promise<string[]> {
        return new Promise((resolve, reject) => {
            GMAdapter.xmlHttpRequest({
                method: 'POST',
                url: 'https://pixhost.to/remote/',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json',
                    'User-Agent':
                        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                },
                data: encodeURI(`imgs=${imageUrls.join('\r\n')}&content_type=0&max_th_size=350`),
                onload: (response: any) => {
                    if (response.status !== 200) {
                        reject(response.status);
                        return;
                    }
                    const data = response.responseText.match(/(upload_results = )({.*})(;)/);
                    if (data && data.length) {
                        const imgResultList = JSON.parse(data[2]).images;
                        resolve(
                            imgResultList.map((item: any) => {
                                return `[url=${item.show_url}][img]${item.th_url}[/img][/url]`;
                            })
                        );
                    } else {
                        reject('Upload failed');
                    }
                }
            });
        });
    }

    static async uploadToFreeimage(imageUrls: string[], apiKey: string): Promise<string[]> {
        const results: string[] = [];
        for (const url of imageUrls) {
            // eslint-disable-next-line no-await-in-loop
            const tag = await new Promise<string>((resolve, reject) => {
                const data = encodeURI(`source=${url}&key=${apiKey}`);
                GMAdapter.xmlHttpRequest({
                    method: 'POST',
                    url: 'https://freeimage.host/api/1/upload',
                    responseType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                    },
                    data,
                    onload: (response: any) => {
                        if (response.status !== 200) {
                            reject(`Response error ${response.status}`);
                            return;
                        }
                        const data = response.response?.image;
                        if (data?.url) {
                            resolve(`[img]${data.url}[/img]`);
                        } else {
                            reject('Upload failed');
                        }
                    }
                });
            });
            results.push(tag);
        }
        return results;
    }

    static async uploadToGifyu(imageUrls: string[], apiKey: string): Promise<string[]> {
        const results: string[] = [];
        for (const url of imageUrls) {
            // eslint-disable-next-line no-await-in-loop
            const tag = await new Promise<string>((resolve, reject) => {
                const data = encodeURI(`source=${url}&key=${apiKey}`);
                GMAdapter.xmlHttpRequest({
                    method: 'POST',
                    url: 'https://gifyu.com/api/1/upload',
                    responseType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                    },
                    data,
                    onload: (response: any) => {
                        if (response.status !== 200) {
                            reject(`Response error ${response.status}`);
                            return;
                        }
                        const data = response.response?.image;
                        if (data?.url) {
                            resolve(`[img]${data.url}[/img]`);
                        } else {
                            reject('Upload failed');
                        }
                    }
                });
            });
            results.push(tag);
        }
        return results;
    }

    static async uploadToHdbImg(imageUrls: string[], apiKey?: string, endpoint?: string): Promise<string[]> {
        const results: string[] = [];
        const apiUrl = endpoint || 'https://hdbimg.com/api/1/upload';
        for (const url of imageUrls) {
            // eslint-disable-next-line no-await-in-loop
            const tag = await new Promise<string>((resolve, reject) => {
                const data = encodeURI(`source=${url}${apiKey ? `&key=${apiKey}` : ''}`);
                GMAdapter.xmlHttpRequest({
                    method: 'POST',
                    url: apiUrl,
                    responseType: 'json',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                        'User-Agent':
                            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.90 Safari/537.36'
                    },
                    data,
                    onload: (response: any) => {
                        if (response.status !== 200) {
                            reject(`Response error ${response.status}`);
                            return;
                        }
                        const body = response.response || {};
                        const candidates = [
                            body?.image?.url,
                            body?.image?.url_viewer,
                            body?.data?.url,
                            body?.data?.image?.url,
                            body?.data?.display_url,
                            body?.url
                        ].filter(Boolean);
                        if (candidates.length) {
                            resolve(`[img]${candidates[0]}[/img]`);
                            return;
                        }
                        const text = response.responseText || '';
                        const match = text.match(/https?:\/\/[^\s"'<>]+/);
                        if (match) {
                            resolve(`[img]${match[0]}[/img]`);
                        } else {
                            reject('Upload failed');
                        }
                    }
                });
            });
            results.push(tag);
        }
        return results;
    }

    static async rehostDescriptionToPtpImg(description: string, apiKey: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToPtpImg(urls, apiKey);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToPixhost(description: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToPixhost(urls);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToFreeimage(description: string, apiKey: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToFreeimage(urls, apiKey);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToGifyu(description: string, apiKey: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToGifyu(urls, apiKey);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }

    static async rehostDescriptionToHdbImg(description: string, apiKey?: string, endpoint?: string): Promise<string> {
        const urls = this.extractImageUrlsFromBBCode(description);
        if (!urls.length) return description;
        const newTags = await this.uploadToHdbImg(urls, apiKey, endpoint);
        return this.replaceImageUrlsInBBCode(description, newTags);
    }
}
