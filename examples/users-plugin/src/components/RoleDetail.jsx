import { useParams } from 'react-router-dom';
import { Button, Form, Alert, Tabs } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import RoleInfoModal from './RoleInfoModal';
import NiceForm from '@ebay/nice-form-react';
import { SolutionOutlined } from '@ant-design/icons';
import useRoles from '../hooks/useRoles';

export default function RoleDetail() {
  const { id } = useParams();
  const { data: roles = [], isLoading, isError } = useRoles();
  
  const role = roles.find(r => r.id === parseInt(id));

  if (isLoading) {
    return <Alert message="Loading..." type="info" showIcon />;
  }
  
  if (isError || !role) {
    return <Alert message="Role not found" type="error" showIcon />;
  }

  const meta = {
    viewMode: true,
    initialValues: role,
    columns: 1,
    fields: [
      { key: 'name', label: 'Name', order: 10 },
      { key: 'description', label: 'Description', order: 20, widget: 'textarea' },
      { key: 'duty', label: 'Duty', order: 30, widget: 'textarea' },
      { key: 'roleLevel', label: 'Role Level', order: 40 },
    ],
  };

  const tabs = [
    {
      key: 'basicInfo',
      label: 'Role Information',
      children: (
        <div className="p-3">
          <Form>
            <NiceForm meta={meta} viewMode={true} />
          </Form>
        </div>
      ),
    }
  ];

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: 24 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 64,
            height: 64,
            backgroundColor: '#f57c00',
            borderRadius: '50%',
            marginRight: 16,
          }}
        >
          <SolutionOutlined style={{ fontSize: 32, color: 'white' }} />
        </div>
        <span style={{ fontSize: 28, fontWeight: 600 }}>{role.name}</span>
        <Button
          type="link"
          size="small"
          onClick={() => {
            NiceModal.show(RoleInfoModal, { role });
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
