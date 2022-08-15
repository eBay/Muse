import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi, useMuse, usePollingMuseData } from '../../hooks';
const user = window.MUSE_GLOBAL.getUser();

const EditPluginModal = NiceModal.create(({ plugin, app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.plugins');
  console.log(plugin);
  const {
    action: updatePlugin,
    error: updatePluginError,
    pending: updatePluginPending,
  } = useMuseApi('pm.updatePlugin');

  const meta = {
    columns: 1,
    initialValues: { ...plugin, pluginName: plugin.name },
    fields: [
      {
        key: 'pluginName',
        label: 'Plugin name',
        required: true,
      },
      {
        key: 'type',
        label: 'Plugin Type',
        widget: 'radio-group',
        options: [
          ['normal', 'Normal'],
          ['lib', 'Library'],
          ['init', 'Init'],
          ['boot', 'Boot'],
        ],
        requried: true,
        initialValue: 'normal',
      },
      {
        key: 'repo',
        label: 'Plugin Repo',
        required: true,
      },
      {
        key: 'description',
        label: 'Description',
        widget: 'textarea',
        widgetProps: { rows: 5 },
      },
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    updatePlugin({ ...values, author: user.username })
      .then(async () => {
        modal.hide();
        message.success('Create plugin success.');
        await syncStatus();
      })
      .catch(err => {
        console.log('failed to deploy', err);
      });
  }, [updatePlugin, syncStatus, modal, form]);

  return (
    <Modal
      {...antdModal(modal)}
      title={`Edit Plugin`}
      width="600px"
      okText="Update"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updatePluginPending} error={updatePluginError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default EditPluginModal;
