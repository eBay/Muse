import { useMemo, useCallback } from 'react';
import { Button, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { useModal } from '@ebay/nice-modal-react';
import UserInfoModal from './UserInfoModal';
import { UserOutlined } from '@ant-design/icons';
import './UserList.less';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

export default function UserList() {
  const userModal = useModal(UserInfoModal);
  const users = useSelector(s => s.pluginUsersPlugin.users);

  const handleEditUser = useCallback(
    user => {
      userModal.show({ user });
    },
    [userModal],
  );

  const columns = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        width: '350px',
        order: 10,
        render: (name, user) => {
          return (
            <div className="user-name-cell">
              {user.avatar ? (
                <img src={user.avatar} alt="user-avatar" className="avatar" />
              ) : (
                <div className="avatar">
                  <UserOutlined />
                </div>
              )}
              <Link to={`/users/${user.id}`}>{name}</Link>
              <p>{user.job}</p>
            </div>
          );
        },
      },
      {
        title: 'Address',
        dataIndex: 'address',
        order: 20,
      },
      {
        title: 'Edit',
        width: '100px',
        order: 100,
        render(value, user) {
          return (
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => {
                handleEditUser(user);
              }}
            />
          );
        },
      },
    ],
    [handleEditUser],
  );

  columns.push(
    ..._.flatten(jsPlugin.invoke('userList.columns.getColumns', { columns })).filter(Boolean),
  );
  jsPlugin.sort(columns);

  return (
    <div className="user-list">
      <h1>Users List</h1>
      <Button type="primary" onClick={() => userModal.show()} style={{ float: 'right' }}>
        + New User
      </Button>
      <p style={{ color: 'gray' }}>
        This is the user list component allowing other plugins to customize the columns.
      </p>
      <Table
        size="small"
        rowKey="id"
        pagination={false}
        columns={columns}
        dataSource={users}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
}
