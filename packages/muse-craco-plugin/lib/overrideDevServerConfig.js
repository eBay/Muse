const museDevMiddleware = require('./museDevMiddleware');
module.exports = ({ devServerConfig, cracoConfig, pluginOptions, context: { env, paths, proxy, allowedHost } }) => {
  const oldSetup = devServerConfig.setupMiddlewares || devServerConfig.onBeforeSetupMiddleware || (() => null);
  if (devServerConfig.setupMiddlewares) {
    devServerConfig.setupMiddlewares = (m, devServer) => {
      // webpack-dev-server v4.7.0+
      // seems can't be used together with onBeforeSetupMiddleware
      oldSetup(m, devServer);
      devServer.app.use('/_muse_api/*', museDevMiddleware);
    };
  } else {
    devServerConfig.onBeforeSetupMiddleware = (devServer) => {
      oldSetup(devServer);
      devServer.app.use('/_muse_api/*', museDevMiddleware);
    };
  }
  return devServerConfig;
};
