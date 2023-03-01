import React from 'react';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Alert } from 'antd';
import {
  EyeOutlined,
  AppstoreOutlined,
  FunctionOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { usePollingMuseData } from '../../hooks';
import PluginList from '../pm/PluginList';
import AppOverview from './AppOverview';
import EnvironmentVariables from './EnvironmentVariables';

export default function AppPage() {
  //
  const navigate = useNavigate();
  const { appName, tabKey = 'overview' } = useParams();
  const { data: app, error } = usePollingMuseData(`muse.app.${appName}`);
  const tabs = [
    {
      key: 'overview',
      label: (
        <span>
          <EyeOutlined />
          Overview
        </span>
      ),
      order: 10,
      children: <AppOverview app={app} />,
    },
    {
      key: 'plugins',
      label: (
        <span>
          <AppstoreOutlined />
          Plugins
        </span>
      ),
      order: 20,
      children: <PluginList app={app} />,
    },
    {
      key: 'variables',
      label: (
        <span>
          <FunctionOutlined />
          Variables
        </span>
      ),
      order: 30,
      children: <EnvironmentVariables app={app} />,
    },
    {
      key: 'activities',
      label: (
        <span>
          <FieldTimeOutlined />
          Activities
        </span>
      ),
      order: 40,
      children: 'Activites',
    },
  ];

  tabs.push(..._.flatten(jsPlugin.invoke('museManager.appPage.getTabs', tabs)));
  jsPlugin.invoke('museManager.appPage.processTabs', tabs);
  jsPlugin.invoke('museManager.appPage.postProcessTabs', tabs);
  jsPlugin.sort(tabs);

  if (!tabs.map((t) => t.key).includes(tabKey)) {
    return <Alert type="error" message={`Unknown tab: ${tabKey}`} showIcon />;
  }
  return (
    <div>
      <h1>Muse App: {appName}</h1>
      <RequestStatus loading={!error && !app} error={!app && error} loadingMode="skeleton" />

      {app && (
        <Tabs activeKey={tabKey} onChange={(k) => navigate(`/app/${appName}/${k}`)} items={tabs} />
      )}
    </div>
  );
}
