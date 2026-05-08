const getMsp = require('../../msp/getMsp');
const logger = require('../../logger').createLogger('muse.data.builder.muse-msp');

function resolveVersions(mspJson, key, visited) {
  if (visited.has(key)) return {};
  visited.add(key);
  const entry = mspJson[key];
  if (!entry) return {};
  const parentVersions = entry.extends ? resolveVersions(mspJson, entry.extends, visited) : {};
  return { ...parentVersions, ...(entry.versions || {}) };
}

function flattenMsp(mspJson) {
  if (!mspJson || typeof mspJson !== 'object') return mspJson;
  const result = {};
  for (const key of Object.keys(mspJson)) {
    result[key] = {
      ...mspJson[key],
      versions: resolveVersions(mspJson, key, new Set()),
    };
  }
  return result;
}

// muse npm versions builder
module.exports = {
  key: 'muse.msp',
  get: async () => {
    logger.verbose(`Getting muse.msp...`);
    const mspJson = await getMsp();
    return flattenMsp(mspJson);
  },
  getMuseDataKeysByRawKeys: (rawDataType, keys) => {
    if (rawDataType !== 'registry') return null;
    if (keys.includes('/msp.yaml')) {
      return 'muse.msp';
    }
  },
};
