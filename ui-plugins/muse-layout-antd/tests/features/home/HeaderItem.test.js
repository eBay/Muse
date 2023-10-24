import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import plugin from 'js-plugin';
import history from '@ebay/muse-lib-react/src/common/history';
import * as testUtils from '../../test-utils';
import route from '../../../src/common/routeConfig';
import reducer from '../../../src/common/rootReducer';
import routeMuseLibAntd from '@ebay/muse-lib-antd/src/common/routeConfig';
import reducerMuseLibAntd from '@ebay/muse-lib-antd/src/common/rootReducer';
import { HeaderItem } from '../../../src/features/home';

describe('home/HeaderItem', () => {
  const { open } = window;

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

    delete window.open;
    // Replace with the custom value
    window.open = jest.fn();
  });

  afterAll(() => {
    if (plugin.getPlugin('@ebay/muse-layout-antd')) {
      plugin.unregister('@ebay/muse-layout-antd');
    }
    if (plugin.getPlugin('@ebay/muse-lib-antd')) {
      plugin.unregister('@ebay/muse-lib-antd');
    }

    // Restore original
    window.open = open;
  });

  it('renders link HeaderItem as Link', async () => {
    const onClickMock = jest.fn();
    const { container } = testUtils.renderWithProviders(
      <HeaderItem
        meta={{
          label: 'Demo',
          link: '/link',
          linkTarget: '_self',
          onClick: onClickMock,
          icon: 'CheckCircleOutput',
          className: '',
        }}
      />,
    );
    expect(container.querySelectorAll('.muse-layout_home-header-item').length).toBe(1);
    const labelLink = screen.getByText('Demo');
    userEvent.click(labelLink);
    // onClick should be called, and link should be changed by history object
    await waitFor(() => expect(onClickMock).toHaveBeenCalled());
    await waitFor(() => expect(history.location.pathname).toBe('/link'), { timeout: 3000 });
  });

  it('renders link HeaderItem in new window', async () => {
    const onClickMock = jest.fn();
    const { container } = testUtils.renderWithProviders(
      <HeaderItem
        meta={{
          label: 'Demo',
          link: '/link',
          linkTarget: '_blank',
          onClick: onClickMock,
          icon: 'CheckCircleOutput',
          className: '',
        }}
      />,
    );
    const labelLink = screen.getByText('Demo');
    userEvent.click(labelLink);
    // onClick should be called, and new open should be open
    await waitFor(() => expect(onClickMock).toHaveBeenCalled());
    await waitFor(() => expect(window.open).toHaveBeenCalledWith('/link'));
  });

  it('renders link HeaderItem with http/https', async () => {
    const onClickMock = jest.fn();
    const { container } = testUtils.renderWithProviders(
      <HeaderItem
        meta={{
          label: 'Demo',
          link: 'http://localhost/link',
          linkTarget: '_self',
          onClick: onClickMock,
          icon: 'CheckCircleOutput',
          className: '',
        }}
      />,
    );
    const labelLink = screen.getByText('Demo');
    userEvent.click(labelLink);
    // onClick should be called, and window location
    await waitFor(() => expect(onClickMock).toHaveBeenCalled());
    await waitFor(() => expect(window.location.href).toBe('http://localhost/link'), {
      timeout: 3000,
    });
  });
});
