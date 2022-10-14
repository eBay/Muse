// Since users-plugin is considered to be the main plugin on the Muse app, logically.
// So we put all misc features in this plugin too.
// To be more clearly, you may create another plugin to setup all misc thing like header, homepage, etc.

import jsPlugin from 'js-plugin';
import { Alert } from 'antd';

const defaultDashboard = [
  {
    id: 'w-1665717912358',
    widget: 'roles.rolesCount',
    grid: { x: 6, y: 0, w: 3, h: 3, minW: 1, maxW: 12, minH: 1, maxH: 100000 },
    settings: null,
  },
  {
    id: 'w-1665717917477',
    widget: 'roles.createRole',
    grid: { x: 9, y: 0, w: 3, h: 3, minW: 1, maxW: 12, minH: 1, maxH: 100000 },
    settings: null,
  },
  {
    id: 'w-1665717928185',
    widget: 'docs.welcome',
    grid: { x: 0, y: 3, w: 6, h: 12, minW: 1, maxW: 12, minH: 1, maxH: 100000 },
    settings: null,
  },
  {
    id: 'w-1665717949906',
    widget: 'demoController.controller',
    grid: { x: 6, y: 3, w: 6, h: 12, minW: 1, maxW: 12, minH: 1, maxH: 100000 },
    settings: null,
  },
  {
    id: 'w-1665717963893',
    widget: 'users.usersCount',
    grid: { x: 0, y: 0, w: 3, h: 3, minW: 1, maxW: 12, minH: 1, maxH: 100000 },
    settings: null,
  },
  {
    id: 'w-1665717972690',
    widget: 'users.createUser',
    grid: { x: 3, y: 0, w: 3, h: 3, minW: 1, maxW: 12, minH: 1, maxH: 100000 },
    settings: null,
  },
];

const HomePage = () => {
  // Here we get the desired assets from another plugin.
  // It's a loose coupled dependency since we have the opportunity to handle the case if assets don't exist.
  // NOTE: we should always call getPlugin API in a function runs after app start.
  // That is, don't call getPlugin in the top scope. So that all plugins have been loaded.
  const { Dashboard } = jsPlugin.getPlugin('@ebay/muse-dashboard')?.exports || {};

  if (!Dashboard)
    return (
      <Alert
        type="error"
        showIcon
        message="Dashboard Plugin Not Found"
        description="This component intends to use plugin @ebay/muse-dashboard, but not found. Have you deployed the plugin to the app?"
      />
    );
  return <Dashboard defaultDashboard={defaultDashboard} title="Dashboard" />;
};
export default HomePage;
