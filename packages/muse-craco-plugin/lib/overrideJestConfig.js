const path = require('path');
const fs = require('fs-extra');

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
  const excludedModules = [...libModules].join('|');
  const moduleNameMapperForMuseLibs = {};
  libModules.forEach(lib => {
    moduleNameMapperForMuseLibs[`${lib}/(.*)`] = `<rootDir>/node_modules/${lib}/src/$1`;
  });

  // #1 assign module mappers for muse libs, so that references to lib modules/files on the plugin being tested can be found by Jest
  jestConfig.moduleNameMapper = { ...jestConfig.moduleNameMapper, ...moduleNameMapperForMuseLibs };

  // #2 force lib plugins source to be transpiled by babel (by default all modules under /node_modules is ignored)
  if (excludedModules.length > 0) {
    jestConfig.transformIgnorePatterns.push(`/node_modules/(?!(${excludedModules})/)`);
  }

  // #3 add default reporter if none has been configured on craco.config.js from the plugin under test
  jestConfig.reporters = jestConfig?.reporters?.length > 0 ? jestConfig.reporters : ['default'];

  // #4 add default mocks for MUSE_GLOBAL / MUSE_ENTRIES if no "setupFilesAfterEnv" has been configured on craco.config.js from the plugin under test
  jestConfig.setupFilesAfterEnv =
    jestConfig?.setupFilesAfterEnv?.length > 0
      ? jestConfig.setupFilesAfterEnv
      : [require.resolve('./jest/setupAfterEnv.js')];

  // #5 optionally show Jest configuration for debugging purposes, if the plugin option "showJestConfig" gets passed along
  if (pluginOptions?.showJestConfig) {
    console.log(JSON.stringify(jestConfig, null, 4));
  }

  // Always return the config object.
  return jestConfig;
};
