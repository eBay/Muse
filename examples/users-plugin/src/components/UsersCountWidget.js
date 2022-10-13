import { useSelector } from 'react-redux';
import { TeamOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './UsersCountWidget.less';

const UsersCountWidget = () => {
  const users = useSelector(s => s.pluginUsersPlugin.users);

  return (
    <Link to="/users" className="users-count-widget">
      <TeamOutlined />
      <label className="users-count">{users.length}</label>
      <label className="users-label">Users</label>
    </Link>
  );
};
export default UsersCountWidget;
