const { vol } = require('memfs');
const muse = require('../');

jest.mock('fs');
jest.mock('fs/promises');

describe('Get plugins basic tests.', () => {
  beforeEach(() => {
    vol.reset();
    vol.fromJSON({});
  });

  it('Get plugins', async () => {
    let plugins = await muse.pm.getPlugins();
    expect(plugins.length).toBe(0);
    await muse.pm.createPlugin({ pluginName: 'test', author: 'nate' });
    plugins = await muse.pm.getPlugins();
    expect(plugins.length).toBe(1);
    expect(plugins[0]).toMatchObject({ name: 'test', createdBy: 'nate' });
  });
});
