// This is the plugin index, register plugin and load styles or other resources here.

import React from 'react';
import { createRoot } from 'react-dom/client';
import Root from './Root';
import plugin from 'js-plugin';
import Loadable from 'react-loadable';
import _ from 'lodash';
import * as reactUse from 'react-use';
import './styles/index.less';
import * as reactRouterDom from 'react-router-dom';
plugin.register({
  name: '@ebay/muse-lib-react', // reserve the plugin name
});

const renderApp = () => {
  let rootNode = document.getElementById('muse-react-root');
  if (!rootNode) {
    rootNode = document.createElement('div');
    rootNode.id = 'muse-react-root';
    document.body.appendChild(rootNode);
  }
  rootNode.innerHTML = '';
  const root = createRoot(rootNode);
  // Plugin can do some initialization before app render.
  plugin.invoke('onReady');
  window.__js_plugin = plugin; // Mainly for debugging
  root.render(<Root />);
};

window.MUSE_GLOBAL.appEntries.push({
  name: '@ebay/muse-lib-react',
  func: renderApp,
});

export default { Loadable, _, reactUse, reactRouterDom };
