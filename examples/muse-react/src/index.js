// This is the plugin index, register plugin and load styles or other resources here.

import React from 'react';
import ReactDOM from 'react-dom';
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

  // Plugin can do some initialization before app render.
  plugin.invoke('onReady');
  window.__MUSE_LOADED_PLUGINS = plugin.getPlugins();
  window.__js_plugin = plugin;
  ReactDOM.render(<Root />, rootNode);
};

window.MUSE_GLOBAL.appEntries['muse-react'] = renderApp;

export default { Loadable, _, reactUse };
