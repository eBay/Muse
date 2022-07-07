const { utils } = require('@ebay/muse-dev-utils');

module.exports = ({
  jestConfig,
  cracoConfig,
  pluginOptions,
  context: { env, paths, resolve, rootDir },
}) => {
  /*
   * The path to library plugins differs between package managers (npm, yarn, pnpm ...)
   * The intermediate path is the part of the path between the <rootDir> and the <lib plugin name>
   */
  let intermediatePath = null;
  const excludedModules = [];

  const libModules = utils.getMuseLibs();

  for (const libraryPlugin of libModules) {
    const resolvedPath = require.resolve(`${libraryPlugin}/package.json`);
    const resolvedPackageJsonIndex = resolvedPath.indexOf('package.json');

    // we only calculate the intermediate path once, as it is the same for any given library plugin
    if (!intermediatePath) {
      let indexOfLibraryPluginName = resolvedPath.indexOf(libraryPlugin);
      if (indexOfLibraryPluginName < 0) {
        // if we can't find the lib plugin name as part of the path, maybe it's because it has a domain separated with a '+' sign
        // ( i.e. pnpm behaviour )
        indexOfLibraryPluginName = resolvedPath.indexOf(libraryPlugin.replace('/', '+'));
      }
      intermediatePath = resolvedPath.substring(rootDir.length, indexOfLibraryPluginName);
    }
    excludedModules.push(
      resolvedPath.substring(
        rootDir.length + intermediatePath.length,
        resolvedPackageJsonIndex - 1,
      ),
    );
  }

  // #1 force lib plugins source to be transpiled by babel jest (by default all modules under /node_modules are ignored)
  if (excludedModules.length > 0) {
    jestConfig.transformIgnorePatterns = [
      `<rootDir>${intermediatePath}/(?!${excludedModules.join('|')})`,
    ];
  }

  // #2 add default mocks for MUSE_GLOBAL / MUSE_ENTRIES,
  // unless 'skipMuseJestMocks' is set to true with a custom 'setupFilesAfterEnv' configuration
  const defaultSetupAfterEnvPath = require.resolve('./jest/setupAfterEnv.js');
  jestConfig.setupFilesAfterEnv =
    jestConfig?.setupFilesAfterEnv?.length > 0
      ? pluginOptions?.skipMuseJestMocks
        ? jestConfig.setupFilesAfterEnv
        : jestConfig.setupFilesAfterEnv.push(defaultSetupAfterEnvPath)
      : [defaultSetupAfterEnvPath];

  // #3 optionally show Jest configuration for debugging purposes, if the plugin option "showJestConfig" gets passed along
  if (pluginOptions?.showJestConfig) {
    console.log(JSON.stringify(jestConfig, null, 4));
  }

  // Always return the config object.
  return jestConfig;
};
