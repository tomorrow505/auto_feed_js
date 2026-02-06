import { SiteConfig } from '../types/SiteConfig';
import { GMAdapter } from './GMAdapter';

export class TorrentService {
    private static DEFAULT_ANNOUNCE = 'https://hudbt.hust.edu.cn/announce.php';

    /**
     * Downloads a torrent file from a URL and converts it to a Base64 string.
     * @param url The URL of the torrent file.
     * @returns Promise resolving to the Base64 string of the file content.
     */
    static async download(url: string, progressCallback?: (percent: number) => void): Promise<string> {
        return new Promise((resolve, reject) => {
            GMAdapter.xmlHttpRequest({
                method: 'GET',
                url: url,
                responseType: 'blob',
                onprogress: (e: any) => {
                    if (e.lengthComputable && progressCallback) {
                        const percent = Math.round((e.loaded / e.total) * 100);
                        progressCallback(percent);
                    }
                },
                onload: (response: any) => {
                    if (response.status >= 200 && response.status < 300) {
                        const blob = response.response;
                        const reader = new FileReader();
                        reader.onloadend = () => {
                            const base64data = reader.result as string;
                            resolve(base64data);
                        };
                        reader.onerror = () => reject(new Error('Failed to read blob as Base64'));
                        reader.readAsDataURL(blob);
                    } else {
                        reject(new Error(`Failed to download torrent. Status: ${response.status}`));
                    }
                },
                onerror: (err: any) => reject(new Error(`Network error downloading torrent: ${err}`)),
                ontimeout: () => reject(new Error('Timeout downloading torrent')),
            });
        });
    }

    /**
     * Converts a Base64 string back to a File object.
     * @param base64 The Base64 string (including data URI scheme).
     * @param filename The filename for the File object.
     * @returns File object ready for form injection.
     */
    static base64ToFile(base64: string, filename: string): File {
        const arr = base64.split(',');
        const mimeMatch = arr[0].match(/:(.*?);/);
        const mime = mimeMatch ? mimeMatch[1] : 'application/x-bittorrent';
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);

        while (n--) {
            u8arr[n] = bstr.charCodeAt(n);
        }

