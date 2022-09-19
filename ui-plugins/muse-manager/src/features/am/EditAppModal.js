import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi } from '../../hooks';
import plugin from 'js-plugin';

const user = window.MUSE_GLOBAL.getUser();
const EditAppModal = NiceModal.create(({ app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const { action: updateApp, error: updateAppError, pending: updateAppPending } = useMuseApi(
    'am.updateApp',
  );

  const meta = {
    columns: 1,
    initialValues: app,
    fields: [
      {
        key: 'name',
        order: 10,
        label: 'App name',
        required: true,
        readOnly: true,
      },

      {
        key: 'description',
        order: 100,
        label: 'Description',
        widget: 'textarea',
        widgetProps: { rows: 5 },
      },
    ],
  };

  plugin.invoke('museManager.updateAppForm.processMeta', { meta, form });

  plugin.sort(meta.fields);

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
      title="Edit App"
      width="600px"
      okText={updateAppPending ? 'Updating...' : 'Update'}
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateAppPending} error={updateAppError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default EditAppModal;
