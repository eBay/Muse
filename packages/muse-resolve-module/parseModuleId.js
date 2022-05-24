/**
 * moduleId: muse module id example:
 *   - lib1@1.0.3/src/index.js
 *   - @ebay/nice-modal@1.2.3/index.js  // scoped package
 */
function parseModuleId(moduleId) {
  try {
    const m = /((^@[^/]+\/)?([^@/]+))@(\d+)\.(\d+)\.(\d)([^.][^/]*)?\/(.+)$/.exec(moduleId);
    if (!m) return null;

    return {
      name: m[1],
      path: m[8],
      id: `${m[1]}/${m[8]}`,
      moduleId,
      version: { major: Number(m[4]), minor: Number(m[5]), patch: Number(m[6]) },
    };
  } catch (err) {
    return null;
  }
}

module.exports = parseModuleId;
