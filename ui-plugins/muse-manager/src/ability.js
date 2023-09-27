// import { useEffect, useState } from 'react';
// import { subject } from '@casl/ability';
// import defineAbilityFor from '@ebay/muse-plugin-acl/lib/defineAbilityFor';
// import museClient from '../museClient';
// import { useMuseData } from '../hooks';
// const user = window.MUSE_GLOBAL.getUser();

// const ability = defineAbilityFor(userObj);;

// export default ability;
// // Permission check based on @casl/ability
// // NOTE: if no user, then it means the Muse system hasn't enabled permission check.
// // It will then always return true.
// export default function useAbility(subjectType) {
//   // const { data: admins, error } = useMuseData('muse.admins');
//   // const userObj = {
//   //   username: user.username,
//   //   isMuseAdmin: !user?.username || admins?.includes(user.username),
//   // };
//   const ability = defineAbilityFor(userObj);
//   return {
//     can: (action, subjectObj) => {
//       return ability.can(action, subject(subjectType, subjectObj));
//     },
//     cannot: (action, subjectObj) => {
//       return ability.cannot(action, subject(subjectType, subjectObj));
//     },
//     rawAbility: ability,
//     error,
//   };
// }

const ability = {
  // __setAbility(a) {
  //   Object.assign(this, a);
  // },
};
export default ability;
