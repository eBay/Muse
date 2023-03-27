import { useEffect, useState } from 'react';
import { subject } from '@casl/ability';
import defineAbilityFor from '@ebay/muse-plugin-acl/lib/defineAbilityFor';
import museClient from '../museClient';
const user = window.MUSE_GLOBAL.getUser();

// Permission check based on @casl/ability
// NOTE: if no user, then it means the Muse system hasn't enabled permission check.
// It will then always return true.
let cachedAdmins = ['pwang7'];
export default function useAbility(subjectType) {
  const [admins, setAdmins] = useState(cachedAdmins);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!cachedAdmins && user?.username) {
      museClient.data
        .get('muse.admins')
        .then((d) => {
          console.log('get admins');
          cachedAdmins = d;
          setAdmins(d);
        })
        .catch((err) => {
          setError(err);
        });
    }
  }, []);
  const userObj = {
    username: user.username,
    isMuseAdmin: !user?.username || admins?.includes(user.username),
  };
  const ability = defineAbilityFor(userObj);
  return {
    can: (action, subjectObj) => {
      return ability.can(action, subject(subjectType, subjectObj));
    },
    cannot: (action, subjectObj) => {
      return ability.cannot(action, subject(subjectType, subjectObj));
    },
    rawAbility: ability,
    error,
  };
}
