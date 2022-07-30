const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    req: {
      deleteRequest: jest.fn(),
      beforeDeleteRequest: jest.fn(),
      afterDeleteRequest: jest.fn(),
      failedDeleteRequest: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Delete request basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Delete request should work', async () => {
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });
    let arr = await muse.req.getRequests();
    expect(arr.length).toBe(1);
    await muse.req.deleteRequest({ requestId: req.id });
    arr = await muse.req.getRequests();
    expect(arr.length).toBe(0);

    expect(testJsPlugin.museCore.req.deleteRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeDeleteRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterDeleteRequest).toBeCalledTimes(1);
  });
  it('Fail to Delete request should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        req: {
          deleteRequest: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeDeleteRequest: jest.fn(),
          afterDeleteRequest: jest.fn(),
          failedDeleteRequest: jest.fn(),
        },
      },
    };
    plugin.register(testJsPluginFails);
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };

    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });
    await muse.req.getRequests();

    try {
      await muse.req.deleteRequest({ requestId: req.id });
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.req.deleteRequest).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.beforeDeleteRequest).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.failedDeleteRequest).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.afterDeleteRequest).toBeCalledTimes(0);
  });
});
