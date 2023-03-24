import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import utils from '@ebay/muse-lib-antd/src/utils';
import jsPlugin from 'js-plugin';
import { useSyncStatus, useMuseApi } from '../../hooks';
const user = window.MUSE_GLOBAL.getUser();

const CreatePluginModal = NiceModal.create(() => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus('muse.plugins');

  const {
    action: createPlugin,
    error: createPluginError,
    pending: createPluginPending,
  } = useMuseApi('pm.createPlugin');

  const meta = {
    columns: 1,
    fields: [
      {
        key: 'pluginName',
        label: 'Plugin name',
        required: true,
        order: 10,
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
        required: true,
        initialValue: 'normal',
        order: 20,
      },
      // {
      //   key: 'repo',
      //   label: 'Plugin Repo',
      //   required: true,
      // },
      {
        key: 'description',
        label: 'Description',
        widget: 'textarea',
        widgetProps: { rows: 5 },
        order: 100,
      },
    ],
  };

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    jsPlugin.invoke('museManager.pm.createPluginForm.processValues', { values, form });
    createPlugin({ ...values, author: user.username })
      .then(async () => {
        modal.hide();
        message.success('Create plugin success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to deploy', err);
      });
  }, [createPlugin, syncStatus, modal, form]);

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.pm.createPluginForm', {
    meta,
    form,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  return (
    <Modal
      {...antdModal(modal)}
      title={`Create Plugin`}
      width="600px"
      okText="Create"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={createPluginPending} error={createPluginError} />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default CreatePluginModal;
