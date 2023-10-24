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
import { HeaderItem } from '../../../src/features/home';

describe('home/HeaderItem', () => {
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

  it('renders node with correct class name', () => {
    const { container } = testUtils.renderWithProviders(
      <HeaderItem
        meta={{
          label: 'label',
          link: 'link',
          linkTarget: 'linkTarget',
          onClick: jest.fn(),
          icon: '',
          className: '',
        }}
      />,
    );
    expect(container.querySelectorAll('.muse-layout_home-header-item').length).toBe(1);
  });
});
