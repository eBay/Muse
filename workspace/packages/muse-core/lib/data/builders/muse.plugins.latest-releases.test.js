const { vol } = require('memfs');
const muse = require('../../');

describe('muse.plugins.latest-releases builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('muse.plugins.latest-releases should return correct plugin', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.am.createEnv({ appName: 'app1', envName: 'staging' });

    let plugins = await muse.pm.getPlugins();
    expect(plugins.length).toBe(0);

    await muse.pm.createPlugin({ pluginName: 'p1', author: 'nate' });

    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });
    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.1' });
    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });
    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.1',
    });

    const fullPlugins = await muse.data.get('muse.plugins.latest-releases');

    expect(fullPlugins.p1).toMatchObject({ pluginName: 'p1', version: '1.0.1' });
  });
});
