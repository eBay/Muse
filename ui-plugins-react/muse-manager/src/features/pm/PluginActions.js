import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';

function PluginActions({ plugin, app }) {
  const items = useMemo(() => {
    return [
      {
        key: 'build',
        label: 'Trigger a build',
        icon: 'tool',
        order: 20,
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.build-plugin-modal', { plugin });
          // setTriggerBuildModalVisible(true, { plugin, app });
        },
      },
      {
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
      // {
      //   key: 'releaseList',
      //   label: 'Show releases',
      //   order: 55,
      //   icon: 'bars',
      //   highlight: false,
      //   onClick: () => showReleaseList(plugin),
      // },
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
      // {
      //   key: 'delete',
      //   label: canDelete ? 'Delete' : 'Delete (Plugin owners only)',
      //   disabled: !canDelete,
      //   order: 70,
      //   icon: 'delete',
      //   menuItemProps: canDelete ? {
      //     style: {
      //       color: '#ff4d4f',
      //     },
      //   } : {},
      //   highlight: false,
      //   onClick: handleDeletePlugin,
      // },
    ].filter(Boolean);
  }, []);
  return <DropdownMenu extPoint="pluginManager.plugin.processActions" items={items} />;
}
export default PluginActions;
