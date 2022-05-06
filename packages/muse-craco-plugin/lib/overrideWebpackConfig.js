const crypto = require('crypto');
const { pkgJson, isDevBuild } = require('./museContext');
const handleMuseLocalPlugins = require('./handleMuseLocalPlugins');

const hashed = crypto.createHash('md5').update(pkgJson.name).digest('hex').substring(0, 6);
const styleBase = parseInt(hashed, 16);

module.exports = ({ webpackConfig, context: { env } }) => {
  const isDev = env === 'development';

  // For development, need to load all configured local plugin projects
  if (isDev && !isDevBuild) {
    handleMuseLocalPlugins(webpackConfig);
  }

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
  // process.exit();
  return webpackConfig;
};
