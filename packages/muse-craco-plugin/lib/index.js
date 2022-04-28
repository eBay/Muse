const path = require('path');
const crypto = require('crypto');
const { MusePlugin, MuseReferencePlugin } = require('muse-webpack-plugin');
const pkgJson = require(path.join(process.cwd(), './package.json'));
const hashed = crypto.createHash('md5').update(pkgJson.name).digest('hex').substring(0, 6);
const styleBase = parseInt(hashed, 16);
const isMuseLib = pkgJson?.muse?.type === 'lib'; //process.env.MUSE_LIB === 'true';

const needInstrument = process.env.MUSE_BUILD_INSTRUMENTED === 'true';

// Find all muse libs dependencies
const getMuseLibs = () => {
  return Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
    ...pkgJson.peerDependencies,
  }).filter((dep) => {
    const depPkgJson = require(`${dep}/package.json`);
    return depPkgJson?.muse?.type === 'lib';
  });
};

const overrideCracoConfig = ({ cracoConfig, context: { env } }) => {
  if (!cracoConfig.webpack) cracoConfig.webpack = {};
  if (!cracoConfig.webpack.plugins) cracoConfig.webpack.plugins = {};
  if (!cracoConfig.webpack.plugins.add) cracoConfig.webpack.plugins.add = [];
  if (!cracoConfig.webpack.plugins.remove) cracoConfig.webpack.plugins.remove = [];

  const isProd = env === 'production';

  const cracoAdd = cracoConfig.webpack.plugins.add;

  // Build lib bundle for lib plugins
  if (isProd && isMuseLib) {
    cracoAdd.push([
      new MusePlugin({
        // NOTE: build folder is hard coded for simplicity
        path: path.join(process.cwd(), 'build/lib/lib-manifest.json'),
      }),
      'prepend',
    ]);
  }

  // Creating lib reference manifest content
  const museLibs = getMuseLibs();
  if (museLibs.length > 0) {
    const libManifestContent = {};
    museLibs.forEach((lib) => {
      // NOTE: build folder is hard coded for simplicity
      Object.assign(libManifestContent, require(`${lib}/build/lib/lib-manifest.json`).content);
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

  // Output is fixed for Muse, should generate version folder by other approach.

  cracoConfig.webpack.configure = {
    output: {
      filename: isMuseLib ? 'main.lib.js' : 'main.js',
      publicPath: 'auto',
    },
    optimization: { minimize: false },
  };

  return cracoConfig;
};
const overrideWebpackConfig = ({ webpackConfig }) => {
  // Disable MiniCssExtractPlugin and use style-loader
  // This is only for production build
  webpackConfig.module?.rules?.forEach((rule) => {
    rule?.oneOf?.forEach((item) => {
      if (item?.use?.some((u) => u?.loader?.includes('mini-css-extract-plugin'))) {
        item.use = item.use?.filter((u) => !u?.loader?.includes('mini-css-extract-plugin'));
        item.use.unshift({
          loader: require.resolve('style-loader'),
          options: { base: styleBase },
        });
      }
    });
  });
  return webpackConfig;
};

module.exports = { overrideCracoConfig, overrideWebpackConfig };
