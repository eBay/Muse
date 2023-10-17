import { combineReducers } from 'redux';
// import { connectRouter } from 'connected-react-router';
import _ from 'lodash';
import plugin from 'js-plugin';
import NiceModal from '@ebay/nice-modal-react';

// NOTE 1: DO NOT CHANGE the 'reducerMap' name and the declaration pattern.
// This is used for Rekit cmds to register new features, remove features, etc.
// NOTE 2: always use the camel case of the feature folder name as the store branch name
// So that it's easy for others to understand it and Rekit could manage them.

const reducerMap = {
  // router: connectRouter(history),
  modals: NiceModal.reducer,
};

export default () => {
  plugin.getPlugins('reducer').forEach(p => {
    const k = _.camelCase(`plugin-${p.name}`);
    if (!reducerMap[k]) {
      reducerMap[k] = p.reducer;
    } else {
      console.error('Duplicated reducer key for plugin: ', p.name);
    }
  });

  plugin.getPlugins('reducers').forEach(p => {
    Object.keys(p.reducers).forEach(k => {
      reducerMap[k] = p.reducers[k];
    });
  });

  return combineReducers(reducerMap);
};
