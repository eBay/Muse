import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import jsPlugin from 'js-plugin';
import { message, Modal } from 'antd';

import { useMuseApi, useSyncStatus, useAbility } from '../../hooks';
import _ from 'lodash';

function PluginActions({ plugin, app }) {
  const { action: deletePlugin } = useMuseApi('pm.deletePlugin');
  const syncStatus = useSyncStatus('muse.plugins');
  const ability = useAbility('Plugin');

  let items = useMemo(() => {
    return [
      // {
      //   key: 'build',
      //   label: 'Trigger a build',
      //   disabled: ability.cannot('build', plugin),
      //   disabledText: 'Only owners can build.',
      //   icon: 'tool',
      //   order: 20,
      //   highlight: true,
      //   onClick: () => {
      //     NiceModal.show('muse-manager.build-plugin-modal', { plugin, app });
      //     // setTriggerBuildModalVisible(true, { plugin, app });
      //   },
      // },
      app && {
        key: 'deploy',
        label: 'Deploy',
        order: 30,
        icon: 'rocket',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.deploy-plugin-modal', { plugin, app });
          // setDeployPluginModalVisible(true, {
          //   pluginId: plugin.id,
          //   plugin,
          //   releaseTag: null,
          // });
        },
      },
      {
        key: 'edit',
        label: 'Edit',
        order: 40,
        icon: 'edit',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.edit-plugin-modal', { plugin, app });

          // pluginInfoModal.show({
          //   app,
          //   plugin,
          //   forceEditMode: true,
          // });
        },
      },
      // ['lib', 'boot'].includes(plugin.type) &&
      //   plugin.id !== 'altus-ui' &&
      //   canNpmPublish && {
      //     key: 'npmPublish',
      //     label: 'Npm publish',
      //     icon: 'book',
      //     order: 45,
      //     onClick: () => {
      //       setNpmPublishModalVisible(true, { plugin, app });
      //     },
      //   },
      // {
      //   key: 'gitRepo',
      //   label: `Open Git repo`,
      //   icon: 'github',
      //   order: 50,
      //   highlight: false,
      //   onClick: () => {
      //     window.open(`https://github.corp.ebay.com/${plugin.meta.repo}`);
      //   },
      // },
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
      // {
      //   key: 'undepoly',
      //   label: canUndeploy ? 'Undeploy' : 'Undeploy (Owners only)',
      //   disabled: !canUndeploy,
      //   order: 60,
      //   icon: 'minus-circle',
      //   highlight: false,
      //   onClick: () => {
      //     setUndeployPluginModalVisible(true, {
      //       plugin,
      //       app,
      //     });
      //   },
      // },
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
                await deletePlugin({ pluginName: plugin.name });
                hide();
                message.success('Delete plugin success.');
                await syncStatus();
              })();
            },
          });
        },
      },
    ].filter(Boolean);
  }, [syncStatus, app, plugin, deletePlugin, ability]);
  items.push(..._.flatten(jsPlugin.invoke('museManager.pm.getPluginActions', { app, plugin })));
  jsPlugin.invoke('museManager.pm.processPluginActions', { items, app, plugin });
  items = items.filter(Boolean);
  jsPlugin.sort(items);
  return <DropdownMenu extPoint="museManager.plugin.processActions" items={items} />;
}
export default PluginActions;
