import React, { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import { message, Modal } from 'antd';
import { useMuseMutation, useSyncStatus, useAbility } from '../../hooks';

function AppActions({ app }) {
  const { mutateAsync: deleteApp } = useMuseMutation('am.deleteApp');
  const syncStatus = useSyncStatus('muse.apps');
  const ability = useAbility();
  const canDeleteApp = ability.can('delete', 'App', app);
  const items = useMemo(() => {
    return [
      {
        key: 'delete',
        label: 'Delete App',
        disabled: !canDeleteApp,
        order: 70,
        icon: 'delete',
        menuItemProps: {
          style: {
            color: canDeleteApp ? '#ff4d4f' : '',
          },
        },
        highlight: false,
        onClick: async () => {
          Modal.confirm({
            title: 'Confirm Delete',
            content: (
              <>
                Are you sure to delete the app <b>{app.name}</b>?
              </>
            ),
            onOk: () => {
              (async () => {
                const hide = message.loading(`Deleting app ${app.name}...`, 0);
                try {
                  await deleteApp({ appName: app.name });
                  hide();
                  message.success('Delete app success.');
                  await syncStatus();
                } catch (err) {
                  Modal.error({
                    title: 'Failed to delete the app',
                    content: String(err),
                  });
                  hide();
                }
              })();
            },
          });
        },
      },
    ].filter(Boolean);
  }, [canDeleteApp, app.name, deleteApp, syncStatus]);
  return <DropdownMenu extPoint="museManager.app.processActions" items={items} />;
}
export default AppActions;
