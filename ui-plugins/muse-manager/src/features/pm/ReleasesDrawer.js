import { useCallback } from 'react';
import NiceModal, { useModal, antdDrawerV5 } from '@ebay/nice-modal-react';
import TimeAgo from 'react-time-ago';
import { Drawer, Table, Tag, Popconfirm, Modal, Button, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import ReactMarkdown from 'react-markdown';
import { RequestStatus, DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useAbility, usePollingMuseData, useMuseMutate, useSyncStatus } from '../../hooks';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';

const ReleasesDrawer = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const {
    data: releases,
    isLoading,
    error,
  } = usePollingMuseData(`muse.plugin-releases.${plugin.name}`);
  const deployedVersion = app
    ? Object.values(app.envs || {}).reduce((p, c) => {
        const found = c.plugins?.find((a) => a.name === plugin.name);
        if (found) p[c.name] = found.version;
        return p;
      }, {})
    : {};
  const syncStatus = useSyncStatus(`muse.plugin-releases.${plugin.name}`);
  const ability = useAbility();
  const { mutateAsync: deleteRelease, isLoading: deleteReleasePending } =
    useMuseMutate('pm.deleteRelease');
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
        app &&
          Object.values(app.envs || {}).forEach((env) => {
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
        const canDelete = ability.can('delete-release', 'Plugin', { app, plugin, release });

        const items = [
          app && {
            key: 'deploy',
            label: 'Deploy',
            order: 10,
            icon: 'rocket',
            highlight: true,
            disabled: ability.cannot('deploy', 'App', { app, plugin }),
            disabledText: 'No permission to deploy.',
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
            disabled: !canDelete,
            disabledText: 'No permission.',
            icon: 'delete',
            render: () => {
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
                    disabled={!canDelete}
                    title={canDelete ? '' : 'No permission.'}
                    icon={<DeleteOutlined style={canDelete ? { color: 'red' } : {}} />}
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

  const sections = [
    {
      key: 'releaseList',
      order: 50,
      render: () => (
        <Table
          rowKey={'version'}
          dataSource={releases}
          columns={columns}
          expandedRowRender={renderBody}
          rowExpandable={(item) => item.description}
          pagination={{
            showTotal: (total) => `Total ${total} items`,
            pageSize: 100,
          }}
        />
      ),
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
  extendArray(sections, 'sections', 'museManager.pm.releaseList', { plugin, app, releases });

  return (
    <Drawer {...antdDrawerV5(modal)} title={`Releases of ${plugin.name}`} width="1200px">
      <RequestStatus loading={isLoading} error={error} loadingMode="skeleton" />
      {!isLoading &&
        sections.map(({ title, render, key, ...props }) => {
          return (
            <section key={key} {...props}>
              {title ? <h3>{title}</h3> : null}
              {typeof render === 'function' ? render() : null}
            </section>
          );
        })}
    </Drawer>
  );
});

export default ReleasesDrawer;
