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
    const res = await muse.data.builder.get('muse.data-value');
    expect(res).toBe('cache-value');
  });

  it('Register builder with args should work', async () => {
    const muse = require('../');
    muse.data.builder.register({
      name: 'musetest.app',
      key: 'musetest.app.:appName',
      get: async ({ appName }) => {
        return { name: appName };
      },
    });
    const app = await muse.data.builder.get('musetest.app.nate');
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
    const app = await muse.data.builder.get('musetest.app.nate');
    expect(app).toBeNull();
  });
});
