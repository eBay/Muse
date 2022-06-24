// Expose core APIs are RESTful APIs
const muse = require('muse-core');
const _ = require('lodash');
const logger = muse.logger.createLogger('muse-express-middleware.api');
const apis = {
  'am.getApp': 'get',
  post: [],
  put: [],
  delete: [],
};
module.exports = () => {
  return async (req, res) => {
    //
    const apiPath = req.path;
    const func = _.get(muse, apiPath);
    try {
      if ('get') {
      }

      if ('post') {
        await func({ ...req.body, author: 'nate' });
      }
    } catch (err) {}
  };
};
