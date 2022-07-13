const _ = require('lodash');
const beforeHooksExts = require('./beforeHooksImpls');

module.exports = ({ pluginName, extPoint, options }) => {
  const obj = {
    name: pluginName || 'muse-acl-plugin',
    ...beforeHooksExts(options),
  };

  return obj;
};
