export function get(key: any, { noCache }?: {
    noCache: any;
}): Promise<any>;
export function setCache(key: any, value: any): Promise<void>;
/**
 * @description
 *  Notify the Muse data engine that some keys in the storage have been changed
 *  This usually causes some builder to refresh the cache.
 * @param { string } type         - The type of the storage.
 * @param { string | array} keys  - Changed keys in the storage
 */
export function handleDataChange(type: string, keys: string | any[]): Promise<void>;
/**
 * @description It is used to build cache data at dev time for prod usage
 * @param {string} key
 */
export function refreshCache(key: string): Promise<void>;
export function syncCache(): Promise<void>;
import builder = require("./builder");
export { builder };
