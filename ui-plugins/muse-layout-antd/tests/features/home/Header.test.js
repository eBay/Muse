import React from 'react';
import { act, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import plugin from 'js-plugin';
import * as testUtils from '../../test-utils';
import route from '../../../src/common/routeConfig';
import reducer from '../../../src/common/rootReducer';
import history from '@ebay/muse-lib-react/src/common/history';
import routeMuseLibAntd from '@ebay/muse-lib-antd/src/common/routeConfig';
import reducerMuseLibAntd from '@ebay/muse-lib-antd/src/common/rootReducer';
import { Header } from '../../../src/features/home';

describe('home/Header', () => {
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

  it('renders default Header with the Username and a default muse icon', async () => {
    act(() => {
      testUtils.renderWithProviders(<Header />);
    });

    const userName = screen.getByText('test');
    const defaultHeaderIcon = screen.getByRole('img', { name: 'header-icon' });
    expect(defaultHeaderIcon).toBeTruthy();
    expect(userName).toBeTruthy(); // this is the 'test' user mocked on the default MUSE_GLOBAL.getUser() mock

    // we can click on the username, and then wait for the "logout" menu to appear. Click on it to verify logout function is called.
    userEvent.click(userName);
    await waitFor(() => expect(screen.queryByText('Log Out')).toBeTruthy(), { timeout: 5000 });
    const logoutText = screen.queryByText('Log Out');
    userEvent.click(logoutText);
    await waitFor(() => expect(window.MUSE_GLOBAL.logout).toHaveBeenCalled(), { timeout: 5000 });

    // now let's see if we click on the default icon and go to home link
    userEvent.click(defaultHeaderIcon);
    await waitFor(() => expect(history.location.pathname).toBe('/'), {
      timeout: 3000,
    });
  });
});
