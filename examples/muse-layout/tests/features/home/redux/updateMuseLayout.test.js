import {
  MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT,
} from '../../../../src/features/home/redux/constants';

import {
  updateMuseLayout,
  reducer,
} from '../../../../src/features/home/redux/updateMuseLayout';

describe('home/redux/updateMuseLayout', () => {
  it('returns correct action by updateMuseLayout', () => {
    expect(updateMuseLayout()).toHaveProperty('type', MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT);
  });

  it('handles action type MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT correctly', () => {
    const prevState = {};
    const state = reducer(
      prevState,
      { type: MUSE_LAYOUT$HOME_UPDATE_MUSE_LAYOUT }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = {};
    expect(state).toEqual(expectedState);
  });
});
