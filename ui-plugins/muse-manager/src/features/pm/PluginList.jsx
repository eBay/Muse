import React, { useMemo } from 'react';
import { Table, Button, Tag, Tooltip } from 'antd';
import jsPlugin from 'js-plugin';
import semver from 'semver';
import TimeAgo from 'react-time-ago';
import NiceModal from '@ebay/nice-modal-react';
import { RequestStatus, Highlighter } from '@ebay/muse-lib-antd/src/features/common';
import { usePollingMuseData } from '../../hooks';
import PluginActions from './PluginActions';
import PluginStatus from './PluginStatus';
import _ from 'lodash';
import { useSearchParam } from 'react-use';
import PluginListBar from './PluginListBar';
import config from '../../config';

const NA = () => <span style={{ color: 'gray', fontSize: '13px' }}>N/A</span>;
const user = window.MUSE_GLOBAL.getUser();
export default function PluginList({ app }) {
  //
  const { data, pending, error } = usePollingMuseData('muse.plugins');
  const { data: latestReleases } = usePollingMuseData('muse.plugins.latest-releases');
  const { data: npmVersions } = usePollingMuseData('muse.npm.versions', { interval: 30000 });
  const searchValue = useSearchParam('search')?.toLowerCase() || '';
  const scope = useSearchParam('scope') || config.get('pluginListDefaultScope');
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

  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '320px',
      order: 10,
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
    // {
    //   dataIndex: 'owners',
    //   title: 'Owners',
    //   width: '120px',
    //   render: o => <Highlighter search={searchValue} text={o.join(', ')} />,
    // },
    ...Object.values(app?.envs || {}).map((env, i) => {
      return {
        dataIndex: 'name',
        title: env.name,
        order: i + 20,
        width: '120px',
        render: (pluginName, plugin) => {
          const version = deploymentInfoByPlugin?.[pluginName]?.[env.name]; // _.find(env?.plugins, { name: pluginName })?.version;
          if (!version) return <NA />;
          const latestVersion = latestReleases?.[pluginName]?.version;
          if (!latestVersion) return version;
          const color = semver.lt(version, latestVersion) ? 'orange' : '#8bc34a';
          return (
            <Button
              type="link"
              onClick={() => NiceModal.show('muse-manager.releases-drawer', { plugin, app })}
              style={{ textAlign: 'left', padding: 0, color }}
            >
              v{version}
            </Button>
          );
        },
      };
    }),
    {
      dataIndex: 'name',
      title: 'Latest',
      width: '120px',
      order: 50,
      render: (pluginName, plugin) => {
        const latest = latestReleases?.[pluginName];
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
      width: '160px',
      render: (a, item) => {
        return <PluginActions plugin={item} app={app} />;
      },
    },
  ].filter(Boolean);

  let pluginList = data;

  if (scope && pluginList) {
    switch (scope) {
      // case 'my':
      //   pluginList = pluginList.filter(p =>
      //     p?.owners?.map(s => s.toLowerCase())?.includes(user?.username?.toLowerCase()),
      //   );
      //   break;
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
  pluginList = ctx.pluginList;

  pluginList = pluginList?.filter(
    p =>
      p.name.toLowerCase().includes(searchValue) ||
      p.owners?.some(o => o.toLowerCase().includes(searchValue)),
  );

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
