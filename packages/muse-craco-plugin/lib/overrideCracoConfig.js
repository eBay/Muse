const path = require('path');
const { museContext, utils } = require('muse-dev-utils');
const { MusePlugin, MuseReferencePlugin } = require('muse-webpack-plugin');

const { isDevBuild, museConfig } = museContext;
module.exports = ({ cracoConfig, context: { env } }) => {
  if (!cracoConfig.webpack) cracoConfig.webpack = {};
  if (!cracoConfig.webpack.plugins) cracoConfig.webpack.plugins = {};
  if (!cracoConfig.webpack.plugins.add) cracoConfig.webpack.plugins.add = [];
  if (!cracoConfig.webpack.plugins.remove) cracoConfig.webpack.plugins.remove = [];

  const isDev = env === 'development';

  const cracoAdd = cracoConfig.webpack.plugins.add;

  cracoAdd.push([
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
  if (isDev && !isDevBuild) {
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
      cracoAdd.push([
        new MuseReferencePlugin({
          manifest: libsManifest,
        }),
        'prepend',
      ]);
    }
  }

  // Muse doesn't support MiniCssExtractPlugin at this time.
  cracoConfig.webpack.plugins.remove.push('MiniCssExtractPlugin');

  // TODO: do not override all configure object to allow config from plugins
  // Output is fixed for Muse, should generate version folder by other approach.
  cracoConfig.webpack.configure = {
    output: {
      filename: 'main.js',
      publicPath: 'auto',
    },
  };

  return cracoConfig;
};
