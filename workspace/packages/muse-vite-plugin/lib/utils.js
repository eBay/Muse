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
  ensureAllMuseModules();
  const rootPkgPath = findRoot(filePath);
  if (!rootPkgPath) return;
  const rootPkg = fs.readJsonSync(rootPkgPath + '/package.json');
  if (!rootPkg.name || !rootPkg.version) return;
  const museModuleId = `${rootPkg.name}@${rootPkg.version}${filePath.replace(rootPkgPath, '')}`;
  const museModule = findMuseModule(museModuleId, { modules: allMuseModules });
  // console.log(museModule);
  return museModule;
}

function getMuseModuleCode(filePath) {
  const museModule = getMuseModule(filePath);
  if (!museModule) return;
  if (filePath.endsWith('.mjs')) {
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
  // return `module.exports =MUSE_GLOBAL.__shared__.require("${museModule.id}"); module.exports=m?(Object.keys(m).length===1 && m.default ||m):null;`;
  else {
    return `const m = MUSE_GLOBAL.__shared__.require("${museModule.id}"); module.exports=m?(Object.keys(m).length===1 && m.default ||m):null;`;
  }
}

module.exports = {
  getMuseModule,
  getMuseModuleCode,
};
