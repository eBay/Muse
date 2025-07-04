const _ = require('lodash');
const plugin = require('js-plugin');
const { asyncInvoke, asyncInvokeFirst, batchAsync, makeRetryAble } = require('../utils');
const builder = require('./builder');
const logger = require('../logger').createLogger('muse.data.index');

// NOTE: sometimes the muse-core runtime is not able to get data from builder
// e.g: prod runtime has different network than dev time
// So, if there's cache provider, get data from it directly.

const get = async (key, opts) => {
  const { noCache } = opts || {};
  // If there's cache provider, always get it from cache
  plugin.invoke(`museCore.data.beforeGet`, key);
  if (!noCache && plugin.getPlugins('museCore.data.cache.get').length > 0) {
    logger.verbose(`Getting data from cache: ${key}`);
    const value = await asyncInvokeFirst('museCore.data.cache.get', key);
    if (!value) return null;
    return JSON.parse(value.toString());
  } else {
    logger.verbose(`Getting data without cache: ${key}`);
    return await builder.get(key);
  }
};

const setCache = async (key, value) => {
  if (!_.isNil(value)) {
    // If found from builder, save to cache
    await asyncInvokeFirst('museCore.data.cache.set', key, Buffer.from(JSON.stringify(value)));
  } else {
    // If it's nil, seems should delete it from cache
    // Don't delete a muse data cache because it's important
    // To delete a cache item, just manually delete it
    await asyncInvokeFirst('museCore.data.cache.del', key);
  }
};

/**
 * @description It is used to build cache data at dev time for prod usage
 * @param {string} key
 */
const refreshCache = async (key) => {
  if (!key) {
    throw new Error(`Key is missing in museCore.data.refreshCache.`);
  }
  plugin.invoke(`museCore.data.beforeRefreshCache`, key);
  logger.verbose(`Refreshing data cache: ${key}`);
  // The value must be a json
  const value = await builder.get(key, { noCache: true });
  await setCache(key, value);

  plugin.invoke(`museCore.data.afterRefreshCache`, key);
  return value;
};

const syncCache = async () => {
  // allows plugins to provide logic to sync all cache to muse data cache
  return await asyncInvokeFirst('museCore.data.syncCache');
};

/**
 * @description
 *  Notify the Muse data engine that some keys in the storage have been changed
 *  This usually causes some builder to refresh the cache.
 * @param { string } type         - The type of the storage.
 * @param { string | array} keys  - Changed keys in the storage
 */
const handleDataChange = async (type, keys) => {
  logger.verbose(`Handling data sourche change: ${keys}`);
  const museDataKeys = builder.getMuseDataKeysByRawKeys(type, keys);
  logger.verbose(`Refershing data for keys: ${museDataKeys}`);
  await batchAsync(
    museDataKeys.map((k) => async () => {
      await makeRetryAble(refreshCache, { times: 5, msg: `Refreshing muse data cache ${k}...` })(k);
    }),
    { size: 50, msg: 'batch refresh cache' },
  );

  return {
    museDataKeys,
    rawKeys: keys,
  };
};

module.exports = {
  get,
  setCache,
  handleDataChange,
  refreshCache,
  syncCache,
  builder,
};
