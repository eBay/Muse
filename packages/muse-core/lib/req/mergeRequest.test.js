const { vol } = require('memfs');
const plugin = require('js-plugin');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    req: {
      mergeRequest: jest.fn(),
      beforeMergeRequest: jest.fn(),
      afterMergeRequest: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Merge request basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Merge request should work', async () => {
    await muse.am.createApp({ appName: 'app1' });
    await muse.am.createEnv({ appName: 'app1', envName: 'staging' });
    await muse.pm.createPlugin({ pluginName: 'plugin1' });
    await muse.pm.releasePlugin({ pluginName: 'plugin1', version: '1.0.0' });
    const type = 'deploy-plugin';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'plugin1',
      version: '1.0.0',
    };

    const req = await muse.req.createRequest({ type, author: 'nate', payload });

    // Before merge, the plugin should have not been deployed
    expect(await muse.pm.getDeployedPlugin('app1', 'staging', 'plugin1')).toBeNull();

    // Merge the request
    await muse.req.mergeRequest({ requestId: req.id });

    // After merge, the request should have been deleted
    expect(await muse.req.getRequest(req.id)).toBeNull();

    // The plugin should have been deployed
    expect(await muse.pm.getDeployedPlugin('app1', 'staging', 'plugin1')).toMatchObject({
      name: 'plugin1',
      version: '1.0.0',
    });

    expect(testJsPlugin.museCore.req.mergeRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeMergeRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterMergeRequest).toBeCalledTimes(1);
  });
});
