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

  it('Deploy plugin should keep existing props while update', async () => {
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
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({
      appName,
      envName,
      pluginName,
      version: '1.0.1',
      options: { prop2: 'prop2' },
    });
    const p2 = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(p2).toMatchObject({
      name: pluginName,
      version: '1.0.1',
      prop1: 'prop1',
      prop2: 'prop2',
      type: 'init',
    });
  });

  it('Group deploy plugins should work', async () => {
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
    const res = await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'add',
            pluginName: 'test-plugin1',
            options: {
              prop1: 'prop1',
            },
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
      { name: 'test-plugin1', version: '1.0.0', type: 'init', prop1: 'prop1' },
      { name: 'test-plugin2', version: '1.0.0', type: 'init' },
    ]);

    expect(res.msg).toMatch('Deployed multiple changes to testapp by');

    expect(testJsPlugin.museCore.pm.deployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeDeployPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterDeployPlugin).toBeCalledTimes(1);
  });

  it('Group deployments including undeployment should work', async () => {
    const appName = 'testapp';
    const pluginName1 = 'test-plugin1';
    const pluginName2 = 'test-plugin2';

    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName: 'feature' });

    await muse.pm.createPlugin({ pluginName: pluginName1, type: 'init' });
    await muse.pm.releasePlugin({ pluginName: pluginName1 });
    await muse.pm.createPlugin({ pluginName: pluginName2, type: 'init' });
    await muse.pm.releasePlugin({ pluginName: pluginName2 });

    const res1 = await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'add',
            pluginName: pluginName1,
          },
        ],
      },
    });
    const plugins1 = await muse.pm.getDeployedPlugins(appName, 'staging');
    expect(plugins1).toEqual([{ name: 'test-plugin1', version: '1.0.0', type: 'init' }]);
    expect(res1.msg).toMatch(`Submitted ${pluginName1}@1.0.0 to ${appName}/staging by`);

    const res2 = await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'remove',
            pluginName: pluginName1,
          },
          {
            type: 'add',
            pluginName: pluginName2,
          },
        ],
      },
    });
    expect(res2.msg).toMatch(`Deployed multiple changes to ${appName} by`);

    const plugins2 = await muse.pm.getDeployedPlugins(appName, 'staging');

    expect(plugins2).toEqual([{ name: 'test-plugin2', version: '1.0.0', type: 'init' }]);
    expect(testJsPlugin.museCore.pm.deployPlugin).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.pm.beforeDeployPlugin).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.pm.afterDeployPlugin).toBeCalledTimes(2);

    // Deploy same plugin to multiple envs
    const res3 = await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'add',
            pluginName: pluginName1,
          },
        ],
        feature: [
          {
            type: 'add',
            pluginName: pluginName1,
          },
        ],
      },
    });
    expect(res3.msg).toMatch(`Submitted ${pluginName1}@1.0.0 to ${appName}/staging, feature by`);

    // Undeploy same plugin from multiple envs
    const res4 = await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'remove',
            pluginName: pluginName1,
          },
        ],
        feature: [
          {
            type: 'remove',
            pluginName: pluginName1,
          },
        ],
      },
    });
    expect(res4.msg).toMatch(`Undeployed ${pluginName1} from ${appName}/staging, feature by`);

    // Undeploy one plugin from one env
    const res5 = await muse.pm.deployPlugin({
      appName,
      envMap: {
        staging: [
          {
            type: 'remove',
            pluginName: pluginName2,
          },
        ],
      },
    });
    expect(res5.msg).toMatch(`Undeployed ${pluginName2}@1.0.0 from ${appName}/staging by`);
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
