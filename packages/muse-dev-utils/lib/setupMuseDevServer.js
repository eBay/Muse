const express = require('express');
const path = require('path');
const webpackDevMiddleware = require('./webpackDevMiddleware');
const { getMuseLibs, getPluginId } = require('./utils');

module.exports = (devServer) => {
  getMuseLibs().forEach((libName) => {
    const id = getPluginId(libName);
    const pkgJsonPath = require.resolve(libName + '/package.json');
    const pkgDir = pkgJsonPath.replace(/\/package\.json$/, '');
    devServer.app.use(`/_muse_static/local/p/${id}`, express.static(path.join(pkgDir, 'build')));
  });
  devServer.app.use(webpackDevMiddleware);
};
