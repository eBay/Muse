import { EBAY_MUSE_LAYOUT_ANTD$HOME_SET_IS_DARK_MODE } from '../../../../src/features/home/redux/constants';

import { setIsDarkMode, reducer } from '../../../../src/features/home/redux/setIsDarkMode';

describe('home/redux/setIsDarkMode', () => {
  it('returns correct action by setIsDarkMode', () => {
    expect(setIsDarkMode()).toHaveProperty('type', EBAY_MUSE_LAYOUT_ANTD$HOME_SET_IS_DARK_MODE);
  });

  it('handles action type EBAY_MUSE_LAYOUT_ANTD$HOME_SET_IS_DARK_MODE correctly', () => {
    const prevState = { isDarkMode: false };
    const state = reducer(prevState, {
      type: EBAY_MUSE_LAYOUT_ANTD$HOME_SET_IS_DARK_MODE,
      isDarkMode: true,
    });
    // Should be immutable
    expect(state).not.toBe(prevState);

    // TODO: use real case expected value instead of {}.
    const expectedState = { isDarkMode: true };
    expect(state).toEqual(expectedState);
  });
});
