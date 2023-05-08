import React from 'react';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Alert } from 'antd';
import {
  EyeOutlined,
  ControlOutlined,
  FunctionOutlined,
  FieldTimeOutlined,
} from '@ant-design/icons';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import { usePollingMuseData } from '../../hooks';
import PluginList from '../pm/PluginList';
import AppOverview from './AppOverview';
import EnvironmentVariables from './EnvironmentVariables';
import './AppPage.less';

export default function AppPage() {
  //
  const navigate = useNavigate();
  const { appName, tabKey = 'overview' } = useParams();
  const { data: app, isLoading, error } = usePollingMuseData(`muse.app.${appName}`);
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
          <ControlOutlined />
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

  const appNameActions = [];
  extendArray(appNameActions, 'appNameActions', 'museManager.am.appPage', { appName, tabKey });

  if (!tabs.map((t) => t.key).includes(tabKey)) {
    return <Alert type="error" message={`Unknown tab: ${tabKey}`} showIcon />;
  }
  return (
    <div>
      <span className="muse-manager-app-page">
        <h1 style={{ marginBottom: '0px' }}>Muse App: {appName}</h1>
        {appNameActions?.length > 0 && appNameActions.map((appNameAct) => appNameAct)}
      </span>
      <RequestStatus loading={isLoading} error={error} loadingMode="skeleton" />

      {app && (
        <Tabs activeKey={tabKey} onChange={(k) => navigate(`/app/${appName}/${k}`)} items={tabs} />
      )}
    </div>
  );
}
