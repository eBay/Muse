import { useCallback } from 'react';
import NiceModal, { useModal, antdDrawer } from '@ebay/nice-modal-react';
import TimeAgo from 'react-time-ago';
import prettyMs from 'pretty-ms';
import { Drawer, Table } from 'antd';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import ReactMarkdown from 'react-markdown';
import { RequestStatus, DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseData } from '../../hooks';

const ReleasesDrawer = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const { data: releases, error } = useMuseData(`muse.plugin-releases.${plugin.name}`);

  const columns = [
    {
      dataIndex: 'version',
      order: 10,
      title: 'Version',
      render: v => {
        return <a href="https://go/muse">{v}</a>;
      },
    },
    {
      dataIndex: 'branch',
      order: 20,
      title: 'Build Branch',
    },
    {
      dataIndex: 'size',
      order: 30,
      title: 'Size',
    },
    {
      dataIndex: 'duration',
      order: 40,
      title: 'Duration',
      render: d => {
        return d ? prettyMs(d) : 'N/A';
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
      render: d => (d ? <TimeAgo date={d} /> : 'N/A'),
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
            label: 'Delete Plugin',
            highlight: true,
            order: 50,
            icon: 'delete',
          },
        ].filter(Boolean);
        return <DropdownMenu extPoint="museManager.plugin.processReleaseActions" items={items} />;
      },
    },
  ];

  const renderBody = useCallback(
    item => (
      <div className="markdown-wrapper">
        <ReactMarkdown children={item.description} />
      </div>
    ),
    [],
  );

  columns.push(
    ..._.flatten(jsPlugin.invoke('museManager.releases.getColumns', { plugin, app, releases })),
  );
  jsPlugin.invoke('museManager.releases.processColumns', { plugin, app, releases });
  jsPlugin.sort(columns);

  const loading = !releases && releases !== null && !error;
  return (
    <Drawer {...antdDrawer(modal)} title={`Releases of ${plugin.name}`} width="1200px">
      <RequestStatus loading={loading} error={error} loadingMode="skeleton" />
      {!loading && (
        <Table
          rowKey={'version'}
          dataSource={releases}
          pagination={false}
          columns={columns}
          expandedRowRender={renderBody}
        />
      )}
    </Drawer>
  );
});

export default ReleasesDrawer;
