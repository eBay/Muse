import {
  MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED,
} from '../../../../src/features/home/redux/constants';

import {
  setSiderCollapsed,
  reducer,
} from '../../../../src/features/home/redux/setSiderCollapsed';

describe('home/redux/setSiderCollapsed', () => {
  it('returns correct action by setSiderCollapsed', () => {
    expect(setSiderCollapsed()).toHaveProperty('type', MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED);
  });

  it('handles action type MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED correctly', () => {
    const prevState = {};
    const state = reducer(
      prevState,
      { type: MUSE_LAYOUT$HOME_SET_SIDER_COLLAPSED }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = {};
    expect(state).toEqual(expectedState);
  });
});
