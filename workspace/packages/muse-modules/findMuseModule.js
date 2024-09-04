const parseMuseId = require('./parseMuseId');
const buildCache = require('./buildCache');
const config = require('./config');

// Get the version diff, e.g: [1,2,3] - [1,2,4] = [0,0,1]
const verDiff = (v1, v2) => [0, 1, 2].map((i) => Math.abs(v1[i] - v2[i]));

// Whether ver1 is less than ver2, e.g: [1,2,3] < [1,2,4]
// This can also be used to compare version diff from verDiff()
const lt = (v1, v2) => {
  for (let i = 0; i < 3; i++) {
    if (v1[i] < v2[i]) return true;
    if (v1[i] > v2[i]) return false;
  }
  return false;
};

const gt = (v1, v2) => !lt(v1, v2);

/**
 * Resolve module to the greater and closest semantic version.
 * If there is only one version, use it.
 * If there are multiple versions, use the closest but greater one.
 *
 * NOTE: it doesn't support prerelease versions. e.g: 1.0.0-beta.1 will be treated as 1.0.0
 *
 * @param {String} museId example: @ebay/nice-modal-react@1.0.0/src/index.js
 * @param {*} museSharedModules { modules, cache }
 * @returns
 */
function findMuseModule(museId, museShared) {
  museId = museId.replace(/\\/g, '/').replace(/\/+/g, '/');
  if (!museShared) museShared = MUSE_GLOBAL.__shared__;

  if (museShared.modules[museId]) {
    return museShared.modules[museId];
  }

  let cache = museShared.cache;

  if (!cache) {
    // group different versions by module id
    buildCache(museShared);
    cache = museShared.cache;
  }

  const m = parseMuseId(museId);

  if (!m) return null;
  const candidates = cache[m.id];
  if (!candidates) return null;
  let picked = candidates[0];
  let minDiff = verDiff(m.version, picked.version);

  for (let i = 1; i < candidates.length; i++) {
    const c = candidates[i];

    // if same version, use it
    if (m.version.join('.') === c.version.join('.')) {
      picked = c;
      break;
    }

    // apply match version config

    // Ensure picked version is grater than target version
    if (gt(picked.version, m.version) && lt(c.version, m.version)) continue;

    // The version diff between the current version and the target version
    const currentDiff = verDiff(c.version, m.version);

    if ((lt(picked.version, m.version) && gt(c.version, m.version)) || lt(currentDiff, minDiff)) {
      minDiff = currentDiff;
      picked = c;
    }
  }

  switch (config.matchVersion) {
    case 'major':
      if (minDiff[0] !== 0) return null;
      break;
    case 'minor':
      if (minDiff[0] !== 0 || minDiff[1] !== 0) return null;
      break;
    case 'patch':
      if (minDiff[0] !== 0 || minDiff[1] !== 0 || minDiff[2] !== 0) return null;
      break;
    case 'all':
      break;
    default:
      break;
  }

  return museShared.modules[picked.museId];
}

module.exports = findMuseModule;
