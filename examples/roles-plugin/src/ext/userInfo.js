import { useSelector } from 'react-redux';
import { Select } from 'antd';
const RoleSelect = props => {
  const roles = useSelector(s => s.pluginRolesPlugin.roles);
  return (
    <Select {...props}>
      {roles.map(role => (
        <Select.Option key={role.id} value={role.id}>
          {role.name}
        </Select.Option>
      ))}
    </Select>
  );
};
const userInfo = {
  fields: {
    getFields: () => {
      return {
        key: 'role',
        label: 'Role',
        order: 50,
        widget: RoleSelect,
      };
    },
  },
};

export default userInfo;
