const getReleases = require('./getReleases');
const _ = require('lodash');

module.exports = async (params) => {
  const { pluginName } = params;

  // version parameter is optional
  let version = params.version;

  // get plugin releases
  const releases = await getReleases(pluginName);

  if (!releases || releases.length === 0) {
    throw new Error(`${pluginName} does not have any released versions yet.`);
  }

  if (!version) {
    version = releases[0].version;
  } else if (!_.find(releases, { version })) {
    throw new Error(`Version ${version} doesn't exist (or has been previously unregistered)`);
  }

  return _.find(releases, { version });
};
