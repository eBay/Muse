import { useEffect } from 'react';
import { Table, Button } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import useMuse from '../../hooks/useMuse';
import PluginActions from './PluginActions';

export default function PluginList() {
  //
  const { data, pending, error } = useMuse('data.get', 'muse.plugins');
  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '220px',
    },
    {
      dataIndex: 'type',
      title: 'Type',
      width: '80px',
    },
    {
      dataIndex: 'createdBy',
      title: 'Created By',
      width: '120px',
    },
    {
      dataIndex: 'repo',
      title: 'Repo',
    },
    {
      dataIndex: 'status',
      title: 'Status',
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      render: (a, item) => {
        return <PluginActions plugin={item} />;
      },
    },
  ];

  return (
    <div>
      <h1>Plugin Manager</h1>
      <div></div>
      <RequestStatus loading={pending || !data} error={error} loadingMode="skeleton" />
      {data && (
        <Table
          pagination={false}
          rowKey="name"
          size="middle"
          columns={columns}
          dataSource={data}
          loading={pending || !data}
        />
      )}
    </div>
  );
}
