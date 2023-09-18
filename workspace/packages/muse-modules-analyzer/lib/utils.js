const fs = require('fs-extra');
const _ = require('lodash');
const muse = require('@ebay/muse-core');

const utils = {
  /**
   * Get name and version from a nameVersion string
   *
   * @param {*} nameVersion - e.g: @ebay/muse-core@1.0.0
   * @returns
   */
  parseNameVersion: (nameVersion) => {
    const lastIndex = nameVersion.lastIndexOf('@');
    return {
      name: nameVersion.substring(0, lastIndex),
      version: nameVersion.substring(lastIndex + 1),
    };
  },

  /**
   * Get the asset of a  plugin
   *
   * @param {*} pluginName
   * @param {*} version - version can be a local folder (e.g: ./build) or a version number
   * @param {*} assetPath - the asset path in the build result
   * @param {*} mode
   * @returns
   */
  getJsonAsset: async (pluginName, version, assetPath, mode) => {
    const pid = muse.utils.getPluginId(pluginName);

    if (/\d+\.\d+\.\d+/.test(version)) {
      return await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/${assetPath}`);
    } else {
      //It's a local folder
      return fs.readJsonSync(`${version}/${mode}/${assetPath}`);
    }
  },

  /**
   * Get the deps manifest of a plugin, in which the depending shared modules are described.
   *
   * @param {*} pluginName
   * @param {*} version - version can be a local folder (e.g: ./build) or a version number
   * @param {*} mode
   * @returns
   */
  getLibManifest: async (pluginName, version, mode) => {
    return (
      (await utils.getJsonAsset(pluginName, version, 'lib-manifest.json', mode))?.content || {}
    );
  },

  getDepsManifest: async (pluginName, version, mode) => {
    return (
      (await utils.getJsonAsset(pluginName, version, 'deps-manifest.json', mode))?.content || {}
    );
  },
};
module.exports = utils;
