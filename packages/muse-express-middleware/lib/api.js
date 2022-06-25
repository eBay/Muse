// Expose core APIs are RESTful APIs
const muse = require('muse-core');
const _ = require('lodash');
const logger = muse.logger.createLogger('muse-express-middleware.api');

module.exports = ({ basePath = '/api/v2' }) => {
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
      .map((s) => _.camelCase(s))
      .join('.');

    if (!_.get(muse, apiKey)) {
      return next();
    }

    // Only get apis need define args in query
    res.setHeader('Content-Type', 'application/json');
    if (!['get', 'post'].includes(req.method.toLowerCase())) {
      const errMsg = `Method '${req.method}' is not allowed.`;
      logger.error(errMsg);
      res.write(JSON.stringify({ error: errMsg }));
      res.statusCode = 405;
      res.end();
      return;
    }
    try {
      await muse.utils.asyncInvoke('museExpressMiddleware.api.before', {
        apiKey,
        basePath,
        req,
        res,
      });
      const isGet = req.method.toLowerCase();
      const args = isGet ? _.castArray(JSON.parse(decodeURIComponent(req.query.args))) : [req.body];
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
