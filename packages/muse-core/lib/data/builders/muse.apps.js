const { getApps } = require('../../am');
const logger = require('../../logger').createLogger('muse.data.builder.muse-apps');

module.exports = {
  name: 'muse.apps',
  key: 'muse.apps',
  get: async () => {
    logger.verbose(`Getting muse.apps...`);
    const apps = await getApps();
    logger.verbose(`Succeeded to get muse.apps.`);
    return apps;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys...`);
    if (keys.some(k => k.startsWith('/apps/'))) {
      return 'muse.apps';
    }
  },
};
