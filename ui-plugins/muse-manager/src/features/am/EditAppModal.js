import { useCallback } from 'react';
import NiceModal, { useModal, antdModalV5 } from '@ebay/nice-modal-react';
import { Modal, message, Form } from 'antd';
import NiceForm from '@ebay/nice-form-react';
import { RequestStatus } from '@ebay/muse-lib-antd/src/features/common';
import { useSyncStatus, useMuseApi } from '../../hooks';
import utils from '@ebay/muse-lib-antd/src/utils';

const user = window.MUSE_GLOBAL.getUser();
const EditAppModal = NiceModal.create(({ app }) => {
  const modal = useModal();
  const [form] = Form.useForm();
  const syncStatus = useSyncStatus(`muse.app.${app.name}`);

  const {
    action: updateApp,
    error: updateAppError,
    pending: updateAppPending,
  } = useMuseApi('am.updateApp');

  const meta = {
    initialValues: app,
    fields: [
      {
        key: 'title',
        order: 20,
        label: 'Site Title',
        required: true,
      },
      {
        key: 'config.entry',
        order: 20,
        label: 'App entry',
        tooltip: "The entry function of the app. Usually you don't need to set it.",
        initialValue: '',
      },
    ],
  };
  // utils.extendFormMeta(meta, 'museManager.am.updateAppForm', { meta, app, form });
  const { watchingFields } = utils.extendFormMeta(meta, 'museManager.am.editAppForm', {
    meta,
    form,
    app,
  });
  const updateOnChange = NiceForm.useUpdateOnChange(watchingFields);
  // const watches = plugin.invoke('museManager.updateAppForm.watch', { meta, app, form });
  // Form.useWatch([], form);
  // Form.useWatch(_.flatten(watches), form);

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
      .catch((err) => {
        console.log('failed to update', err);
      });
  }, [updateApp, syncStatus, modal, form, app.name]);

  return (
    <Modal
      {...antdModalV5(modal)}
      title={`Edit App: ${app.name}`}
      width="800px"
      okText={updateAppPending ? 'Updating...' : 'Update'}
      maskClosable={false}
      onOk={() => {
        form.validateFields().then(() => form.submit());
      }}
    >
      <RequestStatus loading={updateAppPending} error={updateAppError} />
      <Form layout="horizontal" form={form} onFinish={handleFinish} onValuesChange={updateOnChange}>
        <NiceForm meta={meta} />
      </Form>
    </Modal>
  );
});

export default EditAppModal;
