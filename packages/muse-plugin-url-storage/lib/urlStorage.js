const axios = require('axios');
const _ = require('lodash');
const logger = require('@ebay/muse-core').logger.createLogger(
  'restful-storage-plugin.RestfulStorage',
);

/**
 * Save data in a url based storage.
 */
module.exports = ({
  headers,
  endpoint,
  methods = { get: {} },
  prefix,
  axiosArgs = {},
  dataPath,
}) => {
  prefix = 'v2.'; //basePath || '';
  const client = axios.create({
    baseURL: endpoint,
    timeout: 60000,
    maxContentLength: 100000000,
    maxBodyLength: 1000000000,
    ...axiosArgs,
    headers: {
      ...headers,
    },
  });
  const obj = {};
  obj.get = async key => {
    const res = await client.get(prefix + key);
    const data = _.get(res.data, dataPath);
  };
  Object.keys(methods).forEach(k => {
    obj[k] = async (key, value) => {};
  });

  return obj;

  // async get(key) {
  //   logger.verbose(`Getting item: ${key}...`);
  //   try {
  //     const s = await this.get(this.basePath + '/' + key);
  //     if (!s) return null;
  //     return await streamToBuffer(s);
  //   } catch (err) {
  //     if (err && err.code === 'NoSuchKey') return null;
  //     return undefined;
  //   }
  // }

  // async set(key, value) {
  //   logger.verbose(`Setting data: ${key}...`);
  //   const readStream = bufferToStream(value);
  //   await this.s3Client.putObject(this.bucketName, this.basePath + key, readStream);
  // }
};
