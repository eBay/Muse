import { combineReducers } from 'redux';
import { reducer as museDataReducer } from './hooks/useMuse';

const reducerMap = {
  museData: museDataReducer,
};

export default combineReducers(reducerMap);
