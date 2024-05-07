const fs = require('fs-extra');
const path = require('path');
const findRoot = require('find-root');
const { getMuseLibs } = require('@ebay/muse-dev-utils/lib/utils');
const { findMuseModule, config } = require('@ebay/muse-modules');
config.matchVersion = 'major';

function mergeObjects(obj1, obj2) {
  for (let key in obj2) {
    if (obj1[key] && Array.isArray(obj1[key]) && obj2[key] && Array.isArray(obj2[key])) {
      obj1[key] = [...obj1[key], ...obj2[key]];
    } else if (
      obj1[key] &&
      typeof obj1[key] === 'object' &&
      obj2[key] &&
      typeof obj2[key] === 'object'
    ) {
      mergeObjects(obj1[key], obj2[key]);
    } else if (!Object.hasOwnProperty.call(obj1, key)) {
      obj1[key] = obj2[key];
    }
  }
  return obj1;
}

let allMuseModules;
function ensureAllMuseModules() {
  if (!allMuseModules) allMuseModules = {};
  getMuseLibs().forEach((lib) => {
    const content = fs.readJsonSync(path.join(lib.path, 'build/dev/lib-manifest.json')).content;
    for (const p in content) {
      // Need to know the lib name to generate deps-manifest.json
      content[p].__libName = `${lib.name}@${lib.version}`;
    }
    Object.assign(allMuseModules, content);
  });
}

function getMuseModule(filePath) {
  const pkg = fs.readJsonSync(path.join(process.cwd(), 'package.json'));

  ensureAllMuseModules();
  const rootPkgPath = findRoot(filePath);
  if (!rootPkgPath) return null;

  const rootPkg = fs.readJsonSync(rootPkgPath + '/package.json');
  if (!rootPkg.name || !rootPkg.version) return;
  if (pkg?.muse.customLibs?.includes(rootPkg.name)) {
    return null;
  }
  const museModuleId = `${rootPkg.name}@${rootPkg.version}${filePath.replace(rootPkgPath, '')}`;

  const museModule = findMuseModule(museModuleId, { modules: allMuseModules });
  if (museModule) {
    museModule.__isESM = rootPkg.type === 'module' || filePath.endsWith('.mjs');
  }
  return museModule;
}

function getMuseModuleCode(museModule) {
  // const museModule = getMuseModule(filePath);
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

// Get the lib plugin where the shared module is from
function getLibNameByModule(museId) {
  return allMuseModules[museId]?.__libName;
}

module.exports = {
  getMuseModule,
  getMuseModuleCode,
  getLibNameByModule,
  mergeObjects,
};
