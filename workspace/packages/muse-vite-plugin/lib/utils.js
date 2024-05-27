import fs from 'fs-extra';
import path from 'path';
import findRoot from 'find-root';
import { getMuseLibs } from '@ebay/muse-dev-utils/lib/utils.js';
import museModules from '@ebay/muse-modules';

const { findMuseModule, config } = museModules;
config.matchVersion = 'major';

export function mergeObjects(obj1, obj2) {
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

const getManifestPath = (lib) =>
  path.join(
    lib.path,
    lib.isLinked ? 'node_modules/.muse/dev/lib-manifest.json' : 'build/dev/lib-manifest.json',
  );
let allMuseModules;
function loadAllMuseModules() {
  allMuseModules = {};
  getMuseLibs().forEach((lib) => {
    const content = fs.readJsonSync(getManifestPath(lib)).content;
    for (const p in content) {
      // Need to know the lib name to generate deps-manifest.json
      content[p].__libName = `${lib.name}@${lib.version}`;
    }
    Object.assign(allMuseModules, content);
  });
}

export function ensureAllMuseModules() {
  if (allMuseModules) return;

  // Watch lib manifest changes, this is useful when a Muse plugin links to a Muse lib plugin
  getMuseLibs().forEach((lib) => {
    fs.watch(getManifestPath(lib), { persistent: false }, loadAllMuseModules);
  });
  loadAllMuseModules();
}

export function getMuseModule(filePath) {
  const rootPkgPath = findRoot(filePath);
  if (!rootPkgPath) return null;

  const pkg = fs.readJsonSync(path.join(process.cwd(), 'package.json'));
  const rootPkg = fs.readJsonSync(rootPkgPath + '/package.json');
  if (!rootPkg.name || !rootPkg.version) return;
  if (pkg?.muse.customLibs?.includes(rootPkg.name)) {
    return null;
  }
  const museModuleId = `${rootPkg.name}@${rootPkg.version}${filePath.replace(rootPkgPath, '')}`;

  ensureAllMuseModules();
  const museModule = findMuseModule(museModuleId, { modules: allMuseModules });
  if (museModule) {
    museModule.__isESM = rootPkg.type === 'module' || filePath.endsWith('.mjs');
  }
  return museModule;
}

export function getMuseModuleCode(museModule, esm) {
  if (!museModule) return;

  if (museModule.__isESM || esm) {
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
  else if (museModule.exports?.includes('default') && museModule.exports?.length === 1) {
    return `const m = MUSE_GLOBAL.__shared__.require("${museModule.id}");\nmodule.exports = m.default;`;
  } else {
    return `const m = MUSE_GLOBAL.__shared__.require("${museModule.id}");\nmodule.exports = m;`;
  }
}

// Get the lib plugin where the shared module is from
export function getLibNameByModule(museId) {
  return allMuseModules[museId]?.__libName;
}
