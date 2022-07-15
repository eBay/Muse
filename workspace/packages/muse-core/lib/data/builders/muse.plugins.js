const { getPlugins } = require('../../pm');
const logger = require('../../logger').createLogger('muse.data.builder.muse-plugins');

module.exports = {
  key: 'muse.plugins',
  get: async () => {
    logger.verbose(`Getting muse.plugins...`);
    const plugins = await getPlugins();

    logger.verbose(`Succeeded to get muse.plugins.`);
    return plugins;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys ...`);
    if (
      keys.some(k => {
        const arr = k.split('/').filter(Boolean);
        // exclude changes under releases
        return arr[0] === 'plugins' && arr[1] !== 'releases';
      })
    ) {
      return 'muse.plugins';
    }
  },
};
