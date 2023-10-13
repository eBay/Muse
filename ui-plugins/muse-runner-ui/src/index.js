import plugin from 'js-plugin';

import * as ext from './ext';
import route from './route';
import reducer from './reducer';
import RootComponent from './RootComponent';
import './style.less';
import './app.less';

plugin.register({
  ...ext,
  name: 'muse-runner-ui',
  route,
  reducer,
  rootComponent: RootComponent,
});
