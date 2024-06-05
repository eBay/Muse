import PluginList from './features/pm/PluginList';
import AppList from './features/am/AppList';
import AppPage from './features/am/AppPage';
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
];
export default route;
