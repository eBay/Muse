import { Tag } from 'antd';
import { useSelector } from 'react-redux';

const RoleName = ({ roleId }) => {
  const roles = useSelector(s => s.pluginRolesPlugin.roles);
  const item = roleId && roles.find(r => r.id === roleId);
  if (!item) return null;
  return <Tag style={{ border: 'none' }}>{item.name}</Tag>;
};
const userList = {
  columns: {
    getColumns() {
      return {
        key: 'role',
        title: 'Role',
        dataIndex: 'role',
        order: 15,
        width: '150px',
        render: roleId => <RoleName roleId={roleId} />,
      };
    },
  },
};
export default userList;
