import React, { useRef } from 'react';
import { Drawer } from 'antd';
import { MetaMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useSetSiderCollapsed, useSetIsDarkMode } from './redux/hooks';

export default function Sider({ siderConfig }) {
  const { isDarkMode } = useSetIsDarkMode();
  const { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();

  const ref = useRef(false);
  if (!ref.current) {
    // Act as constructor of the component.
    // Use this trick to re-use sider collapsed in different mode
    ref.current = true;
  }

  if (siderConfig.mode === 'none') return null;

  const meta = {
    menuProps: siderConfig.menuProps || {},
    autoActive: true,
    mode: 'inline',
    theme: isDarkMode ? 'dark' : 'light',
    collapsed:
      siderConfig.mode === 'collapsed' ||
      (siderConfig.mode === 'collapsable' ? siderCollapsed : false),
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

  if (siderConfig.mode === 'drawer') {
    return (
      <Drawer
        mask={true}
        maskStyle={{ opacity: '0' }}
        bodyStyle={{ padding: '0' }}
        rootStyle={{ top: '50px' }}
        open={!siderCollapsed}
        closable={false}
        onClose={() => setSiderCollapsed(true)}
        placement="left"
        width={siderConfig.width || 250}
        className="muse-layout_side-drawer"
      >
        {ele}
      </Drawer>
    );
  }

  return ele;
}
