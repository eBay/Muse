import WelcomeWidget from '../components/WelcomeWidget';

const museDashboard = {
  widget: {
    getWidgets: () => {
      return [
        {
          key: 'docs.welcome',
          name: 'Welcome Widget',
          category: 'common',
          description: 'Show the welcome message in a widget.',
          // previewImage: markdownPreview,

          component: WelcomeWidget,
          width: 6,
          height: 5,
        },
      ];
    },
  },
};
export default museDashboard;
