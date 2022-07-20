import plugin from 'js-plugin';
import ext from './ext';
import route from './route';
import reducer from './reducer';

plugin.register({
  ...ext,
  name: 'muse-manager',
  route,
  reducer,
});
