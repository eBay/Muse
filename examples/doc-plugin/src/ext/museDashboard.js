import WelcomeWidget from '../components/WelcomeWidget';
import widgetPreviewWelcome from '../images/widgetPreviewWelcome.png';

const museDashboard = {
  widget: {
    getWidgets: () => {
      return [
        {
          key: 'docs.welcome',
          name: 'Welcome Widget',
          category: 'common',
          description: 'Show the welcome message in a widget.',
          previewImage: widgetPreviewWelcome,
          component: WelcomeWidget,
          width: 6,
          height: 5,
        },
      ];
    },
  },
};
export default museDashboard;
