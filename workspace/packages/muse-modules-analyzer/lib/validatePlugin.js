const _ = require('lodash');
const utils = require('./utils');
const getDeps = require('./getDeps');
const getLibs = require('./getLibs');

/**
 * Validate if all depending shared libs are included in the depending plugin, with the accurate version
 * This is usually used to validate the build tool is working correctly.
 * @param {*} pluginName
 * @param {*} version
 * @param {*} mode
 * @returns
 */
async function validatePlugin(pluginName, version, mode) {
  const modes = mode ? [mode] : ['dist', 'dev'];

  const result = {
    missingModules: [],
  };
  for (const mode of modes) {
    const deps = await getDeps(pluginName, version, mode);

    if (_.isEmpty(deps)) continue;
    await Promise.all(
      Object.keys(deps).map(async (libNameVersion) => {
        const { name, version } = utils.parseNameVersion(libNameVersion);
        // Get shared libs of the depending plugin
        const dependingLibs = deps[libNameVersion];
        const sharedLibs = await getLibs(name, version, mode);

        dependingLibs?.modules?.forEach((lib) => {
          if (sharedLibs.byId[lib] === undefined) {
            result.missingModules.push({
              module: lib,
              from: libNameVersion,
            });
          }
        });
      }),
    );
  }
  return result;
}
module.exports = validatePlugin;
