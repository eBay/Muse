const path = require('path');
const { museContext, utils } = require('muse-dev-utils');
const { MusePlugin, MuseReferencePlugin } = require('muse-webpack-plugin');
const setupHtmlWebpackPlugin = require('./setupHtmlWebpackPlugin');

const { isDev, isDevBuild, pkgJson, museConfig } = museContext;

module.exports = ({ cracoConfig }) => {
  if (!cracoConfig.webpack) cracoConfig.webpack = {};
  if (!cracoConfig.webpack.plugins) cracoConfig.webpack.plugins = {};
  if (!cracoConfig.webpack.plugins.add) cracoConfig.webpack.plugins.add = [];
  if (!cracoConfig.webpack.plugins.remove) cracoConfig.webpack.plugins.remove = [];

  cracoConfig.webpack.plugins.add.push([
    new MusePlugin({
      // NOTE: build folder is hard coded for simplicity
      // lib- manifest.json is only useful for dev/prod build, not for development
      // TODO, only for lib plugins, need to generate manifest
      path: path.join(process.cwd(), `build/${isDevBuild ? 'dev' : 'dist'}/lib-manifest.json`),
      type: museConfig.type,
    }),
    'prepend',
  ]);

  // Creating lib reference manifest content
  let museLibs = utils.getMuseLibs();
  if (isDev) {
    // At dev time, should exclude local lib plugins
    const localPlugins = utils.getLocalPlugins();
    museLibs = museLibs.filter((libName) => !localPlugins.find((p) => p.name === libName));
  }
  if (museLibs.length > 0) {
    const libManifestContent = {};
    museLibs.forEach((lib) => {
      // NOTE: build folder is hard coded for simplicity
      Object.assign(
        libManifestContent,
        require(`${lib}/build/${isDevBuild ? 'dev' : 'dist'}/lib-manifest.json`).content,
      );
    });

    const libsManifest = {
      content: libManifestContent,
      name: 'muse-shared-modules',
    };

    if (Object.keys(libManifestContent).length > 0) {
      cracoConfig.webpack.plugins.add.push([
        new MuseReferencePlugin({
          manifest: libsManifest,
        }),
        'prepend',
      ]);
    }
  }

  setupHtmlWebpackPlugin(cracoConfig);

  // Muse doesn't support MiniCssExtractPlugin at this time.
  cracoConfig.webpack.plugins.remove.push('MiniCssExtractPlugin');

  // Output filename is fixed for Muse, should generate version folder by other approach.
  utils.assertPath(cracoConfig, 'webpack.config.output.filename', 'main.js');
  utils.assertPath(cracoConfig, 'webpack.config.output.publicPath', 'auto');

  return cracoConfig;
};
