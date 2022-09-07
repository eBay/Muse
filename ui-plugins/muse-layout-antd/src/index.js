// This file is for UI build
import plugin from 'js-plugin';
import * as ext from './ext';
import route from './common/routeConfig';
import reducer from './common/rootReducer';
import updateMuseLayout from './features/home/updateMuseLayout';
import './styles/index.less';

plugin.register({
  ...ext,
  route,
  reducer,
  exports: { updateMuseLayout },
  name: 'muse-layout',
});
