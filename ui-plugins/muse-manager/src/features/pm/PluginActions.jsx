import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import { message, Modal } from 'antd';
import { useMuseMutate, useSyncStatus, useAbility } from '../../hooks';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';

function PluginActions({ plugin, app }) {
  const { mutateAsync: deletePlugin } = useMuseMutate('pm.deletePlugin');
  const syncStatus = useSyncStatus('muse.plugins');
  const ability = useAbility();
  let items = useMemo(() => {
    return [
      app && {
        key: 'deploy',
        label: 'Deploy',
        order: 30,
        icon: 'rocket',
        disabled: ability.cannot('deploy', 'App', app),
        disabledText: 'Only app owners can deploy plugin.',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.deploy-plugin-modal', { plugin, app });
        },
      },
      {
        key: 'config',
        label: 'Config',
        order: 40,
        icon: 'setting',
        disabled:
          ability.cannot('update', 'Plugin', plugin) && ability.cannot('update', 'App', app),
        disabledText: 'Only app or plugin owners can config plugin.',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.plugin-config-modal', { plugin, app });
        },
      },
      {
        key: 'releaseList',
        label: 'Show releases',
        order: 55,
        icon: 'bars',
        highlight: false,
        onClick: () => {
          NiceModal.show('muse-manager.releases-drawer', { plugin, app });
        },
      },
      {
        key: 'delete',
        label: 'Delete Plugin',
        // disabled: !canDelete,
        order: 70,
        icon: 'delete',
        menuItemProps: {
          style: {
            color: '#ff4d4f',
          },
        },
        highlight: false,
        onClick: async () => {
          Modal.confirm({
            title: 'Confirm Delete',
            content: (
              <>
                Are you sure to delete the plugin <b>{plugin.name}</b>?
              </>
            ),
            onOk: () => {
              (async () => {
                const hide = message.loading(`Deleting plugin ${plugin.name}...`, 0);
                return deletePlugin({ pluginName: plugin.name })
                  .then(async (res) => {
                    hide();
                    Modal.success({
                      title: 'Success',
                      content:
                        'Delete plugin from registry succeeded. Note that you need to delete the plugin repo yourself.',
                    });
                    await syncStatus();
                  })
                  .catch((error) => {
                    hide();
                    Modal.error({
                      title: 'Failed to Delete',
                      content:
                        (error.config && error.request && error.response && error.response.data) ||
                        String(error),
                    });
                  });
              })();
            },
          });
        },
      },
    ].filter(Boolean);
  }, [syncStatus, app, plugin, deletePlugin, ability]);

  extendArray(items, 'pluginActions', 'museManager.pm.pluginList', {
    app,
    plugin,
    ability,
  });
  // items.push(
  //   ..._.flatten(jsPlugin.invoke('museManager.pm.pluginList.getPluginActions', { app, plugin })),
  // );
  // jsPlugin.invoke('museManager.pm.pluginList.processPluginActions', { items, app, plugin });
  items = items.filter(Boolean);
  // jsPlugin.sort(items);
  return <DropdownMenu extPoint="museManager.pm.pluginList.processActions" items={items} />;
}
export default PluginActions;
