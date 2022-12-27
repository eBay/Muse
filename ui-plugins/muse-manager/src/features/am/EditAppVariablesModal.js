import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi } from '../../hooks';
import FormBuilder from 'antd-form-builder';

const user = window.MUSE_GLOBAL.getUser();
const EditAppVariablesModal = NiceModal.create(({ app, env }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const {
    action: updateApp,
    error: updateAppError,
    pending: updateAppPending,
  } = useMuseApi('am.updateApp');

  const populateEnvVariablesInputField = environmentVars => {
    let propertyVariables = '';
    // we check if we have "variables" section, and transform the js object into "properties" string format
    if (environmentVars) {
      for (const [key, value] of Object.entries(environmentVars)) {
        propertyVariables += `${key}=${value}\n`;
      }
    }
    return propertyVariables;
  };

  const sectionMeta = {
    columns: 2,
    formItemLayout: [10, 14],
    fields: [
      {
        key: `envs.${env}.variables`,
        label: 'Variables',
        widget: 'textarea',
        widgetProps: { rows: 4 },
        initialValue: populateEnvVariablesInputField(env ? app.envs[env].variables : app.variables),
        colSpan: 2,
        tooltip:
          'App. variables. Enter key/values, one per line, using properties syntax. eg  "var=value"',
      },
    ].filter(Boolean),
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    updateApp({
      appName: app.name,
      changes: {
        set: Object.entries(values).map(([k, v]) => {
          return {
            path: k,
            value: v,
          };
        }),
      },
      author: user.username,
    })
      .then(async () => {
        modal.hide();
        message.success('Update app success.');
        await syncStatus();
      })
      .catch(err => {
        console.log('failed to update', err);
      });
  }, [updateApp, syncStatus, modal, form, app.name]);

  return (
    <Modal
      {...antdModal(modal)}
      title={`Edit ${env ? `[${env}]` : '[Default]'} Application Variables`}
      width="600px"
      okText={updateAppPending ? 'Updating...' : 'Update'}
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateAppPending} error={updateAppError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder meta={sectionMeta} form={form} viewMode={false} />
      </Form>
    </Modal>
  );
});

export default EditAppVariablesModal;
