/**
 * moduleId: muse module id example:
 *   - lib1@1.0.3/src/index.js
 *   - @ebay/nice-modal@1.2.3/src/index.ts  // scoped package
 */
function parseMuseId(museId) {
  try {
    const m = /((^@[^/]+\/)?([^@/]+))@(\d+)\.(\d+)\.(\d)([^./][^/]*)?\/(.+)$/.exec(museId);
    if (!m) return null;
    return {
      name: m[1],
      path: m[8],
      id: `${m[1]}/${m[8]}`,
      museId,
      version: m.slice(4, 7).map(Number),
    };
  } catch (err) {
    return null;
  }
}

module.exports = parseMuseId;
