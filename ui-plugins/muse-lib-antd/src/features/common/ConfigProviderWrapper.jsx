import React from 'react';
import { ConfigProvider, theme } from 'antd';
import { useSetIsDarkMode } from './redux/hooks';
import plugin from 'js-plugin';

export default function ConfigProviderWrapper({ children }) {
  const { defaultAlgorithm, darkAlgorithm } = theme;
  const { isDarkMode } = useSetIsDarkMode();

  const configProps = {
    theme: {
      algorithm: isDarkMode ? darkAlgorithm : defaultAlgorithm,
    },
  };

  plugin.invoke('museLibAntd.configProvider.processProps', configProps);
  return <ConfigProvider {...configProps}>{children}</ConfigProvider>;
}
