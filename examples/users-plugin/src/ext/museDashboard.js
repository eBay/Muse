import UsersCountWidget from '../components/UsersCountWidget';
import CreateUserWidget from '../components/CreateUserWidget';
import widgetPreviewUsersCount from '../images/widgetPreviewUsersCount.png';
import widgetPreviewCreateUser from '../images/widgetPreviewCreateUser.png';

const museDashboard = {
  widget: {
    getCategories: () => {
      return {
        key: 'users.dashboardCategory',
        name: 'Users',
      };
    },
    getWidgets: () => {
      return [
        {
          key: 'users.usersCount',
          name: 'Users Count',
          category: 'users.dashboardCategory',
          description: 'A simple block to show how many users in system.',
          previewImage: widgetPreviewUsersCount,
          component: UsersCountWidget,
          width: 3,
          height: 3,
        },
        {
          key: 'users.createUser',
          name: 'Create User',
          category: 'users.dashboardCategory',
          description: 'A simple block allow to create a user.',
          previewImage: widgetPreviewCreateUser,
          component: CreateUserWidget,
          width: 3,
          height: 3,
        },
      ];
    },
  },
};
export default museDashboard;
