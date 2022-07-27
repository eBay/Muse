const { vol } = require('memfs');
const { MuseLruCache } = require('./');
const delay = t => new Promise(resolve => setTimeout(resolve, t));

describe('MuseLruCache basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Old items out of date are deleted when set is called', async () => {
    const museCache = new MuseLruCache({
      maxMemorySize: 10,
      memoryTtl: 100,
      diskTtl: 200,
      diskLocation: '/tmp/lru-disk-cache',
      diskSaveTimestampsInterval: 50,
      getData: k => {
        return {
          foo1: 'bar1',
          foo2: 'bar2',
          foo3: 'bar3',
        }[k];
      }, // the callback to get the data source, it should return undefined if data not exists
    });

    // None exist item should return undefined
    expect(await museCache.get('foo')).toBeUndefined();

    // diskCache value is only set when museCache gets value from data source
    expect(await museCache.diskCache.get('foo1')).toBeUndefined();
    expect(await museCache.getString('foo1')).toBe('bar1');
    expect(museCache.diskCache.getString('foo1')).toBe('bar1');

    await delay(150);
    // memory ttl reached
    expect(await museCache.memoryCache.get('foo1')).toBeUndefined();
    // disk cache data exists
    expect(await museCache.getString('foo1')).toBe('bar1');
    // After get from disk cache, memory cache is re-filled.
    expect((await museCache.memoryCache.get('foo1')).toString()).toBe('bar1');

    // After get two more values, the mem size has been more than max size, then foo1 doesn't exist in mem cache
    await museCache.get('foo2');
    await museCache.get('foo3');
    expect(await museCache.memoryCache.get('foo1')).toBeUndefined();
  });

  it('throw error when getData callback is null', async () => {
    try {
      new MuseLruCache({
        maxMemorySize: 10,
        memoryTtl: 100,
        diskTtl: 200,
        diskLocation: '/tmp/lru-disk-cache',
        diskSaveTimestampsInterval: 50,
        getData: null,
      });
      expect(true).toBe(false);
    } catch (err) {
      expect(err?.message).toMatch('MuseLruCache needs getData callback to get data.');
    }
  });
});
