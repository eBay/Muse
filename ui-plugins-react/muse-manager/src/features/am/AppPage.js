import plugin from 'js-plugin';
import _ from 'lodash';
import { useParams, useNavigate } from 'react-router-dom';
import { Breadcrumb, Tabs, Alert } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseData } from '../../hooks/useMuse';
import PluginList from '../pm/PluginList';
const { TabPane } = Tabs;

export default function AppPage() {
  //
  const navigate = useNavigate();
  const { appName, tabKey = 'overview' } = useParams();
  const { data, pending, error } = useMuseData(`muse.app.${appName}`);
  const tabs = [
    {
      key: 'overview',
      name: 'Overview',
      component: () => 'Overview',
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
      <Breadcrumb>
        <Breadcrumb.Item>Home</Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="">Application Center</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>
          <a href="">Application List</a>
        </Breadcrumb.Item>
        <Breadcrumb.Item>An Application</Breadcrumb.Item>
      </Breadcrumb>
      <h1>Muse App: {appName}</h1>
      <RequestStatus loading={!error && (pending || !data)} error={error} loadingMode="skeleton" />

      {data && (
        <Tabs activeKey={tabKey} onChange={k => navigate(`/app/${appName}/${k}`)}>
          {tabs.map(tab => (
            <TabPane tab={tab.name} key={tab.key}>
              <tab.component app={data}></tab.component>
            </TabPane>
          ))}
        </Tabs>
      )}
    </div>
  );
}
