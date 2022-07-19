const { setupMuseDevServer } = require('@ebay/muse-dev-utils');

module.exports = ({ devServerConfig }) => {
  const oldSetup = devServerConfig.setupMiddlewares || (s => s);

  devServerConfig.setupMiddlewares = (middlewares, devServer) => {
    // webpack-dev-server v4.7.0+
    middlewares = oldSetup(middlewares, devServer);
    setupMuseDevServer(middlewares, devServer);
    return middlewares;
  };
  return devServerConfig;
};
