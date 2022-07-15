export = MuseLruCache;
/**
 * @callback getDataCallback
 * @param {string} key
 */
declare class MuseLruCache {
    /**
     * @param {object} params
     * @param {getDataCallback} params.getData The callback to get the data source, it should return undefined if data not exists. Otherwise always return Buffer.
     * @param {number} [params.maxMemorySize=2 * 1000 * 1000] Default to 2 Gb.
     * @param {number} [params.memoryTtl=1000 * 3600 * 24 * 10] Max 10 days age.
     * @param {number} [params.diskTtl=30 * 24 * 3600 * 1000] Max 30 days age for disk storage.
     * @param {string} [params.diskLocation=path.join(os.homedir(), 'muse-storage/lru-disk-cache')]
     * @param {number} [params.diskSaveTimestampsInterval= 1000 * 300] The interval to save access timestamps.
     *
     */
    constructor({ maxMemorySize, memoryTtl, diskTtl, diskLocation, diskSaveTimestampsInterval, getData, }: {
        getData: getDataCallback;
        maxMemorySize?: number;
        memoryTtl?: number;
        diskTtl?: number;
        diskLocation?: string;
        diskSaveTimestampsInterval?: number;
    });
    _originalGetData: getDataCallback;
    memoryCache: any;
    diskCache: LruDiskCache;
    getData(key: any): Promise<Buffer>;
    get(key: any, force: any): Promise<any>;
    getString(key: any, force: any): Promise<any>;
}
declare namespace MuseLruCache {
    export { getDataCallback };
}
type getDataCallback = (key: string) => any;
import LruDiskCache = require("./LruDiskCache");
