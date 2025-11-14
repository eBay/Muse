import { useMemo, useCallback, useEffect } from 'react';
import { Button, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import { useSelector, useDispatch } from 'react-redux';
import { useModal } from '@ebay/nice-modal-react';
import UserInfoModal from './UserInfoModal';
import { UserOutlined } from '@ant-design/icons';
import './UserList.less';
import { Link } from 'react-router-dom';
import useUsers from '../hooks/useUsers';

export default function UserList() {
  const userModal = useModal(UserInfoModal);
  const { data: usersRemote, loading, error } = useUsers();
  const UsersInStore = useSelector((state => state.pluginUsersPlugin.users));
  const dispatch = useDispatch();

  const getAvatarUrl = (user) => {
    if (user && user.avatar) return `https://buluu97.github.io/muse-next-database/mock/${user.avatar.replace(/^\/*/, '')}`;
    return null;
  };

  useEffect(() => {
    const localUsers = localStorage.getItem('users');
    if(localUsers) {
      dispatch({type: 'set-users', payload: JSON.parse(localUsers)});
    } else if (usersRemote.length>0)
    {
      dispatch({type: 'set-users', payload: usersRemote});
    }
  }, [dispatch, usersRemote]);

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
          const avatarUrl = getAvatarUrl(user);
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

  if(error)
    return <div className="user-list">Error loading users: {error.message}</div>;
  if(loading)
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
        dataSource={UsersInStore}
        style={{ marginTop: '20px' }}
      />
    </div>
  );
}
