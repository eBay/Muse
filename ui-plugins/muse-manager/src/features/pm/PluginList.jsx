import { useMemo, useCallback, useState } from 'react';
import { Table, Button, Tag, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import semver from 'semver';
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

const NA = () => <span style={{ color: 'gray', fontSize: '13px' }}>N/A</span>;
export default function PluginList({ app }) {
  let { data, pending, error } = usePollingMuseData('muse.plugins');
  const { data: latestReleases } = usePollingMuseData('muse.plugins.latest-releases');
  const { data: npmVersions } = usePollingMuseData('muse.npm.versions', { interval: 30000 });
  const searchValue = useSearchParam('search')?.toLowerCase() || '';
  const scope = useSearchParam('scope') || config.get('pluginListDefaultScope');
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
        pluginList = pluginList.filter((p) => deploymentInfoByPlugin[p.name]);
        break;
      case 'all':
        // no filter
        break;
      default:
        console.warn('Unknown scope: ', scope);
        break;
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
            return p.type === 'core';
          default:
            return true;
        }
      });
      // Execute extended filters one by one
      const filters = _.flatten(
        jsPlugin.invoke('museManager.pm.getEnvFilterFns', { filterKey, app, envName }),
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
      width: '320px',
      order: 10,
      sorter: tableConfig.defaultSorter('name'),
      ...tableConfig.defaultFilter(pluginList, 'type'),
      render: (pluginName, plugin) => {
        const tags = [];
        const npmVersion = npmVersions?.[pluginName];
        const latestVersion = latestReleases?.[pluginName]?.version;
        if (npmVersion && latestVersion) {
          const color = semver.lt(npmVersion, latestVersion) ? 'orange' : 'green';
          tags.push(
            <Tag
              key={'npm-' + npmVersion}
              color={color}
              style={{ marginLeft: '0px', transform: 'scale(0.8)' }}
            >
              npm v{npmVersion}
            </Tag>,
          );
        }
        return (
          <>
            <a
              onClick={() => {
                NiceModal.show('muse-manager.edit-plugin-modal', { plugin });
              }}
            >
              <Highlighter search={searchValue} text={pluginName} />
            </a>
            {tags}
          </>
        );
      },
    },
    ...Object.values(app?.envs || {}).map((env, i) => {
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
            <Button type="link" style={{ textAlign: 'left', padding: 0, color }}>
              v{versionDeployed}
            </Button>
          );
        },
      };
    }),
    {
      dataIndex: 'latestVersion',
      title: 'Latest',
      width: 120,
      order: 50,
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
        return latest ? (
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
              onClick={() => NiceModal.show('muse-manager.releases-drawer', { plugin, app })}
              style={{ textAlign: 'left', padding: 0 }}
            >
              v{latest.version}
            </Button>
          </Tooltip>
        ) : (
          <NA />
        );
      },
    },
    {
      dataIndex: 'status',
      title: 'Status',
      order: 60,
      render: (a, plugin) => {
        return <PluginStatus plugin={plugin} app={app} />;
      },
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      order: 100,
      width: 160,
      render: (a, item) => {
        return <PluginActions plugin={item} app={app} />;
      },
    },
  ].filter(Boolean);

  jsPlugin.invoke('museManager.pm.pluginList.processColumns', {
    columns,
    plugins: pluginList,
    searchValue,
  });
  jsPlugin.invoke('museManager.pm.pluginList.postProcessColumns', { columns, plugins: pluginList });
  jsPlugin.sort(columns);

  return (
    <div>
      {!app && <h1>Plugins</h1>}
      <RequestStatus loading={!error && (pending || !data)} error={error} loadingMode="skeleton" />
      {data && (
        <div>
          <PluginListBar app={app} />
          <Table
            rowKey="name"
            size="middle"
            columns={columns}
            dataSource={pluginList}
            loading={pending || !data}
            pagination={{
              hideOnSinglePage: false,
              size: 'small',
              showTotal: (total) => `Total ${total} items`,
              showQuickJumper: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
