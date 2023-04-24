import React, { useRef } from 'react';
import plugin from 'js-plugin';
import { MetaMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useSetSiderCollapsed, useSetIsDarkMode } from './redux/hooks';

export default function Sider() {
  const { isDarkMode } = useSetIsDarkMode();
  const { siderCollapsed } = useSetSiderCollapsed();

  const siderConfig = {
    mode: 'collapsable',
    homeMenu: true,
    ...(plugin.invoke('museLayout.sider.getConfig')[0] || {}),
  };

  const ref = useRef(false);
  if (!ref.current) {
    // Act as constructor of the component.
    // Use this trick to re-use sider collapsed in different mode
    ref.current = true;
  }

  const meta = {
    menuProps: siderConfig.menuProps || {},
    autoActive: true,
    mode: 'inline',
    theme: isDarkMode ? 'dark' : 'light',
    collapsed: siderCollapsed,
    items: [],
  };
  if (siderConfig.homeMenu) {
    meta.items.push({
      key: 'home',
      label: 'Home',
      icon: 'home',
      link: '/',
      order: 10,
    });
  }

  const ele = <MetaMenu meta={meta} baseExtPoint="museLayout.sider" />;
  return ele;
}
