const { vol } = require('memfs');
const muse = require('../../');

describe('Muse plugin builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('muse.plugin:pluginName should return correct plugin', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.pm.createPlugin({ pluginName: 'p1', author: 'nate' });

    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });

    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });

    const fullPlugin = await muse.data.get('muse.plugin.p1');
    expect(fullPlugin).toMatchObject({
      createdBy: 'nate',
      type: 'normal',
      owners: ['nate'],
    });
  });
});
