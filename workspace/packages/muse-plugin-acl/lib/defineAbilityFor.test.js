jest.mock('js-plugin');
const { subject } = require('@casl/ability');

describe('Define Ability For tests', () => {
  let defineAbilityFor;
  beforeEach(() => {
    defineAbilityFor = require('./')().exports.defineAbilityFor;
  });

  it('Admin should be able to manage all subjects.', async () => {
    const ability = defineAbilityFor({ username: 'someuser', isMuseAdmin: true });
    expect(ability.can('manage', 'all')).toBe(true);
    expect(ability.can('manage', subject('Plugin', { owners: ['someuser'] }))).toBe(true);
    expect(ability.can('manage', subject('Plugin', { owners: ['someuser'] }))).toBe(true);
  });

  it('Define Ability For non-admin user', async () => {
    const ability = defineAbilityFor({ username: 'someuser', isMuseAdmin: false });
    expect(ability.can('manage', 'all')).toBe(false);
    const obj = { owners: ['someuser'] };
    expect(ability.can('manage', subject('Plugin', { ...obj }))).toBe(true);
    expect(ability.can('manage', subject('App', { ...obj }))).toBe(true);
    expect(ability.can('manage', subject('Plugin', { owners: ['someuser2'] }))).toBe(false);
  });

  it('Define Ability For anonymous user', async () => {
    const ability = defineAbilityFor();
    expect(ability.can('manage', subject('Plugin', { owners: ['someuser'] }))).toBe(false);
    expect(ability.can('manage', subject('Plugin', { owners: ['someuser2'] }))).toBe(false);
    expect(ability.can('manage', subject('Plugin', {}))).toBe(false);
  });

  it('App owners should be able to manage app owned plugins.', () => {
    const ability = defineAbilityFor({ username: 'someuser' });
    expect(
      ability.can(
        'manage',
        subject('Plugin', {
          app: { name: 'app1', owners: ['someuser'] },
          plugin: { app: 'app1' },
        }),
      ),
    ).toBe(true);

    // Can't manage not-owned plugin
    expect(
      ability.can(
        'manage',
        subject('Plugin', {
          app: { name: 'app1', owners: ['someuser'] },
          plugin: { app: 'app2' },
        }),
      ),
    ).toBe(false);
  });

  it('App or plugin owners can config plugin', () => {
    const ability = defineAbilityFor({ username: 'someuser' });
    // App owners can config plugin
    expect(
      ability.can('config', subject('Plugin', { app: { owners: ['someuser'] }, plugin: {} })),
    ).toBe(true);

    // Plugin owners can config plugin
    expect(
      ability.can('config', subject('Plugin', { app: {}, plugin: { owners: ['someuser'] } })),
    ).toBe(true);

    // Unauthorized user can't config plugin
    expect(
      ability.can('config', subject('Plugin', { app: { owners: ['someuser2'] }, plugin: {} })),
    ).toBe(false);
  });

  it('Plugin owner can update app for changes to config and variables', () => {
    const ability = defineAbilityFor({ username: 'someuser' });

    // App owner can always update app
    expect(
      ability.can(
        'update',
        subject('App', {
          app: { owners: ['someuser'] },
          plugin: {},
          changes: {},
        }),
      ),
    ).toBe(true);

    // Can't update app if not app owner nor plugin owner
    expect(
      ability.can(
        'update',
        subject('App', {
          app: {},
          plugin: { owners: ['someuser2'] },
          changes: {},
        }),
      ),
    ).toBe(false);

    // Plugin owner can update config or variables
    expect(
      ability.can(
        'update',
        subject('App', {
          app: {},
          plugin: { name: '@ebay/some-plugin', owners: ['someuser'] },
          changes: {
            set: [
              { path: 'pluginConfig.@ebay/some-plugin.allowlist', value: true },
              { path: 'pluginVariables.@ebay/some-plugin.apiEndpoint', value: 'https://api' },
            ],
            unset: [
              'pluginConfig.@ebay/some-plugin.allowlist',
              'pluginVariables.@ebay/some-plugin.apiEndpoint',
            ],
            push: [
              { path: 'pluginConfig.@ebay/some-plugin.allowlist', value: true },
              { path: 'pluginVariables.@ebay/some-plugin.apiEndpoint', value: 'https://api' },
            ],
            remove: [
              { path: 'pluginConfig.@ebay/some-plugin.allowlist', value: true },
              { path: 'pluginVariables.@ebay/some-plugin.apiEndpoint', value: 'https://api' },
            ],
          },
        }),
      ),
    ).toBe(true);

    // Plugin owner can't update props out of config and variables
    ['set', 'push', 'remove'].forEach((name) => {
      expect(
        ability.can(
          'update',
          subject('App', {
            app: {},
            plugin: { name: '@ebay/some-plugin', owners: ['someuser'] },
            changes: {
              [name]: [{ path: 'config.theme', value: 'light' }],
            },
          }),
        ),
      ).toBe(false);
    });
  });
});
