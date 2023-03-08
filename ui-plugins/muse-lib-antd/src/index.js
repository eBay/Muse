import plugin from 'js-plugin';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
import * as ext from './ext';
import route from './common/routeConfig';
import reducer from './common/rootReducer';
import './initNiceForm';
import utils from './utils';

import './styles/index.less';
import('antd/dist/reset.css');

plugin.register({
  ...ext,
  route,
  reducer,
  name: '@ebay/muse-lib-antd',
});

// Use this trick to force include all antd's modules into the library.
export default { antd, icons, utils };
