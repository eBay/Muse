import { theme } from 'antd';

const museLibAntd = {
  configProvider: {
    getProps() {
      return {
        theme: {
          algorithm: theme.darkAlgorithm,
        },
      };
    },
  },
};

export default museLibAntd;
