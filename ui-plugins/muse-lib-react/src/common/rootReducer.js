import { combineReducers } from 'redux';
// import { connectRouter } from 'connected-react-router';
import _ from 'lodash';
import plugin from 'js-plugin';
import NiceModal from '@ebay/nice-modal-react';
import homeReducer from '../features/home/redux/reducer';
import commonReducer from '../features/common/redux/reducer';
import subAppReducer from '../features/sub-app/redux/reducer';

// NOTE 1: DO NOT CHANGE the 'reducerMap' name and the declaration pattern.
// This is used for Rekit cmds to register new features, remove features, etc.
// NOTE 2: always use the camel case of the feature folder name as the store branch name
// So that it's easy for others to understand it and Rekit could manage them.

const reducerMap = {
  // router: connectRouter(history),
  modals: NiceModal.reducer,
  home: homeReducer,
  common: commonReducer,
  subApp: subAppReducer,
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
