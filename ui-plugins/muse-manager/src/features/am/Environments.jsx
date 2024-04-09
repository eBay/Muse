import React from 'react';
import { Table, Button, Tooltip } from 'antd';
import EnvActions from '../am/EnvActions';
import { useAbility } from '../../hooks';
import NiceModal from '@ebay/nice-modal-react';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import _ from 'lodash';

export default function Environments({ app }) {
  const ability = useAbility();

  let columns = [
    {
      dataIndex: 'name',
      title: 'Env name',
      width: '150px',
      order: 10,
      render: (env) => {
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
  extendArray(columns, 'columns', 'museManager.am.environments', { app });
  const canUpdateApp = ability.can('update', 'App', app);
  return (
    <>
      <Table
        pagination={false}
        rowKey="name"
        size="small"
        columns={columns}
        dataSource={_.toArray(app.envs)}
      />
      <Tooltip title={canUpdateApp ? '' : 'Only app owners have permission'}>
        <Button
          onClick={() => NiceModal.show('muse-manager.add-env-modal', { app })}
          type="link"
          style={{ marginTop: '20px', padding: 0 }}
          disabled={!canUpdateApp}
        >
          + Add Environment
        </Button>
      </Tooltip>
    </>
  );
}
