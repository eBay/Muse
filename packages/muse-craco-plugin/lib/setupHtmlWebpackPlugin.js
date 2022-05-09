const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectStringPlugin = require('html-webpack-inject-string-plugin');
const { museContext, getDevMuseGlobal, utils } = require('muse-dev-utils');

const { pkgJson, isDev } = museContext;

module.exports = async (cracoConfig) => {
  // Remove old HtmlWebpackPlugin
  cracoConfig.webpack.plugins.remove.push('HtmlWebpackPlugin');

  if (!isDev) return;
  // Use index.html only when dev time
  // Add new HtmlWebpackPlugin to use custom template
  // const devApp = await getDevApp();
  // const bootPlugin = devApp.pluginList.find((p) => p.type === 'boot');
  const bootPlugin = {
    name: '@ebay/muse-boot',
    version: '1.0.0',
  };

  const museGlobal = await getDevMuseGlobal();
  cracoConfig.webpack.plugins.add.push(
    [
      new HtmlWebpackPlugin({
        excludeChunks: ['main'],
        inject: true,
        template: path.join(__dirname, './index.html'),
        title: pkgJson.name,
      }),
      'prepend',
    ],
    [
      new HtmlWebpackInjectStringPlugin({
        search: '</head>',
        inject: `<script>window.MUSE_GLOBAL=${JSON.stringify(museGlobal, null, 2)};</script>`,
        prepend: true,
        newline: true,
      }),
    ],
    [
      new HtmlWebpackInjectStringPlugin({
        search: '</body>',
        inject: `<script src="/_muse_static/p/${utils.getPluginId(bootPlugin.name)}/v${
          bootPlugin.version
        }/dist/boot.js"></script>`,
        prepend: false,
        newline: true,
      }),
    ],
  );
};
