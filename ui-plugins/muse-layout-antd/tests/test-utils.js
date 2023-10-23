import React from 'react';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import NiceModal from '@ebay/nice-modal-react';
import { ConfigProviderWrapper } from '@ebay/muse-lib-antd/src/features/common';
import '@ebay/muse-craco-plugin/lib/jest/__mocks__/museConfig.js';
import '@ebay/muse-craco-plugin/lib/jest/__mocks__/museEntries.js';
import history from '@ebay/muse-lib-antd/src/common/history';
import store from './storeForTests';

export const renderWithStoreAndProviders = (store, ui, { reduxState } = {}) => {
  return {
    ...render(
      <Provider store={store}>
        <ConfigProviderWrapper>
          <NiceModal.Provider>
            <Router location={history.location} navigator={history}>
              {ui}
            </Router>
          </NiceModal.Provider>
        </ConfigProviderWrapper>
      </Provider>,
    ),
    history,
  };
};

export const renderWithProviders = (ui, { reduxState } = {}) => {
  const defaultStore = store.getStore();
  return {
    ...render(
      <Provider store={defaultStore}>
        <ConfigProviderWrapper>
          <NiceModal.Provider>
            <Router location={history.location} navigator={history}>
              {ui}
            </Router>
          </NiceModal.Provider>
        </ConfigProviderWrapper>
      </Provider>,
    ),
    history,
  };
};
