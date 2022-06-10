const crypto = require('crypto');
const { getLoaders, loaderByName } = require('@craco/craco');
const { pkgJson, isDev } = require('muse-dev-utils').museContext;
const handleMuseLocalPlugins = require('./handleMuseLocalPlugins');

const hashed = crypto.createHash('md5').update(pkgJson.name).digest('hex').substring(0, 6);
let styleBase = parseInt(hashed, 16);

module.exports = ({ webpackConfig }) => {
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
          loader: require.resolve('style-loader'),
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
          loader: require.resolve('style-loader'),
          options: { base: styleBase++ },
        };
      } else if (match.loader.options) {
        match.loader.options.base = styleBase++;
      }
    });
  }
  return webpackConfig;
};
