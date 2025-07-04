const { vol } = require('memfs');
const muse = require('../..');

describe('Upsert application variables', () => {
  beforeEach(() => {
    vol.reset();
  });
  it('upsert app default variables', async () => {
    const appName = 'app1';
    await muse.am.createApp({ appName, author: 'nate' });

    // add default variables
    await muse.am.setVariable({
      appName,
      variables: [
        { name: 'var1', value: 'value1' },
        { name: 'var2', value: 'value2' },
      ],
    });

    let app = await muse.am.getApp(appName);
    expect(app.variables).toBeTruthy();
    expect(Object.keys(app.variables).length).toBe(2);
    expect(Object.keys(app.variables)).toContain('var1');
    expect(Object.keys(app.variables)).toContain('var2');
    expect(app.variables['var1']).toBe('value1');
    expect(app.variables['var2']).toBe('value2');

    // update default variables
    await muse.am.setVariable({
      appName,
      variables: [{ name: 'var1', value: 'new-value' }],
    });

    app = await muse.am.getApp(appName);
    expect(app.variables).toBeTruthy();
    expect(Object.keys(app.variables).length).toBe(2);
    expect(Object.keys(app.variables)).toContain('var1');
    expect(Object.keys(app.variables)).toContain('var2');
    expect(app.variables['var1']).toBe('new-value');
    expect(app.variables['var2']).toBe('value2');
  });

  it('add/delete app env variables', async () => {
    const appName = 'app1';
    const envName = 'test';
    await muse.am.createApp({ appName, author: 'nate' });
    await muse.am.createEnv({ appName, envName, author: 'nate' });

    // add env variables
    await muse.am.setVariable({
      appName,
      variables: [
        { name: 'var1', value: 'value1' },
        { name: 'var2', value: 'value2' },
      ],
      envNames: [envName],
    });

    let app = await muse.am.getApp(appName);
    expect(app.variables).toBeFalsy();
    expect(app.envs.test.variables).toBeTruthy();
    expect(Object.keys(app.envs.test.variables).length).toBe(2);
    expect(Object.keys(app.envs.test.variables)).toContain('var1');
    expect(Object.keys(app.envs.test.variables)).toContain('var2');
    expect(app.envs.test.variables['var1']).toBe('value1');
    expect(app.envs.test.variables['var2']).toBe('value2');

    // update env variables
    await muse.am.setVariable({
      appName,
      variables: [{ name: 'var1', value: 'new-value' }],
      envNames: [envName],
    });

    app = await muse.am.getApp(appName);
    expect(app.variables).toBeFalsy();
    expect(app.envs.test.variables).toBeTruthy();
    expect(Object.keys(app.envs.test.variables).length).toBe(2);
    expect(Object.keys(app.envs.test.variables)).toContain('var1');
    expect(Object.keys(app.envs.test.variables)).toContain('var2');
    expect(app.envs.test.variables['var1']).toBe('new-value');
    expect(app.envs.test.variables['var2']).toBe('value2');
  });
  it('It throws exception if app does not exist.', async () => {
    const appName = 'app1';

    try {
      await muse.am.setVariable({
        appName,
        variables: [
          { name: 'var1', value: 'value1' },
          { name: 'var2', value: 'value2' },
        ],
      });
    } catch (err) {
      expect(err?.message).toMatch(`doesn't exist`);
    }
  });
});
