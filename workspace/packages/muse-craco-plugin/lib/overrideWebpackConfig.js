const crypto = require('crypto');
const { getLoaders, loaderByName } = require('@craco/craco');
const { pkgJson, isDev, isTestBuild } = require('@ebay/muse-dev-utils').museContext;
const { utils } = require('@ebay/muse-dev-utils');

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

  // allow to import modules outside of src
  const foundIndex = webpackConfig.resolve.plugins
    .map((x) => x.constructor.name)
    .indexOf('ModuleScopePlugin');
  if (foundIndex >= 0) {
    webpackConfig.resolve.plugins.splice(foundIndex, 1);
  }

  if (isDev) {
    // handle linked lib plugins for alias:
    // linked plugins should be resolved from the linked path

    const linkedLibs = utils.getMuseLibs().filter((lib) => lib.isLinked);
    if (!webpackConfig.resolve.alias) webpackConfig.resolve.alias = {};
    Object.assign(
      webpackConfig.resolve.alias,
      linkedLibs.reduce((acc, lib) => {
        acc[lib.name] = lib.path;
        return acc;
      }, {}),
    );
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
    // Check if the file muse.d.ts exists
    const sourcePath = path.resolve(process.cwd(), 'src', 'muse.d.ts');
    if (fs.existsSync(sourcePath)) {
      console.log('Found muse.d.ts, generating type definition file.');
      webpackConfig.plugins.push(
        new DtsBundlePlugin({
          name: pkgJson.name,
          main: sourcePath,
          out: path.resolve(process.cwd(), process.env.BUILD_PATH, 'muse.d.ts'),
          outputAsModuleFolder: true,
        }),
      );
    }
  }

  // Push cjs to exclude list in file loader rule
  const fileLoaderRule = getFileLoaderRule(webpackConfig.module?.rules);
  if (fileLoaderRule) {
    fileLoaderRule.exclude.push(/\.cjs$/);
  }

  return webpackConfig;
};
