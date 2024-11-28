const { vol } = require('memfs');
const muse = require('../../');

describe('Set plugin variables', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('add/delete plugin default variables', async () => {
    const appName = 'mcbapp';
    const pluginName = 'plugin1';
    await muse.am.createApp({ appName, author: 'mcb' });
    await muse.pm.createPlugin({ pluginName, author: 'mcb' });

    // add default variables
    await muse.pm.setVariable({
      appName,
      pluginName,
      variables: [
        { name: 'var1', value: 'value1' },
        { name: 'var2', value: 'value2' },
      ],
    });

    let app = await muse.am.getApp(appName);
    expect(Object.keys(app.pluginVariables.plugin1).length).toBe(2);
    expect(Object.keys(app.pluginVariables.plugin1)).toContain('var1');
    expect(Object.keys(app.pluginVariables.plugin1)).toContain('var2');
    expect(app.pluginVariables.plugin1['var1']).toBe('value1');
    expect(app.pluginVariables.plugin1['var2']).toBe('value2');

    // remove default variables
    await muse.pm.deleteVariable({
      appName,
      pluginName,
      variables: ['var1', 'var2'],
    });
    app = await muse.am.getApp(appName);
    expect(app.pluginVariables.plugin1).toBeTruthy();
    expect(Object.keys(app.pluginVariables.plugin1).length).toBe(0);
  });

  it('add/delete plugin variables for specific env.', async () => {
    const appName = 'app1';
    const envName = 'test';
    const pluginName = 'plugin1';

    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });
    await muse.pm.createPlugin({ pluginName, author: 'nate' });

    // add variables on env. specific plugin
    await muse.pm.setVariable({
      appName,
      pluginName,
      variables: [
        { name: 'var1', value: 'value1' },
        { name: 'var2', value: 'value2' },
      ],
      envNames: [envName],
    });

    let app = await muse.am.getApp(appName);

    expect(app.envs.test.pluginVariables).toBeTruthy();
    expect(Object.keys(app.envs.test.pluginVariables.plugin1).length).toBe(2);
    expect(Object.keys(app.envs.test.pluginVariables.plugin1)).toContain('var1');
    expect(Object.keys(app.envs.test.pluginVariables.plugin1)).toContain('var2');
    expect(app.envs.test.pluginVariables.plugin1['var1']).toBe('value1');
    expect(app.envs.test.pluginVariables.plugin1['var2']).toBe('value2');

    // remove variables on deployed plugin
    await muse.pm.deleteVariable({
      appName,
      pluginName,
      variables: ['var1', 'var2'],
      envNames: [envName],
    });
    app = await muse.am.getApp(appName);
    expect(app.envs.test.pluginVariables.plugin1).toBeTruthy();
    expect(Object.keys(app.envs.test.pluginVariables.plugin1).length).toBe(0);
  });

  it('It throws exception if app does not exist.', async () => {
    const appName = 'app1';
    const pluginName = 'pluginName-not-exist';
    const envName = 'test';

    try {
      await muse.pm.setVariable({
        appName,
        pluginName,
        variables: ['var1', 'var2'],
        envNames: [envName],
      });
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });

  it('It throws exception if plugin does not exist.', async () => {
    const appName = 'app1';
    const pluginName = 'pluginName-not-exist';
    const envName = 'test';

    try {
      await muse.am.createApp({ appName, author: 'nate' });
      await muse.pm.setVariable({
        appName,
        pluginName,
        variables: ['var1', 'var2'],
        envNames: [envName],
      });
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
