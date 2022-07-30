const { vol } = require('memfs');
const muse = require('../../');

describe('Delete plugin variables', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('add/delete plugin default variables', async () => {
    const pluginName = 'plugin1';
    await muse.pm.createPlugin({ pluginName, author: 'nate' });

    // add default variables
    await muse.pm.setVariable({
      pluginName,
      variables: [
        { name: 'var1', value: 'value1' },
        { name: 'var2', value: 'value2' },
      ],
    });

    let plugin = await muse.pm.getPlugin(pluginName);
    expect(plugin.variables).toBeTruthy();
    expect(Object.keys(plugin.variables).length).toBe(2);
    expect(Object.keys(plugin.variables)).toContain('var1');
    expect(Object.keys(plugin.variables)).toContain('var2');
    expect(plugin.variables['var1']).toBe('value1');
    expect(plugin.variables['var2']).toBe('value2');

    // remove default variables
    await muse.pm.deleteVariable({
      pluginName,
      variables: ['var1', 'var2'],
    });
    plugin = await muse.pm.getPlugin(pluginName);
    expect(plugin.variables).toBeTruthy();
    expect(Object.keys(plugin.variables).length).toBe(0);
  });

  it('add/delete deployed plugin variables', async () => {
    const appName = 'app1';
    const envName = 'test';
    const pluginName = 'plugin1';

    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    await muse.pm.createPlugin({ pluginName, author: 'nate' });
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({ appName, envName, pluginName, version: '1.0.0' });

    // add variables on deployed plugin
    await muse.pm.setVariable({
      pluginName,
      variables: [
        { name: 'var1', value: 'value1' },
        { name: 'var2', value: 'value2' },
      ],
      appName,
      envNames: [envName],
    });

    let plugin = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(plugin.variables).toBeTruthy();
    expect(Object.keys(plugin.variables).length).toBe(2);
    expect(Object.keys(plugin.variables)).toContain('var1');
    expect(Object.keys(plugin.variables)).toContain('var2');
    expect(plugin.variables['var1']).toBe('value1');
    expect(plugin.variables['var2']).toBe('value2');

    // remove variables on deployed plugin
    await muse.pm.deleteVariable({
      pluginName,
      variables: ['var1', 'var2'],
      appName,
      envNames: [envName],
    });
    plugin = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(plugin.variables).toBeTruthy();
    expect(Object.keys(plugin.variables).length).toBe(0);
  });

  it('It throws exception if plugin does not exist.', async () => {
    const pluginName = 'pluginName-not-exist';
    const appName = 'app1';
    const envName = 'test';

    try {
      await muse.pm.deleteVariable({
        pluginName,
        variables: ['var1', 'var2'],
        appName,
        envNames: [envName],
      });
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
