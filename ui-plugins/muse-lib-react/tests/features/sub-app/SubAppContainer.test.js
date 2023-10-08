import React from 'react';
import { render, waitFor, act, screen } from '@testing-library/react';
import SubAppContainer from '../../../src/features/sub-app/SubAppContainer';
import history from '../../../src/common/history';

describe('sub-app/SubAppContainer', () => {

  beforeEach(() => {
    history.push('http://localhost/muse-apps');
  });

  afterEach(() => {
    act(() => {
      history.push('http://localhost');
    });
  });

  const subApp = {
    path: '/muse-apps',
    url: 'http://localhost/muse-apps',
    persist: false,
    name: 'musedemo',
    env: 'staging'
  };

  it('renders the component', () => {
    const { container } = render(<SubAppContainer subApp={subApp} />);
    expect(container.querySelector('.muse-react_sub-app-sub-app-container')).toBeTruthy();
  });

  it('navigates to the correct URL when the sub app changes', async () => {

    render(<SubAppContainer subApp={subApp} />);

    // initialize app on parent to show iframe tag
    window.postMessage({
      type: 'muse',
      from: {
        app: "test",
        env: "staging",
        clientKey: 'parent',
      },
      payload: {
        type: 'app-state-change',
        state: 'app-loaded',
      },
    },
    '*');

    // simulate child route change so that history gets debounced
    window.postMessage({
      type: 'muse',
      from: {
        app: "test",
        env: "staging",
        type: 'child',
      },
      payload: {
        type: 'child-route-change',
        path: '/muse-apps',
      },
    },
    '*');

    // history URL should change
    await waitFor(() => expect(history.location.pathname).toBe('/'), {
      timeout: 3000,
    });
  });

  it('c2s proxy failed', async () => {

    render(<SubAppContainer subApp={subApp} />);

    // initialize app on parent to simulate c2s proxy error
    window.postMessage({
      type: 'muse',
      from: {
        app: "test",
        env: "staging",
        clientKey: 'parent',
      },
      payload: {
        type: 'app-state-change',
        state: 'check-c2s-proxy-failed',
      },
    },
    '*');

    // c2s proxy error shows up
    await waitFor(() => expect(screen.getByText(/Error: failed to detect c2s proxy/)).toBeTruthy(), {
      timeout: 3000,
    });
    
  });
});