const _ = require('lodash');
const { getPlugin } = require('../../pm');
const { getPluginName } = require('../../utils');

const logger = require('../../logger').createLogger('muse.data.builder.muse-plugin');

module.exports = {
  match: key => {
    const arr = key.split('.');
    return arr.length === 3 && arr[0] === 'muse' && arr[1] === 'plugin';
  },
  get: async key => {
    const pluginName = key.split('.')[2];
    logger.verbose(`Getting muse.data.${pluginName}...`);
    const plugin = await getPlugin(pluginName);
    if (!plugin) return null; // throw new Error(`plugin ${pluginName} doesn't exist.`);
    logger.verbose(`Succeeded to get muse.data.${pluginName}.`);
    return plugin;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys ...`);
    return _.chain(keys)
      .map(key => {
        const arr = key.split('/').filter(Boolean);
        if (arr[0] === 'plugins' && arr[1] && arr[1].endsWith('.yaml')) {
          return `muse.plugin.${getPluginName(arr[1].replace('.yaml', ''))}`;
        }
        return null;
      })
      .filter(Boolean)
      .flatten()
      .uniq()
      .value();
  },
};
