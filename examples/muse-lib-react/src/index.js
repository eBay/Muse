// This is the plugin index, register plugin and load styles or other resources here.

import React from 'react';
// import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';

import Root from './Root';
import plugin from 'js-plugin';
import Loadable from 'react-loadable';
import _ from 'lodash';
import * as reactUse from 'react-use';
import './styles/index.less';

plugin.register({
  name: 'muse-react', // reserve the plugin name
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
  window.__MUSE_LOADED_PLUGINS = plugin.getPlugins();
  window.__js_plugin = plugin;
  root.render(<Root />);
};

window.MUSE_GLOBAL.appEntries.push({
  name: 'muse-react',
  func: renderApp,
}); //['muse-react'] = renderApp;

export default { Loadable, _, reactUse };
