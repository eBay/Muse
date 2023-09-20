const _ = require('lodash');
const { parseMuseId } = require('@ebay/muse-modules');

const utils = require('./utils');
/**
 * Get difference of shared modules between two versions of a lib plugin
 * @param {string} pluginName - name of the lib plugin
 * @param {string} baseVersion - base version
 * @param {string} currentVersion - current version
 * @param {*} mode - dist, dev or test
 * @returns {{baseIds: string[], currentIds: string[], removedIds: string[], addedIds: string[], addedPkgs: {}, removedPkgs: {}, updatedPkgs: {}}}
 */
async function getLibDiff(pluginName, baseVersion, currentVersion, mode = 'dist') {
  if (typeof pluginName === 'object') {
    ({ pluginName, baseVersion, currentVersion, mode = 'dist' } = pluginName);
  }
  const baseOne = await utils.getLibManifest(pluginName, baseVersion, mode);
  const currentOne = await utils.getLibManifest(pluginName, currentVersion, mode);

  const baseIds = _.keys(baseOne);
  const currentIds = _.keys(currentOne);
  const removedIds = _.differenceBy(baseIds, currentIds, (id) => {
    const { name, path } = parseMuseId(id);
    return name + '@' + path;
  });
  const addedIds = _.differenceBy(currentIds, baseIds, (id) => {
    const { name, path } = parseMuseId(id);
    return name + '@' + path;
  });

  const basePkgs = {};
  const currentPkgs = {};

  baseIds.forEach((id) => {
    const { name, version } = parseMuseId(id);
    basePkgs[name] = version.join('.');
  });

  currentIds.forEach((id) => {
    const { name, version } = parseMuseId(id);
    currentPkgs[name] = version.join('.');
  });

  const addedPkgs = {};
  const removedPkgs = {};
  const updatedPkgs = {};

  Object.keys(currentPkgs).forEach((name) => {
    if (!basePkgs[name]) {
      addedPkgs[name] = currentPkgs[name];
    } else if (basePkgs[name] !== currentPkgs[name]) {
      updatedPkgs[name] = {
        from: basePkgs[name],
        to: currentPkgs[name],
      };
    }
  });

  Object.keys(basePkgs).forEach((name) => {
    if (!currentPkgs[name]) {
      removedPkgs[name] = basePkgs[name];
    }
  });

  return {
    // baseIds,
    // currentIds,
    removedIds: removedIds.filter((id) => {
      const { name } = parseMuseId(id);
      if (name === pluginName) return false;
      return !removedPkgs[name];
    }),
    addedIds: addedIds.filter((id) => {
      const { name } = parseMuseId(id);
      if (name === pluginName) return false;
      return !addedPkgs[name];
    }),
    addedPkgs,
    removedPkgs,
    updatedPkgs,
  };
}

module.exports = getLibDiff;
