jest.mock('js-plugin');
describe('Define Ability For tests', () => {
  class Plugin {
    constructor(options) {
      this.owners = options.owners;
    }
  }
  let defineAbilityFor;
  beforeEach(() => {
    defineAbilityFor = require('./')().exports.defineAbilityFor;
  });
  it('Define Ability For admin user', async () => {
    const ability = defineAbilityFor({ username: 'mockUser', isMuseAdmin: true });
    expect(ability.can('manage', 'all')).toEqual(true);
    expect(ability.can('manage', new Plugin({ owners: 'mockUser' }))).toEqual(true);
    expect(ability.can('manage', new Plugin({ owners: 'mockUser' }))).toEqual(true);
  });
  it('Define Ability For non-admin user', async () => {
    const ability = defineAbilityFor({ username: 'mockUser', isMuseAdmin: false });
    expect(ability.can('manage', 'all')).toEqual(false);
    expect(ability.can('manage', new Plugin({ owners: 'mockUser' }))).toEqual(true);
    expect(ability.can('manage', new Plugin({ owners: 'mockUser2' }))).toEqual(false);
  });
  it('Define Ability For empty user', async () => {
    const ability = defineAbilityFor();
    expect(ability.can('manage', new Plugin({ owners: 'mockUser' }))).toEqual(false);
    expect(ability.can('manage', new Plugin({ owners: 'mockUser2' }))).toEqual(false);
    expect(ability.can('manage', new Plugin({}))).toEqual(true);
  });
});
