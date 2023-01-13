import { useCallback } from 'react';
import NiceModal, { useModal, antdModal } from '@ebay/nice-modal-react';
import { Form, Modal, message } from 'antd';
import FormBuilder from 'antd-form-builder';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi } from '../../hooks';
import plugin from 'js-plugin';

const user = window.MUSE_GLOBAL.getUser();

const EditEnvironmentModal = NiceModal.create(({ env, app }) => {
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const modal = useModal();
  const [form] = Form.useForm();

  console.log(env);
  const {
    action: updateEnv,
    error: updateEnvError,
    pending: updateEnvPending,
  } = useMuseApi('am.updateEnv');

  const meta = {
    columns: 1,
    initialValues: { ...env, envName: env.name },
    fields: [],
  };

  plugin.invoke('museManager.editEnvForm.processMeta', { meta, form, env });

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();

    updateEnv({
      changes: {
        set: Object.entries({ ...values }).map(item => {
          return { path: item[0], value: item[1] };
        }),
      },
      appName: app.name,
      envName: env.name,
      author: user.username,
    })
      .then(async () => {
        modal.hide();
        message.success('Update environment success.');
        await syncStatus();
      })
      .catch(err => {
        console.log('failed to update environment', err);
      });
  }, [updateEnv, modal, form, syncStatus, app, env]);

  return (
    <Modal
      {...antdModal(modal)}
      title={`Edit Environment`}
      width="600px"
      okText="Update"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateEnvPending} error={updateEnvError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish}>
        <FormBuilder form={form} meta={meta} />
      </Form>
    </Modal>
  );
});

export default EditEnvironmentModal;
