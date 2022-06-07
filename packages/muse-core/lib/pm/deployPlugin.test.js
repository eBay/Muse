const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      deployPlugin: jest.fn(),
      beforeDeployPlugin: jest.fn(),
      afterDeployPlugin: jest.fn(),
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

    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName });
    await muse.pm.createPlugin({ pluginName, type: 'init' });
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({ appName, envName, pluginName, version: '1.0.0', options: { prop1: 'prop1' } });
    const p = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(p).toMatchObject({ name: pluginName, version: '1.0.0', prop1: 'prop1', type: 'init' });

    expect(testJsPlugin.museCore.pm.deployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeDeployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterDeployPlugin).toBeCalledTimes(1);
  });

  it('It throws exception if plugin not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';

    try {
      await muse.pm.deployPlugin({ appName, envName, pluginName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`Plugin ${pluginName} doesn't exist`);
    }
  });

  it('It throws exception if app not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({ pluginName });
    try {
      await muse.pm.deployPlugin({ appName, envName, pluginName, version: '1.0.0' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`App ${appName} doesn't exist`);
    }
  });

  it('It throws exception if env not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    await muse.am.createApp({ appName });
    await muse.pm.createPlugin({ pluginName });
    await muse.pm.releasePlugin({ pluginName });

    try {
      await muse.pm.deployPlugin({ appName, envName, pluginName, version: '1.0.0' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`Env ${appName}/${envName} doesn't exist`);
    }
  });
});
