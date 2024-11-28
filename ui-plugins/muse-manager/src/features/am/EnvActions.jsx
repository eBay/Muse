import React from 'react';
import { useMemo } from 'react';
import { DropdownMenu } from '@ebay/muse-lib-antd/src/features/common';
import NiceModal from '@ebay/nice-modal-react';
import { Modal, Form } from 'antd';
import jsPlugin from 'js-plugin';
import NiceForm from '@ebay/nice-form-react';
import { DeleteOutlined } from '@ant-design/icons';
import { extendArray, extendFormMeta } from '@ebay/muse-lib-antd/src/utils';
import { useMuseMutation, useSyncStatus, useAbility } from '../../hooks';

function EnvActions({ env, app }) {
  const { mutateAsync: deleteEnv } = useMuseMutation('am.deleteEnv');
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const ability = useAbility();
  const canUpdateApp = ability.can('update', 'App', app);
  const [deleteForm] = Form.useForm();
  const [confirmModal, contextHolder] = Modal.useModal();
  const deleteMeta = useMemo(
    () => ({
      columns: 1,
      fields: [],
    }),
    [],
  );
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
          extendFormMeta(deleteMeta, 'museManager.deleteEnvForm', {
            meta: deleteMeta,
            form: deleteForm,
            env,
            app,
          });
          const deletConfirm = confirmModal.confirm({
            title: 'Confirm Delete',
            content: (
              <>
                Are you sure to delete the Environment <b>{env.name}</b>?
                {deleteMeta.fields.length > 0 && (
                  <Form form={deleteForm} preserve={false}>
                    <NiceForm meta={deleteMeta}></NiceForm>
                  </Form>
                )}
              </>
            ),
            width: 480,
            onOk: () => {
              return deleteForm
                .validateFields()
                .then((values) => {
                  const payload = { appName: app.name, envName: env.name };
                  jsPlugin.invoke('museManager.deleteEnvForm.processPayload', { payload, values });
                  return deleteEnv(payload)
                    .then((res) => {
                      syncStatus();
                      Modal.success({
                        title: 'Success',
                        content: (
                          <span>
                            The <strong>{env.name}</strong> environment was successfully deleted
                          </span>
                        ),
                        onOk() {
                          deletConfirm.destroy();
                        },
                      });
                    })
                    .catch((err) => {
                      Modal.error({
                        title: 'Error',
                        content: err.message,
                        onOk() {
                          deletConfirm.destroy();
                        },
                      });
                    });
                })
                .catch((err) => {
                  return;
                });
            },
          });
        },
      },
    ].filter(Boolean);
  }, [canUpdateApp, env, app, deleteMeta, deleteForm, confirmModal, deleteEnv, syncStatus]);

  extendArray(items, 'environmentActions', 'museManager.am', { app, env, ability });
  items = items.filter(Boolean);

  return (
    <>
      {contextHolder}
      <DropdownMenu items={items} />
    </>
  );
}
export default EnvActions;
