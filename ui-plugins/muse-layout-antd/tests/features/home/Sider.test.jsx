import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import plugin from 'js-plugin';
import * as testUtils from '../../test-utils';
import route from '../../../src/common/routeConfig';
import reducer from '../../../src/common/rootReducer';
import routeMuseLibAntd from '@ebay/muse-lib-antd/src/common/routeConfig';
import reducerMuseLibAntd from '@ebay/muse-lib-antd/src/common/rootReducer';
import { Sider } from '../../../src/features/home';

describe('home/Sider', () => {
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

  it('renders default Sider', () => {
    const { container } = testUtils.renderWithProviders(<Sider />);
    expect(container.querySelectorAll('.muse-layout_side-drawer').length).toBe(0);
  });

  it('renders Sider with home menu', () => {
    const siderConfig = {
      mode: 'inline',
      homeMenu: true,
    };
    const { container } = testUtils.renderWithProviders(<Sider siderConfig={siderConfig} />);
    expect(container.querySelectorAll('.muse-layout_side-drawer').length).toBe(0);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders Sider with drawer mode', async () => {
    const siderConfig = {
      mode: 'drawer',
      homeMenu: false,
      width: 300,
    };
    const { container } = testUtils.renderWithProviders(<Sider siderConfig={siderConfig} />);
    await waitFor(() =>
      expect(container.parentNode.querySelectorAll('.muse-layout_side-drawer').length).toBe(1),
    );
  });
});
