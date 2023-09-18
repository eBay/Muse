const muse = require('@ebay/muse-core');
const utils = require('./utils');
/**
 * Get depeding shared modules of a plugin
 * @param {*} pluginName
 * @param {*} version
 * @param {*} mode
 * @returns
 */
async function getDeps(pluginName, version, mode = 'dist') {
  const pid = muse.utils.getPluginId(pluginName);
  // Allow deps-manifest not exist.
  const depsManifest =
    (await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/deps-manifest.json`))
      ?.content || {};
  const result = {};
  Object.entries(depsManifest).forEach(([libNameVersion, modules]) => {
    const { name, version } = utils.parseNameVersion(libNameVersion);

    result[libNameVersion] = {
      name,
      version,
      modules,
    };
  });
  return result;
}

module.exports = getDeps;
