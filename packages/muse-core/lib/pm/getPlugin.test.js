const { vol } = require('memfs');
const muse = require('../');

jest.mock('fs');
jest.mock('fs/promises');

describe('Get plugin basic tests.', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('Get plugin should return correct json', async () => {
    const pluginName = 'test-plugin';
    await muse.pm.createPlugin({ pluginName, author: 'nate' });
    const result = await muse.pm.getPlugin(pluginName);
    expect(result).toMatchObject({ name: pluginName, createdBy: 'nate', owners: ['nate'] });
  });

  it('It returns null if plugin not exists.', async () => {
    const pluginName = 'test-plugin-not-exist';
    const p = await muse.pm.getPlugin(pluginName);
    expect(p).toBe(null);
  });
});
