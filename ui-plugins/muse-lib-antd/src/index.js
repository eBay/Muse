import plugin from 'js-plugin';
import * as antd from 'antd';
import * as icons from '@ant-design/icons';
// import FormBuilder from 'antd-form-builder';
import * as ext from './ext';
import route from './common/routeConfig';
import reducer from './common/rootReducer';
// import NiceForm from '@ebay/nice-form-react';
import './initNiceForm';

import './styles/index.less';
import('antd/dist/reset.css');

plugin.register({
  ...ext,
  route,
  reducer,
  name: 'muse-antd',
});

let themeLoader;
const theme = window.MUSE_CONFIG?.appConfig && window.MUSE_CONFIG.appConfig.theme;
if (theme === 'dark' || document.location.search.includes('theme=dark')) {
  // themeLoader = import('antd/dist/antd.dark.css');
} else if (theme !== 'custom') {
  // themeLoader = import('antd/dist/antd.css');
}

// if (window.MUSE_LOADER && themeLoader) window.MUSE_LOADER.waitFor(themeLoader);
// window.MUSE_GLOBAL.waitFor?.(themeLoader);

// Use this trick to force include all antd's modules into the library.
export default { antd, icons };
