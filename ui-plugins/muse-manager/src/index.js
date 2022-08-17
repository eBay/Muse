import plugin from 'js-plugin';
import * as ext from './ext';
import route from './route';
import reducer from './rootReducer';
import JavascriptTimeAgo from 'javascript-time-ago';
import en from 'javascript-time-ago/locale/en';
import './modals';
// Initialize the desired locales.
JavascriptTimeAgo.locale(en);
plugin.register({
  ...ext,
  name: '@ebay/muse-manager',
  route,
  reducer,
});
console.log('public url: ', __webpack_public_path__); // eslint-disable-line
