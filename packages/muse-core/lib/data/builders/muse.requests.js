const { getRequests } = require('../../pm');
const logger = require('../../logger').createLogger('muse.data.builder.muse-requests');

module.exports = {
  name: 'muse.requests',
  key: 'muse.requests',
  get: async () => {
    logger.verbose(`Getting muse.data.requests...`);
    const requests = await getRequests();
    logger.verbose(`Succeeded to get muse.data.requests.`);
    return requests;
  },
};
