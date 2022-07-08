const { vol } = require('memfs');

describe('Muse data general test cases.', () => {
  beforeEach(() => {
    jest.resetModules();
    vol.reset();
  });
  it('Registry data change should trigger cache refresh', async () => {
    const muse = require('../');
    const dataCache = {};
    const testJsPlugin = {
      name: 'testJsPlugin',
      museCore: {
        data: {
          cache: {
            get: key => {
              return dataCache[key] ?? null;
            },
            set: (key, value) => {
              dataCache[key] = value;
            },
          },
        },
      },
    };
    muse.plugin.register(testJsPlugin);

    await muse.am.createApp({ appName: 'app1' });
    await muse.am.createEnv({ appName: 'app1', envName: 'staging' });
    await muse.pm.createPlugin({ pluginName: 'p1' });
    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });
    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });
    let fullApp = await muse.data.get('muse.app.app1');
    // when there is cache provider, it always uses the cache
    expect(fullApp).toBeNull();

    // trigger data change on registry
    await muse.data.handleDataChange('registry', ['/apps/app1/staging/p1.yaml']);

    // After cache is updated, the app1 should be get correctly
    fullApp = await muse.data.get('muse.app.app1');
    expect(fullApp).toMatchObject({ name: 'app1' });
    expect(fullApp.envs.staging.plugins[0]).toMatchObject({ name: 'p1', version: '1.0.0' });
  });
});
