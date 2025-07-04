const { vol } = require('memfs');
const jsPlugin = require('js-plugin');
const muse = require('../');

// const testJsPlugin = {
//   name: 'test',
//   museCore: {
//     pm: {
//       undeployPlugin: jest.fn(),
//       beforeUndeployPlugin: jest.fn(),
//       afterUndeployPlugin: jest.fn(),
//     },
//   },
// };
// plugin.register(testJsPlugin);
describe('Undeploy plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Undeploy plugin should work', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';

    await muse.am.createApp({ appName });
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
    const envName = 'noexist';
    const pluginName = 'test-plugin';
    await muse.am.createApp({ appName });
    await muse.pm.createPlugin({ pluginName });

    try {
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });

  it('It throws exception if failed Undeploy Plugin .', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    await muse.am.createApp({ appName });
    await muse.pm.createPlugin({ pluginName, type: 'init' });
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({
      appName,
      envName,
      pluginName,
      version: '1.0.0',
      options: { prop1: 'prop1' },
    });

    // Register a plugin that cause failure to deploy a plugin
    const testJsPluginFails = {
      name: 'testFails',
      museCore: {
        pm: {
          deployPlugin: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeDeployPlugin: jest.fn(),
          afterDeployPlugin: jest.fn(),
          failedDeployPlugin: jest.fn(),
        },
      },
    };
    jsPlugin.register(testJsPluginFails);

    try {
      await muse.pm.undeployPlugin({ appName, envName, pluginName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch('Async error');
    }
    expect(testJsPluginFails.museCore.pm.deployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.beforeDeployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.failedDeployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.afterDeployPlugin).toBeCalledTimes(0);
  });
});
