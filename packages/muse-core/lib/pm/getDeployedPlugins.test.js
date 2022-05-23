const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      getDeployedPlugins: jest.fn(),
      beforeGetDeployedPlugins: jest.fn(),
      afterGetDeployedPlugins: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Deploy plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Deploy plugin should work', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    const pluginName2 = 'test-plugin2';

    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName });
    await muse.pm.createPlugin({ pluginName });
    await muse.pm.createPlugin({ pluginName: pluginName2 });

    expect(await muse.pm.getDeployedPlugins(appName, envName)).toEqual([]);
    await muse.pm.releasePlugin({ pluginName, version: '2.0.2' });
    await muse.pm.releasePlugin({ pluginName: pluginName2, version: '1.0.3' });
    await muse.pm.deployPlugin({ appName, envName, pluginName, version: '2.0.2', options: { prop1: 'prop1' } });
    await muse.pm.deployPlugin({ appName, envName, pluginName: pluginName2, version: '1.0.3' });
    const deployedPlugins = await muse.pm.getDeployedPlugins(appName, envName);
    expect(deployedPlugins.length).toBe(2);
    expect(deployedPlugins[0]).toMatchObject({ name: pluginName, version: '2.0.2', prop1: 'prop1' });

    expect(testJsPlugin.museCore.pm.getDeployedPlugins).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.pm.beforeGetDeployedPlugins).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.pm.afterGetDeployedPlugins).toBeCalledTimes(2);
  });

  it('It throws exception if app not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';

    try {
      await muse.pm.getDeployedPlugins(appName, envName);
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`App ${appName} doesn't exist`);
    }
  });

  it('It throws exception if env not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    await muse.am.createApp({ appName });

    try {
      await muse.pm.getDeployedPlugins(appName, envName);
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`Env ${appName}/${envName} doesn't exist`);
    }
  });
});
