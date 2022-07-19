// Expose Muse APIs via express
const muse = require('@ebay/muse-core');
const _ = require('lodash');
const logger = muse.logger.createLogger('@ebay/muse-express-middleware.api');

// All exposed APIs are predefined and they are able to convert to API path from museCore
const exposedApis = [
  'am.createApp',
  'am.createEnv',
  'am.deleteApp',
  'am.deleteEnv',
  'am.deleteVariable',
  'am.export',
  'am.getApp',
  'am.getApps',
  'am.setVariable',
  'am.updateApp',
  'am.updateEnv',
  'pm.buildPlugin',
  'pm.checkDependencies',
  'pm.checkReleaseVersion',
  'pm.createPlugin',
  'pm.deletePlugin',
  'pm.deleteRelease',
  'pm.deleteVariable',
  'pm.deployPlugin',
  'pm.getDeployedPlugin',
  'pm.getDeployedPlugins',
  'pm.getPlugin',
  'pm.getPlugins',
  'pm.getReleaseAssets',
  'pm.getReleases',
  'pm.releasePlugin',
  'pm.setVariable',
  'pm.undeployPlugin',
  'pm.unregisterRelease',
  'pm.updatePlugin',
  'data.get',
  'data.setCache',
  'data.handleDataChange',
  'data.refreshCache',
  'data.syncCache',
  'req.completeRequest',
  'req.createRequest',
  'req.deleteRequest',
  'req.deleteStatus',
  'req.getRequest',
  'req.getRequests',
  'req.updateRequest',
  'req.updateStatus',
];

module.exports = ({ basePath = '/api/v2' } = {}) => {
  // Allow a plugin to provide api from RESTful service
  const apis = _.flatten(muse.plugin.invoke('museMiddleware.api.getApis'));
  exposedApis.push(...apis);
  muse.plugin.invoke('museMiddleware.api.processApis');

  return async (req, res, next) => {
    if (!req.path.startsWith(basePath)) {
      return next();
    }

    // e.g: /api/v2/create-app
    const apiPath = req.path.replace(basePath, '');

    // api key: am.createApp
    const apiKey = apiPath
      .split('/')
      .filter(Boolean)
      .map(s => _.camelCase(s))
      .join('.');

    // If not a defined api or it doesn't exist, then just say 404
    if (!exposedApis.includes(apiKey) || !_.get(muse, apiKey)) {
      res.statusCode = 404;
      res.write('API not exist.');
      res.end();
      return;
    }

    // Only get apis need define args in query
    res.setHeader('Content-Type', 'application/json');
    // All apis allow either get or post method
    if (!['get', 'post'].includes(req.method.toLowerCase())) {
      const errMsg = `Method '${req.method}' is not allowed.`;
      logger.error(errMsg);
      res.write(JSON.stringify({ error: errMsg }));
      res.statusCode = 405;
      res.end();
      return;
    }
    try {
      if (!req.body) {
        throw new Error('No request.body found, did you config the express.json() middleware?');
      }
      await muse.utils.asyncInvoke('museExpressMiddleware.api.before', {
        apiKey,
        basePath,
        req,
        res,
      });
      const isGet = req.method.toLowerCase() === 'get';
      const args = isGet
        ? _.castArray(JSON.parse(decodeURIComponent(req.query.args || '[]')))
        : req.body.args;
      // TODO: inject author info
      const result = { data: await _.invoke(muse, apiKey, ...args) };
      await muse.utils.asyncInvoke('museExpressMiddleware.api.after', {
        result,
        apiKey,
        args,
        req,
        res,
        basePath,
      });
      res.send(JSON.stringify(result));
      return;
    } catch (err) {
      const errorResult = { error: err.message, stack: err.stack || null };
      await muse.utils.asyncInvoke('museExpressMiddleware.api.failed', {
        err,
        errorResult,
        apiKey,
        basePath,
        req,
        res,
      });
      const errMsg = JSON.stringify(errorResult);
      logger.error(errMsg);
      res.statusCode = err.statusCode || 500;
      res.write(errMsg);
      res.end();
    }
  };
};
