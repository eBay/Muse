const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      deleteEnv: jest.fn(),
      beforeDeleteEnv: jest.fn(),
      afterDeleteEnv: jest.fn(),
      failedDeleteEnv: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Delete env basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Delete env should work', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.deleteEnv({ appName, envName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    await muse.am.deleteEnv({ appName, envName, author: 'nate' });

    const app = await muse.am.getApp(appName);
    expect(app.envs?.staging).toBeUndefined();
    expect(testJsPlugin.museCore.am.deleteEnv).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.am.beforeDeleteEnv).toBeCalledTimes(2);
    expect(testJsPlugin.museCore.am.afterDeleteEnv).toBeCalledTimes(2);
  });
});
