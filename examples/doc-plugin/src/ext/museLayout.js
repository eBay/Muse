// Contribute to @ebay/muse-layout-antd plugin
const museLayout = {
  // Customize the sider
  sider: {
    getItems: () => {
      return {
        key: 'docs',
        order: 40,
        label: 'Documentation',
        link: '/docs',
        icon: 'question-circle',
      };
    },
  },
};
export default museLayout;
