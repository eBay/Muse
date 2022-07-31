import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import { message, Modal } from 'antd';
import { useMuseApi, useSyncStatus } from '../../hooks';

function PluginActions({ app }) {
  const { action: deleteApp } = useMuseApi('am.deleteApp');
  const syncStatus = useSyncStatus('muse.apps');
  const items = useMemo(() => {
    return [
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
      {
        key: 'delete',
        label: 'Delete App',
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
  }, [syncStatus, deleteApp, app]);
  return <DropdownMenu extPoint="museManager.app.processActions" items={items} />;
}
export default PluginActions;
