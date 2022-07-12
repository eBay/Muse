const _ = require('lodash');
const RestfulStorage = require('./RestfulStorage');

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
