import { Table } from 'antd';
import EnvActions from '../am/EnvActions';

export default function Environments({ app }) {
  const columns = [
    {
      dataIndex: 'name',
      title: 'Env name',
      width: '320px',
      render: env => {
        return <>{env}</>;
      },
    },
    {
      dataIndex: 'url',
      title: 'Url',
      width: '320px',
      render: url => {
        return <>{url}</>;
      },
    },
    {
      dataIndex: 'actions',
      title: 'Actions',
      width: '160px',
      render: (a, item) => {
        return <EnvActions env={item} app={app} />;
      },
    },
  ].filter(Boolean);

  return (
    <div>
      <div>
        <Table
          pagination={false}
          rowKey="name"
          size="middle"
          columns={columns}
          dataSource={Object.values(app.envs)}
        />
      </div>
    </div>
  );
}
