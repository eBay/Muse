import React from 'react';
import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import { message, Modal } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { extendArray } from '@ebay/muse-lib-antd/src/utils';
import { useMuseMutation, useSyncStatus, useAbility } from '../../hooks';

function EnvActions({ env, app }) {
  const { mutateAsync: deleteEnv } = useMuseMutation('am.deleteEnv');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const ability = useAbility();
  const canUpdateApp = ability.can('update', 'App', app);
  let items = useMemo(() => {
    return [
      {
        key: 'edit',
        label: 'Edit',
        order: 40,
        icon: 'edit',
        disabled: !canUpdateApp,
        disabledText: 'No permission to update environment.',
        highlight: true,
        onClick: () => {
          NiceModal.show('muse-manager.edit-environment-modal', { env, app });
        },
      },
      {
        key: 'delete',
        label: 'Delete Environment',
        order: 70,
        icon: <DeleteOutlined style={{ color: canUpdateApp ? '#ff4d4f' : '' }} />,
        disabled: !canUpdateApp,
        disabledText: 'No permission to delete environment',
        highlight: true,
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
                  .then((res) => {
                    hide();
                    message.success(
                      <span>
                        The <strong>{env.name}</strong> environment was successfully deleted
                      </span>,
                    );
                    syncStatus();
                  })
                  .catch((err) => {
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
  }, [syncStatus, app, env, deleteEnv, canUpdateApp]);

  extendArray(items, 'environmentActions', 'museManager.am', { app, env, ability });
  items = items.filter(Boolean);
  return <DropdownMenu items={items} />;
}
export default EnvActions;
