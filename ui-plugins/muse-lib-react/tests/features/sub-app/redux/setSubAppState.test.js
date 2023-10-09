import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSetSubAppState } from '../../../../src/features/sub-app/redux/hooks';
import { Provider } from 'react-redux';
import store from '../../../../src/common/store';

describe('sub-app/redux', () => {
  it('setSubAppState', () => {
    const wrapper = ({ children }) => <Provider store={store.getStore()}>{children}</Provider>
    const { result } = renderHook(() => useSetSubAppState(), { wrapper });
    act(() => {
      result.current.setSubAppState("new state");
    });
    expect(result.current.subAppState).toBe("new state");
  });

  it('clearSubAppState', () => {
    const wrapper = ({ children }) => <Provider store={store.getStore()}>{children}</Provider>
    const { result } = renderHook(() => useSetSubAppState(), { wrapper });
    act(() => {
      result.current.clearSubAppState();
    });
    expect(result.current.subAppState).toEqual({});
  });
});