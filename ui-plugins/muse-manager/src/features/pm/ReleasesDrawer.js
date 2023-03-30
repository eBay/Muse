import { useCallback } from 'react';
import NiceModal, { useModal, antdDrawerV5 } from '@ebay/nice-modal-react';
import TimeAgo from 'react-time-ago';
import { Drawer, Table, Tag, Popconfirm, Modal, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { RequestStatus, DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseData, useMuseApi, useSyncStatus } from '../../hooks';
import ReleaseDurationTrend from './ReleaseDurationTrend';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';

const ReleasesDrawer = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const { data: releases, error } = useMuseData(`muse.plugin-releases.${plugin.name}`);
  const deployedVersion = Object.values(app.envs).reduce((p, c) => {
    const found = c.plugins?.find((a) => a.name === plugin.name);
    if (found) p[c.name] = found.version;
    return p;
  }, {});
  const syncStatus = useSyncStatus(`muse.plugin-releases.${plugin.name}`);

  const { action: deleteRelease, pending: deleteReleasePending } = useMuseApi('pm.deleteRelease');
  const handleDelete = useCallback(
    async (version) => {
      try {
        const hide = message.loading('Deleting the release...', 0);
        await deleteRelease({ pluginName: plugin.name, version });
        hide();
        message.success('Release deleted.');
      } catch (err) {
        Modal.error({
          title: `Failed to delete`,
          content: (
            <>
              Failed to delete the release ${version}:<p>{err.message || 'unknown error.'}</p>
            </>
          ),
        });
        return;
      }
      syncStatus();
    },
    [deleteRelease, syncStatus, plugin.name],
  );

  const columns = [
    {
      dataIndex: 'version',
      order: 10,
      title: 'Version',
      render: (v, release) => {
        const tags = [];
        Object.values(app.envs).forEach((env) => {
          const color = env.name === 'production' ? 'green' : 'orange';
          if (deployedVersion[env.name] === v) {
            tags.push(
              <Tag style={{ margin: 0, transform: 'scale(0.9)' }} color={color}>
                {env.name}
              </Tag>,
            );
          }
        });
        const nodes = [v, ...tags];
        return nodes;
      },
    },
    // {
    //   dataIndex: 'branch',
    //   order: 20,
    //   title: 'Build Branch',
    // },
    // {
    //   dataIndex: 'duration',
    //   order: 40,
    //   title: 'Duration',
    //   render: (d) => {
    //     if (_.isObject(d)) {
    //       const { build, installDeps, uploadAssets } = d;
    //       const total = (build || 0) + (installDeps || 0) + (uploadAssets || 0);
    //       return `${prettyMs(total)} `;
    //     }
    //     return d ? prettyMs(d) : 'N/A'; // compatible with old releases
    //   },
    // },
    {
      dataIndex: 'createdBy',
      order: 50,
      title: 'Created By',
    },
    {
      dataIndex: 'createdAt',
      order: 60,
      title: 'Time',
      render: (d) => {
        return d ? <TimeAgo date={new Date(d).getTime()} /> : 'N/A';
      },
    },
    {
      dataIndex: 'actions',
      order: 70,
      title: 'Actions',
      render: (k, release) => {
        const items = [
          app && {
            key: 'deploy',
            label: 'Deploy',
            order: 10,
            icon: 'rocket',
            highlight: true,
            onClick: () => {
              modal.hide();
              NiceModal.show('muse-manager.deploy-plugin-modal', {
                plugin,
                app,
                version: release.version,
              });
            },
          },
          {
            key: 'delete',
            label: 'Delete Release',
            highlight: true,
            order: 50,
            icon: 'delete',
            render: () => {
              console.log(release);
              return (
                <Popconfirm
                  title="Delete the release"
                  description="Are you sure to delete this release?"
                  okText="Delete"
                  cancelText="No"
                  showCancel={!deleteReleasePending}
                  onConfirm={() => handleDelete(release.version)}
                  okButtonProps={{ danger: true }}
                >
                  <Button
                    size="small"
                    className=""
                    icon={<DeleteOutlined style={{ color: 'red' }} />}
                  ></Button>
                </Popconfirm>
              );
            },
          },
        ].filter(Boolean);
        return <DropdownMenu extPoint="museManager.plugin.processReleaseActions" items={items} />;
      },
    },
  ];

  const renderBody = useCallback(
    (item) => (
      <div className="markdown-wrapper">
        <ReactMarkdown children={item.description} />
      </div>
    ),
    [],
  );

  extendArray(columns, 'columns', 'museManager.pm.releaseList', { plugin, app, releases });

  const loading = !releases && releases !== null && !error;
  return (
    <Drawer {...antdDrawerV5(modal)} title={`Releases of ${plugin.name}`} width="1200px">
      <RequestStatus loading={loading} error={error} loadingMode="skeleton" />
      {!loading && (
        <>
          <ReleaseDurationTrend plugin={plugin} />
          <Table
            rowKey={'version'}
            dataSource={releases}
            pagination={false}
            columns={columns}
            expandedRowRender={renderBody}
            rowExpandable={(item) => item.description}
          />
        </>
      )}
    </Drawer>
  );
});

export default ReleasesDrawer;
