import plugin from 'js-plugin';
import * as ext from './ext';
import route from './route';
import reducer from './reducer';
import './modals';

import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
plugin.register({
  ...ext,
  name: 'muse-manager',
  route,
  reducer,
});
