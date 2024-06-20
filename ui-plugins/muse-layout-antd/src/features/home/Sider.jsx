import React, { useCallback, useRef } from 'react';
import { Drawer } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import plugin from 'js-plugin';
import { MetaMenu } from '@ebay/muse-lib-antd/src/features/common';
import { useSetSiderCollapsed } from './redux/hooks';

export default function Sider() {
  let { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();
  const siderConfig = {
    mode: 'collapsable',
    homeMenu: true,
    ...(plugin.invoke('museLayout.sider.getConfig')[0] || {}),
  };
  if (siderCollapsed === null) {
    if (typeof siderConfig.siderDefaultCollapsed !== 'undefined') {
      siderCollapsed = !!siderConfig.siderDefaultCollapsed;
    } else {
      siderCollapsed = true;
    }
  }
  const handleToggleSiderCollapsed = useCallback(() => {
    setSiderCollapsed(!siderCollapsed);
  }, [siderCollapsed, setSiderCollapsed]);

  const ref = useRef(false);
  if (!ref.current) {
    // Act as constructor of the component.
    // Use this trick to re-use sider collapsed in different mode
    if (siderConfig.mode === 'drawer') {
      if (!siderCollapsed) setSiderCollapsed(true);
      siderCollapsed = true;
    }
    ref.current = true;
  }

  const closeDrawer = useCallback(() => {
    if (siderConfig.mode === 'drawer') setSiderCollapsed(true);
  }, [setSiderCollapsed, siderConfig.mode]);

  if (siderConfig.mode === 'none') return null;
  const meta = {
    menuProps: siderConfig.menuProps || {},
    autoActive: true,
    mode: 'inline',
    theme: siderConfig.theme || 'light',
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

  const style = {
    width: siderConfig.width || 250,
  };
  const wrapperStyle = {};
  if (meta.collapsed) {
    style.width = 60;
  }
  if (['drawer'].includes(siderConfig.mode)) {
    style.position = 'static';
    style.top = 0;
    style.height = '100%';
  }
  if (siderConfig.mode === 'collapsable') {
    wrapperStyle.bottom = 40;
  }

  const ele = (
    <div
      className={`muse-layout-antd_home-sider ${
        meta.theme === 'dark' ? 'muse-layout_home-sider-dark' : ''
      }`}
      style={style}
    >
      <div className="sider-menu-wrapper" style={wrapperStyle}>
        <MetaMenu meta={meta} onClick={closeDrawer} baseExtPoint="museLayout.sider" />
      </div>
      {siderConfig.mode === 'collapsable' && (
        <div className="sider-toggle-collapse" onClick={handleToggleSiderCollapsed}>
          {siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </div>
      )}
    </div>
  );
  if (siderConfig.mode === 'drawer') {
    return (
      <Drawer
        open={!siderCollapsed}
        closable={false}
        onClose={closeDrawer}
        style={{ marginTop: '50px' }}
        placement="left"
        width={siderConfig.width || 250}
        rootClassName="muse-layout-antd_side-drawer"
      >
        {ele}
      </Drawer>
    );
  }
  return ele;
}
