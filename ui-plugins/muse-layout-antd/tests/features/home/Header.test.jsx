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

  afterEach(() => {
    if (plugin.getPlugin('ut-plugin')) {
      plugin.unregister('ut-plugin');
    }
  });

  it('renders default Header with the Username and a default muse icon', async () => {
    testUtils.renderWithProviders(<Header />);
    window.MUSE_GLOBAL.logout = vi.fn();
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

  it('renders Header with theme switcher (default light theme)', async () => {
    plugin.register({
      name: 'ut-plugin',
      museLayout: {
        header: {
          getConfig() {
            return {
              backgroundColor: '#039be5',
              title: 'UT App Title',
              noUserMenu: true,
              themeSwitcher: true,
              subTitle: 'UT sub-title',
            };
          },
        },
      },
    });

    testUtils.renderWithProviders(<Header />);

    const lightThemeIcon = screen.getByRole('img', { name: 'theme-icon' });
    expect(lightThemeIcon).toBeTruthy();
    userEvent.click(lightThemeIcon);
    // we should have the dark theme icon now
    const darkThemeIcon = await screen.findByRole('img', { name: 'darktheme-icon' });
    expect(darkThemeIcon).toBeTruthy();

    // noUserMenu = true, so we can't find 'test' user text
    expect(screen.queryByText('test')).toBeFalsy();

    // title should be inside a <h1> element
    const titleH1 = screen.getByRole('heading', { level: 1 });
    expect(titleH1).toHaveTextContent('UT App Title');

    // and the subTitle inside a <p> element
    const subTitleP = screen.getByText('UT sub-title');
    expect(subTitleP).toBeTruthy();
  });

  it('renders Header with right/center/left items', async () => {
    plugin.register({
      name: 'ut-plugin',
      museLayout: {
        header: {
          getConfig() {
            return {
              backgroundColor: '#039be5',
              title: 'UT App Title',
              noUserMenu: true,
              themeSwitcher: false,
              subTitle: 'UT sub-title',
            };
          },
          getItems: () => {
            return [
              {
                key: 'item1',
                icon: 'CheckCircleOutlined',
                position: 'left',
                order: 1,
                link: '/left-demo',
              },

              {
                key: 'item2',
                icon: 'ClockCircleOutlined',
                position: 'center',
                order: 50,
                link: '/center-demo',
              },
              {
                key: 'item3',
                icon: 'CheckSquareOutlined',
                position: 'right',
                order: 100,
                link: '/right-demo',
              },
            ];
          },
        },
      },
    });

    const { container } = testUtils.renderWithProviders(<Header />);
    const icons = await screen.findAllByRole('img');
    expect(icons).toHaveLength(3);
    expect(container.querySelectorAll('.header-item-right')).toHaveLength(1);
    expect(container.querySelectorAll('.header-item-center')).toHaveLength(1);
  });

  it('renders Header with Drawer item', async () => {
    plugin.register({
      name: 'ut-plugin',
      museLayout: {
        header: {
          getConfig() {
            return {
              backgroundColor: '#039be5',
              title: 'UT App Title',
              noUserMenu: true,
              themeSwitcher: false,
              subTitle: 'UT sub-title',
            };
          },
          getItems: () => {
            return [
              {
                key: 'item1',
                icon: 'CheckCircleOutlined',
                position: 'left',
                order: 1,
                link: '/left-demo',
              },

              {
                key: 'item2',
                icon: 'ClockCircleOutlined',
                position: 'center',
                order: 50,
                link: '/center-demo',
              },
              {
                key: 'item3',
                icon: 'CheckSquareOutlined',
                position: 'right',
                order: 100,
                link: '/right-demo',
              },
            ];
          },
        },
      },
    });

    testUtils.renderWithProviders(<Header siderConfig={{ mode: 'drawer' }} />);

    const icons = await screen.findAllByRole('img');
    expect(icons).toHaveLength(4);
    const menuIcon = await screen.findByRole('img', { name: 'menu' });
    expect(menuIcon).toBeTruthy();
  });
});
