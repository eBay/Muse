const { parseNameVersion, getDepsManifest } = require('./utils');
/**
 * Get depeding shared modules of a plugin
 * @param {*} pluginName
 * @param {*} version
 * @param {*} mode
 * @returns
 */
async function getDeps(pluginName, version, mode = 'dist') {
  if (typeof pluginName === 'object') {
    ({ pluginName, version, mode = 'dist' } = pluginName);
  }
  // Allow deps-manifest not exist.
  const depsManifest = await getDepsManifest(pluginName, version, mode);
  const result = {};
  Object.entries(depsManifest).forEach(([libNameVersion, modules]) => {
    const { name, version } = parseNameVersion(libNameVersion);

    result[libNameVersion] = {
      name,
      version,
      modules,
    };
  });
  return result;
}

module.exports = getDeps;
