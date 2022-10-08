import { useMemo, useCallback, useState } from 'react';
import { Button, Table } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import jsPlugin from 'js-plugin';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { useModal } from '@ebay/nice-modal-react';
import UserInfoModal from './UserInfoModal';
import mockData from '../mock';
import './UserList.less';

export default function UserList() {
  const userModal = useModal(UserInfoModal);
  const users = useSelector(s => s.pluginUsersPlugin.users);

  const handleNewUser = useCallback(() => {
    userModal.show().then(newUser => {
      // setUsers([newUser, ...users]);
    });
  }, [userModal, users]);

  const handleEditUser = useCallback(
    user => {
      userModal.show({ user }).then(newUser => {
        // setUsers(users => {
        //   // Modify users immutablly
        //   const i = users.findIndex(u => u.id === newUser.id);
        //   const updated = { ...users[i], ...newUser };
        //   const arr = [...users];
        //   arr.splice(i, 1, updated);
        //   return arr;
        // });
      });
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
              <img src={user.avatar} alt="user-avatar" />
              <label>{name}</label>
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

  columns.push(..._.flatten(jsPlugin.invoke('userList.columns.getColumns', { columns })));
  jsPlugin.sort(columns);

  return (
    <div className="user-list">
      <h1>Users List</h1>
      <p style={{ color: 'gray' }}>
        This is the user list component provides extension points for other plugins to customizing.
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
