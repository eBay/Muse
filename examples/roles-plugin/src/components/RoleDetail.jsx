import { useParams } from 'react-router-dom';
import { Button, Form, Alert, Tabs } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import NiceModal from '@ebay/nice-modal-react';
import RoleInfoModal from './RoleInfoModal';
import NiceForm from '@ebay/nice-form-react';
import { useSelector } from 'react-redux';
import './RoleDetail.less';

export default function RoleDetail() {
  const { id } = useParams();
  const roles = useSelector(s => s.pluginRolesPlugin.roles);
  const role = roles.find(r => r.id === parseInt(id));

  if (!role) {
    return (
      <Alert 
        message="Role not found" 
        description="The requested role could not be found."
        type="error" 
        showIcon 
      />
    );
  }

  const meta = {
    viewMode: true,
    initialValues: role,
    columns: 1,
    fields: [
      { key: 'description', label: 'Description', order: 10, widget: 'textarea' },
      { key: 'duty', label: 'Duty', order: 20, widget: 'textarea' },
      { key: 'roleLevel', label: 'Level', order: 30 },
    ],
  };

  const tabs = [
    {
      key: 'roleInfo',
      label: 'Role Information',
      children: (
        <div className="role-info-tab">
          <Form>
            <NiceForm meta={meta} viewMode={true} />
          </Form>
        </div>
      ),
    }
  ];

  return (
    <div className="role-detail">
      <div className="role-detail-header">
        <div className="role-title">
          <h1>{role.name}</h1>
          <p className="role-subtitle">{role.description}</p>
        </div>
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => {
            NiceModal.show(RoleInfoModal, { role });
          }}
        >
          Edit Role
        </Button>
      </div>
      <Tabs items={tabs} />
    </div>
  );
}
