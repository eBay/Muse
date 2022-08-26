const { getRequests } = require('../../req');
const logger = require('../../logger').createLogger('muse.data.builder.muse-requests');

module.exports = {
  key: 'muse.requests',
  get: async () => {
    logger.verbose(`Getting muse.requests...`);
    const requests = await getRequests();

    logger.verbose(`Succeeded to get muse.requests.`);
    return requests;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys...`);
    if (keys.some(k => k.startsWith('/requests/'))) {
      return 'muse.requests';
    }
  },
};