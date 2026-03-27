import { useParams } from 'react-router-dom';
import { Button, Avatar, Form, Alert, Tabs } from 'antd';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import NiceModal from '@ebay/nice-modal-react';
import UserInfoModal from './UserInfoModal';
import NiceForm from '@ebay/nice-form-react';
import utils from '@ebay/muse-lib-antd/src/utils';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import useUserDetail from '../hooks/useUserDetail';
import useAvatar from '../hooks/useAvatar';

export default function UserDetail() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { data: user, isLoading, isError } = useUserDetail(id);
  const avatarUrl = useAvatar(user);

  useEffect(() => {
    if (user && user.id && user.name) {
      dispatch({
        type: 'add-recently-viewed',
        payload: {
          id: user.id,
          name: user.name,
        },
      });
    }
  }, [user, dispatch]);

  if (isLoading) {
    return <Alert message="Loading..." type="info" showIcon />;
  }
  if (isError || !user) {
    return <Alert message="User not found" type="error" showIcon />;
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

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <Avatar
          src={avatarUrl}
          size={64}
          style={{ marginRight: 16, fontSize: 28 }}
        >
          {!avatarUrl && user.name ? user.name[0] : null}
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
