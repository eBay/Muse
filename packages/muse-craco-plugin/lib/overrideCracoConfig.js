const { museContext, utils } = require('@ebay/muse-dev-utils');
const { MusePlugin, MuseReferencePlugin } = require('@ebay/muse-webpack-plugin');
const setupHtmlWebpackPlugin = require('./setupHtmlWebpackPlugin');
const { isDev, isDevBuild, museConfig } = museContext;

/**
 * Main Craco Configuration plugin.
 *
 * For non-boot plugins, it adds two webpack plugins:
 *  - MusePlugin : main webpack plugin for compiling the current muse plugin being built from CLI (as a Dll bundle)
 *  - MuseReferencePlugin : webpack plugin for building dependency manifests
 *
 * @param {cracoConfig} original craco configuration
 * @returns modified craco onfiguration
 */
module.exports = async ({ cracoConfig }) => {
  utils.assertPath(cracoConfig, 'webpack.plugins.add', [], true);
  utils.assertPath(cracoConfig, 'webpack.plugins.remove', [], true);

  if (museConfig.type !== 'boot') {
    // for non-boot plugins, we gather a list of muse library plugins to be used by the MuseReferencePlugin
    let museLibs = utils.getMuseLibs();
    if (isDev) {
      // At dev time, should exclude local lib plugins
      const localPlugins = utils.getLocalPlugins();
      museLibs = museLibs.filter((libName) => !localPlugins.find((p) => p.name === libName));
    }

    // main webpack plugin for compiling the current muse plugin called from CLI (as a Dll bundle)
    cracoConfig.webpack.plugins.add.push([
      new MusePlugin({
        isDevBuild,
        type: museConfig.type,
      }),
      'prepend',
    ]);

    if (museLibs.length > 0) {
      // if this muse plugin is using library plugins, we use the MuseReferencePlugin for building dependency manifest files:
      // lib-manifest.json  : shows which dependencies a library plugin exposes (if the plugin being built is a library plugin)
      // deps-manifest.json : shows which delegated dependencies are coming from which library plugins.
      cracoConfig.webpack.plugins.add.push([
        new MuseReferencePlugin({
          isDevBuild,
          museLibs,
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
