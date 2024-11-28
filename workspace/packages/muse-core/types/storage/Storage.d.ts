export = Storage;
/**
 * @class
 */
declare class Storage extends EventEmitter {
    /**
     *
     * @param {object} options
     * @param {string} options.extPath
     */
    constructor(options: {
        extPath: string;
    });
    options: {
        extPath: string;
    };
    extPath: string;
    get(path: any, processor: any, noCache: any, forceRefreshCache: any): Promise<any>;
    getJson(path: any): Promise<any>;
    getJsonByYaml(path: any): Promise<any>;
    getString(path: any): Promise<any>;
    set(path: any, value: any, msg: any): Promise<void>;
    setString(path: any, value: any, msg: any): Promise<void>;
    setYaml(path: any, value: any, msg: any): Promise<void>;
    setJson(path: any, value: any, msg: any): Promise<void>;
    batchSet(items: any, msg: any): Promise<void>;
    del(path: any, msg: any): Promise<void>;
    delDir(path: any, msg: any): Promise<void>;
    count(path: any): Promise<any>;
    exists(path: any): Promise<any>;
    list(path: any): Promise<any>;
    readStream(path: any): Promise<any>;
    writeStream(path: any, value: any, msg: any): Promise<void>;
    listWithContent(keyPath: any): Promise<any>;
    uploadDir(fromDir: any, toPath: any, msg: any): Promise<void>;
}
import EventEmitter = require("events");
