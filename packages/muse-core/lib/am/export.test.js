const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');
const unzipper = require('unzipper');

jest.mock('unzipper');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      beforeExport: jest.fn(),
      afterExport: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Export basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Export should work', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    const pluginName = 'test-plugin';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });

    await muse.pm.createPlugin({ pluginName, type: 'boot' });
    await muse.pm.releasePlugin({
      pluginName,
      version: 'minor',
      author: 'nate',
    });
    await muse.pm.deployPlugin({ appName, envName, pluginName, version: '1.0.0', options: { prop1: 'prop1' } });

    unzipper.Open.buffer.mockResolvedValue({
      extract: ({path}) => {
        console.log(`mock extract from ${path}`);
      }
    });
    muse.storage.assets.get = jest.fn(assetsZipKey => {console.log(`mock asset get for ${assetsZipKey}`); return 'test'; });
    await muse.am.export({ appName, envName, output: 'exportutonly' });

    // const app = await muse.am.getApp(appName);
    // expect(app.envs.staging).toMatchObject({ name: envName, createdBy: 'nate' });
    expect(unzipper.Open.buffer).toBeCalledTimes(1);
    expect(muse.storage.assets.get).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.beforeExport).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.afterExport).toBeCalledTimes(1);
  });

  it('It throws exception if app not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';

    try {
      await muse.am.export({ appName, envName, output: 'exportutonly' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`App ${appName} doesn't exist.`);
    }
  });

  it('It throws exception if env not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    await muse.am.createApp({ appName, author: 'nate' });

    try {
      await muse.am.export({ appName, envName, output: 'exportutonly' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`Env ${envName} not exists.`);
    }
  });
});
