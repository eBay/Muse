import logo from '../images/user.png';

// Contribute to @ebay/muse-layout-antd plugin

const museLayout = {
  // Customize the header
  header: {
    getConfig: () => {
      return {
        backgroundColor: '#37474F',
        icon: logo,
        title: 'User Manager',
        subTitle: 'A Muse demo application.',
      };
    },
  },
  // Customize the sider
  sider: {
    getItems: () => {
      return [
        {
          key: 'users-list',
          order: 20,
          label: 'Users List',
          link: '/users',
          icon: 'team',
        },
        {
          key: 'test',
          order: 25,
          label: 'Test',
          link: '/test',
          icon: 'experiment',
        },
      ];
    },
  },
};
export default museLayout;
