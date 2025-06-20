import { useMemo, useCallback, useState } from 'react';
import { Button, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useModal } from '@ebay/nice-modal-react';
import RoleInfoModal from './RoleInfoModal';
import './RoleList.less';

export default function RoleList() {
  const roleModal = useModal(RoleInfoModal);
  const roles = useSelector((s) => s.pluginRolesPlugin.roles);

  const columns = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        width: '200px',
        order: 10,
      },
      {
        title: 'Description',
        dataIndex: 'description',
        order: 20,
      },
      {
        title: 'Edit',
        width: '100px',
        order: 100,
        render(value, role) {
          return (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                roleModal.show({ role });
              }}
            />
          );
        },
      },
    ],
    [roleModal],
  );

  columns.push(
    ..._.flatten(jsPlugin.invoke('RoleList.columns.getColumns', { columns })).filter(Boolean),
  );
  jsPlugin.sort(columns);

  return (
    <div className="role-list">
      <h1>Roles List</h1>
      <Button type="primary" onClick={() => roleModal.show()} style={{ float: 'right' }}>
        + New Role
      </Button>
      <p style={{ color: 'gray' }}>
        This is the role list component allow to manage roles in the system.
      </p>
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        columns={columns}
        dataSource={roles}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
}
