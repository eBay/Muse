const { vol } = require('memfs');
const muse = require('../');
const plugin = require('js-plugin');

describe('Get requests basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get requests', async () => {
    let requests = await muse.req.getRequests();
    expect(requests.length).toBe(0);
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });
    requests = await muse.req.getRequests();
    expect(requests.length).toBe(1);
    expect(requests[0]).toMatchObject(req);
  });

  it('Fail to get Requests should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        req: {
          getRequests: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeGetRequests: jest.fn(),
          afterGetRequests: jest.fn(),
          failedGetRequests: jest.fn(),
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

    await muse.req.createRequest({ id, type, author: 'nate', payload });

    try {
      await muse.req.getRequests();
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.req.getRequests).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.beforeGetRequests).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.failedGetRequests).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.afterGetRequests).toBeCalledTimes(0);
  });
});
