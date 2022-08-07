const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      updateEnv: jest.fn(),
      beforeUpdateEnv: jest.fn(),
      afterUpdateEnv: jest.fn(),
      failedUpdateEnv: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Update env basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Update env should work', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.updateEnv({
      appName,
      envName,
      changes: {
        set: [{ path: 'url', value: 'test.com' }],
      },
    });

    const app = await muse.am.getApp(appName);
    expect(app.envs[envName]).toMatchObject({ name: envName, url: 'test.com', createdBy: 'nate' });
    expect(testJsPlugin.museCore.am.updateEnv).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.beforeUpdateEnv).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.afterUpdateEnv).toBeCalledTimes(1);
  });

  it('It throws exception if env name does not exists.', async () => {
    const appName = 'testapp';
    const envName = 'staging2';
    await muse.am.createApp({ appName, author: 'nate' });
    // await muse.am.updateEnv({ appName, envName, author: 'nate' });

    try {
      await muse.am.updateEnv({
        appName,
        envName,
        changes: { set: { path: 'foo', value: 'bar' } },
      });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
