const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    req: {
      deleteStatus: jest.fn(),
      beforeDeleteStatus: jest.fn(),
      afterDeleteStatus: jest.fn(),
      failedDeleteStatus: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Delete request status basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Delete status should work', async () => {
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });

    await muse.req.updateStatus({
      requestId: req.id,
      status: [
        {
          name: 'test-status',
          state: 'pending',
        },
        {
          name: 'test-status-2',
          state: 'success',
        },
      ],
    });
    let result = await muse.req.getRequest(req.id);
    expect(result.statuses[0]).toMatchObject({ name: 'test-status', state: 'pending' });
    expect(result.statuses[1]).toMatchObject({ name: 'test-status-2', state: 'success' });
    await muse.req.deleteStatus({ requestId: req.id, status: 'test-status' });
    result = await muse.req.getRequest(req.id);

    expect(result.statuses[0]).toMatchObject({ name: 'test-status-2', state: 'success' });

    expect(testJsPlugin.museCore.req.deleteStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeDeleteStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterDeleteStatus).toBeCalledTimes(1);
  });

  it('It throws exception if request does not exist.', async () => {
    try {
      await muse.req.deleteStatus({ requestId: 'not-exist' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
