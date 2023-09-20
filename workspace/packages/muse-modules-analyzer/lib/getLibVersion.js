const getLibs = require('./getLibs');

/**
 * Get version(s) of a pakcage in a lib plugins shared modules.
 *
 * @param {*} pluginName
 * @param {*} version
 * @param {*} pkgName
 * @param {*} mode
 * @returns
 */
async function getLibVersion(pluginName, version, pkgName, mode = 'dist') {
  if (typeof pluginName === 'object') {
    ({ pluginName, version, pkgName, mode = 'dist' } = pluginName);
  }
  const libs = await getLibs(pluginName, version, mode);
  return libs.packages[pkgName].version;
}

module.exports = getLibVersion;
