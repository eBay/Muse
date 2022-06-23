const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('..');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      deleteApp: jest.fn(),
      beforeDeleteApp: jest.fn(),
      afterDeleteApp: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Delete app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Delete app should delete the app folder', async () => {
    const appName = 'testapp';
    const envName = 'staging';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    await muse.am.deleteApp({ appName, author: 'nate' });

    const app = await muse.am.getApp(appName);
    expect(app).toBeUndefined;
    expect(testJsPlugin.museCore.am.deleteApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.beforeDeleteApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.afterDeleteApp).toBeCalledTimes(1);
  });
});
