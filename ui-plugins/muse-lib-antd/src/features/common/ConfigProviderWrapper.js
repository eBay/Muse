import { ConfigProvider, theme } from 'antd';
import { useSetIsDarkMode } from './redux/hooks';

export default function ConfigProviderWrapper({ children }) {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { isDarkMode } = useSetIsDarkMode();
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
