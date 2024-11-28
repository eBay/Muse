import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Tabs, Tag, Alert } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import { usePollingMuseData } from '../../hooks';
import PluginList from '../pm/PluginList';
import AppOverview from './AppOverview';
import EnvironmentVariables from './EnvironmentVariables';
import AppSelect from './AppSelect';
import './AppPage.less';

export default function AppPage() {
  const navigate = useNavigate();
  const [appNameActions, setAppNameActions] = useState([]);
  const { appName, tabKey = 'overview' } = useParams();
  const { data: app, isLoading, error } = usePollingMuseData(`muse.app.${appName}`);
  const tabs = [
    {
      key: 'overview',
      label: 'Overview',
      order: 10,
      children: <AppOverview app={app} />,
    },
    {
      key: 'plugins',
      label: 'Plugins',
      order: 20,
      children: <PluginList app={app} />,
    },
    {
      key: 'variables',
      label: 'Variables',
      order: 30,
      children: <EnvironmentVariables app={app} />,
    },
  ];

  extendArray(tabs, 'tabs', 'museManager.appPage', { tabs, app });
  console.log('app tabs', tabs);

  useEffect(() => {
    if (app) {
      const appNameActionsExtended = [];
      extendArray(appNameActionsExtended, 'appNameActions', 'museManager.am.appPage', {
        app,
        appNameActions: appNameActionsExtended,
      });
      setAppNameActions(appNameActionsExtended);
    }
  }, [app]);

  const handleAppChange = useCallback(
    (value) => {
      navigate(`/app/${value}/${tabKey}${window.location.search}`);
    },
    [navigate, tabKey],
  );

  const nodes = [
    {
      order: 10,
      node: (
        <span className="muse-manager-app-page-title" key="header">
          <h1 style={{ marginBottom: '0.3em' }}>
            Muse App:{' '}
            {window.MUSE_GLOBAL.isSubApp ? (
              appName
            ) : (
              <AppSelect value={appName} onChange={handleAppChange} />
            )}
          </h1>
          <Tag color="green" className="ml-2">
            Muse 2.0
          </Tag>
          {appNameActions?.length > 0 &&
            appNameActions.filter(Boolean).map((appNameAct) => appNameAct.node)}
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

  extendArray(nodes, 'nodes', 'museManager.am.appPage', { app, nodes });

  return !tabs.map((t) => t.key).includes(tabKey) && app ? (
    <Alert type="error" message={`Unknown tab: ${tabKey}`} showIcon />
  ) : (
    <div>{nodes.map((n) => n.node || null)}</div>
  );
}
