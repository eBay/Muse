/**
 * Two layers lru cache. When get data:
 * 1. Try to get it from memory cache (lru-cache). If found, return the data.
 * 2. Try to get it from disk cache, if found, write it to memory cache and return the data.
 * 3. Try to get it from data provider (a callback function), if found, write it to disk and memory cache, return the data.
 *
 * Whenever write data, check LRU policy (by size and last accessed) and delete unused content.
 *
 */
const path = require('path');
const os = require('os');
// NOTE: IMPORTANT! Use lru-cache@6.0.0 since 7.x has weird issue
const LruMemoryCache = require('lru-cache');
const LruDiskCache = require('./LruDiskCache');

/**
 * @callback getDataCallback
 * @param {string} key
 */
class MuseLruCache {
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
  constructor({
    maxMemorySize = 2 * 1000 * 1000 * 1000,
    memoryTtl = 10 * 24 * 3600 * 1000,
    diskTtl = 30 * 24 * 3600 * 1000,
    diskLocation = path.join(os.homedir(), 'muse-storage/.lru-cache'),
    diskSaveTimestampsInterval = 1000 * 300,
    getData,
  }) {
    if (!getData) {
      throw new Error('MuseLruCache needs getData callback to get data.');
    }
    this._originalGetData = getData;
    this.memoryCache = new LruMemoryCache({
      max: maxMemorySize,
      length: (value, key) => {
        return (value ? value.length : 1) + key.length;
      },
      maxAge: memoryTtl,
      updateAgeOnGet: true,
    });

    this.diskCache = new LruDiskCache({
      location: diskLocation,
      ttl: diskTtl,
      saveTimestampsInterval: diskSaveTimestampsInterval,
    });
  }
  async getData(key) {
    const d = await this._originalGetData(key);
    if (typeof d === 'undefined' || d === null) return undefined;
    return Buffer.from(d);
  }
  // Return value should be Buffer
  async get(key, force) {
    // console.log('getting: ', key);
    let data;
    if (force) {
      data = await this.getData(key);
      if (typeof data === 'undefined') return undefined;
      this.memoryCache.set(key, data);
      this.diskCache.set(key, data);
    } else {
      if (this.memoryCache.has(key)) {
        data = this.memoryCache.get(key);
      } else if (this.diskCache.has(key)) {
        data = this.diskCache.get(key);
        this.memoryCache.set(key, data);
      } else {
        data = await this.getData(key);
        if (typeof data === 'undefined') return undefined;
        this.memoryCache.set(key, data);
        this.diskCache.set(key, data);
      }
    }
    this.diskCache.updateTimestamp(key);
    return data;
  }

  async getString(key, force) {
    const d = await this.get(key, force);
    if (typeof d === 'undefined') return undefined;
    return d.toString();
  }
}
module.exports = MuseLruCache;
