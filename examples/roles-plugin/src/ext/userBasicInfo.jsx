import { useSelector } from 'react-redux';

const ShowRoles = props => {
  const roles = useSelector(s => s.pluginRolesPlugin.roles); 
  const roleName = roles.find(r => r.id == props.value)?.name || props.value;
  console.log(props)
  return (
    <span>{roleName}</span>
  );
};

const userBasicInfo = {
    getFields() {
      return [
        {
          key: 'role',
          label: 'role',
          order: 40,
          viewWidget: ShowRoles,
        }
      ];
    },
};

export default userBasicInfo;