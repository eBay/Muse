const { vol } = require('memfs');
const plugin = require('js-plugin');
const { jsonByYamlBuff } = require('../utils');
const { registry } = require('../storage');
const muse = require('../');

const testJsPlugin = {
  name: 'test',
  museCore: {
    req: {
      createRequest: jest.fn(),
      beforeCreateRequest: jest.fn(),
      afterCreateRequest: jest.fn(),
    },
  },
};
plugin.register(testJsPlugin);
describe('Create request basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Create request should create the correct yaml file', async () => {
    const type = 'deploy-plugin';
    const id = 'testid';
    const payload = {
      appName: 'app1',
      envName: 'staging',
      pluginName: 'test-plugin',
      version: '1.0.0',
    };
    const req = await muse.req.createRequest({ id, type, author: 'nate', payload });
    const result = jsonByYamlBuff(await registry.get(`/requests/${req.id}.yaml`));
    expect(result).toMatchObject({ id: req.id, createdBy: 'nate', payload });

    expect(testJsPlugin.museCore.req.createRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.beforeCreateRequest).toBeCalledTimes(1);
    expect(testJsPlugin.museCore.req.afterCreateRequest).toBeCalledTimes(1);
  });

  // it('It throws exception if plugin name exists.', async () => {
  //   const appName = 'testapp';
  //   await muse.req.createRequest({ appName, author: 'nate' });

  //   try {
  //     await muse.req.createRequest({ appName, author: 'nate' });
  //     expect(true).toBe(false); // above statement should throw error
  //   } catch (err) {
  //     expect(err?.message).toMatch('already exists');
  //   }
  // });
});
