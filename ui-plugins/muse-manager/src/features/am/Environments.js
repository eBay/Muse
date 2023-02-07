import React from 'react';
import { Table } from 'antd';
import EnvActions from '../am/EnvActions';
import jsPlugin from 'js-plugin';
import _ from 'lodash';

export default function Environments({ app }) {
  let columns = [
    {
      dataIndex: 'name',
      title: 'Env name',
      width: '150px',
      order: 10,
      render: env => {
        return <>{env}</>;
      },
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      width: '160px',
      order: 100,
      render: (a, item) => {
        return <EnvActions env={item} app={app} />;
      },
    },
  ].filter(Boolean);
  columns.push(..._.flatten(jsPlugin.invoke('museManager.getEnvironmentsColumns', { app })));
  jsPlugin.invoke('museManager.processEnvironmentsColumns', { columns, app });
  columns = columns.filter(Boolean);
  jsPlugin.sort(columns);
  return (
    <Table
      bordered
      pagination={false}
      rowKey="name"
      size="middle"
      columns={columns}
      dataSource={_.toArray(app.envs)}
    />
  );
}
