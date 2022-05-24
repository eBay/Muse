/**
 * moduleId: muse module id example:
 *   - lib1@1.0.3/src/index.js
 *   - @ebay/nice-modal@1.2.3/index.js  // scoped package
 */
function parseModuleId(moduleId) {
  try {
    if (!/(^@[^/]+\/)?[^@/]+@\d+\.\d+\.\d[^.]/.test(moduleId)) return null;

    var arr = moduleId.split('@');
    const pkgName = arr.slice(0, arr.length - 1).join('@');
    var s = arr[arr.length - 1]; // e.g: 1.0.3/src/index.js
    var arr2 = s.split('/');
    const ver = arr2[0]; // version part: 2.3.4-beta.1

    const [major, minor, patch] = ver
      .split('.')
      .slice(0, 3)
      .map((s) => Number(s));
    var modulePath = arr2.slice(1).join('/');

    return {
      name: pkgName,
      path: modulePath,
      id: `${pkgName}/${modulePath}`,
      moduleId,
      version: { major, minor, patch },
    };
  } catch (err) {
    return null;
  }
}

module.exports = parseModuleId;
