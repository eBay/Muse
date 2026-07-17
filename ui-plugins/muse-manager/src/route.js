import PluginList from './features/pm/PluginList';
import AppList from './features/am/AppList';
import AppPage from './features/am/AppPage';
import MspList from './features/msp/MspList';
import MspDetail from './features/msp/MspDetail';
const route = [
  {
    path: '/plugins',
    component: PluginList,
  },
  {
    path: '/apps',
    component: AppList,
  },
  {
    path: '/app/:appName/:tabKey?/:scope?',
    component: AppPage,
  },
  {
    path: '/msp/:name',
    component: MspDetail,
  },
  {
    path: '/msp',
    component: MspList,
  },
];
export default route;
