const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('..');

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
    await muse.pm.createPlugin({ pluginName, type: 'init' });
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({
      appName,
      envName,
      pluginName,
      version: '1.0.0',
      options: { prop1: 'prop1' },
    });
    const p = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(p).toMatchObject({ name: pluginName, version: '1.0.0', prop1: 'prop1', type: 'init' });
    expect(testJsPlugin.museCore.pm.deployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeDeployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterDeployPlugin).toBeCalledTimes(1);
  });

  it('Batch deploy plugins should work', async () => {
    const appName = 'testapp';
    const envName2 = 'ppe';
    const pluginName1 = 'test-plugin1';
    const pluginName2 = 'test-plugin2';

    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName: envName2 });
    await muse.pm.createPlugin({ pluginName: pluginName1, type: 'init' });
    await muse.pm.createPlugin({ pluginName: pluginName2, type: 'init' });
    await muse.pm.releasePlugin({ pluginName: pluginName1 });
    await muse.pm.releasePlugin({ pluginName: pluginName2 });
    await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'add',
            pluginName: 'test-plugin1',
          },
          {
            type: 'add',
            pluginName: 'test-plugin2',
          },
        ],
        ppe: [
          {
            type: 'add',
            pluginName: 'test-plugin1',
          },
        ],
      },
    });

    const plugins = await muse.pm.getDeployedPlugins(appName, 'staging');
    expect(plugins).toEqual([
      { name: 'test-plugin1', version: '1.0.0', type: 'init' },
      { name: 'test-plugin2', version: '1.0.0', type: 'init' },
    ]);

    expect(testJsPlugin.museCore.pm.deployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeDeployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterDeployPlugin).toBeCalledTimes(1);
  });

  it('Batch deployments including undeployment should work', async () => {
    const appName = 'testapp';
    const pluginName1 = 'test-plugin1';
    const pluginName2 = 'test-plugin2';

    await muse.am.createApp({ appName });

    await muse.pm.createPlugin({ pluginName: pluginName1, type: 'init' });
    await muse.pm.releasePlugin({ pluginName: pluginName1 });
    await muse.pm.createPlugin({ pluginName: pluginName2, type: 'init' });
    await muse.pm.releasePlugin({ pluginName: pluginName2 });

    await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'add',
            pluginName: 'test-plugin1',
          },
        ],
      },
    });
    const plugins1 = await muse.pm.getDeployedPlugins(appName, 'staging');
    expect(plugins1).toEqual([{ name: 'test-plugin1', version: '1.0.0', type: 'init' }]);

    await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'remove',
            pluginName: 'test-plugin1',
          },
          {
            type: 'add',
            pluginName: 'test-plugin2',
          },
        ],
      },
    });
    const plugins2 = await muse.pm.getDeployedPlugins(appName, 'staging');

    expect(plugins2).toEqual([{ name: 'test-plugin2', version: '1.0.0', type: 'init' }]);
    expect(testJsPlugin.museCore.pm.deployPlugin).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.pm.beforeDeployPlugin).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.pm.afterDeployPlugin).toBeCalledTimes(2);
  });

  it('Fail to Deploy Plugin should throw the error', async () => {
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
    plugin.register(testJsPluginFails);
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';

    await muse.am.createApp({ appName });
    await muse.pm.createPlugin({ pluginName, type: 'init' });
    await muse.pm.releasePlugin({ pluginName });
    try {
      await muse.pm.deployPlugin({
        appName,
        envName,
        pluginName,
        version: '1.0.0',
        options: { prop1: 'prop1' },
      });
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.pm.deployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.beforeDeployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.failedDeployPlugin).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.pm.afterDeployPlugin).toBeCalledTimes(0);
  });
});
