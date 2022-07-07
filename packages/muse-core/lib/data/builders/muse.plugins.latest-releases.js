const _ = require('lodash');
const { getPlugins, getReleases } = require('../../pm');
const { batchAsync } = require('../../utils');
const logger = require('../../logger').createLogger(
  'muse.data.builder.muse.plugins.latest-releases',
);

module.exports = {
  name: 'muse.plugins.latest-releases',
  key: 'muse.plugins.latest-releases',
  get: async () => {
    logger.verbose(`Getting Muse data muse.plugins.latest-releases...`);
    const plugins = await getPlugins();
    const latestReleases = (
      await batchAsync(
        plugins.map(p => async () => {
          const releases = await getReleases(p.name);
          return {
            pluginName: p.name,
            latestRelease: releases?.[0],
          };
        }),
        {
          size: 50,
          msg: `Getting latest releases of plugins`,
        },
      )
    )
      .filter(o => !!o.latestRelease)
      .reduce((p, c) => {
        p[c.pluginName] = c.latestRelease;
        return p;
      }, {});
    // const releases = await getReleases(pluginName);
    // if (!releases) return null;
    logger.verbose(`Succeeded to get Muse data muse.plugins.latest-releases.`);
    return latestReleases;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys...`);
    if (
      keys.some(k => {
        const arr = k.split('/').filter(Boolean);
        // exclude changes under releases
        return arr[0] === 'plugins' && arr[1] === 'releases' && arr[2];
      })
    ) {
      return 'muse.plugins.latest-releases';
    }
  },
};
