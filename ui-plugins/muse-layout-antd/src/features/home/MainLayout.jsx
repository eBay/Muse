// import React, { useEffect } from 'react';
// import { Header as HeaderLayout, Sider as SiderLayout } from './';
// import plugin from 'js-plugin';
// import { ErrorBoundary } from '@ebay/muse-lib-antd/src/features/common';
// import { useSetSiderCollapsed, useUpdateMuseLayout } from './redux/hooks';
// import { useSetIsDarkMode } from '@ebay/muse-lib-antd/src/features/common/redux/hooks';
// import { Layout, Card } from 'antd';
// import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

// const { Content, Sider } = Layout;

// export default function MainLayout({ children }) {
//   const defaultSiderCollapsedWidth = 60;
//   const defaultSiderExpandedWidth = 250;

//   const { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();
//   const { isDarkMode } = useSetIsDarkMode();
//   const headerConfig = plugin.invoke('museLayout.header.getConfig')[0] || {};
//   const noHeader =
//     headerConfig?.mode === 'none' ||
//     (headerConfig?.mode !== 'show-in-sub-app' && window.MUSE_GLOBAL.isSubApp);

//   // Used to force update muse layout
//   const { seed } = useUpdateMuseLayout(); // eslint-disable-line

//   const siderConfig = {
//     mode: 'collapsable',
//     homeMenu: true,
//     ...(plugin.invoke('museLayout.sider.getConfig')[0] || {}),
//   };

//   useEffect(() => {
//     if (isDarkMode) {
//       document.body.setAttribute('data-theme', 'dark');
//       document.body.classList.add('muse-theme-dark');
//     } else {
//       document.body.setAttribute('data-theme', 'light');
//       document.body.classList.remove('muse-theme-dark');
//     }
//   }, [isDarkMode]);

//   useEffect(() => {
//     if (typeof siderConfig.siderDefaultCollapsed !== 'undefined') {
//       setSiderCollapsed(!!siderConfig.siderDefaultCollapsed);
//     }
//   }, [setSiderCollapsed, siderConfig.siderDefaultCollapsed]);

//   return (
//     <Layout className="muse-layout-wrapper">
//       {!noHeader && <HeaderLayout siderConfig={siderConfig} />}

//       {siderConfig.mode === 'drawer' || siderConfig.mode === 'none' ? (
//         <>
//           <Content
//             className={
//               noHeader ? `muse-layout-content muse-layout-content-noheader` : `muse-layout-content`
//             }
//           >
//             <ErrorBoundary>
//               {siderConfig.mode === 'drawer' && <SiderLayout siderConfig={siderConfig} />}
//               <Card className="muse-content-card">{children}</Card>
//             </ErrorBoundary>
//           </Content>
//         </>
//       ) : (
//         <Layout hasSider={true}>
//           <Sider
//             collapsible={siderConfig.mode === 'collapsable'}
//             collapsed={siderConfig.mode !== 'fixed' && siderCollapsed}
//             onCollapse={(value) => setSiderCollapsed(value)}
//             collapsedWidth={defaultSiderCollapsedWidth}
//             width={
//               siderConfig.mode === 'collapsed'
//                 ? defaultSiderCollapsedWidth
//                 : siderConfig.width || defaultSiderExpandedWidth
//             }
//             theme={isDarkMode ? 'dark' : 'light'}
//             className={
//               noHeader ? `muse-layout-sider muse-layout-sider-noheader` : `muse-layout-sider`
//             }
//             trigger={
//               siderConfig.mode === 'collapsed' ? null : siderCollapsed ? (
//                 <MenuUnfoldOutlined />
//               ) : (
//                 <MenuFoldOutlined />
//               )
//             }
//           >
//             <SiderLayout siderConfig={siderConfig} />
//           </Sider>
//           <Layout
//             className="muse-layout-content-wrapper"
//             style={{
//               marginLeft:
//                 siderConfig.mode === 'none'
//                   ? 0
//                   : siderConfig.mode === 'collapsed'
//                   ? defaultSiderCollapsedWidth
//                   : siderConfig.mode === 'fixed'
//                   ? siderConfig.width || defaultSiderExpandedWidth
//                   : siderCollapsed
//                   ? defaultSiderCollapsedWidth
//                   : siderConfig.width || defaultSiderExpandedWidth,
//             }}
//           >
//             <Content
//               className={
//                 noHeader
//                   ? `muse-layout-content muse-layout-content-noheader`
//                   : `muse-layout-content`
//               }
//             >
//               <ErrorBoundary>
//                 <Card className="muse-content-card">{children}</Card>
//               </ErrorBoundary>
//             </Content>
//           </Layout>
//         </Layout>
//       )}
//     </Layout>
//   );
// }

import React from 'react';
import { ErrorBoundary } from '@ebay/muse-lib-antd/src/features/common';
import plugin from 'js-plugin';
import { extendArray } from '@ebay/muse-lib-react/src/utils';
import { useSetSiderCollapsed, useUpdateMuseLayout } from './redux/hooks';
import { Header, Sider } from './';

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
  const pluginVars = window.MUSE_GLOBAL.pluginVariables?.['@ebay/muse-layout-antd'];
  const isSubApp = window.MUSE_GLOBAL.isSubApp;

  const noHeader =
    headerConfig?.mode === 'none' ||
    (headerConfig?.mode !== 'show-in-sub-app' && window.MUSE_GLOBAL.isSubApp);

  const noSider = isSubApp && pluginVars?.noSiderInSubApp === 'true';

  // Used to force update muse layout
  useUpdateMuseLayout(); // eslint-disable-line
  const pageContainerStyle = {
    marginLeft: siderConfig.width || 250,
  };

  if ((siderCollapsed && siderConfig.mode === 'collapsable') || siderConfig.mode === 'collapsed') {
    pageContainerStyle.marginLeft = 60;
  }
  if (['drawer', 'none'].includes(siderConfig.mode) || noSider) {
    pageContainerStyle.marginLeft = 0;
  }

  const layoutProviders = [];
  /**
   * A provider example:
   * {
   *   order: 40,
   *   key: 'nice-modal',
   *   provider: NiceModal.Provider,
   *   props: { ... },
   * },
   * Note the provider should accept children as props.children
   */
  extendArray(layoutProviders, 'providers', 'museLayout', { layoutProviders });

  const mainEle = (
    <div
      className={`muse-layout-antd_home-main-layout ${noHeader ? 'no-muse-layout-header ' : ''}`}
    >
      {!noHeader && <Header />}
      {noSider ? null : <Sider />}
      <div className="muse-layout_home-main-layout-page-container" style={pageContainerStyle}>
        <ErrorBoundary>{children}</ErrorBoundary>
      </div>
    </div>
  );

  return layoutProviders.filter(Boolean).reduceRight((p, c) => {
    if (c.provider)
      return (
        <c.provider key={p?.key} {...c.props}>
          {p}
        </c.provider>
      );
    else if (c.renderProvider) return c.renderProvider(p);
    return p;
  }, mainEle);
}
