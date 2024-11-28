import NiceModal from '@ebay/nice-modal-react';
const museLayout = {
  header: {
    getConfig() {
      return {
        backgroundColor: '#000000',
        icon: '',
        title: 'Muse Managers',
        subTitle: 'Muse app and plugin manager.',
        themeSwitcher: true,
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
        mode: window.MUSE_GLOBAL.isSubApp ? 'none' : 'collapsable', // fixed | drawer | collapsable | collapsed | none
        siderDefaultCollapsed: true,
        homeMenu: true,
        width: 200,
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
          icon: 'ControlOutlined',
          link: '/plugins',
          label: 'Plugins',
        },
      ];
    },
  },
};

export default museLayout;
