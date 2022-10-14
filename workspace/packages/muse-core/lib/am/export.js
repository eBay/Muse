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
 * @param {string} params.museGlobalProps Allows to override the MUSE_GLOBAL object.
 */
module.exports = async (params = {}) => {
  validate(schema, params);
  const ctx = {};
  const { appName, envName, output, museGlobalProps } = params;
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
  // const museGlobal = {
  //   appName: appName,
  //   envName: envName,
  //   plugins,
  //   isDev: false,
  //   cdn: '/muse-assets',
  //   bootPlugin: bootPlugin.name,
  // };

  const appConfig = _.omit(app, ['envs']);

  const museGlobal = {
    app: appConfig,
    env: _.omit(env, ['plugins']),
    appName: appName,
    envName: envName,
    plugins,
    isDev: false,
    cdn: '/muse-assets',
    bootPlugin: bootPlugin.name,
    // If app disabled service worker, or it's not confiugred for the app
    serviceWorker: '/muse-sw.js',
  };

  Object.entries(museGlobalProps).forEach(([key, value]) => {
    _.set(museGlobal, key, value);
  });

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
  fse.emptyDirSync(outputPath);
  logger.info('Creating index.html');
  fse.writeFileSync(path.join(outputPath, 'index.html'), exportIndexHtml);
  fse.copySync(path.join(__dirname, 'sw.js'), path.join(outputPath, 'muse-sw.js'));

  await Promise.all(
    plugins.map(async plugin => {
      const pluginId = muse.utils.getPluginId(plugin.name);

      // Download zip file
      const assetsZipKey = `/p/${pluginId}/v${plugin.version}/assets.zip`;

      logger.info(`Exporting plugin ${plugin.name}@${plugin.version}... `);
      const buff = await muse.storage.assets.get(assetsZipKey);

      if (!buff) {
        throw new Error(`Failed to download plugin ${plugin.name} assets...`);
      }

      const zip = await unzipper.Open.buffer(buff);
      await zip.extract({
        path: `${outputPath}/muse-assets/p/${pluginId}/v${plugin.version}`,
      });
    }),
  );

  await asyncInvoke('museCore.am.afterExport', ctx, params);
  logger.info(`Succeeded to export app ${appName}/${envName}.`);
};
