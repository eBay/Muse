export = LruDiskCache;
/**
 * @class
 */
declare class LruDiskCache {
    /**
     *
     * @param {object} params
     * @param {number} [params.ttl=30 * 24 * 3600 * 1000]
     * @param {string} [params.location=path.join(os.homedir(), 'muse-storage/lru-disk-cache')]
     * @param {number} [params.saveTimestampsInterval=1000 * 300]
     */
    constructor({ ttl, location, saveTimestampsInterval, }?: {
        ttl?: number;
        location?: string;
        saveTimestampsInterval?: number;
    });
    location: string;
    timestampFile: string;
    timestamps: any;
    ttl: number;
    cleanDeadFiles(): void;
    get(key: any): any;
    getString(key: any): any;
    has(key: any): any;
    set(key: any, content: any): void;
    del(key: any): void;
    updateTimestamp(key: any): void;
    saveTimestamps(): void;
    freeupSpace(): void;
    cleanEmptyFoldersRecursively(folder: any): void;
}
