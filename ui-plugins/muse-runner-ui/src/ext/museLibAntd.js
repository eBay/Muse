import { theme } from 'antd';

const museLibAntd = {
  configProvider: {
    processProps(configProps) {
      configProps.theme.algorithm = theme.darkAlgorithm;
    },
  },
};

export default museLibAntd;
