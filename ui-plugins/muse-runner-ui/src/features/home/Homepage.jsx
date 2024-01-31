import React, { useState, useEffect } from 'react';
import SplitPane from 'rspv2/lib/SplitPane';
import Pane from 'rspv2/lib/Pane';
import { useMutation } from '@tanstack/react-query';
import { Empty } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import Sider from './Sider';
import useRunnerData from './useRunnerData';
import './Homepage.less';
import api from './api';

export default function Homepage({ children }) {
  const { data, apps, plugins, isLoading, settings } = useRunnerData();
  const [siderWidth, setSiderWidth] = useState(settings?.siderWidth);
  useEffect(() => {
    if (!siderWidth) setSiderWidth(settings?.siderWidth);
  }, [siderWidth, settings?.siderWidth]);

  const { mutateAsync: updateSiderWidth } = useMutation({
    mutationFn: async (width) => {
      await api.post('/settings', { key: 'siderWidth', value: width });
    },
  });

  const handleResizeEnd = (sizes) => {
    setSiderWidth(sizes[0]);
    updateSiderWidth(sizes[0]);
    window.dispatchEvent(new Event('resize'));
  };

  const emptyContent = (
    <div className="p-3 text-gray-500">Select a row in the sider to show output.</div>
  );

  return (
    <div
      style={{
        margin: '-24px',
        backgroundColor: 'rgb(9, 32, 42)',
        height: 'calc(100vh - 50px)',
      }}
    >
      {isLoading ? (
        <div className="p-6">
          <RequestStatus loading={isLoading} />
        </div>
      ) : null}

      {!!data?.length && apps && plugins && (
        <SplitPane split="vertical" onChange={() => {}} onResizeEnd={handleResizeEnd}>
          <Pane minSize="200px" maxSize="800px" size={siderWidth || '500px'}>
            <Sider />
          </Pane>
          <Pane className="bg-[rgb(9,32,42)]">{children || emptyContent}</Pane>
        </SplitPane>
      )}

      {data?.length === 0 && (
        <div className="h-full grid place-items-center">
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
        </div>
      )}
    </div>
  );
}
