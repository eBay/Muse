import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { useSetLayoutConfig } from '../../../../src/features/home/redux/hooks';
import { Provider } from 'react-redux';
import plugin from 'js-plugin';
import route from '../../../../src/common/routeConfig';
import reducer from '../../../../src/common/rootReducer';
import routeMuseLibAntd from '@ebay/muse-lib-antd/src/common/routeConfig';
import reducerMuseLibAntd from '@ebay/muse-lib-antd/src/common/rootReducer';
import store from '../../../storeForTests';

describe('home/redux', () => {
  beforeAll(() => {
    plugin.register({
      name: '@ebay/muse-layout-antd',
      route,
      reducer,
    });

    plugin.register({
      name: '@ebay/muse-lib-antd',
      route: routeMuseLibAntd,
      reducer: reducerMuseLibAntd,
    });
  });

  afterAll(() => {
    if (plugin.getPlugin('@ebay/muse-layout-antd')) {
      plugin.unregister('@ebay/muse-layout-antd');
    }
    if (plugin.getPlugin('@ebay/muse-lib-antd')) {
      plugin.unregister('@ebay/muse-lib-antd');
    }
  });
  it('useSetLayoutConfig', () => {
    const defaultStore = store.getStore();
    const wrapper = ({ children }) => <Provider store={defaultStore}>{children}</Provider>;
    const { result } = renderHook(() => useSetLayoutConfig(), { wrapper });
    act(() => {
      result.current.setLayoutConfig({ dummy: true });
    });
    expect(result.current.layoutConfig).toStrictEqual({ dummy: true });
  });
});
