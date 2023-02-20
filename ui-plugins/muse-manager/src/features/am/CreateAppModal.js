import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import utils from '@ebay/muse-lib-antd/src/utils';
// import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi } from '../../hooks';
import plugin from 'js-plugin';

const user = window.MUSE_GLOBAL.getUser();
const CreateAppModal = NiceModal.create(() => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.apps');

  const {
    action: createApp,
    error: createAppError,
    pending: createAppPending,
  } = useMuseApi('am.createApp');

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

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    createApp({ ...values, author: user.username })
      .then(async () => {
        modal.hide();
        message.success('Create app success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to create', err);
      });
  }, [createApp, syncStatus, modal, form]);

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.createAppForm', {
    meta,
    form,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);
  return (
    <Modal
      {...antdModalV5(modal)}
      title={createAppPending ? 'Creating...' : `Create App`}
      width="600px"
      okText="Create"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={createAppPending} error={createAppError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish} onValuesChange={updateOnChange}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default CreateAppModal;
