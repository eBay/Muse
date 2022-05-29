const path = require('path');
const muse = require('muse-core');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const HtmlWebpackInjectStringPlugin = require('html-webpack-inject-string-plugin');
const { museContext, getDevMuseGlobal } = require('muse-dev-utils');
const { pkgJson, isDev, museConfig } = museContext;

module.exports = async (cracoConfig) => {
  // Remove old HtmlWebpackPlugin
  cracoConfig.webpack.plugins.remove.push('HtmlWebpackPlugin');
  if (!isDev) return;
  // Use index.html only when dev time
  // Add new HtmlWebpackPlugin to use custom template
  const museGlobal = await getDevMuseGlobal();
  // bootPlugin is only useful when it's not a boot plugin project
  const bootPlugin = museGlobal.plugins.find((p) => p.type === 'boot');
  const bootUrl =
    bootPlugin.url || `/_muse_static/p/${muse.utils.getPluginId(bootPlugin.name)}/v${bootPlugin.version}/dist/boot.js`;
  cracoConfig.webpack.plugins.add.push(
    ...[
      [
        new HtmlWebpackPlugin({
          excludeChunks: ['main'],
          inject: 'body',
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
          inject: `<script src="${bootUrl}"></script>`,
          prepend: false,
          newline: true,
        }),
      ],
    ].filter(Boolean),
  );
};