        return new File([u8arr], filename, { type: mime });
    }

    /**
     * Injects a File object into a file input element.
     * @param fileInput The file input DOM element.
     * @param file The File object to inject.
     */
    static injectFileIntoInput(fileInput: HTMLInputElement, file: File) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;

        // Trigger events to simulate user interaction
        const changeEvent = new Event('change', { bubbles: true });
        fileInput.dispatchEvent(changeEvent);

        const inputEvent = new Event('input', { bubbles: true });
        fileInput.dispatchEvent(inputEvent);
    }

    /**
     * Download torrent as binary string (for tracker cleaning / rebuild).
     */
    static async downloadBinaryString(url: string): Promise<string> {
        const response = await GMAdapter.xmlHttpRequest({
            method: 'GET',
            url,
            overrideMimeType: 'text/plain; charset=x-user-defined'
        });
        const text = (response && (response.responseText || response.response)) as string;
        if (!text) throw new Error('Empty torrent response');
        return text;
    }

    static base64ToBinaryString(base64DataUrl: string): string {
        const raw = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
        return atob(raw);
    }

    static binaryStringToFile(binary: string, filename: string): File {
        const data = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
        return new File([data], filename, { type: 'application/x-bittorrent' });
    }

    static normalizeTorrentName(name: string): string {
        return name
            .replace(/[\\/:*?"<>|]/g, '')
            .replace(/^\[.*?\](\.| )?/, '')
            .replace(/|™/g, '')
            .replace(/ /g, '.')
            .replace(/\.-\./g, '-')
            .replace(/\.\.+/g, '.')
            .trim();
    }

    static extractTorrentName(binary: string): string | null {
        const match = binary.match(/4:name(\d+):/);
        if (!match || match.index === undefined) return null;
        const length = parseInt(match[1], 10);
        if (!Number.isFinite(length) || length <= 0) return null;
        const start = match.index + match[0].length;
        return binary.substr(start, length) || null;
    }

    static rebuildTorrentBinary(
        binary: string,
        forwardSite?: string | null,
        forwardAnnounce?: string | null
    ): { binary: string; name?: string } {
        if (!forwardSite || forwardSite === 'hdb-task') return { binary };
        if (binary.match(/value="firsttime"/)) {
            throw new Error('种子下载失败：请先在源站手动下载一次。');
        }
        if (binary.match(/Request frequency limit/)) {
            throw new Error('种子下载频率过快，请稍后再试。');
        }

        let name = '';
        if (
            binary.match(
                /8:announce\d+:.*(please\.passthepopcorn\.me|blutopia\.cc|beyond-hd\.me|eiga\.moi|hd-olimpo\.club|secret-cinema\.pw|monikadesign\.uk)/
            )
        ) {
            const extracted = this.extractTorrentName(binary);
            if (extracted) name = extracted;
        }

        let announce = (forwardAnnounce || '').trim();
        if (!announce) announce = this.DEFAULT_ANNOUNCE;
        const announceMatch = announce.match(/https?:\/\/[^\s"'<>]+/);
        if (announceMatch) announce = announceMatch[0];

        if (!binary.match(/8:announce\d+:/)) {
            return { binary, name: name || undefined };
        }

        let newTorrent = 'd';
        newTorrent += `8:announce${announce.length}:${announce}`;

        if (binary.match(/13:creation date/)) {
            try {
                const date = binary.match(/13:creation datei(\d+)e/)?.[1];
                if (date) {
                    const newDate = parseInt(date, 10) + 600 + Math.floor(Math.random() * 600);
                    newTorrent += `13:creation datei${newDate.toString()}e`;
                }
            } catch {}
        }

        newTorrent += '8:encoding5:UTF-8';

        let info = '';
        let endToken = 'ee';
        const infoPrivate = binary.match(/4:info[\s\S]*?privatei\de/);
        if (infoPrivate) {
            info = infoPrivate[0].replace('privatei0e', 'privatei1e');
        } else {
            const infoAny = binary.match(/4:info[\s\S]*?e/);
            if (infoAny) {
                info = infoAny[0];
                endToken = 'e';
            }
        }
        if (!info) return { binary, name: name || undefined };

        newTorrent += info;
        const source = `6:source${forwardSite.length}:${forwardSite.toUpperCase()}`;
        newTorrent += source;
        newTorrent += endToken;

        return { binary: newTorrent, name: name || undefined };
    }

    static async buildForwardTorrentFile(
        meta: { torrentUrl?: string; torrentBase64?: string; torrentFilename?: string; title?: string },
        forwardSite: string,
        forwardAnnounce?: string | null
    ): Promise<{ file: File; filename: string; nameFromTorrent?: string } | null> {
        let binary = '';

        // Prefer cached base64 if available to avoid re-downloading on target pages.
        if (meta.torrentBase64) {
            binary = this.base64ToBinaryString(meta.torrentBase64);
        } else if (meta.torrentUrl) {
            if (meta.torrentUrl.match(/d8:announce/)) {
                binary = meta.torrentUrl;
            } else {
                binary = await this.downloadBinaryString(meta.torrentUrl);
            }
        }

        if (!binary) return null;

        const rebuilt = this.rebuildTorrentBinary(binary, forwardSite, forwardAnnounce);
        const rawNameFromTorrent = rebuilt.name || '';
        const normalizedNameFromTorrent = rawNameFromTorrent ? this.normalizeTorrentName(rawNameFromTorrent) : '';
        let filename = meta.torrentFilename || meta.title || 'autofeed';
        filename = this.normalizeTorrentName(filename) || 'autofeed';
        if (normalizedNameFromTorrent) filename = normalizedNameFromTorrent;
        if (!filename.endsWith('.torrent')) filename += '.torrent';

        const file = this.binaryStringToFile(rebuilt.binary, filename);
        return { file, filename, nameFromTorrent: rawNameFromTorrent || undefined };
    }

    static injectTorrentForSite(forwardSite: string, file: File, filename?: string): boolean {
        const makeTransfer = () => {
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(file);
            return dataTransfer.files;
        };

        if (forwardSite === 'MTeam') {
            const input = document.getElementById('torrent-input') as HTMLInputElement | null;
            if (!input) return false;
            const lastValue = input.value;
            input.files = makeTransfer();
            const tracker = (input as any)._valueTracker;
            if (tracker) tracker.setValue(lastValue);
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            if (filename) {
                const buttons = Array.from(document.querySelectorAll('button')) as HTMLButtonElement[];
                const labelBtn = buttons.find((b) => (b.textContent || '').includes('選擇種子') || (b.textContent || '').includes('选择种子'));
                if (labelBtn && labelBtn.nextElementSibling && labelBtn.nextElementSibling.nextElementSibling) {
                    labelBtn.nextElementSibling.nextElementSibling.textContent = filename;
                }
            }
            return true;
        }

        if (forwardSite === 'CHDBits') {
            const input = document.querySelector('input[name="torrentfile"]') as HTMLInputElement | null;
            if (input) {
                this.injectFileIntoInput(input, file);
                return true;
            }
        }

        if (forwardSite === 'PTP') {
            const input = document.querySelector('input[name="file_input"]') as HTMLInputElement | null;
            if (input) {
                input.files = makeTransfer();
                input.dispatchEvent(new Event('change', { bubbles: true }));
                const fileEl = document.getElementById('file') as HTMLInputElement | null;
                if (fileEl) fileEl.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
        }

        if (forwardSite === 'HDB') {
            const input = document.querySelector('input[name="file"]') as HTMLInputElement | null;
            if (input) {
                this.injectFileIntoInput(input, file);
                return true;
            }
        }

        if (forwardSite === 'BHD') {
            const input = document.querySelector('input#torrent, input[name="torrent"]') as HTMLInputElement | null;
            if (input) {
                this.injectFileIntoInput(input, file);
                return true;
            }
        }

        const fallback = document.querySelector('input[type="file"]') as HTMLInputElement | null;
        if (fallback) {
            this.injectFileIntoInput(fallback, file);
            return true;
        }
        return false;
    }
}
