const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    am: {
      updateApp: jest.fn(),
      beforeUpdateApp: jest.fn(),
      afterUpdateApp: jest.fn(),
      failedUpdateApp: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Update app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Update app should work', async () => {
    const appName = 'testapp';
    await muse.am.createApp({ appName, author: 'nate', envName: null });

    await muse.am.updateApp({
      appName: 'testapp',
      changes: {
        set: {
          path: 'prop1',
          value: 'prop1',
        },
      },
    });
    const app = await muse.am.getApp(appName);
    expect(app.prop1).toBe('prop1');
    expect(testJsPlugin.museCore.am.updateApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.beforeUpdateApp).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.am.afterUpdateApp).toBeCalledTimes(1);
  });

  it('It throws exception if app does not exist.', async () => {
    const appName = 'testapp-not-exist';

    try {
      await muse.am.updateApp({ appName });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
