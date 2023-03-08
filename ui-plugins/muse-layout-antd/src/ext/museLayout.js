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
          //   plugin.getPlugin('@ebay/muse-layout-antd').exports.updateMuseLayout();
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
        mode: 'fixed', // fixed | drawer | collapsable | collapsed | none
        siderDefaultCollapsed: true,
        homeMenu: true,
        theme: 'light', // dark | light
      };
    },
    getItems: () => {
      return [
        {
          key: 'side1',
          icon: 'DashboardOutlined',
          label: 'Dashboard',

          children: [
            {
              key: 'ana',
              label: 'Analysis',
              link: '/muse-demo/dashboard/analysis',
            },
          ],
        },
        {
          key: 'form1',
          label: 'Form',
          icon: 'EditOutlined',

          children: [
            {
              key: 'f1',
              label: 'Simple Form',
              link: '/muse-demo/form/simpleForm',
            },
            {
              key: 'f2',
              label: 'Basic Form',
              link: '/muse-demo/form/basicForm',
            },
            {
              key: 'f3',

              label: 'View Mode',
              link: '/muse-demo/form/viewMode',
            },
            {
              key: 'f4',

              label: 'View/Edit',
              link: '/muse-demo/form/viewEdit',
            },

            {
              key: 'f5',

              label: 'Dynamic Fields',
              link: '/muse-demo/form/dynamicFields',
            },
            {
              key: 'f6',
              label: 'Multiple Columns',
              link: '/muse-demo/form/multipleColumns',
            },
          ],
        },
        {
          key: 'list',
          icon: 'TableOutlined',
          label: 'List',
          children: [{ key: 'l1', label: 'Basic List', link: '/muse-demo/list/basicList' }],
        },
        {
          key: 'componentsGroup',
          label: 'Components',
          type: 'group',
        },
        {
          key: 'museComponents',
          label: 'Muse Antd',
          icon: 'StarOutlined',
          parent: 'componentsGroup',
          children: [
            {
              key: 'k1',
              icon: 'BlockOutlined',
              label: 'Block View',
              link: '/muse-demo/components/muse-antd/blockView',
            },
            {
              key: 'k3',
              icon: 'CodeOutlined',
              label: 'Code Viewer',
              link: '/muse-demo/components/muse-antd/codeViewerExample',
            },

            {
              key: 'k4',
              icon: 'CalendarOutlined',
              label: 'Date View',
              link: '/muse-demo/components/muse-antd/dateView',
            },

            {
              key: 'k5',
              icon: 'MenuOutlined',
              label: 'Dropdown Menu',
              link: '/muse-demo/components/muse-antd/dropdownMenu',
            },

            {
              key: 'k6',
              icon: 'ExclamationOutlined',
              label: 'Error Box',
              link: '/muse-demo/components/muse-antd/errorBox',
            },
            {
              key: 'k7',
              icon: 'ExclamationOutlined',
              label: 'Error Boundary',
              link: '/muse-demo/components/muse-antd/errorBoundary',
            },
            {
              key: 'k8',
              icon: 'Loading3QuartersOutlined',
              label: 'Global Loading',
              link: '/muse-demo/components/muse-antd/globalLoading',
            },
            {
              key: 'k9',
              icon: 'HighlightOutlined',
              label: 'Highlighter',
              link: '/muse-demo/components/muse-antd/highlighter',
            },
            {
              key: 'k10',
              icon: 'Loading3QuartersOutlined',
              label: 'Loading Mask',
              link: '/muse-demo/components/muse-antd/loadingMask',
            },

            {
              key: 'k11',
              icon: 'SearchOutlined',
              label: 'Table Bar',
              link: '/muse-demo/components/muse-antd/tableBar',
            },
            {
              key: 'k12',
              icon: 'QuestionOutlined',
              label: 'Page Not Found',
              link: '/muse-demo/components/muse-antd/pageNotFound',
            },
            {
              key: 'k13',
              icon: 'TagsOutlined',
              label: 'Tag Input',
              link: '/muse-demo/components/muse-antd/tagInput',
            },
            {
              key: 'k14',
              icon: 'FormOutlined',
              label: 'Wizard',
              link: '/muse-demo/components/muse-antd/wizard',
            },
            {
              key: 'niceModal',
              label: 'NiceModal',
              icon: 'file',
              link: '/muse-demo/components/muse-antd/niceModal',
            },
            // {
            //   key: 'k14',
            //   icon: 'CodeOutlined',
            //   label: 'Web Terminal',
            //   link: '/muse-demo/components/muse-antd/webTer',
            // },

            // {
            //   key: 'k4',
            //   icon: 'FormOutlined',
            //   label: 'Ecr Repo Input',
            //   link: '/muse-demo/components/muse-cc/ecr-repo-input',
            // },
          ],
        },
        {
          key: 'ccComponents',
          label: 'Cloud Console',
          parent: 'componentsGroup',
          icon: 'CloudOutlined',
          children: [
            {
              key: 'k15',
              icon: 'FormOutlined',
              label: 'Ecr Repo Input',
              link: '/muse-demo/components/muse-cc/ecrRepoInput',
            },
            {
              key: 'k16',
              icon: 'GithubOutlined',
              label: 'Git Repo Input',
              link: '/muse-demo/components/muse-cc/gitRepoInput',
            },
            {
              key: 'k17',
              icon: 'SelectOutlined',
              label: 'Jira Url Input',
              link: '/muse-demo/components/muse-cc/jiraUrlInput',
            },
            {
              key: 'k18',
              icon: 'UserOutlined',
              label: ' Manager Select',
              link: '/muse-demo/components/muse-cc/managerSelect',
            },
            {
              key: 'k19',
              icon: 'TeamOutlined',
              label: ' Team Select',
              link: '/muse-demo/components/muse-cc/teamSelect',
            },
          ],
        },
        {
          key: 'chartComponents',
          label: 'Chart',
          parent: 'componentsGroup',
          icon: 'BarChartOutlined',
          children: [
            {
              key: 'k20',
              icon: 'PieChartOutlined',
              label: 'Nivo Chart',
              link: '/muse-demo/components/muse-chart/nivoChart',
            },

            {
              key: 'k21',
              icon: 'NodeIndexOutlined',
              label: 'D3 Chart',
              link: '/muse-demo/components/muse-chart/d3Chart',
            },
          ],
        },
        {
          key: 'profile',
          label: 'Profile',
          icon: 'ProfileOutlined',
          type: 'group',
          children: [
            {
              icon: 'StarOutlined',
              label: 'Basic Profile',
            },
            {
              key: 'k22',
              icon: 'ContactsOutlined',
              label: 'Step Profile',
            },
          ],
        },
        {
          key: 'others',
          label: 'Others',
          icon: 'EllipsisOutlined',
          type: 'group',
          children: [
            {
              key: 'dynamic-menus',
              icon: 'MenuOutlined',
              label: 'Dynamic Menus',
              link: '/others/dynamic-menus',
            },
          ],
        },
      ];
    },
  },
};
