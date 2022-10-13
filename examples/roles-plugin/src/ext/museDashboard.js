import CreateRoleWidget from '../components/CreateRoleWidget';
import RolesCountWidget from '../components/RolesCountWidget';

const museDashboard = {
  widget: {
    getCategories: () => {
      return {
        key: 'roles.dashboardCategory',
        name: 'Roles',
      };
    },
    getWidgets: () => {
      return [
        {
          key: 'roles.rolesCount',
          name: 'Roles Count',
          category: 'roles.dashboardCategory',
          description: 'A simple block to show how many roles in system.',
          // previewImage: markdownPreview,

          component: RolesCountWidget,
          width: 3,
          height: 3,
        },
        {
          key: 'roles.createRole',
          name: 'Create Role',
          category: 'roles.dashboardCategory',
          description: 'A simple block allow to create a role.',
          // previewImage: markdownPreview,

          component: CreateRoleWidget,
          width: 3,
          height: 3,
        },
      ];
    },
  },
};
export default museDashboard;
