const path = require('path');
const { getLoader, loaderByName } = require('@craco/craco');

/**
 * Allow webpack to support multiple local muse plugin projects.
 * So that it's possible to develop multiple projects together.
 *   1. Allow to find modules from plugin project's node_modules dir
 *   2. Allow to resolve muse lib package from any plugin project, for example @ebay/muse-lib-react
 *   3. Tell babel to compile all project's source code
 * @param {*} webpackConfig
 * @returns
 */
function handleMuseLocalPlugins(webpackConfig) {
  // Read local plugins from env variable
  const localPlugins = (process.env.MUSE_LOCAL_PLUGINS || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);
  const babelInclude = [];
  const localPluginNames = [];

  if (!Array.isArray(webpackConfig.entry)) webpackConfig.entry = [webpackConfig.entry];

  localPlugins
    .map((p) => (path.isAbsolute(p) ? p : path.join(process.cwd(), p)))
    .forEach((p) => {
      // forced to src folder
      babelInclude.push(path.join(p, 'src'));
      const localPluginPkgJson = require(path.join(p, 'package.json'));
      const museConfig = localPluginPkgJson.muse || {};
      localPluginNames.push(localPluginPkgJson.name);
      // Add app entry
      webpackConfig.entry.unshift(path.join(p, 'src/index.js'));

      if (museConfig.type === 'lib') {
        // For lib projects, define the package alias
        // So that the modules in lib plugin could be resolved correctly
        webpackConfig.resolve.alias[localPluginPkgJson.name] = p;
      }
      // Ensure one instance for one package, for example: js-plugin, antd-form-builder
      webpackConfig.resolve.modules[0] = path.join(process.cwd(), 'node_modules');
      webpackConfig.resolve.modules.splice(1, 0, path.join(p, 'node_modules'));
    });

  // Tell babel to compile all source code of local plugin projects
  babelInclude.push(path.join(process.cwd(), 'src'));
  const { isFound, match } = getLoader(webpackConfig, loaderByName('babel-loader'));
  if (isFound) {
    match.loader.include = babelInclude;
  } else {
    throw new Error('Muse Error: babel-loader not found in webpack config.');
  }

  // Remove ModuleScopePlugin to support multiple src folders
  // TODO: maybe keep it by the similar mechanism expandPluginsScope at:
  // https://github.com/oklas/react-app-alias/blob/80c8a062b37df8411bc148dd42f485d014e96d3f/packages/react-app-alias/src/index.js#L26
  const foundIndex = webpackConfig.resolve.plugins
    .map((x) => x.constructor.name)
    .indexOf('ModuleScopePlugin');
  if (foundIndex >= 0) {
    webpackConfig.resolve.plugins.splice(foundIndex, 1);
  }

  return localPluginNames;
}
module.exports = handleMuseLocalPlugins;
