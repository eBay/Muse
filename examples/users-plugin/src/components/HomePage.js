// Since users-plugin is considered to be the main plugin on the Muse app, logically.
// So we put all misc features in this plugin too.
// To be more clearly, you may create another plugin to setup all misc thing like header, homepage, etc.

import jsPlugin from 'js-plugin';
import { Alert } from 'antd';

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
  return <Dashboard title="Dashboard" />;
};
export default HomePage;
