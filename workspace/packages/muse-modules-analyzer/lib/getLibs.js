const muse = require('@ebay/muse-core');
const { parseMuseId } = require('@ebay/muse-modules');
const utils = require('./utils');

/**
 * Get detailed shared modules from a lib plugin
 * @param {*} pluginName
 * @param {*} version
 * @param {*} mode
 * @returns
 */
async function getLibs(pluginName, version, mode = 'dist') {
  // This api caches result itself (when assetsCache is true).
  const libManifest = await utils.getLibManifest(pluginName, version, mode);

  // Generate structure like this:
  // {
  //   packages: {
  //     '@ebay/muse-lib-react': {
  //       version: ['1.2.13'],
  //       modules: ['/src/Root.js', '/src/styles/index.less', ...],
  //     },
  //     ...
  //   },
  const packages = {};
  Object.keys(libManifest).forEach((key) => {
    const { name, version } = parseMuseId(key);
    if (!packages[name]) packages[name] = { version: [], modules: [] };
    const pkg = packages[name];
    const v = version.join('.');
    if (!pkg.version.includes(v)) pkg.version.push(v);
    pkg.modules.push(key.replace(name + '@' + v, ''));
  });
  return {
    pluginName: pluginName,
    packages,
    byId: libManifest,
  };
}

module.exports = getLibs;
