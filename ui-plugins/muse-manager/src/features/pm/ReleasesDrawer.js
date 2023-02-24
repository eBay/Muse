import { useCallback } from 'react';
import NiceModal, { useModal, antdDrawerV5 } from '@ebay/nice-modal-react';
import TimeAgo from 'react-time-ago';
import prettyMs from 'pretty-ms';
import { Drawer, Table } from 'antd';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import ReactMarkdown from 'react-markdown';
import { RequestStatus, DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseData } from '../../hooks';
import ReleaseDurationTrend from './ReleaseDurationTrend';

const ReleasesDrawer = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const { data: releases, error } = useMuseData(`muse.plugin-releases.${plugin.name}`);

  const columns = [
    {
      dataIndex: 'version',
      order: 10,
      title: 'Version',
      render: (v) => {
        return <a>{v}</a>;
      },
    },
    {
      dataIndex: 'branch',
      order: 20,
      title: 'Build Branch',
    },
    {
      dataIndex: 'duration',
      order: 40,
      title: 'Duration',
      render: (d) => {
        if (_.isObject(d)) {
          const { build, installDeps, uploadAssets } = d;
          const total = (build || 0) + (installDeps || 0) + (uploadAssets || 0);
          return `${prettyMs(total)} `;
        }
        return d ? prettyMs(d) : 'N/A'; // compatible with old releases
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
    (item) => (
      <div className="markdown-wrapper">
        {item.description ? (
          <ReactMarkdown children={item.description} />
        ) : (
          <p className="italic text-zinc-500 text-sm pl-14">No description</p>
        )}
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
          />
        </>
      )}
    </Drawer>
  );
});

export default ReleasesDrawer;
