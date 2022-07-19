const _ = require('lodash');
const { getReleases } = require('../../pm');
const { getPluginName } = require('../../utils');
const logger = require('../../logger').createLogger('muse.data.builder.muse.plugin-releases');

module.exports = {
  match: key => {
    const arr = key.split('.');
    return arr.length === 3 && arr[0] === 'muse' && arr[1] === 'plugin-releases';
  },
  get: async key => {
    const pluginName = key.split('.')[2];
    logger.verbose(`Getting muse data muse.plugin-releases.${pluginName}...`);
    const releases = await getReleases(pluginName);
    if (!releases) return null;
    logger.verbose(`Succeeded to get muse.plugin-releases.${pluginName}.`);
    return releases;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys...`);
    return _.chain(keys)
      .map(key => {
        const arr = key.split('/').filter(Boolean);
        if (arr[0] === 'plugins' && arr[1] === 'releases' && arr[2]?.endsWith('.yaml')) {
          return `muse.plugin-releases.${getPluginName(arr[2].replace('.yaml', ''))}`;
        }
      })
      .filter(Boolean)
      .flatten()
      .uniq()
      .value();
  },
};
