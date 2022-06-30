const Readable = require('stream').Readable;
const Minio = require('minio');
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false,
});
const logger = require('@ebay/muse-core').logger.createLogger('s3-storage-plugin.S3Storage');

function streamToBuffer(stream) {
  const chunks = [];
  return new Promise((resolve, reject) => {
    stream.on('data', chunk => chunks.push(Buffer.from(chunk)));
    stream.on('error', err => reject(err));
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

class S3Storage {
  constructor({ accessKey, secretKey, endpoint, bucketName, basePath }) {
    this.bucketName = bucketName;
    this.basePath = basePath || '';
    this.s3Client = new Minio.Client({
      endPoint: endpoint,
      accessKey,
      secretKey,
    });

    this.s3Client.setRequestOptions({
      agent: httpsAgent,
    });
  }

  async get(key) {
    logger.verbose(`Getting item: ${key}...`);
    try {
      const s = await this.s3Client.getObject(this.bucketName, this.basePath + key);
      if (!s) return null;
      return await streamToBuffer(s);
    } catch (err) {
      if (err && err.code === 'NoSuchKey') return null;
      return undefined;
    }
  }

  async set(key, value) {
    logger.verbose(`Setting data: ${key}...`);
    const readStream = bufferToStream(value);
    await this.s3Client.putObject(this.bucketName, this.basePath + key, readStream);
  }

  async delDir(key) {
    logger.verbose(`Deleting folder: ${key}...`);
    const objectsList = await this.listBucketFolder(key);
    await this.s3Client.removeObjects(this.bucketName, objectsList);
  }

  async del(key) {
    logger.verbose(`Deleting data: ${key}...`);
    await this.s3Client.removeObject(this.bucketName, key);
  }

  async list(key) {
    logger.verbose(`Listing data: ${key}`);
    const objectsList = await this.listBucketFolder(key);
    return objectsList.map(o => {
      return {
        name: o?.name?.replace(this.basePath + key, ''),
        path: o?.name,
        type: 'file',
        size: o?.size,
        atime: null,
        mtime: o?.lastModified,
        birthtime: o?.lastModified,
        sha: null,
      };
    });
  }

  async listBucketFolder(key) {
    let objectsList = [];
    const objectsStream = await this.s3Client.listObjects(
      this.bucketName,
      this.basePath + key,
      true,
    );
    await new Promise((resolve, reject) => {
      objectsStream.on('data', chunk => objectsList.push(chunk));
      objectsStream.on('error', err => reject(err));
      objectsStream.on('end', () => resolve(objectsList.concat(objectsList)));
    });
    return objectsList;
  }

  async readStream(key) {
    return await this.s3Client.getObject(this.bucketName, this.basePath + key);
  }

  async writeStream(key) {
    console.log('write stream key: ', key);
  }
}

module.exports = S3Storage;
