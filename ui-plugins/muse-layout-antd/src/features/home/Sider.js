import React, { useCallback } from 'react';
import { Drawer } from 'antd';
import { MetaMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useSetSiderCollapsed } from './redux/hooks';
import { useSetIsDarkMode } from '@ebay/muse-lib-antd/src/features/common/redux/hooks';
import plugin from 'js-plugin';

export default function Sider({ siderConfig }) {
  const { isDarkMode } = useSetIsDarkMode();
  const { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();
  const headerConfig = plugin.invoke('museLayout.header.getConfig')[0] || {};
  const noHeader =
    headerConfig.mode === 'none' ||
    (headerConfig?.mode !== 'show-in-sub-app' && window.MUSE_GLOBAL.isSubApp);

  const closeDrawer = useCallback(() => {
    if (siderConfig.mode === 'drawer') setSiderCollapsed(true);
  }, [setSiderCollapsed, siderConfig.mode]);

  if (siderConfig.mode === 'none') return null;

  const meta = {
    menuProps: siderConfig.menuProps || {},
    autoActive: true,
    mode: 'inline',
    theme: siderConfig.theme ? siderConfig.theme : isDarkMode ? 'dark' : 'light',
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

  const siderMenu = <MetaMenu meta={meta} onClick={closeDrawer} baseExtPoint="museLayout.sider" />;

  if (siderConfig.mode === 'drawer') {
    return (
      <Drawer
        mask={true}
        maskStyle={{ opacity: '0' }}
        bodyStyle={{ padding: '0' }}
        rootStyle={{ top: noHeader ? '0px' : '50px' }}
        open={!siderCollapsed}
        closable={false}
        onClose={() => setSiderCollapsed(true)}
        placement="left"
        width={siderConfig.width || 250}
        className={
          noHeader
            ? `muse-layout_side-drawer muse-layout-sider-noheader`
            : `muse-layout_side-drawer`
        }
      >
        {siderMenu}
      </Drawer>
    );
  }

  return siderMenu;
}
