import { useMemo, useCallback } from 'react';
import { Table, Button, Tag, Tooltip } from 'antd';
import { FilterOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import semver from 'semver';
import TimeAgo from 'react-time-ago';
import NiceModal from '@ebay/nice-modal-react';
import { RequestStatus, Highlighter } from '@ebay/muse-lib-antd/src/features/common';
import tableConfig from '@ebay/muse-lib-antd/src/features/common/tableConfig';
import { usePollingMuseData, useEnvFilter, usePlugins } from '../../hooks';
import PluginActions from './PluginActions';
import PluginStatus from './PluginStatus';
import _ from 'lodash';
import { useSearchParam } from 'react-use';
import PluginListBar from './PluginListBar';
import EnvFilterMenu from './EnvFilterMenu';
import config from '../../config';

const NA = () => <span style={{ color: 'gray', fontSize: '13px' }}>N/A</span>;
export default function PluginList({ app }) {
  const { data, pending, error } = usePollingMuseData('muse.plugins');
  const { data: latestReleases } = usePollingMuseData('muse.plugins.latest-releases');
  const { data: npmVersions } = usePollingMuseData('muse.npm.versions', { interval: 30000 });
  const { data: patchedPlugins } = usePlugins({
    app,
    allPlugins: data,
    latestReleases,
    npmVersions,
  });
  const searchValue = useSearchParam('search')?.toLowerCase() || '';
  const scope = useSearchParam('scope') || config.get('pluginListDefaultScope');
  const { envFilterMap, envFilterDropdownOpenMap, onEnvFilterChange, onFilterOpenChange } =
    useEnvFilter();

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

  let pluginList = patchedPlugins;

  if (scope && pluginList) {
    switch (scope) {
      case 'deployed':
        pluginList = pluginList.filter(p => deploymentInfoByPlugin[p.name]);
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
    p =>
      p.name.toLowerCase().includes(searchValue) ||
      p.owners?.some(o => o.toLowerCase().includes(searchValue)),
  );

  if (pluginList) {
    const entries = Object.entries(envFilterMap);
    entries.forEach(([envName, filter]) => {
      if (!filter) return;
      pluginList = pluginList.filter(p => {
        const envP = p.envs[envName] || {};
        switch (filter) {
          case 'null':
            return envP.versionDiff === null;
          case 'patch':
          case 'minor':
          case 'major':
            return envP.versionDiff === filter;
          case 'core':
            return envP.meta && envP.meta.core;
          case 'whitelist':
            return envP.whitelist;

          default:
            return false;
        }
      });
    });
  }

  const envFilterConfig = useCallback(
    envName => {
      return {
        filterDropdown: (
          <EnvFilterMenu
            selectedKeys={[envFilterMap[envName]]}
            onSelect={args => onEnvFilterChange(envName, args)}
          />
        ),
        filterIcon: (
          <FilterOutlined style={{ color: envFilterMap[envName] ? '#1890ff' : '#aaa' }} />
        ),
        filterDropdownVisible: envFilterDropdownOpenMap[envName],
        onFilterDropdownVisibleChange: visible => onFilterOpenChange(envName, visible),
      };
    },
    [envFilterDropdownOpenMap, envFilterMap, onEnvFilterChange, onFilterOpenChange],
  );

  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '320px',
      order: 10,
      sorter: tableConfig.defaultSorter('name'),
      ...tableConfig.defaultFilter(pluginList, 'type'),
      render: pluginName => {
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
            <a href="#">
              <Highlighter search={searchValue} text={pluginName} />
            </a>
            {tags}
          </>
        );
      },
    },
    {
      dataIndex: 'owners',
      title: 'Owners',
      width: 200,
      order: 15,
      render: o => <Highlighter search={searchValue} text={o.join(', ')} />,
    },
    ...Object.values(app?.envs || {}).map((env, i) => {
      return {
        dataIndex: `${env.name}`,
        title: _.capitalize(env.name),
        order: i + 20,
        width: 120,
        ...envFilterConfig(env.name),
        render: (_, plugin) => {
          const version = deploymentInfoByPlugin?.[plugin.name]?.[env.name]; // _.find(env?.plugins, { name: pluginName })?.version;
          if (!version) return <NA />;
          const latestVersion = latestReleases?.[plugin.name]?.version;
          if (!latestVersion) return version;
          const color = semver.lt(version, latestVersion) ? 'orange' : '#8bc34a';
          return (
            <Button type="link" style={{ textAlign: 'left', padding: 0, color }}>
              v{version}
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

  jsPlugin.invoke('museManager.pm.pluginList.processColumns', columns, { plugins: pluginList });
  jsPlugin.invoke('museManager.pm.pluginList.postProcessColumns', columns, { plugins: pluginList });
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
              showTotal: total => `Total ${total} items`,
              showQuickJumper: true,
            }}
          />
        </div>
      )}
    </div>
  );
}
