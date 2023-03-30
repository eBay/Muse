import PluginList from './features/pm/PluginList';
import AppList from './features/am/AppList';
import AppPage from './features/am/AppPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
const queryClient = new QueryClient();
const TempAppPage = (props) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AppPage {...props} />
    </QueryClientProvider>
  );
};
const route = {
  childRoutes: [
    {
      path: '/plugins',
      component: PluginList,
    },
    {
      path: '/apps',
      component: AppList,
    },
    {
      path: '/app/:appName/:tabKey',
      component: TempAppPage,
    },
    {
      path: '/app/:appName/:tabKey/:scope',
      component: TempAppPage,
    },
    {
      path: '/app/:appName',
      component: TempAppPage,
    },
  ],
};
export default route;
