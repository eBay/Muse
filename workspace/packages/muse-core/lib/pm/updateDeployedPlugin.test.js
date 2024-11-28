const { vol } = require('memfs');
const jsPlugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      updateDeployedPlugin: jest.fn(),
      beforeUpdateDeployedPlugin: jest.fn(),
      afterUpdateDeployedPlugin: jest.fn(),
      failedUpdateDeployedPlugin: jest.fn(),
    },
  },
};
jsPlugin.register(testJsPlugin);

describe('Update deployed plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Update deployed plugin should work', async () => {
    const appName = 'app1';
    const pluginName = 'plugin1';
    await muse.am.createApp({ appName });
    await muse.pm.createPlugin({ pluginName, author: 'nate' });
    await muse.pm.createPlugin({ pluginName: 'plugin2', author: 'nate' });
    await muse.pm.releasePlugin({ pluginName, version: '1.0.0' });
    await muse.pm.deployPlugin({
      appName,
      envName: 'staging',
      pluginName,
      version: '1.0.0',
    });
    try {
      await muse.pm.updateDeployedPlugin({
        appName,
        pluginName: 'plugin2',
        changesByEnv: {
          staging: {
            set: {
              path: 'foo',
              value: 'bar',
            },
          },
        },
      });
    } catch (err) {
      expect(err?.message).toMatch(`was not found on`);
    }

    await muse.pm.updateDeployedPlugin({
      appName,
      pluginName,
      changesByEnv: {
        staging: {
          set: {
            path: 'foo',
            value: 'bar',
          },
        },
      },
    });

    const deployedPlugin = await muse.pm.getDeployedPlugin(appName, 'staging', pluginName);
    expect(deployedPlugin.foo).toBe('bar');

    expect(testJsPlugin.museCore.pm.updateDeployedPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeUpdateDeployedPlugin).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.pm.afterUpdateDeployedPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.failedUpdateDeployedPlugin).toBeCalledTimes(1);

    await muse.am.createEnv({ appName, envName: 'production' });
    await muse.pm.deployPlugin({
      appName,
      envName: 'production',
      pluginName,
      version: '1.0.0',
    });
    await muse.pm.updateDeployedPlugin({
      appName,
      pluginName,
      changesByEnv: {
        staging: {
          set: {
            path: 'foo',
            value: 'bar',
          },
        },
        production: {
          set: {
            path: 'foo1',
            value: 'bar1',
          },
        },
      },
    });
  });
});
