import React, { useCallback, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import TermOutput from './TermOutput';
import { Button, Dropdown, Modal, Tag } from 'antd';
import NiceModal from '@ebay/nice-modal-react';
import Icon, {
  CaretRightOutlined,
  EllipsisOutlined,
  BorderOutlined,
  DeleteOutlined,
  EditOutlined,
  StopOutlined,
  PlusOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import viteLogo from '../../images/vite-logo.svg';
import api from './api';
import EditPluginModal from './EditPluginModal';
import LinkPluginModal from './LinkPluginModal';
import { ReactComponent as VSCodeIcon } from './vscode.svg';
import LinkedPluginCell from './LinkedPluginCell';
import useRunnerData from './useRunnerData';
import GitStatus from './GitStatus';

const noop = () => {};
const PluginCell = ({ plugin, appId, onMoveUp = noop, onMoveDown = noop, isFirst, isLast }) => {
  const queryClient = useQueryClient();
  const { pluginByName } = useRunnerData();
  const {
    mutateAsync: startPlugin,
    isLoading: startPluginPending,
    error: startPluginError,
    reset: resetStartPluginState,
  } = useMutation({
    mutationFn: async () => {
      if (!plugin.dir) {
        Modal.error({
          title: 'Plugin dir not set.',
          content: 'Please set the local folder of the plugin to start it.',
        });
        return;
      }
      TermOutput.clear(`plugin:${plugin.dir}`);
      await api.post('/start-plugin', { pluginName: plugin.name });
      await queryClient.refetchQueries({ queryKey: ['running-data'], exact: true });
    },
  });

  useEffect(() => {
    if (startPluginError) {
      Modal.error({
        title: 'Plugin start failed.',
        content: (
          <>
            <p>{startPluginError?.message}:</p>
            <p className="text-red-500">{startPluginError?.response?.data}</p>
            <p>Please check if the local folder is correct.</p>
          </>
        ),
      });
      // reset the error state, so that it will not popup again when fast refresh or other re-render cases.
      resetStartPluginState();
    }
  }, [startPluginError, resetStartPluginState]);

  const { mutateAsync: stopPlugin, isLoading: stopPluginPending } = useMutation({
    mutationFn: async () => {
      await api.post('/stop-plugin', { dir: plugin.dir });
      await queryClient.refetchQueries({ queryKey: ['running-data'], exact: true });
    },
  });

  const { mutateAsync: attachPlugin } = useMutation({
    mutationFn: async (args) => {
      await api.post('/attach-plugin', args);
      await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
    },
  });
  const { mutateAsync: detachPlugin } = useMutation({
    mutationFn: async () => {
      await api.post('/stop-plugin', { dir: plugin.dir });
      await api.post('/detach-plugin', { pluginName: plugin.name, appId });
      await queryClient.refetchQueries({ queryKey: ['running-data'], exact: true });
      await queryClient.refetchQueries({ queryKey: ['config-data'], exact: true });
    },
  });

  const { mutateAsync: openCode } = useMutation({
    mutationFn: async (e) => {
      // This can be called from menu or icon click, so we need to stop the event propagation.
      e?.nativeEvent?.stopPropagation();
      e?.stopPropagation();
      await api.post('/open-code', { dir: plugin.dir });
    },
  });

  const { mutateAsync: clearOutput } = useMutation({
    mutationFn: async () => {
      await api.post('/clear-output', { id: `plugin:${plugin.dir}` });
    },
  });

  const menuItems = [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
    },
    {
      key: 'mode',
      label: 'Mode',
      icon: <ApartmentOutlined />,
      children: [
        {
          key: 'mode-local',
          label: 'Local',
        },
        {
          key: 'mode-deployed',
          label: 'Deployed',
        },
        {
          key: 'mode-version',
          label: 'Version',
        },
        {
          key: 'mode-excluded',
          label: 'Excluded',
        },
        {
          key: 'mode-url',
          label: 'Url',
        },
      ],
    },
    {
      key: 'link-plugin',
      label: 'Link Plugin',
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
          NiceModal.show(EditPluginModal, { plugin, appId });
          break;
        case 'mode-local':
          attachPlugin({
            appId,
            pluginName: plugin.name,
            mode: 'local',
          });
          break;
        case 'mode-deployed':
          attachPlugin({
            appId,
            pluginName: plugin.name,
            mode: 'deployed',
          });
          break;
        case 'mode-version':
          NiceModal.show(EditPluginModal, { plugin: { ...plugin, mode: 'version' }, appId });
          break;
        case 'mode-excluded':
          attachPlugin({
            appId,
            pluginName: plugin.name,
            mode: 'excluded',
          });
          break;
        case 'mode-url':
          NiceModal.show(EditPluginModal, { plugin: { ...plugin, mode: 'url' }, appId });
          break;
        case 'link-plugin':
          NiceModal.show(LinkPluginModal, { plugin, appId }).then((isChanged) => {
            if (isChanged) {
              // stop plugin
              stopPlugin();
            }
          });
          break;
        case 'open-in-vscode':
          openCode();
          break;
        case 'clear-output':
          clearOutput();
          TermOutput.clear(`plugin:${plugin.dir}`);
          break;
        case 'move-up':
          onMoveUp(plugin);
          break;
        case 'move-down':
          onMoveDown(plugin);
          break;
        case 'remove':
          Modal.confirm({
            title: 'Are you sure to remove this plugin?',
            content: 'This will remove the plugin config for the app. You can add it again later.',
            onOk: async () => {
              await detachPlugin();
            },
          });
          break;
        default:
          break;
      }
    },
    [
      plugin,
      appId,
      clearOutput,
      detachPlugin,
      openCode,
      onMoveUp,
      stopPlugin,
      onMoveDown,
      attachPlugin,
    ],
  );

  const pluginNameElement = (
    <span className="whitespace-nowrap text-ellipsis overflow-hidden">
      {plugin.running ? plugin.name : <span className="opacity-50">{plugin.name}</span>}
      {plugin.running && ':' + plugin.running.port}
      {plugin.devServer === 'vite' && (
        <img src={viteLogo} className="w-3 h-3 ml-2" title="Using Vite" alt="" />
      )}
      <GitStatus dir={plugin.dir} className="ml-2" />
    </span>
  );
  // const link = plugin.running
  //   ? `http://local.cloud.ebay.com:${plugin.running.port}/${
  //       pluginByName?.[plugin.name]?.type === 'boot' ? 'boot' : 'main'
  //     }.js`
  //   : null;

  return (
    <div className="grid grid-cols-[30px_1fr_45px_30px_20px] cursor-default">
      {plugin.running ? (
        <Button
          size="small"
          className="bg-green-600 hover:bg-green-700 border-none scale-75 !cursor-pointer"
          shape="circle"
          icon={<BorderOutlined className="bg-white text-transparent rounded-sm scale-[0.6]" />}
          onClick={stopPlugin}
          disabled={stopPluginPending}
        ></Button>
      ) : (
        <Button
          size="small"
          className="bg-transparent scale-75 !cursor-pointer"
          shape="circle"
          icon={<CaretRightOutlined className="scale-90 ml-0.5 text-gray-500" />}
          onClick={startPlugin}
          disabled={startPluginPending}
        ></Button>
      )}

      {pluginNameElement}

      <Tag
        className="scale-90 justify-self-end mr-0"
        color={
          { local: 'blue', deployed: 'cyan', version: 'purple', excluded: 'red', url: 'gold' }[
            plugin.mode || 'local'
          ]
        }
      >
        {plugin.mode === 'version' ? plugin.version : plugin.mode || 'local'}
      </Tag>
      {plugin.dir ? (
        <Icon
          component={VSCodeIcon}
          onClick={openCode}
          title="Open in VSCode"
          className="text-emerald-500 cursor-pointer scale-150 justify-self-center"
        />
      ) : (
        <span />
      )}
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
      {plugin.linkedPlugins?.map((p) => {
        return (
          <div key={p.name} className="col-start-2 col-span-4">
            <LinkedPluginCell plugin={p} onRemove={stopPlugin} />
          </div>
        );
      })}
    </div>
  );
};

export default PluginCell;
