import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import plugin from 'js-plugin';
import * as testUtils from '../../test-utils';
import route from '../../../src/common/routeConfig';
import reducer from '../../../src/common/rootReducer';
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

  beforeEach(() => {
    testUtils.resetStore();
  });

  afterEach(() => {
    if (plugin.getPlugin('ut-plugin')) {
      plugin.unregister('ut-plugin');
    }
  });

  it('renders default MainLayout', () => {
    const { container } = testUtils.renderWithProviders(
      <MainLayout>
        <div>Test</div>
      </MainLayout>,
    );
    expect(container.querySelectorAll('.muse-layout-wrapper').length).toBe(1);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('renders with dark mode', () => {
    const { container } = testUtils.renderWithProviders(
      <MainLayout>
        <div>Test</div>
      </MainLayout>,
      { initialState: { pluginEbayMuseLibAntd: { common: { isDarkMode: true } } } },
    );
    expect(container.querySelectorAll('.muse-layout-wrapper').length).toBe(1);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(document.body.getAttribute('data-theme')).toBe('dark');
    expect(document.body.classList.contains('muse-theme-dark')).toBe(true);
  });

  it('renders with no header', () => {
    plugin.register({
      name: 'ut-plugin',
      museLayout: {
        header: {
          getConfig() {
            return {
              mode: 'none',
            };
          },
        },
      },
    });

    const { container } = testUtils.renderWithProviders(
      <MainLayout>
        <div>Test</div>
      </MainLayout>,
    );
    expect(container.querySelectorAll('.muse-layout-wrapper').length).toBe(1);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(container.querySelectorAll('.muse-layout-content-noheader').length).toBe(1);
  });

  it('renders with drawer mode', async () => {
    plugin.register({
      name: 'ut-plugin',
      museLayout: {
        sider: {
          getConfig() {
            return {
              mode: 'drawer',
            };
          },
        },
      },
    });

    const { container } = testUtils.renderWithProviders(
      <MainLayout>
        <div>Test</div>
      </MainLayout>,
      { initialState: { pluginEbayMuseLayoutAntd: { home: { siderCollapsed: false } } } },
    );
    expect(container.querySelectorAll('.muse-layout-wrapper').length).toBe(1);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(container.querySelectorAll('.ant-layout-sider').length).toBe(0);

    // try to click on menu icon to expand drawer
    const menuIcon = await screen.findByRole('img', { name: 'menu' });
    expect(menuIcon).toBeTruthy();
    userEvent.click(menuIcon);
    await waitFor(
      () =>
        expect(
          container.parentNode.querySelectorAll('.ant-drawer-content.muse-layout_side-drawer')
            .length,
        ).toBe(1),
      { timeout: 3000 },
    );
  });

  it('renders with fixed mode', () => {
    plugin.register({
      name: 'ut-plugin',
      museLayout: {
        sider: {
          getConfig() {
            return {
              mode: 'fixed',
            };
          },
        },
      },
    });
    const { container } = testUtils.renderWithProviders(
      <MainLayout>
        <div>Test</div>
      </MainLayout>,
    );
    expect(container.querySelectorAll('.muse-layout-wrapper').length).toBe(1);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(container.querySelectorAll('.ant-layout-sider').length).toBe(1);
    expect(container.querySelectorAll('.ant-drawer').length).toBe(0);
    expect(
      container.querySelector('.ant-layout-sider').classList.contains('ant-layout-sider-collapsed'),
    ).toBe(false);
  });

  it('renders with collapsable mode', () => {
    plugin.register({
      name: 'ut-plugin',
      museLayout: {
        sider: {
          getConfig() {
            return {
              mode: 'collapsable',
            };
          },
        },
      },
    });

    const { container } = testUtils.renderWithProviders(
      <MainLayout>
        <div>Test</div>
      </MainLayout>,
      { initialState: { pluginEbayMuseLayoutAntd: { home: { siderCollapsed: true } } } },
    );
    expect(container.querySelectorAll('.muse-layout-wrapper').length).toBe(1);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(container.querySelectorAll('.ant-layout-sider').length).toBe(1);
    expect(container.querySelectorAll('.ant-drawer').length).toBe(0);
    expect(
      container.querySelector('.ant-layout-sider').classList.contains('ant-layout-sider-collapsed'),
    ).toBe(true);
  });
});
