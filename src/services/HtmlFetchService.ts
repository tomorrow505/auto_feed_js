import { GMAdapter } from './GMAdapter';

export class HtmlFetchService {
    static async getText(
        url: string,
        options?: { headers?: Record<string, string>; withCredentials?: boolean; anonymous?: boolean }
    ): Promise<string> {
        const response = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            headers: options?.headers,
            withCredentials: options?.withCredentials,
            anonymous: options?.anonymous
        });
        return (response && (response.responseText || response.response)) || '';
    }

    static async getDocument(
        url: string,
        options?: { headers?: Record<string, string>; withCredentials?: boolean; anonymous?: boolean }
    ): Promise<Document> {
        const html = await this.getText(url, options);
        const parser = new DOMParser();
        return parser.parseFromString(html, 'text/html');
    }
}
