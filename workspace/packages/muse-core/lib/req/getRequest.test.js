const { vol } = require('memfs');
const muse = require('../');
const plugin = require('js-plugin');

describe('Get request basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get app should return correct json', async () => {
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });
    const result = await muse.req.getRequest(req.id);
    expect(result).toMatchObject({ id: req.id, createdBy: 'nate', payload });
  });

  it('It returns null if request id not exists.', async () => {
    const result = await muse.req.getRequest('none-exist-id');
    expect(result).toBe(null);
  });

  it('Fail to get request should throw the error', async () => {
    const testJsPluginFails = {
      name: 'testFail',
      museCore: {
        req: {
          getRequest: jest.fn().mockRejectedValue(new Error('Async error')),
          beforeGetRequest: jest.fn(),
          afterGetRequest: jest.fn(),
          failedGetRequest: jest.fn(),
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

    try {
      await muse.req.getRequest({ requestId: req.id });
    } catch (e) {
      expect(e.message).toEqual('Async error');
    }

    expect(testJsPluginFails.museCore.req.getRequest).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.beforeGetRequest).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.failedGetRequest).toBeCalledTimes(1);
    expect(testJsPluginFails.museCore.req.afterGetRequest).toBeCalledTimes(0);
  });
});
