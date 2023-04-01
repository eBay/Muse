jest.mock('js-plugin');
const { subject } = require('@casl/ability');

describe('Define Ability For tests', () => {
  let defineAbilityFor;
  beforeEach(() => {
    defineAbilityFor = require('./')().exports.defineAbilityFor;
  });

  it('Define Ability For admin user', async () => {
    const ability = defineAbilityFor({ username: 'mockUser', isMuseAdmin: true });
    expect(ability.can('manage', 'all')).toEqual(true);
    expect(ability.can('manage', subject('Plugin', { owners: ['mockUser'] }))).toEqual(true);
    expect(ability.can('manage', subject('Plugin', { owners: ['mockUser'] }))).toEqual(true);
  });

  it('Define Ability For non-admin user', async () => {
    const ability = defineAbilityFor({ username: 'mockUser', isMuseAdmin: false });
    expect(ability.can('manage', 'all')).toEqual(false);
    expect(ability.can('manage', subject('Plugin', { owners: ['mockUser'] }))).toEqual(true);
    expect(ability.can('manage', subject('Plugin', { owners: ['mockUser2'] }))).toEqual(false);
  });

  it('Define Ability For empty user', async () => {
    const ability = defineAbilityFor();
    expect(ability.can('manage', subject('Plugin', { owners: ['mockUser'] }))).toEqual(false);
    expect(ability.can('manage', subject('Plugin', { owners: ['mockUser2'] }))).toEqual(false);
    expect(ability.can('manage', subject('Plugin', {}))).toEqual(true);
  });

  it('App owners should be able to manage app owned plugins.', () => {
    const ability = defineAbilityFor({ username: 'mockUser' });
    expect(
      ability.can(
        'manage',
        subject('AppOwnedPlugin', {
          app: { name: 'app1', owners: ['mockUser'] },
          plugin: { app: 'app1' },
        }),
      ),
    ).toEqual(true);
  });
});
