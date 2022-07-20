import PluginList from './features/pm/PluginList';
import AppList from './features/am/AppList';

const route = {
  childRoutes: [
    {
      path: '/plugin-list',
      component: PluginList,
    },
    {
      path: '/app-list',
      component: AppList,
    },
  ],
};
export default route;
