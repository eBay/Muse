const plugin = require('js-plugin');
const cacheStorage = require('../storage/cache');

const builders = {};

const cache = {
  refresh: async () => {},
  get: async (name) => {},
  registerBuilder: (name, func) => {
    builders[name] = func;
  },
};

cache.registerBuilder('muse.app.*', require('./builders/muse.app'));
cache.registerBuilder('muse.plugin-releases.*', require('./builders/muse.plugin-releases'));
cache.registerBuilder('muse.plugins.latest-releases', require('./builders/muse.plugins.latest-releases'));

const extBuilders = plugin.invoke('!museCore.cache.builder').filter(Boolean);
extBuilders.forEach((builder) => {
  cache.registerBuilder(builder.name, builder);
});

module.exports = cache;
