const GitStorage = require("./GitStorage");
const _ = require('lodash');

module.exports = ({
  pluginName,
  extPoint,
  url,
  organizationName,
  projectName,
  token,
}) => {
  const obj = {
    name: 'muse-plugin-git-storage' || pluginName,
  };
  _.set(obj, extPoint, new GitStorage({
    url,
    organizationName,
    projectName,
    token,
  }));
  return obj;
};
