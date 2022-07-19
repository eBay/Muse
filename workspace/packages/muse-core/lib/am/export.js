const _ = require('lodash');
const schema = require('../schemas/am/export.json');
const { asyncInvoke, validate } = require('../utils');
const logger = require('../logger').createLogger('muse.am.export');
const path = require('path');
const muse = require('../../');
const fse = require('fs-extra');
const unzipper = require('unzipper');

/**
 * @description Export standalone muse application.
 * @param {object} params The arguments to export an app.
 * @param {string} params.appName The app name.
 * @param {string} params.envName The env name.
 * @param {string} params.output The output path. It could be a absolute path or relative path. If it's relative path, it will be put under current working directory.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  const { appName, envName, output } = params;
  logger.info(`Export app ${appName}...`);
  await asyncInvoke('museCore.am.beforeExport', ctx, params);

  const app = await muse.data.get(`muse.app.${appName}`);
  if (!app) {
    throw new Error(`App ${appName} not exists.`);
  }
  const env = app.envs?.[envName];
  if (!env) {
    throw new Error(`Env ${envName} not exists.`);
  }
  const plugins = env.plugins;
  const bootPlugin = plugins.find(p => p.type === 'boot');

  if (!bootPlugin) {
    throw new Error('No boot plugin found.');
  }
  const museGlobal = {
    appName: appName,
    envName: envName,
    plugins,
    isDev: false,
    cdn: '/muse-assets',
    bootPlugin: bootPlugin.name,
  };

  const exportIndexHtml = `
    <!doctype html>
    <html lang="en">
    <head>
      <title>${app.title || 'Muse App'}</title>
      <link rel="shortcut icon" href="/favicon.png" />
      <script>
        window.MUSE_GLOBAL = ${JSON.stringify(museGlobal, null, 2)};
      </script> 
    </head>
    <body></body>
    <script src="/muse-assets/p/${muse.utils.getPluginId(bootPlugin.name)}/v${
    bootPlugin.version
  }/dist/boot.js"></script>
    </html>
  `;

  const outputPath = path.isAbsolute(output) ? output : path.join(process.cwd(), `./${output}`);
  fse.ensureDirSync(outputPath);
  logger.info('Creating index.html');
  fse.writeFileSync(path.join(outputPath, 'index.html'), exportIndexHtml);

  await Promise.all(
    plugins.map(async plugin => {
      const pluginId = muse.utils.getPluginId(plugin.name);

      // Download zip file
      const assetsZipKey = `/p/${pluginId}/v${plugin.version}/assets.zip`;

      logger.info(`Downloading assets.zip... `);
      const buff = await muse.storage.assets.get(assetsZipKey);

      if (!buff) {
        throw new Error(`Asset ${assetsZipKey} download failed.`);
      }

      const zip = await unzipper.Open.buffer(buff);
      await zip.extract({
        path: `${outputPath}/muse-assets/p/${pluginId}/v${plugin.version}`,
      });
    }),
  );

  await asyncInvoke('museCore.am.afterExport', ctx, params);
};
