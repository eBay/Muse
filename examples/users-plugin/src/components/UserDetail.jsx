import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Button, Avatar, Form, Alert, Tabs } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import UserInfoModal from './UserInfoModal';
import NiceForm from '@ebay/nice-form-react';
import utils from '@ebay/muse-lib-antd/src/utils';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import { Children } from 'react';

export default function UserDetail() {
  const { id } = useParams();

  let user = useSelector((state) =>
    state.pluginUsersPlugin.users.find((u) => String(u.id) === String(id)),
  );

  if (!user) {
    const localUsers = localStorage.getItem('users');
    if (localUsers) {
      const users = JSON.parse(localUsers);
      user = users.find((u) => String(u.id) === String(id));
    }
    else 
      return <Alert message="User not found" type="error" showIcon />;
  }

  const getAvatarUrl = (user) => {
    if (user && user.avatar) return `https://buluu97.github.io/muse-next-database/mock/${user.avatar.replace(/^\/*/, '')}`;
    return null;
  };

  const meta = {
    viewMode: true,
    initialValues: user,
    columns: 1,
    fields: [
      { key: 'name', label: 'Name', order: 10 },
      { key: 'job', label: 'Job', order: 20 },
      { key: 'city', label: 'City', order: 30 },
      { key: 'address', label: 'Address', order: 50 },
    ],
  };
  utils.extendFormMeta(meta, 'userBasicInfo', { meta, user });

  const tabs = [
    {
      key: 'basicInfo',
      label: 'Basic Information',
      children: (
        <div className="p-3">
          <Form>
            <NiceForm meta={meta} viewMode={true} />
          </Form>
        </div>
      ),
    }
  ];
  extendArray(tabs, 'tabs', 'userDetailTab', { tabs, user });
  console.log('extended tabs:', tabs);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Avatar
          src={getAvatarUrl(user)}
          size={64}
          style={{ marginRight: 16, fontSize: 28 }}
        >
          {!getAvatarUrl(user) && user.name ? user.name[0] : null}
        </Avatar>
        <span style={{ fontSize: 28, fontWeight: 600 }}>{user.name}</span>
        <Button
          type="link"
          size="small"
          onClick={() => {
            NiceModal.show(UserInfoModal, { user });
          }}
          style={{ marginLeft: 16 }}
        >
          Edit
        </Button>
      </div>
      <Tabs items={tabs} /> 
    </div>
  );
}