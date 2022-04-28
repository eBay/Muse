import plugin from 'js-plugin';
let seed = 0;
export default {
  header: {
    getConfig() {
      return {
        // mode: 'none',
        backgroundColor: '#039be5',
        icon: '',
        title: 'Muse App',
        subTitle: 'Build UI apps with ease!',
      };
    },
    userAvatar: {
      getItems() {
        return {
          key: 'haha',
          label: 'Hahah',
          parentMenu: 'userAvatar',
          order: 1,
        };
      },
    },
    getItems: () => {
      return [
        {
          key: 'item1',
          type: 'menu',
          position: 'right',
          order: 100,
          menuMeta: {
            trigger: {
              label: 'Help' + seed,
            },
            items: [
              {
                key: 'help1',
                label: 'Help1',
              },
            ],
          },
        },

        {
          key: 'item2',
          icon: 'ClockCircleOutlined',
          position: 'right',
          link: '/',
          // onClick: () => {
          //   seed++;
          //   plugin.getPlugin('muse-layout').exports.updateMuseLayout();
          // },
        },
        {
          key: 'item6',
          icon: 'CheckSquareOutlined',
          position: 'right',
          order: 1,
          link: '/bes',
        },
        // {
        //   key: 'item7',
        //   icon: 'ClockCircleOutlined',
        //   position: 'right',
        //   link: '/page1',
        // },
      ];
    },
  },

  sider: {
    getConfig() {
      return {
        mode: 'drawer', // fixed | drawer | collapsable | collapsed | none
        siderDefaultCollapsed: true,
        homeMenu: false,
        theme: 'light', // dark | light
      };
    },
    getItems: () => {
      return [];
    },
  },
};
