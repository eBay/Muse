import { useEffect } from 'react';
import museClient from '../../museClient';
import { Table } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useMuseData } from '../../hooks';

export default function AppList() {
  //

  const { data, pending, error } = useMuseData('muse.apps');
  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '220px',
      render: name => <Link to={`/app/${name}`}>{name}</Link>,
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
      <h1>App List</h1>
      <RequestStatus loading={!error && (pending || !data)} error={error} loadingMode="skeleton" />
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
