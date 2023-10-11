import {
    EBAY_MUSE_LIB_ANTD$COMMON_SET_IS_DARK_MODE,
  } from '../../../../src/features/common/redux/constants';
  
  import {
    setIsDarkMode,
    reducer,
  } from '../../../../src/features/common/redux/setIsDarkMode';
  
  describe('common/redux/setIsDarkMode', () => {
    it('returns correct action by setIsDarkMode', () => {
      expect(setIsDarkMode(true)).toHaveProperty('type', EBAY_MUSE_LIB_ANTD$COMMON_SET_IS_DARK_MODE);
    });
  
    it('handles action type EBAY_MUSE_LIB_ANTD$COMMON_SET_IS_DARK_MODE correctly', () => {
      const prevState = { isDarkMode: false };
      const state = reducer(
        prevState,
        { type: EBAY_MUSE_LIB_ANTD$COMMON_SET_IS_DARK_MODE, isDarkMode: true }
      );
      // Should be immutable
      expect(state).not.toBe(prevState);
      const expectedState = { isDarkMode: true };
      expect(state).toEqual(expectedState);
    });
  });