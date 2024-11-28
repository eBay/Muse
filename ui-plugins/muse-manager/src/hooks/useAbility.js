import { subject } from '@casl/ability';
import defineAbilityFor from '@ebay/muse-plugin-acl/lib/defineAbilityFor';
import { useMuseData } from '../hooks';
const user = window.MUSE_GLOBAL?.getUser();

// Permission check based on @casl/ability
// NOTE: if no user, then it means the Muse system hasn't enabled permission check.
// It will then always return true.

// This is the default implementation of the ability.
// It can be extended by the app by defining a new ability in the app.

export default function useAbility() {
  const { data: admins, error } = useMuseData('muse.admins');
  const userObj = {
    username: user?.username || 'anonymous',
    isMuseAdmin: !user?.username || admins?.includes(user.username),
  };
  const ability = defineAbilityFor(userObj);
  // only after admins get, set the final ability instance
  return {
    can: (action, subjectType, subjectObj) => {
      return ability.can(action, subject(subjectType, subjectObj));
    },
    cannot: (action, subjectType, subjectObj) => {
      return ability.cannot(action, subject(subjectType, subjectObj));
    },
    rawAbility: ability,
    caslSubject: subject,
    error,
  };
}
