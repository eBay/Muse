import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { SUB_APP_SET_SUB_APP_STATE, SUB_APP_CLEAR_SUB_APP_STATE } from './constants';

export function setSubAppState(state) {
  return {
    type: SUB_APP_SET_SUB_APP_STATE,
    data: state,
  };
}

export function clearSubAppState() {
  return {
    type: SUB_APP_CLEAR_SUB_APP_STATE,
  };
}

export function useSetSubAppState() {
  const dispatch = useDispatch();
  const subAppState = useSelector(state => state.subApp.subAppState);
  const boundAction = useCallback((...params) => dispatch(setSubAppState(...params)), [dispatch]);
  const boundClearSubAppState = useCallback((...params) => dispatch(clearSubAppState(...params)), [
    dispatch,
  ]);
  return { subAppState, setSubAppState: boundAction, clearSubAppState: boundClearSubAppState };
}

export function reducer(state, action) {
  switch (action.type) {
    case SUB_APP_SET_SUB_APP_STATE:
      return {
        ...state,
        subAppState: action.data,
      };
    case SUB_APP_CLEAR_SUB_APP_STATE:
      return {
        ...state,
        subAppState: {},
      };
    default:
      return state;
  }
}
