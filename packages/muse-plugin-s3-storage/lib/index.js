const _ = require('lodash');
const S3Storage = require('./S3Storage');

module.exports = ({
  pluginName,
  endPoint,
  bucketName,
  accessKey,
  secretKey,
  basePath,
  extPoint,
}) => {
  const obj = {
    name: 'muse-plugin-s3-storage' || pluginName,
  };
  _.set(obj, extPoint, new S3Storage({ accessKey, secretKey, endPoint, basePath, bucketName }));
  return obj;
};
