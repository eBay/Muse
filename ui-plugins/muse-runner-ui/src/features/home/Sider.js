import React from 'react';
import { Table } from 'antd';
import { CaretDownOutlined, CaretRightOutlined } from '@ant-design/icons';
import { useQueryClient, useMutation } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import AppCell from './AppCell';
import PluginCell from './PluginCell';
import useRunnerData from './useRunnerData';
import lastTabKey from './lastTabKey';
import './Sider.less';
import api from './api';

const moveArrIndexUp = (arr, index) => {
  const tmp = arr[index];
  arr[index] = arr[index - 1];
  arr[index - 1] = tmp;
};

const moveArrIndexDown = (arr, index) => {
  const tmp = arr[index];
  arr[index] = arr[index + 1];
  arr[index + 1] = tmp;
};

export default function Sider({ onSelect }) {
  const { currentItemId } = useParams();

  const { data: appList, settings } = useRunnerData();
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const { mutateAsync: updateSelectedRows } = useMutation({
    mutationFn: async (keys) => {
      await api.post('/settings', { key: 'siderExpandedRows', value: keys });
    },
  });

  const handleAppMoveUp = async (appId) => {
    const appIndex = appList.findIndex((a) => a.id === appId);
    if (appIndex > 0) {
      moveArrIndexUp(appList, appIndex);
    }
    await api.post('/sort-apps', { appIds: appList.map((a) => a.id) });
    await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
  };

  const handleAppMoveDown = async (appId) => {
    const appIndex = appList.findIndex((a) => a.id === appId);
    if (appIndex < appList.length - 1) {
      moveArrIndexDown(appList, appIndex);
    }
    await api.post('/sort-apps', { appIds: appList.map((a) => a.id) });
    await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
  };

  const handlePluginMoveUp = async (appId, pluginName) => {
    const app = appList.find((a) => a.id === appId);
    const pluginIndex = app.plugins.findIndex((p) => p.name === pluginName);
    if (pluginIndex > 0) {
      moveArrIndexUp(app.plugins, pluginIndex);
    }
    await api.post('/sort-plugins', { appId, pluginNames: app.plugins.map((p) => p.name) });
    await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
  };

  const handlePluginMoveDown = async (appId, pluginName) => {
    const app = appList.find((a) => a.id === appId);
    const pluginIndex = app.plugins.findIndex((p) => p.name === pluginName);
    if (pluginIndex < app.plugins.length - 1) {
      moveArrIndexDown(app.plugins, pluginIndex);
    }
    await api.post('/sort-plugins', { appId, pluginNames: app.plugins.map((p) => p.name) });
    await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
  };

  const columns = [
    {
      title: 'name',
      render: (a, item, index) => {
        if (item.env) {
          return (
            <AppCell
              isFirst={index === 0}
              isLast={index === appList.length - 1}
              app={item}
              onMoveUp={() => handleAppMoveUp(item.id)}
              onMoveDown={() => handleAppMoveDown(item.id)}
            />
          );
          // } else if (item.parentPlugin) {
          //   return <LinkedPluginCell plugin={item} appId={item.appId} />;
        } else {
          return (
            <PluginCell
              isFirst={index === 0}
              isLast={index === appList.find((a) => a.id === item.appId).plugins.length - 1}
              plugin={item}
              appId={item.appId}
              onMoveUp={() => handlePluginMoveUp(item.appId, item.name)}
              onMoveDown={() => handlePluginMoveDown(item.appId, item.name)}
            />
          );
        }
      },
    },
  ];

  const data = appList?.map((app) => {
    return {
      ...app,
      children: app.plugins,
    };
  });

  const rowSelection = {
    selectedRowKeys: [currentItemId],
    columnWidth: 0, // Set the width to 0
    renderCell: () => '', // Render n
    onCell: () => {
      return {
        style: { display: 'none' },
      };
    },
  };

  const onRow = (record, index) => {
    return {
      onClick: () => {
        const tabKey = lastTabKey[record.id] || 'output';
        navigate(`/${record.id}/${tabKey}`);
      },
    };
  };

  const expandable = {
    expandedRowKeys: settings?.siderExpandedRows || [],
    onExpandedRowsChange: (expandedRows) => {
      // filter out plugin rows
      updateSelectedRows(expandedRows);
    },
    expandIcon2: ({ expanded, onExpand, record }) => {
      if (!record.children) return null;
      return expanded ? (
        <CaretDownOutlined onClick={(e) => onExpand(record, e)} />
      ) : (
        <CaretRightOutlined onClick={(e) => onExpand(record, e)} />
      );
    },
  };
  return (
    <div className="runner-sider overflow-y-auto h-full">
      <div className="runner-sider-inner bg-[#091a21] min-h-full overflow-hidden">
        {data && (
          <>
            <Table
              className="bg-transparent"
              columns={columns}
              pagination={false}
              showHeader={false}
              size="small"
              dataSource={data}
              onRow={onRow}
              rowKey="id"
              loading={!data}
              rowSelection={rowSelection}
              expandable={expandable}
            />
          </>
        )}
      </div>
    </div>
  );
}
