import plugin from 'js-plugin';
import * as ext from './ext';
import route from './route';
// import reducer from './rootReducer';
import * as hooks from './hooks';
import * as utils from './utils';
import * as pm from './features/pm';
import * as common from './features/common';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import './modals';
import './style.less';
// import { useMuseData } from './hooks';
import ability from './ability';
// import defineAbilityFor from '@ebay/muse-plugin-acl/lib/defineAbilityFor';

// const InitAbilityComp = () => {
//   // Ensure there's muse admin property
//   const user = window.MUSE_GLOBAL.getUser();
//   const { data: admins } = useMuseData('muse.admins');
//   if (admins && user && admins.includes(user.username)) {
//     user.isMuseAdmin = true;
//   }
//   ability.__setAbility(defineAbilityFor(user || {}));
//   return null;
// };

// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
plugin.register({
  ...ext,
  name: '@ebay/muse-manager',
  route,
  // root: {
  //   getProviders: () => {
  //     return {
  //       order: 5,
  //       key: 'test',
  //       provider: () => {
  //         return 'hssi';
  //       },
  //     };
  //   },
  // },
  // reducer,
  exports: { hooks, utils, pm, common, ability },
  // rootComponent: InitAbilityComp,
});
