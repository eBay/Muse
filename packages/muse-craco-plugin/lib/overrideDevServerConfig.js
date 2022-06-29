const { setupMuseDevServer } = require('@ebay/muse-dev-utils');

module.exports = ({
  devServerConfig,
  cracoConfig,
  pluginOptions,
  context: { env, paths, proxy, allowedHost },
}) => {
  const oldSetup =
    devServerConfig.setupMiddlewares || devServerConfig.onBeforeSetupMiddleware || (() => null);

  if (devServerConfig.setupMiddlewares) {
    devServerConfig.setupMiddlewares = (middlewares, devServer) => {
      // webpack-dev-server v4.7.0+
      // seems can't be used together with onBeforeSetupMiddleware
      oldSetup(middlewares, devServer);
      setupMuseDevServer(devServer);
      // devServer.app.use(webpackDevMiddleware);
    };
  } else {
    devServerConfig.onBeforeSetupMiddleware = (devServer) => {
      oldSetup(devServer);
      setupMuseDevServer(devServer);
      // devServer.app.use(webpackDevMiddleware);
    };
  }
  return devServerConfig;
};
