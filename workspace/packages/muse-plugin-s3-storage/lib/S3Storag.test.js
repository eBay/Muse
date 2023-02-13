const museCore = require('@ebay/muse-core');
const Readable = require('stream').Readable;

var mockSetRequestOptions;
var mockGetObject;
var mockPutObject;
var mockRemoveObjects;
var mockRemoveObject;
var mockListObjects;

jest.mock('minio', () => {
  mockSetRequestOptions = jest.fn();
  mockGetObject = jest.fn();
  mockPutObject = jest.fn();
  mockRemoveObjects = jest.fn();
  mockRemoveObject = jest.fn();
  mockListObjects = jest.fn();
  return {
    Client: function() {
      return {
        setRequestOptions: mockSetRequestOptions,
        getObject: mockGetObject,
        putObject: mockPutObject,
        removeObjects: mockRemoveObjects,
        removeObject: mockRemoveObject,
        listObjects: mockListObjects,
      };
    },
  };
});

describe('S3 Storage tests', () => {
  let s3;
  beforeEach(() => {
    s3 = require('./')({
      pluginName: 'mockPluginName',
      endpoint: 'mockEndpoint',
      bucketName: 'mockBuketName',
      accessKey: 'mockAccessKey',
      secretKey: 'mockSecretKey',
      basePath: 'mockBasePath/',
      extPoint: 'ext',
    }).ext;
    mockSetRequestOptions.mockReset();
    mockGetObject.mockReset();
    mockPutObject.mockReset();
    mockRemoveObjects.mockReset();
    mockRemoveObject.mockReset();
    mockListObjects.mockReset();
  });
  it('Construct S3storage without Base Path', async () => {
    const s3 = require('./')({
      endpoint: 'mockEndpoint',
      bucketName: 'mockBuketName',
      accessKey: 'mockAccessKey',
      secretKey: 'mockSecretKey',
      extPoint: 'ext',
    }).ext;
    expect(s3.basePath).toEqual('');
  });
  it('Get', async () => {
    mockGetObject.mockImplementation(() => {
      return new Readable({
        read() {
          this.push('mockObj');
          this.push(null);
        },
      });
    });
    expect((await s3.get('mockKey')).toString()).toEqual('mockObj');
  });
  it('Get null object', async () => {
    mockGetObject.mockImplementation(() => {
      return null;
    });
    expect(await s3.get('mockKey')).toEqual(null);
  });
  it('Get failed because of no such key', async () => {
    mockGetObject.mockImplementation(() => {
      const error = new Error('no such key');
      error.code = 'NoSuchKey';
      throw error;
    });
    expect(await s3.get('mockKey')).toEqual(null);
  });
  it('Get failed because of exception', async () => {
    mockGetObject.mockImplementation(() => {
      const error = new Error('other error');
      throw error;
    });
    await expect(s3.get('mockKey')).rejects.toThrow(Error);
  });
  it('Get failed because of exception withouot Error Message', async () => {
    mockGetObject.mockImplementation(() => {
      const error = new Error();
      throw error;
    });
    await expect(s3.get('mockKey')).rejects.toThrow(Error);
  });
  it('Set', async () => {
    mockPutObject.mockImplementation((bucketName, keyPath, readStream) => {
      expect(bucketName).toEqual('mockBuketName');
      expect(keyPath).toEqual('mockBasePath/mockKey');
      expect(readStream.read().toString()).toEqual('mockValue');
    });
    await s3.set('mockKey', 'mockValue');
    expect(mockPutObject).toBeCalledTimes(1);
  });
  it('Batch Set', async () => {
    mockPutObject.mockImplementation(() => {});
    await s3.batchSet([
      { keyPath: 'mockKey', value: 'mockValue' },
      { keyPath: 'mockKey2', value: 'mockValue2' },
    ]);
    expect(mockPutObject).toBeCalledTimes(2);
  });
  it('Delete Dir', async () => {
    mockListObjects.mockImplementation(() => {
      return new Readable({
        read() {
          this.push('mockObj');
          this.push(null);
        },
      });
    });
    mockRemoveObjects.mockImplementation((bucketName, objectsList) => {
      expect(bucketName).toEqual('mockBuketName');
      expect(objectsList.length).toEqual(1);
    });
    await s3.delDir('mockKey');
    expect(mockRemoveObjects).toBeCalledTimes(1);
    expect(mockListObjects).toBeCalledTimes(1);
  });

  it('Delete Object', async () => {
    mockRemoveObject.mockImplementation((bucketName, key) => {
      expect(bucketName).toEqual('mockBuketName');
      expect(key).toEqual('mockKey');
    });
    await s3.del('mockKey');
    expect(mockRemoveObject).toBeCalledTimes(1);
  });

  it('List', async () => {
    mockListObjects.mockImplementation(() => {
      return new Readable({
        read() {
          this.push('mockObj');
          this.push(null);
        },
      });
    });
    await s3.list('mockKey');
    expect(mockListObjects).toBeCalledTimes(1);
  });
  it('Read Stream', async () => {
    await s3.readStream('mockKey');
    expect(mockGetObject).toBeCalledTimes(1);
  });

  it('Write Stream', async () => {
    await s3.writeStream('mockKey');
  });
});
