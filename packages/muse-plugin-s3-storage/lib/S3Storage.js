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
  async del(key) {}
  async list(key) {}
  async readStream(key) {}
  async writeStream(key) {}
}

module.exports = S3Storage;
