const { vol } = require('memfs');
const muse = require('../../');

describe('Muse plugins builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('muse.plugins:pluginName should return correct plugin', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.am.createEnv({ appName: 'app1', envName: 'staging' });

    let plugins = await muse.pm.getPlugins();
    expect(plugins.length).toBe(0);

    await muse.pm.createPlugin({ pluginName: 'p1', author: 'nate' });

    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });

    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });

    const fullPlugins = await muse.data.get('muse.plugins');

    expect(fullPlugins.length).toBe(1);

    expect(fullPlugins[0]).toMatchObject({ name: 'p1', createdBy: 'nate' });
  });
});
