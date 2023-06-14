import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import jsPlugin from 'js-plugin';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Alert } from 'antd';
import { EyeOutlined, ControlOutlined, FunctionOutlined } from '@ant-design/icons';
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
  const [appNameActions, setAppNameActions] = useState([]);
  const [appNodes, setAppNodes] = useState([]);
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
  ];

  tabs.push(..._.flatten(jsPlugin.invoke('museManager.appPage.getTabs', tabs)));
  jsPlugin.invoke('museManager.appPage.processTabs', tabs);
  jsPlugin.invoke('museManager.appPage.postProcessTabs', tabs);
  jsPlugin.sort(tabs);

  useEffect(() => {
    if (app) {
      const appNameActionsExtended = [];
      extendArray(appNameActionsExtended, 'appNameActions', 'museManager.am.appPage', {
        app,
        appNameActions: appNameActionsExtended,
      });
      setAppNameActions(appNameActionsExtended);

      const appNodesExtended = [];
      extendArray(appNodesExtended, 'nodes', 'museManager.am.appPage', {
        app,
        nodes: appNodesExtended,
      });
      setAppNodes(appNodesExtended);
    }
  }, [app]);

  const nodes = [
    {
      order: 10,
      node: (
        <span className="muse-manager-app-page-title" key="header">
          <h1 style={{ marginBottom: '0.3em' }}>Muse App: {appName}</h1>
          {appNameActions?.length > 0 && appNameActions.map((appNameAct) => appNameAct.node)}
        </span>
      ),
    },
    {
      order: 15,
      node: (
        <RequestStatus loading={isLoading} error={error} loadingMode="skeleton" key="loading" />
      ),
    },
    {
      order: 20,
      node: app && (
        <Tabs
          activeKey={tabKey}
          onChange={(k) => navigate(`/app/${appName}/${k}`)}
          items={tabs}
          key="tabs"
        />
      ),
    },
  ];

  return !tabs.map((t) => t.key).includes(tabKey) ? (
    <Alert type="error" message={`Unknown tab: ${tabKey}`} showIcon />
  ) : (
    <div>{appNodes.concat(nodes).map((n) => n.node)}</div>
  );
}
