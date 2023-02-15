const crypto = require('crypto');
const { getLoaders, loaderByName } = require('@craco/craco');
const { pkgJson, isDev, isTestBuild } = require('@ebay/muse-dev-utils').museContext;
const handleMuseLocalPlugins = require('./handleMuseLocalPlugins');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const _ = require('lodash');
const path = require('path');

const hashed = crypto
  .createHash('md5')
  .update(pkgJson.name)
  .digest('hex')
  .substring(0, 6);
let styleBase = parseInt(hashed, 16);

function configIstanbul(config) {
  const oneOfRules = _.find(config.module.rules, (r) => !!r.oneOf);
  const babelLoader = _.find(oneOfRules.oneOf, (item) => item?.loader?.includes('babel-loader'));
  babelLoader.options.plugins.push([
    require.resolve('babel-plugin-istanbul'),
    {
      cwd: path.join(process.cwd(), '..'),
      ...(pkgJson.nyc || {}),
    },
  ]);
}

module.exports = ({ webpackConfig }) => {
  // For development and build:test, need to set "babel-plugin-istanbul" webpack plugin to enable generate test report.
  if (isDev || isTestBuild) {
    configIstanbul(webpackConfig);
  }
  // For development, need to load all configured local plugin projects
  if (isDev) {
    handleMuseLocalPlugins(webpackConfig);
  }

  // Disable MiniCssExtractPlugin and use style-loader
  // This is only for production build
  // This setting is for production since only prod config has MiniCssExtractPlugin
  webpackConfig.module?.rules?.forEach((rule) => {
    rule?.oneOf?.forEach((item) => {
      if (item?.use?.some((u) => u?.loader?.includes('mini-css-extract-plugin'))) {
        item.use = item.use?.filter((u) => !u?.loader?.includes('mini-css-extract-plugin'));
        item.use.unshift({
          loader: 'style-loader',
          options: { base: styleBase++ },
        });
      }
    });
  });

  // This is for development (both dev build and local dev)
  // For dev time, also needs stylebase
  const { hasFoundAny, matches } = getLoaders(webpackConfig, loaderByName('style-loader'));

  if (hasFoundAny) {
    matches.forEach((match) => {
      if (typeof match.loader === 'string') {
        match.parent[match.index] = {
          loader: 'style-loader',
          options: { base: styleBase++ },
        };
      } else if (match.loader.options) {
        match.loader.options.base = styleBase++;
      }
    });
  }

  // Bundle analyzer for production build
  if (process.env.NODE_ENV === 'production' && !process.env.MUSE_TEST_BUILD) {
    webpackConfig.plugins.push(
      new BundleAnalyzerPlugin({
        analyzerMode: 'static',
        openAnalyzer: false,
      }),
    );
  }

  return webpackConfig;
};
