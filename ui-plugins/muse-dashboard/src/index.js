import plugin from 'js-plugin';
import * as ext from './ext';
import route from './route';
import reducer from './reducer';
import './style.less';
import './modals';

plugin.register({
  ...ext,
  name: '@ebay/muse-dashboard',
  route,
  reducer,
});
