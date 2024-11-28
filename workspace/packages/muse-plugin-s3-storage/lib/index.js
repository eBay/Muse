const _ = require('lodash');
const S3Storage = require('./S3Storage');

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
    name: pluginName || 'muse-plugin-s3-storage',
  };
  _.set(obj, extPoint, new S3Storage({ accessKey, secretKey, endpoint, basePath, bucketName }));
  return obj;
};
