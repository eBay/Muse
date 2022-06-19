const { match } = require('path-to-regexp');
const _ = require('lodash');
const plugin = require('js-plugin');
const logger = require('../logger').createLogger('muse.data.builder');

const builders = [];

const builder = {
  // refresh cache is only useful when there's cache provider
  // refreshCache: async (name) => {},
  get: async (key) => {
    for (const builder of builders) {
      const m = builder.match(key);
      if (m) {
        return await builder.get(m.params);
      } else {
        logger.error(`No builder for key ${key}.`);
      }
    }
    return null;
  },
  register: (builder) => {
    // TODO: use json schema
    // if (!builder.name) {
    //   const err = new Error(`Every builder should have a name.`);
    //   logger.error(err.message);
    //   throw err;
    // }
    if (!builder.key) {
      const err = new Error(`Every builder should have a key: ${builder.name}.`);
      logger.error(err.message);
      throw err;
    }
    if (builder.key.includes('/')) {
      const err = new Error(`Cache builder key should not include '/'.`);
      logger.error(err.message);
      throw err;
    }
    // if (builders.some((b) => b.name === builder.name)) {
    //   const err = new Error(`Cache builder with name ${builder.name} already exsits.`);
    //   logger.error(err.message);
    //   throw err;
    // }
    if (builders.some((b) => b.key === builder.key)) {
      const err = new Error(`Cache builder with key ${builder.key} already exsits.`);
      logger.error(err.message);
      throw err;
    }
    builders.push({
      ...builder,
      match: (k) => match(builder.key.replace(/\./g, '/'))(k.replace(/\./g, '/')),
    });
  },
};

builder.register(require('./builders/muse.app'));
_.flatten(_.invoke('museCore.data.getBuilders'))
  .filter(Boolean)
  .forEach((b) => {
    builder.register(b);
  });

module.exports = builder;
