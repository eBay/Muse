const fs = require('fs-extra');
const findRoot = require('find-root');
const { getMuseLibs, getLocalPlugins, getPkgJson } = require('@ebay/muse-dev-utils/lib/utils');
const { findMuseModule } = require('@ebay/muse-modules');

module.exports = () => {
  return {
    name: 'muse-esbuild',
    setup(build) {
      const allMuseModules = {};
      getMuseLibs().forEach((lib) => {
        Object.assign(
          allMuseModules,
          fs.readJsonSync(
            fs.readJsonSync(path.join(lib.path, 'build/dev/lib-manifest.json')).content,
          ),
        );
      });
      build.onLoad({ filter: /\.m?[jt]sx?$/ }, async (args) => {
        const rootPkgPath = findRoot(args.path);
        if (!rootPkgPath) return;
        const rootPkg = fs.readJsonSync(rootPkgPath + '/package.json');
        if (!rootPkg.name || !rootPkg.version) return;

        const museModuleId = `${rootPkg.name}@${rootPkg.version}${args.path.replace(
          rootPkgPath,
          '',
        )}`;

        const museModule = findMuseModule(museModuleId, { modules: allMuseModules });

        if (museModule) {
          if (args.path.endsWith('.mjs')) {
            return {
              contents: `export default MUSE_GLOBAL.__shared__.require("${museModuleId}");`,
            };
          }
          // We need to know if a module is a default export or not
          else
            return {
              contents: `const m = MUSE_GLOBAL.__shared__.require("${museModuleId}"); module.exports=m?(Object.keys(m).length===1 && m.default ||m):null;`,
            };
        }
      });
    },
  };
};
