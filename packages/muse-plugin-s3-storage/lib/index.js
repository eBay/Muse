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

module.exports = ({ accessKey, pluginName, secretKey, endPoint, bucketName }) => {
  const s3Client = new Minio.Client({
    endPoint, //: 'muse.nuobject.io',
    accessKey, //: process.env.NUOBJECT_ACCESS_KEY,
    secretKey, //: process.env.NUBOJECT_SECRET_KEY,
  });

  s3Client.setRequestOptions({
    agent: httpsAgent,
  });
  return {
    name: 'muse-plugin-s3-storage' || pluginName,
    museCore: {
      assets: {
        storage: {
          get: async (key) => {
            try {
              const s = await s3Client.getObject(bucketName, key);
              if (!s) return null;
              return await streamToBuffer(s);
            } catch (err) {
              if (err && err.code === 'NoSuchKey') return null;
              return undefined;
            }
          },
          set: async (key, value) => {
            const readStream = bufferToStream(value);
            await s3Client.putObject(bucketName, key, readStream);
          },
        },
      },
    },
  };
};
