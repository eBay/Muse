const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

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
