import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import _ from 'lodash';
import { message, Modal } from 'antd';
import { useMuseMutation, useMuseData, useSyncStatus, useAbility } from '../../hooks';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';

const isPluginDeployed = ({ app, plugin }) => {
  return Object.values(app.envs || {}).some((env) =>
    env.plugins?.some((p) => p.name === plugin.name),
  );
};
function PluginActions({ plugin, app }) {
  const { mutateAsync: deletePlugin } = useMuseMutation('pm.deletePlugin');
  const syncStatus = useSyncStatus('muse.plugins');
  const ability = useAbility();
  // All apps necessary here for permission check
  const { data: allApps } = useMuseData('muse.apps');
  const appByName = _.keyBy(allApps || [], 'name');

  const canDeletePlugin = ability.can('delete', 'Plugin', {
    plugin,
    // This is just for UI usage pattern, providing full data to avoid async check.
    app: plugin.app && appByName?.[plugin.app],
  });

  let actions = useMemo(() => {
    return [
      app && {
        key: 'deploy',
        label: 'Deploy',
        order: 30,
        icon: 'rocket',
        disabled: ability.cannot('deploy', 'App', app), // deploy permission is checked on app level
        disabledText: 'No permission to deploy.',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.deploy-plugin-modal', { plugin, app });
        },
      },
      app && {
        key: 'config',
        label: 'Config',
        order: 40,
        icon: 'setting',
        disabled: ability.cannot('config', 'Plugin', { app, plugin }),
        disabledText: 'Only app or plugin owners can config plugins.',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.plugin-config-modal', { plugin, app });
        },
      },
      {
        key: 'releaseList',
        label: 'releases',
        order: 55,
        icon: 'bars',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.releases-drawer', { plugin, app });
        },
      },
      app &&
        isPluginDeployed({ app, plugin }) && {
          key: 'undeploy',
          label: 'Undeploy',
          order: 68,
          icon: 'minus-circle',
          disabled: ability.cannot('deploy', 'App', app), // undeploy permission is checked on app level
          disabledText: 'No permissin to undeploy.',
          highlight: false,
          onClick: () => {
            NiceModal.show('muse-manager.undeploy-plugin-modal', { plugin, app });
          },
        },
      {
        key: 'delete',
        label: 'Delete Plugin',
        disabled: !canDeletePlugin,
        disabledText: 'Only plugin owners can delete the plugin',
        order: 70,
        icon: 'delete',
        menuItemProps: {
          style: { color: canDeletePlugin ? '#ff4d4f' : '' },
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
  }, [syncStatus, app, plugin, deletePlugin, canDeletePlugin, ability]);

  extendArray(actions, 'actions', 'museManager.pm.pluginList', {
    app,
    plugin,
    ability,
    actions,
    appByName,
  });
  actions = actions.filter(Boolean);
  return <DropdownMenu items={actions} />;
}
export default PluginActions;
