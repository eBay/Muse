import plugin from 'js-plugin';
import route from './route';
import reducer from './reducer';

plugin.register({
  name: 'myplugin',
  route,
  reducer,
});
