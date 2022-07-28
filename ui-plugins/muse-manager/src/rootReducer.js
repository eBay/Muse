import { combineReducers } from 'redux';
import { reducer as museDataReducer } from './hooks/museHooks';

const reducerMap = {
  museData: museDataReducer,
};

export default combineReducers(reducerMap);
