import { useMemo } from 'react';
import { Table, Button, Tooltip } from 'antd';
import jsPlugin from 'js-plugin';
import TimeAgo from 'react-time-ago';
import NiceModal from '@ebay/nice-modal-react';
import { RequestStatus, Highlighter } from '@ebay/muse-lib-antd/src/features/common';
import tableConfig from '@ebay/muse-lib-antd/src/features/common/tableConfig';
import _ from 'lodash';
import { useSearchParam } from 'react-use';
import { usePollingMuseData, useEnvFilter } from '../../hooks';
import PluginActions from './PluginActions';
import PluginStatus from './PluginStatus';
import PluginListBar from './PluginListBar';
import { versionDiffColorMap } from './EnvFilterMenu';
import config from '../../config';
import { versionDiff } from '../../utils';
import PluginBadges from './PluginBadges';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import OwnerList from '../common/OwnerList';

const NA = () => <span style={{ color: 'gray', fontSize: '13px' }}>N/A</span>;
export default function PluginList({ app }) {
  const { data, isLoading, error } = usePollingMuseData('muse.plugins');
  const { data: latestReleases } = usePollingMuseData('muse.plugins.latest-releases');
  const searchValue = useSearchParam('search')?.toLowerCase() || '';
  const scope =
    useSearchParam('scope') || (app ? 'deployed' : config.get('pluginListDefaultScope'));
  const selectedEnvName = useSearchParam('env') || config.get('pluginListDefaultEnv');

  const { getEnvFilterConfig, envFilterMap } = useEnvFilter({});
  const deploymentInfoByPlugin = useMemo(() => {
    return (
      (app &&
        _(app.envs)
          .entries()
          .reduce((obj, [envName, { plugins }]) => {
            plugins.forEach(({ name, version }) => {
              if (!obj[name]) obj[name] = {};
              obj[name][envName] = version;
            });
            return obj;
          }, {})) ||
      {}
    );
  }, [app]);
  let pluginList = data;

  if (scope && pluginList) {
    switch (scope) {
      case 'deployed':
        pluginList = pluginList.filter((p) =>
          selectedEnvName === 'all'
            ? deploymentInfoByPlugin[p.name]
            : deploymentInfoByPlugin[p.name]?.[selectedEnvName],
        );
        break;
      case 'all':
        // no filter
        break;
      default:
    }
    const filters = _.flatten(
      jsPlugin.invoke('museManager.pm.pluginList.getScopeFilterFns', { scope }),
    ).filter(Boolean);
    if (filters.length > 0) {
      pluginList = _.flow(filters)(pluginList);
    }
  }

  const ctx = { pluginList };
  jsPlugin.invoke('museManager.pm.pluginList.processPluginList', ctx);

  pluginList = ctx.pluginList?.filter(
    (p) =>
      p.name.toLowerCase().includes(searchValue) ||
      p.owners?.some((o) => o.toLowerCase().includes(searchValue)),
  );

  if (pluginList) {
    const entries = Object.entries(envFilterMap);
    entries.forEach(([envName, filterKey]) => {
      if (!filterKey) return; // clear
      pluginList = pluginList.filter((p) => {
        if (!deploymentInfoByPlugin[p.name]) return false;
        switch (filterKey) {
          case 'null':
          case 'patch':
          case 'minor':
          case 'major':
            const latestVersion = latestReleases?.[p.name]?.version;
            const diff = versionDiff(latestVersion, deploymentInfoByPlugin?.[p.name]?.[envName]);
            return diff === filterKey;
          case 'core':
            return app.pluginConfig?.[p.name]?.core || p.type !== 'normal';
          default:
            return true;
        }
      });
      // Execute extended filters one by one
      const filters = _.flatten(
        jsPlugin.invoke('museManager.pm.pluginList.getEnvFilterFns', { filterKey, app, envName }),
      ).filter(Boolean);
      if (filters.length > 0) {
        pluginList = _.flow(filters)(pluginList);
      }
    });
  }

  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '350px',
      fixed: 'left',
      order: 10,
      viewMode: true,
      tooltip: 'Plugin name is readonly.',
      sorter: tableConfig.defaultSorter('name'),
      ...tableConfig.defaultFilter(pluginList, 'type'),
      render: (pluginName, plugin) => {
        return (
          <>
            <Button
              type="link"
              style={{ padding: 0 }}
              onClick={() => {
                NiceModal.show('muse-manager.plugin-info-modal', { plugin, app });
              }}
            >
              <Highlighter search={searchValue} text={pluginName} />
            </Button>
            <PluginBadges app={app} plugin={plugin} />
          </>
        );
      },
    },

    {
      dataIndex: 'latestVersion',
      title: 'Latest',
      width: 120,
      order: 17,
      fixed: 'left',
      sorter: (a, b) => {
        a = latestReleases?.[a.name];
        b = latestReleases?.[b.name];
        const t1 = (a && a.createdAt && new Date(a.createdAt).getTime()) || 0;
        const t2 = (b && b.createdAt && new Date(b.createdAt).getTime()) || 0;
        if (t1 === t2) return 0;
        else if (t1 > t2) return -1;
        else return 1;
      },
      render: (_, plugin) => {
        const latest = latestReleases?.[plugin.name];
        if (!latest) return <NA />;
        // check if the latest release is created within 30 minutes
        // if not, hidden the tooltip, otherwise, show the tooltip at the right side of the version
        const inPastHalfHour =
          (Date.now() - (latest?.createdAt && new Date(latest.createdAt).getTime()) || 0) <
          1000 * 60 * 30;
        return inPastHalfHour ? (
          <Tooltip
            color="green"
            placement="left"
            open={true}
            title={
              <>
                <TimeAgo date={new Date(latest.createdAt || 0)} timeStyle="mini" /> ago
              </>
            }
            overlayInnerStyle={{ padding: '2px 4px', minHeight: 'fit-content', fontSize: 13 }}
            zIndex={9} // lower than header layout and modals
            getPopupContainer={(trigger) => trigger.parentElement}
          >
            <Button
              type="link"
              onClick={() => {
                NiceModal.show('muse-manager.release-info-modal', {
                  plugin,
                  app,
                  release: latest,
                  isLatest: true,
                });
              }}
              style={{ textAlign: 'left', padding: 0 }}
            >
              v{latest.version}
            </Button>
          </Tooltip>
        ) : (
          <Tooltip
            title={
              <>
                <TimeAgo date={new Date(latest.createdAt || 0)} /> from {latest.branch || 'unknown'}{' '}
                branch.
              </>
            }
          >
            <Button
              type="link"
              onClick={() => {
                NiceModal.show('muse-manager.release-info-modal', {
                  plugin,
                  app,
                  release: latest,
                });
              }}
              style={{ textAlign: 'left', padding: 0 }}
            >
              v{latest.version}
            </Button>
          </Tooltip>
        );
      },
    },
    ...Object.values(app?.envs || {})
      .filter((env) => selectedEnvName === 'all' || env.name === selectedEnvName)
      .map((env, i) => {
        return {
          dataIndex: `${env.name}`,
          title: _.capitalize(env.name),
          order: i + 20,
          width: 120,
          ...getEnvFilterConfig(env.name),
          render: (_, plugin) => {
            const versionDeployed = deploymentInfoByPlugin?.[plugin.name]?.[env.name];
            if (!versionDeployed) return <NA />;
            const latestVersion = latestReleases?.[plugin.name]?.version;
            if (!latestVersion) return versionDeployed;
            const color = versionDiffColorMap[versionDiff(versionDeployed, latestVersion)];
            return (
              <Button
                type="link"
                style={{ textAlign: 'left', padding: 0, color }}
                onClick={() => {NiceModal.show('muse-manager.release-info-modal', {
                  plugin,
                  app,
                  version: versionDeployed
                })}}
              >
                v{versionDeployed}
              </Button>
            );
          },
        };
      }),
    {
      dataIndex: 'status',
      title: 'Status',
      order: 50,
      width: 350,
      render: (a, plugin) => {
        return <PluginStatus plugin={plugin} app={app} />;
      },
    },
    {
      dataIndex: 'owners',
      title: 'Owners',
      width: 200,
      order: 95,
      render: (owners) => <OwnerList owners={owners} searchKey={searchValue} count={2} />,
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      order: 100,
      width: 180,
      align: 'center',
      fixed: 'right',
      render: (a, item) => {
        return <PluginActions plugin={item} app={app} />;
      },
    },
  ].filter(Boolean);

  extendArray(columns, 'columns', 'museManager.pm.pluginList', {
    app,
    columns,
    plugins: pluginList,
    searchValue,
    latestReleases,
  });

  return (
    <div>
      {!app && <h1>Plugins</h1>}
      <RequestStatus loading={isLoading} error={error} loadingMode="skeleton" />
      {data && (
        <div>
          <PluginListBar app={app} />
          <Table
            rowKey="name"
            size="small"
            columns={columns}
            dataSource={pluginList}
            loading={isLoading}
            scroll={{ x: 1300 }}
            pagination={{
              hideOnSinglePage: false,
              size: 'small',
              defaultPageSize: 50,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              showQuickJumper: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
