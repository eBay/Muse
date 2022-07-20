import { useEffect } from 'react';
import museClient from '../../museClient';
import { Table } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import useMuse from '../../hooks/useMuse';

export default function AppList() {
  //
  const { data, pending, error } = useMuse('data.get', 'muse.apps');
  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '220px',
    },
    {
      dataIndex: 'createdBy',
      title: 'Created By',
      width: '120px',
    },
    {
      dataIndex: 'status',
      title: 'Status',
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
    },
  ];

  return (
    <div>
      <h1>App Manager</h1>
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
