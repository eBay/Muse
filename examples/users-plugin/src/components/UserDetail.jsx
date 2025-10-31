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
  const user = useSelector(state =>
    state.pluginUsersPlugin.users.find(u => u.id === parseInt(id))
  );

  if (!user) {
    return <Alert message="The user does not exist." type="error" showIcon />;
  }

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
          src={user.avatar}
          size={64}
          style={{ marginRight: 16, fontSize: 28 }}
        />
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