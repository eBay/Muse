const express = require('express');
const path = require('path');
const museAssetsMiddleware = require('muse-express-middleware/lib/assetsMiddleware');
const { getMuseLibs } = require('./utils');
const muse = require('muse-core');

module.exports = (devServer) => {
  // serve local muse libs resources
  getMuseLibs().forEach((libName) => {
    const id = muse.utils.getPluginId(libName);
    const pkgJsonPath = require.resolve(libName + '/package.json');
    const pkgDir = pkgJsonPath.replace(/\/package\.json$/, '');
    devServer.app.use(`/_muse_static/local/p/${id}`, express.static(path.join(pkgDir, 'build')));
  });
  devServer.app.use(museAssetsMiddleware({ basePath: '/_muse_static' }));
};
