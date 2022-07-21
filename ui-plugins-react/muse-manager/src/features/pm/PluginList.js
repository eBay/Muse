import { useEffect } from 'react';
import { Table, Button, Tag, Tooltip } from 'antd';
import plugin from 'js-plugin';
import semver from 'semver';
import TimeAgo from 'react-time-ago';
import { RequestStatus, TableBar } from '@ebay/muse-lib-antd/src/features/common';
import { usePollingMuseData } from '../../hooks';
import PluginActions from './PluginActions';
import PluginStatus from './PluginStatus';
import _ from 'lodash';

const NA = () => <span style={{ color: 'gray', fontSize: '13px' }}>N/A</span>;

export default function PluginList({ app }) {
  //
  const { data, pending, error } = usePollingMuseData('muse.plugins');
  const { data: latestReleases } = usePollingMuseData('muse.plugins.latest-releases');
  const { data: npmVersions } = usePollingMuseData('muse.npm.versions', { interval: 30 });
  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '320px',
      render: pluginName => {
        const tags = [];
        const npmVersion = npmVersions?.[pluginName];
        const latestVersion = latestReleases?.[pluginName]?.version;
        if (npmVersion && latestVersion) {
          const color = semver.lt(npmVersion, latestVersion) ? 'orange' : 'green';
          tags.push(
            <Tag color={color} style={{ marginLeft: '0px', transform: 'scale(0.8)' }}>
              npm v{npmVersion}
            </Tag>,
          );
        }
        return (
          <>
            <a href="#">{pluginName}</a>
            {tags}
          </>
        );
      },
    },
    {
      dataIndex: 'createdBy',
      title: 'Created By',
      width: '120px',
    },
    ...Object.values(app?.envs, {}).map(env => {
      return {
        dataIndex: 'name',
        title: env.name,
        width: '120px',
        render: pluginName => {
          const version = _.find(env?.plugins, { name: pluginName })?.version;
          if (!version) return <NA />;
          const latestVersion = latestReleases?.[pluginName]?.version;
          if (!latestVersion) return version;
          const color = semver.lt(version, latestVersion) ? 'orange' : '#8bc34a';
          return (
            <a href="#" style={{ color }}>
              v{version}
            </a>
          );
        },
      };
    }),
    {
      dataIndex: 'name',
      title: 'Latest',
      width: '120px',
      render: pluginName => {
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
            <Button type="link" onClick={() => null} style={{ textAlign: 'left', padding: 0 }}>
              {latest.version}
            </Button>
          </Tooltip>
        ) : (
          <NA />
        );
      },
    },
    {
      dataIndex: 'name',
      title: 'Status',
      render: (a, plugin) => {
        return <PluginStatus plugin={plugin} />;
      },
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      width: '120px',
      render: (a, item) => {
        return <PluginActions plugin={item} app={app} />;
      },
    },
  ].filter(Boolean);

  plugin.invoke('museManager.pm.pluginList.processColumns', columns, { plugins: data });
  plugin.invoke('museManager.pm.pluginList.postProcessColumns', columns, { plugins: data });

  return (
    <div>
      <RequestStatus loading={!error && (pending || !data)} error={error} loadingMode="skeleton" />
      {data && (
        <div>
          <TableBar></TableBar>
          <Table
            pagination={false}
            rowKey="name"
            size="middle"
            columns={columns}
            dataSource={data}
            loading={pending || !data}
          />
        </div>
      )}
    </div>
  );
}
