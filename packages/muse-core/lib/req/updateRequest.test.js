const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    req: {
      updateRequest: jest.fn(),
      beforeUpdateRequest: jest.fn(),
      afterUpdateRequest: jest.fn(),
      failedUpdateRequest: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Update app basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Update app should work', async () => {
    const type = 'deploy-plugin';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ type, author: 'nate', payload });

    await muse.req.updateRequest({
      requestId: req.id,
      changes: {
        set: {
          path: 'prop1',
          value: 'prop1',
        },
      },
    });
    const result = await muse.req.getRequest(req.id);
    expect(result.prop1).toBe('prop1');
    expect(testJsPlugin.museCore.req.updateRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeUpdateRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterUpdateRequest).toBeCalledTimes(1);
  });

  it('It throws exception if request does not exist.', async () => {
    try {
      await muse.req.updateRequest({ requestId: 'not-exist' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
