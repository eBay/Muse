import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Form, Modal, message } from 'antd';
import utils from '@ebay/muse-lib-antd/src/utils';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import jsPlugin from 'js-plugin';
import { useSyncStatus, useMuseMutation } from '../../hooks';

const user = window.MUSE_GLOBAL.getUser();

const EditEnvironmentModal = NiceModal.create(({ env, app }) => {
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);
  const modal = useModal();
  const [form] = Form.useForm();

  const {
    mutateAsync: updateEnv,
    error: updateEnvError,
    isLoading: updateEnvPending,
  } = useMuseMutation('am.updateEnv');

  const handleFinish = useCallback(() => {
    const values = form.getFieldsValue();
    const payload = {
      changes: {
        set: Object.entries({ ...values }).map((item) => {
          return { path: item[0], value: item[1] };
        }),
      },
      appName: app.name,
      envName: env.name,
      author: user.username,
    };
    jsPlugin.invoke('museManager.editEnvForm.processPayload', { payload, values });
    updateEnv(payload)
      .then(async () => {
        modal.hide();
        message.success('Update environment success.');
        await syncStatus();
      })
      .catch((err) => {
        console.log('failed to update environment', err);
      });
  }, [updateEnv, modal, form, syncStatus, app, env]);

  const meta = {
    columns: 1,
    initialValues: { ...env, envName: env.name },
    fields: [],
  };

  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.editEnvForm', {
    meta,
    form,
    env,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Edit Environment`}
      width="600px"
      okText="Update"
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateEnvPending} error={updateEnvError} />
      <Form layout="horizontal" form={form} onValuesChange={updateOnChange} onFinish={handleFinish}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default EditEnvironmentModal;
