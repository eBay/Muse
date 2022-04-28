const semReg =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

function parseModuleId(moduleId) {
  var arr = moduleId.split('@');
  var s = arr[arr.length - 1];
  var arr2 = s.split('/');
  const ver = arr2[0];
  const semVer = semReg.exec(ver);
  var modulePath = arr2.slice(1).join('/');
  if (!semVer) {
    return null;
    // throw new Error(`Muse plugin error: invalid version for moduleId ${moduleId}.`);
  }
  const pkgName = arr.slice(0, arr.length - 1).join('@');
  return {
    name: pkgName,
    path: modulePath,
    id: `${pkgName}/${modulePath}`,
    moduleId,
    version: { major: semVer[1], minor: semVer[2], patch: semVer[3], pre: semVer[4] }, // pre is not used
  };
}

// Group modules by id (pkgName/path)
function buildModulesCache(allModules) {
  if (!Object.prototype.hasOwnProperty.call(allModules, 'cache')) {
    Object.defineProperty(allModules, 'cache', {
      value: null,
      writable: true,
    });
  }
  const cache = (allModules.cache = {});
  // group by module's id
  /* cache: {
    'loadash@1.0.0': [{}, {}]
   }
   */
  Object.keys(allModules).forEach((mid) => {
    const m = parseModuleId(mid);
    if (!m) return;
    if (!cache[m.id]) cache[m.id] = [];
    cache[m.id].push(m);
  });
}

// Resolve module to the closest semantic version
// moduleId example: @ebay/lib-project@1.0.0/src/index.js
function findMuseModule(moduleId, allModules) {
  console.log('finding module: ', moduleId);
  if (!allModules) allModules = __webpack_require_global__.__muse_shared_modules__; // eslint-disable-line
  var cache = allModules.cache;
  if (allModules[moduleId]) return allModules[moduleId];
  console.log('finding compatible module for: ', moduleId);
  if (!cache) {
    buildModulesCache(allModules);
    cache = allModules.cache;
  }

  const m = parseModuleId(moduleId);
  if (!m) throw new Error(`Invalid muse module id: ${moduleId}`);
  const candidates = cache[m.id];
  if (!candidates) return null;
  if (candidates.length === 1) return allModules[candidates[0].moduleId];
  var closest = candidates[0];
  var diff = {
    major: Math.abs(m.version.major - closest.version.major),
    minor: Math.abs(m.version.minor - closest.version.minor),
    patch: Math.abs(m.version.patch - closest.version.patch),
  };

  candidates.forEach((c, i) => {
    if (i === 0) return;
    const dMajor = Math.abs(c.version.major - m.version.major);
    const dMinor = Math.abs(c.version.minor - m.version.minor);
    const dPatch = Math.abs(c.version.patch - m.version.patch);
    if (
      dMajor < diff.major ||
      (dMajor === diff.major && dMinor < diff.minor) ||
      (dMajor === diff.major && dMinor === diff.minor && dPatch < diff.patch)
    ) {
      closest = c;
      diff = {
        major: dMajor,
        minor: dMinor,
        patch: dPatch,
      };
    }
  });

  return allModules[closest.moduleId];
}

module.exports = findMuseModule;
