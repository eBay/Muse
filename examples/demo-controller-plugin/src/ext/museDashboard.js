import ControllerWidget from '../components/ControllerWidget';

const museDashboard = {
  widget: {
    getWidgets: () => {
      return [
        {
          key: 'demoController.controller',
          name: 'Demo Controller',
          category: 'common',
          description: 'Control which plugins to load.',
          // previewImage: markdownPreview,

          component: ControllerWidget,
          width: 6,
          height: 8,
        },
      ];
    },
  },
};
export default museDashboard;
