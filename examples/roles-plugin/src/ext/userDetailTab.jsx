import { useSelector } from 'react-redux';
import { Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';

const PositionInfoTab = ({ user }) => {
  const roles = useSelector(s => s.pluginRolesPlugin.roles);
  const role = roles.find(r => r.id === user.role);

  const meta = {
    viewMode: true,
    initialValues: role,
    columns: 1,
    fields: [
      { key: 'name', label: 'Name', order: 10 },
      { key: 'description', label: 'Description', order: 20 },
      { key: 'roleLevel', label: 'Level', order: 30 },
      { key: 'duty', label: 'Duty', order: 40 },
    ],
  };

  return (
    <div className="p-3">
      <Form>
        <NiceForm meta={meta} viewMode={true} />
      </Form>
    </div>
  );
};

const userDetailTab = {
  getTabs({ user }) {
    return [
      {
        key: 'positionInfo',
        label: 'Position Information',
        children: <PositionInfoTab user={user} />,
      }
    ];
  }
};

export default userDetailTab;