import { ConfigProvider, theme } from 'antd';
import { useSetIsDarkMode } from './redux/hooks';
import plugin from 'js-plugin';

export default function ConfigProviderWrapper({ children }) {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { isDarkMode } = useSetIsDarkMode();
  const configProviderProps = plugin.invoke('museLayout.configProvider.getProps')[0] || {};

  return (
    <ConfigProvider
      theme={{
        algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
      }}
      {...configProviderProps}
    >
      {children}
    </ConfigProvider>
  );
}
