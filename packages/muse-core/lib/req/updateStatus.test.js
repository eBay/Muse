const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    req: {
      updateStatus: jest.fn(),
      beforeUpdateStatus: jest.fn(),
      afterUpdateStatus: jest.fn(),
      failedUpdateStatus: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);

describe('Update request status basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('Update a single status should work', async () => {
    const type = 'deploy-plugin';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ type, author: 'nate', payload });

    await muse.req.updateStatus({
      requestId: req.id,
      status: {
        name: 'test-status',
        state: 'pending',
      },
    });
    const result = await muse.req.getRequest(req.id);
    expect(result.statuses[0]).toMatchObject({ name: 'test-status', state: 'pending' });
    expect(testJsPlugin.museCore.req.updateStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeUpdateStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterUpdateStatus).toBeCalledTimes(1);
  });

  it('Update multiple statuses should work', async () => {
    const type = 'deploy-plugin';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ type, author: 'nate', payload });

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
    const result = await muse.req.getRequest(req.id);
    expect(result.statuses[0]).toMatchObject({ name: 'test-status', state: 'pending' });
    expect(result.statuses[1]).toMatchObject({ name: 'test-status-2', state: 'success' });
    expect(testJsPlugin.museCore.req.updateStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeUpdateStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterUpdateStatus).toBeCalledTimes(1);
  });

  it('It should auto apply the request after all statuses state is set to success.', async () => {});

  it('It throws exception if request does not exist.', async () => {
    try {
      await muse.req.updateStatus({ requestId: 'not-exist' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
