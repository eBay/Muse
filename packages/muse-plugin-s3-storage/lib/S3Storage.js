const Readable = require('stream').Readable;
const Minio = require('minio');
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false,
});

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

class S3Storage {
  constructor({ accessKey, secretKey, endPoint, bucketName, basePath }) {
    this.bucketName = bucketName;
    this.basePath = basePath || '';
    this.s3Client = new Minio.Client({
      endPoint,
      accessKey,
      secretKey,
    });

    this.s3Client.setRequestOptions({
      agent: httpsAgent,
    });
  }

  async get(key) {
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
    const readStream = bufferToStream(value);
    await this.s3Client.putObject(this.bucketName, this.basePath + key, readStream);
  }

  async del(key) {
    try {
      const objectsList = await this.list(key);
      await this.s3Client.removeObjects(this.bucketName, objectsList);
    } catch (err) {
      console.log(err);
    }
  }

  async list(key) {
    let objectsList = [];
    const objectsStream = await this.s3Client.listObjects(
      this.bucketName,
      this.basePath + key,
      true,
    );
    await new Promise((resolve, reject) => {
      objectsStream.on('data', (chunk) => objectsList.push(chunk));
      objectsStream.on('error', (err) => reject(err));
      objectsStream.on('end', () => resolve(objectsList.concat(objectsList)));
    });
    return objectsList.map((o) => {
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

  async readStream(key) {
    console.log('read Stream key: ', key);
  }

  async writeStream(key) {
    console.log('write stream key: ', key);
  }
}

module.exports = S3Storage;
