const GitStorage = require('./GitStorage');
const _ = require('lodash');

module.exports = ({
  pluginName,
  extPoint,
  endpoint,
  repo,
  // url,
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
      token,
    }),
  );
  return obj;
};
