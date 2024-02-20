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
import { useAbility } from './hooks';
import ability from './ability';
import museClient from './museClient';

const InitAbilityComp = () => {
  Object.assign(ability, useAbility());
  return null;
};
console.log(en);
// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
plugin.register({
  ...ext,
  name: '@ebay/muse-manager',
  route,
  exports: { hooks, utils, pm, common, ability, museClient },
  rootComponent: InitAbilityComp,
});
