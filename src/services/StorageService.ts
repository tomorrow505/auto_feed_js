import { TorrentMeta } from '../types/TorrentMeta';
import { GMAdapter } from './GMAdapter';

const STORAGE_KEY = 'auto_feed_current_meta';

export const StorageService = {
    async save(meta: TorrentMeta): Promise<void> {
        await GMAdapter.setValue(STORAGE_KEY, JSON.stringify(meta));
    },

    async load(): Promise<TorrentMeta | null> {
        const data = await GMAdapter.getValue<string>(STORAGE_KEY);
        if (!data) return null;
        try {
            return JSON.parse(data as string);
        } catch (e) {
            console.error('Failed to parse stored meta', e);
            return null;
        }
    },

    async clear(): Promise<void> {
        await GMAdapter.setValue(STORAGE_KEY, '');
    }
};
