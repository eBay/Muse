const _ = require('lodash');
const urlStorage = require('./urlStorage');

module.exports = ({
  pluginName,
  endpoint,
  bucketName,
  accessKey,
  secretKey,
  basePath,
  extPoint,
}) => {
  const obj = {
    name: 'muse-plugin-restful-storage' || pluginName,
  };
  _.set(
    obj,
    extPoint,
    new RestfulStorage({ accessKey, secretKey, endpoint, basePath, bucketName }),
  );
  return obj;
};
