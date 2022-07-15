export = FileStorage;
/**
 * @class
 */
declare class FileStorage {
    /**
     *
     * @param {object} options
     * @param {string} options.location
     */
    constructor(options: {
        location: string;
    });
    location: string;
    init(s: any): void;
    mapPath(p: any): string;
    /**
     *
     * @param {*} keyPath
     * @param {Buffer|String} value
     */
    set(keyPath: any, value: Buffer | string): Promise<void>;
    batchSet(items: any, msg: any): Promise<void>;
    /**
     *
     * @param {String} keyPath
     * @returns Buffer
     */
    get(keyPath: string): Promise<any>;
    del(keyPath: any): Promise<void>;
    delDir(keyPath: any): Promise<void>;
    exists(keyPath: any): any;
    list(keyPath: any): Promise<any>;
    count(keyPath: any): Promise<any>;
}
