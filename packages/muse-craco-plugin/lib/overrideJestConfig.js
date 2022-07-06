const path = require('path');
const fs = require('fs-extra');

// Get muse libs dependencies of a plugin project  (copied from /config/ext/webpack.js)
const getMuseLibs = (pkgJson, paths) => {
  return Object.keys({
    ...pkgJson.dependencies,
    ...pkgJson.devDependencies,
    ...pkgJson.peerDependencies,
  }).filter(dep => {
    try {
      const depPkgJson = fs.readJsonSync(`${paths.appNodeModules}/${dep}/package.json`);
      return depPkgJson.muse && depPkgJson.muse.type === 'lib';
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

  jestConfig.moduleNameMapper = { ...jestConfig.moduleNameMapper, ...moduleNameMapperForMuseLibs };
  if (excludedModules.length > 0) {
    jestConfig.transformIgnorePatterns.push(`/node_modules/(?!(${excludedModules})/)`);
  }
  jestConfig.reporters =
    jestConfig.reporters && jestConfig.reporters.length > 0 ? jestConfig.reporters : ['default'];

  jestConfig.setupFilesAfterEnv =
    jestConfig.setupFilesAfterEnv && jestConfig.setupFilesAfterEnv.length > 0
      ? jestConfig.setupFilesAfterEnv
      : [require.resolve('./jest/setupAfterEnv.js')];

  if (pluginOptions && pluginOptions.showJestConfig) {
    console.log(JSON.stringify(jestConfig, null, 4));
  }

  // Always return the config object.
  return jestConfig;
};
