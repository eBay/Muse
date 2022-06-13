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
const LruMemoryCache = require('lru-cache');
const LruDiskCache = require('./LruDiskCache');

class MuseLruCache {
  constructor({
    maxMemorySize = 3 * 1000 * 1000, // default to 3 Gb
    memoryTtl = 1000 * 3600 * 24 * 10, // max 10 days age,
    diskTtl = 30 * 24 * 3600 * 1000, // max 30 days age for disk storage
    diskLocation = path.join(os.homedir(), 'muse-storage/lru-disk-cache'),
    diskSaveTimestampsInterval = 1000 * 300, // the interval to save access timestamps
    getData, // the callback to get the data source, it should return undefined if data not exists. Otherwise always return Buffer
  }) {
    if (!getData) {
      throw new Error('MuseLruCache needs getData callback to get data.');
    }
    this._originalGetData = getData;
    this.memoryCache = new LruMemoryCache({
      maxSize: maxMemorySize,
      sizeCalculation: (value, key) => {
        return (value ? value.length : 1) + key.length;
      },
      ttl: memoryTtl,
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
    let data;
    if (force) {
      data = await this.getData(key);
      if (typeof data === 'undefined') return undefined;
      this.memoryCache.set(key, data);
      this.diskCache.set(key, data);
    } else {
      if (this.memoryCache.has(key)) {
        return this.memoryCache.get(key);
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
