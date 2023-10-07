import React from 'react';
import { render, act, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SubAppContainer from '../../../src/features/sub-app/SubAppContainer';

describe('sub-app/SubAppContainer', () => {

  beforeEach(() => {
    window.history.pushState({}, '', new URL('http://localhost/muse-apps'));
  });

  afterEach(() => {
    window.history.pushState({}, '', new URL('http://localhost'));
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
    const { container } = render(<SubAppContainer subApp={subApp} />);
    const newSubApp = {
      path: '/muse-apps',
      url: 'http://localhost/muse-apps',
      persist: false,
      name: 'musedemo',
      env: 'staging'
    };
    await window.MUSE_GLOBAL.msgEngine.sendToParent({
      type: 'app-state-change',
      state: 'app-loaded',
    });
    userEvent.click(container.querySelector('.muse-react_sub-app-sub-app-container'));
    expect(window.location.href).toEqual(`${newSubApp.url}/`);
  });
});