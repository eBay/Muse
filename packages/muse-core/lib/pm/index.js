/**
 * @module muse-core/pm
 */
module.exports = {
  /** @member {function} createPlugin */
  createPlugin: require('./createPlugin'),
  /** @member {function} getPlugin */
  getPlugin: require('./getPlugin'),
  /** @member {function} updatePlugin */
  updatePlugin: require('./updatePlugin'),
  /** @member {function} getPlugins */
  getPlugins: require('./getPlugins'),
  /** @member {function} buildPlugin */
  buildPlugin: require('./buildPlugin'),
  /** @member {function} deletePlugin */
  deletePlugin: require('./deletePlugin'),
  /** @member {function} getDeployedPlugin */
  getDeployedPlugin: require('./getDeployedPlugin'),
  /** @member {function} getDeployedPlugins */
  getDeployedPlugins: require('./getDeployedPlugins'),
  /** @member {function} deployPlugin */
  deployPlugin: require('./deployPlugin'),
  /** @member {function} checkDependencies */
  checkDependencies: require('./checkDependencies'),
  /** @member {function} undeployPlugin */
  undeployPlugin: require('./undeployPlugin'),
  /** @member {function} releasePlugin */
  releasePlugin: require('./releasePlugin'),
  /** @member {function} getReleases */
  getReleases: require('./getReleases'),
  /** @member {function} checkReleaseVersion */
  checkReleaseVersion: require('./checkReleaseVersion'),
  /** @member {function} deleteRelease */
  deleteRelease: require('./deleteRelease'),
  /** @member {function} unregisterRelease */
  unregisterRelease: require('./unregisterRelease'),
  /** @member {function} getReleaseAssets */
  getReleaseAssets: require('./getReleaseAssets'),
};
