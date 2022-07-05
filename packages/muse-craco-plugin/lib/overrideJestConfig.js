const path = require('path');
const resolveCwd = require('resolve-cwd');

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
  const esModules = ['lodash-es', 'react-syntax-highlighter'];
  const excludedModules = [...libModules, ...esModules].join('|');
  const moduleNameMapperForMuseLibs = {};
  libModules.forEach(lib => {
    moduleNameMapperForMuseLibs[`${lib}/(.*)`] = `<rootDir>/node_modules/${lib}/src/$1`;
  });

  jestConfig.moduleNameMapper = { ...jestConfig.moduleNameMapper, ...moduleNameMapperForMuseLibs };
  jestConfig.transformIgnorePatterns.push(`/node_modules/(?!${excludedModules})`);
  jestConfig.testURL = 'http://localhost';
  jestConfig.testTimeout = 10000;
  jestConfig.reporters = ['default', require.resolve('jest-junit')];
  jestConfig.coverageReporters = ['lcov', 'text', 'cobertura'];
  jestConfig.setupFiles.push(
    require.resolve('jest-localstorage-mock'),
    require.resolve('jest-canvas-mock'),
  );
  jestConfig.setupFilesAfterEnv = [require.resolve('./jest/setupAfterEnv.js')];
  jestConfig.watchPlugins = [];
  console.log(JSON.stringify(jestConfig, null, 4));

  // Always return the config object.
  return jestConfig;
};
