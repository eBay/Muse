import ControllerWidget from '../components/ControllerWidget';
import widgetPreviewPluginsSelector from '../images/widgetPreviewPluginsSelector.png';
const museDashboard = {
  widget: {
    getWidgets: () => {
      return [
        {
          key: 'demoController.controller',
          name: 'Demo Controller',
          category: 'common',
          description: 'Control which plugins to load.',
          previewImage: widgetPreviewPluginsSelector,
          component: ControllerWidget,
          width: 6,
          height: 8,
        },
      ];
    },
  },
};
export default museDashboard;
