import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  EBAY_MUSE_LAYOUT_ANTD$HOME_SET_IS_DARK_MODE,
} from './constants';

export function setIsDarkMode(isDarkMode) {
  return {
    type: EBAY_MUSE_LAYOUT_ANTD$HOME_SET_IS_DARK_MODE,
    isDarkMode: isDarkMode,
  };
}

export function useSetIsDarkMode() {
  const dispatch = useDispatch();
  const isDarkMode = useSelector(state => state.pluginEbayMuseLayoutAntd.home.isDarkMode);
  const boundAction = useCallback((...params) => dispatch(setIsDarkMode(...params)), [dispatch]);
  return { isDarkMode, setIsDarkMode: boundAction };
}

export function reducer(state, action) {
  switch (action.type) {
    case EBAY_MUSE_LAYOUT_ANTD$HOME_SET_IS_DARK_MODE:
      return {
        ...state,
        isDarkMode: action.isDarkMode
      };

    default:
      return state;
  }
}
