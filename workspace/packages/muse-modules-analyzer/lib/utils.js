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
    const arr = _.compact(nameVersion.split(/@/));
    const name = '@' + arr[0];
    const version = arr[1];
    return { name, version };
  },

  /**
   * Get the lib manifest of a lib plugin, in which shared modules are described.
   *
   * @param {*} pluginName
   * @param {*} version - version can be a local folder (e.g: ./build) or a version number
   * @param {*} mode
   * @returns
   */
  getLibManifest: async (pluginName, version, mode) => {
    const pid = muse.utils.getPluginId(pluginName);

    if (/\d+\.\d+\.\d+/.test(version)) {
      return (await muse.storage.assets.getJson(`/p/${pid}/v${version}/${mode}/lib-manifest.json`))
        .content;
    } else {
      //It's a local folder
      return fs.readJsonSync(`${version}/${mode}/lib-manifest.json`).content;
    }
  },
};
module.exports = utils;
