// Expose Muse APIs via express
const muse = require('@ebay/muse-core');
const analyzer = require('@ebay/muse-modules-analyzer');
const _ = require('lodash');

const multer = require('multer');

const logger = muse.logger.createLogger('@ebay/muse-express-middleware.api');

const upload = multer({ storage: multer.memoryStorage() });
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
  'am.setAppIcon',
  'am.updateApp',
  'am.updateEnv',
  'pm.buildPlugin',
  'pm.checkDependencies',
  'pm.checkReleaseVersion',
  'pm.createPlugin',
  'pm.installPlugin',
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
  'pm.updateDeployedPlugin',
  'pm.updateRelease',
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

// TODO: should we put analyzer in muse-core? or a seperate package?
muse.analyzer = analyzer;
exposedApis.push(
  'analyzer.validateApp',
  'analyzer.validatePlugin',
  'analyzer.validateDeployment',
  'analyzer.getLibDiff',
  'analyzer.getLibs',
  'analyzer.getDeps',
  'analyzer.getLibVersion',
  'analyzer.getDuplicatedLibs',
);
const fileFields = {
  'am.setAppIcon': { name: 'icon', maxCount: 1 },
};

module.exports = ({ basePath = '/api/v2' } = {}) => {
  // Allow a plugin to provide api from RESTful service
  const apis = _.flatten(muse.plugin.invoke('museMiddleware.api.getApis'));
  _.flatten(muse.plugin.invoke('museMiddleware.api.getFileFields')).forEach((obj) => {
    fileFields[obj.apiKey] = obj.fields;
  });
  exposedApis.push(...apis);
  muse.plugin.invoke('museMiddleware.api.processApis', apis);
  muse.plugin.invoke('museMiddleware.api.processFileFields', fileFields);

  return async (req, res, next) => {
    if (!req.path.startsWith(basePath)) {
      return next();
    }

    // e.g: /api/v2/create-app
    const apiPath = req.path.replace(basePath, '');

    // api key: am.createApp
    const apiKey = apiPath.split('/').filter(Boolean).join('.');

    // if api key ends with '.*', it means all sub paths are handled by the api
    // e.g: some.proxy.* will handle all paths by "/api/v2/some/proxy/**"
    const patternApis = exposedApis.filter((api) => api.endsWith('.*'));
    // Only find the first handler, if multiple handlers match the path, the first one will be used, others are ignored
    // e.g: path: /api/v2/some/proxy/a/b/c => apis: some.proxy.*
    // e.g: exposed api: some.proxy.*, will handle: some.proxy, some.proxy.a.b.c, etc
    const matchedPatternApi = patternApis.find(
      (api) => api.replace('.*', '') === apiKey || apiKey.startsWith(api.replace(/\*$/, '')),
    );

    // if it's a pattern, use it as middleware like api.
    if (matchedPatternApi) {
      _.invoke(muse, matchedPatternApi, req, res, next, { basePath, api: matchedPatternApi });
      return;
    }

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
      // If some property is a buffer, it can accept upload as buffer
      if (fileFields[apiKey]) {
        await new Promise((resolve, reject) => {
          upload.fields(_.castArray(fileFields[apiKey]))(req, res, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
        const params = {};
        Object.keys(req.body).forEach((k) => (params[k] = req.body[k]));
        _.keys(req.files).forEach((f) => {
          params[f] = req.files[f][0].buffer;
        });
        req.body.args = [params];
      }

      await muse.utils.asyncInvoke('museExpressMiddleware.api.before', {
        apiKey,
        basePath,
        req,
        res,
      });
      const isGet = req.query.useGetArgs || req.method.toLowerCase() === 'get';
      const args = isGet
        ? _.castArray(JSON.parse(decodeURIComponent(req.query.args || '[]')))
        : req.query.singleArg
        ? [req.body]
        : req.body.args || [];
      // All muse APIs have author property if the first argument is object
      if (_.isObject(args[0])) {
        args[0].__req = req;
        const author = req.muse?.username;
        const superMode = req.muse?.superMode;
        // for rest api, author is always got from user session
        // but if superMode, author could from request body
        if (!args[0].author || (!superMode && author)) args[0].author = author;
      }

      const result = await _.invoke(muse, apiKey, ...args);
      if (req.query.type === 'raw') {
        res.setHeader(
          'content-type',
          result.headers['content-type'] || result.headers['Content-Type'],
        );
        result.data.pipe(res);
      } else {
        const dataResult = { data: result };
        await muse.utils.asyncInvoke('museExpressMiddleware.api.after', {
          dataResult,
          apiKey,
          args,
          req,
          res,
          basePath,
        });
        res.end(JSON.stringify(dataResult));
        return;
      }
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
