import { useMemo, useCallback, useEffect } from 'react';
import { Button, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import { useModal } from '@ebay/nice-modal-react';
import UserInfoModal from './UserInfoModal';
import { UserOutlined } from '@ant-design/icons';
import './UserList.less';
import { Link } from 'react-router-dom';
import useUsers from '../hooks/useUsers';
import { useQueryClient } from '@tanstack/react-query';
 import useAvatar from '../hooks/useAvatar';

 function NameCell({ name, user }) {
  const avatarUrl = useAvatar(user);
  return (
    <div className="user-name-cell">
      {avatarUrl ? (
        <img src={avatarUrl} alt="user-avatar" className="avatar" />
      ) : (
        <div className="avatar">
          <UserOutlined />
        </div>
      )}
      <Link to={`/users/${user.id}`}>{name}</Link>
      <p>{user.job}</p>
    </div>
  );
}

export default function UserList() {
  const userModal = useModal(UserInfoModal);
  const queryClient = useQueryClient();
  const { data: users = [], isLoading, isError, error } = useUsers();

  const handleEditUser = useCallback(
    user => {
      userModal.show({ user }).then(() => {
        queryClient.invalidateQueries({ queryKey: ['users'] });
      });
    },
    [userModal, queryClient],
  );

  const columns = useMemo(
    () => [
      {
        title: 'Name',
        dataIndex: 'name',
        width: '350px',
        order: 10,
        render: (name, user) => <NameCell name={name} user={user} />,
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

  if (isError)
    return <div className="user-list">Error loading users: {error.message}</div>;
  if (isLoading)
    return <div className="user-list">Loading users...</div>;

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
