import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import { MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG } from './constants';

export function setLayoutConfig(config) {
  return {
    type: MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG,
    data: config,
  };
}

export function useSetLayoutConfig() {
  const dispatch = useDispatch();
  const layoutConfig = useSelector((state) => state.pluginEbayMuseLayoutAntd.home.layoutConfig);
  const boundAction = useCallback((...params) => dispatch(setLayoutConfig(...params)), [dispatch]);
  return { layoutConfig, setLayoutConfig: boundAction };
}

export function reducer(state, action) {
  switch (action.type) {
    case MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG:
      return {
        ...state,
        layoutConfig: _.merge(state.layoutConfig, action.data),
      };

    default:
      return state;
  }
}
