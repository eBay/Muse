const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      undeployPlugin: jest.fn(),
      beforeUndeployPlugin: jest.fn(),
      afterUndeployPlugin: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Undeploy plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Undeploy plugin should work', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';

    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName });
    await muse.pm.createPlugin({ pluginName, type: 'init' });
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({
      appName,
      envName,
      pluginName,
      version: '1.0.0',
      options: { prop1: 'prop1' },
    });
    let p = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(p).toMatchObject({ name: pluginName, version: '1.0.0', prop1: 'prop1', type: 'init' });

    await muse.pm.undeployPlugin({ appName, envName, pluginName });
    p = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(p).toBeNull();

    expect(testJsPlugin.museCore.pm.undeployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeUndeployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterUndeployPlugin).toBeCalledTimes(1);
  });

  it('It throws exception if app not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName });

    try {
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
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

    try {
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`Env ${appName}/${envName} doesn't exist`);
    }
  });

  it('It throws exception if failed Undeploy Plugin .', async () => {
    const testJsPluginFails = {
      name: 'testFails',
      museCore: {
        pm: {
          undeployPlugin: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeUndeployPlugin: jest.fn(),
          afterUndeployPlugin: jest.fn(),
          failedUndeployPlugin: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName });
    await muse.pm.createPlugin({ pluginName, type: 'init' });
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({
      appName,
      envName,
      pluginName,
      version: '1.0.0',
      options: { prop1: 'prop1' },
    });

    try {
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch('Async error');
    }
    expect(testJsPluginFails.museCore.pm.undeployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.beforeUndeployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.failedUndeployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.afterUndeployPlugin).toBeCalledTimes(0);
  });
});
