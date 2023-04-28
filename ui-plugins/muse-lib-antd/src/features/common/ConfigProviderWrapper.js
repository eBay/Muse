import { ConfigProvider } from 'antd';

export default function ConfigProviderWrapper({ children }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          borderRadius: 0,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}
