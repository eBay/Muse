import {
  MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG,
} from '../../../../src/features/home/redux/constants';

import {
  setLayoutConfig,
  reducer,
} from '../../../../src/features/home/redux/setLayoutConfig';

describe('home/redux/setLayoutConfig', () => {
  it('returns correct action by setLayoutConfig', () => {
    expect(setLayoutConfig()).toHaveProperty('type', MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG);
  });

  it('handles action type MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG correctly', () => {
    const prevState = {};
    const state = reducer(
      prevState,
      { type: MUSE_LAYOUT$HOME_SET_LAYOUT_CONFIG }
    );
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = {};
    expect(state).toEqual(expectedState);
  });
});
