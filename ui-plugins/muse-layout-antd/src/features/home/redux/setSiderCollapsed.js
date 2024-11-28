import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED } from './constants';

export function setSiderCollapsed(collapsed) {
  localStorage.setItem('muse-layout_sider-bar-collapsed', collapsed ? 'true' : 'false');
  return {
    type: MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED,
    data: collapsed,
  };
}

export function useSetSiderCollapsed() {
  const dispatch = useDispatch();
  const siderCollapsed = useSelector((state) => state.pluginEbayMuseLayoutAntd.home.siderCollapsed);
  const boundAction = useCallback(
    (...params) => dispatch(setSiderCollapsed(...params)),
    [dispatch],
  );
  return { siderCollapsed, setSiderCollapsed: boundAction };
}

export function reducer(state, action) {
  switch (action.type) {
    case MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED:
      return {
        ...state,
        siderCollapsed: action.data,
      };

    default:
      return state;
  }
}
