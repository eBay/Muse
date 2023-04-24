import React, { useEffect } from 'react';
import { Header as HeaderLayout, Sider as SiderLayout } from './';
import plugin from 'js-plugin';
import { ErrorBoundary } from '@ebay/muse-lib-react/src/features/common';
import { useSetSiderCollapsed, useUpdateMuseLayout, useSetIsDarkMode } from './redux/hooks';
import { ConfigProvider, Layout, theme, Card } from 'antd';

const { Header, Content, Sider } = Layout;

export default function MainLayout({ children }) {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { siderCollapsed, setSiderCollapsed } = useSetSiderCollapsed();
  const { isDarkMode } = useSetIsDarkMode();
  const headerConfig = plugin.invoke('museLayout.header.getConfig')[0] || {};
  const noHeader = headerConfig.mode === 'none';
  // Used to force update muse layout
  const { seed } = useUpdateMuseLayout(); // eslint-disable-line

  useEffect(() => {
    if (isDarkMode) {
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.body.setAttribute('data-theme', 'light');
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
            <HeaderLayout />
          </Header>
        )}
        <Layout hasSider={true}>
          <Sider
            collapsible
            collapsed={siderCollapsed}
            onCollapse={(value) => setSiderCollapsed(value)}
            collapsedWidth={60}
            width={200}
            theme={isDarkMode ? 'dark' : 'light'}
            className="muse-layout-sider"
          >
            <SiderLayout />
          </Sider>
          <Layout
            className="muse-layout-content-wrapper"
            style={{
              marginLeft: siderCollapsed ? 0 : 200,
            }}
          >
            <Content className="muse-layout-content">
              <ErrorBoundary>
                <Card className="muse-content-card">{children}</Card>
              </ErrorBoundary>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </ConfigProvider>
  );
}
