const parseMuseId = require('./parseMuseId');
const buildCache = require('./buildCache');
const globalThis = require('./globalThis');

// Get the version diff, e.g: [1,2,3] - [1,2,4] = [0,0,1]
const verDiff = (v1, v2) => [0, 1, 2].map((i) => Math.abs(v1[i] - v2[i]));

// Whether diff1 is less than diff2, e.g: [1,2,3] < [1,2,4]
const diffLt = (d1, d2) => {
  for (let i = 0; i < 3; i++) {
    if (d1[i] < d2[i]) return true;
    if (d1[i] > d2[i]) return false;
  }
  return false;
};

/**
 * Resolve module to the closest semantic version
 * @param {String} museId example: @ebay/nice-modal@1.0.0/src/index.js
 * @param {*} museSharedModules { modules, cache }
 * @returns
 */
function findMuseModule(museId, museShared) {
  if (!museShared) museShared = MUSE_GLOBAL.__shared__;

  if (museShared.modules[museId]) return museShared.modules[museId];
  let cache = museShared.cache;

  if (!cache) {
    buildCache(museShared);
    cache = museShared.cache;
  }

  const m = parseMuseId(museId);

  if (!m) return null;
  const candidates = cache[m.id];
  if (!candidates) return null;
  if (candidates.length === 1) return museShared.modules[candidates[0].museId];
  let closest = candidates[0];
  let minDiff = verDiff(m.version, closest.version);

  candidates.forEach((c, i) => {
    if (i === 0) return;
    const currentDiff = verDiff(c.version, m.version);
    if (diffLt(currentDiff, minDiff)) {
      minDiff = currentDiff;
      closest = c;
    }
  });

  return museShared.modules[closest.museId];
}

module.exports = findMuseModule;
