const { museContext, utils } = require('muse-dev-utils');
const { MusePlugin, MuseReferencePlugin } = require('muse-webpack-plugin');
const setupHtmlWebpackPlugin = require('./setupHtmlWebpackPlugin');
const resolveCwd = require('resolve-cwd');
const { isDev, isDevBuild, museConfig } = museContext;

module.exports = async ({ cracoConfig }) => {
  utils.assertPath(cracoConfig, 'webpack.plugins.add', [], true);
  utils.assertPath(cracoConfig, 'webpack.plugins.remove', [], true);

  const museLibsInfo = [];

  if (museConfig.type !== 'boot') {
    // Creating lib reference manifest content
    let museLibs = utils.getMuseLibs();
    if (isDev) {
      // At dev time, should exclude local lib plugins
      const localPlugins = utils.getLocalPlugins();
      museLibs = museLibs.filter((libName) => !localPlugins.find((p) => p.name === libName));
    }

    if (museLibs.length > 0) {
      museLibs.forEach((lib) => {
        museLibsInfo.push({
          name: lib,
          version: require(resolveCwd(`${lib}/package.json`)).version,
        });
      });
    }

    cracoConfig.webpack.plugins.add.push([
      new MusePlugin({
        isDevBuild,
        museLibs: museLibsInfo,
        type: museConfig.type,
      }),
      'prepend',
    ]);

    if (museLibs.length > 0) {
      cracoConfig.webpack.plugins.add.push([
        new MuseReferencePlugin({
          isDevBuild,
          museLibs: museLibsInfo
        }),
        'prepend',
      ]);
    }
  }

  await setupHtmlWebpackPlugin(cracoConfig);

  // Muse doesn't support MiniCssExtractPlugin at this time.
  cracoConfig.webpack.plugins.remove.push('MiniCssExtractPlugin');

  // Output filename is fixed for Muse, should generate version folder by other approach.
  utils.assertPath(
    cracoConfig,
    'webpack.configure.output.filename',
    museConfig.type === 'boot' ? 'boot.js' : 'main.js',
  );
  utils.assertPath(cracoConfig, 'webpack.configure.output.publicPath', 'auto');

  return cracoConfig;
};
