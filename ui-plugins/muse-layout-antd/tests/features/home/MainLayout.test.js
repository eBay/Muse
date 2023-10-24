import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import plugin from 'js-plugin';
import * as testUtils from '../../test-utils';
import route from '../../../src/common/routeConfig';
import reducer from '../../../src/common/rootReducer';
import history from '@ebay/muse-lib-react/src/common/history';
import routeMuseLibAntd from '@ebay/muse-lib-antd/src/common/routeConfig';
import reducerMuseLibAntd from '@ebay/muse-lib-antd/src/common/rootReducer';
import { MainLayout } from '../../../src/features/home';

describe('home/MainLayout', () => {
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

  it('renders default MainLayout', () => {
    const { container } = testUtils.renderWithProviders(<MainLayout />);
    expect(container.querySelectorAll('.muse-layout-wrapper').length).toBe(1);
  });
});
