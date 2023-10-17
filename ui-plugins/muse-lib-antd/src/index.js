import plugin from 'js-plugin';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import * as ext from './ext';
import route from './common/routeConfig';
import reducer from './common/rootReducer';
import './initNiceForm';
import { ConfigProviderWrapper } from './features/common';
import utils from './utils';
import './modals';

import './styles/index.less';
import('antd/dist/reset.css');

plugin.register({
  ...ext,
  route,
  root: {
    getProviders: () => {
      return {
        order: 35,
        key: 'antd-config-provider',
        provider: ConfigProviderWrapper,
      };
    },
  },
  reducer,
  name: '@ebay/muse-lib-antd',
});

// Use this trick to force include all antd's modules into the library.
export default { antd, icons, utils };
