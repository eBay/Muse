const { vol } = require('memfs');
const muse = require('../../');

describe('Muse app builder tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('muse.app.:appName should return correct app', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.pm.createPlugin({ pluginName: 'p1' });
    await muse.pm.createPlugin({ pluginName: 'p2', type: 'boot' });
    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });
    await muse.pm.releasePlugin({ pluginName: 'p2' });
    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });
    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p2',
      version: '1.0.0',
    });
    const fullApp = await muse.data.get('muse.app.app1');
    expect(fullApp).toMatchObject({ name: 'app1' });
    expect(fullApp.envs.staging.plugins[0]).toMatchObject({ name: 'p1', version: '1.0.0' });
    expect(fullApp.envs.staging.plugins[1]).toMatchObject({
      name: 'p2',
      type: 'boot',
      version: '1.0.0',
    });
  });

  it('copies plugin.yaml variables onto every deployed instance', async () => {
    const xss = "</script><script>document.title='XSS_SCRIPT_BREAKOUT'</script>";
    await muse.am.createApp({ appName: 'app1' });
    await muse.pm.createPlugin({
      pluginName: 'p1',
      options: { variables: { xss_marker: xss } },
    });
    await muse.pm.createPlugin({ pluginName: 'p2', type: 'boot' });
    await muse.pm.releasePlugin({ pluginName: 'p1', version: '1.0.0' });
    await muse.pm.releasePlugin({ pluginName: 'p2' });
    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p1',
      version: '1.0.0',
    });
    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'p2',
      version: '1.0.0',
    });

    const fullApp = await muse.data.get('muse.app.app1');
    const deployed = fullApp.envs.staging.plugins.find((p) => p.name === 'p1');
    expect(deployed.variables).toEqual({ xss_marker: xss });
  });
});
