const { vol } = require('memfs');
const { LruDiskCache } = require('./');
const delay = (t) => new Promise((resolve) => setTimeout(resolve, t));

describe('LruDiskCache basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Old items out of date are deleted when set is called', async () => {
    const diskCache = new LruDiskCache({
      ttl: 100,
      saveTimestampsInterval: 100,
      location: '/tmp/lru-disk-cache',
    });

    diskCache.set('foo', 'bar');
    diskCache.set('foo2', 'bar2');
    expect(diskCache.get('foo').toString()).toBe('bar');
    expect(diskCache.get('foo2').toString()).toBe('bar2');
    await delay(200);
    // Old items are deleted when set is called
    diskCache.set('foo3', 'bar3');
    expect(diskCache.get('foo')).toBeUndefined();
    expect(diskCache.get('foo2')).toBeUndefined();
    expect(diskCache.get('foo3').toString()).toBe('bar3');

    const timestamps = JSON.parse(diskCache.get('_internal/timestamps.json').toString());
    expect(timestamps).not.toHaveProperty('foo');
    expect(timestamps).not.toHaveProperty('foo2');
    expect(timestamps).toHaveProperty('foo3');
  });
});
