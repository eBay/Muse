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
});
