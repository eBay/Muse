import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT } from './constants';

export function updateMuseLayout() {
  return {
    type: MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT,
  };
}

export function useUpdateMuseLayout() {
  const dispatch = useDispatch();
  const seed = useSelector(state => state.pluginMuseLayout.home.seed);
  const boundAction = useCallback((...params) => dispatch(updateMuseLayout(...params)), [dispatch]);
  return { seed, updateMuseLayout: boundAction };
}

export function reducer(state, action) {
  switch (action.type) {
    case MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT:
      return {
        ...state,
        seed: state.seed + 1,
      };

    default:
      return state;
  }
}
