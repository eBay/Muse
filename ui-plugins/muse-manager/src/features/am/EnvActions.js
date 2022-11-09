import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import jsPlugin from 'js-plugin';
import { message, Modal } from 'antd';

import { useMuseApi, useSyncStatus } from '../../hooks';
import _ from 'lodash';

function EnvActions({ env, app }) {
  const { action: deleteEnv } = useMuseApi('am.deleteEnv');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  let items = useMemo(() => {
    return [
      {
        key: 'edit',
        label: 'Edit',
        order: 40,
        icon: 'edit',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.edit-environment-modal', { env, app });
        },
      },
      {
        key: 'delete',
        label: 'Delete Environment',
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
                Are you sure to delete the Environment <b>{env.name}</b>?
              </>
            ),
            onOk: () => {
              (async () => {
                const hide = message.loading(
                  <span>
                    Deleting <strong>{env.name}</strong> environment ...
                  </span>,
                  0,
                );
                deleteEnv({ appName: app.name, envName: env.name })
                  .then(res => {
                    hide();
                    message.success(
                      <span>
                        The <strong>{env.name}</strong> environment was successfully deleted
                      </span>,
                    );
                    syncStatus();
                  })
                  .catch(err => {
                    hide();
                    message.error(
                      'Delete environment failed, please ask help from slack channel: #muse.',
                    );
                  });
              })();
            },
          });
        },
      },
    ].filter(Boolean);
  }, [syncStatus, app, env, deleteEnv]);
  items.push(..._.flatten(jsPlugin.invoke('museManager.getEnvironmentActions', { app, env })));
  jsPlugin.invoke('museManager.processEnvironmentActions', { items, app, env });
  items = items.filter(Boolean);
  jsPlugin.sort(items);
  return <DropdownMenu extPoint="museManager.env.processActions" items={items} />;
}
export default EnvActions;
