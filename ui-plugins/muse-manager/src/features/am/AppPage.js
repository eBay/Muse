import plugin from 'js-plugin';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Alert } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { usePollingMuseData } from '../../hooks';
import PluginList from '../pm/PluginList';
import Overview from './Overview';
const { TabPane } = Tabs;

export default function AppPage() {
  //
  const navigate = useNavigate();
  const { appName, tabKey = 'overview' } = useParams();
  const { data: app, error } = usePollingMuseData(`muse.app.${appName}`);
  const tabs = [
    {
      key: 'overview',
      name: 'Overview',
      component: Overview,
    },
    {
      key: 'plugins',
      name: 'Plugins',
      component: PluginList,
    },
    {
      key: 'activities',
      name: 'Activities',
      component: () => 'Activites',
    },
  ];

  plugin.invoke('museManager.appPage.processTabs', tabs);
  plugin.invoke('museManager.appPage.postProcessTabs', tabs);

  if (!tabs.map(t => t.key).includes(tabKey)) {
    return <Alert type="error" message={`Unknown tab: ${tabKey}`} showIcon />;
  }
  return (
    <div>
      <h1>Muse App: {appName}</h1>
      <RequestStatus loading={!error && !app} error={!app && error} loadingMode="skeleton" />

      {app && (
        <Tabs activeKey={tabKey} onChange={k => navigate(`/app/${appName}/${k}`)}>
          {tabs.map(tab => (
            <TabPane tab={tab.name} key={tab.key}>
              <tab.component app={app}></tab.component>
            </TabPane>
          ))}
        </Tabs>
      )}
    </div>
  );
}
