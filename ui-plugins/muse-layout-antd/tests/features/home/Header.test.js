import React from 'react';
import { render, screen } from '@testing-library/react';
import plugin from 'js-plugin';
import * as testUtils from '../../test-utils';
import route from '../../../src/common/routeConfig';
import reducer from '../../../src/common/rootReducer';
import { Header } from '../../../src/features/home';

describe('home/Header', () => {

  beforeAll(() => {
    plugin.register({
      name: '@ebay/muse-layout-antd',
      route,
      reducer
    });
  });

  afterAll(() => {
    if (plugin.getPlugin('@ebay/muse-layout-antd')) { plugin.unregister('@ebay/muse-layout-antd') };
  });

  beforeEach(() => {
    testUtils.resetStore();    
  });

  it('renders default Header', () => {
    testUtils.renderWithProviders(<Header />);
  });
});
