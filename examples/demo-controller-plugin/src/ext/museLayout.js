import DemoController from '../components/DemoController';

const museLayout = {
  header: {
    getItems: () => {
      return {
        key: 'demo-controller',
        label: <DemoController />,
        position: 'right',
      };
    },
  },
};
export default museLayout;
