const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const { registry } = require('../storage');
const { getPluginId } = require('../utils');

const testJsPlugin = {
  name: 'test',
  museCore: {
    pm: {
      getDeployedPlugin: jest.fn(),
      beforeGetDeployedPlugin: jest.fn(),
      afterGetDeployedPlugin: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Get deployed plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get deployed plugin should return correct json', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';

    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName });

    const pid = getPluginId(pluginName);
    await registry.set(
      `/apps/${appName}/${envName}/${pid}.yaml`,
      `
name: ${pluginName}
version: 1.0.1
    `,
    );

    const p = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(p).toMatchObject({ name: pluginName, version: '1.0.1' });

    expect(testJsPlugin.museCore.pm.getDeployedPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.beforeGetDeployedPlugin).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.pm.afterGetDeployedPlugin).toBeCalledTimes(1);
  });

  it('It returns null if deployed plugin not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';

    await muse.am.createApp({ appName });
    await muse.am.createEnv({ appName, envName });

    const p = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(p).toBeNull();
  });

  it('It throws exception if app not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';

    try {
      await muse.pm.getDeployedPlugin(appName, envName, pluginName);
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`App ${appName} doesn't exist`);
    }
  });

  it('It throws exception if app not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    await muse.am.createApp({ appName });

    try {
      await muse.pm.getDeployedPlugin(appName, envName, pluginName);
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`Env ${appName}/${envName} doesn't exist`);
    }
  });
});
