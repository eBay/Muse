/**
 * Muse cache storage
 *
 * Unlike registry/asset storage, cache storage doesn't have a default provider
 * If no cache storage provider, it always get data from cache builder.
 *  */
const plugin = require('js-plugin');
const Storage = require('./Storage');

let cacheStorage = null;

if (plugin.getPlugins('museCore.cache.storage.get').length > 0) {
  cacheStorage = new Storage({
    extPath: 'museCore.cache.storage',
  });
}

module.exports = cacheStorage;
