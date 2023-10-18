import React from 'react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { render, screen, act, waitFor, within } from '@testing-library/react';
import { ConfigProviderWrapper } from '../../../src/features/common';
import { Button } from 'antd';
import store from '../../storeForTests';
import history from '../../../src/common/history';
import plugin from 'js-plugin';
import route from '../../../src/common/routeConfig';
import reducer from '../../../src/common/rootReducer';

window.MUSE_GLOBAL.app = { config: { theme : "light" }};

describe('common/ConfigProviderWrapper', () => {

  beforeEach(() => {
    if (plugin.getPlugin('@ebay/muse-lib-antd')) { plugin.unregister('@ebay/muse-lib-antd') };
  });

  it('renders ConfigProviderWrapper', async () => {

    plugin.register({
      name: '@ebay/muse-lib-antd',
      route,
      reducer
  });

    render(<Provider store={store.getStore()}>
        <Router location={history.location} navigator={history}>
            <ConfigProviderWrapper>
                <Button type='primary'>dummy button</Button>
            </ConfigProviderWrapper>
        </Router>
    </Provider>);

    const textbox = screen.getByRole('button');
    expect(textbox).toBeTruthy();
    expect(textbox).toHaveStyle('border-radius: 6px');
  });

  it('renders ConfigProviderWrapper with custom props', async () => {

    plugin.register({
      name: '@ebay/muse-lib-antd',
      route,
      reducer,
      museLibAntd: {
        configProvider: { processProps: (configProps) => {
          configProps.theme.token = {
            borderRadius: 0,
          }
        }}
      }
  });

    render(<Provider store={store.getStore()}>
        <Router location={history.location} navigator={history}>
            <ConfigProviderWrapper>
                <Button type='primary'>dummy button</Button>
            </ConfigProviderWrapper>
        </Router>
    </Provider>);

    const textbox = screen.getByRole('button');
    expect(textbox).toBeTruthy();
    expect(textbox).toHaveStyle('border-radius: 0');
  });
});