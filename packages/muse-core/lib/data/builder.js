const _ = require('lodash');
const logger = require('../logger').createLogger('muse.data.builder');

const builders = [];

const builder = {
  // refresh cache is only useful when there's cache provider
  // refreshCache: async (name) => {},
  get: async key => {
    if (!key) throw Error('Builder.get need a key');
    for (const builder of builders) {
      if (key === builder.key || builder.match?.(key)) {
        return await builder.get(key);
      }
    }
    logger.error(`No builder for key ${key}.`);
    return null;
  },
  /**
   * @description Get Muse data keys by raw storage keys.
   * So that when cache is provided, when there is data change in raw data, it can refresh cache for Muse data.
   * @param {string} rawDataType - The data storage type for use in builders. For example `registry`
   * @param {string|array} keys - The changed keys in raw storage
   * @return {array} - The Muse data keys related with the raw storage keys.
   */
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    keys = _.castArray(keys);
    return _.chain(builders)
      .map(b => b.getMuseDataKeysByRawKeys?.(rawDataType, keys))
      .flatten()
      .filter(Boolean)
      .uniq()
      .value();
  },
  register: builder => {
    // TODO: use json schema
    // if (!builder.name) {
    //   const err = new Error(`Every builder should have a name.`);
    //   logger.error(err.message);
    //   throw err;
    // }
    if (!builder.key && !builder.match) {
      throw new Error(`Every builder should have a key or match method: ${builder.name}.`);
    }
    // if (builder.key.includes('/')) {
    //   throw new Error(`Cache builder key should not include '/'.`);
    // }
    // if (builders.some((b) => b.name === builder.name)) {
    //   const err = new Error(`Cache builder with name ${builder.name} already exsits.`);
    //   logger.error(err.message);
    //   throw err;
    // }
    // if (builders.some(b => b.key === builder.key)) {
    //   throw new Error(`Cache builder with key ${builder.key} already exsits.`);
    // }
    builders.push(builder);
    // {
    //   ...builder,
    //   match: k => match(builder.key.replace(/\./g, '/'))(k.replace(/\./g, '/')),
    // });
  },
};

builder.register(require('./builders/muse.app'));
builder.register(require('./builders/muse.app-by-url'));
builder.register(require('./builders/muse.apps'));
builder.register(require('./builders/muse.plugins'));
builder.register(require('./builders/muse.requests'));
builder.register(require('./builders/muse.plugin'));
builder.register(require('./builders/muse.plugin-releases'));
builder.register(require('./builders/muse.plugins.latest-releases'));
_.flatten(_.invoke('museCore.data.getBuilders'))
  .filter(Boolean)
  .forEach(b => {
    builder.register(b);
  });

module.exports = builder;
