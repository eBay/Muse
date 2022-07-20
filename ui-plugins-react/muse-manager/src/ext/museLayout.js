const museLayout = {
  header: {
    getConfig() {
      return {
        backgroundColor: '#37474F',
        icon: '',
        title: 'Muse Manager',
        subTitle: 'Muse app and plugin manager.',
      };
    },
  },

  sider: {
    getConfig() {
      return {
        mode: 'fixed', // fixed | drawer | collapsable | collapsed | none
        siderDefaultCollapsed: true,
        homeMenu: true,
        theme: 'light', // dark | light
      };
    },
    getItems: () => {
      return [
        {
          key: 'apps',
          icon: 'StarOutlined',
          link: '/app-list',
          label: 'Apps',
        },
        {
          key: 'plugins',
          icon: 'StarOutlined',
          link: '/plugin-list',
          label: 'Plugins',
        },
      ];
    },
  },
};

export default museLayout;
