const crypto = require('crypto');
const { getLoaders, loaderByName } = require('@craco/craco');
const { pkgJson, isDev, isTestBuild } = require('@ebay/muse-dev-utils').museContext;
const handleMuseLocalPlugins = require('./handleMuseLocalPlugins');
const _ = require('lodash');
const path = require('path');
const fs = require('fs');
const DtsBundlePlugin = require('dts-bundle-webpack');

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

function getFileLoaderRule(rules) {
  if (!rules) {
    return null;
  }
  for (const rule of rules) {
    if ('oneOf' in rule) {
      const found = getFileLoaderRule(rule.oneOf);
      if (found) {
        return found;
      }
    } else if (rule.test === undefined && rule.type === 'asset/resource') {
      return rule;
    }
  }
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

  if (!isDev) {
    // Check if the file ext-points.d.ts exists
    const sourcePath = path.resolve(process.cwd(), 'src', 'ext-points.d.ts');
    if (fs.existsSync(sourcePath)) {
      webpackConfig.plugins.push(
        new DtsBundlePlugin({
          name: pkgJson.name,
          main: sourcePath,
          out: path.resolve(process.cwd(), process.env.BUILD_PATH, 'ext-points.d.ts'),
          outputAsModuleFolder: true,
        }),
      );
    } else {
      console.info('\nNo ext-points.d.ts found in src.\n');
    }
  }

  // Push cjs to exclude list in file loader rule
  const fileLoaderRule = getFileLoaderRule(webpackConfig.module?.rules);
  if (fileLoaderRule) {
    fileLoaderRule.exclude.push(/\.cjs$/);
  }

  return webpackConfig;
};
