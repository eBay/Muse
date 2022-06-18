const _ = require('lodash');
const { asyncInvokeFirst } = require('../utils');
const builder = require('./builder');
module.exports = {
  get: async (key) => {
    // Try to get from cache provider
    let value = await asyncInvokeFirst('museCore.data.cache.get', key);
    if (_.isNil(value)) {
      // If not found, get from builder
      value = await builder.get(key);
      if (!_.isNil(value)) {
        // If found from builder, save to cache
        await asyncInvokeFirst('museCore.data.cache.set', key, value);
      }
    }

    return value;
  },
  refreshCache: (key) => builder.refreshCache(key),
  builder,
};
