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
    name: 'muse-plugin-git-storage' || pluginName,
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
