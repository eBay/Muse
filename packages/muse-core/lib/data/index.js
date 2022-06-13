// const plugin = require('js-plugin');
// const { pathToRegexp, match, parse, compile } = require('path-to-regexp');
// const cacheStorage = require('../storage/cache');

// const builders = [];

// const cache = {
//   refresh: async () => {},
//   get: async (key) => {
//     for (const builder of builders) {
//       const m = builder.match(key.replace(/\./g, '/'));
//       if (m) {
//         return await builder.get(m.params);
//       }
//     }
//     return null;
//   },
//   registerBuilder: (builder) => {
//     if (builder.key.includes('/')) {
//       throw new Error(`Cache builder key should not include '/'.`);
//     }
//     if (builders.some((b) => b.key === builder.key)) {
//       throw new Error(`Cache builder ${builder.key} already exsits.`);
//     }
//     builders.push({
//       ...builder,
//       match: match(builder.key.replace(/\./g, '/')),
//     });
//   },
// };

// cache.registerBuilder(require('./builders/muse.app'));
// cache.registerBuilder(require('./builders/muse.plugin-releases'));
// cache.registerBuilder(require('./builders/muse.plugins.latest-releases'));

// const extBuilders = plugin.invoke('!museCore.cache.builder').filter(Boolean);
// extBuilders.forEach((builder) => {
//   cache.registerBuilder(builder.name, builder);
// });

const builder = require('./builder');
module.exports = {
  get: async (key) => {
    return await builder.get(key);
  },
  builder,
};
