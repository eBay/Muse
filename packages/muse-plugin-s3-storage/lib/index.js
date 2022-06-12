const _ = require('lodash');
const S3Storage = require('./S3Storage');

module.exports = ({
  accessKey,
  pluginName,
  secretKey,
  extPoint,
  basePath,
  endPoint,
  bucketName,
}) => {
  const obj = {
    name: 'muse-plugin-s3-storage' || pluginName,
  };
  _.set(obj, extPoint, new S3Storage({ accessKey, secretKey, endPoint, basePath, bucketName }));
  return obj;
};
