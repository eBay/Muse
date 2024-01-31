import React, { useCallback } from 'react';
import { Button, Dropdown, Modal } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import NiceModal from '@ebay/nice-modal-react';
import {
  BorderOutlined,
  CaretRightOutlined,
  EllipsisOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
  PlusOutlined,
  AppstoreOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import EditPluginModal from './EditPluginModal';
import TermOutput from './TermOutput';
import api from './api';

import EditAppModal from './EditAppModal';
import useRunnerData from './useRunnerData';
const noop = () => {};

const AppCell = ({ app, onMoveUp = noop, onMoveDown = noop, isFirst, isLast }) => {
  const queryClient = useQueryClient();

  const {
    initData: { museLocalHost },
  } = useRunnerData();
  const { mutateAsync: startApp, isLoading: startAppPending } = useMutation({
    mutationFn: async () => {
      TermOutput.clear(`app:${app.id}`);
      await api.post('/start-app', { id: app.id });
      await queryClient.refetchQueries({ queryKey: ['running-data'], exact: true });
    },
  });

  const { mutateAsync: stopApp, isLoading: stopAppPending } = useMutation({
    mutationFn: async () => {
      await api.post('/stop-app', { id: app.id });
      await queryClient.refetchQueries({ queryKey: ['running-data'], exact: true });
    },
  });

  const { mutateAsync: removeApp } = useMutation({
    mutationFn: async () => {
      try {
        await api.post('/stop-app', { id: app.id });
      } catch (e) {}
      await api.post('/remove-app', { id: app.id });
      await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
    },
  });

  const { mutateAsync: clearOutput } = useMutation({
    mutationFn: async () => {
      await api.post('/clear-output', { id: `app:${app.id}` });
    },
  });

  const menuItems = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
    },
    {
      key: 'attach-plugin',
      label: 'Add Plugin',
      icon: <PlusOutlined />,
    },
    {
      key: 'move-up',
      label: 'Move Up',
      disabled: isFirst,
      icon: <ArrowUpOutlined />,
    },
    {
      key: 'move-down',
      label: 'Move Down',
      disabled: isLast,
      icon: <ArrowDownOutlined />,
    },
    {
      key: 'clear-output',
      label: 'Clear Output',
      icon: <StopOutlined />,
    },
    {
      key: 'remove',
      label: <span className="text-red-600">Remove</span>,
      icon: <DeleteOutlined className="text-red-600" />,
    },
  ];

  const handleMenuClick = useCallback(
    (e) => {
      e.domEvent.stopPropagation();

      switch (e.key) {
        case 'edit':
          NiceModal.show(EditAppModal, { app });
          break;
        case 'attach-plugin':
          NiceModal.show(EditPluginModal, { appId: app.id });
          break;
        case 'move-up':
          onMoveUp(app);
          break;
        case 'move-down':
          onMoveDown(app);
          break;
        case 'clear-output':
          clearOutput();
          TermOutput.clear(`app:${app.id}`);
          break;
        case 'remove':
          Modal.confirm({
            title: 'Are you sure to remove this app?',
            content: 'This action cannot be undone.',
            okText: 'Remove',
            okType: 'danger',
            cancelText: 'Cancel',
            onOk() {
              removeApp({ id: app.id });
            },
          });
          break;
        default:
          break;
      }
    },
    [app, removeApp, clearOutput, onMoveUp, onMoveDown],
  );

  const link = app.running ? `http://${museLocalHost}:${app.running.port}` : null;
  return (
    <div className="cursor-default grid grid-cols-[30px_1fr__30px_20px]">
      {app.running ? (
        <Button
          size="small"
          className="bg-green-600 mr-2 hover:bg-green-700 border-none scale-90 !cursor-pointer"
          shape="circle"
          icon={<BorderOutlined className="bg-white text-transparent rounded-sm scale-[0.6]" />}
          onClick={stopApp}
          disabled={stopAppPending}
        ></Button>
      ) : (
        <Button
          size="small"
          className="mr-2 bg-transparent scale-90 !cursor-pointer"
          shape="circle"
          icon={<CaretRightOutlined className="scale-90 ml-0.5 text-gray-500" />}
          onClick={startApp}
          disabled={startAppPending}
        ></Button>
      )}
      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          onClick={(e) => {
            api.post('/open-browser', { url: link });
            e.preventDefault();
            e.stopPropagation();
          }}
          className="whitespace-nowrap text-ellipsis overflow-hidden justify-self-start max-w-full"
        >
          {app.app}@{app.env}:{app.running.port}
        </a>
      ) : (
        <span className="whitespace-nowrap text-ellipsis overflow-hidden">
          {app.app}@{app.env}
        </span>
      )}

      <span className="justify-self-center">
        {app.loadAllPlugins ? (
          <AppstoreOutlined title="App plugins will be loaded." className="text-violet-500" />
        ) : null}
      </span>

      <span className="justify-self-center">
        <Dropdown
          menu={{
            items: menuItems,
            onClick: handleMenuClick,
          }}
        >
          <EllipsisOutlined className="scale-150" />
        </Dropdown>
      </span>
    </div>
  );
};

export default AppCell;
