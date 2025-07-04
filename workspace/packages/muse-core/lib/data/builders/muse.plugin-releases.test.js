const { vol } = require('memfs');
const muse = require('../../');

describe('muse.plugin-releases.:pluginName builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('muse.plugin-releases.:pluginName should return correct plugin', async () => {
    await muse.am.createApp({ appName: 'app1' });

    await muse.pm.createPlugin({ pluginName: 'p1', author: 'nate' });

    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });

    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });

    const fullPlugins = await muse.data.get('muse.plugin-releases.p1');

    expect(fullPlugins[0]).toMatchObject({ pluginName: 'p1', version: '1.0.0' });
  });
});
