const { vol } = require('memfs');
const muse = require('../..');

describe('Upsert plugin variables', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('upsert plugin default variables', async () => {
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

    // update default variables
    await muse.pm.setVariable({
      pluginName,
      variables: [{ name: 'var1', value: 'new-value' }],
    });
    plugin = await muse.pm.getPlugin(pluginName);
    expect(plugin.variables).toBeTruthy();
    expect(Object.keys(plugin.variables).length).toBe(2);
    expect(Object.keys(plugin.variables)).toContain('var1');
    expect(Object.keys(plugin.variables)).toContain('var2');
    expect(plugin.variables['var1']).toBe('new-value');
    expect(plugin.variables['var2']).toBe('value2');
  });

  it('upsert deployed plugin variables', async () => {
    const appName = 'app1';
    const envName = 'test';
    const pluginName = 'plugin1';

    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    await muse.pm.createPlugin({ pluginName, author: 'nate' });
    await muse.pm.releasePlugin({ pluginName });
    await muse.pm.deployPlugin({ appName, envName, pluginName, version: '1.0.0' });

    // add deployed plugin variables
    await muse.pm.setVariable({
      pluginName,
      variables: [
        { name: 'var1', value: 'value1' },
        { name: 'var2', value: 'value2' },
      ],
      appName,
      envName,
    });

    let plugin = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(plugin.variables).toBeTruthy();
    expect(Object.keys(plugin.variables).length).toBe(2);
    expect(Object.keys(plugin.variables)).toContain('var1');
    expect(Object.keys(plugin.variables)).toContain('var2');
    expect(plugin.variables['var1']).toBe('value1');
    expect(plugin.variables['var2']).toBe('value2');

    // update deployed plugin variables
    await muse.pm.setVariable({
      pluginName,
      variables: [{ name: 'var1', value: 'new-value' }],
      appName,
      envName,
    });
    plugin = await muse.pm.getDeployedPlugin(appName, envName, pluginName);
    expect(plugin.variables).toBeTruthy();
    expect(Object.keys(plugin.variables).length).toBe(2);
    expect(Object.keys(plugin.variables)).toContain('var1');
    expect(Object.keys(plugin.variables)).toContain('var2');
    expect(plugin.variables['var1']).toBe('new-value');
    expect(plugin.variables['var2']).toBe('value2');
  });
});
