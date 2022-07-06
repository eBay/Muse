const path = require('path');
const fs = require('fs-extra');

const unixify = str => {
  return str.replace(/[\\\/]+/g, '/');
};

// Get muse libs dependencies of a plugin project
const getMuseLibs = (pkgJson, paths) => {
  return Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
    ...pkgJson.peerDependencies,
  }).filter(dep => {
    try {
      const depPkgJson = fs.readJsonSync(`${paths.appNodeModules}/${dep}/package.json`);
      return depPkgJson?.muse?.type === 'lib';
    } catch (e) {
      // If failed to read Muse config, just ignore.
      return false;
    }
  });
};

module.exports = ({
  jestConfig,
  cracoConfig,
  pluginOptions,
  context: { env, paths, resolve, rootDir },
}) => {
  const pkgJson = require(path.join(paths.appPackageJson));
  const libModules = getMuseLibs(pkgJson, paths);
  const excludedModules = [];
  let intermediatePath = null;

  for (const libraryPlugin of libModules) {
    const resolvedPath = require.resolve(`${libraryPlugin}/package.json`);
    const resolvedPackageJsonIndex = resolvedPath.indexOf('package.json');
    if (!intermediatePath) {
      let indexOfLibraryPluginName = resolvedPath.indexOf(libraryPlugin);
      if (indexOfLibraryPluginName < 0) {
        indexOfLibraryPluginName = resolvedPath.indexOf(libraryPlugin.replace('/', '+'));
      }
      intermediatePath = unixify(resolvedPath.substring(rootDir.length, indexOfLibraryPluginName));
    }
    excludedModules.push(
      unixify(
        resolvedPath.substring(
          rootDir.length + intermediatePath.length,
          resolvedPackageJsonIndex - 1,
        ),
      ),
    );
  }

  // #1 force lib plugins source to be transpiled by babel (by default all modules under /node_modules are ignored)
  if (excludedModules.length > 0) {
    jestConfig.transformIgnorePatterns = [
      `<rootDir>${intermediatePath}(?!${excludedModules.join('|')})`,
    ];
  }

  // #2 add default mocks for MUSE_GLOBAL / MUSE_ENTRIES if no "setupFilesAfterEnv" has been configured on craco.config.js from the plugin under test
  jestConfig.setupFilesAfterEnv =
    jestConfig?.setupFilesAfterEnv?.length > 0
      ? jestConfig.setupFilesAfterEnv
      : [require.resolve('./jest/setupAfterEnv.js')];

  // #3 optionally show Jest configuration for debugging purposes, if the plugin option "showJestConfig" gets passed along
  if (pluginOptions?.showJestConfig) {
    console.log(JSON.stringify(jestConfig, null, 4));
  }

  // Always return the config object.
  return jestConfig;
};
