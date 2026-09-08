import plugin from 'js-plugin';
import * as ext from './ext';
import reducer from './reducer';
import route from './route';

plugin.register({
  ...ext,
  name: '<mypluginname>',
  route,
  reducer,
});
