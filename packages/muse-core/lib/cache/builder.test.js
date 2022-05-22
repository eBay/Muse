describe('Muse cache builder basic tests.', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('Register builder with constant name should work', async () => {
    const muse = require('../');
    muse.cache.builder.register({
      key: 'muse.cache-value',
      get: async () => {
        return 'cache-value';
      },
    });
    const res = await muse.cache.builder.get('muse.cache-value');
    expect(res).toBe('cache-value');
  });

  it('Register builder with args should work', async () => {
    const muse = require('../');
    muse.cache.builder.register({
      key: 'muse.app.:appName',
      get: async ({ appName }) => {
        return { name: appName };
      },
    });
    const app = await muse.cache.builder.get('muse.app.nate');
    expect(app.name).toBe('nate');
  });

  it('No match should return null', async () => {
    const muse = require('../');
    muse.cache.builder.register({
      key: 'some.key',
      get: async ({ appName }) => {
        return { name: appName };
      },
    });
    const app = await muse.cache.builder.get('muse.app.nate');
    expect(app).toBeNull();
  });
});
