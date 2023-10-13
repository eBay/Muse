import React from 'react';
import { render, screen, act, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { Router } from 'react-router';
import { MetaMenu } from '../../../src/features/common';
import store from '@ebay/muse-lib-react/src/common/store';
import history from '../../../src/common/history';
import { MenuUnfoldOutlined } from '@ant-design/icons';

describe('common/MetaMenu', () => {
  it('renders Sider MetaMenu with <Link/>', async () => {

    const closeDrawer = jest.fn();

    const meta = {
      menuProps: {},
      autoActive: true,
      mode: 'inline',
      theme: 'light',
      collapsed: false,
      items: [{
        key: 'home',
        label: 'Home',
        icon: 'home',
        link: '/',
        order: 10,
      }],
    };
  
    act(() => {
      render(<Provider store={store.getStore()}><Router location={history.location} navigator={history}><MetaMenu meta={meta} onClick={closeDrawer} baseExtPoint="museLayout.sider" /></Router></Provider>);
    });
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/');
    userEvent.click(screen.getByRole('link', { name: 'Home' }));

    await waitFor(
      () =>
      expect(closeDrawer).toHaveBeenCalled(),
      {
        timeout: 5000,
      }
    )
  });

  it('renders Sider MetaMenu with http(s) links', () => {

    const closeDrawer = jest.fn();

    const meta = {
      menuProps: {},
      autoActive: true,
      mode: 'inline',
      theme: 'light',
      collapsed: false,
      items: [{
        key: 'home',
        label: 'Home',
        icon: 'home',
        link: 'https://demo.muse.vip.ebay.com/',
        linkTarget: '_blank',
        order: 10,
      }],
    };
  
    act(() => {
      render(<Provider store={store.getStore()}><Router location={history.location} navigator={history}><MetaMenu meta={meta} onClick={closeDrawer} baseExtPoint="museLayout.sider" /></Router></Provider>);
    });
    expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('https://demo.muse.vip.ebay.com/');
  });

  it('renders Sider MetaMenu with trigger', async () => {

    const closeDrawer = jest.fn();

    const meta = {
      menuProps: {},
      autoActive: true,
      mode: 'inline',
      theme: 'light',
      collapsed: false,
      trigger: { icon: <MenuUnfoldOutlined/>, label: 'show menu', noCaret: true },
      items: [{
        key: 'home',
        label: 'Home',
        icon: 'home',
        link: '/',
        order: 10,
      }],
    };
  
    act(() => {
      render(<Provider store={store.getStore()}><Router location={history.location} navigator={history}><MetaMenu meta={meta} onClick={closeDrawer} baseExtPoint="museLayout.sider" /></Router></Provider>);
    });
    const trigger = screen.getByRole('img', { name: /menu-unfold/});
    await userEvent.hover(trigger);
    await waitFor(
      () =>
      expect(screen.getByRole('link', { name: 'Home' }).getAttribute('href')).toBe('/'),
      {
        timeout: 5000,
      }
    )
    
  });
});
