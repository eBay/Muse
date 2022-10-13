import { useSelector } from 'react-redux';
import { AuditOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './RolesCountWidget.less';

const RolesCountWidget = () => {
  const roles = useSelector(s => s.pluginRolesPlugin.roles);

  return (
    <Link to="/roles" className="roles-count-widget">
      <AuditOutlined />
      <label className="roles-count">{roles.length}</label>
      <label className="roles-label">Roles</label>
    </Link>
  );
};
export default RolesCountWidget;
