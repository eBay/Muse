describe('Muse cache builder basic tests.', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('Register builder with constant name should work', async () => {
    const muse = require('../');
    muse.data.builder.register({
      name: 'muse-data',
      key: 'muse.data-value',
      get: async () => {
        return 'cache-value';
      },
    });
    const res = await muse.data.get('muse.data-value');
    expect(res).toBe('cache-value');
  });

  it('Register builder with match should work', async () => {
    const muse = require('../');
    muse.data.builder.register({
      name: 'musetest.app',
      match: key => {
        const arr = key.split('.');
        return arr.length === 3 && arr[0] === 'musetest' && arr[1] === 'app';
      },
      get: async key => {
        return { name: key.split('.')[2] };
      },
    });
    const app = await muse.data.get('musetest.app.nate');
    expect(app.name).toBe('nate');
  });

  it('No match should return null', async () => {
    const muse = require('../');
    muse.data.builder.register({
      name: 'some name',
      key: 'some.key',
      get: async ({ appName }) => {
        return { name: appName };
      },
    });
    const app = await muse.data.get('musetest.app.nate');
    expect(app).toBeNull();
  });

  it('Same name as key should work', async () => {
    const muse = require('../');
    muse.data.builder.register({
      name: 'some name',
      key: 'some.key',
      get: async () => {
        return 'bar';
      },
    });
    const value = await muse.data.get('some.key');
    expect(value).toEqual('bar');
  });

  it('Key with prefix should not match', async () => {
    const muse = require('../');
    muse.data.builder.register({
      name: 'some name',
      key: 'some.key',
      get: async () => {
        return 'bar';
      },
    });
    const value = await muse.data.get('some.key.item');
    expect(value).toBeNull();
  });
});
