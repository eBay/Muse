import { defineAbility } from '@casl/ability';

export default function defineAbilityFor({ user, app, plugin }) {
  return defineAbility((allow, forbid) => {
    allow('build', 'Plugin', { published: true });
    allow('deploy', 'Plugin', { published: true });
    allow('read', 'Article', { published: false, sharedWith: user.id });
  });
}
