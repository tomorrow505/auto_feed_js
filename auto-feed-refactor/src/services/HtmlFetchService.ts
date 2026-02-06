import { GMAdapter } from './GMAdapter';

export class HtmlFetchService {
    static async getText(url: string): Promise<string> {
        const response = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url
        });
        return (response && (response.responseText || response.response)) || '';
    }

    static async getDocument(url: string): Promise<Document> {
        const html = await this.getText(url);
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }
}
