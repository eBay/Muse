import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi, useMuse, usePollingMuseData } from '../../hooks';
import plugin from 'js-plugin';

const user = window.MUSE_GLOBAL.getUser();
const CreateAppModal = NiceModal.create(() => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.apps');

  const { action: createApp, error: createAppError, pending: createAppPending } = useMuseApi(
    'am.createApp',
  );

  const meta = {
    columns: 1,
    fields: [
      {
        key: 'appName',
        order: 10,
        label: 'App name',
        required: true,
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

  plugin.invoke('museManager.createAppForm.processMeta', { meta, form });

  plugin.sort(meta.fields);

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    createApp({ ...values, author: user.username })
      .then(async () => {
        modal.hide();
        message.success('Create app success.');
        await syncStatus();
      })
      .catch(err => {
        console.log('failed to create', err);
      });
  }, [createApp, syncStatus, modal, form]);

  return (
    <Modal
      {...antdModal(modal)}
      title={createAppPending ? 'Creating...' : `Create App`}
      width="600px"
      okText="Create"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={createAppPending} error={createAppError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default CreateAppModal;
