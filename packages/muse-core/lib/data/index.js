const _ = require('lodash');
const plugin = require('js-plugin');
const { asyncInvokeFirst } = require('../utils');
const builder = require('./builder');
const logger = require('../logger').createLogger('muse.data.index');

// NOTE: sometimes the muse-core runtime is not able to get data from builder
// e.g: prod runtime has different network than dev time
// So, if there's cache provider, get data from it directly.
module.exports = {
  get: async (key) => {
    // If there's cache provider, always get it from cache
    if (plugin.getPlugins('museCore.data.cache.get').length > 0) {
      return JSON.parse(await asyncInvokeFirst('museCore.data.cache.get', key));
    } else {
      return await builder.get(key);
    }
  },

  // refreshCache is used to build cache data at dev time for prod usage
  refreshCache: async (key) => {
    if (!key) {
      const err = new Error(`Key is missing in museCore.data.refreshCache.`);
      logger.error(err.message);
      throw new err();
    }
    const value = await builder.get(key);
    if (!_.isNil(value)) {
      // If found from builder, save to cache
      await asyncInvokeFirst('museCore.data.cache.set', key, JSON.stringify(value));
    }
  },
  // refreshCache: (key) => builder.refreshCache(key),
  builder,
};
