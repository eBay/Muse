import { useEffect } from 'react';
import museClient from '../../museClient';
import { Table } from 'antd';
import { useNavigate, Link } from 'react-router-dom';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { usePollingMuseData } from '../../hooks';

export default function AppList() {
  //

  const { data: apps, error } = usePollingMuseData('muse.apps');
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
      <RequestStatus loading={!apps && !error} error={!apps && error} loadingMode="skeleton" />
      {apps && (
        <Table
          pagination={false}
          rowKey="name"
          size="middle"
          columns={columns}
          dataSource={apps}
          loading={!apps}
        />
      )}
    </div>
  );
}
