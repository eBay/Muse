// Contribute to @ebay/muse-layout-antd plugin
const museLayout = {
  // Customize the header
  header: {
    getConfig: () => {
      return {
        backgroundColor: '#37474F',
        icon: '',
        title: 'User Manager',
        subTitle: 'A sample Muse application.',
      };
    },
  },
  // Customize the sider
  sider: {
    getItems: () => {
      return {
        key: 'users-list',
        order: 20,
        label: 'Users List',
        link: '/users',
        icon: 'team',
      };
    },
  },
};
export default museLayout;
