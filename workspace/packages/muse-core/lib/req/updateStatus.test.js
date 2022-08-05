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
    const result = await muse.req.getRequest(req.id);
    expect(result.statuses[0]).toMatchObject({ name: 'test-status', state: 'pending' });
    expect(result.statuses[1]).toMatchObject({ name: 'test-status-2', state: 'success' });
    expect(testJsPlugin.museCore.req.updateStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeUpdateStatus).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterUpdateStatus).toBeCalledTimes(1);
  });

  it('It should auto merge the request after all statuses state is set to success.', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.pm.createPlugin({ pluginName: 'plugin1' });
    await muse.pm.releasePlugin({ pluginName: 'plugin1', version: '1.0.0' });
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'plugin1',
      version: '1.0.0',
    };

    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });

    // Before merge, the plugin should have not been deployed
    expect(await muse.pm.getDeployedPlugin('app1', 'staging', 'plugin1')).toBeNull();

    // Create a status on the request
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
    // Because there is a pending state, should not merge the request
    expect(await muse.pm.getDeployedPlugin('app1', 'staging', 'plugin1')).toBeNull();

    // Update status again to make all state success
    // Then the request should be merged
    await muse.req.updateStatus({
      requestId: req.id,
      status: {
        name: 'test-status',
        state: 'success',
      },
    });

    // After merge, the request should have been deleted
    expect(await muse.req.getRequest(req.id)).toBeNull();

    await muse.pm.deployPlugin({
      appName: 'app1',
      envName: 'staging',
      pluginName: 'plugin1',
      version: '1.0.0',
      options: { prop1: 'prop1' },
    });

    // The plugin should have been deployed
    expect(await muse.pm.getDeployedPlugin('app1', 'staging', 'plugin1')).toMatchObject({
      name: 'plugin1',
      version: '1.0.0',
    });
  });

  it('It throws exception if request does not exist.', async () => {
    try {
      await muse.req.updateStatus({ requestId: 'not-exist' });
      expect(true).toBe(false); // above statement should throw error
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
