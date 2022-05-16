const path = require('path');
const { vol } = require('memfs');
const muse = require('../../lib');

jest.mock('fs');
jest.mock('fs/promises');

describe('FileStorage basic tests.', () => {
  const testDir = path.join(__dirname, '/_muse_test_dir');

  beforeEach(() => {
    vol.reset();
  });

  it('Test set and get', async () => {
    const fileStorage = new muse.storage.FileStorage({ location: testDir });
    await fileStorage.set('/test/hello', 'world');
    const result = (await fileStorage.get('/test/hello')).toString();
    expect(result).toBe('world');
  });

  it('Test exists', async () => {
    const fileStorage = new muse.storage.FileStorage({ location: testDir });
    expect(fileStorage.exists('/test/hello2')).toBe(false);
    await fileStorage.set('/test/hello2', 'world');
    expect(fileStorage.exists('/test/hello2')).toBe(true);
  });

  it('Test del', async () => {
    const fileStorage = new muse.storage.FileStorage({ location: testDir });
    await fileStorage.set('/test/hello3', 'world');
    await fileStorage.del('/test/hello3');
    await fileStorage.exists('/test/hello3');
    const result = await fileStorage.get('/test/hello3');
    expect(result).toBe(null);
  });

  it('Test list', async () => {
    const fileStorage = new muse.storage.FileStorage({ location: testDir });
    await fileStorage.set('/test/hello1', 'world1');
    await fileStorage.set('/test/hello2', 'world2');
    const result = await fileStorage.list('/test');
    expect(result.length).toBe(2);
  });

  it('Test count', async () => {
    const fileStorage = new muse.storage.FileStorage({ location: testDir });
    await fileStorage.set('/test/hello1', 'world1');
    await fileStorage.set('/test/hello2', 'world2');
    const result = await fileStorage.count('/test');
    expect(result).toBe(2);
  });
});
