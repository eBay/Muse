import fs from 'fs-extra';
import path from 'path';
import { getMuseLibs } from '@ebay/muse-dev-utils/lib/utils.js';
import museModules from '@ebay/muse-modules';

const { findMuseModule, config } = museModules;
config.matchVersion = 'major';

// NOTE: don't use viteMode at top scope, it will be set by muse-vite-plugin
let viteMode = 'production';

export function setViteMode(mode) {
  viteMode = mode;
}

function findRoot(p) {
  const arr = p.split(/[\\/]/);
  while (arr.length) {
    const f = arr.join('/');
    if (fs.existsSync(path.join(f, 'package.json'))) {
      return f;
    }
    arr.pop();
  }
  return null;
}

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

const buildDir = {
  production: 'dist',
  development: 'dev',
  'e2e-test': 'test',
};

const getManifestPath = (lib) =>
  path.join(
    lib.path,
    lib.isLinked
      ? `node_modules/.muse/dev/lib-manifest.json`
      : `build/${buildDir[viteMode] || 'dist'}/lib-manifest.json`,
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
    museModule.__isESM =
      !!rootPkg.module ||
      rootPkg.type === 'module' ||
      filePath.endsWith('.mjs') ||
      filePath.endsWith('.ts') ||
      filePath.endsWith('.tsx');
  }

  return museModule;
}

export function isSharedMuseModule(filePath) {
  return !!getMuseModule(filePath);
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
    return `const m = MUSE_GLOBAL.__shared__.require("${museModule.id}");\n\nmodule.exports = m.default || m;`;
  }
}

// Get the lib plugin where the shared module is from
export function getLibNameByModule(museId) {
  return allMuseModules[museId]?.__libName;
}

// Cache for package.json files to avoid re-reading
const packageJsonCache = {};
export function getMuseIdByPath(p) {
  // path is abs path of a module, e.g.
  //  - /Users/pwang7/muse/muse-next/ui-plugins/muse-lib-react/src/index.jsx
  //  - /Users/pwang7/muse/muse-next/ui-plugins/muse-lib-react/node_modules/.pnpm/history@5.3.0/node_modules/history/index.js
  //  - /Users/pwang7/muse/muse-next/ui-plugins/muse-lib-react/node_modules/.pnpm/@tanstack+react-query@4.33.0_react-dom@18.2.0_react@18.2.0/node_modules/@tanstack/react-query/build/lib/useIsMutating.mjs
  // Key logic: find the root of the package and then generate museId based on the package name, version and the relative path to the package root

  // Normalize path separators to forward slashes
  const normalizedPath = p.replace(/\\/g, '/');

  // Find the last occurrence of node_modules in the path
  const nodeModulesIndex = normalizedPath.lastIndexOf('node_modules');

  if (nodeModulesIndex === -1) {
    // File is not in node_modules - it's source code of a package
    // Walk up to find package.json
    const segments = normalizedPath.split('/');
    for (let i = segments.length - 1; i > 0; i--) {
      const candidatePath = segments.slice(0, i).join('/');
      const pkgPath = candidatePath + '/package.json';

      // Check cache first
      if (packageJsonCache[pkgPath] !== undefined) {
        const pkg = packageJsonCache[pkgPath];
        if (pkg && pkg.name && pkg.version) {
          const relativePath = normalizedPath.substring(candidatePath.length);
          return `${pkg.name}@${pkg.version}${relativePath}`;
        }
        continue;
      }

      // Read and cache
      if (fs.existsSync(pkgPath)) {
        const pkg = fs.readJsonSync(pkgPath);
        packageJsonCache[pkgPath] = pkg;
        if (pkg.name && pkg.version) {
          const relativePath = normalizedPath.substring(candidatePath.length);
          return `${pkg.name}@${pkg.version}${relativePath}`;
        }
      } else {
        packageJsonCache[pkgPath] = null;
      }
    }
    return null;
  }

  // File is in node_modules - parse package name after last node_modules
  const afterNodeModules = normalizedPath.substring(nodeModulesIndex + 'node_modules/'.length);

  let packageName, packageRoot, relativePath;

  if (afterNodeModules.startsWith('@')) {
    // Scoped package: @scope/name/...
    const parts = afterNodeModules.split('/');
    packageName = `${parts[0]}/${parts[1]}`;
    packageRoot = normalizedPath.substring(0, nodeModulesIndex) + 'node_modules/' + packageName;
    relativePath = '/' + parts.slice(2).join('/');
  } else {
    // Regular package: name/...
    const firstSlash = afterNodeModules.indexOf('/');
    packageName = firstSlash === -1 ? afterNodeModules : afterNodeModules.substring(0, firstSlash);
    packageRoot = normalizedPath.substring(0, nodeModulesIndex) + 'node_modules/' + packageName;
    relativePath = firstSlash === -1 ? '' : afterNodeModules.substring(firstSlash);
  }

  // Read package.json to get version (with caching)
  const pkgPath = packageRoot + '/package.json';
  try {
    if (packageJsonCache[pkgPath] !== undefined) {
      const pkg = packageJsonCache[pkgPath];
      if (!pkg || !pkg.name || !pkg.version) return null;
      return `${pkg.name}@${pkg.version}${relativePath}`;
    }

    const pkg = fs.readJsonSync(pkgPath);
    packageJsonCache[pkgPath] = pkg;
    if (!pkg.name || !pkg.version) return null;
    return `${pkg.name}@${pkg.version}${relativePath}`;
  } catch (error) {
    packageJsonCache[pkgPath] = null;
    return null;
  }
}
