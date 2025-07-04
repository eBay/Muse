import React from 'react';
import { Table } from 'antd';
import { Link } from 'react-router-dom';
import jsPlugin from 'js-plugin';
import { useSearchParam } from 'react-use';
import { RequestStatus, Highlighter } from '@ebay/muse-lib-antd/src/features/common';
import tableConfig from '@ebay/muse-lib-antd/src/features/common/tableConfig';
import { usePollingMuseData } from '../../hooks';
import AppActions from './AppActions';
import AppListBar from './AppListBar';
import OwnerList from '../common/OwnerList';

export default function AppList() {
  const searchValue = useSearchParam('search')?.toLowerCase() || '';
  const { data: apps, error } = usePollingMuseData('muse.apps');
  const columns = [
    {
      dataIndex: 'name',
      title: 'Name',
      width: '220px',
      order: 10,
      sorter: tableConfig.defaultSorter('name'),
      render: (name) => (
        <Link to={`/app/${name}`}>
          <Highlighter search={searchValue} text={name} />
        </Link>
      ),
    },
    {
      dataIndex: 'owners',
      title: 'Owners',
      width: 200,
      order: 20,
      render: (owners) => <OwnerList owners={owners} searchKey={searchValue} count={2} />,
    },
    {
      dataIndex: 'createdBy',
      title: 'Created By',
      width: '120px',
      order: 30,
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      width: '160px',
      order: 200,
      render: (a, app) => {
        return <AppActions app={app} />;
      },
    },
  ];
  let appList = apps;

  const ctx = { appList };
  jsPlugin.invoke('museManager.am.appList.processAppList', ctx);
  appList = ctx.appList;

  appList = appList?.filter(
    (a) =>
      a.name.toLowerCase().includes(searchValue) ||
      a.owners?.some((o) => o.toLowerCase().includes(searchValue)),
  );

  return (
    <div>
      <h1>App List</h1>
      <RequestStatus loading={!apps && !error} error={!apps && error} loadingMode="skeleton" />
      {apps ? (
        <>
          <AppListBar />
          <Table
            rowKey="name"
            columns={columns}
            dataSource={appList}
            loading={!apps}
            size="small"
            pagination={{
              hideOnSinglePage: false,
              size: 'small',
              pageSize: 50,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
              showQuickJumper: true,
            }}
          />
        </>
      ) : null}
    </div>
  );
}
