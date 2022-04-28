import {
  MUSE_ANTD$COMMON_SET_NICE_MODAL_VISIBLE,
} from '../../../../src/features/common/redux/constants';

import {
  setNiceModalVisible,
  reducer,
} from '../../../../src/features/common/redux/setNiceModalVisible';

describe('common/redux/setNiceModalVisible', () => {
  it('returns correct action by setNiceModalVisible', () => {
    expect(setNiceModalVisible()).toHaveProperty('type', MUSE_ANTD$COMMON_SET_NICE_MODAL_VISIBLE);
  });

  it('handles action type MUSE_ANTD$COMMON_SET_NICE_MODAL_VISIBLE correctly', () => {
    const prevState = {};
    const state = reducer(
      prevState,
      { type: MUSE_ANTD$COMMON_SET_NICE_MODAL_VISIBLE }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = {};
    expect(state).toEqual(expectedState);
  });
});
