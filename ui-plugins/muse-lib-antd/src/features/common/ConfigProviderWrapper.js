import { ConfigProvider, theme } from 'antd';

export default function ConfigProviderWrapper({ children }) {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { app } = window.MUSE_GLOBAL;
  const isDarkMode =
    app?.config?.theme === 'dark' || localStorage.getItem('muse-lib-antd.theme.dark')
      ? localStorage.getItem('muse-lib-antd.theme.dark') === 'false'
        ? false
        : true
      : false;

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
        token: {
          borderRadius: 0,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
