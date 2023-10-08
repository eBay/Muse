import { SUB_APP_SET_SUB_APP_STATE, SUB_APP_CLEAR_SUB_APP_STATE } from '../../../../src/features/sub-app/redux/constants';

import {
  setSubAppState,
  clearSubAppState,
  reducer,
} from '../../../../src/features/sub-app/redux/setSubAppState';

describe('sub-app/redux', () => {
  it('setSubAppState type', () => {
    expect(setSubAppState('new state')).toHaveProperty('type', SUB_APP_SET_SUB_APP_STATE);
  });

  it('clearSubAppState type', () => {
    expect(clearSubAppState()).toHaveProperty('type', SUB_APP_CLEAR_SUB_APP_STATE);
  });

  it('handles action type SUB_APP_SET_SUB_APP_STATE correctly', () => {
    const prevState = { subAppState: {} };
    const state = reducer(prevState, { type: SUB_APP_SET_SUB_APP_STATE, data: 'new state' });
    // Should be immutable
    expect(state).not.toBe(prevState);

    const expectedState = { subAppState: 'new state' };
    expect(state).toEqual(expectedState);
  });

  it('handles action type SUB_APP_CLEAR_SUB_APP_STATE correctly', () => {
    const prevState = { subAppState: { dummy: true } };
    const state = reducer(prevState, { type: SUB_APP_CLEAR_SUB_APP_STATE });
    // Should be immutable
    expect(state).not.toBe(prevState);

    const expectedState = { subAppState: {} };
    expect(state).toEqual(expectedState);
  });
});
