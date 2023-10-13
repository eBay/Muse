const _ = require('lodash');
const getRequest = require('../../req/getRequest');
const logger = require('../../logger').createLogger('muse.data.builder.muse-request');

module.exports = {
  match: (key) => {
    const arr = key.split('.');
    return arr.length === 3 && arr[0] === 'muse' && arr[1] === 'request';
  },
  get: async (key) => {
    const requestId = key.split('.')[2];
    logger.verbose(`Getting muse.request.${requestId}...`);
    const request = await getRequest(requestId);
    if (!request) return null; // throw new Error(`plugin ${pluginName} doesn't exist.`);
    logger.verbose(`Succeeded to get muse.request.${requestId}.`);
    return request;
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    logger.verbose(`Getting Muse data keys...`);
    return _.chain(keys)
      .map((key) => {
        const arr = key.split('/').filter(Boolean);
        if (arr[0] === 'requests' && arr[1] && arr[1].endsWith('.yaml')) {
          return `muse.request.${arr[1].replace('.yaml', '')}`;
        }
        return null;
      })
      .filter(Boolean)
      .flatten()
      .uniq()
      .value();
  },
};
