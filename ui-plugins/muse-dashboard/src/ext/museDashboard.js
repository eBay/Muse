// import { IFrameWidget, MarkdownWidget } from '../features/dashboard';
// import iframePreview from '../images/iframe.png';
// import markdownPreview from '../images/markdown.png';
import NoteWidget from '../components/widgets/NoteWidget';
const dashboard = {
  widget: {
    getCategories: () => {
      return {
        key: 'common',
        name: 'Common',
      };
    },
    getWidgets: () => {
      return [
        {
          key: 'dashboardNote',
          name: 'Note Widget',
          category: 'common',
          description:
            'Add a text-block to the dashbard. You can use this to describe what a section of widget of your dashboard does. Currently support Markdown (https://commonmark.org/help/) and GitHub Flavored Markdown (https://github.github.com/gfm/)',
          // previewImage: markdownPreview,
          settingsForm: {
            fields: [
              {
                key: 'content',
                label: 'Content',
                widgetProps: {
                  rows: 5,
                },
                widget: 'textarea',
              },
            ],
          }, // form builder meta
          component: NoteWidget,
          width: 4, // Same as: [4, 1, 12]
          height: 3, // Same as: [3, 1, Inifity]
        },
      ];
    },
  },
};
export default dashboard;
