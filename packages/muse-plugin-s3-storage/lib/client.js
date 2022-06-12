const Minio = require('minio');
const fs = require('fs');
const Readable = require('stream').Readable;
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false,
});
const utils = require('../utils');

function streamToBuffer(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on('error', (err) => reject(err));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
  });
}

function bufferToStream(binary) {
  const readableInstanceStream = new Readable({
    read() {
      this.push(binary);
      this.push(null);
    },
  });

  return readableInstanceStream;
}

function getClient(bucketName) {
  const s3Client = new Minio.Client({
    endPoint: 'muse.nuobject.io',
    accessKey: process.env.NUOBJECT_ACCESS_KEY,
    secretKey: process.env.NUBOJECT_SECRET_KEY,
  });

  s3Client.setRequestOptions({
    agent: httpsAgent,
  });
  return Object.assign(s3Client, {
    bucketName,
    getBuffer: async function (key) {
      // every time retry for 3 times
      const s = await utils.retry(
        async () => await this.getObject(this.bucketName, key),
        3,
        `get nuobject.${key}`,
        (err) => {
          if (err && err.code === 'NoSuchKey') return null;
          return undefined;
        },
      )();
      if (!s) return null;
      return await streamToBuffer(s);
    },
    putFile: async function (filePath, key) {
      const readStream = fs.createReadStream(filePath);
      await utils.retry(
        async () => {
          await this.putObject(this.bucketName, key, readStream);
        },
        3,
        `put nuobject.${key}`,
      )();
    },
    getFile: async function (key) {
      return await this.getBuffer(key);
    },
    putJson: async function (key, json) {
      await this.putString(key, JSON.stringify(json));
    },
    getJson: async function (key) {
      const str = await this.getString(key);
      if (!str) return null;
      return JSON.parse(str);
    },
    putString: async function (key, content) {
      const buf = Buffer.from(content, 'utf8');
      await utils.retry(
        async () => {
          await this.putObject(this.bucketName, key, bufferToStream(buf));
        },
        3,
        `put nuobject.${key}`,
      )();
    },
    getString: async function (key) {
      const buff = await this.getBuffer(key);
      if (!buff) return null;
      return buff.toString('utf8');
    },
  });
}

const client = getClient('plugin-resource');

client.d = getClient('default');

module.exports = client;
