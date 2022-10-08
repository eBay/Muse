// Contribute to @ebay/muse-layout-antd plugin
const museLayout = {
  // Customize the sider
  sider: {
    getItems: () => {
      return {
        key: 'roles-list',
        label: 'Roles List',
        order: 30,
        link: '/roles',
        icon: 'audit',
      };
    },
  },
};
export default museLayout;
