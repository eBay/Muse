const fs = require('fs-extra');
const path = require('path');
const findRoot = require('find-root');
const { getMuseLibs } = require('@ebay/muse-dev-utils/lib/utils');
const { findMuseModule } = require('@ebay/muse-modules');

let allMuseModules;
function ensureAllMuseModules() {
  if (!allMuseModules) allMuseModules = {};
  getMuseLibs().forEach((lib) => {
    Object.assign(
      allMuseModules,
      fs.readJsonSync(path.join(lib.path, 'build/dev/lib-manifest.json')).content,
    );
  });
}

function getMuseModule(filePath) {
  const pkg = fs.readJsonSync(path.join(process.cwd(), 'package.json'));

  ensureAllMuseModules();
  const rootPkgPath = findRoot(filePath);
  if (!rootPkgPath) return null;

  const rootPkg = fs.readJsonSync(rootPkgPath + '/package.json');
  if (pkg?.muse.customLibs?.includes(rootPkg.name)) {
    return null;
  }
  if (!rootPkg.name || !rootPkg.version) return;
  const museModuleId = `${rootPkg.name}@${rootPkg.version}${filePath.replace(rootPkgPath, '')}`;
  const museModule = findMuseModule(museModuleId, { modules: allMuseModules });
  // console.log(museModule);
  if (museModule) {
    museModule.__isESM = rootPkg.type === 'module' || filePath.endsWith('.mjs');
  }
  return museModule;
}

function getMuseModuleCode(filePath) {
  const museModule = getMuseModule(filePath);
  if (!museModule) return;

  if (museModule.__isESM) {
    //TODO: or package type === 'module' ?
    return `const m = MUSE_GLOBAL.__shared__.require("${museModule.id}");
    ${(museModule.exports || [])
      .map((key) => {
        if (key !== 'default') {
          return 'export const ' + key + '= m.' + key + ';';
        }
        return '';
      })
      .join('\n')}
    export default m.default || m;
    `;
  }
  // We need to know if a module is a default export or not
  else {
    return `module.exports=MUSE_GLOBAL.__shared__.require("${museModule.id}");`;
  }
}

module.exports = {
  getMuseModule,
  getMuseModuleCode,
};
