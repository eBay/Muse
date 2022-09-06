import { useEffect, useState } from 'react';
import { subject } from '@casl/ability';
import defineAbilityFor from '@ebay/muse-plugin-acl/lib/defineAbilityFor';
import museClient from '../museClient';
const user = window.MUSE_GLOBAL.getUser();

// Permission check based on @casl/ability
let cachedAdmins = null;
export default function useAbility(subjectType) {
  const [admins, setAdmins] = useState(cachedAdmins);
  const [error, setError] = useState(null);
  useEffect(() => {
    if (!cachedAdmins) {
      museClient.data
        .get('muse.admins')
        .then(d => {
          setAdmins(d);
        })
        .catch(err => {
          setError(err);
        });
    }
  }, []);
  const userObj = { username: user.username, isMuseAdmin: admins?.includes(user.username) };
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
