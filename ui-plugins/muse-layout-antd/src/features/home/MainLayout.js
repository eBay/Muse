import React from 'react';
import { Header, Sider } from './';
import plugin from 'js-plugin';
import { ErrorBoundary } from '@ebay/muse-lib-react/src/features/common';
import { useSetSiderCollapsed, useUpdateMuseLayout } from './redux/hooks';

export default function MainLayout({ children }) {
  const siderConfig = plugin.invoke('museLayout.sider.getConfig')[0] || {
    mode: 'collapsable',
  };
  let { siderCollapsed } = useSetSiderCollapsed();
  if (siderCollapsed === null) {
    if (typeof siderConfig.siderDefaultCollapsed !== 'undefined') {
      siderCollapsed = !!siderConfig.siderDefaultCollapsed;
    } else {
      siderCollapsed = true;
    }
  }

  const headerConfig = plugin.invoke('museLayout.header.getConfig')[0] || {};

  const noHeader = headerConfig.mode === 'none';
  // Used to force update muse layout
  const { seed } = useUpdateMuseLayout(); // eslint-disable-line
  const pageContainerStyle = {
    marginLeft: siderConfig.width || 250,
  };

  if ((siderCollapsed && siderConfig.mode === 'collapsable') || siderConfig.mode === 'collapsed') {
    pageContainerStyle.marginLeft = 60;
  }
  if (['drawer', 'none'].includes(siderConfig.mode)) {
    pageContainerStyle.marginLeft = 0;
  }

  return (
    <div className={`muse-layout_home-main-layout ${noHeader ? 'no-muse-layout-header ' : ''}`}>
      {!noHeader && <Header />}
      <Sider />
      <div className="muse-layout_home-main-layout-page-container" style={pageContainerStyle}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );
}
