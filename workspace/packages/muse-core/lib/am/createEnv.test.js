const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const { getDeployedPlugins } = require('../pm');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      createEnv: jest.fn(),
      beforeCreateEnv: jest.fn(),
      afterCreateEnv: jest.fn(),
      failedCreateEnv: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Create env basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Create env should work', async () => {
    const appName = 'testapp';
    const envName = 'feature';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });

    const app = await muse.am.getApp(appName);
    expect(app.envs[envName]).toMatchObject({ name: envName, createdBy: 'nate' });
    expect(testJsPlugin.museCore.am.createEnv).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.am.beforeCreateEnv).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.am.afterCreateEnv).toBeCalledTimes(2);
  });

  it('Create env with baseEnv should work', async () => {
    const baseAppName = 'baseapp';
    await muse.am.createApp({ appName: baseAppName });
    await muse.pm.createPlugin({ pluginName: 'p1' });
    await muse.pm.releasePlugin({ pluginName: 'p1' });
    await muse.pm.deployPlugin({
      appName: baseAppName,
      envName: 'staging',
      pluginName: 'p1',
    });
    const appName = 'testapp';
    const envName = 'feature';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate', baseEnv: 'baseapp/staging' });

    const app = await muse.am.getApp(appName);
    expect(app.envs[envName]).toMatchObject({ name: envName, createdBy: 'nate' });
    const deployPlugins = await getDeployedPlugins(appName, envName);
    expect(deployPlugins[0]).toMatchObject({
      name: 'p1',
      version: '1.0.0',
    });
    expect(testJsPlugin.museCore.am.createEnv).toBeCalledTimes(3);
    expect(testJsPlugin.museCore.am.beforeCreateEnv).toBeCalledTimes(3);
    expect(testJsPlugin.museCore.am.afterCreateEnv).toBeCalledTimes(3);
  });

  it('It throws exception if env name already exists.', async () => {
    const appName = 'testapp';
    const envName = 'feature';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });

    try {
      await muse.am.createEnv({ appName, envName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`already exists`);
    }
  });
});
