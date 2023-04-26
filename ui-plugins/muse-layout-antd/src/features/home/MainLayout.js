import React, { useEffect } from 'react';
import { Header as HeaderLayout, Sider as SiderLayout } from './';
import plugin from 'js-plugin';
import { ErrorBoundary } from '@ebay/muse-lib-react/src/features/common';
import { useSetSiderCollapsed, useUpdateMuseLayout, useSetIsDarkMode } from './redux/hooks';
import { ConfigProvider, Layout, theme, Card } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';

const { Header, Content, Sider } = Layout;

export default function MainLayout({ children }) {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();
  const { isDarkMode } = useSetIsDarkMode();
  const headerConfig = plugin.invoke('museLayout.header.getConfig')[0] || {};
  const noHeader =
    headerConfig.mode === 'none' ||
    (headerConfig?.mode !== 'show-in-sub-app' && window.MUSE_GLOBAL.isSubApp);

  // Used to force update muse layout
  const { seed } = useUpdateMuseLayout(); // eslint-disable-line

  const siderConfig = {
    mode: 'drawer',
    homeMenu: true,
    ...(plugin.invoke('museLayout.sider.getConfig')[0] || {}),
  };

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
      document.body.classList.add('muse-theme-dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
      document.body.classList.remove('muse-theme-dark');
    }
  }, [isDarkMode]);

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          borderRadius: 0,
        },
      }}
    >
      <Layout
        style={{
          minHeight: '100vh',
        }}
      >
        {!noHeader && (
          <Header>
            <HeaderLayout siderConfig={siderConfig} />
          </Header>
        )}

        {siderConfig.mode === 'drawer' && (
          <>
            <Content className="muse-layout-content">
              <ErrorBoundary>
                <SiderLayout siderConfig={siderConfig} />
                <Card className="muse-content-card">{children}</Card>
              </ErrorBoundary>
            </Content>
          </>
        )}

        {siderConfig.mode !== 'drawer' && (
          <Layout hasSider={true}>
            <Sider
              collapsible={siderConfig.mode !== 'fixed' && siderConfig.mode !== 'none'}
              collapsed={siderCollapsed}
              onCollapse={(value) => setSiderCollapsed(value)}
              collapsedWidth={60}
              width={siderConfig.width || 250}
              theme={isDarkMode ? 'dark' : 'light'}
              className="muse-layout-sider"
              trigger={siderCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            >
              <SiderLayout siderConfig={siderConfig} />
            </Sider>
            <Layout
              className="muse-layout-content-wrapper"
              style={{
                marginLeft: siderCollapsed ? 60 : siderConfig.width || 250,
              }}
            >
              <Content className="muse-layout-content">
                <ErrorBoundary>
                  <Card className="muse-content-card">{children}</Card>
                </ErrorBoundary>
              </Content>
            </Layout>
          </Layout>
        )}
      </Layout>
    </ConfigProvider>
  );
}
