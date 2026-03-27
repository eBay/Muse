import { useMemo } from 'react';
import { Button, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import { useModal } from '@ebay/nice-modal-react';
import { Link } from 'react-router-dom';
import RoleInfoModal from './RoleInfoModal';
import './RoleList.less';
import useRoles from '../hooks/useRoles';
import { SolutionOutlined } from '@ant-design/icons';

function NameCell({ name, role }) {
  return (
    <div className="role-name-cell">
      <div className="role-icon">
        <SolutionOutlined />
      </div>
      <div>
        <Link to={`/roles/${role.id}`} className="role-name-link">
          {name}
        </Link>
        <p className="role-description">{role.description}</p>
      </div>
    </div>
  );
}

export default function RoleList() {
  const roleModal = useModal(RoleInfoModal);
  const { data: roles = [] } = useRoles();

  const columns = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        width: '300px',
        order: 10,
        render: (name, role) => <NameCell name={name} role={role} />,
      },
      {
        title: 'Role Level',
        dataIndex: 'roleLevel',
        width: '150px',
        order: 15,
      },
      {
        title: 'Duty',
        dataIndex: 'duty',
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
