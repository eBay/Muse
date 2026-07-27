import React from 'react';
import { Table, Button, Dropdown, Modal, message, Tag } from 'antd';
import { useNavigate } from 'react-router-dom';
import NiceModal from '@ebay/nice-modal-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import tableConfig from '@ebay/muse-lib-antd/src/features/common/tableConfig';
import { usePollingMuseQuery, useMuseMutation, useSyncStatus } from '../../hooks';

export default function MspList() {
  const navigate = useNavigate();
  const { data: mspData, error } = usePollingMuseQuery('msp.getMsp');
  const syncStatus = useSyncStatus('muse.msp');

  const { mutateAsync: deletePreset } = useMuseMutation('msp.deletePreset');

  const handleDelete = (name) => {
    Modal.confirm({
      title: `Delete preset "${name}"?`,
      content: 'This action cannot be undone. Environments using this preset will lose the constraint.',
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await deletePreset({ name });
          message.success(`Preset "${name}" deleted.`);
          await syncStatus();
        } catch (err) {
          message.error(err.message || 'Failed to delete preset.');
        }
      },
    });
  };

  const mspList = mspData
    ? Object.entries(mspData).map(([name, info]) => ({ name, ...info }))
    : undefined;

  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '180px',
      order: 10,
      sorter: tableConfig.defaultSorter('name'),
      render: (name) => (
        <Button type="link" style={{ padding: 0, fontWeight: 600 }} onClick={() => navigate(`/msp/${name}`)}>
          {name}
        </Button>
      ),
    },
    {
      dataIndex: 'description',
      title: 'Description',
      order: 20,
      render: (desc) => desc || <span style={{ color: '#999' }}>—</span>,
    },
    {
      dataIndex: 'extends',
      title: 'Extends',
      width: '160px',
      order: 30,
      render: (ext) => (ext ? <Tag color="blue">{ext}</Tag> : <span style={{ color: '#999' }}>—</span>),
    },
    {
      dataIndex: 'versions',
      title: 'Packages',
      width: '100px',
      order: 40,
      render: (versions) => {
        const count = versions ? Object.keys(versions).length : 0;
        return <span>{count} pkg{count !== 1 ? 's' : ''}</span>;
      },
    },
    {
      dataIndex: 'author',
      title: 'Created By',
      width: '120px',
      order: 50,
      render: (author) => author || <span style={{ color: '#999' }}>—</span>,
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      width: '120px',
      order: 200,
      render: (_, record) => {
        const items = [
          {
            key: 'delete',
            label: <span style={{ color: '#ff4d4f' }}>Delete</span>,
            onClick: () => handleDelete(record.name),
          },
        ];
        return (
          <Dropdown menu={{ items }} trigger={['click']}>
            <Button size="small">Actions</Button>
          </Dropdown>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>MSP (SDK Presets)</h1>
        <Button
          color="primary"
          variant="solid"
          onClick={() => NiceModal.show('muse-manager.create-msp-modal')}
        >
          + Create Preset
        </Button>
      </div>
      <RequestStatus loading={!mspData && !error} error={!mspData && error} loadingMode="skeleton" />
      {mspData ? (
        <Table
          rowKey="name"
          columns={columns}
          dataSource={mspList}
          size="middle"
          pagination={{
            hideOnSinglePage: false,
            size: 'small',
            pageSize: 50,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} presets`,
          }}
        />
      ) : null}
    </div>
  );
}
