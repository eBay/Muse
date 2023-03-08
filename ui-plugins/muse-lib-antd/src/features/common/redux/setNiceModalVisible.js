import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MUSE_ANTD$COMMON_SET_NICE_MODAL_VISIBLE } from './constants';

export function setNiceModalVisible(id, visible, args) {
  return {
    type: MUSE_ANTD$COMMON_SET_NICE_MODAL_VISIBLE,
    data: {
      id,
      visible,
      args,
    },
  };
}

export function useSetNiceModalVisible(id) {
  const dispatch = useDispatch();
  const niceModalArgs = useSelector(state => state.pluginEbayMuseLibAntd.common.niceModalArgs);
  const boundAction = useCallback(
    (visible, args) => dispatch(setNiceModalVisible(id, visible, args)),
    [dispatch, id],
  );
  const modalArgs = niceModalArgs[id];
  return { modalArgs: modalArgs || {}, visible: !!modalArgs, setVisible: boundAction };
}

export function reducer(state, action) {
  switch (action.type) {
    case MUSE_ANTD$COMMON_SET_NICE_MODAL_VISIBLE:
      const { id, visible, args } = action.data;
      return {
        ...state,
        niceModalArgs: {
          ...state.niceModalArgs,
          [id]: visible ? args || {} : null,
        },
      };

    default:
      return state;
  }
}
