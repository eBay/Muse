const GitStorage = require('./GitStorage');
const _ = require('lodash');

module.exports = ({
  pluginName,
  extPoint,
  endpoint,
  repo,
  branch,
  // organizationName,
  // projectName,
  token,
}) => {
  const obj = {
    name: pluginName || 'muse-plugin-git-storage',
  };

  _.set(
    obj,
    extPoint,
    new GitStorage({
      endpoint,
      repo,
      branch,
      token,
    }),
  );
  return obj;
};
