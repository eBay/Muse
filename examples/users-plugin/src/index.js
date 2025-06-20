import plugin from 'js-plugin';
import route from './route';
import reducer from './reducer';
import * as ext from './ext';

plugin.register({
  name: 'users-plugin',
  route,
  reducer,
  ...ext,
});
