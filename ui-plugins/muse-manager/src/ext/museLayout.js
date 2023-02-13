import NiceModal from '@ebay/nice-modal-react';
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
    getItems() {
      return [
        {
          key: 'createMenu',
          icon: 'PlusOutlined',
          position: 'right',
          type: 'menu',
          menuMeta: {
            trigger: {
              label: '+ Create',
            },
            items: [
              {
                key: 'createApp',
                label: 'Create App',
                onClick: () => {
                  NiceModal.show('muse-manager.create-app-modal');
                },
              },
              {
                key: 'createPlugin',
                onClick: () => {
                  NiceModal.show('muse-manager.create-plugin-modal');
                },
                label: 'Create Plugin',
              },
            ],
          },
        },
      ];
    },
  },

  sider: {
    getConfig() {
      return {
        mode: 'collapsable', // fixed | drawer | collapsable | collapsed | none
        siderDefaultCollapsed: true,
        homeMenu: true,
        theme: 'light', // dark | light
      };
    },
    getItems: () => {
      return [
        {
          key: 'apps',
          icon: 'AppstoreOutlined',
          link: '/apps',
          label: 'Apps',
        },
        {
          key: 'plugins',
          icon: 'StarOutlined',
          link: '/plugins',
          label: 'Plugins',
        },
      ];
    },
  },
};

export default museLayout;
